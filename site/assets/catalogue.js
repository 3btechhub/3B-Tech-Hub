import { createContactIcon, getContactActionLabel, getContactHref } from "./contact-utils.js";
import { createIcon, getModuleIcon, getItemIconName } from "./icon-utils.js";

const BASE = "/3btechhub/";
const definitions = {
  services: { title:"Services", table:"services", filter:["status","active"], icon:"wrench" },
  products: { title:"Products", table:"products", filter:["status","active"], icon:"package" },
  workshops: { title:"Workshops", table:"workshops", filter:["status","published"], icon:"building" },
  technicians: { title:"Technicians", table:"technicians", filter:["is_published",true], icon:"technician" },
  contacts: { title:"Contacts", table:"contacts", icon:"contact" }
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
function addField(root,label,value){
  if(value==null || (typeof value==="string" && !value.trim()))return;
  const section=el("section","catalogue-detail-section");
  section.append(el("h2","catalogue-detail-heading",label),el("p","catalogue-detail-field",value));
  root.append(section);
}
function renderGallery(root,record,module){
  const urls=Array.isArray(record.gallery_urls)?record.gallery_urls.filter(Boolean):[];
  if(record.photo_url&&!urls.includes(record.photo_url))urls.unshift(record.photo_url);
  if(!urls.length)return;
  const section=el("section","catalogue-detail-section catalogue-gallery-section");
  section.append(el("h2","catalogue-detail-heading","Gallery"));
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
  section.append(el("h2","catalogue-detail-heading","Location"));
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
  if(!actions.childElementCount)return false;
  const section=el("section","catalogue-detail-section");
  section.append(el("h2","catalogue-detail-heading","Contact"));
  section.append(actions);
  root.append(section);
  return true;
}
function renderProviderCards(root,title,records,module,emptyText){
  const section=el("section","catalogue-detail-section");
  section.append(el("h2","catalogue-detail-heading",title));
  if(!records.length)return;
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
    const titleLink=el("a","catalogue-related-name",name);
    if(record.slug)titleLink.href=BASE+module+"/"+encodeURIComponent(record.slug)+"/";
    top.append(titleLink);
    card.append(top);
    const summary=record.short_info||record.skill||record.description||"";
    if(summary)card.append(el("p","catalogue-related-summary",summary));
    if(record.location)card.append(el("p","catalogue-related-meta",record.location));
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
    let query=supabase.from(target).select("*").in("id",ids);
    if(target==="services"||target==="products")query=query.eq("status","active");
    if(target==="workshops")query=query.eq("status","published");
    if(target==="technicians")query=query.eq("is_published",true);
    const {data:records,error:recordsError}=await query;
    if(recordsError)throw recordsError;
    renderProviderCards(root,title,records||[],target);
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
  hero.append(visual,el("h1","catalogue-detail-title",data.name||data.title||def.title));
  root.append(hero);
  addField(root,"Countries",data.country);
  if(module==="workshops"){
    addField(root,"Location",data.location);
    addField(root,"Address",data.address);
    renderGallery(root,data,module);
  }else if(module==="technicians"){
    addField(root,"Skill / Expertise",data.skill);
    renderGallery(root,data,module);
    await renderContacts(root,data,supabase);
  }else{
    renderGallery(root,data,module);
  }
  await renderModuleRelationships(root,module,data,supabase);
  root.append(link(module,"Back to "+def.title));
}
function renderCard(item,module){
  const card=el("a","home-content-card");
  card.href=BASE+module+"/"+encodeURIComponent(item.slug)+"/";
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
  body.append(el("strong","",item.name||item.title||"Untitled"));
  if(item.country)body.append(el("small","home-content-card-meta",item.country));
  card.append(visual,body);
  return card;
}
export async function initCataloguePage(supabase,module,slug){
  const root=document.getElementById("catalogue-root");
  const def=definitions[module];
  if(!root||!def){if(root)root.textContent="Page not found.";return;}
  root.replaceChildren();
  if(slug){
    let query=supabase.from(def.table).select("*").eq("slug",slug).limit(1);
    if(def.filter)query=query.eq(def.filter[0],def.filter[1]);
    const {data,error}=await query.maybeSingle();
    if(error||!data){
      root.append(el("h1","","Content not found"),link(module,"Back to "+def.title));
      return;
    }
    if(module==="contacts"){
      root.append(el("h1","catalogue-title",data.name||def.title),el("p","catalogue-detail-field",data.value||""));
      const href=getContactHref(data.value);
      if(href){
        const action=el("a","pill-button",getContactActionLabel(data.value));
        action.href=href;
        root.append(action);
      }
      root.append(link(module,"Back to "+def.title));
      return;
    }
    try{await renderDetail(root,data,module,def,supabase);}
    catch(error){
      console.error("Related catalogue information could not be loaded.",error);
      root.append(el("p","muted","Some related information is temporarily unavailable."));
      root.append(link(module,"Back to "+def.title));
    }
    return;
  }

  const heading=el("h1","catalogue-title",def.title);
  heading.prepend(createIcon(getModuleIcon(module)));
  root.append(heading);
  let query=supabase.from(def.table).select("*").order("created_at",{ascending:false});
  if(def.filter)query=query.eq(def.filter[0],def.filter[1]);
  let records=[],offset=0;
  const pageSize=500;
  while(true){
    const {data,error}=await query.range(offset,offset+pageSize-1);
    if(error){root.append(el("p","muted","Could not load "+def.title.toLowerCase()+"."));return;}
    if(!data?.length)break;
    records.push(...data);
    if(data.length<pageSize)break;
    offset+=pageSize;
  }

  const grid=el("div","home-card-grid catalogue-results-grid");
  if(!records.length){
    grid.append(el("p","home-empty","No "+def.title.toLowerCase()+" available yet."));
  }else{
    records.forEach(record=>grid.append(renderCard(record,module)));
  }
  root.append(grid);
}
