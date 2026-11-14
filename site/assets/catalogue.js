import { createContactIcon, getContactActionLabel, getContactHref } from "./contact-utils.js";
import { createIcon, getModuleIcon, getItemIconName } from "./icon-utils.js";

const BASE = "/3btechhub/";
const publicColumns = {
  services:"id,name,description,photo_url,short_info,service_information,gallery_urls,location,map_url,phone,whatsapp,country,status",
  products:"id,name,description,condition,price_minor,currency,stock_qty,category,category_group,photo_url,short_info,service_information,gallery_urls,location,map_url,phone,whatsapp",
  workshops:"id,title,description,workshop_date,workshop_time,location,trainer,phone,whatsapp,photo_url,category,short_info,service_information,gallery_urls,map_url,address,country,status",
  technicians:"id,name,description,category,phone,whatsapp,photo_url,skill,short_info,service_information,gallery_urls,location,map_url,email,link,country,is_published",
  contacts:"id,name,value",
  "service-types":"id,title,slug,country,photo_url,status",
  "device-types":"id,title,slug,country,photo_url,status"
};
const definitions = {
  "service-types": { title:"Service Types", table:"service_types", columns:publicColumns["service-types"], icon:"service-types" },
  "device-types": { title:"Device Types", table:"device_types", columns:publicColumns["device-types"], icon:"device-types" },
  services: { title:"Services", table:"services", columns:publicColumns.services, icon:"wrench" },
  products: { title:"Products", table:"products", columns:publicColumns.products, icon:"package" },
  workshops: { title:"Workshops", table:"workshops", columns:publicColumns.workshops, icon:"building" },
  technicians: { title:"Technicians", table:"technicians", columns:publicColumns.technicians, icon:"technician" },
  contacts: { title:"Contacts", table:"contacts", columns:publicColumns.contacts, icon:"contact" }
};


