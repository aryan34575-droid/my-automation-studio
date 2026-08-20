import React,{useState}from"react";
import{ExcelStudio}from"../excel";
import{PowerBIStudio}from"../powerbi";
import{DataQualityStudio}from"../dataquality";
import"./AnalyticsWorkspace.css";

const steps=[
 {id:"excel",icon:"📗",name:"Excel Studio",desc:"Import, edit and prepare data"},
 {id:"quality",icon:"🧹",name:"Data Quality",desc:"Validate and clean datasets"},
 {id:"powerbi",icon:"📊",name:"Power BI Studio",desc:"Analyse and visualize data"}
];

export default function AnalyticsWorkspace(){
 const[active,setActive]=useState("excel");
 const[status,setStatus]=useState("Ready");

 function select(id){
   setActive(id);
   setStatus(
     id==="excel"?"Excel workspace active":
     id==="quality"?"Data quality workspace active":
     "Power BI workspace active"
   );
 }

 return <div className="analytics-workspace">

   <header className="analytics-header">
     <div>
       <span>DATA ANALYST WORKSPACE</span>
       <h1>Analytics Workspace</h1>
       <p>
         Import → Clean → Analyse → Present
       </p>
     </div>
     <div className="analytics-status">
       <i></i>{status}
     </div>
   </header>

   <nav className="analytics-nav">
     {steps.map(s=>
       <button
         key={s.id}
         className={active===s.id?"active":""}
         onClick={()=>select(s.id)}
       >
         <strong>{s.icon}</strong>
         <span>
           <b>{s.name}</b>
           <small>{s.desc}</small>
         </span>
       </button>
     )}
   </nav>

   <div className="analytics-flow">
     {steps.map((s,i)=>
       <React.Fragment key={s.id}>
         <div className={active===s.id?"flow-item active":"flow-item"}>
           {s.icon} {s.name}
         </div>
         {i<steps.length-1&&<span>→</span>}
       </React.Fragment>
     )}
   </div>

   <main className="analytics-content">
     {active==="excel"&&<ExcelStudio/>}
     {active==="quality"&&<DataQualityStudio/>}
     {active==="powerbi"&&<PowerBIStudio/>}
   </main>

 </div>
}

