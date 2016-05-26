(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var has = ({}).hasOwnProperty;

  var aliases = {};

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf('components/' === 0)) {
        start = 'components/'.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return 'components/' + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var expand = (function() {
    var reg = /^\.\.?(\/|$)/;
    return function(root, name) {
      var results = [], parts, part;
      parts = (reg.test(name) ? root + '/' + name : name).split('/');
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part === '..') {
          results.pop();
        } else if (part !== '.' && part !== '') {
          results.push(part);
        }
      }
      return results.join('/');
    };
  })();
  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  globals.require = require;
})();
require.register("test/integration/pages/index_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

QUnit.module('integration/pages - index', {

  setup: function () {
    sinon.config.useFakeTimers = false;
    App.set('viewEnabled', true);
    App.__container__.lookup('controller:Slider').getViewDisplayParametersSuccessCallback({
      "ViewInstanceInfo": {
        "context_path": "/views/SLIDER/1.0.0/s1",
        "description": "DESCRIPTION",
        "label": "SLIDER LABEL",
        "properties": {
          "slider.user": "admin"
        }
      }
    });
    Ember.run(App, App.advanceReadiness);
  },

  teardown: function () {
    App.reset();
  }

});

test('route', function () {

  visit('/');
  andThen(function () {
    equal(currentRouteName(), 'slider_apps.index', 'route is valid');
    equal(currentPath(), 'slider_apps.index', 'path is valid');
    equal(currentURL(), '/', 'url is valid');
  });

});

test('sliderConfigs', function () {

  visit('/');
  // configs count may be changed by adding new slider-configs
  equal(App.SliderApp.store.all('sliderConfig').content.length, 4, 'slider configs should be set');

});

test('Create-App button', function () {

  visit('/');
  click('.create-app a');

  andThen(function () {
    equal(currentRouteName(), 'createAppWizard.step1', 'route is valid');
    equal(currentPath(), 'slider_apps.createAppWizard.step1', 'path is valid');
    equal(currentURL(), '/createAppWizard/step1', 'url is valid');
  });

});

test('Create-App button visible/hidden', function () {

  Em.run(function () {
    App.__container__.lookup('controller:application').set('hasConfigErrors', true);
  });

  visit('/');
  equal(find('.create-app').length, 0, 'Create App button should be hidden if some config errors');

});

test('Slider Title', function () {

  visit('/');
  equal(find('.slider-app-title').text(), 'SLIDER LABEL', 'App has valid Slider Title');

});

test('Slider Title Popover', function () {

  visit('/');
  triggerEvent('#slider-title', 'mouseenter'); // not hover!
  andThen(function () {
    equal(find('.popover').length, 1, 'popover exists');
    equal(find('.popover-title').text(), 'SLIDER LABEL', 'popover has valid title');
    equal(find('.slider-description').text(), 'DESCRIPTION', 'popover has slider description');
  });

});

test('Clear Filters', function () {

  visit('/');
  fillIn('#filter-row input:eq(0)', 'Some val');
  find('#filter-row select:eq(0)  :nth-child(1)').attr('selected', 'selected');
  fillIn('#filter-row input:eq(1)', 'Some val');
  fillIn('#filter-row input:eq(2)', 'Some val');
  find('#filter-row select:eq(1) :nth-child(1)').attr('selected', 'selected');

  andThen(function () {
    click('.clearFiltersLink');

    andThen(function () {
      equal(find('#filter-row input:eq(0)').val(), '');
      equal(find('#filter-row select:eq(0)').val(), 'All Status');
      equal(find('#filter-row input:eq(1)').val(), '');
      equal(find('#filter-row input:eq(2)').val(), '');
      equal(find('#filter-row select:eq(1)').val(), 'All Dates');

    });
  });

});

});

require.register("test/integration/pages/slider_errors_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

QUnit.module('integration/pages - index', {

  setup: function () {
    sinon.config.useFakeTimers = false;
    Ember.run(App, App.advanceReadiness);
    Em.run(function () {
      var p = {
        validations: [
          {message: 'Some mythical error'},
          {message: 'Error with DNA'}
        ],
        parameters: {}
      };
      App.__container__.lookup('controller:Slider').getParametersFromViewPropertiesSuccessCallback(p);
    });
  },

  teardown: function () {
    App.reset();
  }

});

test('Slider has validation errors', function () {

  visit('/');
  equal(find('.error-message').length, 2, 'Error-messages exist on the page');
  ok(find('.create-app a').attr('disabled'), 'Create App button is disabled');

});

test('Slider has no validation errors', function () {

  Em.run(function () {
    App.__container__.lookup('controller:Slider').getParametersFromViewPropertiesSuccessCallback({
      validations: [],
      parameters: {}
    });
  });

  visit('/');
  equal(find('.error-message').length, 0, 'No error-messages on the page');
  ok(!find('.create-app a').attr('disabled'), 'Create App button is enabled');

});
});

require.register("test/integration/processes/create_new_app_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var appTypes = {
  items: [
    {
      "id": "HBASE",
      "instance_name": "SLIDER_1",
      "typeComponents": [
        {
          "id": "HBASE_MASTER",
          "name": "HBASE_MASTER",
          "displayName": "HBASE_MASTER",
          "instanceCount": 1,
          "maxInstanceCount": 2,
          "yarnMemory": 1024,
          "yarnCpuCores": 1
        },
        {
          "id": "HBASE_REGIONSERVER",
          "name": "HBASE_REGIONSERVER",
          "category": "SLAVE",
          "displayName": "HBASE_REGIONSERVER",
          "priority": 2,
          "instanceCount": 2,
          "maxInstanceCount": 0,
          "yarnMemory": 1024,
          "yarnCpuCores": 1
        }
      ],
      "typeDescription": "Apache HBase is the Hadoop database, a distributed, scalable, big data store.\n        Requirements:\n        1. Ensure parent dir for path (hbase-site/hbase.rootdir) is accessible to the App owner.\n        2. Ensure ZK root (hbase-site/zookeeper.znode.parent) is unique for the App instance.",
      "typeName": "HBASE",
      "typePackageFileName": "hbase_v096.zip",
      "typeVersion": "0.96.0.2.1.1",
      "version": "1.0.0",
      "view_name": "SLIDER",
      "typeConfigs": {
        "agent.conf": "/slider/agent/conf/agent.ini",
        "application.def": "/slider/hbase_v096.zip",
        "config_types": "core-site,hdfs-site,hbase-site",
        "java_home": "/usr/jdk64/jdk1.7.0_45",
        "package_list": "files/hbase-0.96.1-hadoop2-bin.tar.gz",
        "site.core-site.fs.defaultFS": "${NN_URI}",
        "site.global.app_install_dir": "${AGENT_WORK_ROOT}/app/install",
        "site.global.metric_collector_host": "${NN_HOST}",
        "site.global.metric_collector_port": "6118",
        "site.global.metric_collector_lib": "file:///usr/lib/ambari-metrics-hadoop-sink/ambari-metrics-hadoop-sink.jar",
        "site.global.hbase_master_heapsize": "1024m",
        "site.global.hbase_regionserver_heapsize": "1024m",
        "site.global.security_enabled": "false",
        "site.global.user_group": "hadoop",
        "site.hbase-site.hbase.client.keyvalue.maxsize": "10485760",
        "site.hbase-site.hbase.client.scanner.caching": "100",
        "site.hbase-site.zookeeper.znode.parent": "/hbase-unsecure",
        "site.hdfs-site.dfs.namenode.https-address": "${NN_HOST}:50470"
      }
    }
  ]
};

var selectors = {
    buttonNext: 'button.next-btn',
    buttonBack: '.btn-area button.btn:eq(1)',
    step2: {
      content: '#step2 table tbody'
    },
    step3: {
      addPropertyButton: '#createAppWizard .add-property'
    }
  },
  newApp = {
    name: 'new_app',
    type: 'HBASE',
    includeFilePatterns: 'includeFilePatterns1',
    excludeFilePatterns: 'excludeFilePatterns1',
    frequency: '1',
    queueName: 'queueName1',
    specialLabel: 'specialLabel1',
    selectedYarnLabel: 'selectedYarnLabel1',
    components: {
      HBASE_MASTER: 4,
      HBASE_REGIONSERVER: 5
    },
    yarnLabel: 'SOME LABEL',
    categoriesCount: 6,
    newConfig: {
      name: 'new_property',
      value: 'new_value'
    }
  };

QUnit.module('integration/processes - Create New App', {

  setup: function () {

    sinon.config.useFakeTimers = false;

    $.mockjax({
      type: 'GET',
      url: '*',
      status: '200',
      dataType: 'json',
      responseText: {}
    });

    Em.run(App, App.advanceReadiness);
    Em.run(function () {
      App.set('viewEnabled', true); // Important!
      App.ApplicationTypeMapper.parse(appTypes);
    });
  },

  teardown: function () {
    App.reset();
    $.mockjax.clear();
  }

});

test('basic (no errors - just valid data)', function () {

  /* STEP 1 */
  visit('/createAppWizard/step1');
  equal(find(selectors.buttonNext).attr('disabled'), 'disabled', '"Next"-button should be disabled at the beginning of Step 1');
  equal(find('select.type-select option').length, 1, '1 App Type loaded - 1 App Type in select');
  fillIn('#app-name-input', newApp.name);
  andThen(function () {
    equal(find(selectors.buttonNext).attr('disabled'), null, '"Next"-button should be enabled after user input a valid name');
  });
  click(selectors.buttonNext);
  equal(find(selectors.buttonNext).attr('disabled'), 'disabled', '"Next"-button should be disabled after click on it');

  andThen(function () {
    /* STEP 2 */
    equal(currentURL(), '/createAppWizard/step2', 'User comes to Step 2');

    equal(find(selectors.buttonNext).attr('disabled'), null, '"Next"-button should be enabled at the beginning of Step 2');
    equal(find(selectors.step2.content + ' tr').length, 2, 'Selected App Type has 2 components');
    equal(find(selectors.step2.content + ' tr:eq(0) .numInstances').val(), '1', 'Component count for 1st component is valid by default');
    equal(find(selectors.step2.content + ' tr:eq(1) .numInstances').val(), '2', 'Component count for 2nd component is valid by default');

    fillIn(selectors.step2.content + ' tr:eq(0) .numInstances', newApp.components.HBASE_MASTER);
    fillIn(selectors.step2.content + ' tr:eq(1) .numInstances', newApp.components.HBASE_REGIONSERVER);

    equal(find(selectors.step2.content + ' tr:eq(0) .yarnLabel').attr('disabled'), 'disabled', 'YARN label input-field should be disabled by default');
    find(selectors.step2.content + ' tr:eq(0) .checkbox-inline').click();
    equal(find(selectors.step2.content + ' tr:eq(0) .yarnLabel').attr('disabled'), null, 'YARN label input-field should be enabled after checkbox checked');

    click(selectors.buttonNext);
    andThen(function () {
      /* STEP 3 */
      equal(currentURL(), '/createAppWizard/step3', 'User comes to Step 3');
      equal(find(selectors.buttonNext).attr('disabled'), null, '"Next"-button should be enabled at the beginning of Step 3');
      equal(find('.panel').length, newApp.categoriesCount, 'Config categories count');
    });
    // Add Custom Property
    click('button.btn-link');
    fillIn('.modal-dialog input:eq(0)', newApp.newConfig.name);
    fillIn('.modal-dialog input:eq(1)', newApp.newConfig.value);
    click('.modal-dialog .btn-success');

    click(selectors.buttonNext);

    andThen(function () {
      /* STEP 4 */
      equal(currentURL(), '/createAppWizard/step4', 'User comes to Step 4');
      equal(find(selectors.buttonNext).attr('disabled'), null, '"Next"-button should be enabled at the beginning of Step 4');

      ok(find('#step4').text().indexOf('App Name: ' + newApp.name) > -1, 'App Name exists');
      ok(find('#step4').text().indexOf('App Type: ' + newApp.type) > -1, 'App Type exists');
      ok(find('#step4').text().indexOf('HBASE_MASTER: ' + newApp.components.HBASE_MASTER) > -1, 'HBASE_MASTER count exists');
      ok(find('#step4').text().indexOf('HBASE_REGIONSERVER: ' + newApp.components.HBASE_REGIONSERVER) > -1, 'HBASE_REGIONSERVER count exists');
      ok(find('pre').text().indexOf('"' + newApp.newConfig.name + '":"' + newApp.newConfig.value + '"') > -1, 'Custom property exists');

    });
  });

});

