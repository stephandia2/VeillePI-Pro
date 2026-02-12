#!/bin/bash

# Script de test pour l'API VeillePI
# Usage: ./test-veille.sh

echo "🧪 Test de l'API VeillePI Pro"
echo "================================"

# Vérifier si le serveur est démarré
if ! curl -s http://localhost:3000/api/veille > /dev/null 2>&1; then
    echo "⚠️  Le serveur Next.js n'est pas démarré"
    echo "🚀 Démarrage du serveur..."
    npm run dev &
    sleep 5
fi

echo ""
echo "📋 Test 1: Récupération des articles (GET)"
echo "-------------------------------------------"
curl -s http://localhost:3000/api/veille?limit=5 | jq '.' 2>/dev/null || curl -s http://localhost:3000/api/veille?limit=5

echo ""
echo ""
echo "🔍 Test 2: Lancement d'une veille (POST)"
echo "-----------------------------------------"
echo "⚠️  Cela va utiliser votre quota Brave Search API (2000 req/mois)"
echo "   et prendre ~20 secondes (rate limiting: 2s entre requêtes)"
echo ""
read -p "Continuer? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    curl -s -X POST http://localhost:3000/api/veille \
        -H "Content-Type: application/json" \
        -d '{
            "keywords": ["contrefaçon", "saisie douane"],
            "maxResults": 3
        }' | jq '.' 2>/dev/null || curl -s -X POST http://localhost:3000/api/veille \
        -H "Content-Type: application/json" \
        -d '{
            "keywords": ["contrefaçon", "saisie douane"],
            "maxResults": 3
        }'
else
    echo "Test annulé"
fi

echo ""
echo "✅ Tests terminés"
