# Levantar Blindly desde otra PC

## Descargar esta versión

Si todavía no tenés el repositorio:

```powershell
git clone --branch main https://github.com/ArgerichFacu/Blindly.git
cd Blindly
```

Si ya lo tenés, preservá tus cambios locales antes de cambiar de rama:

```powershell
git fetch origin
git switch main
git pull --ff-only origin main
```

## Configurar y arrancar

Usá Node.js 22.13 o superior compatible con Expo SDK 57 y npm.

```powershell
npm ci
Copy-Item .env.example .env
```

Completá .env con EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_KEY del mismo proyecto Supabase que usa esta PC. Podés copiar tu .env de manera privada entre tus equipos. No está incluido en GitHub. Nunca uses una clave service_role en la app. Mantené EXPO_PUBLIC_EMAIL_AUTH_READY=false mientras no haya SMTP configurado.

```powershell
npm run typecheck
npm test
npx expo start --web --lan --port 8090
```

Abrí http://localhost:8090 en la PC. Para otros equipos de la misma red, usá http://IP-DE-LA-PC:8090 (obtené la dirección IPv4 con ipconfig). Permití Node.js en el firewall para redes privadas si Windows lo solicita. No abras puertos del router para esta prueba local.

Esta PC sirve la app; la base de datos, sesiones y sincronización siguen en Supabase, por lo que se necesita Internet. Las migraciones 07, 08 y 09 ya se aplicaron al proyecto ddvbbkwhisuezloorhfg: no es necesario volver a ejecutarlas por cambiar de PC. Si creás otro proyecto Supabase, requiere su propia configuración y migraciones.

El escáner QR web puede requerir HTTPS fuera de localhost; para probar por HTTP desde otro celular, ingresá el código de sala manualmente. Para prueba nativa, consultá docs/identidad-y-build.md. El splash nativo requiere una build real.
