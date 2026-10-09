const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const jsx=(type,props)=>({type,props});let indice=0;const estados=[],guardados=[];
const mocks={
 'react/jsx-runtime':{jsx,jsxs:jsx},react:{createElement:(type,props,...children)=>jsx(type,{...props,children}),useState:v=>{const i=indice++;if(!(i in estados))estados[i]=v;return [estados[i],v=>estados[i]=v];}},
 'react-native':{View:'View',Platform:{OS:'android'}},'@react-native-community/slider':{__esModule:true,default:'Slider'},
 './Controles':{Texto:'Texto'},'../lib/TemaContext':{useTema:()=>({tema:{}})},'../lib/Preferencias':{usePreferencias:()=>({t:k=>k})},
};const exportsTest={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/VolumenAudio.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:exportsTest,require:k=>{assert.ok(k in mocks,k);return mocks[k];}});
function render(atenuado=false,valor=.64){indice=0;return exportsTest.VolumenAudio({canal:'Música',valor,atenuado,guardar:v=>guardados.push(v)});}
function find(n,t,out=[]){if(Array.isArray(n))n.forEach(x=>find(x,t,out));else if(n&&typeof n==='object'){if(n.type===t)out.push(n.props);find(n.props?.children,t,out);}return out;}
let tree=render(true),slider=find(tree,'Slider')[0];assert.equal(slider.value,.64);assert.equal(slider.minimumValue,0);assert.equal(slider.maximumValue,1);assert.equal(slider.step,.01);
slider.onValueChange(.37);tree=render(true);assert.equal(find(tree,'Slider')[0].value,.37);assert.equal(guardados.length,0,'No persiste por cada frame del gesto');assert.ok(find(tree,'Texto').some(p=>p.children?.[0]===37),'Porcentaje continuo');
find(tree,'Slider')[0].onSlidingComplete(.37);assert.deepEqual(guardados,[.37]);
slider.onSlidingComplete(2);slider.onSlidingComplete(-1);assert.deepEqual(guardados,[.37,1,0]);assert.equal(render(true).props.style.opacity,.5);
assert.equal(find(render(false,.22),'Slider')[0].value,.22,'Sincroniza preferencias externas sin remontar');
assert.equal(find(render(false,.22),'Slider')[0].accessibilityValue.now,22);
mocks['react-native'].Platform.OS='web';estados.length=0;guardados.length=0;
let input=find(render(),'input')[0];assert.equal(input.type,'range');assert.equal(input.min,0);assert.equal(input.max,100);assert.equal(input.step,1);assert.equal(input.value,64);assert.equal(input['aria-valuetext'],'64%');
input.onChange({currentTarget:{valueAsNumber:37}});input=find(render(),'input')[0];assert.equal(input.value,37);assert.equal(input.style['--progreso'],'37%');assert.equal(guardados.length,0);
input.onKeyUp({key:'ArrowRight',currentTarget:{valueAsNumber:38}});assert.deepEqual(guardados,[.38]);
input.onKeyUp({key:'Tab',currentTarget:{valueAsNumber:38}});assert.equal(guardados.length,1);
input.onPointerUp({currentTarget:{valueAsNumber:42}});assert.deepEqual(guardados,[.38,.42]);
console.log('Audio sliders: gesto, teclado web, accesibilidad, sincronización externa y valor apagado OK');
