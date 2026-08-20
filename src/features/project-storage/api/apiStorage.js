import{projectDB}from"./projectDB";

export const apiStorage={
 listProjects:async()=>projectDB.list(),
 getProject:async id=>projectDB.get(id),
 createProject:async input=>projectDB.create(input),
 saveProject:async project=>projectDB.save(project),
 updateProject:async(id,patch)=>projectDB.update(id,patch),
 deleteProject:async id=>projectDB.remove(id),
 exportProjects:async()=>projectDB.export(),
 importProjects:async data=>projectDB.import(data)
};
