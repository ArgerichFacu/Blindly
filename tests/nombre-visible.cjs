const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
let user = { id: 'same', is_anonymous: true, email: undefined, user_metadata: { full_name: 'Facundo Argerich', picture: 'photo', legacy: 'kept' } }, calls = 0, fail = false, pending;
const api = {};
const sb = { auth: {
  getSession: async () => ({ data: { session: { user } }, error: null }),
  updateUser: async attrs => { calls++; if (pending) await pending; if (fail) throw Error('offline'); user = { ...user, user_metadata: { ...user.user_metadata, ...attrs.data } }; return { data: { user }, error: null }; }
} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/nombreVisible.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:api, require:k=>k==='./supabase'?{supabase:sb}:{asegurarSesion:async()=>user}, Error});
(async()=>{
  for (const s of ['', '  ', '\u00a0', '\nFacu', 'Facu\t', 'x\u0085', 'x\u2028', 'x\u202e', '\ud800', 'x'.repeat(31)]) assert.throws(()=>api.validarNombreVisible(s), /NOMBRE_VISIBLE_INVALIDO/);
  assert.equal(api.validarNombreVisible('  Ñandú 7 🃏  '),'Ñandú 7 🃏');
  assert.equal(api.validarNombreVisible('🃏'.repeat(30)),'🃏'.repeat(30));
  assert.equal(api.nombreVisible(user),'Facundo Argerich');
  for (const kind of ['guest','email','google','legacy']) {
    user = { ...user, is_anonymous:kind==='guest', identities:[{provider:kind}], user_metadata:{...user.user_metadata,display_name:undefined} };
    const result=await api.guardarNombreVisible('  Facu  '); assert.equal(result.id,'same'); assert.equal(api.nombreVisible(user),'Facu');
    assert.equal(user.user_metadata.full_name,'Facundo Argerich');assert.equal(user.user_metadata.picture,'photo');assert.equal(user.user_metadata.legacy,'kept');
  }
  assert.equal(api.nombreVisible({user_metadata:{display_name:' ',full_name:'Ana'}}),'Ana');assert.equal(api.nombreVisible(null),'');assert.equal(api.inicialNombre('🃏 Ana'),'🃏');
  fail=true;await assert.rejects(()=>api.guardarNombreVisible('Offline'),/offline/);assert.equal(api.nombreVisible(user),'Facu');fail=false;
  let resolve;pending=new Promise(r=>resolve=r);const first=api.guardarNombreVisible('Nico');await assert.rejects(()=>api.guardarNombreVisible('Doble'),/AUTH_OCUPADO/);resolve();await first;pending=null;
  assert.equal(api.nombreVisible(user),'Nico');assert.equal(calls,6);
  await assert.rejects(()=>api.guardarNombreVisible('Cuenta equivocada','other'),/SESION_CAMBIO/);assert.equal(calls,6);
  console.log('Nombre visible: guest/email/Google/legacy, mismo UUID, metadata conservada, Unicode, límites, offline y doble toque OK');
})().catch(e=>{console.error(e);process.exitCode=1});
