import React,{useMemo,useState} from "react";
import * as XLSX from "@keep-lts/xlsx";
import "./PowerBIStudio.css";

const sample=[
 ["Month","Sales","Expenses","Users"],
 ["Jan",42000,18000,820],
 ["Feb",51000,21000,940],
 ["Mar",58000,23000,1100],
 ["Apr",63000,25000,1280],
 ["May",71000,29000,1450],
 ["Jun",79000,31000,1620]
];

const num=v=>{const n=Number(v);return Number.isFinite(n)?n:0};

export default function PowerBIStudio(){
 const [data,setData]=useState(sample);
 const [query,setQuery]=useState("");
 const [metric,setMetric]=useState("Sales");
 const [chart,setChart]=useState("bar");
 const [filter,setFilter]=useState("");
 const [status,setStatus]=useState("Ready");

 const headers=data[0]||[];
 const rows=data.slice(1);

 const numeric=headers.slice(1);

 const filtered=useMemo(()=>{
   const q=query.toLowerCase();
   return rows.filter(r=>
     (!q||r.some(v=>String(v??"").toLowerCase().includes(q))) &&
     (!filter||String(r[0]??"").toLowerCase().includes(filter.toLowerCase()))
   );
 },[rows,query,filter]);

 const values=filtered.map(r=>num(r[headers.indexOf(metric)]));
 const total=values.reduce((a,b)=>a+b,0);
 const avg=values.length?total/values.length:0;
 const max=values.length?Math.max(...values):0;

 const chartData=filtered.map((r,i)=>({
   label:String(r[0]??i+1),
   value:num(r[headers.indexOf(metric)])
 }));

 async function importFile(e){
   const f=e.target.files?.[0];
   if(!f)return;
   try{
     const b=await f.arrayBuffer();
     const w=XLSX.read(b,{type:"array",cellDates:true});
     const s=w.SheetNames[0];
     const rows=XLSX.utils.sheet_to_json(w.Sheets[s],{header:1,defval:""});
     if(!rows.length)throw Error("Empty dataset");
     setData(rows);
     setMetric(rows[0]?.[1]||rows[0]?.[0]||"");
     setStatus(`Loaded ${f.name}`);
   }catch(err){
     console.error(err);
     setStatus("Import failed");
   }
   e.target.value="";
 }

 function exportCSV(){
   const ws=XLSX.utils.aoa_to_sheet(data);
   const csv=XLSX.utils.sheet_to_csv(ws);
   const a=document.createElement("a");
   a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
   a.download="power-bi-report-data.csv";
   a.click();
   setStatus("CSV exported");
 }

 function exportXLSX(){
   const w=XLSX.utils.book_new();
   XLSX.utils.book_append_sheet(w,XLSX.utils.aoa_to_sheet(data),"Data");
   XLSX.writeFile(w,"power-bi-report-data.xlsx");
   setStatus("XLSX exported");
 }

 const maxBar=Math.max(...chartData.map(x=>x.value),1);

 return <div className="pbi">

   <header className="pbi-head">
     <div>
       <span className="pbi-kicker">BUSINESS INTELLIGENCE</span>
       <h1>Power BI Studio</h1>
       <p>Analyse datasets, build dashboards and generate business insights.</p>
     </div>
     <div className="pbi-actions">
       <label className="pbi-btn primary">Import Data
         <input hidden type="file" accept=".csv,.xlsx,.xls" onChange={importFile}/>
       </label>
       <button className="pbi-btn" onClick={exportCSV}>CSV</button>
       <button className="pbi-btn" onClick={exportXLSX}>XLSX</button>
     </div>
   </header>

   <section className="pbi-toolbar">
     <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search dataset..."/>
     <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter by first column..."/>
     <select value={metric} onChange={e=>setMetric(e.target.value)}>
       {numeric.map(h=><option key={h} value={h}>{h}</option>)}
     </select>
     <select value={chart} onChange={e=>setChart(e.target.value)}>
       <option value="bar">Bar Chart</option>
       <option value="line">Line Chart</option>
       <option value="area">Area Chart</option>
     </select>
     <span className="pbi-status">{status}</span>
   </section>

   <section className="pbi-kpis">
     <article><span>Total {metric}</span><strong>{total.toLocaleString()}</strong><small>Current filtered data</small></article>
     <article><span>Average</span><strong>{Math.round(avg).toLocaleString()}</strong><small>Per data point</small></article>
     <article><span>Peak</span><strong>{max.toLocaleString()}</strong><small>Highest value</small></article>
     <article><span>Records</span><strong>{filtered.length}</strong><small>Visible rows</small></article>
   </section>

   <section className="pbi-grid">
     <div className="pbi-card chart-card">
       <div className="card-head">
         <div><b>{metric} Trend</b><small>Interactive dataset view</small></div>
         <span>{filtered.length} points</span>
       </div>

       <div className={`pbi-chart ${chart}`}>
         {chartData.map((x,i)=>
           <div className="pbi-point" key={i}>
             <div className="bar" style={{height:`${Math.max(4,x.value/maxBar*88)}%`}}>
               <span>{x.value.toLocaleString()}</span>
             </div>
             <small>{x.label}</small>
           </div>
         )}
       </div>
     </div>

     <div className="pbi-card">
       <div className="card-head">
         <div><b>Dataset Summary</b><small>Automatic overview</small></div>
       </div>
       <div className="summary">
         <div><span>Columns</span><b>{headers.length}</b></div>
         <div><span>Rows</span><b>{rows.length}</b></div>
         <div><span>Visible</span><b>{filtered.length}</b></div>
         <div><span>Numeric fields</span><b>{numeric.length}</b></div>
       </div>
       <div className="insight">
         <b>Quick Insight</b>
         <p>{metric} totals <strong>{total.toLocaleString()}</strong> across the current filtered dataset.</p>
       </div>
     </div>
   </section>

   <section className="pbi-card table-card">
     <div className="card-head">
       <div><b>Data Table</b><small>Source dataset</small></div>
     </div>
     <div className="table-scroll">
       <table>
         <thead><tr>{headers.map((h,i)=><th key={i}>{String(h||`Column ${i+1}`)}</th>)}</tr></thead>
         <tbody>{filtered.map((r,i)=>
           <tr key={i}>{headers.map((_,c)=><td key={c}>{String(r[c]??"")}</td>)}</tr>
         )}</tbody>
       </table>
     </div>
   </section>

 </div>
}


