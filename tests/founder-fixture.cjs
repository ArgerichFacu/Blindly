const fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
const estado = (patch = {}) => ({ server_now: new Date().toISOString(), eligible: true, started_at: null, expires_at: null,
  used: false, active: false, expired: false, founder_trial_enabled: true, real_payments_enabled: false,
  access_source: 'FREE', paid_expires_at: null, contactable: false, interest_plan: null, waitlist: false, ...patch });
function helper(rpc, clock = performance) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/founderPlus.ts','utf8'), { compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText,
    {exports, Date, performance: clock, require: () => ({supabase: {rpc}})});
  return exports;
}
module.exports = {estado, helper};
