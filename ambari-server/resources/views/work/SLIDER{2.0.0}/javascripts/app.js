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
require.register("components/configSection", function(exports, require, module) {
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

App.ConfigSectionComponent = Em.Component.extend({

  layoutName: 'components/configSection',

  config: null,

  section: '',

  /**
   * label for current section
   * @return {String}
   */
  sectionLabel: function () {
    return this.get('section').classify().replace(/([A-Z])/g, ' $1');
  }.property(),

  /**
   * Return True is section name equals 'general'
   * @type {Boolean}
   */
  isGeneral: Ember.computed.equal('section', 'general'),

  /**
   * Return True is section name equals 'custom'
   * @type {Boolean}
   */
  isCustom: Ember.computed.equal('section', 'custom'),

  /**
   * Filtered configs for current section
   * @type {Array}
   */
  sectionConfigs: Ember.computed.filter('config', function (item) {
    if (item.isSet) {
      return item.section === this.get('section');
    }
    if (this.get('isGeneral')) {
      return !item.name.match('^site.') && this.get('predefinedConfigNames').contains(item.name);
    }
    else {
      if (this.get('isCustom')) {
        return !this.get('predefinedConfigNames').contains(item.name);
      }
      else {
        return !!item.name.match('^site.' + this.get('section'));
      }
    }
  }),

  /**
   * Is button "Add Property" visible
   * True - yes, false - no (and "App Property"-form is visible)
   * @type {bool}
   */
  buttonVisible: true,

  /**
   * Template for new config
   * @type {Ember.Object}
   */
  newConfig: Em.Object.create({
    name: '',
    value: '',
    nameError: '',
    hasError: false
  }),

  /**
   * Clear <code>newConfig</code>
   * @method cleanNewConfig
   */
  cleanNewConfig: function() {
    this.get('newConfig').setProperties({
      name: '',
      value: '',
      messsage: '',
      hasError: false
    });
  },

  addPropertyModalButtons: [
    Ember.Object.create({title: Em.I18n.t('common.cancel'), clicked:"discard", dismiss: 'modal'}),
    Ember.Object.create({title: Em.I18n.t('common.add'), clicked:"submit", type:'success'})
  ],

  addPropertyModalTitle: Em.I18n.t('configs.add_property'),

  tooltipRemove:  Em.I18n.t('common.remove'),

  actions: {

    /**
     * Click on "App Property"-button
     * @method addProperty
     */
    addProperty: function() {
      return Bootstrap.ModalManager.show('addPropertyModal');
    },

    /**
     * Delete custom config added by user
     * @param {{name: string, label: string, value: *}} config
     * @method deleteConfig
     */
    deleteConfig: function(config) {
      this.get('config').removeObject(config);
    },

    /**
     * Validate and save custom config added by user
     * @method submit
     */
    submit: function() {
      var name = this.get('newConfig.name'),
        value = this.get('newConfig.value');
      if (this.get('config').mapBy('name').contains(name)) {
        this.get('newConfig').setProperties({
          hasError: true,
          messsage: Em.I18n.t('configs.add_property.name_exists')
        });
        return;
      }
      if (!/^[A-Za-z][A-Za-z0-9_\-\.]*$/.test(name)) {
        this.get('newConfig').setProperties({
          hasError: true,
          messsage: Em.I18n.t('configs.add_property.invalid_name')
        });
        return;
      }
      this.get('config').pushObject(App.ConfigProperty.create({name: name, value: value, label: name}));
      this.cleanNewConfig();
      this.toggleProperty('buttonVisible');
      Bootstrap.ModalManager.hide('addPropertyModal');
    },

    /**
     * Hide "Add Property"-form
     * @method discard
     */
    discard: function() {
      this.cleanNewConfig();
      this.toggleProperty('buttonVisible');
    }
  }

});

});

require.register("config/app", function(exports, require, module) {
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

'use strict';

var config = {
  LOG_TRANSITIONS: true,
  LOG_TRANSITIONS_INTERNAL: false,
  rootElement: window.QUnit ? '#qunit-fixture' : 'body'
};

module.exports = Ember.Application.createWithMixins(Bootstrap, config);

});

require.register("config/env", function(exports, require, module) {
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

'use strict';

module.exports = (function() {
  var envObject = {};
  var moduleNames = window.require.list().filter(function(module) {
    return new RegExp('^envs/').test(module);
  });

  moduleNames.forEach(function(module) {
    var key = module.split('/').reverse()[0];
    envObject[key] = require(module);
  });

  return envObject;
}());

});

require.register("config/router", function(exports, require, module) {
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

'use strict';

module.exports = App.Router.map(function () {
  this.resource("slider_apps", { path: "/" }, function () {
    this.resource('createAppWizard', function(){
      this.route('step1');
      this.route('step2');
      this.route('step3');
      this.route('step4');
    });
  });
  this.resource('slider_app', { path: 'apps/:slider_app_id' }, function() {
    this.route('configs');
    this.route('summary');
  });
});


});

require.register("config/store", function(exports, require, module) {
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

'use strict';

module.exports = App.Store = DS.Store.extend({
  revision: 13
});

});

require.register("controllers/application_controller", function(exports, require, module) {
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

App.ApplicationController = Ember.Controller.extend({

  /**
   * Determines if Slider View instance has any configuration errors
   * @type {boolean}
   */
  hasConfigErrors: false

});

});

require.register("controllers/createAppWizard/step1_controller", function(exports, require, module) {
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

App.CreateAppWizardStep1Controller = Ember.Controller.extend(App.AjaxErrorHandler, {

  needs: "createAppWizard",

  appWizardController: Ember.computed.alias("controllers.createAppWizard"),

  /**
   * New App object
   * @type {App.SliderApp}
   */
  newApp: null,

  /**
   * List of available types for App
   * @type {Array}
   */
  availableTypes: [],

  /**
   * Selected type for new App
   * @type {App.SliderAppType}
   */
  selectedType: null,

  /**
   * Define if <code>newAppName</code> pass validation
   * @type {Boolean}
   */
  isNameError: false,

  /**
   * Error message describing App name validation error
   * @type {String}
   */
  nameErrorMessage: '',

  /**
   * Define if <code>frequency</code> value is valid
   * @type {Boolean}
   */
  isFrequencyError: false,

  /**
   * Error message describing frequency validation error
   * @type {String}
   */
  frequencyErrorMessage: '',

  /**
   * Determines if request for validating new App name is sent
   * If true - "Next" button should be disabled
   * Set to false after request is finished
   * @type {bool}
   */
  validateAppNameRequestExecuting: false,

  /**
   * Define if there are existing App types
   * @type {Boolean}
   */
  isAppTypesError: Em.computed.equal('availableTypes.content.length', 0),

  /**
   * Define description depending on selected App type
   * @type {string}
   */
  typeDescription: function () {
    var selectedType = this.get('selectedType');
    return selectedType ? Em.I18n.t('wizard.step1.typeDescription').format(selectedType.get('displayName')) : '';
  }.property('selectedType'),

  /**
   * Define if submit button is disabled
   * <code>newApp.name</code> should pass validation and be not empty
   * @type {bool}
   */
  isSubmitDisabled: function () {
    return this.get('validateAppNameRequestExecuting') || !this.get('newApp.name') || this.get('isNameError') ||
      this.get('isFrequencyError') || this.get('isAppTypesError');
  }.property('newApp.name', 'isNameError', 'isAppTypesError', 'validateAppNameRequestExecuting', 'isFrequencyError'),

  /**
   * Initialize new App and set it to <code>newApp</code>
   * @method initializeNewApp
   */
  initializeNewApp: function () {
    var app = this.get('appWizardController.newApp'),
      properties = Em.A(['name', 'includeFilePatterns', 'excludeFilePatterns', 'frequency', 'queueName', 'specialLabel', 'selectedYarnLabel']),
      newApp = Ember.Object.create({
        appType: null,
        twoWaySSLEnabled: false,
        configs: {}
      });

    properties.forEach(function(p) {
      newApp.set(p, '');
    });
    newApp.set('selectedYarnLabel', 0);

    if (app) {
      properties.forEach(function(p) {
        newApp.set(p, app.get(p));
      });
    }

    this.set('newApp', newApp);
  },

  /**
   * Load all available types for App
   * @method loadAvailableTypes
   */
  loadAvailableTypes: function () {
    this.set('availableTypes', this.store.all('sliderAppType'));
  },

  /**
   * Validate <code>newAppName</code>
   * It should consist only of letters, numbers, '-', '_' and first character should be a letter
   * @method nameValidator
   * @return {Boolean}
   */
  nameValidator: function () {
    var newAppName = this.get('newApp.name');
    if (newAppName) {
      // new App name should consist only of letters, numbers, '-', '_' and first character should be a letter
      if (!/^[a-z][a-z0-9_-]*$/.test(newAppName)) {
        this.set('isNameError', true);
        this.set('nameErrorMessage', Em.I18n.t('wizard.step1.nameFormatError'));
        return false;
      }
      // new App name should be unique
      if (this.store.all('sliderApp').mapProperty('name').contains(newAppName)) {
        this.set('isNameError', true);
        this.set('nameErrorMessage', Em.I18n.t('wizard.step1.nameRepeatError'));
        return false;
      }
    }
    this.set('isNameError', false);
    return true;
  }.observes('newApp.name'),

  /**
   * Validate <code>frequency</code> value
   * It should be numeric
   * @method frequencyValidator
   * @return {Boolean}
   */
  frequencyValidator: function () {
    var frequency = this.get('newApp.frequency');
    var isFrequencyError = frequency && /\D/.test(frequency);
    this.setProperties({
      isFrequencyError: isFrequencyError,
      frequencyErrorMessage: isFrequencyError ? Em.I18n.t('wizard.step1.frequencyError') : ''
    });
    return !isFrequencyError;
  }.observes('newApp.frequency'),

  /**
   * Proceed if app name has passed server validation
   * @method {validateAppNameSuccessCallback}
   */
  validateAppNameSuccessCallback: function () {
    var self = this;
    Em.run(function () {
      self.saveApp();
      self.get('appWizardController').nextStep();
    });
  },

  /**
   * Proceed if app name has failed server validation
   * @method {validateAppNameErrorCallback}
   */
  validateAppNameErrorCallback: function (request, ajaxOptions, error, opt, params) {
    if (request.status == 409) {
      Bootstrap.ModalManager.open(
        'app-name-conflict',
        Em.I18n.t('common.error'),
        Em.View.extend({
          classNames: ['alert', 'alert-danger'],
          template: Em.Handlebars.compile(Em.I18n.t('wizard.step1.validateAppNameError').format(params.name))
        }),
        [
          Em.Object.create({
            title: Em.I18n.t('ok'),
            dismiss: 'modal',
            type: 'success'
          })
        ],
        this
      );
    } else {
      this.defaultErrorHandler(request, opt.url, opt.type, true);
    }
  },

  /**
   * Complete-callback for validating newAppName request
   * @method validateAppNameCompleteCallback
   */
  validateAppNameCompleteCallback: function() {
    this.set('validateAppNameRequestExecuting', false);
  },

  /**
   * Save new application data to wizard controller
   * @method saveApp
   */
  saveApp: function () {
    var newApp = this.get('newApp');
    newApp.set('appType', this.get('selectedType'));
    newApp.set('configs', this.get('selectedType.configs'));
    newApp.set('predefinedConfigNames', Em.keys(this.get('selectedType.configs')));
    this.set('appWizardController.newApp', newApp);
  },

  actions: {
    submit: function () {
      this.set('validateAppNameRequestExecuting', true);
      return App.ajax.send({
        name: 'validateAppName',
        sender: this,
        data: {
          name: this.get('newApp.name')
        },
        success: 'validateAppNameSuccessCallback',
        error: 'validateAppNameErrorCallback',
        complete: 'validateAppNameCompleteCallback'
      });
    }
  }
});

});

require.register("controllers/createAppWizard/step2_controller", function(exports, require, module) {
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

App.CreateAppWizardStep2Controller = Ember.ArrayController.extend({

  needs: "createAppWizard",

  appWizardController: Ember.computed.alias("controllers.createAppWizard"),

  /**
   * List of app type components
   * @type {Em.Object[]}
   * @see <code>loadTypeComponents</code> for information about elements type
   */
  content: [],

  /**
   * New App object
   * @type {App.SliderApp}
   */
  newApp: null,

  /**
   * Validate all input fields are integer
   * @type {Boolean}
   */
  isError: function () {
    var result = false;
    this.get('content').forEach(function (component) {
      if (!result && (this.isNotInteger(component.get('numInstances')) || this.isNotInteger(component.get('yarnMemory')) || this.isNotInteger(component.get('yarnCPU')))) {
        result = true;
      }
    }, this);
    return result;
  }.property('content.@each.numInstances', 'content.@each.yarnMemory', 'content.@each.yarnCPU'),

  /**
   * Define if submit button is disabled
   * <code>isError</code> should be true
   * @type {bool}
   */
  isSubmitDisabled: Em.computed.alias('isError'),

  /**
   * Initialize new App to use it scope of controller
   * @method initializeNewApp
   */
  initializeNewApp: function () {
    var newApp = this.get('appWizardController.newApp');
    this.set('newApp', newApp);
    this.loadTypeComponents();
  },

  /**
   * @type {Em.Object}
   */
  typeComponent: Em.Object.extend({
    yarnLabelChecked: false,
    yarnLabelNotChecked: Em.computed.not('yarnLabelChecked'),
    yarnLabel: ''
  }),

  /**
   * Fill <code>content</code> with objects created from <code>App.SliderAppTypeComponent</code>
   * If user come from 3 or 4 step, <code>newApp.components</code> are used
   * @method loadTypeComponents
   */
  loadTypeComponents: function () {
    var content = [],
      component = this.get('typeComponent'),
      allTypeComponents = this.get('newApp.appType.components'),
      existingComponents = this.get('appWizardController.newApp.components'); // user may back to current step from 3 or 4
    if (existingComponents && existingComponents.get('length')) {
      this.set('content', existingComponents);
    }
    else {
      if (allTypeComponents && allTypeComponents.get('length')) {
        allTypeComponents.forEach(function (typeComponent) {
          content.push(component.create({
            displayName: typeComponent.get('displayName'),
            name: typeComponent.get('name'),
            priority: typeComponent.get('priority'),
            numInstances: typeComponent.get('defaultNumInstances').toString(),
            yarnMemory: typeComponent.get('defaultYARNMemory').toString(),
            yarnCPU: typeComponent.get('defaultYARNCPU').toString()
          }));
        });
        this.set('content', content);
      }
    }
  },

  /**
   * Check if param is integer (and >= 0)
   * @param {string} value value to check
   * @return {Boolean}
   * @method isNotInteger
   */
  isNotInteger: function (value) {
    return !(value && value.trim().length && (value % 1 == 0) && value >= 0);
  },

  /**
   * Save all data about components to <code>appWizardController.newApp.components</code>
   * @method saveComponents
   */
  saveComponents: function () {
    this.set('appWizardController.newApp.components', this.get('content'));
  },

  actions: {
    /**
     * Save data and proceed to the next step
     * @method submit
     */
    submit: function () {
      this.saveComponents();
      this.get('appWizardController').nextStep();
    }
  }
});

});

require.register("controllers/createAppWizard/step3_controller", function(exports, require, module) {
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

App.CreateAppWizardStep3Controller = Ember.ObjectController.extend({

  needs: "createAppWizard",

  appWizardController: Ember.computed.alias("controllers.createAppWizard"),

  newAppConfigs: Ember.computed.alias("appWizardController.newApp.configs"),

  /**
   * Configs entered in TextFields
   * @type Array
   */
  configs: Em.A(),

  /**
   * predefined settings of configuration properties
   */
  configSettings: {
    'site.global.metric_collector_host': {
    },
    'site.global.metric_collector_port': {
    },
    'site.global.metric_collector_lib': {
    }
  },

  /**
   * Convert configs to array of unique section names
   * @type {Array}
   */
  sectionKeys: function () {
    var configs = this.get('newAppConfigs') || {},
      k = ["general"];

    Object.keys(configs).forEach(function (key) {
      if (key.split('.')[0] == "site") {
        k.push(key.split('.')[1])
      }
    });
    k.push('custom');
    return k.uniq();
  }.property('newAppConfigs'),

  /**
   * Defines if <code>configs</code> are properly key-value formatted
   * @type {Boolean}
   */
  isError: false,

  /**
   * Config object converted from <code>configs</code>
   * @type {Object}
   */
  configsObject: {},

  /**
   * config that describe configurations set
   */
  configsSet: [
    {
      name: 'ams_metrics',
      trigger: {value: false, label: Em.I18n.t('configs.enable.metrics'), viewType: 'checkbox'},
      isSet: true,
      section: 'global',
      configNames: ["site.global.metric_collector_host", "site.global.metric_collector_port", "site.global.metric_collector_lib"],
      configs: [],
      dependencies: []
    }
  ],

  /**
   * Load all data required for step
   * @method loadStep
   */
  loadStep: function () {
    this.clearStep();
    this.initConfigs(true);
  },

  /**
   * Format init value for <code>configs</code> property
   * @param {bool} setDefaults
   * @method initConfigs
   */
  initConfigs: function (setDefaults) {
    var self = this,
      newAppConfigs = this.get('newAppConfigs') || {},
      defaultConfigs = self.get('appWizardController.newApp.appType.configs');
      configs = Em.A(),
      configsSet = $.extend(true, [], this.get('configsSet')),
      allSetConfigs = {},
      configSettings = this.get('configSettings');

    configsSet.forEach(function (item) {
      item.configNames.forEach(function (configName) {
        allSetConfigs[configName] = item;
        if(!newAppConfigs[configName] && defaultConfigs && defaultConfigs[configName]){
          newAppConfigs[configName] = defaultConfigs[configName];
        }
      });
    });

    Object.keys(newAppConfigs).forEach(function (key) {
      var label = (!!key.match('^site.')) ? key.substr(5) : key;
      var configSetting = (configSettings[key]) ?
        $.extend({name: key, value: newAppConfigs[key], label: label}, configSettings[key]) :
        {name: key, value: newAppConfigs[key], label: label};

      if (key === 'java_home' && !!setDefaults && App.get('javaHome')) {
        configSetting.value = App.get('javaHome');
      }

      if (key === "site.global.metric_collector_host" && !!setDefaults && App.get('metricsHost')) {
        configSetting.value = App.get('metricsHost');
      }

      if (key === "site.global.metric_collector_port" && !!setDefaults && App.get('metricsPort')) {
        configSetting.value = App.get('metricsPort');
      }

      if (key === "site.global.metric_collector_lib" && !!setDefaults && App.get('metricsLibPath')) {
        configSetting.value = App.get('metricsLibPath');
      }

      if (allSetConfigs[key]) {
        allSetConfigs[key].configs.push(App.ConfigProperty.create(configSetting));
      } else {
        configs.push(App.ConfigProperty.create(configSetting));
      }
    });

    configsSet.forEach(function (configSet) {
      if (configSet.configs.length === configSet.configNames.length) {
        delete configSet.configNames;
        configSet.trigger = App.ConfigProperty.create(configSet.trigger);
        this.initConfigSetDependencies(configSet);
        configs.unshift(configSet);
      }
    }, this);

    this.set('configs', configs);
  },

  /**
   * initialize dependencies map for config set by name
   * configSet map changed by reference
   *
   * @param {object} configSet
   * @method initConfigSetDependencies
   */
  initConfigSetDependencies: function (configSet) {
    configSet.dependencies.forEach(function (item) {
      item.map = Em.get(item.name);
    });
  },

  /**
   * Clear all initial data
   * @method clearStep
   */
  clearStep: function () {
    this.set('isError', false);
  },

  /**
   * Validate <code>configs</code> to be key-value formatted amd convert it to object
   * @return {Boolean}
   * @method validateConfigs
   */
  validateConfigs: function () {
    var self = this,
      result = true,
      configs = this.addConfigSetProperties(this.get('configs')),
      configsObject = {};

    try {
      configs.forEach(function (item) {
        configsObject[item.name] = item.value;
      });
      self.set('configsObject', configsObject);
    } catch (e) {
      self.set('isError', true);
      result = false;
    }
    return result;
  },

  /**
   * add config properties from config sets to general configs array
   * @param configs
   * @return {Array}
   */
  addConfigSetProperties: function (configs) {
    var newConfigs = [];
    configs.filterBy('isSet').forEach(function (item) {
      if (item.trigger.value) {
        newConfigs.pushObjects(item.configs);
      }
    });
    return configs.filterBy('isSet', false).concat(newConfigs);
  },

  /**
   * Save converted configs to new App configs
   * @method saveConfigs
   */
  saveConfigs: function () {
    var configsToSet = this.get('configsObject');
    if (configsToSet['site.global.metrics_enabled']!=null) {
      if (configsToSet['site.global.metric_collector_host']!=null &&
          configsToSet['site.global.metric_collector_port']!=null) {
        configsToSet['site.global.metrics_enabled'] = "true";
      } else {
        configsToSet['site.global.metrics_enabled'] = "false";
      }
    }
    this.set('newAppConfigs', configsToSet);
  },

  actions: {

    /**
     * If <code>configs</code> is valid, than save it and proceed to the next step
     */
    submit: function () {
      if (this.validateConfigs()) {
        this.saveConfigs();
        this.get('appWizardController').nextStep();
      }
    }
  }
});

});

