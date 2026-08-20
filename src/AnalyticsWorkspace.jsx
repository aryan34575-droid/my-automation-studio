import React,{useState} from "react";
import {PowerBIStudio} from "./features/powerbi";
import {ExcelStudio} from "./features/excel";

export default function AnalyticsWorkspace(){
 const [view,setView]=useState("powerbi");
 return <div style={{width:"100%"}}>
  <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
   <button onClick={()=>setView("powerbi")}>📊 Power BI Studio</button>
   <button onClick={()=>setView("excel")}>📗 Excel Studio</button>
  </div>
  {view==="powerbi"?<PowerBIStudio/>:<ExcelStudio/>}
 </div>
}

