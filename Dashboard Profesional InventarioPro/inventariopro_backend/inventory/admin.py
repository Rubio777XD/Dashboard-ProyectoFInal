from django.contrib import admin

from .models import Movement, Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'code',
        'category',
        'stock',
        'low_threshold',
        'avg_cost',
        'suggested_price',
        'created_at',
    )
    list_filter = ('category',)
    search_fields = ('name', 'code')


@admin.register(Movement)
class MovementAdmin(admin.ModelAdmin):
    list_display = ('product', 'movement_type', 'quantity', 'unit_price', 'date')
    list_filter = ('movement_type', 'date')
    search_fields = ('product__name', 'note')
