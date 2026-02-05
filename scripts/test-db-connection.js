#!/usr/bin/env node
/**
 * Script pour tester la connexion à la base de données Supabase
 */

const { Client } = require('pg');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ ERREUR: DATABASE_URL n\'est pas défini');
  process.exit(1);
}

// Remove quotes if present
let cleanDbUrl = dbUrl;
if ((dbUrl.startsWith('"') && dbUrl.endsWith('"')) || 
    (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
  cleanDbUrl = dbUrl.slice(1, -1);
}

// Add SSL if Supabase and not present
if (cleanDbUrl.includes('supabase') && !cleanDbUrl.includes('sslmode=')) {
  const separator = cleanDbUrl.includes('?') ? '&' : '?';
  cleanDbUrl = `${cleanDbUrl}${separator}sslmode=require`;
}

const maskedUrl = cleanDbUrl.replace(/:([^:@]+)@/, ':****@');
console.log('🔍 Test de connexion à la base de données...');
console.log('📊 URL (masquée):', maskedUrl);
console.log('📊 Contient "supabase":', cleanDbUrl.includes('supabase'));
console.log('📊 Contient "sslmode":', cleanDbUrl.includes('sslmode'));

const client = new Client({
  connectionString: cleanDbUrl,
  ssl: cleanDbUrl.includes('supabase') ? {
    rejectUnauthorized: false, // Supabase uses valid certificates but this helps with connection issues
  } : false,
});

console.log('\n🔄 Tentative de connexion...');

client.connect()
  .then(() => {
    console.log('✅ Connexion réussie!');
    
    // Test simple query
    return client.query('SELECT NOW() as current_time, version() as pg_version');
  })
  .then((result) => {
    console.log('✅ Requête réussie!');
    console.log('   Heure serveur:', result.rows[0].current_time);
    console.log('   Version PostgreSQL:', result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1]);
    
    return client.end();
  })
  .then(() => {
    console.log('\n✅ Test terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur de connexion:');
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Le serveur DNS ne peut pas résoudre le nom de domaine');
      console.error('   Vérifiez que db.tubmkaarelbcvfrjddnh.supabase.co est accessible');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('\n💡 Impossible de se connecter au serveur');
      console.error('   Vérifiez que:');
      console.error('   1. Le mot de passe est correct');
      console.error('   2. La base de données Supabase est active');
      console.error('   3. Les connexions externes sont autorisées');
      console.error('   4. Le firewall n\'bloque pas le port 5432');
    } else if (error.message?.includes('password authentication failed')) {
      console.error('\n💡 Authentification échouée');
      console.error('   Le mot de passe est incorrect');
      console.error('   Vérifiez votre mot de passe Supabase dans le .env');
    } else if (error.message?.includes('SSL')) {
      console.error('\n💡 Problème SSL');
      console.error('   Essayez avec sslmode=require dans la DATABASE_URL');
    }
    
    process.exit(1);
  });

