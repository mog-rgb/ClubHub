import json
from datetime import datetime

from django.conf import settings
from django.db.models import Q, Count, F, Avg, Case, When, Value
from django.urls import reverse
from rest_framework import status

from rest_framework import status

from api.organization.models import Organization, OrganizationRating
from api.organization.serializers import OrganizationSerializer, OrganizationRatingSerializer
from api.permissions import IsAuthenticated, IsClientAuthenticated, IsGETorClientAuthenticated
from api.users.models import User, Role, AccessLevel
from api.users.serializers import UserSerializer
from api.views import BaseAPIView
from club_hub_app.send_email import send_email_sendgrid_template
from club_hub_app.utils import parse_email, boolean


class OrganizationAPIView(BaseAPIView):
    """
    API View for Login Super Admin and Admin
    """
    authentication_classes = ()
    permission_classes = (IsGETorClientAuthenticated,)

    def get(self, request, pk=None):
        """
        :param request:
        :param pk: to get organization instance
        :return: response of required organization listings
        """
        try:
            if pk:
                data = Organization.objects.get(id=pk)
                serializer = OrganizationSerializer(data)
                count = 1
            else:
                limit = int(request.query_params.get("limit", 10))
                offset = int(request.query_params.get("offset", 0))
                search = request.query_params.get('search', '')
                type = request.query_params.get('type', '')
                org_status = request.query_params.get('org_status', '')
                query_object = Q()
                if type:
                    query_object &= Q(type__exact=type)
                if org_status:
                    query_object &= Q(is_active=boolean(org_status))
                for param in search.split(' '):
                    query_object &= Q(
                        name__icontains=param
                    )
                data = Organization.objects
                    # data = data.exclude(user_id=request.user.id)
                data = data.annotate(average_value=Avg(
                    Case(
                        When(organization_rating__is_approved=False, then=F('organization_rating__rating')),
                        default=Value(0)
                    )
                )).filter(query_object).order_by("-average_value")
                serializer = OrganizationSerializer(data[offset: limit + offset], many=True, context={
                    "user_id": request.user.id
                })
                count = data.count()
            return self.send_response(
                success=True,
                status_code=status.HTTP_200_OK,
                payload=serializer.data,
                description="Organization Data",
                count=count
            )

        except Organization.DoesNotExist as e:
            return self.send_response(
                code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                description=str(e)
            )
        except Exception as e:
            return self.send_response(
                code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                description=str(e)
            )

    def post(self, request, pk=None):
        try:
            serializer = OrganizationSerializer(data=request.data)
            if serializer.is_valid():
                validated_data = serializer.validated_data
                validated_data['user'] = request.user
                serializer.save(**validated_data)
                return self.send_response(
                    success=True,
                    code=f'200',
                    status_code=status.HTTP_200_OK,
                    description='Evento criado com sucesso',
                )
            else:
                return self.send_response(
                    success=False,
                    code='422',
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    description=serializer.errors
                )
        except Exception as e:
            if hasattr(e.__cause__, 'pgcode') and e.__cause__.pgcode == '23505':
                return self.send_response(
                    code=f'422',
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    description="Um usuário com esse email já existe no sistema."
                )
            return self.send_response(
                code=f'500',
                description=e
            )

    def put(self, request, pk=None):
        try:
            instance = Organization.objects.get(id=pk)
            serializer = OrganizationSerializer(data=request.data, instance=instance)
            if serializer.is_valid():
                serializer.save()
                return self.send_response(
                    success=True,
                    code=f'200',
                    status_code=status.HTTP_200_OK,
                    description='Evento atualizado com sucesso',
                )
            else:
                return self.send_response(
                    success=False,
                    code='422',
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    description=serializer.errors
                )
        except Exception as e:
            if hasattr(e.__cause__, 'pgcode') and e.__cause__.pgcode == '23505':
                return self.send_response(
                    code=f'422',
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    description="Um usuário com esse email já existe no sistema."
                )
            return self.send_response(
                code=f'500',
                description=e
            )


class OrganizationDeleteAPIView(BaseAPIView):
    """
    API View for Login Super Admin and Admin
    """
    authentication_classes = ()
    permission_classes = (IsClientAuthenticated,)

    def get(self, request, pk=None):
        """
        :param request:
        :param pk: to get organization instance
        :return: response of required organization listings
        """
        try:
            instance = Organization.objects.get(id=pk)
            instance.delete()
            return self.send_response(
                success=True,
                status_code=status.HTTP_200_OK,
                description="Organization Deleted Successfully",
            )
        except Organization.DoesNotExist as e:
            return self.send_response(
                code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                description="Organization does not exist in our system."
            )
        except Exception as e:
            return self.send_response(
                code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                description=str(e)
            )


