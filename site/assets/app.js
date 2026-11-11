const menuButton = document.querySelector(".menu-trigger");
const siteMenu = document.querySelector("#site-menu");
const profileMenuLink = document.querySelector("#profile-menu-link");
const themeToggle = document.querySelector("#theme-toggle");
const languageToggle = document.querySelector("#language-toggle");
const languageCode = document.querySelector("#language-code");
const savedTheme = localStorage.getItem("3b-theme");
const savedLanguage = localStorage.getItem("3b-language") || "en";
document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
document.documentElement.lang = savedLanguage;
const translations = {
  en: {home:"Home",profile:"Profile",services:"Services",login:"Login",logout:"Logout",accountLogin:"Account login",dark:"Switch to dark mode",light:"Switch to light mode"},
  bn: {home:"হোম",profile:"প্রোফাইল",services:"সার্ভিস",login:"লগইন",logout:"লগআউট",accountLogin:"অ্যাকাউন্টে লগইন",dark:"ডার্ক মোড চালু করুন",light:"লাইট মোড চালু করুন"}
};
function applyLanguage(language) {
  const lang = language === "bn" ? "bn" : "en";
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-label]").forEach((element) => {
    const key = element.dataset.label;
    if (translations[lang][key]) element.textContent = translations[lang][key];
  });
  if (languageCode) languageCode.textContent = lang.toUpperCase();
  localStorage.setItem("3b-language", lang);
}
function applyTheme(theme) {
  const dark = theme === "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  if (themeToggle) {
    themeToggle.textContent = dark ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", dark ? translations[document.documentElement.lang].light : translations[document.documentElement.lang].dark);
  }
  localStorage.setItem("3b-theme", dark ? "dark" : "light");
}
applyLanguage(savedLanguage);
applyTheme(savedTheme === "dark" ? "dark" : "light");
if (themeToggle) themeToggle.addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
if (languageToggle) languageToggle.addEventListener("click", () => {
  const next = document.documentElement.lang === "bn" ? "en" : "bn";
  applyLanguage(next);
  applyTheme(document.documentElement.dataset.theme);
});
const SUPABASE_URL = "https://sburxeuxkrilbfppxylm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_lqGGahZ0ST267jqsI3Zelg_477szacT";
let supabase;
const loginMenuLink = document.querySelector("#login-menu-link");
const logoutMenuLink = document.querySelector("#logout-menu-link");

// Hide the menu link for the page currently being viewed.
function hideCurrentPageMenuLink() {
  if (!siteMenu) return;
  const currentPath = location.pathname.replace(/\/+$/, "") || "/";
  siteMenu.querySelectorAll('a.menu-link[href]').forEach((link) => {
    const targetPath = new URL(link.getAttribute("href"), location.href).pathname.replace(/\/+$/, "") || "/";
    if (targetPath === currentPath) link.hidden = true;
  });
}
hideCurrentPageMenuLink();
function closeSiteMenu() {
  if (!siteMenu || !menuButton) return;
  siteMenu.hidden = true;
  menuButton.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
}
function setMenuSession(session) {
  if (profileMenuLink) profileMenuLink.hidden = !session;
  if (loginMenuLink) loginMenuLink.hidden = !!session;
  if (logoutMenuLink) logoutMenuLink.hidden = !session;
}
// Load authentication separately so a Supabase CDN issue cannot disable the menu.
const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
if (logoutMenuLink) logoutMenuLink.addEventListener("click", async () => {
  logoutMenuLink.disabled = true;
  const { error } = await supabase.auth.signOut();
  logoutMenuLink.disabled = false;
  if (!error) {
    setMenuSession(null);
    closeSiteMenu();
    location.assign(new URL("login/", ROOT_URL).href);
  }
});
async function syncProfileMenu() {
  if (!profileMenuLink) return;
  const { data } = await supabase.auth.getSession();
  setMenuSession(data.session);
}
syncProfileMenu();
supabase.auth.onAuthStateChange((_event, session) => {
  setMenuSession(session);
});
const ROOT_URL = new URL("../", import.meta.url);
const form = document.querySelector("#auth-form");

