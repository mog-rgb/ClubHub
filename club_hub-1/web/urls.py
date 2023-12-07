from django.urls import path

from .views.home import HomeView, OrganizationView, StatsView

# from api.propertycontent.views import PropertyContentView

urlpatterns = [

    path("", view=HomeView.as_view('index'), name="visitor_website_home"),
    path("organizations", view=HomeView.as_view('all_organizations'), name="visitor_website_all_organizations"),
    path("organization/<str:slug>", view=HomeView.as_view('organization_detail'), name="visitor_website_organization_detail"),
    # Visitor Admin Panel
    path("login", view=HomeView.as_view('login'), name="visitor_login"),
    path("register", view=HomeView.as_view('register'), name="visitor_register"),
    path("dashboard", view=HomeView.as_view('dashboard'), name="visitor-home"),
    path("user", view=HomeView.as_view('user'), name="visitor-user"),
    path("admin/organization", view=OrganizationView.as_view('index'), name="visitor-organization"),
    path("admin/organization-detail/<int:pk>", view=OrganizationView.as_view('detail'), name="visitor-organization-detail"),
    path("statistics", view=StatsView.as_view('index'), name="visitor-stats"),

    path('set-auth-cookie/', HomeView.as_view('auth_cookie'), name="set-auth-cookie"),
    path('set-auth-cookie/<str:access_tokenFsirm>', HomeView.as_view('auth_cookie'), name="set-auth-cookie"),

]
