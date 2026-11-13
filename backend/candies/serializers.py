from rest_framework import serializers
from .models import Candy, CandySwipe, CandyPhoto


class CandyPhotoSerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.CharField(source="uploaded_by.username", read_only=True)

    class Meta:
        model = CandyPhoto
        fields = ["id", "image", "caption", "uploaded_by_username", "uploaded_at"]
        read_only_fields = ["uploaded_by_username", "uploaded_at"]


class CandySerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    photos = CandyPhotoSerializer(many=True, read_only=True)
    is_revealed = serializers.BooleanField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Candy
        fields = [
            "id", "bowl", "category", "category_name", "created_by", "created_by_username",
            "title", "description", "status", "start_date_time", "duration",
            "budget", "weather", "is_surprise", "reveal_at", "is_revealed",
            "is_expired", "photos", "created_at",
        ]
        read_only_fields = ["created_by", "created_at"]

    def validate(self, attrs):
        is_surprise = attrs.get("is_surprise", getattr(self.instance, "is_surprise", False))
        reveal_at = attrs.get("reveal_at", getattr(self.instance, "reveal_at", None))
        if is_surprise and not reveal_at:
            raise serializers.ValidationError({"reveal_at": "Surprise dates require a reveal_at timestamp."})

        bowl = attrs.get("bowl", getattr(self.instance, "bowl", None))
        category = attrs.get("category")
        if category and bowl and category.bowl_id != bowl.id:
            raise serializers.ValidationError({"category": "Category must belong to the same bowl."})
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        is_author = request and request.user == instance.created_by

        # Blur details for partner until reveal_at reaches zero (Req #10)
        if instance.is_surprise and not instance.is_revealed and not is_author:
            data["title"] = "Surprise Date!"
            data["description"] = "Details are hidden until the countdown ends."
        return data


class CandySwipeSerializer(serializers.Serializer):
    liked = serializers.BooleanField()