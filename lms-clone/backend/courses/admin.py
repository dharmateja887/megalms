from django.contrib import admin

from .models import Course, CourseChapter, CourseItem, LoginProfile, QuizAttempt


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
    list_display = ("title", "type", "chapter", "position", "quiz_question_count")
    search_fields = ("title", "chapter__title", "chapter__course__title", "quiz_questions")
    list_filter = ("type",)

    @admin.display(description="Quiz questions")
    def quiz_question_count(self, obj):
        questions = obj.quiz_questions or []
        return len(questions) if isinstance(questions, list) else 0


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
        "quiz_question_count",
        "created_at",
    )
    search_fields = (
        "item_title",
        "course_title",
        "chapter_title",
        "mobile_number",
        "user_identifier",
        "quiz_questions",
        "correct_answers",
        "answers",
    )
    list_filter = ("item_type", "created_at")

    @admin.display(description="Questions")
    def quiz_question_count(self, obj):
        questions = obj.quiz_questions or []
        return len(questions) if isinstance(questions, list) else 0


@admin.register(LoginProfile)
class LoginProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "phone", "created_at", "updated_at")
    search_fields = ("full_name", "phone", "first_name", "last_name")
