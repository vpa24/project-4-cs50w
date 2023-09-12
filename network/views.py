from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import json
from django.core import serializers

from .models import User, Post

from .models import User


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@login_required
def createPost(request):
     # Posting a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)
    message = data.get("message", "")
    user = request.user
    new_post = Post(owner = user, message = message)
    new_post.save()
    latest_post = Post.objects.latest('id')
    post_data = {'id': latest_post.id, 'owner': latest_post.owner.username, 'message': latest_post.message, 'timestamp': latest_post.timestamp}
    return JsonResponse({"message": "Created a new post successfully.", "post": post_data}, status=201)


def allPosts(request):
    posts = Post.objects.all().order_by("-timestamp")
    return render(request, 'network/allPosts.html', {'posts': posts})

def viewProfile(request, uid):
    user_profile = User.objects.get(pk=uid)
    posts_data = Post.objects.filter(owner = user_profile)
    follow_status = None
    if request.user:
        follow_status = check_follow_status(request, user_profile.id)
    return render(request, 'network/userProfile.html', {'user_profile': user_profile, 'posts': posts_data, 'follow_status': follow_status})

@login_required
def check_follow_status(request, user_id):
    user = User.objects.get(pk=user_id)
    is_following = user.followers.filter(pk=request.user.pk).exists()
    return is_following
