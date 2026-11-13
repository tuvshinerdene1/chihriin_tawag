from django.contrib import admin
from .models import Bowl, BowlInvitation, BowlMembership, Category

# Register your models here.
admin.site.register(Bowl)
admin.site.register(BowlMembership)
admin.site.register(BowlInvitation)
admin.site.register(Category)
