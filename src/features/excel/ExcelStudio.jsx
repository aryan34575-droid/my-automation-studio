import React,{useMemo,useState} from "react";
import * as XLSX from "@keep-lts/xlsx";
import "./ExcelStudio.css";

const copyRows=(x)=>x.map(r=>[...r]);

export default function ExcelStudio(){

 const [workbook,setWorkbook]=useState(null);
 const [sheet,setSheet]=useState("");
 const [search,setSearch]=useState("");
 const [filter,setFilter]=useState("");
 const [filterColumn,setFilterColumn]=useState(-1);
 const [sortColumn,setSortColumn]=useState(-1);
 const [sortDirection,setSortDirection]=useState("asc");
 const [history,setHistory]=useState([]);
 const [future,setFuture]=useState([]);
 const [message,setMessage]=useState("Ready");
 const [cleanPanel,setCleanPanel]=useState(false);

 const rows=workbook?.[sheet]||[];
 const headers=rows[0]||[];
 const data=rows.slice(1);

 const visible=useMemo(()=>{
   let result=data.map((row,index)=>({row,index}));

   const q=search.trim().toLowerCase();

   if(q){
     result=result.filter(x=>
       x.row.some(v=>
         String(v??"").toLowerCase().includes(q)
       )
     );
   }

   if(filterColumn>=0 && filter.trim()){
     const f=filter.trim().toLowerCase();
     result=result.filter(x=>
       String(x.row[filterColumn]??"")
       .toLowerCase()
       .includes(f)
     );
   }

   if(sortColumn>=0){
     result=[...result].sort((a,b)=>{
       const av=a.row[sortColumn]??"";
       const bv=b.row[sortColumn]??"";

       const an=Number(av);
       const bn=Number(bv);

       let c;

       if(!Number.isNaN(an)&&!Number.isNaN(bn))
         c=an-bn;
       else
         c=String(av).localeCompare(String(bv));

       return sortDirection==="asc"?c:-c;
     });
   }

   return result;
 },[data,search,filter,filterColumn,sortColumn,sortDirection]);

 function commit(next,msg){
   setHistory(h=>[...h.slice(-29),workbook]);
   setFuture([]);
   setWorkbook(next);
   setMessage(msg);
 }

 async function openFile(event){

   const file=event.target.files?.[0];

   if(!file)return;

   try{

     setMessage("Reading file...");

     const buffer=await file.arrayBuffer();

     const wb=XLSX.read(buffer,{
       type:"array",
       cellDates:true
     });

     const result={};

     wb.SheetNames.forEach(name=>{
       result[name]=XLSX.utils.sheet_to_json(
         wb.Sheets[name],
         {header:1,defval:""}
       );
     });

     setWorkbook(result);
     setSheet(wb.SheetNames[0]||"");
     setHistory([]);
     setFuture([]);
     setMessage(`Loaded: ${file.name}`);

   }catch(error){

     console.error(error);
     setMessage("Could not read this file.");

   }

   event.target.value="";
 }

 function editCell(index,column,value){

   const next=copyRows(workbook[sheet]);

   next[index+1]=[...(next[index+1]||[])];
   next[index+1][column]=value;

   commit(
     {...workbook,[sheet]:next},
     "Cell updated"
   );
 }

 function addRow(){

   const next=copyRows(rows);

   next.push(
     Array(Math.max(headers.length,1)).fill("")
   );

   commit(
     {...workbook,[sheet]:next},
     "Row added"
   );
 }

 function addColumn(){

   const next=rows.map(row=>[...row,""]);

   commit(
     {...workbook,[sheet]:next},
     "Column added"
   );
 }

 function removeRow(){

   if(rows.length<=1)return;

   const next=copyRows(rows);
   next.pop();

   commit(
     {...workbook,[sheet]:next},
     "Last row removed"
   );
 }

 function removeColumn(){

   const next=rows.map(row=>{
     const r=[...row];
     r.pop();
     return r;
   });

   commit(
     {...workbook,[sheet]:next},
     "Last column removed"
   );
 }

 function undo(){

   if(!history.length)return;

   const previous=history[history.length-1];

   setFuture(f=>[workbook,...f.slice(0,29)]);
   setHistory(h=>h.slice(0,-1));
   setWorkbook(previous);
   setSheet(Object.keys(previous)[0]||"");
   setMessage("Undo complete");
 }

 function redo(){

   if(!future.length)return;

   const next=future[0];

   setHistory(h=>[...h.slice(-29),workbook]);
   setFuture(f=>f.slice(1));
   setWorkbook(next);
   setSheet(Object.keys(next)[0]||"");
   setMessage("Redo complete");
 }

 function cleanData(){

   const next=rows.map(row=>
     row.map(value=>
       typeof value==="string"
         ?value.trim()
         :value
     )
   );

   const unique=[];
   const seen=new Set();

   next.forEach((row,index)=>{

     if(index===0){
       unique.push(row);
       return;
     }

     const key=JSON.stringify(row);

     if(!seen.has(key)){
       seen.add(key);
       unique.push(row);
     }

   });

   commit(
     {...workbook,[sheet]:unique},
     "Text cleaned + duplicates removed"
   );

   setCleanPanel(false);
 }

 function exportXLSX(){

   if(!workbook)return;

   const out=XLSX.utils.book_new();

   Object.entries(workbook).forEach(([name,data])=>{

     const ws=XLSX.utils.aoa_to_sheet(data);

     XLSX.utils.book_append_sheet(
       out,
       ws,
       name.substring(0,31)
     );

   });

   XLSX.writeFile(
     out,
     "automation-studio-workbook.xlsx"
   );

   setMessage("XLSX exported");
 }

 function exportCSV(){

   if(!workbook||!sheet)return;

   const ws=XLSX.utils.aoa_to_sheet(
     workbook[sheet]
   );

   const csv=XLSX.utils.sheet_to_csv(ws);

   const blob=new Blob(
     [csv],
     {type:"text/csv;charset=utf-8"}
   );

   const url=URL.createObjectURL(blob);

   const a=document.createElement("a");
   a.href=url;
   a.download=`${sheet}.csv`;
   a.click();

   URL.revokeObjectURL(url);

   setMessage("CSV exported");
 }

 if(!workbook){

   return(
     <div className="excel-studio">

       <div className="excel-hero">

         <div>
           <span className="excel-kicker">
             OFFICE WORKSPACE
           </span>

           <h1>Excel Studio</h1>

           <p>
             Import, clean, edit, analyse and export
             professional spreadsheets.
           </p>
         </div>

         <label className="excel-button primary">
           Open Excel / CSV

           <input
             hidden
             type="file"
             accept=".xlsx,.xls,.csv"
             onChange={openFile}
           />

         </label>

       </div>

       <div className="excel-empty">

         <div className="excel-empty-icon">
           📊
         </div>

         <h2>Start a workbook</h2>

         <p>
           Supports XLSX, XLS and CSV files.
         </p>

       </div>

     </div>
   );
 }

 return(

   <div className="excel-studio">

     <div className="excel-hero">

       <div>

         <span className="excel-kicker">
           EXCEL WORKSPACE
         </span>

         <h1>{sheet}</h1>

         <p>
           {data.length} rows · {headers.length} columns ·
           {Object.keys(workbook).length} sheets
         </p>

       </div>

       <div className="excel-actions">

         <label className="excel-button primary">
           Open File
           <input
             hidden
             type="file"
             accept=".xlsx,.xls,.csv"
             onChange={openFile}
           />
         </label>

         <button
           className="excel-button"
           onClick={exportXLSX}
         >
           Export XLSX
         </button>

         <button
           className="excel-button"
           onClick={exportCSV}
         >
           Export CSV
         </button>

       </div>

     </div>

     <div className="excel-toolbar">

       <div className="excel-search">
         🔎
         <input
           value={search}
           onChange={e=>setSearch(e.target.value)}
           placeholder="Search all cells..."
         />
       </div>

       <select
         value={filterColumn}
         onChange={e=>{
           setFilterColumn(Number(e.target.value));
           setFilter("");
         }}
       >
         <option value="-1">
           Filter column...
         </option>

         {headers.map((header,index)=>(
           <option key={index} value={index}>
             {String(header||`Column ${index+1}`)}
           </option>
         ))}

       </select>

       {filterColumn>=0&&(
         <input
           value={filter}
           onChange={e=>setFilter(e.target.value)}
           placeholder="Filter value..."
         />
       )}

       <span className="excel-status">
         {message}
       </span>

     </div>

     <div className="excel-tools">

       <button onClick={addRow}>
         + Row
       </button>

       <button onClick={addColumn}>
         + Column
       </button>

       <button onClick={removeRow}>
         − Row
       </button>

       <button onClick={removeColumn}>
         − Column
       </button>

       <button
         onClick={undo}
         disabled={!history.length}
       >
         ↶ Undo
       </button>

       <button
         onClick={redo}
         disabled={!future.length}
       >
         ↷ Redo
       </button>

       <button onClick={()=>setCleanPanel(v=>!v)}>
         🧹 Clean Data
       </button>

     </div>

     {cleanPanel&&(

       <div className="excel-clean-panel">

         <strong>
           Advanced Data Cleaning
         </strong>

         <span>
           Trim text + remove duplicate rows
         </span>

         <button
           className="excel-button primary"
           onClick={cleanData}
         >
           Apply Cleaning
         </button>

       </div>

     )}

     <div className="excel-workspace">

       <aside className="excel-sheets">

         <div className="excel-section-title">
           WORKBOOK
         </div>

         {Object.keys(workbook).map(name=>(

           <button
             key={name}
             className={
               name===sheet
                 ?"sheet active"
                 :"sheet"
             }
             onClick={()=>{

               setSheet(name);
               setFilterColumn(-1);
               setFilter("");

             }}
           >
             {name}
           </button>

         ))}

       </aside>

       <section className="excel-grid">

         <div className="excel-grid-scroll">

           <table>

             <thead>

               <tr>

                 <th>#</th>

                 {headers.map((header,index)=>(

                   <th
                     key={index}
                     onClick={()=>{

                       if(sortColumn===index){

                         setSortDirection(
                           d=>d==="asc"
                             ?"desc"
                             :"asc"
                         );

                       }else{

                         setSortColumn(index);
                         setSortDirection("asc");

                       }

                     }}
                   >

                     {String(
                       header||
                       `Column ${index+1}`
                     )}

                     {" "}

                     {sortColumn===index
                       ?sortDirection==="asc"
                         ?"↑"
                         :"↓"
                       :"↕"}

                   </th>

                 ))}

               </tr>

             </thead>

             <tbody>

               {visible.map(({row,index})=>(

                 <tr key={index}>

                   <td className="row-number">
                     {index+1}
                   </td>

                   {headers.map((_,column)=>(

                     <td
                       key={column}
                       contentEditable
                       suppressContentEditableWarning
                       onBlur={e=>
                         editCell(
                           index,
                           column,
                           e.currentTarget.textContent
                         )
                       }
                     >
                       {String(row[column]??"")}
                     </td>

                   ))}

                 </tr>

               ))}

             </tbody>

           </table>

         </div>

       </section>

     </div>

   </div>
 );
}


