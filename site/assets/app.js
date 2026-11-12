import { applyRuntimeConfig, loadRuntimeConfig } from "./runtime-config.js";
import { renderDynamicRoute } from "./dynamic-page-router.js";
import { renderDynamicNavigation } from "./dynamic-navigation.js";

await window.countryContextReady;

// Make country context available before the rest of the application runs.
const activeCountry = window.siteCountry;
const menuButton = document.querySelector(".menu-trigger");
const siteMenu = document.querySelector("#site-menu");
const profileMenuLink = document.querySelector("#profile-menu-link");
const dashboardMenuLink = document.querySelector("#dashboard-menu-link");
const themeToggle = document.querySelector("#theme-toggle");
const languageSelect = document.querySelector("#language-select");
const regionSelect = document.querySelector("#region-select");
const savedTheme = localStorage.getItem("3b-theme");
const routeDefaultLanguage = activeCountry.region === "bd" ? "bn" : activeCountry.region === "ksa" ? "ar" : "en";
const languageStorageKey = "3b-language-" + activeCountry.region;
const savedLanguage = localStorage.getItem(languageStorageKey) || routeDefaultLanguage;
document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
function addTextElement(parent, tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = value == null ? "" : String(value);
  parent.append(node);
  return node;
}

const translations = {
  en: {home:"Home",profile:"Profile",login:"Account",logout:"Logout",dashboard:"Dashboard",accountLogin:"Account login",dark:"Switch to dark mode",light:"Switch to light mode"},
  bn: {home:"হোম",profile:"প্রোফাইল",login:"অ্যাকাউন্ট",logout:"লগআউট",dashboard:"ড্যাশবোর্ড",accountLogin:"অ্যাকাউন্টে লগইন",dark:"ডার্ক মোড চালু করুন",light:"লাইট মোড চালু করুন"},
  ar: {home:"الرئيسية",profile:"الملف الشخصي",login:"الحساب",logout:"تسجيل الخروج",dashboard:"لوحة التحكم",accountLogin:"تسجيل الدخول إلى الحساب",dark:"تفعيل الوضع الداكن",light:"تفعيل الوضع الفاتح"}
};
function applyLanguage(language) {
  const lang = ["bn", "ar"].includes(language) ? language : "en";
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-label]").forEach((element) => {
    const key = element.dataset.label;
    if (translations[lang][key]) element.textContent = translations[lang][key];
  });
  if (languageSelect) languageSelect.value = lang;
  localStorage.setItem(languageStorageKey, lang);
}
let runtimeConfig = null;

function applyTheme(theme) {
  const dark = theme === "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  applyRuntimeConfig(runtimeConfig, dark ? "dark" : "light");
  if (themeToggle) {
    const themeIcon = themeToggle.querySelector(".theme-icon");
    if (themeIcon) themeIcon.textContent = dark ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", dark ? translations[document.documentElement.lang].light : translations[document.documentElement.lang].dark);
  }
  localStorage.setItem("3b-theme", dark ? "dark" : "light");
}
applyLanguage(savedLanguage);
if (regionSelect) regionSelect.value = activeCountry.region;
applyTheme(savedTheme === "dark" ? "dark" : "light");
if (themeToggle) themeToggle.addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
if (languageSelect) {
  const changeLanguage = () => {
    applyLanguage(languageSelect.value);
    applyTheme(document.documentElement.dataset.theme);
    if (supabase) {
      void renderDynamicRoute(supabase);
      void renderDynamicNavigation(supabase);
    }
  };
  languageSelect.addEventListener("change", changeLanguage);
  languageSelect.addEventListener("input", changeLanguage);
}
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
async function setMenuSession(session) {
  if (profileMenuLink) profileMenuLink.hidden = !session;
  if (loginMenuLink) loginMenuLink.hidden = !!session;
  if (logoutMenuLink) logoutMenuLink.hidden = !session;
  if (dashboardMenuLink) {
    dashboardMenuLink.hidden = true;
    if (session?.user?.id) {
      const { data, error } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", session.user.id).in("role", ["owner", "admin"]).limit(1).maybeSingle();
      if (!error && data?.role) dashboardMenuLink.hidden = false;
    }
  }
}
// Load authentication separately so a Supabase CDN issue cannot disable the menu.
const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
runtimeConfig = await loadRuntimeConfig(supabase);
applyRuntimeConfig(runtimeConfig, document.documentElement.dataset.theme);
void renderDynamicRoute(supabase);
void renderDynamicNavigation(supabase);

