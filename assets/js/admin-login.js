(function () {
  const { el, adminLogin, checkAdminAuth } = window.FolkCommon;

  const form = el("#admin-login-form");
  const messageEl = el("#admin-login-message");

  if (!form) {
    return;
  }

  async function bootstrap() {
    const authenticated = await checkAdminAuth();
    if (authenticated) {
      window.location.href = "index.html";
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = el("#admin-email").value.trim();
    const password = el("#admin-password").value;

    try {
      await adminLogin(email, password);
    } catch {
      messageEl.textContent = "Invalid credentials. Please try again.";
      messageEl.style.color = "#b91c1c";
      return;
    }

    messageEl.textContent = "Login successful. Redirecting...";
    messageEl.style.color = "#166534";
    window.location.href = "index.html";
  });

  bootstrap();
})();
