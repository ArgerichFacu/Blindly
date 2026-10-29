const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
async function check(os){
 let ready=false,hydrated=false,hidden=0,prevented=0,background=[];
 const api={},jsx=(type,props)=>({type,props}),theme={fondo:'#301B23',fondoTarjeta:'#301B23'};
 const deps={react:{useState:()=>[ready,v=>ready=v],useCallback:f=>f,useEffect:f=>f()},'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},'react-native':{Platform:{OS:os},View:'View'},'expo-router':{Stack:'Stack',ThemeProvider:'ThemeProvider',DarkTheme:{colors:{}}},'expo-system-ui':{setBackgroundColorAsync:async c=>background.push(c)},'expo-status-bar':{StatusBar:'StatusBar'},'expo-splash-screen':{preventAutoHideAsync:async()=>prevented++,hideAsync:async()=>hidden++}};
 for(const [file,name]of [['../components/SesionNativa','SesionNativa'],['../lib/TemaContext','TemaProvider'],['../lib/Preferencias','PreferenciasProvider'],['../components/PantallaCarga','PantallaCarga'],['../lib/PlusContext','PlusProvider'],['../lib/InicioContext','InicioProvider'],['../components/AvisosNativos','AvisosNativos']])deps[file]={[name]:name};
 deps['../lib/TemaContext'].useTema=()=>({tema:theme,listo:hydrated});deps['../lib/Preferencias'].usePreferencias=()=>({listo:hydrated});
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/app/_layout.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:api,require:k=>{assert.ok(deps[k],k);return deps[k]}});
 function find(n,t){if(Array.isArray(n))return n.map(v=>find(v,t)).find(Boolean);return n&&typeof n==='object'?(n.type===t?n.props:find(n.props?.children,t)):null;}
 assert.ok(!find(api.ContenidoApp(),'Stack'));assert.ok(!find(api.ContenidoApp(),'PantallaCarga'),'No default-theme frame before storage');assert.equal(hidden,0);
 hydrated=true;find(api.ContenidoApp(),'PantallaCarga').onLoadEnd();const stack=find(api.ContenidoApp(),'Stack');assert.equal(stack.screenOptions.contentStyle.backgroundColor,theme.fondo);await new Promise(r=>setImmediate(r));
 assert.equal(hidden,os==='web'?0:1);assert.equal(prevented,os==='web'?0:1);assert.ok(os==='web'||background.every(c=>c===theme.fondo));
}
(async()=>{for(const os of ['android','ios','web'])await check(os);console.log('Splash: espera hidratación, primer fondo correcto, stack/ventana coherentes y exclusión web OK')})().catch(e=>{console.error(e);process.exitCode=1});
