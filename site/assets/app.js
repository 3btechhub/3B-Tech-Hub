import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://sburxeuxkrilbfppxylm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_lqGGahZ0ST267jqsI3Zelg_477szac";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const ROOT_URL = new URL("../", import.meta.url);
const form = document.querySelector("#auth-form");

if (form) {
  const params = new URLSearchParams(location.search);
  const title = document.querySelector("#auth-title");
  const description = document.querySelector("#auth-description");
  const message = document.querySelector("#auth-message");
  const submit = document.querySelector("#auth-submit");
  const toggle = document.querySelector("#toggle-signup");
  const forgot = document.querySelector("#forgot-password");
  let mode = params.get("mode") === "signup" ? "signup" : "login";

  function showMessage(text, kind = "") {
    message.textContent = text;
    message.dataset.kind = kind;
  }
  function render() {
    const signup = mode === "signup";
    title.textContent = signup ? "Create account" : "Login";
    description.textContent = signup
      ? "Create an account with your email and password."
      : "Sign in with your email address and password.";
    submit.textContent = signup ? "Create account" : "Login";
    toggle.textContent = signup ? "Back to login" : "Create account";
    forgot.hidden = signup;
    showMessage("");
  }
  toggle.addEventListener("click", () => {
    mode = mode === "signup" ? "login" : "signup";
    render();
  });
  forgot.addEventListener("click", async () => {
    const email = form.elements.email.value.trim();
    if (!email) return showMessage("Enter your email address first.", "error");
    forgot.disabled = true;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: new URL("login/?mode=recovery", ROOT_URL).href,
    });
    forgot.disabled = false;
    showMessage(error ? error.message : "If this email is registered, a password reset link has been sent.", error ? "error" : "success");
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    if (!email || password.length < 8) return showMessage("Enter a valid email and a password of at least 8 characters.", "error");
    submit.disabled = true;
    showMessage(mode === "signup" ? "Creating account…" : "Signing in…");
    try {
      const result = mode === "signup"
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: new URL("login/", ROOT_URL).href } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) {
        showMessage("Account created. Check your email to confirm your address before signing in.", "success");
      } else {
        showMessage("Signed in successfully.", "success");
        location.assign(new URL("profile/", ROOT_URL).href);
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Authentication failed. Please try again.", "error");
    } finally {
      submit.disabled = false;
    }
  });
  render();
  if (params.get("mode") === "recovery") {
    showMessage("Use the password reset link sent to your email to continue.", "success");
  }
}
