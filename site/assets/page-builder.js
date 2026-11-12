import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { renderPage } from "./page-engine.js";

const SUPABASE_URL = "https://sburxeuxkrilbfppxylm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_lqGGahZ0ST267jqsI3Zelg_477szacT";
const root = document.querySelector("#page-builder-root");
if (root) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  const $ = (selector) => root.querySelector(selector);
  const componentTypes = ["hero", "rich_text", "image", "card_grid", "button_group", "faq", "spacer"];
  const reserved = new Set(["login","profile","dashboard","services","products","workshop","technicians","bd","saudi","global","assets","auth"]);
  let pages = [], selectedPage = null, components = [], editingComponent = null, currentUser = null;

  const el = (tag, attrs = {}, value = "") => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, val]) => {
      if (key === "class") node.className = val;
      else if (key === "text") node.textContent = val;
      else if (key === "htmlFor") node.htmlFor = val;
      else node.setAttribute(key, val);
    });
    if (value) node.textContent = value;
    return node;
  };
  const field = (label, name, type = "text", value = "", required = false) => {
    const wrap = el("label", { class: "page-builder-field" });
    wrap.append(el("span", {}, label));
    let input;
    if (type === "textarea") {
      input = el("textarea", { name, rows: "3", maxlength: name === "description" ? "2000" : "5000" });
    } else if (type === "select") {
      input = el("select", { name });
    } else {
      input = el("input", { name, type, maxlength: name === "slug" ? "80" : "180" });
    }
    input.value = value ?? "";
    if (required) input.required = true;
    wrap.append(input);
    return wrap;
  };
  function message(text, error = false) {
    const target = $("#page-builder-message");
    target.textContent = text;
    target.dataset.kind = error ? "error" : "success";
  }
  function button(label, action, secondary = false) {
    const node = el("button", { type: "button", class: secondary ? "secondary-button" : "" }, label);
    node.addEventListener("click", action);
    return node;
  }
  function slugify(value) {
    return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
  }
  async function authorize() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error("Please sign in again.");
    currentUser = data.user;
    const { data: role, error: roleError } = await supabase.from("user_roles").select("role")
      .eq("user_id", currentUser.id).in("role", ["owner", "admin"]).limit(1).maybeSingle();
    if (roleError || !role) throw new Error("Page Builder access is restricted to Owner and Admin.");
  }
  async function loadPages() {
    const { data, error } = await supabase.from("pages")
      .select("id,parent_id,page_type,slug,title,description,locale,status,sort_order,seo,created_at,updated_at")
      .order("page_type").order("sort_order").order("title");
    if (error) throw error;
    pages = data || [];
    renderPageList();
    renderParentOptions();
  }
  function renderParentOptions() {
    const select = $("#page-parent");
    select.replaceChildren(el("option", { value: "" }, "Select Main Page"));
    pages.filter(page => page.page_type === "main" && page.locale === $("#page-locale").value).forEach(page => {
      const option = el("option", { value: page.id }, page.title + " · " + page.locale);
      select.append(option);
    });
    select.disabled = $("#page-type").value !== "sub";
  }
  function renderPageList() {
    const list = $("#page-list");
    list.replaceChildren();
    if (!pages.length) list.append(el("p", { class: "muted" }, "No pages yet. Create your first Main Page."));
    pages.forEach(page => {
      const row = el("article", { class: "technician-admin-row page-builder-page-row" });
      const info = el("div");
      info.append(el("strong", {}, page.title));
      info.append(el("span", { class: "muted" }, (page.page_type === "main" ? "Main Page" : "Sub Page") + " · /" + page.slug + " · " + page.locale + " · " + page.status));
      row.append(info);
      const actions = el("div", { class: "editor-actions" });
      actions.append(button("Edit", () => selectPage(page)));
      if (page.status === "published") actions.append(button("Unpublish", () => changeStatus(page, "draft"), true));
      else actions.append(button("Publish", () => changeStatus(page, "published")));
      actions.append(button("Archive", () => changeStatus(page, "archived"), true));
      actions.append(button("Delete", () => deletePage(page), true));
      row.append(actions);
      list.append(row);
    });
  }
  async function deletePage(page) {
    const childCount = pages.filter(item => item.parent_id === page.id).length;
    if (childCount) return message("Delete or move this page’s Sub Pages first.", true);
    if (!confirm("Permanently delete “" + page.title + "” and its components and revision history?")) return;
    try {
      const { error } = await supabase.from("pages").delete().eq("id", page.id);
      if (error) throw error;
      if (selectedPage?.id === page.id) resetPageForm();
      await loadPages();
      message("Page deleted.");
    } catch (error) { message(error.message || "Could not delete page.", true); }
  }
  function resetPageForm() {
    $("#page-form").reset();
    $("#page-id").value = "";
    $("#page-type").value = "main";
    $("#page-locale").value = "en";
    $("#page-status").value = "draft";
    $("#page-parent").disabled = true;
    $("#page-form-title").textContent = "Create Page";
    $("#page-cancel").hidden = true;
    selectedPage = null;
    components = [];
    editingComponent = null;
    renderComponents();
    $("#revision-list").replaceChildren();
  }
  function selectPage(page) {
    selectedPage = page;
    $("#page-id").value = page.id;
    $("#page-type").value = page.page_type;
    $("#page-parent").value = page.parent_id || "";
    $("#page-parent").disabled = page.page_type !== "sub";
    $("#page-title").value = page.title;
    $("#page-slug").value = page.slug;
    $("#page-description").value = page.description || "";
    $("#page-locale").value = page.locale;
    $("#page-status").value = page.status;
    $("#page-order").value = page.sort_order || 0;
    $("#page-seo-title").value = page.seo?.title || "";
    $("#page-seo-description").value = page.seo?.description || "";
    $("#page-form-title").textContent = "Edit Page";
    $("#page-cancel").hidden = false;
    void loadComponents(page.id);
    void loadRevisions(page.id);
    message("Editing " + page.title);
  }
  async function loadComponents(pageId) {
    const { data, error } = await supabase.from("page_components")
      .select("id,page_id,slot,component_type,component_config,sort_order,is_visible")
      .eq("page_id", pageId).order("sort_order");
    if (error) throw error;
    components = data || [];
    renderComponents();
  }
  function renderComponents() {
    const list = $("#component-list");
    list.replaceChildren();
    if (!selectedPage) {
      list.append(el("p", { class: "muted" }, "Save a page first, then add components."));
      return;
    }
    if (!components.length) list.append(el("p", { class: "muted" }, "No components added yet."));
    components.forEach((item, index) => {
      const row = el("article", { class: "technician-admin-row" });
      const info = el("div");
      info.append(el("strong", {}, item.component_type.replaceAll("_", " ")));
      info.append(el("span", { class: "muted" }, "Order " + (index + 1) + (item.is_visible ? "" : " · Hidden")));
      row.append(info);
      const actions = el("div", { class: "editor-actions" });
      actions.append(button("Edit", () => editComponent(item)));
      actions.append(button("↑", () => moveComponent(index, -1), true));
      actions.append(button("↓", () => moveComponent(index, 1), true));
      actions.append(button(item.is_visible ? "Hide" : "Show", () => toggleComponent(item), true));
      actions.append(button("Delete", () => deleteComponent(item), true));
      row.append(actions);
      list.append(row);
    });
  }
  async function snapshotPage(pageId) {
    const page = pages.find(item => item.id === pageId);
    if (!page) return;
    const { data: rows, error } = await supabase.from("page_components")
      .select("slot,component_type,component_config,sort_order,is_visible").eq("page_id", pageId).order("sort_order");
    if (error) throw error;
    const { data: revisions, error: revisionError } = await supabase.from("page_revisions")
      .select("revision_number").eq("page_id", pageId).order("revision_number", { ascending: false }).limit(1);
    if (revisionError) throw revisionError;
    const revisionNumber = (revisions?.[0]?.revision_number || 0) + 1;
    const snapshot = { page: { page_type: page.page_type, parent_id: page.parent_id, slug: page.slug, title: page.title,
      description: page.description, locale: page.locale, status: page.status, sort_order: page.sort_order, seo: page.seo || {} }, components: rows || [] };
    const { error: saveError } = await supabase.from("page_revisions").insert({
      page_id: pageId, revision_number: revisionNumber, snapshot, created_by: currentUser.id
    });
    if (saveError) throw saveError;
  }
  async function savePage(event) {
    event.preventDefault();
    const save = $("#page-save");
    save.disabled = true;
    try {
      const id = $("#page-id").value;
      const type = $("#page-type").value;
      const title = $("#page-title").value.trim();
      const slug = slugify($("#page-slug").value.trim() || title);
      const parentId = type === "sub" ? $("#page-parent").value : null;
      if (!title || !slug) throw new Error("Title and a valid English URL slug are required.");
      if (type === "sub" && !parentId) throw new Error("Select a Main Page for this Sub Page.");
      if (type === "main" && reserved.has(slug)) throw new Error("This URL is reserved for an existing website route.");
      const existing = pages.find(item => item.id === id);
      const payload = { page_type: type, parent_id: parentId, title, slug, description: $("#page-description").value.trim(),
        locale: $("#page-locale").value, status: $("#page-status").value, sort_order: Number($("#page-order").value || 0),
        seo: { title: $("#page-seo-title").value.trim(), description: $("#page-seo-description").value.trim() },
        updated_by: currentUser.id, updated_at: new Date().toISOString() };
      if (existing) await snapshotPage(id);
      else payload.created_by = currentUser.id;
      const result = id
        ? await supabase.from("pages").update(payload).eq("id", id).select("id").single()
        : await supabase.from("pages").insert(payload).select("id").single();
      if (result.error) throw result.error;
      await loadPages();
      const saved = pages.find(item => item.id === result.data.id);
      selectPage(saved);
      message("Page saved successfully.");
    } catch (error) { message(error.message || "Could not save page.", true); }
    finally { save.disabled = false; }
  }
  async function changeStatus(page, status) {
    try {
      await snapshotPage(page.id);
      const { error } = await supabase.from("pages").update({ status, updated_by: currentUser.id,
        published_at: status === "published" ? new Date().toISOString() : null }).eq("id", page.id);
      if (error) throw error;
      await loadPages();
      if (selectedPage?.id === page.id) selectPage(pages.find(item => item.id === page.id));
      message("Page status changed to " + status + ".");
    } catch (error) { message(error.message || "Could not change page status.", true); }
  }
  function configFields(type, config = {}) {
    const box = $("#component-config");
    box.replaceChildren();
    const add = (label, key, kind = "text") => box.append(field(label, key, kind, config[key] || "", key === "title" && type === "hero"));
    if (type === "hero") { add("Heading", "title"); add("Description", "description", "textarea"); }
    if (type === "rich_text") { add("Section Heading", "heading"); add("Text", "text", "textarea"); }
    if (type === "image") { add("Image URL (https)", "src", "url"); add("Alternative Text", "alt"); add("Caption", "caption"); }
    if (type === "card_grid") box.append(field("Cards — one per line: title | description | https URL", "cards", "textarea",
      (config.cards || []).map(x => [x.title,x.description,x.href].join(" | ")).join("\n")));
    if (type === "button_group") box.append(field("Buttons — one per line: label | https URL", "items", "textarea",
      (config.items || []).map(x => [x.label,x.href].join(" | ")).join("\n")));
    if (type === "faq") box.append(field("FAQ — one per line: question | answer", "items", "textarea",
      (config.items || []).map(x => [x.question,x.answer].join(" | ")).join("\n")));
    if (type === "spacer") add("Height in pixels (0–240)", "height");
  }
  function readConfig(type) {
    const values = Object.fromEntries(Array.from($("#component-config").querySelectorAll("[name]")).map(input => [input.name, input.value.trim()]));
    if (type === "hero") return { title: values.title, description: values.description };
    if (type === "rich_text") return { heading: values.heading, text: values.text };
    if (type === "image") {
      if (values.src && !/^https:\/\//i.test(values.src)) throw new Error("Image URL must start with https://.");
      return { src: values.src, alt: values.alt, caption: values.caption };
    }
    if (type === "spacer") return { height: Math.max(0, Math.min(240, Number(values.height || 24))) };
    const key = type === "card_grid" ? "cards" : "items";
    const lines = (values[key] || "").split("\n").map(line => line.split("|").map(x => x.trim())).filter(parts => parts.some(Boolean));
    if (type === "card_grid") return { cards: lines.slice(0,24).map(([title,description,href]) => ({ title, description, href: safeLink(href) })) };
    if (type === "button_group") return { items: lines.slice(0,12).map(([label,href]) => ({ label, href: safeLink(href) })) };
    return { items: lines.slice(0,30).map(([question,answer]) => ({ question, answer })) };
  }
  function safeLink(value = "") {
    if (!value) return "";
    if (!/^https:\/\//i.test(value) && !value.startsWith("/")) throw new Error("Links must use https:// or a local absolute path.");
    return value.slice(0,2048);
  }
  function editComponent(item = null) {
    editingComponent = item;
    $("#component-type").value = item?.component_type || "hero";
    $("#component-form-title").textContent = item ? "Edit Component" : "Add Component";
    configFields($("#component-type").value, item?.component_config || {});
    $("#component-cancel").hidden = !item;
  }
  async function saveComponent(event) {
    event.preventDefault();
    if (!selectedPage) return message("Save a page before adding components.", true);
    const type = $("#component-type").value;
    try {
      const config = readConfig(type);
      await snapshotPage(selectedPage.id);
      const payload = { page_id: selectedPage.id, slot: "main", component_type: type, component_config: config,
        sort_order: editingComponent?.sort_order ?? components.length, is_visible: editingComponent?.is_visible ?? true };
      const result = editingComponent
        ? await supabase.from("page_components").update(payload).eq("id", editingComponent.id)
        : await supabase.from("page_components").insert(payload);
      if (result.error) throw result.error;
      await loadComponents(selectedPage.id);
      await loadRevisions(selectedPage.id);
      editComponent();
      message("Component saved.");
    } catch (error) { message(error.message || "Could not save component.", true); }
  }
  async function moveComponent(itemIndex, delta) {
    const targetIndex = itemIndex + delta;
    if (targetIndex < 0 || targetIndex >= components.length) return;
    try {
      await snapshotPage(selectedPage.id);
      const copy = [...components];
      [copy[itemIndex], copy[targetIndex]] = [copy[targetIndex], copy[itemIndex]];
      for (let index = 0; index < copy.length; index++) {
        const { error } = await supabase.from("page_components").update({ sort_order: index }).eq("id", copy[index].id);
        if (error) throw error;
      }
      await loadComponents(selectedPage.id);
      await loadRevisions(selectedPage.id);
    } catch (error) { message(error.message || "Could not reorder components.", true); }
  }
  async function toggleComponent(item) {
    try {
      await snapshotPage(selectedPage.id);
      const { error } = await supabase.from("page_components").update({ is_visible: !item.is_visible }).eq("id", item.id);
      if (error) throw error;
      await loadComponents(selectedPage.id);
      await loadRevisions(selectedPage.id);
    } catch (error) { message(error.message || "Could not update component.", true); }
  }
  async function deleteComponent(item) {
    if (!confirm("Delete this component?")) return;
    try {
      await snapshotPage(selectedPage.id);
      const { error } = await supabase.from("page_components").delete().eq("id", item.id);
      if (error) throw error;
      await loadComponents(selectedPage.id);
      await loadRevisions(selectedPage.id);
    } catch (error) { message(error.message || "Could not delete component.", true); }
  }
  async function loadRevisions(pageId) {
    const list = $("#revision-list");
    const { data, error } = await supabase.from("page_revisions")
      .select("id,revision_number,created_at,snapshot").eq("page_id", pageId)
      .order("revision_number", { ascending: false }).limit(30);
    if (error) throw error;
    list.replaceChildren();
    if (!data?.length) list.append(el("p", { class: "muted" }, "No saved revisions yet."));
    data?.forEach(revision => {
      const row = el("article", { class: "technician-admin-row" });
      row.append(el("span", {}, "Revision " + revision.revision_number + " · " + new Date(revision.created_at).toLocaleString()));
      row.append(button("Restore", () => restoreRevision(revision), true));
      list.append(row);
    });
  }
  async function restoreRevision(revision) {
    if (!confirm("Restore revision " + revision.revision_number + "? A new backup revision will be created first.")) return;
    try {
      await snapshotPage(selectedPage.id);
      const snap = revision.snapshot;
      const pagePayload = { ...snap.page, updated_by: currentUser.id, updated_at: new Date().toISOString() };
      const { error } = await supabase.from("pages").update(pagePayload).eq("id", selectedPage.id);
      if (error) throw error;
      const { error: deleteError } = await supabase.from("page_components").delete().eq("page_id", selectedPage.id);
      if (deleteError) throw deleteError;
      if (snap.components?.length) {
        const rows = snap.components.map(item => ({ ...item, page_id: selectedPage.id }));
        const { error: insertError } = await supabase.from("page_components").insert(rows);
        if (insertError) throw insertError;
      }
      await loadPages();
      selectPage(pages.find(item => item.id === selectedPage.id));
      message("Revision restored.");
    } catch (error) { message(error.message || "Could not restore revision.", true); }
  }

  root.innerHTML = `
    <div class="page-builder-layout">
      <section class="page-builder-column">
        <h2>Pages</h2>
        <p class="muted">Create and manage Main Pages and their Sub Pages. Published pages appear automatically in the matching-language site menu; Draft and Archived pages stay hidden.</p>
        <div id="page-list"></div>
      </section>
      <section class="page-builder-column">
        <form id="page-form" class="content-editor-form">
          <h2 id="page-form-title">Create Page</h2>
          <input type="hidden" id="page-id">
          <label class="page-builder-field"><span>Page Type</span><select id="page-type"><option value="main">Main Page</option><option value="sub">Sub Page</option></select></label>
          <label class="page-builder-field"><span>Parent Main Page</span><select id="page-parent"><option value="">Select Main Page</option></select></label>
          <label class="page-builder-field"><span>Page Title</span><input id="page-title" maxlength="180" required></label>
          <label class="page-builder-field"><span>URL Slug (English letters, numbers, hyphens)</span><input id="page-slug" maxlength="80" placeholder="about-us"></label>
          <label class="page-builder-field"><span>Description</span><textarea id="page-description" rows="3" maxlength="2000"></textarea></label>
          <div class="page-builder-two">
            <label class="page-builder-field"><span>Language</span><select id="page-locale"><option value="en">English</option><option value="bn">বাংলা</option><option value="ar">العربية</option></select></label>
            <label class="page-builder-field"><span>Status</span><select id="page-status"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
          </div>
          <label class="page-builder-field"><span>Sort Order</span><input id="page-order" type="number" min="0" max="10000" value="0"></label>
          <details><summary>SEO Settings</summary>
            <label class="page-builder-field"><span>SEO Title</span><input id="page-seo-title" maxlength="180"></label>
            <label class="page-builder-field"><span>SEO Description</span><textarea id="page-seo-description" rows="2" maxlength="300"></textarea></label>
          </details>
          <div class="editor-actions"><button id="page-save" type="submit">Save Page</button><button id="page-preview-button" type="button" class="secondary-button">Preview</button><button id="page-cancel" type="button" class="secondary-button" hidden>Cancel</button></div>
        </form>
        <section class="page-builder-subsection">
          <form id="component-form" class="content-editor-form">
            <h3 id="component-form-title">Add Component</h3>
            <label class="page-builder-field"><span>Component Type</span><select id="component-type">${componentTypes.map(type => `<option value="${type}">${type.replaceAll("_"," ")}</option>`).join("")}</select></label>
            <div id="component-config"></div>
            <div class="editor-actions"><button type="submit">Save Component</button><button id="component-cancel" type="button" class="secondary-button" hidden>Cancel</button></div>
          </form>
          <h3>Page Components</h3><div id="component-list"></div>
        </section>
        <section class="page-builder-subsection"><h3>Preview</h3><div id="page-preview" class="dynamic-page-main" hidden></div></section>
        <section class="page-builder-subsection"><h3>Revision History</h3><div id="revision-list"></div></section>
      </section>
    </div>
    <p id="page-builder-message" class="editor-message" role="status" aria-live="polite"></p>
  `;

  $("#page-type").addEventListener("change", renderParentOptions);
  $("#page-locale").addEventListener("change", renderParentOptions);
  $("#page-title").addEventListener("input", () => { if (!$("#page-id").value) $("#page-slug").value = slugify($("#page-title").value); });
  $("#page-form").addEventListener("submit", savePage);
  $("#page-cancel").addEventListener("click", resetPageForm);
  $("#page-preview-button").addEventListener("click", () => {
    if (!selectedPage) return message("Save the page before previewing its components.", true);
    const preview = $("#page-preview");
    const page = { ...selectedPage, title: $("#page-title").value.trim() || selectedPage.title };
    renderPage(page, components, preview);
    preview.hidden = false;
    preview.scrollIntoView({ behavior: "smooth", block: "start" });
    message("Preview generated from the current saved components.");
  });
  $("#component-type").addEventListener("change", () => configFields($("#component-type").value));
  $("#component-form").addEventListener("submit", saveComponent);
  $("#component-cancel").addEventListener("click", () => editComponent());
  try {
    await authorize();
    await loadPages();
    renderParentOptions();
    renderComponents();
    message("Page Builder is ready.");
  } catch (error) {
    root.replaceChildren(el("p", { class: "editor-message", text: error.message }, error.message));
  }
}
