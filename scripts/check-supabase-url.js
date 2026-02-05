#!/usr/bin/env node
/**
 * Script pour vérifier l'URL de connexion Supabase
 */

const dns = require('dns');
const https = require('https');

console.log('🔍 Vérification de l\'URL Supabase...\n');

const projectRef = 'tubmkaarelbcvfrjddnh';
const possibleHosts = [
  `db.${projectRef}.supabase.co`,
  `${projectRef}.supabase.co`,
  `aws-0-eu-central-1.pooler.supabase.com`,
];

console.log('1️⃣  Test des différents formats d\'URL Supabase...\n');

for (const host of possibleHosts) {
  console.log(`   Test: ${host}`);
  
  try {
    const addresses = await new Promise((resolve, reject) => {
      dns.resolve4(host, (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });
    console.log(`   ✅ Résolu: ${addresses.join(', ')}`);
  } catch (error) {
    console.log(`   ❌ Non résolu: ${error.code || error.message}`);
  }
}

console.log('\n2️⃣  Instructions pour obtenir la bonne URL...');
console.log('   1. Allez sur https://supabase.com');
console.log('   2. Connectez-vous et ouvrez votre projet');
console.log('   3. Settings → Database');
console.log('   4. Dans "Connection string", vous verrez plusieurs options:');
console.log('      - Direct connection');
console.log('      - Connection pooling');
console.log('      - Session mode');
console.log('   5. Copiez l\'URL complète depuis "Connection string"');
console.log('   6. Vérifiez le format - il peut être différent de db.XXX.supabase.co');
console.log('\n   Formats possibles:');
console.log('   - db.XXX.supabase.co (standard)');
console.log('   - XXX.supabase.co (alternatif)');
console.log('   - aws-0-REGION.pooler.supabase.com (pooling)');
console.log('\n3️⃣  Si l\'URL est différente:');
console.log('   Mettez à jour DATABASE_URL dans votre .env avec l\'URL exacte');
console.log('   depuis Supabase Settings → Database → Connection string');

