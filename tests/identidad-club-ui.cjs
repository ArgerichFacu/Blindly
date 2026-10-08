const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const estados=[],refs=[];let cursor=0,rc=0,llamadas=0,actualizaciones=0,finalizar,rechazar;
const jsx=(type,props)=>({type,props});
function modulo(file,deps={}) {const m={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:m,require:id=>{if(!(id in deps))throw Error(id);return deps[id];}});return m;}
const ui=modulo('src/components/IdentidadClub.tsx',{
 'react':{useState:initial=>{const i=cursor++;if(!(i in estados))estados[i]=initial;return[estados[i],v=>estados[i]=v];},useRef:initial=>refs[rc++]??(refs[rc-1]={current:initial})},
 'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'fragment'},'react-native':{View:'view'},'./Controles':{Boton:'button',Texto:'text'},
 '../lib/identidadClub':modulo('src/lib/identidadClub.ts'),
 '../lib/Preferencias':{usePreferencias:()=>({t:s=>s,mensajeError:e=>e.message})},
 '../lib/ligas':{guardarIdentidadClub:()=>{llamadas++;return new Promise((res,rej)=>{finalizar=res;rechazar=rej;});}},
});
function nodos(n){if(!n)return[];if(Array.isArray(n))return n.flatMap(nodos);if(typeof n!=='object')return[n];return[n,...nodos(n.props?.children)];}
const props={ligaId:'club',nombre:'Mesa viernes',identidad:{version:1,color:'oro',emblema:'picas',banner:'liso'},permitido:true,administrador:true,alGuardar:()=>actualizaciones++};
function render(p=props){cursor=rc=0;return nodos(ui.IdentidadClub(p));}
const boton=(u,nombre)=>u.find(n=>n?.type==='button'&&n.props.titulo===nombre)?.props;
(async()=>{
 let u=render({...props,permitido:false});assert.ok(u.includes('Mesa viernes'));assert.equal(boton(u,'Personalizar club'),undefined);
 u=render();boton(u,'Personalizar club').onPress();u=render();boton(u,'Zafiro').onPress();u=render();
 boton(u,'Guardar identidad').onPress();boton(u,'Guardar identidad').onPress();assert.equal(llamadas,1);
 rechazar(Error('PLUS_CLUB_REQUERIDO'));await new Promise(r=>setImmediate(r));assert.equal(actualizaciones,0);assert.ok(render().includes('PLUS_CLUB_REQUERIDO'));
 boton(render(),'Guardar identidad').onPress();finalizar();await new Promise(r=>setImmediate(r));assert.equal(actualizaciones,1);
 console.log('Identidad club UI: Free conserva, permisos, preview, doble toque y rechazo servidor OK');
})().catch(e=>{console.error(e);process.exitCode=1;});
