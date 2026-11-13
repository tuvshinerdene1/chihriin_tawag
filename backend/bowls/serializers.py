from rest_framework import serializers
from .models import Bowl, BowlMembership, BowlInvitation, Category


class BowlMembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = BowlMembership
        fields = ["id", "username", "email", "role", "joined_at"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "color_hex", "created_by"]
        read_only_fields = ["created_by"]

    def validate_name(self, value):
        # Prevent duplicate category names within the same bowl
        bowl = self.context.get("bowl")
        if bowl and Category.objects.filter(bowl=bowl, name__iexact=value).exists():
            raise serializers.ValidationError("A category with this name already exists in this bowl.")
        return value


class BowlInvitationSerializer(serializers.ModelSerializer):
    bowl_name = serializers.CharField(source="bowl.name", read_only=True)
    invited_by_username = serializers.CharField(source="invited_by.username", read_only=True)

    class Meta:
        model = BowlInvitation
        fields = ["id", "bowl", "bowl_name", "invited_by_username", "invitee_email", "token", "status", "created_at"]
        read_only_fields = ["bowl", "token", "status", "created_at"]

    def validate_invitee_email(self, value):
        return value.lower().strip()


class BowlSerializer(serializers.ModelSerializer):
    members = BowlMembershipSerializer(source="bowlmembership_set", many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Bowl
        fields = ["id", "name", "description", "created_by", "members", "categories", "created_at"]
        read_only_fields = ["created_by", "created_at"]

    def create(self, validated_data):
        user = self.context["request"].user
        bowl = Bowl.objects.create(created_by=user, **validated_data)
        
        # Automatically make creator the OWNER
        BowlMembership.objects.create(user=user, bowl=bowl, role=BowlMembership.Role.OWNER)
        
        # Seed default categories
        defaults = [
            ("Romantic", "#FF6B6B"),
            ("Fun", "#4ECDC4"),
            ("Food & Drinks", "#FFD166"),
            ("Chill", "#118AB2"),
        ]
        Category.objects.bulk_create([
            Category(bowl=bowl, name=name, color_hex=color, created_by=user)
            for name, color in defaults
        ])
        return bowl