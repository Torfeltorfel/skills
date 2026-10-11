import fs from 'node:fs'; import path from 'node:path';
import { Linter } from 'eslint'; import tseslint from 'typescript-eslint';
import os from 'node:os';
// Behaviour check of every lint rule used by lint/vercel-react-best-practices.config.mjs.
// Run from lint/: npm install && npm run verify:vercel-react-best-practices
// Each case = rule + snippets that must fire (bad), must stay clean (good) and gaps that must NOT fire (documented partial coverage).
const probe=fs.mkdtempSync(path.join(os.tmpdir(),'lintprobe-'));
fs.writeFileSync(path.join(probe,'tsconfig.json'),JSON.stringify({compilerOptions:{strict:true,jsx:'preserve',target:'ES2023',module:'ESNext',moduleResolution:'Bundler',lib:['ES2023','DOM'],skipLibCheck:true,noEmit:true},include:['*.tsx']}));
fs.mkdirSync(path.join(probe,'barrel'));
for(const x of ['a','b','c','d']) fs.writeFileSync(path.join(probe,'barrel',x+'.ts'),'export const '+x+' = 1;\n');
fs.writeFileSync(path.join(probe,'barrel','index.ts'),"export { a } from './a';\nexport { b } from './b';\nexport { c } from './c';\nexport { d } from './d';\n");
fs.writeFileSync(path.join(probe,'barrel-consumer.tsx'),"import { a } from './barrel';\nexport const z = a;\n");
const pl={};
const load=async(k,p)=>{pl[k]=(await import(p)).default};
await load('react-hooks','eslint-plugin-react-hooks');await load('react','eslint-plugin-react');await load('@next/next','@next/eslint-plugin-next');
await load('unicorn','eslint-plugin-unicorn');await load('barrel-files','eslint-plugin-barrel-files');await load('react-perf','eslint-plugin-react-perf');
await load('react-you-might-not-need-an-effect','eslint-plugin-react-you-might-not-need-an-effect');await load('@eslint-react','@eslint-react/eslint-plugin');await load('@typescript-eslint','@typescript-eslint/eslint-plugin');
const linter=new Linter({configType:'flat',cwd:probe});
const T=(rule,opt)=>({[rule]:opt===undefined?'error':['error',...(Array.isArray(opt)?opt:[opt])]});
function lint(code,rules,file='v.tsx'){const f=path.join(probe,file);fs.writeFileSync(f,code);
 const m=linter.verify(code,[{files:['**/*.tsx'],plugins:pl,languageOptions:{parser:tseslint.parser,parserOptions:{project:path.join(probe,'tsconfig.json'),tsconfigRootDir:probe,ecmaFeatures:{jsx:true}}},settings:{react:{version:'19.2'}},rules}],{filename:f});
 return m;}
const cases=[];
const add=(id,rule,opt,bad,good,note='')=>cases.push({id,rule,opt,bad,good,note});
// advanced-effect-event-deps
add('advanced-effect-event-deps','react-hooks/exhaustive-deps',undefined,
 [`import { useEffect, useEffectEvent } from 'react'
function ChatRoom({ roomId, onConnected }: { roomId: string; onConnected: () => void }) {
  const handleConnected = useEffectEvent(onConnected)
  useEffect(() => { const c = createConnection(roomId); c.on('connected', handleConnected); c.connect(); return () => c.disconnect() }, [roomId, handleConnected])
}
declare function createConnection(r:string):any`],
 [`import { useEffect, useEffectEvent } from 'react'
function ChatRoom({ roomId, onConnected }: { roomId: string; onConnected: () => void }) {
  const handleConnected = useEffectEvent(onConnected)
  useEffect(() => { const c = createConnection(roomId); c.on('connected', handleConnected); c.connect(); return () => c.disconnect() }, [roomId])
}
declare function createConnection(r:string):any`]);
// passive
add('client-passive-event-listeners','unicorn/require-passive-events',undefined,
 [`document.addEventListener('touchstart', handleTouch)`,`document.addEventListener('wheel', (e) => console.log(e.deltaY))`,`window.addEventListener('touchmove', onMove, { capture: true })`],
 [`document.addEventListener('touchstart', handleTouch, { passive: true })`,`document.addEventListener('wheel', (e) => { e.preventDefault() })`,`document.addEventListener('click', h)`]);
