const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const jsx=(type,props)=>({type,props});
function escenario(source='FREE') {
 const states=[],refs=[],calls=[];let cursor=0,rc=0,fail=false,resolve;
 let identity={usuario:{id:'same'},nombre:'Facu',error:null};
 const mocks={
  react:{useCallback:f=>f,useRef:v=>refs[rc++]??(refs[rc-1]={current:v}),useState:v=>{const i=cursor++;if(!(i in states))states[i]=v;return[states[i],n=>states[i]=typeof n==='function'?n(states[i]):n]}},
  'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},'react-native':{View:'View'},'expo-router':{useFocusEffect:()=>{},useRouter:()=>({push:r=>calls.push(r)})},
  '../../components/Controles':Object.fromEntries(['Pantalla','Texto','Boton','Tarjeta','Campo'].map(k=>[k,k])),
  '../../components/Icono':{Icono:'Icono'},'../../components/Superficie':{Superficie:'Superficie'},'../../components/FilaOpcion':{FilaOpcion:'FilaOpcion'},'../../components/TitulosJugador':{TitulosJugador:'TitulosJugador'},'../../components/ProtegerCuenta':{necesitaCuenta:()=>false},
  '../../lib/clasificacion':{clasificacion:()=>({})},'../../lib/useClubes':{useClubes:()=>({datos:{detalles:{},usuario:'same'},recargar:()=>calls.push('reload')})},'../../lib/puntuacion':{miPuntuacion:async()=>null},
  '../../lib/TemaContext':{useTema:()=>({tema:{}})},'../../lib/visual':{RELIEVE:{},velo:c=>c},'../../lib/Preferencias':{usePreferencias:()=>({t:k=>k,preferencias:{idioma:'es'},mensajeError:e=>e.message})},
  '../../lib/PlusContext':{usePlus:()=>({activo:source!=='FREE',tipoAcceso:source})},'../../lib/useNombreVisible':{useNombreVisible:()=>identity},
  '../../lib/nombreVisible':{inicialNombre:n=>n[0],validarNombreVisible:n=>{if(!n.trim()||n.trim().length>30)throw Error('invalid');return n.trim()},guardarNombreVisible:async n=>{calls.push(n);await new Promise(r=>resolve=r);if(fail)throw Error('offline');identity={...identity,nombre:n.trim()};return identity.usuario}},
 };
 const api={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/app/(principal)/perfil.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:api,require:k=>{assert.ok(k in mocks,k);return mocks[k]}});
 function nodes(n){return Array.isArray(n)?n.flatMap(nodes):n&&typeof n==='object'?[n,...nodes(n.props?.children)]:[n]}
 const render=()=>{cursor=rc=0;return nodes(api.default())};
 const button=title=>render().find(n=>n?.type==='Boton'&&n.props.titulo===title)?.props;
 return {render,button,calls,field:()=>render().find(n=>n?.type==='Campo')?.props,resolve:()=>resolve(),fail:()=>fail=true,switch:()=>identity={...identity,usuario:{id:'new'},nombre:'Otro'}};
}
(async()=>{
 for(const source of ['FREE','FOUNDER_TRIAL','PLAY_REVIEW','REVENUECAT_PAID']) {const c=escenario(source);assert.ok(c.render().some(n=>n?.type==='Texto'&&n.props.children==='Facu'),'Own identity without club');assert.ok(c.render().some(n=>n?.props?.children===(source==='FREE'?'Free':source==='FOUNDER_TRIAL'?'Founder Trial':'Blindly Plus')));}
 const c=escenario();c.button('Editar nombre').onPress();assert.equal(c.field().value,'Facu');c.field().onChangeText(' ');assert.equal(c.button('Guardar nombre').disabled,true);c.field().onChangeText('Nico');
 c.button('Guardar nombre').onPress();c.button('Guardando…').onPress();assert.deepEqual(c.calls,['Nico']);c.resolve();await new Promise(r=>setImmediate(r));assert.ok(c.render().some(n=>n?.props?.children==='Nombre actualizado.'));
 const f=escenario();f.button('Editar nombre').onPress();f.field().onChangeText('Borrador');f.fail();f.button('Guardar nombre').onPress();f.resolve();await new Promise(r=>setImmediate(r));assert.equal(f.field().value,'Borrador');assert.ok(f.render().some(n=>n?.props?.children==='offline'));assert.equal(f.button('Guardar nombre').disabled,false);
 const s=escenario();s.button('Editar nombre').onPress();s.switch();assert.equal(s.field(),undefined,'Editor cannot apply previous identity draft');
 console.log('Perfil UI: identidad sin club, cuatro accesos, editar, vacío, doble toque, error conserva borrador y cambio de UUID OK');
})().catch(e=>{console.error(e);process.exitCode=1});
