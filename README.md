# Divisia — Control de Coberturas de Divisa

Aplicación para gestionar coberturas FX de Cuadros Eléctricos Nazarenos S.L. Controla TARF, Geared Forwards, Accumulators, Forwards BBVA y cualquier otro instrumento OTC desde una sola interfaz.

## Setup (5 minutos)

### 1. Instala dependencias
```bash
npm install
```

### 2. Configura la base de datos
```bash
cp .env.example .env
# La configuración por defecto usa SQLite local — no necesitas nada más
```

### 3. Crea las tablas e importa contratos de ejemplo
```bash
npx prisma db push
npm run db:seed
```

### 4. Arranca
```bash
npm run dev
# → http://localhost:3000
```

## Contratos precargados

El seed incluye los 4 contratos reales de Hamilton Court FX y BBVA:

| Referencia | Tipo | Contraparte | Nocional | Vencimiento |
|---|---|---|---|---|
| TRE15EAEF0 | TARF 2:1 EKI | Hamilton Court FX | 100K USD | Dic 2026 |
| BOP0018VPXW | Geared Forward 1:1 | Hamilton Court FX | 500K USD | Ago 2025 |
| BOP0018VQNU | Accumulator | Hamilton Court FX | 24K USD | Ago 2025 |
| B00018664687 | Forward BBVA | BBVA | 50K USD | Ene 2028 |

## Funcionalidades

- **Dashboard**: exposición total, P&L, próximos fixings en 30 días
- **Contratos**: lista y detalle con todos los parámetros (strike, barreras EKI, targets)
- **Fixings**: tabla completa por contrato, con botón de edición inline para registrar el tipo real, escenario y P&L
- **MtM**: entrada manual de valoraciones mark-to-market con fecha, fuente y tipo spot
- **Calendario**: vista cronológica de los próximos 60 días de fixings
- **P&L Global**: desglose por contrato de realizado + MtM abierto
- **Entidades**: bancos y brokers con sus contratos asociados

## Añadir un nuevo contrato

Ve a Contratos → Nuevo contrato. El formulario detecta el tipo de instrumento y muestra solo los campos relevantes (EKI para TARF, barreras para Accumulator, etc.).

Para importar el Excel existente: usa el formulario manualmente por ahora — en la próxima versión habrá importación desde CSV/Excel.

## Stack

- Next.js 14 (App Router) + TypeScript
- Prisma ORM + SQLite (local) / PostgreSQL (producción)
- Tailwind CSS + shadcn/ui
- Vercel-ready

## Deploy a Vercel (producción)

```bash
# 1. Cambia DATABASE_URL en .env a PostgreSQL
# 2. Push del schema
npx prisma db push
# 3. Deploy
vercel --prod
```

## Próximas funciones (Phase 2)

- Tipo de cambio spot en tiempo real (API de ECB o similar)
- Alertas por email antes de cada fixing
- Importación desde Excel/CSV
- Exportación de informe PDF mensual
- Simulación de escenarios (¿qué pasa si EUR/USD baja a 1.02?)