require.register("controllers/createAppWizard/step4_controller", function(exports, require, module) {
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

App.CreateAppWizardStep4Controller = Ember.ObjectController.extend(App.AjaxErrorHandler, {

  needs: "createAppWizard",

  appWizardController: Ember.computed.alias("controllers.createAppWizard"),

  /**
   * New App object
   * @type {App.SliderApp}
   */
  newApp: null,

  /**
   * Define if submit button is disabled
   * @type {Boolean}
   */
  isSubmitDisabled: false,

  /**
   * Return formatted configs to show them on preview page
   * @return {String}
   */
  configsFormatted: function () {
    var result = '';
    var configs = this.get('newApp.configs');
    if (configs) {
      result = JSON.stringify(configs);
      result = result.substring(1, result.length - 1);
      result = result.replace(/",/g, '",\n');
    }
    return result;
  }.property('newApp.configs'),

  /**
   * Return formatted object to send it in request to server
   * @type {Object[]}
   */
  resourcesFormatted: function () {
    var resources = {};
    var newApp = this.get('newApp');
    // Log Aggregation
    var includeFilePatterns = newApp.get('includeFilePatterns');
    var excludeFilePatterns = newApp.get('excludeFilePatterns');
    var frequency = newApp.get('frequency');
    if ((includeFilePatterns != null && includeFilePatterns.trim().length > 0)
        || (excludeFilePatterns != null && excludeFilePatterns.trim().length > 0)
        || (frequency != null && frequency.trim().length > 0)) {
      resources.global = {
        "yarn.log.include.patterns": includeFilePatterns,
        "yarn.log.exclude.patterns": excludeFilePatterns,
        "yarn.log.interval": frequency
      };
    }
    // Components
    resources.components = newApp.get('components').map(function (component) {
      var componentObj = {
        'id': component.get('name'),
        'instanceCount': component.get('numInstances'),
        'yarnMemory': component.get('yarnMemory'),
        'yarnCpuCores': component.get('yarnCPU'),
        'priority': component.get('priority')
      };
      if (component.get('yarnLabelChecked')) {
        componentObj.yarnLabel = component.get('yarnLabel') == null ? ""
            : component.get('yarnLabel').trim();
      }
      return componentObj;
    });
    // YARN Labels
    var yarnLabelOption = newApp.get('selectedYarnLabel');
    if (yarnLabelOption > 0) {
      // 1=empty label. 2=specific label
      var label = "";
      if (yarnLabelOption == 2) {
        label = newApp.get('specialLabel');
      }
      resources.components.push({
        'id': 'slider-appmaster',
        'yarn.label.expression': label
      });
    }
    return resources;
  }.property('newApp.components.@each.numInstances', 'newApp.components.@each.yarnMemory', 'newApp.components.@each.yarnCPU', 'newApp.components.@each.priority', 'newApp.components.@each.yarnLabelChecked', 'newApp.components.@each.yarnLabel'),

  /**
   * Load all required data for step
   * @method loadStep
   */
  loadStep: function () {
    this.initializeNewApp();
  },

  /**
   * Initialize new App to use it scope of controller
   * @method initializeNewApp
   */
  initializeNewApp: function () {
    var newApp = this.get('appWizardController.newApp');
    this.set('newApp', newApp);
  },

  /**
   * Send request to server to deploy new App
   * @return {$.ajax}
   * @method sendAppDataToServer
   */
  sendAppDataToServer: function () {
    var app = this.get('newApp');
    var dataObj = {
      typeName: app.get('appType.index'),
      typeVersion: app.get('appType.version'),
      name: app.get('name'),
      twoWaySSLEnabled: app.get('twoWaySSLEnabled') + "",
      resources: this.get('resourcesFormatted'),
      typeConfigs: app.get('configs')
    };
    if (app.queueName != null && app.queueName.trim().length > 0) {
      dataObj.queue = app.queueName.trim();
    }
    this.set('isSubmitDisabled', true);
    return App.ajax.send({
      name: 'createNewApp',
      sender: this,
      data: {
        data: dataObj
      },
      success: 'sendAppDataToServerSuccessCallback',
      complete: 'sendAppDataToServerCompleteCallback'
    });
  },

  /**
   * Success-callback for "create new app"-request
   * @method sendAppDataToServerSuccessCallback
   */
  sendAppDataToServerSuccessCallback: function() {
    this.get('appWizardController').hidePopup();
  },

  /**
   * Complete-callback for "create new app"-request
   * @method sendAppDataToServerCompleteCallback
   */
  sendAppDataToServerCompleteCallback: function () {
    this.set('isSubmitDisabled', false);
  },

  actions: {

    /**
     * Onclick handler for finish button
     * @method finish
     */
    finish: function () {
      this.sendAppDataToServer();
    }
  }
});

});

require.register("controllers/create_app_wizard_controller", function(exports, require, module) {
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

App.CreateAppWizardController = Ember.ObjectController.extend({

  /**
   * New app created via current wizard
   * Populated with data step by step
   * @type {object|null}
   */
  newApp: null,

  /**
   * Current step number
   * @type {number}
   */
  currentStep: 1,

  /**
   * Overall steps count
   * @type {number}
   */
  TOTAL_STEPS_NUMBER: 4,

  /**
   * Init controller's data
   * @method loadStep
   */
  loadStep: function () {
    this.set('currentStep', 1);
    this.gotoStep(this.get('currentStep'));
  },

  /**
   * Proceed user to selected step
   * @param {number} step step's number
   * @param {bool} fromNextButton is user came from "Next"-button click
   * @method gotoStep
   */
  gotoStep: function (step, fromNextButton) {
    if (step > this.get('TOTAL_STEPS_NUMBER') || step < 1 || (!fromNextButton && step > this.get('currentStep'))) {
      return;
    }
    this.set('currentStep', step);

    if (step == 1) {
      this.dropCustomConfigs();
    }
    this.transitionToRoute('createAppWizard.step' + step);
  },

  /**
   * Custom configs added by used should be dropped if user come back to the 1st step
   * @method dropCustomConfigs
   */
  dropCustomConfigs: function() {
    var configs = this.get('newApp.configs'),
      predefined = this.get('newApp.predefinedConfigNames'),
      filtered = {};
    if (!configs) return;
    Em.keys(configs).forEach(function(name) {
      if (predefined.contains(name)) {
        filtered[name] = configs[name];
      }
    });
    this.set('newApp.configs', filtered);
  },

  /**
   * Proceed user no next step
   * @method nextStep
   */
  nextStep: function () {
    this.gotoStep(this.get('currentStep') + 1, true);
  },

  /**
   * Proceed user to prev step
   * @method prevStep
   */
  prevStep: function () {
    this.gotoStep(this.get('currentStep') - 1);
  },

  /**
   * Hide wizard-popup
   * @method hidePopup
   */
  hidePopup: function () {
    $('#createAppWizard').hide();
    this.set('newApp', null);
    this.transitionToRoute('slider_apps');
  },

  actions: {

    /**
     * Proceed user to selected step
     * @param {number} step step's number
     * @method gotoStep
     */
    gotoStep: function (step) {
      this.gotoStep(step);
    }
  }

});

});

require.register("controllers/slider_app/summary_controller", function(exports, require, module) {
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

App.SliderAppSummaryController = Ember.Controller.extend({

  /**
   * Alias for model-displayName
   * @type {string}
   */
  appType: Em.computed.alias('model.appType.displayName')

});

});

require.register("controllers/slider_app_controller", function(exports, require, module) {
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

App.SliderAppController = Ember.ObjectController.extend(App.AjaxErrorHandler, {

  /**
   * List of Slider App tabs
   * @type {{title: string, linkTo: string}[]}
   */
  sliderAppTabs: function () {
    var configs = this.get("model.configs");
    var tabs = Ember.A([
      Ember.Object.create({title: Ember.I18n.t('common.summary'), linkTo: 'slider_app.summary'})
    ]);
    if(typeof configs == "object" && Object.keys(configs).length > 0){
      tabs.pushObject(Ember.Object.create({title: Ember.I18n.t('common.configs'), linkTo: 'slider_app.configs'}));
    }
    return tabs;
  }.property('model.configs'),

  /**
   * Do we have quicklinks ?
   * @type {bool}
   */
  weHaveQuicklinks: function () {
    return (Em.get(this.get('model'), 'quickLinks.content.content.length') > 0);
  }.property('model.quickLinks.content.content.length'),

  /**
   * Quick links in custom order.
   *
   * @type {Array}
   **/
  quickLinksOrdered: function() {
    var copy = this.get('model.quickLinks').slice(0);
    var toTail = ['Metrics UI', 'Metrics API'];

    if (this.get('weHaveQuicklinks')) {
      toTail.forEach(function(labelName) {
        if (copy.findBy('label', labelName)) {
          copy = copy.concat(copy.splice(copy.indexOf(copy.findBy('label', labelName)), 1));
        }
      });
    }
    return copy;
  }.property('model.quickLinks.content.content.length', 'weHaveQuicklinks'),

  /**
   * List of all possible actions for slider app
   * @type {Em.Object}
   */
  appActions: Em.Object.create({
    stop: {
      title: 'Stop',
      action: 'freeze',
      confirm: true
    },
    flex: {
      title: 'Flex',
      action: 'flex',
      confirm: false
    },
    destroy: {
      title: 'Destroy',
      action: 'destroy',
      customConfirm: 'confirmDestroy'
    },
    start: {
      title: 'Start',
      action: 'thaw',
      confirm: false
    }
  }),

  /**
   * map of available action for slider app according to its status
   * key - status, value - list of actions
   * @type {Em.Object}
   */
  statusActionsMap: Em.Object.create({
    NEW: ['stop'],
    NEW_SAVING: ['stop'],
    ACCEPTED: ['stop'],
    RUNNING: ['stop', 'flex'],
    FINISHED: ['start', 'destroy'],
    FAILED: ['destroy'],
    KILLED: ['destroy'],
    FROZEN: ['start', 'destroy']
  }),

  /**
   * List of available for model actions
   * Based on <code>model.status</code>
   * @type {Ember.Object[]}
   */
  availableActions: function() {
    var actions = Em.A([]),
      advanced = Em.A([]),
      appActions = this.get('appActions'),
      statusActionsMap = this.get('statusActionsMap'),
      status = this.get('model.status');

    if (this.get('model.isActionFinished')) this.get('model').set('isActionPerformed', false);
    statusActionsMap[status].forEach(function(action) {
      if ('destroy' === action) {
        advanced.pushObject(appActions[action]);
      }
      else {
        actions.pushObject(appActions[action]);
      }
    });

    if (advanced.length) {
      actions.pushObject({
        title: 'Advanced',
        submenu: advanced
      });
    }
    return actions;
  }.property('model.status'),

  /**
   * Checkbox in the destroy-modal
   * If true - enable "Destroy"-button
   * @type {bool}
   */
  confirmChecked: false,

  /**
   * Inverted <code>confirmChecked</code>-value
   * Used in <code>App.DestroyAppPopupFooterView</code> to enable "Destroy"-button
   * @type {bool}
   */
  destroyButtonEnabled: Ember.computed.not('confirmChecked'),

  /**
   * Method's name that should be called for model
   * @type {string}
   */
  currentAction: null,

  /**
   * Grouped components by name
   * @type {{name: string, count: number}[]}
   */
  groupedComponents: [],

  /**
   * Does new instance counts are invalid
   * @type {bool}
   */
  groupedComponentsHaveErrors: false,

  /**
   * Custom popup for "Destroy"-action
   * @method destroyConfirm
   */
  confirmDestroy: function() {
    var modalComponent = this.container.lookup('component-lookup:main').
      lookupFactory('bs-modal', this.get('container')).create();
    modalComponent.setProperties({
      name: 'confirm-modal',
      title: Ember.I18n.t('sliderApp.destroy.confirm.title'),
      manual: true,
      targetObject: this,
      body: App.DestroyAppPopupView,
      controller: this,
      footerViews: [App.DestroyAppPopupFooterView]
    });
    Bootstrap.ModalManager.register('confirm-modal', modalComponent);
  },

  /**
   * Try call controller's method with name stored in <code>currentAction</code>
   * @method tryDoAction
   */
  tryDoAction: function() {
    var currentAction = this.get('currentAction');
    if (Em.isNone(currentAction)) return;
    if(Em.typeOf(this[currentAction]) !== 'function') return;
    this[currentAction]();
  },

  /**
   * Do request to <strong>thaw</strong> current slider's app
   * @returns {$.ajax}
   * @method freeze
   */
  thaw: function() {
    var model = this.get('model');
    this.setStartAction();
    return App.ajax.send({
      name: 'changeAppState',
      sender: this,
      data: {
        id: model.get('id'),
        data: {
          id: model.get('id'),
          name: model.get('name'),
          state: "RUNNING"
        }
      },
      success: 'thawSuccessCallback',
      error: 'actionErrorCallback'
    });
  },

  /**
   * Redirect to Slider Apps Table page on successful thawing
   * @method thawSuccessCallback
   */
  thawSuccessCallback: function () {
    this.transitionToRoute('slider_apps.index');
  },

  /**
   * Do request to <strong>freeze</strong> current slider's app
   * @returns {$.ajax}
   * @method freeze
   */
  freeze: function() {
    var model = this.get('model');
    this.setStartAction();
    return App.ajax.send({
      name: 'changeAppState',
      sender: this,
      data: {
        id: model.get('id'),
        data: {
          id: model.get('id'),
          name: model.get('name'),
          state: "FROZEN"
        }
      },
      error: 'actionErrorCallback'
    });
  },

  /**
   * Group components by <code>componentName</code> and save them to <code>groupedComponents</code>
   * @method groupComponents
   */
  groupComponents: function() {
    var groupedComponents = this.get('appType.components').map(function(c) {
      return {
        name: c.get('name'),
        count: 0
      };
    });

    this.get('components').forEach(function(component) {
      var name = component.get('componentName'),
        group = groupedComponents.findBy('name', name);
      if (group) {
        group.count++;
      }
    });
    this.set('groupedComponents', groupedComponents);
  },

  /**
   * Validate new instance counts for components (should be integer and >= 0)
   * @method validateGroupedComponents
   * @returns {boolean}
   */
  validateGroupedComponents: function() {
    var hasErrors = false;
    this.get('groupedComponents').forEach(function(c) {
      if (!/^\d+$/.test(c.count)) {
        hasErrors = true;
        return;
      }
      var count = parseInt(c.count + 0);
      if (count < 0) {
        hasErrors = true;
      }
    });
    this.set('groupedComponentsHaveErrors', hasErrors);
    return hasErrors;
  },

  /**
   * Do request to <strong>flex</strong> current slider's app
   * @method flex
   */
  flex: function() {
    this.groupComponents();
    Bootstrap.ModalManager.open(
      'flex-popup',
      'Flex',
      'slider_app/flex_popup',
      Em.A([
        Ember.Object.create({title: Em.I18n.t('common.cancel'), clicked:"closeFlex", dismiss: 'modal'}),
        Ember.Object.create({title: Em.I18n.t('common.save'), clicked:"submitFlex", type:'success'})
      ]),
      this
    );
  },

  /**
   * Map <code>model.components</code> for Flex request
   * Output format:
   * <code>
   *   {
   *      COMPONENT_NAME_1: {
   *        instanceCount: 1
   *      },
   *      COMPONENT_NAME_2: {
   *        instanceCount: 2
   *      },
   *      ....
   *   }
   * </code>
   * @returns {object}
   * @method mapComponentsForFlexRequest
   */
  mapComponentsForFlexRequest: function() {
    var components = {};
    this.get('groupedComponents').forEach(function(component) {
      components[Em.get(component, 'name')] = {
        instanceCount: Em.get(component, 'count')
      }
    });
    return components;
  },

  /**
   * Do request to <strong>delete</strong> current slider's app
   * @return {$.ajax}
   * @method destroy
   */
  destroy: function() {
    this.setStartAction();
    return App.ajax.send({
      name: 'destroyApp',
      sender: this,
      data: {
        model: this.get('model'),
        id: this.get('model.id')
      },
      success: 'destroySuccessCallback',
      error: 'actionErrorCallback'
    });
  },

  /**
   * Complete-callback for "destroy app"-request
   * @method destroyCompleteCallback
   */
  destroySuccessCallback: function(data, opt, params) {
    params.model.deleteRecord();
    this.store.dematerializeRecord(params.model);
    this.transitionToRoute('slider_apps');
  },

  actionErrorCallback: function() {
    this.defaultErrorHandler(arguments[0], arguments[3].url, arguments[3].type, true);
    this.get('model').set('isActionPerformed', false);
  },

  actions: {

    /**
     * Submit new instance counts for app components
     * @method submitFlex
     * @returns {*}
     */
    submitFlex: function() {
      if (this.validateGroupedComponents()) return;
      var model = this.get('model'),
        components = this.mapComponentsForFlexRequest();
      this.get('groupedComponents').clear();
      this.set('groupedComponentsHaveErrors', false);
      Bootstrap.ModalManager.close('flex-popup');
      return App.ajax.send({
        name: 'flexApp',
        sender: this,
        data: {
          id: model.get('id'),
          data: {
            id: model.get('id'),
            name: model.get('name'),
            components: components
          }
        }
      });
    },

    /**
     * Close flex-popup
     * @method closeFlex
     */
    closeFlex: function() {
      this.get('groupedComponents').clear();
      this.set('groupedComponentsHaveErrors', false);
    },

    /**
     * Handler for "Yes" click in modal popup
     * @returns {*}
     * @method modalConfirmed
     */
    modalConfirmed: function() {
      this.tryDoAction();
      this.set('confirmChecked', false);
      return Bootstrap.ModalManager.close('confirm-modal');
    },

    /**
     * Handler for "No" click in modal popup
     * @returns {*}
     * @method modalCanceled
     */
    modalCanceled: function() {
      this.set('confirmChecked', false);
      return Bootstrap.ModalManager.close('confirm-modal');
    },

    /**
     * Handler for Actions menu elements click
     * @param {{title: string, action: string, confirm: bool}} option
     * @method openModal
     */
    openModal: function(option) {
      if (!option.action) return false;
      this.set('currentAction', option.action);
      if (!Em.isNone(option.customConfirm) && Ember.typeOf(this.get(option.customConfirm)) === 'function') {
        this[option.customConfirm]();
      }
      else {
        if (option.confirm) {
          Bootstrap.ModalManager.open(
            "confirm-modal",
            Ember.I18n.t('common.confirmation'),
            Ember.View.extend({
              template: Ember.Handlebars.compile('{{t question.sure}}')
            }),
            [
              Ember.Object.create({title: Em.I18n.t('common.cancel'), clicked:"modalCanceled", dismiss: 'modal'}),
              Ember.Object.create({title: Em.I18n.t('ok'), clicked:"modalConfirmed", type:'success'})
            ],
            this
          );
        }
        else {
          this.tryDoAction();
        }
      }
    }
  },

  setStartAction: function() {
    this.get('model').set('isActionPerformed' , true);
    this.get('model').set('statusBeforeAction' , this.get('model.status'));
  }

});

});

require.register("controllers/slider_apps_controller", function(exports, require, module) {
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

App.SliderAppsController = Ember.ArrayController.extend({
  /**
   * show modal popup that says apps currently unavailable
   */
  showUnavailableAppsPopup: function(message) {
    this.set('errorMessage', message || Em.I18n.t('slider.apps.undefined.issue'));
    Bootstrap.ModalManager.open(
      "apps-warning-modal",
      Em.I18n.t('common.warning'),
      'unavailable_apps',
      [
        Ember.Object.create({title: Em.I18n.t('ok'), dismiss: 'modal'})
      ],
      this
    );
  }
});

});

require.register("controllers/slider_controller", function(exports, require, module) {
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

/**
 * Load Slider-properties.
 * After this set <code>App.sliderConfig</code>-models and enable/disable Slider
 * @type {Ember.Controller}
 */
App.SliderController = Ember.Controller.extend(App.RunPeriodically, {

  /**
   *  Load resources on controller initialization
   * @method initResources
   */
  initResources: function () {
    this.getParametersFromViewProperties();
  },

  /**
   * Load Slider display information
   * @returns {$.ajax}
   * @method getViewDisplayParameters
   */
  getViewDisplayParameters: function() {
    return App.ajax.send({
      name: 'slider.getViewParams',
      sender: this,
      success: 'getViewDisplayParametersSuccessCallback'
    });
  },

  /**
   * Accessing /resources/status initializes the view internals
   * with the latest configs. This will help the view in staying
   * updated and recover from previous config issues.
   */
  touchViewStatus: function() {
    return App.ajax.send({
      name: 'slider.getViewParams.v2',
      sender: this
    });
  },

  /**
   * Set Slider label and description to <code>App</code> properties
   * @param {object} data
   * @method getViewDisplayParametersSuccessCallback
   */
  getViewDisplayParametersSuccessCallback: function(data) {
    App.set('description', Em.get(data, 'ViewInstanceInfo.description'));
    App.set('label', Em.get(data, 'ViewInstanceInfo.label'));
    App.set('javaHome', Em.get(data, 'ViewInstanceInfo.instance_data') && Em.get(data, 'ViewInstanceInfo.instance_data')['java.home']);
    App.set('sliderUser', Em.get(data, 'ViewInstanceInfo.instance_data') && Em.get(data, 'ViewInstanceInfo.instance_data')['slider.user']);
  },

  /**
   * Get Slider properties from View-parameters (set in the Ambari Admin View)
   * If parameters can't be found, use Ambari-configs to populate Slider properties
   * @returns {$.ajax}
   * @method getParametersFromViewProperties
   */
  getParametersFromViewProperties: function () {
    return App.ajax.send({
      name: 'slider.getViewParams.v2',
      sender: this,
      success: 'getParametersFromViewPropertiesSuccessCallback'
    });
  },

  /**
   * Check if Slider-properties exist
   * If exist - set Slider properties using view-configs
   * If not - get Ambari configs to populate Slider properties
   * @param {object} data
   * @method getParametersFromViewPropertiesSuccessCallback
   */
  getParametersFromViewPropertiesSuccessCallback: function (data) {
    var properties = Em.get(data, 'parameters'),
      sliderConfigs = App.SliderApp.store.all('sliderConfig');
    sliderConfigs.forEach(function (model) {
      var key = model.get('viewConfigName');
      model.set('value', properties[key]);
    });
    if (properties['view.slider.user'] != null
        && properties['view.slider.user'] != App.get('sliderUser')) {
      App.set('sliderUser', properties['view.slider.user']);
    }
    if (properties['java.home'] != null
        && properties['java.home'] != App.get('javaHome')) {
      App.set('javaHome', properties['java.home']);
    }
    this.initMetricsServerProperties();
    this.finishSliderConfiguration(data);
  },

  /**
   * initialize properties of Metrics Server that are required by Slider View
   * @method initMetricsServerProperties
   */
  initMetricsServerProperties: function () {
    var sliderConfigs = App.SliderApp.store.all('sliderConfig'),
      metricsPort = sliderConfigs.findBy('viewConfigName', 'site.global.metric_collector_port'),
      metricsHost = sliderConfigs.findBy('viewConfigName', 'site.global.metric_collector_host'),
      metricsLibPath = sliderConfigs.findBy('viewConfigName', 'site.global.metric_collector_lib');
    App.set('metricsHost', metricsHost.get('value'));
    App.set('metricsPort', metricsPort.get('value'));
    App.set('metricsLibPath', metricsLibPath.get('value'));
  },

  /**
   * After all Slider-configs are loaded, application should check self status
   * @param {object} data - received from server information about current Slider-status
   * @method finishSliderConfiguration
   */
  finishSliderConfiguration: function (data) {
    App.setProperties({
      viewErrors: data.validations,
      viewEnabled: data.validations.length === 0,
      mapperTime: new Date().getTime()
    });
  }

});

});

require.register("controllers/tooltip_controller", function(exports, require, module) {
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

App.TooltipBoxController = Bootstrap.TooltipBoxController;
});

require.register("helpers/ajax", function(exports, require, module) {
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

/**
 * Config for each ajax-request
 *
 * Fields example:
 *  mock - testMode url
 *  real - real url (without API prefix)
 *  type - request type (also may be defined in the format method)
 *  format - function for processing ajax params after default formatRequest. May be called with one or two parameters (data, opt). Return ajax-params object
 *  schema - basic validation schema (tv4) for response (optional)
 *
 * @type {Object}
 */
var urls = {

  'slider.getViewParams': {
    real: '?fields=ViewInstanceInfo',
    mock: '/data/resource/slider-properties.json',
    headers: {
      Accept: "text/plain; charset=utf-8",
      "Content-Type": "text/plain; charset=utf-8"
    },
    schema: {
      required: ['ViewInstanceInfo'],
      properties: {
        ViewInstanceInfo: {
          required: ['properties', 'description', 'label']
        }
      }
    }
  },

  'slider.getViewParams.v2': {
    real: 'resources/status',
    mock: '/data/resource/slider-properties-2.json',
    headers: {
      "Accept": "application/json; charset=utf-8",
      "Content-Type": "text/plain; charset=utf-8"
    },
    schema: {
      required: ['version', 'validations', 'parameters'],
      properties: {
        validations: {
          type: 'array'
        },
        parameters: {
          type : 'object'
        }
      }
    }
  },

  'mapper.applicationTypes': {
    real: 'apptypes?fields=*',
    mock: '/data/apptypes/all_fields.json',
    headers: {
      Accept: "text/plain; charset=utf-8",
      "Content-Type": "text/plain; charset=utf-8"
    },
    schema: {
      required: ['items'],
      properties: {
        items: {
          type: 'array',
          items: {
            required: ['id', 'typeComponents', 'typeConfigs'],
            properties: {
              typeConfigs: {
                type: 'object'
              },
              typeComponents: {
                type: 'array',
                items: {
                  required: ['id', 'name', 'category', 'displayName']
                }
              }
            }
          }
        }
      }
    }
  },

  'mapper.applicationApps': {
    real: '?fields=apps/*',
    mock: '/data/apps/apps.json',
    headers: {
      Accept: "text/plain; charset=utf-8",
      "Content-Type": "text/plain; charset=utf-8"
    },
    'format': function() {
      return {
        timeout: 20000
      };
    },
    schema: {
      required: ['items'],
      properties: {
        items: {
          type: 'array',
          items: {
            required: ['id', 'description', 'diagnostics', 'name', 'user', 'state', 'type', 'components', 'configs'],
            alerts: {
              type: 'object',
              detail: {
                type: 'array'
              }
            }
          }
        }
      }
    }
  },

  'mapper.applicationStatus': {
    real: 'resources/status',
    mock: '/data/resource/status_true.json'
  },

  'saveInitialValues': {
    real: '',
    mock: '/data/resource/empty_json.json',
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    },
    format: function (data) {
      return {
        type: 'PUT',
        data: JSON.stringify(data.data),
        dataType: 'text'
      }
    }
  },

  'validateAppName': {
    real: 'apps?validateAppName={name}',
    mock: '/data/resource/empty_json.json',
    format: function () {
      return {
        dataType: 'text',
        showErrorPopup: true
      }
    }
  },

  'createNewApp': {
    real: 'apps',
    mock: '/data/resource/empty_json.json',
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    },
    format: function (data) {
      return {
        type: 'POST',
        data: JSON.stringify(data.data),
        dataType: 'text',
        showErrorPopup: true
      }
    }
  },

  'destroyApp': {
    real: 'apps/{id}',
    mock: '',
    format: function () {
      return {
        method: 'DELETE',
        dataType: 'text',
        showErrorPopup: true
      }
    }
  },

  'changeAppState': {
    real: 'apps/{id}',
    mock: '',
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    },
    format: function (data) {
      return {
        method: 'PUT',
        data: JSON.stringify(data.data),
        dataType: 'text',
        showErrorPopup: true
      }
    }
  },
  'flexApp': {
    real: 'apps/{id}',
    mock: '',
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    },
    format: function (data) {
      return {
        method: 'PUT',
        data: JSON.stringify(data.data),
        dataType: 'text',
        showErrorPopup: true
      }
    }
  },

  'metrics': {
    real: 'apps/{id}?fields=metrics/{metric}',
    mock: '/data/metrics/metric.json',
    headers: {
      "Accept": "text/plain; charset=utf-8",
      "Content-Type": "text/plain; charset=utf-8"
    }
  },

  'metrics2': {
    real: 'apps/{id}/metrics/{metric}',
    mock: '/data/metrics/metric2.json'
  },

  'metrics3': {
    real: 'apps/{id}/metrics/{metric}',
    mock: '/data/metrics/metric3.json'
  },

  'metrics4': {
    real: 'apps/{id}/metrics/{metric}',
    mock: '/data/metrics/metric4.json'
  }

};
/**
 * Replace data-placeholders to its values
 *
 * @param {String} url
 * @param {Object} data
 * @return {String}
 */
var formatUrl = function (url, data) {
  if (!url) return null;
  var keys = url.match(/\{\w+\}/g);
  keys = (keys === null) ? [] : keys;
  if (keys) {
    keys.forEach(function (key) {
      var raw_key = key.substr(1, key.length - 2);
      var replace;
      if (!data || !data[raw_key]) {
        replace = '';
      }
      else {
        replace = data[raw_key];
      }
      url = url.replace(new RegExp(key, 'g'), replace);
    });
  }
  return url;
};

/**
 * this = object from config
 * @return {Object}
 */
var formatRequest = function (data) {
  var opt = {
    type: this.type || 'GET',
    dataType: 'json',
    async: true,
    headers: this.headers || {Accept: "application/json; charset=utf-8"}
  };
  if (App.get('testMode')) {
    opt.url = formatUrl(this.mock ? this.mock : '', data);
    opt.type = 'GET';
  }
  else {
    var prefix = App.get('urlPrefix');
    if (Em.get(data, 'urlPrefix')) {
      prefix = Em.get(data, 'urlPrefix');
    }
    var url = formatUrl(this.real, data);
    opt.url = prefix + (url ? url : '');
    if (this.format) {
      jQuery.extend(opt, this.format(data, opt));
    }
  }

  return opt;
};

/**
 * Wrapper for all ajax requests
 *
 * @type {Object}
 */
var ajax = Em.Object.extend({
  /**
   * Send ajax request
   *
   * @param {Object} config
   * @return {$.ajax} jquery ajax object
   *
   * config fields:
   *  name - url-key in the urls-object *required*
   *  sender - object that send request (need for proper callback initialization) *required*
   *  data - object with data for url-format
   *  beforeSend - method-name for ajax beforeSend response callback
   *  success - method-name for ajax success response callback
   *  error - method-name for ajax error response callback
   *  callback - callback from <code>App.updater.run</code> library
   */
  send: function (config) {

    Ember.assert('Ajax sender should be defined!', config.sender);
    Ember.assert('Invalid config.name provided - ' + config.name, urls[config.name]);

    var opt = {};

    // default parameters
    var params = {
      clusterName: App.get('clusterName')
    };

    if (config.data) {
      jQuery.extend(params, config.data);
    }

    opt = formatRequest.call(urls[config.name], params);
    opt.context = this;

    // object sender should be provided for processing beforeSend, success, error and complete responses
    opt.beforeSend = function (xhr) {
      if (config.beforeSend) {
        config.sender[config.beforeSend](opt, xhr, params);
      }
    };

    opt.success = function (data) {
      console.log("TRACE: The url is: " + opt.url);

      // validate response if needed
      if (urls[config.name].schema) {
        var result = tv4.validateMultiple(data, urls[config.name].schema);
        if (!result.valid) {
          result.errors.forEach(function (error) {
            console.warn('Request: ' + config.name, 'WARNING: ', error.message, error.dataPath);
          });
        }
      }

      if (config.success) {
        config.sender[config.success](data, opt, params);
      }
    };

    opt.error = function (request, ajaxOptions, error) {
      if (config.error) {
        config.sender[config.error](request, ajaxOptions, error, opt, params);
      } else if (config.sender.defaultErrorHandler) {
        config.sender.defaultErrorHandler.call(config.sender, request, opt.url, opt.type, opt.showErrorPopup);
      }
    };

    opt.complete = function (xhr, status) {
      if (config.complete) {
        config.sender[config.complete](xhr, status);
      }
    };

    return $.ajax(opt);
  }

});

App.ajax = ajax.create({});

});

require.register("helpers/helper", function(exports, require, module) {
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


String.prototype.format = function () {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};

/**
 * Return formatted string with inserted spaces before upper case and replaced '_' to spaces
 * Also capitalize first letter
 *
 * Examples:
 * 'apple' => 'Apple'
 * 'apple_banana' => 'Apple banana'
 * 'apple_bananaUranium' => 'Apple banana Uranium'
 */
String.prototype.humanize = function () {
  var content = this;
  return content && (content[0].toUpperCase() + content.slice(1)).replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
}

/**
 * Helper function for bound property helper registration
 * @memberof App
 * @method registerBoundHelper
 * @param name {String} name of helper
 * @param view {Em.View} view
 */
App.registerBoundHelper = function(name, view) {
  Ember.Handlebars.registerHelper(name, function(property, options) {
    options.hash.contentBinding = property;
    return Ember.Handlebars.helpers.view.call(this, view, options);
  });
};

/**
 * Return formatted string with inserted <code>wbr</code>-tag after each dot
 *
 * @param {String} content
 *
 * Examples:
 *
 * returns 'apple'
 * {{formatWordBreak 'apple'}}
 *
 * returns 'apple.<wbr />banana'
 * {{formatWordBreak 'apple.banana'}}
 *
 * returns 'apple.<wbr />banana.<wbr />uranium'
 * {{formatWordBreak 'apple.banana.uranium'}}
 */
App.registerBoundHelper('formatWordBreak', Em.View.extend({
  tagName: 'span',
  template: Ember.Handlebars.compile('{{{view.result}}}'),
  devider:'/',

  /**
   * @type {string}
   */
  result: function() {
    var d = this.get('devider');
    var r = new RegExp('\\'+d,"g");
    return this.get('content') && this.get('content').toString().replace(r, d+'<wbr />');
  }.property('content')
}));

/**
 * Return formatted string with inserted spaces before upper case and replaced '_' to spaces
 * Also capitalize first letter
 *
 * @param {String} content
 *
 * Examples:
 *
 * returns 'apple'
 * {{humanize 'Apple'}}
 *
 * returns 'apple_banana'
 * {{humanize 'Apple banana'}}
 *
 * returns 'apple_bananaUranium'
 * {{humanize 'Apple banana Uranium'}}
 */
App.registerBoundHelper('humanize', Em.View.extend({

  tagName: 'span',

  template: Ember.Handlebars.compile('{{{view.result}}}'),

  /**
   * @type {string}
   */
  result: function() {
    var content = this.get('content');
    return content && content.humanize();
  }.property('content')
}));

/**
 * Ambari overrides the default date transformer.
 * This is done because of the non-standard data
 * sent. For example Nagios sends date as "12345678".
 * The problem is that it is a String and is represented
 * only in seconds whereas Javascript's Date needs
 * milliseconds representation.
 */
DS.attr.transforms = {
  date: {
    from: function (serialized) {
      var type = typeof serialized;
      if (type === 'string') {
        serialized = parseInt(serialized);
        type = typeof serialized;
      }
      if (type === 'number') {
        if (!serialized) {  //serialized timestamp = 0;
          return 0;
        }
        // The number could be seconds or milliseconds.
        // If seconds, then the length is 10
        // If milliseconds, the length is 13
        if (serialized.toString().length < 13) {
          serialized = serialized * 1000;
        }
        return new Date(serialized);
      } else if (serialized === null || serialized === undefined) {
        // if the value is not present in the data,
        // return undefined, not null.
        return serialized;
      } else {
        return null;
      }
    },
    to: function (deserialized) {
      if (deserialized instanceof Date) {
        return deserialized.getTime();
      } else {
        return null;
      }
    }
  }
};
/**
 * Allow get translation value used in I18n for attributes that ends with Translation.
 * For example:
 * <code>
 *  {{input name="new" placeholderTranslation="any"}}
 * </code>
 **/
Em.TextField.reopen(Em.I18n.TranslateableAttributes);
});

