import { getContactActionLabel, getContactHref, createContactIcon } from "./contact-utils.js";
import { createIcon, getModuleIcon, getItemFallbackIcon, getItemIconName } from "./icon-utils.js";
const definitions = {
  services: { title:"Services", table:"services", columns:"id,name,slug,description,category,photo_url,status", filter:["status","active"], icon:"wrench" },
  products: { title:"Products", table:"products", columns:"id,name,slug,description,category,photo_url,status", filter:["status","active"], icon:"package" },
  workshops: { title:"Workshops", table:"workshops", columns:"id,name:title,slug,description,location,trainer,category,photo_url,status", filter:["status","published"], icon:"building" },
  technicians: { title:"Technicians", table:"technicians", columns:"id,name,slug,description,skill,category,photo_url,is_published", filter:["is_published",true], icon:"technician" },
  contacts: { title:"Contacts", table:"contacts", columns:"id,name,slug,value", filter:null, icon:"contact" }
};
// Module-specific rules prevent one module's icon edits from affecting another module.
export function getItemFallbackIcon(name,module="services"){return createIcon(getItemIconName(name,module),"svg-icon item-svg-icon");}

function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function link(path,label){const a=el("a","section-view-all",label);a.href="/3btechhub/"+path+"/";return a;}
function renderCard(item,def,module){
 const card=el("a","home-content-card");card.href="/3btechhub/"+module+"/"+encodeURIComponent(item.slug)+"/";
 const visual=el("span","home-content-visual");
 if(module==="contacts"){const icon=createContactIcon(item.value,item.name);icon.classList.add("home-content-fallback");visual.append(icon);}else visual.append(getItemFallbackIcon(item.name,module));
 if(item.photo_url){const img=el("img");img.src=item.photo_url;img.alt="";img.loading="lazy";img.onerror=()=>img.remove();visual.append(img);}
 const body=el("span","home-content-card-body");body.append(el("strong","",item.name||"Untitled"));
 card.append(visual,body);return card;
}
export async function initCataloguePage(supabase,module,slug){
 const root=document.getElementById("catalogue-root");const def=definitions[module];if(!root||!def){if(root)root.textContent="Page not found.";return;}
 root.replaceChildren();
 if(slug){
  let q=supabase.from(def.table).select(def.columns).eq("slug",slug).limit(1);
  if(def.filter)q=q.eq(def.filter[0],def.filter[1]);
  const {data,error}=await q.maybeSingle();if(error||!data){root.append(el("h1","","Content not found"),link(module,"Back to "+def.title));return;}
  const heading=el("h1","catalogue-title",data.name||def.title);heading.prepend(module==="contacts"?createContactIcon(data.value,data.name):createIcon(getItemIconName(data.name,module)));root.append(heading);
  if(data.photo_url){const img=el("img","catalogue-detail-image");img.src=data.photo_url;img.alt=data.name||"";root.append(img);}
  if(data.description)root.append(el("p","catalogue-detail-field",data.description));
  const detail=module==="contacts"?data.value:module==="workshops"?[data.location,data.trainer].filter(Boolean).join(" · "):module==="technicians"?data.skill:data.category;
  if(detail)root.append(el("p","catalogue-detail-field",detail));
  if(module==="contacts"){const href=getContactHref(data.value);if(href){const a=el("a","pill-button",getContactActionLabel(data.value));a.href=href;if(href.startsWith("http:")||href.startsWith("https:")){a.target="_blank";a.rel="noopener noreferrer";}root.append(a);}else root.append(el("p","muted","This contact URL or value is invalid."));}
  root.append(link(module,"Back to "+def.title));return;
 }
 const heading=el("h1","catalogue-title",def.title);heading.prepend(createIcon(getModuleIcon(module)));root.append(heading);
 let q=supabase.from(def.table).select(def.columns).order("created_at",{ascending:false});
 if(def.filter)q=q.eq(def.filter[0],def.filter[1]);
 const {data,error}=await q.limit(100);if(error){root.append(el("p","muted","Could not load "+def.title.toLowerCase()+"."));return;}
 const grid=el("div","home-card-grid");if(!data?.length)grid.append(el("p","home-empty","No "+def.title.toLowerCase()+" available yet."));
 else data.forEach(item=>grid.append(renderCard(item,def,module)));
 root.append(grid);
}
