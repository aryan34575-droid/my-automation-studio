import React,{useState}from"react";import"./DocumentEngine.css";

const starter={title:"New Business Document",blocks:[{type:"heading",text:"Executive Summary"},{type:"paragraph",text:"Start writing your business analysis here."},{type:"heading",text:"Key Findings"},{type:"paragraph",text:"Add findings, observations and recommendations from your analytics workflow."}]};
const slideStarter=[{title:"Business Overview",body:"Add your executive summary and key metrics."},{title:"Key Findings",body:"Add the most important insights from your analysis."},{title:"Recommendations",body:"Add actions and next steps."}];

export default function DocumentPresentationEngine(){
 const[mode,setMode]=useState("document"),[doc,setDoc]=useState(starter),[slides,setSlides]=useState(slideStarter),[activeSlide,setActiveSlide]=useState(0),[status,setStatus]=useState("Ready");

 function addBlock(type){setDoc(d=>({...d,blocks:[...d.blocks,{type,text:type==="heading"?"New Section":"Write your content here..."}]}));setStatus("Block added")}
 function updateBlock(i,text){setDoc(d=>({...d,blocks:d.blocks.map((b,n)=>n===i?{...b,text}:b)}))}
 function addSlide(){setSlides(s=>[...s,{title:"New Slide",body:"Add presentation content here."}]);setActiveSlide(slides.length);setStatus("Slide added")}
 function updateSlide(i,key,value){setSlides(s=>s.map((x,n)=>n===i?{...x,[key]:value}:x))}
 function removeSlide(i){setSlides(s=>s.filter((_,n)=>n!==i));setActiveSlide(Math.max(0,i-1));setStatus("Slide removed")}
 function saveProject(){localStorage.setItem("office-doc-project",JSON.stringify({doc,slides}));setStatus("Project saved locally")}
 function loadProject(){const x=localStorage.getItem("office-doc-project");if(x){const p=JSON.parse(x);setDoc(p.doc||starter);setSlides(p.slides||slideStarter);setStatus("Project loaded")}else setStatus("No saved project found")}
 function exportProject(){const data={document:doc,presentation:slides};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download="office-project.json";a.click();setStatus("Project exported")}
 return <div className="dpe">
  <header><div><span>REAL OFFICE ENGINE</span><h1>Document & Presentation Studio</h1><p>Create business documents and presentation-ready slides.</p></div><div className="actions"><button onClick={saveProject}>Save</button><button onClick={loadProject}>Open</button><button onClick={exportProject}>Export</button></div></header>
  <nav className="modebar"><button className={mode==="document"?"active":""} onClick={()=>setMode("document")}>📄 Document</button><button className={mode==="presentation"?"active":""} onClick={()=>setMode("presentation")}>🎞 Presentation</button></nav>
  {mode==="document"?<main className="document-layout"><aside><b>Document Tools</b><button onClick={()=>addBlock("heading")}>＋ Heading</button><button onClick={()=>addBlock("paragraph")}>＋ Paragraph</button><button onClick={()=>window.print()}>🖨 Print / PDF</button></aside><section className="paper"><input className="doc-title" value={doc.title} onChange={e=>setDoc({...doc,title:e.target.value})}/>{doc.blocks.map((b,i)=>b.type==="heading"?<input key={i} className="heading" value={b.text} onChange={e=>updateBlock(i,e.target.value)}/>:<textarea key={i} className="paragraph" value={b.text} onChange={e=>updateBlock(i,e.target.value)}/>)}</section></main>:<main className="presentation-layout"><aside className="slides">{slides.map((s,i)=><button className={activeSlide===i?"slide-thumb active":"slide-thumb"} onClick={()=>setActiveSlide(i)} key={i}><small>Slide {i+1}</small><b>{s.title}</b><span>{s.body}</span></button>)}<button onClick={addSlide}>＋ Add Slide</button></aside><section className="slide-editor"><div className="slide-canvas"><input value={slides[activeSlide]?.title||""} onChange={e=>updateSlide(activeSlide,"title",e.target.value)}/><textarea value={slides[activeSlide]?.body||""} onChange={e=>updateSlide(activeSlide,"body",e.target.value)}/></div><div className="slide-actions"><button onClick={addSlide}>Duplicate / Add</button><button onClick={()=>removeSlide(activeSlide)}>Delete Slide</button></div></section></main>}
  <footer><span>{status}</span><span>Real Office Engine V1</span></footer>
 </div>
}