async function applyPublicSiteSettings() {
  if (document.querySelector("#owner-dashboard")) return;
  const { data, error } = await supabase
    .from("site_settings")
    .select("setting_value")
    .eq("setting_key", "site_profile")
    .eq("is_public", true)
    .maybeSingle();
  if (error || !data?.setting_value || typeof data.setting_value !== "object") return;
  const settings = data.setting_value;
  const websiteTitle = typeof settings.website_title === "string" && settings.website_title.trim()
    ? settings.website_title.trim() : "3B TECH HUB";
  document.querySelectorAll(".brand-title, .home-hero h1, .home-main h1").forEach((node) => { node.textContent = websiteTitle; });
  document.title = websiteTitle;
  const brand = document.querySelector(".brand");
  if (brand && typeof settings.logo_url === "string" && /^https?:\/\//i.test(settings.logo_url)) {
    const logo = document.createElement("img");
    logo.src = settings.logo_url;
    logo.alt = websiteTitle;
    logo.className = "brand-image";
    brand.replaceChildren(logo);
  }
}

if (logoutMenuLink) logoutMenuLink.addEventListener("click", async () => {
  logoutMenuLink.disabled = true;
  const { error } = await supabase.auth.signOut();
  logoutMenuLink.disabled = false;
  if (!error) {
    setMenuSession(null);
    closeSiteMenu();
    location.assign(new URL("account/", ROOT_URL).href);
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
const ROOT_URL = new URL("https://3btechhub.github.io/3btechhub/");
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
    const recovery = mode === "recovery" || mode === "recovery-link";
    const recoveryLink = mode === "recovery-link";
    submit.textContent = recoveryLink ? "Update Password" : recovery ? "Verify Code & Reset Password" : signup ? "Create Account" : "Login";
    toggle.textContent = signup ? "Login Account" : "Create Account";
    toggle.disabled = recovery;
    forgot.disabled = recovery;
    emailInput.readOnly = mode === "recovery";
    otpInput.hidden = mode !== "recovery";
    otpInput.required = mode === "recovery";
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: new URL("login/?recovery=1", ROOT_URL).href,
      });
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
      if (mode === "recovery-link") {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        await supabase.auth.signOut();
        mode = "login";
        render();
        showMessage("Password updated successfully. You can now log in with your new password.", "success");
      } else if (mode === "recovery") {
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
          options: { emailRedirectTo: new URL("account/", ROOT_URL).href },
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
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY" && session) {
      mode = "recovery-link";
      recoveryEmail = session.user.email || "";
      emailInput.value = recoveryEmail;
      emailInput.readOnly = true;
      otpInput.value = "";
      passwordInput.value = "";
      render();
      showMessage("Enter your new password to finish resetting your account.", "success");
    }
  });
}

