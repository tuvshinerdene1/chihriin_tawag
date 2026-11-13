from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Bowl, BowlMembership, BowlInvitation, Category

User = get_user_model()


class BowlAPITests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@example.com", username="owner", password="password123"
        )
        self.partner = User.objects.create_user(
            email="partner@example.com", username="partner", password="password123"
        )
        self.stranger = User.objects.create_user(
            email="stranger@example.com", username="stranger", password="password123"
        )
        self.list_url = reverse("bowl-list")

    def test_create_bowl_sets_owner_and_default_categories(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post(
            self.list_url,
            {"name": "Date Jar", "description": "Weekend plans"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        bowl = Bowl.objects.get(id=response.data["id"])

        # Verify creator is OWNER
        membership = BowlMembership.objects.get(bowl=bowl, user=self.owner)
        self.assertEqual(membership.role, BowlMembership.Role.OWNER)

        # Verify 4 default categories were created
        self.assertEqual(bowl.categories.count(), 4)

    def test_non_member_cannot_access_bowl(self):
        self.client.force_authenticate(user=self.owner)
        create_res = self.client.post(self.list_url, {"name": "Private Bowl"}, format="json")
        bowl_id = create_res.data["id"]

        # Switch to stranger
        self.client.force_authenticate(user=self.stranger)
        detail_url = reverse("bowl-detail", kwargs={"pk": bowl_id})
        response = self.client.get(detail_url)

        # get_queryset filters by membership, so stranger gets 404
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_invite_and_accept_flow(self):
        self.client.force_authenticate(user=self.owner)
        create_res = self.client.post(self.list_url, {"name": "Couple Bowl"}, format="json")
        bowl_id = create_res.data["id"]

        # Owner invites partner
        invite_url = reverse("bowl-invite", kwargs={"pk": bowl_id})
        invite_res = self.client.post(
            invite_url, {"invitee_email": "partner@example.com"}, format="json"
        )
        self.assertEqual(invite_res.status_code, status.HTTP_201_CREATED)
        token = invite_res.data["token"]

        accept_url = reverse("bowl-accept-invitation", kwargs={"token": token})

        # Stranger tries to accept partner's invite -> 403 Forbidden
        self.client.force_authenticate(user=self.stranger)
        bad_res = self.client.post(accept_url)
        self.assertEqual(bad_res.status_code, status.HTTP_403_FORBIDDEN)

        # Partner accepts invite -> 200 OK
        self.client.force_authenticate(user=self.partner)
        ok_res = self.client.post(accept_url)
        self.assertEqual(ok_res.status_code, status.HTTP_200_OK)

        # Verify membership role and invitation status
        membership = BowlMembership.objects.get(bowl_id=bowl_id, user=self.partner)
        self.assertEqual(membership.role, BowlMembership.Role.MEMBER)
        self.assertEqual(
            BowlInvitation.objects.get(token=token).status,
            BowlInvitation.Status.ACCEPTED,
        )

    def test_only_owner_can_delete_bowl(self):
        bowl = Bowl.objects.create(name="Shared Bowl", created_by=self.owner)
        BowlMembership.objects.create(user=self.owner, bowl=bowl, role=BowlMembership.Role.OWNER)
        BowlMembership.objects.create(user=self.partner, bowl=bowl, role=BowlMembership.Role.MEMBER)

        detail_url = reverse("bowl-detail", kwargs={"pk": bowl.id})

        # Member attempts delete -> 403 Forbidden
        self.client.force_authenticate(user=self.partner)
        member_del = self.client.delete(detail_url)
        self.assertEqual(member_del.status_code, status.HTTP_403_FORBIDDEN)

        # Owner attempts delete -> 204 No Content
        self.client.force_authenticate(user=self.owner)
        owner_del = self.client.delete(detail_url)
        self.assertEqual(owner_del.status_code, status.HTTP_204_NO_CONTENT)

    def test_create_and_reject_duplicate_category(self):
        bowl = Bowl.objects.create(name="Fun Bowl", created_by=self.owner)
        BowlMembership.objects.create(user=self.owner, bowl=bowl, role=BowlMembership.Role.OWNER)
        Category.objects.create(bowl=bowl, name="Horror", created_by=self.owner)

        self.client.force_authenticate(user=self.owner)
        cat_url = reverse("bowl-categories", kwargs={"pk": bowl.id})

        # Duplicate name (case-insensitive) -> 400 Bad Request
        dup_res = self.client.post(cat_url, {"name": "horror", "color_hex": "#000000"}, format="json")
        self.assertEqual(dup_res.status_code, status.HTTP_400_BAD_REQUEST)

        # Unique name -> 201 Created
        ok_res = self.client.post(cat_url, {"name": "Outdoor", "color_hex": "#22AA44"}, format="json")
        self.assertEqual(ok_res.status_code, status.HTTP_201_CREATED)