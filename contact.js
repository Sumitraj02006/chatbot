// Wait for the DOM to be ready before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {

  // Get the contact form and response message element
  const contactForm = document.getElementById("contactForm");
  const responseMessage = document.getElementById("responseMessage");

  // Add an event listener to handle form submission
  contactForm.addEventListener("submit", function(e) {
    e.preventDefault(); // Prevent the default form submission

    // Get the values from the form fields and trim whitespace
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    // Basic form validation
    if (name === "" || email === "" || message === "") {
      responseMessage.textContent = "Please fill out all fields!";
      responseMessage.style.color = "salmon";
      return;
    }

    // Prepare the data to send to the server
    const formData = {
      name: name,
      email: email,
      message: message
    };

    // Send a POST request to the server
    fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      // Handle the server response
      if (data.message === "Message saved successfully") {
        responseMessage.textContent = "Message sent successfully!";
        responseMessage.style.color = "#00ffe7";
        contactForm.reset(); // Reset the form after successful submission
      } else {
        responseMessage.textContent = "Failed to send message, try again.";
        responseMessage.style.color = "salmon";
      }
    })
    .catch(error => {
      // Handle errors if any occur during the fetch request
      console.error('Error:', error);
      responseMessage.textContent = "An error occurred. Please try again.";
      responseMessage.style.color = "salmon";
    });
  });

});
