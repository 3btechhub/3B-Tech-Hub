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
function applyTheme(theme) {
  const dark = theme === "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
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
function renderTechnicians(items) {
  const target = document.querySelector("#technicians-list");
  if (!target || !Array.isArray(items) || !items.length) return;
  target.replaceChildren();

  let dialog = document.querySelector("#technician-detail-dialog");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "technician-detail-dialog";
    dialog.className = "technician-detail-dialog";
    dialog.setAttribute("aria-labelledby", "technician-detail-name");
    dialog.innerHTML = '<div class="technician-detail-content"><button class="technician-detail-close" type="button" aria-label="Close details">×</button><div class="technician-detail-body"></div></div>';
    document.body.append(dialog);
    dialog.querySelector(".technician-detail-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  const detailBody = dialog.querySelector(".technician-detail-body");
  const openDetails = (item) => {
    detailBody.replaceChildren();
    if (item.photo_url) {
      const image = document.createElement("img");
      image.src = item.photo_url;
      image.alt = item.name;
      image.className = "technician-detail-photo";
      detailBody.append(image);
    }
    const name = addTextElement(detailBody, "h2", "", item.name);
    name.id = "technician-detail-name";
    if (item.description) addTextElement(detailBody, "p", "technician-detail-specialty", item.description);
    if (item.category) addTextElement(detailBody, "p", "technician-detail-specialty", item.category);
    const contacts = document.createElement("div");
    contacts.className = "technician-detail-contacts";
    if (item.phone) {
      const call = document.createElement("a");
      call.href = "tel:" + item.phone.replace(/[^+\d]/g, "");
      call.textContent = "Call";
      contacts.append(call);
    }
    if (item.whatsapp) {
      const whatsapp = document.createElement("a");
      whatsapp.href = "https://wa.me/" + item.whatsapp.replace(/\D/g, "");
      whatsapp.target = "_blank";
      whatsapp.rel = "noopener noreferrer";
      whatsapp.textContent = "WhatsApp";
      contacts.append(whatsapp);
    }
    if (contacts.children.length) detailBody.append(contacts);
    dialog.showModal();
  };

  items.filter(item => item && item.name && item.is_published !== false && (activeCountry.region === "global" || (!item.country || item.country === "global" || item.country === activeCountry.region))).forEach(item => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "technician-card";
    card.setAttribute("aria-label", "View " + item.name + " profile");
    if (item.photo_url) {
      const image = document.createElement("img");
      image.src = item.photo_url;
      image.alt = "";
      image.loading = "lazy";
      card.append(image);
    } else {
      const placeholder = document.createElement("span");
      placeholder.className = "technician-card-placeholder";
      placeholder.setAttribute("aria-hidden", "true");
      placeholder.textContent = "👤";
      card.append(placeholder);
    }
    const info = document.createElement("span");
    info.className = "technician-card-info";
    addTextElement(info, "strong", "", item.name);
    if (item.category) addTextElement(info, "small", "technician-specialty", item.category);
    addTextElement(info, "small", "technician-card-hint", "View details");
    card.append(info);
    card.addEventListener("click", () => openDetails(item));
    target.append(card);
  });
  if (target.children.length) homepageTechnicians.hidden = false;
}
function renderWorkshops(items) {
  const target = document.querySelector("#workshops-list");
  if (!target || !Array.isArray(items)) return;
  target.replaceChildren();

  let dialog = document.querySelector("#workshop-detail-dialog");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "workshop-detail-dialog";
    dialog.className = "technician-detail-dialog workshop-detail-dialog";
    dialog.innerHTML = '<div class="technician-detail-content"><button class="technician-detail-close" type="button" aria-label="Close details">×</button><div class="technician-detail-body"></div></div>';
    document.body.append(dialog);
    dialog.querySelector(".technician-detail-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  }

  const detailBody = dialog.querySelector(".technician-detail-body");
  const openDetails = item => {
    detailBody.replaceChildren();
    if (item.photo_url) {
      const image = document.createElement("img");
      image.src = item.photo_url;
      image.alt = item.title;
      image.className = "technician-detail-photo";
      detailBody.append(image);
    } else {
      const icon = document.createElement("span");
      icon.className = "workshop-detail-fallback";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "🛠️";
      detailBody.append(icon);
    }
    addTextElement(detailBody, "h2", "", item.title);
    if (item.description) addTextElement(detailBody, "p", "technician-detail-specialty", item.description);
    if (item.category) addTextElement(detailBody, "p", "workshop-date", item.category);
    if (item.location) addTextElement(detailBody, "p", "workshop-location", item.location);
    if (item.country) addTextElement(detailBody, "p", "workshop-location", item.country === "bd" ? "Bangladesh (BD)" : item.country === "saudi" ? "Saudi Arabia (Saudi)" : "Global");
    dialog.showModal();
  };

  items.filter(item => item && item.title && (activeCountry.region === "global" || (!item.country || item.country === "global" || item.country === activeCountry.region))).forEach(item => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "workshop-card";
    card.setAttribute("aria-label", "View " + item.title + " workshop details");
    if (item.photo_url) {
      const image = document.createElement("img");
      image.src = item.photo_url;
      image.alt = "";
      image.loading = "lazy";
      card.append(image);
    } else {
      const icon = document.createElement("span");
      icon.className = "workshop-card-placeholder";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "🛠️";
      card.append(icon);
    }
    const info = document.createElement("span");
    info.className = "technician-card-info";
    addTextElement(info, "strong", "", item.title);
    if (item.category) addTextElement(info, "small", "", item.category);
    addTextElement(info, "small", "technician-card-hint", "View details");
    card.append(info);
    card.addEventListener("click", () => openDetails(item));
    target.append(card);
  });
  if (target.children.length && homepageWorkshops) homepageWorkshops.hidden = false;
}
function renderProducts(products) {
  const target = document.querySelector("#products-list");
  if (!target) return;
  target.replaceChildren();

  const region = activeCountry.region;
  const visibleProducts = (products || []).filter(item =>
    item && item.name &&
    (region === "global" || !item.country || item.country === "global" || item.country === region)
  );
  if (!visibleProducts.length) {
    if (homepageProducts) homepageProducts.hidden = true;
    return;
  }

  const groupTitles = {
    mobile: "Mobile & Accessories",
    satellite: "Satellite & TV Equipment"
  };
  const getGroupTitle = item => groupTitles[item.category_group] || item.category || "Other Products";

  let dialog = document.querySelector("#product-detail-dialog");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "product-detail-dialog";
    dialog.className = "technician-detail-dialog product-detail-dialog";
    dialog.innerHTML = '<div class="technician-detail-content"><button class="technician-detail-close" type="button" aria-label="Close details">×</button><div class="technician-detail-body"></div></div>';
    document.body.append(dialog);
    dialog.querySelector(".technician-detail-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  }

  const detailBody = dialog.querySelector(".technician-detail-body");
  const grid = document.createElement("div");
  grid.className = "product-showcase-grid";

  visibleProducts.forEach(product => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "product-showcase-card";
    card.setAttribute("aria-label", "View " + product.name + " details");

    const visual = document.createElement("span");
    visual.className = "product-showcase-visual";
    if (product.photo_url) {
      const image = document.createElement("img");
      image.src = product.photo_url;
      image.alt = "";
      image.loading = "lazy";
      visual.append(image);
    } else {
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = product.category_group === "satellite" ? "📡" : "📱";
      visual.append(icon);
    }
    card.append(visual);

    const group = document.createElement("span");
    group.className = "product-showcase-group";
    group.textContent = getGroupTitle(product);
    card.append(group);

    const title = document.createElement("strong");
    title.className = "product-showcase-title";
    title.textContent = product.name;
    card.append(title);

    const arrow = document.createElement("span");
    arrow.className = "product-showcase-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    card.append(arrow);

    card.addEventListener("click", () => {
      detailBody.replaceChildren();
      if (product.photo_url) {
        const image = document.createElement("img");
        image.src = product.photo_url;
        image.alt = product.name;
        image.className = "technician-detail-photo";
        detailBody.append(image);
      } else {
        const icon = document.createElement("div");
        icon.className = "product-detail-icon";
        icon.textContent = product.category_group === "satellite" ? "📡" : "📱";
        detailBody.append(icon);
      }
      addTextElement(detailBody, "h2", "", product.name);
      addTextElement(detailBody, "p", "technician-detail-specialty", getGroupTitle(product));
      if (product.description) addTextElement(detailBody, "p", "product-detail-description", product.description);
      dialog.showModal();
    });

    grid.append(card);
  });

  target.append(grid);
  if (homepageProducts) homepageProducts.hidden = !grid.children.length;
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
        const link = document.createElement("a"); link.className = "service-card"; link.href = "./" + item.slug + "/";
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
    const back=document.createElement("a");back.className="service-back-link";back.href="../../services/";back.textContent="Explore all services";detail.append(back);
  }
}
loadPublicServices();

