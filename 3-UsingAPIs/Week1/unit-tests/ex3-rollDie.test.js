/* eslint-disable hyf/camelcase */
import { describe, beforeAll, expect, test, vi } from 'vitest';
import { simple } from 'acorn-walk';
import { beforeAllHelper, testTodosRemoved } from '../../../test-runner/unit-test-helpers';

describe('rollDie', () => {
  const state = {};
  let exported, rootNode, source, rollDie;

  beforeAll(async () => {
    ({ exported, rootNode, source } = await beforeAllHelper(__filename, {
      parse: true,
    }));
    rollDie = exported;

    rootNode &&
      simple(rootNode, {
        NewExpression({ callee }) {
          if (callee.type === 'Identifier' && callee.name === 'Promise') {
            state.newPromise = true;
          }
        },
        CallExpression({ callee, arguments: args }) {
          if (['resolve', 'reject'].includes(callee.name)) {
            state[callee.name] = args.length;
          }
        },
      });
  });

  test('should exist and be executable', () => {
    expect(exported).toBeDefined();
  });

  testTodosRemoved(() => source);

  test('should call `new Promise()`', () => {
    expect(state.newPromise).toBeDefined();
  });

  test('`resolve()` should be called with a one argument', () => {
    expect(state.resolve).toBe(1);
  });

  test('`reject()` should be called with a one argument', () => {
    expect(state.reject).toBe(1);
  });

  test('should resolve when the die settles successfully', () => {
    expect.assertions(3);
    expect(exported).toBeDefined();

    const logSpy = vi.spyOn(console, 'log').mockImplementation();
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const setTimeoutSpy = vi
      .spyOn(global, 'setTimeout')
      .mockImplementation((cb) => cb());

    const promise = rollDie();
    expect(promise).toBeInstanceOf(Promise);
    const assertionPromise = expect(promise).resolves.toBeDefined();

    promise.finally(() => {
      setTimeoutSpy.mockRestore();
      randomSpy.mockRestore();
      logSpy.mockRestore();
    });

    return assertionPromise;
  });

  test('should reject with an Error when the die rolls off the table', async () => {
    expect.assertions(3);
    expect(exported).toBeDefined();

    const logSpy = vi.spyOn(console, 'log').mockImplementation();
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const setTimeoutSpy = vi
      .spyOn(global, 'setTimeout')
      .mockImplementation((cb) => cb());

    try {
      const promise = rollDie();
      expect(promise).toBeInstanceOf(Promise);
      await promise;
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    } finally {
      setTimeoutSpy.mockRestore();
      randomSpy.mockRestore();
      logSpy.mockRestore();
    }
  });
});
