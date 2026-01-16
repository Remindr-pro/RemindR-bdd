#!/usr/bin/env node

/**
 * Script de déploiement pour RemindR API
 * Usage: node scripts/deploy.js [environment]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const environment = process.argv[2] || 'production';

console.log(`\n🚀 Déploiement pour l'environnement: ${environment}\n`);

// Vérifier que NODE_ENV est défini
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = environment;
}

function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n❌ Erreur lors de: ${description}`);
    process.exit(1);
  }
}

try {
  // Vérifier que le fichier .env existe
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath) && environment === 'production') {
    console.warn('⚠️  Fichier .env non trouvé. Assurez-vous de configurer les variables d\'environnement.');
  }

  // Installation des dépendances
  runCommand('npm ci', 'Installation des dépendances');

  // Build de production
  runCommand('npm run build', 'Build de production');

  // Application des migrations
  runCommand('npm run prisma:migrate deploy', 'Application des migrations');

  console.log('\n✅ Déploiement terminé avec succès!\n');
  console.log('Pour démarrer l\'application:');
  console.log('  npm start');
  console.log('\nPour vérifier le health check:');
  const port = process.env.PORT || '3000';
  console.log(`  curl http://localhost:${port}/health\n`);

} catch (error) {
  console.error('\n❌ Erreur lors du déploiement:', error.message);
  process.exit(1);
}

