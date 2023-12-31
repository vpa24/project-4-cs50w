from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.humanize.templatetags.humanize import naturaltime
import json
from django.core import serializers
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator

from .models import User, Post

from .models import User


def index(request):
    posts = Post.objects.all().order_by("-timestamp")
    context = allPosts(posts, request)
    return render(request, "network/index.html", context)


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
    new_post = Post(owner=user, message=message)
    new_post.save()
    latest_post = Post.objects.latest('id')
    post_data = {
        'id': latest_post.id,
        'user_id': latest_post.owner.id,
        'owner': latest_post.owner.username,
        'message': latest_post.message,
        'timestamp': naturaltime(latest_post.timestamp)
    }
    return JsonResponse({"message": "Created a new post successfully.", "post": post_data}, status=201)


def allPosts(posts, request):
    posts_data = [{
        'id': post.id,
        'owner': post.owner.username,
        'message': post.message,
        'timestamp': naturaltime(post.timestamp),
        'likeStatus': check_like_status(request, post.id),
        'owner_id': post.owner.id,
        'totalLikes': post.likes.all().count()
    } for post in posts]
    p = Paginator(posts_data, 10)
    page_number = request.GET.get('page')
    page_obj = p.get_page(page_number)  # returns the desired page object
    context = {'page_obj': page_obj, 'loop_times': range(
        1, page_obj.paginator.num_pages + 1)}

    return context


def viewProfile(request, uid):
    user_profile = User.objects.get(pk=uid)
    if request.method == "GET":
        posts_data = Post.objects.filter(owner=user_profile)
        follow_status = None
        if request.user:
            follow_status = check_follow_status(request, user_profile.id)
            p = Paginator(posts_data, 10)
            page_number = request.GET.get('page')
            page_obj = p.get_page(page_number)
            context = {'user_profile': user_profile, 'page_obj': page_obj, 'loop_times': range(
                1, page_obj.paginator.num_pages + 1), 'follow_status': follow_status}
            return render(request, 'network/userProfile.html', context)
        return render(request, 'network/userProfile.html', context)
    if request.method == "PUT":
        data = json.loads(request.body)
        status = data.get("status")
        user_profile = User.objects.get(pk=uid)
        if (status == 'unfollow'):
            user_profile.followers.add(request.user)
            request.user.following.add(user_profile)
        else:
            user_profile.followers.remove(request.user)
            request.user.following.remove(user_profile)
        follow_status = check_follow_status(request, user_profile.id)
        followers_following = {'followers': user_profile.followers.count(
        ), 'following': user_profile.following.count(), 'status': follow_status}
        return JsonResponse({"data": followers_following}, status=201)


@login_required
def check_follow_status(request, user_id):
    user = User.objects.get(pk=user_id)
    is_following = user.followers.filter(pk=request.user.pk).exists()
    return 'following' if is_following else 'unfollow'


@csrf_exempt
@login_required
def updatePost(request, post_id):
    if request.method == "PUT":
        post = Post.objects.get(id=post_id)
        data = json.loads(request.body)
        message = data.get("message")
        if message != None:
            post.message = data.get("message")
            post.save()
            return JsonResponse({"statusText": "success"}, status=201)
        elif data.get("like") == "like":
            if check_like_status(request, post_id) == False:
                post.likes.add(request.user)
            else:
                post.likes.remove(request.user)
            post = get_object_or_404(Post, id=post_id)
            total_likes = post.likes.count()
            return JsonResponse({"totalLikes": total_likes}, status=201)


@login_required
def check_like_status(request, post_id):
    is_liked = Post.objects.filter(pk=post_id, likes=request.user).exists()
    return is_liked


@login_required
def following(request):
    following_users = request.user.following.all()
    posts = Post.objects.filter(
        owner__in=following_users).order_by("-timestamp")
    context = allPosts(posts, request)
    return render(request, "network/following.html", context)