test('check step1', function () {

  visit('/createAppWizard/step1');
  equal(find(selectors.buttonNext).attr('disabled'), 'disabled', '"Next"-button should be disabled at the beginning of Step 1');
  fillIn('#app-name-input', '1s');
  andThen(function () {
    equal(find(selectors.buttonNext).attr('disabled'), 'disabled', '"Next"-button should be disabled because invalid name provided');
  });

  fillIn('#app-name-input', '-');
  andThen(function () {
    equal(find(selectors.buttonNext).attr('disabled'), 'disabled', '"Next"-button should be disabled because invalid name provided (2)');
  });

  fillIn('#app-name-input', 's$1');
  andThen(function () {
    equal(find(selectors.buttonNext).attr('disabled'), 'disabled', '"Next"-button should be disabled because invalid name provided (2)');
  });

  equal(find('.special-label').attr('disabled'), 'disabled', '"Special YARN label"-textfield should be disabled');
  find('.special-label-radio').click();
  equal(find('.special-label').attr('disabled'), null, '"Special YARN label"-textfield should be enabled if proper radio-button selected');

});

test('check step2', function () {

  visit('/createAppWizard/step1');
  fillIn('#app-name-input', newApp.name);
  click(selectors.buttonNext);

  andThen(function () {
    fillIn(selectors.step2.content + ' tr:eq(0) .numInstances', -1);
    andThen(function () {
      equal(find(selectors.buttonNext).attr('disabled'), 'disabled', '"Next"-button should be disabled because invalid value provided for Instances count');
      equal(find('.alert').length, 1, 'Alert-box is on page');
    });
    fillIn(selectors.step2.content + ' tr:eq(0) .numInstances', 1);
    andThen(function () {
      equal(find(selectors.buttonNext).attr('disabled'), null);
      equal(find('.alert').length, 0, 'Alert-box is hidden');
    });
    fillIn(selectors.step2.content + ' tr:eq(0) .yarnMemory', -1);
    andThen(function () {
      equal(find(selectors.buttonNext).attr('disabled'), 'disabled', '"Next"-button should be disabled because invalid value provided for Memory');
      equal(find('.alert').length, 1, 'Alert-box is on page');
    });
    fillIn(selectors.step2.content + ' tr:eq(0) .yarnMemory', 1024);
    andThen(function () {
      equal(find(selectors.buttonNext).attr('disabled'), null);
      equal(find('.alert').length, 0, 'Alert-box is hidden');
    });
    fillIn(selectors.step2.content + ' tr:eq(0) .yarnCPU', -1);
    andThen(function () {
      equal(find(selectors.buttonNext).attr('disabled'), 'disabled', '"Next"-button should be disabled because invalid value provided for CPU Cores');
      equal(find('.alert').length, 1, 'Alert-box is on page');
    });
    fillIn(selectors.step2.content + ' tr:eq(0) .yarnCPU', 1024);
    andThen(function () {
      equal(find(selectors.buttonNext).attr('disabled'), null);
      equal(find('.alert').length, 0, 'Alert-box is hidden');
    });

    equal(find(selectors.step2.content + ' tr:eq(0) .yarnLabel').attr('disabled'), 'disabled', 'Labels-field is disabled by default');
    find(selectors.step2.content + ' tr:eq(0) .checkbox-inline').click();
    andThen(function () {
      equal(find(selectors.step2.content + ' tr:eq(0) yarnLabel').attr('disabled'), null, 'Labels-field should be enabled when checkbox clicked');
    });
  });

});

test('check step2 back', function () {

  visit('/createAppWizard/step1');
  fillIn('#app-name-input', newApp.name);
  fillIn('.includeFilePatterns', newApp.includeFilePatterns);
  fillIn('.excludeFilePatterns', newApp.excludeFilePatterns);
  fillIn('.frequency', newApp.frequency);
  fillIn('.queueName', newApp.queueName);
  find('.selectedYarnLabel:eq(2)').click();
  fillIn('.special-label', newApp.specialLabel);
  click(selectors.buttonNext);

  andThen(function () {
    click(selectors.buttonBack);
    andThen(function () {
      equal(find('#app-name-input').val(), newApp.name, 'Name is restored');
      equal(find('.includeFilePatterns').val(), newApp.includeFilePatterns, 'includeFilePatterns is restored');
      equal(find('.excludeFilePatterns').val(), newApp.excludeFilePatterns, 'excludeFilePatterns is restored');
      equal(find('.frequency').val(), newApp.frequency, 'frequency is restored');
      equal(find('.queueName').val(), newApp.queueName, 'queueName is restored');
      equal(find('.special-label').val(), newApp.specialLabel, 'specialLabel is restored');
    });
  });

});

test('check step3', function () {

  visit('/createAppWizard/step1');
  fillIn('#app-name-input', newApp.name);
  click(selectors.buttonNext);

  andThen(function () {
    click(selectors.buttonNext);

    andThen(function () {
      // Step 3

      click(selectors.step3.addPropertyButton);
      andThen(function () {
        fillIn('.new-config-name:eq(0)', '!!');
        click('.modal-dialog:eq(0) .btn-success');
        andThen(function () {
          equal(find('.modal-dialog:eq(0) .alert').length, 1, 'Error-message for invalid config name exists');
        });

        fillIn('.new-config-name:eq(0)', 'agent.conf'); // config already exists
        click('.modal-dialog:eq(0) .btn-success');
        andThen(function () {
          equal(find('.modal-dialog:eq(0) .alert').length, 1, 'Error-message for existing config name');
        });

        click('.modal-dialog:eq(0) .btn-default');
        andThen(function () {
          click(selectors.step3.addPropertyButton);
          andThen(function () {
            equal(find('.new-config-name:eq(0)').val(), '', 'New config name should be empty on second modal opening');
            equal(find('.new-config-value:eq(0)').val(), '', 'New config value should be empty on second modal opening');
          });
        });
      });
    });
  });
});

test('check step3 back', function () {

  visit('/createAppWizard/step1');
  fillIn('#app-name-input', newApp.name);
  click(selectors.buttonNext);

  andThen(function () {
    fillIn(selectors.step2.content + ' tr:eq(0) .numInstances', newApp.components.HBASE_MASTER);
    find(selectors.step2.content + ' tr:eq(0) .checkbox-inline').click();
    fillIn(selectors.step2.content + ' tr:eq(0) .yarnLabel', newApp.yarnLabel);
    fillIn(selectors.step2.content + ' tr:eq(1) .numInstances', newApp.components.HBASE_REGIONSERVER);
    click(selectors.buttonNext);

    andThen(function () {
      click(selectors.buttonBack);

      andThen(function () {
        equal(find(selectors.step2.content + ' tr:eq(0) .numInstances').val(), newApp.components.HBASE_MASTER, 'Components count restored');
        equal(find(selectors.step2.content + ' tr:eq(0) .checkbox-inline').attr('checked'), 'checked', 'YARN label checkbox restored');
        equal(find(selectors.step2.content + ' tr:eq(0) .yarnLabel').val(), newApp.yarnLabel, 'YARN label input restored');
        equal(find(selectors.step2.content + ' tr:eq(0) .yarnLabel').attr('disabled'), null, 'YARN label input not disabled');
        equal(find(selectors.step2.content + ' tr:eq(1) .numInstances').val(), newApp.components.HBASE_REGIONSERVER, 'Components count restored (2)');
      });
    });
  });

});
});

