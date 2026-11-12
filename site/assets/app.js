import { filterProductsForRegion, getNextVisibleCount } from "./product-catalog.js";
import { applyRuntimeConfig, loadRuntimeConfig } from "./runtime-config.js";
import { renderDynamicRoute } from "./dynamic-page-router.js";
import { renderDynamicNavigation } from "./dynamic-navigation.js";

await window.countryContextReady;

// Make country context available before the rest of the application runs.
const activeCountry = window.siteCountry;
const currentPath = window.location.pathname;
const serviceCountryRules = {
  "tv-repair": "bd",
  "mobile-repair": "bd",
  "mobile-parts-sell": "bd",
  "satellite-dish-installation": "saudi",
  "satellite-dish-servicing": "saudi",
  "satellite-dish-parts-sell": "saudi"
};
const servicePrefix = "/3btechhub/services/";
if (currentPath.startsWith(servicePrefix)) {
  const serviceSlug = currentPath.slice(servicePrefix.length).split("/")[0];
  if (serviceCountryRules[serviceSlug] && activeCountry.region !== "global" && serviceCountryRules[serviceSlug] !== activeCountry.region) {
    window.location.replace("/3btechhub/" + activeCountry.region + "/");
  }
}
document.querySelectorAll("[data-country-region]").forEach((section) => {
  section.hidden = activeCountry.region !== "global" && section.dataset.countryRegion !== activeCountry.region;
});
const menuButton = document.querySelector(".menu-trigger");
const siteMenu = document.querySelector("#site-menu");
const profileMenuLink = document.querySelector("#profile-menu-link");
const dashboardMenuLink = document.querySelector("#dashboard-menu-link");
const themeToggle = document.querySelector("#theme-toggle");
const languageSelect = document.querySelector("#language-select");
const regionSelect = document.querySelector("#region-select");
const savedTheme = localStorage.getItem("3b-theme");
const routeDefaultLanguage = activeCountry.region === "bd" ? "bn" : activeCountry.region === "saudi" ? "ar" : "en";
const languageStorageKey = "3b-language-" + activeCountry.region;
const savedLanguage = localStorage.getItem(languageStorageKey) || routeDefaultLanguage;
document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
const translations = {
  en: {home:"Home",profile:"Profile",services:"Services",login:"Login",logout:"Logout",dashboard:"Dashboard",accountLogin:"Account login",dark:"Switch to dark mode",light:"Switch to light mode"},
  bn: {home:"হোম",profile:"প্রোফাইল",services:"সার্ভিস",login:"লগইন",logout:"লগআউট",dashboard:"ড্যাশবোর্ড",accountLogin:"অ্যাকাউন্টে লগইন",dark:"ডার্ক মোড চালু করুন",light:"লাইট মোড চালু করুন"},
  ar: {home:"الرئيسية",profile:"الملف الشخصي",services:"الخدمات",login:"تسجيل الدخول",logout:"تسجيل الخروج",dashboard:"لوحة التحكم",accountLogin:"تسجيل الدخول إلى الحساب",dark:"تفعيل الوضع الداكن",light:"تفعيل الوضع الفاتح"}
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
    if (supabase) void renderDynamicNavigation(supabase);
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
  const tagline = document.querySelector(".home-main p");
  if (tagline && typeof settings.tagline === "string" && settings.tagline.trim()) tagline.textContent = settings.tagline;
  const description = document.querySelector('meta[name="description"]');
  if (description && typeof settings.description === "string" && settings.description.trim()) description.content = settings.description;
}
void applyPublicSiteSettings();
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
      location.replace(new URL("login/", ROOT_URL).href);
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
    if (!session) location.replace(new URL("login/", ROOT_URL).href);
  });
  window.addEventListener("pagehide", () => authListener.subscription.unsubscribe(), { once: true });
}


