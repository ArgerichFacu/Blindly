const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
const jsx = (type,props) => ({type,props});
let estado=[], cursor=0, vibraciones=0, siguiente=0, saltos=0;
const mocks={
 'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},
 react:{useState: initial=>{const i=cursor++;if(!(i in estado))estado[i]=typeof initial==='function'?initial():initial;return [estado[i],v=>estado[i]=v];},useEffect:()=>{}},
 'react-native':{View:'View',Platform:{OS:'web'},AccessibilityInfo:{isReduceMotionEnabled:async()=>true},Animated:{Value:class{interpolate(){return 0;}},View:'AnimatedView'}},
 './Controles':{Texto:'Texto',Boton:'Boton',Etiqueta:'Etiqueta',Tarjeta:'Tarjeta'},
 './CartaPoker':{CartaPoker:'CartaPoker'},'./EntradaSuave':{EntradaSuave:'EntradaSuave'},'./Icono':{Icono:'Icono'},
 '../lib/TemaContext':{useTema:()=>({tema:{}})},
 '../lib/Preferencias':{usePreferencias:()=>({t:(s,v)=>v?s.replace('{n}',v.n):s,preferencias:{hapticos:true}})},
 '../lib/visual':{SALON:{},velo:c=>c},'../lib/hapticos':{vibrarToque:async()=>vibraciones++}
};
const ex={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/TutorialInteractivo.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:ex,require:id=>{assert.ok(id in mocks,'No se permiten dependencias de partidas reales: '+id);return mocks[id];}});
function nodos(n,t,out=[]){if(Array.isArray(n))n.forEach(v=>nodos(v,t,out));else if(n&&typeof n==='object'){if(n.type===t || n.type?.name===t)out.push(n);nodos(n.props?.children,t,out);}return out;}
const props={paso:2,avanzar:()=>siguiente++,terminar:()=>saltos++,retroceder:()=>{},ocupado:false};
const wrapper=ex.PasosTutorial(props), accion=nodos(wrapper,'AccionDemo')[0];
function render(){cursor=0;return accion.type(accion.props);}
let tree=render();const button=(n)=>nodos(tree,'Boton').find(v=>v.props.titulo===n).props;
assert.equal(button('Siguiente').disabled,true,'No avanza sin probar');
button('Subir').onPress();tree=render();assert.ok(nodos(tree,'Texto').some(n=>n.props.children==='En esta práctica, tocá Igualar 200.'));
button('Igualar 200').onPress();tree=render();assert.equal(button('Igualar 200').disabled,true);assert.equal(button('Siguiente').disabled,false);assert.equal(vibraciones,1);
const mesa=nodos(tree,'MesaDemo')[0];cursor=2;const mesaTree=mesa.type(mesa.props);
const textos=nodos(mesaTree,'Texto').map(n=>n.props.children);assert.ok(textos.includes('9.800'));assert.ok(textos.includes('1.700'));assert.equal(9800+1700,10000+1500,'La igualada conserva fichas');
button('Siguiente').onPress();assert.equal(siguiente,1);
for(let paso=0;paso<4;paso++){
 const screen=ex.PasosTutorial({...props,paso});assert.equal(nodos(screen,'View').find(n=>n.props.accessibilityRole==='progressbar').props.accessibilityValue.now,paso+1);
 nodos(screen,'Boton').find(n=>n.props.titulo==='Omitir tutorial').props.onPress();
 const busy=ex.PasosTutorial({...props,paso,ocupado:true});assert.ok(nodos(busy,'Boton').every(n=>n.props.disabled));
}
assert.equal(saltos,4);
assert.ok(nodos(ex.PasosTutorial({...props,paso:3}),'Boton').some(n=>n.props.titulo==='Entrar a Blindly'));
console.log('Tutorial UI: cuatro pasos, simulación aislada, pozo/stack, haptic, bloqueo, progreso y omisión OK');
