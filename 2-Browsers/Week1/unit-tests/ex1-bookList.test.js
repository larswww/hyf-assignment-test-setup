/* eslint-disable hyf/camelcase */
import { describe, test, beforeAll, expect } from 'vitest';
import { simple } from 'acorn-walk';
import {
  beforeAllHelper,
  testTodosRemoved,
} from '../../../test-runner/unit-test-helpers';
import { prepare, validateHTML } from '../../../test-runner/jsdom-helpers';

describe('Generated HTML', () => {
  const state = {};
  let document, source, rootNode;

  beforeAll(async () => {
    ({ document } = await prepare(__filename));
    state.outerHTML = document.documentElement.outerHTML;

    ({ rootNode, source } = await beforeAllHelper(__filename, {
      noRequire: true,
      parse: true,
    }));

    rootNode &&
      simple(rootNode, {
        VariableDeclarator({ id, init }) {
          if (id.name === 'myBooks' && init.type === 'ArrayExpression') {
            state.titlesAndAuthors = init.elements.reduce((acc, element) => {
              if (element.type === 'ObjectExpression') {
                element.properties.forEach((prop) => {
                  if (['title', 'author'].includes(prop.key.name)) {
                    acc.push(prop.value.value);
                  }
                });
              }
              return acc;
            }, []);
          }
        },
      });
  });

  test('HTML should be syntactically valid', () =>
    validateHTML(state.outerHTML));

  testTodosRemoved(() => source);

  test('should contain a <ul> that is a child of <div id="bookList">', () => {
    const ul = document.querySelector('div[id=bookList] > ul');
    expect(ul).toBeTruthy();
  });

  test('should contain a <ul> with 3 <li> elements', () => {
    const nodeList = document.querySelectorAll('ul > li');
    const result = nodeList ? nodeList.length : 0;
    expect(result).toBe(3);
  });

  test('should contain an <li> with title and author for each book of the `myBooks` array', () => {
    const nodeList = document.querySelectorAll('li');
    const result = nodeList
      ? Array.from(nodeList)
          .map((node) => node.textContent)
          .join(' ')
      : '';
    state.titlesAndAuthors.forEach((string) =>
      expect(result).toEqual(expect.stringContaining(string))
    );
  });

  test('should contain an <img> element for each book', () => {
    const nodeList = document.querySelectorAll('li img');
    const result = nodeList ? nodeList.length : 0;
    expect(result).toBe(3);
  });
});
