# Blindly v31 — Payment RC

02/11/2026 (ART). Preparación autorizada después de Gate A. **Build y distribución pendientes en este registro inicial; Gate B no aprobado.**

| Campo | Estado previsto / resultado |
| --- | --- |
| versionName | 1.0.0 |
| versionCode | 31 previsto; confirmar en artefacto y Play antes de darlo por distribuido |
| Package | com.blindly.studio |
| Perfil EAS | payment-rc (AAB, store, preview, credenciales locales existentes) |
| EAS build ID | Pendiente |
| AAB / SHA-256 | Pendiente |
| Certificado de carga | c5b6c355789f93255b188cef762db78de5a1900e286ce3b1ec9475f6c466422f, mismo que v30 |
| Track | Alpha cerrado previsto, pendiente de verificar/cargar |
| Instalación desde Play | Pendiente |
| Gate B catálogo | Pendiente |
| QA compras / license testers / allowlist | Pendiente de fase posterior al catálogo |
| Founder Trial / pagos reales | Trial activo / payments global false, sin cambios |

El perfil `payment-rc` equivale a la configuración comercial `-PlayBilling` del script local: EXPO_PUBLIC_PLUS_READY=true y clave pública goog_ correcta de Android, sin autorizar cobros en servidor. Incorpora evidencia sanitizada del catálogo en logcat; no añade una pantalla de pago/diagnóstico.

Ver [Gate B y protocolo de QA](payment-rc-gate-b.md). No se consideran evidencia runtime ni un AAB, ni GET offerings público, ni mocks, ni instalación local. No hay producción, cambios de precios/IDs/package/firma ni permisos públicos de compra.
