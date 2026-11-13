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
const serviceCategories = [
  ["Buy & Sell","package"],
  ["Home Delivery","map-pin"],
  ["Setup & Installation","plug"],
  ["Repair & Maintenance","wrench"]
];

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
  const emailHref=getContactHref(globalEmail?.value);
  if(emailHref){
    const email=el("a","catalogue-contact-button","Email");
    email.href=emailHref;
    email.prepend(createContactIcon(globalEmail.value,globalEmail.name));
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
  if(!records.length){
    section.append(el("p","catalogue-detail-field",emptyText||"Please contact us for more information."));
    root.append(section);
    return;
  }
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
async function loadServiceProviders(supabase,serviceId){
  const [workshopLinks,technicianLinks]=await Promise.all([
    supabase.from("service_workshops").select("workshop_id").eq("service_id",serviceId),
    supabase.from("service_technicians").select("technician_id").eq("service_id",serviceId)
  ]);
  if(workshopLinks.error)throw workshopLinks.error;
  if(technicianLinks.error)throw technicianLinks.error;
  const workshopIds=(workshopLinks.data||[]).map(item=>item.workshop_id);
  const technicianIds=(technicianLinks.data||[]).map(item=>item.technician_id);
  const [workshops,technicians]=await Promise.all([
    workshopIds.length?supabase.from("workshops").select("id,title,slug,short_info,description,location,phone,whatsapp,photo_url").in("id",workshopIds).eq("status","published"):{data:[],error:null},
    technicianIds.length?supabase.from("technicians").select("id,name,slug,short_info,description,skill,location,phone,whatsapp,photo_url").in("id",technicianIds).eq("is_published",true):{data:[],error:null}
  ]);
  if(workshops.error)throw workshops.error;
  if(technicians.error)throw technicians.error;
  return {workshops:workshops.data||[],technicians:technicians.data||[]};
}
async function loadProductWorkshops(supabase,productId){
  const {data:links,error}=await supabase.from("product_workshops").select("workshop_id").eq("product_id",productId);
  if(error)throw error;
  const ids=(links||[]).map(item=>item.workshop_id);
  if(!ids.length)return [];
  const {data,error:workshopError}=await supabase.from("workshops")
    .select("id,title,slug,short_info,description,location,phone,whatsapp,photo_url")
    .in("id",ids).eq("status","published");
  if(workshopError)throw workshopError;
  return data||[];
}
function formatPrice(record){
  if(record.price_minor==null)return "Contact for price";
  const amount=Number(record.price_minor)/100;
  const currency=String(record.currency||"SAR").trim()||"SAR";
  try{return new Intl.NumberFormat(undefined,{style:"currency",currency}).format(amount);}
  catch{return amount.toFixed(2)+" "+currency;}
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
  if(data.short_info)hero.append(el("p","catalogue-detail-short-info",data.short_info));
  root.append(hero);
  addField(root,"About",data.description);
  if(data.category)addField(root,"Category",data.category);

  if(module==="products"){
    const stock=Number(data.stock_qty||0);
    addField(root,"Price",formatPrice(data));
    addField(root,"Availability",stock>0?"Available · "+stock+" in stock":"Please contact us to confirm availability");
    if(data.condition)addField(root,"Condition",String(data.condition).replace(/^./,value=>value.toUpperCase()));
    const info=Array.isArray(data.service_information)?data.service_information.filter(Boolean):[];
    if(info.length){
      const section=el("section","catalogue-detail-section");
      section.append(el("h2","catalogue-detail-heading","Product Information"));
      const list=el("ul","catalogue-information-list");
      info.forEach(item=>{const li=el("li");li.append(createIcon("check-circle"),el("span","",item));list.append(li);});
      section.append(list);
      root.append(section);
    }
    renderGallery(root,data,module);
    const workshops=await loadProductWorkshops(supabase,data.id);
    renderProviderCards(root,"Where to Buy / Related Workshops",workshops,"workshops","Contact us to confirm where this product is available.");
    renderLocation(root,data);
    await renderContacts(root,data,supabase);
  }else if(module==="services"){
    const info=Array.isArray(data.service_information)?data.service_information.filter(Boolean):[];
    if(info.length){
      const section=el("section","catalogue-detail-section");
      section.append(el("h2","catalogue-detail-heading","Service Information"));
      const list=el("ul","catalogue-information-list");
      info.forEach(item=>{const li=el("li");li.append(createIcon("check-circle"),el("span","",item));list.append(li);});
      section.append(list);
      root.append(section);
    }
    renderGallery(root,data,module);
    const providers=await loadServiceProviders(supabase,data.id);
    renderProviderCards(root,"Related Workshops",providers.workshops,"workshops","Please contact us to find an available workshop for this service.");
    renderProviderCards(root,"Related Mechanicians",providers.technicians,"technicians","Please contact us to find an available mechanician for this service.");
    renderLocation(root,data);
    await renderContacts(root,data,supabase);
  }else{
    const info=Array.isArray(data.service_information)?data.service_information.filter(Boolean):[];
    if(info.length){
      const section=el("section","catalogue-detail-section");
      section.append(el("h2","catalogue-detail-heading",module==="workshops"?"Workshop Information":"Skills & Expertise"));
      const list=el("ul","catalogue-information-list");
      info.forEach(item=>{const li=el("li");li.append(createIcon("check-circle"),el("span","",item));list.append(li);});
      section.append(list);
      root.append(section);
    }
    if(module==="technicians"&&data.skill)addField(root,"Skill",data.skill);
    renderGallery(root,data,module);
    renderLocation(root,data);
    await renderContacts(root,data,supabase);
  }
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
  card.append(visual,body);
  return card;
}
function renderCategoryGrid(root,module,categories,selectedCategory){
  if(!categories.length)return;
  const grid=el("div","home-taxonomy-grid catalogue-category-grid");
  categories.forEach(([name,iconName])=>{
    const card=el("a","home-taxonomy-card");
    card.href=BASE+module+"/?category="+encodeURIComponent(name);
    if(name===selectedCategory)card.classList.add("is-active");
    const icon=el("span","home-taxonomy-icon");
    icon.append(createIcon(iconName||getItemIconName(name,module)));
    card.append(icon,el("strong","",name));
    grid.append(card);
  });
  root.append(grid);
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

  const selectedCategory=["services","products"].includes(module)
    ?(new URLSearchParams(window.location.search).get("category")||"").trim():"";
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

  if(module==="services"){
    renderCategoryGrid(root,module,serviceCategories,selectedCategory);
  }else if(module==="products"){
    const categories=[...new Set(records.map(record=>String(record.category||"").trim()).filter(Boolean))]
      .sort((a,b)=>a.localeCompare(b))
      .map(name=>[name,getItemIconName(name,"products")]);
    renderCategoryGrid(root,module,categories,selectedCategory);
  }
  if(selectedCategory){
    root.append(link(module,"View all "+def.title));
  }
  const search=el("input","catalogue-search");
  search.type="search";
  search.placeholder="Search "+def.title.toLowerCase()+"...";
  search.setAttribute("aria-label","Search "+def.title.toLowerCase());
  root.append(search);
  const filteredRecords=()=>records.filter(record=>{
    const name=String(record.name||record.title||"");
    const category=String(record.category||"");
    const matchesCategory=!selectedCategory||category===selectedCategory;
    const term=search.value.trim().toLocaleLowerCase();
    return matchesCategory&&(!term||(name+" "+category+" "+String(record.short_info||"")+" "+String(record.description||"")).toLocaleLowerCase().includes(term));
  });
  const grid=el("div","home-card-grid catalogue-results-grid");
  const renderResults=()=>{
    grid.replaceChildren();
    const visible=filteredRecords();
    if(!visible.length){
      grid.append(el("p","home-empty",records.length?"No matching items found.":"No "+def.title.toLowerCase()+" available yet."));
      return;
    }
    visible.forEach(record=>grid.append(renderCard(record,module)));
  };
  search.addEventListener("input",renderResults);
  renderResults();
  root.append(grid);
}
