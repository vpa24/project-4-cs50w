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
      if (result.message) {
        message.value = "";
      }
    });
}

function displayAllPosts(){
	fetch("/posts")
    .then((reponse) => reponse.json())
    .then((posts) => {
      console.log(posts);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  displayAllPosts();
  document.querySelector("form#create_a_new_post").onsubmit = function (e) {
    e.preventDefault();
    const csrf_token = document.getElementsByName("csrfmiddlewaretoken")[0]
      .value;
    var message = document.querySelector("#post_message");
    createANewPost(csrf_token, message);
  };
});
