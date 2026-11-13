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

const translations = { en: {home:"Home",profile:"Profile",login:"Login",logout:"Logout",dashboard:"Dashboard",accountLogin:"Account login",dark:"Switch to dark mode",light:"Switch to light mode",services:"Services",products:"Products",workshops:"Workshops",technicians:"Technicians",contacts:"Contacts",user:"User",role:"Role",permission:"Permission",settings:"Settings",users:"Users",refresh:"Refresh",inviteUser:"Invite User",userType:"User Type",emailAddress:"Email Address",sendInvitation:"Send Invitation",refreshUsers:"Refresh Users",userList:"User List",roleAssignments:"Role Assignments",permissionMatrix:"Permission Matrix",websiteSettings:"Website Settings",websiteTitle:"Website Title",logoUrl:"Logo URL (optional)",saveSettings:"Save Settings",signIn:"Sign In",forgotPassword:"Forgot password?",createAccount:"Create account",verificationCode:"Verification Code",name:"Name",email:"Email",phoneNumber:"Phone Number",password:"Password",changePassword:"Change Password",edit:"Edit",currentPassword:"Current Password",newPassword:"New Password",confirmPassword:"Confirm New Password",updatePassword:"Update Password",verifyCodeReset:"Verify Code & Reset Password",loginAccount:"Login Account"} };
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
  if(introSection&&introContent){introContent.textContent=intro;introSection.hidden=!intro||sections.intro===false;}
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


// User administration is handled by the shared Users module in admin-extended.js.
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
  for(const key of ["intro","services","products","workshops","technicians","contacts"]){const field=siteSettingsForm.elements["section_"+key];if(field)field.checked=sections[key]!==false;}
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
      if(file){if(!file.type.startsWith("image/")||file.size>5*1024*1024)throw new Error("Choose an image up to 5 MB.");const path="branding/"+crypto.randomUUID()+"-"+file.name.replace(/[^\w.-]+/g,"-");const {error:uploadError}=await supabase.storage.from("site-media").upload(path,file,{cacheControl:"3600",contentType:file.type});if(uploadError)throw uploadError;logoUrl=supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;}
      if(siteSettingsForm.dataset.removeLogo==="true")logoUrl="";
      const {error}=await supabase.from("site_settings").upsert({setting_key:"site_profile",setting_value:{website_title:websiteTitle,logo_url:logoUrl},is_public:true,updated_by:authData.user.id},{onConflict:"setting_key"});if(error)throw error;
      const homeSections={};for(const key of ["intro","services","products","workshops","technicians","contacts"])homeSections[key]=Boolean(siteSettingsForm.elements["section_"+key]?.checked);
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
const dashboardContentModules = {
  services: { table:"services", title:"Service", fields:[
    ["name","Name","text",true],["slug","Slug","text",true],["country","Countries","countries",false],
    ["images","Images","files",false],["products","Products","multiselect",false],
    ["workshops","Workshops","multiselect",false],["technicians","Technicians","multiselect",false],
    ["visibility","Visibility","select",false,["visible","hidden"]]
  ], columns:["country","visibility"] },
  products: { table:"products", title:"Product", fields:[
    ["name","Name","text",true],["slug","Slug","text",true],["country","Countries","countries",false],
    ["images","Images","files",false],["workshops","Workshops","multiselect",false],
    ["technicians","Technicians","multiselect",false],["visibility","Visibility","select",false,["visible","hidden"]]
  ], columns:["country","visibility"] },
  workshops: { table:"workshops", title:"Workshop", fields:[
    ["name","Name","text",true],["slug","Slug","text",true],["country","Countries","countries",false],
    ["images","Images","files",false],["location","Location","text",false],["address","Address","text",false],
    ["services","Services","multiselect",false],["products","Products","multiselect",false],
    ["technicians","Technicians","multiselect",false],["visibility","Visibility","select",false,["visible","hidden"]]
  ], columns:["country","location","address","visibility"] },
  technicians: { table:"technicians", title:"Technician", fields:[
    ["name","Name","text",true],["slug","Slug","text",true],["country","Countries","countries",false],
    ["images","Images","files",false],["skill","Skill / Expertise","text",false],
    ["services","Services","multiselect",false],["workshops","Workshops","multiselect",false],
    ["phone","Phone","tel",false],["whatsapp","WhatsApp","text",false],["email","Email","email",false],
    ["visibility","Visibility","select",false,["visible","hidden"]]
  ], columns:["country","skill","visibility"] }
};
const moduleRelationships = {
  services: {
    products:{table:"service_products",parent:"service_id",child:"product_id",target:"products",label:"name",filter:["status","active"]},
    workshops:{table:"service_workshops",parent:"service_id",child:"workshop_id",target:"workshops",label:"title",filter:["status","published"]},
    technicians:{table:"service_technicians",parent:"service_id",child:"technician_id",target:"technicians",label:"name",filter:["is_published",true]}
  },
  products: {
    workshops:{table:"product_workshops",parent:"product_id",child:"workshop_id",target:"workshops",label:"title",filter:["status","published"]},
    technicians:{table:"product_technicians",parent:"product_id",child:"technician_id",target:"technicians",label:"name",filter:["is_published",true]}
  },
  workshops: {
    services:{table:"service_workshops",parent:"workshop_id",child:"service_id",target:"services",label:"name",filter:["status","active"]},
    products:{table:"product_workshops",parent:"workshop_id",child:"product_id",target:"products",label:"name",filter:["status","active"]},
    technicians:{table:"workshop_technicians",parent:"workshop_id",child:"technician_id",target:"technicians",label:"name",filter:["is_published",true]}
  },
  technicians: {
    services:{table:"service_technicians",parent:"technician_id",child:"service_id",target:"services",label:"name",filter:["status","active"]},
    workshops:{table:"workshop_technicians",parent:"technician_id",child:"workshop_id",target:"workshops",label:"title",filter:["status","published"]}
  }
};


