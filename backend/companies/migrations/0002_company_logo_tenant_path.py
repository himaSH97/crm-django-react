from django.db import migrations, models
import companies.models


class Migration(migrations.Migration):

    dependencies = [
        ('companies', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='company',
            name='logo',
            field=models.ImageField(upload_to=companies.models.company_logo_upload_to),
        ),
    ]