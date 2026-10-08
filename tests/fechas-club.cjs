const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
process.env.TZ='America/Argentina/Buenos_Aires';
const exportsModulo={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/fechasClub.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:exportsModulo,Date});
const {instanteFecha}=exportsModulo;
assert.equal(instanteFecha('10/10/2026','22:00'),'2026-10-11T01:00:00.000Z','UTC respeta hora local');
assert.ok(instanteFecha('29/02/2028','00:00'));
for(const [d,h] of [['29/02/2027','22:00'],['31/04/2026','22:00'],['00/10/2026','22:00'],['10/13/2026','22:00'],['10/10/2026','24:00'],['10/10/2026','12:60'],['2026-10-10','22:00'],['10/10/2026','abc']])assert.equal(instanteFecha(d,h),null);
console.log('Fechas club: zona horaria local/UTC, bisiestos y entradas inválidas OK');
