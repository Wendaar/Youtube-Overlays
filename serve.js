import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.woff2':'font/woff2'};
export const server=createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');const name=url.pathname==='/'?'index.html':url.pathname.slice(1);
  if(!['index.html','app.js','styles.css','hms-source.js','fonts/barlow-latin.woff2','fonts/barlow-latin-ext.woff2'].includes(name)&&!/^[-\w .]+\.png$/.test(name)){res.writeHead(404);res.end();return;}
  try{res.setHeader('content-type',types[name.slice(name.lastIndexOf('.'))]??'application/octet-stream');res.end(await readFile(new URL(name,import.meta.url)));}catch{res.writeHead(404);res.end();}
});
if(process.argv[1]?.replaceAll('\\','/').endsWith('/serve.js'))server.listen(Number(process.env.PORT??3100),'127.0.0.1',()=>console.log('Opening Studio: http://127.0.0.1:'+ (process.env.PORT??3100)));
