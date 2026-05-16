#!/bin/bash
cd "$(dirname "$0")"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Divisia — Control de Coberturas FX"
echo "  Puerto: 3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar .env
if [ ! -f .env ]; then
  echo "⚠️  No existe .env. Copiando .env.example..."
  cp .env.example .env
  echo "   Edita .env con tus credenciales de Neon antes de continuar."
  exit 1
fi

# Comprobar que las credenciales de Neon están configuradas
if grep -q "CAMBIA_ESTO" .env; then
  echo "⚠️  El .env contiene credenciales sin configurar (CAMBIA_ESTO)."
  echo "   Ve a https://neon.tech, crea el proyecto 'divisia' y pega las URLs."
  exit 1
fi

# Instalar dependencias si faltan
if [ ! -d node_modules ]; then
  echo "→ Instalando dependencias..."
  npm install
fi

# Sincronizar schema con la base de datos
echo "→ Sincronizando schema con Neon..."
npx prisma db push --skip-generate 2>&1 | tail -5

# Arrancar servidor en puerto fijo 3000
echo ""
echo "→ Arrancando Divisia en http://localhost:3000"
echo ""
npm run dev -- -p 3000
