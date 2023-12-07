from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.db import models
from django.utils.text import slugify

from api.users.models import User
from main.models import Log


# Create your models here.


# Create your models here.
class Organization(Log):
    """ Role model."""
    user = models.ForeignKey(
        User,
        db_column="UserId",
        related_name="event_user",
        null=True,
        default=None,
        on_delete=models.CASCADE
    )
    name = models.CharField(db_column="Name", default=None, blank=None, max_length=255)
    slug = models.SlugField(db_column="Slug", default=None, blank=True, null=True)
    file = models.ImageField(db_column="File", default=None, blank=True)
    type = models.CharField(db_column="Type", default=None, blank=None, max_length=255)
    is_active = models.BooleanField(db_column='IsActive', default=True)
    description = models.TextField(db_column="Description", default=None, blank=True, null=True)
    search_vector = SearchVectorField(null=True)

    class Meta:
        db_table = 'Organization'
        verbose_name = "Organization"
        verbose_name_plural = "Organizations"
        indexes = [
            GinIndex(fields=['search_vector'], name='search_vector_gin_idx')
        ]

    def __str__(self):
        return f'{self.name}'

    def save(self, *args, **kwargs):
        try:
            if not self.pk:
                self.slug = slugify(self.name)
            super().save()
        except Exception:
            raise


class OrganizationRating(Log):
    """ OrganizationRating model."""
    organization = models.ForeignKey(
        Organization,
        db_column="EventId",
        related_name="organization_rating",
        null=True,
        default=None,
        on_delete=models.CASCADE
    )
    rating = models.IntegerField(db_column="Grade", default=0, null=True)
    is_anonymous = models.BooleanField(db_column="IsAnonymous", default=False)
    name = models.CharField(db_column="Name", max_length=255, default=None, null=True)
    email = models.CharField(db_column="Email", max_length=255, default=None, null=True)
    remarks = models.TextField(db_column="Remarks", default=None, null=True)
    is_approved = models.BooleanField(db_column="IsApproved", default=False)

    class Meta:
        db_table = 'Organization_Rating'

    def __str__(self):
        return f'{self.name}'
