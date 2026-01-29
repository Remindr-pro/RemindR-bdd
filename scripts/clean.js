#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dirsToClean = [
  'dist',
  'node_modules/.cache',
  'node_modules/.prisma',
  'node_modules/@prisma/client',
];

const cleanAll = process.argv.includes('--all');

console.log('🧹 Cleaning cache and build files...\n');

let cleaned = 0;
let errors = 0;

function removeDir(dirPath) {
  const fullPath = path.resolve(process.cwd(), dirPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  ${dirPath} - does not exist, skipping`);
    return false;
  }

  try {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`✅ ${dirPath} - cleaned`);
    return true;
  } catch (error) {
    console.error(`❌ ${dirPath} - error: ${error.message}`);
    return false;
  }
}

// Clean specific directories
dirsToClean.forEach(dir => {
  if (removeDir(dir)) {
    cleaned++;
  } else {
    errors++;
  }
});

if (cleanAll) {
  console.log('\n🧹 Cleaning node_modules...');
  if (removeDir('node_modules')) {
    cleaned++;
    console.log('\n⚠️  node_modules removed. Run "npm install" to reinstall dependencies.');
  }
}

console.log(`\n✨ Clean complete: ${cleaned} directories cleaned${errors > 0 ? `, ${errors} skipped` : ''}`);

