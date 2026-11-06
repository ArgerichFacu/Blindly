const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const tick=()=>new Promise(r=>setImmediate(r));
function pantalla(file,fallo=false){
  let i=0,r=0,resolver,finAnuncio;const states=[],refs=[],calls=[];
  const pendiente=new Promise(r=>resolver=r);
  const jsx=(type,props)=>({type,props});
  const mocks={
    react:{useState:v=>{const n=i++;if(!(n in states))states[n]=typeof v==='function'?v():v;return[states[n],v=>states[n]=v]},useRef:v=>refs[r++]??(refs[r-1]={current:v})},
    'react/jsx-runtime':{jsx,jsxs:jsx},'react-native':{View:'View'},'expo-camera':{CameraView:'CameraView',useCameraPermissions:()=>[{},()=>{}]},
    'expo-router':{useRouter:()=>({replace:v=>calls.push(['navegar',v]),push:()=>{}}),useLocalSearchParams:()=>({codigo:'ABCDE'})},
    '../components/Controles':Object.fromEntries(['Pantalla','Boton','Texto','Campo','Tarjeta','Etiqueta'].map(k=>[k,k])),
    '../lib/Preferencias':{usePreferencias:()=>({t:x=>x,mensajeError:e=>e.message})},'../lib/useNombreInicial':{useNombreInicial:()=>['Facu',()=>{}]},
    '../lib/niveles':{NIVELES_REGULAR:[]},'../lib/mesasHabituales':{crearSalaDesdeMesa:()=>{throw Error('No mesa')}} ,
    '../lib/salas':{crearSala:async()=>{calls.push(['crear']);return {codigo:'ABCDE'}}},
    '../lib/jugadores':{unirseASala:async()=>{calls.push(['unirse']);await pendiente;if(fallo)throw Error('SALA_NO_EXISTE');return {sala:{codigo:'ABCDE',estado:'esperando'},ingresoNuevo:true}}},
    '../lib/usePublicidadSala':{usePublicidadSala:()=>({error:()=>calls.push(['error']),confirmar:()=>({trasValidar:async entrada=>{assert.equal(entrada.ingresoNuevo,true);calls.push(['anuncio']);await new Promise(r=>finAnuncio=r)},error:()=>calls.push(['error'])})})},
  };
  const api={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:api,require:k=>{assert.ok(k in mocks,k);return mocks[k]}});
  const nodes=n=>Array.isArray(n)?n.flatMap(nodes):n&&typeof n==='object'?[n,...nodes(n.props?.children)]:[];
  const render=()=>{i=r=0;return nodes(api.default())};
  return {calls,confirmar:()=>render().filter(n=>n.type==='Boton').at(-1).props.onPress(),resolver:()=>resolver(),cerrar:()=>finAnuncio(),render};
}
(async()=>{
  for(const file of ['src/app/crear-sala.tsx','src/app/unirse.tsx']){
    const c=pantalla(file),p=c.confirmar();c.confirmar();await tick();
    assert.equal(c.calls.filter(c=>c[0]==='unirse').length,1,'Doble toque no crea dos incorporaciones');
    assert.equal(c.calls.some(c=>c[0]==='anuncio'),false,'Sin anuncio mientras el servidor valida');
    c.resolver();await tick();assert.equal(c.calls.at(-1)[0],'anuncio');
    assert.equal(c.calls.some(c=>c[0]==='navegar'),false,'El lobby aún no es visible');
    c.cerrar();await p;assert.equal(c.calls.at(-1)[0],'navegar');
    const f=pantalla(file,true),fp=f.confirmar();await tick();f.resolver();await fp;
    assert.equal(f.calls.some(c=>c[0]==='anuncio'),false,'Error servidor nunca se monetiza');
    assert.equal(f.calls.some(c=>c[0]==='navegar'),false);assert.equal(f.calls.at(-1)[0],'error');
  }
  console.log('Crear/unirse UI: validación servidor -> anuncio opcional -> lobby, doble toque y error sin publicidad OK');
})().catch(e=>{console.error(e);process.exitCode=1});
