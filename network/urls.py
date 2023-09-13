
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("new-post", views.createPost, name="createPost"),
    path("posts", views.allPosts, name="allPosts"),
    path("post/<int:post_id>", views.updatePost),
	path("user-profile/<int:uid>", views.viewProfile, name="user-profile"),
	# path("/user-profile/<int:uid>", views.changeFollowStatus, name="change-follow-status")
]