require.register("helpers/string_utils", function(exports, require, module) {
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

module.exports = {

  pad: function(str, len, pad, dir) {

    var STR_PAD_LEFT = 1;
    var STR_PAD_RIGHT = 2;
    var STR_PAD_BOTH = 3;

    if (typeof(len) == "undefined") { len = 0; }
    if (typeof(pad) == "undefined") { pad = ' '; }
    if (typeof(dir) == "undefined") { dir = STR_PAD_RIGHT; }

    if (len + 1 >= str.length) {

      switch (dir){

        case STR_PAD_LEFT:
          str = Array(len + 1 - str.length).join(pad) + str;
          break;

        case STR_PAD_BOTH:
          var padlen = len - str.length;
          var right = Math.ceil((padlen) / 2);
          var left = padlen - right;
          str = Array(left+1).join(pad) + str + Array(right+1).join(pad);
          break;

        default:
          str = str + Array(len + 1 - str.length).join(pad);
          break;

      } // switch

    }
    return str;

  },
  underScoreToCamelCase: function(name){
    function replacer(str, p1, p2, offset, s) {
      return str[1].toUpperCase();
    }
    return name.replace(/_\w/g,replacer);
  },

  /**
   * Forces given string into upper camel-case representation. The first
   * character of each word will be capitalized with the rest in lower case.
   */
  getCamelCase : function(name) {
    if (name != null) {
      return name.toLowerCase().replace(/(\b\w)/g, function(f) {
        return f.toUpperCase();
      })
    }
    return name;
  },

  /**
   * Compare two versions by following rules:
   * first higher than second then return 1
   * first lower than second then return -1
   * first equal to second then return 0
   * @param first {string}
   * @param second {string}
   * @return {number}
   */
  compareVersions: function(first, second){
    if (!(typeof first === 'string' && typeof second === 'string')) {
      return false;
    }
    if (first === '' || second === '') {
      return false;
    }
    var firstNumbers = first.split('.');
    var secondNumbers = second.split('.');
    var length = 0;
    var i = 0;
    var result = false;
    if(firstNumbers.length === secondNumbers.length) {
      length = firstNumbers.length;
    } else if(firstNumbers.length < secondNumbers.length){
      length = secondNumbers.length;
    } else {
      length = firstNumbers.length;
    }

    while(i < length && !result){
      firstNumbers[i] = (firstNumbers[i] === undefined) ? 0 : window.parseInt(firstNumbers[i]);
      secondNumbers[i] = (secondNumbers[i] === undefined) ? 0 : window.parseInt(secondNumbers[i]);
      if(firstNumbers[i] > secondNumbers[i]){
        result = 1;
        break;
      } else if(firstNumbers[i] === secondNumbers[i]){
        result = 0;
      } else if(firstNumbers[i] < secondNumbers[i]){
        result = -1;
        break;
      }
      i++;
    }
    return result;
  },

  isSingleLine: function(string){
    return String(string).trim().indexOf("\n") == -1;
  },
  /**
   * transform array of objects into CSV format content
   * @param array
   * @return {Array}
   */
  arrayToCSV: function(array){
    var content = "";
    array.forEach(function(item){
      var row = [];
      for(var i in item){
        if(item.hasOwnProperty(i)){
          row.push(item[i]);
        }
      }
      content += row.join(',') + '\n';
    });
    return content;
  },

  /**
   * Extracts filename from linux/unix path
   * @param path
   * @return {string}: filename
   */
  getFileFromPath: function(path) {
    if (!path || typeof path !== 'string') {
      return '';
    }
    return path.replace(/^.*[\/]/, '');
  },

  getPath: function(path) {
    if (!path || typeof path !== 'string' || path[0] != '/') {
      return '';
    }
    var last_slash = path.lastIndexOf('/');
    return (last_slash!=0)?path.substr(0,last_slash):'/';
  }
};

});

require.register("initialize", function(exports, require, module) {
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

'use strict';

window.App = require('config/app');

require('config/router');
require('config/store');
require('translations');
require('mappers/mapper');

App.initializer({
  name: "preload",

  initialize: function(container, application) {
    var viewId = 'SLIDER';
    var viewVersion = '1.0.0';
    var instanceName = 'SLIDER_1';
    if (location.pathname != null) {
      var splits = location.pathname.split('/');
      if (splits != null && splits.length > 4) {
        viewId = splits[2];
        viewVersion = splits[3];
        instanceName = splits[4];
      }
    }
    
    application.reopen({
      /**
       * Test mode is automatically enabled if running on brunch server
       * @type {bool}
       */
      testMode: (location.port == '3333'),

      /**
       * @type {string}
       */
      name: viewId,

      /**
       * Slider version
       * @type {string}
       */
      version: viewVersion,

      /**
       * @type {string}
       */
      instance: instanceName,

      /**
       * @type {string}
       */
      label: instanceName,

      /**
       * @type {string|null}
       */
      description: null,

      /**
       * API url for Slider
       * Format:
       *  <code>/api/v1/views/[VIEW_NAME]/versions/[VERSION]/instances/[INSTANCE_NAME]/</code>
       * @type {string}
       */
      urlPrefix: function() {
        return '/api/v1/views/%@1/versions/%@2/instances/%@3/'.fmt(this.get('name'), this.get('version'), this.get('instance'));
      }.property('name', 'version', 'instance'),

      /**
       * Should Slider View be enabled
       * @type {bool}
       */
      viewEnabled: false,

      /**
       * Should Slider View be disabled
       * @type {bool}
       */
      viewDisabled: Em.computed.not('viewEnabled'),

      /**
       * List of errors
       * @type {string[]}
       */
      viewErrors: [],

      /**
       * Host with Metrics Server (AMBARI_METRICS)
       * @type {string|null}
       */
      metricsHost: null,

      /**
       * Port of Metrics Server (AMBARI_METRICS port)
       * @type {array|null}
       */
      metricsPort: null,

      /**
       * Last time when mapper ran
       * @type {null|number}
       */
      mapperTime: null,

      /**
       * Default java_home value for Slider View instance
       * @type {string|null}
       */
      javaHome: null

    });
    if(!window.QUnit) {
      var sliderController = application.__container__.lookup('controller:Slider');
      sliderController.getViewDisplayParameters().done(function() {
        sliderController.run('initResources');
      }).fail(function(){
        // If initial view-listing failed, it might be due to bad previous-configs.
        // We will initialize '/resources/status' to load configs again, and then
        // attempt one more time to load view parameters.
        sliderController.touchViewStatus().done(function() {
          sliderController.getViewDisplayParameters().done(function() {
            sliderController.run('initResources');
          });
        });
      });
      application.ApplicationTypeMapper.load();
      application.SliderAppsMapper.run('load');
    }
  }
});

// Load all modules in order automatically. Ember likes things to work this
// way so everything is in the App.* namespace.
var folderOrder = [
    'initializers', 'mixins', 'routes', 'models', 'mappers',
    'views', 'controllers', 'helpers',
    'templates', 'components'
  ];

folderOrder.forEach(function(folder) {
  window.require.list().filter(function(module) {
    return new RegExp('^' + folder + '/').test(module);
  }).forEach(function(module) {
    require(module);
  });
});

$.ajaxSetup({
  cache : false,
  headers : {
    "X-Requested-By" : "X-Requested-By"
  }
});

});

require.register("mappers/application_type", function(exports, require, module) {
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

/**
 * Mapper for <code>App.SliderAppType</code> and <code>App.SliderAppComponent</code> models
 * For nested models:
 * <ul>
 *   <li>
 *     Define property (P1) started with '$' in <code>map</code> (example - $components).
 *   </li>
 *   <li>
 *     Define property componentsMap (P1 without '$' and with suffix 'Map').
 *     It is used as map for nested models
 *   </li>
 *   <li>
 *     Define property componentsParentField (P1 without '$' and with suffix 'ParentField').
 *     It  is used as property in nested model to link it with parent model
 *   </li>
 * </ul>
 * @type {App.Mapper}
 */
App.ApplicationTypeMapper = App.Mapper.create({

  /**
   * Map for parsing JSON received from server
   * Format:
   *  <code>
   *    {
   *      key1: 'path1',
   *      key2: 'path2',
   *      key3: 'path3'
   *    }
   *  </code>
   *  Keys - names for properties in App
   *  Values - pathes in JSON
   * @type {object}
   */
  map: {
    id: 'id',
    configs: 'typeConfigs',
    typeName: 'typeName',
    typeVersion: 'typeVersion',
    index: 'id',
    description: 'typeDescription',
    version: 'typeVersion',
    /**
     * Map array to nested models
     * Use <code>('$components').replace('$', '') + 'Map'</code> property as map
     * Use <code>('$components').replace('$', '') + 'Model'</code> property as model to save data
     */
    $components: 'typeComponents'
  },

  /**
   * Map for <code>App.SliderAppTypeComponent</code>
   * @type {object}
   */
  componentsMap: {
    id: 'id',
    name: 'name',
    displayName: 'displayName',
    defaultNumInstances: 'instanceCount',
    defaultYARNMemory: 'yarnMemory',
    defaultYARNCPU: 'yarnCpuCores',
    priority: 'priority'
  },

  /**
   * Nested model name - <code>App.SliderAppTypeComponent</code>
   * @type {string}
   */
  componentsModel: 'sliderAppTypeComponent',

  /**
   * Field in <code>App.SliderAppTypeComponent</code> with parent model link
   * @type {string}
   */
  componentsParentField: 'appType',

  /**
   * Load data from <code>App.urlPrefix + this.urlSuffix</code> one time
   * @method load
   * @return {$.ajax}
   */
  load: function() {
    console.log('App.ApplicationTypeMapper loading data');
    return App.ajax.send({
      name: 'mapper.applicationTypes',
      sender: this,
      success: 'parse'
    });
  },

  /**
   * Parse loaded data according to <code>map</code>
   * Load <code>App.SliderAppType</code> models
   * @param {object} data received from server data
   * @method parse
   */
  parse: function(data) {
    var map = this.get('map'),
      app_types = [],
      self = this;
    data.items.forEach(function(app_type) {
      var model = {};
      Ember.keys(map).forEach(function(key) {
        // Property should be parsed as array of nested models
        if ('$' == key[0]) {
          var k = key.replace('$', '');
          var components = self.parseNested(Ember.get(app_type, map[key]), k, app_type.id);
          // save nested models and then link them with parent model
          App.SliderApp.store.pushMany(self.get(k + 'Model'), components);
          Ember.set(model, k, components.mapProperty('id'));
        }
        else {
          Ember.set(model, key, Ember.getWithDefault(app_type, map[key], ''));
        }
      });
      app_types.pushObject(model);
    });
    App.SliderApp.store.pushMany('sliderAppType', app_types);
  },

  /**
   * Parse array of objects as list of nested models
   * @param {object[]} data data to parse
   * @param {string} k property name
   * @param {string} parentId parent model's id
   * @return {object[]} mapped models
   * @method parseNested
   */
  parseNested: function(data, k, parentId) {
    var models = [],
      map = this.get(k + 'Map'),
      parentField = this.get(k + 'ParentField');
    data.forEach(function(item) {
      var model = {id: item.id};
      model[parentField] = parentId; // link to parent model
      Ember.keys(map).forEach(function(key) {
        Ember.set(model, key, Ember.getWithDefault(item, map[key], ''));
      });
      models.pushObject(model);
    });
    return models;
  }

});

});

require.register("mappers/mapper", function(exports, require, module) {
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

/**
 * Common mapper-object
 * Extending this object you should implement <code>load</code> and <code>parse</code> methods
 * @type {Ember.Object}
 */
App.Mapper = Ember.Object.extend({

  /**
   * Map for parsing JSON received from server
   * Format:
   *  <code>
   *    {
   *      key1: 'path1',
   *      key2: 'path2',
   *      key3: 'path3'
   *    }
   *  </code>
   *  Keys - names for properties in object
   *  Values - pathes in JSON
   * @type {object}
   */
  map: {},

  /**
   * Load data from <code>App.urlPrefix + this.urlSuffix</code>
   * @method load
   */
  load: Ember.required(Function),

  /**
   * Parse loaded data according to <code>map</code>
   * Set <code>App</code> properties
   * @param {object} data received data
   * @method parse
   */
  parse: Ember.required(Function)

});
});

require.register("mappers/slider_apps_mapper", function(exports, require, module) {
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

/**
 * Mapper for <code>App.SliderApp</code> and <code>App.QuickLink</code> models
 * @type {App.Mapper}
 */
App.SliderAppsMapper = App.Mapper.createWithMixins(App.RunPeriodically, {

  /**
   * List of app state display names
   */
  stateMap: {
    'FROZEN': 'STOPPED',
    'THAWED': 'RUNNING'
  },

  /**
   * @type {bool}
   */
  isWarningPopupShown: false,

  /**
   * @type {bool}
   */
  isChained: true,
  /**
   * Load data from <code>App.urlPrefix + this.urlSuffix</code> one time
   * @method load
   * @return {$.ajax}
   */
  load: function () {
    var self = this;
    var dfd = $.Deferred();

    App.ajax.send({
      name: 'mapper.applicationApps',
      sender: this,
      success: 'parse'
    }).fail(function(jqXHR, textStatus){
        App.__container__.lookup('controller:application').set('hasConfigErrors', true);
        if (!self.get('isWarningPopupShown')) {
          var message = textStatus === "timeout" ? "timeout" : jqXHR.responseText;
          self.set('isWarningPopupShown', true);
          window.App.__container__.lookup('controller:SliderApps').showUnavailableAppsPopup(message);
        }
      }).complete(function(){
        dfd.resolve();
      });
    return dfd.promise();
  },

  /**
   * close warning popup if apps became available
   * @return {*}
   */
  closeWarningPopup: function() {
    if (Bootstrap.ModalManager.get('apps-warning-modal')) {
      Bootstrap.ModalManager.close('apps-warning-modal');
    }
  },

  /**
   * Parse loaded data
   * Load <code>App.Alert</code> model
   * @param {object} data received from server data
   * @method parse
   */
  parseAlerts: function (data) {
    var alerts = [],
      appId = data.id;

    if (data.alerts && data.alerts.detail) {
      data.alerts.detail.forEach(function (alert) {
        alerts.push({
          id: appId + alert.description,
          title: alert.description,
          serviceName: alert.service_name,
          status: alert.status,
          message: alert.output,
          hostName: alert.host_name,
          lastTime: alert.status_time,
          appId: appId,
          lastCheck: alert.last_status_time
        });
      });
      alerts = alerts.sortBy('title');
      App.SliderApp.store.pushMany('sliderAppAlert', alerts);
    }
    return alerts.mapProperty('id');
  },

  /**
   * Parse loaded data
   * Load <code>App.SliderAppComponent</code> model
   * @param {object} data received from server data
   * @method parse
   */
  parseComponents: function (data) {
    var components = [],
      appId = data.id;

    Object.keys(data.components).forEach(function (key) {
      var component = data.components[key],
        activeContainers = Object.keys(component.activeContainers);
      for (var i = 0; i < component.instanceCount; i++) {
        components.pushObject(
          Ember.Object.create({
            id: appId + component.componentName + i,
            status: activeContainers[i] ? "Running" : "Stopped",
            host: activeContainers[i] ? component.activeContainers[activeContainers[i]].host : "",
            containerId: activeContainers[i] ? component.activeContainers[activeContainers[i]].name : "",
            componentName: component.componentName,
            appId: appId
          })
        );
      }
    });
    App.SliderApp.store.pushMany('sliderAppComponent', components);
    return components.mapProperty('id');
  },

  /**
   * Parse loaded data
   * Load <code>App.SliderApp.configs</code> model
   * @param {object} data received from server data
   * @method parse
   */
  parseConfigs: function (data) {
    var configs = {};
    Object.keys(data.configs).forEach(function (key) {
      configs[key] = data.configs[key];
    });
    return configs;
  },

  /**
   * Parse loaded data
   * Load <code>App.QuickLink</code> model
   * @param {object} data received from server data
   * @method parse
   */
  parseQuickLinks : function(data) {
    var quickLinks = [],
      appId = data.id,
      yarnAppId = appId,
      index = appId.lastIndexOf('_');
    if (index > 0) {
      yarnAppId = appId.substring(0, index + 1);
      for (var k = (appId.length - index - 1); k < 4; k++) {
        yarnAppId += '0';
      }
      yarnAppId += appId.substring(index + 1);
    }
    var yarnUI = "http://"+window.location.hostname+":8088",
      viewConfigs = App.SliderApp.store.all('sliderConfig');
    if (!Em.isNone(viewConfigs)) {
      var viewConfig = viewConfigs.findBy('viewConfigName', 'yarn.rm.webapp.url');
      if (!Em.isNone(viewConfig)) {
        yarnUI = 'http://' + viewConfig.get('value');
      }
    }
    quickLinks.push(
      Ember.Object.create({
        id: 'YARN application ' + yarnAppId,
        label: 'YARN application',
        url: yarnUI + '/cluster/app/application_' + yarnAppId
      })
    );

    if(!data.urls){
      App.SliderApp.store.pushMany('QuickLink', quickLinks);
      return quickLinks.mapProperty('id');
    }

    Object.keys(data.urls).forEach(function (key) {
      quickLinks.push(
        Ember.Object.create({
          id: appId+key,
          label: key,
          url: data.urls[key]
        })
      );
    });
    App.SliderApp.store.pushMany('QuickLink', quickLinks);
    return quickLinks.mapProperty('id');
  },

  parseObject: function (o) {
    if (Ember.typeOf(o) !== 'object') return [];
    return Ember.keys(o).map(function (key) {
      return {key: key, value: o[key]};
    });
  },

  /**
   * Concatenate <code>supportedMetrics</code> into one string
   * @param {object} app
   * @returns {string}
   * @method parseMetricNames
   */
  parseMetricNames : function(app) {
    if (app.supportedMetrics) {
      return app.supportedMetrics.join(",");
    }
    return "";
  },

  /**
   * Parse loaded data
   * Load <code>App.SliderApp</code> model
   * @param {object} data received from server data
   * @method parse
   */
  parse: function (data) {
    var apps = [],
      self = this,
      appsToDelete = App.SliderApp.store.all('sliderApp').mapBy('id');

    App.__container__.lookup('controller:application').set('hasConfigErrors', false);

    if (this.get('isWarningPopupShown')) {
      this.closeWarningPopup();
      this.set('isWarningPopupShown', false);
    }

    data.apps.forEach(function (app) {
      var componentsId = app.components ? self.parseComponents(app) : [],
        configs = app.configs ? self.parseConfigs(app) : {},
        quickLinks = self.parseQuickLinks(app),
        alerts = self.parseAlerts(app),
        jmx = self.parseObject(app.jmx),
        metricNames = self.parseMetricNames(app),
        masterActiveTime = jmx.findProperty('key', 'MasterActiveTime'),
        masterStartTime = jmx.findProperty('key', 'MasterStartTime');
      if (masterActiveTime) {
        masterActiveTime.value = new Date(Date.now() - masterActiveTime.value).getHours() + "h:" + new Date(Date.now() - masterActiveTime.value).getMinutes() + "m";
      }
      if (masterStartTime) {
        masterStartTime.value = (new Date(parseInt(masterStartTime.value)).toUTCString());
      }
      apps.push(
        Ember.Object.create({
          id: app.id,
          yarnId: app.yarnId,
          name: app.name,
          status: app.state,
          displayStatus: self.stateMap[app.state] || app.state,
          user: app.user,
          started: app.startTime || 0,
          ended: app.endTime  || 0,
          appType: app.typeId,
          diagnostics: app.diagnostics || "-",
          description: app.description || "-",
          components: componentsId,
          quickLinks: quickLinks,
          alerts: alerts,
          configs: configs,
          jmx: jmx,
          runtimeProperties: app.configs,
          supportedMetricNames: metricNames
        })
      );

      appsToDelete = appsToDelete.without(app.id);
    });
    appsToDelete.forEach(function (app) {
      var appRecord = App.SliderApp.store.getById('sliderApp', app);
      if (appRecord) {
        appRecord.deleteRecord();
      }
    });
    apps.forEach(function(app) {
      App.SliderApp.store.push('sliderApp', app, true);
    });
  }
});

});

require.register("mixins/ajax_error_handler", function(exports, require, module) {
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

/**
 * Attach default error handler on error of Ajax calls
 * To correct work should be mixed with Controller or View instance
 * Example:
 *  <code>
 *    var obj = Ember.Controller.extend(App.AjaxErrorHandler, {
 *      callToServer: function() {
 *        App.ajax.send(config);
 *      }
 *    });
 *    if ajax config doesn't have error handler then the default hanlder will be established
 *  </code>
 * @type {Ember.Mixin}
 */
App.AjaxErrorHandler = Ember.Mixin.create({
  /**
   * flag to indicate whether popup with ajax already opened to avoid popup overlaying
   */
  errorPopupShown: false,
  /**
   * defaultErrorHandler function is referred from App.ajax.send function
   * @jqXHR {jqXHR Object}
   * @url {string}
   * @method {String} Http method
   * @showErrorPopup {boolean}
   */
  defaultErrorHandler: function (jqXHR, url, method, showErrorPopup) {
    var self = this;
    method = method || 'GET';
    var context = this.get('isController') ? this : (this.get('isView') && this.get('controller'));
    try {
      var json = $.parseJSON(jqXHR.responseText);
      var message = json.message;
    } catch (err) {
    }

    if (!context) {
      console.warn('WARN: App.AjaxErrorHandler should be used only for views and controllers');
      return;
    }
    if (showErrorPopup && !this.get('errorPopupShown')) {
      Bootstrap.ModalManager.open(
        "ajax-error-modal",
        Em.I18n.t('common.error'),
        Ember.View.extend({
          classNames: ['api-error'],
          templateName: 'common/ajax_error',
          api: Em.I18n.t('ajax.apiInfo').format(method, url),
          statusCode: Em.I18n.t('ajax.statusCode').format(jqXHR.status),
          message: message,
          showMessage: !!message,
          willDestroyElement: function () {
            self.set('errorPopupShown', false);
          }
        }),
        [
          Ember.Object.create({title: Em.I18n.t('ok'), dismiss: 'modal', type: 'success'})
        ],
        context
      );
      this.set('errorPopupShown', true);
    }
  }
});
});

require.register("mixins/run_periodically", function(exports, require, module) {
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

/**
 * Allow to run object method periodically and stop it
 * Example:
 *  <code>
 *    var obj = Ember.Object.createWithMixins(App.RunPeriodically, {
 *      method: Ember.K
 *    });
 *    obj.set('interval', 10000); // override default value
 *    obj.loop('method'); // run periodically
 *    obj.stop(); // stop running
 *  </code>
 * @type {Ember.Mixin}
 */
App.RunPeriodically = Ember.Mixin.create({

  /**
   * Interval for loop
   * @type {number}
   */
  interval: 5000,

  /**
   * setTimeout's return value
   * @type {number}
   */
  timer: null,

  /**
   * flag to indicate whether each call should be chained to previous one
   * @type {bool}
   */
  isChained: false,

  /**
   * Run <code>methodName</code> periodically with <code>interval</code>
   * @param {string} methodName method name to run periodically
   * @param {bool} initRun should methodName be run before setInterval call (default - true)
   * @method run
   */
  run: function(methodName, initRun) {
    initRun = Em.isNone(initRun) ? true : initRun;
    var self = this,
      interval = this.get('interval');
    Ember.assert('Interval should be numeric and greated than 0', $.isNumeric(interval) && interval > 0);
    if (initRun) {
      this[methodName]();
    }

    if (this.get('isChained')) {
      this.loop(self, methodName, interval);
    } else {
      this.set('timer',
        setInterval(function () {
          self[methodName]();
        }, interval)
      );
    }
  },

  /**
   * Start chain of calls of <code>methodName</code> with <code>interval</code>
   * next call made only after previous is finished
   * callback should return deffered object to run next loop
   * @param {object} context
   * @param {string} methodName method name to run periodically
   * @param {number} interval
   * @method loop
   */
  loop: function (context, methodName, interval) {
    var self = this;
    this.set('timer',
      setTimeout(function () {
        context[methodName]().done(function () {
          self.loop(context, methodName, interval);
        });
      }, interval)
    );
  },

  /**
   * Stop running <code>timer</code>
   * @method stop
   */
  stop: function() {
    var timer = this.get('timer');
    if (!Em.isNone(timer)) {
      clearTimeout(timer);
    }
  }

});
});

require.register("mixins/with_panels", function(exports, require, module) {
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

/**
 * Mixin for views that use Bootstrap.BsPanelComponent component
 * Add caret for collapsed/expanded panels at the left of panel's title
 * Usage:
 * <code>
 *  App.SomeView = Em.View.extend(App.WithPanels, {
 *    didInsertElement: function() {
 *      this.addCarets();
 *    }
 *  });
 * </code>
 * @type {Em.Mixin}
 */
App.WithPanels = Ember.Mixin.create({

  /**
   * Add caret before panel's title and add handlers for expand/collapse events
   * Set caret-down when panel is expanded
   * Set caret-right when panel is collapsed
   * @method addArrows
   */
  addCarets: function() {
    var panel = $('.panel');
    panel.find('.panel-heading').prepend('<span class="pull-left icon icon-caret-right"></span>');
    panel.find('.panel-collapse.collapse.in').each(function() {
      $(this).parent().find('.icon.icon-caret-right:first-child').addClass('icon-caret-down').removeClass('icon-caret-right');
    });
    panel.on('hidden.bs.collapse', function (e) {
      $(e.delegateTarget).find('span.icon').addClass('icon-caret-right').removeClass('icon-caret-down');
    }).on('shown.bs.collapse', function (e) {
        $(e.delegateTarget).find('span.icon').addClass('icon-caret-down').removeClass('icon-caret-right');
      });
  }

});

});

require.register("models/config_property", function(exports, require, module) {
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


/**
 * Config property
 * @type {object}
 */
App.ConfigProperty = Em.Object.extend({
  name: null,
  value: null,
  label: "",
  viewType: null,
  view: function () {
    switch (this.get('viewType')) {
      case 'checkbox':
        return Em.Checkbox;
      case 'select':
        return Em.Select;
      default:
        return Em.TextField;
    }
  }.property('viewType'),
  className: function () {
    return "value-for-" + this.get('label').replace(/\./g, "-");
  }.property('viewType'),
  readOnly: false,
  //used for config with "select" view
  options: [],
  //indicate whether it single config or set of configs
  isSet: false
});

});

require.register("models/host", function(exports, require, module) {
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

App.Host = DS.Model.extend({

  /**
   * @type {string}
   */
  hostName: DS.attr('string'),

  /**
   * @type {string}
   */
  publicHostName: DS.attr('string')

});

App.Host.FIXTURES = [];
});

require.register("models/slider_app", function(exports, require, module) {
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

App.SliderApp = DS.Model.extend({

  /**
   * @type {string}
   */
  yarnId: DS.attr('string'),

  /**
   * @type {string}
   */
  name: DS.attr('string'),

  /**
   * @type {status}
   */
  status: DS.attr('string'),

  /**
   * Status before performed action
   * @type {string}
   */
  statusBeforeAction: DS.attr('string'),

  /**
   * @type {displayStatus}
   */
  displayStatus: DS.attr('string'),

  /**
   * @type {string}
   */
  user: DS.attr('string'),

  /**
   * @type {number}
   */
  started: DS.attr('number'),

  /**
   * @type {boolean}
   */
  isActionPerformed: DS.attr('boolean'),

  /**
   * @type {boolean}
   */
  isActionFinished: function() {
    return this.get('status') != this.get('statusBeforeAction');
  }.property('statusBeforeAction', 'status'),

  /**
   * @type {String}
   */

  startedToLocalTime: function () {
    var started = this.get('started');
    return started ? moment(started).format('ddd, DD MMM YYYY, HH:mm:ss Z [GMT]') : '-';
  }.property('started'),

  /**
   * @type {number}
   */
  ended: DS.attr('number'),

  /**
   * @type {String}
   */

  endedToLocalTime: function () {
    var ended = this.get('ended');
    return ended ? moment(ended).format('ddd, DD MMM YYYY, HH:mm:ss Z [GMT]') : '-';
  }.property('ended'),

  /**
   * @type {App.SliderAppType}
   */
  appType: DS.belongsTo('sliderAppType'),

  /**
   * @type {string}
   */

  description: DS.attr('string'),
  /**
   * @type {string}
   */
  diagnostics: DS.attr('string'),

  /**
   * @type {App.SliderAppComponent[]}
   */
  components: DS.hasMany('sliderAppComponent', {async: true}),

  /**
   * @type {App.QuickLink[]}
   */
  quickLinks: DS.hasMany('quickLink', {async: true}),

  /**
   * @type {App.SliderAppAlert[]}
   */
  alerts: DS.hasMany('sliderAppAlert', {async: true}),

  /**
   * @type {App.TypedProperty[]}
   */
  runtimeProperties: DS.hasMany('typedProperty', {async: true}),

  /**
   * @type {object}
   * Format:
   * {
   *   site-name1: {
   *      config1: value1,
   *      config2: value2
   *      ...
   *   },
   *   site-name2: {
   *      config3: value5,
   *      config4: value6
   *      ...
   *   },
   *   ...
   * }
   */
  configs: DS.attr('object'),

  jmx: DS.attr('object'),

  supportedMetricNames: DS.attr('string'),

  /**
   * Config categories, that should be hidden on app page
   * @type {string[]}
   */
  hiddenCategories: [],

  /**
   * @type {boolean}
   */
  doNotShowComponentsAndAlerts: function () {
    return this.get('status') == "FROZEN" || this.get('status') == "FAILED";
  }.property('status', 'components', 'alerts'),

  /**
   * Display metrics only for running apps
   * Also don't display if metrics don't exist
   * @type {boolean}
   */
  showMetrics: function () {
    if (!this.get('supportedMetricNames.length')) return false;
    if (App.get('metricsHost') != null) {
      return true;
    }
    return App.SliderApp.Status.running === this.get('status');
  }.property('status', 'configs', 'supportedMetricNames'),

  /**
   * Map object to array
   * @param {object} o
   * @returns {{key: string, value: *}[]}
   */
  mapObject: function (o) {
    if (Ember.typeOf(o) !== 'object') return [];
    return Ember.keys(o).map(function (key) {
      return {
        key: key,
        value: o[key],
        isMultiline: o[key].indexOf("\n") !== -1 || o[key].length > 100
      };
    });
  }

});

App.SliderApp.FIXTURES = [];

App.SliderApp.Status = {
  accepted: "ACCEPTED",
  failed: "FAILED",
  finished: "FINISHED",
  killed: "KILLED",
  new: "NEW",
  new_saving: "NEW_SAVING",
  running: "RUNNING",
  submitted: "SUBMITTED",
  frozen: "FROZEN",
  stopped: "STOPPED"
};

});

