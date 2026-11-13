const ICONS={
  wrench:'<path d="M14.7 6.3a5 5 0 0 0-6.6 6.6L3 18l3 3 5.1-5.1a5 5 0 0 0 6.6-6.6L14 13l-3-3 3.7-3.7Z"/>',
  package:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5"/>',
  building:'<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M8 9h.01M12 9h.01M16 9h.01M8 12h.01M12 12h.01M16 12h.01"/>',
  technician:'<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="m19 8 2 2-2 2M17 10h4M19 15v2m0 0-2 1m2-1 2 1"/>',
  contact:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2.5"/><path d="M5.5 17a4 4 0 0 1 7 0M15 9h3M15 13h3"/>',
  tv:'<rect x="3" y="5" width="18" height="13" rx="2"/><path d="m8 21 4-3 4 3M8 2l4 3 4-3"/>',
  phone:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 9h6v6H9zM9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>',
  satellite:'<path d="M4 4c4-2 8-1 11 2s4 7 2 11"/><path d="m4 4 7 7M3 14a7 7 0 0 0 7 7M2 18a11 11 0 0 0 4 4"/><path d="m13 11 5-5 3 3-5 5"/>',
  cable:'<path d="M8 3v5m8-5v5M6 8h12v4a6 6 0 0 1-12 0V8ZM12 18v3m-3 0h6"/>',
  plug:'<path d="M8 2v6m8-6v6M6 8h12v3a6 6 0 0 1-12 0V8ZM12 17v5"/>',
  headphones:'<path d="M3 13v-2a9 9 0 0 1 18 0v2"/><rect x="3" y="13" width="4" height="7" rx="2"/><rect x="17" y="13" width="4" height="7" rx="2"/>',
  shield:'<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  network:'<circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="m11 7-5 10m7-10 5 10M7 19h10"/>',
  receiver:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 21h10M8 10h8m-8 4h.01m3 0h.01m3 0h.01"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7"/>',
  chart:'<path d="M3 3v18h18M7 14l4-4 4 3 6-7"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  shieldCheck:'<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2Z"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  repeat:'<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3"/>',
  globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
  moon:'<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  check:'<path d="m5 12 4 4L19 6"/>',

  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  login:'<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6"/>',
  logout:'<path d="m14 17 5-5-5-5M19 12H8"/><path d="M12 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6"/>',
  mapPin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  youtube:'<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none"/>',
  reddit:'<circle cx="12" cy="13" r="8"/><path d="m9 8 1-4 5 1M15 5l2-2"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><path d="M9 16c2 2 4 2 6 0"/><circle cx="19" cy="8" r="2"/>',
  x:'<path d="M4 3h4.5l11.5 18h-4.5L4 3Z"/><path d="M20 3 5 21"/>',
  linkedin:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7h.01M12 17v-4a3 3 0 0 1 6 0v4M12 10v7"/>',
  instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>',
  whatsapp:'<path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.6A8.5 8.5 0 1 1 20.5 11.5Z"/><path d="M9 8.5c.5 3 2 4.5 5 5.5l1.2-1.5 2 1c-.3 1.5-1.4 2.5-3 2.5-3.5-.5-6.5-3.5-7-7 0-1.6 1-2.7 2.5-3l1 2Z"/>',
  tiktok:'<path d="M14 3v11.5a4.5 4.5 0 1 1-4-4.47"/><path d="M14 3c.5 3 2.5 5 5.5 5.5"/>',
  gmail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6M4 17V7m16 10V7"/>',
  facebook:'<path d="M14 21v-8h3l.5-4H14V7c0-1 .5-1.5 1.5-1.5H18V2h-3c-3 0-5 2-5 5v2H7v4h3v8Z"/>',
  imo:'<path d="M4 5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><circle cx="8" cy="11.5" r=".8" fill="currentColor"/><circle cx="12" cy="11.5" r=".8" fill="currentColor"/><circle cx="16" cy="11.5" r=".8" fill="currentColor"/>',
  serviceTvRepair:'<rect x="2.5" y="4" width="15" height="11" rx="1.5"/><path d="m7 19 3-4 3 4M7 2l3 2 3-2"/><path d="m17 16 4-4m-2-2 2 2-2 2m-4 4 2 2"/>',
  serviceMobileRepair:'<rect x="5" y="2" width="11" height="20" rx="2"/><path d="M9 18h3"/><path d="m17 7 4 4-6 6-3-3 5-5Z"/><path d="m16 8 3 3"/>',
  serviceMobileParts:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h3v3H7zM14 9h3M14 12h3M7 16h10"/><path d="M8 2v3m8-3v3M8 19v3m8-3v3"/>',
  serviceDishInstall:'<path d="M3 5c5-2 10 0 13 4s3 8 1 11"/><path d="m3 5 8 8"/><path d="M12 13 9 20h8"/><path d="M19 3v5m-2.5-2.5h5"/>',
  serviceDishService:'<path d="M3 4c5-2 10 0 13 4s3 8 1 11"/><path d="m3 4 8 8"/><path d="m11 12 3 7m-5 0h10"/><circle cx="18.5" cy="5.5" r="2.5"/><path d="M18.5 1.5v1m0 6v1m-4-4h1m6 0h1"/>',
  serviceDishParts:'<path d="M3 7c4-2 8-1 11 2"/><path d="m3 7 6 6"/><path d="m9 13 4 7h4"/><rect x="14" y="3" width="6" height="4" rx="1"/><path d="M17 7v4m-2-1h4"/>',
  productGlassProtector:'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M9 5h6M10 19h4"/><path d="m3 7 2-2m-2 6 2-2m14-4 2 2m-2 4 2 2"/>',
  productEarbuds:'<path d="M5 13V9a4 4 0 0 1 8 0v4"/><rect x="3" y="12" width="4" height="7" rx="2"/><path d="M19 13V9a4 4 0 0 0-8 0"/><rect x="17" y="12" width="4" height="7" rx="2"/><path d="M12 16v3a3 3 0 0 1-3 3"/>',
  productPhoneCase:'<rect x="5" y="2" width="14" height="20" rx="3"/><rect x="8" y="5" width="4" height="4" rx="1"/><circle cx="14.5" cy="7" r="1"/><path d="M8 13h8m-8 3h8m-5 3h2"/>',
  productLnb:'<path d="M3 4c4-1 7 1 9 4s2 7 0 10"/><path d="m3 4 6 6"/><path d="m9 10 5 7"/><path d="M14 17h5l2 3h-8Z"/><path d="M16 17v-3m2 3v-3"/>',
  productCoaxialCable:'<path d="M5 7c0-3 4-4 7-2s3 5 0 7-7 1-7-2 4-4 7-2 3 5 0 7-7 1-7-2"/><path d="m13 10 5-5m-2-2 4 4m-2-6 4 4"/><path d="m5 17-2 2 3 3 2-2"/>',
  productSatelliteDish:'<path d="M3 5c6-2 12 1 14 7s0 9-3 10"/><path d="m3 5 9 9"/><path d="m12 14 4 6m-7 0h10"/><path d="M18 4c2 1 3 3 3 5"/>',
  productReceiver:'<rect x="2.5" y="8" width="16" height="9" rx="2"/><path d="M6 12h5m-5 2h2"/><circle cx="15" cy="12.5" r="1"/><path d="M7 20h7m-3.5-3v3"/><path d="M20 5c1.5 1 2 2 2 3"/>',
  productCharger:'<rect x="6" y="7" width="12" height="13" rx="2"/><path d="M9 7V3m6 4V3"/><path d="m13 9-3 5h3l-2 4 5-6h-3l2-3Z"/>',
  productSplitter:'<path d="M12 3v6m0 0-7 6m7-6 7 6"/><rect x="9" y="2" width="6" height="4" rx="1"/><rect x="2" y="15" width="6" height="5" rx="1"/><rect x="16" y="15" width="6" height="5" rx="1"/><path d="M5 20v2m14-2v2"/>',
  workshopTv:'<path d="M3 21h18M5 21V9h14v12"/><rect x="7" y="3" width="10" height="6" rx="1"/><path d="m10 6 2 1 2-1M8 13h8m-8 3h5"/>',
  workshopMobile:'<path d="M3 21h18M5 21v-3h14v3"/><rect x="8" y="2" width="8" height="14" rx="2"/><path d="M10 4h4m-3 9h2"/><path d="m4 11-2 2 2 2m16-4 2 2-2 2"/>'

};
let databaseSvgRegistry=Object.create(null);
const SVG_NS="http://www.w3.org/2000/svg";
function appendSafeRegistrySvg(target,source){
 try{
  if(typeof DOMParser==="undefined")return false;
  const parsed=new DOMParser().parseFromString(String(source),"image/svg+xml");
  const root=parsed.documentElement;
  if(!root||root.localName!=="svg"||parsed.querySelector("parsererror"))return false;
  const viewBox=root.getAttribute("viewBox");
  if(viewBox&&viewBox!=="0 0 24 24")return false;
  const allowedTags=new Set(["path","circle","rect","line","polyline","polygon","ellipse"]);
  const allowedAttrs=new Set(["d","cx","cy","r","x","y","width","height","rx","ry","x1","x2","y1","y2","points","fill","stroke","stroke-width","stroke-linecap","stroke-linejoin","transform"]);
  for(const child of root.children){
   if(!allowedTags.has(child.localName))continue;
   const clean=document.createElementNS(SVG_NS,child.localName);
   for(const attr of Array.from(child.attributes))if(allowedAttrs.has(attr.name))clean.setAttribute(attr.name,attr.value);
   target.append(clean);
  }
  return target.childNodes.length>0;
 }catch{return false;}
}
export async function loadSvgIconRegistry(supabase){
 try{
  const {data,error}=await supabase.from("site_settings").select("setting_value").eq("setting_key","global_svg_icons").eq("is_public",true).maybeSingle();
  if(error||!data?.setting_value?.icons)return false;
  const next=Object.create(null);
  for(const [key,value] of Object.entries(data.setting_value.icons)){
   if(Object.prototype.hasOwnProperty.call(ICONS,key)&&typeof value==="string"&&value.length<12000)next[key]=value;
  }
  databaseSvgRegistry=next;
  return Object.keys(next).length>0;
 }catch(error){console.warn("SVG icon registry unavailable; using bundled SVGs.",error);return false;}
}
export function createIcon(name,className="svg-icon"){
 const svg=document.createElementNS(SVG_NS,"svg");
 svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("fill","none");svg.setAttribute("stroke","currentColor");svg.setAttribute("stroke-width","1.8");svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");svg.setAttribute("aria-hidden","true");svg.setAttribute("focusable","false");svg.classList.add(...String(className||"svg-icon").split(/\s+/).filter(Boolean));
 const key=String(name||"link").replace(/[^a-zA-Z]/g,"");
 if(databaseSvgRegistry[key]&&appendSafeRegistrySvg(svg,databaseSvgRegistry[key]))return svg;
 svg.innerHTML=ICONS[key]||ICONS.link;return svg;
}
const MODULE_ICONS={services:"wrench",products:"package",workshops:"building",technicians:"technician",contacts:"contact"};
export function getModuleIcon(module){return MODULE_ICONS[module]||"link";}

