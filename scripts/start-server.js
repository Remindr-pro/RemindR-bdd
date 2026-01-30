#!/usr/bin/env node
/**
 * Script de démarrage pour l'application
 * Vérifie que le build existe avant de démarrer
 */

const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '..', 'dist', 'src', 'server.js');

if (!fs.existsSync(serverPath)) {
  console.error('❌ ERREUR: Le fichier dist/src/server.js n\'existe pas!');
  console.error('📦 Veuillez d\'abord exécuter: npm run build');
  process.exit(1);
}

// Démarrer le serveur
require(serverPath);

