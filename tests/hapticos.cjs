const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
let llamadas=[],falla=false,estado='active';
function cargar(os='android') {const m={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/hapticos.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:m,require:id=>{
 if(id==='react-native')return{Platform:{OS:os},AppState:{get currentState(){return estado;}}};
 if(id==='expo-haptics')return{AndroidHaptics:{Long_Press:'heavy',Confirm:'success',Keyboard_Tap:'tap'},ImpactFeedbackStyle:{Heavy:'heavy',Light:'light'},NotificationFeedbackType:{Success:'success'},performAndroidHapticsAsync:async x=>{llamadas.push(['android',x]);if(falla)throw Error('disabled');},impactAsync:async x=>llamadas.push(['ios',x]),notificationAsync:async x=>llamadas.push(['ios',x])};
 throw Error(id);
}});return m;}
(async()=>{
 const h=cargar();await h.vibrarMomento('allin',false,'disabled');estado='background';await h.vibrarMomento('allin',true,'background');estado='active';await cargar('web').vibrarMomento('allin',true,'web');assert.equal(llamadas.length,0);
 await Promise.all([h.vibrarMomento('allin',true,'turno1'),h.vibrarMomento('allin',true,'turno1')]);assert.deepEqual(llamadas,[['android','heavy']]);
 await h.vibrarMomento('fecha',true,'fecha1');assert.deepEqual(llamadas.at(-1),['android','success']);
 await cargar('ios').vibrarMomento('campeon',true,'season1');assert.deepEqual(llamadas.at(-1),['ios','success']);
 falla=true;await h.vibrarMomento('mvp',true,'mvp1');assert.equal(llamadas.length,4,'Fallo nativo no rompe acción');
 falla=false;llamadas=[];await h.vibrarToque(false);estado='background';await h.vibrarToque(true);estado='active';await cargar('web').vibrarToque(true);assert.equal(llamadas.length,0);await h.vibrarToque(true);await cargar('ios').vibrarToque(true);assert.deepEqual(llamadas,[['android','tap'],['ios','light']]);
 console.log('Haptics: opcional, segundo plano, web, deduplicación y motor ausente OK');
})().catch(e=>{console.error(e);process.exitCode=1;});
