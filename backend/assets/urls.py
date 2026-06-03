from django.urls import path

from . import views


urlpatterns = [
    path("health", views.health),
    path("health/", views.health),
    path("assets", views.assets_collection),
    path("assets/", views.assets_collection),
    path("assets/<str:asset_id>/profile-picture", views.asset_profile_picture),
    path("assets/<str:asset_id>/profile-picture/", views.asset_profile_picture),
    path("assets/<str:asset_id>", views.asset_detail),
    path("assets/<str:asset_id>/", views.asset_detail),
]
