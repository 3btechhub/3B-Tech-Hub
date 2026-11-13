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
  check:'<path d="m5 12 4 4L19 6"/>'
};
export function createIcon(name,className="svg-icon"){
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
 svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("fill","none");svg.setAttribute("stroke","currentColor");svg.setAttribute("stroke-width","1.8");svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");svg.setAttribute("aria-hidden","true");svg.setAttribute("focusable","false");svg.classList.add(...String(className||"svg-icon").split(/\\s+/).filter(Boolean));
 const key=String(name||"link").replace(/[^a-zA-Z]/g,"");
 const markup=ICONS[key]||ICONS.link;svg.innerHTML=markup;return svg;
}
const MODULE_ICONS={services:"wrench",products:"package",workshops:"building",technicians:"technician",contacts:"contact"};
export function getModuleIcon(module){return MODULE_ICONS[module]||"link";}
export function getItemIconName(name,module){
 const v=String(name||"").toLowerCase();
 if(module==="services"){
  if(/tv/.test(v))return "tv";
  if(/mobile/.test(v)&&/repair/.test(v))return "phone";
  if(/mobile/.test(v)&&/parts/.test(v))return "cpu";
  if(/satellite/.test(v)&&/installation/.test(v))return "satellite";
  if(/satellite/.test(v)&&/servicing/.test(v))return "wrench";
  if(/satellite/.test(v)&&/parts/.test(v))return "cpu";
 }
 if(module==="products"){
  if(/glass protector/.test(v))return "shield";
  if(/earphone|headphone/.test(v))return "headphones";
  if(/phone case|cover/.test(v))return "phone";
  if(/lnb|satellite dish/.test(v))return "satellite";
  if(/coaxial cable/.test(v))return "cable";
  if(/satellite receiver/.test(v))return "receiver";
  if(/charger|adapter/.test(v))return "plug";
  if(/connector|splitter/.test(v))return "network";
 }
 if(module==="workshops"){
  if(/tv/.test(v))return "building";
  if(/mobile/.test(v))return "building";
  return "building";
 }
 if(module==="technicians")return "technician";
 return getModuleIcon(module);
}
export function getItemFallbackIcon(name,module){return createIcon(getItemIconName(name,module),"svg-icon item-svg-icon");}
