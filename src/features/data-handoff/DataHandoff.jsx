import React,{useMemo,useState}from"react";import"./DataHandoff.css";

const demo={title:"Business Performance Analysis",kpis:[["Revenue","₹7.9L","+18.2%"],["Expenses","₹3.1L","+7.4%"],["Customers","1,620","+11.7%"],["Margin","60.8%","+4.6%"]],findings:["Revenue shows a positive period-over-period trend.","Customer activity is increasing alongside revenue.","Expenses are growing slower than revenue."],recommendations:["Continue monitoring revenue and margin together.","Investigate the strongest customer-growth periods.","Review expense categories with unusual increases."],quality:"Basic missing-value, duplicate and consistency checks completed."};

export default function DataHandoff(){
const[data,setData]=useState(demo),[tab,setTab]=useState("overview"),[status,setStatus]=useState("Ready");

const text=useMemo(()=>[
"BUSINESS PERFORMANCE ANALYSIS","",
"EXECUTIVE SUMMARY",
"Current analytics indicate positive business performance with improving revenue, customer activity and margin.","",
"KEY FINDINGS",...data.findings.map(x=>"- "+x),"",
"RECOMMENDATIONS",...data.recommendations.map(x=>"- "+x),"",
"DATA QUALITY",data.quality
].join("\n"),[data]);

function create(type){
setTab(type);
setStatus(`${type==="report"?"Report":type==="document"?"Document":type==="presentation"?"Presentation":"PDF-ready output"} generated from analytics`);
}

function exportText(){
const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));a.download="business-analysis-output.txt";a.click();setStatus("Office output exported");
}

return <div className="handoff">
<header><div><span>REAL DATA HANDOFF</span><h1>Analytics → Office</h1><p>Convert analytics results into business-ready outputs.</p></div><button className="primary" onClick={()=>create("report")}>Generate All</button></header>

<section className="pipeline">
{[["report","📑","Report"],["document","📄","Document"],["presentation","🎞","Presentation"],["pdf","📕","PDF Ready"]].map(x=>
<button className={tab===x[0]?"active":""} key={x[0]} onClick={()=>create(x[0])}><b>{x[1]}</b><span>{x[2]}</span><small>Generate</small></button>)}
</section>

{tab==="overview"&&<main>
<section className="summary"><span>ANALYTICS SOURCE</span><h2>{data.title}</h2><p>Outputs below are generated from the current analytics result set.</p></section>
<section className="kpis">{data.kpis.map(k=><article key={k[0]}><small>{k[0]}</small><b>{k[1]}</b><em>{k[2]}</em></article>)}</section>
<section className="grid"><article><h3>Key Findings</h3><ul>{data.findings.map(x=><li key={x}>{x}</li>)}</ul></article><article><h3>Recommendations</h3><ul>{data.recommendations.map(x=><li key={x}>{x}</li>)}</ul></article></section>
</main>}

{tab==="report"&&<Output title="Business Report"><h3>Executive Summary</h3><p>Current analytics indicate positive business performance with improving revenue, customer activity and margin.</p><h3>Key Findings</h3><ul>{data.findings.map(x=><li key={x}>{x}</li>)}</ul><h3>Recommendations</h3><ul>{data.recommendations.map(x=><li key={x}>{x}</li>)}</ul></Output>}

{tab==="document"&&<Output title="Business Document"><h2>{data.title}</h2><p>Prepared from the analytics workspace.</p><h3>Executive Summary</h3><p>Current analytics indicate positive business performance with improving revenue, customer activity and margin.</p><h3>Findings</h3><ul>{data.findings.map(x=><li key={x}>{x}</li>)}</ul></Output>}

{tab==="presentation"&&<div className="slides">{[["01","Executive Summary","Positive business performance with improving revenue and customer activity."],["02","Key Findings",data.findings[0]],["03","Recommendations",data.recommendations[0]]].map(s=><article key={s[0]}><small>{s[0]}</small><h2>{s[1]}</h2><p>{s[2]}</p></article>)}</div>}

{tab==="pdf"&&<Output title="PDF-Ready Business Report"><h2>{data.title}</h2><p>This layout is prepared for browser print / PDF output.</p><h3>KPIs</h3><div className="pdf-kpis">{data.kpis.map(k=><span key={k[0]}><b>{k[0]}</b>{k[1]}</span>)}</div><h3>Data Quality</h3><p>{data.quality}</p></Output>}

<footer><span>{status}</span><button onClick={exportText}>Export Output</button></footer>
</div>
}

function Output({title,children}){return <section className="output"><div className="output-head"><span>OFFICE OUTPUT</span><h2>{title}</h2></div>{children}</section>}

