const { execSync } = require('child_process');

console.log('🔧 Fixing database password...\n');

try {
  console.log('Updating PostgreSQL user password to match docker-compose.yml...');
  execSync('docker exec remindr-postgres psql -U remindr -d postgres -c "ALTER USER remindr WITH PASSWORD \'remindr_password\';"', { 
    stdio: 'inherit' 
  });
  
  console.log('\n✅ Password updated successfully!');
  console.log('\n📝 Your .env should have:');
  console.log('   DATABASE_URL=postgresql://remindr:remindr_password@localhost:5432/remindr_db?schema=public');
  console.log('\n💡 If your .env has a different password, update it to match the above.');
  
} catch (error) {
  console.error('❌ Error updating password:', error.message);
  console.log('\n💡 Alternative: Update your .env DATABASE_URL to use the current password');
  process.exit(1);
}