require.register("models/slider_app_alert", function(exports, require, module) {
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

App.SliderAppAlert = DS.Model.extend({
  /**
   * @type {string}
   */
  title: DS.attr('string'),

  /**
   * @type {string}
   */
  serviceName: DS.attr('string'),

  /**
   * @type {string}
   */
  status: DS.attr('string'),

  /**
   * @type {string}
   */
  message: DS.attr('string'),

  /**
   * @type {string}
   */
  hostName: DS.attr('string'),

  /**
   * @type {number}
   */
  lastTime: DS.attr('number'),

  /**
   * @type {number}
   */
  lastCheck: DS.attr('number'),

  /**
   * @type {App.SliderApp}
   */
  appId: DS.belongsTo('sliderApp'),

  /**
   * @type {string}
   */
  iconClass: function () {
    var statusMap = Em.Object.create({
      'OK': 'icon-ok',
      'WARNING': 'icon-warning-sign',
      'CRITICAL': 'icon-remove',
      'PASSIVE': 'icon-medkit'
    });
    return statusMap.getWithDefault(this.get('status'), 'icon-question-sign');
  }.property('status'),

  /**
   * @type {object}
   */
  date: function () {
    return DS.attr.transforms.date.from(this.get('lastTime'));
  }.property('lastTime'),

  /**
   * Provides how long ago this alert happened.
   *
   * @type {String}
   */
  timeSinceAlert: function () {
    var d = this.get('date');
    var timeFormat;
    var statusMap = Em.Object.create({
      'OK': 'OK',
      'WARNING': 'WARN',
      'CRITICAL': 'CRIT',
      'PASSIVE': 'MAINT'
    });
    var messageKey = statusMap.getWithDefault(this.get('status'), 'UNKNOWN');

    if (d) {
      timeFormat = Em.I18n.t('sliderApp.alerts.' + messageKey + '.timePrefix');
      var prevSuffix = $.timeago.settings.strings.suffixAgo;
      $.timeago.settings.strings.suffixAgo = '';
      var since = timeFormat.format($.timeago(this.makeTimeAtleastMinuteAgo(d)));
      $.timeago.settings.strings.suffixAgo = prevSuffix;
      return since;
    } else if (d == 0) {
      timeFormat = Em.I18n.t('sliderApp.alerts.' + messageKey + '.timePrefixShort');
      return timeFormat;
    } else {
      return "";
    }
  }.property('date', 'status'),

  /**
   *
   * @param d
   * @return {object}
   */
  makeTimeAtleastMinuteAgo: function (d) {
    var diff = (new Date).getTime() - d.getTime();
    if (diff < 60000) {
      diff = 60000 - diff;
      return new Date(d.getTime() - diff);
    }
    return d;
  },

  /**
   * Provides more details about when this alert happened.
   *
   * @type {String}
   */
  timeSinceAlertDetails: function () {
    var details = "";
    var date = this.get('date');
    if (date) {
      var dateString = date.toDateString();
      dateString = dateString.substr(dateString.indexOf(" ") + 1);
      dateString = Em.I18n.t('sliderApp.alerts.occurredOn').format(dateString, date.toLocaleTimeString());
      details += dateString;
    }
    var lastCheck = this.get('lastCheck');
    if (lastCheck) {
      lastCheck = new Date(lastCheck * 1000);
      details = details ? details + Em.I18n.t('sliderApp.alerts.brLastCheck').format($.timeago(lastCheck)) : Em.I18n.t('sliderApp.alerts.lastCheck').format($.timeago(lastCheck));
    }
    return details;
  }.property('lastCheck', 'date')

});

App.SliderAppAlert.FIXTURES = [];
});

require.register("models/slider_app_component", function(exports, require, module) {
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

App.SliderAppComponent = DS.Model.extend({

  /**
   * @type {string}
   */
  status: DS.attr('string'),

  /**
   * @type {string}
   */
  host: DS.attr('string'),

  /**
   * @type {string}
   */
  componentName: DS.attr('string'),

  /**
   * @type {string}
   */
  containerId: DS.attr('string'),

  /**
   * @type {App.SliderApp}
   */
  appId: DS.belongsTo('sliderApp'),

  /**
   * Is component running (used in the templates)
   * @type {bool}
   */
  isRunning: function() {
    return this.get('status') === 'Running';
  }.property('status'),

  url: function() {
    var host = this.get('host');
    var containerId = this.get('containerId');
    if (host != null && containerId != null) {
      return "http://" + this.get('host') + ":8042/node/container/" + this.get('containerId');
    }
    return null;
  }.property('host', 'containerId')

});

App.SliderAppComponent.FIXTURES = [];
});

require.register("models/slider_app_type", function(exports, require, module) {
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

App.SliderAppType = DS.Model.extend({

  /**
   * @type {string}
   */
  index: DS.attr('string'),

  /**
   * @type {string}
   */
  typeName: DS.attr('string'),

  /**
   * @type {string}
   */
  typeVersion: DS.attr('string'),

  /**
   * @type {App.SliderAppTypeComponent[]}
   */
  components: DS.hasMany('sliderAppTypeComponent'),

  /**
   * @type {string}
   */
  description: DS.attr('string'),

  /**
   * @type {string}
   */
  version: DS.attr('string'),

  /**
   * @type {object}
   */
  configs: DS.attr('object'),
  
  displayName : function() {
    var typeName = this.get('typeName');
    var typeVersion = this.get('typeVersion');
    return (typeName == null ? '' : typeName) + " ("
        + (typeVersion == null ? '' : typeVersion) + ")"
  }.property('typeName', 'typeVersion')
});

App.SliderAppType.FIXTURES = [];
});

require.register("models/slider_app_type_component", function(exports, require, module) {
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

App.SliderAppTypeComponent = DS.Model.extend({

  /**
   * @type {string}
   */
  index: DS.attr('string'), // (app-type + name)

  /**
   * @type {string}
   */
  name: DS.attr('string'),

  /**
   * @type {string}
   */
  displayName: DS.attr('string'),

  /**
   * @type {number}
   */
  defaultNumInstances: DS.attr('number'),

  /**
   * @type {number}
   */
  defaultYARNMemory: DS.attr('number'),

  /**
   * @type {number}
   */
  defaultYARNCPU: DS.attr('number'),

  /**
   * @type {App.SliderAppType}
   */
  appType: DS.belongsTo('sliderAppType'),

  /**
   * @type {number}
   */
  priority: DS.attr('string')

});

App.SliderAppTypeComponent.FIXTURES = [];
});

require.register("models/slider_config", function(exports, require, module) {
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

/**
 * Slider config-property (see Ambari-Admin view-settings)
 * Also see <code>view.xml</code>
 * @type {DS.Model}
 */
App.SliderConfig = DS.Model.extend({

  /**
   * Name in the Ambari-Admin
   * @type {string}
   */
  viewConfigName: DS.attr('string'),

  /**
   * Shown name
   * @type {string}
   */
  displayName: DS.attr('string'),

  /**
   * @type {null|string}
   */
  value: null

});

App.SliderConfig.FIXTURES = [];

});

require.register("models/slider_quick_link", function(exports, require, module) {
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

App.QuickLink = DS.Model.extend({

  /**
   * @type {string}
   */
  label: DS.attr('string'),

  /**
   * @type {string}
   */
  url: DS.attr('string')

});

App.QuickLink.FIXTURES = [];
});

require.register("models/typed_property", function(exports, require, module) {
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

App.TypedProperty = DS.Model.extend({

  /**
   * @type {string}
   */
  key: DS.attr('string'),

  /**
   * @type {string}
   */
  value: DS.attr('string'),

  /**
   * @type {string}
   */
  type: DS.attr('string') // (one of 'date', 'host')

});

App.TypedProperty.FIXTURES = [];
});

require.register("routes/create_app_wizard", function(exports, require, module) {
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
App.CreateAppWizardRoute = Ember.Route.extend({

  controller: null,

  setupController: function (controller) {
    this.set('controller', controller);
  },

  actions: {
    nextStep: function () {
      this.get('controller').nextStep();
    },

    prevStep: function () {
      this.get('controller').prevStep();
    }
  }
});

App.CreateAppWizardStep1Route = Em.Route.extend({

  setupController: function(controller, model) {
    controller.set('model', model);
    controller.initializeNewApp();
    controller.loadAvailableTypes();
  }

});

App.CreateAppWizardStep2Route = Em.Route.extend({

  setupController: function(controller, model) {
    controller.set('model', model);
    controller.initializeNewApp();
  }

});

});

require.register("routes/main", function(exports, require, module) {
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

App.ApplicationRoute = Ember.Route.extend({
  renderTemplate: function() {
    this.render();
    var controller = this.controllerFor('tooltip-box');
    this.render("bs-tooltip-box", {
      outlet: "bs-tooltip-box",
      controller: controller,
      into: "application"
    });
  }
});

App.IndexRoute = Ember.Route.extend({

  model: function () {
    return this.modelFor('sliderApps');
  },

  redirect: function () {
    this.transitionTo('slider_apps');
  }

});

App.SliderAppsRoute = Ember.Route.extend({

  model: function () {
    return this.store.all('sliderApp');
  },


  setupController: function(controller, model) {
    controller.set('model', model);

    // Load sliderConfigs to storage
    App.SliderApp.store.pushMany('sliderConfig', Em.A([
      Em.Object.create({id: 1, required: false, viewConfigName: 'site.global.metric_collector_host', displayName: 'metricsServer'}),
      Em.Object.create({id: 2, required: false, viewConfigName: 'site.global.metric_collector_port', displayName: 'metricsPort'}),
      Em.Object.create({id: 3, required: false, viewConfigName: 'site.global.metric_collector_lib', displayName: 'metricsLib'}),
      Em.Object.create({id: 4, required: false, viewConfigName: 'yarn.rm.webapp.url', displayName: 'yarnRmWebappUrl'})
    ]));
  },

  actions: {
    createApp: function () {
      this.transitionTo('createAppWizard');
    }
  }
});

App.SliderAppRoute = Ember.Route.extend({

  model: function(params) {
    return this.store.all('sliderApp', params.slider_app_id);
  }

});
});

require.register("templates/application", function(exports, require, module) {
module.exports = Ember.TEMPLATES['application'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "App.viewErrors.length", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    <div class=\"alert alert-danger\">\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "error", "in", "App.viewErrors", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n  ");
  return buffer;
  }
function program3(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n        <div class=\"error-message\">");
  hashContexts = {'unescaped': depth0};
  hashTypes = {'unescaped': "STRING"};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "error.message", {hash:{
    'unescaped': ("true")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div>\n      ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    <h3 class=\"pull-left\" id=\"slider-title\"><span class=\"slider-app-title\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "App.label", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span></h3>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.showCreateAppButton", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n      <div class=\"box-header pull-right\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "App.sliderUser", {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <div class=\"create-app pull-right\">\n          <a href=\"#\" class=\"btn btn-primary\" ");
  hashContexts = {'disabled': depth0};
  hashTypes = {'disabled': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'disabled': ("App.viewDisabled")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createApp", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n            <i class=\"icon-plus\"></i><span>&nbsp;");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "slider.apps.create", options) : helperMissing.call(depth0, "t", "slider.apps.create", options))));
  data.buffer.push("</span>\n          </a>\n        </div>\n      </div>\n    ");
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n          <div class=\"pull-left view-user\">\n            <i class=\"icon-user\"></i>&nbsp;");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "App.sliderUser", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          </div>\n        ");
  return buffer;
  }

  data.buffer.push("\n\n\n\n\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "App.viewEnabled", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n<div class=\"slider-header\">\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.view.call(depth0, "view.SliderTitleView", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.outlet || (depth0 && depth0.outlet)),stack1 ? stack1.call(depth0, "bs-tooltip-box", options) : helperMissing.call(depth0, "outlet", "bs-tooltip-box", options))));
  data.buffer.push("\n</div>\n\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  
});
});

require.register("templates/common/ajax_error", function(exports, require, module) {
module.exports = Ember.TEMPLATES['common/ajax_error'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n    <br />\n    <br />\n    <pre><strong>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "ajax.errorMessage", options) : helperMissing.call(depth0, "t", "ajax.errorMessage", options))));
  data.buffer.push(": </strong><span class=\"text-danger\">");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "view.message", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</span></pre>\n");
  return buffer;
  }

  data.buffer.push("\n\n<span class=\"text-danger\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "view.statusCode", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span> <span>&nbsp;");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "view.api", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.showMessage", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
});

require.register("templates/common/app_tooltip", function(exports, require, module) {
module.exports = Ember.TEMPLATES['common/app_tooltip'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("\n\n<div id=\"hover-on-app\" class=\"row-fluid\">\n  <div><strong>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.description", options) : helperMissing.call(depth0, "t", "common.description", options))));
  data.buffer.push("</strong></div>\n  <div>");
  hashContexts = {'devider': depth0};
  hashTypes = {'devider': "STRING"};
  options = {hash:{
    'devider': (".")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatWordBreak || (depth0 && depth0.formatWordBreak)),stack1 ? stack1.call(depth0, "view.content.description", options) : helperMissing.call(depth0, "formatWordBreak", "view.content.description", options))));
  data.buffer.push("</div>\n  <div><strong>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.diagnostics", options) : helperMissing.call(depth0, "t", "common.diagnostics", options))));
  data.buffer.push("</strong></div>\n  <div>");
  hashContexts = {'devider': depth0};
  hashTypes = {'devider': "STRING"};
  options = {hash:{
    'devider': (".")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatWordBreak || (depth0 && depth0.formatWordBreak)),stack1 ? stack1.call(depth0, "view.content.diagnostics", options) : helperMissing.call(depth0, "formatWordBreak", "view.content.diagnostics", options))));
  data.buffer.push("</div>\n</div>\n");
  return buffer;
  
});
});

require.register("templates/common/chart", function(exports, require, module) {
module.exports = Ember.TEMPLATES['common/chart'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression;


  data.buffer.push("\n\n<div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":time-label")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "view.parentView.currentTimeState.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n<div ");
  hashContexts = {'id': depth0};
  hashTypes = {'id': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("view.containerId")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.containerClass :chart-container")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n  <div ");
  hashContexts = {'id': depth0};
  hashTypes = {'id': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("view.yAxisId")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.yAxisClass :chart-y-axis")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></div>\n  <div ");
  hashContexts = {'id': depth0};
  hashTypes = {'id': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("view.xAxisId")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.xAxisClass :chart-x-axis")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></div>\n  <div ");
  hashContexts = {'id': depth0};
  hashTypes = {'id': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("view.legendId")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.legendClass :chart-legend")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></div>\n  <div ");
  hashContexts = {'id': depth0};
  hashTypes = {'id': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("view.chartId")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.chartClass :chart")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></div>\n  <div ");
  hashContexts = {'id': depth0};
  hashTypes = {'id': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("view.titleId")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.titleClass :chart-title")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "view.title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n</div>");
  return buffer;
  
});
});

require.register("templates/common/config", function(exports, require, module) {
module.exports = Ember.TEMPLATES['common/config'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n      <div class=\"col-sm-2\">\n        ");
  hashContexts = {'clicked': depth0,'clickedParamBinding': depth0,'type': depth0};
  hashTypes = {'clicked': "STRING",'clickedParamBinding': "STRING",'type': "STRING"};
  options = {hash:{
    'clicked': ("deleteConfig"),
    'clickedParamBinding': ("config"),
    'type': ("danger")
  },inverse:self.noop,fn:self.program(2, program2, data),contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['bs-button'] || (depth0 && depth0['bs-button'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-button", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n      </div>\n  ");
  return buffer;
  }
function program2(depth0,data) {
  
  var stack1, hashTypes, hashContexts, options;
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.delete", options) : helperMissing.call(depth0, "t", "common.delete", options))));
  }

  data.buffer.push("\n\n<div class=\"form-group\">\n\n    <label class=\"col-sm-4 control-label\">");
  hashContexts = {'devider': depth0};
  hashTypes = {'devider': "STRING"};
  options = {hash:{
    'devider': (".")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatWordBreak || (depth0 && depth0.formatWordBreak)),stack1 ? stack1.call(depth0, "config.label", options) : helperMissing.call(depth0, "formatWordBreak", "config.label", options))));
  data.buffer.push("</label>\n\n    <div class=\"col-sm-6\">\n      ");
  hashContexts = {'value': depth0,'content': depth0,'classBinding': depth0,'disabled': depth0};
  hashTypes = {'value': "ID",'content': "ID",'classBinding': "STRING",'disabled': "ID"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "config.view", {hash:{
    'value': ("config.value"),
    'content': ("config.options"),
    'classBinding': (":form-control :slider-wiz-config-value config.className"),
    'disabled': ("config.readOnly")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    </div>\n\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "isCustom", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n</div>\n");
  return buffer;
  
});
});

require.register("templates/components/configSection", function(exports, require, module) {
module.exports = Ember.TEMPLATES['components/configSection'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    <form class=\"form-horizontal\" role=\"form\">\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "config", "in", "sectionConfigs", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </form>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "isCustom", {hash:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "config.isSet", {hash:{},inverse:self.program(7, program7, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      ");
  return buffer;
  }
function program3(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("\n          ");
  hashContexts = {'configSet': depth0};
  hashTypes = {'configSet': "ID"};
  stack1 = helpers.view.call(depth0, "configSet", {hash:{
    'configSet': ("config")
  },inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n              <div class=\"form-group\">\n                  <label class=\"col-sm-4 control-label\">");
  hashContexts = {'devider': depth0};
  hashTypes = {'devider': "STRING"};
  options = {hash:{
    'devider': (".")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatWordBreak || (depth0 && depth0.formatWordBreak)),stack1 ? stack1.call(depth0, "view.configSet.trigger.label", options) : helperMissing.call(depth0, "formatWordBreak", "view.configSet.trigger.label", options))));
  data.buffer.push("</label>\n\n                  <div class=\"col-sm-6\">\n                    ");
  hashContexts = {'checked': depth0,'disabled': depth0};
  hashTypes = {'checked': "ID",'disabled': "ID"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.configSet.trigger.view", {hash:{
    'checked': ("view.configSet.trigger.value"),
    'disabled': ("view.configSet.trigger.readOnly")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                  </div>\n              </div>\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "config", "in", "view.configs", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n          ");
  return buffer;
  }
function program5(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n              ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || (depth0 && depth0.partial)),stack1 ? stack1.call(depth0, "common/config", options) : helperMissing.call(depth0, "partial", "common/config", options))));
  data.buffer.push("\n            ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n          ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || (depth0 && depth0.partial)),stack1 ? stack1.call(depth0, "common/config", options) : helperMissing.call(depth0, "partial", "common/config", options))));
  data.buffer.push("\n        ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n      ");
  hashContexts = {'clicked': depth0,'class': depth0,'type': depth0};
  hashTypes = {'clicked': "STRING",'class': "STRING",'type': "STRING"};
  options = {hash:{
    'clicked': ("addProperty"),
    'class': ("add-property"),
    'type': ("link")
  },inverse:self.noop,fn:self.program(10, program10, data),contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['bs-button'] || (depth0 && depth0['bs-button'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-button", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program10(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "configs.add_property", options) : helperMissing.call(depth0, "t", "configs.add_property", options))));
  data.buffer.push("...");
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n\n    <form class=\"form-horizontal\" role=\"form\">\n        <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group newConfig.hasError:has-error")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n            <div class=\"col-sm-4\">\n                <label class=\"control-label\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.key", options) : helperMissing.call(depth0, "t", "common.key", options))));
  data.buffer.push("</label>\n            </div>\n            <div class=\"col-sm-6\">\n              ");
  hashContexts = {'value': depth0,'class': depth0};
  hashTypes = {'value': "ID",'class': "STRING"};
  options = {hash:{
    'value': ("newConfig.name"),
    'class': ("form-control new-config-name")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n            </div>\n        </div>\n        <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n            <div class=\"col-sm-4\">\n                <label class=\"control-label\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.value", options) : helperMissing.call(depth0, "t", "common.value", options))));
  data.buffer.push("</label>\n            </div>\n            <div class=\"col-sm-6\">\n              ");
  hashContexts = {'value': depth0,'class': depth0};
  hashTypes = {'value': "ID",'class': "STRING"};
  options = {hash:{
    'value': ("newConfig.value"),
    'class': ("form-control new-config-value")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n            </div>\n        </div>\n        <div class=\"form-group\">\n          ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "newConfig.hasError", {hash:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        </div>\n    </form>\n\n");
  return buffer;
  }
function program13(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n              <div class=\"col-sm-10\">\n                  <div class=\"alert alert-danger\">\n                    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "newConfig.messsage", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                  </div>\n              </div>\n          ");
  return buffer;
  }

  data.buffer.push("\n\n");
  hashContexts = {'heading': depth0,'collapsible': depth0,'dismiss': depth0,'open': depth0};
  hashTypes = {'heading': "ID",'collapsible': "BOOLEAN",'dismiss': "BOOLEAN",'open': "BOOLEAN"};
  options = {hash:{
    'heading': ("sectionLabel"),
    'collapsible': (true),
    'dismiss': (false),
    'open': (false)
  },inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['bs-panel'] || (depth0 && depth0['bs-panel'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-panel", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  hashContexts = {'name': depth0,'footerButtonsBinding': depth0,'titleBinding': depth0};
  hashTypes = {'name': "STRING",'footerButtonsBinding': "STRING",'titleBinding': "STRING"};
  options = {hash:{
    'name': ("addPropertyModal"),
    'footerButtonsBinding': ("addPropertyModalButtons"),
    'titleBinding': ("addPropertyModalTitle")
  },inverse:self.noop,fn:self.program(12, program12, data),contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['bs-modal'] || (depth0 && depth0['bs-modal'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-modal", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.outlet || (depth0 && depth0.outlet)),stack1 ? stack1.call(depth0, "bs-tooltip-box", options) : helperMissing.call(depth0, "outlet", "bs-tooltip-box", options))));
  return buffer;
  
});
});

require.register("templates/createAppWizard", function(exports, require, module) {
module.exports = Ember.TEMPLATES['createAppWizard'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("\n<div class=\"modal-backdrop\"></div>\n<div class=\"slider-modal\" id=\"createAppWizard\">\n  <div class=\"slider-modal-header\">\n    <button type=\"button\" class=\"close\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "hide", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">&times;</button>\n    <h3 id=\"myModalLabel\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.name", options) : helperMissing.call(depth0, "t", "wizard.name", options))));
  data.buffer.push("</h3>\n  </div>\n  <div class=\"slider-modal-body\">\n    <div class=\"container-fluid\">\n      <div class=\"row\">\n        <div class=\"col-xs-3 wizard-nav\">\n          <div class=\"well\">\n            <ul class=\"nav nav-pills nav-stacked\">\n              <li ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.isStep1:active view.isStep1Disabled:disabled")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><a href=\"javascript:void(null);\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "gotoStep", 1, {hash:{
    'target': ("controller")
  },contexts:[depth0,depth0],types:["ID","INTEGER"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step1.name", options) : helperMissing.call(depth0, "t", "wizard.step1.name", options))));
  data.buffer.push("</a></li>\n              <li ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.isStep2:active view.isStep2Disabled:disabled")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><a href=\"javascript:void(null);\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "gotoStep", 2, {hash:{
    'target': ("controller")
  },contexts:[depth0,depth0],types:["ID","INTEGER"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step2.name", options) : helperMissing.call(depth0, "t", "wizard.step2.name", options))));
  data.buffer.push("</a></li>\n              <li ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.isStep3:active view.isStep3Disabled:disabled")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><a href=\"javascript:void(null);\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "gotoStep", 3, {hash:{
    'target': ("controller")
  },contexts:[depth0,depth0],types:["ID","INTEGER"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step3.name", options) : helperMissing.call(depth0, "t", "wizard.step3.name", options))));
  data.buffer.push("</a></li>\n              <li ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.isStep4:active view.isStep4Disabled:disabled")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("><a href=\"javascript:void(null);\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "gotoStep", 4, {hash:{
    'target': ("controller")
  },contexts:[depth0,depth0],types:["ID","INTEGER"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step4.name", options) : helperMissing.call(depth0, "t", "wizard.step4.name", options))));
  data.buffer.push("</a></li>\n            </ul>\n          </div>\n        </div>\n        <div class=\"wizard-content well col-xs-9\">\n          ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
  return buffer;
  
});
});

