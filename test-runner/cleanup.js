import path from 'path';
import util from 'util';
import chalk from 'chalk';
import _rimraf from 'rimraf';

const rimraf = util.promisify(_rimraf);

async function cleanUpLogFiles() {
  await rimraf(path.join(__dirname, '../*.log'));
  await rimraf(path.join(__dirname, '../sysinfo.json'));
}

(async () => {
  try {
    console.log('Cleaning up log files...');
    await cleanUpLogFiles();
  } catch (err) {
    console.error(chalk.red(`Something went wrong: ${err.message}`));
  }
})();
