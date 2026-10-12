const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
let hooks=[],cursor=0,grant=true,user={id:'reviewer'},changed,pending=null;
const purchases=new Proxy({},{get(){throw Error('SDK no habilitado: no debe consultarse')}});
const react={createContext:()=>({Provider:'Provider'}),useState:v=>{let i=cursor++;if(!(i in hooks))hooks[i]=v;return[hooks[i],n=>hooks[i]=n]},useRef:v=>{let i=cursor++;if(!(i in hooks))hooks[i]={current:v};return hooks[i]},useEffect:f=>{let i=cursor++;if(!(i in hooks)){hooks[i]=true;f()}},useContext(){}};
const out={};
const {estado,helper}=require('./founder-fixture.cjs');
const founder=helper(async name=>{assert.equal(name,'estado_founder_trial');return pending?new Promise(r=>pending=r):{data:estado({eligible:false,access_source:grant?'PLAY_REVIEW':'FREE'}),error:null};});
const deps = {
 react,
 'react/jsx-runtime': {jsx: (_, p) => p},
 'react-native': {AppState: {addEventListener: () => ({remove(){}})}, Linking: {}},
 'react-native-purchases': {__esModule:true, default:purchases},
 'react-native-purchases-ui': {__esModule:true, default:{}, PAYWALL_RESULT:{}},
 './sesion': {asegurarSesion:async()=>user},
 './plus': {PLUS_DISPONIBLE:false, tieneEntitlementPlus:()=>false},
 './plusDemo': {PLUS_DEMO:false},
 './founderPlus': founder,
 './plusServidor': {},
 './supabase': {supabase: {
   rpc:async name=>{assert.equal(name,'mi_acceso_revision_play');return pending ? new Promise(r=>pending=r) : {data:grant,error:null};},
   auth:{onAuthStateChange:f=>{changed=f;return {data:{subscription:{unsubscribe(){}}}};}}
 }}
};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/PlusContext.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:out,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},require:n=>deps[n]});

function render(){cursor=0;return out.PlusProvider({children:null}).value}
(async()=>{
 assert.equal(render().activo,false);await render().refrescar();assert.equal(render().activo,true);assert.equal(render().disponible,false);assert.equal(render().gestionable,false);
 grant=false;await render().refrescar();assert.equal(render().activo,false,'Revocación no conserva acceso local');
 grant=true;await render().refrescar();assert.equal(render().activo,true);
 pending=true;const loading=render().refrescar();await new Promise(r=>setImmediate(r));
 user={id:'otro'};changed('SIGNED_IN',{user});assert.equal(render().activo,false,'Cambio de UUID limpia el grant inmediatamente');
 const finish=pending;pending=null;finish({data:estado({access_source:'PLAY_REVIEW'}),error:null});await loading;assert.equal(render().activo,false,'Respuesta de identidad vieja no desbloquea la nueva');
 grant=false;await render().refrescar();assert.equal(render().activo,false);await assert.rejects(render().comprar(),/PLUS_NO_CONFIGURADO/);
 console.log('Play Review: permiso de servidor, revocación, cambio de UUID, carrera asíncrona y SDK apagado OK');
})().catch(e=>{console.error(e);process.exitCode=1});
