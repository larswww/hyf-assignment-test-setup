import { describe, beforeAll, expect, test, vi } from 'vitest';
import { beforeAllHelper, testTodosRemoved, testNoConsoleLog } from '../../../test-runner/unit-test-helpers';

describe('ex5-pokerDiceChain', () => {
  let exported, source, rootNode, rollDice;

  beforeAll(async () => {
    ({ exported, rootNode, source } = await beforeAllHelper(__filename, {
      parse: true,
    }));
    rollDice = exported;
  });

  test('should exist and be executable', () => {
    expect(exported).toBeDefined();
  });

  testTodosRemoved(() => source);

  testNoConsoleLog('rollDice', () => rootNode);

  test('should resolve when all dice settle successfully', async () => {
    expect.assertions(4);
    expect(exported).toBeDefined();

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    const promise = rollDice();
    expect(promise).toBeInstanceOf(Promise);
    const result = await promise;
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(5);

    promise.finally(() => {
      randomSpy.mockRestore();
    });
  });

  test('should reject with an Error when a die rolls off the table', async () => {
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
