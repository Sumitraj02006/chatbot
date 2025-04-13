document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    const response = document.getElementById("responseMessage");
  
    if (name === "" || email === "" || message === "") {
      response.textContent = "Please fill out all fields!";
      response.style.color = "salmon";
    } else {
      response.textContent = "Message sent successfully!";
      response.style.color = "#00ffe7";
  
      // Clear form
      this.reset();
    }
  });
  