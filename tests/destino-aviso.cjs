const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),mod={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/destinoAviso.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:mod});
const id='80000000-0000-4000-8000-000000000001';
for(const seccion of ['ranking','fecha','rivalidades']){
 const destino=mod.destinoAviso({liga:id,temporada:id,seccion,url:'https://evil.test'});assert.equal(destino.pathname,'/liga');assert.equal(destino.params.seccion,seccion);assert.equal(destino.params.temporada,id);
}
for(const p of [null,[],{}, {liga:'wrong',seccion:'ranking'},{liga:id,seccion:'../cuenta'},{liga:id,seccion:'ranking',temporada:'bad'}])assert.equal(mod.destinoAviso(p),null);
assert.equal(mod.seccionClub(['ranking']),null);
console.log('Avisos navegación: rutas permitidas, UUID, temporada y URLs ajenas ignoradas OK');
