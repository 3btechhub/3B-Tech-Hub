const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE=/^\+?[\d\s().-]{7,}$/;

export function getContactHref(value){
 const raw=String(value||"").trim();
 if(!raw)return "";
 if(/^mailto:/i.test(raw))return raw;
 if(/^tel:/i.test(raw))return raw;
 if(EMAIL_RE.test(raw))return "mailto:"+raw;
 if(PHONE_RE.test(raw))return "tel:"+raw.replace(/[^\d+]/g,"");
 let candidate=raw;
 if(/^wa\.me\//i.test(candidate))candidate="https://"+candidate;
 candidate=candidate.replace(/^(https?:\/\/wa\.me)\/@/i,"$1/");
 if(/^www\./i.test(candidate)||/^[a-z0-9.-]+\.[a-z]{2,}(?:\/|$)/i.test(candidate))candidate="https://"+candidate;
 try{const url=new URL(candidate);if(url.protocol==="http:"||url.protocol==="https:")return url.href;}catch{}
 return "";
}

const BRAND_ICONS={
 youtube:{slug:"youtube",color:"FF0000",hosts:["youtube.com","youtu.be"]},
 reddit:{slug:"reddit",color:"FF4500",hosts:["reddit.com"]},
 x:{slug:"x",color:"000000",hosts:["x.com","twitter.com"]},
 linkedin:{slug:"linkedin",color:"0A66C2",hosts:["linkedin.com"]},
 instagram:{slug:"instagram",color:"E4405F",hosts:["instagram.com"]},
 whatsapp:{slug:"whatsapp",color:"25D366",hosts:["wa.me","whatsapp.com"]},
 tiktok:{slug:"tiktok",color:"000000",hosts:["tiktok.com"]},
 gmail:{slug:"gmail",color:"EA4335",hosts:["gmail.com","mail.google.com"]}
};

function matchesHost(host,domains){return domains.some(domain=>host===domain||host.endsWith("."+domain));}
function iconSource(value){
 const raw=String(value||"").trim();
 let href=getContactHref(raw);
 if(!href)return null;
 if(/^mailto:/i.test(href)){
  const email=href.slice(7).split("?")[0].toLowerCase();
  if(email.endsWith("@gmail.com"))return "https://cdn.simpleicons.org/gmail/EA4335";
  return null;
 }
 if(/^tel:/i.test(href))return null;
 let host="";
 try{host=new URL(href).hostname.toLowerCase().replace(/^www\./,"");}catch{}
 for(const brand of Object.values(BRAND_ICONS))if(matchesHost(host,brand.hosts))return "https://cdn.simpleicons.org/"+brand.slug+"/"+brand.color;
 if(host==="imoim.net"||host.endsWith(".imoim.net")||host==="imo.im"||host.endsWith(".imo.im"))return "https://www.google.com/s2/favicons?domain=imo.im&sz=64";
 return host?"https://www.google.com/s2/favicons?domain="+encodeURIComponent(host)+"&sz=64":null;
}

export function createContactIcon(value){
 const raw=String(value||"").trim();
 const href=getContactHref(raw);
 const img=document.createElement("img");
 img.className="contact-brand-icon";
 img.alt="";
 img.setAttribute("aria-hidden","true");
 img.width=24;img.height=24;
 const src=iconSource(value);
 if(src){img.src=src;img.loading="lazy";img.referrerPolicy="no-referrer";img.onerror=()=>{const fallback=document.createElement("span");fallback.className="contact-icon-fallback";fallback.textContent=href.startsWith("mailto:")?"✉":href.startsWith("tel:")?"☎":"🔗";img.replaceWith(fallback);};}
 else {img.remove();const fallback=document.createElement("span");fallback.className="contact-icon-fallback";fallback.textContent=href.startsWith("mailto:")?"✉":href.startsWith("tel:")?"☎":"🔗";return fallback;}
 return img;
}

export function getContactActionLabel(value){
 const href=getContactHref(value);
 if(href.startsWith("mailto:"))return "Email";
 if(href.startsWith("tel:"))return "Call";
 if(/wa\.me|whatsapp\.com/i.test(href))return "WhatsApp";
 return "Open link";
}
