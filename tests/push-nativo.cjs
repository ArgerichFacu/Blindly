const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
let llamadas=[],permission={granted:true},protegido=true;
function cargar(plataforma='android',habilitado='true'){
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/pushNativo.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,process:{env:{EXPO_PUBLIC_PUSH_READY:habilitado}},require:name=>{
  if(name==='react-native')return {Platform:{OS:plataforma}};
  if(name==='expo-device')return {isDevice:true};
  if(name==='expo-constants')return {__esModule:true,default:{expoConfig:{extra:{eas:{projectId:'project'}}}}};
  if(name==='./supabase')return {supabase:{rpc:async(n,p)=>{llamadas.push([n,p]);return {};},auth:{getSession:async()=>({data:{session:{user:{id:'uuid'}}}})}}};
  if(name==='./sesion')return {asegurarSesion:async()=>({id:'uuid'})};
  if(name==='./identidad')return {identidadUsuario:()=>({recuperable:protegido})};
  if(name==='expo-notifications')return {AndroidImportance:{DEFAULT:3},IosAuthorizationStatus:{PROVISIONAL:3},setNotificationChannelAsync:async()=>llamadas.push(['channel']),getPermissionsAsync:async()=>permission,requestPermissionsAsync:async()=>{llamadas.push(['permiso']);return permission;},getExpoPushTokenAsync:async()=>({data:'ExpoPushToken[abcdefghijklmnop]'})};
  throw Error(name);
 }});return exports;
}
(async()=>{
 for(const modulo of [cargar('web'),cargar('android','false')])await assert.rejects(modulo.activarPush('es'),/PUSH_NO_DISPONIBLE/);
 assert.equal(llamadas.length,0,'Web y builds no habilitados no inicializan permisos');
 const m=cargar();protegido=false;await assert.rejects(m.activarPush('es'),/CUENTA_REQUERIDA/);assert.equal(llamadas.length,0);protegido=true;
 permission={granted:false,canAskAgain:false};await assert.rejects(m.activarPush('es'),/PUSH_PERMISO_DENEGADO/);assert.ok(!llamadas.some(l=>l[0]==='permiso'));
 llamadas=[];await m.actualizarPushAutorizado('pt');assert.equal(llamadas.length,0,'Refresco nunca solicita permiso');
 permission={granted:true};await m.activarPush('pt');assert.equal(llamadas.find(l=>l[0]==='registrar_dispositivo_push')[1].p_idioma,'pt');
 console.log('Push nativo: Free protegido, permiso explícito, denegado, web, flag y refresco sin prompts OK');
})().catch(e=>{console.error(e);process.exitCode=1;});
