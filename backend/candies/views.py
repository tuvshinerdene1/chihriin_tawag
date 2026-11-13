import random
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from bowls.models import BowlMembership
from bowls.permissions import IsBowlMember
from .models import Candy, CandySwipe
from .serializers import CandySerializer, CandySwipeSerializer, CandyPhotoSerializer


class CandyViewSet(viewsets.ModelViewSet):
    serializer_class = CandySerializer
    permission_classes = [permissions.IsAuthenticated, IsBowlMember]

    def get_queryset(self):
        qs = Candy.objects.filter(bowl__members=self.request.user).select_related(
            "bowl", "category", "created_by"
        ).prefetch_related("photos")

        bowl_id = self.request.query_params.get("bowl")
        if bowl_id:
            qs = qs.filter(bowl_id=bowl_id)
        return qs.distinct()

    def perform_create(self, serializer):
        bowl = serializer.validated_data["bowl"]
        if not BowlMembership.objects.filter(bowl=bowl, user=self.request.user).exists():
            raise PermissionDenied("You are not a member of this bowl.")
        serializer.save(created_by=self.request.user)

    # Req #7: Calendar endpoint (?bowl=1&start=2026-11-01&end=2026-11-30)
    @action(detail=False, methods=["get"], url_path="calendar")
    def calendar(self, request):
        qs = self.get_queryset().filter(start_date_time__isnull=False)
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        if start:
            qs = qs.filter(start_date_time__gte=start)
        if end:
            qs = qs.filter(start_date_time__lte=end)
        return Response(self.get_serializer(qs, many=True).data)

    # Req #9: Date Roulette (?bowl=1&budget=LOW&weather=RAINY&max_minutes=180)
    @action(detail=False, methods=["get"], url_path="roulette")
    def roulette(self, request):
        qs = self.get_queryset().filter(status=Candy.Status.IN_BOWL)
        budget = request.query_params.get("budget")
        weather = request.query_params.get("weather")
        max_minutes = request.query_params.get("max_minutes")

        if budget:
            qs = qs.filter(budget=budget)
        if weather:
            qs = qs.filter(weather__in=[weather, Candy.Weather.ANY])
        if max_minutes:
            from datetime import timedelta
            qs = qs.filter(duration__lte=timedelta(minutes=int(max_minutes)))

        candidates = list(qs)
        if not candidates:
            return Response({"detail": "No matching candies found in the bowl."}, status=status.HTTP_404_NOT_FOUND)

        chosen = random.choice(candidates)
        return Response(self.get_serializer(chosen).data)

    # Req #11: Dual-Approval Swipe
    @action(detail=True, methods=["post"], url_path="swipe")
    def swipe(self, request, pk=None):
        candy = self.get_object()
        serializer = CandySwipeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        liked = serializer.validated_data["liked"]

        CandySwipe.objects.update_or_create(
            candy=candy, user=request.user, defaults={"liked": liked}
        )

        # Check if all members of the bowl have swiped right (liked=True)
        total_members = candy.bowl.members.count()
        total_likes = candy.swipes.filter(liked=True).count()
        matched = total_members >= 2 and total_likes >= total_members

        if matched and candy.status == Candy.Status.PROPOSED:
            candy.status = Candy.Status.SCHEDULED
            candy.save(update_fields=["status"])

        return Response({
            "liked": liked,
            "matched": matched,
            "status": candy.status,
        })

    # Req #8: Attach photos after a candy expires
    @action(
        detail=True,
        methods=["post"],
        url_path="photos",
        parser_classes=[MultiPartParser, FormParser],
    )
    def upload_photo(self, request, pk=None):
        candy = self.get_object()
        if not candy.is_expired and candy.status != Candy.Status.COMPLETED:
            return Response(
                {"detail": "You can only attach memory photos after the date has passed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CandyPhotoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(candy=candy, uploaded_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)