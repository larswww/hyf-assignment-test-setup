/* eslint-disable hyf/camelcase */
'use strict';
import { describe, test, beforeAll, expect, vi } from 'vitest';
import { simple } from 'acorn-walk';
import {
  beforeAllHelper,
  testTodosRemoved,
  testNoConsoleLog,
} from '../../../test-runner/unit-test-helpers';

describe('giveCompliment', () => {
  const state = {};
  let exported, rootNode, source, giveCompliment;

  beforeAll(async () => {
    await ({ exported, rootNode, source } = await beforeAllHelper(__filename, {
      parse: true,
    }));
    giveCompliment = exported;

    console.log(exported, rootNode, source);
    rootNode &&
      simple(rootNode, {
        VariableDeclarator({ id, init }) {
          console.log(id, init);
          if (id?.name === 'compliments' && init?.type === 'ArrayExpression') {
            state.compliments = init.elements.map((elem) => elem.value);
          }
        },
      });
  });

  test('should exist and be executable', () => {
    expect(giveCompliment).toBeDefined();
  });

  testTodosRemoved(() => source);

  testNoConsoleLog('giveCompliment', () => rootNode);

  test('should take a single parameter', () => {
    expect(giveCompliment).toHaveLength(1);
  });

  test('should include a `compliments` array inside its function body', () => {
    expect(state.compliments).toBeDefined();
  });

  test('the `compliments` array should be initialized with 10 strings', () => {
    expect(state.compliments).toHaveLength(10);
    expect(
      state.compliments.every((compliment) => typeof compliment === 'string')
    ).toBe(true);
  });

  test('should give a random compliment: You are `compliment`, `name`!', () => {
    expect(giveCompliment).toBeDefined();
    expect(state.compliments).toBeDefined();

    const name = 'HackYourFuture';

    const spy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const received = giveCompliment(name);

    expect(
      spy.mock.calls.length > 0 ? '' : 'compliment is not randomly selected'
    ).toBe('');
    spy.mockRestore();

    const [compliment] = state.compliments;
    expect(received).toBe(`You are ${compliment}, ${name}!`);
  });
});
