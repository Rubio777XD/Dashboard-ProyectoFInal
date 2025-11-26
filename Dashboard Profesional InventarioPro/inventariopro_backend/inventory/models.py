from __future__ import annotations

from decimal import Decimal

from django.db import models
from django.db.models import F


class Product(models.Model):
    class ProductCategory(models.TextChoices):
        CONSOLES = 'consoles', 'Consolas'
        GAMING_PCS = 'gaming_pcs', 'PCs gamer'
        PERIPHERALS = 'peripherals', 'Periféricos'
        COMPONENTS = 'components', 'Componentes'
        ACCESSORIES = 'accessories', 'Merch y accesorios'

    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    category = models.CharField(
        max_length=30,
        choices=ProductCategory.choices,
        default=ProductCategory.CONSOLES,
    )
    stock = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    low_threshold = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    avg_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    suggested_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"

    @property
    def is_low_stock(self) -> bool:
        return self.stock <= self.low_threshold


class Movement(models.Model):
    class MovementType(models.TextChoices):
        IN = 'IN', 'Entrada'
        OUT = 'OUT', 'Salida'

    product = models.ForeignKey(Product, related_name='movements', on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=3, choices=MovementType.choices)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'id']

    def __str__(self) -> str:
        return f"{self.get_movement_type_display()} {self.quantity} {self.product.code}"

    def get_stock_delta(self) -> Decimal:
        multiplier = Decimal('1') if self.movement_type == self.MovementType.IN else Decimal('-1')
        return multiplier * self.quantity

    def save(self, *args, **kwargs):
        is_update = self.pk is not None
        old_product_id = None
        old_delta = Decimal('0')
        if is_update:
            old = Movement.objects.get(pk=self.pk)
            old_product_id = old.product_id
            old_delta = old.get_stock_delta()
        super().save(*args, **kwargs)
        new_delta = self.get_stock_delta()
        if is_update and old_product_id and old_product_id != self.product_id:
            Product.objects.filter(pk=old_product_id).update(stock=F('stock') - old_delta)
            Product.objects.filter(pk=self.product_id).update(stock=F('stock') + new_delta)
        else:
            Product.objects.filter(pk=self.product_id).update(stock=F('stock') - old_delta + new_delta)

    def delete(self, *args, **kwargs):
        delta = self.get_stock_delta()
        Product.objects.filter(pk=self.product_id).update(stock=F('stock') - delta)
        super().delete(*args, **kwargs)


class Service(models.Model):
    class ServiceStatus(models.TextChoices):
        ACTIVE = 'active', 'Activo'
        INACTIVE = 'inactive', 'Inactivo'

    class ServiceCategory(models.TextChoices):
        MAINTENANCE = 'maintenance', 'Mantenimiento'
        INSTALLATION = 'installation', 'Instalación'
        WARRANTY = 'warranty', 'Garantía extendida'
        OTHER = 'other', 'Otro'

    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    category = models.CharField(
        max_length=30,
        choices=ServiceCategory.choices,
        default=ServiceCategory.MAINTENANCE,
    )
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(
        max_length=15,
        choices=ServiceStatus.choices,
        default=ServiceStatus.ACTIVE,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self) -> str:  # pragma: no cover - representación simple
        return f"{self.name} ({self.code})"
