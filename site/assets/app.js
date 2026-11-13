import { applyRuntimeConfig, loadRuntimeConfig } from "./runtime-config.js";
import { initCataloguePage } from "./catalogue.js";
import { initExtendedDashboard } from "./admin-extended.js";
import { createContactIcon } from "./contact-utils.js";
import { createIcon, getModuleIcon, getItemFallbackIcon, loadSvgIconRegistry } from "./icon-utils.js";
const menuButton = document.querySelector(".menu-trigger");
const siteMenu = document.querySelector("#site-menu");
const accountMenuLink = document.querySelector("#login-menu-link");
const profileMenuLink = document.querySelector("#profile-menu-link");
const dashboardMenuLink = document.querySelector("#dashboard-menu-link");
const themeToggle = document.querySelector("#theme-toggle");
const savedTheme = localStorage.getItem("3b-theme");
document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
function renderSvgIconAttributes(root=document){
 root.querySelectorAll("[data-icon],[data-svg-icon]").forEach(element=>{
  const key=element.dataset.svgIcon||element.dataset.icon;
  if(!key)return;
  const existing=element.querySelector(":scope > svg[data-rendered-icon]");
  if(existing)existing.remove();
  const svg=createIcon(key);
  svg.dataset.renderedIcon="true";
  svg.setAttribute("aria-hidden","true");
  element.prepend(svg);
 });
}
function addTextElement(parent, tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = value == null ? "" : String(value);
  parent.append(node);
  return node;
}

const translations = { en: {home:"Home",profile:"Profile",login:"Login",logout:"Logout",dashboard:"Dashboard",accountLogin:"Account login",dark:"Switch to dark mode",light:"Switch to light mode",overview:"Overview",services:"Services",products:"Products",workshops:"Workshops",technicians:"Technicians",contacts:"Contacts",audit:"Audits & Logs",user:"User",role:"Role",permission:"Permission",settings:"Settings",users:"Users",refresh:"Refresh",auditHistory:"Audit History",inviteUser:"Invite User",userType:"User Type",emailAddress:"Email Address",sendInvitation:"Send Invitation",refreshUsers:"Refresh Users",userList:"User List",roleAssignments:"Role Assignments",permissionMatrix:"Permission Matrix",websiteSettings:"Website Settings",websiteTitle:"Website Title",logoUrl:"Logo URL (optional)",saveSettings:"Save Settings",signIn:"Sign In",forgotPassword:"Forgot password?",createAccount:"Create account",verificationCode:"Verification Code",name:"Name",email:"Email",phoneNumber:"Phone Number",password:"Password",changePassword:"Change Password",edit:"Edit",currentPassword:"Current Password",newPassword:"New Password",confirmPassword:"Confirm New Password",updatePassword:"Update Password",verifyCodeReset:"Verify Code & Reset Password",loginAccount:"Login Account"} };
function applyEnglishText() {
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
  document.querySelectorAll("[data-label]").forEach((element) => { const value=translations.en[element.dataset.label]; if(value) element.textContent=value; });
  document.querySelectorAll("[data-placeholder]").forEach((element) => { const value=translations.en[element.dataset.placeholder]; if(value) element.placeholder=value; });
  document.querySelectorAll("[data-aria-label]").forEach((element) => { const value=translations.en[element.dataset.ariaLabel]; if(value) element.setAttribute("aria-label",value); });
}
let runtimeConfig = null;
function applyTheme(theme) {
  const dark = theme === "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  applyRuntimeConfig(runtimeConfig, dark ? "dark" : "light");
  if (themeToggle) {
    const themeIcon = themeToggle.querySelector(".theme-icon");
    if (themeIcon) { themeIcon.replaceChildren(createIcon(dark ? "sun" : "moon")); }
    themeToggle.setAttribute("aria-label", dark ? translations.en.light : translations.en.dark);
  }
  localStorage.setItem("3b-theme", dark ? "dark" : "light");
}
applyEnglishText();
applyTheme(savedTheme === "dark" ? "dark" : "light");
renderSvgIconAttributes(document);
if (themeToggle) themeToggle.addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
const SUPABASE_URL = "https://sburxeuxkrilbfppxylm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_lqGGahZ0ST267jqsI3Zelg_477szacT";
let supabase;

const logoutMenuLink = document.querySelector("#logout-menu-link");

function closeSiteMenu() {
  if (!siteMenu || !menuButton) return;
  siteMenu.hidden = true;
  menuButton.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
}
async function setMenuSession(session) {
  if (accountMenuLink) { accountMenuLink.href=new URL("account/",ROOT_URL).href; accountMenuLink.hidden=Boolean(session); }
  if (profileMenuLink) profileMenuLink.hidden=!session;
  if (logoutMenuLink) logoutMenuLink.hidden=!session;
  if (dashboardMenuLink) { dashboardMenuLink.hidden=true; if(session?.user?.id){const {data,error}=await supabase.from("user_roles").select("role").eq("user_id",session.user.id).eq("role","owner").maybeSingle();if(!error&&data?.role==="owner")dashboardMenuLink.hidden=false;} }
}
// Load authentication separately so a Supabase CDN issue cannot disable the menu.
const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
runtimeConfig = await loadRuntimeConfig(supabase);
await loadSvgIconRegistry(supabase);
renderSvgIconAttributes(document);
applyTheme(savedTheme === "dark" ? "dark" : "light");
applyRuntimeConfig(runtimeConfig, document.documentElement.dataset.theme);

