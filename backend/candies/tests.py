import shutil
import tempfile
from datetime import timedelta
from io import BytesIO

from PIL import Image
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from bowls.models import Bowl, BowlMembership, Category
from .models import Candy

User = get_user_model()
TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class CandyAPITests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        # Remove temporary uploaded images after all tests finish
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)
        super().tearDownClass()

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

        self.bowl = Bowl.objects.create(name="Couple Bowl", created_by=self.owner)
        BowlMembership.objects.create(user=self.owner, bowl=self.bowl, role=BowlMembership.Role.OWNER)
        BowlMembership.objects.create(user=self.partner, bowl=self.bowl, role=BowlMembership.Role.MEMBER)

        self.other_bowl = Bowl.objects.create(name="Stranger Bowl", created_by=self.stranger)
        BowlMembership.objects.create(user=self.stranger, bowl=self.other_bowl, role=BowlMembership.Role.OWNER)

        self.category = Category.objects.create(bowl=self.bowl, name="Romantic", created_by=self.owner)
        self.other_category = Category.objects.create(bowl=self.other_bowl, name="Outdoor", created_by=self.stranger)

        self.list_url = reverse("candy-list")

    def _create_dummy_image(self, name="memory.jpg"):
        file_obj = BytesIO()
        image = Image.new("RGB", (100, 100), color="red")
        image.save(file_obj, "JPEG")
        file_obj.seek(0)
        return SimpleUploadedFile(name, file_obj.read(), content_type="image/jpeg")

    def test_create_candy_and_enforce_bowl_membership(self):
        # Stranger cannot add a candy to Couple Bowl
        self.client.force_authenticate(user=self.stranger)
        bad_res = self.client.post(
            self.list_url,
            {"bowl": self.bowl.id, "title": "Crash Date"},
            format="json",
        )
        self.assertEqual(bad_res.status_code, status.HTTP_403_FORBIDDEN)

        # Member cannot attach a category from another bowl
        self.client.force_authenticate(user=self.owner)
        wrong_cat_res = self.client.post(
            self.list_url,
            {"bowl": self.bowl.id, "category": self.other_category.id, "title": "Picnic"},
            format="json",
        )
        self.assertEqual(wrong_cat_res.status_code, status.HTTP_400_BAD_REQUEST)

        # Valid creation succeeds
        ok_res = self.client.post(
            self.list_url,
            {
                "bowl": self.bowl.id,
                "category": self.category.id,
                "title": "Stargazing",
                "description": "Drive out of the city with hot cocoa",
                "budget": Candy.Budget.LOW,
                "weather": Candy.Weather.NIGHT,
            },
            format="json",
        )
        self.assertEqual(ok_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ok_res.data["created_by"], self.owner.id)

    def test_calendar_filtering(self):
        now = timezone.now()
        # Scheduled inside range
        in_range = Candy.objects.create(
            bowl=self.bowl,
            created_by=self.owner,
            title="Dinner Date",
            start_date_time=now + timedelta(days=2),
        )
        # Scheduled outside range
        Candy.objects.create(
            bowl=self.bowl,
            created_by=self.owner,
            title="Next Month Trip",
            start_date_time=now + timedelta(days=40),
        )
        # Unscheduled idea (should not appear on calendar)
        Candy.objects.create(
            bowl=self.bowl,
            created_by=self.owner,
            title="Someday Idea",
            start_date_time=None,
        )

        self.client.force_authenticate(user=self.partner)
        cal_url = reverse("candy-calendar")
        res = self.client.get(
            cal_url,
            {
                "bowl": self.bowl.id,
                "start": (now + timedelta(days=1)).isoformat(),
                "end": (now + timedelta(days=7)).isoformat(),
            },
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["id"], in_range.id)

    def test_date_roulette_filters(self):
        Candy.objects.create(
            bowl=self.bowl,
            created_by=self.owner,
            title="Expensive Concert",
            status=Candy.Status.IN_BOWL,
            budget=Candy.Budget.HIGH,
            weather=Candy.Weather.NIGHT,
            duration=timedelta(hours=4),
        )
        matching = Candy.objects.create(
            bowl=self.bowl,
            created_by=self.owner,
            title="Board Game Cafe",
            status=Candy.Status.IN_BOWL,
            budget=Candy.Budget.LOW,
            weather=Candy.Weather.RAINY,
            duration=timedelta(hours=2),
        )

        self.client.force_authenticate(user=self.partner)
        roulette_url = reverse("candy-roulette")
        res = self.client.get(
            roulette_url,
            {
                "bowl": self.bowl.id,
                "budget": Candy.Budget.LOW,
                "weather": Candy.Weather.RAINY,
                "max_minutes": 150,
            },
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["id"], matching.id)

    def test_surprise_date_masking_and_reveal(self):
        future_reveal = timezone.now() + timedelta(hours=5)
        surprise = Candy.objects.create(
            bowl=self.bowl,
            created_by=self.owner,
            title="Secret Rooftop Dinner",
            description="Wear something warm",
            is_surprise=True,
            reveal_at=future_reveal,
        )
        detail_url = reverse("candy-detail", kwargs={"pk": surprise.id})

        # Author still sees real details
        self.client.force_authenticate(user=self.owner)
        owner_res = self.client.get(detail_url)
        self.assertEqual(owner_res.data["title"], "Secret Rooftop Dinner")

        # Partner sees blurred details before reveal_at
        self.client.force_authenticate(user=self.partner)
        partner_res = self.client.get(detail_url)
        self.assertEqual(partner_res.data["title"], "Surprise Date!")
        self.assertFalse(partner_res.data["is_revealed"])

        # Once reveal_at passes, partner sees actual details
        surprise.reveal_at = timezone.now() - timedelta(minutes=1)
        surprise.save(update_fields=["reveal_at"])

        revealed_res = self.client.get(detail_url)
        self.assertEqual(revealed_res.data["title"], "Secret Rooftop Dinner")
        self.assertTrue(revealed_res.data["is_revealed"])

    def test_dual_approval_swipe(self):
        candy = Candy.objects.create(
            bowl=self.bowl,
            created_by=self.owner,
            title="Pottery Class",
            status=Candy.Status.PROPOSED,
        )
        swipe_url = reverse("candy-swipe", kwargs={"pk": candy.id})

        # First partner swipes right -> not matched yet
        self.client.force_authenticate(user=self.owner)
        first_res = self.client.post(swipe_url, {"liked": True}, format="json")
        self.assertEqual(first_res.status_code, status.HTTP_200_OK)
        self.assertFalse(first_res.data["matched"])
        self.assertEqual(first_res.data["status"], Candy.Status.PROPOSED)

        # Second partner swipes right -> matched & auto-scheduled
        self.client.force_authenticate(user=self.partner)
        second_res = self.client.post(swipe_url, {"liked": True}, format="json")
        self.assertEqual(second_res.status_code, status.HTTP_200_OK)
        self.assertTrue(second_res.data["matched"])
        self.assertEqual(second_res.data["status"], Candy.Status.SCHEDULED)

    def test_photo_upload_only_allowed_after_expiration(self):
        # Future candy -> photo upload blocked
        future_candy = Candy.objects.create(
            bowl=self.bowl,
            created_by=self.owner,
            title="Upcoming Hike",
            start_date_time=timezone.now() + timedelta(days=3),
        )
        self.client.force_authenticate(user=self.partner)
        blocked_url = reverse("candy-upload-photo", kwargs={"pk": future_candy.id})
        blocked_res = self.client.post(
            blocked_url,
            {"image": self._create_dummy_image(), "caption": "Too early"},
            format="multipart",
        )
        self.assertEqual(blocked_res.status_code, status.HTTP_400_BAD_REQUEST)

        # Past candy -> photo upload succeeds
        past_candy = Candy.objects.create(
            bowl=self.bowl,
            created_by=self.owner,
            title="Coffee Walk",
            start_date_time=timezone.now() - timedelta(hours=5),
            duration=timedelta(hours=1),
        )
        ok_url = reverse("candy-upload-photo", kwargs={"pk": past_candy.id})
        ok_res = self.client.post(
            ok_url,
            {"image": self._create_dummy_image(), "caption": "Best latte ever"},
            format="multipart",
        )
        self.assertEqual(ok_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(past_candy.photos.count(), 1)