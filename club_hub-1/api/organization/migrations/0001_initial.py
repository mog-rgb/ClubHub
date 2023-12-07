# Generated by Django 4.2.1 on 2023-12-02 15:45

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_by', models.BigIntegerField(blank=True, db_column='CreatedBy', default=0, null=True)),
                ('created_on', models.DateTimeField(auto_now_add=True, db_column='CreatedOn')),
                ('modified_by', models.BigIntegerField(blank=True, db_column='ModifiedBy', default=0, null=True)),
                ('modified_on', models.DateTimeField(auto_now=True, db_column='ModifiedOn')),
                ('name', models.CharField(blank=None, db_column='Name', default=None, max_length=255)),
                ('slug', models.SlugField(blank=True, db_column='Slug', default=None, null=True)),
                ('local', models.CharField(blank=None, db_column='Local', default=None, max_length=255)),
                ('type', models.CharField(blank=None, db_column='Type', default=None, max_length=255)),
            ],
            options={
                'db_table': 'Organization',
            },
        ),
        migrations.CreateModel(
            name='OrganizationRating',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_by', models.BigIntegerField(blank=True, db_column='CreatedBy', default=0, null=True)),
                ('created_on', models.DateTimeField(auto_now_add=True, db_column='CreatedOn')),
                ('modified_by', models.BigIntegerField(blank=True, db_column='ModifiedBy', default=0, null=True)),
                ('modified_on', models.DateTimeField(auto_now=True, db_column='ModifiedOn')),
                ('grade', models.IntegerField(db_column='Grade', default=0, null=True)),
                ('organization', models.ForeignKey(db_column='EventId', default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='event_participant', to='organization.organization')),
            ],
            options={
                'db_table': 'Organization_Rating',
            },
        ),
    ]