export function getItemFallbackIcon(name,module="services"){
  return createIcon(getItemIconName(name,module),"svg-icon item-svg-icon");
}
function el(tag,cls,text){
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(text!==undefined)node.textContent=text;
  return node;
}
async function getPublicSlugMap(supabase,module){
  const {data,error}=await supabase.rpc("get_public_catalogue_slugs",{p_module:module});
  if(error)throw error;
  return new Map((data||[]).map(row=>[row.id,row.slug]));
}
function itemRoute(module,item,slugMap){
  const key=module==="contacts"?item.id:slugMap?.get(item.id);
  return key?BASE+module+"/"+encodeURIComponent(key)+"/":"";
}
function link(path,label){
  const anchor=el("a","section-view-all",label);
  anchor.href=BASE+path+"/";
  return anchor;
}
function safeExternalUrl(value){
  try{
    const url=new URL(String(value||""));
    return ["http:","https:"].includes(url.protocol)?url.href:"";
  }catch{return "";}
}
function hasDisplayValue(value){
  if(value==null)return false;
  if(typeof value==="string")return Boolean(value.trim());
  if(Array.isArray(value))return value.some(hasDisplayValue);
  if(typeof value==="object")return Object.values(value).some(hasDisplayValue);
  return true;
}
function addField(root,value){
  if(!hasDisplayValue(value))return;
  const values=Array.isArray(value)?value:[value];
  values.forEach(item=>{if(hasDisplayValue(item))root.append(el("p","catalogue-detail-field",String(item)));});
}
function renderGallery(root,record,module){
  const urls=Array.isArray(record.gallery_urls)?record.gallery_urls.filter(Boolean):[];
  if(record.photo_url&&!urls.includes(record.photo_url))urls.unshift(record.photo_url);
  if(!urls.length)return;
  const section=el("section","catalogue-detail-section catalogue-gallery-section");
  const gallery=el("div","catalogue-gallery");
  urls.forEach((url,index)=>{
    const button=el("button","catalogue-gallery-item");
    button.type="button";
    button.setAttribute("aria-label","View image "+(index+1));
    const image=el("img");
    image.src=url;
    image.alt=(record.name||record.title||"Item")+" image "+(index+1);
    image.loading="lazy";
    image.addEventListener("error",()=>button.remove(),{once:true});
    button.append(image);
    button.addEventListener("click",()=>openLightbox(url,record.name||record.title||"Image"));
    gallery.append(button);
  });
  section.append(gallery);
  root.append(section);
}
function openLightbox(url,label){
  let dialog=document.querySelector("#catalogue-image-lightbox");
  if(!dialog){
    dialog=el("dialog","catalogue-image-lightbox");
    dialog.id="catalogue-image-lightbox";
    const close=el("button","catalogue-lightbox-close","Close");
    close.type="button";
    close.addEventListener("click",()=>dialog.close());
    const image=el("img");
    image.alt="";
    dialog.append(close,image);
    dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
    document.body.append(dialog);
  }
  const image=dialog.querySelector("img");
  image.src=url;
  image.alt=label;
  if(!dialog.open)dialog.showModal();
}
function renderLocation(root,record){
  const location=String(record.location||"").trim();
  const suppliedMapUrl=safeExternalUrl(record.map_url);
  if(!location&&!suppliedMapUrl)return;
  const section=el("section","catalogue-detail-section");
  const card=el("div","catalogue-location-card");
  const icon=el("div","catalogue-location-icon");
  icon.append(createIcon("map-pin"));
  const body=el("div","catalogue-location-body");
  if(location)body.append(el("strong","",location));
  const mapUrl=suppliedMapUrl||(location?"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(location):"");
  if(mapUrl){
    const map=el("a","catalogue-map-link","View on Map");
    map.href=mapUrl;
    map.target="_blank";
    map.rel="noopener noreferrer";
    map.append(createIcon("external-link"));
    body.append(map);
  }
  card.append(icon,body);
  section.append(card);
  root.append(section);
}
async function renderContacts(root,record,supabase){
  const actions=el("div","catalogue-contact-actions");
  const phoneHref=getContactHref(record.phone);
  if(phoneHref){
    const call=el("a","catalogue-contact-button","Call");
    call.href=phoneHref;
    call.prepend(createIcon("phone"));
    actions.append(call);
  }
  const whatsappRaw=String(record.whatsapp||"").trim();
  let whatsappHref=getContactHref(whatsappRaw);
  if(whatsappRaw&&!/^https?:/i.test(whatsappRaw)&&!/^wa\.me\//i.test(whatsappRaw)){
    const digits=whatsappRaw.replace(/\D/g,"");
    if(digits.length>=7)whatsappHref="https://wa.me/"+digits;
  }

  const {data:globalContacts,error}=await supabase.from("contacts").select("name,value");
  const contacts=error?[]:(globalContacts||[]);
  if(!phoneHref){
    const globalCall=contacts.find(item=>/^(call|phone)$/i.test(String(item.name||"").trim()));
    const href=getContactHref(globalCall?.value);
    if(href){
      const call=el("a","catalogue-contact-button","Call");
      call.href=href;
      call.prepend(createIcon("phone"));
      actions.append(call);
    }
  }
  if(!whatsappHref){
    const globalWhatsapp=contacts.find(item=>/^whats?app$/i.test(String(item.name||"").trim()));
    whatsappHref=getContactHref(globalWhatsapp?.value);
  }
  if(whatsappHref){
    const whatsapp=el("a","catalogue-contact-button catalogue-contact-whatsapp","WhatsApp");
    whatsapp.href=whatsappHref;
    whatsapp.target="_blank";
    whatsapp.rel="noopener noreferrer";
    whatsapp.prepend(createContactIcon(whatsappHref,"WhatsApp"));
    actions.append(whatsapp);
  }
  const globalEmail=contacts.find(item=>/^(gmail|email)$/i.test(String(item.name||"").trim()));
  const emailValue=String(record.email||"").trim()||String(globalEmail?.value||"").trim();
  const emailHref=getContactHref(emailValue);
  if(emailHref){
    const email=el("a","catalogue-contact-button","Email");
    email.href=emailHref;
    email.prepend(createContactIcon(emailValue,"Email"));
    actions.append(email);
  }
  const externalLink=safeExternalUrl(record.link);
  if(externalLink){
    const linkValue=String(record.link||"").trim();
    const link=el("a","catalogue-contact-button",linkValue);
    link.href=externalLink;
    link.target="_blank";
    link.rel="noopener noreferrer";
    actions.append(link);
  }
  if(!actions.childElementCount)return false;
  const section=el("section","catalogue-detail-section");
  section.append(actions);
  root.append(section);
  return true;
}
function renderProviderCards(root,title,records,module,slugMap,emptyText){
  if(!records.length)return;
  const section=el("section","catalogue-detail-section");
  section.append(el("h2","catalogue-detail-heading",title));
  const grid=el("div","catalogue-related-grid");
  records.forEach(record=>{
    const card=el("article","catalogue-related-card");
    const top=el("div","catalogue-related-card-top");
    if(record.photo_url){
      const image=el("img","catalogue-related-image");
      image.src=record.photo_url;
      image.alt="";
      image.loading="lazy";
      image.addEventListener("error",()=>image.remove(),{once:true});
      top.append(image);
    }else{
      const visual=el("span","catalogue-related-image catalogue-related-fallback");
      visual.append(getItemFallbackIcon(record.name||record.title,module));
      top.append(visual);
    }
    const name=record.name||record.title||"";
    if(name){const titleLink=el("a","catalogue-related-name",name);const route=itemRoute(module,record,slugMap);if(route)titleLink.href=route;top.append(titleLink);}
    card.append(top);
    const summary=record.short_info||record.skill||record.description||"";
    if(hasDisplayValue(summary))card.append(el("p","catalogue-related-summary",summary));
    if(hasDisplayValue(record.location))card.append(el("p","catalogue-related-meta",record.location));
    const actions=el("div","catalogue-related-actions");
    const phoneHref=getContactHref(record.phone);
    if(phoneHref){
      const call=el("a","catalogue-related-action","Call");
      call.href=phoneHref;
      call.prepend(createIcon("phone"));
      actions.append(call);
    }
    const whatsappRaw=String(record.whatsapp||"").trim();
    let whatsappHref=getContactHref(whatsappRaw);
    if(whatsappRaw&&!/^https?:/i.test(whatsappRaw)&&!/^wa\.me\//i.test(whatsappRaw)){
      const digits=whatsappRaw.replace(/\D/g,"");
      if(digits.length>=7)whatsappHref="https://wa.me/"+digits;
    }
    if(whatsappHref){
      const whatsapp=el("a","catalogue-related-action","WhatsApp");
      whatsapp.href=whatsappHref;
      whatsapp.target="_blank";
      whatsapp.rel="noopener noreferrer";
      whatsapp.prepend(createIcon("message-circle"));
      actions.append(whatsapp);
    }
    if(actions.childElementCount)card.append(actions);
    grid.append(card);
  });
  section.append(grid);
  root.append(section);
}
async function renderModuleRelationships(root,module,data,supabase){
  const map={
    services:[["Products","service_products","service_id","product_id","products"],["Workshops","service_workshops","service_id","workshop_id","workshops"],["Technicians","service_technicians","service_id","technician_id","technicians"]],
    products:[["Workshops","product_workshops","product_id","workshop_id","workshops"],["Technicians","product_technicians","product_id","technician_id","technicians"]],
    workshops:[["Services","service_workshops","workshop_id","service_id","services"],["Products","product_workshops","workshop_id","product_id","products"],["Technicians","workshop_technicians","workshop_id","technician_id","technicians"]],
    technicians:[["Services","service_technicians","technician_id","service_id","services"],["Workshops","workshop_technicians","technician_id","workshop_id","workshops"]]
  };
  for(const [title,table,parent,child,target] of map[module]||[]){
    const {data:links,error}=await supabase.from(table).select(child).eq(parent,data.id);
    if(error)throw error;
    const ids=(links||[]).map(row=>row[child]);
    if(!ids.length)continue;
    let query=supabase.from(target).select(publicColumns[target]).in("id",ids);
    const {data:records,error:recordsError}=await query;
    if(recordsError)throw recordsError;
    const slugMap=target==="contacts"?new Map():await getPublicSlugMap(supabase,target);
    renderProviderCards(root,title,records||[],target,slugMap);
  }
}
async function renderDetail(root,data,module,def,supabase){
  root.classList.add("catalogue-detail-page");
  const hero=el("header","catalogue-detail-hero");
  const visual=el("div","catalogue-detail-hero-visual");
  if(data.photo_url){
    const image=el("img","catalogue-detail-hero-image");
    image.src=data.photo_url;
    image.alt=data.name||data.title||"";
    image.addEventListener("error",()=>{image.remove();visual.append(getItemFallbackIcon(data.name||data.title,module));},{once:true});
    visual.append(image);
  }else visual.append(getItemFallbackIcon(data.name||data.title,module));
  const itemTitle=data.name||data.title||"";
  if(itemTitle)hero.append(visual,el("h1","catalogue-detail-title",itemTitle));else hero.append(visual);
  root.append(hero);
  const fields={
    services:[data.description,data.short_info,data.service_information,data.location],
    products:[data.description,data.condition,data.price_minor==null?null:(Number(data.price_minor)/100).toFixed(2)+" "+(data.currency||"SAR"),data.stock_qty,data.short_info,data.service_information,data.location],
    workshops:[data.description,data.short_info,data.service_information,data.workshop_date,data.workshop_time,data.address,data.trainer],
    technicians:[data.description,data.skill,data.short_info,data.service_information,data.location]
  };
  (fields[module]||[]).forEach(value=>addField(root,value));
  if(module==="workshops")renderLocation(root,data);
  if(module==="technicians"||module==="workshops")await renderContacts(root,data,supabase);
  renderGallery(root,data,module);
  await renderModuleRelationships(root,module,data,supabase);
}
function renderCard(item,module,slugMap){
  const route=(module==="service-types"||module==="device-types")?"":itemRoute(module,item,slugMap);
  const card=el(route?"a":"article","home-content-card");
  if(route)card.href=route;
  const visual=el("span","home-content-visual");
  visual.append(getItemFallbackIcon(item.name||item.title,module));
  if(item.photo_url){
    const image=el("img");
    image.src=item.photo_url;
    image.alt="";
    image.loading="lazy";
    image.addEventListener("error",()=>image.remove(),{once:true});
    visual.append(image);
  }
  const body=el("span","home-content-card-body");
  const itemTitle=item.name||item.title||"";
  if(itemTitle)body.append(el("strong","",itemTitle));
  card.append(visual,body);
  return card;
}
function renderContactActionCard(item){
  const href=getContactHref(item.value);
  if(!href)return null;
  const card=el("article","contact-action-card");
  const title=el("h2","contact-action-title",item.name||"");
  const action=el("a","contact-action-button",getContactActionLabel(item.value));
  action.href=href;
  action.prepend(createContactIcon(item.value,item.name||""));
  if(/^https?:/i.test(href)){action.target="_blank";action.rel="noopener noreferrer";}
  card.append(title,action);
  return card;
}
const PAGE_SIZE=12;
function moduleFilterFields(module){
  const fields=[];
  if(module!=="contacts")fields.push(["country","Country"]);
  if(module==="workshops")fields.push(["location","Location"]);
  if(module==="technicians")fields.push(["skill","Skill / Expertise"]);
  return fields;
}
function renderModuleFilters(root,records,module,onChange){
  const fields=moduleFilterFields(module);
  if(!fields.length)return;
  const bar=el("div","catalogue-filter-bar");
  let count=0;
  fields.forEach(([key,label])=>{
    const values=[...new Set(records.map(record=>String(record[key]||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    if(values.length<2)return;
    const wrapper=el("label","catalogue-filter");
    wrapper.append(el("span","catalogue-filter-label",label));
    const select=el("select","catalogue-filter-select");
    const all=el("option","","All "+label);
    all.value="";
    select.append(all);
    values.forEach(value=>{const option=el("option","",value);option.value=value;select.append(option);});
    select.addEventListener("change",()=>onChange(key,select.value));
    wrapper.append(select);
    bar.append(wrapper);
    count++;
  });
  if(count)root.append(bar);
}
function renderModulePagination(root,page,total,onChange){
  const pages=Math.ceil(total/PAGE_SIZE);
  if(pages<2)return;
  const nav=el("nav","catalogue-pagination");
  nav.setAttribute("aria-label","Catalogue pages");
  const previous=el("button","catalogue-page-button","Previous");
  previous.type="button";previous.disabled=page===1;
  previous.addEventListener("click",()=>onChange(page-1));
  const status=el("span","catalogue-page-status","Page "+page+" of "+pages);
  const next=el("button","catalogue-page-button","Next");
  next.type="button";next.disabled=page===pages;
  next.addEventListener("click",()=>onChange(page+1));
  nav.append(previous,status,next);
  root.append(nav);
}

export async function initCataloguePage(supabase,module,recordKey){
  const root=document.getElementById("catalogue-root");
  const def=definitions[module];
  if(!root||!def){if(root)root.textContent="Page not found.";return;}
  root.replaceChildren();
  if(recordKey){
    let recordId=recordKey;
    if(module!=="contacts"){
      const slugMap=await getPublicSlugMap(supabase,module);
      recordId=[...slugMap.entries()].find(([,slug])=>slug===recordKey)?.[0]||"";
    }
    const query=supabase.from(def.table).select(def.columns).eq("id",recordId).limit(1);
    const {data,error}=await query.maybeSingle();
    if(error||!data){
      root.append(el("h1","","Content not found"));
      return;
    }
    if(module==="contacts"){
      if(data.name)root.append(el("h1","catalogue-title",data.name));
      if(data.value)root.append(el("p","catalogue-detail-field",data.value));
      const href=getContactHref(data.value);
      if(href){
        const action=el("a","pill-button",getContactActionLabel(data.value));
        action.href=href;
        root.append(action);
      }
      return;
    }
    try{await renderDetail(root,data,module,def,supabase);}
    catch(error){
      console.error("Related catalogue information could not be loaded.",error);
      root.append(el("p","muted","Some related information is temporarily unavailable."));
    }
    return;
  }

  root.classList.add("catalogue-listing-page");
  const heading=el("h1","catalogue-title",def.title);
  heading.prepend(createIcon(getModuleIcon(module)));
  root.append(heading);

  let query=supabase.from(def.table).select(def.columns);
  if(module==="service-types"||module==="device-types")query=query.in("status",["active","published"]);
  else if(module==="services"||module==="products")query=query.eq("status","active");
  else if(module==="workshops")query=query.eq("status","published");
  else if(module==="technicians")query=query.eq("is_published",true);

  const {data,error}=await query;
  if(error){root.append(el("p","muted","Could not load "+def.title.toLowerCase()+"."));return;}
  const records=(data||[]).slice().sort((a,b)=>String(a.title||a.name||"").localeCompare(String(b.title||b.name||"")));
  if(module==="contacts"){
    const grid=el("div","contact-action-grid");
    const valid=records.filter(record=>getContactHref(record.value));
    if(!valid.length)grid.append(el("p","home-empty","No contacts available yet."));
    else valid.forEach(record=>grid.append(renderContactActionCard(record)));
    root.append(grid);
    return;
  }

  const slugMap=(module==="service-types"||module==="device-types")?new Map():await getPublicSlugMap(supabase,module);
  const filterState=Object.create(null);
  let currentPage=1;
  const grid=el("div","home-card-grid catalogue-results-grid");
  const paginationHost=el("div","catalogue-pagination-host");
  const renderResults=()=>{
    const filtered=records.filter(record=>Object.entries(filterState).every(([key,value])=>!value||String(record[key]||"").trim()===value));
    const pageCount=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
    currentPage=Math.min(currentPage,pageCount);
    grid.replaceChildren();
    if(!filtered.length)grid.append(el("p","home-empty","No matching "+def.title.toLowerCase()+" available."));
    else filtered.slice((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE).forEach(record=>grid.append(renderCard(record,module,slugMap)));
    paginationHost.replaceChildren();
    renderModulePagination(paginationHost,currentPage,filtered.length,nextPage=>{currentPage=nextPage;renderResults();});
  };
  renderModuleFilters(root,records,module,(key,value)=>{filterState[key]=value;currentPage=1;renderResults();});
  root.append(grid,paginationHost);
  renderResults();
}
