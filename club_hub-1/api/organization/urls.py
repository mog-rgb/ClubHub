# Create your views here.
from django.urls import path

# app_name will help us do a reverse look-up latter.
from api.organization.views import OrganizationAPIView, OrganizationDeleteAPIView, EventStatisticsAPIView, \
    OrganizationRatingAPIView, OrganizationRatingApproveAPIView

urlpatterns = [

    path("", OrganizationAPIView.as_view(), name="organization"),
    path("<int:pk>", OrganizationAPIView.as_view(), name="organization"),

    path("delete", OrganizationDeleteAPIView.as_view(), name="organization_delete"),
    path("delete/<int:pk>", OrganizationDeleteAPIView.as_view(), name="organization_delete"),

    path("rate-organization", OrganizationRatingAPIView.as_view(), name="organization_rate"),
    path("<int:organization_id>/rate-organization", OrganizationRatingAPIView.as_view(), name="organization_rate"),

    path("<int:organization_id>/rate-organization/<str:type>/<int:rating_id>", OrganizationRatingApproveAPIView.as_view(), name="organization_rate_approved"),

    path("statistics", EventStatisticsAPIView.as_view(), name="event_stats"),

]
