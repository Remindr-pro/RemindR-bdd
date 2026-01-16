#!/usr/bin/env node

/**
 * Script pour vérifier la configuration de l'environnement
 * Usage: node scripts/check-env.js
 */

const requiredEnvVars = {
  production: [
    'NODE_ENV',
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'CORS_ORIGIN',
  ],
  development: [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ],
};

const recommendedEnvVars = [
  'SENTRY_DSN',
  'REDIS_HOST',
  'REDIS_PORT',
  'FCM_SERVICE_ACCOUNT_PATH',
  'SENDGRID_API_KEY',
  'TWILIO_ACCOUNT_SID',
];

function checkEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[env] || requiredEnvVars.development;
  
  console.log(`\n🔍 Vérification de l'environnement: ${env}\n`);
  console.log('='.repeat(60));
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Vérifier les variables requises
  console.log('\n📋 Variables requises:');
  required.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`  ❌ ${varName}: MANQUANTE`);
      hasErrors = true;
    } else if (varName.includes('SECRET') && value.length < 32) {
      console.log(`  ⚠️  ${varName}: Trop courte (minimum 32 caractères)`);
      hasWarnings = true;
    } else if (varName === 'CORS_ORIGIN' && value.includes('*')) {
      console.log(`  ⚠️  ${varName}: Contient un wildcard (non sécurisé en production)`);
      hasWarnings = true;
    } else {
      const displayValue = varName.includes('SECRET') || varName.includes('PASSWORD') || varName.includes('KEY')
        ? '*'.repeat(Math.min(value.length, 20))
        : value;
      console.log(`  ✅ ${varName}: ${displayValue}`);
    }
  });
  
  // Vérifier les variables recommandées
  console.log('\n💡 Variables recommandées:');
  recommendedEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`  ⚠️  ${varName}: Non configurée`);
      hasWarnings = true;
    } else {
      console.log(`  ✅ ${varName}: Configurée`);
    }
  });
  
  // Vérifications spéciales
  console.log('\n🔒 Vérifications de sécurité:');
  
  if (env === 'production') {
    if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
      console.log('  ❌ JWT_SECRET et JWT_REFRESH_SECRET doivent être différents');
      hasErrors = true;
    } else {
      console.log('  ✅ JWT secrets différents');
    }
    
    if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.includes('localhost')) {
      console.log('  ⚠️  CORS_ORIGIN contient localhost (non recommandé en production)');
      hasWarnings = true;
    } else {
      console.log('  ✅ CORS_ORIGIN configuré correctement');
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (hasErrors) {
    console.log('\n❌ Des erreurs critiques ont été détectées!');
    console.log('   Veuillez corriger ces problèmes avant de continuer.\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️  Des avertissements ont été détectés.');
    console.log('   L\'application peut fonctionner, mais certaines fonctionnalités peuvent être limitées.\n');
    process.exit(0);
  } else {
    console.log('\n✅ Configuration de l\'environnement valide!\n');
    process.exit(0);
  }
}

checkEnvironment();

