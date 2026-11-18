// Arma rebranding/marca.html: lámina de revisión de la identidad (logo, ícono, temas, tipografía, palos).
// Lee los SVG y tokens de assets/brand. Uso: node scripts/brand/pagina-revision.cjs
const fs = require("node:fs");
const path = require("node:path");

const RAIZ = path.join(__dirname, "..", "..");
const A = (f) => fs.readFileSync(path.join(RAIZ, "assets", "brand", f), "utf8").trim();
const { temas, fichas } = JSON.parse(A("tokens.json"));
const sinTam = (s) => s.replace(/ width="[\d.]+" height="[\d.]+"/, "");

const wordmark = sinTam(A("blindly-wordmark.svg"));
const wordmarkTinta = sinTam(A("blindly-wordmark-tinta.svg"));
const simbolo = sinTam(A("blindly-simbolo.svg"));
const icono = sinTam(A("blindly-icono-512.svg"));
const fg = sinTam(A("blindly-adaptive-foreground.svg"));
const mono = sinTam(A("blindly-adaptive-monocromo.svg"));
const palos = sinTam(A("palos.svg"));

const fmt = (n) => n.toLocaleString("es-AR");
function pantalla(t) {
  const filas = [["Nico", "Host", 5200], ["Juli", "", 4975, true], ["Tomi", "", 3100], ["Flor", "", 2450]];
  return `<div class="ph" style="--f:${t.fondo};--s:${t.superficie};--b:${t.borde};--bc:${t.bordeControl};--t:${t.texto};--t2:${t.textoSecundario};--ac:${t.acento};--am:${t.acentoMesa};--ap:${t.accionPrimaria};--ta:${t.textoAccion};--m:${t.mesa}">
  <div class="top"><span>Sala 5KECN</span><span>6 jugadores</span></div>
  <div class="mesa"><div class="lvl">Nivel 4 <span>de 12</span></div><div class="time">12:45</div>
  <div class="bar">${Array.from({ length: 12 }, (_, i) => `<i class="${i < 3 ? "on" : i === 3 ? "now" : ""}"></i>`).join("")}</div></div>
  <div class="nums"><div><small>Ciegas</small><b>100 / 200</b></div><div><small>Sigue</small><b>150 / 300</b></div><div><small>Pozo</small><b>${fmt(1850)}</b></div></div>
  <div class="rows">${filas.map(([n, r, s, turno]) => `<div class="row"><span class="nm">${n}${r ? ` <em>${r}</em>` : ""}</span>${turno ? `<span class="turn">En turno</span>` : "<span></span>"}<b>${fmt(s)}</b></div>`).join("")}</div>
  <div class="act"><button class="p">Pausar</button><button>Cerrar mano</button></div>
</div>`;
}
const sw = (t) => ["fondo", "superficie", "superficieElevada", "bordeControl", "texto", "textoSecundario", "acento", "mesa"]
  .map((k) => `<span><i style="background:${t[k]}"></i>${k} <code>${t[k]}</code></span>`).join("");

