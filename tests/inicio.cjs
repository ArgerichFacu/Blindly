const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const api={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/inicio.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:api});
const {crearInicio,leerInicio,CLAVE_INICIO,CLAVE_INICIO_ANTERIOR,necesitaAcceso}=api;
function store(){const data=new Map([['supabase-session','uuid-session'],['trial','trial-existing'],['preferences','keep']]);let reads=0,writes=0;return{data,failRead:false,failWrite:false,get reads(){return reads},get writes(){return writes},async getItem(k){reads++;if(this.failRead)throw Error('read');return data.get(k)??null},async setItem(k,v){writes++;if(this.failWrite)throw Error('write');data.set(k,v)}}}
const snapshot=i=>JSON.parse(JSON.stringify(i.getSnapshot().datos));
(async()=>{
 const db=store(),i=crearInicio(db);let notifications=0;const unsub=i.subscribe(()=>notifications++);
 const loading=i.cargar();assert.equal(i.cargar(),loading);await loading;
 assert.equal(db.reads,2);assert.equal(i.getSnapshot().datos.version,2);assert.equal(necesitaAcceso(snapshot(i),'guest',false),true);
 assert.equal(await i.elegir('invitado',''),false);await i.terminar();assert.equal(snapshot(i).fase,'bienvenida');
 await i.elegir('invitado','guest');assert.equal(necesitaAcceso(snapshot(i),'guest',false),false);assert.equal(snapshot(i).fase,'tutorial');
 await i.avanzar();await i.retroceder();assert.equal(snapshot(i).paso,0);
 for(let n=0;n<4;n++)await i.avanzar();assert.equal(snapshot(i).fase,'terminado');
 const reopen=crearInicio(db);await reopen.cargar();assert.equal(snapshot(reopen).fase,'terminado');assert.equal(necesitaAcceso(snapshot(reopen),'guest',false),false,'Guest choice survives restart');
 assert.equal(necesitaAcceso(snapshot(reopen),'new-guest-after-logout',false),true,'Logout creates a new identity and reopens Access');
 await reopen.elegir('invitado','new-guest-after-logout');assert.equal(snapshot(reopen).fase,'terminado','Logout never restarts tutorial');
 assert.equal(necesitaAcceso(snapshot(reopen),'new-guest-after-logout',false),false);
 for(const phase of ['tutorial','terminado']){
  const old=store();old.data.set(CLAVE_INICIO_ANTERIOR,JSON.stringify({version:1,eleccion:'invitado',fase:phase,paso:2}));
  const migrated=crearInicio(old);await migrated.cargar();assert.equal(snapshot(migrated).fase,phase);assert.equal(snapshot(migrated).paso,2);
  assert.equal(necesitaAcceso(snapshot(migrated),'old-guest',false),true,'v32 finished does not bypass v33 Access');
  assert.equal(necesitaAcceso(snapshot(migrated),'google-or-email-or-legacy',true),false,'Protected identities bypass Access');
  await migrated.elegir('invitado','old-guest');assert.equal(snapshot(migrated).fase,phase,'Choosing guest preserves old tutorial progress');
  const again=crearInicio(old);await again.cargar();assert.equal(necesitaAcceso(snapshot(again),'old-guest',false),false);
  assert.ok(old.data.has(CLAVE_INICIO_ANTERIOR),'Legacy key retained, no destructive migration');
  for(const k of ['supabase-session','trial','preferences'])assert.equal(old.data.get(k),db.data.get(k));
 }
 for(const invalid of [null,'{','null','[]','{"version":1}','{"version":2,"identidad":{}}'])assert.equal(leerInicio(invalid).eleccion,null);
 const bad=store();bad.failRead=true;const retry=crearInicio(bad);assert.equal(await retry.cargar(),false);assert.equal(bad.writes,0);
 bad.failRead=false;bad.failWrite=true;assert.equal(await retry.cargar(),false,'Migration requires successful persistence');assert.equal(retry.getSnapshot().datos,null);
 bad.failWrite=false;await retry.cargar();bad.failWrite=true;assert.equal(await retry.elegir('invitado','guest'),false);assert.equal(snapshot(retry).eleccion,null);assert.equal(retry.getSnapshot().ocupado,false);
 bad.failWrite=false;await retry.elegir('invitado','guest');assert.equal(retry.getSnapshot().error,false);
 let finish;const slow=store();await crearInicio(slow).cargar();slow.setItem=()=>new Promise(r=>finish=r);const concurrent=crearInicio(slow);await concurrent.cargar();
 const choice=concurrent.elegir('invitado','guest');await Promise.resolve();assert.equal(await concurrent.elegir('cuenta','protected'),false);assert.equal(snapshot(concurrent).eleccion,null);finish();await choice;assert.equal(snapshot(concurrent).identidad,'guest');
 unsub();const n=notifications;await i.avanzar();assert.equal(notifications,n);
 assert.equal(CLAVE_INICIO,'blindly.inicio.v2');assert.equal(CLAVE_INICIO_ANTERIOR,'blindly.inicio.v1');
 console.log('Inicio v33: fresh, migration v32, protected bypass, explicit guest/restart, logout UUID, tutorial preservation, storage failures and concurrent choice OK');
})().catch(e=>{console.error(e);process.exitCode=1});
// La decisión se verifica también en el layout real, no sólo en el helper.
const identity={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/identidad.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:identity});
let local={version:2,eleccion:null,identidad:null,fase:'terminado',paso:3},user={id:'old-guest',is_anonymous:true};
const jsx=(type,props)=>({type,props}),mocks={
 'react/jsx-runtime':{jsx,jsxs:jsx},'react-native':{View:'View',useWindowDimensions:()=>({fontScale:1})},
 '../../components/Controles':{Texto:'Texto'},'../../lib/useNombreVisible':{useNombreVisible:()=>({usuario:user})},
 '../../components/Superficie':{Acabado:'Acabado'},'../../lib/visual':{velo:()=>''},'expo-router':{Tabs:'Tabs'},
 'react-native-safe-area-context':{useSafeAreaInsets:()=>({bottom:0})},'../../components/Icono':{Icono:'Icono'},
 '../../components/Introduccion':{Introduccion:'Introduccion'},'../../lib/InicioContext':{useInicio:()=>({datos:local})},
 '../../lib/Preferencias':{usePreferencias:()=>({t:k=>k})},'../../lib/TemaContext':{useTema:()=>({tema:{}})},
 '../../lib/identidad':identity,'../../lib/inicio':api};
const layout={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/app/(principal)/_layout.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:layout,require:n=>{assert.ok(mocks[n],n);return mocks[n]}});
assert.equal(layout.default().props.acceso,true,'Old finished guest sees Access');
local={...local,eleccion:'invitado',identidad:user.id};assert.equal(layout.default().type,'Tabs','Explicit guest returns Home');
user={id:'after-logout',is_anonymous:true};assert.equal(layout.default().props.acceso,true,'Different UUID reopens Access');
for(const u of [
 {id:'google',is_anonymous:false,identities:[{user_id:'google',provider:'google'}]},
 {id:'email',is_anonymous:false,email:'user@example.com',email_confirmed_at:'verified'},
 {id:'legacy',is_anonymous:false,email:'legacy@recovery.blindly.invalid'}]){
 user=u;local={...local,fase:'bienvenida'};assert.equal(layout.default().type,'Tabs','Protected Google/email/legacy goes Home');
}
local=null;assert.equal(layout.default().type,'Tabs','Protected identity does not depend on tutorial storage');
console.log('Principal real: migrated guest Access, remembered guest Home, logout Access, protected Google/email/legacy Home OK');