// tosorted
add('js-tosorted-immutable','unicorn/no-array-sort',undefined,
 [`function f(users: User[]) { return users.sort((a, b) => a.name.localeCompare(b.name)) } interface User{name:string}`,`const s = items.sort()`],
 [`function f(users: User[]) { return users.toSorted((a, b) => a.name.localeCompare(b.name)) } interface User{name:string}`]);
add('js-tosorted-immutable','unicorn/no-array-reverse',undefined,[`const r = items.reverse()`],[`const r = items.toReversed()`],'bonus: sibling immutable method');
add('js-min-max-loop','unicorn/no-array-sort-for-min-max',undefined,
 [`function g(projects: P[]) { const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt); return sorted[0] } interface P{updatedAt:number}`,
  `function g(projects: P[]) { const sorted = [...projects].sort((a, b) => a.updatedAt - b.updatedAt); return { oldest: sorted[0], newest: sorted[sorted.length - 1] } } interface P{updatedAt:number}`,
  `const newest = items.toSorted((a,b)=>b-a)[0]`,`const last = [...items].sort((a,b)=>a-b).at(-1)`],
 [`function g(projects: P[]) { let latest = projects[0]; for (let i = 1; i < projects.length; i++) { if (projects[i].updatedAt > latest.updatedAt) latest = projects[i] } return latest } interface P{updatedAt:number}`,`const top3 = items.toSorted((a,b)=>b-a).slice(0,3)`]);
// conditional render
const tcr=['@eslint-react/no-leaked-conditional-rendering'];
add('rendering-conditional-render','@eslint-react/no-leaked-conditional-rendering',undefined,
 [`function A({ count }: { count: number }) { return <div>{count && <Badge count={count} />}</div> } declare function Badge(p:{count:number}):any`,
  `function A({ name }: { name: string }) { return <div>{name && <b>{name}</b>}</div> }`],
 [`function A({ count }: { count: number }) { return <div>{count > 0 ? <Badge count={count} /> : null}</div> } declare function Badge(p:{count:number}):any`,
  `function A({ open }: { open: boolean }) { return <div>{open && <b>x</b>}</div> }`],'type-aware: needs typed parser');
// sync scripts
add('rendering-script-defer-async','@next/next/no-sync-scripts',undefined,
 [`export const a = <script src="https://example.com/foo.js" />`],[`export const a = <script src="https://example.com/foo.js" defer />`,`export const b = <script src="https://example.com/foo.js" async />`]);