require.register("test/unit/controllers/createAppWizard/step1_controller_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

moduleFor('controller:createAppWizardStep1', 'App.CreateAppWizardStep1Controller', {

  needs: [
    'controller:createAppWizard'
  ],

  setup: function () {
    sinon.stub(App.ajax, 'send', Em.K);
  },

  teardown: function () {
    App.ajax.send.restore();
  }

});

var selectedType = Em.Object.create({
  id: 'HBASE',
  configs: {
    n0: 'v0'
  }
});

test('appWizardController', function () {

  expect(1);

  var controller = this.subject({
    controllers: {
      createAppWizard: {
        key: 'value0'
      }
    }
  });

  Em.run(function () {
    controller.set('controllers.createAppWizard.key', 'value1');
  });

  equal(controller.get('appWizardController.key'), 'value1', 'should link to App.CreateAppWizardController');

});

test('isAppTypesError', function () {

  expect(2);

  var controller = this.subject({availableTypes: {content: []}});
  equal(controller.get('isAppTypesError'), true, 'should be true if no app types provided');

  Em.run(function () {
    controller.set('availableTypes', {content: [
      {}
    ]});
  });
  equal(controller.get('isAppTypesError'), false, 'should be false if app types provided');

});

test('typeDescription', function () {

  expect(2);

  var controller = this.subject();

  equal(controller.get('typeDescription'), '', 'default typeDescription');

  Em.run(function () {
    controller.set('selectedType', Em.Object.create({
      displayName: 'HBASE'
    }));
  });

  equal(controller.get('typeDescription'), Em.I18n.t('wizard.step1.typeDescription').format('HBASE'), 'typeDescription is set from selectedType.displayName');

});

test('initializeNewApp', function () {

  expect(9);

  var controller = this.subject({
      store: Em.Object.create({
        all: function () {
          return [];
        }
      })
    }),
    app = Em.Object.create({
      name: 'n',
      includeFilePatterns: 'i',
      excludeFilePatterns: 'e',
      frequency: 'f',
      queueName: 'q',
      specialLabel: 's',
      selectedYarnLabel: 'y'
    }),
    title = '{0} should be taken from appWizardController.newApp';

  Em.run(function () {
    controller.initializeNewApp();
  });

  equal(controller.get('newApp.selectedYarnLabel'), 0, 'selectedYarnLabel should be 0 as default');

  var values = Em.keys(controller.get('newApp')).without('appType').without('configs').without('selectedYarnLabel').map(function (item) {
    return controller.get('newApp.' + item);
  });

  propEqual(values.uniq(), [false, ''], 'should set properties values to empty strings as default');

  Em.run(function () {
    controller.set('controllers.createAppWizard.newApp', app);
    controller.initializeNewApp();
  });

  Em.keys(app).forEach(function (key) {
    equal(controller.get('newApp.' + key), app.get(key), title.format(key));
  });

});

test('loadAvailableTypes', function () {

  expect(1);

  var testObject = {
      key: 'value'
    },
    controller = this.subject({
    store: Em.Object.create({
      all: function () {
        return testObject;
      }
    })
  });

  Em.run(function () {
    controller.loadAvailableTypes();
  });

  propEqual(controller.get('availableTypes'), testObject, 'availableTypes should be loaded from store');

});

test('nameValidator', function () {
  expect(7);

  var tests = [
    { name: 'Slider', e: true },
    { name: '_slider', e: true },
    { name: 'slider*2', e: true },
    { name: 'slider', e: false },
    { name: 'slider_1-2_3', e: false }
  ];

  var controller = this.subject({isNameError: false,
    store: Em.Object.create({
      all: function (key) {
        return {
          sliderApp: [
            { name: 'slider2' }
          ]
        }[key];
      }
    })
  });

  tests.forEach(function (test) {
    Em.run(function () {
      controller.set('newApp', { name: test.name});
    });

    equal(controller.get('isNameError'), test.e, 'Name `' + test.name + '` is' + (!!test.e ? ' not ' : ' ') + 'valid');
  });

  Em.run(function () {
    controller.set('newApp', { name: 'slider2'});
  });

  equal(controller.get('isNameError'), true, 'Name `slider2` already exist');
  equal(controller.get('nameErrorMessage'), Em.I18n.t('wizard.step1.nameRepeatError'), 'Error message should be shown');
});

test('validateAppNameSuccessCallback', function () {

  expect(5);

  var title = 'newApp should have {0} set',
    controller = this.subject({
      newApp: Em.Object.create(),
      selectedType: selectedType
    });

  Em.run(function () {
    controller.set('appWizardController.transitionToRoute', Em.K);
    controller.validateAppNameSuccessCallback();
  });

  deepEqual(controller.get('newApp.appType'), selectedType, title.format('appType'));
  deepEqual(controller.get('newApp.configs'), selectedType.configs, title.format('configs'));
  deepEqual(controller.get('newApp.predefinedConfigNames'), Em.keys(selectedType.configs), title.format('predefinedConfigNames'));
  deepEqual(controller.get('appWizardController.newApp'), controller.get('newApp'), 'newApp should be set in CreateAppWizardController');
  equal(controller.get('appWizardController.currentStep'), 2, 'should proceed to the next step');

});

test('validateAppNameErrorCallback', function () {

  expect(7);

  var controller = this.subject();

  Em.run(function () {
    sinon.stub(Bootstrap.ModalManager, 'open', Em.K);
    sinon.stub(controller, 'defaultErrorHandler', Em.K);
    controller.validateAppNameErrorCallback({
      status: 409
    }, null, null, null, {
      name: 'name'
    });
  });

  ok(Bootstrap.ModalManager.open.calledOnce, 'app name conflict popup should be displayed');
  ok(!controller.defaultErrorHandler.called, 'defaultErrorHandler shouldn\'t be executed');

  Em.run(function () {
    Bootstrap.ModalManager.open.restore();
    controller.defaultErrorHandler.restore();
    sinon.stub(Bootstrap.ModalManager, 'open', Em.K);
    sinon.stub(controller, 'defaultErrorHandler', Em.K);
    controller.validateAppNameErrorCallback({
      status: 400
    }, null, null, {
      url: 'url',
      type: 'type'
    }, null);
  });

  ok(!Bootstrap.ModalManager.open.called, 'app name conflict popup shouldn\'t be displayed');
  ok(controller.defaultErrorHandler.calledOnce, 'defaultErrorHandler should be executed');
  propEqual(controller.defaultErrorHandler.firstCall.args[0], {
    status: 400
  }, 'should pass request info to defaultErrorHandler');
  equal(controller.defaultErrorHandler.firstCall.args[1], 'url', 'should pass url to defaultErrorHandler');
  equal(controller.defaultErrorHandler.firstCall.args[2], 'type', 'should pass type to defaultErrorHandler');

  Bootstrap.ModalManager.open.restore();
  controller.defaultErrorHandler.restore();

});

test('validateAppNameCompleteCallback', function () {

  expect(1);

  var controller = this.subject({
    validateAppNameRequestExecuting: true
  });

  Em.run(function () {
    controller.validateAppNameCompleteCallback();
  });

  ok(!controller.get('validateAppNameRequestExecuting'), 'validateAppNameRequestExecuting should be set to false');

});

test('isSubmitDisabled', function () {

  expect(6);

  var controller = this.subject({
      availableTypes: {
        content: [
          {}
        ]
      },
      isNameError: false,
      newApp: {
        name: 'some'
      }
    }),
    cases = [
      {
        key: 'validateAppNameRequestExecuting',
        title: 'request is executing'
      },
      {
        key: 'isNameError',
        title: 'app name is invalid'
      },
      {
        key: 'isAppTypesError',
        title: 'no app types are available'
      },
      {
        key: 'isFrequencyError',
        title: 'frequency value is invalid'
      }
    ],
    keys = cases.mapProperty('key'),
    failTitle = 'submit button is disabled when {0}';

  equal(controller.get('isSubmitDisabled'), false);

  cases.forEach(function (item) {
    Em.run(function () {
      keys.forEach(function (key) {
        controller.set(key, item.key != key);
      });
    });
    equal(controller.get('isSubmitDisabled'), true, failTitle.format(item.title));
  });

  Em.run(function () {
    keys.forEach(function (key) {
      controller.set(key, true);
    });
    controller.set('newApp.name', '');
  });
  equal(controller.get('isSubmitDisabled'), true, failTitle.format('no app name is specified'));

});

test('frequencyValidator', function () {

  expect(8);

  var controller = this.subject(),
    cases = [
      {
        value: '123',
        isFrequencyError: false,
        frequencyErrorMessage: '',
        title: 'numeric value'
      },
      {
        value: '123a',
        isFrequencyError: true,
        frequencyErrorMessage: Em.I18n.t('wizard.step1.frequencyError'),
        title: 'value contains letter'
      },
      {
        value: '123-',
        isFrequencyError: true,
        frequencyErrorMessage: Em.I18n.t('wizard.step1.frequencyError'),
        title: 'value contains special symbol'
      },
      {
        value: '123 ',
        isFrequencyError: true,
        frequencyErrorMessage: Em.I18n.t('wizard.step1.frequencyError'),
        title: 'value contains space'
      }
    ],
    errorTitle = '{0}: isFrequencyError is set correctly',
    messageTitle = '{0}: error message is set correctly';

  cases.forEach(function (item) {
    Em.run(function () {
      controller.set('newApp', {
        frequency: item.value
      });
    });
    equal(controller.get('isFrequencyError'), item.isFrequencyError, errorTitle.format(item.title));
    equal(controller.get('frequencyErrorMessage'), item.frequencyErrorMessage, messageTitle.format(item.title));
  });

});

test('saveApp', function () {

  expect(4);

  var controller = this.subject({
      newApp: Em.Object.create(),
      selectedType: selectedType
    }),
    saveAppTitle = 'newApp should have {0} set';

  Em.run(function () {
    controller.saveApp();
  });

  propEqual(controller.get('newApp.appType'), selectedType, saveAppTitle.format('appType'));
  propEqual(controller.get('newApp.configs'), selectedType.configs, saveAppTitle.format('configs'));
  deepEqual(controller.get('newApp.predefinedConfigNames'), Em.keys(selectedType.configs), saveAppTitle.format('predefinedConfigNames'));
  propEqual(controller.get('appWizardController.newApp'), controller.get('newApp'), 'newApp should be set in CreateAppWizardController');

});

test('actions.submit', function () {

  expect(3);

  var controller = this.subject({
    validateAppNameRequestExecuting: false,
    validateAppNameSuccessCallback: Em.K,
    newApp: {
      name: 'name'
    }
  });

  Em.run(function () {
    controller.send('submit');
  });

  ok(controller.get('validateAppNameRequestExecuting'), 'validateAppNameRequestExecuting should be set to true');
  ok(App.ajax.send.calledOnce, 'request to server should be sent');
  equal(App.ajax.send.firstCall.args[0].data.name, 'name', 'name should be passed');

});
});

