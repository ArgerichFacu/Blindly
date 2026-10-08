const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const exportsModulo={},estados=[],refs=[];let cursor=0,refCursor=0,llamadas=0,resultadoGuardado,argumentos,finalizar,rechazar;
const jsx=(type,props)=>typeof type==='function'?type(props):({type,props});
const inicial={activos:false,pique:false,mvp:true,rivalidades:true,fechas:true,temporadas:true,recordatorios:true,limite_social:2,revision:0};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/PreferenciasAvisosClub.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:exportsModulo,require:name=>{
 if(name==='react')return {useState:initial=>{const i=cursor++;if(!(i in estados))estados[i]=initial;return [estados[i],v=>{estados[i]=typeof v==='function'?v(estados[i]):v;}];},useRef:initial=>refs[refCursor++]??(refs[refCursor-1]={current:initial})};
 if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};
 if(name==='react-native')return {View:'view',Switch:'switch'};
 if(name==='./Controles')return {Boton:'button',Tarjeta:'card',Texto:'text'};
 if(name.includes('Preferencias'))return {usePreferencias:()=>({t:s=>s,mensajeError:e=>e.message})};
 if(name.includes('TemaContext'))return {useTema:()=>({tema:{acento:'gold'}})};
 if(name.includes('avisosClub'))return {AVISOS_INICIALES:inicial};
 if(name.includes('pushNativo'))return {pushDisponible:false};
 if(name.includes('ligas'))return {guardarPreferenciasAvisos:(...args)=>{llamadas++;argumentos=args;return new Promise((res,rej)=>{finalizar=res;rechazar=rej;});}};
 throw Error(name);
}});
function nodos(n){if(!n)return [];if(Array.isArray(n))return n.flatMap(nodos);if(typeof n!=='object')return [n];return [n,...nodos(n.props?.children)];}
const props={liga:'club',preferencias:inicial,alGuardar:p=>resultadoGuardado=p,actualizar:()=>{}};
function render(p=props){cursor=refCursor=0;return nodos(exportsModulo.PreferenciasAvisosClub(p));}
const boton=(ui,nombre)=>ui.find(n=>n?.type==='button'&&n.props.titulo===nombre)?.props;
const interruptor=(ui,nombre)=>ui.find(n=>n?.type==='switch'&&n.props.accessibilityLabel===nombre)?.props;
(async()=>{
 let ui=render({...props,preferencias:undefined});assert.equal(boton(ui,'Guardar preferencias').disabled,true);
 ui=render();assert.equal(interruptor(ui,'Modo pique').value,false);assert.equal(interruptor(ui,'Recibir avisos del club').value,false);
 interruptor(ui,'Modo pique').onValueChange(true);ui=render();boton(ui,'1').onPress();ui=render();
 const guardar=boton(ui,'Guardar preferencias');guardar.onPress();guardar.onPress();assert.equal(llamadas,1);
 assert.equal(boton(render(),'Guardar preferencias').disabled,true);assert.equal(argumentos[0],'club');assert.equal(argumentos[1].pique,true);assert.equal(argumentos[1].limite_social,1);
 finalizar({...argumentos[1],revision:1});await new Promise(r=>setImmediate(r));
 ui=render();assert.ok(ui.includes('Preferencias del club guardadas.'));assert.equal(resultadoGuardado.revision,1);
 interruptor(ui,'Recibir avisos del club').onValueChange(true);ui=render();assert.ok(!ui.includes('Preferencias del club guardadas.'));
 boton(ui,'Guardar preferencias').onPress();rechazar(Error('AVISOS_CAMBIARON'));await new Promise(r=>setImmediate(r));
 ui=render();assert.ok(ui.includes('AVISOS_CAMBIARON'));assert.equal(interruptor(ui,'Recibir avisos del club').value,true,'Error conserva borrador');assert.equal(resultadoGuardado.activos,false,'No simula guardado');
 assert.ok(ui.includes('El envío push todavía no está habilitado en esta versión.'));
 console.log('Avisos UI: opt-in, opciones accesibles, guardado, doble toque, conflicto y borrador preservado OK');
})().catch(e=>{console.error(e);process.exitCode=1;});