// derived state
add('rerender-derived-state-no-effect','react-you-might-not-need-an-effect/no-derived-state',undefined,
 [`import {useState,useEffect} from 'react'
function Form() { const [firstName, setFirstName] = useState('First'); const [lastName, setLastName] = useState('Last'); const [fullName, setFullName] = useState('')
 useEffect(() => { setFullName(firstName + ' ' + lastName) }, [firstName, lastName]); return <p>{fullName}</p> }`],
 [`import {useState} from 'react'
function Form() { const [firstName, setFirstName] = useState('First'); const [lastName, setLastName] = useState('Last'); const fullName = firstName + ' ' + lastName; return <p>{fullName}</p> }`]);
add('rerender-derived-state-no-effect','react-you-might-not-need-an-effect/no-adjust-state-on-prop-change',undefined,
 [`import {useState,useEffect} from 'react'
function List({ items }: { items: string[] }) { const [selection, setSelection] = useState<string|null>(null); useEffect(() => { setSelection(null) }, [items]); return <p>{selection}</p> }`],
 [`import {useState} from 'react'
function List({ items }: { items: string[] }) { const [selection, setSelection] = useState<string|null>(null); return <p>{selection}</p> }`]);
// move effect to event
add('rerender-move-effect-to-event','react-you-might-not-need-an-effect/no-event-handler',undefined,
 [`import {useState,useEffect,useContext} from 'react'
function Form() { const [submitted, setSubmitted] = useState(false); const theme = useContext(ThemeContext)
 useEffect(() => { if (submitted) { post('/api/register'); showToast('Registered', theme) } }, [submitted, theme]); return <button onClick={() => setSubmitted(true)}>Submit</button> }
declare const ThemeContext: any; declare function post(s:string):void; declare function showToast(a:string,b:any):void`],
 [`import {useContext} from 'react'
function Form() { const theme = useContext(ThemeContext); function handleSubmit() { post('/api/register'); showToast('Registered', theme) } return <button onClick={handleSubmit}>Submit</button> }
declare const ThemeContext: any; declare function post(s:string):void; declare function showToast(a:string,b:any):void`]);
// inline components
add('rerender-no-inline-components','react/no-unstable-nested-components',undefined,
 [`function UserProfile({ user }: { user: any }) { const Avatar = () => <img src={user.avatarUrl} />; const Stats = () => <div>{user.posts}</div>; return <div><Avatar /><Stats /></div> }`],
 [`function Avatar({ src }: { src: string }) { return <img src={src} /> }
function UserProfile({ user }: { user: any }) { return <div><Avatar src={user.avatarUrl} /></div> }`]);
add('rerender-no-inline-components','react-hooks/static-components',undefined,
 [`function UserProfile({ user }: { user: any }) { const Avatar = () => <img src={user.avatarUrl} />; return <div><Avatar /></div> }`],
 [`function Avatar({ src }: { src: string }) { return <img src={src} /> }
function UserProfile({ user }: { user: any }) { return <div><Avatar src={user.avatarUrl} /></div> }`],'second tool, corroboration');
// lazy init
add('rerender-lazy-state-init','@eslint-react/use-state',undefined,
 [`import {useState} from 'react'
function F({ items }: { items: string[] }) { const [idx, setIdx] = useState(buildSearchIndex(items)); return null } declare function buildSearchIndex(i:string[]):any`,
  `import {useState} from 'react'
function U() { const [settings, setSettings] = useState(JSON.parse(localStorage.getItem('settings') || '{}')); return null }`],
 [`import {useState} from 'react'
function F({ items }: { items: string[] }) { const [idx, setIdx] = useState(() => buildSearchIndex(items)); const [q, setQ] = useState(''); const [n, setN] = useState(0); const [o, setO] = useState({}); const [p, setP] = useState(items); return null } declare function buildSearchIndex(i:string[]):any`]);
// default value
add('rerender-memo-with-default-value','react/no-object-type-as-default-prop',undefined,
 [`import {memo} from 'react'
const UserAvatar = memo(function UserAvatar({ onClick = () => {} }: { onClick?: () => void }) { return <button onClick={onClick} /> })`,
  `import {memo} from 'react'
const L = memo(function L({ items = [] }: { items?: string[] }) { return <ul>{items.length}</ul> })`,
  `import {memo} from 'react'
const L = memo(({ opts = {} }: { opts?: object }) => <ul>{Object.keys(opts).length}</ul>)`],
 [`import {memo} from 'react'
const NOOP = () => {}
const UserAvatar = memo(function UserAvatar({ onClick = NOOP }: { onClick?: () => void }) { return <button onClick={onClick} /> })`]);
add('rerender-memo-with-default-value','@eslint-react/no-unstable-default-props',undefined,
 [`import {memo} from 'react'
const UserAvatar = memo(function UserAvatar({ onClick = () => {} }: { onClick?: () => void }) { return <button onClick={onClick} /> })`,
  `import {memo} from 'react'
const L = memo(function L({ items = [] }: { items?: string[] }) { return <ul>{items.length}</ul> })`],
 [`import {memo} from 'react'
const NOOP = () => {}
const UserAvatar = memo(function UserAvatar({ onClick = NOOP }: { onClick?: () => void }) { return <button onClick={onClick} /> })`],'second tool, corroboration');
// set has
add('js-set-map-lookups','unicorn/prefer-set-has',undefined,
 [`const allowedIds = ['a', 'b', 'c']; export const r = items.filter(item => allowedIds.includes(item.id))`],
 [`const allowedIds = new Set(['a', 'b', 'c']); export const r = items.filter(item => allowedIds.has(item.id))`],
 'only catches local array bindings used solely for includes()');
