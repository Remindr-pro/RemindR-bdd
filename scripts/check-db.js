const { execSync } = require('child_process');
const net = require('net');

function checkConnection(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection(port, host, () => {
      socket.end();
      resolve(true);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function checkDatabase() {
  console.log('🔍 Checking database connection...\n');
  
  const isConnected = await checkConnection('localhost', 5432);
  
  if (!isConnected) {
    console.log('❌ PostgreSQL is not running on port 5432');
    console.log('💡 Start it with: npm run postgres:start');
    process.exit(1);
  }

  console.log('✅ PostgreSQL is running on port 5432');
  
  try {
    console.log('\n🔍 Testing database credentials...');
    execSync('docker exec remindr-postgres psql -U remindr -d remindr_db -c "SELECT 1;"', { 
      stdio: 'pipe' 
    });
    console.log('✅ Database credentials are correct');
    console.log('\n📝 Your DATABASE_URL should be:');
    console.log('   postgresql://remindr:remindr_password@localhost:5432/remindr_db?schema=public');
  } catch (error) {
    console.log('❌ Database credentials test failed');
    console.log('💡 Make sure your .env file has:');
    console.log('   DATABASE_URL=postgresql://remindr:remindr_password@localhost:5432/remindr_db?schema=public');
    process.exit(1);
  }
}

checkDatabase();

