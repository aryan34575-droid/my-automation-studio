import React,{useMemo,useState}from"react";
import "./AIDataAnalyst.css";

export default function AIDataAnalyst(){
 const[data]=useState([
  {metric:"Revenue",value:79000},
  {metric:"Expenses",value:31000},
  {metric:"Customers",value:1620}
 ]);
 const total=useMemo(()=>data.reduce((a,x)=>a+x.value,0),[data]);
 return <section className="ai-analyst">
  <header>
   <span>INTELLIGENT ANALYTICS</span>
   <h2>AI Data Analyst</h2>
   <p>Analyze structured business data and generate explainable insights.</p>
  </header>
  <div className="ai-metrics">
   {data.map(x=><article key={x.metric}>
    <small>{x.metric}</small>
    <strong>{x.value.toLocaleString()}</strong>
   </article>)}
  </div>
  <div className="ai-insight">
   <b>Analysis Ready</b>
   <p>Detected {data.length} numeric business metrics with a combined value of {total.toLocaleString()}.</p>
  </div>
 </section>
}

