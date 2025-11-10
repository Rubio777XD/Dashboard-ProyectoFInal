from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('code', models.CharField(max_length=50, unique=True)),
                ('stock', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('low_threshold', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('avg_cost', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('suggested_price', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={'ordering': ['name']},
        ),
        migrations.CreateModel(
            name='Movement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('movement_type', models.CharField(choices=[('IN', 'Entrada'), ('OUT', 'Salida')], max_length=3)),
                ('quantity', models.DecimalField(decimal_places=2, max_digits=12)),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=12)),
                ('date', models.DateField()),
                ('note', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'product',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='movements',
                        to='inventory.product',
                    ),
                ),
            ],
            options={'ordering': ['date', 'id']},
        ),
    ]
