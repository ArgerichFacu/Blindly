const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const m={},llamadas=[];let id=null,resolver;
const compras={isConfigured:async()=>id!==null,setLogLevel:async()=>{},configure:o=>{id=o.appUserID;llamadas.push(id);},getAppUserID:async()=>id,logIn:async nuevo=>{id=nuevo;llamadas.push(id);},getCustomerInfo:()=>{const actual=id;return new Promise(r=>{resolver=()=>r({uuid:actual});});}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/plus.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:m,require:n=>n==='react-native'?{Platform:{OS:'android'}}:{__esModule:true,default:compras,LOG_LEVEL:{INFO:1}},process:{env:{EXPO_PUBLIC_PLUS_READY:'true',EXPO_PUBLIC_REVENUECAT_ANDROID_KEY:'goog_public_fixture'}},__DEV__:false,Date});
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
 const a=m.prepararCompras('uuid-a'),b=m.prepararCompras('uuid-b');await tick();resolver();assert.equal((await a).uuid,'uuid-a');await tick();resolver();assert.equal((await b).uuid,'uuid-b');assert.deepEqual(llamadas,['uuid-a','uuid-b']);
 console.log('Compras: consultas concurrentes de identidades diferentes serializadas, sin entitlement cruzado OK');
})().catch(e=>{console.error(e);process.exitCode=1;});