const profile = document.querySelector("#profile-card");
if (profile) {
  const status = document.querySelector("#profile-message");
  const form = document.querySelector("#profile-edit-form");
  const saveButton = document.querySelector("#profile-save");
  const fields = {
    name: document.querySelector("#profile-name"),
    email: document.querySelector("#profile-email"),
    phone: document.querySelector("#profile-phone"),
  };
  let currentUser = null;
  let currentPhone = "";

  function profileMessage(text, kind = "") {
    status.textContent = text;
    status.dataset.kind = kind;
  }
  function setProfileValue(key, value, placeholder) {
    const field = fields[key];
    const hasValue = Boolean(String(value || "").trim());
    field.textContent = hasValue ? value : placeholder;
    field.classList.toggle("is-placeholder", !hasValue);
  }
  function enableInlineEdit(button) {
    const key = button.dataset.editField;
    const field = fields[key];
    if (!field) return;
    const original = key === "name"
      ? (currentUser.user_metadata?.display_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "")
      : key === "email" ? (currentUser.email || "") : currentPhone;
    field.textContent = original;
    field.contentEditable = "true";
    field.classList.add("is-editing");
    button.dataset.saving = "true";
    button.textContent = "Save";
    field.focus();
    profileMessage("");
  }
  profile.querySelectorAll("[data-edit-field]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.saving === "true") {
        form.requestSubmit();
        return;
      }
      enableInlineEdit(button);
    });
  });
  document.querySelector("#profile-password-edit").addEventListener("click", (event) => {
    const fieldsBox = document.querySelector("#profile-password-fields");
    const button = event.currentTarget;
    if (button.dataset.saving === "true") {
      form.requestSubmit();
      return;
    }
    fieldsBox.hidden = false;
    button.dataset.saving = "true";
    button.textContent = "Save";
    form.elements.currentPassword.focus();
  });

  async function loadProfile() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      location.replace(new URL("account/", ROOT_URL).href);
      return;
    }
    currentUser = data.user;
    const name = currentUser.user_metadata?.display_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "";
    setProfileValue("name", name, "Name");
    setProfileValue("email", currentUser.email || "", "Email");
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles").select("phone").eq("user_id", currentUser.id).maybeSingle();
    if (profileError) {
      profileMessage("Could not load your phone number. Please refresh and try again.", "error");
    } else {
      currentPhone = profileData?.phone || "";
      setProfileValue("phone", currentPhone, "Phone Number");
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    saveButton.disabled = true;
    profileMessage("Saving…");
    try {
      const data = new FormData(form);
      const name = fields.name.contentEditable === "true" ? fields.name.textContent.trim() : (currentUser.user_metadata?.display_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "");
      const email = fields.email.contentEditable === "true" ? fields.email.textContent.trim().toLowerCase() : (currentUser.email || "");
      const phone = fields.phone.contentEditable === "true" ? fields.phone.textContent.trim() : currentPhone;
      const currentPassword = String(data.get("currentPassword") || "");
      const newPassword = String(data.get("newPassword") || "");
      const confirmPassword = String(data.get("confirmPassword") || "");

      if (!email) throw new Error("Enter your email address.");
      if (phone && !/^\+?[0-9() .-]{7,24}$/.test(phone)) throw new Error("Enter a valid phone number.");
      if (newPassword) {
        if (newPassword.length < 8) throw new Error("New password must be at least 8 characters.");
        if (newPassword !== confirmPassword) throw new Error("New passwords do not match.");
        if (!currentPassword) throw new Error("Enter your current password to change it.");
        const { error: verifyError } = await supabase.auth.signInWithPassword({ email: currentUser.email, password: currentPassword });
        if (verifyError) throw new Error("Current password is incorrect.");
      } else if (confirmPassword || currentPassword) {
        throw new Error("To change password, enter current password, new password, and confirmation.");
      }

      const { data: nameData, error: nameError } = await supabase.auth.updateUser({
        data: { ...(currentUser.user_metadata || {}), display_name: name || null },
      });
      if (nameError) throw nameError;
      currentUser = nameData.user;

      const { error: phoneError } = await supabase.from("user_profiles").upsert(
        { user_id: currentUser.id, phone: phone || null },
        { onConflict: "user_id" },
      );
      if (phoneError) throw phoneError;
      currentPhone = phone;

      let emailPending = false;
      if (email !== currentUser.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
        emailPending = true;
      }
      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
        if (passwordError) throw passwordError;
      }

      form.querySelectorAll("[data-profile-field]").forEach((field) => {
        field.contentEditable = "false";
        field.classList.remove("is-editing");
        const editButton = field.closest(".profile-row").querySelector("[data-edit-field]");
        editButton.dataset.saving = "false";
        editButton.textContent = "Edit";
      });
      document.querySelector("#profile-password-fields").hidden = true;
      const passwordEditButton = document.querySelector("#profile-password-edit");
      passwordEditButton.dataset.saving = "false";
      passwordEditButton.textContent = "Edit";
      form.reset();
      await loadProfile();
      profileMessage(
        emailPending
          ? "Profile saved. A confirmation link has been sent to your new email address."
          : newPassword
            ? "Profile and password saved successfully."
            : "Profile saved successfully.",
        "success",
      );
    } catch (error) {
      profileMessage(error instanceof Error ? error.message : "Could not save changes. Please try again.", "error");
    } finally {
      saveButton.disabled = false;
    }
  });

  await loadProfile();
  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) location.replace(new URL("account/", ROOT_URL).href);
  });
  window.addEventListener("pagehide", () => authListener.subscription.unsubscribe(), { once: true });
}


