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
    message: message,
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
        const htmlString = `<div class="card mt-3 px-3 py-2 w-75 mx-auto fade-in" >
			<div class="d-flex">
				<h5 class="card-title"><a href="#">${post.owner}</a></h5>
			</div>
		<div class="card-body">
			<p class="card-text">${post.message}</p>
			<a href="#" class="card-link">Card link</a>
			<a href="#" class="card-link">Another link</a>
		</div>
		</div>`;
        tempElement.innerHTML = htmlString;
        let fadeIn = setInterval(() => {
          element.style.opacity = opacity;
          opacity += 0.01;
        }, 10);
        document.querySelector("#allPosts").prepend(tempElement);
      }
    });
}

function displayAllPosts() {
  fetch("/posts")
    .then((reponse) => reponse.text())
    .then((template) => {
      document.querySelector("#allPosts").innerHTML = template;
    });
}

document.addEventListener("DOMContentLoaded", function () {
  var pattern_profile = /^\/user-profile\/\d+$/;
  if (pattern_profile.test(window.location.pathname)) {
    var btn = document.querySelector("#btn-profile");
    var status = btn.dataset.followStatus;
    changeBtnColor(status, btn);
    document.addEventListener("click", function (e) {
      e.preventDefault();
      btn = document.querySelector("#btn-profile");
      status = btn.dataset.followStatus;
      changeFollowStatus(status, btn);
    });
  } else {
    displayAllPosts();
    document.querySelector("form#create_a_new_post").onsubmit = function (e) {
      e.preventDefault();
      const csrf_token = document.getElementsByName("csrfmiddlewaretoken")[0]
        .value;
      var message = document.querySelector("#post_message");
      createANewPost(csrf_token, message);
    };
  }
});