const homeCatalogModules = [
  { key:"services", table:"services", title:"Services", icon:"wrench", published:["status","active"], columns:"name,slug,photo_url" },
  { key:"products", table:"products", title:"Products", icon:"package", published:["status","active"], columns:"name,slug,photo_url" },
  { key:"workshops", table:"workshops", title:"Workshops", icon:"building", published:["status","published"], columns:"name:title,slug,photo_url" },
  { key:"technicians", table:"technicians", title:"Technicians", icon:"technician", published:["is_published",true], columns:"name,slug,photo_url" },
  { key:"contacts", table:"contacts", title:"Contacts", icon:"contact", published:null, columns:"name,slug,value" }
];

function renderHomeCard(module, record) {
  const card=document.createElement("a");
  card.className="home-content-card";
  card.href="/3btechhub/"+module.key+"/"+encodeURIComponent(record.slug||"")+"/";
  const visual=document.createElement("div");
  visual.className="home-content-visual"+(module.key==="technicians"?" home-content-visual--person":"");
  if(module.key==="contacts"){const icon=createContactIcon(record.value,record.name);icon.classList.add("home-content-fallback");visual.append(icon);}else{visual.append(getItemFallbackIcon(record.name||record.title,module.key));}
  if(record.photo_url) {
    const image=document.createElement("img");
    image.src=record.photo_url;
    image.alt="";
    image.loading="lazy";
    image.addEventListener("error",()=>image.remove(),{once:true});
    visual.append(image);
  }
  const body=document.createElement("div");
  body.className="home-content-card-body";
  const title=document.createElement("h3");
  title.textContent=record.name||record.title||"Untitled";
  body.append(title);
  card.append(visual,body);
  return card;
}
function renderHomeMoreCard(module) {
  const card=document.createElement("a");
  card.className="home-content-card home-content-more-card";
  card.href="/3btechhub/"+module.key+"/";
  const visual=document.createElement("div");
  visual.className="home-content-visual";
  visual.append(createIcon("file"));
  const body=document.createElement("div");
  body.className="home-content-card-body";
  const title=document.createElement("h3");
  title.textContent="View All";
  body.append(title);
  card.append(visual,body);
  return card;
}

async function loadHomeCatalog() {
  const root=document.querySelector(".home-catalog");
  if(!root) return;
  for(const module of homeCatalogModules) {
    const target=document.getElementById("home-"+module.key+"-cards");
    if(!target) continue;
    try {
      let query=supabase.from(module.table).select(module.columns).limit(5);
      if(module.published) query=query.eq(module.published[0],module.published[1]);
      const {data,error}=await query;
      if(error) throw error;
      target.replaceChildren();
      if(!data?.length) {
        const empty=document.createElement("p");
        empty.className="home-empty";
        empty.textContent="No "+module.title.toLowerCase()+" available yet.";
        target.append(empty);
        continue;
      }
      data.slice(0,4).forEach(record=>target.append(renderHomeCard(module,record)));
      if(data.length>4){target.replaceChildren(...data.slice(0,3).map(record=>renderHomeCard(module,record)),renderHomeMoreCard(module));}
    } catch(error) {
      console.error("Could not load public "+module.title.toLowerCase()+".",error);
      target.replaceChildren();
      const empty=document.createElement("p");
      empty.className="home-empty";
      empty.textContent="Could not load "+module.title.toLowerCase()+".";
      target.append(empty);
    }
  }
}

async function applyPublicSiteSettings() {
  const [{data,error},{data:sectionsData},{data:introData}] = await Promise.all([
    supabase.from("site_settings").select("setting_value").eq("setting_key","site_profile").eq("is_public",true).maybeSingle(),
    supabase.from("site_settings").select("setting_value").eq("setting_key","home_sections").eq("is_public",true).maybeSingle(),
    supabase.from("site_settings").select("setting_value").eq("setting_key","home_intro").eq("is_public",true).maybeSingle()
  ]);
  const settings=data?.setting_value&&typeof data.setting_value==="object"?data.setting_value:{};
  const sections=sectionsData?.setting_value&&typeof sectionsData.setting_value==="object"?sectionsData.setting_value:{};
  document.querySelectorAll("[data-home-section]").forEach(section=>{const key=section.dataset.homeSection;if(typeof sections[key]==="boolean")section.hidden=!sections[key];});
  const intro=typeof introData?.setting_value?.content==="string"?introData.setting_value.content.trim():"";
  const introSection=document.getElementById("home-intro-section");
  const introContent=document.getElementById("home-intro-content");
  if(introSection&&introContent){introContent.textContent=intro;introSection.hidden=!intro;}
  const websiteTitle = typeof settings.website_title === "string" && settings.website_title.trim()
    ? settings.website_title.trim() : "3B TECH HUB";
  document.querySelectorAll(".brand-title, .home-hero h1, .home-main h1").forEach((node) => { node.textContent = websiteTitle; });
  document.title = websiteTitle;
  const brandLogo = document.querySelector(".brand-logo");
  if (brandLogo) {
    if (typeof settings.logo_url === "string" && /^https?:\/\//i.test(settings.logo_url)) {
      const logo = document.createElement("img");
      logo.src = settings.logo_url;
      logo.alt = websiteTitle;
      logo.className = "brand-image";
      brandLogo.replaceChildren(logo);
    } else {
      const mark=document.createElement("span");
      mark.className="brand-mark";
      mark.textContent="3B";
      brandLogo.replaceChildren(mark);
    }
  }
}

