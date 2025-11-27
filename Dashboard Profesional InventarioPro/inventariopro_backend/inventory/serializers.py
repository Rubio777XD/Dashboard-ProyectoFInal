from __future__ import annotations

from rest_framework import serializers

from .models import Movement, Product


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

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError('La cantidad debe ser mayor a cero.')
        return value

    def validate(self, attrs):
        product = attrs.get('product') or getattr(self.instance, 'product', None)
        movement_type = attrs.get('movement_type') or getattr(self.instance, 'movement_type', None)
        quantity = attrs.get('quantity') or getattr(self.instance, 'quantity', None)

        if product and movement_type == Movement.MovementType.OUT and quantity is not None:
            current_stock = product.stock
            if self.instance and self.instance.product_id == product.id:
                current_stock -= self.instance.get_stock_delta()
            projected = current_stock - quantity
            if projected < 0:
                raise serializers.ValidationError({'quantity': 'La salida dejaría el inventario en negativo.'})
        return attrs

