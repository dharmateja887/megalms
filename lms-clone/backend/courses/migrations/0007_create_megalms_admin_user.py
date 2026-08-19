from django.conf import settings
from django.db import migrations


def create_admin_user(apps, schema_editor):
    User = apps.get_model("auth", "User")
    username = "megalms123"
    password = "Dharma@16"

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(
            username=username,
            email="megalms123@example.com",
            password=password,
        )


def delete_admin_user(apps, schema_editor):
    User = apps.get_model("auth", "User")
    User.objects.filter(username="megalms123").delete()


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("courses", "0006_loginprofile"),
    ]

    operations = [
        migrations.RunPython(create_admin_user, delete_admin_user),
    ]