if (logoutMenuLink) logoutMenuLink.addEventListener("click", async () => {
  logoutMenuLink.disabled = true;
  const { error } = await supabase.auth.signOut();
  logoutMenuLink.disabled = false;
  if (!error) {
    setMenuSession(null);
    closeSiteMenu();
    window.navigateSiteRoute(new URL("home/", ROOT_URL).pathname);
  }
});
async function syncAccountMenu() {
  if (!accountMenuLink) return;
  const { data } = await supabase.auth.getSession();
  setMenuSession(data.session);
}
syncAccountMenu();
supabase.auth.onAuthStateChange((_event, session) => {
  setMenuSession(session);
});
const ROOT_URL = new URL("https://3btechhub.github.io/3btechhub/");

export async function initRoutePage() {
  window.__routeAuthSubscriptions?.forEach((subscription) => subscription.unsubscribe());
  window.__routeAuthSubscriptions = [];
  applyEnglishText();
  renderSvgIconAttributes(document);
  const visitorKeyName="3b-visitor-key";let visitorKey=localStorage.getItem(visitorKeyName);if(!visitorKey){visitorKey=crypto.randomUUID();localStorage.setItem(visitorKeyName,visitorKey);}
  const ua=navigator.userAgent,device=/tablet|ipad/i.test(ua)?"tablet":/mobile|android|iphone/i.test(ua)?"mobile":"desktop";
  const os=/android/i.test(ua)?"Android":/iphone|ipad|ios/i.test(ua)?"iOS":/windows/i.test(ua)?"Windows":/mac os/i.test(ua)?"macOS":/linux/i.test(ua)?"Linux":"unknown";
  const browser=/edg\//i.test(ua)?"Edge":/firefox\//i.test(ua)?"Firefox":/chrome\//i.test(ua)?"Chrome":/safari\//i.test(ua)?"Safari":"unknown";
  if(navigator.doNotTrack!=="1") {
    void fetch(SUPABASE_URL+"/functions/v1/visitor-analytics",{
      method:"POST",
      headers:{"apikey":SUPABASE_PUBLISHABLE_KEY,"Content-Type":"application/json"},
      body:JSON.stringify({visitor_key:visitorKey,page_path:location.pathname,referrer:document.referrer||"",device,operating_system:os,browser})
    }).catch(error=>console.debug("Visitor analytics unavailable.",error));
  }
  if(document.querySelector('#app-main[data-view="catalogue"]')){await applyPublicSiteSettings();await initCataloguePage(supabase,document.getElementById("app-main").dataset.module,document.getElementById("app-main").dataset.slug||"");return;}
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
    const labels = translations.en
    submit.textContent = recoveryLink ? labels.updatePassword : recovery ? labels.verifyCodeReset : signup ? labels.createAccount : labels.signIn;
    toggle.textContent = signup ? labels.loginAccount : labels.createAccount;
    toggle.disabled = recovery;
    forgot.disabled = recovery;
    emailInput.readOnly = mode === "recovery";
    otpInput.hidden = mode !== "recovery";
    otpInput.required = mode === "recovery";
    passwordInput.autocomplete = recovery || signup ? "new-password" : "current-password";
    passwordInput.setAttribute("aria-label", recovery ? labels.newPassword : labels.password);
    passwordInput.placeholder = recovery ? labels.newPassword : labels.password;
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
        redirectTo: new URL("account/?recovery=1", ROOT_URL).href,
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
          window.navigateSiteRoute(new URL("profile/", ROOT_URL).pathname);
        } else {
          // With email confirmation enabled, Supabase may return no session for
          // both a new signup and an already-registered email. Try signing in
          // with the exact same credentials: only a matching existing password
          // can establish a session for the existing account.
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
          if (!loginError && loginData.session) {
            showMessage("This email already has an account. You are now logged in to that account.", "success");
            window.navigateSiteRoute(new URL("profile/", ROOT_URL).pathname);
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
        window.navigateSiteRoute(new URL("profile/", ROOT_URL).pathname);
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Authentication failed. Please try again.", "error");
    } finally {
      submit.disabled = false;
    }
  });

  render();
  const recoveryListener = supabase.auth.onAuthStateChange((event, session) => {
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
  window.__routeAuthSubscriptions.push(recoveryListener.data.subscription);
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
      window.navigateSiteRoute(new URL("account/", ROOT_URL).pathname, { replace: true });
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
    if (!session) window.navigateSiteRoute(new URL("account/", ROOT_URL).pathname, { replace: true });
  });
  window.__routeAuthSubscriptions.push(authListener.subscription);
}


