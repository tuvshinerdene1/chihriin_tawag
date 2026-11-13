# candies/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CandyViewSet

router = DefaultRouter()
router.register(r"", CandyViewSet, basename="candy")

urlpatterns = [
    path("", include(router.urls)),
]