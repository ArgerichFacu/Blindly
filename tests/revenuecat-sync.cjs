const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const source=ts.transpileModule(fs.readFileSync('supabase/functions/sincronizar-plus/index.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function scenario(subscriber,status=200){let handler,stored,requests=0;const auth={auth:{getUser:async()=>({data:{user:{id:'verified-user'}},error:null})}},admin={from:()=>({upsert:async row=>{stored=row;return{error:null}}})};
 vm.runInNewContext(source,{exports:{},require:()=>({createClient:(_url,key)=>key==='service'?admin:auth}),Deno:{env:{get:k=>({SUPABASE_SERVICE_ROLE_KEY:'service',SUPABASE_ANON_KEY:'anon',REVENUECAT_SECRET_KEY:'server-secret'}[k])??'https://project'},serve:f=>handler=f},Response,Request,Date,console,fetch:async(url,options)=>{requests++;assert.ok(url.endsWith('/verified-user'));assert.equal(options.headers.Authorization,'Bearer server-secret');return new Response(JSON.stringify({subscriber}),{status})}});
 return{call:authorization=>handler(new Request('https://project/functions/v1/sincronizar-plus',{method:'POST',headers:authorization===false?{}:{Authorization:'Bearer verified-session'},body:JSON.stringify({user_id:'other-user',activo:true,tester:true})})),get stored(){return stored},get requests(){return requests}};
}
(async()=>{
 let s=scenario({entitlements:{}});assert.equal((await s.call(false)).status,401);assert.equal(s.requests,0);
 const exp='2099-01-01T00:00:00Z',purchase='2026-11-02T00:00:00Z';
 for(const sandbox of [true,false]){s=scenario({entitlements:{blindly_plus:{expires_date:exp,product_identifier:'monthly'}},subscriptions:{monthly:{is_sandbox:sandbox}}});assert.equal((await s.call()).status,200);assert.equal(s.stored.user_id,'verified-user');assert.equal(s.stored.activo,true);assert.equal(s.stored.entorno,sandbox?'sandbox':'production')}
 s=scenario({entitlements:{blindly_plus:{expires_date:null,product_identifier:'lifetime',purchase_date:purchase}},non_subscriptions:{lifetime:[{purchase_date:'2025-01-01',is_sandbox:false},{purchase_date:purchase,is_sandbox:true}]}});await s.call();assert.equal(s.stored.activo,true);assert.equal(s.stored.vence_en,null);assert.equal(s.stored.entorno,'sandbox');
 s=scenario({entitlements:{blindly_plus:{expires_date:'2000-01-01',product_identifier:'monthly'}},subscriptions:{monthly:{is_sandbox:true}}});await s.call();assert.equal(s.stored.activo,false);
 s=scenario({entitlements:{}});await s.call();assert.equal(s.stored.activo,false,'Body/permiso tester no otorgan Plus');assert.equal(s.stored.entorno,'unknown');
 s=scenario({},503);assert.equal((await s.call()).status,502);assert.equal(s.stored,undefined);
 console.log('Sync RevenueCat: UUID validado, body ignorado, sandbox/production por transacción, Lifetime null, expiración y sin entitlement no hay Plus OK');
})().catch(e=>{console.error(e);process.exitCode=1});
