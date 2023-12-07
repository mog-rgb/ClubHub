from django.db.models import Avg
from django.utils.text import slugify
from rest_framework import serializers

from api.organization.models import Organization, OrganizationRating
from api.users.models import User
from main.serilaizer import DynamicFieldsModelSerializer


class OrganizationSerializer(DynamicFieldsModelSerializer):
    file = serializers.ImageField(required=False, default=None, allow_null=True,allow_empty_file=True)
    average_rating = serializers.SerializerMethodField(read_only=True)
    total_rating = serializers.SerializerMethodField(read_only=True)
    pending_review = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Organization
        exclude = ('modified_on', 'modified_by', 'created_on')

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.type = validated_data.get('type', instance.type)
        instance.description = validated_data.get('description', instance.description)
        instance.slug = slugify(instance.name)
        if validated_data.get('file', None):
            instance.file = validated_data.get('file', instance.file)
        instance.save()
        return instance

    def get_average_rating(self,obj):
        val = obj.organization_rating.filter(is_approved=True).aggregate(avg_val=Avg("rating"))['avg_val']
        return val if val else 0

    def get_pending_review(self,obj):
        return obj.organization_rating.filter(is_approved=False).count()

    def get_total_rating(self,obj):
        return obj.organization_rating.filter(is_approved=True).count()


class OrganizationRatingSerializer(DynamicFieldsModelSerializer):

    class Meta:
        model = OrganizationRating
        exclude = ('modified_on', 'modified_by', 'created_on', 'organization')

    def create(self, validated_data):
        return OrganizationRating.objects.create(**validated_data)