// functional setState partial
add('rerender-functional-setstate','react-hooks/exhaustive-deps',undefined,
 [`import {useCallback,useState} from 'react'
function C() { const [items, setItems] = useState<string[]>([]); const add = useCallback((x: string) => { setItems([...items, x]) }, []); return <button onClick={() => add('a')} /> }`],
 [`import {useCallback,useState} from 'react'
function C() { const [items, setItems] = useState<string[]>([]); const add = useCallback((x: string) => { setItems(cur => [...cur, x]) }, []); return <button onClick={() => add('a')} /> }`],'stale-closure variant only');
// GAP demonstration: first (items in deps) not flagged
add('rerender-functional-setstate#gap','react-hooks/exhaustive-deps',undefined,
 [`import {useCallback,useState} from 'react'
function C() { const [items, setItems] = useState<string[]>([]); const add = useCallback((x: string) => { setItems([...items, x]) }, [items]); return <button onClick={() => add('a')} /> }`],[],'EXPECTED TO NOT FIRE (documents the gap)');
// globals partial
add('server-no-shared-module-state','react-hooks/globals',undefined,
 [`let currentUser: User | null = null
export default async function Page() { currentUser = await auth(); return <Dashboard /> }
async function Dashboard() { return <div>{currentUser?.name}</div> }
interface User{name:string}; declare function auth():Promise<User>`],
 [`export default async function Page() { const user = await auth(); return <Dashboard user={user} /> }
function Dashboard({ user }: { user: User | null }) { return <div>{user?.name}</div> }
interface User{name:string}; declare function auth():Promise<User>`],'only writes inside components/hooks; setter helpers outside not caught');
// barrel
add('bundle-barrel-imports','barrel-files/avoid-importing-barrel-files',undefined,[],[],'run on disk file; see below');
// custom selectors
const NRS=(sel,msg='x')=>[{selector:sel,message:msg}];
add('async-cheap-condition-before-await#custom','no-restricted-syntax',NRS(`LogicalExpression[operator='&&'] > AwaitExpression.left`),
 [`async function f(){ if ((await getFlag()) && someCondition) {} }`],[`async function f(){ if (someCondition) { if (await getFlag()) {} } }`],'custom selector; also fires when cond is expensive');
add('bundle-analyzable-paths#custom','no-restricted-syntax',NRS(`ImportExpression:not([source.type='Literal']):not([source.type='TemplateLiteral'][source.expressions.length=0])`),
 [`const Page = await import(PAGE_MODULES[pageName])`,"const P = await import(`./pages/${name}`)"],[`const Page = await import('./pages/home')`]);
add('js-flatmap-filter#custom','no-restricted-syntax',NRS(`CallExpression[callee.property.name='filter'] > MemberExpression.callee > CallExpression[callee.property.name='map']`),
 [`const names = users.map(u => u.isActive ? u.name : null).filter(Boolean)`],[`const names = users.flatMap(u => u.isActive ? [u.name] : [])`,`const n = users.filter(u=>u.ok).map(u=>u.name)`]);
add('js-hoist-regexp#custom','no-restricted-syntax',NRS(`:function NewExpression[callee.name='RegExp']`),
 ["function H(q: string){ const r = new RegExp(`(${q})`, 'gi'); return r }"],[`const R = /foo/g; function H(){ return R }`]);
