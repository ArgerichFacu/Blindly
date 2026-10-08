const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const exportsModulo={},estados=[],refs=[];let cursor=0,refCursor=0,llamadas=0,refresh=0,resolver,rechazar,programada;
const helper={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/fechasClub.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:helper,Date});
const jsx=(type,props)=>typeof type==='function'?type(props):({type,props});
const t=(s,args={})=>s.replace(/\{(\w+)\}/g,(_,k)=>String(args[k]));
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/ProximaFechaClub.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:exportsModulo,require:name=>{
  if(name==='react')return {useState:initial=>{const i=cursor++;if(!(i in estados))estados[i]=initial;return [estados[i],v=>{estados[i]=v;}];},useRef:initial=>refs[refCursor++]??(refs[refCursor-1]={current:initial})};
  if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};
  if(name==='react-native')return {View:'view',Alert:{alert:()=>{}}};
  if(name==='./Controles')return {Boton:'button',Campo:'input',Texto:'text',Tarjeta:'card'};
  if(name.includes('Preferencias'))return {usePreferencias:()=>({t,mensajeError:e=>e.message,preferencias:{idioma:'es'}})};
  if(name.includes('fechasClub'))return helper;
  if(name.includes('ligas'))return {responderFechaLiga:()=>{llamadas++;return new Promise((res,rej)=>{resolver=res;rechazar=rej;});},programarFechaLiga:(...args)=>{programada=args;return Promise.resolve('nueva');}};
  if(name.includes('hapticos'))return {vibrarMomento:()=>{}};
  throw Error(name);
}});
function nodos(n){if(!n)return [];if(Array.isArray(n))return n.flatMap(nodos);if(typeof n!=='object')return [n];return [n,...nodos(n.props?.children)];}
const fecha={id:'fecha',cuando:'2026-10-10T22:00:00Z',lugar:'Casa',nota:'Cartas físicas',confirmados:2,pendientes:3,no_pueden:1,mi_respuesta:'pendiente'};
const props={liga:'club',fecha,administrar:false,activa:true,alCambiar:()=>refresh++};
function render(p=props){cursor=refCursor=0;return nodos(exportsModulo.ProximaFechaClub(p));}
const boton=(ui,nombre)=>ui.find(n=>n?.type==='button'&&n.props.titulo===nombre)?.props;
(async()=>{
  let ui=render();assert.ok(ui.includes('Tu respuesta: Pendiente'));assert.equal(boton(ui,'Reprogramar fecha'),undefined);
  const voy=boton(ui,'Voy');voy.onPress();voy.onPress();assert.equal(llamadas,1);assert.equal(boton(render(),'Voy').disabled,true);
  resolver();await new Promise(r=>setImmediate(r));assert.equal(refresh,1);
  ui=render();boton(ui,'No puedo').onPress();rechazar(Error('FECHA_CAMBIO'));await new Promise(r=>setImmediate(r));ui=render();assert.ok(ui.includes('FECHA_CAMBIO'));boton(ui,'Actualizar club').onPress();assert.equal(refresh,2);
  ui=render({...props,administrar:true});assert.ok(boton(ui,'Reprogramar fecha'));assert.ok(boton(ui,'Cancelar fecha'));boton(ui,'Reprogramar fecha').onPress();ui=render({...props,administrar:true});assert.ok(ui.includes('Reprogramar pide confirmar asistencia de nuevo; las respuestas anteriores se conservan.'));assert.equal(boton(ui,'Guardar fecha').disabled,true);
  ui=render({...props,activa:false});assert.equal(boton(ui,'Voy').disabled,true);assert.equal(boton(ui,'Reprogramar fecha'),undefined);
  ui=render({...props,administrar:true});const futuro=new Date(Date.now()+2*86400000),dia=`${String(futuro.getDate()).padStart(2,'0')}/${String(futuro.getMonth()+1).padStart(2,'0')}/${futuro.getFullYear()}`;
  ui.find(n=>n?.type==='input'&&n.props.etiqueta==='Día (DD/MM/AAAA)').props.onChangeText(dia);
  ui.find(n=>n?.type==='input'&&n.props.etiqueta==='Hora (HH:MM)').props.onChangeText('22:00');
  ui=render({...props,administrar:true});assert.equal(boton(ui,'Guardar fecha').disabled,false);boton(ui,'Guardar fecha').onPress();await new Promise(r=>setImmediate(r));
  assert.deepEqual(programada,['club',helper.instanteFecha(dia,'22:00'),'Casa','Cartas físicas','fecha']);assert.equal(refresh,3);
  console.log('Fechas UI: respuesta accesible, member/admin, doble toque, error, reprogramación y archivo OK');
})().catch(e=>{console.error(e);process.exitCode=1;});
