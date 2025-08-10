# feria_manager
Aplicación para la gestión de pedidos y stock de productos

 Framework principal:
Next.js (App Router)
→ Framework basado en React, con soporte para renderizado en el servidor (SSR), rutas automáticas (/app), y generación de páginas por archivo.

⚙️ Lenguaje y configuración:
TypeScript (.tsx, .ts)

pnpm como gestor de paquetes (pnpm-lock.yaml)

ESLint + Tailwind + PostCSS (tailwind.config.ts, postcss.config.mjs)

🎨 Estilos:
Tailwind CSS
→ Framework de utilidades CSS con clases como bg-green-500, text-center, etc.

Variables definidas en :root para temas, colores y layouts

🧩 Componentes UI:
ShadCN/UI y Radix UI
→ Librerías de componentes accesibles para React (botones, tarjetas, select, diálogos)

📁 Estructura de rutas:
Basada en la carpeta /app/, con subrutas como:

/app/page.tsx → Home/Login

/app/dashboard/page.tsx → Dashboard

/app/dashboard/clientes/page.tsx → Clientes

/app/dashboard/productos/page.tsx → Productos

/app/dashboard/pedidos/page.tsx → Pedidos

/app/dashboard/pedidos/nuevo/page.tsx → Nuevo pedido

🧪 Estado y datos:
useState / useEffect para manejar estado local

localStorage como almacenamiento persistente (sin base de datos)

Radiografía express
Stack & estructura

Next.js App Router (app/), Tailwind + shadcn/ui, TypeScript estricto, módulos por alias @/*.

Muchas páginas como Client Components ("use client") con datos en localStorage (clientes, productos, pedidos).

app/dashboard/layout.tsx es cliente y protege con redirect si no hay user en localStorage.

app/dashboard/loading.tsx existe (skeleton), pero casi no se ve porque no hay suspensión en servidor todavía.

Tipos centralizados: types/pedido.ts ✅

Puntos a mejorar (prioridad alta → media)

Datos en servidor & suspense real (alta)

Ahora todo se carga en cliente (useEffect + localStorage). Cuando pases a fetch real en server, tu loading.tsx empezará a mostrarse automáticamente.

Patrón recomendado:

Mueve tu UI cliente a app/dashboard/DashboardClient.tsx ("use client").

Deja app/dashboard/page.tsx como Server Component que hace await fetch(...) y pasa los datos como props.

Así activas app/dashboard/loading.tsx en cada navegación.

Autenticación y sesión (alta)

En / haces Google One Tap y guardas user en localStorage. Eso sirve para demo, pero no valida el ID token ni crea sesión segura.

Plan mínimo:

En el login, envía credential al endpoint server (app/api/auth/google/route.ts).

En el server, verifica el ID token con Google (endpoint tokeninfo o librería oficial), y emite cookie HttpOnly con tu sesión.

Desde /dashboard lees sesión desde server (cookies/headers), no desde localStorage.

Beneficio: podrás proteger rutas en el servidor y evitar parpadeos/redirecciones cliente.

Protección de rutas en server (alta)

Agrega middleware.ts para redirigir a / si no hay cookie de sesión en /dashboard(/.*)?. Evitas ver el dashboard aunque sea un instante sin login.

Variables de entorno (alta)

GoogleOAuthProvider usa un clientId hardcodeado en app/layout.tsx. Muévelo a .env.local:

NEXT_PUBLIC_GOOGLE_CLIENT_ID=...

En el layout: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

Revisa no commitear .env* (ya está en .gitignore ✅).

TypeScript & tipos (media)

Bien por types/pedido.ts. Haz lo mismo con User (no lo declares dentro del componente).

Cuando parses JSON, tipa el parseo: JSON.parse(...) as Pedido[].

Evita any (ej. perfil/page.tsx usa useState<any>).

Layout cliente vs server (media)

app/dashboard/layout.tsx es cliente y hace gating con estado isHydrated.
Cuando migres a sesiones server + middleware, puedes volver ese layout server (mejor SSR y menos JS).

Dependencias & versiones (media)

Tienes next: "15.2.4" (ok), react: 18.3.1 y @types/react: ^19.
Mejor alinear @types/react con React 18 para evitar ruidos de tipos (p.ej. ^18.3.x) o actualizar React si decides ir a 19.

Tailwind content (baja)

Tu tailwind.config.ts incluye "./pages/**/*", pero no usas pages/. No hace daño, pero puedes limpiar.