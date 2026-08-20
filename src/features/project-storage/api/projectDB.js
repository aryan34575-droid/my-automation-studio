const KEY="office-studio-db-v2";

function readDB(){
 try{
  const raw=localStorage.getItem(KEY);
  const db=raw?JSON.parse(raw):{version:2,projects:[]};
  if(!db||!Array.isArray(db.projects))return{version:2,projects:[]};
  return db;
 }catch{
  return{version:2,projects:[]};
 }
}

function writeDB(db){
 localStorage.setItem(KEY,JSON.stringify(db));
 return db;
}

function validProject(p){
 return !!(p&&typeof p==="object"&&typeof p.id==="string"&&p.id.trim()&&typeof p.name==="string"&&p.name.trim()&&p.data&&typeof p.data==="object");
}

export const projectDB={
 list(){return readDB().projects},

 get(id){
  if(!id) return null;
  return readDB().projects.find(p=>p.id===id)||null;
 },

 create(input){
  if(!input||typeof input.name!=="string"||!input.name.trim())throw new Error("Project name is required");
  const db=readDB();
  const now=new Date().toISOString();
  const p={
   id:crypto.randomUUID(),
   name:input.name.trim(),
   createdAt:now,
   updatedAt:now,
   data:input.data&&typeof input.data==="object"?input.data:{}
  };
  db.projects.unshift(p);
  writeDB(db);
  return p;
 },

 save(project){
  if(!validProject(project))throw new Error("Invalid project");
  const db=readDB();
  const now=new Date().toISOString();
  const item={...project,updatedAt:now};
  const i=db.projects.findIndex(p=>p.id===project.id);
  if(i<0)db.projects.unshift(item);
  else db.projects[i]=item;
  writeDB(db);
  return item;
 },

 update(id,patch){
  const current=this.get(id);
  if(!current)throw new Error("Project not found");
  return this.save({...current,...patch,id});
 },

 remove(id){
  const db=readDB();
  const before=db.projects.length;
  db.projects=db.projects.filter(p=>p.id!==id);
  writeDB(db);
  return before!==db.projects.length;
 },

 clear(){
  writeDB({version:2,projects:[]});
  return true;
 },

 export(){
  return JSON.stringify(readDB(),null,2);
 },

 import(payload){
  const db=typeof payload==="string"?JSON.parse(payload):payload;
  if(!db||!Array.isArray(db.projects))throw new Error("Invalid database file");
  const clean=db.projects.filter(validProject);
  writeDB({version:2,projects:clean});
  return clean;
 }
};
