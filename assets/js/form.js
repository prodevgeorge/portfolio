const form = document.getElementById("contactForm");
const responseDiv = document.getElementById("response");
const sendBtn = document.getElementById("sendBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // stop page reload

  // Disable button + show spinner
  sendBtn.disabled = true;
  sendBtn.innerHTML = `Sending<span class="spinner"></span>`;

  const formData = new FormData(form);

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      body: formData
    });

    const text = await res.text();
    responseDiv.textContent = text;
    responseDiv.style.color = res.ok ? "green" : "red";

    if (res.ok) {
      form.reset(); // clear form on success
      // ✅ Button stays disabled after success
      sendBtn.innerHTML = "Sent 🗸";
    } else {
      // ❌ Error — allow retry
      sendBtn.disabled = false;
      sendBtn.textContent = "Send";
    }
  } catch (err) {
    responseDiv.textContent = "Something went wrong. Please try again.";
    responseDiv.style.color = "red";
    // ❌ Allow retry
    sendBtn.disabled = false;
    sendBtn.textContent = "Send";
  }
});