// Owner-only dashboard: the database role is checked again on the page itself.
let currentDashboardRole = null;
const ownerDashboard = document.querySelector("#owner-dashboard");
if (ownerDashboard) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    location.replace(new URL("login/", ROOT_URL).href);
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
        ["site_content", "dashboard-content-count"],
        ["services", "dashboard-services-count"],
        ["products", "dashboard-products-count"],
        ["user_roles", "dashboard-users-count"],
        ["media_assets", "dashboard-media-count"],
        ["site_settings", "dashboard-settings-count"],
        ["audit_logs", "dashboard-audit-count"],
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
    if (!session) location.replace(new URL("login/", ROOT_URL).href);
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
  const roles = ["owner", "admin", "manager", "editor", "staff", "customer"];
  for (const role of roles) {
    const row = document.createElement("article");
    row.className = "technician-admin-row";
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

  const roles = ["customer", "staff", "editor", "manager", "admin"];
  for (const user of users) {
    const row = document.createElement("article");
    row.className = "technician-admin-row";
    const primary = document.createElement("div");
    addTextElement(primary, "strong", "", user.email || "Unknown email");
    const blocked = Boolean(user.banned_until && new Date(user.banned_until).getTime() > Date.now());
    const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Never signed in";
    addTextElement(primary, "span", "muted", [
      user.role === "owner" ? "Owner" : (user.role || "Customer"),
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
    roleSelect.value = user.role || "customer";
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
    const role = String(form.get("role") || "customer");
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

// Owner-only Media Library for public catalogue images in Supabase Storage.
const mediaUploadForm = document.querySelector("#media-upload-form");
const mediaItems = document.querySelector("#media-admin-items");
const mediaSearch = document.querySelector("#media-search");
const mediaTypeFilter = document.querySelector("#media-type-filter");
const mediaDateFilter = document.querySelector("#media-date-filter");
const mediaMessage = document.querySelector("#media-message");
let mediaAssetData = [];

function getMediaPublicUrl(item) {
  return supabase.storage.from("site-media").getPublicUrl(item.storage_path).data.publicUrl;
}

function renderMediaAssets() {
  if (!mediaItems) return;
  mediaItems.replaceChildren();
  const search = String(mediaSearch?.value || "").trim().toLowerCase();
  const type = String(mediaTypeFilter?.value || "all");
  const days = String(mediaDateFilter?.value || "all");
  const cutoff = days === "all" ? 0 : Date.now() - Number(days) * 24 * 60 * 60 * 1000;
  const visible = mediaAssetData.filter((item) => {
    const matchesSearch = !search || String(item.file_name || "").toLowerCase().includes(search);
    const matchesType = type === "all" || item.content_type === type;
    const matchesDate = !cutoff || new Date(item.created_at).getTime() >= cutoff;
    return matchesSearch && matchesType && matchesDate;
  });
  if (!visible.length) {
    addTextElement(mediaItems, "p", "muted", mediaAssetData.length ? "No matching images." : "No images uploaded yet.");
    return;
  }

  for (const item of visible) {
    const row = document.createElement("article");
    row.className = "technician-admin-row";
    const image = document.createElement("img");
    image.className = "technician-detail-photo";
    image.src = getMediaPublicUrl(item);
    image.alt = item.alt_text || item.file_name || "Media image";
    image.loading = "lazy";
    row.append(image);

    const details = document.createElement("div");
    addTextElement(details, "strong", "", item.file_name || "Untitled image");
    addTextElement(details, "span", "muted", [
      item.content_type || "Image",
      (Number(item.size_bytes || 0) / 1024).toFixed(1) + " KB",
      item.created_at ? new Date(item.created_at).toLocaleDateString() : "",
    ].filter(Boolean).join(" · "));
    const fileNameInput = document.createElement("input");
    fileNameInput.type = "text";
    fileNameInput.maxLength = 255;
    fileNameInput.value = item.file_name || "";
    fileNameInput.setAttribute("aria-label", "File name for " + item.file_name);
    details.append(fileNameInput);
    const altInput = document.createElement("input");
    altInput.type = "text";
    altInput.maxLength = 250;
    altInput.value = item.alt_text || "";
    altInput.setAttribute("aria-label", "Alternative text for " + item.file_name);
    details.append(altInput);
    row.append(details);

    const actions = document.createElement("div");
    actions.className = "editor-actions";
    const save = document.createElement("button");
    save.type = "button";
    save.textContent = "Save Alt Text";
    save.addEventListener("click", async () => {
      save.disabled = true;
      try {
        const fileName = fileNameInput.value.trim().slice(0, 255);
        if (!fileName) throw new Error("File name is required.");
        const changes = { file_name: fileName, alt_text: altInput.value.trim() };
        if (item.id) {
          const { error } = await supabase.from("media_assets").update(changes).eq("id", item.id);
          if (error) throw error;
        } else {
          const { data: authData, error: authError } = await supabase.auth.getUser();
          if (authError || !authData.user) throw new Error("Your session has expired. Sign in again.");
          const { data, error } = await supabase.from("media_assets").insert({
            ...changes,
            storage_path: item.storage_path,
            content_type: item.content_type || "application/octet-stream",
            size_bytes: Number(item.size_bytes || 0),
            is_public: true,
            uploaded_by: authData.user.id,
          }).select("id").single();
          if (error) throw error;
          item.id = data.id;
        }
        item.file_name = fileName;
        item.alt_text = altInput.value.trim();
        if (mediaMessage) mediaMessage.textContent = "Media details saved.";
      } catch (error) {
        if (mediaMessage) mediaMessage.textContent = error.message || "Could not update media details.";
      } finally {
        save.disabled = false;
      }
    });
    actions.append(save);

    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "secondary-button";
    copy.textContent = "Copy URL";
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(getMediaPublicUrl(item));
        if (mediaMessage) mediaMessage.textContent = "Public media URL copied.";
      } catch {
        if (mediaMessage) mediaMessage.textContent = "Clipboard access is unavailable in this browser.";
      }
    });
    actions.append(copy);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "secondary-button";
    remove.textContent = "Delete";
    remove.addEventListener("click", async () => {
      if (!confirm("Delete this image? It will be removed only if no catalogue record uses it.")) return;
      remove.disabled = true;
      try {
        const publicUrl = getMediaPublicUrl(item);
        for (const table of ["products", "services", "workshops", "technicians"]) {
          const { data, error } = await supabase.from(table).select("id").eq("photo_url", publicUrl).limit(1);
          if (error) throw error;
          if (data?.length) throw new Error("This image is still used by " + table + ". Change that record's image before deleting it.");
        }
        const { data: contentRows, error: contentError } = await supabase.from("site_content").select("id,body").limit(100);
        if (contentError) throw contentError;
        const isUsedInContent = (contentRows || []).some((entry) => {
          const serialized = JSON.stringify(entry.body || {});
          return serialized.includes(publicUrl) || serialized.includes(item.storage_path);
        });
        if (isUsedInContent) throw new Error("This image is still used by website content.");
        const { error: storageError } = await supabase.storage.from("site-media").remove([item.storage_path]);
        if (storageError) throw storageError;
        if (item.id) {
          const { error: metadataError } = await supabase.from("media_assets").delete().eq("id", item.id);
          if (metadataError) throw metadataError;
        }
        mediaAssetData = mediaAssetData.filter((entry) => entry.id !== item.id);
        renderMediaAssets();
        if (mediaMessage) mediaMessage.textContent = "Image deleted.";
      } catch (error) {
        if (mediaMessage) mediaMessage.textContent = error.message || "Could not delete image.";
      } finally {
        remove.disabled = false;
      }
    });
    actions.append(remove);
    row.append(actions);
    mediaItems.append(row);
  }
}

async function listMediaStorageFiles(folder = "", depth = 0) {
  if (depth > 5) return [];
  const files = [];
  for (let offset = 0; offset < 1000; offset += 100) {
    const { data, error } = await supabase.storage.from("site-media").list(folder, {
      limit: 100,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    for (const entry of data || []) {
      const path = folder ? folder + "/" + entry.name : entry.name;
      if (!entry.id && !entry.metadata) {
        files.push(...await listMediaStorageFiles(path, depth + 1));
      } else {
        files.push({
          storage_path: path,
          storage_name: entry.name,
          storage_metadata: entry.metadata || {},
          storage_created_at: entry.created_at || null,
        });
      }
    }
    if (!data || data.length < 100) break;
  }
  return files;
}

async function loadMediaAssets() {
  if (!ownerDashboard || !mediaItems) return;
  if (mediaMessage) mediaMessage.textContent = "Loading media…";
  try {
    const [{ data: metadata, error: metadataError }, storageFiles] = await Promise.all([
      supabase.from("media_assets")
        .select("id,storage_path,file_name,content_type,size_bytes,alt_text,is_public,uploaded_by,created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(1000),
      listMediaStorageFiles(),
    ]);
    if (metadataError) throw metadataError;
    const metadataByPath = new Map((metadata || []).map((item) => [item.storage_path, item]));
    mediaAssetData = storageFiles.map((file) => {
      const saved = metadataByPath.get(file.storage_path) || {};
      return {
        ...saved,
        storage_path: file.storage_path,
        file_name: saved.file_name || file.storage_name,
        content_type: saved.content_type || file.storage_metadata.mimetype || "",
        size_bytes: saved.size_bytes ?? file.storage_metadata.size ?? 0,
        alt_text: saved.alt_text || "",
        created_at: saved.created_at || file.storage_created_at,
        is_public: true,
      };
    }).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    renderMediaAssets();
    if (mediaMessage) mediaMessage.textContent = "Showing " + mediaAssetData.length + " media assets.";
  } catch (error) {
    if (mediaMessage) mediaMessage.textContent = error.message || "Could not load Media Library.";
  }
}

if (mediaUploadForm) {
  mediaUploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = document.querySelector("#media-upload-submit");
    const form = new FormData(mediaUploadForm);
    const file = form.get("file");
    const altText = String(form.get("alt_text") || "").trim();
    const extensions = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
      "image/gif": "gif",
    };
    if (!(file instanceof File) || !extensions[file.type]) {
      if (mediaMessage) mediaMessage.textContent = "Choose a supported image file.";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      if (mediaMessage) mediaMessage.textContent = "Image must be 10 MB or smaller.";
      return;
    }
    if (submit) submit.disabled = true;
    if (mediaMessage) mediaMessage.textContent = "Uploading image…";
    const storagePath = "library/" + crypto.randomUUID() + "." + extensions[file.type];
    try {
      const { error: uploadError } = await supabase.storage.from("site-media").upload(storagePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });
      if (uploadError) throw uploadError;
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error("Your session has expired. Sign in again.");
      const { error: metadataError } = await supabase.from("media_assets").insert({
        storage_path: storagePath,
        file_name: file.name.slice(0, 255),
        content_type: file.type,
        size_bytes: file.size,
        alt_text: altText,
        is_public: true,
        uploaded_by: authData.user.id,
      });
      if (metadataError) {
        await supabase.storage.from("site-media").remove([storagePath]);
        throw metadataError;
      }
      mediaUploadForm.reset();
      await loadMediaAssets();
      if (mediaMessage) mediaMessage.textContent = "Image uploaded successfully.";
    } catch (error) {
      if (mediaMessage) mediaMessage.textContent = error.message || "Could not upload image.";
    } finally {
      if (submit) submit.disabled = false;
    }
  });
}
if (mediaSearch) mediaSearch.addEventListener("input", renderMediaAssets);
if (mediaTypeFilter) mediaTypeFilter.addEventListener("change", renderMediaAssets);
if (mediaDateFilter) mediaDateFilter.addEventListener("change", renderMediaAssets);
if (ownerDashboard && mediaItems) void loadMediaAssets();

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
  siteSettingsForm.elements.tagline.value = typeof settings.tagline === "string" ? settings.tagline : "our services and technical support";
  siteSettingsForm.elements.description.value = typeof settings.description === "string" ? settings.description : "Three Brothers Tech Hub — technical services by region.";
  siteSettingsForm.elements.contact_email.value = typeof settings.contact_email === "string" ? settings.contact_email : "";
  siteSettingsForm.elements.contact_phone.value = typeof settings.contact_phone === "string" ? settings.contact_phone : "";
  siteSettingsForm.elements.whatsapp_url.value = typeof settings.whatsapp_url === "string" ? settings.whatsapp_url : "";
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
    const tagline = String(form.get("tagline") || "").trim();
    const description = String(form.get("description") || "").trim();
    const contactEmail = String(form.get("contact_email") || "").trim();
    const contactPhone = String(form.get("contact_phone") || "").trim();
    const whatsappUrl = String(form.get("whatsapp_url") || "").trim();
    if (!tagline) {
      if (siteSettingsMessage) siteSettingsMessage.textContent = "Homepage tagline is required.";
      return;
    }
    if (whatsappUrl) {
      try {
        if (new URL(whatsappUrl).protocol !== "https:") throw new Error("HTTPS required");
      } catch {
        if (siteSettingsMessage) siteSettingsMessage.textContent = "WhatsApp URL must be a valid HTTPS address.";
        return;
      }
    }
    if (submit) submit.disabled = true;
    if (siteSettingsMessage) siteSettingsMessage.textContent = "Saving website settings…";
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error("Your session has expired. Sign in again.");
      const settingValue = {
        tagline,
        description,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        whatsapp_url: whatsappUrl,
      };
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


