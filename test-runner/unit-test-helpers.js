import { test, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parse } from 'acorn';
import { ancestor } from 'acorn-walk';

const defaultOptions = {
  parse: false,
  noRequire: false,
};

export async function beforeAllHelper(testFilePath, options = {}) {
  options = Object.assign(defaultOptions, options);
  const matches = testFilePath
    .replace(/\\/g, '/')
    .match(/^.*\/(.+)\/(Week\d)\/.+\/(.+)\.test\.js$/i);
  if (!matches) {
    throw new Error(`Unexpected test path: ${testFilePath}`);
  }

  const homeworkFolder = process.env.ASSIGNMENT_FOLDER || 'assignment';

  const [, module, week, exercise] = matches;
  let exercisePath = path.join(
    __dirname,
    `../${module}/${week}/${homeworkFolder}/${exercise}`
  );

  exercisePath = fs.existsSync(exercisePath)
    ? path.join(exercisePath, 'index.js')
    : exercisePath + '.js';

  const result = {};

  if (!options.noRequire) {
    try {
      // suppress all console.log output
      // vi.spyOn(console, 'log').mockImplementation();
      const module = await import(exercisePath);
      result.exported = module.default;
    } catch (err) {
      console.log('Error attempting to `import`:', err);
    }
  }

  result.source = fs.readFileSync(exercisePath, 'utf8');

  if (options.parse) {
    try {
      result.rootNode = parse(result.source, {
        ecmaVersion: 2020,
        sourceType: 'module',
      });
    } catch (_) {
      // Leave rootNode prop undefined
    }
  }

  return result;
}

export function findAncestor(type, ancestors) {
  let index = ancestors.length - 1;
  while (index >= 0) {
    if (ancestors[index].type === type) {
      return ancestors[index];
    }
    index--;
  }
  return null;
}

export function onloadValidator(state) {
  return ({ object, property }, ancestors) => {
    if (object.name === 'window' && property.type === 'Identifier') {
      if (property.name === 'addEventListener') {
        const callExpression = findAncestor('CallExpression', ancestors);
        if (callExpression) {
          if (callExpression.arguments.length === 2) {
            if (
              ['load', 'DOMContentLoaded'].includes(
                callExpression.arguments[0].value
              )
            ) {
              state.onload = true;
            }
            if (callExpression.arguments[1].type === 'CallExpression') {
              state.callError = true;
            }
          }
        }
      } else if (property.name === 'onload') {
        const assignmentExpression = findAncestor(
          'AssignmentExpression',
          ancestors
        );
        if (assignmentExpression) {
          state.onload = true;
          if (assignmentExpression.right.type === 'CallExpression') {
            state.callError = true;
          }
        }
      }
    }
  };
}

export function testTodosRemoved(getSource) {
  test('should have all TODO comments removed', () => {
    expect(/\bTODO\b/.test(getSource())).toBeFalsy();
  });
}

export function testNoConsoleLog(functionName, getRootNode) {
  test(`\`${functionName}\` should not contain unneeded console.log calls`, () => {
    const rootNode = getRootNode();
    let callsConsoleLog = false;
    rootNode &&
      ancestor(rootNode, {
        CallExpression({ callee }, ancestors) {
          if (
            callee.object?.name === 'console' &&
            callee.property?.name === 'log'
          ) {
            const functionDeclaration = findAncestor(
              'FunctionDeclaration',
              ancestors
            );
            if (functionDeclaration?.id?.name === functionName) {
              callsConsoleLog = true;
              return;
            }
            const variableDeclarator = findAncestor(
              'VariableDeclarator',
              ancestors
            );
            if (variableDeclarator?.id?.name === functionName) {
              callsConsoleLog = true;
            }
          }
        },
      });

    expect(callsConsoleLog).toBe(false);
  });
}