require.register("templates/createAppWizard/step1", function(exports, require, module) {
module.exports = Ember.TEMPLATES['createAppWizard/step1'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n      <div class=\"row\">\n        <div class=\"col-xs-12 alert alert-warning app-types-alert\">\n          ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step1.noAppTypesError", options) : helperMissing.call(depth0, "t", "wizard.step1.noAppTypesError", options))));
  data.buffer.push("\n        </div>\n      </div>\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n          ");
  hashContexts = {'contentBinding': depth0,'class': depth0,'disabled': depth0};
  hashTypes = {'contentBinding': "STRING",'class': "STRING",'disabled': "BOOLEAN"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Em.Select", {hash:{
    'contentBinding': ("view.noAppsAvailableSelect"),
    'class': ("form-control type-select"),
    'disabled': (true)
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n          ");
  hashContexts = {'contentBinding': depth0,'optionLabelPath': depth0,'class': depth0,'valueBinding': depth0,'disabledBinding': depth0};
  hashTypes = {'contentBinding': "STRING",'optionLabelPath': "STRING",'class': "STRING",'valueBinding': "STRING",'disabledBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Em.Select", {hash:{
    'contentBinding': ("controller.availableTypes"),
    'optionLabelPath': ("content.displayName"),
    'class': ("form-control type-select"),
    'valueBinding': ("controller.selectedType"),
    'disabledBinding': ("controller.isAppTypesError")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "slider.apps.no.description.available", options) : helperMissing.call(depth0, "t", "slider.apps.no.description.available", options))));
  data.buffer.push("\n          ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "controller.typeDescription", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n      <div class=\"row\">\n        <div class=\"col-xs-12 alert alert-danger\">\n          ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "controller.nameErrorMessage", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n      </div>\n    ");
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n      <div class=\"row\">\n        <div class=\"col-xs-12 alert alert-danger\">\n          ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "controller.frequencyErrorMessage", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n      </div>\n    ");
  return buffer;
  }

  data.buffer.push("\n<div id=\"step1\">\n  <form role=\"form\" class=\"form-horizontal\">\n    <!-- Available Applications -->\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "controller.isAppTypesError", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <strong>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step1.header", options) : helperMissing.call(depth0, "t", "wizard.step1.header", options))));
  data.buffer.push("</strong>\n    <div class=\"form-group row\">\n      <div class=\"col-xs-3\">\n        <label class=\"control-label\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step1.appTypes", options) : helperMissing.call(depth0, "t", "wizard.step1.appTypes", options))));
  data.buffer.push("</label>\n      </div>\n      <div class=\"col-xs-7\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "controller.isAppTypesError", {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n      </div>\n    </div>\n    <div class=\"form-group row\">\n      <div class=\"col-xs-3\">\n        <label class=\" control-label\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step1.description", options) : helperMissing.call(depth0, "t", "wizard.step1.description", options))));
  data.buffer.push("</label>\n      </div>\n      <div class=\"col-xs-7\">\n        <span class=\"pseudo-label control-label\">\n          ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "controller.isAppTypesError", {hash:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        </span>\n      </div>\n    </div>\n    <div class=\"form-group row\">\n      <div class=\"col-xs-3\">\n        <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":control-group controller.isNameError:error")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n          <label class=\"control-label\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.name", options) : helperMissing.call(depth0, "t", "common.name", options))));
  data.buffer.push("</label>\n        </div>\n      </div>\n      <div class=\"col-xs-7\">\n        ");
  hashContexts = {'id': depth0,'class': depth0,'valueBinding': depth0,'disabledBinding': depth0,'placeholderTranslation': depth0};
  hashTypes = {'id': "STRING",'class': "STRING",'valueBinding': "STRING",'disabledBinding': "STRING",'placeholderTranslation': "STRING"};
  options = {hash:{
    'id': ("app-name-input"),
    'class': ("form-control"),
    'valueBinding': ("controller.newApp.name"),
    'disabledBinding': ("controller.isAppTypesError"),
    'placeholderTranslation': ("form.placeholder.step1.name")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n      </div>\n    </div>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "controller.isNameError", {hash:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    <div class=\"form-group row\">\n      <div class=\"col-xs-3\">\n        <label class=\" control-label\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step1.enable2wayssl", options) : helperMissing.call(depth0, "t", "wizard.step1.enable2wayssl", options))));
  data.buffer.push("</label>\n      </div>\n      <div class=\"col-xs-7\">\n        ");
  hashContexts = {'class': depth0,'checkedBinding': depth0};
  hashTypes = {'class': "STRING",'checkedBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Em.Checkbox", {hash:{
    'class': ("form-control type-select"),
    'checkedBinding': ("controller.newApp.twoWaySSLEnabled")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </div>\n    </div>\n    <!-- Available Applications end -->\n    <!-- Scheduler Options -->\n    <hr />\n    <div class=\"row\">\n      <strong>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step1.schedulerOptions.label", options) : helperMissing.call(depth0, "t", "wizard.step1.schedulerOptions.label", options))));
  data.buffer.push("</strong>\n    </div>\n    <div class=\"row\">\n      <div class=\"col-xs-3\">\n        <label class=\"control-label\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step1.schedulerOptions.queueName", options) : helperMissing.call(depth0, "t", "wizard.step1.schedulerOptions.queueName", options))));
  data.buffer.push("</label>\n      </div>\n      <div class=\"col-xs-7\">\n        ");
  hashContexts = {'class': depth0,'valueBinding': depth0,'placeholderTranslation': depth0};
  hashTypes = {'class': "STRING",'valueBinding': "STRING",'placeholderTranslation': "STRING"};
  options = {hash:{
    'class': ("form-control queueName"),
    'valueBinding': ("controller.newApp.queueName"),
    'placeholderTranslation': ("form.placeholder.optional")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n      </div>\n    </div>\n    <!-- Scheduler Options end -->\n    <!-- YARN Labels -->\n    <hr />\n    <div class=\"row\">\n      <strong>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step1.yarnLabels.label", options) : helperMissing.call(depth0, "t", "wizard.step1.yarnLabels.label", options))));
  data.buffer.push("</strong>\n    </div>\n    <div class=\"row\">\n      <div class=\"col-xs-3\">\n        <label class=\"control-label\">\n          ");
  hashContexts = {'name': depth0,'selectionBinding': depth0,'value': depth0,'class': depth0};
  hashTypes = {'name': "STRING",'selectionBinding': "STRING",'value': "INTEGER",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.radioButton", {hash:{
    'name': ("yarnLabel"),
    'selectionBinding': ("controller.newApp.selectedYarnLabel"),
    'value': (0),
    'class': ("radio-inline")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step1.yarnLabels.options.anyHost", options) : helperMissing.call(depth0, "t", "wizard.step1.yarnLabels.options.anyHost", options))));
  data.buffer.push("\n        </label>\n      </div>\n    </div>\n    <div class=\"row\">\n      <div class=\"col-xs-3\">\n        <label class=\"control-label\">\n          ");
  hashContexts = {'name': depth0,'selectionBinding': depth0,'value': depth0,'class': depth0};
  hashTypes = {'name': "STRING",'selectionBinding': "STRING",'value': "INTEGER",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.radioButton", {hash:{
    'name': ("yarnLabel"),
    'selectionBinding': ("controller.newApp.selectedYarnLabel"),
    'value': (1),
    'class': ("radio-inline")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step1.yarnLabels.options.nonLabeledHost", options) : helperMissing.call(depth0, "t", "wizard.step1.yarnLabels.options.nonLabeledHost", options))));
  data.buffer.push("\n        </label>\n      </div>\n    </div>\n    <div class=\"row\">\n      <div class=\"col-xs-3\">\n        <label class=\"control-label\">\n          ");
  hashContexts = {'name': depth0,'selectionBinding': depth0,'value': depth0,'class': depth0};
  hashTypes = {'name': "STRING",'selectionBinding': "STRING",'value': "INTEGER",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.radioButton", {hash:{
    'name': ("yarnLabel"),
    'selectionBinding': ("controller.newApp.selectedYarnLabel"),
    'value': (2),
    'class': ("radio-inline special-label-radio")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step1.yarnLabels.options.specifyLabel", options) : helperMissing.call(depth0, "t", "wizard.step1.yarnLabels.options.specifyLabel", options))));
  data.buffer.push("\n        </label>\n      </div>\n      <div class=\"col-xs-7\">\n        ");
  hashContexts = {'type': depth0,'class': depth0,'disabledBinding': depth0,'valueBinding': depth0};
  hashTypes = {'type': "STRING",'class': "STRING",'disabledBinding': "STRING",'valueBinding': "STRING"};
  options = {hash:{
    'type': ("text"),
    'class': ("form-control special-label"),
    'disabledBinding': ("view.specLabelEnabled"),
    'valueBinding': ("controller.newApp.specialLabel")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n      </div>\n    </div>\n    <!-- YARN Labels end -->\n    <!-- Log Aggregation -->\n    <hr />\n    <div class=\"row\">\n      <strong>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step1.logAggregation.label", options) : helperMissing.call(depth0, "t", "wizard.step1.logAggregation.label", options))));
  data.buffer.push("</strong>\n    </div>\n    <div class=\"row\">\n      <div class=\"col-xs-3\">\n        <label class=\"control-label\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step1.logAggregation.filePatterns.include", options) : helperMissing.call(depth0, "t", "wizard.step1.logAggregation.filePatterns.include", options))));
  data.buffer.push("</label>\n      </div>\n      <div class=\"col-xs-7\">\n        ");
  hashContexts = {'class': depth0,'valueBinding': depth0,'placeholderTranslation': depth0};
  hashTypes = {'class': "STRING",'valueBinding': "STRING",'placeholderTranslation': "STRING"};
  options = {hash:{
    'class': ("form-control includeFilePatterns"),
    'valueBinding': ("controller.newApp.includeFilePatterns"),
    'placeholderTranslation': ("form.placeholder.include.file.patterns")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n      </div>\n    </div>\n    <div class=\"row\">\n      <div class=\"col-xs-3\">\n        <label class=\"control-label\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step1.logAggregation.filePatterns.exclude", options) : helperMissing.call(depth0, "t", "wizard.step1.logAggregation.filePatterns.exclude", options))));
  data.buffer.push("</label>\n      </div>\n      <div class=\"col-xs-7\">\n        ");
  hashContexts = {'class': depth0,'valueBinding': depth0,'placeholderTranslation': depth0};
  hashTypes = {'class': "STRING",'valueBinding': "STRING",'placeholderTranslation': "STRING"};
  options = {hash:{
    'class': ("form-control excludeFilePatterns"),
    'valueBinding': ("controller.newApp.excludeFilePatterns"),
    'placeholderTranslation': ("form.placeholder.exclude.file.patterns")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n      </div>\n    </div>\n    <div class=\"row\">\n      <div class=\"col-xs-3\" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":col-xs-3 controller.isFrequencyError:error")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n        <label class=\"control-label\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.frequency", options) : helperMissing.call(depth0, "t", "common.frequency", options))));
  data.buffer.push("</label>\n      </div>\n      <div class=\"col-xs-7\">\n        <div class=\"input-group\">\n          ");
  hashContexts = {'class': depth0,'valueBinding': depth0,'placeholderTranslation': depth0};
  hashTypes = {'class': "STRING",'valueBinding': "STRING",'placeholderTranslation': "STRING"};
  options = {hash:{
    'class': ("form-control frequency"),
    'valueBinding': ("controller.newApp.frequency"),
    'placeholderTranslation': ("form.placeholder.frequency")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n          <div class=\"input-group-addon\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.seconds", options) : helperMissing.call(depth0, "t", "common.seconds", options))));
  data.buffer.push("</div>\n        </div>\n      </div>\n    </div>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "controller.isFrequencyError", {hash:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    <!-- Log Aggregation end -->\n    <div class=\"btn-area\">\n      <button\n        class=\"btn btn-success pull-right next-btn\"\n        ");
  hashContexts = {'disabled': depth0};
  hashTypes = {'disabled': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'disabled': ("controller.isSubmitDisabled")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "submit", {hash:{
    'target': ("controller")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.next", options) : helperMissing.call(depth0, "t", "common.next", options))));
  data.buffer.push(" &rarr;\n      </button>\n    </div>\n  </form>\n</div>\n");
  return buffer;
  
});
});

require.register("templates/createAppWizard/step2", function(exports, require, module) {
module.exports = Ember.TEMPLATES['createAppWizard/step2'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "displayName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n          <td>");
  hashContexts = {'class': depth0,'valueBinding': depth0};
  hashTypes = {'class': "STRING",'valueBinding': "STRING"};
  options = {hash:{
    'class': ("cell-narrow numInstances"),
    'valueBinding': ("numInstances")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</td>\n          <td>");
  hashContexts = {'class': depth0,'valueBinding': depth0};
  hashTypes = {'class': "STRING",'valueBinding': "STRING"};
  options = {hash:{
    'class': ("cell-wide yarnMemory"),
    'valueBinding': ("yarnMemory")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</td>\n          <td>");
  hashContexts = {'class': depth0,'valueBinding': depth0};
  hashTypes = {'class': "STRING",'valueBinding': "STRING"};
  options = {hash:{
    'class': ("cell-narrow yarnCPU"),
    'valueBinding': ("yarnCPU")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</td>\n          <td>\n            <div ");
  hashContexts = {'content': depth0};
  hashTypes = {'content': "ID"};
  options = {hash:{
    'content': ("view.checkBoxPopover")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-bind-tooltip'] || (depth0 && depth0['bs-bind-tooltip'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-bind-tooltip", options))));
  data.buffer.push(">\n              ");
  hashContexts = {'type': depth0,'checkedBinding': depth0,'class': depth0};
  hashTypes = {'type': "STRING",'checkedBinding': "STRING",'class': "STRING"};
  options = {hash:{
    'type': ("checkbox"),
    'checkedBinding': ("yarnLabelChecked"),
    'class': ("checkbox-inline")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n            </div>\n          </td>\n          <td class=\"cell-auto\">\n            <div ");
  hashContexts = {'content': depth0};
  hashTypes = {'content': "ID"};
  options = {hash:{
    'content': ("view.yarnLabelPopover")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-bind-tooltip'] || (depth0 && depth0['bs-bind-tooltip'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-bind-tooltip", options))));
  data.buffer.push(">\n              ");
  hashContexts = {'class': depth0,'valueBinding': depth0,'disabledBinding': depth0};
  hashTypes = {'class': "STRING",'valueBinding': "STRING",'disabledBinding': "STRING"};
  options = {hash:{
    'class': ("yarnLabel"),
    'valueBinding': ("yarnLabel"),
    'disabledBinding': ("yarnLabelNotChecked")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n            </div>\n          </td>\n        </tr>\n      ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n    <div class=\"alert alert-danger\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step2.error.numbers", options) : helperMissing.call(depth0, "t", "wizard.step2.error.numbers", options))));
  data.buffer.push("</div>\n  ");
  return buffer;
  }

  data.buffer.push("\n<div id=\"step2\">\n  <p>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "newApp.appType.displayName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step2.header", options) : helperMissing.call(depth0, "t", "wizard.step2.header", options))));
  data.buffer.push("\n  </p>\n  <div class=\"table-container\">\n    <table class=\"components-table\">\n      <thead>\n      <tr>\n        <th></th>\n        <th>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step2.table.instances", options) : helperMissing.call(depth0, "t", "wizard.step2.table.instances", options))));
  data.buffer.push("</th>\n        <th>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step2.table.memory", options) : helperMissing.call(depth0, "t", "wizard.step2.table.memory", options))));
  data.buffer.push("</th>\n        <th>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step2.table.cpu", options) : helperMissing.call(depth0, "t", "wizard.step2.table.cpu", options))));
  data.buffer.push("</th>\n        <th colspan=\"2\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step2.table.yarnLabels", options) : helperMissing.call(depth0, "t", "wizard.step2.table.yarnLabels", options))));
  data.buffer.push("</th>\n      </tr>\n      </thead>\n      <tbody>\n      ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n      </tbody>\n    </table>\n  </div>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "controller.isError", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  <div class=\"btn-area\">\n    <button class=\"btn btn-success pull-right next-btn\" ");
  hashContexts = {'disabled': depth0};
  hashTypes = {'disabled': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'disabled': ("controller.isSubmitDisabled")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "submit", {hash:{
    'target': ("controller")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.next", options) : helperMissing.call(depth0, "t", "common.next", options))));
  data.buffer.push(" &rarr;</button>\n    <button class=\"btn\" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "prevStep", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">&larr; ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.back", options) : helperMissing.call(depth0, "t", "common.back", options))));
  data.buffer.push("</button>\n  </div>\n</div>");
  return buffer;
  
});
});

require.register("templates/createAppWizard/step3", function(exports, require, module) {
module.exports = Ember.TEMPLATES['createAppWizard/step3'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n    ");
  hashContexts = {'section': depth0,'config': depth0,'predefinedConfigNames': depth0};
  hashTypes = {'section': "ID",'config': "ID",'predefinedConfigNames': "ID"};
  options = {hash:{
    'section': (""),
    'config': ("controller.configs"),
    'predefinedConfigNames': ("controller.appWizardController.newApp.predefinedConfigNames")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['config-section'] || (depth0 && depth0['config-section'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "config-section", options))));
  data.buffer.push("\n  ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n    <div class=\"alert alert-danger\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step3.error", options) : helperMissing.call(depth0, "t", "wizard.step3.error", options))));
  data.buffer.push("</div>\n  ");
  return buffer;
  }

  data.buffer.push("\n\n<p>\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step3.header.beginning", options) : helperMissing.call(depth0, "t", "wizard.step3.header.beginning", options))));
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "appWizardController.newApp.appType.displayName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step3.header.end", options) : helperMissing.call(depth0, "t", "wizard.step3.header.end", options))));
  data.buffer.push("\n</p>\n<div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("controller.isError:has-error :form-group :app-wiz-configs")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "controller.sectionKeys", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "controller.isError", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n</div>\n<div class=\"btn-area\">\n  <button class=\"btn btn-success pull-right next-btn\" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "submit", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.next", options) : helperMissing.call(depth0, "t", "common.next", options))));
  data.buffer.push(" &rarr;</button>\n  <button class=\"btn\" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "prevStep", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">&larr; ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.back", options) : helperMissing.call(depth0, "t", "common.back", options))));
  data.buffer.push("</button>\n</div>\n");
  return buffer;
  
});
});

require.register("templates/createAppWizard/step4", function(exports, require, module) {
module.exports = Ember.TEMPLATES['createAppWizard/step4'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    <li>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "component.displayName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(": ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "component.numInstances", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</li>\n  ");
  return buffer;
  }

  data.buffer.push("\n\n<div id=\"step4\">\n<h5>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.summary", options) : helperMissing.call(depth0, "t", "common.summary", options))));
  data.buffer.push("</h5>\n<ul>\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step4.appName", options) : helperMissing.call(depth0, "t", "wizard.step4.appName", options))));
  data.buffer.push(": ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "controller.newApp.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step4.appType", options) : helperMissing.call(depth0, "t", "wizard.step4.appType", options))));
  data.buffer.push(": ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "controller.newApp.appType.displayName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step4.2waysslEnabled", options) : helperMissing.call(depth0, "t", "wizard.step4.2waysslEnabled", options))));
  data.buffer.push(": ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "controller.newApp.twoWaySSLEnabled", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n</ul>\n<h5>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.components", options) : helperMissing.call(depth0, "t", "common.components", options))));
  data.buffer.push("</h5>\n<ul>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "component", "in", "controller.newApp.components", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n</ul>\n<h5>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.configuration", options) : helperMissing.call(depth0, "t", "common.configuration", options))));
  data.buffer.push("</h5>\n<pre>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "controller.configsFormatted", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</pre>\n\n<div class=\"btn-area\">\n  <button\n      class=\"btn btn-success pull-right\"\n    ");
  hashContexts = {'disabled': depth0};
  hashTypes = {'disabled': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'disabled': ("controller.isSubmitDisabled")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "finish", {hash:{
    'target': ("controller")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.finish", options) : helperMissing.call(depth0, "t", "common.finish", options))));
  data.buffer.push("</button>\n</div>\n</div>\n");
  return buffer;
  
});
});

require.register("templates/index", function(exports, require, module) {
module.exports = Ember.TEMPLATES['index'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '';


  data.buffer.push("\n\n<div class=\"header\">\nSlider Apps\n</div>\n");
  return buffer;
  
});
});

require.register("templates/slider_app", function(exports, require, module) {
module.exports = Ember.TEMPLATES['slider_app'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "slider.apps.title", options) : helperMissing.call(depth0, "t", "slider.apps.title", options))));
  data.buffer.push("\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n          <li ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("option.submenu.length:dropdown-submenu")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n            <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openModal", "option", {hash:{
    'target': ("controller")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.humanize || (depth0 && depth0.humanize)),stack1 ? stack1.call(depth0, "option.title", options) : helperMissing.call(depth0, "humanize", "option.title", options))));
  data.buffer.push("</a>\n            <ul class=\"dropdown-menu\">\n              ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "subitem", "in", "option.submenu", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n            </ul>\n          </li>\n        ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n                <li>\n                  <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openModal", "subitem", {hash:{
    'target': ("controller")
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.humanize || (depth0 && depth0.humanize)),stack1 ? stack1.call(depth0, "subitem.title", options) : helperMissing.call(depth0, "humanize", "subitem.title", options))));
  data.buffer.push("</a>\n                </li>\n              ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n    <div class=\"col-md-3 quick-links-wrapper pull-right\">\n      <ul class=\"nav nav-pills move\">\n        <li class=\"dropdown\">\n          <a class=\"dropdown-toggle\" data-toggle=\"dropdown\" href=\"#\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.quickLinks", options) : helperMissing.call(depth0, "t", "common.quickLinks", options))));
  data.buffer.push("<b class=\"caret\"></b></a>\n          <ul class=\"dropdown-menu\">\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "quickLink", "in", "controller.quickLinksOrdered", {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n          </ul>\n        </li>\n      </ul>\n    </div>\n  ");
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("\n              <li><a ");
  hashContexts = {'href': depth0};
  hashTypes = {'href': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("quickLink.url")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" target=\"_blank\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "quickLink.label", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a></li>\n            ");
  return buffer;
  }

  data.buffer.push("\n<div class=\"app-page\">\n  <div class=\"apps-breadcrumbs\">\n    ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || (depth0 && depth0['link-to'])),stack1 ? stack1.call(depth0, "slider_apps", options) : helperMissing.call(depth0, "link-to", "slider_apps", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n      &rarr;\n    ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "model.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  </div>\n  <p></p>\n  <div class=\"col-md-5 pull-right\">\n    <div class=\"btn-group display-inline-block pull-right\">\n      <button class=\"btn dropdown-toggle btn-primary \" data-toggle=\"dropdown\" ");
  hashContexts = {'disabled': depth0};
  hashTypes = {'disabled': "ID"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'disabled': ("model.isActionPerformed")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n        ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.actions", options) : helperMissing.call(depth0, "t", "common.actions", options))));
  data.buffer.push("\n        <span class=\"caret\"></span>\n      </button>\n      <ul class=\"dropdown-menu\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "option", "in", "controller.availableActions", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n      </ul>\n    </div>\n  </div>\n\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "weHaveQuicklinks", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n\n  ");
  hashContexts = {'contentBinding': depth0,'default': depth0};
  hashTypes = {'contentBinding': "STRING",'default': "STRING"};
  options = {hash:{
    'contentBinding': ("sliderAppTabs"),
    'default': ("summary")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-tabs'] || (depth0 && depth0['bs-tabs'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-tabs", options))));
  data.buffer.push("\n  <div style=\"margin-top: 20px;\">\n    ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  </div>\n\n</div>\n");
  return buffer;
  
});
});

require.register("templates/slider_app/configs", function(exports, require, module) {
module.exports = Ember.TEMPLATES['slider_app/configs'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "configCategory.isVisible", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n      ");
  hashContexts = {'heading': depth0,'collapsible': depth0,'open': depth0};
  hashTypes = {'heading': "ID",'collapsible': "BOOLEAN",'open': "BOOLEAN"};
  options = {hash:{
    'heading': ("configCategory.name"),
    'collapsible': (true),
    'open': (false)
  },inverse:self.noop,fn:self.program(3, program3, data),contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['bs-panel'] || (depth0 && depth0['bs-panel'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-panel", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n        <div class=\"container-fluid\">\n          ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "configCategory.configs", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n      ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n            <div class=\"row\">\n              <div class=\"col-md-3 property-name\">");
  hashContexts = {'devider': depth0};
  hashTypes = {'devider': "STRING"};
  options = {hash:{
    'devider': (".")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatWordBreak || (depth0 && depth0.formatWordBreak)),stack1 ? stack1.call(depth0, "key", options) : helperMissing.call(depth0, "formatWordBreak", "key", options))));
  data.buffer.push("</div>\n              <div>\n                ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "isMultiline", {hash:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n              </div>\n            </div>\n          ");
  return buffer;
  }
function program5(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n                  ");
  hashContexts = {'disabled': depth0,'value': depth0,'classNames': depth0};
  hashTypes = {'disabled': "BOOLEAN",'value': "ID",'classNames': "STRING"};
  options = {hash:{
    'disabled': (true),
    'value': ("value"),
    'classNames': ("col-md-6")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.textarea || (depth0 && depth0.textarea)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
  data.buffer.push("\n                ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n                  <input type=\"text\" ");
  hashContexts = {'value': depth0};
  hashTypes = {'value': "ID"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'value': ("value")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" disabled=\"disabled\" class=\"col-md-6\" />\n                ");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"app_configs\">\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "configCategory", "in", "view.configsByCategories", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>");
  return buffer;
  
});
});

require.register("templates/slider_app/destroy/destroy_popup", function(exports, require, module) {
module.exports = Ember.TEMPLATES['slider_app/destroy/destroy_popup'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("\n\n<p class=\"alert alert-danger\"> <span class=\"icon-warning-sign\"></span> ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "sliderApp.destroy.confirm.body", options) : helperMissing.call(depth0, "t", "sliderApp.destroy.confirm.body", options))));
  data.buffer.push("</p>\n");
  hashContexts = {'type': depth0,'checkedBinding': depth0};
  hashTypes = {'type': "STRING",'checkedBinding': "STRING"};
  options = {hash:{
    'type': ("checkbox"),
    'checkedBinding': ("controller.confirmChecked")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" ");
  hashContexts = {'unescaped': depth0};
  hashTypes = {'unescaped': "STRING"};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.confirmMessage", {hash:{
    'unescaped': ("true")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  return buffer;
  
});
});

require.register("templates/slider_app/destroy/destroy_popup_footer", function(exports, require, module) {
module.exports = Ember.TEMPLATES['slider_app/destroy/destroy_popup_footer'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("\n\n");
  hashContexts = {'content': depth0,'targetObjectBinding': depth0};
  hashTypes = {'content': "ID",'targetObjectBinding': "STRING"};
  options = {hash:{
    'content': ("view.cancelButton"),
    'targetObjectBinding': ("view.targetObject")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-button'] || (depth0 && depth0['bs-button'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-button", options))));
  data.buffer.push("\n\n");
  hashContexts = {'content': depth0,'disabledBinding': depth0,'targetObjectBinding': depth0};
  hashTypes = {'content': "ID",'disabledBinding': "STRING",'targetObjectBinding': "STRING"};
  options = {hash:{
    'content': ("view.destroyButton"),
    'disabledBinding': ("controller.destroyButtonEnabled"),
    'targetObjectBinding': ("view.targetObject")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-button'] || (depth0 && depth0['bs-button'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-button", options))));
  return buffer;
  
});
});

require.register("templates/slider_app/flex_popup", function(exports, require, module) {
module.exports = Ember.TEMPLATES['slider_app/flex_popup'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n      <div class=\"form-group\">\n        <div class=\"col-sm-4 component-label\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "component.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n        <div class=\"col-sm-8\">");
  hashContexts = {'value': depth0};
  hashTypes = {'value': "ID"};
  options = {hash:{
    'value': ("component.count")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || (depth0 && depth0.input)),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("</div>\n      </div>\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n      <div class=\"alert alert-danger\">\n        ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "sliderApp.flex.invalid_counts", options) : helperMissing.call(depth0, "t", "sliderApp.flex.invalid_counts", options))));
  data.buffer.push("\n      </div>\n    ");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"flex-popup\">\n  <form class=\"form-horizontal\" role=\"form\">\n    <div class=\"alert alert-info\">\n      ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "sliderApp.flex.message", options) : helperMissing.call(depth0, "t", "sliderApp.flex.message", options))));
  data.buffer.push("\n    </div>\n    <div class=\"form-group\">\n      <div class=\"col-sm-4\"><strong>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.components", options) : helperMissing.call(depth0, "t", "common.components", options))));
  data.buffer.push("</strong></div>\n      <div class=\"col-sm-8\"><strong>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "wizard.step2.table.instances", options) : helperMissing.call(depth0, "t", "wizard.step2.table.instances", options))));
  data.buffer.push("</strong></div>\n    </div>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "component", "in", "groupedComponents", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "groupedComponentsHaveErrors", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  </form>\n</div>\n");
  return buffer;
  
});
});

require.register("templates/slider_app/summary", function(exports, require, module) {
module.exports = Ember.TEMPLATES['slider_app/summary'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n      <table class=\"table no-borders table-condensed\">\n        <tbody>\n        <tr>\n          <td style=\"width: 25%;\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.status", options) : helperMissing.call(depth0, "t", "common.status", options))));
  data.buffer.push("</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "controller.model.displayStatus", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</td>\n        </tr>\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.type", options) : helperMissing.call(depth0, "t", "common.type", options))));
  data.buffer.push("</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "controller.appType", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</td>\n        </tr>\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.yarn.app.id", options) : helperMissing.call(depth0, "t", "common.yarn.app.id", options))));
  data.buffer.push("</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "controller.model.yarnId", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</td>\n        </tr>\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.started", options) : helperMissing.call(depth0, "t", "common.started", options))));
  data.buffer.push("</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatWordBreak || (depth0 && depth0.formatWordBreak)),stack1 ? stack1.call(depth0, "controller.model.startedToLocalTime", options) : helperMissing.call(depth0, "formatWordBreak", "controller.model.startedToLocalTime", options))));
  data.buffer.push("</td>\n        </tr>\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.finished", options) : helperMissing.call(depth0, "t", "common.finished", options))));
  data.buffer.push("</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatWordBreak || (depth0 && depth0.formatWordBreak)),stack1 ? stack1.call(depth0, "controller.model.endedToLocalTime", options) : helperMissing.call(depth0, "formatWordBreak", "controller.model.endedToLocalTime", options))));
  data.buffer.push("</td>\n        </tr>\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.diagnostics", options) : helperMissing.call(depth0, "t", "common.diagnostics", options))));
  data.buffer.push("</td>\n          <td>");
  hashContexts = {'devider': depth0};
  hashTypes = {'devider': "STRING"};
  options = {hash:{
    'devider': (".")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatWordBreak || (depth0 && depth0.formatWordBreak)),stack1 ? stack1.call(depth0, "controller.model.diagnostics", options) : helperMissing.call(depth0, "formatWordBreak", "controller.model.diagnostics", options))));
  data.buffer.push("</td>\n        </tr>\n          ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "controller.model.jmx", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        </tbody>\n      </table>\n    ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n          <tr>\n            <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.humanize || (depth0 && depth0.humanize)),stack1 ? stack1.call(depth0, "key", options) : helperMissing.call(depth0, "humanize", "key", options))));
  data.buffer.push("</td>\n            <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatWordBreak || (depth0 && depth0.formatWordBreak)),stack1 ? stack1.call(depth0, "value", options) : helperMissing.call(depth0, "formatWordBreak", "value", options))));
  data.buffer.push("</td>\n          </tr>\n          ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n            <li>\n              <div class=\"container-fluid\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "sliderApp.alerts.no.status", options) : helperMissing.call(depth0, "t", "sliderApp.alerts.no.status", options))));
  data.buffer.push("</div>\n            </li>\n          ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "controller.model.alerts", {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("\n              ");
  hashContexts = {'contentBinding': depth0};
  hashTypes = {'contentBinding': "STRING"};
  stack1 = helpers.view.call(depth0, "view.AlertView", {hash:{
    'contentBinding': ("this")
  },inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program8(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("\n                <div class=\"container-fluid\">\n                  <div class=\"row\">\n                    <div class=\"col-md-1 status-icon\">\n                      <i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("iconClass :icon-small")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></i>\n                    </div>\n                    <div class=\"col-md-11\">\n                      <div class=\"row\">\n                        <div class=\"col-md-7 title\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n                        <div class=\"message\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "message", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n              ");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n      <table class=\"table no-borders table-condensed\">\n        <tbody>\n          ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "controller.model.doNotShowComponentsAndAlerts", {hash:{},inverse:self.program(13, program13, data),fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </tbody>\n      </table>\n    ");
  return buffer;
  }
function program11(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n          <tr>\n            <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "sliderApp.summary.no.components", options) : helperMissing.call(depth0, "t", "sliderApp.summary.no.components", options))));
  data.buffer.push("</td>\n          </tr>\n          ");
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "controller.model.components", {hash:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  return buffer;
  }
function program14(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("\n            <tr>\n              <td><span ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("isRunning:icon-ok-sign:icon-warning-sign :status")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></span> ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "componentName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n              </td>\n              <td>\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "url", {hash:{},inverse:self.program(17, program17, data),fn:self.program(15, program15, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n              </td>\n            </tr>\n            ");
  return buffer;
  }
function program15(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("\n                  <a ");
  hashContexts = {'href': depth0};
  hashTypes = {'href': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("url")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" target=\"_blank\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "host", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n                ");
  return buffer;
  }

function program17(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n                  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "host", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  return buffer;
  }

function program19(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n  <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.graphsNotEmpty:visible:hidden :panel :panel-default")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n    <div class=\"panel-heading\">\n      ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.metrics", options) : helperMissing.call(depth0, "t", "common.metrics", options))));
  data.buffer.push("\n    </div>\n    <div class=\"panel-body\">\n      <div class=\"row\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "graph", "in", "view.graphs", {hash:{},inverse:self.noop,fn:self.program(20, program20, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n      </div>\n    </div>\n  </div>\n");
  return buffer;
  }
function program20(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n          <div class=\"col-md-3\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "graph.view", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</div>\n        ");
  return buffer;
  }

  data.buffer.push("\n\n\n<div class=\"clearfix\">\n  <div class=\"column-left col-md-6\">\n    ");
  hashContexts = {'heading': depth0,'class': depth0};
  hashTypes = {'heading': "STRING",'class': "STRING"};
  options = {hash:{
    'heading': ("Summary"),
    'class': ("panel-summary")
  },inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['bs-panel'] || (depth0 && depth0['bs-panel'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-panel", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  </div>\n  <div class=\"column-right col-md-6\">\n    <div class=\"panel panel-default panel-alerts\">\n      <div class=\"panel-heading\">\n        ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.status", options) : helperMissing.call(depth0, "t", "common.status", options))));
  data.buffer.push("\n        <div class=\"btn-group pull-right panel-link\">\n        </div>\n      </div>\n      <div class=\"app-alerts\">\n        <ul>\n          ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "controller.model.doNotShowComponentsAndAlerts", {hash:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        </ul>\n      </div>\n    </div>\n    ");
  hashContexts = {'heading': depth0,'class': depth0};
  hashTypes = {'heading': "STRING",'class': "STRING"};
  options = {hash:{
    'heading': ("Components"),
    'class': ("panel-components")
  },inverse:self.noop,fn:self.program(10, program10, data),contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['bs-panel'] || (depth0 && depth0['bs-panel'])),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-panel", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  </div>\n</div>\n\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "controller.model.showMetrics", {hash:{},inverse:self.noop,fn:self.program(19, program19, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  
});
});

