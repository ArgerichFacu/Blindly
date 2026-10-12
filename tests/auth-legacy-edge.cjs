const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const source=ts.transpileModule(fs.readFileSync('supabase/functions/confirmar-correo-interno/index.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function escenario(){
  const estado={user:{id:'A',email:'A@recovery.blindly.invalid',new_email:'new@example.com',is_anonymous:false,email_confirmed_at:'yes'},jwtError:null,generateError:null,verifyError:null,foreign:false,llamadas:[]};
  let handler;
  const client={auth:{getUser:async token=>{estado.llamadas.push(['jwt',token]);return {data:{user:estado.user},error:estado.jwtError}},verifyOtp:async args=>{estado.llamadas.push(['verify',args]);return {data:{user:null,session:null},error:estado.verifyError}}}};
  const admin={auth:{admin:{getUserById:async id=>{estado.llamadas.push(['get',id]);return {data:{user:estado.user},error:null}},generateLink:async args=>{estado.llamadas.push(['generate',args]);return {data:{user:{id:estado.foreign?'B':'A'},properties:{hashed_token:'OLD-INTERNAL-FACTOR',email_otp:'NEVER-RETURN'}},error:estado.generateError}}}}};
  vm.runInNewContext(source,{exports:{},require:()=>({createClient:(_url,key)=>key==='SERVICE'?admin:client}),Deno:{serve:fn=>handler=fn,env:{get:key=>key==='SUPABASE_SERVICE_ROLE_KEY'?'SERVICE':'ANON'}},Response,Request,JSON});
  const ejecutar=(email='new@example.com',authorization='Bearer JWT-A',method='POST')=>handler(new Request('https://project/functions/v1/confirmar-correo-interno',{method,headers:authorization?{Authorization:authorization}: {},...(method==='POST'?{body:JSON.stringify({email,user_id:'OTHER'})}:{})}));
  return {estado,ejecutar};
}
(async()=>{
  let s=escenario();assert.equal((await s.ejecutar('new@example.com',null)).status,401);assert.equal(s.estado.llamadas.length,0);
  s=escenario();assert.equal((await s.ejecutar('new@example.com','Bearer JWT','GET')).status,405);
  s=escenario();s.estado.jwtError=new Error('bad');assert.equal((await s.ejecutar()).status,401);assert.equal(s.estado.llamadas.length,1);
  for(const overrides of [{is_anonymous:true},{email_confirmed_at:null},{email:'real@example.com'},{new_email:'other@example.com'},{new_email:undefined}]){s=escenario();Object.assign(s.estado.user,overrides);const r=await s.ejecutar();assert.ok([401,409].includes(r.status));assert.ok(!s.estado.llamadas.some(x=>x[0]==='generate'))}
  s=escenario();assert.equal((await s.ejecutar('A@recovery.blindly.invalid')).status,400);assert.ok(!s.estado.llamadas.some(x=>x[0]==='generate'));
  s=escenario();s.estado.foreign=true;assert.equal((await s.ejecutar()).status,500);assert.ok(!s.estado.llamadas.some(x=>x[0]==='verify'));
  s=escenario();s.estado.verifyError=new Error('invalid');assert.equal((await s.ejecutar()).status,500);
  s=escenario();const response=await s.ejecutar();assert.equal(response.status,200);const body=await response.json();assert.deepEqual(body,{code:'OK'});assert.equal(s.estado.llamadas.find(x=>x[0]==='get')[1],'A','UUID del JWT, nunca del body');assert.deepEqual(JSON.parse(JSON.stringify(s.estado.llamadas.find(x=>x[0]==='generate')[1])),{type:'email_change_current',email:'A@recovery.blindly.invalid',newEmail:'new@example.com'});assert.deepEqual(JSON.parse(JSON.stringify(s.estado.llamadas.at(-1)[1])),{type:'email_change',token_hash:'OLD-INTERNAL-FACTOR'});assert.equal(s.estado.user.email,'A@recovery.blindly.invalid','No se confirma el nuevo correo ni se cambia password');
  s=escenario();s.estado.user.email='new@example.com';assert.equal((await s.ejecutar()).status,200);assert.ok(!s.estado.llamadas.some(x=>x[0]==='generate'),'Idempotencia no emite tokens');
  console.log('OK: factor legacy exclusivo, JWT/UUID, correo pendiente, fallos cerrados y ninguna credencial expuesta (Auth Admin simulado).');
})().catch(e=>{console.error(e);process.exitCode=1});

