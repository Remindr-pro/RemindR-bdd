const { execSync } = require('child_process');

console.log('🔄 Resetting PostgreSQL database...\n');

try {
  console.log('1️⃣  Stopping PostgreSQL container...');
  execSync('docker-compose stop postgres', { stdio: 'inherit' });
  
  console.log('\n2️⃣  Removing PostgreSQL container and volume...');
  execSync('docker-compose rm -f postgres', { stdio: 'inherit' });
  execSync('docker volume rm remindr-bdd_postgres_data', { stdio: 'ignore' }).catch(() => {});
  
  console.log('\n3️⃣  Starting PostgreSQL with fresh data...');
  execSync('docker-compose up postgres -d', { stdio: 'inherit' });
  
  console.log('\n4️⃣  Waiting for PostgreSQL to be ready...');
  let attempts = 0;
  while (attempts < 30) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      execSync('docker exec remindr-postgres pg_isready -U remindr', { stdio: 'ignore' });
      console.log('✅ PostgreSQL is ready!');
      break;
    } catch (error) {
      attempts++;
      if (attempts >= 30) {
        console.log('⚠️  PostgreSQL is taking longer than expected to start');
        break;
      }
    }
  }
  
  console.log('\n✅ Database reset complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Make sure your .env has:');
  console.log('      DATABASE_URL=postgresql://remindr:remindr_password@localhost:5432/remindr_db?schema=public');
  console.log('   2. Run migrations: npm run prisma:migrate');
  console.log('   3. (Optional) Seed database: npm run prisma:seed');
  
} catch (error) {
  console.error('❌ Error resetting database:', error.message);
  process.exit(1);
}