require.register("templates/slider_apps", function(exports, require, module) {
module.exports = Ember.TEMPLATES['slider_apps'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.parentView.nameSort", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.parentView.statusSort", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.parentView.typeSort", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.parentView.userSort", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.parentView.startSort", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.parentView.endSort", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "slider", "in", "view.pageContent", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes;
  data.buffer.push("\n        ");
  hashContexts = {'contentBinding': depth0};
  hashTypes = {'contentBinding': "STRING"};
  stack1 = helpers.view.call(depth0, "view.SliderView", {hash:{
    'contentBinding': ("slider")
  },inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      ");
  return buffer;
  }
function program5(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n\n          <td>\n            ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || (depth0 && depth0['link-to'])),stack1 ? stack1.call(depth0, "slider_app.summary", "slider", options) : helperMissing.call(depth0, "link-to", "slider_app.summary", "slider", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n          </td>\n\n          <td>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "slider.displayStatus", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</td>\n\n          <td>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "slider.appType.displayName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</td>\n\n          <td>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "slider.user", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</td>\n\n          <td>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "slider.startedToLocalTime", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</td>\n\n          <td>");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "slider.endedToLocalTime", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</td>\n\n        ");
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n              <span ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-bind-popover'] || (depth0 && depth0['bs-bind-popover'])),stack1 ? stack1.call(depth0, "view.popover", options) : helperMissing.call(depth0, "bs-bind-popover", "view.popover", options))));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "slider.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</span>\n            ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n      <tr>\n        <td colspan=\"6\">\n          ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "tableView.filters.noItems", options) : helperMissing.call(depth0, "t", "tableView.filters.noItems", options))));
  data.buffer.push("\n        </td>\n      </tr>\n    ");
  return buffer;
  }

  data.buffer.push("\n\n<div id=\"slider-apps-table\">\n\n  <table class=\"datatable table table-striped\" id=\"slider-table\">\n    <thead>\n    ");
  hashContexts = {'classNames': depth0,'contentBinding': depth0};
  hashTypes = {'classNames': "STRING",'contentBinding': "STRING"};
  stack1 = helpers.view.call(depth0, "view.sortView", {hash:{
    'classNames': ("label-row"),
    'contentBinding': ("view.filteredContent")
  },inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <tr id=\"filter-row\">\n      <th>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.nameFilterView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</th>\n      <th>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.statusFilterView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</th>\n      <th>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.typeFilterView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</th>\n      <th>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.userFilterView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</th>\n      <th>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.startFilterView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</th>\n      <th></th>\n    </tr>\n    </thead>\n    <tbody>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.pageContent", {hash:{},inverse:self.program(8, program8, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </tbody>\n  </table>\n  <div class=\"page-bar\">\n    <div class=\"filtered-hosts-info span4\">\n      <label>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "view.filteredContentInfo", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" - <a ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "clearFilters", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          href=\"#\" class=\"clearFiltersLink\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "tableView.filters.clearAllFilters", options) : helperMissing.call(depth0, "t", "tableView.filters.clearAllFilters", options))));
  data.buffer.push("</a></label>\n    </div>\n    <div class=\"items-on-page\">\n      <label>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "common.show", options) : helperMissing.call(depth0, "t", "common.show", options))));
  data.buffer.push(" ");
  hashContexts = {'selectionBinding': depth0};
  hashTypes = {'selectionBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.rowsPerPageSelectView", {hash:{
    'selectionBinding': ("view.displayLength")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</label>\n    </div>\n    <div class=\"info\">");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "view.paginationInfo", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</div>\n    <div class=\"paging_two_button\">\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.paginationLeft", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.paginationRight", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    </div>\n  </div>\n</div>\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  
});
});

require.register("templates/slider_title_tooltip", function(exports, require, module) {
module.exports = Ember.TEMPLATES['slider_title_tooltip'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n    <div class=\"row\">\n      <div class=\"col-md-4\">");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.humanize || (depth0 && depth0.humanize)),stack1 ? stack1.call(depth0, "config.displayName", options) : helperMissing.call(depth0, "humanize", "config.displayName", options))));
  data.buffer.push("</div>\n      <div class=\"col-md-8\">");
  hashContexts = {'devider': depth0};
  hashTypes = {'devider': "STRING"};
  options = {hash:{
    'devider': (",")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatWordBreak || (depth0 && depth0.formatWordBreak)),stack1 ? stack1.call(depth0, "config.value", options) : helperMissing.call(depth0, "formatWordBreak", "config.value", options))));
  data.buffer.push("</div>\n    </div>\n  ");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"slider-name-popover\">\n  <p class=\"slider-description\">");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers._triageMustache.call(depth0, "App.description", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</p>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "config", "in", "view.content", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n");
  return buffer;
  
});
});

require.register("templates/unavailable_apps", function(exports, require, module) {
module.exports = Ember.TEMPLATES['unavailable_apps'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.t || (depth0 && depth0.t)),stack1 ? stack1.call(depth0, "slider.apps.unavailable", options) : helperMissing.call(depth0, "t", "slider.apps.unavailable", options))));
  data.buffer.push("\n<div class=\"alert alert-danger\">\n    ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers._triageMustache.call(depth0, "controller.errorMessage", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n</div>\n");
  return buffer;
  
});
});

require.register("translations", function(exports, require, module) {
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


Em.I18n.translations = {

  'ok': 'OK',
  'yes': 'Yes',
  'no': 'No',
  'any': 'Any',

  'common' : {
    'add': 'Add',
    'show': 'Show',
    'actions': 'Actions',
    'cancel': 'Cancel',
    'name': "Name",
    'back': "Back",
    'delete': 'Delete',
    'destroy': 'Destroy',
    'value': "Value",
    'next': "Next",
    'quickLinks': "Quick Links",
    'summary': 'Summary',
    'configs': 'Configs',
    'metrics': 'Metrics',
    'confirmation': 'Confirmation',
    'configuration': 'Configuration',
    'finish': 'Finish',
    'components': 'Components',
    'type': 'Type',
    'status': 'Status',
    'started': 'Started',
    'finished': 'Finished',
    'diagnostics': 'Diagnostics',
    'description': 'Description',
    'warning': 'Warning',
    'key': 'Key',
    'remove': 'Remove',
    'send': 'Send',
    'error': 'Error',
    'yarn.app.id': 'YARN Application ID',
    'frequency': 'Frequency',
    'minutes': 'Minutes',
    'seconds': 'Seconds',
    'save': 'Save'
  },

  'form': {
    'placeholder': {
      'optional': '(optional)',
      'step1.name': 'Enter Name (required)',
      'include.file.patterns': '.*log',
      'exclude.file.patterns': '.*zip',
      'frequency': '3600'
    }
  },

  'error.config_is_empty': 'Config <strong>{0}</strong> should not be empty',
  'error.config_is_empty_2': 'Config <strong>{0}</strong> should not be empty, because <strong>{1}</strong> is set to "true"',

  'popup.confirmation.commonHeader': 'Confirmation',
  'question.sure':'Are you sure?',

  'tableView.filters.all': 'All',
  'tableView.filters.filtered': 'Filtered',
  'tableView.filters.clearFilters': 'Clear filters',
  'tableView.filters.paginationInfo': '{0} - {1} of {2}',
  'tableView.filters.clearAllFilters': 'clear filters',
  'tableView.filters.showAll': 'Show All',
  'tableView.filters.clearSelection': 'clear selection All',
  'tableView.filters.noItems' : 'No slider apps to display',

  'configs.add_property': 'Add Property',
  'configs.add_property.invalid_name': 'Config name should consists only of letters, numbers, \'-\', \'_\', \'.\' and first character should be a letter.',
  'configs.add_property.name_exists': 'Config name already exists',
  'configs.enable.metrics': 'Enable Metrics',

  'slider.apps.title': 'Slider Apps',
  'slider.apps.create': 'Create App',
  'slider.apps.unavailable': 'Unable to get list of Slider Apps due to issues below. Possible reasons include incorrect or invalid view parameters. Please contact administrator for setting up proper view parameters and verifying necessary services are working.',
  'slider.apps.undefined.issue': 'Undefined issue',
  'sliderApps.filters.info': '{0} of {1} slider apps showing',
  'slider.apps.no.description.available': 'No Description Available',
  'slider.apps.no.applications.available': 'No Applications Available',

  'sliderApp.flex.invalid_counts': 'Instance counts should be integer and >= 0',
  'sliderApp.flex.message': 'Update the number of desired instances for each component of this application',

  'sliderApp.summary.go_to_nagios': 'Go to Nagios',
  'sliderApp.summary.no.components': 'No components are currently running',

  'sliderApp.alerts.no.status': 'No component statuses are currently available',
  'sliderApp.alerts.OK.timePrefixShort': 'OK',
  'sliderApp.alerts.WARN.timePrefixShort': 'WARN',
  'sliderApp.alerts.CRIT.timePrefixShort': 'CRIT',
  'sliderApp.alerts.MAINT.timePrefixShort': 'MAINT',
  'sliderApp.alerts.UNKNOWN.timePrefixShort': 'UNKNOWN',
  'sliderApp.alerts.OK.timePrefix': 'OK for {0}',
  'sliderApp.alerts.WARN.timePrefix': 'WARN for {0}',
  'sliderApp.alerts.CRIT.timePrefix': 'CRIT for {0}',
  'sliderApp.alerts.MAINT.timePrefix': 'MAINT for {0}',
  'sliderApp.alerts.UNKNOWN.timePrefix': 'UNKNOWN for {0}',
  'sliderApp.alerts.lastCheck': 'Last Checked {0}',
  'sliderApp.alerts.brLastCheck': "\nLast Checked {0}",
  'sliderApp.alerts.occurredOn': 'Occurred on {0}, {1}',

  'sliderApp.destroy.confirm.title': 'Destroy Slider App',
  'sliderApp.destroy.confirm.body': 'Destroying a Slider App could result in data loss if not property performed. Make sure you have backed up data handled by the application.',
  'sliderApp.destroy.confirm.body2': 'Are you sure you want to destroy Slider App <em>{0}</em>?',

  'wizard.name': 'Create App',
  'wizard.step1.name': 'Select Type',
  'wizard.step1.header': 'Select Application',
  'wizard.step1.appTypes': 'Application Types',
  'wizard.step1.description': 'Description',
  'wizard.step1.schedulerOptions.label': 'Scheduler Options',
  'wizard.step1.schedulerOptions.queueName': 'Queue Name',
  'wizard.step1.yarnLabels.label': 'YARN Labels',
  'wizard.step1.yarnLabels.options.anyHost': 'Any Host',
  'wizard.step1.yarnLabels.options.nonLabeledHost': 'Non-Labeled Host',
  'wizard.step1.yarnLabels.options.specifyLabel': 'Specify Label',
  'wizard.step1.logAggregation.label': 'Log Aggregation',
  'wizard.step1.logAggregation.filePatterns.include': 'Include File Patterns',
  'wizard.step1.logAggregation.filePatterns.exclude': 'Exclude File Patterns',
  'wizard.step1.typeDescription': 'Deploys {0} cluster on YARN.',
  'wizard.step1.nameFormatError': 'App Name should consist only of lower case letters, numbers, \'-\', and \'_\'. Also, first character should be a lower case letter.',
  'wizard.step1.nameRepeatError': 'App with entered Name already exists.',
  'wizard.step1.validateAppNameError': 'Application with name \'{0}\' already exists',
  'wizard.step1.noAppTypesError': 'No Slider Application packages have been installed on this server. Please contact your Ambari server administrator to install Slider Application packages into /var/lib/ambari-server/resources/apps/ folder and restart Ambari server.',
  'wizard.step1.frequencyError': 'Frequency value should be numeric',
  'wizard.step1.enable2wayssl': 'Enable Two-Way SSL',
  'wizard.step2.name': 'Allocate Resources',
  'wizard.step2.header': ' application requires resources to be allocated on the cluster. Provide resource allocation requests for each component of the application below.',
  'wizard.step2.table.instances': 'Instances',
  'wizard.step2.table.memory': 'Memory (MB)',
  'wizard.step2.table.cpu': 'CPU	Cores',
  'wizard.step2.table.yarnLabels': 'YARN Labels',
  'wizard.step2.table.popoverCheckbox': 'Check box to enable YARN labels on component',
  'wizard.step2.table.popoverLabel': 'Provide YARN label to make component run on labeled hosts. Empty value would make component run on non-labeled hosts.',
  'wizard.step2.error.numbers': 'All fields should be filled. Only integer numbers allowed.',
  'wizard.step3.name': 'Configuration',
  'wizard.step3.header.beginning': 'Provide	configuration	details	for	',
  'wizard.step3.header.end': '	application',
  'wizard.step3.error': 'Only \"key\":\"value\" format allowed.',
  'wizard.step4.name': 'Deploy',
  'wizard.step4.appName': 'App Name',
  'wizard.step4.appType': 'App Type',
  'wizard.step4.2waysslEnabled': 'Two-Way SSL Enabled',

  'ajax.errorMessage': 'Error message',
  'ajax.apiInfo': 'received on {0} method for API: {1}',
  'ajax.statusCode': '{0} status code'
};

});

require.register("views/application_view", function(exports, require, module) {
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

App.ApplicationView = Ember.View.extend({

  /**
   * View with popover for Slider title
   * @type {Ember.View}
   */
  SliderTitleView: Em.View.extend({

    showCreateAppButton: function () {
      if (this.get('controller.hasConfigErrors')) {
        return false;
      }
      var currentPath = this.get('controller.currentPath');
      return currentPath && (currentPath == 'slider_apps.index' || currentPath.indexOf('slider_apps.createAppWizard') != -1);
    }.property('controller.currentPath', 'controller.hasConfigErrors'),

    /**
     * Set <code>popover</code> template
     * @method sliderConfigsChecker
     */
    sliderConfigsChecker: function() {
      var template = this.createChildView(App.SliderTitleTooltipView, {
        content: App.SliderApp.store.all('sliderConfig')
      });
      $('#slider-title').data('bs.popover').options.content = template.renderToBuffer().string();
    }.observes('App.mapperTime'),

    didInsertElement: function () {
      this.createPopover();
    },

    /**
     * Create popover for Slider Title
     * @method createPopover
     */
    createPopover: function() {
      $('#slider-title').popover('destroy').popover({
        trigger: 'hover',
        placement: 'bottom',
        title: App.get('label'),
        html: true
      });
      this.sliderConfigsChecker();
    }.observes('App.label')

  })

});

App.SliderTitleTooltipView = Em.View.extend({
  templateName: 'slider_title_tooltip'
});

});

require.register("views/common/chart_view", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

var string_utils = require('helpers/string_utils');

/**
 * @class
 *
 * This is a view which GETs data from a URL and shows it as a time based line
 * graph. Time is shown on the X axis with data series shown on Y axis. It
 * optionally also has the ability to auto refresh itself over a given time
 * interval.
 *
 * This is an abstract class which is meant to be extended.
 *
 * Extending classes should override the following:
 * <ul>
 * <li>url - from where the data can be retrieved
 * <li>title - Title to be displayed when showing the chart
 * <li>id - which uniquely identifies this chart in any page
 * <li>#transformToSeries(jsonData) - function to map server data into graph
 * series
 * </ul>
 *
 * Extending classes could optionally override the following:
 * <ul>
 * <li>#colorForSeries(series) - function to get custom colors per series
 * </ul>
 *
 * @extends Ember.Object
 * @extends Ember.View
 */
App.ChartView = Ember.View.extend({

  templateName: 'common/chart',

  /**
   * The URL from which data can be retrieved.
   *
   * This property must be provided for the graph to show properly.
   *
   * @type String
   * @default null
   */
  url: null,

  /**
   * A unique ID for this chart.
   *
   * @type String
   * @default null
   */
  id: null,

  /**
   * Title to be shown under the chart.
   *
   * @type String
   * @default null
   */
  title: null,

  /**
   * @private
   *
   * @type Rickshaw.Graph
   * @default null
   */
  _graph: null,

  /**
   * Array of classnames for each series (in widget)
   * @type Rickshaw.Graph
   */
  _popupGraph: null,

  /**
   * Array of classnames for each series
   * @type Array
   */
  _seriesProperties: null,

  /**
   * Array of classnames for each series (in widget)
   * @type Array
   */
  _seriesPropertiesWidget: null,

  /**
   * Renderer type
   * See <code>Rickshaw.Graph.Renderer</code> for more info
   * @type String
   */
  renderer: 'area',

  /**
   * Suffix used in DOM-elements selectors
   * @type String
   */
  popupSuffix: '-popup',

  /**
   * Is popup for current graph open
   * @type Boolean
   */
  isPopup: false,

  /**
   * Is graph ready
   * @type Boolean
   */
  isReady: false,

  /**
   * Is popup-graph ready
   * @type Boolean
   */
  isPopupReady: false,

  /**
   * Is data for graph available
   * @type Boolean
   */
  hasData: true,

  containerId: null,
  containerClass: null,
  yAxisId: null,
  yAxisClass: null,
  xAxisId: null,
  xAxisClass: null,
  legendId: null,
  legendClass: null,
  chartId: null,
  chartClass: null,
  titleId: null,
  titleClass: null,

  didInsertElement: function() {
    var id = this.get('id');
    var idTemplate = id + '-{element}';

    this.set('containerId', idTemplate.replace('{element}', 'container'));
    this.set('containerClass', 'chart-container');
    this.set('yAxisId', idTemplate.replace('{element}', 'yaxis'));
    this.set('yAxisClass', this.get('yAxisId'));
    this.set('xAxisId', idTemplate.replace('{element}', 'xaxis'));
    this.set('xAxisClass', this.get('xAxisId'));
    this.set('legendId', idTemplate.replace('{element}', 'legend'));
    this.set('legendClass', this.get('legendId'));
    this.set('chartId', idTemplate.replace('{element}', 'chart'));
    this.set('chartClass', this.get('chartId'));
    this.set('titleId', idTemplate.replace('{element}', 'title'));
    this.set('titleClass', this.get('titleId'));
    this.set('interval', 6000);
    this.run('loadData', true);
  },

  willDestroyElement: function() {
    this.stop(); // Stop periodic load
  },

  loadData: function() {
    App.ajax.send({
      name: this.get('ajaxIndex'),
      sender: this,
      data: this.getDataForAjaxRequest(),
      success: '_refreshGraph',
      error: 'loadDataErrorCallback'
    });
  },

  getDataForAjaxRequest: function() {
    return {};
  },

  loadDataErrorCallback: function() {
    this.set('isReady', true);
    this.set('isPopup', false);
    this.set('hasData', false);
  },

  /**
   * Shows a yellow warning message in place of the chart.
   *
   * @param type  Can be any of 'warn', 'error', 'info', 'success'
   * @param title Bolded title for the message
   * @param message String representing the message
   * @type: Function
   */
  _showMessage: function(type, title, message) {
    var chartOverlay = '#' + this.get('id');
    var chartOverlayId = chartOverlay + '-chart';
    var chartOverlayY = chartOverlay + '-yaxis';
    var chartOverlayX = chartOverlay + '-xaxis';
    var chartOverlayLegend = chartOverlay + '-legend';
    var chartOverlayTimeline = chartOverlay + '-timeline';
    if (this.get('isPopup')) {
      chartOverlayId += this.get('popupSuffix');
      chartOverlayY += this.get('popupSuffix');
      chartOverlayX += this.get('popupSuffix');
      chartOverlayLegend += this.get('popupSuffix');
      chartOverlayTimeline += this.get('popupSuffix');
    }
    var typeClass;
    switch (type) {
      case 'error':
        typeClass = 'alert-error';
        break;
      case 'success':
        typeClass = 'alert-success';
        break;
      case 'info':
        typeClass = 'alert-info';
        break;
      default:
        typeClass = '';
        break;
    }
    $(chartOverlayId+', '+chartOverlayY+', '+chartOverlayX+', '+chartOverlayLegend+', '+chartOverlayTimeline).html('');
    $(chartOverlayId).append('<div class=\"alert '+typeClass+'\"><strong>'+title+'</strong> '+message+'</div>');
  },

  /**
   * Transforms the JSON data retrieved from the server into the series
   * format that Rickshaw.Graph understands.
   *
   * The series object is generally in the following format: [ { name :
   * "Series 1", data : [ { x : 0, y : 0 }, { x : 1, y : 1 } ] } ]
   *
   * Extending classes should override this method.
   *
   * @param seriesData
   *          Data retrieved from the server
   * @param displayName
   *          Graph title
   * @type: Function
   *
   */
  transformData: function (seriesData, displayName) {
    var seriesArray = [];
    if (seriesData != null) {
      // Is it a string?
      if ("string" == typeof seriesData) {
        seriesData = JSON.parse(seriesData);
      }
      // Is it a number?
      if ("number" == typeof seriesData) {
        // Same number applies to all time.
        var number = seriesData;
        seriesData = [];
        seriesData.push([number, (new Date().getTime())-(60*60)]);
        seriesData.push([number, (new Date().getTime())]);
      }
      // We have valid data
      var series = {};
      series.name = displayName;
      series.data = [];
      for ( var index = 0; index < seriesData.length; index++) {
        series.data.push({
          x: seriesData[index][1],
          y: seriesData[index][0]
        });
      }
      return series;
    }
    return null;
  },

  /**
   * Provides the formatter to use in displaying Y axis.
   *
   * Uses the App.ChartLinearTimeView.DefaultFormatter which shows 10K,
   * 300M etc.
   *
   * @type Function
   */
  yAxisFormatter: function(y) {
    return App.ChartView.DefaultFormatter(y);
  },

  /**
   * Provides the color (in any HTML color format) to use for a particular
   * series.
   * May be redefined in child views
   *
   * @param series
   *          Series for which color is being requested
   * @return color String. Returning null allows this chart to pick a color
   *         from palette.
   * @default null
   * @type Function
   */
  colorForSeries: function (series) {
    return null;
  },

  /**
   * Check whether seriesData is correct data for chart drawing
   * @param {Array} seriesData
   * @return {Boolean}
   */
  checkSeries : function(seriesData) {
    if(!seriesData || !seriesData.length) {
      return false;
    }
    var result = true;
    seriesData.forEach(function(item) {
      if(!item.data || !item.data.length || !item.data[0] || typeof item.data[0].x === 'undefined') {
        result = false;
      }
    });
    return result;
  },

  /**
   * @private
   *
   * Refreshes the graph with the latest JSON data.
   *
   * @type Function
   */
  _refreshGraph: function (jsonData) {
    if(this.get('isDestroyed')){
      return;
    }
    var seriesData = this.transformToSeries(jsonData);

    //if graph opened as modal popup
    var popup_path = $("#" + this.get('id') + "-container" + this.get('popupSuffix'));
    var graph_container = $("#" + this.get('id') + "-container");
    if(popup_path.length) {
      popup_path.children().each(function () {
        $(this).children().remove();
      });
      this.set('isPopup', true);
    }
    else {
      //set height for empty container while graph drawing to avoid viewport shrinking by height
      graph_container.css('height', graph_container.css('height'));
      graph_container.children().each(function (index, value) {
        $(value).children().remove();
      });
    }
    if (this.checkSeries(seriesData)) {
      // Check container exists (may be not, if we go to another page and wait while graphs loading)
      if (graph_container.length) {
        this.draw(seriesData);
        this.set('hasData', true);
        //move yAxis value lower to make them fully visible
        $("#" + this.get('id') + "-container").find('.y_axis text').attr('y',8);
      }
    }
    else {
      this.set('isReady', true);
      //if Axis X time interval is default(60 minutes)
      if(this.get('timeUnitSeconds') === 3600){
        this.set('hasData', false);
      }
      this.set('isPopup', false);
    }
    graph_container.css('height', 'auto');
  },

  /**
   * Returns a custom time unit, that depends on X axis interval length, for the graph's X axis.
   * This is needed as Rickshaw's default time X axis uses UTC time, which can be confusing
   * for users expecting locale specific time.
   *
   * If <code>null</code> is returned, Rickshaw's default time unit is used.
   *
   * @type Function
   * @return Rickshaw.Fixtures.Time
   */
  localeTimeUnit: function(timeUnitSeconds) {
    var timeUnit = new Rickshaw.Fixtures.Time();
    switch (timeUnitSeconds){
      case 604800:
        timeUnit = timeUnit.unit('day');
        break;
      case 2592000:
        timeUnit = timeUnit.unit('week');
        break;
      case 31104000:
        timeUnit = timeUnit.unit('month');
        break;
      default:
        timeUnit = {
          name: timeUnitSeconds / 240 + ' minute',
          seconds: timeUnitSeconds / 4,
          formatter: function (d) {
            return d.toLocaleString().match(/(\d+:\d+):/)[1];
          }
        };
    }
    return timeUnit;
  },

  /**
   * temporary fix for incoming data for graph
   * to shift data time to correct time point
   * @param {Array} data
   */
  dataShiftFix: function(data) {
    var nowTime = Math.round((new Date().getTime()) / 1000);
    data.forEach(function(series){
      var l = series.data.length;
      var shiftDiff = nowTime - series.data[l - 1].x;
      if(shiftDiff > 3600){
        for(var i = 0;i < l;i++){
          series.data[i].x = series.data[i].x + shiftDiff;
        }
        series.data.unshift({
          x: nowTime - this.get('timeUnitSeconds'),
          y: 0
        });
      }
    }, this);
  },

  /**
   * calculate statistic data for popup legend and set proper colors for series
   * @param {Array} data
   */
  dataPreProcess: function(data) {
    var self = this;
    var palette = new Rickshaw.Color.Palette({ scheme: 'munin'});
    // Format series for display
    var series_min_length = 100000000;
    data.forEach(function (series, index) {
      var seriesColor = self.colorForSeries(series);
      if (seriesColor == null) {
        seriesColor = palette.color();
      }
      series.color = seriesColor;
      series.stroke = 'rgba(0,0,0,0.3)';
      if (this.get('isPopup')) {
        // calculate statistic data for popup legend
        var avg = 0;
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        for (var i = 0; i < series.data.length; i++) {
          avg += series.data[i]['y'];
          if (series.data[i]['y'] < min) {
            min = series.data[i]['y'];
          }
          else {
            if (series.data[i]['y'] > max) {
              max = series.data[i]['y'];
            }
          }
        }
        series.name = string_utils.pad(series.name, 30, '&nbsp;', 2) +
          string_utils.pad('min', 5, '&nbsp;', 3) +
          string_utils.pad(this.get('yAxisFormatter')(min), 12, '&nbsp;', 3) +
          string_utils.pad('avg', 5, '&nbsp;', 3) +
          string_utils.pad(this.get('yAxisFormatter')(avg/series.data.length), 12, '&nbsp;', 3) +
          string_utils.pad('max', 12, '&nbsp;', 3) +
          string_utils.pad(this.get('yAxisFormatter')(max), 5, '&nbsp;', 3);
      }
      if (series.data.length < series_min_length) {
        series_min_length = series.data.length;
      }
    }.bind(this));

    // All series should have equal length
    data.forEach(function(series, index) {
      if (series.data.length > series_min_length) {
        series.data.length = series_min_length;
      }
    });
  },

  draw: function(seriesData) {
    var self = this;
    var isPopup = this.get('isPopup');
    var p = isPopup ? this.get('popupSuffix') : '';

    this.dataShiftFix(seriesData);
    this.dataPreProcess(seriesData);

    var chartId = "#" + this.get('id') + "-chart" + p;
    var chartOverlayId = "#" + this.get('id') + "-container" + p;
    var xaxisElementId = "#" + this.get('id') + "-xaxis" + p;
    var yaxisElementId = "#" + this.get('id') + "-yaxis" + p;
    var legendElementId = "#" + this.get('id') + "-legend" + p;

    var chartElement = document.querySelector(chartId);
    var overlayElement = document.querySelector(chartOverlayId);
    var xaxisElement = document.querySelector(xaxisElementId);
    var yaxisElement = document.querySelector(yaxisElementId);
    var legendElement = document.querySelector(legendElementId);

    var height = 150;
    var width = 400;
    var diff = 32;

    if(this.get('inWidget')) {
      height = 105; // for widgets view
      diff = 22;
    }
    if (isPopup) {
      height = 180;
      width = 670;
    }
    else {
      // If not in popup, the width could vary.
      // We determine width based on div's size.
      var thisElement = this.get('element');
      if (thisElement!=null) {
        var calculatedWidth = $(thisElement).width();
        if (calculatedWidth > diff) {
          width = calculatedWidth - diff;
        }
      }
    }

    var _graph = new Rickshaw.Graph({
      height: height,
      width: width,
      element: chartElement,
      series: seriesData,
      interpolation: 'step-after',
      stroke: true,
      renderer: this.get('renderer'),
      strokeWidth: (this.get('renderer') != 'area' ? 2 : 1)
    });

    if (this.get('renderer') === 'area') {
      _graph.renderer.unstack = false;
    }

    new Rickshaw.Graph.Axis.Time({
      graph: _graph,
      timeUnit: this.localeTimeUnit(this.get('timeUnitSeconds'))
    });

    new Rickshaw.Graph.Axis.Y({
      tickFormat: this.yAxisFormatter,
      element: yaxisElement,
      orientation: (isPopup ? 'left' : 'right'),
      graph: _graph
    });

    var legend = new Rickshaw.Graph.Legend({
      graph: _graph,
      element: legendElement
    });

    new Rickshaw.Graph.Behavior.Series.Toggle({
      graph: _graph,
      legend: legend
    });

    new Rickshaw.Graph.Behavior.Series.Order({
      graph: _graph,
      legend: legend
    });

    if (!isPopup) {
      overlayElement.addEventListener('mousemove', function () {
        $(xaxisElement).removeClass('hide');
        $(legendElement).removeClass('hide');
        $(chartElement).children("div").removeClass('hide');
      });
      overlayElement.addEventListener('mouseout', function () {
        $(legendElement).addClass('hide');
      });
      _graph.onUpdate(function () {
        $(legendElement).addClass('hide');
      });
    }

    //show the graph when it's loaded
    _graph.onUpdate(function() {
      self.set('isReady', true);
    });
    _graph.render();

    if (isPopup) {
      new Rickshaw.Graph.HoverDetail({
        graph: _graph,
        yFormatter:function (y) {
          return self.yAxisFormatter(y);
        },
        xFormatter:function (x) {
          return (new Date(x * 1000)).toLocaleTimeString();
        },
        formatter:function (series, x, y, formattedX, formattedY, d) {
          return formattedY + '<br />' + formattedX;
        }
      });
    }

    _graph = this.updateSeriesInGraph(_graph);
    if (isPopup) {
      //show the graph when it's loaded
      _graph.onUpdate(function() {
        self.set('isPopupReady', true);
      });
      _graph.update();

      var selector = '#'+this.get('id')+'-container'+this.get('popupSuffix');
      $(selector + ' li.line').click(function() {
        var series = [];
        $(selector + ' a.action').each(function(index, v) {
          series[index] = v.parentNode.classList;
        });
        self.set('_seriesProperties', series);
      });

      this.set('_popupGraph', _graph);
    }
    else {
      _graph.update();
      var selector = '#'+this.get('id')+'-container';
      $(selector + ' li.line').click(function() {
        var series = [];
        $(selector + ' a.action').each(function(index, v) {
          series[index] = v.parentNode.classList;
        });
        self.set('_seriesPropertiesWidget', series);
      });

      this.set('_graph', _graph);
    }
  },

  /**
   *
   * @param {Rickshaw.Graph} graph
   * @returns {Rickshaw.Graph}
   */
  updateSeriesInGraph: function(graph) {
    var id = this.get('id');
    var isPopup = this.get('isPopup');
    var popupSuffix = this.get('popupSuffix');
    var _series = isPopup ? this.get('_seriesProperties') : this.get('_seriesPropertiesWidget');
    graph.series.forEach(function(series, index) {
      if (_series !== null && _series[index] !== null && _series[index] !== undefined ) {
        if(_series[_series.length - index - 1].length > 1) {
          var s = '#' + id + '-container' + (isPopup ? popupSuffix : '') + ' a.action:eq(' + (_series.length - index - 1) + ')';
          $(s).parent('li').addClass('disabled');
          series.disable();
        }
      }
    });
    return graph;
  },

  showGraphInPopup: function() {
    if(!this.get('hasData')) {
      return;
    }

    this.set('isPopup', true);
    var self = this;

    App.ModalPopup.show({
      bodyClass: Em.View.extend({

        containerId: null,
        containerClass: null,
        yAxisId: null,
        yAxisClass: null,
        xAxisId: null,
        xAxisClass: null,
        legendId: null,
        legendClass: null,
        chartId: null,
        chartClass: null,
        titleId: null,
        titleClass: null,

        isReady: function() {
          return this.get('parentView.graph.isPopupReady');
        }.property('parentView.graph.isPopupReady'),

        didInsertElement: function() {
          $('#modal').addClass('modal-graph-line');
          var popupSuffix = this.get('parentView.graph.popupSuffix');
          var id = this.get('parentView.graph.id');
          var idTemplate = id + '-{element}' + popupSuffix;

          this.set('containerId', idTemplate.replace('{element}', 'container'));
          this.set('containerClass', 'chart-container' + popupSuffix);
          this.set('yAxisId', idTemplate.replace('{element}', 'yaxis'));
          this.set('yAxisClass', this.get('yAxisId').replace(popupSuffix, ''));
          this.set('xAxisId', idTemplate.replace('{element}', 'xaxis'));
          this.set('xAxisClass', this.get('xAxisId').replace(popupSuffix, ''));
          this.set('legendId', idTemplate.replace('{element}', 'legend'));
          this.set('legendClass', this.get('legendId').replace(popupSuffix, ''));
          this.set('chartId', idTemplate.replace('{element}', 'chart'));
          this.set('chartClass', this.get('chartId').replace(popupSuffix, ''));
          this.set('titleId', idTemplate.replace('{element}', 'title'));
          this.set('titleClass', this.get('titleId').replace(popupSuffix, ''));
        },

        templateName: require('templates/common/chart/linear_time'),
        /**
         * check is time paging feature is enable for graph
         */
        isTimePagingEnable: function() {
          return !self.get('isTimePagingDisable');
        }.property(),
        rightArrowVisible: function() {
          return (this.get('isReady') && (this.get('parentView.currentTimeIndex') != 0));
        }.property('isReady', 'parentView.currentTimeIndex'),
        leftArrowVisible: function() {
          return (this.get('isReady') && (this.get('parentView.currentTimeIndex') != 7));
        }.property('isReady', 'parentView.currentTimeIndex')
      }),
      header: this.get('title'),
      /**
       * App.ChartLinearTimeView
       */
      graph: self,
      secondary: null,
      onPrimary: function() {
        this.hide();
        self.set('isPopup', false);
        self.set('timeUnitSeconds', 3600);
      },
      onClose: function() {
        this.onPrimary();
      },
      /**
       * move graph back by time
       * @param event
       */
      switchTimeBack: function(event) {
        var index = this.get('currentTimeIndex');
        // 7 - number of last time state
        if(index < 7) {
          this.reloadGraphByTime(++index);
        }
      },
      /**
       * move graph forward by time
       * @param event
       */
      switchTimeForward: function(event) {
        var index = this.get('currentTimeIndex');
        if(index > 0) {
          this.reloadGraphByTime(--index);
        }
      },
      /**
       * reload graph depending on the time
       * @param index
       */
      reloadGraphByTime: function(index) {
        this.set('currentTimeIndex', index);
        self.set('timeUnitSeconds', this.get('timeStates')[index].seconds);
        self.loadData();
      },
      timeStates: [
        {name: Em.I18n.t('graphs.timeRange.hour'), seconds: 3600},
        {name: Em.I18n.t('graphs.timeRange.twoHours'), seconds: 7200},
        {name: Em.I18n.t('graphs.timeRange.fourHours'), seconds: 14400},
        {name: Em.I18n.t('graphs.timeRange.twelveHours'), seconds: 43200},
        {name: Em.I18n.t('graphs.timeRange.day'), seconds: 86400},
        {name: Em.I18n.t('graphs.timeRange.week'), seconds: 604800},
        {name: Em.I18n.t('graphs.timeRange.month'), seconds: 2592000},
        {name: Em.I18n.t('graphs.timeRange.year'), seconds: 31104000}
      ],
      currentTimeIndex: 0,
      currentTimeState: function() {
        return this.get('timeStates').objectAt(this.get('currentTimeIndex'));
      }.property('currentTimeIndex')
    });
    Ember.run.next(function() {
      self.loadData();
      self.set('isPopupReady', false);
    });
  },
  //60 minute interval on X axis.
  timeUnitSeconds: 3600
});

/**
 * A formatter which will turn a number into computer storage sizes of the
 * format '23 GB' etc.
 *
 * @type {Function}
 */
App.ChartView.BytesFormatter = function (y) {
  if (y == 0) return '0 B';
  var value = Rickshaw.Fixtures.Number.formatBase1024KMGTP(y);
  if (!y || y.length < 1) {
    value = '0 B';
  }
  else {
    if ("number" == typeof value) {
      value = String(value);
    }
    if ("string" == typeof value) {
      value = value.replace(/\.\d(\d+)/, function($0, $1){ // Remove only 1-digit after decimal part
        return $0.replace($1, '');
      });
      // Either it ends with digit or ends with character
      value = value.replace(/(\d$)/, '$1 '); // Ends with digit like '120'
      value = value.replace(/([a-zA-Z]$)/, ' $1'); // Ends with character like
      // '120M'
      value = value + 'B'; // Append B to make B, MB, GB etc.
    }
  }
  return value;
};

/**
 * A formatter which will turn a number into percentage display like '42%'
 *
 * @type {Function}
 */
App.ChartView.PercentageFormatter = function (percentage) {
  var value = percentage;
  if (!value || value.length < 1) {
    value = '0 %';
  } else {
    value = value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + '%';
  }
  return value;
};

/**
 * A formatter which will turn elapsed time into display time like '50 ms',
 * '5s', '10 m', '3 hr' etc. Time is expected to be provided in milliseconds.
 *
 * @type {Function}
 */
App.ChartView.TimeElapsedFormatter = function (millis) {
  var value = millis;
  if (!value || value.length < 1) {
    value = '0 ms';
  } else if ("number" == typeof millis) {
    var seconds = millis > 1000 ? Math.round(millis / 1000) : 0;
    var minutes = seconds > 60 ? Math.round(seconds / 60) : 0;
    var hours = minutes > 60 ? Math.round(minutes / 60) : 0;
    var days = hours > 24 ? Math.round(hours / 24) : 0;
    if (days > 0) {
      value = days + ' d';
    } else if (hours > 0) {
      value = hours + ' hr';
    } else if (minutes > 0) {
      value = minutes + ' m';
    } else if (seconds > 0) {
      value = seconds + ' s';
    } else if (millis > 0) {
      value = millis.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + ' ms';
    } else {
      value = millis.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + ' ms';
    }
  }
  return value;
};

/**
 * The default formatter which uses Rickshaw.Fixtures.Number.formatKMBT
 * which shows 10K, 300M etc.
 *
 * @type {Function}
 */
App.ChartView.DefaultFormatter = function(y) {
  if(isNaN(y)){
    return 0;
  }
  var value = Rickshaw.Fixtures.Number.formatKMBT(y);
  if (value == '') return '0';
  value = String(value);
  var c = value[value.length - 1];
  if (!isNaN(parseInt(c))) {
    // c is digit
    value = parseFloat(value).toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  }
  else {
    // c in not digit
    value = parseFloat(value.substr(0, value.length - 1)).toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + c;
  }
  return value;
};


/**
 * Creates and returns a formatter that can convert a 'value'
 * to 'value units/s'.
 *
 * @param unitsPrefix Prefix which will be used in 'unitsPrefix/s'
 * @param valueFormatter  Value itself will need further processing
 *        via provided formatter. Ex: '10M requests/s'. Generally
 *        should be App.ChartLinearTimeView.DefaultFormatter.
 * @return {Function}
 */
App.ChartView.CreateRateFormatter = function (unitsPrefix, valueFormatter) {
  var suffix = " "+unitsPrefix+"/s";
  return function (value) {
    value = valueFormatter(value) + suffix;
    return value;
  };
};

});

