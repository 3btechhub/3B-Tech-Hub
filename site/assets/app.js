await window.countryContextReady;

// Make country context available before the rest of the application runs.
const activeCountry = window.siteCountry;
const currentPath = window.location.pathname;
const serviceCountryRules = {
  "tv-repair": "bd",
  "mobile-repair": "bd",
  "mobile-parts-sell": "bd",
  "satellite-dish-installation": "ksa",
  "satellite-dish-servicing": "ksa",
  "satellite-dish-parts-sell": "ksa"
};
const servicePrefix = "/3btechhub/services/";
if (currentPath.startsWith(servicePrefix)) {
  const serviceSlug = currentPath.slice(servicePrefix.length).split("/")[0];
  if (serviceCountryRules[serviceSlug] && serviceCountryRules[serviceSlug] !== activeCountry.region) {
    window.location.replace("/3btechhub/" + activeCountry.region + "/");
  }
}
document.querySelectorAll("[data-country-region]").forEach((section) => {
  section.hidden = section.dataset.countryRegion !== activeCountry.region;
});
const menuButton = document.querySelector(".menu-trigger");
const siteMenu = document.querySelector("#site-menu");
const profileMenuLink = document.querySelector("#profile-menu-link");
const dashboardMenuLink = document.querySelector("#dashboard-menu-link");
const themeToggle = document.querySelector("#theme-toggle");
const languageToggle = document.querySelector("#language-toggle");
const languageCode = document.querySelector("#language-code");
const savedTheme = localStorage.getItem("3b-theme");
const savedLanguage = localStorage.getItem("3b-language") || "en";
document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
document.documentElement.lang = savedLanguage;
const translations = {
  en: {home:"Home",profile:"Profile",services:"Services",login:"Login",logout:"Logout",dashboard:"Dashboard",accountLogin:"Account login",dark:"Switch to dark mode",light:"Switch to light mode"},
  bn: {home:"হোম",profile:"প্রোফাইল",services:"সার্ভিস",login:"লগইন",logout:"লগআউট",dashboard:"ড্যাশবোর্ড",accountLogin:"অ্যাকাউন্টে লগইন",dark:"ডার্ক মোড চালু করুন",light:"লাইট মোড চালু করুন"}
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
async function setMenuSession(session) {
  if (profileMenuLink) profileMenuLink.hidden = !session;
  if (loginMenuLink) loginMenuLink.hidden = !!session;
  if (logoutMenuLink) logoutMenuLink.hidden = !session;
  if (dashboardMenuLink) {
    dashboardMenuLink.hidden = true;
    if (session?.user?.id) {
      const { data, error } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", session.user.id).eq("role", "owner").maybeSingle();
      if (!error && data?.role === "owner") dashboardMenuLink.hidden = false;
    }
  }
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

      if (!name) throw new Error("Enter your name.");
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
        data: { ...(currentUser.user_metadata || {}), display_name: name },
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
const ownerDashboard = document.querySelector("#owner-dashboard");
if (ownerDashboard) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    location.replace(new URL("login/", ROOT_URL).href);
  } else {
    const { data: ownerRole, error: roleError } = await supabase
      .from("user_roles").select("role")
      .eq("user_id", authData.user.id).eq("role", "owner").maybeSingle();
    if (roleError || ownerRole?.role !== "owner") {
      location.replace(new URL("profile/", ROOT_URL).href);
    } else {
      const ownerEmail = document.querySelector("#dashboard-owner-email");
      if (ownerEmail) ownerEmail.textContent = authData.user.email || "";
      const resources = [
        ["site_content", "dashboard-content-count"],
        ["services", "dashboard-services-count"],
        ["products", "dashboard-products-count"],
        ["service_bookings", "dashboard-bookings-count"],
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


// Dashboard module tabs: all modules stay on one horizontal row.
const dashboardTabs = document.querySelectorAll("[data-dashboard-tab]");
const dashboardPanels = document.querySelectorAll("[data-dashboard-panel]");
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
