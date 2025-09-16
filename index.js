export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle contact form submission
    if (url.pathname === "/api/contact" && request.method === "POST") {
      const formData = await request.formData();
      const name = formData.get("name");
      const email = formData.get("email");
      const message = formData.get("message");
      const token = formData.get("cf-turnstile-response");
      const toEmail = env.CONTACT_EMAIL;


      // 1. Verify Turnstile
      const verifyResp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(env.TURNSTILE_SECRET)}&response=${encodeURIComponent(token)}`
      });
      const outcome = await verifyResp.json();

      if (!outcome.success) {
        return new Response("Turnstile verification failed", { status: 403 });
      }

      // 2. Send email via Resend
      const resendResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Website Contact <onboarding@resend.dev>",
          to: [`${toEmail}`],   // 👈 replace with your email
          subject: `New contact from ${name}`,
          text: `From: ${name} (${email})\n\n${message}`
        })
      });

      if (!resendResp.ok) {
        return new Response("Failed to send email", { status: 500 });
      }

      // g: c/o return new Response("Message sent successfully!", { status: 200 });
      return resendResp; // g: add
    }

    // Default 404 for other routes
    return new Response("Not found", { status: 404 });
  }
};
