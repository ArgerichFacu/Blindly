const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
const compilar = file => ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const identidad = {};
vm.runInNewContext(compilar('src/lib/identidad.ts'),{exports:identidad});
const productos=['blindly_plus:monthly','blindly_plus:annual','blindly_plus_founder_lifetime'];
const paquetes = ['$rc_monthly','$rc_annual','$rc_lifetime'].map((identifier,i)=>({identifier,product:{identifier:productos[i],price:1,priceString:'ARS 1,00'}}));
const oferta = {identifier:'default',availablePackages:paquetes};
let user = {id:'uuid-a',is_anonymous:true}, uuid = null, offerings = {current:oferta}, info = {entitlements:{active:{}},managementURL:null};
let pagos = 0, restores = 0, sincronizaciones = 0, gestiones = 0, presentada, resultado = 'CANCELLED', consultarOfertas = async()=>offerings;
let payments=true, founderPatch={};
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
const {estado,helper}=require('./founder-fixture.cjs');
const founder=helper(async name=>({data:name==='estado_lanzamiento_plus'?{real_payments_enabled:payments}:estado({real_payments_enabled:payments,...founderPatch}),error:null}));
vm.runInNewContext(compilar('src/lib/PlusContext.tsx'),{exports:ctx, setTimeout:()=>0,clearTimeout:()=>{},setInterval:()=>0,clearInterval:()=>{},
 require:n=>({
  react, 'react/jsx-runtime':{jsx:(_type,props)=>props},
  'react-native':{AppState:{addEventListener:()=>({remove(){}})},Linking:{openURL:async()=>{gestiones++;}}},
  'react-native-purchases':{__esModule:true,default:purchases},
  'react-native-purchases-ui':{__esModule:true,default:{presentPaywallIfNeeded:async options=>{pagos++;presentada=options;return resultado;}},PAYWALL_RESULT:{ERROR:'ERROR'}},
  './sesion':{asegurarSesion:async()=>user},'./supabase':{supabase:{rpc:async()=>({data:false,error:null}),auth:{onAuthStateChange:fn=>{authChanged=fn;return {data:{subscription:{unsubscribe(){}}}};}}}},
  './plus':plus,'./plusDemo':{PLUS_DEMO:false},'./founderPlus':founder,'./plusServidor':{sincronizarPlusServidor:async()=>{sincronizaciones++;}}
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
 // Gate B: lectura real del módulo con compras remotas apagadas (RPC simulada).
 payments=false;
 offerings={current:{identifier:'otro'},all:{default:oferta}};
 info={entitlements:{active:{blindly_plus:{isActive:true,expirationDate:null}}},managementURL:'https://play.google.com/store/account/subscriptions'};
 const antesLectura={pagos,restores,gestiones,sincronizaciones};
 await render().refrescar();
 assert.equal(uuid,user.id,'SDK identificado con el mismo UUID recuperable');
 assert.equal(render().catalogo,oferta,'consulta all.default aunque current apunte a otro offering');
 assert.deepEqual(render().catalogo.availablePackages.map(p=>p.product.identifier),productos);
 assert.ok(render().catalogo.availablePackages.every(p=>p.product.priceString==='ARS 1,00'));
 assert.equal(render().activo,false,'CustomerInfo por sí solo no concede acceso con pagos OFF');
 assert.equal(render().disponible,false);assert.equal(render().gestionable,false);
 await assert.rejects(render().comprar(),/PLUS_PAGOS_NO_DISPONIBLES/);
 await assert.rejects(render().restaurar(),/PLUS_PAGOS_NO_DISPONIBLES/);
 await assert.rejects(render().gestionar(),/PLUS_SIN_GESTION/);
 assert.deepEqual({pagos,restores,gestiones,sincronizaciones},antesLectura,'sin paywall, restore, management ni escritura comercial durante catálogo');
 // Error del catálogo separado: no borra el Trial ni su caché validada.
 const ahora=new Date();founderPatch={active:true,used:true,eligible:false,access_source:'FOUNDER_TRIAL',server_now:ahora.toISOString(),started_at:ahora.toISOString(),expires_at:new Date(+ahora+72*3600000).toISOString()};
 consultarOfertas=async()=>{throw Error('CATALOGO_OFFLINE')};
 await render().refrescar();assert.equal(render().tipoAcceso,'FOUNDER_TRIAL');assert.equal(render().activo,true);
 assert.equal(render().error,null);assert.match(render().errorCatalogo.message,/CATALOGO_OFFLINE/);assert.equal(render().catalogo,null);
 founderPatch={};consultarOfertas=async()=>offerings;
 await render().refrescar();assert.equal(render().errorCatalogo,null);assert.equal(render().catalogo,oferta);
 // La ausencia de paquetes no se transforma en un Gate aprobado ni en Plus.
 offerings={all:{default:{identifier:'default',availablePackages:[]}}};await render().refrescar();
 assert.equal(render().catalogo.availablePackages.length,0);assert.equal(render().activo,false);
 offerings={all:{}};await render().refrescar();assert.match(render().errorCatalogo.message,/PLUS_OFERTA_INCOMPLETA/);
 // Cambio de cuenta mientras getOfferings está pendiente: descartar respuesta.
 let finishCatalogo;consultarOfertas=()=>new Promise(r=>finishCatalogo=r);
 const leyendo=render().refrescar();await new Promise(r=>setImmediate(r));
 assert.equal(render().cargando,false,'consultar precios no bloquea Founder');
 user=protegido('uuid-catalogo');authChanged('SIGNED_IN',{user});
 assert.equal(render().catalogo,null);assert.equal(render().errorCatalogo,null);
 finishCatalogo({all:{default:oferta}});await leyendo;assert.equal(render().catalogo,null);
 consultarOfertas=async()=>({all:{default:oferta}});await render().refrescar();assert.equal(uuid,'uuid-catalogo');assert.equal(render().catalogo,oferta);
 // Build no comercial y Reviewer mantienen SDK apagado incluso en este camino.
 plus.PLUS_DISPONIBLE=false;await render().refrescar();assert.equal(render().catalogo,null);
 await assert.rejects(render().comprar(),/PLUS_NO_CONFIGURADO/);plus.PLUS_DISPONIBLE=true;
 founderPatch={access_source:'PLAY_REVIEW'};consultarOfertas=async()=>{throw Error('Reviewer no consulta catálogo')};
 await render().refrescar();assert.equal(render().tipoAcceso,'PLAY_REVIEW');assert.equal(render().catalogo,null);assert.equal(render().errorCatalogo,null);
 // ON sólo simulado en tests: conservar paywall, restore y management existentes.
 founderPatch={};payments=true;offerings={current:oferta,all:{default:oferta}};consultarOfertas=async()=>offerings;
 await render().refrescar();await render().comprar();await render().restaurar();await render().gestionar();
 assert.equal(pagos,antesLectura.pagos+1);assert.equal(restores,antesLectura.restores+1);assert.equal(gestiones,antesLectura.gestiones+1);
 // Revocación del servidor entre consulta de estado y pulsación: doble gate.
 const antesRevocar={pagos,restores,gestiones};payments=false;
 await assert.rejects(render().gestionar(),/PLUS_PAGOS_NO_DISPONIBLES/);await assert.rejects(render().comprar(),/PLUS_PAGOS_NO_DISPONIBLES/);await assert.rejects(render().restaurar(),/PLUS_PAGOS_NO_DISPONIBLES/);
 assert.deepEqual({pagos,restores,gestiones},antesRevocar);payments=true;
 let resolve;consultarOfertas=()=>new Promise(r=>{resolve=r;});
 const antes=pagos,pending=render().comprar();await new Promise(r=>setImmediate(r));
 authChanged('SIGNED_IN',{user:protegido('uuid-c')});resolve({current:oferta});await pending;
 assert.equal(pagos,antes,'un cambio de UUID durante ofertas no abre el pago anterior');
 console.log('Plus: catálogo OFF sin cobros/grants, Trial aislado, identidad/carreras y doble gate; compra/restore/management ON sólo simulados OK');
})().catch(e=>{console.error(e);process.exitCode=1;});
