import { cp, mkdir, readdir, rm, copyFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const root=process.cwd();
const out=join(root,"dist","public");
await rm(join(root,"dist"),{recursive:true,force:true});
await mkdir(out,{recursive:true});

const allowed=new Set([".html",".js",".json"]);
const skip=new Set(["package.json"]);
for(const entry of await readdir(root,{withFileTypes:true})){
  if(!entry.isFile())continue;
  if(skip.has(entry.name))continue;
  if(!allowed.has(extname(entry.name)))continue;
  if(entry.name.startsWith("wrangler."))continue;
  await copyFile(join(root,entry.name),join(out,entry.name));
}

await cp(join(root,"shared"),join(out,"shared"),{recursive:true});

const runtime=`// Generated for the Cloudflare same-origin deployment.
window.RETRONOMAD_CONFIG = Object.freeze({
  accountSyncEnabled: true,
  apiBase: ""
});
`;
await writeFile(join(out,"runtime-config.js"),runtime,"utf8");

console.log("Built Cloudflare static assets in dist/public");
