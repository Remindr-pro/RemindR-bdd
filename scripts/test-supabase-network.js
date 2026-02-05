#!/usr/bin/env node
/**
 * Script pour tester la connectivité réseau vers Supabase
 */

const { execSync } = require('child_process');
const net = require('net');

const supabaseHost = 'db.tubmkaarelbcvfrjddnh.supabase.co';
const ports = [5432, 6543];

async function testNetwork() {
  console.log('🔍 Test de connectivité réseau vers Supabase...\n');

  // Test DNS
  console.log('1️⃣  Test DNS...');
  try {
    const dns = require('dns').promises;
    const addresses = await dns.resolve4(supabaseHost);
    console.log('   ✅ DNS résolu:', addresses.join(', '));
  } catch (error) {
    console.error('   ❌ Erreur DNS:', error.message);
    console.error('   💡 Le nom de domaine ne peut pas être résolu');
    process.exit(1);
  }

  // Test de connexion TCP sur les ports
  console.log('\n2️⃣  Test de connexion TCP...');
  for (const port of ports) {
  console.log(`   Test port ${port}...`);
  
  const socket = new net.Socket();
  const timeout = 5000; // 5 secondes
  
  const testPromise = new Promise((resolve) => {
    let resolved = false;
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve({ success: true, port });
      }
    });
    
    socket.on('timeout', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve({ success: false, port, error: 'Timeout' });
      }
    });
    
    socket.on('error', (error) => {
      if (!resolved) {
        resolved = true;
        resolve({ success: false, port, error: error.code || error.message });
      }
    });
  });
  
  socket.connect(port, supabaseHost);
  
  const result = await testPromise;
  
  if (result.success) {
    console.log(`   ✅ Port ${port} accessible`);
  } else {
    console.log(`   ❌ Port ${port} inaccessible: ${result.error}`);
  }
}

  console.log('\n3️⃣  Vérifications Supabase...');
  console.log('   📋 Actions à faire dans Supabase:');
  console.log('   1. Allez sur https://supabase.com');
  console.log('   2. Ouvrez votre projet');
  console.log('   3. Settings → Database → Network Restrictions');
  console.log('   4. Vérifiez que "Allow connections from anywhere" est activé');
  console.log('   5. Ou ajoutez l\'IP du serveur Infomaniak dans les IPs autorisées');
  console.log('\n   📋 Vérifiez aussi:');
  console.log('   - Settings → Database → Connection string');
  console.log('   - Utilisez "Connection pooling" (port 6543)');
  console.log('   - Vérifiez que le mot de passe est correct');
}

// Run the test
testNetwork().catch((error) => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});

