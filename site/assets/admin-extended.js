import { createContactIcon } from "./contact-utils.js";

function el(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
function say(id,message,kind=""){const node=document.getElementById(id);if(node){node.textContent=message;node.dataset.kind=kind;}}
function slug(value){return String(value||"").normalize("NFKD").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"item";}
function tap(host,label,fn){const row=el("article","admin-list-row module-record-row module-record-row--tap-edit");row.tabIndex=0;row.setAttribute("role","button");row.setAttribute("aria-label","Edit "+label);row.append(el("strong","",label||"Untitled"));row.addEventListener("click",fn);row.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();fn();}});host.append(row);}
function reset(form,titleId,title,after){form.reset();form.dataset.editId="";document.getElementById(titleId).textContent=title;after?.();}
function checks(host,items,selected=[]){if(!host)return;host.replaceChildren();const chosen=new Set(selected);if(!items.length){host.append(el("small","muted","No records available."));return;}for(const item of items){const label=el("label","module-related-option"),input=el("input");input.type="checkbox";input.value=item.value;input.checked=chosen.has(item.value);input.disabled=Boolean(item.disabled);label.append(input,el("span","",item.label));host.append(label);}}
function checked(host){return host?[...host.querySelectorAll('input[type="checkbox"]:checked')].map(input=>input.value):[];}
function messageFrom(error){return error?.message||"The request could not be completed.";}

