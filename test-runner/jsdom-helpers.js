import { expect } from 'vitest';
import path from 'path';
import jsdom from 'jsdom';
import { HtmlValidate } from 'html-validate';
import { htmlValidateOptions } from '../.htmlvalidate.json';
import stylish from '@html-validate/stylish';

const { JSDOM } = jsdom;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function prepare(testPath) {
  if (!testPath)
    throw new Error(
      'Test path not passed to prepare function, path of current test is needed'
    );
  const homeworkFolder = process.env.ASSIGNMENT_FOLDER || 'assignment';
  const exercisePath = testPath
    .replace('unit-tests', homeworkFolder)
    .replace(/\.test\.js$/, '');

  const virtualConsole = new jsdom.VirtualConsole();

  const { window } = await JSDOM.fromFile(
    path.join(exercisePath, 'index.html'),
    {
      runScripts: 'dangerously',
      resources: 'usable',
      virtualConsole,
    }
  );

  window.fetch = require('node-fetch');
  await sleep(1000);
  return window;
}

const htmlValidate = new HtmlValidate(htmlValidateOptions);

export async function validateHTML(outerHTML) {
  const htmlText = `<!DOCTYPE html>\n${outerHTML}`;
  const { results } = htmlValidate.validateString(htmlText);
  const validationReport = stylish(results);
  expect(validationReport).toBe('');
}
