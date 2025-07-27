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