if (form) {
  const message = document.querySelector("#auth-message");
  const submit = document.querySelector("#auth-submit");
  const toggle = document.querySelector("#toggle-signup");
  const forgot = document.querySelector("#forgot-password");
  const emailInput = form.elements.email;
  const passwordInput = form.elements.password;
  const otpInput = form.elements.otp;
  let mode = "login";
  let recoveryEmail = "";

  function showMessage(text, kind = "") {
    message.textContent = text;
    message.dataset.kind = kind;
  }

  function render() {
    const signup = mode === "signup";
    const recovery = mode === "recovery";
    submit.textContent = recovery ? "Verify Code & Reset Password" : signup ? "Create Account" : "Login";
    toggle.textContent = signup ? "Login Account" : "Create Account";
    toggle.disabled = recovery;
    forgot.disabled = recovery;
    emailInput.readOnly = recovery;
    otpInput.hidden = !recovery;
    otpInput.required = recovery;
    passwordInput.autocomplete = recovery || signup ? "new-password" : "current-password";
    passwordInput.setAttribute("aria-label", recovery ? "New Password" : "Password");
    passwordInput.placeholder = recovery ? "New Password" : "Password";
    passwordInput.required = true;
    if (recovery) otpInput.focus();
  }

  toggle.addEventListener("click", () => {
    if (mode === "recovery") return;
    mode = mode === "signup" ? "login" : "signup";
    render();
    showMessage("");
  });

  forgot.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) {
      emailInput.focus();
      return showMessage("Enter your email address first.", "error");
    }
    forgot.disabled = true;
    showMessage("Sending verification code…");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      recoveryEmail = email;
      mode = "recovery";
      otpInput.value = "";
      passwordInput.value = "";
      render();
      showMessage("A verification code has been sent to your email. Enter the code and your new password.", "success");
    } catch (error) {
      forgot.disabled = false;
      showMessage(error instanceof Error ? error.message : "Could not send the verification code. Please try again.", "error");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email && mode !== "recovery") {
      emailInput.focus();
      return showMessage("Enter your email address.", "error");
    }
    if (password.length < 8) {
      passwordInput.focus();
      return showMessage("Password must be at least 8 characters.", "error");
    }
    if (mode === "recovery" && !/^\d{6,8}$/.test(otpInput.value.trim())) {
      otpInput.focus();
      return showMessage("Enter the verification code from your email.", "error");
    }

    submit.disabled = true;
    showMessage(mode === "recovery" ? "Verifying code and updating password…" : mode === "signup" ? "Creating account…" : "Signing in…");
    try {
      if (mode === "recovery") {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: recoveryEmail,
          token: otpInput.value.trim(),
          type: "recovery",
        });
        if (verifyError) throw verifyError;
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        await supabase.auth.signOut();
        mode = "login";
        recoveryEmail = "";
        otpInput.value = "";
        passwordInput.value = "";
        emailInput.readOnly = false;
        render();
        showMessage("Password updated successfully. You can now log in with your new password.", "success");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: new URL("login/", ROOT_URL).href },
        });
        if (error) throw error;
        if (data.session) {
          showMessage("Account created successfully.", "success");
          location.assign(new URL("profile/", ROOT_URL).href);
        } else {
          // With email confirmation enabled, Supabase may return no session for
          // both a new signup and an already-registered email. Try signing in
          // with the exact same credentials: only a matching existing password
          // can establish a session for the existing account.
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
          if (!loginError && loginData.session) {
            showMessage("This email already has an account. You are now logged in to that account.", "success");
            location.assign(new URL("profile/", ROOT_URL).href);
          } else if (loginError && /email not confirmed/i.test(loginError.message)) {
            showMessage("Check your inbox to confirm your new account before logging in.", "success");
          } else {
            showMessage("This email may already have an account. Use the correct password, or choose Login or Forgot password.", "error");
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
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
}

const profile = document.querySelector("#profile-card");
if (profile) {
  const email = document.querySelector("#profile-email");
  const status = document.querySelector("#profile-message");
  const logout = document.querySelector("#sign-out");
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) location.replace(new URL("login/", ROOT_URL).href);
  });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    location.replace(new URL("login/", ROOT_URL).href);
  } else {
    email.textContent = data.user.email ?? "Signed-in account";
  }
  logout.addEventListener("click", async () => {
    logout.disabled = true;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      status.textContent = signOutError.message;
      status.dataset.kind = "error";
      logout.disabled = false;
      return;
    }
    subscription.unsubscribe();
    location.replace(new URL("login/", ROOT_URL).href);
  });
}
