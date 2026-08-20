import React,{useState}from"react";import"./AnalyticsHub.css";
const modules=[
{id:"excel",icon:"📗",name:"Excel Studio",desc:"Import & edit"},
{id:"quality",icon:"🧹",name:"Data Quality",desc:"Clean & validate"},
{id:"powerbi",icon:"📊",name:"Power BI",desc:"Analyse & visualize"},
{id:"ai",icon:"🤖",name:"AI Analyst",desc:"Find insights"},
{id:"report",icon:"📑",name:"Reports",desc:"Present & export"}];
export default function AnalyticsHub(){
const[active,setActive]=useState("overview"),[completed,setCompleted]=useState([]);
const select=id=>{setActive(id);if(id!=="overview")setCompleted(x=>x.includes(id)?x:[...x,id])};
const current=modules.find(x=>x.id===active);
return <div className="hub">
<header className="hub-head"><div><span>UNIFIED DATA ANALYST WORKSPACE</span><h1>Analytics Hub</h1><p>One workflow from raw data to business-ready output.</p></div><div className="health"><i/>System Ready</div></header>
<section className="pipeline">{modules.map((m,i)=><React.Fragment key={m.id}><button className={active===m.id?"active":""} onClick={()=>select(m.id)}><b>{m.icon}</b><strong>{m.name}</strong><small>{completed.includes(m.id)?"✓ Ready":m.desc}</small></button>{i<modules.length-1&&<em>→</em>}</React.Fragment>)}</section>
<section className="hub-main">{active==="overview"?<Overview onStart={()=>select("excel")}/>:<ModuleCard module={current} onBack={()=>setActive("overview")}/>}</section>
</div>}
function Overview({onStart}){return <div className="overview"><div className="hero-card"><span>END-TO-END WORKFLOW</span><h2>From raw data to decision-ready reports.</h2><p>Use the workspace in sequence: import data, validate it, analyse it, generate insights and prepare the final report.</p><button onClick={onStart}>Start Workflow →</button></div><div className="overview-grid"><article><b>01</b><h3>Prepare</h3><p>Excel and data-quality tools prepare reliable datasets.</p></article><article><b>02</b><h3>Analyse</h3><p>Power BI and analytics turn data into measurable insights.</p></article><article><b>03</b><h3>Present</h3><p>AI Analyst and Reports turn findings into business output.</p></article></div></div>}
function ModuleCard({module,onBack}){return <div className="module-card"><button className="back" onClick={onBack}>← Workspace</button><div className="module-icon">{module.icon}</div><span>WORKSPACE MODULE</span><h2>{module.name}</h2><p>{module.desc}</p><div className="module-status"><i/> Module available</div><div className="next">Next action: open the {module.name} workspace from the main navigation.</div></div>}

