function postTemplate(post) {
  return `<div class="d-flex">
			<h5 class="card-title"><a href="#">${post.owner}</a></h5>
				<span class="text-small ms-3">${post.timestamp}</span>
			<div class="edit-post ms-auto cursor-pointer" data-post-id=${post.id}>
				<i class="fa-regular fa-pen-to-square edit-icon"></i>
			</div>
		</div>
		<div class="card-body">
			<p class="card-text">${post.message}</p>
			<a href="#" class="card-link">Card link</a>
			<a href="#" class="card-link">Another link</a>
		</div>`;
}
function changeFollowStatus(status, btn) {
  const uid = btn.dataset.profileId;
  const csrf_token = document.getElementsByName("csrfmiddlewaretoken")[0].value;
  fetch(`/user-profile/${uid}`, {
    method: "PUT",
    headers: { "X-CSRFToken": csrf_token },
    body: JSON.stringify({
      status: status,
    }),
  })
    .then((reponse) => reponse.json())
    .then((result) => {
      if (status == "unfollow") {
        document.querySelector("#btn-profile").textContent = "Unfollow";
      } else {
        document.querySelector("#btn-profile").textContent = "Follow";
      }
      changeBtnColor(result.data.status, btn);
      document.querySelector("#followers").innerHTML = result.data.followers;
      btn.setAttribute("data-follow-status", result.data.status);
    });
}

function changeBtnColor(status, btn) {
  if (status == "following") {
    btn.classList.add("btn-danger");
    btn.classList.remove("btn-success");
  } else {
    btn.classList.remove("btn-danger");
    btn.classList.add("btn-success");
  }
}
function createANewPost(csrf_token, message) {
  fetch("/new-post", {
    method: "POST",
    headers: { "X-CSRFToken": csrf_token },
    body: JSON.stringify({
      message: message.value,
    }),
  })
    .then((reponse) => reponse.json())
    .then((result) => {
      if (result.post) {
        message.value = "";
        const post = result.post;
        const tempElement = document.createElement("div");
        tempElement.className = "card mt-3 px-3 py-2 w-75 mx-auto";
        const htmlString = postTemplate(post);
        tempElement.innerHTML = htmlString;
        document.querySelector("#allPosts").prepend(tempElement);
      }
    });
}

function displayAllPosts() {
  fetch("/posts")
    .then((reponse) => reponse.json())
    .then((result) => {
      const posts = result.posts;
      posts.forEach((post) => {
        const template = postTemplate(post);
        const post_element = document.createElement("div");
        post_element.className = "card mt-3 px-3 py-2 w-75 mx-auto";
        post_element.innerHTML = template;
        document.querySelector("#allPosts").append(post_element);
      });
    });
}

document.addEventListener("DOMContentLoaded", function () {
  var pattern_profile = /^\/user-profile\/\d+$/;
  if (pattern_profile.test(window.location.pathname)) {
    var btn = document.querySelector("#btn-profile");
    var status = btn.dataset.followStatus;
    changeBtnColor(status, btn);
    btn.onclick = function (e) {
      e.preventDefault();
      btn = document.querySelector("#btn-profile");
      status = btn.dataset.followStatus;
      changeFollowStatus(status, btn);
    };
  } else {
    displayAllPosts();
    document.querySelector("form#create_a_new_post").onsubmit = function (e) {
      e.preventDefault();
      const csrf_token = document.getElementsByName("csrfmiddlewaretoken")[0]
        .value;
      var message = document.querySelector("#post_message");
      createANewPost(csrf_token, message);
    };
    // After displaying posts, attach click event listeners to .edit-post elements
    document.addEventListener("click", function (event) {
      const element = event.target;
      if (element.className == "fa-regular fa-pen-to-square edit-icon") {
        const parent = element.parentElement;
        parent.style.display = "none";
        const card_body = parent.parentElement.nextElementSibling;
        card_body.style.display = "none";
        const message = card_body.querySelector(".card-text");
        const tempElement = document.createElement("div");
        tempElement.className = "edit-message";
        const htmlString = `<textarea class="form-control mb-3 message-value">${message.textContent}</textarea>
		<div class="d-flex flex-row-reverse"><button class="btn btn-danger" id="cancel">Cancel</button><button class="btn btn-success me-3" id="save">Save</button>`;
        tempElement.innerHTML = htmlString;
        card_body.parentElement.append(tempElement);
        document.querySelector("#cancel").onclick = () => {
          document.querySelector(".edit-message").remove();
          card_body.style.display = "block";
          parent.style.display = "block";
        };
        document.querySelector("#save").onclick = () => {
          const new_message = document.querySelector(".message-value").value;
          const post_id = parent.dataset.postId;
          fetch(`/post/${post_id}`, {
            method: "PUT",
            body: JSON.stringify({
              message: new_message,
            }),
          })
            .then((reponse) => reponse.json())
            .then((result) => {
              if ((result.statusText = "success")) {
                document.querySelector(".edit-message").remove();
                card_body.style.display = "block";
                message.innerHTML = new_message;
                parent.style.display = "block";
              }
            });
        };
      }
    });
  }
});