require.register("test/unit/controllers/createAppWizard/step2_controller_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

moduleFor('controller:createAppWizardStep2', 'App.CreateAppWizardStep2Controller', {

  needs: [
    'controller:createAppWizard'
  ]

});

var title = 'should be {0}';

test('appWizardController', function () {

  expect(1);

  var controller = this.subject({
    controllers: {
      createAppWizard: {
        key: 'value0'
      }
    }
  });

  Em.run(function () {
    controller.set('controllers.createAppWizard.key', 'value1');
  });

  equal(controller.get('appWizardController.key'), 'value1', 'should link to App.CreateAppWizardController');

});

test('isError', function () {

  expect(18);

  var cases = [
      {
        content: [],
        isError: false
      },
      {
        content: [
          Em.Object.create()
        ],
        isError: true
      },
      {
        content: [
          Em.Object.create({
            numInstances: '0'
          })
        ],
        isError: true
      },
      {
        content: [
          Em.Object.create({
            yarnMemory: '0'
          })
        ],
        isError: true
      },
      {
        content: [
          Em.Object.create({
            yarnCPU: '0'
          })
        ],
        isError: true
      },
      {
        content: [
          Em.Object.create({
            numInstances: ' \r\n',
            yarnMemory: ' \r\n',
            yarnCPU: ' \r\n'
          })
        ],
        isError: true
      },
      {
        content: [
          Em.Object.create({
            numInstances: 'n',
            yarnMemory: '0',
            yarnCPU: '0'
          })
        ],
        isError: true
      },
      {
        content: [
          Em.Object.create({
            numInstances: '0',
            yarnMemory: 'n',
            yarnCPU: '0'
          })
        ],
        isError: true
      },
      {
        content: [
          Em.Object.create({
            numInstances: '0',
            yarnMemory: '0',
            yarnCPU: 'n'
          })
        ],
        isError: true
      },
      {
        content: [
          Em.Object.create({
            numInstances: '0.5',
            yarnMemory: '0',
            yarnCPU: '0'
          })
        ],
        isError: true
      },
      {
        content: [
          Em.Object.create({
            numInstances: '0',
            yarnMemory: '0.5',
            yarnCPU: '0'
          })
        ],
        isError: true
      },
      {
        content: [
          Em.Object.create({
            numInstances: '0',
            yarnMemory: '0',
            yarnCPU: '0.5'
          })
        ],
        isError: true
      },
      {
        content: [
          Em.Object.create({
            numInstances: '-1',
            yarnMemory: '0',
            yarnCPU: '0'
          })
        ],
        isError: true
      },
      {
        content: [
          Em.Object.create({
            numInstances: '0',
            yarnMemory: '-1',
            yarnCPU: '0'
          })
        ],
        isError: true
      },
      {
        content: [
          Em.Object.create({
            numInstances: '0',
            yarnMemory: '0',
            yarnCPU: '-1'
          })
        ],
        isError: true
      },
      {
        content: [
          Em.Object.create({
            numInstances: '0',
            yarnMemory: '0',
            yarnCPU: '0'
          }),
          Em.Object.create({
            numInstances: '-1',
            yarnMemory: '0',
            yarnCPU: '0'
          })
        ],
        isError: true
      },
      {
        content: [
          Em.Object.create({
            numInstances: '0',
            yarnMemory: '0',
            yarnCPU: '0'
          })
        ],
        isError: false
      },
      {
        content: [
          Em.Object.create({
            numInstances: '0',
            yarnMemory: '0',
            yarnCPU: '0'
          }),
          Em.Object.create({
            numInstances: '1',
            yarnMemory: '1',
            yarnCPU: '1'
          })
        ],
        isError: false
      }
    ],
    controller = this.subject();

  cases.forEach(function (item) {

    Em.run(function () {
      controller.set('content', item.content);
    });

    equal(controller.get('isError'), item.isError, title.format(item.isError));

  });

});

test('isSubmitDisabled', function () {

  expect(2);

  var cases = [true, false],
  controller = this.subject();

  cases.forEach(function (item) {

    Em.run(function () {
      controller.set('isError', item);
    });

    equal(controller.get('isSubmitDisabled'), item, title.format(item));

  });

});

test('initializeNewApp', function () {

  expect(4);

  var controller = this.subject();

  Em.run(function () {
    controller.set('controllers.createAppWizard.newApp', {
      components: [
        Em.Object.create({
          name: 'n'
        })
      ]
    });
    controller.initializeNewApp();
  });

  equal(controller.get('newApp.components.length'), 1, 'newApp should be taken from appWizardController');
  equal(controller.get('newApp.components')[0].get('name'), 'n', 'newApp has correct names of components');
  equal(controller.get('content.length'), 1, 'content should be taken from appWizardController');
  equal(controller.get('content')[0].get('name'), 'n', 'content has correct names of components');

});

test('loadTypeComponents', function () {

  expect(8);

  var toStringTitle = 'should convert {0} to string',
    controller = this.subject();

  Em.run(function () {
    controller.set('newApp', {
      appType: {
        components: [
          Em.Object.create({
            name: 'n0',
            defaultNumInstances: 0,
            defaultYARNMemory: 128,
            defaultYARNCPU: 1
          })
        ]
      }
    });
    controller.set('controllers.createAppWizard.newApp', {
      components: [
        Em.Object.create({
          name: 'n1'
        })
      ]
    });
    controller.loadTypeComponents();
  });

  equal(controller.get('content.length'), 1, 'content should contain one item');
  equal(controller.get('content')[0].get('name'), 'n1', 'should take components from wizard controller');

  Em.run(function () {
    controller.get('content').clear();
    controller.get('controllers.createAppWizard.newApp.components').clear();
    controller.loadTypeComponents();
  });

  equal(controller.get('content.length'), 1, 'content contains one item');
  equal(controller.get('content')[0].get('name'), 'n0', 'should take components from step controller');
  deepEqual(controller.get('content')[0].get('numInstances'), '0', toStringTitle.format('numInstances'));
  deepEqual(controller.get('content')[0].get('yarnMemory'), '128', toStringTitle.format('yarnMemory'));
  deepEqual(controller.get('content')[0].get('yarnCPU'), '1', toStringTitle.format('yarnCPU'));

  Em.run(function () {
    controller.get('content').clear();
    controller.get('controllers.createAppWizard.newApp.components').clear();
    controller.get('newApp.appType.components').clear();
    controller.loadTypeComponents();
  });

  equal(controller.get('content.length'), 0, 'content should remain empty');

});

test('isNotInteger', function () {

  expect(6);

  var controller = this.subject({});
  equal(controller.isNotInteger('1'), false, 'Valid value');
  equal(controller.isNotInteger('-1'), true, 'Invalid value (1)');
  equal(controller.isNotInteger('bbb'), true, 'Invalid value (2)');
  equal(controller.isNotInteger('1a'), true, 'Invalid value (3)');
  equal(controller.isNotInteger('!@#$%^'), true, 'Invalid value (4)');
  equal(controller.isNotInteger(null), true, 'Invalid value (5)');

});

test('saveComponents', function () {

  expect(2);

  var controller = this.subject({
    content: [
      Em.Object.create({
        name: 'n'
      })
    ]
  });

  Em.run(function () {
    controller.set('controllers.createAppWizard.newApp', {});
    controller.saveComponents();
  });

  equal(controller.get('appWizardController.newApp.components.length'), 1, 'components in wizard controller should be set from content');
  equal(controller.get('appWizardController.newApp.components')[0].get('name'), 'n', 'components in wizard controller have correct names');

});

test('actions.submit', function () {

  expect(3);

  var controller = this.subject({
    content: [
      Em.Object.create({
        name: 'n'
      })
    ]
  });

  Em.run(function () {
    controller.get('controllers.createAppWizard').setProperties({
      newApp: {},
      currentStep: 2,
      transitionToRoute: Em.K
    });
    controller.send('submit');
  });

  equal(controller.get('appWizardController.newApp.components.length'), 1, 'components in wizard controller should be set from content');
  equal(controller.get('appWizardController.newApp.components')[0].get('name'), 'n', 'components in wizard controller have correct names');
  equal(controller.get('appWizardController.currentStep'), '3', 'should go to step3');

});

});

require.register("test/unit/controllers/createAppWizard/step3_controller_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

moduleFor('controller:createAppWizardStep3', 'App.CreateAppWizardStep3Controller', {

  needs: [
    'controller:createAppWizard'
  ],

  teardown: function () {
    App.reset();
  }

});

test('appWizardController', function () {

  expect(1);

  var controller = this.subject({
    controllers: {
      createAppWizard: {
        key: 'value0'
      }
    }
  });

  Em.run(function () {
    controller.set('controllers.createAppWizard.key', 'value1');
  });

  equal(controller.get('appWizardController.key'), 'value1', 'should link to App.CreateAppWizardController');

});

test('newAppConfigs', function () {

  expect(1);

  var configs = {
      java_home: '/usr/jdk64/jdk1.7.0_40'
    },
    controller = this.subject();

  Em.run(function () {
    controller.set('controllers.createAppWizard.newApp', {
      configs: configs
    });
  });

  propEqual(controller.get('newAppConfigs'), configs, 'configs should be taken from wizard controller');

});

test('sectionKeys', function () {

  expect(2);

  var cases = [
      {
        sectionKeys: ['general', 'custom'],
        title: 'no newAppConfigs set'
      },
      {
        newAppConfigs: {
          'p0': 'v0',
          'site.p1': 'v1',
          'site.p2.0': 'v2',
          'site.p2.1': 'v3'
        },
        sectionKeys: ['general', 'p1', 'p2', 'custom'],
        title: 'newAppConfigs are set'
      }
    ],
    controller = this.subject();

  cases.forEach(function (item) {

    Em.run(function () {
      controller.set('controllers.createAppWizard.newApp', {
        configs: item.newAppConfigs
      });
    });

    propEqual(controller.get('sectionKeys'), item.sectionKeys, item.title);

  });

});

test('loadStep', function () {

  expect(3);

  var controller = this.subject();

  Em.run(function () {
    sinon.stub(controller, 'clearStep', Em.K);
    sinon.stub(controller, 'initConfigs', Em.K);
    controller.loadStep();
  });

  ok(controller.clearStep.calledOnce, 'clearStep should be executed');
  ok(controller.initConfigs.calledOnce, 'initConfigs should be executed');
  ok(controller.initConfigs.firstCall.args[0], 'true should be passed as argument to initConfigs');

  controller.clearStep.restore();
  controller.initConfigs.restore();

});

test('initConfigs', function () {

  expect(15);

  var controller = this.subject(),
    titleDefault = 'should set default {0} property value',
    titleCustom = 'should set custom {0} property value',
    titleGlobal = 'should set global {0} property value',
    titleLabel = 'label shouldn\'t contain \'site.\'';

  Em.run(function () {
    App.setProperties({
      javaHome: '/usr/jdk64/jdk1.7.0_45',
      metricsHost: 'host0',
      metricsPort: '3333',
      metricsLibPath: '/metrics/lib'
    });
    controller.get('controllers.createAppWizard').setProperties({
      'content': {},
      'newApp': {
        'appType': {
          'configs': {}
        },
        'configs': {
          'java_home': '/usr/jdk64/jdk1.7.0_40',
          'site.global.metric_collector_host': 'host1',
          'site.global.metric_collector_port': '8080',
          'site.global.metric_collector_lib': '/ams/lib'
        }
      }
    });
    controller.initConfigs(true);
  });

  equal(controller.get('configs').findBy('name', 'java_home').get('value'), '/usr/jdk64/jdk1.7.0_45', titleGlobal.format('java_home'));
  equal(controller.get('configs').findBy('name', 'java_home').get('label'), 'java_home', 'label should be equal to name');
  equal(controller.get('configs').findBy('name', 'ams_metrics').configs.findBy('name', 'site.global.metric_collector_host')
    .get('value'), 'host0', titleGlobal.format('site.global.metric_collector_host'));
  equal(controller.get('configs').findBy('name', 'ams_metrics').configs.findBy('name', 'site.global.metric_collector_port')
    .get('value'), '3333', titleGlobal.format('site.global.metric_collector_port'));
  equal(controller.get('configs').findBy('name', 'ams_metrics').configs.findBy('name', 'site.global.metric_collector_lib')
    .get('value'), '/metrics/lib', titleGlobal.format('site.global.metric_collector_lib'));
  equal(controller.get('configs').findBy('name', 'ams_metrics').configs.findBy('name', 'site.global.metric_collector_host')
    .get('label'), 'global.metric_collector_host', titleLabel);
  equal(controller.get('configs').findBy('name', 'ams_metrics').configs.findBy('name', 'site.global.metric_collector_port')
    .get('label'), 'global.metric_collector_port', titleLabel);
  equal(controller.get('configs').findBy('name', 'ams_metrics').configs.findBy('name', 'site.global.metric_collector_lib')
    .get('label'), 'global.metric_collector_lib', titleLabel);

  Em.run(function () {
    App.setProperties({
      javaHome: null,
      metricsHost: null,
      metricsPort: null,
      metricsLibPath: null
    });
    controller.initConfigs();
  });

  equal(controller.get('configs').findBy('name', 'java_home').get('value'), '/usr/jdk64/jdk1.7.0_40', titleCustom.format('java_home'));
  equal(controller.get('configs').findBy('name', 'ams_metrics').configs.findBy('name', 'site.global.metric_collector_host')
    .get('value'), 'host1', titleGlobal.format('site.global.metric_collector_host'));
  equal(controller.get('configs').findBy('name', 'ams_metrics').configs.findBy('name', 'site.global.metric_collector_port')
    .get('value'), '8080', titleGlobal.format('site.global.metric_collector_port'));
  equal(controller.get('configs').findBy('name', 'ams_metrics').configs.findBy('name', 'site.global.metric_collector_lib')
    .get('value'), '/ams/lib', titleGlobal.format('site.global.metric_collector_lib'));

  Em.run(function () {
    controller.get('controllers.createAppWizard').setProperties({
      'newApp': {
        'appType': {
          'configs':  {
            'site.global.metric_collector_host': 'host3',
            'site.global.metric_collector_port': '8888',
            'site.global.metric_collector_lib': '/var/ams/lib'
          }
        },
        'configs': {}
      }
    });
    controller.initConfigs();
  });

  equal(controller.get('configs').findBy('name', 'ams_metrics').configs.findBy('name', 'site.global.metric_collector_host')
    .get('value'), 'host3', titleDefault.format('site.global.metric_collector_host'));
  equal(controller.get('configs').findBy('name', 'ams_metrics').configs.findBy('name', 'site.global.metric_collector_port')
    .get('value'), '8888', titleDefault.format('site.global.metric_collector_port'));
  equal(controller.get('configs').findBy('name', 'ams_metrics').configs.findBy('name', 'site.global.metric_collector_lib')
    .get('value'), '/var/ams/lib', titleDefault.format('site.global.metric_collector_lib'));

});

test('initConfigSetDependencies', function () {

  expect(1);

  var configSet = {
      dependencies: [
        {
          name: 'App.javaHome'
        }
      ]
    },
    javaHome = '/usr/jdk64/jdk1.7.0_40',
    controller = this.subject();

  Em.run(function () {
    App.set('javaHome', javaHome);
    controller.initConfigSetDependencies(configSet);
  });

  equal(configSet.dependencies[0].map, javaHome, 'should set map property');

});

test('clearStep', function () {

  expect(1);

  var controller = this.subject();

  Em.run(function () {
    controller.clearStep();
  });

  ok(!controller.get('isError'), 'isError should be false');

});

test('validateConfigs', function () {

  expect(4);

  var controller = this.subject({
    configs: [
      {
        isSet: false,
        name: 'p0',
        value: 'v0'
      }
    ]
  });

  ok(controller.validateConfigs(), 'configs are valid');
  propEqual(controller.get('configsObject'), {
    p0: 'v0'
  }, 'configsObject is set');

  Em.run(function () {
    controller.set('addConfigSetProperties', function () {
      return null;
    });
  });

  ok(!controller.validateConfigs(), 'configs are invalid');
  ok(controller.get('isError'), 'isError is set to true');

});

test('addConfigSetProperties', function () {

  expect(1);

  var configs = [
      {
        isSet: false,
        configs: [
          {
            name: 'p0',
            value: 'v0'
          }
        ]
      },
      {
        isSet: true,
        trigger: {},
        configs: [
          {
            name: 'p1',
            value: 'v1'
          }
        ]
      },
      {
        isSet: true,
        trigger: {
          name: 'p2',
          value: 'v2'
        },
        configs: [
          {
            name: 'p3',
            value: 'v3'
          }
        ]
      }
    ],
    controller = this.subject();

    deepEqual(controller.addConfigSetProperties(configs), [configs[0], configs[2].configs[0]], 'should add config from config sets to general configs array');

});

test('saveConfigs', function () {

  expect(5);

  var configsObject = {
      p0: 'v0'
    },
    controller = this.subject({
      configsObject: configsObject
    }),
    metricsCases = [
      {
        configsObject: {
          'site.global.metrics_enabled': null
        }
      },
      {
        configsObject: {
          'site.global.metrics_enabled': 'true',
          'site.global.metric_collector_host': 'h0',
          'site.global.metric_collector_port': '3333'
        },
        metricsEnabledExpected: 'true'
      },
      {
        configsObject: {
          'site.global.metrics_enabled': 'true',
          'site.global.metric_collector_host': null,
          'site.global.metric_collector_port': '8080'
        },
        metricsEnabledExpected: 'false'
      },
      {
        configsObject: {
          'site.global.metrics_enabled': 'true',
          'site.global.metric_collector_host': 'h1',
          'site.global.metric_collector_port': null
        },
        metricsEnabledExpected: 'false'
      }
    ],
    metricsTitle = 'site.global.metrics_enabled should be {0}';

  Em.run(function () {
    controller.set('controllers.createAppWizard.newApp', {});
    controller.saveConfigs();
  });

  propEqual(controller.get('controllers.createAppWizard.newApp.configs'), configsObject, 'configs are saved to wizard controller');

  metricsCases.forEach(function (item) {
    controller.reopen({
      configsObject: item.configsObject
    });
    controller.set('controllers.createAppWizard.newApp', {});
    controller.saveConfigs();
    equal(controller.get('controllers.createAppWizard.newApp.configs')['site.global.metrics_enabled'],
      item.metricsEnabledExpected, metricsTitle.format(item.metricsEnabledExpected || 'undefined'));
  }, this);

});

test('actions.submit', function () {

  expect(2);

  var configsObject = {
      p0: 'v0'
    },
    controller = this.subject({
      configs: [
        {
          isSet: false,
          name: 'p0',
          value: 'v0'
        }
      ]
    });

  Em.run(function () {
    controller.get('controllers.createAppWizard').setProperties({
      newApp: {},
      currentStep: 3,
      transitionToRoute: Em.K
    });
    controller.send('submit');
  });

  propEqual(controller.get('controllers.createAppWizard.newApp.configs'), configsObject, 'configs are passed to wizard controller');
  equal(controller.get('controllers.createAppWizard.currentStep'), 4, 'should go to step4');

});

});

