const { execSync } = require('child_process');
const net = require('net');

function checkRedisConnection(host = 'localhost', port = 6379) {
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

async function startRedis() {
  try {
    const isConnected = await checkRedisConnection();
    
    if (isConnected) {
      console.log('✅ Redis is already running');
      return;
    }

    console.log('🔄 Starting Redis with Docker...');
    
    try {
      execSync('docker-compose up redis -d', { stdio: 'inherit' });
      console.log('✅ Redis started successfully');
      
      let attempts = 0;
      while (attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const connected = await checkRedisConnection();
        if (connected) {
          console.log('✅ Redis is ready');
          return;
        }
        attempts++;
      }
      
      console.warn('⚠️  Redis container started but connection not ready yet');
    } catch (error) {
      console.error('❌ Failed to start Redis:', error.message);
      console.log('💡 You can start Redis manually with: docker-compose up redis -d');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

startRedis();

