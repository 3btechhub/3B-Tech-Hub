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


// Homepage workshop and technician content, managed from the owner dashboard.
const homepageTechnicians = document.querySelector("#technicians-section");
const homepageWorkshops = document.querySelector("#workshops-section");
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
  items.filter(item=>item && item.name && item.is_published !== false).forEach(item=>{
    const card=document.createElement("article");card.className="technician-card";target.append(card);
    if(item.photo_url){const img=document.createElement("img");img.src=item.photo_url;img.alt=item.name;img.loading="lazy";card.append(img);}
    addTextElement(card,"h3","",item.name);
    if(item.specialty)addTextElement(card,"p","technician-specialty",item.specialty);
    const links=document.createElement("div");links.className="company-contact-links";card.append(links);
    if(item.phone){const a=document.createElement("a");a.href="tel:"+item.phone.replace(/[^+\\d]/g,"");a.textContent="Call";links.append(a);}
    if(item.whatsapp){const a=document.createElement("a");a.href="https://wa.me/"+item.whatsapp.replace(/\\D/g,"");a.target="_blank";a.rel="noopener noreferrer";a.textContent="WhatsApp";links.append(a);}
  });
  if(target.children.length) homepageTechnicians.hidden=false;
}
function renderWorkshops(items) {
  const target = document.querySelector("#workshops-list");
  if (!target || !Array.isArray(items)) return;
  target.replaceChildren();
  items.filter(item=>item && item.title && item.is_published !== false).forEach(item=>{
    const card=document.createElement("article");card.className="workshop-card";target.append(card);
    if(item.photo_url){const img=document.createElement("img");img.src=item.photo_url;img.alt=item.title;img.loading="lazy";card.append(img);}
    addTextElement(card,"h3","",item.title);
    if(item.description)addTextElement(card,"p","",item.description);
    if(item.date || item.time)addTextElement(card,"p","workshop-date",[item.date,item.time].filter(Boolean).join(" · "));
    if(item.location)addTextElement(card,"p","workshop-location",item.location);
    if(item.trainer)addTextElement(card,"p","workshop-trainer",item.trainer);
    const links=document.createElement("div");links.className="company-contact-links";card.append(links);
    if(item.phone){const a=document.createElement("a");a.href="tel:"+item.phone.replace(/[^+\\d]/g,"");a.textContent="Call";links.append(a);}
    if(item.whatsapp){const a=document.createElement("a");a.href="https://wa.me/"+item.whatsapp.replace(/\\D/g,"");a.target="_blank";a.rel="noopener noreferrer";a.textContent="WhatsApp";links.append(a);}
  });
  if(target.children.length && homepageWorkshops) homepageWorkshops.hidden=false;
}
async function loadHomepageIdentity() {
  if (!homepageTechnicians && !homepageWorkshops) return;
  const {data,error}=await supabase.from("site_settings").select("setting_key,setting_value").eq("is_public",true).in("setting_key",["technicians","workshops"]);
  if(error){console.warn("Homepage content unavailable:",error.message);return;}
  for(const row of data||[]){
    if(row.setting_key==="technicians")renderTechnicians(row.setting_value||[]);
    if(row.setting_key==="workshops")renderWorkshops(row.setting_value||[]);
  }
}
loadHomepageIdentity();

