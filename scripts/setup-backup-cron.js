const fs = require('fs');
const path = require('path');

const cronSchedule = process.env.BACKUP_CRON_SCHEDULE || '0 2 * * *'; // Daily at 2 AM
const scriptPath = path.resolve(__dirname, 'backup-db.js');
const nodePath = process.execPath;

function generateCronJob() {
  return `${cronSchedule} cd ${process.cwd()} && ${nodePath} ${scriptPath} >> logs/backup.log 2>&1\n`;
}

function setupCron() {
  if (process.platform === 'win32') {
    console.log('Windows detected. Cron jobs are not natively supported.');
    console.log('Please use Windows Task Scheduler or a third-party tool.');
    console.log('\nTask Scheduler command:');
    console.log(`schtasks /create /tn "RemindR DB Backup" /tr "${nodePath} ${scriptPath}" /sc daily /st 02:00`);
    return;
  }

  const cronJob = generateCronJob();
  const cronFile = path.join(process.cwd(), 'backup.cron');

  fs.writeFileSync(cronFile, cronJob);
  console.log('✅ Cron job file created: backup.cron');
  console.log('\nTo install the cron job, run:');
  console.log(`crontab ${cronFile}`);
  console.log('\nOr manually add this line to your crontab:');
  console.log(cronJob);
}

if (require.main === module) {
  setupCron();
}

module.exports = { setupCron };

