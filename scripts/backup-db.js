const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '7', 10);

function parseDatabaseUrl(url) {
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5],
  };
}

function createBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function generateBackupFilename() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
    new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
  return `backup_${timestamp}.sql`;
}

function createBackup() {
  try {
    const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);
    const filename = generateBackupFilename();
    const filepath = path.join(BACKUP_DIR, filename);

    console.log(`Creating backup: ${filename}`);

    const pgDumpCommand = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F c -f "${filepath}"`;

    process.env.PGPASSWORD = dbConfig.password;
    execSync(pgDumpCommand, { stdio: 'inherit' });

    const stats = fs.statSync(filepath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ Backup created: ${filename} (${fileSizeMB} MB)`);

    return filepath;
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    throw error;
  }
}

function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();
    const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

    let deletedCount = 0;
    files.forEach((file) => {
      if (file.startsWith('backup_') && file.endsWith('.sql')) {
        const filepath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filepath);
        const fileAge = now - stats.mtimeMs;

        if (fileAge > retentionMs) {
          fs.unlinkSync(filepath);
          deletedCount++;
          console.log(`🗑️  Deleted old backup: ${file}`);
        }
      }
    });

    if (deletedCount > 0) {
      console.log(`✅ Cleaned up ${deletedCount} old backup(s)`);
    }
  } catch (error) {
    console.error('⚠️  Error cleaning up old backups:', error.message);
  }
}

function main() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    createBackupDir();
    createBackup();
    cleanupOldBackups();
    console.log('✅ Backup process completed successfully');
  } catch (error) {
    console.error('❌ Backup process failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createBackup, cleanupOldBackups };

