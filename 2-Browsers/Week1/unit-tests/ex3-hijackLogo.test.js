import { describe, test, beforeAll, expect } from 'vitest';
import { simple } from 'acorn-walk';
import {
  beforeAllHelper,
  testTodosRemoved,
} from '../../../test-runner/unit-test-helpers';

describe('hijackLogo', () => {
  let rootNode, source;
  const state = {};

  beforeAll(async () => {
    ({ rootNode, source } = await beforeAllHelper(__filename, {
      noRequire: true,
      parse: true,
    }));

    rootNode &&
      simple(rootNode, {
        MemberExpression({ property }) {
          if (['src', 'srcset'].includes(property.name)) {
            state[property.name] = true;
          }
        },
      });
  });

  testTodosRemoved(() => source);

  test('should set the `src` property', () => {
    expect(state.src).toBeDefined();
  });

  test('should set the `srcset` property', () => {
    expect(state.srcset).toBeDefined();
  });
});
