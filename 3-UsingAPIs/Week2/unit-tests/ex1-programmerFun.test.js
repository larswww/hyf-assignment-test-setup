/* eslint-disable hyf/camelcase */
import { describe, beforeAll, expect, test } from 'vitest';
import { simple } from 'acorn-walk';
import { prepare, validateHTML } from '../../../test-runner/jsdom-helpers';
import {
  beforeAllHelper,
  testTodosRemoved,
} from '../../../test-runner/unit-test-helpers';

describe('programmerFun', () => {
  const state = {};
  let rootNode, source;

  beforeAll(async () => {
    const { document } = await prepare(__filename);
    state.outerHTML = document.documentElement.outerHTML;
    ({ rootNode, source } = await beforeAllHelper(__filename, {
      noRequire: true,
      parse: true,
    }));

    rootNode &&
      simple(rootNode, {
        CallExpression({ callee }) {
          if (callee.name === 'fetch') {
            state.fetch = true;
          }
        },
        TryStatement({ handler }) {
          if (handler.type === 'CatchClause') {
            state.tryCatch = true;
          }
        },
        FunctionDeclaration({ async }) {
          if (async) {
            state.async = true;
          }
        },
        AwaitExpression() {
          state.await = true;
        },
      });
  });

  test('HTML should be syntactically valid', () =>
    validateHTML(state.outerHTML));

  testTodosRemoved(() => source);

  test('should use `fetch()`', () => {
    expect(state.fetch).toBeDefined();
  });

  test('should use async/wait', () => {
    expect(state.async).toBeDefined();
    expect(state.await).toBeDefined();
  });

  test('should use try/catch', () => {
    expect(state.tryCatch).toBeDefined();
  });
});
