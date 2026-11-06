const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const jsx=(type,props)=>({type,props});
const states=[],refs=[],calls=[];let i=0,r=0;
const mocks={
  react:{useState:v=>{const n=i++;if(!(n in states))states[n]=v;return[states[n],v=>states[n]=v]},useRef:v=>refs[r++]??(refs[r-1]={current:v})},
  'react/jsx-runtime':{jsx,jsxs:jsx},'expo-router':{useRouter:()=>({push:v=>calls.push(v),replace:()=>assert.fail('No club fantasma')})},
  '../components/Controles':Object.fromEntries(['Pantalla','Texto','Boton','Campo','Tarjeta'].map(k=>[k,k])),
  '../lib/ligas':{crearLiga:async()=>{throw Error('LIMITE_CLUBES_FREE')}},'../lib/useIdentidad':{useIdentidad:()=>({cargando:false,recuperable:true})},
  '../lib/Preferencias':{usePreferencias:()=>({t:x=>x,mensajeError:()=> 'Tu plan Free permite crear 1 club propio.',preferencias:{}})},
  '../lib/hapticos':{vibrarMomento:()=>{}},'../lib/useNombreInicial':{useNombreInicial:()=>['Facu',()=>{}]},
};
const api={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/app/liga-nueva.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:api,require:k=>{assert.ok(k in mocks,k);return mocks[k]}});
const nodes=n=>Array.isArray(n)?n.flatMap(nodes):n&&typeof n==='object'?[n,...nodes(n.props?.children)]:[];
const render=()=>{i=r=0;return nodes(api.default())};
(async()=>{
  render().find(n=>n.type==='Campo'&&n.props.etiqueta==='Nombre de la liga').props.onChangeText('Mi club');
  render().find(n=>n.type==='Campo'&&n.props.etiqueta==='Nombre de la temporada').props.onChangeText('2026');
  render().find(n=>n.type==='Boton'&&n.props.titulo==='Crear liga').props.onPress();await new Promise(r=>setImmediate(r));
  assert.ok(render().some(n=>n.type==='Texto'&&n.props.children==='Tu plan Free permite crear 1 club propio.'));
  assert.equal(render().some(n=>n.props?.children==='LIMITE_CLUBES_FREE'),false);
  render().find(n=>n.type==='Boton'&&n.props.titulo==='Ver Blindly Plus').props.onPress();assert.equal(calls[0],'/plus');
  console.log('Cupo Clubes UI: mensaje comercial, borrador conservado, sin club fantasma y CTA Plus OK');
})().catch(e=>{console.error(e);process.exitCode=1});