add('client-localstorage-schema#custom','no-restricted-syntax',NRS(`CallExpression[callee.object.name=/^(localStorage|sessionStorage)$/]:not(TryStatement > BlockStatement.block CallExpression):not(TryStatement > BlockStatement.block *  CallExpression)`),
 [`const data = localStorage.getItem('userConfig')`],[`function load(){ try { return localStorage.getItem('k:v2') } catch { return null } }`]);
const ov={};
const O=(id,rule,o)=>ov[id+'|'+rule]=o;
const find=(id)=>cases.find(c=>c.id===id);
O('client-passive-event-listeners','unicorn/require-passive-events',{bad:[`document.addEventListener('wheel', (e) => console.log(e.deltaY))`,`document.addEventListener('touchstart', (e) => console.log(e.touches[0]))`],good:[`document.addEventListener('touchstart', (e) => console.log(e.touches[0]), { passive: true })`,`document.addEventListener('wheel', (e) => { e.preventDefault() })`,`document.addEventListener('click', h)`],gap:[`useEffect(() => { const handleWheel = (e: WheelEvent) => console.log(e.deltaY); document.addEventListener('wheel', handleWheel); return () => document.removeEventListener('wheel', handleWheel) }, [])`,`document.addEventListener('touchstart', handleTouch)`]});
O('js-min-max-loop','unicorn/no-array-sort-for-min-max',{bad:[`const newest = items.toSorted((a,b)=>b-a)[0]`,`const last = [...items].sort((a,b)=>a-b).at(-1)`],good:[`const top3 = items.toSorted((a,b)=>b-a).slice(0,3)`,`let latest = items[0]; for (let i = 1; i < items.length; i++) { if (items[i] > latest) latest = items[i] }`],gap:[`function g(projects: P[]) { const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt); return sorted[0] } interface P{updatedAt:number}`]});
O('rendering-conditional-render','@eslint-react/no-leaked-conditional-rendering',{bad:[find('rendering-conditional-render').bad[0]],good:find('rendering-conditional-render').good,gap:[]});
O('rerender-lazy-state-init','@eslint-react/use-state',{bad:[`import {useState} from 'react'\nfunction F({ items }: { items: string[] }) { const [idx] = useState(buildSearchIndex(items)); return null } declare function buildSearchIndex(i:string[]):any`,`import {useState} from 'react'\nfunction F({ items }: { items: string[] }) { const [m] = useState(new Map(items.map(i=>[i,1]))); return null }`],good:find('rerender-lazy-state-init').good,gap:[`import {useState} from 'react'\nfunction U() { const [settings] = useState(JSON.parse(localStorage.getItem('settings') || '{}')); return null }`,`import {useState} from 'react'\nfunction U({items}:{items:string[]}) { const [s] = useState(items.map(i=>i.trim())); return null }`]});
O('rerender-memo-with-default-value','react/no-object-type-as-default-prop',{bad:[],good:[],gap:[find('rerender-memo-with-default-value').bad[0]],note:'does NOT detect memo(function ...) wrapped components; not used'});
O('rerender-functional-setstate#gap','react-hooks/exhaustive-deps',{bad:[],good:[],gap:find('rerender-functional-setstate#gap').bad});
O('js-set-map-lookups','unicorn/prefer-set-has',{bad:find('js-set-map-lookups').bad,good:find('js-set-map-lookups').good,gap:[`function f(allowed: string[]) { return items.filter(i => allowed.includes(i.id)) }`,`const ids = ['a','b']; export const x = ids.includes(q); export const y = ids.map(f)`]});
add('rerender-simple-expression-in-memo#custom','no-restricted-syntax',NRS(`CallExpression[callee.name='useMemo'][arguments.0.type='ArrowFunctionExpression'][arguments.0.body.type=/^(BinaryExpression|LogicalExpression|UnaryExpression)$/]`),
 [`const isLoading = useMemo(() => user.isLoading || notifications.isLoading, [user.isLoading, notifications.isLoading])`],[`const rows = useMemo(() => items.filter(f), [items])`]);
const out=[];

