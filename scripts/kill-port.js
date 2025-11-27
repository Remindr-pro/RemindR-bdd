const { execSync } = require('child_process');
const net = require('net');

function findProcessOnPort(port) {
  try {
    if (process.platform === 'win32') {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = result.trim().split('\n');
      const pids = new Set();
      
      for (const line of lines) {
        const match = line.match(/\s+(\d+)\s*$/);
        if (match) {
          pids.add(match[1]);
        }
      }
      
      return Array.from(pids);
    } else {
      const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8' });
      return result.trim().split('\n').filter(Boolean);
    }
  } catch (error) {
    return [];
  }
}

function killProcess(pid) {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
    } else {
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
    }
    return true;
  } catch (error) {
    return false;
  }
}

const port = process.argv[2] || '3000';
const pids = findProcessOnPort(port);

if (pids.length === 0) {
  console.log(`✅ No process found on port ${port}`);
  process.exit(0);
}

console.log(`🔍 Found ${pids.length} process(es) on port ${port}:`);
pids.forEach(pid => console.log(`   PID: ${pid}`));

console.log(`\n🔄 Killing process(es)...`);
pids.forEach(pid => {
  if (killProcess(pid)) {
    console.log(`   ✅ Killed PID ${pid}`);
  } else {
    console.log(`   ❌ Failed to kill PID ${pid}`);
  }
});

console.log(`\n✅ Port ${port} should now be free`);

