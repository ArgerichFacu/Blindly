const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
function cargar(file, mocks = {}, extra = {}) {
  const api = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,
    {exports:api, require:k=>{assert.ok(k in mocks,k);return mocks[k]}, Promise, setTimeout, clearTimeout, ...extra});
  return api;
}
const {SesionPublicidad} = cargar('src/lib/publicidadSesion.ts');
const tick = () => new Promise(r=>setImmediate(r));
const entrada = {sala:{estado:'esperando'}, ingresoNuevo:true};
function prueba(opts={}) {
  let cargas=0, shows=0, destroy=0, cerrar, resolverCarga;
  let permitido=true;
  const ad={listo:()=>{if(opts.fallaListo)throw Error('SDK');return true}, destruir:()=>{destroy++;if(opts.fallaDestroy)throw Error('SDK')},
    mostrar:abierto=>{shows++;if(opts.fallaShow)throw Error('show');abierto();return new Promise(r=>cerrar=()=>r('cerrado'))}};
  const sesion=new SesionPublicidad(async()=>{cargas++;if(opts.fallaCarga)throw Error('load');if(opts.pendiente)return new Promise(r=>resolverCarga=()=>r(ad));return ad});
  const abrir=()=>sesion.abrir(()=>permitido);
  return {abrir, ad, get cargas(){return cargas}, get shows(){return shows}, get destroy(){return destroy},
    cerrar:()=>cerrar?.(), cargar:()=>resolverCarga(), bloquear:()=>permitido=false};
}
(async()=>{
  const c=prueba();let w=c.abrir();await tick();const intento=w.confirmar();
  const presentacion=w.trasValidar(intento,entrada);await tick();assert.equal(c.shows,1);
  await w.trasValidar(intento,entrada);assert.equal(c.shows,1,'Doble confirmación reservada antes del await');
  c.cerrar();await presentacion;w.cancelar();w=c.abrir();await tick();
  await w.trasValidar(w.confirmar(),entrada);assert.equal(c.shows,1);assert.equal(c.cargas,1,'Sesión compartida entre crear/unirse y cuentas');
  const nueva=prueba();const n=nueva.abrir();await tick();const pn=n.trasValidar(n.confirmar(),entrada);nueva.cerrar();await pn;assert.equal(nueva.shows,1,'Nuevo runtime admite otra sesión');

  for(const opcion of [{pendiente:true},{fallaCarga:true},{fallaListo:true},{fallaShow:true},{fallaDestroy:true}]) {
    const c=prueba(opcion), w=c.abrir();await tick();
    if(opcion.fallaDestroy){const p=w.trasValidar(w.confirmar(),entrada);c.cerrar();await p}
    else await w.trasValidar(w.confirmar(),entrada);
    if(opcion.pendiente){w.cancelar();c.cargar();await tick();assert.equal(c.shows,0);assert.equal(c.destroy,1,'Carga tardía se descarta')}
  }
  for(const dato of [{sala:{estado:'jugando'},ingresoNuevo:true},{sala:{estado:'esperando'},ingresoNuevo:false},{sala:{estado:'esperando'}}]) {
    const c=prueba(), w=c.abrir();await tick();await w.trasValidar(w.confirmar(),dato);assert.equal(c.shows,0,'Partida/reconexión/servidor antiguo omiten anuncio');w.cancelar();
  }
  for(const accion of ['background','error','plus','blur']) {
    const c=prueba(), w=c.abrir();await tick();const token=w.confirmar();
    if(accion==='error')w.error();else if(accion==='plus')c.bloquear();else w.cancelar();
    await w.trasValidar(token,entrada);assert.equal(c.shows,0,accion);
    if(accion==='error') { const siguiente=c.abrir();await tick();await siguiente.trasValidar(siguiente.confirmar(),entrada);assert.equal(c.shows,0,'Después de un error se omite publicidad el resto de la sesión');assert.equal(c.cargas,1); }
  }
  const no=prueba();no.bloquear();no.abrir();await tick();assert.equal(no.cargas,0,'Sin inicialización si no es Free verificado');

  // Adaptador real contra SDK falso: errores, no inventario, consentimiento,
  // tiempos de carga y de presentación. Ningún callback tardío abre el lobby.
  async function nativo({consent=true, allowed=true, showError=false, noOpened=false, online=true, destroyError=false,escenario='normal'}={}) {
    const events={}, timers=new Map();let id=0, init=0, request=0, destroys=0, shows=0;
    const ad={loaded:true,addAdEventListener:(e,fn)=>events[e]=fn,load:()=>{},destroy:()=>{destroys++;if(destroyError)throw Error('destroy')},show:async()=>{shows++;if(showError)throw Error('AdMob');if(!noOpened)events.opened()}};
    const sdk={default:()=>({setRequestConfiguration:async()=>{},initialize:async()=>{init++}}),AdsConsent:{requestInfoUpdate:async()=>({canRequestAds:consent})},AdEventType:{LOADED:'loaded',OPENED:'opened',CLOSED:'closed',ERROR:'error'},TestIds:{INTERSTITIAL:'TEST'},MaxAdContentRating:{G:'G'},InterstitialAd:{createForAdRequest:(id,opts)=>{assert.equal(id,'TEST');assert.equal(opts.requestNonPersonalizedAdsOnly,true);request++;return ad}}};
    sdk.__esModule=true;
    let red;
    const network={getNetworkStateAsync:async()=>({isConnected:online,isInternetReachable:online}),addNetworkStateListener:fn=>{red=fn;return{remove(){}}}};
    const api=cargar('src/lib/publicidadAdmob.native.ts',{'react-native-google-mobile-ads':sdk,'expo-network':network,'./publicidadDiagnostico':{registrarPublicidadQA(){}}},{setTimeout:(fn,ms)=>{timers.set(++id,{fn,ms});return id},clearTimeout:i=>timers.delete(i)});
    const p=api.prepararInterstitial(()=>allowed,escenario);await tick();
    return {p,events,timers,offline:()=>red({isConnected:false,isInternetReachable:false}),get init(){return init},get request(){return request},get destroys(){return destroys},get shows(){return shows}};
  }
  for(const cfg of [{consent:false},{allowed:false},{online:false}]){const c=await nativo(cfg);assert.equal(await c.p,null);assert.equal(c.init,0);assert.equal(c.request,0)}
  for(const cfg of [{showError:true},{noOpened:true},{destroyError:true},{}]) {
    const c=await nativo(cfg);c.events.loaded();const ad=await c.p;let aperturas=0;const p=ad.mostrar(()=>aperturas++);await tick();
    if(cfg.noOpened){const timeout=[...c.timers.values()].find(t=>t.ms===750);assert.ok(timeout);timeout.fn()}
    else if(!cfg.showError)c.events.closed();
    await p;assert.equal(c.destroys,1);assert.equal(c.shows,1);
    assert.equal(aperturas,cfg.showError||cfg.noOpened?0:1,'Sólo OPENED registra una impresión');
  }
  const vacio=await nativo();vacio.events.error();assert.equal(await vacio.p,null);
  const timeout=await nativo();[...timeout.timers.values()].find(t=>t.ms===10000).fn();assert.equal(await timeout.p,null);
  const offline=await nativo();offline.events.loaded();const listo=await offline.p;offline.offline();await listo.mostrar(()=>assert.fail('offline'));assert.equal(offline.shows,0,'Precargado pero offline continúa sin publicidad');
  const sinCierre=await nativo();sinCierre.events.loaded();const sinCierreAd=await sinCierre.p;const sinCierreP=sinCierreAd.mostrar(()=>{});await tick();[...sinCierre.timers.values()].find(t=>t.ms===90000).fn();assert.equal(await sinCierreP,'fallo','Sin CLOSED nunca atrapa navegación indefinidamente');
  for(const escenario of ['show_error','show_timeout']) { const c=await nativo({escenario});c.events.loaded();const ad=await c.p;const p=ad.mostrar(()=>assert.fail('Fallo QA no es impresión'));if(escenario==='show_timeout')[...c.timers.values()].find(t=>t.ms===750).fn();assert.equal(await p,'fallo');assert.equal(c.shows,0); }

  // Con ads_enabled=false, el hook no consulta al servidor ni importa AdMob.
  const config=cargar('src/lib/publicidadConfig.ts');
  for(const d of [null,{}, {ads_enabled:true,elegible_free:true}, {ads_qa_enabled:true,elegible_free:false}])assert.equal(config.permitePublicidadPrueba(d),false);
  assert.equal(config.permitePublicidadPrueba({ads_enabled:false,ads_qa_enabled:true,elegible_free:true}),true);
  for(const source of ['FREE','FOUNDER_TRIAL','REVENUECAT_PAID','PLAY_REVIEW']) for(const deepLink of [false,true]) {
    let foco, rpc=0;
    const {usePublicidadSala}=cargar('src/lib/usePublicidadSala.ts',{
      react:{useCallback:f=>f,useRef:v=>({current:v}),useLayoutEffect:f=>f()},'expo-router':{useFocusEffect:f=>foco=f},
      'react-native':{AppState:{currentState:'active',addEventListener:()=>({remove(){}})}},'./PlusContext':{usePlus:()=>({identidad:'one',activo:source!=='FREE',cargando:false,error:null,tipoAcceso:source})},
      'expo-linking':{getInitialURL:async()=>deepLink?'blindly://auth-callback':null,addEventListener:()=>({remove(){}})},
      './publicidadConfig':config,'./publicidadSesion':{SesionPublicidad},'./supabase':{supabase:{rpc:async()=>{rpc++;return{data:{ads_enabled:false,ads_qa_enabled:false,elegible_free:true},error:null}}}},
      './publicidadDiagnostico':{registrarPublicidadQA(){}},
    });usePublicidadSala();foco();await tick();assert.equal(rpc,source==='FREE'&&!deepLink?1:0,source);
  }
  console.log('Publicidad: cap por runtime, doble toque, carga tardía, errores, reconexión, Plus, background, consentimiento, timeout y flag OFF OK');
})().catch(e=>{console.error(e);process.exitCode=1});
