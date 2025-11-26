from __future__ import annotations

from rest_framework import serializers

from .models import Movement, Product, Service


class ProductSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'code',
            'category',
            'stock',
            'low_threshold',
            'avg_cost',
            'suggested_price',
            'created_at',
            'is_low_stock',
        ]
        read_only_fields = ['created_at', 'is_low_stock']

    def get_is_low_stock(self, obj: Product) -> bool:
        return obj.is_low_stock


class MovementSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = Movement
        fields = [
            'id',
            'product',
            'product_detail',
            'movement_type',
            'quantity',
            'unit_price',
            'date',
            'note',
            'created_at',
        ]
        read_only_fields = ['created_at', 'product_detail']


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = [
            'id',
            'name',
            'code',
            'category',
            'description',
            'price',
            'status',
            'created_at',
        ]
        read_only_fields = ['created_at']
