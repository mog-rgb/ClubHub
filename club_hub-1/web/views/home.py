import datetime
import json
from dateutil import parser
import urllib

from django.db.models import Count
from django.shortcuts import redirect

from api.organization.models import Organization, OrganizationRating
from api.organization.serializers import OrganizationSerializer
from api.users.models import AccessLevel, User
from web.base_view import BaseView


class HomeView(BaseView):

    def index(self, *args, **kwargs):
        self.rating = OrganizationRating.objects.filter(is_approved=True).last()
        if self.rating:
            self.recent_review = OrganizationSerializer(Organization.objects.get(id=self.rating.organization_id)).data
            self.range = range(0, 5)
        return self.render('user/home.html')

    def all_organizations(self, *args, **kwargs):
        return self.render('user/all-organizations.html')

    def organization_detail(self, *args, **kwargs):
        slug = kwargs.get("slug")
        self.pk = slug.split("-")[::-1][0]
        organization_instance = Organization.objects.get(id=self.pk)
        self.organization = OrganizationSerializer(organization_instance).data
        self.encoded_organization_data = urllib.parse.quote(json.dumps(self.organization))
        self.participants = OrganizationRating.objects.filter(
            organization_id=organization_instance.id
        )
        return self.render('user/organization-detail.html')

    def login(self, *args, **kwargs):
        if self.request.user.is_authenticated:
            return redirect("/dashboard")
        return self.render('visitor/login.html')

    def register(self, *args, **kwargs):
        if self.request.user.is_authenticated:
            return redirect("/dashboard")
        return self.render('visitor/register.html')

    def dashboard(self, *args, **kwargs):
        if not self.request.user.is_authenticated:
            return redirect("/")
        self.users = User.objects.filter(role__code=AccessLevel.CLIENT_CODE).count()
        if self.request.user.role.code == AccessLevel.SUPER_ADMIN_CODE:
            self.events = Organization.objects.filter().count()
        else:
            self.events = Organization.objects.filter(user_id=self.request.user.id).count()
        return self.render('visitor/dashboard.html')

    def user(self, *args, **kwargs):
        if not self.request.user.is_authenticated and self.request.user.role.code == AccessLevel.SUPER_ADMIN_CODE:
            return redirect("/")
        return self.render('visitor/user.html')


class OrganizationView(BaseView):

    def index(self, *args, **kwargs):
        if not self.request.user.is_authenticated:
            return redirect("/")
        return self.render('visitor/organization.html')

    def detail(self, *args, **kwargs):
        if not self.request.user.is_authenticated:
            return redirect("/")
        self.pk = kwargs.get("pk")
        organization_instance = Organization.objects.get(id=kwargs.get("pk"))
        self.organization = OrganizationSerializer(organization_instance).data
        self.encoded_organization_data = urllib.parse.quote(json.dumps(self.organization))
        self.participants = OrganizationRating.objects.filter(
            organization_id=organization_instance.id
        )
        self.approved = self.participants.filter(is_approved=True).count()
        self.pending = self.participants.filter(is_approved=False).count()
        self.total = self.approved + self.pending
        return self.render('visitor/organization-detail.html')


class StatsView(BaseView):

    def index(self, *args, **kwargs):
        if not self.request.user.is_authenticated:
            return redirect("/")

        self.cities = ([d[0] for d in Organization.objects.filter().values_list('city')])
        self.types = (d[0] for d in Organization.objects.filter().values_list('type'))
        return self.render('visitor/statistics.html')