async function loadHomepageIdentity() {
  if (!homepageTechnicians && !homepageWorkshops && !homepageProducts) return;
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
      addTextElement(row,"span","",[item.category,item.location,item.country === "bd" ? "Bangladesh (BD)" : item.country === "saudi" ? "Saudi Arabia (Saudi)" : "Global",item.status].filter(Boolean).join(" · "));
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
      addTextElement(row,"span","",[`Category: ${item.category||"—"}`,item.country==="bd"?"Bangladesh (BD)":item.country==="saudi"?"Saudi Arabia (Saudi)":"Global",item.status==="active"?"Published":"Draft"].join(" · "));
      const actions=document.createElement("div");actions.className="editor-actions";row.append(actions);
      const edit=document.createElement("button");edit.type="button";edit.textContent="Edit";
      edit.addEventListener("click",()=>{
        productEditor.elements.id.value=item.id;
        productEditor.elements.name.value=item.name||"";
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
        const photo=await uploadContentPhoto(form.get("photo"),"products");
        if(!name)throw new Error("Name is required.");
        const slug=id?(productData.find(x=>x.id===id)?.slug||""):(name.toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,48)||"product")+"-"+crypto.randomUUID().slice(0,8);
        const item={slug,name,category:category||null,description,photo_url:photo||(id?(productData.find(x=>x.id===id)?.photo_url||null):null),country:["global","bd","saudi"].includes(String(form.get("country")||""))?String(form.get("country")):null,status:form.get("is_published")==="on"?"active":"draft"};
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
      addTextElement(row,"span","",[item.category,item.country==="bd"?"Bangladesh (BD)":item.country==="saudi"?"Saudi Arabia (Saudi)":"Global",item.status].filter(Boolean).join(" · "));
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
      addTextElement(row,"strong","",item.name);addTextElement(row,"span","",[item.description,item.category, item.country === "bd" ? "Bangladesh (BD)" : item.country === "saudi" ? "Saudi Arabia (Saudi)" : "Global"].filter(Boolean).join(" · "));
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
