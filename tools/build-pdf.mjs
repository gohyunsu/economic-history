import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'guide','main.tex');
const buildDir=path.join(root,'tmp','pdf-build');
const compiled=path.join(buildDir,'main.pdf');
const published=path.join(root,'docs','study-guide.pdf');

if(!fs.existsSync(source))throw new Error('Run npm run build before building the PDF.');
fs.mkdirSync(buildDir,{recursive:true});
for(const ext of ['.aux','.log','.out','.toc','.synctex.gz']){
  fs.rmSync(path.join(buildDir,`main${ext}`),{force:true});
}

for(let pass=1;pass<=2;pass++){
  try{
    execFileSync('xelatex',['-interaction=nonstopmode','-halt-on-error',`-output-directory=${buildDir}`,'guide/main.tex'],{
      cwd:root,
      encoding:'utf8',
      stdio:'pipe',
      maxBuffer:8*1024*1024,
    });
  }catch(error){
    process.stderr.write(error.stdout??'');
    process.stderr.write(error.stderr??'');
    throw new Error(`XeLaTeX pass ${pass} failed. The published PDF was not replaced.`);
  }
}

fs.copyFileSync(compiled,published);
console.log(`Updated ${path.relative(root,published)} from ${path.relative(root,source)}.`);
