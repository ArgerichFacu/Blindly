const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),mod={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/avisosClub.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:mod});
const {AVISOS_INICIALES:p,permiteAviso}=mod;
for(const tipo of ['mvp','rivalidades','fechas','temporadas','recordatorios'])assert.equal(permiteAviso(p,tipo,0),false,'No envío sin consentimiento');
const activo={...p,activos:true};
for(const n of [0,1])assert.equal(permiteAviso(activo,'rivalidades',n),true);
for(const n of [2,3,-1,NaN,Infinity,0.5])assert.equal(permiteAviso(activo,'rivalidades',n),false);
for(const tipo of ['rivalidades','recordatorios'])assert.equal(permiteAviso({...activo,limite_social:0},tipo,0),false);
assert.equal(permiteAviso({...activo,limite_social:1},'rivalidades',1),false);
for(const tipo of ['mvp','fechas','temporadas']){
 assert.equal(permiteAviso({...activo,limite_social:0},tipo,100),true,'Evento real no consume cupo social');
 assert.equal(permiteAviso({...activo,[tipo]:false},tipo,0),false,'También respeta el interruptor');
}
console.log('Avisos: consentimiento, interruptores y cupo social combinado OK');
