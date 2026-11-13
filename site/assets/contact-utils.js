const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE=/^\+?[\d\s().-]{7,}$/;

export function getContactHref(value){
 const raw=String(value||"").trim();
 if(!raw)return "";
 if(EMAIL_RE.test(raw))return "mailto:"+raw;
 if(PHONE_RE.test(raw))return "tel:"+raw.replace(/[^\d+]/g,"");
 let candidate=raw;
 if(/^wa\.me\//i.test(candidate))candidate="https://"+candidate;
 candidate=candidate.replace(/^(https?:\/\/wa\.me)\/@/i,"$1/");
 if(/^www\./i.test(candidate)||/^[a-z0-9.-]+\.[a-z]{2,}(?:\/|$)/i.test(candidate))candidate="https://"+candidate;
 try{const url=new URL(candidate);if(url.protocol==="http:"||url.protocol==="https:")return url.href;}catch{}
 return "";
}
export function getContactIcon(value){
 const raw=String(value||"").trim();
 if(EMAIL_RE.test(raw)||/^mailto:/i.test(raw))return "✉️";
 if(PHONE_RE.test(raw)||/^tel:/i.test(raw))return "📞";
 const href=getContactHref(raw);if(!href)return "🔗";
 if(href.startsWith("mailto:"))return "✉️";
 if(href.startsWith("tel:"))return "📞";
 let host="";try{host=new URL(href).hostname.toLowerCase().replace(/^www\./,"");}catch{}
 if(host==="youtube.com"||host==="youtu.be"||host.endsWith(".youtube.com"))return "▶️";
 if(host==="reddit.com"||host.endsWith(".reddit.com"))return "👽";
 if(host==="x.com"||host==="twitter.com")return "𝕏";
 if(host==="linkedin.com"||host.endsWith(".linkedin.com"))return "💼";
 if(host==="instagram.com"||host.endsWith(".instagram.com"))return "📸";
 if(host==="tiktok.com"||host.endsWith(".tiktok.com"))return "♪";
 if(host==="wa.me"||host==="whatsapp.com"||host.endsWith(".whatsapp.com"))return "💬";
 if(host==="imoim.net"||host.endsWith(".imoim.net"))return "💬";
 if(host==="facebook.com"||host.endsWith(".facebook.com"))return "f";
 return "🌐";
}
export function getContactActionLabel(value){
 const href=getContactHref(value);
 if(href.startsWith("mailto:"))return "Email";
 if(href.startsWith("tel:"))return "Call";
 if(/wa\.me|whatsapp\.com/i.test(href))return "WhatsApp";
 return "Open link";
}