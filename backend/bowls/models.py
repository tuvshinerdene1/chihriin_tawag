import uuid
from django.db import models
from django.conf import settings


class Bowl(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_bowls",
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="BowlMembership",
        related_name="bowls",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class BowlMembership(models.Model):
    class Role(models.TextChoices):
        OWNER = "OWNER", "Owner"
        MEMBER = "MEMBER", "Member"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    bowl = models.ForeignKey(Bowl, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "bowl")  # Prevents a user from joining the same bowl twice


class BowlInvitation(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"
        DECLINED = "DECLINED", "Declined"

    bowl = models.ForeignKey(Bowl, on_delete=models.CASCADE, related_name="invitations")
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_invitations",
    )
    # Using email allows inviting people even before they register, or matching existing users
    invitee_email = models.EmailField()
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invite to {self.bowl.name} for {self.invitee_email}"


class Category(models.Model):
    bowl = models.ForeignKey(Bowl, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=50)
    color_hex = models.CharField(max_length=7, default="#FF6B6B")  # Useful for calendar UI later
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
    )

    class Meta:
        unique_together = ("bowl", "name")  # No duplicate "Romantic" tags in the same bowl
        verbose_name_plural = "Categories"

    def __str__(self):
        return f"{self.name} ({self.bowl.name})"