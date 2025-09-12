export async function onRequestPost(context) {
  const formData = await context.request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");
  const token = formData.get("cf-turnstile-response");

  // Verify Turnstile
  const verifyResp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${encodeURIComponent(context.env.TURNSTILE_SECRET)}&response=${encodeURIComponent(token)}`
  });
  const outcome = await verifyResp.json();

  if (!outcome.success) {
    return new Response("Turnstile verification failed", { status: 403 });
  }

  // Send through Resend API
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Website Contact <onboarding@resend.dev>",
      to: ["your@email.com"],   // 👈 replace with your email
      subject: `New contact from ${name}`,
      text: `From: ${name} (${email})\n\n${message}`
    })
  });

  if (!resp.ok) {
    return new Response("Failed to send email", { status: 500 });
  }

  return new Response("Message sent successfully!", { status: 200 });
}
