from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Bowl, BowlMembership, BowlInvitation, Category
from .serializers import BowlSerializer, BowlInvitationSerializer, CategorySerializer
from .permissions import IsBowlMember


class BowlViewSet(viewsets.ModelViewSet):
    serializer_class = BowlSerializer
    permission_classes = [permissions.IsAuthenticated, IsBowlMember]

    def get_queryset(self):
        # Users only see bowls they belong to
        return Bowl.objects.filter(members=self.request.user).distinct()

    def perform_destroy(self, instance):
        # Restrict deletion strictly to bowl owners
        is_owner = BowlMembership.objects.filter(
            bowl=instance, user=self.request.user, role=BowlMembership.Role.OWNER
        ).exists()
        if not is_owner:
            self.permission_denied(self.request, message="Only the bowl owner can delete this bowl.")
        instance.delete()

    @action(detail=True, methods=["get", "post"], url_path="categories")
    def categories(self, request, pk=None):
        bowl = self.get_object()
        if request.method == "GET":
            serializer = CategorySerializer(bowl.categories.all(), many=True)
            return Response(serializer.data)

        serializer = CategorySerializer(data=request.data, context={"bowl": bowl})
        serializer.is_valid(raise_exception=True)
        serializer.save(bowl=bowl, created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="invite")
    def invite(self, request, pk=None):
        bowl = self.get_object()
        serializer = BowlInvitationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["invitee_email"]

        if bowl.members.filter(email__iexact=email).exists():
            return Response({"detail": "This user is already a member."}, status=status.HTTP_400_BAD_REQUEST)

        invitation = serializer.save(bowl=bowl, invited_by=request.user)
        return Response(BowlInvitationSerializer(invitation).data, status=status.HTTP_201_CREATED)

    @action(
        detail=False,
        methods=["post"],
        url_path=r"invitations/(?P<token>[^/.]+)/accept",
        permission_classes=[permissions.IsAuthenticated],
    )
    def accept_invitation(self, request, token=None):
        invitation = get_object_or_404(BowlInvitation, token=token, status=BowlInvitation.Status.PENDING)

        if invitation.invitee_email.lower() != request.user.email.lower():
            return Response(
                {"detail": "This invitation was sent to a different email address."},
                status=status.HTTP_403_FORBIDDEN,
            )

        BowlMembership.objects.get_or_create(
            user=request.user,
            bowl=invitation.bowl,
            defaults={"role": BowlMembership.Role.MEMBER},
        )
        invitation.status = BowlInvitation.Status.ACCEPTED
        invitation.save(update_fields=["status"])

        return Response(
            {"detail": f"Joined {invitation.bowl.name}!", "bowl_id": invitation.bowl.id},
            status=status.HTTP_200_OK,
        )