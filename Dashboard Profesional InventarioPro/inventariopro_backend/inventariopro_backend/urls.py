from django.conf import settings
from django.contrib import admin
from django.http import Http404, HttpResponse
from django.urls import include, path, re_path
from rest_framework.routers import DefaultRouter

from inventory.views import (
    DashboardView,
    InventorySummaryView,
    MovementViewSet,
    ProductViewSet,
    ReportsView,
    UsdRateView,
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'movements', MovementViewSet, basename='movement')


def serve_frontend(request):
    index_path = settings.FRONTEND_INDEX
    if index_path.exists():
        return HttpResponse(index_path.read_text(encoding='utf-8'), content_type='text/html')
    raise Http404('Frontend build not found. Run "npm run build" and copy the dist/ folder to inventariopro_backend/frontend/.')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('api/inventory/', InventorySummaryView.as_view(), name='inventory-summary'),
    path('api/reports/', ReportsView.as_view(), name='reports'),
    path('api/usd-rate/', UsdRateView.as_view(), name='usd-rate'),
    path('api/', include(router.urls)),
    re_path(r'^.*$', serve_frontend, name='frontend'),
]
