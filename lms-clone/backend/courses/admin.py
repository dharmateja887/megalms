from django.contrib import admin

from .models import Course, CourseChapter, CourseItem, QuizAttempt


class CourseChapterInline(admin.TabularInline):
    model = CourseChapter
    extra = 0


class CourseItemInline(admin.TabularInline):
    model = CourseItem
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "plan_type", "price", "created_at", "updated_at")
    search_fields = ("title", "description", "tags")
    inlines = [CourseChapterInline]


@admin.register(CourseChapter)
class CourseChapterAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "position")
    search_fields = ("title", "course__title")
    inlines = [CourseItemInline]


@admin.register(CourseItem)
class CourseItemAdmin(admin.ModelAdmin):
    list_display = ("title", "type", "chapter", "position")
    search_fields = ("title", "chapter__title", "chapter__course__title")
    list_filter = ("type",)


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "item_title",
        "mobile_number",
        "user_identifier",
        "total_questions",
        "correct_count",
        "total_result",
        "created_at",
    )
    search_fields = ("item_title", "course_title", "chapter_title", "mobile_number", "user_identifier")
    list_filter = ("item_type", "created_at")
