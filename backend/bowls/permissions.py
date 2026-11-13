from rest_framework import permissions
from .models import BowlMembership

class IsBowlMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Works whether obj is a Bowl or a child object with a .bowl attribute
        bowl = obj if hasattr(obj, "members") else getattr(obj, "bowl", None)
        return BowlMembership.objects.filter(bowl=bowl, user=request.user).exists()