export function initExtendedDashboard(supabase,role){
 if(role!=="owner")return;
 let roles=[],permissions=[],users=[];
 async function ownerUsers(body){const {data,error}=await supabase.functions.invoke("owner-users",{body});if(error)throw new Error(error.message||"User administration request failed.");if(data?.error)throw new Error(data.error);return data;}
 async function loadLookups(){
  const [roleResult,permissionResult,userResult]=await Promise.all([
   supabase.from("Roles").select("*").order("name"),
   supabase.from("permissions").select("*").order("name"),
   ownerUsers({action:"list",page:1,perPage:50})
  ]);
  if(roleResult.error)throw roleResult.error;if(permissionResult.error)throw permissionResult.error;
  roles=roleResult.data||[];permissions=permissionResult.data||[];users=userResult.users||[];
 }
 const roleOptions=()=>roles.filter(item=>item.is_active&&item.slug!=="owner").map(item=>({value:item.slug,label:item.name}));
 const permissionOptions=()=>permissions.filter(item=>item.is_active).map(item=>({value:item.id,label:item.name}));
 const userOptions=()=>users.filter(item=>!((item.roles||[]).includes("owner"))).map(item=>({value:item.id,label:(item.full_name||item.email||"User")+" · "+item.email}));
 async function refreshAll(){await loadLookups();await Promise.all([loadContacts(),loadUsers(),loadRoles(),loadPermissions()]);}

 // One shared CRUD adapter is used for the Contacts, Roles and Permission forms.
 function bindSharedCrud({form,list,formTitle,titleText,load,save,remove,edit,emptyText}){
  if(!form||!list)return;
  async function refresh(){list.replaceChildren();try{await load();}catch(error){list.append(el("p","muted",messageFrom(error)));}}
  function resetForm(){reset(form,formTitle,titleText,()=>{form.querySelectorAll("[data-cancel]").forEach(node=>node.hidden=true);form.querySelectorAll("[data-delete]").forEach(node=>node.hidden=true);});}
  form.addEventListener("submit",async event=>{event.preventDefault();const button=form.querySelector('[type="submit"]');button.disabled=true;try{await save(form);resetForm();say(form.dataset.messageId,"Saved successfully.","success");await refresh();}catch(error){say(form.dataset.messageId,messageFrom(error),"error");}finally{button.disabled=false;}});
  form.querySelector("[data-cancel]")?.addEventListener("click",resetForm);
  form.querySelector("[data-delete]")?.addEventListener("click",async()=>{const id=form.dataset.editId;if(!id||!confirm("Delete this record?"))return;const button=form.querySelector("[data-delete]");button.disabled=true;try{await remove(id);resetForm();say(form.dataset.messageId,"Deleted successfully.","success");await refresh();}catch(error){say(form.dataset.messageId,messageFrom(error),"error");}finally{button.disabled=false;}});
  form.querySelector("[data-refresh]")?.addEventListener("click",refresh);
  form.dataset.messageId=form.dataset.messageId||"";
  form._sharedRefresh=refresh;
  form._sharedEdit=(record)=>{edit(form,record);form.querySelector("[data-cancel]").hidden=false;form.querySelector("[data-delete]").hidden=false;document.getElementById(formTitle).textContent="Edit "+titleText.replace(/^Add /,"").toLowerCase();form.scrollIntoView({behavior:"smooth",block:"start"});};
  form._sharedList=list;
  form._sharedEmpty=emptyText;
  void refresh();
 }

 // Contacts: Title and Value.
 const cf=document.getElementById("contacts-form"),cl=document.getElementById("contacts-list");
 async function loadContacts(){if(!cl)return;cl.replaceChildren();const {data,error}=await supabase.from("contacts").select("*").order("created_at",{ascending:false});if(error)throw error;if(!data?.length){cl.append(el("p","muted","No records found."));return;}for(const record of data)tap(cl,record.name,()=>cf._sharedEdit(record));}
 bindSharedCrud({
  form:cf,list:cl,formTitle:"contacts-form-title",titleText:"Add contact",emptyText:"No records found.",
  load:loadContacts,
  edit(form,record){form.dataset.editId=record.id;form.elements.title.value=record.name||"";form.elements.value.value=record.value||"";},
  async save(form){const title=form.elements.title.value.trim(),value=form.elements.value.value.trim(),id=form.dataset.editId;if(!title)throw new Error("Title is required.");const result=id?await supabase.from("contacts").update({name:title,value:value||null}).eq("id",id):await supabase.from("contacts").insert({name:title,value:value||null,slug:slug(title)+"-"+crypto.randomUUID().slice(0,8)});if(result.error)throw result.error;},
  async remove(id){const {error}=await supabase.from("contacts").delete().eq("id",id);if(error)throw error;}
 });
 if(cf)cf.dataset.messageId="contacts-message";

 // Users: Title plus the email required by Supabase Auth, Roles and direct Permissions.
 const uf=document.getElementById("users-form"),ul=document.getElementById("users-list"),uro=document.getElementById("user-role-options"),upo=document.getElementById("user-permission-options");
 async function loadUsers(){if(!ul)return;await loadLookups();ul.replaceChildren();checks(uro,roleOptions());for(const user of users)tap(ul,(user.full_name||user.email)+" · "+user.email,()=>{if((user.roles||[]).includes("owner")){say("users-message","The Owner account is protected.");return;}uf.dataset.editId=user.id;uf.elements.title.value=user.full_name||"";uf.elements.email.value=user.email||"";uf.elements.email.readOnly=true;checks(uro,roleOptions(),user.roles||[]);checks(upo,permissionOptions(),user.permissions||[]);document.getElementById("users-form-title").textContent="Edit user";document.getElementById("users-cancel").hidden=false;uf.scrollIntoView({behavior:"smooth",block:"start"});});if(!users.length)ul.append(el("p","muted","No records found."));}
 function resetUsers(){reset(uf,"users-form-title","Add user",()=>{uf.elements.email.readOnly=false;document.getElementById("users-cancel").hidden=true;checks(uro,roleOptions());checks(upo,permissionOptions());});}
 uf?.addEventListener("submit",async event=>{event.preventDefault();const button=document.getElementById("users-submit");button.disabled=true;say("users-message","Saving…");try{const title=uf.elements.title.value.trim(),email=uf.elements.email.value.trim().toLowerCase(),selectedRoles=checked(uro),selectedPermissions=checked(upo),id=uf.dataset.editId;if(!title||!email)throw new Error("Title and Email are required to create or identify an Auth account.");const rolesToSave=selectedRoles.length?selectedRoles:["member"];if(id){await ownerUsers({action:"set-profile",userId:id,name:title,phone:users.find(item=>item.id===id)?.phone||""});await ownerUsers({action:"set-roles",userId:id,roles:rolesToSave});await ownerUsers({action:"set-permissions",userId:id,permissions:selectedPermissions});say("users-message","User updated.","success");}else{await ownerUsers({action:"invite",email,name:title,phone:"",roles:rolesToSave,permissions:selectedPermissions});say("users-message","Invitation sent to "+email+".","success");}resetUsers();await loadUsers();}catch(error){say("users-message",messageFrom(error),"error");}finally{button.disabled=false;}});
 document.getElementById("users-cancel")?.addEventListener("click",resetUsers);document.getElementById("users-refresh")?.addEventListener("click",loadUsers);if(uf)void loadUsers();

 // Roles: Title, Users and Permissions.
 const rf=document.getElementById("roles-form"),rl=document.getElementById("roles-list"),rpo=document.getElementById("role-permission-options"),ruo=document.getElementById("role-user-options");
 async function loadRoles(){if(!rl)return;await loadLookups();checks(rpo,permissionOptions());checks(ruo,userOptions());rl.replaceChildren();for(const item of roles)tap(rl,item.name,async()=>{rf.dataset.editId=item.id;rf.elements.title.value=item.name||"";const [permissionResult,userRoleResult]=await Promise.all([supabase.from("role_permissions").select("permission_id").eq("role_id",item.id),supabase.from("user_roles").select("user_id").eq("role",item.slug)]);if(permissionResult.error)throw permissionResult.error;if(userRoleResult.error)throw userRoleResult.error;checks(rpo,permissionOptions(),(permissionResult.data||[]).map(row=>row.permission_id));checks(ruo,userOptions(),(userRoleResult.data||[]).map(row=>row.user_id));document.getElementById("roles-form-title").textContent="Edit role";document.getElementById("roles-cancel").hidden=false;document.getElementById("roles-delete").hidden=Boolean(item.is_system);document.getElementById("roles-submit").disabled=item.slug==="owner";rf.scrollIntoView({behavior:"smooth",block:"start"});});if(!roles.length)rl.append(el("p","muted","No records found."));}
 function resetRoles(){reset(rf,"roles-form-title","Add role",()=>{document.getElementById("roles-cancel").hidden=true;document.getElementById("roles-delete").hidden=true;document.getElementById("roles-submit").disabled=false;checks(rpo,permissionOptions());checks(ruo,userOptions());});}
 rf?.addEventListener("submit",async event=>{event.preventDefault();const button=document.getElementById("roles-submit");button.disabled=true;say("roles-message","Saving…");try{const title=rf.elements.title.value.trim(),id=rf.dataset.editId,permissionIds=checked(rpo),selectedUsers=new Set(checked(ruo));if(!title)throw new Error("Title is required.");let roleId=id,roleSlug;if(id){const existing=roles.find(item=>item.id===id);if(!existing)throw new Error("Role not found.");roleSlug=existing.slug;const {error}=await supabase.from("Roles").update({name:title}).eq("id",id);if(error)throw error;}else{roleSlug=slug(title);const {data,error}=await supabase.from("Roles").insert({name:title,slug:roleSlug,description:"",is_active:true}).select("id").single();if(error)throw error;roleId=data.id;}
 const {error:deletePermissions}=await supabase.from("role_permissions").delete().eq("role_id",roleId);if(deletePermissions)throw deletePermissions;if(permissionIds.length){const {error}=await supabase.from("role_permissions").insert(permissionIds.map(permission_id=>({role_id:roleId,permission_id})));if(error)throw error;}
 const currentUsers=users.filter(user=>!(user.roles||[]).includes("owner"));for(const user of currentUsers){const had=(user.roles||[]).includes(roleSlug),want=selectedUsers.has(user.id);if(had===want)continue;let next=(user.roles||[]).filter(value=>value!==roleSlug);if(want)next.push(roleSlug);if(!next.length)next=["member"];await ownerUsers({action:"set-roles",userId:user.id,roles:[...new Set(next)]});}
 resetRoles();say("roles-message",id?"Role updated.":"Role created.","success");await loadRoles();}catch(error){say("roles-message",messageFrom(error),"error");}finally{button.disabled=false;}});
 document.getElementById("roles-cancel")?.addEventListener("click",resetRoles);document.getElementById("roles-refresh")?.addEventListener("click",loadRoles);
 document.getElementById("roles-delete")?.addEventListener("click",async()=>{const id=rf.dataset.editId,item=roles.find(role=>role.id===id);if(!id||item?.is_system||!confirm("Delete this Role?"))return;try{const {count,error:countError}=await supabase.from("user_roles").select("user_id",{count:"exact",head:true}).eq("role",item.slug);if(countError)throw countError;if(count)throw new Error("Remove this Role from all Users before deleting it.");const {error}=await supabase.from("Roles").delete().eq("id",id);if(error)throw error;resetRoles();say("roles-message","Role deleted.","success");await loadRoles();}catch(error){say("roles-message",messageFrom(error),"error");}});
 if(rf)void loadRoles();

 // Permission: Title, Users and Roles.
 const pf=document.getElementById("permission-form"),pl=document.getElementById("permissions-list"),puo=document.getElementById("permission-user-options"),pro=document.getElementById("permission-role-options");
 async function loadPermissions(){if(!pl)return;await loadLookups();checks(puo,userOptions());checks(pro,roleOptions());pl.replaceChildren();for(const item of permissions)tap(pl,item.name,async()=>{pf.dataset.editId=item.id;pf.elements.title.value=item.name||"";const [roleResult,userResult]=await Promise.all([supabase.from("role_permissions").select("role_id").eq("permission_id",item.id),supabase.from("user_permissions").select("user_id").eq("permission_id",item.id)]);if(roleResult.error)throw roleResult.error;if(userResult.error)throw userResult.error;const roleIds=new Set((roleResult.data||[]).map(row=>row.role_id));checks(pro,roles.filter(role=>role.slug!=="owner").map(role=>({value:role.id,label:role.name})),[...roleIds]);checks(puo,userOptions(),(userResult.data||[]).map(row=>row.user_id));document.getElementById("permission-form-title").textContent="Edit permission";document.getElementById("permission-cancel").hidden=false;document.getElementById("permission-delete").hidden=false;pf.scrollIntoView({behavior:"smooth",block:"start"});});if(!permissions.length)pl.append(el("p","muted","No records found."));}
 function resetPermission(){reset(pf,"permission-form-title","Add permission",()=>{document.getElementById("permission-cancel").hidden=true;document.getElementById("permission-delete").hidden=true;checks(puo,userOptions());checks(pro,roleOptions());});}
 pf?.addEventListener("submit",async event=>{event.preventDefault();const button=document.getElementById("permission-submit");button.disabled=true;say("permission-message","Saving…");try{const title=pf.elements.title.value.trim(),id=pf.dataset.editId,selectedUsers=new Set(checked(puo)),selectedRoleIds=checked(pro);if(!title)throw new Error("Title is required.");let permissionId=id;if(id){const {error}=await supabase.from("permissions").update({name:title}).eq("id",id);if(error)throw error;}else{const key=slug(title).replace(/-/g,".");const {data,error}=await supabase.from("permissions").insert({name:title,permission_key:key,resource:"content",action:"manage",description:"",is_active:true}).select("id").single();if(error)throw error;permissionId=data.id;}
 const {error:deleteRoles}=await supabase.from("role_permissions").delete().eq("permission_id",permissionId);if(deleteRoles)throw deleteRoles;if(selectedRoleIds.length){const {error}=await supabase.from("role_permissions").insert(selectedRoleIds.map(role_id=>({role_id,permission_id:permissionId})));if(error)throw error;}
 const currentUsers=users.filter(user=>!(user.roles||[]).includes("owner"));for(const user of currentUsers){const had=(user.permissions||[]).includes(permissionId),want=selectedUsers.has(user.id);if(had===want)continue;const next=(user.permissions||[]).filter(value=>value!==permissionId);if(want)next.push(permissionId);await ownerUsers({action:"set-permissions",userId:user.id,permissions:[...new Set(next)]});}
 resetPermission();say("permission-message",id?"Permission updated.":"Permission created.","success");await loadPermissions();}catch(error){say("permission-message",messageFrom(error),"error");}finally{button.disabled=false;}});
 document.getElementById("permission-cancel")?.addEventListener("click",resetPermission);document.getElementById("permission-refresh")?.addEventListener("click",loadPermissions);
 document.getElementById("permission-delete")?.addEventListener("click",async()=>{const id=pf.dataset.editId;if(!id||!confirm("Delete this Permission? It will be removed from assigned Users and Roles."))return;try{const {error}=await supabase.from("permissions").delete().eq("id",id);if(error)throw error;resetPermission();say("permission-message","Permission deleted.","success");await loadPermissions();}catch(error){say("permission-message",messageFrom(error),"error");}});
 if(pf)void loadPermissions();
}
