import { getContactActionLabel, getContactHref, createContactIcon } from "./contact-utils.js";
import { createIcon, getModuleIcon, getItemFallbackIcon, getItemIconName } from "./icon-utils.js";
const definitions = {
  services: { title:"Services", table:"services", columns:"id,name,slug,description,category,photo_url,status", filter:["status","active"], icon:"wrench" },
  products: { title:"Products", table:"products", columns:"id,name,slug,description,category,photo_url,status", filter:["status","active"], icon:"package" },
  workshops: { title:"Workshops", table:"workshops", columns:"id,name:title,slug,description,location,trainer,category,photo_url,status", filter:["status","published"], icon:"building" },
  technicians: { title:"Technicians", table:"technicians", columns:"id,name,slug,description,skill,category,photo_url,is_published", filter:["is_published",true], icon:"technician" },
  contacts: { title:"Contacts", table:"contacts", columns:"id,name,slug,value", filter:null, icon:"contact" }
};
// Every content record receives a dedicated SVG fallback icon.

