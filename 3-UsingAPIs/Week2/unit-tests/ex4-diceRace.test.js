/* eslint-disable hyf/camelcase */
import { test, expect, describe, beforeAll, vi } from 'vitest';
import { simple } from 'acorn-walk';
import {
  beforeAllHelper,
  testTodosRemoved,
  testNoConsoleLog,
} from '../../../test-runner/unit-test-helpers';

describe('ex4-diceRace', () => {
  const state = {};
  let exported, rootNode, source, rollDice;

  beforeAll(async () => {
    ({ exported, rootNode, source } = await beforeAllHelper(__filename, {
      parse: true,
    }));
    rollDice = exported;

    rootNode &&
      simple(rootNode, {
        MemberExpression({ object, property }) {
          if (object.name === 'Promise' && property.name === 'race') {
            state.promiseAll = true;
          } else if (object.name === 'dice' && property.name === 'map') {
            state.diceMap = true;
          }
        },
      });
  });

  test('should exist and be executable', () => {
    expect(exported).toBeDefined();
  });

  testTodosRemoved(() => source);

  testNoConsoleLog('rollDice', () => rootNode);

  test('should use `dice.map()`', () => {
    expect(state.diceMap).toBeDefined();
  });

  test('should use `Promise.race()`', () => {
    expect(state.promiseAll).toBeDefined();
  });

  test('should resolve as soon as a die settles successfully', async () => {
    expect.assertions(3);
    expect(exported).toBeDefined();

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    const promise = rollDice();
    expect(promise).toBeInstanceOf(Promise);
    const result = await promise;
    expect(typeof result).toBe('string');

    promise.finally(() => {
      randomSpy.mockRestore();
    });
  });

  test('should reject with an Error as soon as a die rolls off the table', async () => {
    expect.assertions(3);
    expect(exported).toBeDefined();

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.999);

    try {
      const promise = rollDice();
      expect(promise).toBeInstanceOf(Promise);
      await promise;
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    } finally {
      randomSpy.mockRestore();
    }
  });
});
