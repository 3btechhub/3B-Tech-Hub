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
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://sburxeuxkrilbfppxylm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_lqGGahZ0ST267jqsI3Zelg_477szac";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const loginMenuLink = document.querySelector("#login-menu-link");
const logoutMenuLink = document.querySelector("#logout-menu-link");
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
if (menuButton && siteMenu) {
  menuButton.addEventListener("click", () => {
    const opening = siteMenu.hidden;
    if (opening) {
      siteMenu.hidden = false;
      menuButton.classList.add("is-open");
      menuButton.setAttribute("aria-expanded", "true");
      menuButton.setAttribute("aria-label", "Close menu");
    } else closeSiteMenu();
  });
  document.addEventListener("click", (event) => {
    if (!siteMenu.hidden && !siteMenu.contains(event.target) && !menuButton.contains(event.target)) closeSiteMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSiteMenu();
  });
}
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
