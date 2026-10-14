document.getElementById("leadForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // Get form values
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const message = document.getElementById("message").value.trim();

  // Basic validation
  if (!name || !email || !phone) {
    alert("Please fill all required fields!");
    return;
  }

  const formData = {
    name,
    email,
    phone,
    message
  };

  try {
    const response = await fetch("/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      alert("✅ Lead submitted successfully!");
      
      // Reset form after success
      document.getElementById("leadForm").reset();
    } else {
      alert("❌ Failed to submit lead");
    }

  } catch (error) {
    console.error(error);
    alert("⚠️ Server error. Make sure backend is running.");
  }
});