require.register("test/unit/controllers/createAppWizard/step4_controller_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

moduleFor('controller:createAppWizardStep4', 'App.CreateAppWizardStep4Controller', {

  needs: [
    'controller:createAppWizard'
  ],

  setup: function () {
    sinon.stub(App.ajax, 'send', Em.K);
  },

  teardown: function () {
    App.ajax.send.restore();
    App.reset();
  }

});

test('appWizardController', function () {

  expect(1);

  var controller = this.subject({
    controllers: {
      createAppWizard: {
        key: 'value0'
      }
    }
  });

  Em.run(function () {
    controller.set('controllers.createAppWizard.key', 'value1');
  });

  equal(controller.get('appWizardController.key'), 'value1', 'should link to App.CreateAppWizardController');

});

test('isSubmitDisabled', function () {

  expect(3);

  var controller = this.subject({
    newApp: Em.Object.create({
      appType: {
        index: 'test',
        version: 'test'
      },
      name: test,
      configs: [],
      components: [],
      queue: 'test',
      queueName: 'test'
    })
  });

  equal(controller.get('isSubmitDisabled'), false, 'should be false by default');

  controller.sendAppDataToServer();
  equal(controller.get('isSubmitDisabled'), true, 'should be true after sendAppDataToServer call');

  controller.sendAppDataToServerCompleteCallback();
  equal(controller.get('isSubmitDisabled'), false, 'should be false after sendAppDataToServerCompleteCallback call');

});

test('configsFormatted', function () {

  expect(1);

  var controller = this.subject();

  Em.run(function () {
    controller.set('newApp', {
      configs: {
        p0: 'v0',
        p1: 'v1',
        p2: 'v2'
      }
    });
  });

  equal(controller.get('configsFormatted'), '"p0":"v0",\n"p1":"v1",\n"p2":"v2"', 'configs formatted correctly');

});

test('resourcesFormatted', function () {

  expect(18);

  var propertiesCases = [
      {
        propertyName: 'numInstances',
        expectedPropertyName: 'instanceCount',
        value: '1'
      },
      {
        propertyName: 'yarnMemory',
        expectedPropertyName: 'yarnMemory',
        value: '256'
      },
      {
        propertyName: 'yarnCPU',
        expectedPropertyName: 'yarnCpuCores',
        value: '2'
      },
      {
        propertyName: 'priority',
        expectedPropertyName: 'priority',
        value: 2
      }
    ],
    globalCases = [
      {
        includeFilePatterns: null,
        includeFilePatternsExpected: null,
        excludeFilePatterns: null,
        excludeFilePatternsExpected: null,
        frequency: '1000',
        frequencyExpected: '1000',
        title: 'all parameters except one are null'
      },
      {
        includeFilePatterns: '*.log',
        includeFilePatternsExpected: '*.log',
        excludeFilePatterns: '*.zip',
        excludeFilePatternsExpected: '*.zip',
        frequency: '1000',
        frequencyExpected: '1000',
        title: 'all parameters are valid'
      }
    ],
    globalCasesUndefined = [
      {
        includeFilePatterns: null,
        excludeFilePatterns: null,
        frequency: null,
        title: 'no patterns and frequency specified'
      },
      {
        includeFilePatterns: ' \r\n',
        excludeFilePatterns: null,
        frequency: null,
        title: 'one parameter is empty string after trimming'
      }
    ],
    selectedYarnLabelCases = [
      {
        selectedYarnLabel: 0,
        components: []
      },
      {
        selectedYarnLabel: 1,
        yarnLabelExpression: ''
      },
      {
        selectedYarnLabel: 2,
        specialLabel: 'specialLabel',
        yarnLabelExpression: 'specialLabel'
      }
    ],
    title = '{0} should be {1}',
    selectedYarnLabelTitle = 'selected YARN label is {0}',
    label = 'label',
    controller = this.subject({
      newApp: Em.Object.create({
        components: [
          Em.Object.create({
            name: 'c',
            numInstances: '0',
            yarnMemory: '512',
            yarnCPU: '1',
            priority: 1
          })
        ]
      })
    });

  propertiesCases.forEach(function (item) {

    Em.run(function () {
      controller.get('newApp.components')[0].set(item.propertyName, item.value);
    });

    equal(controller.get('resourcesFormatted.components')[0][item.expectedPropertyName], item.value, title.format(item.expectedPropertyName, item.value));

  });

  Em.run(function () {
    controller.get('newApp.components')[0].setProperties({
      yarnLabelChecked: false,
      yarnLabel: label
    });
  });

  ok(!controller.get('resourcesFormatted.components')[0].yarnLabel, 'yarnLabel shouldn\'t be set');

  Em.run(function () {
    controller.get('newApp.components')[0].set('yarnLabelChecked', true);
  });

  equal(controller.get('resourcesFormatted.components')[0].yarnLabel, label, title.format('yarnLabel', '\'' + label + '\''));

  Em.run(function () {
    controller.get('newApp.components')[0].set('yarnLabel', ' ' + label + '\n');
  });

  equal(controller.get('resourcesFormatted.components')[0].yarnLabel, label, 'yarnLabel should be trimmed');

  globalCases.forEach(function (item) {

    Em.run(function () {
      controller.get('newApp').setProperties({
        includeFilePatterns: item.includeFilePatterns,
        excludeFilePatterns: item.excludeFilePatterns,
        frequency: item.frequency
      });
      controller.notifyPropertyChange('newApp.components.@each.numInstances');
    });

    var global = controller.get('resourcesFormatted.global');

    deepEqual(global['yarn.log.include.patterns'], item.includeFilePatternsExpected, item.title);
    deepEqual(global['yarn.log.exclude.patterns'], item.excludeFilePatternsExpected, item.title);
    deepEqual(global['yarn.log.interval'], item.frequencyExpected, item.title);

  });

  globalCasesUndefined.forEach(function (item) {

    Em.run(function () {
      controller.get('newApp').setProperties({
        includeFilePatterns: item.includeFilePatterns,
        excludeFilePatterns: item.excludeFilePatterns,
        frequency: item.frequency
      });
      controller.notifyPropertyChange('newApp.components.@each.numInstances');
    });

    equal(typeof controller.get('resourcesFormatted.global'), 'undefined', item.title);

  });

  selectedYarnLabelCases.forEach(function (item) {

    Em.run(function () {
      controller.get('newApp').setProperties({
        selectedYarnLabel: item.selectedYarnLabel,
        specialLabel: item.specialLabel
      });
      controller.notifyPropertyChange('newApp.components.@each.numInstances');
    });

    var message = selectedYarnLabelTitle.format(item.selectedYarnLabel);

    if (Em.isNone(item.yarnLabelExpression)) {
      ok(!controller.get('resourcesFormatted.components').isAny('id', 'slider-appmaster'), message);
    } else {
      equal(controller.get('resourcesFormatted.components').findBy('id', 'slider-appmaster')['yarn.label.expression'],
        item.yarnLabelExpression, message);
    }

  });

});

test('loadStep', function () {

  expect(1);

  var controller = this.subject();

  Em.run(function () {
    sinon.stub(controller, 'initializeNewApp', Em.K);
    controller.loadStep();
  });

  ok(controller.initializeNewApp.calledOnce, 'initializeNewApp should be executed');

  controller.initializeNewApp.restore();

});

test('initializeNewApp', function () {

  expect(1);

  var newApp = {
      key: 'value'
    },
    controller = this.subject({
      controllers: {
        createAppWizard: {
          newApp: newApp
        }
      }
    });

  Em.run(function () {
    controller.loadStep();
  });

  propEqual(controller.get('newApp'), newApp, 'should initialize new app');

});

test('sendAppDataToServerSuccessCallback', function () {

  expect(1);

  var controller = this.subject();

  Em.run(function () {
    sinon.stub(controller.get('appWizardController'), 'hidePopup', Em.K);
    controller.sendAppDataToServerSuccessCallback();
  });

  ok(controller.get('appWizardController').hidePopup.calledOnce, 'popup should be closed');

  controller.get('appWizardController').hidePopup.restore();

});

test('sendAppDataToServerCompleteCallback', function () {

  expect(1);

  var controller = this.subject({
    isSubmitDisabled: true
  });

  Em.run(function () {
    controller.sendAppDataToServerCompleteCallback();
  });

  ok(!controller.get('isSubmitDisabled'), 'Finish button should be enabled');

});

test('sendAppDataToServer', function () {

  var controller = this.subject({
      newApp: Em.Object.create({
        appType: {
          index: 'ACCUMULO',
          version: '1'
        },
        name: 'name',
        twoWaySSLEnabled: false,
        configs: {
          key: 'value'
        }
      }),
      resourcesFormatted: {
        components: []
      }
    }),
    cases = [
      {
        queueName: null,
        title: 'queueName not set'
      },
      {
        queueName: ' \n',
        title: 'empty queueName value'
      },
      {
        queueName: ' queue\n',
        queue: 'queue',
        title: 'queueName set correctly'
      }
    ];

  Em.run(function () {
    controller.sendAppDataToServer();
  });

  ok(controller.get('isSubmitDisabled'), 'Finish button should be disabled');
  ok(App.ajax.send.calledOnce, 'request to server should be sent');

  cases.forEach(function (item) {

    Em.run(function () {
      controller.set('newApp.queueName', item.queueName);
      controller.sendAppDataToServer();
    });

    var data = {
      typeName: 'ACCUMULO',
      typeVersion: '1',
      name: 'name',
      twoWaySSLEnabled: 'false',
      resources: {
        components: []
      },
      typeConfigs: {
        key: 'value'
      }
    };
    if (item.queue) {
      data.queue = item.queue;
    }

    propEqual(App.ajax.send.lastCall.args[0].data.data, data, item.title);

  });

});

test('actions.finish', function () {

  var controller = this.subject();

  Em.run(function () {
    sinon.stub(controller, 'sendAppDataToServer', Em.K);
    controller.send('finish');
  });

  ok(controller.sendAppDataToServer.calledOnce, 'data should be sent to server');

  controller.sendAppDataToServer.restore();

});
});

