const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {estado,helper}=require('./founder-fixture.cjs');
let clock=1000,remote=estado(),offline=false,starts=0,serverCalls=0,user={id:'guest',is_anonymous:true},changed,appChanged,pending;
const founder=helper(async name=>{
 serverCalls++;if(offline)return {error:Error('offline')};
 if(name==='estado_lanzamiento_plus')return {data:{real_payments_enabled:false}};
 if(name==='iniciar_prueba_founder'){
  starts++;if(pending)return new Promise(resolve=>pending=resolve);
  const now=new Date();remote=estado({server_now:now.toISOString(),started_at:now.toISOString(),expires_at:new Date(+now+72*3600000).toISOString(),eligible:false,used:true,active:true,access_source:'FOUNDER_TRIAL'});
 }
 return {data:remote};
},{now:()=>clock});
const raw=estado({used:true,active:true,eligible:false,access_source:'FOUNDER_TRIAL',started_at:'2026-10-12T00:00:00Z',expires_at:'2026-10-15T00:00:00Z',server_now:'2026-10-14T23:59:30Z'});
const cached=founder.cacheFounder(raw,'guest',1000);
assert.equal(founder.estadoFounderVigente(cached,'guest',30999).active,true);
assert.equal(founder.estadoFounderVigente(cached,'guest',31000).active,false);
assert.equal(founder.estadoFounderVigente(cached,'other',1000),null);
assert.equal(founder.estadoFounderVigente(cached,'guest',121000),null);
assert.equal(founder.estadoFounderVigente(cached,'guest',999),null);
const oldNow=Date.now;Date.now=()=>0;assert.equal(founder.estadoFounderVigente(cached,'guest',31000).active,false);Date.now=oldNow;
assert.throws(()=>founder.validarEstadoFounder({...raw,expires_at:'2026-10-16T00:00:00Z'}),/PLUS_LANZAMIENTO/);
let hooks=[],cursor=0,commercialCalls=0;
const forbidden=()=>{commercialCalls++;throw Error('Phase 1 must not invoke billing SDK')};
const react={createContext:()=>({Provider:'Provider'}),useContext(){},useState:v=>{const i=cursor++;if(!(i in hooks))hooks[i]=v;return [hooks[i],n=>hooks[i]=typeof n==='function'?n(hooks[i]):n]},useRef:v=>{const i=cursor++;if(!(i in hooks))hooks[i]={current:v};return hooks[i]},useEffect:f=>{const i=cursor++;if(!(i in hooks)){hooks[i]=true;f()}}};
const out={},deps={react,'react/jsx-runtime':{jsx:(_,p)=>p},'react-native':{AppState:{currentState:'active',addEventListener:(_,f)=>{appChanged=f;return {remove(){}}}},Linking:{openURL:forbidden}},
 'react-native-purchases':{__esModule:true,default:new Proxy({},{get:()=>forbidden})},'react-native-purchases-ui':{__esModule:true,default:{presentPaywallIfNeeded:forbidden},PAYWALL_RESULT:{}},
 './plus':{PLUS_DISPONIBLE:true,tieneEntitlementPlus:()=>false,prepararCompras:forbidden,prepararIdentidadCompra:forbidden},'./plusDemo':{PLUS_DEMO:false},'./plusServidor':{sincronizarPlusServidor:forbidden},'./founderPlus':founder,
 './sesion':{asegurarSesion:async()=>user},'./supabase':{supabase:{auth:{onAuthStateChange:f=>{changed=f;return {data:{subscription:{unsubscribe(){}}}};}}}}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/PlusContext.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:out,require:n=>deps[n],setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){}});
const render=()=>{cursor=0;return out.PlusProvider({children:null}).value};
(async()=>{
 await render().refrescar();assert.equal(render().activo,false);assert.equal(render().trialDisponible,true);assert.equal(starts,0,'Opening state never starts trial');
 await render().registrarVista();assert.equal(starts,0);
 await assert.rejects(render().comprar(),/PLUS_PAGOS_NO_DISPONIBLES/);await assert.rejects(render().restaurar(),/PLUS_PAGOS_NO_DISPONIBLES/);await assert.rejects(render().gestionar(),/PLUS_SIN_GESTION/);assert.equal(commercialCalls,0,'Even build readiness true cannot bypass remote OFF');
 offline=true;await assert.rejects(render().iniciarPrueba(),/PLUS_PRUEBA_CONEXION/);assert.equal(starts,0);offline=false;
 await render().iniciarPrueba();assert.equal(render().activo,true);assert.equal(render().tipoAcceso,'FOUNDER_TRIAL');assert.equal(render().disponible,false);
 offline=true;clock+=60000;await render().refrescar();assert.equal(render().activo,true,'Brief checked trial cache');clock+=60000;assert.equal(render().activo,false,'Offline cache cannot survive 2 minutes');offline=false;
 remote={...remote,server_now:remote.expires_at,active:false,expired:true,access_source:'FREE'};await render().refrescar();assert.equal(render().activo,false);assert.equal(render().trialDisponible,false);
 pending=true;const activating=render().iniciarPrueba();await new Promise(r=>setImmediate(r));await assert.rejects(render().iniciarPrueba(),/PLUS_OPERACION_EN_CURSO/);
 user={id:'new-guest',is_anonymous:true};changed('SIGNED_IN',{user});assert.equal(render().activo,false);const finish=pending;pending=null;finish({data:raw});await activating;assert.equal(render().activo,false,'Old UUID response rejected');
 remote=estado();await render().refrescar();assert.equal(render().identidad,'new-guest');assert.equal(render().trialDisponible,true);
 appChanged('background');assert.equal(render().lanzamientoDisponible,false,'Background discards cache to avoid suspended-clock extension');
 assert.equal(commercialCalls,0);assert.ok(serverCalls>0);
 console.log('Founder cliente: reloj del servidor, caché limitada, sin SDK/cobros, offline, doble activación y cambio de UUID OK');
})().catch(e=>{console.error(e);process.exitCode=1});
