// Only reviewed, site-hosted assets appear in the built-in image choices.
// External HTTPS image URLs are editorially supplied, not uploaded or copied.
export const BLOG_COVER_OPTIONS = [
 {url:"/intimate-studio-gathering.svg",label:"Intimate studio worship setting",alt:"Illustration of an intimate worship gathering in a studio"},
 {url:"/adeniyi-owolabi-portrait.jpg.png",label:"Founder portrait",alt:"Portrait of Adeniyi Owolabi, Worship Unscripted Birmingham vision convener"}
] as const;
export const DEFAULT_BLOG_COVER="/intimate-studio-gathering.svg";
export const DEFAULT_BLOG_COVER_ALT="Illustration of an intimate studio worship gathering";
export function safeBlogCover(value:unknown){
 if(typeof value!=="string")return "";
 const url=value.trim();
 if(!url)return "";
 if(BLOG_COVER_OPTIONS.some(x=>x.url===url))return url;
 if(url.length>1200||/[\s<>"'\\]/.test(url))return "";
 try{
  const parsed=new URL(url);
  // Never allow script/data/file URLs or embedded credentials.
  if(parsed.protocol!=="https:"||!parsed.hostname||parsed.username||parsed.password)return "";
  return url;
 }catch{return ""}
}
export function blogCoverAlt(value:unknown){
 return typeof value==="string"?value.trim().slice(0,220):"";
}
