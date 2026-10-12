const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
let hooks=[],cursor=0,started=0,interest,waitlist=0;
let plus={identidad:'guest',tipoAcceso:'FREE',activo:false,trialDisponible:true,trialRestanteMs:72*3600000,lanzamientoDisponible:true,cargando:false,trial:{waitlist:false,contactable:false},
 refrescar:async()=>{},registrarVista:async()=>{},iniciarPrueba:async()=>{started++},registrarInteres:async p=>{interest=p},registrarWaitlist:async()=>{waitlist++;return false}};
const react={useState:v=>{const i=cursor++;if(!(i in hooks))hooks[i]=v;return[hooks[i],n=>hooks[i]=typeof n==='function'?n(hooks[i]):n]},useRef:v=>{const i=cursor++;if(!(i in hooks))hooks[i]={current:v};return hooks[i]},useEffect:f=>f(),useCallback:f=>f};
const deps={react,'react/jsx-runtime':{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props}),Fragment:'Fragment'},'react-native':{View:'View'},'expo-router':{useFocusEffect:()=>{},useRouter:()=>({push(){}})},
 '../components/Controles':Object.fromEntries(['Acceso','Boton','Etiqueta','Pantalla','Tarjeta','Texto'].map(x=>[x,x])),
 '../lib/Preferencias':{usePreferencias:()=>({t:k=>k,mensajeError:()=>''})},'../lib/TemaContext':{useTema:()=>({tema:{acento:'#f0c',fondoTarjeta:'#111'}})},'../lib/PlusContext':{usePlus:()=>plus},'../lib/plus':{BENEFICIOS_PLUS:[]}};
const out={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/app/plus.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:out,require:n=>deps[n],setTimeout:()=>0,clearTimeout(){}});
function render(){cursor=0;return out.default()}
function nodes(tree){return !tree?[]:Array.isArray(tree)?tree.flatMap(nodes):typeof tree==='object'?[tree,...nodes(tree.props?.children)]:[]}
function button(tree,label){return nodes(tree).find(n=>n.type==='Boton'&&n.props.titulo===label)}
const text=tree=>JSON.stringify(tree);
(async()=>{
 let tree=render();assert.equal(started,0);assert.equal(button(tree,'Restaurar compras'),undefined);assert.equal(button(tree,'Ver planes de Blindly Plus'),undefined);
 button(tree,'PROBAR PLUS GRATIS · 3 DÍAS').props.onPress();tree=render();assert.equal(started,0,'First tap only asks confirmation');
 button(tree,'Ahora no').props.onPress();assert.equal(button(render(),'Empezar prueba'),undefined);assert.equal(started,0);
 button(render(),'PROBAR PLUS GRATIS · 3 DÍAS').props.onPress();button(render(),'Empezar prueba').props.onPress();await new Promise(r=>setImmediate(r));assert.equal(started,1);
 button(render(),'Quiero Plus').props.onPress();tree=render();const selected=nodes(tree).filter(n=>n.type==='Acceso');assert.equal(selected.length,3);assert.equal(selected.find(n=>n.props.activo).props.titulo,'Anual · Recomendado');
 button(tree,'Guardar interés').props.onPress();await new Promise(r=>setImmediate(r));assert.equal(interest,'annual');
 button(render(),'Anotarme a la lista de espera').props.onPress();await new Promise(r=>setImmediate(r));assert.equal(waitlist,1);assert.ok(text(render()).includes('Guardamos tu interés.'));assert.ok(!text(render()).includes('Te avisaremos cuando'));
 plus={...plus,tipoAcceso:'FOUNDER_TRIAL',activo:true,trialDisponible:false};tree=render();assert.ok(button(tree,'Explorar funciones Plus'));assert.equal(button(tree,'PROBAR PLUS GRATIS · 3 DÍAS'),undefined);
 plus={...plus,tipoAcceso:'FREE',activo:false,trial:{expired:true,waitlist:true,contactable:false}};tree=render();assert.ok(text(tree).includes('Tu Prueba Founder terminó.'));assert.ok(text(tree).includes('Tus datos se conservan.'));assert.equal(button(tree,'Ya estás en la lista de espera').props.disabled,true);assert.ok(button(tree,'Proteger mi cuenta'));
 console.log('Founder UI: confirmación opt-in, cancelar, tres estados, plan anual recomendado y espera sin prometer correo al invitado OK');
})().catch(e=>{console.error(e);process.exitCode=1});
