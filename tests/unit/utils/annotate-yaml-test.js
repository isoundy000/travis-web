import yamlAnnotator from 'travis/utils/annotate-yaml';
import { module, test } from 'qunit';

module('Unit | Utility | yaml-annotator', function (hooks) {
  test('it finds the line for a message', function (assert) {
    let yaml = 'sudo: required';
    let message = {
      code: 'cast',
      key: 'sudo',
    };

    let result = yamlAnnotator([message], yaml);
    assert.deepEqual(result, [{
      message,
      line: 0
    }]);
  });

  test('it finds the line for an empty message at root', function (assert) {
    let yaml = 'addons:';
    let message = {
      code: 'empty',
      key: 'root',
      args: {
        key: 'addons'
      }
    };

    let result = yamlAnnotator([message], yaml);
    assert.deepEqual(result, [{
      message,
      line: 0
    }]);
  });
});