require.register("test/unit/controllers/create_app_wizard_controller_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

moduleFor('controller:createAppWizard', 'App.CreateAppWizardController');

var stepCases = [
    {
      currentStep: 0,
      step: 5,
      fromNextButton: true,
      expectedCurrentStep: 0
    },
    {
      currentStep: 1,
      step: 0,
      fromNextButton: true,
      expectedCurrentStep: 1
    },
    {
      currentStep: 2,
      step: 3,
      fromNextButton: false,
      expectedCurrentStep: 2
    },
    {
      currentStep: 0,
      step: 1,
      fromNextButton: true,
      expectedCurrentStep: 1
    }
  ],
  currentStepTitle = 'currentStep should be {0}',
  newApp = {
    configs: {
      n0: 'v0'
    },
    predefinedConfigNames: []
  };

test('loadStep', function () {

  var controller = this.subject({
    transitionToRoute: Em.K
  });

  Em.run(function () {
    controller.loadStep();
  });

  equal(controller.get('currentStep'), 1, 'currentStep should be 1');

});

test('gotoStep', function () {

  var controller = this.subject({
    transitionToRoute: Em.K
  });

  stepCases.forEach(function (item) {

    Em.run(function () {
      controller.set('currentStep', item.currentStep);
      controller.gotoStep(item.step, item.fromNextButton);
    });

    equal(controller.get('currentStep'), item.expectedCurrentStep, currentStepTitle.format(item.expectedCurrentStep));

  });

});

test('actions.gotoStep', function () {

  var controller = this.subject({
    transitionToRoute: Em.K
  });

  stepCases.rejectBy('fromNextButton').forEach(function (item) {

    Em.run(function () {
      controller.set('currentStep', item.currentStep);
      controller.send('gotoStep', item.step);
    });

    equal(controller.get('currentStep'), item.expectedCurrentStep, currentStepTitle.format(item.expectedCurrentStep));

  });

});

test('gotoStep', function () {

  var createAppWizardController = this.subject({
    transitionToRoute: Em.K,
    newApp: newApp
  });

  Em.run(function () {
    createAppWizardController.gotoStep(1);
  });

  propEqual(createAppWizardController.get('newApp.configs', {}, 'custom configs should be dropped'));

});

test('actions.gotoStep', function () {

  var createAppWizardController = this.subject({
    transitionToRoute: Em.K,
    newApp: newApp
  });

  Em.run(function () {
    createAppWizardController.send('gotoStep', 1);
  });

  propEqual(createAppWizardController.get('newApp.configs', {}, 'custom configs should be dropped'));

});

test('dropCustomConfigs', function () {

  var controller = this.subject({
    newApp: {
      configs: {
        n0: 'v0',
        n1: 'v1'
      },
      predefinedConfigNames: ['n0']
    }
  });

  Em.run(function () {
    controller.dropCustomConfigs();
  });

  propEqual(controller.get('newApp.configs'), {n0: 'v0'}, 'custom configs should be dropped');

});

test('nextStep', function () {

  var controller = this.subject({
    transitionToRoute: Em.K,
    currentStep: 1
  });

  Em.run(function () {
    controller.nextStep();
  });

  equal(controller.get('currentStep'), '2', 'should go to step2');

});

test('prevStep', function () {

  var controller = this.subject({
    transitionToRoute: Em.K,
    currentStep: 2
  });

  Em.run(function () {
    controller.prevStep();
  });

  equal(controller.get('currentStep'), '1', 'should go to step1');

});

test('hidePopup', function () {

  var controller = this.subject({
    viewEnabled: true,
    transitionToRoute: Em.K,
    newApp: {}
  });

  Em.run(function () {
    controller.hidePopup();
  });

  equal(controller.get('newApp'), null, 'should erase app data');

});

});

require.register("test/unit/controllers/slider_app/summary_controller_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

moduleFor('controller:sliderAppSummary', 'App.SliderAppSummaryController');

test('appType', function () {

  var sliderAppSummaryController = this.subject({
    model: {
      appType: {
        displayName: 'name1'
      }
    }
  });
  equal(sliderAppSummaryController.get('appType'), 'name1');
  Em.run(function() {
    sliderAppSummaryController.set('model.appType.displayName', 'name2');
  });
  equal(sliderAppSummaryController.get('appType'), 'name2');

});
});

