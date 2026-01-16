#!/usr/bin/env node

/**
 * Script pour générer des secrets JWT sécurisés
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('\n🔐 Génération de secrets JWT sécurisés\n');
console.log('Copiez ces valeurs dans votre fichier .env :\n');
console.log('='.repeat(60));
console.log('\n# JWT Secrets (Générés le ' + new Date().toISOString() + ')');
console.log('JWT_SECRET=' + generateSecret());
console.log('JWT_REFRESH_SECRET=' + generateSecret());
console.log('\n' + '='.repeat(60));
console.log('\n⚠️  IMPORTANT:');
console.log('  - Ne partagez JAMAIS ces secrets');
console.log('  - Ne commitez JAMAIS le fichier .env');
console.log('  - Utilisez des secrets différents pour chaque environnement');
console.log('  - Régénérez les secrets si vous suspectez une compromission\n');