// Owner-only dashboard: the database role is checked again on the page itself.
let currentDashboardRole = null;
const ownerDashboard = document.querySelector("#owner-dashboard");
if (ownerDashboard) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    location.replace(new URL("account/", ROOT_URL).href);
  } else {
    const { data: ownerRole, error: roleError } = await supabase
      .from("user_roles").select("role")
      .eq("user_id", authData.user.id).in("role", ["owner", "admin"]).limit(1).maybeSingle();
    if (roleError || !["owner", "admin"].includes(ownerRole?.role)) {
      location.replace(new URL("profile/", ROOT_URL).href);
    } else {
      currentDashboardRole = ownerRole.role;
      if (currentDashboardRole !== "owner") {
        for (const moduleName of ["user", "role", "permission", "settings"]) {
          document.querySelector(`[data-dashboard-tab="${moduleName}"]`)?.remove();
          document.querySelector(`[data-dashboard-panel="${moduleName}"]`)?.remove();
        }
      }
      const ownerEmail = document.querySelector("#dashboard-owner-email");
      if (ownerEmail) ownerEmail.textContent = authData.user.email || "";
      const resources = [
        ["pages", "dashboard-pages-count"],
        ["user_roles", "dashboard-users-count"],
        ["audit_logs", "dashboard-audit-count"],
        ["site_settings", "dashboard-settings-count"],
      ];
      const results = await Promise.all(resources.map(async ([table, target]) => {
        const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
        const element = document.getElementById(target);
        if (element) element.textContent = error ? "—" : String(count ?? 0);
        return !error;
      }));
    }
  }
  supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) location.replace(new URL("account/", ROOT_URL).href);
  });
}


// Owner-only user administration is performed by a JWT-verified Supabase Edge Function.
const userInviteForm = document.querySelector("#user-invite-form");
const userItems = document.querySelector("#user-admin-items");
const userMessage = document.querySelector("#user-message");
const roleSummaryList = document.querySelector("#role-summary-list");
const userRefreshButton = document.querySelector("#user-refresh");

async function callOwnerUsers(payload) {
  const { data, error } = await supabase.functions.invoke("owner-users", { body: payload });
  if (error) throw new Error(error.message || "User administration request failed.");
  if (data?.error) throw new Error(data.error);
  return data;
}

function renderRoleSummary(users) {
  if (!roleSummaryList) return;
  roleSummaryList.replaceChildren();
  const roles = ["owner", "admin", "member", "visitor"];
  for (const role of roles) {
    const row = document.createElement("article");
    row.className = "admin-list-row";
    const count = users.filter((user) => user.role === role).length;
    addTextElement(row, "strong", "", role.charAt(0).toUpperCase() + role.slice(1));
    addTextElement(row, "span", "", String(count) + (count === 1 ? " account" : " accounts"));
    roleSummaryList.append(row);
  }
}

