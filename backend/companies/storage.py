import logging
import re
import uuid

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from django.conf import settings
from rest_framework.exceptions import APIException, ValidationError


logger = logging.getLogger(__name__)
MAX_LOGO_BYTES = 2 * 1024 * 1024
ALLOWED_LOGO_TYPES = {
    'image/jpeg': ('JPEG', '.jpg'),
    'image/png': ('PNG', '.png'),
    'image/webp': ('WEBP', '.webp'),
}
PENDING_LOGO_PREFIX = 'company-logos/pending'
COMPANY_LOGO_PREFIX = 'company-logos'


class LogoStorageError(APIException):
    status_code = 502
    default_detail = 'Logo storage is currently unavailable.'
    default_code = 'logo_storage_unavailable'


def _s3_client():
    if not settings.AWS_STORAGE_BUCKET_NAME or not settings.AWS_S3_REGION_NAME:
        raise LogoStorageError('S3 logo storage is not configured.')

    profile = settings.AWS_S3_SESSION_PROFILE
    session = boto3.Session(profile_name=profile) if profile else boto3.Session()
    return session.client('s3', region_name=settings.AWS_S3_REGION_NAME)


def is_pending_logo_key(key, organization_id):
    if not organization_id:
        return False
    prefix = f'{PENDING_LOGO_PREFIX}/{organization_id}/'
    pattern = re.escape(prefix) + r'[0-9a-f]{32}\.(?:jpg|png|webp)'
    return re.fullmatch(pattern, key) is not None


def create_presigned_logo_upload(*, organization_id, content_type, size):
    if not organization_id:
        raise ValidationError('Your user is not assigned to an organization.')
    if size > MAX_LOGO_BYTES:
        raise ValidationError({'size': 'Logo files must be 2 MB or smaller.'})

    _, extension = ALLOWED_LOGO_TYPES[content_type]
    key = (
        f'{PENDING_LOGO_PREFIX}/{organization_id}/'
        f'{uuid.uuid4().hex}{extension}'
    )
    try:
        response = _s3_client().generate_presigned_post(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=key,
            Fields={'Content-Type': content_type},
            Conditions=[
                {'Content-Type': content_type},
                ['content-length-range', 1, MAX_LOGO_BYTES],
            ],
            ExpiresIn=settings.AWS_S3_PRESIGNED_POST_EXPIRE,
        )
    except (BotoCoreError, ClientError) as exc:
        logger.exception('Could not generate presigned logo upload')
        raise LogoStorageError() from exc

    return {
        'url': response['url'],
        'fields': response['fields'],
        'key': key,
    }


def finalize_pending_logo(key, organization_id):
    if not is_pending_logo_key(key, organization_id):
        raise ValidationError({'logo_key': 'Invalid or expired logo upload.'})

    client = _s3_client()
    try:
        uploaded = client.head_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=key,
        )
    except ClientError as exc:
        if exc.response.get('Error', {}).get('Code') in {'NoSuchKey', '404'}:
            raise ValidationError({'logo_key': 'Upload the logo before saving the company.'}) from exc
        logger.exception('Could not read uploaded logo from S3')
        raise LogoStorageError() from exc

    content_type = uploaded.get('ContentType', '')
    if content_type not in ALLOWED_LOGO_TYPES:
        raise ValidationError({'logo_key': 'Use a JPEG, PNG, or WebP logo.'})
    if uploaded.get('ContentLength', 0) > MAX_LOGO_BYTES:
        raise ValidationError({'logo_key': 'Logo files must be 2 MB or smaller.'})

    _, extension = ALLOWED_LOGO_TYPES[content_type]
    final_key = (
        f'{COMPANY_LOGO_PREFIX}/{organization_id}/'
        f'{uuid.uuid4().hex}{extension}'
    )
    try:
        client.copy_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=final_key,
            CopySource={
                'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
                'Key': key,
            },
            MetadataDirective='COPY',
        )
        try:
            client.delete_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=key,
            )
        except (BotoCoreError, ClientError):
            logger.exception('Could not remove finalized pending logo from S3')
    except (BotoCoreError, ClientError) as exc:
        logger.exception('Could not finalize uploaded logo in S3')
        raise LogoStorageError() from exc

    return final_key


def delete_company_logo(key, organization_id):
    prefix = f'{COMPANY_LOGO_PREFIX}/{organization_id}/'
    if not key.startswith(prefix):
        return
    try:
        _s3_client().delete_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=key,
        )
    except (BotoCoreError, ClientError):
        logger.exception('Could not remove replaced company logo from S3')