import { ImageResponse } from "next/og";
export const alt = "Worship Unscripted Birmingham: One City. One Sound. One Encounter.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",
      backgroundColor:"#102019",color:"#f7f4ed",padding:"76px 95px",position:"relative"}}>
      <div style={{display:"flex",fontSize:22,fontWeight:700,letterSpacing:4,color:"#d8ba82",marginBottom:35}}>
        WORSHIP UNSCRIPTED · BIRMINGHAM
      </div>
      <div style={{display:"flex",fontSize:76,fontWeight:800,lineHeight:1.08,letterSpacing:-2,flexDirection:"column"}}>
        <span>One city. One sound.</span>
        <span style={{color:"#d8ba82"}}>One encounter.</span>
      </div>
      <div style={{display:"flex",fontSize:26,marginTop:48,color:"#e4e5d8"}}>
        Independent · Christ-centred · Interdenominational worship
      </div>
      <div style={{display:"flex",height:7,width:250,background:"#d8ba82",position:"absolute",left:95,bottom:56}}/>
    </div>,{...size}
  );
}