const html = `<title>Blindly: identidad Marcador</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700&display=swap">
<style>
/* Layout: lámina de revisión en una columna; cada bloque es una pieza del sistema. Colores de la página = marca Blindly. */
:root { --bg:#0E1512; --panel:#17211C; --fg:#F2F0E8; --muted:#A3B0A8; --line:#2A3A32; --ac:#5BD08A; --paper:#F2F0E8; --ink:#0E1512;
  --num:"Barlow Condensed","Arial Narrow",sans-serif; --txt:"Barlow",system-ui,sans-serif; color-scheme:dark }
* { box-sizing:border-box }
body { background:var(--bg); color:var(--fg); font-family:var(--txt); font-size:16px; line-height:1.5;
  padding-left:max(16px,env(safe-area-inset-left,0px)); padding-right:max(16px,env(safe-area-inset-right,0px)); padding-block:28px 64px }
.w { max-width:1080px; margin:0 auto; display:flex; flex-direction:column; gap:48px }
h1 { font:700 clamp(30px,5vw,44px)/1.05 var(--num); margin:0 }
h2 { font:700 28px/1.1 var(--num); margin:0 0 16px }
p { margin:0; max-width:66ch } .m { color:var(--muted) }
code { font-family:ui-monospace,Consolas,monospace; font-size:12px; color:var(--muted) }
section { border-top:1px solid var(--line); padding-top:24px }
.g { display:grid; gap:16px; grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr)) }
.cell { background:var(--panel); border-radius:12px; padding:20px; display:flex; flex-direction:column; gap:12px; min-width:0 }
.cell.claro { background:var(--paper); color:var(--ink) }
.cell small { font-size:13px; color:var(--muted) } .cell.claro small { color:#4A524D }
.wm svg { width:100%; height:auto; max-width:420px; display:block }
.sizes { display:flex; align-items:flex-end; gap:20px; flex-wrap:wrap }
.sizes svg { display:block; height:auto }
.ic { display:flex; gap:18px; flex-wrap:wrap; align-items:center }
.ic .mask { width:96px; height:96px; overflow:hidden; background:${temas.verde.fondo}; flex:none }
.ic .mask svg { width:100%; height:100%; display:block }
.ic .wall { background:#D9DDE3; border-radius:12px; padding:14px; display:flex; gap:14px }
.ic .wall .mask { background:#3C4A57 }
.splash { width:180px; height:360px; border-radius:22px; border:6px solid #050606; background:${temas.verde.fondo}; display:grid; place-items:center }
.splash svg { width:120px; height:auto }
.temas { display:grid; gap:24px; grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr)) }
.tema { display:flex; flex-direction:column; gap:12px; min-width:0 }
.tema h3 { margin:0; font:700 20px var(--num); display:flex; gap:8px; align-items:center }
.lock { font:600 12px var(--txt); border:1px solid var(--line); border-radius:999px; padding:2px 8px; color:var(--muted) }
.sw { display:flex; flex-direction:column; gap:4px; font-size:13px }
.sw span { display:flex; gap:8px; align-items:center } .sw i { width:16px; height:16px; border-radius:4px; display:block; border:1px solid #ffffff22; flex:none }
.ph { background:var(--f); color:var(--t); border-radius:24px; border:6px solid #050606; padding:14px; display:flex; flex-direction:column; gap:10px; font-variant-numeric:tabular-nums; max-width:300px }
.ph .top { display:flex; justify-content:space-between; font-size:12px; color:var(--t2) }
.ph .mesa { background:var(--m); border-radius:12px; padding:12px 14px 14px }
.ph .lvl { font:600 18px/1 var(--num); display:flex; justify-content:space-between } .ph .lvl span { font:500 13px var(--txt); opacity:.85 }
.ph .time { font:700 92px/0.95 var(--num); margin:4px 0 8px -2px }
.ph .bar { display:grid; grid-template-columns:repeat(12,1fr); gap:3px } .ph .bar i { height:5px; background:#0000002e; border-radius:1px } .ph .bar i.on { background:var(--t) } .ph .bar i.now { background:var(--am) }
.ph .nums { display:grid; grid-template-columns:1.2fr 1.2fr 1fr; border-top:1px solid var(--b); border-bottom:1px solid var(--b) }
.ph .nums div { padding:8px 0; display:flex; flex-direction:column } .ph .nums div+div { border-left:1px solid var(--b); padding-left:10px }
.ph .nums small { font-size:11px; color:var(--t2) } .ph .nums b { font:600 21px/1.1 var(--num) }
.ph .row { display:grid; grid-template-columns:1fr auto auto; gap:8px; align-items:center; padding:8px 0; border-bottom:1px solid var(--b); font-size:15px }
.ph .row b { font:600 20px/1 var(--num) } .ph .nm em { font-style:normal; font-size:11px; color:var(--t2); border:1px solid var(--bc); border-radius:4px; padding:0 5px; margin-left:4px }
.ph .turn { font-size:11px; font-weight:600; background:var(--ac); color:var(--f); border-radius:999px; padding:2px 8px }
.ph .act { display:grid; grid-template-columns:1fr 1fr; gap:8px }
.ph button { font:600 15px var(--txt); height:48px; border-radius:8px; background:transparent; color:var(--t); border:1.5px solid var(--bc) }
.ph button.p { background:var(--ap); color:var(--ta); border-color:var(--ap) }
.type { display:flex; flex-direction:column; gap:10px }
.type div { display:grid; grid-template-columns:160px minmax(0,1fr); gap:16px; align-items:baseline; border-bottom:1px solid var(--line); padding-bottom:8px }
.type small { color:var(--muted); font-size:13px }
.fichas { display:flex; flex-wrap:wrap; gap:14px }
.ficha { width:64px; height:64px; border-radius:50%; display:grid; place-items:center; font:700 20px var(--num); border:4px dashed #ffffffaa; outline:2px solid #00000033 }
.palos svg { width:240px; height:auto; display:block }
table { border-collapse:collapse; width:100%; font-size:14px } th,td { text-align:left; padding:8px 10px; border-bottom:1px solid var(--line); vertical-align:top } th { color:var(--muted); font-weight:500 }
.tw { overflow-x:auto }
</style>
<div class="w">
  <header style="display:flex;flex-direction:column;gap:12px">
    <h1>Identidad Marcador</h1>
    <p class="m">Fase 2 del rebranding de Blindly: logo, ícono, colores de los 4 temas, tipografía, palos y tono. Todavía no está aplicado en la app.</p>
  </header>

  <section><h2>Logo</h2>
    <div class="g">
      <div class="cell wm" style="grid-column:1/-1">${wordmark}<small>Wordmark <code>blindly:</code>. Los dos puntos son los del reloj (12:45) y van en el verde de acento.</small></div>
      <div class="cell claro wm">${wordmarkTinta}<small>Versión tinta, para fondos claros.</small></div>
      <div class="cell"><div class="sizes">${[96, 48, 32, 24].map((s) => simbolo.replace("<svg ", `<svg width="${Math.round(s * 70 / 84)}" height="${s}" `)).join("")}</div><small>Símbolo <code>b:</code> a 96, 48, 32 y 24 px.</small></div>
    </div>
  </section>

  <section><h2>Ícono de la app</h2>
    <div class="g">
      <div class="cell"><div class="ic">${["50%", "30%", "18px"].map((r) => `<div class="mask" style="border-radius:${r}">${icono}</div>`).join("")}</div><small>Ícono de Play (512) bajo las máscaras de Android: círculo, squircle y redondeado.</small></div>
      <div class="cell"><div class="ic"><div class="mask" style="border-radius:50%;background:${temas.verde.fondo}">${fg}</div><div class="wall"><div class="mask" style="border-radius:50%">${mono}</div><div class="mask" style="border-radius:30%;background:#E8EEF3">${mono.replace(/#FFFFFF/g, "#2B3A48")}</div></div></div><small>Adaptive icon (foreground sobre fondo liso) y monocromo de Android 13+, que el teléfono tiñe con su tema.</small></div>
      <div class="cell" style="align-items:center"><div class="splash">${wordmark}</div><small>Splash: wordmark sobre ${temas.verde.fondo}.</small></div>
    </div>
  </section>

  <section><h2>Temas</h2>
    <p class="m" style="margin-bottom:20px">La pantalla del timer con cada tema. Verde es el gratis; los otros tres son Plus. Botón principal claro y plano; el color de acento marca el nivel actual y quién está en turno.</p>
    <div class="temas">${Object.values(temas).map((t) => `<div class="tema"><h3>${t.nombre}${t.plus ? ` <span class="lock">Plus</span>` : ""}</h3>${pantalla(t)}<div class="sw">${sw(t)}</div></div>`).join("")}</div>
  </section>

  <section><h2>Tipografía</h2>
    <div class="type">
      <div><small>Timer · Barlow Condensed 700 · 112</small><span style="font:700 112px/1 var(--num);font-variant-numeric:tabular-nums">12:45</span></div>
      <div><small>Stack · 600 · 28</small><span style="font:600 28px var(--num);font-variant-numeric:tabular-nums">4.975</span></div>
      <div><small>Título · 700 · 24</small><span style="font:700 24px var(--num)">Modo de juego</span></div>
      <div><small>Subtítulo · Barlow 600 · 18</small><span style="font:600 18px var(--txt)">Estructura de ciegas</span></div>
      <div><small>Cuerpo · Barlow 400 · 16</small><span>Elegí cuánto dura cada nivel. Lo podés cambiar con la partida en pausa.</span></div>
      <div><small>Secundario · 14</small><span class="m" style="font-size:14px">Sigue 150 / 300 en 12 minutos</span></div>
    </div>
    <p class="m" style="margin-top:12px">Barlow y Barlow Condensed: SIL Open Font License 1.1, uso comercial permitido.</p>
  </section>

  <section><h2>Fichas y palos</h2>
    <div class="g">
      <div class="cell"><div class="fichas">${[["blanca", 25], ["roja", 100], ["verde", 500], ["azul", 1000], ["negra", 5000], ["amarilla", 10000]].map(([k, v]) => { const c = fichas[k]; const claro = ["blanca", "amarilla"].includes(k); return `<div class="ficha" style="background:${c};color:${claro ? "#0E1512" : "#F2F0E8"}">${v >= 1000 ? v / 1000 + "K" : v}</div>`; }).join("")}</div><small>Colores de ficha, iguales en todos los temas. Siempre con el valor escrito.</small></div>
      <div class="cell palos">${palos}<small>Palos dibujados a mano en SVG. Reemplazan a los ♠♥♦♣ de texto, que se ven distinto en cada teléfono.</small></div>
    </div>
  </section>

  <section><h2>Tono</h2>
    <div class="tw"><table>
      <tr><th>Hoy</th><th>Propuesta (ES)</th><th>EN</th><th>PT</th></tr>
      <tr><td>POKER ENTRE AMIGOS / La mesa está lista. Faltan ustedes.</td><td>Armá la partida o sumate a una</td><td>Start a game or join one</td><td>Crie uma partida ou entre em uma</td></tr>
      <tr><td>Sin rango</td><td>Todavía sin puntos</td><td>No points yet</td><td>Ainda sem pontos</td></tr>
      <tr><td>Unirme (dos botones)</td><td>Unirme con código o QR · Unirme a un club</td><td>Join with code or QR · Join a club</td><td>Entrar com código ou QR · Entrar em um clube</td></tr>
      <tr><td>TU NOCHE DE POKER</td><td>Tus partidas</td><td>Your games</td><td>Suas partidas</td></tr>
    </table></div>
  </section>
</div>
`;
fs.writeFileSync(path.join(RAIZ, "rebranding", "marca.html"), html);
console.log("rebranding/marca.html generado");
