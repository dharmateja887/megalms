from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0005_quizattempt"),
    ]

    operations = [
        migrations.CreateModel(
            name="LoginProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("phone", models.CharField(max_length=20, unique=True)),
                ("first_name", models.CharField(max_length=150)),
                ("last_name", models.CharField(max_length=150)),
                ("full_name", models.CharField(blank=True, default="", max_length=310)),
                ("avatar", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
