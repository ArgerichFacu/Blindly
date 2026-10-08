const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const exportsModulo={},estados=[],refs=[];let cursor=0,refCursor=0,llamadas=0,actualizaciones=0,finalizar,rechazar;
const jsx=(type,props)=>typeof type==='function'?type(props):({type,props});
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/TituloPersonalizado.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:exportsModulo,require:name=>{
  if(name==='react')return {useState:initial=>{const i=cursor++;if(!(i in estados))estados[i]=initial;return [estados[i],v=>{estados[i]=v;}];},useRef:initial=>refs[refCursor++]??(refs[refCursor-1]={current:initial})};
  if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};
  if(name==='react-native')return {View:'view'};
  if(name==='./Controles')return {Boton:'button',Campo:'input',Texto:'text'};
  if(name.includes('Preferencias'))return {usePreferencias:()=>({t:s=>s,mensajeError:e=>e.message,preferencias:{hapticos:true}})};
  if(name.includes('ligas'))return {asignarTituloLiga:()=>{llamadas++;return new Promise((res,rej)=>{finalizar=res;rechazar=rej;});}};
  if(name.includes('hapticos'))return {vibrarMomento:()=>{}};
  throw Error(name);
}});
function nodos(n){if(!n)return [];if(Array.isArray(n))return n.flatMap(nodos);if(typeof n!=='object')return [n];return [n,...nodos(n.props?.children)];}
const props={ligaId:'club',usuarioId:'uuid',titulo:'EL PROFE',permitido:true,alGuardar:()=>actualizaciones++};
function render(p=props){cursor=refCursor=0;return nodos(exportsModulo.TituloPersonalizado(p));}
const boton=(ui,nombre)=>ui.find(n=>n?.type==='button'&&n.props.titulo===nombre)?.props;
(async()=>{
  let ui=render({...props,permitido:false});assert.ok(ui.includes('EL PROFE'));assert.equal(boton(ui,'Editar título'),undefined);
  ui=render();boton(ui,'Editar título').onPress();ui=render();ui.find(n=>n?.type==='input').props.onChangeText('EL JEFE');ui=render();
  const guardar=boton(ui,'Guardar título');guardar.onPress();guardar.onPress();assert.equal(llamadas,1,'Doble toque protegido sin esperar render');
  assert.equal(boton(render(),'Guardar título').disabled,true);finalizar();await new Promise(r=>setImmediate(r));assert.equal(actualizaciones,1);
  ui=render();boton(ui,'Editar título').onPress();ui=render();boton(ui,'Quitar título').onPress();rechazar(Error('PLUS_CLUB_REQUERIDO'));await new Promise(r=>setImmediate(r));
  ui=render();assert.ok(ui.includes('EL PROFE'),'Rechazo conserva título visible');assert.ok(ui.includes('PLUS_CLUB_REQUERIDO'));assert.equal(actualizaciones,1);
  const exportsPermisos={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/permisosClub.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:exportsPermisos});
  const {permisosClub}=exportsPermisos;
  assert.equal(permisosClub(null).editarTitulos,false);
  assert.equal(permisosClub({liga:{estado:'activa',puede_administrar:true,permisos:{plus:true,editar_titulos:true}}}).editarTitulos,true);
  for(const liga of [{estado:'archivada',puede_administrar:true,permisos:{editar_titulos:true}},{estado:'activa',puede_administrar:false,permisos:{editar_titulos:true}},{estado:'activa',puede_administrar:true,permisos:{plus:true}}])assert.equal(permisosClub({liga}).editarTitulos,false);
  console.log('Títulos Plus UI: lectura al expirar, permisos cerrados, edición, doble toque y rechazo servidor OK');
})().catch(e=>{console.error(e);process.exitCode=1;});
