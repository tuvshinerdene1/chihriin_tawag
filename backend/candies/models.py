from django.db import models
from django.conf import settings
from django.utils import timezone
from bowls.models import Bowl, Category


class Candy(models.Model):
    class Status(models.TextChoices):
        PROPOSED = "PROPOSED", "Proposed"      # Waiting for swipe approval
        IN_BOWL = "IN_BOWL", "In Bowl"         # Approved / ready to pick
        SCHEDULED = "SCHEDULED", "Scheduled"   # Has a planned date
        COMPLETED = "COMPLETED", "Completed"   # Date happened

    class Budget(models.TextChoices):
        FREE = "FREE", "Free ($0)"
        LOW = "LOW", "$"
        MEDIUM = "MEDIUM", "$$"
        HIGH = "HIGH", "$$$"

    class Weather(models.TextChoices):
        ANY = "ANY", "Any Weather"
        SUNNY = "SUNNY", "Sunny / Outdoor"
        RAINY = "RAINY", "Rainy / Indoor"
        NIGHT = "NIGHT", "Evening / Night"

    bowl = models.ForeignKey(Bowl, on_delete=models.CASCADE, related_name="candies")
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="candies"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_candies",
    )

    # Core details (Req #4, #5)
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.IN_BOWL)

    # Calendar & duration (Req #5, #7)
    start_date_time = models.DateTimeField(null=True, blank=True)
    duration = models.DurationField(null=True, blank=True)

    # Date Roulette filters (Req #9)
    budget = models.CharField(max_length=10, choices=Budget.choices, default=Budget.LOW)
    weather = models.CharField(max_length=10, choices=Weather.choices, default=Weather.ANY)

    # Surprise Date Mode (Req #10)
    is_surprise = models.BooleanField(default=False)
    reveal_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_revealed(self):
        if not self.is_surprise or not self.reveal_at:
            return True
        return timezone.now() >= self.reveal_at

    @property
    def is_expired(self):
        if not self.start_date_time:
            return False
        end_time = self.start_date_time + (self.duration or timezone.timedelta(hours=2))
        return timezone.now() >= end_time

    def __str__(self):
        return f"{self.title} ({self.bowl.name})"


class CandySwipe(models.Model):
    """Tracks right/left swipes for Dual-Approval Swipe (Req #11)."""
    candy = models.ForeignKey(Candy, on_delete=models.CASCADE, related_name="swipes")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    liked = models.BooleanField()
    swiped_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("candy", "user")


class CandyPhoto(models.Model):
    """Post-date memory photos attached after a candy expires (Req #8)."""
    candy = models.ForeignKey(Candy, on_delete=models.CASCADE, related_name="photos")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="candy_memories/%Y/%m/")
    caption = models.CharField(max_length=200, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)