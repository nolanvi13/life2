#!/bin/bash

# 1. Sauvegarde les fichiers existants
mkdir -p /tmp/life2-docs
cp CLAUDE.md SUPABASE.md PROGRESS.md MARCHE-A-SUIVRE.md budget-nolan-lylou.html /tmp/life2-docs/
cp -r recettes-app/ /tmp/life2-docs/recettes-app/

# 2. Remonte d'un niveau et init Next.js
cd ..
mv life2/ life2-old/
npx create-next-app@latest life2 --typescript --tailwind --app --src-dir=false

# 3. Recopie tout dans le nouveau projet
cp /tmp/life2-docs/CLAUDE.md life2/
cp /tmp/life2-docs/SUPABASE.md life2/
cp /tmp/life2-docs/PROGRESS.md life2/
cp /tmp/life2-docs/MARCHE-A-SUIVRE.md life2/
cp /tmp/life2-docs/budget-nolan-lylou.html life2/
cp -r /tmp/life2-docs/recettes-app/ life2/recettes-app/

# 4. Supprime l'ancien dossier
rm -rf life2-old/

echo "✅ Done. Entre dans le projet : cd life2"
