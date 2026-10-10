const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
const compilar = file => ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const identidad = {};
vm.runInNewContext(compilar('src/lib/identidad.ts'),{exports:identidad});
const paquetes = ['$rc_monthly','$rc_annual','$rc_lifetime'].map(identifier=>({identifier,product:{price:1,priceString:'ARS 1,00'}}));
const oferta = {identifier:'default',availablePackages:paquetes};
let user = {id:'uuid-a',is_anonymous:true}, uuid = null, offerings = {current:oferta}, info = {entitlements:{active:{}},managementURL:null};
let pagos = 0, restores = 0, sincronizaciones = 0, presentada, resultado = 'CANCELLED', consultarOfertas = async()=>offerings;
const purchases = {
 isConfigured:async()=>uuid!==null, setLogLevel:async()=>{}, configure:o=>{uuid=o.appUserID;},
 getAppUserID:async()=>uuid, logIn:async id=>{uuid=id;}, getCustomerInfo:async()=>info,
 getOfferings:()=>consultarOfertas(), restorePurchases:async()=>{restores++;return info;},
 addCustomerInfoUpdateListener:()=>{},removeCustomerInfoUpdateListener:()=>{}
};
const plus = {};
vm.runInNewContext(compilar('src/lib/plus.ts'),{exports:plus,__DEV__:false,Date,
 process:{env:{EXPO_PUBLIC_PLUS_READY:'true',EXPO_PUBLIC_REVENUECAT_ANDROID_KEY:'goog_fixture'}},
 require:n=>n==='react-native'?{Platform:{OS:'android'}}:n==='./identidad'?identidad:{__esModule:true,default:purchases,LOG_LEVEL:{INFO:1}}});
let hooks=[],cursor=0,authChanged;
const react = {
 createContext:()=>({Provider:'provider'}),useContext:()=>{},
 useState:initial=>{const i=cursor++;if(!(i in hooks))hooks[i]=initial;return [hooks[i],v=>{hooks[i]=v;}];},
 useRef:initial=>{const i=cursor++;if(!(i in hooks))hooks[i]={current:initial};return hooks[i];},
 useEffect:fn=>{const i=cursor++;if(!(i in hooks)){hooks[i]=true;fn();}}
};
const ctx = {};
vm.runInNewContext(compilar('src/lib/PlusContext.tsx'),{exports:ctx, setTimeout:()=>0,clearTimeout:()=>{},
 require:n=>({
  react, 'react/jsx-runtime':{jsx:(_type,props)=>props},
  'react-native':{AppState:{addEventListener:()=>({remove(){}})},Linking:{openURL:async()=>{}}},
  'react-native-purchases':{__esModule:true,default:purchases},
  'react-native-purchases-ui':{__esModule:true,default:{presentPaywallIfNeeded:async options=>{pagos++;presentada=options;return resultado;}},PAYWALL_RESULT:{ERROR:'ERROR'}},
  './sesion':{asegurarSesion:async()=>user},'./supabase':{supabase:{auth:{onAuthStateChange:fn=>{authChanged=fn;return {data:{subscription:{unsubscribe(){}}}};}}}},
  './plus':plus,'./plusServidor':{sincronizarPlusServidor:async()=>{sincronizaciones++;}}
 }[n])});
function render(){cursor=0;return ctx.PlusProvider({children:null}).value;}
const protegido = id => ({id,is_anonymous:false,email:`${id}@recovery.blindly.invalid`});
(async()=>{
 await assert.rejects(render().comprar(),/PLUS_PROTEGER_CUENTA/);
 await assert.rejects(render().restaurar(),/PLUS_PROTEGER_CUENTA/);
 assert.equal(pagos,0);assert.equal(restores,0);assert.equal(uuid,null);
 user=protegido('uuid-a');await render().comprar();
 assert.equal(uuid,user.id);assert.equal(pagos,1);assert.equal(presentada.offering,oferta);
 assert.equal(presentada.requiredEntitlementIdentifier,'blindly_plus');assert.equal(render().activo,false);
 offerings={current:null};await assert.rejects(render().comprar(),/PLUS_OFERTA_INCOMPLETA/);assert.equal(pagos,1);
 offerings={current:{availablePackages:paquetes.filter(p=>p.identifier!=='$rc_annual')}};
 await assert.rejects(render().comprar(),/PLUS_OFERTA_INCOMPLETA/);
 offerings={current:oferta};resultado='ERROR';await assert.rejects(render().comprar(),/PLUS_ERROR_COMPRA/);
 consultarOfertas=async()=>{throw Error('NETWORK_ERROR');};const antesRed=pagos;
 await assert.rejects(render().comprar(),/NETWORK_ERROR/);assert.equal(pagos,antesRed);assert.equal(render().activo,false);
 consultarOfertas=async()=>offerings;
 resultado='PURCHASED';info={entitlements:{active:{blindly_plus:{isActive:true,expirationDate:null}}},managementURL:null};
 await render().comprar();assert.equal(render().activo,true);assert.equal(render().gestionable,false);
 // Retirar Founder de la venta no quita el entitlement ni bloquea suscripciones.
 offerings={current:{availablePackages:paquetes.slice(0,2)}};await render().comprar();assert.equal(render().activo,true);
 user=protegido('uuid-b');await render().restaurar();assert.equal(uuid,'uuid-b');assert.equal(restores,1);
 assert.equal(render().activo,true);assert.ok(sincronizaciones>0);
 info={entitlements:{active:{blindly_plus:{isActive:true,expirationDate:'2000-01-01'}}}};
 await render().refrescar();assert.equal(render().activo,false);
 for(const vencimiento of ['2099-01-01',null])assert.equal(plus.tieneEntitlementPlus({entitlements:{active:{blindly_plus:{isActive:true,expirationDate:vencimiento}}}}),true);
 assert.equal(plus.tieneEntitlementPlus({entitlements:{active:{otro:{isActive:true}}}}),false);
 let resolve;consultarOfertas=()=>new Promise(r=>{resolve=r;});
 const antes=pagos,pending=render().comprar();await new Promise(r=>setImmediate(r));
 authChanged('SIGNED_IN',{user:protegido('uuid-c')});resolve({current:oferta});await pending;
 assert.equal(pagos,antes,'un cambio de UUID durante ofertas no abre el pago anterior');
 console.log('Plus comercial: invitado protegido, UUID, ofertas, cancelación/error, restore, Founder y expiración OK');
})().catch(e=>{console.error(e);process.exitCode=1;});