require.register("views/common/config_set_view", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * view that display set of configs united into group
 * which can be excluded from/included into general config array via trigger(special config property)
 * @type {Em.View}
 */
App.ConfigSetView = Ember.View.extend({

  /**
   * config set data
   */
  configSet: null,

  /**
   * configs which can be included/excluded
   * @type {Array}
   */
  configs: function () {
    if (this.get('configSet.trigger.value')) {
      return this.get('configSet.configs');
    }
    return [];
  }.property('configSet.trigger.value'),

  /**
   * observe change of config values to resolve their dependencies
   * @method changeConfigValues
   */
  changeConfigValues: function () {
    var configs = this.get('configs');
    var dependencies = this.get('configSet.dependencies');

    if (configs.length > 0) {
      dependencies.forEach(function (item) {
        var origin = configs.findBy('name', item.origin);
        var dependent = configs.findBy('name', item.dependent);
        item.mapFunction(origin, dependent);
      })
    }
  }.observes('configs.@each.value')
});

});

require.register("views/common/filter_view", function(exports, require, module) {
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

/**
 * Wrapper View for all filter components. Layout template and common actions are located inside of it.
 * Logic specific for data component(input, select, or custom multi select, which fire any changes on interface) are
 * located in inner view - <code>filterView</code>.
 *
 * If we want to have input filter, put <code>textFieldView</code> to it.
 * All inner views implemented below this view.
 * @type {*}
 */

var App = require('config/app');

var wrapperView = Ember.View.extend({
  classNames: ['view-wrapper'],
  layout: Ember.Handlebars.compile('<a href="#" {{action "clearFilter" target="view"}} class="ui-icon ui-icon-circle-close"></a> {{yield}}'),
  template: Ember.Handlebars.compile(
    '{{#if view.fieldId}}<input type="hidden" id="{{unbound view.fieldId}}" value="" />{{/if}}' +
    '{{view view.filterView}}' +
    '{{#if view.showApply}}<button {{action "setValueOnApply" target="view"}} class="apply-btn btn"><span>Apply</span></button>{{/if}} '
  ),

  value: null,

  /**
   * Column index
   */
  column: null,

  /**
   * If this field is exists we dynamically create hidden input element and set value there.
   * Used for some cases, where this values will be used outside of component
   */
  fieldId: null,

  clearFilter: function(){
    this.set('value', this.get('emptyValue'));
    if(this.get('setPropertyOnApply')){
      this.setValueOnApply();
    }
    return false;
  },

  setValueOnApply: function() {
    if(this.get('value') == null){
      this.set('value', '')
    }
    this.set(this.get('setPropertyOnApply'), this.get('value'));
    return false;
  },

  /**
   * Use to determine whether filter is clear or not. Also when we want to set empty value
   */
  emptyValue: '',

  /**
   * Whether our <code>value</code> is empty or not
   * @return {Boolean}
   */
  isEmpty: function(){
    if(this.get('value') === null || this.get('value') == this.get('defaultValue')){
      return true;
    }
    return this.get('value').toString() === this.get('emptyValue').toString();
  },

  /**
   * Show/Hide <code>Clear filter</code> button.
   * Also this method updates computed field related to <code>fieldId</code> if it exists.
   * Call <code>onChangeValue</code> callback when everything is done.
   */
  showClearFilter: function(){
    if(!this.get('parentNode')){
      return;
    }
    // get the sort view element in the same column to current filter view to highlight them together
    var relatedSort = $(this.get('element')).parents('thead').find('.sort-view-' + this.get('column'));
    if(this.isEmpty()){
      this.get('parentNode').removeClass('active-filter');
      this.get('parentNode').addClass('notActive');
      relatedSort.removeClass('active-sort');
    } else {
      this.get('parentNode').removeClass('notActive');
      this.get('parentNode').addClass('active-filter');
      relatedSort.addClass('active-sort');
    }

    if(this.get('fieldId')){
      this.$('> input').eq(0).val(this.get('value'));
    }

    this.onChangeValue();
  }.observes('value'),

  /**
   * Callback for value changes
   */
  onChangeValue: function(){

  },

  /**
   * Filter components is located here. Should be redefined
   */
  filterView: Em.View,

  /**
   * Update class of parentNode(hide clear filter button) on page load
   */
  didInsertElement: function(){
    var parent = this.$().parent();
    this.set('parentNode', parent);
    parent.addClass('notActive');
  }
});

/**
 * Simple input control for wrapperView
 */
var textFieldView = Ember.TextField.extend({
  type:'text',
  placeholder: Em.I18n.t('any'),
  valueBinding: "parentView.value"
});

/**
 * Simple multiselect control for wrapperView.
 * Used to render blue button and popup, which opens on button click.
 * All content related logic should be implemented manually outside of it
 */
var componentFieldView = Ember.View.extend({
  classNames: ['btn-group'],
  classNameBindings: ['isFilterOpen:open:'],

  /**
   * Whether popup is shown or not
   */
  isFilterOpen: false,

  /**
   * We have <code>value</code> property similar to inputs <code>value</code> property
   */
  valueBinding: 'parentView.value',

  /**
   * Clear filter to initial state
   */
  clearFilter: function(){
    this.set('value', '');
  },

  /**
   * Onclick handler for <code>cancel filter</code> button
   */
  closeFilter:function () {
    $(document).unbind('click');
    this.set('isFilterOpen', false);
  },

  /**
   * Onclick handler for <code>apply filter</code> button
   */
  applyFilter:function() {
    this.closeFilter();
  },

  /**
   * Onclick handler for <code>show component filter</code> button.
   * Also this function is used in some other places
   */
  clickFilterButton:function () {
    var self = this;
    this.set('isFilterOpen', !this.get('isFilterOpen'));
    if (this.get('isFilterOpen')) {

      var dropDown = this.$('.filter-components');
      var firstClick = true;
      $(document).bind('click', function (e) {
        if (!firstClick && $(e.target).closest(dropDown).length == 0) {
          self.set('isFilterOpen', false);
          $(document).unbind('click');
        }
        firstClick = false;
      });
    }
  }
});

/**
 * Simple select control for wrapperView
 */
var selectFieldView = Ember.Select.extend({
  selectionBinding: 'parentView.value',
  contentBinding: 'parentView.content'
});

/**
 * Result object, which will be accessible outside
 * @type {Object}
 */
module.exports = {
  /**
   * You can access wrapperView outside
   */
  wrapperView : wrapperView,

  /**
   * And also controls views if need it
   */
  textFieldView : textFieldView,
  selectFieldView: selectFieldView,
  componentFieldView: componentFieldView,

  /**
   * Quick create input filters
   * @param config parameters of <code>wrapperView</code>
   */
  createTextView : function(config){
    config.fieldType = config.fieldType || 'input-medium';
    config.filterView = textFieldView.extend({
      classNames : [ config.fieldType ]
    });

    return wrapperView.extend(config);
  },

  /**
   * Quick create multiSelect filters
   * @param config parameters of <code>wrapperView</code>
   */
  createComponentView : function(config){
    config.clearFilter = function(){
      this.forEachChildView(function(item){
        if(item.clearFilter){
          item.clearFilter();
        }
      });
      return false;
    };

    return wrapperView.extend(config);
  },

  /**
   * Quick create select filters
   * @param config parameters of <code>wrapperView</code>
   */
  createSelectView: function(config){

    config.fieldType = config.fieldType || 'input-medium';
    config.filterView = selectFieldView.extend({
      classNames : [ config.fieldType ],
      attributeBindings: ['disabled','multiple'],
      disabled: false
    });
    config.emptyValue = config.emptyValue || Em.I18n.t('any');

    return wrapperView.extend(config);
  },
  /**
   * returns the filter function, which depends on the type of property
   * @param type
   * @param isGlobal check is search global
   * @return {Function}
   */
  getFilterByType: function(type, isGlobal){
    switch (type){
      case 'boolean':
        return function (origin, compareValue){
          return origin === compareValue;
        };
        break;
      case 'date':
        return function (rowValue, rangeExp) {
          var match = false;
          var timePassed = new Date().getTime() - new Date(rowValue).getTime();
          switch (rangeExp) {
            case 'Past 1 hour':
              match = timePassed <= 3600000;
              break;
            case 'Past 1 Day':
              match = timePassed <= 86400000;
              break;
            case 'Past 2 Days':
              match = timePassed <= 172800000;
              break;
            case 'Past 7 Days':
              match = timePassed <= 604800000;
              break;
            case 'Past 14 Days':
              match = timePassed <= 1209600000;
              break;
            case 'Past 30 Days':
              match = timePassed <= 2592000000;
              break;
            case 'Any':
              match = true;
              break;
          }
          return match;
        };
        break;
      case 'number':
        return function(rowValue, rangeExp){
          var compareChar = rangeExp.charAt(0);
          var compareValue;
          var match = false;
          if (rangeExp.length == 1) {
            if (isNaN(parseInt(compareChar))) {
              // User types only '=' or '>' or '<', so don't filter column values
              match = true;
              return match;
            }
            else {
              compareValue = parseFloat(parseFloat(rangeExp).toFixed(2));
            }
          }
          else {
            if (isNaN(parseInt(compareChar))) {
              compareValue = parseFloat(parseFloat(rangeExp.substr(1, rangeExp.length)).toFixed(2));
            }
            else {
              compareValue = parseFloat(parseFloat(rangeExp.substr(0, rangeExp.length)).toFixed(2));
            }
          }
          rowValue = parseFloat((jQuery(rowValue).text()) ? jQuery(rowValue).text() : rowValue);
          match = false;
          switch (compareChar) {
            case '<':
              if (compareValue > rowValue) match = true;
              break;
            case '>':
              if (compareValue < rowValue) match = true;
              break;
            case '=':
              if (compareValue == rowValue) match = true;
              break;
            default:
              if (rangeExp == rowValue) match = true;
          }
          return match;
        };
        break;
      case 'string':
      default:
        return function(origin, compareValue){
          var regex = new RegExp(compareValue,"i");
          return regex.test(origin);
        }
    }
  }
};

});

require.register("views/common/sort_view", function(exports, require, module) {
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

var App = require('config/app');

/**
 * Wrapper View for all sort components. Layout template and common actions are located inside of it.
 * Logic specific for sort fields
 * located in inner view - <code>fieldView</code>.
 *
 * @type {*}
 */
var wrapperView = Em.View.extend({
  tagName: 'tr',

  classNames: ['sort-wrapper'],

  willInsertElement:function () {
    if(this.get('parentView.tableFilteringComplete')){
      this.get('parentView').set('filteringComplete', true);
    }
  },

  /**
   * Load sort statuses from local storage
   * Works only after finish filtering in the parent View
   */
  loadSortStatuses: function() {
    var statuses = App.db.getSortingStatuses(this.get('controller.name'));
    if (!this.get('parentView.filteringComplete')) return;
    if (statuses) {
      var childViews = this.get('childViews');
      var self = this;
      statuses.forEach(function(st) {
        if (st.status != 'sorting') {
          var sortOrder = false;
          if(st.status == 'sorting_desc') {
            sortOrder = true;
          }
          self.sort(childViews.findProperty('name', st.name), sortOrder);
          childViews.findProperty('name', st.name).set('status', (sortOrder)?'sorting_desc':'sorting_asc');
          self.get('controller').set('sortingColumn', childViews.findProperty('name', st.name));
        }
        else {
          childViews.findProperty('name', st.name).set('status', st.status);
        }
      });
    }
    this.get('parentView').showProperPage();
  }.observes('parentView.filteringComplete'),

  /**
   * Save sort statuses to local storage
   * Works only after finish filtering in the parent View
   */
  saveSortStatuses: function() {
    if (!this.get('parentView.filteringComplete')) return;
    var statuses = [];
    this.get('childViews').forEach(function(childView) {
      statuses.push({
        name: childView.get('name'),
        status: childView.get('status')
      });
    });
    App.db.setSortingStatuses(this.get('controller.name'), statuses);
  }.observes('childViews.@each.status'),

  /**
   * sort content by property
   * @param property
   * @param order true - DESC, false - ASC
   */
  sort: function(property, order, returnSorted){
    returnSorted = returnSorted ? true : false;
    var content = this.get('content').toArray();
    var sortFunc = this.getSortFunc(property, order);
    this.resetSort();
    content.sort(sortFunc);
    if(returnSorted){
      return content;
    }else{
      this.set('content', content);
    }
  },

  isSorting: false,

  onContentChange: function () {
    if (!this.get('isSorting') && this.get('content.length')) {
      this.get('childViews').forEach(function (view) {
        if (view.status !== 'sorting') {
          var status = view.get('status');
          this.set('isSorting', true);
          this.sort(view, status == 'sorting_desc');
          this.set('isSorting', false);
          view.set('status', status);
        }
      }, this);
    }
  }.observes('content.length'),

  /**
   * reset all sorts fields
   */
  resetSort: function(){
    this.get('childViews').setEach('status', 'sorting');
  },
  /**
   * determines sort function depending on the type of sort field
   * @param property
   * @param order
   * @return {*}
   */
  getSortFunc: function(property, order){
    var func;
    switch (property.get('type')){
      case 'number':
        func = function (a, b) {
          var a = parseFloat(Em.get(a, property.get('name')));
          var b = parseFloat(Em.get(b, property.get('name')));
          if (order) {
            return b - a;
          } else {
            return a - b;
          }
        };
        break;
      default:
        func = function(a,b){
          if(order){
            if (Em.get(a, property.get('name')) > Em.get(b, property.get('name')))
              return -1;
            if (Em.get(a, property.get('name')) < Em.get(b, property.get('name')))
              return 1;
            return 0;
          } else {
            if (Em.get(a, property.get('name')) < Em.get(b, property.get('name')))
              return -1;
            if (Em.get(a, property.get('name')) > Em.get(b, property.get('name')))
              return 1;
            return 0;
          }
        }
    }
    return func;
  }
});
/**
 * particular view that contain sort field properties:
 * name - name of property in content table
 * type(optional) - specific type to sort
 * displayName - label to display
 * @type {*}
 */
var fieldView = Em.View.extend({
  template:Em.Handlebars.compile('<span {{bind-attr class="view.status :column-name"}}>{{view.displayName}}</span>'),
  classNameBindings: ['viewNameClass'],
  tagName: 'th',
  name: null,
  displayName: null,
  status: 'sorting',
  viewNameClass: function () {
    return 'sort-view-' + this.get('column');
  }.property(),
  type: null,
  column: 0,
  /**
   * callback that run sorting and define order of sorting
   * @param event
   */
  click: function(event){
    if(this.get('status') === 'sorting_desc'){
      this.get('parentView').sort(this, false);
      this.set('status', 'sorting_asc');
    }
    else {
      this.get('parentView').sort(this, true);
      this.set('status', 'sorting_desc');
    }
    this.get('controller').set('sortingColumn', this);
  }
});

/**
 * Result object, which will be accessible outside
 * @type {Object}
 */
module.exports = {
  wrapperView: wrapperView,
  fieldView: fieldView
};
});

