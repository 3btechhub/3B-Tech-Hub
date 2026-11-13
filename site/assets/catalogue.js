import { getContactActionLabel, getContactHref } from "./contact-utils.js";
import { createIcon, getModuleIcon, getItemIconName } from "./icon-utils.js";

const definitions = {
  services: { title:"Services", table:"services", columns:"*", filter:["status","active"], icon:"wrench" },
  products: { title:"Products", table:"products", columns:"*", filter:["status","active"], icon:"package" },
  workshops: { title:"Workshops", table:"workshops", columns:"*", filter:["status","published"], icon:"building" },
  technicians: { title:"Technicians", table:"technicians", columns:"*", filter:["is_published",true], icon:"technician" },
  contacts: { title:"Contacts", table:"contacts", columns:"id,name,slug,value", filter:null, icon:"contact" }
};

export function getItemFallbackIcon(name,module="services"){return createIcon(getItemIconName(name,module),"svg-icon item-svg-icon");}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function link(path,label){const a=el("a","section-view-all",label);a.href="/3btechhub/"+path+"/";return a;}
function safeExternalUrl(value){
  try{const url=new URL(String(value||""));return ["http:","https:"].includes(url.protocol)?url.href:"";}catch{return "";}
}
function addField(root,label,value){
  if(!value)return;
  const section=el("section","catalogue-detail-section");
  section.append(el("h2","catalogue-detail-heading",label),el("p","catalogue-detail-field",value));
  root.append(section);
}
function renderGallery(root,record,module){
  const section=el("section","catalogue-detail-section catalogue-gallery-section");
  section.append(el("h2","catalogue-detail-heading","Image Gallery"));
  const urls=Array.isArray(record.gallery_urls)?record.gallery_urls.filter(Boolean):[];
  if(record.photo_url&&!urls.includes(record.photo_url))urls.unshift(record.photo_url);
  const gallery=el("div","catalogue-gallery");
  if(!urls.length){
    const fallback=el("div","catalogue-gallery-empty");
    fallback.append(getItemFallbackIcon(record.name||record.title,module),el("span","", "No images uploaded yet"));
    gallery.append(fallback);
  }else{
    urls.forEach((url,index)=>{
      const button=el("button","catalogue-gallery-item");button.type="button";button.setAttribute("aria-label","View image "+(index+1));
      const img=el("img");img.src=url;img.alt=(record.name||record.title||"Item")+" image "+(index+1);img.loading="lazy";
      img.addEventListener("error",()=>button.remove(),{once:true});button.append(img);
      button.addEventListener("click",()=>openLightbox(url,record.name||record.title||"Image"));
      gallery.append(button);
    });
  }
  section.append(gallery);root.append(section);
}
function openLightbox(url,label){
  let dialog=document.querySelector("#catalogue-image-lightbox");
  if(!dialog){
    dialog=el("dialog","catalogue-image-lightbox");dialog.id="catalogue-image-lightbox";
    const close=el("button","catalogue-lightbox-close","Close");close.type="button";close.addEventListener("click",()=>dialog.close());
    const image=el("img","");image.alt="";dialog.append(close,image);
    dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
    document.body.append(dialog);
  }
  const image=dialog.querySelector("img");image.src=url;image.alt=label;
  if(!dialog.open)dialog.showModal();
}
function renderLocation(root,record){
  const section=el("section","catalogue-detail-section");
  section.append(el("h2","catalogue-detail-heading","Our Location"));
  const card=el("div","catalogue-location-card");
  const icon=el("div","catalogue-location-icon");icon.append(createIcon("map-pin"));
  const body=el("div","catalogue-location-body");
  body.append(el("strong","",record.location||"Location details will be updated soon"));
  const mapUrl=safeExternalUrl(record.map_url)||(record.location?"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(record.location):"");
  if(mapUrl){const map=el("a","catalogue-map-link","View Location on Map");map.href=mapUrl;map.target="_blank";map.rel="noopener noreferrer";map.append(createIcon("external-link"));body.append(map);}
  else body.append(el("span","muted","Map location is not available yet."));
  card.append(icon,body);section.append(card);root.append(section);
}
function renderContacts(root,record){
  const section=el("section","catalogue-detail-section");
  section.append(el("h2","catalogue-detail-heading","Contact"));
  const actions=el("div","catalogue-contact-actions");
  const phoneHref=getContactHref(record.phone);
  if(phoneHref){const call=el("a","catalogue-contact-button","Call Now");call.href=phoneHref;call.prepend(createIcon("phone"));actions.append(call);}
  const whatsappRaw=String(record.whatsapp||"").trim();
  let whatsappHref=getContactHref(whatsappRaw);
  if(whatsappRaw&&!/^https?:/i.test(whatsappRaw)&&!/^wa.me//i.test(whatsappRaw)){
    const digits=whatsappRaw.replace(/D/g,"");if(digits.length>=7)whatsappHref="https://wa.me/"+digits;
  }
  if(whatsappHref){const wa=el("a","catalogue-contact-button catalogue-contact-whatsapp","WhatsApp");wa.href=whatsappHref;wa.target="_blank";wa.rel="noopener noreferrer";wa.prepend(createIcon("message-circle"));actions.append(wa);}
  if(actions.childElementCount){section.append(actions);root.append(section);}
}
function renderDetail(root,data,module,def){
  root.classList.add("catalogue-detail-page");
  const hero=el("header","catalogue-detail-hero");
  const visual=el("div","catalogue-detail-hero-visual");
  if(data.photo_url){
    const image=el("img","catalogue-detail-hero-image");image.src=data.photo_url;image.alt=data.name||data.title||"";image.onerror=()=>{image.remove();visual.append(getItemFallbackIcon(data.name||data.title,module));};visual.append(image);
  }else visual.append(getItemFallbackIcon(data.name||data.title,module));
  hero.append(visual,el("h1","catalogue-detail-title",data.name||data.title||def.title));
  if(data.short_info)hero.append(el("p","catalogue-detail-short-info",data.short_info));
  root.append(hero);
  addField(root,"About",data.description);
  const info=Array.isArray(data.service_information)?data.service_information.filter(Boolean):[];
  if(info.length){
    const section=el("section","catalogue-detail-section");
    section.append(el("h2","catalogue-detail-heading",module==="products"?"Product Information":module==="workshops"?"Workshop Information":module==="technicians"?"Skills & Expertise":"Service Information"));
    const list=el("ul","catalogue-information-list");
    info.forEach(item=>{const li=el("li");li.append(createIcon("check-circle"),el("span","",item));list.append(li);});
    section.append(list);root.append(section);
  }
  renderGallery(root,data,module);
  renderLocation(root,data);
  renderContacts(root,data);
  if(module==="products"){
    const details=[data.category,data.condition&&("Condition: "+data.condition),data.stock_qty!=null&&("Stock: "+data.stock_qty)].filter(Boolean).join(" · ");
    addField(root,"Product Details",details);
  }else if(module==="workshops"){
    const details=[data.workshop_date,data.workshop_time,data.trainer&&("Trainer: "+data.trainer)].filter(Boolean).join(" · ");
    addField(root,"Workshop Details",details);
  }else if(module==="technicians"){
    addField(root,"Category",data.category);
  }
  root.append(link(module,"Back to "+def.title));
}
function renderCard(item,def,module){
 const card=el("a","home-content-card");card.href="/3btechhub/"+module+"/"+encodeURIComponent(item.slug)+"/";
 const visual=el("span","home-content-visual");visual.append(getItemFallbackIcon(item.name||item.title,module));
 if(item.photo_url){const img=el("img");img.src=item.photo_url;img.alt="";img.loading="lazy";img.onerror=()=>img.remove();visual.append(img);}
 const body=el("span","home-content-card-body");body.append(el("strong","",item.name||item.title||"Untitled"));
 card.append(visual,body);return card;
}
export async function initCataloguePage(supabase,module,slug){
 const root=document.getElementById("catalogue-root");const def=definitions[module];
 if(!root||!def){if(root)root.textContent="Page not found.";return;}
 root.replaceChildren();
 if(slug){
  let q=supabase.from(def.table).select(def.columns).eq("slug",slug).limit(1);
  if(def.filter)q=q.eq(def.filter[0],def.filter[1]);
  const {data,error}=await q.maybeSingle();
  if(error||!data){root.append(el("h1","","Content not found"),link(module,"Back to "+def.title));return;}
  if(module==="contacts"){
    const heading=el("h1","catalogue-title",data.name||def.title);root.append(heading,el("p","catalogue-detail-field",data.value||""));
    const href=getContactHref(data.value);if(href){const a=el("a","pill-button",getContactActionLabel(data.value));a.href=href;root.append(a);}
    root.append(link(module,"Back to "+def.title));return;
  }
  renderDetail(root,data,module,def);return;
 }
 const heading=el("h1","catalogue-title",def.title);heading.prepend(createIcon(getModuleIcon(module)));root.append(heading);
 let q=supabase.from(def.table).select(def.columns).order("created_at",{ascending:false});
 if(def.filter)q=q.eq(def.filter[0],def.filter[1]);
 let data=[];let offset=0;const pageSize=1000;
 while(true){const {data:page,error}=await q.range(offset,offset+pageSize-1);if(error){root.append(el("p","muted","Could not load "+def.title.toLowerCase()+"."));return;}if(!page?.length)break;data.push(...page);if(page.length<pageSize)break;offset+=pageSize;}
 const grid=el("div","home-card-grid");if(!data.length)grid.append(el("p","home-empty","No "+def.title.toLowerCase()+" available yet."));
 else data.forEach(item=>grid.append(renderCard(item,def,module)));
 root.append(grid);
}
