import { createIcon } from "./icon-utils.js";
const EMAIL_RE=/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
const PHONE_RE=/^\\+?[\\d\\s().-]{7,}$/;
export function getContactHref(value){
 const raw=String(value||"").trim();if(!raw)return "";
 if(/^mailto:/i.test(raw))return raw;if(/^tel:/i.test(raw))return raw;
 if(EMAIL_RE.test(raw))return "mailto:"+raw;if(PHONE_RE.test(raw))return "tel:"+raw.replace(/[^\\d+]/g,"");
 let candidate=raw;if(/^wa\\.me\\//i.test(candidate))candidate="https://"+candidate;
 candidate=candidate.replace(/^(https?:\\/\\/wa\\.me)\\/@/i,"$1/");
 if(/^www\\./i.test(candidate)||/^[a-z0-9.-]+\\.[a-z]{2,}(?:\\/|$)/i.test(candidate))candidate="https://"+candidate;
 try{const url=new URL(candidate);if(url.protocol==="http:"||url.protocol==="https:")return url.href;}catch{}return "";
}
const BRANDS={
 youtube:{slug:"youtube",hosts:["youtube.com","youtu.be"]},
 reddit:{slug:"reddit",hosts:["reddit.com"]},
 x:{slug:"x",hosts:["x.com","twitter.com"]},
 linkedin:{slug:"linkedin",hosts:["linkedin.com"]},
 instagram:{slug:"instagram",hosts:["instagram.com"]},
 whatsapp:{slug:"whatsapp",hosts:["wa.me","whatsapp.com"]},
 tiktok:{slug:"tiktok",hosts:["tiktok.com"]},
 gmail:{slug:"gmail",hosts:["gmail.com","mail.google.com"]},
 facebook:{slug:"facebook",hosts:["facebook.com","fb.com"]},
 imo:{url:"https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/imo-icon.svg",hosts:["imoim.net","imo.im"]}
};
function identifyBrand(value,name){
 const n=String(name||"").toLowerCase().replace(/[^a-z]/g,"");
 if(n==="youtube"||n==="reddit"||n==="x"||n==="linkedin"||n==="instagram"||n==="whatsapp"||n==="tiktok"||n==="gmail"||n==="facebook"||n==="imo")return n;
 const href=getContactHref(value);if(href.startsWith("mailto:"))return href.toLowerCase().includes("@gmail.com")?"gmail":"";
 let host="";try{host=new URL(href).hostname.toLowerCase().replace(/^www\\./,"");}catch{}
 for(const [key,brand] of Object.entries(BRANDS))if(brand.hosts?.some(domain=>host===domain||host.endsWith("."+domain)))return key;
 return "";
}
export function createContactIcon(value,name=""){
 const brand=identifyBrand(value,name),config=BRANDS[brand];
 if(config){const img=document.createElement("img");img.className="contact-brand-icon";img.alt=brand.toUpperCase()+" logo";img.width=24;img.height=24;img.loading="lazy";img.referrerPolicy="no-referrer";img.src=config.url||("https://cdn.simpleicons.org/"+config.slug);img.onerror=()=>img.replaceWith(createIcon("link","contact-icon-fallback svg-icon"));return img;}
 return createIcon("link","contact-icon-fallback svg-icon");
}
export function getContactActionLabel(value){const href=getContactHref(value);if(href.startsWith("mailto:"))return "Email";if(href.startsWith("tel:"))return "Call";if(/wa\\.me|whatsapp\\.com/i.test(href))return "WhatsApp";return "Open link";}
