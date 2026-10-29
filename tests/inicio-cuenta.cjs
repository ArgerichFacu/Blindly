// Handlers reales de Cuenta, Auth controlado. Complementa auth-convencional.cjs.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const compile=path=>ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const source=compile('src/app/cuenta.tsx'),identidad={};vm.runInNewContext(compile('src/lib/identidad.ts'),{exports:identidad});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function escenario(params={inicio:'1'}) {
  let indice=0,foco,user={id:'uuid-A',is_anonymous:true,user_metadata:{}},persistir=true;
  const estados=[],refs=[],efectos=[],montajes=[],listeners=[],llamadas=[];
  const jsx=(type,props)=>({type,props});
  const controls=Object.fromEntries(['Pantalla','Texto','Tarjeta','Campo','Boton','Etiqueta'].map(n=>[n,n]));
  const inicio={ocupado:false,elegir:async valor=>{llamadas.push(['elegir',valor]);return persistir}};
  const authApi={
    validarPassword:(p,c)=>{if(p.length<8||p!==c)throw new Error('password')},leerPendiente:async()=>null,
    registrarEmail:async(email,nombre,ctx)=>{llamadas.push(['registrar',email,nombre,ctx]);user={...user,new_email:email};for(const cb of listeners)cb('USER_UPDATED',{user});return {usuario:user.id,email}},
    confirmarEmailPassword:async(email,...args)=>{llamadas.push(['verificar',email,...args]);user={...user,is_anonymous:false,email,email_confirmed_at:'yes'};return user},
    entrarEmail:async(email,pwd)=>{llamadas.push(['login',email,pwd]);user={id:'uuid-B',is_anonymous:false,email,user_metadata:{display_name:'Reviewer'}};return user},
    continuarGoogle:async(link,ctx)=>{llamadas.push(['google',link,ctx]);return null},
    solicitarReset:async(email,ctx)=>llamadas.push(['reset',email,ctx]),guardarPassword:async()=>user,
    cerrarSesion:async()=>{llamadas.push(['logout']);user={id:'new-guest',is_anonymous:true};return user},
  };
  const mocks={
    'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},
    react:{useState:initial=>{const i=indice++;if(!(i in estados))estados[i]=initial;return [estados[i],v=>estados[i]=typeof v==='function'?v(estados[i]):v]},useRef:initial=>refs[indice++]??= {current:initial},useCallback:fn=>fn,useMemo:fn=>fn(),useEffect:(fn,deps)=>{const i=indice++;if(!efectos[i]){efectos[i]=deps;montajes.push(fn)}}},
    'react-native':{View:'View'},
    'expo-router':{useFocusEffect:fn=>{foco=fn},useLocalSearchParams:()=>params,useRouter:()=>({push:route=>llamadas.push(['push',route]),dismissAll:()=>llamadas.push(['dismissAll']),replace:route=>llamadas.push(['replace',route]),dismissTo:route=>llamadas.push(['dismissTo',route])})},
    '../components/Controles':controls,'../components/LogoBlindly':{LogoBlindly:'Logo'},
    '../lib/Preferencias':{usePreferencias:()=>({t:key=>key,mensajeError:()=> 'error localizado'})},
    '../lib/PlusContext':{usePlus:()=>({activo:false,refrescar:async()=>{},gestionable:false})},
    '../lib/InicioContext':{useInicio:()=>inicio},'../lib/identidad':identidad,
    '../lib/supabase':{supabase:{auth:{onAuthStateChange:cb=>{listeners.push(cb);return {data:{subscription:{unsubscribe(){}}}}}}}},
    '../lib/autenticacion':authApi,
    '../lib/nombreVisible':{nombreVisible:u=>u?.user_metadata?.display_name??u?.user_metadata?.full_name??''},
    '../lib/sesion':{asegurarSesion:async()=>user,cuentaConClave:u=>!!u?.email?.endsWith('@recovery.blindly.invalid'),crearClaveRecuperacion:async mostrar=>{user={id:'uuid-A',is_anonymous:false,email:'uuid-A@recovery.blindly.invalid'};mostrar('KEY-TEST');return {usuario:user,clave:'KEY-TEST'}},recuperarConClave:async()=>user={id:'uuid-legacy',is_anonymous:false,email:'uuid-legacy@recovery.blindly.invalid'},eliminarCuenta:async()=>llamadas.push(['delete'])},
  };
  const api={};vm.runInNewContext(source,{exports:api,require:name=>{assert.ok(mocks[name],`Import ${name}`);return mocks[name]}});
  const render=()=>{indice=0;return api.default()};
  function elementos(nodo,tipo,out=[]){if(Array.isArray(nodo))nodo.forEach(n=>elementos(n,tipo,out));else if(nodo&&typeof nodo==='object'){if(nodo.type===tipo)out.push(nodo.props);elementos(nodo.props?.children,tipo,out)}return out}
  const botones=()=>elementos(render(),'Boton'),campo=nombre=>elementos(render(),'Campo').find(c=>c.etiqueta===nombre);
  return {llamadas,authApi,render,elementos,botones,campo,emit:(e,s)=>listeners.forEach(fn=>fn(e,s)),cargar:async()=>{render();montajes.splice(0).forEach(fn=>fn());foco();await flush()},click:async titulo=>{const b=botones().find(b=>b.titulo===titulo);assert.ok(b,`Botón ${titulo}`);b.onPress();await flush()},set persistir(v){persistir=v},set user(v){user=v}};
}
(async()=>{
  const invitado=escenario();await invitado.cargar();assert.ok(invitado.botones().some(b=>b.titulo==='Continuar con Google'));assert.ok(!invitado.elementos(invitado.render(),'Texto').some(t=>t.children==='uuid-A'),'UUID técnico fuera de acceso principal');
  invitado.persistir=false;await invitado.click('Jugar como invitado');assert.equal(invitado.llamadas.at(-1)[0],'elegir');invitado.persistir=true;await invitado.click('Jugar como invitado');assert.deepEqual(invitado.llamadas.at(-1),['dismissTo','/']);
  const registro=escenario();await registro.cargar();await registro.click('Crear cuenta');registro.campo('Nombre').onChangeText('Nico');registro.campo('Email').onChangeText('nico@example.com');registro.campo('Contraseña').onChangeText('password-A');registro.campo('Confirmar contraseña').onChangeText('password-A');assert.equal(registro.campo('Email').autoCapitalize,'none');assert.equal(registro.campo('Contraseña').secureTextEntry,true);await registro.click('Crear cuenta');assert.equal(registro.campo('Contraseña').value,'password-A','USER_UPDATED mismo UUID conserva password hasta verificar');assert.equal(registro.campo('Código de verificación').maxLength,8);registro.campo('Código de verificación').onChangeText('12345678');await registro.click('Verificar y guardar contraseña');assert.equal(registro.llamadas[0][0],'registrar');assert.equal(registro.llamadas[1][0],'verificar');assert.ok(!registro.llamadas.some(x=>x[0]==='replace'));await registro.click('Continuar con esta cuenta');assert.deepEqual(registro.llamadas.slice(-2),[['elegir','cuenta'],['dismissTo','/']]);
  const legacy=escenario();await legacy.cargar();await legacy.click('Opciones avanzadas · clave de recuperación');assert.equal(legacy.campo('Clave de recuperación').secureTextEntry,true);legacy.campo('Clave de recuperación').onChangeText('KEY');await legacy.click('Recuperar mi cuenta');await legacy.click('Continuar con esta cuenta');assert.deepEqual(legacy.llamadas.slice(-2),[['elegir','cuenta'],['dismissTo','/']]);
  const clave=escenario({inicio:'0'});await clave.cargar();await clave.click('Opciones avanzadas · clave de recuperación');await clave.click('Crear una clave nueva');assert.ok(clave.elementos(clave.render(),'Texto').some(t=>t.children==='KEY-TEST'));assert.equal(clave.llamadas.length,0);
  for(const volver of ['ligas','puntuacion','plus','head-to-head','liga-nueva','unirse','liga','liga-unirse']){const params={inicio:'0',volver,liga:'club',codigo:volver==='liga-unirse'?'0123456789ABCDEF0123':'ABCDE',nombre:'Nico',seccion:'ranking',temporada:'season'};const c=escenario(params);await c.cargar();c.campo('Email').onChangeText('a@example.com');c.campo('Contraseña').onChangeText('password');await c.click('Iniciar sesión');await c.click('Continuar con esta cuenta');const route=c.llamadas.at(-1)[1];if(['liga','unirse','liga-unirse'].includes(volver)){assert.equal(route.pathname,`/${volver}`);if(volver==='liga'){assert.equal(route.params.id,'club');assert.equal(route.params.temporada,'season')}else assert.equal(route.params.codigo,params.codigo)}else assert.equal(route,`/${volver}`)}
  const doble=escenario();await doble.cargar();doble.campo('Email').onChangeText('a@example.com');doble.campo('Contraseña').onChangeText('password');let finish,count=0;doble.authApi.entrarEmail=()=>{count++;return new Promise(resolve=>finish=()=>resolve({id:'uuid-B',is_anonymous:false}))};const b=doble.botones().find(b=>b.titulo==='Iniciar sesión');b.onPress();b.onPress();assert.equal(count,1);finish();await flush();
  const google=escenario({inicio:'1',accion:'google'});const cargaGoogle=google.cargar();google.emit('INITIAL_SESSION',{user:{id:'uuid-A',is_anonymous:true}});await cargaGoogle;assert.equal(google.llamadas.length,1);assert.equal(google.llamadas[0][0],'google');assert.equal(google.llamadas[0][1],true);assert.equal(google.llamadas[0][2].inicio,'1');await google.cargar();assert.equal(google.llamadas.length,1,'Foco no repite Google automáticamente');
  console.log('OK: acceso convencional, invitado, registro/verificación, legacy avanzado, contexto, tutorial y doble toque en UI.');
  const logout=escenario({inicio:'0'});await logout.cargar();logout.campo('Email').onChangeText('reviewer@example.com');logout.campo('Contraseña').onChangeText('testpassword');await logout.click('Iniciar sesión');
  logout.authApi.cerrarSesion=async()=>{logout.emit('SIGNED_OUT',null);logout.user=null;return null};await logout.click('Cerrar sesión');
  assert.equal(logout.campo('Email').value,'');assert.equal(logout.campo('Contraseña').value,'');assert.ok(logout.botones().some(b=>b.titulo==='Iniciar sesión'));assert.deepEqual(logout.llamadas.slice(-2),[['dismissAll'],['replace','/cuenta']]);
  logout.user={id:'guest-new',is_anonymous:true};await logout.click('Jugar como invitado');assert.equal(logout.llamadas.at(-1)[0],'replace');
  console.log('Logout UI: SIGNED_OUT sin invitado, credenciales vacías, navegación limpia y acceso/invitado recuperable OK');
})().catch(e=>{console.error(e);process.exitCode=1});