require.register("test/unit/controllers/slider_app_controller_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

moduleFor('controller:sliderApp', 'App.SliderAppController', {

  needs: [
    'component:bs-modal'
  ],

  setup: function () {
    sinon.stub(Bootstrap.ModalManager, 'register', Em.K);
    sinon.stub(Bootstrap.ModalManager, 'open', Em.K);
    sinon.stub(App.ajax, 'send', Em.K);
    sinon.stub(Bootstrap.ModalManager, 'close', Em.K);
  },

  teardown: function () {
    Bootstrap.ModalManager.register.restore();
    Bootstrap.ModalManager.open.restore();
    App.ajax.send.restore();
    Bootstrap.ModalManager.close.restore();
  }

});

test('availableActions', function () {

  var controller = this.subject({model: Em.Object.create({status: ''})});
  controller.set('model.status', App.SliderApp.Status.accepted);
  deepEqual(controller.get('availableActions').mapBy('action'), ['freeze'], 'actions for ACCEPTED');

  Em.run(function () {
    controller.set('model.status', App.SliderApp.Status.failed);
  });
  deepEqual(controller.get('availableActions').findBy('title', 'Advanced').submenu.mapBy('action'), ['destroy'], 'actions for FAILED');

  Em.run(function () {
    controller.set('model.status', App.SliderApp.Status.finished);
  });
  deepEqual(controller.get('availableActions').findBy('title', 'Advanced').submenu.mapBy('action'), ['destroy'], 'actions for FINISHED');
  ok(controller.get('availableActions').mapBy('action').contains('thaw'), 'actions for FINISHED (2)');

  Em.run(function () {
    controller.set('model.status', App.SliderApp.Status.killed);
  });
  deepEqual(controller.get('availableActions').findBy('title', 'Advanced').submenu.mapBy('action'), ['destroy'], 'actions for KILLED');

  Em.run(function () {
    controller.set('model.status', App.SliderApp.Status.new);
  });
  deepEqual(controller.get('availableActions').mapBy('action'), ['freeze'], 'actions for NEW');

  Em.run(function () {
    controller.set('model.status', App.SliderApp.Status.new_saving);
  });
  deepEqual(controller.get('availableActions').mapBy('action'), ['freeze'], 'actions for NEW_SAVING');

  Em.run(function () {
    controller.set('model.status', App.SliderApp.Status.running);
  });
  deepEqual(controller.get('availableActions').mapBy('action'), ['freeze', 'flex'], 'actions for RUNNING');

  Em.run(function () {
    controller.set('model.status', App.SliderApp.Status.frozen);
  });
  deepEqual(controller.get('availableActions').findBy('title', 'Advanced').submenu.mapBy('action'), ['destroy'], 'actions for FROZEN');
  ok(controller.get('availableActions').mapBy('action').contains('thaw'), 'actions for FROZEN (2)');

});

test('sliderAppTabs', function () {

  var cases = [
      {
        length: 1
      },
      {
        configs: {},
        length: 1
      },
      {
        configs: {
          n0: 'v0'
        },
        length: 2
      }
    ],
    title = 'number of tabs should be {0}',
    controller = this.subject();

  cases.forEach(function (item) {

    Em.run(function () {
      controller.set('model', {
        configs: item.configs
      })
    });

    equal(controller.get('sliderAppTabs.length'), item.length, title.format(item.length));

  });

});

test('weHaveQuicklinks', function () {

  var cases = [
      {
        content: [
          {
            id: '0'
          }
        ],
        value: true
      },
      {
        value: false
      }
    ],
    title = 'should be {0}',
    controller = this.subject();

  cases.forEach(function (item) {

    Em.run(function () {
      controller.set('model', {
        quickLinks: {
          content: {
            content: item.content
          }
        }
      });
    });

    equal(controller.get('weHaveQuicklinks'), item.value, title.format(item.value));

  });

});

test('destroyButtonEnabled', function () {

  var cases = [
      {
        confirmChecked: true,
        string: 'disabled'
      },
      {
        confirmChecked: false,
        string: 'enabled'
      }
    ],
    title = 'button is {0}',
    controller = this.subject();

  cases.forEach(function (item) {

    Em.run(function () {
      controller.set('confirmChecked', item.confirmChecked);
    });

    equal(controller.get('destroyButtonEnabled'), !item.confirmChecked, title.format(item.string));

  });

});

test('confirmDestroy', function () {

  var controller = this.subject(),
    assertionsEqual = [
      {
        propertyName: 'name',
        value: 'confirm-modal'
      },
      {
        propertyName: 'title',
        value: Ember.I18n.t('sliderApp.destroy.confirm.title')
      },
      {
        propertyName: 'manual',
        value: true
      }
    ],
    assertionsDeepEqual = [
      {
        propertyName: 'targetObject',
        value: controller,
        valueFormatted: 'App.SliderAppController'
      },
      {
        propertyName: 'controller',
        value: controller,
        valueFormatted: 'App.SliderAppController'
      },
      {
        propertyName: 'body',
        value: App.DestroyAppPopupView
      },
      {
        propertyName: 'footerViews',
        value: [App.DestroyAppPopupFooterView]
      }
    ],
    title = 'modalComponent.{0} should be {1}';

  Em.run(function () {
    controller.confirmDestroy();
  });

  ok(Bootstrap.ModalManager.register.calledOnce, 'Bootstrap.ModalManager.register should be executed');
  assertionsEqual.forEach(function (item) {
    equal(Bootstrap.ModalManager.register.firstCall.args[1][item.propertyName], item.value, title.format(item.propertyName, item.value));
  });
  assertionsDeepEqual.forEach(function (item) {
    deepEqual(Bootstrap.ModalManager.register.firstCall.args[1][item.propertyName], item.value, title.format(item.propertyName, item.valueFormatted || item.value));
  });

});

test('tryDoAction', function () {

  var controller = this.subject({
    currentAction: 'customMethod',
    customMethod: function () {
      this.set('groupedComponents', [{}]);
    }
  });

  Em.run(function () {
    controller.tryDoAction();
  });

  deepEqual(controller.get('groupedComponents'), [{}], 'currentAction should be executed');

});

test('groupComponents', function () {

  var controller = this.subject({
    appType: {
      components: [
        Em.Object.create({
          name: 'c0'
        }),
        Em.Object.create({
          name: 'c1'
        })
      ]
    },
    components: [
      Em.Object.create({
        componentName: 'c0'
      })
    ]
  });

  Em.run(function () {
    controller.groupComponents();
  });

  equal(controller.get('groupedComponents')[0].count, 1, 'count should be incremented');
  equal(controller.get('groupedComponents')[1].count, 0, 'count shouldn\'t be incremented');

});

test('validateGroupedComponents', function () {

  var cases = [
      {
        count: ' 1',
        hasErrors: true,
        title: 'validation failure'
      },
      {
        count: '-1',
        hasErrors: true,
        title: 'validation failure'
      },
      {
        count: 1,
        hasErrors: false,
        title: 'validation success'
      }
    ],
    controller = this.subject();

  cases.forEach(function (item) {

    Em.run(function () {
      controller.set('groupedComponents', [{
        count: item.count
      }]);
      controller.validateGroupedComponents();
    });

    equal(controller.get('groupedComponentsHaveErrors'), item.hasErrors, item.title);

  });

});

test('flex', function () {

  var controller = this.subject({
      appType: {
        components: [
          Em.Object.create({
            name: 'c0'
          }),
          Em.Object.create({
            name: 'c1'
          })
        ]
      },
      components: [
        Em.Object.create({
          componentName: 'c0'
        })
      ]
    });

  Em.run(function () {
    controller.flex();
  });

  equal(controller.get('groupedComponents')[0].count, 1, 'count should be incremented');
  equal(controller.get('groupedComponents')[1].count, 0, 'count shouldn\'t be incremented');

});

test('mapComponentsForFlexRequest', function () {

  var controller = this.subject({
    groupedComponents: [
      {
        name: 'c0',
        count: 1
      },
      {
        name: 'c1',
        count: 0
      }
    ]
  });

  deepEqual(controller.mapComponentsForFlexRequest(), {
    c0: {
      instanceCount: 1
    },
    c1: {
      instanceCount: 0
    }
  }, 'should map grouped components');

});

test('destroy', function () {

  var controller = this.subject({
    model: Em.Object.create({
      isActionPerformed: false
    })
  });

  Em.run(function () {
    controller.destroy();
  });

  ok(controller.get('model.isActionPerformed'), 'model.isActionPerformed should be true');

});

test('actionErrorCallback', function () {

  var controller = this.subject({
    model: Em.Object.create({
      isActionPerformed: true
    }),
    defaultErrorHandler: Em.K
  });

  Em.run(function () {
    controller.actionErrorCallback(null, null, null, {
      url: null,
      type: null
    });
  });

  ok(!controller.get('model.isActionPerformed'), 'model.isActionPerformed should be true');

});

test('actions.submitFlex', function () {

  var controller = this.subject({
      model: Em.Object.create({
        id: 0,
        name: 'n'
      }),
      validateGroupedComponents: function () {
        return false;
      },
      groupedComponentsHaveErrors: true
    });

  Em.run(function () {
    controller.send('submitFlex');
  });

  equal(controller.get('groupedComponents.length'), 0, 'should clear grouped components');
  ok(!controller.get('groupedComponentsHaveErrors'), 'should clear components errors');

});

test('actions.closeFlex', function () {

  var controller = this.subject({
    groupedComponents: [{}],
    groupedComponentsHaveErrors: true
  });

  Em.run(function () {
    controller.send('closeFlex');
  });

  equal(controller.get('groupedComponents.length'), 0, 'should clear grouped components');
  ok(!controller.get('groupedComponentsHaveErrors'), 'should clear components errors');

});

test('modalConfirmed', function () {

  var controller = this.subject({
      confirmChecked: true,
      currentAction: 'customMethod',
      customMethod: function () {
        this.set('groupedComponents', [{}]);
      }
    });

  Em.run(function () {
    controller.send('modalConfirmed');
  });

  deepEqual(controller.get('groupedComponents'), [{}], 'currentAction should be executed');
  ok(!controller.get('confirmChecked'), 'confirmChecked should be false');

});

test('modalCanceled', function () {

  var controller = this.subject({
      confirmChecked: true
    });

  Em.run(function () {
    controller.send('modalCanceled');
  });

  ok(!controller.get('confirmChecked'), 'confirmChecked should be false');

});

test('openModal', function () {

  var cases = [
      {
        options: {
          action: 'customMethod'
        },
        groupedComponents: [{}],
        title: 'should execute currentAction'
      },
      {
        options: {
          action: 'customMethod',
          customConfirm: 'customConfirmMethod'
        },
        groupedComponents: [{}, {}],
        title: 'should execute customConfirm'
      }
    ],
    controller = this.subject({
      customMethod: function () {
        this.set('groupedComponents', [{}]);
      },
      customConfirmMethod: function () {
        this.set('groupedComponents', [{}, {}]);
      }
    });

  Em.run(function () {
    controller.send('openModal', {
      action: 'customMethod'
    });
  });

  equal(controller.get('currentAction'), 'customMethod', 'should set currentAction');

  cases.forEach(function (item) {

    Em.run(function () {
      controller.send('openModal', item.options);
    });

    deepEqual(controller.get('groupedComponents'), item.groupedComponents, item.title);

  });

});

test('quickLinksOrdered', function() {
  expect(2);

  var controller = this.subject({
    model: Em.Object.create({
      'quickLinks': [
        Em.Object.create({ label: 'org.apache.slider.thrift'}),
        Em.Object.create({ label: 'Metrics API'}),
        Em.Object.create({ label: 'org.apache.slider.hbase'}),
        Em.Object.create({ label: 'Metrics UI'}),
        Em.Object.create({ label: 'UI'}),
        Em.Object.create({ label: 'Some Label'})
      ]
    }),
    weHaveQuicklinks: true
  });

  Em.run(function() {
    controller.get('quickLinksOrdered');
  });

  equal(controller.get('quickLinksOrdered').objectAt(4).get('label'), 'Metrics UI', 'Metrics UI link should be before Metrics API');
  equal(controller.get('quickLinksOrdered').objectAt(5).get('label'), 'Metrics API', 'Metrics API link should be last');
});


test('Disable Action Button', function() {
  expect(6);
  var controller = this.subject({
    model: Em.Object.extend({
      isActionFinished: function() {
        return this.get('status') != this.get('statusBeforeAction');
      }.property('statusBeforeAction', 'status')
    }).create({
      id: 'someId',
      name: 'SomeName',
      status: 'ACCEPTED',
      statusBeforeAction: ''
    }),
    defaultErrorHandler: function() { return true; }
  });

  Em.run(function() {
    controller.thaw();
  });

  equal(controller.get('model').get('isActionPerformed'), true, 'Perform start action');

  Em.run(function() {
    controller.set('model.status', 'RUNNING');
    controller.get('availableActions');
  });

  equal(controller.get('model').get('isActionPerformed'), false, 'Start is done.');

  Em.run(function() {
    controller.freeze();
  });

  equal(controller.get('model').get('isActionPerformed'), true, 'Perform freeze action')

  Em.run(function() {
    controller.set('model.status', 'FROZEN');
    controller.get('availableActions');
  });

  equal(controller.get('model').get('isActionPerformed'), false, 'Freeze is done.');

  Em.run(function() {
    controller.thaw();
  });

  equal(controller.get('model').get('isActionPerformed'), true, 'Start action performed expect for error.');

  Em.run(function() {
    controller.actionErrorCallback({requestText: 'some text'}, {url: '/some/url'}, {type: 'PUT'}, true);
  });

  equal(controller.get('model').get('isActionPerformed'), false, 'Error catched button should be enabled');
});

});

