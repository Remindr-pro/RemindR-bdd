#!/usr/bin/env node
/**
 * Script pour diagnostiquer les problèmes DNS et réseau
 */

const dns = require('dns');
const { execSync } = require('child_process');
const http = require('http');

async function runTests() {
  console.log('🔍 Diagnostic DNS et réseau...\n');

  // Test 1: Résolution DNS avec différents serveurs
  console.log('1️⃣  Test de résolution DNS...');

  const testDomains = [
    'db.tubmkaarelbcvfrjddnh.supabase.co',
    'google.com',
    'supabase.com'
  ];

  for (const domain of testDomains) {
    console.log(`\n   Test: ${domain}`);
    
    // Test avec DNS système
    try {
      const addresses = await new Promise((resolve, reject) => {
        dns.resolve4(domain, (err, addresses) => {
          if (err) reject(err);
          else resolve(addresses);
        });
      });
      console.log(`   ✅ DNS système: ${addresses.join(', ')}`);
    } catch (error) {
      console.log(`   ❌ DNS système: ${error.code || error.message}`);
    }
  
  // Test avec nslookup si disponible
  try {
    const result = execSync(`nslookup ${domain} 2>&1 | head -10`, { encoding: 'utf8', timeout: 5000 });
    if (result.includes('Address:')) {
      console.log(`   ✅ nslookup: Résolu`);
    } else {
      console.log(`   ⚠️  nslookup: Résultat inattendu`);
    }
  } catch (error) {
    console.log(`   ⚠️  nslookup: Non disponible ou erreur`);
  }
}

  // Test 2: Connexion Internet
  console.log('\n2️⃣  Test de connexion Internet...');
  try {
    const testUrl = 'http://www.google.com';
    
    await new Promise((resolve, reject) => {
      const req = http.get(testUrl, { timeout: 5000 }, (res) => {
        console.log(`   ✅ Connexion Internet: OK (${res.statusCode})`);
        res.on('data', () => {});
        res.on('end', resolve);
      });
      
      req.on('error', (error) => {
        console.log(`   ❌ Connexion Internet: ${error.code || error.message}`);
        reject(error);
      });
      
      req.on('timeout', () => {
        req.destroy();
        console.log(`   ❌ Connexion Internet: Timeout`);
        reject(new Error('Timeout'));
      });
    });
  } catch (error) {
    console.log(`   ❌ Connexion Internet: Échec`);
  }

  // Test 3: Vérifier les serveurs DNS
  console.log('\n3️⃣  Serveurs DNS configurés...');
  try {
    const result = execSync('cat /etc/resolv.conf 2>/dev/null | grep nameserver', { encoding: 'utf8' });
    console.log('   Serveurs DNS:');
    result.split('\n').forEach(line => {
      if (line.trim()) {
        console.log(`   - ${line.trim()}`);
      }
    });
  } catch (error) {
    console.log('   ⚠️  Impossible de lire /etc/resolv.conf');
  }

  // Solutions
  console.log('\n💡 Solutions possibles:');
  console.log('   1. Le serveur Infomaniak peut avoir des restrictions DNS');
  console.log('   2. Contactez le support Infomaniak pour:');
  console.log('      - Vérifier que les connexions sortantes sont autorisées');
  console.log('      - Vérifier la configuration DNS');
  console.log('      - Autoriser les connexions vers Supabase');
  console.log('\n   3. Alternative: Utiliser l\'IP directement (si disponible)');
  console.log('      Mais Supabase utilise probablement un load balancer');
  console.log('\n   4. Alternative: Utiliser l\'API REST Supabase au lieu de PostgreSQL direct');
  console.log('      Via Supabase Client JS (moins performant mais fonctionne via HTTP)');
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});