// Owner-only dashboard: the database role is checked again on the page itself.
let currentDashboardRole = null;
const ownerDashboard = document.querySelector("#app-main[data-view=\"dashboard\"]");
if (ownerDashboard) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    window.navigateSiteRoute(new URL("account/", ROOT_URL).pathname, { replace: true });
  } else {
    const { data: ownerRole, error: roleError } = await supabase
      .from("user_roles").select("role")
      .eq("user_id", authData.user.id).eq("role", "owner").maybeSingle();
    if (roleError || ownerRole?.role !== "owner") {
      window.navigateSiteRoute(new URL("profile/", ROOT_URL).pathname, { replace: true });
    } else {
      currentDashboardRole = "owner";
      const ownerEmail = document.querySelector("#dashboard-owner-email");
      if (ownerEmail) ownerEmail.textContent = authData.user.email || "";
      const resources = [["user_roles","dashboard-users-count"],["services","dashboard-services-count"],["products","dashboard-products-count"],["workshops","dashboard-workshops-count"],["technicians","dashboard-technicians-count"],["contacts","dashboard-contacts-count"],["app_roles","dashboard-roles-count"],["permissions","dashboard-permissions-count"]];
      const health=document.getElementById("dashboard-health-status");
      if(health){health.replaceChildren();const checks=[["Website","Online",true],["Supabase / Database","Checking…",null],["Authentication","Checking…",null],["Storage","Checking…",null],["Backend services","Checking…",null]];
        const [databaseCheck,authCheck,storageCheck,backendCheck]=await Promise.all([
          supabase.from("site_settings").select("setting_key").limit(1),
          supabase.auth.getUser(),
          supabase.storage.from("site-media").list("",{limit:1}),
          supabase.functions.invoke("owner-users",{body:{action:"health"}})
        ]);
        checks[1]=["Supabase / Database",databaseCheck.error?"Unavailable":"Connected",!databaseCheck.error];
        checks[2]=["Authentication",authCheck.error?"Unavailable":"Available",!authCheck.error];
        checks[3]=["Storage",storageCheck.error?"Unavailable":"Connected",!storageCheck.error];
        checks[4]=["Backend services",backendCheck.error?"Unavailable":"Available",!backendCheck.error];
        for(const [label,value,ok] of checks){const card=document.createElement("section");card.className="dashboard-card";addTextElement(card,"h3","",label);addTextElement(card,"p",ok===true?"health-ok":ok===false?"health-error":"muted",value);health.append(card);}
      }
      const results = await Promise.all(resources.map(async ([table, target]) => {
        const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
        const element = document.getElementById(target);
        if (element) element.textContent = error ? "—" : String(count ?? 0);
        return !error;
      }));
    }
  }
  const dashboardAuthListener = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) window.navigateSiteRoute(new URL("account/", ROOT_URL).pathname, { replace: true });
  });
  window.__routeAuthSubscriptions.push(dashboardAuthListener.data.subscription);
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
  const roles = ["owner", "member", "visitor"];
  for (const role of roles) {
    const row = document.createElement("article");
    row.className = "admin-list-row";
    const count = users.filter((user) => {
      return (user.role || "member") === role;
    }).length;
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

  const roles = ["member", "visitor"];
  for (const user of users) {
    const row = document.createElement("article");
    row.className = "admin-list-row";
    const primary = document.createElement("div");
    addTextElement(primary, "strong", "", user.full_name || user.email || "Unknown user");
    addTextElement(primary, "span", "muted", user.email || "");
    const blocked = Boolean(user.banned_until && new Date(user.banned_until).getTime() > Date.now());
    const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Never signed in";
    addTextElement(primary, "span", "muted", [
      user.role === "owner" ? "Owner" : user.role === "visitor" ? "Visitor" : "Member",
      blocked ? "Blocked" : "Active",
      user.email_confirmed_at ? "Email verified" : "Email not verified",
      user.phone ? "Phone: " + user.phone : "",
      "Created: " + (user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"),
      "Last sign-in: " + lastSignIn,
    ].filter(Boolean).join(" · "));
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
    roleSelect.value = ["member", "visitor"].includes(user.role) ? user.role : "member";
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
  const [{data,error},{data:sectionData},{data:introData}] = await Promise.all([
    supabase.from("site_settings").select("setting_value").eq("setting_key","site_profile").maybeSingle(),
    supabase.from("site_settings").select("setting_value").eq("setting_key","home_sections").maybeSingle(),
    supabase.from("site_settings").select("setting_value").eq("setting_key","home_intro").maybeSingle()
  ]);
  if (error) { if (siteSettingsMessage) siteSettingsMessage.textContent=error.message||"Could not load website settings."; return; }
  const settings=data?.setting_value&&typeof data.setting_value==="object"?data.setting_value:{};
  const sections=sectionData?.setting_value&&typeof sectionData.setting_value==="object"?sectionData.setting_value:{};
  const intro=introData?.setting_value&&typeof introData.setting_value.content==="string"?introData.setting_value.content:"";
  siteSettingsForm.elements.home_intro.value=intro;
  siteSettingsForm.elements.website_title.value=typeof settings.website_title==="string"?settings.website_title:"3B TECH HUB";
  siteSettingsForm.elements.logo_url.value=typeof settings.logo_url==="string"?settings.logo_url:"";
  const preview=document.getElementById("site-logo-preview");
  if(preview&&settings.logo_url){preview.src=settings.logo_url;preview.hidden=false;}
  for(const key of ["services","products","workshops","technicians","contacts"]){const field=siteSettingsForm.elements["section_"+key];if(field)field.checked=sections[key]!==false;}
  if(siteSettingsMessage)siteSettingsMessage.textContent="Website settings loaded.";
}
if(siteSettingsForm){
  document.getElementById("site-logo-remove")?.addEventListener("click",()=>{siteSettingsForm.dataset.removeLogo="true";siteSettingsForm.elements.logo_url.value="";siteSettingsForm.elements.logo_file.value="";const p=document.getElementById("site-logo-preview");if(p){p.removeAttribute("src");p.hidden=true;}});
  siteSettingsForm.elements.logo_file?.addEventListener("change",()=>{const file=siteSettingsForm.elements.logo_file.files?.[0];if(file){const p=document.getElementById("site-logo-preview");if(p){p.src=URL.createObjectURL(file);p.hidden=false;}siteSettingsForm.dataset.removeLogo="false";}});
  siteSettingsForm.addEventListener("submit",async(event)=>{
    event.preventDefault();
    if(currentDashboardRole!=="owner"){if(siteSettingsMessage)siteSettingsMessage.textContent="Owner permission required.";return;}
    const submit=document.getElementById("site-settings-save"),form=new FormData(siteSettingsForm);
    const websiteTitle=String(form.get("website_title")||"").trim()||"3B TECH HUB";
    let logoUrl=String(form.get("logo_url")||"").trim();
    const oldLogoUrl=logoUrl,file=siteSettingsForm.elements.logo_file.files?.[0];
    if(logoUrl){try{if(!["https:","http:"].includes(new URL(logoUrl).protocol))throw new Error("Invalid URL");}catch{if(siteSettingsMessage)siteSettingsMessage.textContent="Logo URL must be a valid HTTP(S) address.";return;}}
    if(submit)submit.disabled=true;if(siteSettingsMessage)siteSettingsMessage.textContent="Saving website settings…";
    try{
      const {data:authData,error:authError}=await supabase.auth.getUser();if(authError||!authData.user)throw new Error("Your session has expired. Sign in again.");
      if(file){if(!file.type.startsWith("image/")||file.size>5*1024*1024)throw new Error("Choose an image up to 5 MB.");const path="branding/"+crypto.randomUUID()+"-"+file.name.replace(/[^a-zA-Z0-9._-]/g,"-");const {error:uploadError}=await supabase.storage.from("site-media").upload(path,file,{cacheControl:"3600",contentType:file.type});if(uploadError)throw uploadError;logoUrl=supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;}
      if(siteSettingsForm.dataset.removeLogo==="true")logoUrl="";
      const {error}=await supabase.from("site_settings").upsert({setting_key:"site_profile",setting_value:{website_title:websiteTitle,logo_url:logoUrl},is_public:true,updated_by:authData.user.id},{onConflict:"setting_key"});if(error)throw error;
      const homeSections={};for(const key of ["services","products","workshops","technicians","contacts"])homeSections[key]=Boolean(siteSettingsForm.elements["section_"+key]?.checked);
      const {error:sectionError}=await supabase.from("site_settings").upsert({setting_key:"home_sections",setting_value:homeSections,is_public:true,updated_by:authData.user.id},{onConflict:"setting_key"});if(sectionError)throw sectionError;
      const homeIntro=String(form.get("home_intro")||"").trim();
      const {error:introError}=await supabase.from("site_settings").upsert({setting_key:"home_intro",setting_value:{content:homeIntro},is_public:true,updated_by:authData.user.id},{onConflict:"setting_key"});if(introError)throw introError;
      if(oldLogoUrl&&oldLogoUrl!==logoUrl){try{await removeStoredImage(oldLogoUrl);}catch(cleanupError){console.warn("Old logo cleanup failed.",cleanupError);}}
      siteSettingsForm.dataset.removeLogo="false";if(siteSettingsMessage)siteSettingsMessage.textContent="Website settings saved.";
    }catch(error){if(siteSettingsMessage)siteSettingsMessage.textContent=error.message||"Could not save website settings.";}
    finally{if(submit)submit.disabled=false;}
  });
}
if(siteSettingsForm)void loadSiteSettingsForm();


// Core content modules: each module uses its existing Supabase table and RLS policies.
const sharedDetailFields = [
  ["short_info","Short one-line information","text",false],
  ["description","Detailed description","textarea",false],
  ["service_information","Information / Features (one item per line)","textarea",false],
  ["photo_url","Main image","file",false],
  ["gallery_urls","Additional gallery images (multiple)","files",false],
  ["location","Location / Address","text",false],
  ["map_url","Map URL (optional)","url",false],
  ["phone","Phone number","tel",false],
  ["whatsapp","WhatsApp number or link","text",false]
];
const dashboardContentModules = {
  services: { table:"services", title:"Service", fields:[
    ["name","Name","text",true],["slug","Slug","text",true],...sharedDetailFields,
    ["category","Category","text",false],["visibility","Visibility","select",false,["visible","hidden"]]
  ], columns:["slug","category","visibility"] },
  products: { table:"products", title:"Product", fields:[
    ["name","Name","text",true],["slug","Slug","text",true],...sharedDetailFields,
    ["category","Category","text",false],["visibility","Visibility","select",false,["visible","hidden"]]
  ], columns:["slug","category","visibility"] },
  workshops: { table:"workshops", title:"Workshop", fields:[
    ["name","Name","text",true],["slug","Slug","text",true],...sharedDetailFields,
    ["technician","Technician / Trainer","text",false],["category","Category","text",false],
    ["visibility","Visibility","select",false,["visible","hidden"]]
  ], columns:["slug","location","technician","category","visibility"] },
  technicians: { table:"technicians", title:"Technician", fields:[
    ["name","Name","text",true],["slug","Slug","text",true],...sharedDetailFields,
    ["skill","Skill","text",false],["category","Category","text",false],
    ["visibility","Visibility","select",false,["visible","hidden"]]
  ], columns:["slug","skill","category","visibility"] }
};

function moduleLabel(value) {
  if (typeof value === "boolean") return value ? "Visible" : "Hidden";
  if (value == null || value === "") return "—";
  return String(value);
}
function slugFromName(value) {
  return String(value || "").normalize("NFKC").trim().toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
}
function moduleDatabaseKey(moduleName,key) {
  if (moduleName === "workshops" && key === "name") return "title";
  if (moduleName === "workshops" && key === "technician") return "trainer";
  return key;
}
function recordVisibility(moduleName,record) {
  if (moduleName === "technicians") return record.is_published ? "visible" : "hidden";
  if (moduleName === "workshops") return record.status === "published" ? "visible" : "hidden";
  return record.status === "active" ? "visible" : "hidden";
}
function storagePathFromUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const marker = "/storage/v1/object/public/site-media/";
    const index = parsed.pathname.indexOf(marker);
    return index < 0 ? "" : decodeURIComponent(parsed.pathname.slice(index + marker.length));
  } catch { return ""; }
}
async function removeStoredImage(url) {
  const path = storagePathFromUrl(url);
  if (!path) return;
  const { error } = await supabase.storage.from("site-media").remove([path]);
  if (error) throw error;
}
function updateImagePreview(form,url) {
  const preview = form.querySelector(".module-image-preview");
  const remove = form.querySelector("[data-image-remove]");
  if (preview) {
    if (url) { preview.src=url; preview.hidden=false; }
    else { preview.removeAttribute("src"); preview.hidden=true; }
  }
  if (remove) remove.hidden=!url;
}
function createModuleField(field) {
  const [name,label,type,required,options] = field;
  const wrapper = document.createElement("label");
  wrapper.className = "module-form-field";
  let control;
  if (type === "textarea") { control=document.createElement("textarea"); control.rows=3; }
  else if (type === "select") {
    control=document.createElement("select");
    const blank=document.createElement("option"); blank.value=""; blank.textContent="— Select —"; control.append(blank);
    for (const value of options || []) {
      const option=document.createElement("option"); option.value=value; option.textContent=value==="visible"?"Visible":value==="hidden"?"Hidden":value; control.append(option);
    }
  } else {
    control=document.createElement("input"); control.type=type;
    if (type==="file" || type==="files") control.accept="image/jpeg,image/png,image/webp,image/avif,image/gif";
    if (type==="files") control.multiple=true;
  }
  control.name=name; control.required=Boolean(required);
  if (type === "files") {
    wrapper.append(addTextElement(wrapper,"span","",label),control,addTextElement(wrapper,"small","muted","Select multiple images. New uploads are added to the existing gallery."));
  } else if (type === "file") {
    wrapper.append(addTextElement(wrapper,"span","",label),control);
    const preview=document.createElement("img"); preview.className="module-image-preview"; preview.alt=label+" preview"; preview.hidden=true;
    const remove=document.createElement("button"); remove.type="button"; remove.className="secondary-button"; remove.textContent="Remove image"; remove.dataset.imageRemove="true"; remove.hidden=true;
    control.addEventListener("change",()=>{
      const form=wrapper.closest("form");
      const file=control.files?.[0];
      if (file) {
        preview.src=URL.createObjectURL(file); preview.hidden=false; remove.hidden=false;
        if (form) form.dataset.removePhoto="false";
      }
    });
    remove.addEventListener("click",()=>{
      control.value=""; const form=wrapper.closest("form");
      if (form) form.dataset.removePhoto="true";
      updateImagePreview(form || wrapper, "");
    });
    wrapper.append(preview,remove);
  } else if (type === "checkbox") {
    wrapper.classList.add("module-checkbox-field"); control.setAttribute("aria-label",label); wrapper.append(control);
    addTextElement(wrapper,"span","",label);
  } else {
    addTextElement(wrapper,"span","",label); wrapper.append(control);
  }
  return wrapper;
}
function setModuleMessage(moduleName,message,kind="") {
  const node=document.querySelector('[data-module-message="'+moduleName+'"]');
  if (node) { node.textContent=message; node.dataset.kind=kind; }
}
function resetModuleForm(moduleName) {
  const form=document.querySelector('[data-module-form="'+moduleName+'"]');
  if (!form) return;
  form.reset(); form.dataset.editId=""; form.dataset.currentPhotoUrl=""; form.dataset.currentGalleryUrls="[]"; form.dataset.removePhoto="false"; form.dataset.currentGalleryUrls="[]"; form.dataset.slugManual="false";
  updateImagePreview(form,"");
  const config=dashboardContentModules[moduleName];
  document.querySelector('[data-module-form-title="'+moduleName+'"]').textContent="Add "+config.title;
  document.querySelector('[data-module-submit="'+moduleName+'"]').textContent="Save "+config.title;
  document.querySelector('[data-module-cancel="'+moduleName+'"]').hidden=true;
}
function createModuleRecordVisual(moduleName,photoUrl,record) {
  const visual=document.createElement("span");
  visual.className="module-record-visual";
  const icon=getItemFallbackIcon(record?.name||record?.title||moduleName,moduleName);
  if(moduleName==="technicians")icon.classList.add("module-record-fallback--person");
  const image=document.createElement("img");
  image.className="module-record-image";
  image.alt="";
  image.loading="lazy";
  image.hidden=!photoUrl;
  icon.hidden=Boolean(photoUrl);
  image.addEventListener("error",()=>{image.hidden=true;icon.hidden=false;});
  if(photoUrl)image.src=photoUrl;
  visual.append(image,icon);
  return visual;
}
function renderModuleList(moduleName,records) {
  const config=dashboardContentModules[moduleName];
  const container=document.querySelector('[data-module-list="'+moduleName+'"]');
  if (!container) return;
  container.replaceChildren();
  if (!records.length) { addTextElement(container,"p","muted","No records found. Use the form above to add one."); return; }
  for (const record of records) {
    const row=document.createElement("article"); row.className="admin-list-row module-record-row";
    const primary=document.createElement("div");
    primary.className="module-record-primary";
    primary.append(createModuleRecordVisual(moduleName,record.photo_url,record));
    const textContent=document.createElement("div"); textContent.className="module-record-text";
    addTextElement(textContent,"strong","",record.name||record.title||record.slug||"Untitled");
    const details=config.columns.map((key)=>{
      const value=key==="visibility"?recordVisibility(moduleName,record)
        :key==="technician"?record.trainer:record[key];
      return key.replaceAll("_"," ")+": "+moduleLabel(value);
    }).join(" · ");
    addTextElement(textContent,"span","muted",details);
    primary.append(textContent);
    row.append(primary);
    const actions=document.createElement("div"); actions.className="editor-actions";
    const edit=document.createElement("button"); edit.type="button"; edit.className="secondary-button"; edit.textContent="Edit";
    edit.addEventListener("click",()=>{
      const form=document.querySelector('[data-module-form="'+moduleName+'"]'); form.dataset.editId=record.id;
      form.dataset.currentPhotoUrl=record.photo_url||""; form.dataset.currentGalleryUrls=JSON.stringify(record.gallery_urls||[]); form.dataset.removePhoto="false"; form.dataset.slugManual="false";
      for (const [key] of config.fields) {
        const input=form.elements.namedItem(key); if (!input) continue;
        if (key==="visibility") input.value=recordVisibility(moduleName,record);
        else if (key==="name") input.value=record.name||record.title||"";
        else if (key==="technician") input.value=record.trainer||"";
        else if (key==="photo_url" || key==="gallery_urls") input.value="";
        else if (key==="service_information") input.value=Array.isArray(record.service_information)?record.service_information.join("\n"):"";
        else input.value=record[moduleDatabaseKey(moduleName,key)]==null?"":String(record[moduleDatabaseKey(moduleName,key)]);
      }
      updateImagePreview(form,record.photo_url||"");
      document.querySelector('[data-module-form-title="'+moduleName+'"]').textContent="Edit "+config.title;
      document.querySelector('[data-module-submit="'+moduleName+'"]').textContent="Update "+config.title;
      document.querySelector('[data-module-cancel="'+moduleName+'"]').hidden=false;
      setModuleMessage(moduleName,""); form.scrollIntoView({behavior:"smooth",block:"start"});
    });
    const remove=document.createElement("button"); remove.type="button"; remove.className="secondary-button"; remove.textContent="Delete";
    remove.addEventListener("click",async()=>{
      const displayName=record.name||record.title||record.slug||"this record";
      if (!window.confirm('Delete "'+displayName+'"? This cannot be undone.')) return;
      remove.disabled=true;
      try {
        const {error}=await supabase.from(config.table).delete().eq("id",record.id);
        if (error) throw error;
        await removeStoredImage(record.photo_url);
        for(const url of (record.gallery_urls||[])){try{await removeStoredImage(url);}catch(cleanupError){console.warn("Gallery image cleanup failed.",cleanupError);}}
        setModuleMessage(moduleName,config.title+" deleted.","success"); await loadContentModule(moduleName);
      } catch(error) { setModuleMessage(moduleName,error.message||"Could not delete this record.","error"); remove.disabled=false; }
    });
    actions.append(edit,remove); row.append(actions); container.append(row);
  }
}
async function loadContentModule(moduleName) {
  if (!ownerDashboard || currentDashboardRole !== "owner") return;
  const config=dashboardContentModules[moduleName];
  const container=document.querySelector('[data-module-list="'+moduleName+'"]');
  if (container) { container.replaceChildren(); addTextElement(container,"p","muted","Loading records…"); }
  const {data,error}=await supabase.from(config.table).select("*").order("created_at",{ascending:false});
  if (error) {
    if (container) { container.replaceChildren(); addTextElement(container,"p","muted",error.message||"Could not load records."); }
    return;
  }
  renderModuleList(moduleName,data||[]);
}
for (const [moduleName,config] of Object.entries(dashboardContentModules)) {
  const fieldsHost=document.querySelector('[data-module-fields="'+moduleName+'"]');
  const form=document.querySelector('[data-module-form="'+moduleName+'"]');
  if (!fieldsHost||!form) continue;
  for (const field of config.fields) fieldsHost.append(createModuleField(field));
  const nameInput=form.elements.namedItem("name");
  const slugInput=form.elements.namedItem("slug");
  if (nameInput&&slugInput) {
    nameInput.addEventListener("input",()=>{
      if (form.dataset.slugManual!=="true") slugInput.value=slugFromName(nameInput.value);
    });
    slugInput.addEventListener("input",()=>{ form.dataset.slugManual="true"; });
  }
  form.dataset.removePhoto="false"; form.dataset.slugManual="false";
  form.addEventListener("submit",async(event)=>{
    event.preventDefault();
    if (currentDashboardRole !== "owner") { setModuleMessage(moduleName,"Owner permission required.","error"); return; }
    const submit=document.querySelector('[data-module-submit="'+moduleName+'"]'); submit.disabled=true; setModuleMessage(moduleName,"Saving…");
    let uploadedUrl="", oldPhotoUrl=form.dataset.currentPhotoUrl||"", saved=false;
    try {
      const payload={};
      for (const [key] of config.fields) {
        const input=form.elements.namedItem(key); if (!input || key==="photo_url" || key==="gallery_urls" || key==="visibility") continue;
        const dbKey=moduleDatabaseKey(moduleName,key);
        if(key==="service_information") payload[dbKey]=input.value.split(/\\r?\\n/).map(value=>value.trim()).filter(Boolean);
        else payload[dbKey]=input.value.trim()===""?null:input.value.trim();
      }
      const nameValue=String(nameInput?.value||"").trim();
      const slugValue=String(slugInput?.value||"").trim()||slugFromName(nameValue);
      if (!nameValue || !slugValue) throw new Error("Name and Slug are required.");
      payload[moduleDatabaseKey(moduleName,"name")]=nameValue;
      payload.slug=slugValue;
      if (moduleName==="services"||moduleName==="products") payload.description=payload.description||"";
      const visibility=form.elements.namedItem("visibility")?.value||"hidden";
      if (moduleName==="technicians") payload.is_published=visibility==="visible";
      else payload.status=visibility==="visible"?(moduleName==="workshops"?"published":"active"):"draft";
      const galleryInput=form.elements.namedItem("gallery_urls");
      const galleryUrls=JSON.parse(form.dataset.currentGalleryUrls||"[]");
      if(galleryInput?.files?.length){
        for(const file of Array.from(galleryInput.files)){
          if(!file.type.startsWith("image/")) throw new Error("Please select image files only.");
          if(file.size>10*1024*1024) throw new Error("Each gallery image must be 10 MB or smaller.");
          const safeName=file.name.normalize("NFKD").replace(/[^\\w.-]+/g,"-").replace(/^-+|-+$/g,"")||"image";
          const path="content/"+moduleName+"/gallery/"+crypto.randomUUID()+"-"+safeName;
          const {error:uploadError}=await supabase.storage.from("site-media").upload(path,file,{cacheControl:"3600",contentType:file.type,upsert:false});
          if(uploadError) throw uploadError;
          galleryUrls.push(supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl);
        }
      }
      payload.gallery_urls=galleryUrls;
      const imageInput=form.elements.namedItem("photo_url");
      if (imageInput?.files?.[0]) {
        const file=imageInput.files[0];
        if (!file.type.startsWith("image/")) throw new Error("Please select an image file.");
        if (file.size>10*1024*1024) throw new Error("Image must be 10 MB or smaller.");
        const safeName=file.name.normalize("NFKD").replace(/[^\w.-]+/g,"-").replace(/^-+|-+$/g,"")||"image";
        const path="content/"+moduleName+"/"+crypto.randomUUID()+"-"+safeName;
        const {error:uploadError}=await supabase.storage.from("site-media").upload(path,file,{cacheControl:"3600",contentType:file.type,upsert:false});
        if (uploadError) throw uploadError;
        uploadedUrl=supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;
        payload.photo_url=uploadedUrl;
      } else if (form.dataset.removePhoto==="true") payload.photo_url=null;
      const editId=form.dataset.editId; let result;
      if (editId) result=await supabase.from(config.table).update(payload).eq("id",editId);
      else {
        const {data:authData}=await supabase.auth.getUser();
        if (moduleName==="workshops"&&authData?.user?.id) { payload.created_by=authData.user.id; payload.updated_by=authData.user.id; }
        result=await supabase.from(config.table).insert(payload);
      }
      if (result.error) throw result.error;
      saved=true;
      const nextPhotoUrl=payload.photo_url===undefined?oldPhotoUrl:payload.photo_url;
      if (oldPhotoUrl&&oldPhotoUrl!==nextPhotoUrl) {
        try { await removeStoredImage(oldPhotoUrl); } catch (cleanupError) { console.warn("Old image cleanup failed.",cleanupError); }
      }
      resetModuleForm(moduleName); setModuleMessage(moduleName,config.title+(editId?" updated.":" created."),"success");
      await loadContentModule(moduleName);
    } catch(error) {
      if (uploadedUrl&&!saved) { try { await removeStoredImage(uploadedUrl); } catch {} }
      setModuleMessage(moduleName,error.message||"Could not save this record.","error");
    } finally { submit.disabled=false; }
  });
  document.querySelector('[data-module-cancel="'+moduleName+'"]')?.addEventListener("click",()=>resetModuleForm(moduleName));
  document.querySelector('[data-module-refresh="'+moduleName+'"]')?.addEventListener("click",()=>void loadContentModule(moduleName));
  document.querySelector('[data-dashboard-tab="'+moduleName+'"]')?.addEventListener("click",()=>void loadContentModule(moduleName));
}

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
  if (!auditList || currentDashboardRole !== "owner") return;
  auditList.replaceChildren();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id,actor_id,action,resource_type,resource_id,metadata,result,device,created_at")
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
    const detail = [entry.actor_id ? "Actor: " + entry.actor_id : "",entry.resource_id ? "Record: " + entry.resource_id : "",entry.result || "success",entry.device || "unknown",entry.created_at ? new Date(entry.created_at).toLocaleString() : ""].filter(Boolean).join(" · ");
    addTextElement(row, "span", "muted", detail);
    auditList.append(row);
  }
}
document.querySelector('[data-dashboard-tab="audit"]')?.addEventListener("click", () => void loadAuditLogs());
document.querySelector("#audit-refresh")?.addEventListener("click", () => void loadAuditLogs());


// Initialize extended Owner-only modules after core dashboard handlers.
if(ownerDashboard&&currentDashboardRole==="owner")initExtendedDashboard(supabase,currentDashboardRole);

// Load only published records for the five public homepage sections.
void applyPublicSiteSettings();
  void loadHomeCatalog();
}
