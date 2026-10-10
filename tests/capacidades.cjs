const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function cargar(file,deps={}) {const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require:id=>{if(!(id in deps))throw Error(id);return deps[id];},Date,process:{env:{}},__DEV__:false});return exports;}
const {capacidadesPlus}=cargar('src/lib/capacidadesPlus.ts');
for(const estado of [{activo:false},{activo:true,cargando:true},{activo:true,error:Error('offline')},{activo:undefined}])
  assert.ok(Object.values(capacidadesPlus(estado)).every(v=>v===false),'Incierto no concede capacidades');
assert.ok(Object.values(capacidadesPlus({activo:true,cargando:false,error:null})).every(Boolean));
const {tieneEntitlementPlus}=cargar('src/lib/plus.ts',{'react-native':{Platform:{OS:'web'}},'react-native-purchases':{},'./identidad':cargar('src/lib/identidad.ts')});
const info=(isActive,expirationDate)=>({entitlements:{active:{blindly_plus:{isActive,expirationDate}}}});
assert.equal(tieneEntitlementPlus(info(true,null)),true);
assert.equal(tieneEntitlementPlus(info(true,new Date(Date.now()+60000).toISOString())),true);
for(const r of [null,info(false,null),info(true,'malformed'),info(true,new Date(Date.now()-1).toISOString())])assert.equal(tieneEntitlementPlus(r),false);
const identidad=cargar('src/lib/identidadClub.ts');
assert.equal(identidad.identidadClubSegura({version:1,color:'__proto__',emblema:'picas',banner:'liso'}).color,'oro');
const segura={version:1,color:'zafiro',emblema:'corazones',banner:'rayas'};
assert.equal(identidad.identidadClubSegura(segura),segura);
const {ganadoresRecap}=cargar('src/lib/recap.ts',{'./sesion':{},'./supabase':{}});
assert.equal(ganadoresRecap({resultados:[{nombre:'Facu',puesto:1},{nombre:'Facu',puesto:1},{nombre:'Paz',puesto:3}]}).length,2,'Empate conserva ganadores con mismo nombre');
console.log('Capacidades: loading/offline/expiración/restauración, identidad inválida y empates recap OK');