async function loadModuleRelationOptions(moduleName,form) {
  const config=moduleRelationships[moduleName]||{};
  for(const [key,rel] of Object.entries(config)){
    const host=form.querySelector('[data-related-options="'+key+'"]');
    if(!host)continue;
    const {data,error}=await supabase.from(rel.target).select("id,"+rel.label).order(rel.label);
    host.replaceChildren();
    if(error){addTextElement(host,"small","muted","Could not load options.");continue;}
    for(const record of data||[]){
      const label=document.createElement("label");label.className="module-related-option";
      const checkbox=document.createElement("input");checkbox.type="checkbox";checkbox.value=record.id;checkbox.dataset.relatedId=record.id;
      label.append(checkbox,document.createTextNode(record[rel.label]||"Untitled"));host.append(label);
    }
    if(!host.childElementCount)addTextElement(host,"small","muted","No available records yet.");
  }
}
async function loadModuleRelationSelection(moduleName,recordId,form){
  const config=moduleRelationships[moduleName]||{};
  for(const [key,rel] of Object.entries(config)){
    const {data,error}=await supabase.from(rel.table).select(rel.child).eq(rel.parent,recordId);
    if(error)throw error;
    const selected=new Set((data||[]).map(row=>row[rel.child]));
    form.querySelectorAll('[data-related-options="'+key+'"] input[data-related-id]').forEach(input=>{input.checked=selected.has(input.dataset.relatedId);});
  }
}
async function saveModuleRelationships(moduleName,recordId,form){
  const config=moduleRelationships[moduleName]||{};
  for(const [key,rel] of Object.entries(config)){
    const host=form.querySelector('[data-related-options="'+key+'"]');
    const ids=host?[...host.querySelectorAll('input[data-related-id]:checked')].map(input=>input.dataset.relatedId):[];
    const {error:deleteError}=await supabase.from(rel.table).delete().eq(rel.parent,recordId);
    if(deleteError)throw deleteError;
    if(ids.length){
      const rows=ids.map(id=>({[rel.parent]:recordId,[rel.child]:id}));
      const {error}=await supabase.from(rel.table).insert(rows);
      if(error)throw error;
    }
  }
}
function moduleLabel(value) {
  if (typeof value === "boolean") return value ? "Visible" : "Hidden";
  if (value == null || value === "") return "—";
  return String(value);
}
function slugFromName(value) {
  return String(value || "").normalize("NFKC").trim().toLocaleLowerCase()
    .replace(/[^\w.-]+/gu, "-").replace(/^-+|-+$/g, "");
}
function moduleDatabaseKey(moduleName,key) {
  if (moduleName === "workshops" && key === "name") return "title";
  if (moduleName === "workshops" && key === "technician") return "trainer";
  if (moduleName === "products" && key === "price") return "price_minor";
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
  else if (type === "countries") {
    const host=document.createElement("div");host.className="module-related-options";host.dataset.countryOptions="true";
    for(const value of ["Global","Bangladesh","Saudi Arabia"]){
      const option=document.createElement("label");option.className="module-related-option";
      const checkbox=document.createElement("input");checkbox.type="checkbox";checkbox.value=value;checkbox.dataset.countryValue=value;
      option.append(checkbox,document.createTextNode(value));host.append(option);
    }
    wrapper.append(addTextElement(wrapper,"span","",label),host);
    return wrapper;
  }
  else if (type === "multiselect") {
    const relatedWrapper=document.createElement("div");
    relatedWrapper.className="module-form-field module-related-field";
    addTextElement(relatedWrapper,"span","",label);
    const host=document.createElement("div");host.className="module-related-options";host.dataset.relatedOptions=name;
    host.append(addTextElement(host,"small","muted","Options load when this module opens."));
    relatedWrapper.append(host);
    return relatedWrapper;
  }
  else if (type === "select") {
    control=document.createElement("select");
    const blank=document.createElement("option"); blank.value=""; blank.textContent="— Select —"; control.append(blank);
    for (const value of options || []) {
      const option=document.createElement("option"); option.value=value; option.textContent=value==="visible"?"Visible":value==="hidden"?"Hidden":value; control.append(option);
    }
  } else {
    control=document.createElement("input"); control.type=type==="files"?"file":type;
    if (type==="file" || type==="files") control.accept="image/jpeg,image/png,image/webp,image/avif,image/gif";
    if (type==="files") control.multiple=true;
    if (type==="number") { control.min="0"; control.step=name==="price"?"0.01":"1"; }
    if (name==="currency") control.value="SAR";
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
  const deleteButton=form.querySelector("[data-inline-delete]");
  if(deleteButton)deleteButton.remove();
  if(form._moduleFormPlaceholder?.parentNode){
    form._moduleFormPlaceholder.parentNode.insertBefore(form,form._moduleFormPlaceholder);
  }
  form.reset(); form.dataset.editId=""; form.dataset.currentPhotoUrl=""; form.dataset.currentGalleryUrls="[]"; form.dataset.removePhoto="false"; form.dataset.slugManual="false";
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
async function renderModuleList(moduleName,records) {
  const config=dashboardContentModules[moduleName];
  const form=document.querySelector('[data-module-form="'+moduleName+'"]');
  if(form)await loadModuleRelationOptions(moduleName,form);
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
    row.append(textContent);
    row.classList.add("module-record-row--tap-edit");
    row.tabIndex=0;
    row.setAttribute("role","button");
    row.setAttribute("aria-label","Edit "+(record.name||record.title||record.slug||config.title));
    const openInlineEditor=async()=>{
      const form=document.querySelector('[data-module-form="'+moduleName+'"]');
      if(form.dataset.editId===record.id)return;
      if(form.dataset.editId)resetModuleForm(moduleName);
      form.dataset.editId=record.id;
      form.dataset.currentPhotoUrl=record.photo_url||"";
      form.dataset.currentGalleryUrls=JSON.stringify([...new Set([record.photo_url,...(record.gallery_urls||[])].filter(Boolean))]);
      form.dataset.removePhoto="false";form.dataset.slugManual="false";
      for(const [key] of config.fields){
        const input=form.elements.namedItem(key);if(!input)continue;
        if(key==="visibility")input.value=recordVisibility(moduleName,record);
        else if(key==="price")input.value=record.price_minor==null?"":String(Number(record.price_minor)/100);
        else if(key==="name")input.value=record.name||record.title||"";
        else if(key==="technician")input.value=record.trainer||"";
        else if(key==="images")input.value="";
        else if(key==="country"){const selected=String(record.country||"").split(",").map(value=>value.trim());form.querySelectorAll("[data-country-value]").forEach(box=>{box.checked=selected.includes(box.dataset.countryValue);});}
        else if(key==="service_information")input.value=Array.isArray(record.service_information)?record.service_information.join("\n"):"";
        else input.value=record[moduleDatabaseKey(moduleName,key)]==null?"":String(record[moduleDatabaseKey(moduleName,key)]);
      }
      updateImagePreview(form,record.photo_url||"");
      try{await loadModuleRelationSelection(moduleName,record.id,form);}
      catch(error){resetModuleForm(moduleName);setModuleMessage(moduleName,error.message||"Could not load related records.","error");return;}
      document.querySelector('[data-module-form-title="'+moduleName+'"]').textContent="Edit "+config.title;
      document.querySelector('[data-module-submit="'+moduleName+'"]').textContent="Save";
      document.querySelector('[data-module-cancel="'+moduleName+'"]').textContent="Cancel";
      document.querySelector('[data-module-cancel="'+moduleName+'"]').hidden=false;
      const actions=form.querySelector(".editor-actions");
      const deleteButton=document.createElement("button");
      deleteButton.type="button";deleteButton.className="secondary-button";deleteButton.textContent="Delete";deleteButton.dataset.inlineDelete="true";
      deleteButton.addEventListener("click",async()=>{
        const displayName=record.name||record.title||record.slug||"this record";
        if(!window.confirm('Delete "'+displayName+'"? This cannot be undone.'))return;
        deleteButton.disabled=true;
        try{
          const {error}=await supabase.from(config.table).delete().eq("id",record.id);
          if(error)throw error;
          for(const url of [...new Set([record.photo_url,...(record.gallery_urls||[])].filter(Boolean))]){
            try{await removeStoredImage(url);}catch(cleanupError){console.warn("Image cleanup failed.",cleanupError);}
          }
          resetModuleForm(moduleName);
          setModuleMessage(moduleName,config.title+" deleted.","success");
          await loadContentModule(moduleName);
        }catch(error){setModuleMessage(moduleName,error.message||"Could not delete this record.","error");deleteButton.disabled=false;}
      });
      actions.append(deleteButton);
      // Keep the shared create/update form in its original position above the list.
      // Selecting a record only loads its values into that form.
      setModuleMessage(moduleName,"");
      form.scrollIntoView({behavior:"smooth",block:"start"});
    };
    row.addEventListener("click",event=>{
      if(event.target.closest("form"))return;
      openInlineEditor();
    });
    row.addEventListener("keydown",event=>{
      if(event.target!==row)return;
      if(event.key==="Enter"||event.key===" "){event.preventDefault();openInlineEditor();}
    });
    container.append(row);
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
  await renderModuleList(moduleName,data||[]);
}
for (const [moduleName,config] of Object.entries(dashboardContentModules)) {
  const fieldsHost=document.querySelector('[data-module-fields="'+moduleName+'"]');
  const form=document.querySelector('[data-module-form="'+moduleName+'"]');
  if (!fieldsHost||!form) continue;
  for (const field of config.fields) fieldsHost.append(createModuleField(field));
  if(!form._moduleFormPlaceholder){
    const marker=document.createComment("module-form-home");
    form.parentNode.insertBefore(marker,form);
    form._moduleFormPlaceholder=marker;
  }
  await loadModuleRelationOptions(moduleName,form);
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
    let uploadedUrls=[], saved=false;
    try {
      const payload={};
      for (const [key] of config.fields) {
        const input=form.elements.namedItem(key); if ((!input && key!=="country") || key==="images" || key==="visibility" || moduleRelationships[moduleName]?.[key]) continue;
        const dbKey=moduleDatabaseKey(moduleName,key);
        if(key==="country"){payload[dbKey]=[...form.querySelectorAll("[data-country-value]:checked")].map(box=>box.dataset.countryValue).join(", ")||null;continue;}
        if(key==="service_information") payload[dbKey]=input.value.split(/\r?\n/).map(value=>value.trim()).filter(Boolean);
        else if(key==="price") {
          const raw=input.value.trim();
          const value=raw===""?null:Number(raw);
          if(value!==null&&!Number.isFinite(value))throw new Error("Enter a valid product price.");
          payload[dbKey]=value===null?null:Math.round(value*100);
        } else if(key==="stock_qty") {
          const value=input.value.trim()===""?0:Number(input.value);
          if(!Number.isInteger(value)||value<0)throw new Error("Stock quantity must be a whole number of zero or more.");
          payload[dbKey]=value;
        } else if(key==="condition") payload[dbKey]=input.value.trim()||"new";
        else payload[dbKey]=input.value.trim()===""?(key==="currency"?"SAR":null):input.value.trim();
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
      const imagesInput=form.elements.namedItem("images");
      const imageUrls=JSON.parse(form.dataset.currentGalleryUrls||"[]");
      if(imagesInput?.files?.length){
        for(const file of Array.from(imagesInput.files)){
          if(!file.type.startsWith("image/")) throw new Error("Please select image files only.");
          if(file.size>10*1024*1024) throw new Error("Each image must be 10 MB or smaller.");
          const safeName=file.name.normalize("NFKD").replace(/[^\w.-]+/g,"-").replace(/^-+|-+$/g,"")||"image";
          const path="content/"+moduleName+"/gallery/"+crypto.randomUUID()+"-"+safeName;
          const {error:uploadError}=await supabase.storage.from("site-media").upload(path,file,{cacheControl:"3600",contentType:file.type,upsert:false});
          if(uploadError) throw uploadError;
          const publicUrl=supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;
          imageUrls.push(publicUrl);
          uploadedUrls.push(publicUrl);
        }
      }
      payload.gallery_urls=imageUrls;
      payload.photo_url=imageUrls[0]||null;
      const editId=form.dataset.editId; let result;
      if (editId) result=await supabase.from(config.table).update(payload).eq("id",editId).select("id").single();
      else {
        const {data:authData}=await supabase.auth.getUser();
        if (moduleName==="workshops"&&authData?.user?.id) { payload.created_by=authData.user.id; payload.updated_by=authData.user.id; }
        result=await supabase.from(config.table).insert(payload).select("id").single();
      }
      if (result.error) throw result.error;
      await saveModuleRelationships(moduleName,result.data.id,form);
      saved=true;
      resetModuleForm(moduleName); setModuleMessage(moduleName,config.title+(editId?" updated.":" created."),"success");
      await loadContentModule(moduleName);
    } catch(error) {
      if (!saved) { for(const url of uploadedUrls){try{await removeStoredImage(url);}catch{}} }
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




// Initialize extended Owner-only modules after core dashboard handlers.
if(ownerDashboard&&currentDashboardRole==="owner")initExtendedDashboard(supabase,currentDashboardRole);

// Load only published records for the five public homepage sections.
void applyPublicSiteSettings();
  void loadHomeCatalog();
}
