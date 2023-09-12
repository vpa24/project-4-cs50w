function changeBtnColor() {
	var btn = document.querySelector("#btn-profile");
	var status = btn.dataset.followStatus;
	if (status) {
		btn.classList.add("btn-success");
	}
	else{
		btn.classList.add("btn-danger");
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
      console.log(result);
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
		changeBtnColor();
	}
	else{
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
