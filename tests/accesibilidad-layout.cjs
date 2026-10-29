const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const jsx=(type,props)=>({type,props}),flat=s=>Array.isArray(s)?Object.assign({},...s.map(flat)):s??{};
function load(path,deps){const api={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:api,require:k=>{assert.ok(k in deps,k);return deps[k]}});return api;}
function nodes(n){return Array.isArray(n)?n.flatMap(nodes):n&&typeof n==='object'?[n,...nodes(n.props?.children)]:[];}
for(const fontScale of [1,1.5,2,3]){
 const m=load('src/components/MesaAsientos.tsx',{'react/jsx-runtime':{jsx,jsxs:jsx},'react-native':{Text:'Text',View:'View',StyleSheet:{create:s=>s},useWindowDimensions:()=>({fontScale,width:390})},'./Controles':{Texto:'Texto'},'../lib/TemaContext':{useTema:()=>({tema:{}})},'../lib/Preferencias':{usePreferencias:()=>({t:k=>k})},'../lib/mesa':{rolesMesa:()=>({one:'DR',two:'BB'})}});
 const tree=m.MesaAsientos({jugadores:[{id:'one',nombre:'Jugador uno',fichas:5000},{id:'two',nombre:'Jugador dos',fichas:4000}],orden:['one','two'],dealer:'one',pozo:1000});
 const seats=nodes(tree).filter(n=>n.props?.accessibilityLabel?.includes('Asiento'));
 assert.equal(seats.length,2);assert.equal(nodes(tree).filter(n=>n.props?.children===5000..toLocaleString()).length,1);
 if(fontScale>1.3){assert.equal(flat(tree.props.style).height,undefined);assert.ok(seats.every(n=>flat(n.props.style).position==='relative'));assert.ok(nodes(tree).filter(n=>n.type==='Texto').every(n=>n.props.numberOfLines===undefined));}
}
const deps={'react/jsx-runtime':{jsx,jsxs:jsx},react:{useState:v=>[v,()=>{}]},'expo-router':{useRouter:()=>({})},'react-native':{Switch:'Switch',View:'View'},'./Controles':{Pantalla:'Pantalla',Texto:'Texto',Boton:'Boton'},'./Superficie':{Superficie:'Superficie'},'./FilaOpcion':{FilaOpcion:'FilaOpcion'},'../lib/Preferencias':{usePreferencias:()=>({t:k=>k,preferencias:{idioma:'es'}})},'../lib/TemaContext':{useTema:()=>({tema:{}})},'../lib/temas':{TEMAS:[]},'../lib/capacidadesPlus':{capacidadesPlus:()=>({})},'../lib/PlusContext':{usePlus:()=>({})}};
const config=load('src/components/OpcionesApp.tsx',deps).default;assert.equal(config({}).props.volver,true);assert.equal(config({enTabs:true}).props.volver,false);
console.log('Layout accesible: fuente 1/1.5/2/3, mesa en flujo sin superposición y configuración compartida stack/tab OK');
