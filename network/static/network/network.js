document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("form#create_a_new_post").onsubmit = function (e) {
    e.preventDefault();
    const csrf_token = document.getElementsByName("csrfmiddlewaretoken")[0]
      .value;
    const message = document.querySelector("#post_message");
    fetch("/new-post", {
      method: "POST",
      message: message,
      headers: { "X-CSRFToken": csrf_token },
	  body: JSON.stringify({
		message: message.value
	  })
    })
      .then((reponse) => reponse.json())
      .then((result) => {
        console.log(result);
      });
  };
});
