const definitions = {
  services: { title:"Services", table:"services", columns:"id,name,slug,description,category,photo_url,status", filter:["status","active"], icon:"🔧" },
  products: { title:"Products", table:"products", columns:"id,name,slug,description,category,photo_url,status", filter:["status","active"], icon:"📦" },
  workshops: { title:"Workshops", table:"workshops", columns:"id,name:title,slug,description,location,trainer,category,photo_url,status", filter:["status","published"], icon:"🎓" },
  technicians: { title:"Technicians", table:"technicians", columns:"id,name,slug,description,skill,category,photo_url,is_published", filter:["is_published",true], icon:"👤" },
  contacts: { title:"Contacts", table:"contacts", columns:"id,name,slug,value,type", filter:null, icon:"☎" }
};
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function link(path,label){const a=el("a","section-view-all",label);a.href="/3btechhub/"+path+"/";return a;}
function renderCard(item,def,module){
 const card=el("a","home-content-card");card.href="/3btechhub/"+module+"/"+encodeURIComponent(item.slug)+"/";
 if(item.photo_url){const visual=el("span","home-content-visual");const img=el("img");img.src=item.photo_url;img.alt="";img.loading="lazy";img.onerror=()=>img.remove();visual.append(img);card.append(visual);}
 else {const visual=el("span","home-content-visual");visual.append(el("span","home-content-fallback",def.icon));card.append(visual);}
 const body=el("span","home-content-card-body");body.append(el("strong","",item.name||"Untitled"));
 const detail=module==="contacts"?item.type:module==="technicians"?item.skill:module==="workshops"?item.location||item.category:item.category;
 if(detail)body.append(el("span","muted",detail));card.append(body);return card;
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
