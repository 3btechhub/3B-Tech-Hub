const definitions = {
  services: { title:"Services", table:"services", columns:"id,name,slug,description,category,photo_url,status", filter:["status","active"], icon:"🔧" },
  products: { title:"Products", table:"products", columns:"id,name,slug,description,category,photo_url,status", filter:["status","active"], icon:"📦" },
  workshops: { title:"Workshops", table:"workshops", columns:"id,name:title,slug,description,location,trainer,category,photo_url,status", filter:["status","published"], icon:"🎓" },
  technicians: { title:"Technicians", table:"technicians", columns:"id,name,slug,description,skill,category,photo_url,is_published", filter:["is_published",true], icon:"👨‍🔧" },
  contacts: { title:"Contacts", table:"contacts", columns:"id,name,slug,value,type", filter:null, icon:"☎" }
};
// Choose a fallback from the item's name first; use the module icon only when no match exists.
export function getItemFallbackIcon(name,moduleIcon="🔧"){
 const value=String(name||"").normalize("NFKC").toLowerCase();
 const rules=[
  [/\b(cctv|surveillance|security camera|camera security)\b/,"📹"],
  [/\b(laptop|notebook|macbook)\b/,"💻"],
  [/\b(mobile|smartphone|iphone|android phone|cell ?phone)\b/,"📱"],
  [/\b(tablet|ipad)\b/,"📲"],
  [/\b(printer|printing|plotter)\b/,"🖨️"],
  [/\b(camera|photography|webcam)\b/,"📷"],
  [/\b(router|network|networking|wifi|wi-fi|internet|lan)\b/,"🌐"],
  [/\b(monitor|display|screen)\b/,"🖥️"],
  [/\b(keyboard)\b/,"⌨️"],
  [/\b(mouse|trackpad)\b/,"🖱️"],
  [/\b(charger|adapter|power supply|cable)\b/,"🔌"],
  [/\b(battery|power bank)\b/,"🔋"],
  [/\b(data recovery|backup|storage|ssd|hdd|hard ?drive|flash drive|usb drive)\b/,"💾"],
  [/\b(website|web design|web development|domain|hosting)\b/,"🌍"],
  [/\b(software|application|app development|programming)\b/,"🧩"],
  [/\b(training|course|learning|workshop|class)\b/,"🎓"],
  [/\b(technician|engineer|technical support|it support)\b/,"🧑‍🔧"],
  [/\b(whatsapp|messenger|chat)\b/,"💬"],
  [/\b(email|e-mail|mail)\b/,"✉️"],
  [/\b(phone|telephone|call|contact)\b/,"☎️"],
  [/\b(location|address|map)\b/,"📍"],
  [/\b(delivery|shipping|courier)\b/,"🚚"],
  [/\b(repair|maintenance|installation|service)\b/,"🛠️"],
  [/\b(computer|desktop|pc)\b/,"🖥️"],
  [/\b(accessories|accessory)\b/,"🎧"]
 ];
 for(const [pattern,icon] of rules)if(pattern.test(value))return icon;
 return moduleIcon;
}
\nfunction el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function link(path,label){const a=el("a","section-view-all",label);a.href="/3btechhub/"+path+"/";return a;}
function renderCard(item,def,module){
 const card=el("a","home-content-card");card.href="/3btechhub/"+module+"/"+encodeURIComponent(item.slug)+"/";
 const visual=el("span","home-content-visual");
 visual.append(el("span","home-content-fallback",getItemFallbackIcon(item.name,def.icon)));
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
  root.append(el("h1","",data.name||def.title));
  if(data.photo_url){const img=el("img","catalogue-detail-image");img.src=data.photo_url;img.alt=data.name||"";root.append(img);}
  if(data.description)root.append(el("p","catalogue-detail-field",data.description));
  const detail=module==="contacts"?data.value:module==="workshops"?[data.location,data.trainer].filter(Boolean).join(" · "):module==="technicians"?data.skill:data.category;
  if(detail)root.append(el("p","catalogue-detail-field",detail));
  if(module==="contacts"&&data.type==="email"){const a=el("a","pill-button","Email");a.href="mailto:"+data.value;root.append(a);}
  if(module==="contacts"&&data.type==="phone"){const a=el("a","pill-button","Call");a.href="tel:"+data.value;root.append(a);}
  if(module==="contacts"&&data.type==="link"){try{const url=new URL(data.value,location.origin);if(["https:","http:"].includes(url.protocol)){const a=el("a","pill-button","Open link");a.href=url.href;a.target="_blank";a.rel="noopener noreferrer";root.append(a);}}catch{root.append(el("p","muted","This contact link is invalid."));}}
  root.append(link(module,"Back to "+def.title));return;
 }
 root.append(el("h1","",def.title));
 let q=supabase.from(def.table).select(def.columns).order("created_at",{ascending:false});
 if(def.filter)q=q.eq(def.filter[0],def.filter[1]);
 const {data,error}=await q.limit(100);if(error){root.append(el("p","muted","Could not load "+def.title.toLowerCase()+"."));return;}
 const grid=el("div","home-card-grid");if(!data?.length)grid.append(el("p","home-empty","No "+def.title.toLowerCase()+" available yet."));
 else data.forEach(item=>grid.append(renderCard(item,def,module)));
 root.append(grid);
}
