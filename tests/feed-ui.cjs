const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),exportsModulo={};
const jsx=(type,props)=>typeof type==='function'?type(props):({type,props}),t=(s,args={})=>s.replace(/\{(\w+)\}/g,(_,k)=>String(args[k]));
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/FeedClub.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:exportsModulo,require:name=>{
 if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};
 if(name==='./Controles')return {Etiqueta:'label',Tarjeta:'card',Texto:'text'};
 if(name.includes('Preferencias'))return {usePreferencias:()=>({t,preferencias:{idioma:'es'}})};throw Error(name);
}});
function nodos(n){if(!n)return [];if(Array.isArray(n))return n.flatMap(nodos);if(typeof n!=='object')return [n];return [n,...nodos(n.props?.children)];}
let ui=nodos(exportsModulo.FeedClub({}));assert.ok(ui.includes('La historia del club empieza con su primera partida terminada.'));
ui=nodos(exportsModulo.FeedClub({eventos:[{id:'p',tipo:'partida',fecha:'2026-10-07T22:00:00Z',precision:'instante',codigo:'ABCDE',jugadores:3},{id:'s',tipo:'temporada',fecha:'2026-10-08',precision:'dia',nombre:'Octubre'},{id:'f',tipo:'fecha',fecha:'2026-10-08T12:00:00Z',precision:'instante',cuando:'2026-10-10T22:00:00Z'}]}));
for(const texto of ['TORNEO TERMINADO','Terminó la partida ABCDE','3 jugadores','TEMPORADA CERRADA','Terminó Octubre','PRÓXIMA FECHA PROGRAMADA'])assert.ok(ui.includes(texto));
assert.ok(ui.includes(new Date('2026-10-08T12:00:00').toLocaleDateString('es')),'Cierre sin hora inventada');
console.log('Feed UI: vacío, torneos, cierre sin hora ficticia y próxima fecha OK');