// Homepage workshop and technician content, managed from the owner dashboard.
const homepageTechnicians = document.querySelector("#technicians-section");
const homepageWorkshops = document.querySelector("#workshops-section");
const homepageProducts = document.querySelector("#products-section");
function safeExternalLink(value) {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : ""; }
  catch { return ""; }
}
function addTextElement(parent, tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = value || "";
  parent.append(node);
  return node;
}
function appendSectionNav(parent) {
  const nav = document.createElement("nav");
  nav.className = "section-explore-nav";
  nav.setAttribute("aria-label", "Explore other sections");
  for (const [label, path] of [["Services","services/"],["Products","products/"],["Workshop","workshop/"],["Technicians","technicians/"]]) {
    const link = document.createElement("a");
    link.href = ROOT_URL.href + path;
    link.textContent = label;
    nav.append(link);
  }
  parent.append(nav);
}
function detailLayout(target, item, title, fields) {
  target.replaceChildren();
  const wrap = document.createElement("article");
  wrap.className = "catalogue-detail";
  if (item.photo_url) {
    const image = document.createElement("img");
    image.src = item.photo_url;
    image.alt = title;
    image.className = "catalogue-detail-image";
    wrap.append(image);
  }
  addTextElement(wrap, "h1", "", title);
  for (const [label, value] of fields) {
    if (!value) continue;
    const row = document.createElement("p");
    row.className = "catalogue-detail-field";
    const strong = document.createElement("strong");
    strong.textContent = label + ": ";
    row.append(strong, document.createTextNode(String(value)));
    wrap.append(row);
  }
  const back = document.createElement("a");
  back.className = "service-back-link";
  back.href = location.pathname.replace(/\/+$/, "") + "/";
  back.textContent = "Explore all";
  wrap.append(back);
  target.append(wrap);
}
function itemLink(section, id) {
  return ROOT_URL.href + section + "/?id=" + encodeURIComponent(id);
}
function makeIdentityCard({section, title, subtitle, photo, placeholder, className}) {
  const link = document.createElement("a");
  link.className = className;
  link.href = itemLink(section, arguments[0].id);
  if (photo) {
    const image = document.createElement("img");
    image.src = photo;
    image.alt = "";
    image.loading = "lazy";
    link.append(image);
  } else {
    const icon = document.createElement("span");
    icon.className = placeholder;
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = arguments[0].icon || "👤";
    link.append(icon);
  }
  const info = document.createElement("span");
  info.className = "technician-card-info";
  addTextElement(info, "strong", "", title);
  if (subtitle) addTextElement(info, "small", "technician-specialty", subtitle);
  addTextElement(info, "small", "technician-card-hint", "View details");
  link.append(info);
  return link;
}
function renderTechnicians(items) {
  const target = document.querySelector("#technicians-list");
  if (!target || !Array.isArray(items)) return;
  const visible = items.filter(item => item && item.name && item.is_published !== false && (activeCountry.region === "global" || (!item.country || item.country === "global" || item.country === activeCountry.region)));
  const selectedId = new URLSearchParams(location.search).get("id");
  if (selectedId) {
    const item = visible.find(entry => String(entry.id) === selectedId);
    if (item) detailLayout(target, item, item.name, [["Specialty", item.category], ["About", item.description], ["Phone", item.phone], ["WhatsApp", item.whatsapp]]);
    else addTextElement(target, "p", "muted", "This technician is unavailable.");
    return;
  }
  target.replaceChildren();
  visible.forEach(item => target.append(makeIdentityCard({section:"technicians",id:item.id,title:item.name,subtitle:item.category,photo:item.photo_url,placeholder:"technician-card-placeholder",icon:"👤",className:"technician-card"})));
  if (target.children.length && homepageTechnicians) homepageTechnicians.hidden = false;
}
function renderWorkshops(items) {
  const target = document.querySelector("#workshops-list");
  if (!target || !Array.isArray(items)) return;
  const visible = items.filter(item => item && item.title && item.status === "published" && (activeCountry.region === "global" || (!item.country || item.country === "global" || item.country === activeCountry.region)));
  const selectedId = new URLSearchParams(location.search).get("id");
  if (selectedId) {
    const item = visible.find(entry => String(entry.id) === selectedId);
    if (item) detailLayout(target, item, item.title, [["Category", item.category], ["Description", item.description], ["Location", item.location]]);
    else addTextElement(target, "p", "muted", "This workshop is unavailable.");
    return;
  }
  target.replaceChildren();
  visible.forEach(item => target.append(makeIdentityCard({section:"workshop",id:item.id,title:item.title,subtitle:item.category || item.location,photo:item.photo_url,placeholder:"workshop-card-placeholder",icon:"🛠️",className:"workshop-card"})));
  if (target.children.length && homepageWorkshops) homepageWorkshops.hidden = false;
}
function renderProducts(items) {
  const target = document.querySelector("#products-list");
  if (!target || !Array.isArray(items)) return;
  const groupTitles = {mobile:"Mobile & Accessories",satellite:"Satellite & TV Equipment"};
  const visible = filterProductsForRegion(items.filter(item => item && item.status === "active"), activeCountry.region);
  const selectedId = new URLSearchParams(location.search).get("id");
  if (selectedId) {
    const item = visible.find(entry => String(entry.id) === selectedId);
    if (item) detailLayout(target, item, item.name, [["Group", groupTitles[item.category_group] || item.category || "Other Products"], ["Description", item.description]]);
    else addTextElement(target, "p", "muted", "This product type is unavailable.");
    return;
  }
  target.replaceChildren();
  const isHome = Boolean(homepageProducts && !document.querySelector("[data-section-page='products']"));
  let visibleCount = isHome ? 4 : visible.length;
  visible.forEach((item,index) => {
    const group = groupTitles[item.category_group] || item.category || "Other Products";
    const card = makeIdentityCard({section:"products",id:item.id,title:item.name,subtitle:group,photo:item.photo_url,placeholder:"technician-card-placeholder",icon:item.category_group === "satellite" ? "📡" : "📱",className:"technician-card"});
    if (isHome) card.hidden = index >= visibleCount;
    target.append(card);
  });
  if (isHome && visible.length > 4) {
    const moreButton = document.createElement("button");
    moreButton.type = "button";
    moreButton.className = "product-more-button";
    moreButton.textContent = "More";
    moreButton.addEventListener("click", () => {
      visibleCount = getNextVisibleCount(visibleCount, visible.length, 4);
      target.querySelectorAll(".technician-card").forEach((card,index) => { card.hidden = index >= visibleCount; });
      if (visibleCount >= visible.length) moreButton.remove();
    });
    target.append(moreButton);
  }
  if (target.querySelector(".technician-card") && homepageProducts) homepageProducts.hidden = false;
  else if (homepageProducts) homepageProducts.hidden = true;
}