function renderUserList(users) {
  if (!userItems) return;
  userItems.replaceChildren();
  if (!users.length) {
    addTextElement(userItems, "p", "muted", "No accounts found.");
    return;
  }

  const roles = ["member", "admin"];
  for (const user of users) {
    const row = document.createElement("article");
    row.className = "admin-list-row";
    const primary = document.createElement("div");
    addTextElement(primary, "strong", "", user.email || "Unknown email");
    const blocked = Boolean(user.banned_until && new Date(user.banned_until).getTime() > Date.now());
    const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Never signed in";
    addTextElement(primary, "span", "muted", [
      user.role === "owner" ? "Owner" : (user.role || "Member"),
      blocked ? "Blocked" : "Active",
      "Last sign-in: " + lastSignIn,
    ].join(" · "));
    row.append(primary);

    const actions = document.createElement("div");
    actions.className = "editor-actions";
    const roleSelect = document.createElement("select");
    roleSelect.setAttribute("aria-label", "Role for " + (user.email || user.id));
    const ownerOption = document.createElement("option");
    ownerOption.value = "owner";
    ownerOption.textContent = "Owner";
    ownerOption.disabled = true;
    roleSelect.append(ownerOption);
    for (const role of roles) {
      const option = document.createElement("option");
      option.value = role;
      option.textContent = role.charAt(0).toUpperCase() + role.slice(1);
      roleSelect.append(option);
    }
    roleSelect.value = user.role || "member";
    roleSelect.disabled = user.role === "owner";
    actions.append(roleSelect);

    const saveRole = document.createElement("button");
    saveRole.type = "button";
    saveRole.textContent = "Save Role";
    saveRole.disabled = user.role === "owner";
    saveRole.addEventListener("click", async () => {
      saveRole.disabled = true;
      try {
        await callOwnerUsers({ action: "set-role", userId: user.id, role: roleSelect.value });
        if (userMessage) userMessage.textContent = "Role updated for " + user.email + ".";
        await loadOwnerUsers();
      } catch (error) {
        if (userMessage) userMessage.textContent = error.message || "Could not update role.";
      } finally {
        saveRole.disabled = user.role === "owner";
      }
    });
    actions.append(saveRole);

    const statusButton = document.createElement("button");
    statusButton.type = "button";
    statusButton.className = "secondary-button";
    statusButton.textContent = blocked ? "Unblock" : "Block";
    statusButton.disabled = user.role === "owner";
    statusButton.addEventListener("click", async () => {
      statusButton.disabled = true;
      try {
        await callOwnerUsers({ action: "set-status", userId: user.id, blocked: !blocked });
        if (userMessage) userMessage.textContent = user.email + (blocked ? " has been unblocked." : " has been blocked.");
        await loadOwnerUsers();
      } catch (error) {
        if (userMessage) userMessage.textContent = error.message || "Could not change account status.";
      } finally {
        statusButton.disabled = user.role === "owner";
      }
    });
    actions.append(statusButton);

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "secondary-button";
    resetButton.textContent = "Send Password Reset";
    resetButton.disabled = user.role === "owner";
    resetButton.addEventListener("click", async () => {
      resetButton.disabled = true;
      try {
        await callOwnerUsers({ action: "reset-password", userId: user.id });
        if (userMessage) userMessage.textContent = "Password reset email sent to " + user.email + ".";
      } catch (error) {
        if (userMessage) userMessage.textContent = error.message || "Could not send password reset.";
      } finally {
        resetButton.disabled = user.role === "owner";
      }
    });
    actions.append(resetButton);
    row.append(actions);
    userItems.append(row);
  }
}

async function loadOwnerUsers() {
  if (!ownerDashboard || currentDashboardRole !== "owner" || !userItems) return;
  if (userMessage) userMessage.textContent = "Loading users…";
  try {
    const result = await callOwnerUsers({ action: "list", page: 1, perPage: 50 });
    const users = Array.isArray(result.users) ? result.users : [];
    renderUserList(users);
    renderRoleSummary(users);
    const count = document.querySelector("#dashboard-users-count");
    if (count) count.textContent = String(result.total ?? users.length);
    if (userMessage) userMessage.textContent = "Showing " + users.length + " of " + (result.total ?? users.length) + " accounts.";
  } catch (error) {
    if (userMessage) userMessage.textContent = error.message || "Could not load users.";
    if (userItems) userItems.replaceChildren();
  }
}

if (userInviteForm) {
  userInviteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = document.querySelector("#user-invite-submit");
    const form = new FormData(userInviteForm);
    const email = String(form.get("email") || "").trim();
    const role = String(form.get("role") || "member");
    if (submit) submit.disabled = true;
    if (userMessage) userMessage.textContent = "Sending invitation…";
    try {
      await callOwnerUsers({ action: "invite", email, role });
      userInviteForm.reset();
      if (userMessage) userMessage.textContent = "Invitation sent to " + email + ".";
      await loadOwnerUsers();
    } catch (error) {
      if (userMessage) userMessage.textContent = error.message || "Could not invite user.";
    } finally {
      if (submit) submit.disabled = false;
    }
  });
}
if (userRefreshButton) userRefreshButton.addEventListener("click", () => void loadOwnerUsers());
if (ownerDashboard && userItems) void loadOwnerUsers();

// Owner-only website profile settings stored as a single public configuration record.
const siteSettingsForm = document.querySelector("#site-settings-form");
const siteSettingsMessage = document.querySelector("#site-settings-message");

