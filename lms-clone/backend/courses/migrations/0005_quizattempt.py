from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("courses", "0004_course_access_channels_course_allow_bookmarks_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="QuizAttempt",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("course_title", models.CharField(blank=True, default="", max_length=255)),
                ("chapter_title", models.CharField(blank=True, default="", max_length=255)),
                ("item_title", models.CharField(blank=True, default="", max_length=255)),
                ("item_type", models.CharField(blank=True, default="quiz", max_length=20)),
                ("user_identifier", models.CharField(blank=True, default="", max_length=255)),
                ("mobile_number", models.CharField(blank=True, default="", max_length=20)),
                ("profile_snapshot", models.JSONField(blank=True, null=True)),
                ("quiz_questions", models.JSONField(blank=True, null=True)),
                ("correct_answers", models.JSONField(blank=True, null=True)),
                ("answers", models.JSONField(blank=True, null=True)),
                ("total_questions", models.PositiveIntegerField(default=0)),
                ("correct_count", models.PositiveIntegerField(default=0)),
                ("total_result", models.DecimalField(decimal_places=2, default=0, max_digits=6)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "chapter",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="quiz_attempts",
                        to="courses.coursechapter",
                    ),
                ),
                (
                    "course",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="quiz_attempts",
                        to="courses.course",
                    ),
                ),
                (
                    "item",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="quiz_attempts",
                        to="courses.courseitem",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="quiz_attempts",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