async function loadPublicServices() {
  if (!currentPath.includes("/services/")) return;
  const { data, error } = await supabase.from("services").select("slug,name,description,category,country,photo_url").eq("status","active").order("name");
  if (error) { console.warn("Service content unavailable:", error.message); return; }
  const services = data || [];
  const listing = document.querySelector(".services-index");
  if (listing) {
    listing.querySelectorAll(".service-country").forEach(section => {
      const region = section.dataset.countryRegion;
      const grid = section.querySelector(".service-card-grid");
      if (!grid) return;
      grid.replaceChildren();
      services.filter(item => !item.country || item.country === "global" || item.country === region).forEach(item => {
        const link = document.createElement("a"); link.className = "service-card"; link.href = ROOT_URL.href + "services/" + item.slug + "/";
        if (item.photo_url) { const img=document.createElement("img"); img.src=item.photo_url; img.alt=""; img.loading="lazy"; img.className="service-card-image"; link.append(img); }
        else { const icon=document.createElement("span"); icon.className="service-icon"; icon.setAttribute("aria-hidden","true"); icon.textContent="🛠️"; link.append(icon); }
        const info=document.createElement("span"); const title=document.createElement("strong"); title.textContent=item.name; info.append(title);
        if(item.description){const desc=document.createElement("small");desc.textContent=item.description;info.append(desc);}
        if(item.category){const cat=document.createElement("small");cat.textContent=item.category;info.append(cat);}
        link.append(info); const arrow=document.createElement("span");arrow.className="service-arrow";arrow.setAttribute("aria-hidden","true");arrow.textContent="↗";link.append(arrow);grid.append(link);
      });
      section.hidden = grid.children.length === 0;
    });
    return;
  }
  const detail = document.querySelector(".service-detail-main");
  if (detail) {
    const slug = currentPath.split("/").filter(Boolean).pop();
    const item = services.find(service => service.slug === slug);
    if (!item) return;
    detail.replaceChildren();
    addTextElement(detail,"h1","",item.name);
    if(item.description)addTextElement(detail,"p","",item.description);
    if(item.category)addTextElement(detail,"p","service-detail-category",item.category);
    if(item.photo_url){const img=document.createElement("img");img.src=item.photo_url;img.alt=item.name;img.className="service-detail-image";detail.append(img);}
    const back=document.createElement("a");back.className="service-back-link";back.href=ROOT_URL.href + "services/";back.textContent="Explore all services";detail.append(back);appendSectionNav(detail);
  }
}
loadPublicServices();

