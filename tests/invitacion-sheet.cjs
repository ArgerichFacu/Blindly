// Ejecuta los handlers del sheet: un token, tres formas de compartir, sin Plus.
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
const codigo = '0123456789ABCDEF0123', enlace = `blindly://liga-unirse?codigo=${codigo}`;
const source = ts.transpileModule(fs.readFileSync('src/components/InvitacionClub.tsx', 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
let indice=0; const estados=[],refs=[],shares=[],copies=[],consultas=[];
const jsx=(type,props)=>({type,props});
const mocks={
 'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},
 react:{useState:v=>{const i=indice++;if(!(i in estados))estados[i]=v;return [estados[i],v=>estados[i]=typeof v==='function'?v(estados[i]):v];},useRef:v=>{const i=indice++;return refs[i]??={current:v};}},
 'react-native':{Alert:{alert:()=>{}},Modal:'Modal',Pressable:'Pressable',View:'View',ScrollView:'ScrollView',Share:{share:async v=>shares.push(v)}},
 'react-native-safe-area-context':{SafeAreaView:'SafeAreaView'},
 'expo-clipboard':{setStringAsync:async v=>copies.push(v)},
 'react-native-qrcode-svg':{__esModule:true,default:'QRCode'},
 './Controles':{Boton:'Boton',Texto:'Texto'}, './Icono':{Icono:'Icono'},
 '../lib/ligas':{obtenerInvitacionLiga:async(id,renovar)=>{consultas.push([id,renovar]);return {codigo,vence_en:'2026-12-01T00:00:00Z'};}},
 '../lib/invitaciones':{enlaceInvitacion:c=>`blindly://liga-unirse?codigo=${c}`},
 '../lib/TemaContext':{useTema:()=>({tema:{}})},
 '../lib/Preferencias':{usePreferencias:()=>({t:(k,p)=>p?Object.entries(p).reduce((s,[k,v])=>s.replace(`{${k}}`,v),k):k,mensajeError:e=>e.message,preferencias:{idioma:'es'}})},
};
const exportsTest={};vm.runInNewContext(source,{exports:exportsTest,require:k=>{assert.ok(k in mocks,k);return mocks[k];}});
function render(){indice=0;return exportsTest.InvitacionClub({ligaId:'club',nombre:'Los Pibes'});}
function all(n,t,out=[]){if(Array.isArray(n))n.forEach(x=>all(x,t,out));else if(n&&typeof n==='object'){if(n.type===t)out.push(n.props);all(n.props?.children,t,out);}return out;}
const button=title=>all(render(),'Boton').find(b=>b.titulo===title);
const flush=()=>new Promise(r=>setImmediate(r));
(async()=>{
 assert.equal(all(render(),'Modal')[0].visible,false);
 all(render(),'Pressable')[0].onPress();await flush();
 assert.equal(all(render(),'Modal')[0].visible,true);
 assert.deepEqual(consultas,[['club',false]]);
 button('Compartir invitación').onPress();await flush();assert.ok(shares[0].message.includes('Los Pibes'));assert.ok(shares[0].message.endsWith(enlace));
 button('Copiar enlace').onPress();await flush();assert.deepEqual(copies,[enlace]);assert.ok(button('Enlace copiado'));
 button('Mostrar QR').onPress();assert.equal(all(render(),'QRCode')[0].value,enlace);
 all(render(),'Modal')[0].onRequestClose();assert.equal(all(render(),'Modal')[0].visible,false);
 console.log('Invitación sheet: Free, share/copy/QR con un mismo token, confirmación y cierre OK');
})().catch(e=>{console.error(e);process.exitCode=1;});