class OrganizationRatingAPIView(BaseAPIView):
    """
    API View for Login Super Admin and Admin
    """
    authentication_classes = ()
    permission_classes = ()

    def get(self, request, organization_id=None):
        """
        :param request:
        :param pk: to get organization instance
        :return: response of required organization listings
        """
        try:
            limit = int(request.query_params.get("limit", 10))
            offset = int(request.query_params.get("offset", 0))
            review_status = request.query_params.get('review_status', '')
            query_object = Q(organization_id=organization_id)
            if review_status:
                query_object &= Q(is_approved=boolean(review_status))
            data = OrganizationRating.objects.filter(
                   query_object
            )
            serializer = OrganizationRatingSerializer(data[offset: offset+limit], many=True)
            return self.send_response(
                success=True,
                payload=serializer.data,
                status_code=status.HTTP_200_OK,
                description="Thank you very much. Your review will be published soon.",
                count=data.count()
            )
        except Organization.DoesNotExist as e:
            return self.send_response(
                code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                description="Organization does not exist in our system."
            )
        except Exception as e:
            return self.send_response(
                code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                description=str(e)
            )

    def post(self, request, organization_id=None):
        """
        :param request:
        :param pk: to get organization instance
        :return: response of required organization listings
        """
        try:
            instance = Organization.objects.get(
                id=organization_id,
            )
            serializer = OrganizationRatingSerializer(data=request.data)
            if serializer.is_valid():
                validated_data = serializer.validated_data
                validated_data['organization_id'] = organization_id
                serializer.save(**validated_data)
            return self.send_response(
                success=True,
                status_code=status.HTTP_200_OK,
                description="Thank you very much. Your review will be published soon.",
            )
        except Organization.DoesNotExist as e:
            return self.send_response(
                code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                description="Organization does not exist in our system."
            )
        except Exception as e:
            return self.send_response(
                code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                description=str(e)
            )


class OrganizationRatingApproveAPIView(BaseAPIView):
    """
    API View for Login Super Admin and Admin
    """
    authentication_classes = ()
    permission_classes = (IsClientAuthenticated,)

    def get(self, request, organization_id=None, type=None, rating_id=None):
        """
        :param request:
        :param pk: to get organization instance
        :return: response of required organization listings
        """
        try:
            data = OrganizationRating.objects.get(
                organization_id=organization_id,
                id=rating_id
            )
            if type == "approved":
                data.is_approved = True
                data.save()
                message = 'Review Approved Successfully'
            else:
                data.delete()
                message = 'Review Deleted Successfully'
            return self.send_response(
                success=True,
                status_code=status.HTTP_200_OK,
                description=message,
            )
        except OrganizationRating.DoesNotExist as e:
            return self.send_response(
                code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                description="Review does not exist in our system."
            )
        except Exception as e:
            return self.send_response(
                code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                description=str(e)
            )

    def post(self, request, organization_id=None):
        """
        :param request:
        :param pk: to get organization instance
        :return: response of required organization listings
        """
        try:
            instance = Organization.objects.get(
                id=organization_id,
            )
            serializer = OrganizationRatingSerializer(data=request.data)
            if serializer.is_valid():
                validated_data = serializer.validated_data
                validated_data['organization_id'] = organization_id
                serializer.save(**validated_data)
            return self.send_response(
                success=True,
                status_code=status.HTTP_200_OK,
                description="Thank you very much. Your review will be published soon.",
            )
        except Organization.DoesNotExist as e:
            return self.send_response(
                code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                description="Organization does not exist in our system."
            )
        except Exception as e:
            return self.send_response(
                code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                description=str(e)
            )


class EventStatisticsAPIView(BaseAPIView):
    """
    API View for Login Super Admin and Admin
    """
    authentication_classes = ()
    permission_classes = (IsClientAuthenticated,)

    def get(self, request, event_id=None, user_id=None):
        """
        :param request:
        :param pk: to get organization instance
        :return: response of required organization listings
        """
        try:
            city = request.query_params.get('city', "")
            type = request.query_params.get('type', "")
            query_object = Q()
            query_object_participant = Q()
            if city:
                query_object &= Q(city__exact=city)
                query_object_participant &= Q(event__city__exact=city)
            if type:
                query_object &= Q(type__exact=type)
                query_object_participant &= Q(event__type__exact=type)
            if request.user.role.code == AccessLevel.CLIENT_CODE:
                query_object &= Q(user_id=request.user.id)
                query_object_participant &= Q(user_id=request.user.id)

            city_data = Organization.objects.filter(
                query_object,
            ).annotate(
                count=Count("city"),
                data_name=F('city'),
            ).values("data_name","count")
            type_data = Organization.objects.filter(
                query_object
            ).annotate(
                count=Count("type"),
                data_name=F('type')
            ).values("data_name","count")

            event_data = Organization.objects.filter(
                query_object
            ).values('date__month').annotate(
                count=Count("id"),
                data_name=F('date__month'),
            ).values("data_name", "count")

            event_price = Organization.objects.filter(
                query_object
            ).annotate(
                count=F("price"),
                data_name=F('name'),
            ).values("data_name", "count")

            event_data_grade = OrganizationRating.objects.filter(
                query_object_participant
            ).values('event__name').annotate(
                count=Avg("grade"),
                data_name=F('event__name'),
            ).values("data_name", "count")

            event_participant_data = OrganizationRating.objects.filter(
                query_object_participant,
            ).values('event__date__month').annotate(
                count=Count("id"),
                data_name=F('event__date__month'),
            ).values("data_name", "count")

            return self.send_response(
                success=True,
                payload={
                    "city_data": city_data,
                    "type_data": type_data,
                    "event_data": event_data,
                    "event_participant_data": event_participant_data,
                    "event_data_grade": event_data_grade,
                    "event_price": event_price
                },
                status_code=status.HTTP_200_OK,
                description="Thank you very much for joining. See you at the venue",
            )
        except OrganizationRating.DoesNotExist as e:
            return self.send_response(
                code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                description="Organization does not exist in our system."
            )
        except Exception as e:
            return self.send_response(
                code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                description=str(e)
            )
