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

async function startService(serviceName, port, checkCommand) {
  try {
    const isConnected = await checkConnection('localhost', port);
    
    if (isConnected) {
      console.log(`✅ ${serviceName} is already running on port ${port}`);
      return true;
    }

    console.log(`🔄 Starting ${serviceName} with Docker...`);
    
    try {
      execSync(`docker-compose up ${serviceName} -d`, { stdio: 'pipe' });
      console.log(`✅ ${serviceName} container started`);
      
      let attempts = 0;
      while (attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const connected = await checkConnection('localhost', port);
        if (connected) {
          console.log(`✅ ${serviceName} is ready on port ${port}`);
          return true;
        }
        attempts++;
      }
      
      console.warn(`⚠️  ${serviceName} container started but connection not ready yet`);
      return false;
    } catch (error) {
      if (error.message && error.message.includes('dockerDesktopLinuxEngine')) {
        console.error(`❌ Docker Desktop is not running`);
        console.log(`💡 Please start Docker Desktop and try again`);
        return false;
      }
      console.error(`❌ Failed to start ${serviceName}:`, error.message);
      return false;
    }
  } catch (error) {
    console.error(`Error checking ${serviceName}:`, error.message);
    return false;
  }
}

async function startAllServices() {
  console.log('🚀 Starting required services...\n');
  
  const postgresOk = await startService('postgres', 5432, 'pg_isready');
  const redisOk = await startService('redis', 6379, 'redis-cli ping');
  
  console.log('\n📊 Service Status:');
  console.log(`   PostgreSQL: ${postgresOk ? '✅ Running' : '❌ Not available'}`);
  console.log(`   Redis: ${redisOk ? '✅ Running' : '❌ Not available'}`);
  
  if (!postgresOk) {
    console.log('\n💡 To start PostgreSQL manually: docker-compose up postgres -d');
    console.log('   Or: npm run services:start');
  }
  
  if (!redisOk) {
    console.log('\n💡 To start Redis manually: docker-compose up redis -d');
    console.log('   Or: npm run redis:start');
  }
  
  if (!postgresOk) {
    console.log('\n⚠️  PostgreSQL is required for the application to work');
    process.exit(1);
  }
  
  console.log('\n✅ All required services are ready!');
}

startAllServices();

