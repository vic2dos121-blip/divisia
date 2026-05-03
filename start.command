#!/bin/bash
cd "$(dirname "$0")"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Divisia — Control de Coberturas FX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Copiar .env si no existe
if [ ! -f .env ]; then
  echo "→ Creando .env desde .env.example..."
  cp .env.example .env
fi

# Crear base de datos y tablas
echo "→ Inicializando base de datos..."
npx prisma db push --skip-generate 2>&1 | tail -5

# Importar contratos de ejemplo
echo "→ Importando contratos (TARF, Geared Forward, Accumulator, Forward BBVA)..."
npm run db:seed 2>&1 | tail -5

# Arrancar servidor
echo ""
echo "→ Arrancando servidor..."
echo "  Abre http://localhost:3000 en tu navegador"
echo ""
npm run dev
