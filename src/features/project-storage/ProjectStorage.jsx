import React,{useEffect,useState}from"react";
import"./ProjectStorage.css";

const KEY="office-studio-projects-v1";

function read(){
 try{return JSON.parse(localStorage.getItem(KEY)||"[]")}
 catch{return[]}
}

export default function ProjectStorage(){
 const[projects,setProjects]=useState(read);
 const[selected,setSelected]=useState(null);
 const[status,setStatus]=useState("Ready");

 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(projects)),[projects]);

 function create(){
  const p={
   id:crypto.randomUUID(),
   name:"New Project",
   createdAt:new Date().toISOString(),
   updatedAt:new Date().toISOString(),
   data:{
    excel:null,
    powerbi:null,
    analytics:null,
    reports:[],
    documents:[],
    presentations:[]
   }
  };
  setProjects(x=>[p,...x]);
  setSelected(p.id);
  setStatus("Project created");
 }

 function rename(id){
  const name=window.prompt("Project name");
  if(!name?.trim())return;
  setProjects(x=>x.map(p=>p.id===id?{...p,name:name.trim(),updatedAt:new Date().toISOString()}:p));
  setStatus("Project renamed");
 }

 function remove(id){
  if(!window.confirm("Delete this project?"))return;
  setProjects(x=>x.filter(p=>p.id!==id));
  if(selected===id)setSelected(null);
  setStatus("Project deleted");
 }

 function open(id){
  setSelected(id);
  setStatus("Project opened");
 }

 function exportProject(){
  const p=projects.find(x=>x.id===selected);
  if(!p)return;
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([JSON.stringify(p,null,2)],{type:"application/json"}));
  a.download=`${p.name.replace(/[^\w-]+/g,"-")}.json`;
  a.click();
  setStatus("Project exported");
 }

 function importProject(e){
  const file=e.target.files?.[0];
  if(!file)return;
  const r=new FileReader();
  r.onload=()=>{
   try{
    const p=JSON.parse(r.result);
    if(!p.id||!p.name||!p.data)throw Error();
    p.id=crypto.randomUUID();
    p.updatedAt=new Date().toISOString();
    setProjects(x=>[p,...x]);
    setStatus("Project imported");
   }catch{
    setStatus("Invalid project file");
   }
  };
  r.readAsText(file);
  e.target.value="";
 }

 const current=projects.find(p=>p.id===selected);

 return <div className="ps">
  <header>
   <div>
    <span>PROJECT STORAGE V1</span>
    <h1>Project Manager</h1>
    <p>Save, open, import and export complete analytics projects.</p>
   </div>
   <button className="primary" onClick={create}>＋ New Project</button>
  </header>

  <div className="toolbar">
   <label className="import">Import Project
    <input hidden type="file" accept=".json" onChange={importProject}/>
   </label>
   <button disabled={!current} onClick={exportProject}>Export</button>
  </div>

  <main>
   <section className="list">
    <h3>Projects <small>{projects.length}</small></h3>
    {projects.length===0&&<p className="empty">No projects yet. Create your first project.</p>}
    {projects.map(p=>
     <article className={selected===p.id?"project active":"project"} key={p.id}>
      <button className="open" onClick={()=>open(p.id)}>
       <b>{p.name}</b>
       <small>Updated {new Date(p.updatedAt).toLocaleString()}</small>
      </button>
      <div>
       <button onClick={()=>rename(p.id)}>Rename</button>
       <button onClick={()=>remove(p.id)}>Delete</button>
      </div>
     </article>
    )}
   </section>

   <section className="details">
    {current?
     <>
      <span>ACTIVE PROJECT</span>
      <h2>{current.name}</h2>
      <div className="modules">
       {["Excel","Power BI","AI Analyst","Reports","Documents","Presentations"].map(x=><div key={x}>✓ {x}</div>)}
      </div>
      <p>Project storage is ready for the next database/API integration layer.</p>
     </>:
     <div className="empty">Select a project to view its workspace.</div>
    }
   </section>
  </main>

  <footer><span>{status}</span><span>Project Storage V1</span></footer>
 </div>
}