// Owner-only Workshop and Technician editors.
const workshopEditor=document.querySelector("#workshop-form");
const technicianEditor=document.querySelector("#technician-form");
if(ownerDashboard && (workshopEditor || technicianEditor)) {
  const technicianMessage=document.querySelector("#technician-message");
  const technicianItems=document.querySelector("#technician-admin-items");
  const technicianPhotoPreview=document.querySelector("#technician-photo-preview");
  let technicianData=[];
  let technicianPhotoUrl="";
  let workshopData=[];
  let workshopPhotoUrl="";
  const workshopMessage=document.querySelector("#workshop-message");
  const workshopItems=document.querySelector("#workshop-admin-items");
  const workshopPhotoPreview=document.querySelector("#workshop-photo-preview");
  const editorMessage=(node,message,isError=false)=>{if(!node)return;node.textContent=message;node.dataset.kind=isError?"error":"success";};
  async function saveSetting(key,value){
    const {data:userData}=await supabase.auth.getUser();
    const {error}=await supabase.from("site_settings").upsert({setting_key:key,setting_value:value,is_public:true,updated_by:userData.user?.id||null,updated_at:new Date().toISOString()},{onConflict:"setting_key"});
    if(error)throw error;
  }
  async function uploadContentPhoto(file,folder){
    if(!file)return "";
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
    const {data,error}=await supabase.from("site_settings").select("setting_key,setting_value").in("setting_key",["workshops","technicians"]);
    if(error){editorMessage(workshopMessage||technicianMessage,error.message,true);return;}
    for(const row of data||[]){
      if(row.setting_key==="workshops")workshopData=Array.isArray(row.setting_value)?row.setting_value:[];
      if(row.setting_key==="technicians")technicianData=Array.isArray(row.setting_value)?row.setting_value:[];
    }
    if(workshopEditor)renderWorkshopAdminList();
    if(technicianEditor)renderTechnicianAdminList();
  }
  function renderWorkshopAdminList(){
    workshopItems.replaceChildren();
    if(!workshopData.length){addTextElement(workshopItems,"p","muted","No workshops added yet.");return;}
    workshopData.forEach(item=>{
      const row=document.createElement("article");row.className="technician-admin-row";workshopItems.append(row);
      addTextElement(row,"strong","",item.title);
      addTextElement(row,"span","",[item.date,item.location].filter(Boolean).join(" · "));
      const actions=document.createElement("div");actions.className="editor-actions";row.append(actions);
      const edit=document.createElement("button");edit.type="button";edit.textContent="Edit";
      edit.addEventListener("click",()=>{
        workshopEditor.elements.id.value=item.id;
        for(const key of ["title","description","date","time","location","trainer","phone","whatsapp"])workshopEditor.elements[key].value=item[key]||"";
        workshopEditor.elements.is_published.checked=item.is_published!==false;
        workshopPhotoUrl=item.photo_url||"";previewImage(workshopPhotoPreview,workshopPhotoUrl);
        document.querySelector("#workshop-form-title").textContent="Edit Workshop";
        document.querySelector("#workshop-cancel").hidden=false;
      });actions.append(edit);
      const del=document.createElement("button");del.type="button";del.className="secondary-button";del.textContent="Delete";
      del.addEventListener("click",async()=>{
        if(!confirm("Delete this workshop?"))return;
        const previous=workshopData;workshopData=workshopData.filter(x=>x.id!==item.id);
        try{await saveSetting("workshops",workshopData);renderWorkshopAdminList();}
        catch(error){workshopData=previous;editorMessage(workshopMessage,error.message,true);}
      });actions.append(del);
    });
  }
  function resetWorkshopForm(){
    workshopEditor.reset();workshopPhotoUrl="";previewImage(workshopPhotoPreview,"");
    document.querySelector("#workshop-form-title").textContent="Add Workshop";
    document.querySelector("#workshop-cancel").hidden=true;
  }
  if(workshopEditor){
    workshopEditor.addEventListener("submit",async event=>{
      event.preventDefault();const button=document.querySelector("#workshop-save");button.disabled=true;editorMessage(workshopMessage,"Saving…");
      try{
        const form=new FormData(workshopEditor);const id=String(form.get("id")||"");const photo=await uploadContentPhoto(form.get("photo"),"workshops");
        const item={id:id||crypto.randomUUID(),title:String(form.get("title")||"").trim(),description:String(form.get("description")||"").trim(),date:String(form.get("date")||""),time:String(form.get("time")||""),location:String(form.get("location")||"").trim(),trainer:String(form.get("trainer")||"").trim(),phone:String(form.get("phone")||"").trim(),whatsapp:String(form.get("whatsapp")||"").trim(),photo_url:photo||workshopPhotoUrl||"",is_published:form.get("is_published")==="on"};
        const previous=workshopData;
        workshopData=id?workshopData.map(x=>x.id===id?item:x):[...workshopData,item];
        await saveSetting("workshops",workshopData);
        resetWorkshopForm();renderWorkshopAdminList();editorMessage(workshopMessage,"Workshop saved.");
      }catch(error){editorMessage(workshopMessage,error.message||"Could not save workshop.",true);}
      finally{button.disabled=false;}
    });
    document.querySelector("#workshop-cancel").addEventListener("click",resetWorkshopForm);
    workshopEditor.elements.photo.addEventListener("change",()=>{const file=workshopEditor.elements.photo.files[0];if(file)previewImage(workshopPhotoPreview,URL.createObjectURL(file));});
  }
  function renderTechnicianAdminList(){
    technicianItems.replaceChildren();
    if(!technicianData.length){addTextElement(technicianItems,"p","muted","No technicians added yet.");return;}
    technicianData.forEach(item=>{
      const row=document.createElement("article");row.className="technician-admin-row";technicianItems.append(row);
      addTextElement(row,"strong","",item.name);addTextElement(row,"span","",item.specialty||"");
      const actions=document.createElement("div");actions.className="editor-actions";row.append(actions);
      const edit=document.createElement("button");edit.type="button";edit.textContent="Edit";
      edit.addEventListener("click",()=>{technicianEditor.elements.id.value=item.id;technicianEditor.elements.name.value=item.name||"";technicianEditor.elements.specialty.value=item.specialty||"";technicianEditor.elements.phone.value=item.phone||"";technicianEditor.elements.whatsapp.value=item.whatsapp||"";technicianPhotoUrl=item.photo_url||"";previewImage(technicianPhotoPreview,technicianPhotoUrl);document.querySelector("#technician-form-title").textContent="Edit Technician";document.querySelector("#technician-cancel").hidden=false;});actions.append(edit);
      const del=document.createElement("button");del.type="button";del.className="secondary-button";del.textContent="Delete";
      del.addEventListener("click",async()=>{if(!confirm("Delete this technician?"))return;const previous=technicianData;technicianData=technicianData.filter(x=>x.id!==item.id);try{await saveSetting("technicians",technicianData);renderTechnicianAdminList();}catch(error){technicianData=previous;editorMessage(technicianMessage,error.message,true);}});actions.append(del);
    });
  }
  if(technicianEditor){
    technicianEditor.addEventListener("submit",async event=>{
      event.preventDefault();const button=document.querySelector("#technician-save");button.disabled=true;editorMessage(technicianMessage,"Saving…");
      try{
        const form=new FormData(technicianEditor);const id=String(form.get("id")||"");const photo=await uploadContentPhoto(form.get("photo"),"technicians");
        const item={id:id||crypto.randomUUID(),name:String(form.get("name")||"").trim(),specialty:String(form.get("specialty")||"").trim(),phone:String(form.get("phone")||"").trim(),whatsapp:String(form.get("whatsapp")||"").trim(),photo_url:photo||technicianPhotoUrl||"",is_published:true};
        const previous=technicianData;technicianData=id?technicianData.map(x=>x.id===id?item:x):[...technicianData,item];
        await saveSetting("technicians",technicianData);
        technicianEditor.reset();technicianPhotoUrl="";previewImage(technicianPhotoPreview,"");document.querySelector("#technician-form-title").textContent="Add Technician";document.querySelector("#technician-cancel").hidden=true;renderTechnicianAdminList();editorMessage(technicianMessage,"Technician saved.");
      }catch(error){editorMessage(technicianMessage,error.message||"Could not save technician.",true);}
      finally{button.disabled=false;}
    });
    document.querySelector("#technician-cancel").addEventListener("click",()=>{technicianEditor.reset();technicianPhotoUrl="";previewImage(technicianPhotoPreview,"");document.querySelector("#technician-form-title").textContent="Add Technician";document.querySelector("#technician-cancel").hidden=true;});
    technicianEditor.elements.photo.addEventListener("change",()=>{const file=technicianEditor.elements.photo.files[0];if(file)previewImage(technicianPhotoPreview,URL.createObjectURL(file));});
  }
  loadIdentityEditors();
}
