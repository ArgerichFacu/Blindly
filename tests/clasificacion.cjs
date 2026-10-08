const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function cargar(path,require=()=>{throw Error('Import inesperado')}) {
  const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require});return exports;
}
const {clasificacion}=cargar('src/lib/clasificacion.ts');
const fila=(posicion,puntos,nombre=String(posicion))=>({posicion,puntos,nombre,user_id:nombre,partidas:2,victorias:1,podios:1,posicion_media:1.5});
const ranking=[fila(1,5,'Ana'),fila(2,3,'Luis'),fila(3,2,'Paz')];
let d=clasificacion(ranking,'activa');
assert.equal(d.mvp.nombre,'Ana');assert.equal(d.campeon,null);assert.equal(d.carrera[1].diferencia,2);assert.equal(d.carrera[1].proporcion,.6);
assert.equal(clasificacion(ranking,'finalizada').campeon.nombre,'Ana');assert.equal(clasificacion(ranking,'finalizada').mvp,null);
assert.equal(clasificacion([fila(1,9,'Luis'),fila(2,5,'Ana')],'activa').mvp.nombre,'Luis');
assert.equal(clasificacion([],'activa').mvp,null);assert.equal(clasificacion(ranking,undefined).mvp,null);
assert.equal(clasificacion([fila(1,0),fila(2,0)],'activa').carrera[1].proporcion,0);
assert.equal(clasificacion([fila(1,1),fila(1,1,'otro')],'activa').mvp,null);
assert.equal(clasificacion([fila(1,NaN),fila(2,2)],'activa').mvp,null);
const jsx=(type,props)=>typeof type==='function'?type(props):({type,props});
const t=(s,args={})=>s.replace(/\{(\w+)\}/g,(_,k)=>String(args[k]));
const {ClasificacionTemporada}=cargar('src/components/ClasificacionTemporada.tsx',name=>{
  if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};
  if(name==='react-native')return {View:'view'};
  if(name==='./Controles')return {Etiqueta:'label',Tarjeta:'card',Texto:'text'};
  if(name==='./TitulosJugador')return {TitulosJugador:()=>null};
  if(name.includes('TemaContext'))return {useTema:()=>({tema:{acento:'gold',borde:'black',textoFuerte:'white'}})};
  if(name.includes('Preferencias'))return {usePreferencias:()=>({t,preferencias:{idioma:'es'}})};
  if(name.includes('clasificacion'))return {clasificacion};
  throw Error(name);
});
function nodos(n){if(!n)return [];if(Array.isArray(n))return n.flatMap(nodos);if(typeof n!=='object')return [n];return [n,...nodos(n.props?.children)];}
const temporada={id:'season',nombre:'2026',estado:'activa',inicio:'2026-10-01',fin:null};
let ui=nodos(ClasificacionTemporada({ranking,temporada,movimientos:{Luis:1,Paz:-1}}));
assert.ok(ui.includes('MVP ACTUAL'));assert.ok(ui.includes('RACE FOR MVP'));assert.ok(ui.includes('Subió 1 posiciones'));assert.ok(ui.includes('Bajó 1 posiciones'));
assert.equal(ui.filter(n=>n?.props?.accessibilityRole==='progressbar').length,3);
assert.equal(ui.find(n=>n?.props?.accessibilityLabel==='Luis').props.accessibilityValue.now,60);
assert.ok(!ui.includes('Mantiene su posición'),'Sin posición previa no inventa cero');
ui=nodos(ClasificacionTemporada({ranking,temporada:{...temporada,estado:'finalizada',fin:'2026-10-08'}}));
assert.ok(ui.includes('CAMPEÓN DE TEMPORADA'));assert.ok(!ui.includes('MVP ACTUAL'));assert.ok(!ui.includes('RACE FOR MVP'));
console.log('Clasificación: MVP único, campeón histórico, Race real, empates, vacíos y UI accesible OK');