async function loadHomepageIdentity() {
  if (!homepageTechnicians && !homepageWorkshops && !homepageProducts && !document.querySelector("[data-section-page]")) return;
  const [{ data: technicians, error: techniciansError }, { data: workshops, error: workshopsError }, { data: products, error: productsError }] = await Promise.all([
    supabase.from("technicians").select("*").eq("is_published", true).order("created_at", { ascending: false }),
    supabase.from("workshops").select("*").eq("status", "published").order("created_at", { ascending: false }),
    supabase.from("products").select("*").eq("status", "active").order("updated_at", { ascending: false })
  ]);
  if (techniciansError) console.warn("Homepage technician content unavailable:", techniciansError.message);
  else renderTechnicians(technicians || []);
  if (workshopsError) console.warn("Homepage workshop content unavailable:", workshopsError.message);
  else renderWorkshops(workshops || []);
  if (productsError) console.warn("Homepage product content unavailable:", productsError.message);
  else renderProducts(products || []);
}
loadHomepageIdentity();

// Owner-only Workshop and Technician editors.
const workshopEditor=document.querySelector("#workshop-form");
const technicianEditor=document.querySelector("#technician-form");
const productEditor=document.querySelector("#product-form");
const serviceEditor=document.querySelector("#service-form");
if(ownerDashboard && (workshopEditor || technicianEditor || productEditor || serviceEditor)) {
  const technicianMessage=document.querySelector("#technician-message");
  const technicianItems=document.querySelector("#technician-admin-items");
  const technicianPhotoPreview=document.querySelector("#technician-photo-preview");
  let technicianData=[];
  let technicianPhotoUrl="";
  let workshopData=[];
  let workshopPhotoUrl="";
  let productData=[];
  let productPhotoUrl="";
  let serviceData=[];
  let servicePhotoUrl="";
  const workshopMessage=document.querySelector("#workshop-message");
  const workshopItems=document.querySelector("#workshop-admin-items");
  const workshopPhotoPreview=document.querySelector("#workshop-photo-preview");
  const productMessage=document.querySelector("#product-message");
  const productItems=document.querySelector("#product-admin-items");
  const productPhotoPreview=document.querySelector("#product-photo-preview");
  const serviceMessage=document.querySelector("#service-message");
  const serviceItems=document.querySelector("#service-admin-items");
  const servicePhotoPreview=document.querySelector("#service-photo-preview");
  const editorMessage=(node,message,isError=false)=>{if(!node)return;node.textContent=message;node.dataset.kind=isError?"error":"success";};
  async function saveSetting(key,value){
    const {data:userData}=await supabase.auth.getUser();
    const {error}=await supabase.from("site_settings").upsert({setting_key:key,setting_value:value,is_public:true,updated_by:userData.user?.id||null,updated_at:new Date().toISOString()},{onConflict:"setting_key"});
    if(error)throw error;
  }
  async function uploadContentPhoto(file,folder){
    // Browsers return an empty File object when no file was selected.
    // Treat it as no upload so image selection stays optional.
    if(!file || !file.name || file.size===0)return "";
    if(!file.type.startsWith("image/"))throw new Error("Please select an image file.");
    if(file.size>5*1024*1024)throw new Error("Image size must be 5 MB or less.");
    const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
    const path=folder+"/"+crypto.randomUUID()+"."+ext;
    const {error}=await supabase.storage.from("site-media").upload(path,file,{contentType:file.type,upsert:false});
    if(error)throw error;
    return supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;
  }
  function previewImage(container,url){
    if(!container)return;
    container.replaceChildren();
    if(url){const img=document.createElement("img");img.src=url;img.alt="Selected image preview";container.append(img);}
  }
  async function loadIdentityEditors(){
    const [{data:workshops,error:workshopError},{data:technicians,error:technicianError},{data:products,error:productError},{data:services,error:serviceError}] = await Promise.all([
      supabase.from("workshops").select("*").order("created_at",{ascending:false}),
      supabase.from("technicians").select("*").order("created_at",{ascending:false}),
      supabase.from("products").select("*").order("updated_at",{ascending:false}),
      supabase.from("services").select("*").order("created_at",{ascending:false})
    ]);
    if(workshopError){editorMessage(workshopMessage,workshopError.message,true);return;}
    if(technicianError){editorMessage(technicianMessage,technicianError.message,true);return;}
    if(productError){editorMessage(productMessage,productError.message,true);return;}
    if(serviceError){editorMessage(serviceMessage,serviceError.message,true);return;}
    workshopData=workshops||[];
    productData=products||[];
    serviceData=services||[];
    technicianData=technicians||[];
    if(workshopEditor)renderWorkshopAdminList();
    if(technicianEditor)renderTechnicianAdminList();
    if(productEditor)renderProductAdminList();
    if(serviceEditor)renderServiceAdminList();
  }
  function renderWorkshopAdminList(){
    workshopItems.replaceChildren();
    if(!workshopData.length){addTextElement(workshopItems,"p","muted","No workshops added yet.");return;}
    workshopData.forEach(item=>{
      const row=document.createElement("article");row.className="technician-admin-row";workshopItems.append(row);
      addTextElement(row,"strong","",item.title);
      addTextElement(row,"span","",[item.category,item.location,item.status].filter(Boolean).join(" · "));
      const actions=document.createElement("div");actions.className="editor-actions";row.append(actions);
      const edit=document.createElement("button");edit.type="button";edit.textContent="Edit";
      edit.addEventListener("click",()=>{
        workshopEditor.elements.id.value=item.id;
        workshopEditor.elements.title.value=item.title||"";
        workshopEditor.elements.description.value=item.description||"";
        workshopEditor.elements.category.value=item.category||"";
        workshopEditor.elements.country.value=item.country||"";
        workshopEditor.elements.location.value=item.location||"";
        workshopEditor.elements.is_published.checked=item.status==="published";
        workshopPhotoUrl=item.photo_url||"";workshopEditor.elements.remove_photo.checked=false;document.querySelector("#workshop-remove-photo-wrap").hidden=!workshopPhotoUrl;previewImage(workshopPhotoPreview,workshopPhotoUrl);
        document.querySelector("#workshop-form-title").textContent="Edit Workshop";
        document.querySelector("#workshop-cancel").hidden=false;
      });actions.append(edit);
      const del=document.createElement("button");del.type="button";del.className="secondary-button";del.textContent="Delete";
      del.addEventListener("click",async()=>{
        if(!confirm("Delete this workshop?"))return;
        const {error}=await supabase.from("workshops").delete().eq("id",item.id);
        if(error){editorMessage(workshopMessage,error.message,true);return;}
        workshopData=workshopData.filter(x=>x.id!==item.id);renderWorkshopAdminList();
      });actions.append(del);
    });
  }
  function resetWorkshopForm(){
    workshopEditor.reset();workshopPhotoUrl="";document.querySelector("#workshop-remove-photo-wrap").hidden=true;previewImage(workshopPhotoPreview,"");
    document.querySelector("#workshop-form-title").textContent="Add Workshop";
    document.querySelector("#workshop-cancel").hidden=true;
  }
  if(workshopEditor){
    workshopEditor.addEventListener("submit",async event=>{
      event.preventDefault();const button=document.querySelector("#workshop-save");button.disabled=true;editorMessage(workshopMessage,"Saving…");
      try{
        const form=new FormData(workshopEditor);const id=String(form.get("id")||"");const photo=await uploadContentPhoto(form.get("photo"),"workshops");
        const {data:userData}=await supabase.auth.getUser();
        const item={title:String(form.get("title")||"").trim(),description:String(form.get("description")||"").trim()||null,category:String(form.get("category")||"").trim()||null,location:String(form.get("location")||"").trim()||null,photo_url:photo||(form.get("remove_photo")==="on"?"":workshopPhotoUrl)||null,country:["global","bd","saudi"].includes(String(form.get("country")||""))?String(form.get("country")):null,status:form.get("is_published")==="on"?"published":"draft",updated_by:userData.user?.id||null,updated_at:new Date().toISOString()};
        const query=id?supabase.from("workshops").update(item).eq("id",id):supabase.from("workshops").insert({...item,created_by:userData.user?.id||null});
        const {error}=await query;
        if(error)throw error;
        resetWorkshopForm();await loadIdentityEditors();editorMessage(workshopMessage,"Workshop saved.");
      }catch(error){editorMessage(workshopMessage,error.message||"Could not save workshop.",true);}
      finally{button.disabled=false;}
    });
    document.querySelector("#workshop-cancel").addEventListener("click",resetWorkshopForm);
    workshopEditor.elements.photo.addEventListener("change",()=>{const file=workshopEditor.elements.photo.files[0];if(file)previewImage(workshopPhotoPreview,URL.createObjectURL(file));});
  }
  function renderProductAdminList(){
    productItems.replaceChildren();
    if(!productData.length){addTextElement(productItems,"p","muted","No product types added yet.");return;}
    productData.forEach(item=>{
      const row=document.createElement("article");row.className="technician-admin-row";productItems.append(row);
      addTextElement(row,"strong","",item.name);
      const groupLabel=item.category_group==="satellite"?"Satellite & TV Equipment":"Mobile & Accessories";
      addTextElement(row,"span","",[groupLabel,`Type: ${item.category||"—"}`,item.status==="active"?"Published":"Draft"].join(" · "));
      const actions=document.createElement("div");actions.className="editor-actions";row.append(actions);
      const edit=document.createElement("button");edit.type="button";edit.textContent="Edit";
      edit.addEventListener("click",()=>{
        productEditor.elements.id.value=item.id;
        productEditor.elements.name.value=item.name||"";
        productEditor.elements.category_group.value=item.category_group||"mobile";
        productEditor.elements.category.value=item.category||"";
        productEditor.elements.description.value=item.description||"";
        productEditor.elements.country.value=item.country||"";
        productPhotoUrl=item.photo_url||"";previewImage(productPhotoPreview,productPhotoUrl);
        productEditor.elements.is_published.checked=item.status==="active";
        document.querySelector("#product-form-title").textContent="Edit Product";
        document.querySelector("#product-cancel").hidden=false;
      });actions.append(edit);
      const del=document.createElement("button");del.type="button";del.className="secondary-button";del.textContent="Delete";
      del.addEventListener("click",async()=>{
        if(!confirm("Delete this product type?"))return;
        const {error}=await supabase.from("products").delete().eq("id",item.id);
        if(error){editorMessage(productMessage,error.message,true);return;}
        productData=productData.filter(x=>x.id!==item.id);renderProductAdminList();
      });actions.append(del);
    });
  }
  function resetProductForm(){
    productEditor.reset();productPhotoUrl="";previewImage(productPhotoPreview,"");
    productEditor.elements.country.value="";
    productEditor.elements.category_group.value="mobile";
    document.querySelector("#product-form-title").textContent="Add Product";
    document.querySelector("#product-cancel").hidden=true;
  }
  if(productEditor){
    productEditor.addEventListener("submit",async event=>{
      event.preventDefault();
      const button=document.querySelector("#product-save");button.disabled=true;editorMessage(productMessage,"Saving…");
      try{
        const form=new FormData(productEditor);const id=String(form.get("id")||"");
        const name=String(form.get("name")||"").trim();
        const description=String(form.get("description")||"").trim();
        const category=String(form.get("category")||"").trim();
        const categoryGroup=String(form.get("category_group")||"mobile");
        if(!["mobile","satellite"].includes(categoryGroup))throw new Error("Select a valid product group.");
        const photo=await uploadContentPhoto(form.get("photo"),"products");
        if(!name)throw new Error("Name is required.");
        const slug=id?(productData.find(x=>x.id===id)?.slug||""):(name.toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,48)||"product")+"-"+crypto.randomUUID().slice(0,8);
        const item={slug,name,category_group:categoryGroup,category:category||null,description,photo_url:photo||(id?(productData.find(x=>x.id===id)?.photo_url||null):null),country:["global","bd","saudi"].includes(String(form.get("country")||""))?String(form.get("country")):null,status:form.get("is_published")==="on"?"active":"draft"};
        const query=id?supabase.from("products").update(item).eq("id",id):supabase.from("products").insert(item);
        const {error}=await query;if(error)throw error;
        resetProductForm();await loadIdentityEditors();editorMessage(productMessage,"Product saved.");
      }catch(error){editorMessage(productMessage,error.message||"Could not save product type.",true);}
      finally{button.disabled=false;}
    });
    document.querySelector("#product-cancel").addEventListener("click",resetProductForm);
    productEditor.elements.photo.addEventListener("change",()=>{const file=productEditor.elements.photo.files[0];if(file)previewImage(productPhotoPreview,URL.createObjectURL(file));});
  }
  function renderServiceAdminList(){
    serviceItems.replaceChildren();
    if(!serviceData.length){addTextElement(serviceItems,"p","muted","No services added yet.");return;}
    serviceData.forEach(item=>{
      const row=document.createElement("article");row.className="technician-admin-row";serviceItems.append(row);
      addTextElement(row,"strong","",item.name);
      addTextElement(row,"span","",[item.category,item.status].filter(Boolean).join(" · "));
      const actions=document.createElement("div");actions.className="editor-actions";row.append(actions);
      const edit=document.createElement("button");edit.type="button";edit.textContent="Edit";
      edit.addEventListener("click",()=>{serviceEditor.elements.id.value=item.id;serviceEditor.elements.name.value=item.name||"";serviceEditor.elements.description.value=item.description||"";serviceEditor.elements.category.value=item.category||"";serviceEditor.elements.country.value=item.country||"";serviceEditor.elements.is_published.checked=item.status==="active";servicePhotoUrl=item.photo_url||"";previewImage(servicePhotoPreview,servicePhotoUrl);document.querySelector("#service-form-title").textContent="Edit Service";document.querySelector("#service-cancel").hidden=false;});actions.append(edit);
      const del=document.createElement("button");del.type="button";del.className="secondary-button";del.textContent="Delete";
      del.addEventListener("click",async()=>{if(!confirm("Delete this service?"))return;const {error}=await supabase.from("services").delete().eq("id",item.id);if(error){editorMessage(serviceMessage,error.message,true);return;}serviceData=serviceData.filter(x=>x.id!==item.id);renderServiceAdminList();});actions.append(del);
    });
  }
  function resetServiceForm(){serviceEditor.reset();servicePhotoUrl="";previewImage(servicePhotoPreview,"");serviceEditor.elements.country.value="";document.querySelector("#service-form-title").textContent="Add Service";document.querySelector("#service-cancel").hidden=true;}
  if(serviceEditor){
    serviceEditor.addEventListener("submit",async event=>{
      event.preventDefault();const button=document.querySelector("#service-save");button.disabled=true;editorMessage(serviceMessage,"Saving…");
      try{
        const form=new FormData(serviceEditor);const id=String(form.get("id")||"");const name=String(form.get("name")||"").trim();if(!name)throw new Error("Name is required.");
        const photo=await uploadContentPhoto(form.get("photo"),"services");
        const slug=id?(serviceData.find(x=>x.id===id)?.slug||""):(name.toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,48)||"service")+"-"+crypto.randomUUID().slice(0,8);
        const item={slug,name,description:String(form.get("description")||"").trim(),category:String(form.get("category")||"").trim()||null,country:["global","bd","saudi"].includes(String(form.get("country")||""))?String(form.get("country")):null,photo_url:photo||(id?(serviceData.find(x=>x.id===id)?.photo_url||null):null),status:form.get("is_published")==="on"?"active":"draft"};
        const query=id?supabase.from("services").update(item).eq("id",id):supabase.from("services").insert(item);const {error}=await query;if(error)throw error;
        resetServiceForm();await loadIdentityEditors();editorMessage(serviceMessage,"Service saved.");
      }catch(error){editorMessage(serviceMessage,error.message||"Could not save service.",true);}finally{button.disabled=false;}
    });
    document.querySelector("#service-cancel").addEventListener("click",resetServiceForm);
    serviceEditor.elements.photo.addEventListener("change",()=>{const file=serviceEditor.elements.photo.files[0];if(file)previewImage(servicePhotoPreview,URL.createObjectURL(file));});
  }
  function renderTechnicianAdminList(){
    technicianItems.replaceChildren();
    if(!technicianData.length){addTextElement(technicianItems,"p","muted","No technicians added yet.");return;}
    technicianData.forEach(item=>{
      const row=document.createElement("article");row.className="technician-admin-row";technicianItems.append(row);
      addTextElement(row,"strong","",item.name);addTextElement(row,"span","",[item.description,item.category].filter(Boolean).join(" · "));
      const actions=document.createElement("div");actions.className="editor-actions";row.append(actions);
      const edit=document.createElement("button");edit.type="button";edit.textContent="Edit";
      edit.addEventListener("click",()=>{technicianEditor.elements.id.value=item.id;technicianEditor.elements.name.value=item.name||"";technicianEditor.elements.description.value=item.description||"";technicianEditor.elements.category.value=item.category||"";technicianEditor.elements.country.value=item.country||"";technicianEditor.elements.phone.value=item.phone||"";technicianEditor.elements.whatsapp.value=item.whatsapp||"";technicianPhotoUrl=item.photo_url||"";previewImage(technicianPhotoPreview,technicianPhotoUrl);document.querySelector("#technician-form-title").textContent="Edit Technician";document.querySelector("#technician-cancel").hidden=false;});actions.append(edit);
      const del=document.createElement("button");del.type="button";del.className="secondary-button";del.textContent="Delete";
      del.addEventListener("click",async()=>{if(!confirm("Delete this technician?"))return;const {error}=await supabase.from("technicians").delete().eq("id",item.id);if(error){editorMessage(technicianMessage,error.message,true);return;}technicianData=technicianData.filter(x=>x.id!==item.id);renderTechnicianAdminList();});actions.append(del);
    });
  }
  if(technicianEditor){
    technicianEditor.addEventListener("submit",async event=>{
      event.preventDefault();const button=document.querySelector("#technician-save");button.disabled=true;editorMessage(technicianMessage,"Saving…");
      try{
        const form=new FormData(technicianEditor);const id=String(form.get("id")||"");const photo=await uploadContentPhoto(form.get("photo"),"technicians");
        const item={id:id||crypto.randomUUID(),name:String(form.get("name")||"").trim(),description:String(form.get("description")||"").trim()||null,category:String(form.get("category")||"").trim()||null,country:["global","bd","saudi"].includes(String(form.get("country")||""))?String(form.get("country")):null,phone:String(form.get("phone")||"").trim()||null,whatsapp:String(form.get("whatsapp")||"").trim()||null,photo_url:photo||technicianPhotoUrl||null,is_published:true,updated_at:new Date().toISOString()};
        const {error}=await supabase.from("technicians").upsert(item,{onConflict:"id"});
        if(error)throw error;
        technicianData=id?technicianData.map(x=>x.id===id?item:x):[...technicianData,item];
        technicianEditor.reset();technicianPhotoUrl="";previewImage(technicianPhotoPreview,"");document.querySelector("#technician-form-title").textContent="Add Technician";document.querySelector("#technician-cancel").hidden=true;renderTechnicianAdminList();editorMessage(technicianMessage,"Technician saved.");
      }catch(error){editorMessage(technicianMessage,error.message||"Could not save technician.",true);}
      finally{button.disabled=false;}
    });
    document.querySelector("#technician-cancel").addEventListener("click",()=>{technicianEditor.reset();technicianPhotoUrl="";previewImage(technicianPhotoPreview,"");document.querySelector("#technician-form-title").textContent="Add Technician";document.querySelector("#technician-cancel").hidden=true;});
    technicianEditor.elements.photo.addEventListener("change",()=>{const file=technicianEditor.elements.photo.files[0];if(file)previewImage(technicianPhotoPreview,URL.createObjectURL(file));});
  }
  loadIdentityEditors();
}
