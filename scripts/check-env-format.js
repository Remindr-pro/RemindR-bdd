#!/usr/bin/env node
/**
 * Script pour vérifier le format du .env
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔍 Vérification du format .env...\n');

const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ Le fichier .env n\'existe pas à:', envPath);
  process.exit(1);
}

// Read raw .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

console.log('📄 Contenu du .env (lignes avec DATABASE_URL):');
lines.forEach((line, index) => {
  if (line.includes('DATABASE_URL')) {
    console.log(`   Ligne ${index + 1}: ${line}`);
    
    // Check for common issues
    if (line.includes('=')) {
      const parts = line.split('=');
      if (parts.length > 1) {
        const value = parts.slice(1).join('=');
        
        // Check for quotes
        if (value.startsWith('"') && value.endsWith('"')) {
          console.log('   ⚠️  DATABASE_URL est entre guillemets - cela peut causer des problèmes');
        }
        if (value.startsWith("'") && value.endsWith("'")) {
          console.log('   ⚠️  DATABASE_URL est entre apostrophes - cela peut causer des problèmes');
        }
        
        // Check for spaces
        if (value.startsWith(' ') || value.endsWith(' ')) {
          console.log('   ⚠️  DATABASE_URL contient des espaces au début/fin - cela peut causer des problèmes');
        }
        
        // Check length
        if (value.length < 50) {
          console.log('   ⚠️  DATABASE_URL semble trop court (moins de 50 caractères)');
        }
        
        // Check format
        if (!value.includes('postgresql://')) {
          console.log('   ⚠️  DATABASE_URL ne commence pas par "postgresql://"');
        }
        
        if (!value.includes('supabase')) {
          console.log('   ⚠️  DATABASE_URL ne contient pas "supabase"');
        }
        
        // Check for SSL mode for Supabase
        if (value.includes('supabase') && !value.includes('sslmode=')) {
          console.log('   ℹ️  DATABASE_URL Supabase sans sslmode - SSL sera ajouté automatiquement');
          console.log('   💡 Vous pouvez aussi l\'ajouter manuellement: ?sslmode=require');
        }
      }
    }
  }
});

console.log('\n📊 Valeur chargée par dotenv:');
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  const masked = dbUrl.replace(/:([^:@]+)@/, ':****@');
  console.log('   DATABASE_URL:', masked);
  console.log('   Longueur:', dbUrl.length, 'caractères');
  console.log('   Contient "supabase":', dbUrl.includes('supabase'));
  console.log('   Se termine par "/postgres":', dbUrl.endsWith('/postgres'));
} else {
  console.error('   ❌ DATABASE_URL n\'est pas défini dans process.env');
}

console.log('\n✅ Vérification terminée');

