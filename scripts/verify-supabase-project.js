#!/usr/bin/env node
/**
 * Script pour vérifier si le projet Supabase existe et est actif
 */

const https = require('https');

async function verifyProject() {
  const projectRef = 'tubmkaarelbcvfrjddnh';
  
  console.log('🔍 Vérification du projet Supabase...\n');
  console.log(`   Project Reference: ${projectRef}`);
  console.log(`   URL attendue: db.${projectRef}.supabase.co\n`);

  // Test 1: Vérifier si on peut accéder à l'API Supabase du projet
  console.log('1️⃣  Test de l\'API REST Supabase...');
  
  const apiUrl = `https://${projectRef}.supabase.co/rest/v1/`;
  
  try {
    await new Promise((resolve, reject) => {
      const req = https.get(apiUrl, { timeout: 10000 }, (res) => {
        if (res.statusCode === 200 || res.statusCode === 401 || res.statusCode === 404) {
          // 401/404 signifie que le serveur répond, même si l'endpoint n'existe pas
          console.log(`   ✅ API accessible (status: ${res.statusCode})`);
          console.log(`   ✅ Le projet Supabase existe et est actif`);
          resolve();
        } else {
          console.log(`   ⚠️  Status inattendu: ${res.statusCode}`);
          resolve();
        }
        res.on('data', () => {});
        res.on('end', () => {});
      });
      
      req.on('error', (error) => {
        if (error.code === 'ENOTFOUND') {
          console.log(`   ❌ Le projet n'existe pas ou a été supprimé`);
          console.log(`   💡 Vérifiez sur https://supabase.com que le projet est actif`);
        } else {
          console.log(`   ❌ Erreur: ${error.code || error.message}`);
        }
        reject(error);
      });
      
      req.on('timeout', () => {
        req.destroy();
        console.log(`   ❌ Timeout`);
        reject(new Error('Timeout'));
      });
    });
  } catch (error) {
    // Erreur déjà loggée
  }

  console.log('\n2️⃣  Vérifications à faire dans Supabase:');
  console.log('   1. Allez sur https://supabase.com');
  console.log('   2. Vérifiez que le projet est actif (pas suspendu/pausé)');
  console.log('   3. Settings → Database → Network Restrictions');
  console.log('      - Vérifiez que "Allow connections from anywhere" est activé');
  console.log('   4. Settings → Database → Connection string');
  console.log('      - Vérifiez que l\'URL est bien:');
  console.log(`        postgresql://postgres:[PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`);
  console.log('\n3️⃣  Si le projet est actif mais le DNS ne fonctionne pas:');
  console.log('   - Contactez le support Infomaniak');
  console.log('   - Le problème peut venir du DNS interne du serveur');
  console.log('   - Demandez à autoriser les connexions vers *.supabase.co');
}

// Run verification
verifyProject().catch((error) => {
  console.error('\n❌ Erreur:', error.message);
  process.exit(1);
});