require.register("views/common/table_view", function(exports, require, module) {
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

var App = require('config/app');
var filters = require('views/common/filter_view');
var sort = require('views/common/sort_view');

App.TableView = Em.View.extend({

  /**
   * Defines to show pagination or show all records
   * @type {Boolean}
   */
  pagination: true,

  /**
   * Shows if all data is loaded and filtered
   * @type {Boolean}
   */
  filteringComplete: false,

  /**
   * intermediary for filteringComplete
   * @type {Boolean}
   */
  tableFilteringComplete: false,

  /**
   * Loaded from local storage startIndex value
   * @type {Number}
   */
  startIndexOnLoad: null,

  /**
   * Loaded from server persist value
   * @type {Number}
   */
  displayLengthOnLoad: null,

  /**
   * The number of rows to show on every page
   * The value should be a number converted into string type in order to support select element API
   * Example: "10", "25"
   * @type {String}
   */
  displayLength: null,

  /**
   * default value of display length
   * The value should be a number converted into string type in order to support select element API
   * Example: "10", "25"
   */
  defaultDisplayLength: "10",

  /**
   * Persist-key of current table displayLength property
   * @param {String} loginName current user login name
   * @returns {String}
   */
  displayLengthKey: function (loginName) {
    if (App.get('testMode')) {
      return 'pagination_displayLength';
    }
    loginName = loginName ? loginName : App.router.get('loginName');
    return this.get('controller.name') + '-pagination-displayLength-' + loginName;
  },

  /**
   * Set received from server value to <code>displayLengthOnLoad</code>
   * @param {Number} response
   * @param {Object} request
   * @param {Object} data
   * @returns {*}
   */
  getUserPrefSuccessCallback: function (response, request, data) {
    console.log('Got DisplayLength value from server with key ' + data.key + '. Value is: ' + response);
    this.set('displayLengthOnLoad', response);
    return response;
  },

  /**
   * Set default value to <code>displayLengthOnLoad</code> (and send it on server) if value wasn't found on server
   * @returns {Number}
   */
  getUserPrefErrorCallback: function () {
    // this user is first time login
    console.log('Persist did NOT find the key');
    var displayLengthDefault = this.get('defaultDisplayLength');
    this.set('displayLengthOnLoad', displayLengthDefault);
    if (App.get('isAdmin')) {
      this.postUserPref(this.displayLengthKey(), displayLengthDefault);
    }
    return displayLengthDefault;
  },

  /**
   * Do pagination after filtering and sorting
   * Don't call this method! It's already used where it's need
   */
  showProperPage: function() {
    var self = this;
    Em.run.next(function() {
      Em.run.next(function() {
        if(self.get('startIndexOnLoad')) {
          self.set('startIndex', self.get('startIndexOnLoad'));
        }
      });
    });
  },

  /**
   * Return pagination information displayed on the page
   * @type {String}
   */
  paginationInfo: function () {
    return Em.I18n.t('tableView.filters.paginationInfo').format(this.get('startIndex'), this.get('endIndex'), this.get('filteredContent.length'));
  }.property('displayLength', 'filteredContent.length', 'startIndex', 'endIndex'),

  paginationLeft: Ember.View.extend({
    tagName: 'a',
    template: Ember.Handlebars.compile('<i class="icon-arrow-left"></i>'),
    classNameBindings: ['class'],
    class: function () {
      if (this.get("parentView.startIndex") > 1) {
        return "paginate_previous";
      }
      return "paginate_disabled_previous";
    }.property("parentView.startIndex", 'filteredContent.length'),

    click: function () {
      if (this.get('class') === "paginate_previous") {
        this.get('parentView').previousPage();
      }
    }
  }),

  paginationRight: Ember.View.extend({
    tagName: 'a',
    template: Ember.Handlebars.compile('<i class="icon-arrow-right"></i>'),
    classNameBindings: ['class'],
    class: function () {
      if ((this.get("parentView.endIndex")) < this.get("parentView.filteredContent.length")) {
        return "paginate_next";
      }
      return "paginate_disabled_next";
    }.property("parentView.endIndex", 'filteredContent.length'),

    click: function () {
      if (this.get('class') === "paginate_next") {
        this.get('parentView').nextPage();
      }
    }
  }),

  paginationFirst: Ember.View.extend({
    tagName: 'a',
    template: Ember.Handlebars.compile('<i class="icon-step-backward"></i>'),
    classNameBindings: ['class'],
    class: function () {
      if ((this.get("parentView.endIndex")) > parseInt(this.get("parentView.displayLength"))) {
        return "paginate_previous";
      }
      return "paginate_disabled_previous";
    }.property("parentView.endIndex", 'filteredContent.length'),

    click: function () {
      if (this.get('class') === "paginate_previous") {
        this.get('parentView').firstPage();
      }
    }
  }),

  paginationLast: Ember.View.extend({
    tagName: 'a',
    template: Ember.Handlebars.compile('<i class="icon-step-forward"></i>'),
    classNameBindings: ['class'],
    class: function () {
      if (this.get("parentView.endIndex") !== this.get("parentView.filteredContent.length")) {
        return "paginate_next";
      }
      return "paginate_disabled_next";
    }.property("parentView.endIndex", 'filteredContent.length'),

    click: function () {
      if (this.get('class') === "paginate_next") {
        this.get('parentView').lastPage();
      }
    }
  }),

  /**
   * Select View with list of "rows-per-page" options
   * @type {Ember.View}
   */
  rowsPerPageSelectView: Em.Select.extend({
    content: ['10', '25', '50', '100'],
    change: function () {
      this.get('parentView').saveDisplayLength();
    }
  }),

  saveDisplayLength: function() {
    var self = this;
    Em.run.next(function() {
      if (!App.testMode) {
        if (App.get('isAdmin')) {
          self.postUserPref(self.displayLengthKey(), self.get('displayLength'));
        }
      }
    });
  },
  /**
   * Start index for displayed content on the page
   */
  startIndex: 1,

  /**
   * Calculate end index for displayed content on the page
   */
  endIndex: function () {
    if (this.get('pagination')) {
      return Math.min(this.get('filteredContent.length'), this.get('startIndex') + parseInt(this.get('displayLength')) - 1);
    } else {
      return this.get('filteredContent.length')
    }
  }.property('startIndex', 'displayLength', 'filteredContent.length'),

  /**
   * Onclick handler for previous page button on the page
   */
  previousPage: function () {
    var result = this.get('startIndex') - parseInt(this.get('displayLength'));
    this.set('startIndex', (result < 2) ? 1 : result);
  },

  /**
   * Onclick handler for next page button on the page
   */
  nextPage: function () {
    var result = this.get('startIndex') + parseInt(this.get('displayLength'));
    if (result - 1 < this.get('filteredContent.length')) {
      this.set('startIndex', result);
    }
  },
  /**
   * Onclick handler for first page button on the page
   */
  firstPage: function () {
    this.set('startIndex', 1);
  },
  /**
   * Onclick handler for last page button on the page
   */
  lastPage: function () {
    var pagesCount = this.get('filteredContent.length') / parseInt(this.get('displayLength'));
    var startIndex = (this.get('filteredContent.length') % parseInt(this.get('displayLength')) === 0) ?
      (pagesCount - 1) * parseInt(this.get('displayLength')) :
      Math.floor(pagesCount) * parseInt(this.get('displayLength'));
    this.set('startIndex', ++startIndex);
  },

  /**
   * Calculates default value for startIndex property after applying filter or changing displayLength
   */
  updatePaging: function (controller, property) {
    var displayLength = this.get('displayLength');
    var filteredContentLength = this.get('filteredContent.length');
    if (property == 'displayLength') {
      this.set('startIndex', Math.min(1, filteredContentLength));
    } else if (!filteredContentLength) {
      this.set('startIndex', 0);
    } else if (this.get('startIndex') > filteredContentLength) {
      this.set('startIndex', Math.floor((filteredContentLength - 1) / displayLength) * displayLength + 1);
    } else if (!this.get('startIndex')) {
      this.set('startIndex', 1);
    }
  }.observes('displayLength', 'filteredContent.length'),

  /**
   * Apply each filter to each row
   *
   * @param {Number} iColumn number of column by which filter
   * @param {Object} value
   * @param {String} type
   * @param {String} defaultValue
   */
  updateFilter: function (iColumn, value, type, defaultValue) {
    var filterCondition = this.get('filterConditions').findProperty('iColumn', iColumn);
    defaultValue = defaultValue ? defaultValue : "";
    if (filterCondition) {
      filterCondition.value = value;
    }
    else {
      filterCondition = {
        iColumn: iColumn,
        value: value,
        type: type,
        defaultValue: defaultValue
      };
      this.get('filterConditions').push(filterCondition);
    }
    this.filtersUsedCalc();
    this.filter();
  },


  /**
   * Contain filter conditions for each column
   * @type {Array}
   */
  filterConditions: [],

  /**
   * Contains content after implementing filters
   * @type {Array}
   */
  filteredContent: [],

  /**
   * Determine if <code>filteredContent</code> is empty or not
   * @type {Boolean}
   */
  hasFilteredItems: function() {
    return !!this.get('filteredContent.length');
  }.property('filteredContent.length'),

  /**
   * Contains content to show on the current page of data page view
   * @type {Array}
   */
  pageContent: function () {
    return this.get('filteredContent').slice(this.get('startIndex') - 1, this.get('endIndex'));
  }.property('filteredContent.length', 'startIndex', 'endIndex'),

  /**
   * Filter table by filterConditions
   */
  filter: function () {
    var content = this.get('content');
    var filterConditions = this.get('filterConditions').filterProperty('value');
    var result;
    var assoc = this.get('colPropAssoc');
    if (filterConditions.length) {
      result = content.filter(function (item) {
        var match = true;
        filterConditions.forEach(function (condition) {
          var filterFunc = filters.getFilterByType(condition.type, false);
          if (match && condition.value != condition.defaultValue) {
            match = filterFunc(Em.get(item, assoc[condition.iColumn]), condition.value);
          }
        });
        return match;
      });
      this.set('filteredContent', result);
    } else {
      this.set('filteredContent', content.toArray());
    }
  }.observes('content.length'),

  /**
   * Does any filter is used on the page
   * @type {Boolean}
   */
  filtersUsed: false,

  /**
   * Determine if some filters are used on the page
   * Set <code>filtersUsed</code> value
   */
  filtersUsedCalc: function() {
    var filterConditions = this.get('filterConditions');
    if (!filterConditions.length) {
      this.set('filtersUsed', false);
      return;
    }
    var filtersUsed = false;
    filterConditions.forEach(function(filterCondition) {
      if (filterCondition.value.toString() !== '' && filterCondition.value.toString() !== filterCondition.defaultValue.toString()) {
        filtersUsed = true;
      }
    });
    this.set('filtersUsed', filtersUsed);
  },

  /**
   * Run <code>clearFilter</code> in the each child filterView
   */
  clearAllFilters: function() {
    this.set('filterConditions', []);
    this.get('_childViews').forEach(function(childView) {
      if (childView['clearFilter']) {
        childView.clearFilter();
      }
    });
  },

  actions: {
    clearFilters: function() {
      return this.clearAllFilters();
    }
  }

});

});

require.register("views/createAppWizard/step1_view", function(exports, require, module) {
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

App.CreateAppWizardStep1View = Ember.View.extend({

  radioButton: Ember.TextField.extend({

    tagName: "input",

    type: "radio",

    attributeBindings: ["name", "type", "value", "checked:checked:"],

    click: function () {
      this.set("selection", this.get('value'));
    },

    checked: function () {
      return this.get("value") == this.get("selection");
    }.property()

  }),

  /**
   * Enable "Special-label" text-field only when "spec-label"-radio is checked
   * @type {bool}
   */
  specLabelEnabled: Ember.computed.lt('controller.newApp.selectedYarnLabel', '2'),

  noAppsAvailableSelect: [Em.I18n.t('slider.apps.no.applications.available')]

});

});

require.register("views/createAppWizard/step2_view", function(exports, require, module) {
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

App.CreateAppWizardStep2View = Ember.View.extend({

  /**
   * Message shown in the checkbox popover
   * @type {string}
   */
  checkBoxPopover: Em.I18n.t('wizard.step2.table.popoverCheckbox'),

  /**
   * Message shown in the label-input popover
   * @type {string}
   */
  yarnLabelPopover: Em.I18n.t('wizard.step2.table.popoverLabel')

});

});

require.register("views/createAppWizard/step3_view", function(exports, require, module) {
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

App.CreateAppWizardStep3View = Ember.View.extend(App.WithPanels, {

  didInsertElement: function () {
    this.get('controller').loadStep();
    this.addCarets();
  }
});

});

require.register("views/createAppWizard/step4_view", function(exports, require, module) {
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

App.CreateAppWizardStep4View = Ember.View.extend({

  didInsertElement: function () {
    this.get('controller').loadStep();
  }
});

});

require.register("views/create_app_wizard_view", function(exports, require, module) {
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

App.CreateAppWizardView = Ember.View.extend({

  classNames: ['create-app-wizard-wrapper'],

  didInsertElement: function(){
    this.setHeight();
    $(window).resize(this.setHeight);
    this.get('controller').loadStep();
  },

  isStep1: function () {
    return this.get('controller.currentStep') == 1;
  }.property('controller.currentStep'),

  isStep2: function () {
    return this.get('controller.currentStep') == 2;
  }.property('controller.currentStep'),

  isStep3: function () {
    return this.get('controller.currentStep') == 3;
  }.property('controller.currentStep'),

  isStep4: function () {
    return this.get('controller.currentStep') == 4;
  }.property('controller.currentStep'),

  isStep1Disabled: function () {
    return this.get('controller.currentStep') < 1;
  }.property('controller.currentStep'),

  isStep2Disabled: function () {
    return this.get('controller.currentStep') < 2;
  }.property('controller.currentStep'),

  isStep3Disabled: function () {
    return this.get('controller.currentStep') < 3;
  }.property('controller.currentStep'),

  isStep4Disabled: function () {
    return this.get('controller.currentStep') < 4;
  }.property('controller.currentStep'),

  actions: {
    hide: function () {
      this.hidePopup();
    },
    finish: function () {
      this.hidePopup();
    }
  },

  hidePopup: function () {
    $(this.get('element')).find('.modal').hide();
    this.get('controller').transitionToRoute('slider_apps');
  },

  setHeight: function () {
    var height = $(window).height() * 0.8;
    $('.slider-modal-body').css('max-height', height + 'px');
    $('#createAppWizard').css('margin-top', -(height / 2) + 'px');
  }
});

});

require.register("views/slider_app/configs_view", function(exports, require, module) {
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

App.SliderAppConfigsView = Ember.View.extend(App.WithPanels, {

  /**
   * List of configs group by categories
   * @type {Object[]}
   */
  configsByCategories: Em.A([]),

  /**
   * Observer for model's configs
   * Updates <code>configsByCategories</code>
   * @method configsObserver
   */
  configsObserver: function() {
    var model = this.get('controller.content'),
      configs = model.get('.configs'),
      configsByCategories = this.get('configsByCategories'),
      hiddenCategories = model.get('hiddenCategories');
    Em.keys(configs).forEach(function (site) {
      if (configsByCategories.mapBy('name').contains(site)) {
        var c = configsByCategories.findBy('name', site);
        c.set('configs', model.mapObject(configs[site]));
        c.set('isVisible', !hiddenCategories.contains(site));
      }
      else {
        configsByCategories.pushObject(Em.Object.create({
          name: site,
          configs: model.mapObject(configs[site]),
          isVisible: !hiddenCategories.contains(site)
        }));
      }
    });
  }.observes('controller.content.configs.@each'),

  didInsertElement: function() {
    this.addCarets();
  }

});

});

require.register("views/slider_app/destroy_modal_footer_view", function(exports, require, module) {
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

App.DestroyAppPopupFooterView = Ember.View.extend({

  /**
   * targetObject should be defined for buttons and other components that may set actions
   * @type {Em.Controller}
   */
  targetObjectBinding: 'controller',

  templateName: 'slider_app/destroy/destroy_popup_footer',

  /**
   * Destroy-button
   * @type {Em.Object}
   */
  destroyButton: Em.Object.create({title: Em.I18n.t('common.destroy'), clicked: "modalConfirmed", type:'success'}),

  /**
   * Cancel-button
   * @type {Em.Object}
   */
  cancelButton: Em.Object.create({title: Em.I18n.t('common.cancel'), clicked: "modalCanceled"})

});
});

require.register("views/slider_app/destroy_popup_view", function(exports, require, module) {
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

App.DestroyAppPopupView = Ember.View.extend({

  templateName: 'slider_app/destroy/destroy_popup',

  /**
   * targetObject should be defined for buttons and other components that may set actions
   * @type {Em.Controller}
   */
  targetObjectBinding: 'controller',

  /**
   * Warning message for dummy user
   * @type {string}
   */
  confirmMessage: function() {
    return Em.I18n.t('sliderApp.destroy.confirm.body2').format(this.get('controller.model.name'));
  }.property()

});
});

require.register("views/slider_app/metrics/app_metric_view", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @class
 *
 * This is a view for showing cluster CPU metrics
 *
 * @extends App.ChartView
 * @extends Ember.Object
 * @extends Ember.View
 */
App.AppMetricView = App.ChartView.extend(App.RunPeriodically, {

  app: null,

  metricName: null,

  id: function () {
    return 'graph_' + this.get('app.id') + this.get('metricName');
  }.property('app.id', 'metricName'),

  title: function () {
    return this.get('metricName').humanize();
  }.property('metricName'),

  yAxisFormatter: App.ChartView.DefaultFormatter,

  renderer: 'line',

  ajaxIndex: 'metrics',

  getDataForAjaxRequest: function () {
    return {
      id: this.get('app.id'),
      metric: this.get('metricName')
    };
  },

  transformToSeries: function (jsonData) {
    var self = this,
      seriesArray = [],
      metricName = this.get('metricName'),
      metrics = Ember.get(jsonData, 'metrics');
    if (!Ember.isNone(metrics)) {
      Ember.keys(metrics).forEach(function () {
        var seriesData = metrics[metricName];
        if (seriesData) {
          var s = self.transformData(seriesData, metricName);
          seriesArray.push(s);
        }
      });
    }
    this.get('parentView.graphs').findBy('metricName', metricName).set('dataExists', !!seriesArray.length);
    return seriesArray;
  },

  loadDataErrorCallback: function() {
    this.set('isReady', true);
    this.get('parentView.graphs').findBy('metricName', this.get('metricName')).set('dataExists', false);
  }

});
});

require.register("views/slider_app/metrics/metric2_view", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @class
 *
 * This is a view for showing cluster CPU metrics
 *
 * @extends App.ChartView
 * @extends Ember.Object
 * @extends Ember.View
 */
App.Metric2View = App.ChartView.extend({
  id: "service-metrics-hdfs-jvm-threads",
  title: 'jvm Threads',
  renderer: 'line',

  ajaxIndex: 'metrics2',

  transformToSeries: function (jsonData) {
    var seriesArray = [];
    if (jsonData && jsonData.metrics && jsonData.metrics.jvm) {
      for ( var name in jsonData.metrics.jvm) {
        var displayName;
        var seriesData = jsonData.metrics.jvm[name];
        switch (name) {
          case "threadsBlocked":
            displayName = 'Threads Blocked';
            break;
          case "threadsWaiting":
            displayName = 'Threads Waiting';
            break;
          case "threadsTimedWaiting":
            displayName = 'Threads Timed Waiting';
            break;
          case "threadsRunnable":
            displayName = 'Threads Runnable';
            break;
          default:
            break;
        }
        if (seriesData) {
          seriesArray.push(this.transformData(seriesData, displayName));
        }
      }
    }
    return seriesArray;
  }
});
});

require.register("views/slider_app/metrics/metric3_view", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @class
 *
 * This is a view for showing cluster CPU metrics
 *
 * @extends App.ChartView
 * @extends Ember.Object
 * @extends Ember.View
 */
App.Metric3View = App.ChartView.extend({
  id: "service-metrics-hdfs-file-operations",
  title: 'File Operations',
  renderer: 'line',

  ajaxIndex: 'metrics3',
  yAxisFormatter: App.ChartView.CreateRateFormatter('ops', App.ChartView.DefaultFormatter),

  transformToSeries: function (jsonData) {
    var seriesArray = [];
    if (jsonData && jsonData.metrics && jsonData.metrics.dfs && jsonData.metrics.dfs.namenode) {
      for ( var name in jsonData.metrics.dfs.namenode) {
        var displayName;
        var seriesData = jsonData.metrics.dfs.namenode[name];
        switch (name) {
          case "FileInfoOps":
            displayName = 'File Info Ops';
            break;
          case "DeleteFileOps":
            displayName = 'Delete File Ops';
            break;
          case "CreateFileOps":
            displayName = 'Create File Ops';
            break;
          default:
            break;
        }
        if (seriesData) {
          seriesArray.push(this.transformData(seriesData, displayName));
        }
      }
    }
    return seriesArray;
  }
});
});

require.register("views/slider_app/metrics/metric4_view", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @class
 *
 * This is a view for showing cluster CPU metrics
 *
 * @extends App.ChartView
 * @extends Ember.Object
 * @extends Ember.View
 */
App.Metric4View = App.ChartView.extend({
  id: "service-metrics-hdfs-rpc",
  title: 'RPC',
  yAxisFormatter: App.ChartView.TimeElapsedFormatter,

  ajaxIndex: 'metrics4',

  transformToSeries: function (jsonData) {
    var seriesArray = [];
    if (jsonData && jsonData.metrics && jsonData.metrics.rpc) {
      for ( var name in jsonData.metrics.rpc) {
        var displayName;
        var seriesData = jsonData.metrics.rpc[name];
        switch (name) {
          case "RpcQueueTime_avg_time":
            displayName = 'RPC Queue Time Avg Time';
            break;
          default:
            break;
        }
        if (seriesData) {
          seriesArray.push(this.transformData(seriesData, displayName));
        }
      }
    }
    return seriesArray;
  }
});
});

require.register("views/slider_app/metrics/metric_view", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @class
 *
 * This is a view for showing cluster CPU metrics
 *
 * @extends App.ChartView
 * @extends Ember.Object
 * @extends Ember.View
 */
App.MetricView = App.ChartView.extend({

  id: "service-metrics-hdfs-space-utilization",

  title: 'Space Utilization',

  yAxisFormatter: App.ChartView.BytesFormatter,

  renderer: 'line',

  ajaxIndex: 'metrics',

  transformToSeries: function (jsonData) {
    var seriesArray = [];
    var GB = Math.pow(2, 30);
    if (jsonData && jsonData.metrics && jsonData.metrics.dfs && jsonData.metrics.dfs.FSNamesystem) {
      for ( var name in jsonData.metrics.dfs.FSNamesystem) {
        var displayName;
        var seriesData = jsonData.metrics.dfs.FSNamesystem[name];
        switch (name) {
          case "CapacityRemainingGB":
            displayName = 'Capacity Remaining GB';
            break;
          case "CapacityUsedGB":
            displayName = 'Capacity Used GB';
            break;
          case "CapacityTotalGB":
            displayName = 'Capacity Total GB';
            break;
          default:
            break;
        }
        if (seriesData) {
          var s = this.transformData(seriesData, displayName);
          for (var i = 0; i < s.data.length; i++) {
            s.data[i].y *= GB;
          }
          seriesArray.push(s);
        }
      }
    }
    return seriesArray;
  }
});
});

require.register("views/slider_app/summary_view", function(exports, require, module) {
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

App.SliderAppSummaryView = Ember.View.extend({

  classNames: ['app_summary'],

  /**
   * List of graphs shown on page
   * Format:
   * <code>
   *   [
   *      {
   *        id: string,
   *        dataExists: bool,
   *        metricName: string,
   *        view: App.AppMetricView
   *      },
   *      {
   *        id: string,
   *        dataExists: bool,
   *        metricName: string,
   *        view: App.AppMetricView
   *      },
   *      ....
   *   ]
   * </code>
   * @type {{object}[]}
   */
  graphs: [],

  /**
   * Determine if at least one graph contains some data to show
   * @type {bool}
   */
  graphsNotEmpty: function () {
    return this.get('graphs').isAny('dataExists', true);
  }.property('graphs.@each.dataExists'),

  /**
   * Update <code>graphs</code>-list when <code>model</code> is updated
   * New metrics are pushed to <code>graphs</code> (not set new list to <code>graphs</code>!) to prevent page flickering
   * @method updateGraphs
   */
  updateGraphs: function () {
    var model = this.get('controller.model'),
      existingGraphs = this.get('graphs'),
      graphsBeenChanged = false;

    if (model) {
      var currentGraphIds = [],
        supportedMetrics = model.get('supportedMetricNames');
      if (supportedMetrics) {
        var appId = model.get('id');
        supportedMetrics.split(',').forEach(function (metricName) {
          var graphId = metricName + '_' + appId;
          currentGraphIds.push(graphId);
          if (!existingGraphs.isAny('id', graphId)) {
            graphsBeenChanged = true;
            var view = App.AppMetricView.extend({
              app: model,
              metricName: metricName
            });
            existingGraphs.push(Em.Object.create({
              id: graphId,
              view: view,
              dataExists: false,
              metricName: metricName
            }));
          }
        });
      }
      // Delete not existed graphs
      existingGraphs = existingGraphs.filter(function (existingGraph) {
        graphsBeenChanged = graphsBeenChanged || !currentGraphIds.contains(existingGraph.get('id'));
        return currentGraphIds.contains(existingGraph.get('id'));
      });
      if (graphsBeenChanged) {
        this.set('graphs', existingGraphs);
      }
    }
  }.observes('controller.model.supportedMetricNames'),

  didInsertElement: function () {
    var self = this;
    Em.run.next(function () {
      self.fitPanels();
    });
  },

  /**
   * Set equal height to left (summary) and right (alerts and components) columns basing on higher value
   * @method fitPanels
   */
  fitPanels: function () {
    var panelSummary = this.$('.panel-summary'),
      panelSummaryBody = panelSummary.find('.panel-body'),
      columnRight = this.$('.column-right'),
      panelAlerts = columnRight.find('.panel-alerts'),
      panelComponentsBody = columnRight.find('.panel-components .panel-body'),
      wrapperHeightDiff = columnRight.find('.panel-components').height() - panelComponentsBody.height();
    if (panelSummary.height() < panelSummaryBody.height()) {
      panelSummary.height(panelSummaryBody.height());
    }
    var marginAndBorderHeight = parseInt(panelAlerts.css('margin-bottom')) + 3;
    if (panelSummary.height() > columnRight.height()) {
      panelComponentsBody.height(panelSummary.height() - panelAlerts.height() - marginAndBorderHeight - wrapperHeightDiff);
    }
    else {
      panelSummary.height(columnRight.height() - marginAndBorderHeight);
    }
  },

  AlertView: Em.View.extend({
    content: null,
    tagName: 'li',
    tooltip: function () {
      return Ember.Object.create({
        trigger: 'hover',
        content: this.get('content.timeSinceAlertDetails'),
        placement: "bottom"
      });
    }.property('content')
  })

});

});

require.register("views/slider_app_view", function(exports, require, module) {
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

App.SliderAppView = Ember.View.extend({

  didInsertElement: function() {
    // Breadcrumbs should be on the one line with Slider Title
    // but title and breadcrumbs are in different templates
    $('.apps-breadcrumbs').css({
      'margin-top': -28,
      'margin-left': $('.slider-app-title').width() + 10
    });
  }

});

});

require.register("views/slider_apps_view", function(exports, require, module) {
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
var filters = require('views/common/filter_view');
var sort = require('views/common/sort_view');

App.SliderAppsView = App.TableView.extend({

  statusList: [
    "All Status",
    App.SliderApp.Status.accepted,
    App.SliderApp.Status.failed,
    App.SliderApp.Status.finished,
    App.SliderApp.Status.killed,
    App.SliderApp.Status.new,
    App.SliderApp.Status.new_saving,
    App.SliderApp.Status.running,
    App.SliderApp.Status.submitted,
    App.SliderApp.Status.stopped,
  ],

  content: function () {
    return this.get('controller.model');
  }.property('controller.model.length'),

  didInsertElement: function () {
    this.set('filteredContent',this.get('content'));
  },

  filteredContentInfo: function () {
    return Em.I18n.t('sliderApps.filters.info').format(this.get('filteredContent.length'), this.get('content.length'));
  }.property('content.length', 'filteredContent.length'),

  sortView: sort.wrapperView,
  nameSort: sort.fieldView.extend({
    column: 0,
    name:'name',
    displayName: "Name"
  }),

  statusSort: sort.fieldView.extend({
    column: 1,
    name:'status',
    displayName: "Status"
  }),

  typeSort: sort.fieldView.extend({
    column: 2,
    name:'appType',
    displayName: "Type"
  }),

  userSort: sort.fieldView.extend({
    column: 3,
    name:'user',
    displayName: "User"
  }),

  startSort: sort.fieldView.extend({
    column: 4,
    name:'started',
    displayName: "Start Time",
    type: "number"
  }),

  endSort: sort.fieldView.extend({
    column: 5,
    name:'ended',
    displayName: "End Time",
    type: "number"
  }),

  SliderView: Em.View.extend({
    content: null,
    tagName: 'tr',
    popover: function(){
      var template = this.createChildView(App.SliderTooltip, {
        content: this.get('content')
      });
      return Ember.Object.create({
        trigger: 'hover',
        title: this.get('content.data.name'),
        template: template.renderToBuffer().string(),
        placement: "right"
      });
    }.property('content')
  }),

  /**
   * Filter view for name column
   * Based on <code>filters</code> library
   */
  nameFilterView: filters.createTextView({
    column: 0,
    fieldType: 'filter-input-width',
    onChangeValue: function(){
      this.get('parentView').updateFilter(this.get('column'), this.get('value'), 'string');
    }
  }),

  statusFilterView: filters.createSelectView({
    column: 1,
    defaultValue: "All Status",
    fieldType: 'filter-input-width',
    content: function() {
      return this.get('parentView.statusList');
    }.property('parentView.statusList'),
    onChangeValue: function(){
      this.get('parentView').updateFilter(this.get('column'), this.get('value') == "STOPPED" ? "FROZEN" : this.get('value'), 'string', this.get('defaultValue'));
    },
    emptyValue: 'All Status'
  }),

  typeFilterView: filters.createTextView({
    column: 2,
    fieldType: 'filter-input-width',
    onChangeValue: function(){
      this.get('parentView').updateFilter(this.get('column'), this.get('value'), 'string');
    }
  }),

  userFilterView: filters.createTextView({
    column: 3,
    fieldType: 'filter-input-width',
    onChangeValue: function(){
      this.get('parentView').updateFilter(this.get('column'), this.get('value'), 'string');
    }
  }),

  startFilterView: filters.createSelectView({
    column: 4,
    defaultValue: "All Dates",
    fieldType: 'filter-input-width',
    content: ['All Dates', 'Past 1 hour',  'Past 1 Day', 'Past 2 Days', 'Past 7 Days', 'Past 14 Days', 'Past 30 Days'],
    onChangeValue: function(){
      this.get('parentView').updateFilter(this.get('column'), this.get('value'), 'date', this.get('defaultValue'));
    },
    type: 'number',
    emptyValue: 'All Dates'
  }),

  /**
   * associations between host property and column index
   * @type {Array}
   */
  colPropAssoc: function(){
    var associations = [];
    associations[0] = 'name';
    associations[1] = 'status';
    associations[2] = 'appType';
    associations[3] = 'user';
    associations[4] = 'started';
    associations[5] = 'ended';
    return associations;
  }.property()

});

App.SliderTooltip = Em.View.extend({
  templateName: "common/app_tooltip"
});

});

require.register("envs/development/env", function(exports, require, module) {
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

'use strict';

module.exports = 'development';

});


//# sourceMappingURL=app.js.map