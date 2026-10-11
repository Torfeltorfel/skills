import fs from 'fs'; import path from 'path';
const W=process.argv[2];
const F=['id','source','rule','status','tool','toolRuleId','gap','notes'];
for (const [e,skill] of [['eval-1','vercel-react-best-practices'],['eval-2','vercel-react-best-practices'],['eval-3','composition-patterns']]) for (const v of ['with_skill','without_skill']) {
  const repo=`${W}/${e}/${v}/outputs/repo`;
  const mf=`${repo}/mappings/${skill}.json`;
  if(!fs.existsSync(mf)){console.log(e,v,'NO MAPPING');continue;}
  const m=JSON.parse(fs.readFileSync(mf)); const arr=Array.isArray(m)?m:(m.rules||[]);
  const missing=arr.filter(r=>F.some(k=>!(k in r))).length;
  const cnt={}; arr.forEach(r=>cnt[r.status]=(cnt[r.status]||0)+1);
  const covered=arr.filter(r=>r.status==='covered').map(r=>r.id);
  const rulesDir=`${repo}/skills/${skill}/rules`;
  let leaked=[],kept=0,expected=0;
  if(fs.existsSync(rulesDir)){const files=new Set(fs.readdirSync(rulesDir).map(f=>f.replace(/\.md$/,'')));
    leaked=covered.filter(c=>files.has(c));
    const nonc=arr.filter(r=>r.status!=='covered'&&files.has(r.id)).length; kept=nonc;}
  console.log(e,v,{n:arr.length,missingFields:missing,cnt,coveredStillInFork:leaked,nonCoveredRuleFilesPresent:kept});
}
