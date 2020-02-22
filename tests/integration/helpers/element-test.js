import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { helper } from '@ember/component/helper';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | element', function(hooks) {
  let originalOnerror;
  let expectEmberError;
  let expectedEmberErrors;

  setupRenderingTest(hooks);

  hooks.beforeEach(assert => {
    originalOnerror = Ember.onerror;

    expectEmberError = function(expectation) {
      let _onerror = Ember.onerror;

      expectedEmberErrors.push(expectation);

      Ember.onerror = function(error) {
        assert.throws(() => { throw error; }, expectedEmberErrors.pop());
        Ember.onerror = _onerror;
      };
    };

    expectedEmberErrors = [];
  });

  hooks.afterEach(assert => {
    Ember.onerror = originalOnerror;

    expectedEmberErrors.forEach(expected => {
      assert.strictEqual(undefined, expected);
    });
  });

  test('it renders a tag with the given tag name', async function(assert) {
    await render(hbs`
      {{#let (element "h1") as |Tag|}}
        <Tag id="content">hello world!</Tag>
      {{/let}}
    `);

    assert.dom('h1#content').hasText('hello world!');
  });

  test('it does not render any tags when passed an empty string', async function(assert) {
    await render(hbs`
      {{#let (element "") as |Tag|}}
        <Tag id="content">hello world!</Tag>
      {{/let}}
    `);

    assert.equal(this.element.innerHTML.trim(), 'hello world!');
  });

  test('it throws when pasased a number', async function() {
    expectEmberError(new Error('the argument passed to the `element` helper must be a string (you passed `123`)'));

    await render(hbs`
      <div>
        {{#let (element 123) as |Tag|}}
          <Tag id="content">hello world!</Tag>
        {{/let}}
      </div>
    `);
  });

  test('it throws when pasased a boolean', async function() {
    expectEmberError(new Error('the argument passed to the `element` helper must be a string (you passed `false`)'));

    await render(hbs`
      <div>
        {{#let (element false) as |Tag|}}
          <Tag id="content">hello world!</Tag>
        {{/let}}
      </div>
    `);
  });

  test('it throws when pasased null', async function() {
    expectEmberError(new Error('the argument passed to the `element` helper must be a string (you passed `null`)'));

    await render(hbs`
      <div>
        {{#let (element null) as |Tag|}}
          <Tag id="content">hello world!</Tag>
        {{/let}}
      </div>
    `);
  });

  test('it throws when pasased undefined', async function() {
    expectEmberError(new Error('the argument passed to the `element` helper must be a string (you passed `undefined`)'));

    await render(hbs`
      <div>
        {{#let (element undefined) as |Tag|}}
          <Tag id="content">hello world!</Tag>
        {{/let}}
      </div>
    `);
  });

  test('it throws when pasased an object', async function() {
    expectEmberError(new Error('the argument passed to the `element` helper must be a string'));

    this.set('value', Object.create(null));

    await render(hbs`
      <div>
        {{#let (element value) as |Tag|}}
          <Tag id="content">hello world!</Tag>
        {{/let}}
      </div>
    `);
  });

  test('it can be rendered multiple times', async function(assert) {
    await render(hbs`
      {{#let (element "h1") as |Tag|}}
        <Tag id="content-1">hello</Tag>
        <Tag id="content-2">world</Tag>
        <Tag id="content-3">!!!!!</Tag>
      {{/let}}
    `);

    assert.dom('h1#content-1').hasText('hello');
    assert.dom('h1#content-2').hasText('world');
    assert.dom('h1#content-3').hasText('!!!!!');
  });

  test('it can be passed to the component helper', async function(assert) {
    await render(hbs`
      {{#let (component (element "h1")) as |Tag|}}
        <Tag id="content-1">hello</Tag>
      {{/let}}

      {{#let (element "h2") as |h2|}}
        {{#let (component h2) as |Tag|}}
          <Tag id="content-2">world</Tag>
        {{/let}}
      {{/let}}

      {{#let (element "h3") as |h3|}}
        {{#component h3 id="content-3"}}!!!!!{{/component}}
      {{/let}}
    `);

    assert.dom('h1#content-1').hasText('hello');
    assert.dom('h2#content-2').hasText('world');
    assert.dom('h3#content-3').hasText('!!!!!');
  });

  test('it renders when the tag name changes', async function(assert) {
    let count = 0;

    this.owner.register('helper:counter', helper(() => ++count));

    this.set('tagName', 'h1');

    await render(hbs`
      {{#let (element this.tagName) as |Tag|}}
        <Tag id="content">rendered {{counter}} time(s)</Tag>
      {{/let}}
    `);

    assert.dom('h1#content').hasText('rendered 1 time(s)');
    assert.dom('h2#content').doesNotExist();
    assert.dom('h3#content').doesNotExist();

    this.set('tagName', 'h2');

    await settled();

    assert.dom('h1#content').doesNotExist();
    assert.dom('h2#content').hasText('rendered 2 time(s)');
    assert.dom('h3#content').doesNotExist();

    this.set('tagName', 'h2');

    await settled();

    assert.dom('h1#content').doesNotExist();
    assert.dom('h2#content').hasText('rendered 2 time(s)');
    assert.dom('h3#content').doesNotExist();

    this.set('tagName', 'h3');

    await settled();

    assert.dom('h1#content').doesNotExist();
    assert.dom('h2#content').doesNotExist();
    assert.dom('h3#content').hasText('rendered 3 time(s)');

    this.set('tagName', '');

    await settled();

    assert.dom('h1#content').doesNotExist();
    assert.dom('h2#content').doesNotExist();
    assert.dom('h3#content').doesNotExist();

    assert.equal(this.element.innerHTML.trim(), 'rendered 4 time(s)');

    this.set('tagName', 'h1');

    await settled();

    assert.dom('h1#content').hasText('rendered 5 time(s)');
    assert.dom('h2#content').doesNotExist();
    assert.dom('h3#content').doesNotExist();
  });

  test('it can be passed as argument', async function(assert) {
    this.set('tagName', 'p');

    await render(hbs`<ElementReceiver @tag={{element this.tagName}}>Test</ElementReceiver>`);

    assert.dom('p#content').hasText('Test');

    this.set('tagName', 'div');

    await settled();

    assert.dom('div#content').hasText('Test');

    this.set('tagName', '');

    await settled();

    assert.equal(this.element.innerHTML.trim(), 'Test');

    this.set('tagName', 'p');

    await settled();

    assert.dom('p#content').hasText('Test');
  });

  test('it can be invoked inline', async function(assert) {
    this.set('tagName', 'p');

    await render(hbs`{{element this.tagName}}`);

    assert.dom('p').exists();

    this.set('tagName', 'br');

    await settled();

    assert.dom('br').exists();

    this.set('tagName', '');

    assert.equal(this.element.innerHTML.trim(), '<!---->');

    this.set('tagName', 'p');

    await settled();

    assert.dom('p').exists();
  });
});
