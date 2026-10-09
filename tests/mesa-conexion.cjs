const assert = require("node:assert/strict"), fs = require("node:fs"), vm = require("node:vm"), ts = require("typescript");
function cargar(file, deps, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,
    {exports, require: id => {assert.ok(id in deps, id); return deps[id];}, console:{warn(){}}, Date, Math, Promise, AbortController, ...globals});
  return exports;
}
const tick = () => new Promise(r => setImmediate(r));
(async () => {
  let timeout, cleared = 0, signal, complete, fail, args;
  const salas = cargar("src/lib/salas.ts", {
    "./sesion":{}, "./identidad":{}, "./supabase": {supabase:{rpc:(name, params) => {
      assert.equal(name, "accion_mesa"); args = params;
      return {abortSignal:s => {signal=s; return new Promise((resolve,reject) => {complete=resolve;fail=reject;});}};
    }}}
  }, {setTimeout:(fn, ms) => {assert.equal(ms,15000); timeout=fn;return 1;}, clearTimeout:() => cleared++});
  const first = salas.ejecutarAccion("mesa", "apostar", {monto:50}, "original");
  timeout();
  await assert.rejects(first, /MESA_CONFIRMACION_TIMEOUT/);
  assert.equal(signal.aborted,true); assert.equal(cleared,1);
  // Incluso un transporte que ignora abort y devuelve tarde no confirma el intento vencido.
  complete({data:{revision:1},error:null}); await tick();
  const retry = salas.ejecutarAccion("mesa", "apostar", {monto:50}, "original");
  assert.equal(args.p_solicitud,"original");
  complete({data:{revision:1},error:null}); assert.equal((await retry).revision,1); assert.equal(cleared,2);
  const denied = salas.ejecutarAccion("mesa", "apostar", {}, "otro");
  fail({code:"P0001",message:"TURNO_AJENO"}); await assert.rejects(denied,e => e.code === "P0001"); assert.equal(cleared,3);

  const states=[], refs=[]; let cursor=0, refCursor=0, requests=[], resolveAction, rejectAction, saved=0, after=0;
  const hook=cargar("src/lib/useAccionMesa.ts", {
    react:{useState:v => {const i=cursor++;if(!(i in states))states[i]=v;return [states[i],value=>states[i]=value];},
      useRef:v => refs[refCursor++] ?? (refs[refCursor-1]={current:v})},
    "./Preferencias":{usePreferencias:()=>({t:s=>s,mensajeError:e=>e.message})},
    "./salas":{nuevaSolicitud:()=>"id-"+requests.length, ejecutarAccion:(...a)=>{requests.push(a);return new Promise((r,j)=>{resolveAction=r;rejectAction=j;});}}
  });
  const render=()=>{cursor=refCursor=0;return hook.useAccionMesa({id:"mesa"},()=>saved++,()=>new Promise(()=>{}));};
  let h=render(); h.ejecutar("apostar",{monto:50},()=>after++); h.ejecutar("apostar",{monto:50}); assert.equal(requests.length,1);
  rejectAction(new Error("MESA_CONFIRMACION_TIMEOUT")); await tick(); h=render();
  assert.equal(h.incierto,true); assert.equal(h.ocupado,true); assert.match(h.error,/Reintentar/);
  h.ejecutar("apostar",{monto:100}); assert.equal(requests.length,1,"No sustituye la apuesta incierta");
  await (h.reintentar(),tick()); assert.equal(requests.length,2); assert.deepEqual(requests[1],requests[0],"Reintenta exactamente la misma solicitud y monto");
  resolveAction({revision:1}); await tick(); h=render(); assert.equal(h.incierto,false); assert.equal(h.ocupado,false);
  assert.equal(saved,1); assert.equal(after,1,"Una recarga sin respuesta no bloquea la acción confirmada");
  h.ejecutar("apostar",{monto:100}); assert.equal(requests.length,3); assert.notEqual(requests[2][3],requests[1][3]);
  rejectAction({code:"P0001",message:"TURNO_AJENO"}); await tick();h=render();assert.equal(h.incierto,false);assert.equal(h.ocupado,false);
  console.log("Mesa: plazo de confirmación, respuesta tardía, aborto, reintento idempotente y recarga lenta aprobados.");
})().catch(e=>{console.error(e);process.exitCode=1;});