for(const c0 of cases){
  if(c0.rule==='barrel-files/avoid-importing-barrel-files') continue;
  const o=ov[c0.id+'|'+c0.rule]; const c=o?{...c0,...o}:c0; c.gap=c.gap||[];
  const rules=T(c.rule,c.opt); const res={id:c.id,rule:c.rule,note:c.note,bad:[],good:[]};
  for(const b of c.bad){const m=lint(b,rules).filter(x=>x.ruleId===c.rule||x.fatal);res.bad.push({fired:m.length>0&&!m[0].fatal,fatal:m[0]?.fatal?m[0].message:undefined,msg:m[0]?.message?.slice(0,100)});}
  for(const g of c.good){const m=lint(g,rules).filter(x=>x.ruleId===c.rule||x.fatal);res.good.push({fired:m.length>0&&!m[0].fatal,fatal:m[0]?.fatal?m[0].message:undefined,msg:m[0]?.message?.slice(0,100)});}
  res.gap=[];for(const g of c.gap){const m=lint(g,rules).filter(x=>x.ruleId===c.rule||x.fatal);res.gap.push({fired:m.length>0&&!m[0].fatal});}
  res.pass=res.bad.every(x=>x.fired)&&res.good.every(x=>!x.fired)&&res.gap.every(x=>!x.fired);
  out.push(res);
}
// barrel on disk
{
 const rule='barrel-files/avoid-importing-barrel-files';
 const code=fs.readFileSync(path.join(probe,'barrel-consumer.tsx'),'utf8');
 const f=path.join(probe,'barrel-consumer.tsx');
 const m=linter.verify(code,[{files:['**/*.tsx'],plugins:pl,languageOptions:{parser:tseslint.parser},rules:T(rule,{maxModuleGraphSizeAllowed:2})}],{filename:f}).filter(x=>x.ruleId===rule);
 const direct=`import { a } from './barrel/a';\nexport const z = a;`; fs.writeFileSync(path.join(probe,'barrel-direct.tsx'),direct);
 const m2=linter.verify(direct,[{files:['**/*.tsx'],plugins:pl,languageOptions:{parser:tseslint.parser},rules:T(rule,{maxModuleGraphSizeAllowed:2})}],{filename:path.join(probe,'barrel-direct.tsx')}).filter(x=>x.ruleId===rule);
 out.push({id:'bundle-barrel-imports',rule,note:'local barrel on disk (4 re-exports), maxModuleGraphSizeAllowed:2',bad:[{fired:m.length>0,msg:m[0]?.message}],good:[{fired:m2.length>0}],pass:m.length>0&&m2.length===0});
}
for(const r of out) console.log(r.pass?'PASS':'FAIL',r.id,r.rule,JSON.stringify(r.bad.map(x=>x.fired)),JSON.stringify(r.good.map(x=>x.fired)),'gap-should-be-false',JSON.stringify((r.gap||[]).map(x=>x.fired)),r.bad.some(x=>x.fatal)?'FATAL:'+r.bad.find(x=>x.fatal).fatal:'');
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname),'last-result.json'),JSON.stringify(out,null,1));
const failed=out.filter(r=>!r.pass);
{ // real-world barrel check on a published package (resolved from lint/node_modules)
  const here=path.dirname(new URL(import.meta.url).pathname);
  const code="import { Check, X, Menu } from 'lucide-react'";const f=path.join(here,'__lucide-probe.tsx');fs.writeFileSync(f,code);
  try{
    const l2=new Linter({configType:'flat',cwd:here});
    const m=l2.verify(code,[{files:['**/*.tsx'],plugins:pl,languageOptions:{parser:tseslint.parser},rules:T('barrel-files/avoid-importing-barrel-files')}],{filename:f});
    console.log(m.length?'PASS':'FAIL','bundle-barrel-imports lucide-react barrel flagged');
    if(!m.length) failed.push({id:'lucide'});
  } finally { fs.unlinkSync(f); }
}
fs.rmSync(probe,{recursive:true,force:true});
console.log(failed.length?failed.length+' FAILED':'all cases passed');
process.exitCode=failed.length?1:0;
