const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),exportsModulo={};
const jsx=(type,props)=>typeof type==='function'?type(props):({type,props});
const t=(s,args={})=>s.replace(/\{(\w+)\}/g,(_,k)=>String(args[k]));
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/RivalidadesClub.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:exportsModulo,require:name=>{
  if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};
  if(name==='./Controles')return {Etiqueta:'label',Tarjeta:'card',Texto:'text'};
  if(name.includes('Preferencias'))return {usePreferencias:()=>({t})};
  if(name.includes('TemaContext'))return {useTema:()=>({tema:{acento:'gold'}})};
  throw Error(name);
}});
function nodos(n){if(!n)return [];if(Array.isArray(n))return n.flatMap(nodos);if(typeof n!=='object')return [n];return [n,...nodos(n.props?.children)];}
const rival={user_id:'uuid',nombre:'Nico',titulo_personalizado:'EL PROFE',compartidas:3,victorias:0,derrotas:2,empates:1,recientes:3,derrotas_recientes:2};
let ui=nodos(exportsModulo.RivalidadesClub({}));assert.ok(ui.includes('Todavía faltan torneos compartidos para mostrar rivalidades.'));assert.ok(!ui.includes('TU NÉMESIS'));
ui=nodos(exportsModulo.RivalidadesClub({datos:{rivales:[rival],nemesis:rival}}));assert.ok(ui.includes('TU NÉMESIS'));assert.ok(ui.includes('Vos 0 · Rival 2 · Empates 1'));assert.ok(ui.includes('EL PROFE'));assert.ok(!ui.some(n=>typeof n==='string'&&n.includes('últimos 4')));
ui=nodos(exportsModulo.RivalidadesClub({datos:{rivales:[{...rival,compartidas:4,recientes:4}],nemesis:null}}));assert.ok(ui.includes('Por ahora no tenés una némesis con balance desfavorable.'));assert.ok(ui.includes('Terminó por encima de vos en 2 de los últimos 4 torneos compartidos.'));
console.log('Rivalidades UI: vacío, némesis real, balance con empates, título y últimos 4 sólo con datos OK');
