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
  { key:"service_types", table:"service_types", title:"Service Type", icon:"wrench" },
  { key:"device_types", table:"device_types", title:"Device Type", icon:"smartphone" },
  { key:"services", table:"services", title:"Services", icon:"wrench" },
  { key:"products", table:"products", title:"Products", icon:"package" },
  { key:"workshops", table:"workshops", title:"Workshops", icon:"building" },
  { key:"technicians", table:"technicians", title:"Technicians", icon:"technician" },
  { key:"contacts", table:"contacts", title:"Contacts", icon:"contact", published:null }
];

function renderHomeCard(module, record) {
  const title=record.name||record.title||"";
  const card=document.createElement(module.key==="contacts"?"article":"a");
  card.className="home-content-card";
  if(card.tagName==="A"){
    const routeModule=module.key==="service_types"?"service-types":module.key==="device_types"?"device-types":module.key;
    const routeKey=module.key==="service_types"||module.key==="device_types"?record.slug:record.publicSlug;
    if(routeKey)card.href="/3btechhub/"+routeModule+"/"+encodeURIComponent(routeKey)+"/";
  }
  const visual=document.createElement("div");
  visual.className="home-content-visual"+(module.key==="technicians"?" home-content-visual--person":"");
  if(module.key==="contacts"){const icon=createContactIcon(record.value,title);icon.classList.add("home-content-fallback");visual.append(icon);}
  else{visual.append(getItemFallbackIcon(title,module.key));}
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
  if(title){const heading=document.createElement("h3");heading.textContent=title;body.append(heading);}
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
      const publicColumns={
        service_types:"id,title,slug,photo_url,gallery_urls",device_types:"id,title,slug,photo_url,gallery_urls",
        services:"id,name,description,photo_url,short_info,service_information,gallery_urls,location,map_url,phone,whatsapp",
        products:"id,name,description,condition,price_minor,currency,stock_qty,category,category_group,photo_url,short_info,service_information,gallery_urls,location,map_url,phone,whatsapp",
        workshops:"id,title,description,workshop_date,workshop_time,location,trainer,phone,whatsapp,photo_url,category,short_info,service_information,gallery_urls,map_url,address",
        technicians:"id,name,description,category,phone,whatsapp,photo_url,skill,short_info,service_information,gallery_urls,location,map_url,email,link",contacts:"id,name,value"
      };
      const {data,error}=await supabase.from(module.table).select(publicColumns[module.key]).limit(5);
      if(error) throw error;
      if(["services","products","workshops","technicians"].includes(module.key)){
        const {data:slugRows,error:slugError}=await supabase.rpc("get_public_catalogue_slugs",{p_module:module.key});
        if(slugError)throw slugError;
        const slugById=new Map((slugRows||[]).map(row=>[row.id,row.slug]));
        data?.forEach(record=>{record.publicSlug=slugById.get(record.id)||"";});
      }
      target.replaceChildren();
      if(!data?.length) {
        const empty=document.createElement("p");
        empty.className="home-empty";
        empty.textContent="No "+module.title.toLowerCase()+" available yet.";
        target.append(empty);
        continue;
      }
      data.slice(0,4).forEach(record=>target.append(renderHomeCard(module,record)));
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
  const [{data,error},{data:introData}] = await Promise.all([
    supabase.from("Settings").select("setting_value,visibility_roles").eq("setting_key","site_profile").maybeSingle(),
    supabase.from("Settings").select("setting_value,visibility_roles").eq("setting_key","home_intro").maybeSingle()
  ]);
  const settings=data?.setting_value&&typeof data.setting_value==="object"?data.setting_value:{};
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
  if(document.querySelector('#app-main[data-view="catalogue"]')){await applyPublicSiteSettings();await initCataloguePage(supabase,document.getElementById("app-main").dataset.module,document.getElementById("app-main").dataset.recordKey||"");return;}
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
      .from("Users").select("phone").eq("auth_user_id", currentUser.id).maybeSingle();
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

      const { error: phoneError } = await supabase.from("Users").update(
        { phone: phone || null },
      ).eq("auth_user_id", currentUser.id);
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
      const resources = [["Users","dashboard-users-count"],["services","dashboard-services-count"],["categories","dashboard-categories-count"],["products","dashboard-products-count"],["workshops","dashboard-workshops-count"],["technicians","dashboard-technicians-count"],["contacts","dashboard-contacts-count"],["Roles","dashboard-roles-count"],["permissions","dashboard-permissions-count"]];
      const health=document.getElementById("dashboard-health-status");
      if(health){health.replaceChildren();const checks=[["Website","Online",true],["Supabase / Database","Checking…",null],["Authentication","Checking…",null],["Storage","Checking…",null],["Backend services","Checking…",null]];
        const [databaseCheck,authCheck,storageCheck,backendCheck]=await Promise.all([
          supabase.from("Settings").select("setting_key").limit(1),
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
const siteSettingsVisibilityHost=document.createElement("div");siteSettingsVisibilityHost.className="module-related-options";siteSettingsVisibilityHost.dataset.visibilityRoles="true";
const siteSettingsVisibilityField=document.createElement("div");siteSettingsVisibilityField.className="module-form-field module-related-field";addTextElement(siteSettingsVisibilityField,"span","","Visibility");siteSettingsVisibilityField.append(siteSettingsVisibilityHost);
siteSettingsForm?.querySelector(".editor-actions")?.before(siteSettingsVisibilityField);

async function loadSiteSettingsForm() {
  if (!siteSettingsForm || currentDashboardRole !== "owner") return;
  if (siteSettingsMessage) siteSettingsMessage.textContent = "Loading website settings…";
  const [{data,error},{data:introData}] = await Promise.all([
    supabase.from("Settings").select("setting_value,visibility_roles").eq("setting_key","site_profile").maybeSingle(),
    supabase.from("Settings").select("setting_value,visibility_roles").eq("setting_key","home_intro").maybeSingle()
  ]);
  if (error) { if (siteSettingsMessage) siteSettingsMessage.textContent=error.message||"Could not load website settings."; return; }
  await loadVisibilityRoleOptions(siteSettingsForm,data?.visibility_roles||introData?.visibility_roles||["owner","visitor"]);
  const settings=data?.setting_value&&typeof data.setting_value==="object"?data.setting_value:{};
  const intro=introData?.setting_value&&typeof introData.setting_value.content==="string"?introData.setting_value.content:"";
  siteSettingsForm.elements.home_intro.value=intro;
  siteSettingsForm.elements.website_title.value=typeof settings.website_title==="string"?settings.website_title:"3B TECH HUB";
  siteSettingsForm.elements.logo_url.value=typeof settings.logo_url==="string"?settings.logo_url:"";
  const preview=document.getElementById("site-logo-preview");
  if(preview&&settings.logo_url){preview.src=settings.logo_url;preview.hidden=false;}
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
      const visibility_roles=[...new Set([...siteSettingsForm.querySelectorAll("[data-visibility-role]:checked")].map(box=>box.value).concat("owner"))];
      const {error}=await supabase.from("Settings").upsert({setting_key:"site_profile",setting_value:{website_title:websiteTitle,logo_url:logoUrl},visibility_roles,description:"Public website profile"},{onConflict:"setting_key"});if(error)throw error;
      const homeIntro=String(form.get("home_intro")||"").trim();
      const {error:introError}=await supabase.from("Settings").upsert({setting_key:"home_intro",setting_value:{content:homeIntro},visibility_roles,description:"Public homepage introduction"},{onConflict:"setting_key"});if(introError)throw introError;
      if(oldLogoUrl&&oldLogoUrl!==logoUrl){try{await removeStoredImage(oldLogoUrl);}catch(cleanupError){console.warn("Old logo cleanup failed.",cleanupError);}}
      siteSettingsForm.dataset.removeLogo="false";if(siteSettingsMessage)siteSettingsMessage.textContent="Website settings saved.";
    }catch(error){if(siteSettingsMessage)siteSettingsMessage.textContent=error.message||"Could not save website settings.";}
    finally{if(submit)submit.disabled=false;}
  });
}
if(siteSettingsForm)void loadSiteSettingsForm();


// Core content modules: each module uses its existing Supabase table and RLS policies.
const dashboardContentModules = {
  countries: { table:"countries", title:"Country", fields:[
    ["title","Country Name","text",true],["code","Country Code","text",false],
    ["is_global","Global Availability","checkbox",false],["visibility_roles","Visibility","role-visibility",false]
  ], columns:["code","visibility_roles"] },
  locations: { table:"locations", title:"Location", fields:[
    ["title","Location Name","text",true],["country_id","Country","select",false,[]],
    ["address","Address","textarea",false],["visibility_roles","Visibility","role-visibility",false]
  ], columns:["country_id","visibility_roles"] },
  service_types: { table:"service_types", title:"Service Type", fields:[
    ["title","Title","text",true],["slug","Slug","text",true],["country","Countries","countries",false],
    ["device_types","Device Type","multiselect",false],["services","Services","multiselect",false],
    ["products","Products","multiselect",false],["workshops","Workshops","multiselect",false],
    ["technicians","Technicians","multiselect",false],["images","Images","files",false],
    ["visibility_roles","Visibility","role-visibility",false]
  ], columns:["country","visibility_roles"] },
  device_types: { table:"device_types", title:"Device Type", fields:[
    ["title","Title","text",true],["slug","Slug","text",true],["country","Countries","countries",false],
    ["service_types","Service Type","multiselect",false],["services","Services","multiselect",false],
    ["products","Products","multiselect",false],["workshops","Workshops","multiselect",false],
    ["technicians","Technicians","multiselect",false],["images","Images","files",false],
    ["visibility_roles","Visibility","role-visibility",false]
  ], columns:["country","visibility"] },
  services: { table:"services", title:"Service", fields:[
    ["title","Title","text",true],["slug","Slug","text",true],["country","Countries","countries",false],
    ["service_types","Service Type","multiselect",false],["device_types","Device Type","multiselect",false],
    ["products","Products","multiselect",false],["workshops","Workshops","multiselect",false],
    ["technicians","Technicians","multiselect",false],["images","Images","files",false],
    ["visibility_roles","Visibility","role-visibility",false]
  ], columns:["country","visibility"] },
  products: { table:"products", title:"Product", fields:[
    ["title","Title","text",true],["slug","Slug","text",true],["country","Countries","countries",false],
    ["service_types","Service Type","multiselect",false],["device_types","Device Type","multiselect",false],
    ["services","Service","multiselect",false],["workshops","Workshops","multiselect",false],
    ["technicians","Technicians","multiselect",false],["images","Images","files",false],
    ["visibility_roles","Visibility","role-visibility",false]
  ], columns:["country","visibility"] },
  workshops: { table:"workshops", title:"Workshop", fields:[
    ["title","Title","text",true],["slug","Slug","text",true],["country","Countries","countries",false],
    ["location_id","Location","select",false,[]],["service_types","Service Type","multiselect",false],
    ["device_types","Device Type","multiselect",false],["services","Service","multiselect",false],
    ["products","Products","multiselect",false],["technicians","Technicians","multiselect",false],
    ["images","Images","files",false],["visibility_roles","Visibility","role-visibility",false]
  ], columns:["country","location","visibility_roles"] },
  technicians: { table:"technicians", title:"Technician", fields:[
    ["title","Title","text",true],["slug","Slug","text",true],["country","Countries","countries",false],
    ["location_id","Location","select",false,[]],["skill","Skill/Expertise","text",false],["phone","Phone Number","tel",false],
    ["whatsapp","Whatsapp Number","tel",false],["link","Link","url",false],["email","Email","email",false],
    ["service_types","Service Type","multiselect",false],["device_types","Device Type","multiselect",false],
    ["services","Service","multiselect",false],["products","Products","multiselect",false],
    ["workshops","Workshops","multiselect",false],["images","Images","files",false],
    ["visibility_roles","Visibility","role-visibility",false]
  ], columns:["country","skill","link","visibility_roles"] }
};
const moduleRelationships = {
  service_types: {
    device_types:{table:"service_type_device_types",parent:"service_type_id",child:"device_type_id",target:"device_types",label:"title"},
    services:{table:"service_type_services",parent:"service_type_id",child:"service_id",target:"services",label:"name"},
    products:{table:"service_type_products",parent:"service_type_id",child:"product_id",target:"products",label:"name"},
    workshops:{table:"service_type_workshops",parent:"service_type_id",child:"workshop_id",target:"workshops",label:"title"},
    technicians:{table:"service_type_technicians",parent:"service_type_id",child:"technician_id",target:"technicians",label:"name"}
  },
  device_types: {
    service_types:{table:"service_type_device_types",parent:"device_type_id",child:"service_type_id",target:"service_types",label:"title"},
    services:{table:"device_type_services",parent:"device_type_id",child:"service_id",target:"services",label:"name"},
    products:{table:"device_type_products",parent:"device_type_id",child:"product_id",target:"products",label:"name"},
    workshops:{table:"device_type_workshops",parent:"device_type_id",child:"workshop_id",target:"workshops",label:"title"},
    technicians:{table:"device_type_technicians",parent:"device_type_id",child:"technician_id",target:"technicians",label:"name"}
  },
  services: {
    service_types:{table:"service_type_services",parent:"service_id",child:"service_type_id",target:"service_types",label:"title"},
    device_types:{table:"device_type_services",parent:"service_id",child:"device_type_id",target:"device_types",label:"title"},
    products:{table:"service_products",parent:"service_id",child:"product_id",target:"products",label:"name"},
    workshops:{table:"service_workshops",parent:"service_id",child:"workshop_id",target:"workshops",label:"title"},
    technicians:{table:"service_technicians",parent:"service_id",child:"technician_id",target:"technicians",label:"name"}
  },
  products: {
    service_types:{table:"service_type_products",parent:"product_id",child:"service_type_id",target:"service_types",label:"title"},
    device_types:{table:"device_type_products",parent:"product_id",child:"device_type_id",target:"device_types",label:"title"},
    services:{table:"service_products",parent:"product_id",child:"service_id",target:"services",label:"name"},
    workshops:{table:"product_workshops",parent:"product_id",child:"workshop_id",target:"workshops",label:"title"},
    technicians:{table:"product_technicians",parent:"product_id",child:"technician_id",target:"technicians",label:"name"}
  },
  workshops: {
    service_types:{table:"service_type_workshops",parent:"workshop_id",child:"service_type_id",target:"service_types",label:"title"},
    device_types:{table:"device_type_workshops",parent:"workshop_id",child:"device_type_id",target:"device_types",label:"title"},
    services:{table:"service_workshops",parent:"workshop_id",child:"service_id",target:"services",label:"name"},
    products:{table:"product_workshops",parent:"workshop_id",child:"product_id",target:"products",label:"name"},
    technicians:{table:"workshop_technicians",parent:"workshop_id",child:"technician_id",target:"technicians",label:"name"}
  },
  technicians: {
    service_types:{table:"service_type_technicians",parent:"technician_id",child:"service_type_id",target:"service_types",label:"title"},
    device_types:{table:"device_type_technicians",parent:"technician_id",child:"device_type_id",target:"device_types",label:"title"},
    services:{table:"service_technicians",parent:"technician_id",child:"service_id",target:"services",label:"name"},
    products:{table:"product_technicians",parent:"technician_id",child:"product_id",target:"products",label:"name"},
    workshops:{table:"workshop_technicians",parent:"technician_id",child:"workshop_id",target:"workshops",label:"title"}
  }
};
const countryRelationConfig = {
  service_types:["service_type_countries","service_type_id"],
  device_types:["device_type_countries","device_type_id"],
  services:["service_countries","service_id"],
  products:["product_countries","product_id"],
  workshops:["workshop_countries","workshop_id"],
  technicians:["technician_countries","technician_id"]
};
for (const [moduleName,[table,parent]] of Object.entries(countryRelationConfig)) {
  moduleRelationships[moduleName].countries={table,parent,child:"country_id",target:"countries",label:"name"};
}
async function syncTechnicianContacts(technicianId,payload){
  const {error:deleteError}=await supabase.from("technician_contacts").delete().eq("technician_id",technicianId);
  if(deleteError)throw deleteError;
  const values=[["phone","Phone",payload.phone],["whatsapp","WhatsApp",payload.whatsapp],["email","Email",payload.email],["website","Website",payload.link]]
    .filter(([, ,value])=>typeof value==="string"&&value.trim());
  for(const [contact_type,label,value] of values){
    const normalized_value=value.trim().toLowerCase();
    const {data,error}=await supabase.from("contact_points").upsert(
      {contact_type,label,value:value.trim(),normalized_value},
      {onConflict:"contact_type,normalized_value"}
    ).select("id").single();
    if(error)throw error;
    const {error:linkError}=await supabase.from("technician_contacts").insert({technician_id:technicianId,contact_id:data.id});
    if(linkError)throw linkError;
  }
}
async function loadVisibilityRoleOptions(form,selectedRoles) {
  if(!form)return;
  const host=form.querySelector("[data-visibility-roles]");
  if(!host)return;
  const {data,error}=await supabase.from("Roles").select("name,slug").eq("is_active",true).order("name");
  host.replaceChildren();
  if(error){addTextElement(host,"small","muted","Could not load available roles.");throw error;}
  const roles=data||[];
  for(const role of roles){
    const label=document.createElement("label");label.className="module-related-option";
    const checkbox=document.createElement("input");checkbox.type="checkbox";checkbox.value=role.slug;checkbox.dataset.visibilityRole=role.slug;
    checkbox.checked=selectedRoles?selectedRoles.includes(role.slug):(role.slug==="owner"||role.slug==="visitor");
    checkbox.disabled=role.slug==="owner";
    label.append(checkbox,document.createTextNode(role.name));host.append(label);
  }
  if(!roles.some(role=>role.slug==="owner"))throw new Error("The protected Owner role is missing.");
}
function setVisibilityRoleSelection(form,selectedRoles) {
  const selected=new Set([...(selectedRoles||[]),"owner"]);
  form.querySelectorAll("[data-visibility-role]").forEach(input=>{input.checked=selected.has(input.value);});
}
async function loadModuleRelationOptions(moduleName,form) {
  await loadVisibilityRoleOptions(form);
  const config=moduleRelationships[moduleName]||{};
  for(const [key,rel] of Object.entries(config)){
    const host=form.querySelector('[data-related-options="'+key+'"]');
    if(!host)continue;
    let query=supabase.from(rel.target).select("id,"+rel.label).order(rel.label);
    const {data,error}=await query;
    host.replaceChildren();
    if(error){addTextElement(host,"small","muted","Could not load options.");continue;}
    for(const record of data||[]){
      const label=document.createElement("label");label.className="module-related-option";
      const checkbox=document.createElement("input");checkbox.type="checkbox";checkbox.value=record.id;checkbox.dataset.relatedId=record.id;checkbox.dataset.relatedName=record[rel.label]||"";
      if(rel.target==="countries"&&record[rel.label]==="Global"){checkbox.checked=true;checkbox.defaultChecked=true;}
      label.append(checkbox,document.createTextNode(record[rel.label]||"Untitled"));host.append(label);
    }
    if(!host.childElementCount)addTextElement(host,"small","muted","No available records yet.");
  }
  const countrySelect=form.elements.namedItem("country_id");
  if(countrySelect){
    const {data,error}=await supabase.from("countries").select("id,name").order("name");
    countrySelect.replaceChildren(new Option("— Select —",""));
    if(!error)for(const item of data||[])countrySelect.append(new Option(item.name,item.id));
  }
  const locationSelect=form.elements.namedItem("location_id");
  if(locationSelect){
    const {data,error}=await supabase.from("locations").select("id,name").order("name");
    locationSelect.replaceChildren(new Option("— Select —",""));
    if(!error)for(const item of data||[])locationSelect.append(new Option(item.name,item.id));
  }
}
async function loadModuleRelationSelection(moduleName,recordId,form){
  const config=moduleRelationships[moduleName]||{};
  for(const [key,rel] of Object.entries(config)){
    let relationQuery=supabase.from(rel.table).select(rel.child).eq(rel.parent,recordId);if(rel.scope)relationQuery=relationQuery.eq(rel.scope,moduleName);const {data,error}=await relationQuery;
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
    let deleteQuery=supabase.from(rel.table).delete().eq(rel.parent,recordId);if(rel.scope)deleteQuery=deleteQuery.eq(rel.scope,moduleName);const {error:deleteError}=await deleteQuery;
    if(deleteError)throw deleteError;
    if(ids.length){
      const rows=ids.map(id=>({[rel.parent]:recordId,[rel.child]:id,...(rel.scope?{[rel.scope]:moduleName}:{})}));
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
  if (key === "title") return ["workshops","service_types","device_types"].includes(moduleName) ? "title" : "name";
  if (moduleName === "workshops" && key === "technician") return "trainer";
  if (moduleName === "products" && key === "price") return "price_minor";
  return key;
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
    const host=document.createElement("div");host.className="module-related-options";host.dataset.relatedOptions="countries";
    wrapper.append(addTextElement(wrapper,"span","",label),host);
    return wrapper;
  }
  else if (type === "checklist") {
    const relatedWrapper=document.createElement("div");relatedWrapper.className="module-form-field module-related-field";addTextElement(relatedWrapper,"span","",label);
    const host=document.createElement("div");host.className="module-related-options";host.dataset.checklistOptions=name;
    for(const value of options||[]){const option=document.createElement("label");option.className="module-related-option";const checkbox=document.createElement("input");checkbox.type="checkbox";checkbox.value=value;checkbox.dataset.checklistValue=value;option.append(checkbox,document.createTextNode(value));host.append(option);}
    relatedWrapper.append(host);return relatedWrapper;
  }
  else if (type === "role-visibility") {
    const relatedWrapper=document.createElement("div");relatedWrapper.className="module-form-field module-related-field";
    addTextElement(relatedWrapper,"span","",label);
    const host=document.createElement("div");host.className="module-related-options";host.dataset.visibilityRoles="true";
    host.append(addTextElement(host,"small","muted","Loading available roles…"));
    relatedWrapper.append(host);return relatedWrapper;
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
  form.reset(); setVisibilityRoleSelection(form,["owner","visitor"]); form.dataset.editId=""; form.dataset.currentPhotoUrl=""; form.dataset.currentGalleryUrls="[]"; form.dataset.removePhoto="false"; form.dataset.slugManual="false";
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
const moduleRecordCache = {};
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
        const input=form.elements.namedItem(key);
        if(key==="visibility_roles"){setVisibilityRoleSelection(form,record.visibility_roles||["owner","visitor"]);continue;}
        if(!input&&key!=="country"&&key!=="type")continue;
        else if(key==="type"&&moduleName==="categories"){const selected=new Set(Array.isArray(record.type)?record.type:[]);form.querySelectorAll("[data-checklist-value]").forEach(box=>box.checked=selected.has(box.dataset.checklistValue));}
        else if(key==="price")input.value=record.price_minor==null?"":String(Number(record.price_minor)/100);
        else if(key==="title")input.value=record[moduleDatabaseKey(moduleName,key)]||"";
        else if(key==="technician")input.value=record.trainer||"";
        else if(key==="images")input.value="";
        else if(key==="country"){const selected=String(record.country||"").split(",").map(value=>value.trim());form.querySelectorAll('[data-related-options="countries"] input[data-related-id]').forEach(box=>{box.checked=selected.includes(box.dataset.relatedName);});}
        else if(input.type==="checkbox")input.checked=Boolean(record[moduleDatabaseKey(moduleName,key)]);
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
  moduleRecordCache[moduleName]=data||[];
  const countNode=document.querySelector('[data-dashboard-count="'+moduleName+'"]');
  if(countNode)countNode.textContent=String(moduleRecordCache[moduleName].length);
  await renderModuleList(moduleName,moduleRecordCache[moduleName]);
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
  const titleInput=form.elements.namedItem("title");
  const slugInput=form.elements.namedItem("slug");
  if (titleInput&&slugInput) {
    titleInput.addEventListener("input",()=>{
      if (form.dataset.slugManual!=="true") slugInput.value=slugFromName(titleInput.value);
    });
    slugInput.addEventListener("input",()=>{ form.dataset.slugManual="true"; });
  }
  form.dataset.removePhoto="false"; form.dataset.slugManual="false";
  form.addEventListener("submit",async(event)=>{
    event.preventDefault();
    if (currentDashboardRole !== "owner") { setModuleMessage(moduleName,"Owner permission required.","error"); return; }
    const submit=document.querySelector('[data-module-submit="'+moduleName+'"]'); submit.disabled=true; setModuleMessage(moduleName,"Saving…");
    let uploadedUrls=[], saved=false, contactSyncWarning="";
    try {
      const payload={};
      for (const [key] of config.fields) {
        if(key==="type"&&moduleName==="categories"){payload.type=[...form.querySelectorAll("[data-checklist-value]:checked")].map(box=>box.dataset.checklistValue);continue;}
        const input=form.elements.namedItem(key); if ((!input && key!=="country") || key==="images" || key==="visibility_roles" || moduleRelationships[moduleName]?.[key]) continue;
        const dbKey=moduleDatabaseKey(moduleName,key);
        if(key==="country"){
          let selected=[...form.querySelectorAll('[data-related-options="countries"] input[data-related-id]:checked')];
          if(!selected.length){const global=form.querySelector('[data-related-options="countries"] input[data-related-name="Global"]');if(global){global.checked=true;selected=[global];}}
          payload[dbKey]=selected.map(box=>box.dataset.relatedName).filter(Boolean).join(", ")||"Global";
          continue;
        }
        if(key==="location_id"){
          payload.location_id=input.value||null;
          payload.location=input.value?input.selectedOptions[0]?.textContent||null:null;
        } else if(input.type==="checkbox")payload[dbKey]=input.checked;
        else if(key==="service_information") payload[dbKey]=input.value.split(/\r?\n/).map(value=>value.trim()).filter(Boolean);
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
      const titleValue=String(titleInput?.value||"").trim();
      if (!titleValue) throw new Error("Title is required.");
      payload[moduleDatabaseKey(moduleName,"title")]=titleValue;
      payload.visibility_roles=[...new Set([...form.querySelectorAll("[data-visibility-role]:checked")].map(box=>box.value).concat("owner"))];
      if (moduleName==="categories") {
        const selectedTypes=[...form.querySelectorAll("[data-checklist-value]:checked")].map(box=>box.dataset.checklistValue);
        if (!selectedTypes.length||selectedTypes.some(value=>!["Service","Device"].includes(value))) throw new Error("Select at least one valid Category Type.");
        payload.type=selectedTypes;
      } else {
        if(!["countries","locations"].includes(moduleName)){
          const slugValue=String(slugInput?.value||"").trim()||slugFromName(titleValue);
          if (!slugValue) throw new Error("Slug is required.");
          payload.slug=slugValue;
        }
        if (moduleName==="services"||moduleName==="products") payload.description=payload.description||"";
        if(!form.dataset.editId){
          if(moduleName==="technicians")payload.is_published=true;
          else payload.status=moduleName==="workshops"?"published":"active";
        }
      }
      if (!["categories","countries","locations"].includes(moduleName)) {
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
      }
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
      if(moduleName==="technicians"){
        try{await syncTechnicianContacts(result.data.id,payload);}
        catch(contactError){contactSyncWarning=contactError.message||"Shared contact synchronization failed.";}
      }
      if(moduleName==="countries"){
        for(const target of ["service_types","device_types","services","products","workshops","technicians","locations"]){
          const targetForm=document.querySelector('[data-module-form="'+target+'"]');
          if(targetForm)await loadModuleRelationOptions(target,targetForm);
        }
      }
      if(moduleName==="locations"){
        for(const target of ["workshops","technicians"]){
          const targetForm=document.querySelector('[data-module-form="'+target+'"]');
          if(targetForm)await loadModuleRelationOptions(target,targetForm);
        }
      }
      resetModuleForm(moduleName);
      const successMessage=config.title+(editId?" updated.":" created.");
      setModuleMessage(moduleName,contactSyncWarning?successMessage+" Shared contacts were not fully synchronized: "+contactSyncWarning:successMessage,contactSyncWarning?"error":"success");
      await loadContentModule(moduleName);
    } catch(error) {
      if (!saved) { for(const url of uploadedUrls){try{await removeStoredImage(url);}catch{}} }
      setModuleMessage(moduleName,error.message||"Could not save this record.","error");
    } finally { submit.disabled=false; }
  });
  document.querySelector('[data-module-cancel="'+moduleName+'"]')?.addEventListener("click",()=>resetModuleForm(moduleName));
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
document.querySelectorAll("[data-dashboard-open]").forEach(card=>card.addEventListener("click",()=>{const moduleName=card.dataset.dashboardOpen;activateDashboardModule(moduleName);if(dashboardContentModules[moduleName])void loadContentModule(moduleName);}));
activateDashboardModule("overview");
async function loadDashboardSummaryCounts(){
  if(!ownerDashboard||currentDashboardRole!=="owner")return;
  const counts={
    countries:["countries","id"],locations:["locations","id"],
    service_types:["service_types","id"],device_types:["device_types","id"],
    services:["services","id"],products:["products","id"],workshops:["workshops","id"],
    technicians:["technicians","id"],contacts:["contacts","id"],users:["Users","id"],
    roles:["Roles","id"],permission:["permissions","id"]
  };
  await Promise.all(Object.entries(counts).map(async([key,[table,column]])=>{
    const node=document.querySelector('[data-dashboard-count="'+key+'"]');
    if(!node)return;
    const {count,error}=await supabase.from(table).select(column,{count:"exact",head:true});
    node.textContent=error?"—":String(count??0);
    if(error)node.setAttribute("aria-label","Count unavailable");
  }));
}
void loadDashboardSummaryCounts();

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
