import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import fg from 'fast-glob';
import chalk from 'chalk';
import 'dotenv/config';

import Cryptr from 'cryptr';

import { makePath } from './test-runner-helpers';

const solutionsFolderName = '@assignment';

async function decryptExerciseSolution(filePath, secret) {
  const cryptr = new Cryptr(secret);

  const jsonData = await fs.readFile(filePath, 'utf8');
  let exerciseJSON;

  try {
    exerciseJSON = JSON.parse(jsonData);
  } catch (_) {
    console.error(chalk.red(`${filePath}\n Error parsing JSON data`));
    return;
  }

  const { module, week, exercise, isFolder, files } = exerciseJSON;

  const solutionsDir = path.join(makePath(module, week, solutionsFolderName));
  if (!existsSync(solutionsDir)) {
    await fs.mkdir(solutionsDir);
  }

  let exerciseDir = solutionsDir;
  if (isFolder) {
    exerciseDir = path.join(solutionsDir, exercise);
    if (!existsSync(exerciseDir)) {
      await fs.mkdir(exerciseDir);
    }
  }

  const promises = files.map((file) => {
    const fileContents = cryptr.decrypt(file.data);
    console.log(`Decrypting exercise solution ${exercise}`);
    fs.writeFile(path.join(exerciseDir, file.filename), fileContents, 'utf8');
  });

  return Promise.all(promises);
}

(async () => {
  try {
    const secret = process.env.HYF_SECRET;
    if (!secret) {
      console.log('Secret is not set');
      process.exit(1);
    }

    const filePaths = await fg.sync(
      path.join(__dirname, '../test-encrypted/*.json').replace(/\\/g, '/')
    );

    const promises = filePaths.map((filePath) =>
      decryptExerciseSolution(filePath, secret)
    );

    await Promise.all(promises);
  } catch (err) {
    console.error(chalk.red(`Something went wrong: ${err.message}`));
  }
})();
