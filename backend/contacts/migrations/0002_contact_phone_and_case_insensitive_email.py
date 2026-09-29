import django.core.validators
import django.db.models
import django.db.models.functions.text
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contacts', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contact',
            name='phone',
            field=models.CharField(
                blank=True,
                max_length=15,
                validators=[
                    django.core.validators.RegexValidator(
                        message='Phone must contain 8 to 15 digits.',
                        regex=r'^\d{8,15}$',
                    ),
                ],
            ),
        ),
        migrations.RemoveConstraint(
            model_name='contact',
            name='unique_contact_email_per_company',
        ),
        migrations.AddConstraint(
            model_name='contact',
            constraint=models.UniqueConstraint(
                django.db.models.F('company'),
                django.db.models.functions.text.Lower('email'),
                name='unique_contact_email_per_company',
            ),
        ),
    ]