const ITEM_ICON_MAP = {
  services: {
    "tv repair":"serviceTvRepair",
    "mobile repair":"serviceMobileRepair",
    "mobile parts sell":"serviceMobileParts",
    "satellite dish installation":"serviceDishInstall",
    "satellite dish servicing":"serviceDishService",
    "satellite dish parts sell":"serviceDishParts"
  },
  products: {
    "glass protector":"productGlassProtector",
    "earphones & headphones":"productEarbuds",
    "phone cases & covers":"productPhoneCase",
    "lnb":"productLnb",
    "coaxial cables":"productCoaxialCable",
    "satellite dishes":"productSatelliteDish",
    "satellite receivers":"productReceiver",
    "chargers & adapters":"productCharger",
    "connectors & splitters":"productSplitter"
  },
  workshops: {
    "aynul tv servicing center":"workshopTv",
    "faruk mobile servicing center":"workshopMobile"
  }
};
export function getItemIconName(name,module){
 const value=String(name||"").trim().toLowerCase();
 const specific=ITEM_ICON_MAP[module]?.[value];
 if(specific)return specific;
 if(module==="technicians")return "technician";
 return getModuleIcon(module);
}
export function getItemFallbackIcon(name,module){return createIcon(getItemIconName(name,module),"svg-icon item-svg-icon");}