async function loadSiteSettingsForm() {
  if (!siteSettingsForm || currentDashboardRole !== "owner") return;
  if (siteSettingsMessage) siteSettingsMessage.textContent = "Loading website settings…";
  const { data, error } = await supabase
    .from("site_settings")
    .select("setting_value")
    .eq("setting_key", "site_profile")
    .maybeSingle();
  if (error) {
    if (siteSettingsMessage) siteSettingsMessage.textContent = error.message || "Could not load website settings.";
    return;
  }
  const settings = data?.setting_value && typeof data.setting_value === "object" ? data.setting_value : {};
  siteSettingsForm.elements.website_title.value = typeof settings.website_title === "string" ? settings.website_title : "3B TECH HUB";
  siteSettingsForm.elements.logo_url.value = typeof settings.logo_url === "string" ? settings.logo_url : "";
  
  if (siteSettingsMessage) siteSettingsMessage.textContent = "Website settings loaded.";
}

if (siteSettingsForm) {
  siteSettingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (currentDashboardRole !== "owner") {
      if (siteSettingsMessage) siteSettingsMessage.textContent = "Owner permission required.";
      return;
    }
    const submit = document.querySelector("#site-settings-save");
    const form = new FormData(siteSettingsForm);
    const websiteTitle = String(form.get("website_title") || "").trim() || "3B TECH HUB";
    const logoUrl = String(form.get("logo_url") || "").trim();
    if (logoUrl) {
      try { if (!["https:", "http:"].includes(new URL(logoUrl).protocol)) throw new Error("Invalid URL"); }
      catch { if (siteSettingsMessage) siteSettingsMessage.textContent = "Logo URL must be a valid HTTP(S) address."; return; }
    }
    if (submit) submit.disabled = true;
    if (siteSettingsMessage) siteSettingsMessage.textContent = "Saving website settings…";
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error("Your session has expired. Sign in again.");
      const settingValue = { website_title: websiteTitle, logo_url: logoUrl };
      const { error } = await supabase.from("site_settings").upsert({
        setting_key: "site_profile",
        setting_value: settingValue,
        is_public: true,
        updated_by: authData.user.id,
      }, { onConflict: "setting_key" });
      if (error) throw error;
      if (siteSettingsMessage) siteSettingsMessage.textContent = "Website settings saved.";
    } catch (error) {
      if (siteSettingsMessage) siteSettingsMessage.textContent = error.message || "Could not save website settings.";
    } finally {
      if (submit) submit.disabled = false;
    }
  });
}
if (siteSettingsForm) void loadSiteSettingsForm();

// Dashboard module tabs: all modules stay on one horizontal row.
const dashboardTabs = Array.from(document.querySelectorAll("[data-dashboard-tab]"));
const dashboardPanels = Array.from(document.querySelectorAll("[data-dashboard-panel]"));
function activateDashboardModule(moduleName, focusTab = false) {
  dashboardTabs.forEach((tab) => {
    const active = tab.dataset.dashboardTab === moduleName;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && focusTab) tab.focus();
  });
  dashboardPanels.forEach((panel) => {
    const active = panel.dataset.dashboardPanel === moduleName;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });
}
dashboardTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateDashboardModule(tab.dataset.dashboardTab));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? dashboardTabs.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + dashboardTabs.length) % dashboardTabs.length;
    activateDashboardModule(dashboardTabs[nextIndex].dataset.dashboardTab, true);
  });
});




// Audit module: read-only recent administrative activity.
const auditList = document.querySelector("#audit-log-list");
async function loadAuditLogs() {
  if (!auditList || !["owner", "admin"].includes(currentDashboardRole)) return;
  auditList.replaceChildren();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id,action,resource_type,resource_id,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    addTextElement(auditList, "p", "muted", "Audit history is temporarily unavailable.");
    return;
  }
  if (!data?.length) {
    addTextElement(auditList, "p", "muted", "No audit events recorded yet.");
    return;
  }
  for (const entry of data) {
    const row = document.createElement("article");
    row.className = "admin-list-row";
    const title = [entry.action, entry.resource_type].filter(Boolean).join(" · ");
    addTextElement(row, "strong", "", title || "Activity");
    const detail = [entry.resource_id ? "ID: " + entry.resource_id : "", entry.created_at ? new Date(entry.created_at).toLocaleString() : ""].filter(Boolean).join(" · ");
    addTextElement(row, "span", "muted", detail);
    auditList.append(row);
  }
}
document.querySelector('[data-dashboard-tab="audit"]')?.addEventListener("click", () => void loadAuditLogs());
document.querySelector("#audit-refresh")?.addEventListener("click", () => void loadAuditLogs());