require.register("test/unit/controllers/slider_apps_controller_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

moduleFor('controller:sliderApps', 'App.SliderAppsController', {

  setup: function () {
    sinon.stub(Bootstrap.ModalManager, 'open', Em.K);
  },

  teardown: function () {
    Bootstrap.ModalManager.open.restore();
  }

});

test('showUnavailableAppsPopup', function () {

  var cases = [
      {
        message: 'message',
        result: 'message',
        title: 'errorMessage property should be set'
      },
      {
        result: Em.I18n.t('slider.apps.undefined.issue'),
        title: 'default error message'
      }
    ],
    controller = this.subject({
      errorMessage: null
    });

  cases.forEach(function (item) {

    Em.run(function () {
      controller.showUnavailableAppsPopup(item.message);
    });

    equal(controller.get('errorMessage'), item.result, item.title);

  });

});

});

require.register("test/unit/controllers/slider_controller_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

moduleFor('controller:slider', 'App.SliderController', {

  setup: function () {
    App.setProperties({
      metricsHost: null,
      metricsPort: null,
      metricsLibPath: null
    });
    Ember.run(App, App.advanceReadiness);
  },

  teardown: function () {
    App.reset();
  }

});

var properties = [
  Em.Object.create({
    viewConfigName: 'site.global.metric_collector_lib',
    value: 'file:///usr/lib/ambari-metrics-hadoop-sink/ambari-metrics-hadoop-sink.jar'
  }),
  Em.Object.create({
    viewConfigName: 'site.global.metric_collector_host',
    value: 'h2'
  }),
  Em.Object.create({
    viewConfigName: 'site.global.metric_collector_port',
    value: '6188'
  })
];

test('getViewDisplayParametersSuccessCallback', function () {

  var sliderController = this.subject({});
  Em.run(function () {
    sliderController.getViewDisplayParametersSuccessCallback({
      "ViewInstanceInfo" : {
        "description" : "description s1",
        "label" : "display s1",
        "instance_data": {
          "java.home": "/usr/jdk64/jdk1.7.0_45",
          "slider.user": "admin"
        }
      }
    })
  });
  equal(App.get('label'), 'display s1', 'valid label is set');
  equal(App.get('description'), 'description s1', 'valid description is set');
  equal(App.get('javaHome'), '/usr/jdk64/jdk1.7.0_45', 'valid default java_home property is set');
  equal(App.get('sliderUser'), 'admin', 'valid sliderUser is set');

});

test('getParametersFromViewPropertiesSuccessCallback', function () {

  var controller = this.subject();

  Em.run(function () {
    sinon.stub(App.SliderApp.store, 'all').returns(properties);
    controller.getParametersFromViewPropertiesSuccessCallback({
      parameters: {
        'site.global.metric_collector_lib': 'file:///usr/lib/ambari-metrics-hadoop-sink/ambari-metrics-hadoop-sink.jar',
        'site.global.metric_collector_host': 'h2',
        'site.global.metric_collector_port': '6188'
      },
      validations: [{}, {}]
    });
    App.SliderApp.store.all.restore();
  });

  equal(App.get('metricsHost'), 'h2', 'should set metrics server host');
  equal(App.get('metricsPort'), '6188', 'should set metrics server port');
  equal(App.get('metricsLibPath'), 'file:///usr/lib/ambari-metrics-hadoop-sink/ambari-metrics-hadoop-sink.jar', 'should set metrics lib path');

});

 test('initMetricsServerProperties', function () {

   var controller = this.subject();

   Em.run(function () {
     sinon.stub(App.SliderApp.store, 'all').returns(properties);
     controller.initMetricsServerProperties();
     App.SliderApp.store.all.restore();
   });

   equal(App.get('metricsHost'), 'h2', 'should set metrics server host');
   equal(App.get('metricsPort'), '6188', 'should set metrics server port');
   equal(App.get('metricsLibPath'), 'file:///usr/lib/ambari-metrics-hadoop-sink/ambari-metrics-hadoop-sink.jar', 'should set metrics lib path');

 });

test('finishSliderConfiguration', function () {

  var cases = [
      {
        validations: [],
        viewEnabled: true,
        title: 'view enabled'
      },
      {
        validations: [{}, {}],
        viewEnabled: false,
        title: 'view disabled'
      }
    ],
    controller = this.subject();

  cases.forEach(function (item) {

    Em.run(function () {
      controller.finishSliderConfiguration({
        validations: item.validations
      });
    });

    equal(App.get('viewEnabled'), item.viewEnabled, item.title);

  });

});
});

require.register("test/unit/mappers/slider_apps_mapper_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

QUnit.module('App.SliderAppsMapper', {

  setup: function () {
    App.SliderApp.store = App.__container__.lookup('store:main');
  },

  teardown: function () {
    App.reset();
  }

});

test('parseQuickLinks', function () {

  var mapper = App.SliderAppsMapper;

  Em.run(function () {
    App.SliderApp.store.all = function () {
      return [
        Em.Object.create({
          viewConfigName: 'yarn.rm.webapp.url',
          value: 'host'
        })
      ]
    };
    App.SliderApp.store.pushMany = function (model, record) {
      mapper.set('result', record);
    };
    mapper.parseQuickLinks({
      id: '1'
    })
  });

  equal(mapper.get('result')[0].get('url'), 'http://host/cluster/app/application_1', 'valid YARN application URL formed');
  equal(mapper.get('result')[0].get('id'), 'YARN application 1', 'model id set correctly');

});

test('parse | add/remove apps', function () {

  Em.run(function () {

    App.SliderAppsMapper.parse({
      apps: [
        {id: '1', type: 't1'},
        {id: '2', type: 't2'}
      ]
    });

  });

  deepEqual(App.SliderApp.store.all('sliderApp').mapBy('id'), ['1', '2'], 'Mapped all apps');

  Em.run(function () {

    App.SliderAppsMapper.parse({
      apps: [
        {id: '2', type: 't2'},
        {id: '3', type: 't3'}
      ]
    });

  });

  deepEqual(App.SliderApp.store.all('sliderApp').mapBy('id'), ['2', '3'], 'Delete not-existing app and add new');

});

});

require.register("test/unit/models/slider_app_component_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

moduleForModel('sliderAppComponent', 'App.SliderAppComponent', {

  needs: [
    'model:sliderApp'
  ]

});

test('isRunning', function () {

  var sliderAppComponent = this.subject({status: 'Running'});
  equal(sliderAppComponent.get('isRunning'), true, 'should be true if status is Running');

});

test('url', function () {

  var host = 'host1',
    containerId = 'id1',
    sliderAppComponent = this.subject({host: host, containerId: containerId});
  equal(sliderAppComponent.get('url'), "http://" + host + ":8042/node/container/" + containerId);

  Em.run(function () {
    sliderAppComponent.set('host', null);
  });
  equal(sliderAppComponent.get('url'), null, 'should be null if host not set');

  Em.run(function () {
    sliderAppComponent.setProperties({host: host, containerId: null});
  });
  equal(sliderAppComponent.get('url'), null, 'should be null if containerId not set');

});

});

require.register("test/unit/models/slider_app_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

moduleForModel('sliderApp', 'App.SliderApp', {

  needs: [
    'model:sliderAppType',
    'model:sliderAppComponent',
    'model:quickLink',
    'model:sliderAppAlert',
    'model:typedProperty'
  ],

  setup: function () {
    App.set('metricsHost', null);
  },

  teardown: function () {
    App.set('metricsHost', null);
  }

});

test('doNotShowComponentsAndAlerts', function () {

  var sliderApp = this.subject({name: 'p1', status: 'FROZEN'});

  equal(sliderApp.get('doNotShowComponentsAndAlerts'), true, 'Should be true if status is FROZEN');

  Em.run(function () {
    sliderApp.set('status', 'FAILED');
  });
  equal(sliderApp.get('doNotShowComponentsAndAlerts'), true, 'Should be true if status is FAILED');

});


test('showMetrics', function () {

  var sliderApp = this.subject({name: 'p1', configs: {}, supportedMetricNames: ''});
  equal(sliderApp.get('showMetrics'), false, 'should be false if supportedMetricNames is not provided');

  Em.run(function () {
    App.set('metricsHost', 'some_host');
    sliderApp.set('supportedMetricNames', 'some');
  });
  equal(sliderApp.get('showMetrics'), true, 'should be true if App.metricsHost is provided');

  Em.run(function () {
    App.set('metricsHost', null);
    sliderApp.set('status', App.SliderApp.Status.running);
  });
  equal(sliderApp.get('showMetrics'), true, 'should be true if status is RUNNING');

});

test('mapObject', function () {
  var sliderApp = this.subject(),
    longString = new Array(102).join('1'),
    configs = {
      n1: 'v1',
      n2: 'v2',
      n3: 'v3\nv3',
      n4: longString
    },
    expected = [
      {key: 'n1', value: 'v1', isMultiline: false},
      {key: 'n2', value: 'v2', isMultiline: false},
      {key: 'n3', value: 'v3\nv3', isMultiline: true},
      {key: 'n4', value: longString, isMultiline: true}
    ],
    result;


  Em.run(function() {
    result = sliderApp.mapObject(configs);
  });
  deepEqual(result, expected, 'should map configs to array');

});

});

require.register("test/unit/views/common/table_view_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

moduleFor('view:table', 'App.TableView');

test('clearFilters', function () {

  var view = this.subject({
    content: [{}],
    filteredContent: [{}],
    endIndex: 2
  });

  Em.run(function () {
    view.clearAllFilters();
  });

  equal(view.get('pageContent.length'), 1, 'all content items should be displayed');

});

});

require.register("test/unit/views/slider_app/summary_view_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

moduleFor('view:SliderAppSummary', 'App.SliderAppSummaryView', {

  needs: [
    'view:AppMetric',
    'view:Chart'
  ],

  setup: function () {
    Em.run(App, App.advanceReadiness);
  },

  teardown: function () {
    App.reset();
  }

});

test('graphsNotEmpty', function () {

  var sliderAppSummaryView = this.subject({
    controller: {
      model: Em.Object.create({
        supportedMetricNames: ''
      })
    }
  });
  Em.run(function () {
    sliderAppSummaryView.set('controller.model.supportedMetricNames', 'firstMetric,secondMetric');
    var v = sliderAppSummaryView.createChildView(sliderAppSummaryView.get('graphs')[0].view);
    v._refreshGraph({
      "metrics": {
        "firstMetric": [
          [
            5.0,
            1401351555
          ]
        ]}
    });
    sliderAppSummaryView.createChildView(sliderAppSummaryView.get('graphs')[1].view);
  });
  ok(sliderAppSummaryView.get('graphsNotEmpty'), 'One graph has metrics');

  Em.run(function () {
    var v = sliderAppSummaryView.createChildView(sliderAppSummaryView.get('graphs')[0].view);
    v._refreshGraph({
      "metrics": {}
    });
  });
  equal(sliderAppSummaryView.get('graphsNotEmpty'), false, 'No one graph has metrics');
});
});


//# sourceMappingURL=test.js.map