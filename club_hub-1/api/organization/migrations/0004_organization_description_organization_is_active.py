# Generated by Django 4.2.1 on 2023-12-03 01:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0003_remove_organization_local_organization_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='organization',
            name='description',
            field=models.TextField(blank=True, db_column='Description', default=None, null=True),
        ),
        migrations.AddField(
            model_name='organization',
            name='is_active',
            field=models.BooleanField(db_column='IsActive', default=True),
        ),
    ]
