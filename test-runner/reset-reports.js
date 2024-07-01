import { promises as fs } from 'fs';
import path from 'path';
import util from 'util';
import chalk from 'chalk';
import _rimraf from 'rimraf';

const rimraf = util.promisify(_rimraf);

import {
  makePath,
  compileMenuData,
  computeHash,
  prepareReportFolders,
} from './test-runner-helpers';

async function prepareHashes(menuData) {
  const hashes = {};

  for (const moduleName of Object.keys(menuData)) {
    const weeks = Object.keys(menuData[moduleName]);
    for (const week of weeks) {
      const exercises = menuData[moduleName][week];
      for (const exercise of exercises) {
        const exercisePath = makePath(moduleName, week, 'assignment', exercise);
        hashes[exercise] = await computeHash(exercisePath);
      }
    }
  }

  await fs.writeFile(
    path.join(__dirname, '../.hashes.json'),
    JSON.stringify(hashes, null, 2),
    'utf8'
  );
}

async function cleanUpLogFiles() {
  await rimraf(path.join(__dirname, '../*.log'));
  await rimraf(path.join(__dirname, '../sysinfo.json'));
}

(async () => {
  try {
    console.log('Scanning for exercises...');
    const menuData = compileMenuData();

    console.log('Preparing report folders...');
    await prepareReportFolders(menuData);

    console.log('Computing exercise hashes...');
    await prepareHashes(menuData);

    console.log('Cleaning up log files...');
    await cleanUpLogFiles();
  } catch (err) {
    console.error(chalk.red(`Something went wrong: ${err.message}`));
  }
})();
