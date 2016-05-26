/* jshint ignore:start */

/* jshint ignore:end */

define('hive/adapters/application', ['exports', 'ember-data', 'hive/utils/constants'], function (exports, DS, constants) {

  'use strict';

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

  exports['default'] = DS['default'].RESTAdapter.extend({
    headers: {
      'X-Requested-By': 'ambari',
      'Content-Type': 'application/json'
      //,'Authorization': 'Basic YWRtaW46YWRtaW4='
    },

    buildURL: function () {
      var version = constants['default'].adapter.version,
          instanceName = constants['default'].adapter.instance;

      var params = window.location.pathname.split('/').filter(function (param) {
        return !!param;
      });

      if (params[params.length - 3] === 'HIVE') {
        version = params[params.length - 2];
        instanceName = params[params.length - 1];
      }

      var prefix = constants['default'].adapter.apiPrefix + version + constants['default'].adapter.instancePrefix + instanceName;
      var url = this._super.apply(this, arguments);
      return prefix + url;
    }
  });

});
define('hive/adapters/database', ['exports', 'hive/adapters/application'], function (exports, application) {

  'use strict';

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

  exports['default'] = application['default'].extend({
    pathForType: function (type) {
      return 'resources/ddl/' + type;
    }
  });

});
define('hive/adapters/file-upload', ['exports', 'ember-uploader', 'ember'], function (exports, EmberUploader, Ember) {

  'use strict';

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

  exports['default'] = EmberUploader['default'].Uploader.extend({
    headers: {},

    // Override
    _ajax: function(settings) {
      settings = Ember['default'].merge(settings, this.getProperties('headers'));
      console.log("_ajax : settings: " + JSON.stringify(settings));
      return this._super(settings);
    }
  });

});
define('hive/adapters/file', ['exports', 'hive/adapters/application', 'hive/utils/constants'], function (exports, application, constants) {

  'use strict';

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

  exports['default'] = application['default'].extend({
    pathForType: function (type) {
      return constants['default'].adapter.resourcePrefix + type;
    }
  });

});
define('hive/adapters/upload-table', ['exports', 'ember-uploader', 'ember', 'hive/adapters/application', 'hive/adapters/file-upload'], function (exports, EmberUploader, Ember, application, FileUploader) {

  'use strict';

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

  exports['default'] = application['default'].extend({
    hdrs : function(){
      console.log("inside hdrs : headers : ",this.get('headers'));
      var h = Ember['default'].$.extend(true, {},this.get('headers'));
      delete h['Content-Type'];
      return h;
    }.property('headers'),

    buildUploadURL: function (path) {
      return this.buildURL() + "/resources/upload/" + path;
    },

    uploadFiles: function (path, files, extras) {
      var uploadUrl = this.buildUploadURL(path);

      console.log("uplaoder : uploadURL : ", uploadUrl);
      console.log("uploader : extras : ", extras);
      console.log("uploader : files : ", files);

      console.log("hdrs : ", this.get('hdrs'));
      var uploader = FileUploader['default'].create({
        headers: this.get('hdrs'),
        url: uploadUrl
      });

      if (!Ember['default'].isEmpty(files)) {
        var promise = uploader.upload(files[0], extras);
        return promise;
      }
    },

    createTable: function (tableData) {
      var _this = this;
      var postHeader = JSON.parse(JSON.stringify(this.get('headers')));
      console.log("headers postHeadesfsfdfsfsfss : : " , postHeader);
      return Ember['default'].$.ajax(      {
          url :  this.buildUploadURL("createTable"),
          type : 'post',
          data: JSON.stringify(tableData),
          headers: this.get('headers'),
          dataType : 'json'
        }
      );
    },

    getCreateTableResult : function(jobId){
      return Ember['default'].$.ajax(this.buildUploadURL("createTable/status"),{
        data : {"jobId":jobId},
        type: "get",
        headers: this.get('headers')
      });
    }
  });

});
define('hive/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'hive/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

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

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  var App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('hive/components/alert-message-widget', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend({
    actions: {
      remove: function () {
        this.sendAction('removeMessage', this.get('message'));
      },

      toggleMessage: function () {
        this.toggleProperty('message.isExpanded');

        if (!this.get('message.isExpanded')) {
          this.sendAction('removeLater', this.get('message'));
        }
      }
    }
  });

});
define('hive/components/collapsible-widget', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'collapsible',

    actions: {
      toggle: function () {
        this.toggleProperty('isExpanded');

        if (this.get('isExpanded')) {
          this.sendAction('expanded', this.get('heading'), this.get('toggledParam'));
        }
      },

      sendControlAction: function (action) {
        this.set('controlAction', action);
        this.sendAction('controlAction', this.get('heading'), this.get('toggledParam'));
      }
    }
  });

});
define('hive/components/column-filter-widget', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'column-filter',

    didInsertElement: function () {
      if (this.get('filterValue')) {
        this.send('sendFilter');
      }
    },

    isSorted: (function () {
      var sortProperties = this.get('sortProperties');

      if (sortProperties) {
        return sortProperties[0] === this.get('column.property');
      } else {
        return false;
      }
    }).property('sortProperties'),

    actions: {
      sendSort: function () {
        this.sendAction('columnSorted', this.get('column.property'));
      },

      sendFilter: function (params) {
        if (params && (params.from || params.from === 0) && (params.to || params.to === 0)) {
          this.set('filterValue', Ember['default'].Object.create({
            min: params.from,
            max: params.to
          }));
        }

        this.sendAction('columnFiltered', this.get('column.property'), this.get('filterValue'));
      }
    }
  });

});
define('hive/components/date-range-widget', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

   /* globals moment */

  exports['default'] = Ember['default'].Component.extend({
    displayFromDate: function () {
      return moment(this.get('dateRange.from')).format('MM/DD/YYYY');
    }.property('dateRange.from'),

    displayToDate: function () {
      return moment(this.get('dateRange.to')).format('MM/DD/YYYY');
    }.property('dateRange.to'),

    updateMinDate: function () {
      if (this.get('rendered')) {
        this.$('.toDate').datepicker("option", "minDate", new Date(this.get('dateRange.from')));
      }
    }.observes('dateRange.from'),

    updateMaxDate: function () {
      if (this.get('rendered')) {
        this.$('.fromDate').datepicker("option", "maxDate", new Date(this.get('dateRange.to')));
      }
    }.observes('dateRange.to'),

    didInsertElement: function () {
      var self = this;
      var dateRange = this.get('dateRange');

      if (!dateRange.get('min') && !dateRange.get('max')) {
        dateRange.set('max', new Date());
      }

      if (!dateRange.get('from') && !dateRange.get('to')) {
        dateRange.set('from', dateRange.get('min'));
        dateRange.set('to', dateRange.get('max'));
      }

      this.$(".fromDate").datepicker({
        defaultDate: new Date(dateRange.get("from")),
        maxDate: new Date(dateRange.get('to')),

        onSelect: function (selectedDate) {
          self.$(".toDate").datepicker("option", "minDate", selectedDate);

          dateRange.set('from', new Date(selectedDate).getTime());
          self.sendAction('rangeChanged', dateRange);
        }
      });

      this.$(".toDate").datepicker({
        defaultDate: new Date(dateRange.get('to')),
        minDate: new Date(dateRange.get('from')),

        onSelect: function (selectedDate) {
          selectedDate += ' 23:59';

          self.$(".fromDate").datepicker("option", "maxDate", selectedDate);

          dateRange.set('to', new Date(selectedDate).getTime());
          self.sendAction('rangeChanged', dateRange);
        }
      });

      this.set('rendered', true);
    }
  });

});
define('hive/components/ember-selectize', ['exports', 'ember-cli-selectize/components/ember-selectize'], function (exports, EmberSelectizeComponent) {

	'use strict';

	exports['default'] = EmberSelectizeComponent['default'];

});
define('hive/components/expander-widget', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'expander',

    didInsertElement: function () {
      if (this.get('isExpanded')) {
        this.$('.accordion-body').toggle();
      }
    },

    actions: {
      toggle: function () {
        this.toggleProperty('isExpanded');
        this.$('.accordion-body').toggle(200);
      }
    }
  });

});
define('hive/components/extended-input', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].TextField.extend(Ember['default'].I18n.TranslateableProperties, {
    didInsertElement: function () {
      var dynamicValue = this.get('dynamicValue');
      var dynamicContext = this.get('dynamicContext');

      if (dynamicValue && dynamicContext) {
        this.set('value', dynamicContext.get(dynamicValue));
      }
    },

    sendValueChanged: function () {
      var dynamicValue = this.get('dynamicValue');
      var dynamicContext = this.get('dynamicContext');

      if (dynamicValue && dynamicContext) {
        dynamicContext.set(dynamicValue, this.get('value'));
      }

      this.sendAction('valueChanged', this.get('value'));
    },

    keyUp: function (e) {
      //if user has pressed enter
      if (e.keyCode === 13) {
        this.sendAction('valueSearched', this.get('value'));
      } else {
        Ember['default'].run.debounce(this, this.get('sendValueChanged'), 300);
      }
    }
  });

});
define('hive/components/file-upload', ['exports', 'ember-uploader'], function (exports, EmberUploader) {

  'use strict';

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

  exports['default'] = EmberUploader['default'].FileField.extend({
    filesDidChange: function(files) {
      this.sendAction('filesUploaded',files); // sends this action to controller.
    }
  });

});
define('hive/components/job-tr-view', ['exports', 'ember', 'hive/utils/constants', 'hive/utils/functions'], function (exports, Ember, constants, utils) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend({
    tagName: '',

    canStop: function () {
      return utils['default'].insensitiveCompare(this.get('job.status'), constants['default'].statuses.running, constants['default'].statuses.initialized, constants['default'].statuses.pending);
    }.property('job.status'),

    actions: {
      requestFile: function () {
        this.toggleProperty('expanded');

        this.sendAction('onFileRequested', this.get('job'));
      },

      stopJob: function () {
        this.sendAction('onStopJob', this.get('job'));
      }
    }
  });

});
define('hive/components/jqui-autocomplete/component', ['exports', 'ember', 'ember-cli-jquery-ui/components/jqui-autocomplete/component'], function (exports, Ember, jquiAutocomplete) {

	'use strict';

	exports['default'] = jquiAutocomplete['default'];

});
define('hive/components/jqui-button/component', ['exports', 'ember', 'ember-cli-jquery-ui/components/jqui-button/component'], function (exports, Ember, jquiButton) {

	'use strict';

	exports['default'] = jquiButton['default'];

});
define('hive/components/jqui-datepicker/component', ['exports', 'ember', 'ember-cli-jquery-ui/components/jqui-datepicker/component'], function (exports, Ember, jquiDatepicker) {

	'use strict';

	exports['default'] = jquiDatepicker['default'];

});
define('hive/components/jqui-progress-bar/component', ['exports', 'ember', 'ember-cli-jquery-ui/components/jqui-progress-bar/component'], function (exports, Ember, jquiProgressBar) {

	'use strict';

	exports['default'] = jquiProgressBar['default'];

});
define('hive/components/jqui-slider/component', ['exports', 'ember', 'ember-cli-jquery-ui/components/jqui-slider/component'], function (exports, Ember, jquiSlider) {

	'use strict';

	exports['default'] = jquiSlider['default'];

});
define('hive/components/jqui-spinner/component', ['exports', 'ember', 'ember-cli-jquery-ui/components/jqui-spinner/component'], function (exports, Ember, jquiSpinner) {

	'use strict';

	exports['default'] = jquiSpinner['default'];

});
define('hive/components/modal-widget', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend(Ember['default'].I18n.TranslateableProperties, {
    show: function () {
      var self = this;

      this.$('.modal').modal().on('hidden.bs.modal', function () {
        self.sendAction('close');
      });
    }.on('didInsertElement'),

    keyPress: function (e) {
      Ember['default'].run.debounce(this, function () {
        if (e.which === 13) {
          this.send('ok');
        } else if (e.which === 27) {
          this.send('close');
        }
      }, 200);
    },

    setupEvents: function () {
      this.$(document).on('keyup', Ember['default'].$.proxy(this.keyPress, this));
    }.on('didInsertElement'),

    destroyEvents: function () {
      this.$(document).off('keyup', Ember['default'].$.proxy(this.keyPress, this));
    }.on('willDestroyElement'),

    actions: {
      ok: function () {
        this.$('.modal').modal('hide');
        this.sendAction('ok');
      },
      close: function () {
        this.$('.modal').modal('hide');
        this.sendAction('close');
      }
    }
  });

});
define('hive/components/navbar-widget', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'navigation-bar',
    title: constants['default'].appTitle,

    items: Ember['default'].A([
      Ember['default'].Object.create({text: 'menus.query',
                           path: constants['default'].namingConventions.routes.index}),

      Ember['default'].Object.create({text: 'menus.savedQueries',
                           path: constants['default'].namingConventions.routes.queries}),

      Ember['default'].Object.create({text: 'menus.history',
                           path: constants['default'].namingConventions.routes.history}),

      Ember['default'].Object.create({text: 'menus.udfs',
                           path: constants['default'].namingConventions.routes.udfs}),

      Ember['default'].Object.create({text: 'menus.uploadTable',
        path: constants['default'].namingConventions.routes.uploadTable})
    ])
  });

});
define('hive/components/no-bubbling', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend({
    didInsertElement: function () {
      var self = this;

      this.$().click(function (e) {
        e.stopPropagation();

        self.sendAction('click', self.get('data'));
      });
    }
  });

});
define('hive/components/notify-widget', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'notifications',
    classNames: [ 'notifications-container' ],
    removeNotificationAction: 'removeNotification',

    actions: {
      removeNotification: function (notification) {
        this.sendAction('removeNotificationAction', notification);
      }
    }
  });

});
define('hive/components/number-range-widget', ['exports', 'ember', 'hive/utils/functions'], function (exports, Ember, utils) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend({
    didInsertElement: function () {
      var self = this;
      var numberRange = this.get('numberRange');

      if (!numberRange.get('from') && !numberRange.get('to')) {
        numberRange.set('from', numberRange.get('min'));
        numberRange.set('to', numberRange.get('max'));
        numberRange.set('fromDuration',utils['default'].secondsToHHMMSS(numberRange.get('min')));
        numberRange.set('toDuration',utils['default'].secondsToHHMMSS(numberRange.get('max')));

      }

      this.$('.slider').slider({
        range: true,
        min: numberRange.get('min'),
        max: numberRange.get('max'),
        units: numberRange.get('units'),
        values: [numberRange.get('from'), numberRange.get('to')],

        slide: function (event, ui) {
          numberRange.set('from', ui.values[0]);
          numberRange.set('to', ui.values[1]);
          numberRange.set('fromDuration', utils['default'].secondsToHHMMSS(ui.values[0]));
          numberRange.set('toDuration', utils['default'].secondsToHHMMSS(ui.values[1]));

        },

        change: function () {
          self.sendAction('rangeChanged', numberRange);
        }
      });

      this.set('rendered', true);
    },

    updateMin: function () {
      if (this.get('rendered')) {
        this.$('.slider').slider('values', 0, this.get('numberRange.from'));
      }
    }.observes('numberRange.from'),

    updateMax: function () {
      if (this.get('rendered')) {
        this.$('.slider').slider('values', 1, this.get('numberRange.to'));
      }
    }.observes('numberRange.to')
  });

});
define('hive/components/panel-widget', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend(Ember['default'].I18n.TranslateableProperties, {
    tagName: 'panel',

    actions: {
      sendMenuItemAction: function (action) {
        this.set('menuItemAction', action);
        this.sendAction('menuItemAction');
      }
    }
  });

});
define('hive/components/popover-widget', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend(Ember['default'].I18n.TranslateableProperties, {
    tagName: 'popover',
    attributeBindings: [ 'title', 'content:data-content' ],

    didInsertElement: function () {
      this.$().popover({
        html: true,
        placement: 'left',
        trigger: 'hover'
      });

      this.$().attr('data-content', this.$('.hide').html());
    }
  });

});
define('hive/components/progress-widget', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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
   * See the License for the specific `language governing permissions and
   * limitations under the License.
   */

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'progress-bar',

    updateValue: function () {
      var progress = this.get('value') ? this.get('value').toFixed() : 0;

      this.set('style', 'width: %@%'.fmt(progress));
      this.set('percentage', '%@%'.fmt(progress));
    }.observes('value').on('didInsertElement')
  });

});
define('hive/components/query-editor', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  /* global CodeMirror */

  /**
  /* Copyright (C) 2014 by Marijn Haverbeke <marijnh@gmail.com> and others
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:

   * The above copyright notice and this permission notice shal l be included in
   * all copies or substantial portions of the Software.
  */

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'query-editor',

    tablesChanged: function () {
      //Format hintOptions object as needed by the CodeMirror
      //http://stackoverflow.com/questions/20023381/codemirror-how-add-tables-to-sql-hint
      this.set('editor.options.hintOptions', { tables: this.get('tables') });
    }.observes('tables'),

    getColumnsHint: function (cm, tableName) {
      var callback = function () {
        CodeMirror.showHint(cm);
      };

      this.sendAction('columnsNeeded', tableName, callback);
    },

    initEditor: function () {
      var editor,
          updateSize,
          self = this;

      updateSize = function () {
        editor.setSize(self.$(this).width(), self.$(this).height());
        editor.refresh();
      };

      this.set('editor', CodeMirror.fromTextArea(document.getElementById('code-mirror'), {
        mode: 'text/x-hive',
        hint: CodeMirror.hint.sql,
        indentWithTabs: true,
        smartIndent: true,
        lineNumbers: true,
        matchBrackets : true,
        autofocus: true,
        extraKeys: {'Ctrl-Space': 'autocomplete'}
      }));

      CodeMirror.commands.autocomplete = function (cm) {
        var lastWord = cm.getValue().split(' ').pop();

        //if user wants to fill in a column
        if (lastWord.indexOf('.') > -1) {
          lastWord = lastWord.split('.')[0];

          self.getColumnsHint(cm, lastWord);
        } else {
          CodeMirror.showHint(cm);
        }
      };

      editor = this.get('editor');

      editor.on('cursorActivity', function () {
        self.set('highlightedText', editor.getSelections());
      });

      editor.setValue(this.get('query') || '');

      editor.on('change', function (instance) {
        Ember['default'].run(function () {
          self.set('query', instance.getValue());
        });
      });

      this.$('.CodeMirror').resizable({
        handles: 's',

        resize: function () {
          Ember['default'].run.debounce(this, updateSize, 150);
        }
      }).find('.ui-resizable-s').addClass('grip fa fa-reorder');

      this.tablesChanged();
    }.on('didInsertElement'),

    updateValue: function () {
      var query = this.get('query');
      var editor = this.get('editor');

      var isEditorExplainQuery = (editor.getValue().toUpperCase().trim().indexOf('EXPLAIN') === 0);
      var isFinalExplainQuery = (query.toUpperCase().trim().indexOf('EXPLAIN') === 0);

      if (editor.getValue() !== query) {

        if(!isEditorExplainQuery && !isFinalExplainQuery){
          editor.setValue(query || '');
        } else if(!isEditorExplainQuery && isFinalExplainQuery){
          editor.setValue(editor.getValue() || '');
        } else if(isEditorExplainQuery && isFinalExplainQuery){
          editor.setValue(editor.getValue() || '');
        } else{
          editor.setValue(query || '');
        }

      }

    }.observes('query')
  });

});
define('hive/components/select-widget', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend(Ember['default'].I18n.TranslateableProperties, {
    tagName: 'dropdown',

    selectedLabel: function () {
      var value;

      //if there's an item selected, retrieve the property to be displayed as a label
      if (this.get('selectedValue') && this.get('labelPath')) {
        value = this.get('selectedValue').get(this.get('labelPath'));

        if (value) {
          return value;
        }
      }

      //else if a default label has been provided, use it as the selected label.
      if (this.get('defaultLabel')) {
        return this.get('defaultLabel');
      }
    }.property('selectedValue'),

    didInsertElement: function () {
      //if no selected item nor defaultLabel, set the selected value
      if (!this.get('selectedValue') && !this.get('defaultLabel') && this.get('items')) {
        this.set('selectedValue', this.get('items').objectAt(0));
      }
    },

    actions: {
      select: function (item){
        this.set('selectedValue', item);
      },

      add: function () {
        this.sendAction('itemAdded');
      },

      edit: function (item) {
        this.sendAction('itemEdited', item);
      },

      remove: function (item) {
        this.sendAction('itemRemoved', item);
      }
    }
  });

});
define('hive/components/tabs-widget', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'tabs',

    didInsertElement: function () {
      var tabToActivate,
          tabs = this.get('tabs');

      if (tabs.get('length')) {
        tabToActivate = tabs.find(function (tab) {
          return tab.get('active');
        });

        if (tabToActivate) {
          this.set('selectedTab', tabToActivate);
        } else {
          this.set('selectedTab', tabs.objectAt(0));
        }
      }
    },

    activateTab: function () {
      var selectedTab = this.get('selectedTab');

      selectedTab.set('active', true);

      this.get('tabs').without(selectedTab).forEach(function (tab) {
        tab.set('active', false);
      });
    }.observes('selectedTab'),

    removeEnabled: function () {
      return this.get('canRemove') && this.get('tabs.length') > 1;
    }.property('tabs.@each'),

    actions: {
      remove: function (tab) {
        this.sendAction('removeClicked', tab);
      },

      selectTab: function (tab) {
        this.set('selectedTab', tab);
      },

      titleClick: function(tab) {
        this.sendAction('onActiveTitleClick', tab);
      }
    }
  });

});
define('hive/components/tree-view', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'tree-view'
  });

});
define('hive/components/typeahead-widget', ['exports', 'ember-cli-selectize/components/ember-selectize', 'ember'], function (exports, Typeahead, Ember) {

  'use strict';

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

  exports['default'] = Typeahead['default'].extend(Ember['default'].I18n.TranslateableProperties, {
    didInsertElement: function () {
      this._super();

      if (!this.get('selection') && this.get('content.firstObject')) {
        this.set('selection', this.get('content.firstObject'));
      }

      this.selectize.on('dropdown_close', Ember['default'].$.proxy(this.onClose, this));

      if($('.selectize-input')) {$('.selectize-input').addClass( "mozBoxSizeFix" );}

      var currentKeyName = this.get('safeValue');
      var currentTypehead = $('*[keyname="' + currentKeyName +'"]');

      if (currentTypehead.find($('.selectize-input')).has('.item').length == 0) {
        currentTypehead.find($('.selectize-input')).addClass("has-options has-items ");

        currentTypehead.find($('.selectized option:selected')).val(currentKeyName);
        currentTypehead.find($('.selectized option:selected')).text(currentKeyName);

        currentTypehead.find($('.selectize-input input')).css({'opacity': 0 , 'position': 'absolute' , 'left': '-10000px'});

        var itemHtml = '<div data-value=' + currentKeyName + ' class=item >' + currentKeyName + '</div>';
        currentTypehead.find($('.selectize-input')).append( itemHtml );

      }
    },

    removeExcludedObserver: function () {
      var options = this.get('content');

      if (!options) {
        options = this.removeExcluded(true);
        this.set('content', options);
      } else {
        this.removeExcluded();
      }
    }.observes('excluded.@each.key').on('init'),

    removeExcluded: function (shouldReturn) {
      var excluded        = this.get('excluded') || [];
      var options         = this.get('options');
      var selection       = this.get('selection');
      var objectToModify  = this.get('content');
      var objectsToRemove = [];
      var objectsToAdd    = [];

      if (!options) {
        return;
      }

      if (shouldReturn) {
        objectToModify = Ember['default'].copy(options);
      }

      var valuePath = this.get('optionValuePath');
      var selectionName = selection ? selection[valuePath] : selection;

      if (options) {
        options.forEach(function (option) {
          if (excluded.contains(option) && option.name !== selectionName) {
            objectsToRemove.push(option);
          } else if (!objectToModify.contains(option)) {
            objectsToAdd.push(option);
          }
        });
      }

      objectToModify.removeObjects(objectsToRemove);
      objectToModify.pushObjects(objectsToAdd);

      return objectToModify;
    },

    onClose: function () {
      if (!this.get('selection') && this.get('prevSelection')) {
        this.set('selection', this.get('prevSelection'));
      }
    },

    _onItemAdd: function (value) {
      this._super(value);

      this.set('prevSelection', this.get('selection'));
    }
  });

});
define('hive/components/udf-tr-view', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'tr',

    didInsertElement: function () {
      this._super();

      if (this.get('udf.isNew')) {
        this.set('udf.isEditing', true);
      }
    },

    setfileBackup: function () {
      if (!this.get('udf.isDirty')) {
        this.set('fileBackup', this.get('udf.fileResource'));
      }
    }.observes('udf.isDirty').on('didInsertElement'),

    actions: {
      editUdf: function () {
        this.set('udf.isEditing', true);
      },

      deleteUdf: function () {
        this.sendAction('onDeleteUdf', this.get('udf'));
      },

      addFileResource: function () {
        this.sendAction('onAddFileResource', this.get('udf'));
      },

      editFileResource: function (file) {
        this.set('udf.fileResource', file);
        this.set('udf.isEditingResource', true);
      },

      deleteFileResource: function (file) {
        this.sendAction('onDeleteFileResource', file);
      },

      save: function () {
        this.sendAction('onSaveUdf', this.get('udf'));
      },

      cancel: function () {
        var self = this;

        this.set('udf.isEditing', false);
        this.set('udf.isEditingResource', false);

        this.udf.get('fileResource').then(function (file) {
          if (file) {
            file.rollback();
          }

          self.udf.rollback();
          self.udf.set('fileResource', self.get('fileBackup'));
        });
      }
    }
  });

});
define('hive/components/visualization-tabs-widget', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'tabs',

    didInsertElement: function () {
      var tabToActivate,
          tabs = this.get('tabs');

      if (tabs.get('length')) {
        tabToActivate = tabs.find(function (tab) {
          return tab.get('active');
        });

        if (tabToActivate) {
          this.set('selectedTab', tabToActivate);
        } else {
          this.set('selectedTab', tabs.objectAt(0));
        }
      }
    },

    activateTab: function () {
      var selectedTab = this.get('selectedTab');

      selectedTab.set('active', true);

      this.get('tabs').without(selectedTab).forEach(function (tab) {
        tab.set('active', false);
      });
    }.observes('selectedTab'),

    actions: {
      selectTab: function (tab) {
        this.set('selectedTab', tab);
      }
    }
  });

});
define('hive/controllers/application', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Controller.extend({
    notifyService: Ember['default'].inject.service(constants['default'].namingConventions.notify),

    notifications: Ember['default'].computed.alias('notifyService.notifications'),
  });

});
define('hive/controllers/databases', ['exports', 'ember', 'hive/utils/constants', 'hive/config/environment'], function (exports, Ember, constants, ENV) {

  'use strict';

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

  exports['default'] = Ember['default'].Controller.extend({
    databaseService: Ember['default'].inject.service(constants['default'].namingConventions.database),
    notifyService: Ember['default'].inject.service(constants['default'].namingConventions.notify),

    pageCount: 10,

    selectedDatabase: Ember['default'].computed.alias('databaseService.selectedDatabase'),
    databases: Ember['default'].computed.alias('databaseService.databases'),

    tableSearchResults: Ember['default'].Object.create(),

    tableControls: [
      {
        icon: 'fa-list',
        action: 'loadSampleData',
        tooltip: Ember['default'].I18n.t('tooltips.loadSample')
      }
    ],

    panelIconActions: [
      {
        icon: 'fa-refresh',
        action: 'refreshDatabaseExplorer',
        tooltip: Ember['default'].I18n.t('tooltips.refresh')
      }
    ],

    tabs: [
      Ember['default'].Object.create({
        name: Ember['default'].I18n.t('titles.explorer'),
        visible: true,
        view: constants['default'].namingConventions.databaseTree
      }),
      Ember['default'].Object.create({
        name: Ember['default'].I18n.t('titles.results'),
        view: constants['default'].namingConventions.databaseSearch
      })
    ],

    _handleError: function (error) {
      this.get('notifyService').error(error);
      this.set('isLoading', false);
    },

    setTablePageAvailability: function (database) {
      var result;

      if (database.get('hasNext')) {
        result = true;
      } else if (database.tables.length > database.get('visibleTables.length')) {
        //if there are hidden tables
        result = true;
      }

      database.set('canGetNextPage', result);
    },

    setColumnPageAvailability: function (table) {
      var result;

      if (table.get('hasNext')) {
        result = true;
      } else if (table.columns.length > table.get('visibleColumns.length')) {
        //if there are hidden columns
        result = true;
      }

      table.set('canGetNextPage', result);
    },

    selectedDatabaseChanged: function () {
      var self = this;

      this.resetSearch();

      this.set('isLoading', true);

      this.get('databaseService').getAllTables().then(function () {
        self.set('isLoading', false);
      }, function (err) {
        self._handleError(err);
      });
    }.observes('selectedDatabase'),

    getNextColumnPage: function (database, table) {
      var self = this;

      this.set('isLoading', true);

      if (!table.columns) {
        table.columns = [];
        table.set('visibleColumns', []);
      }

      this.get('databaseService').getColumnsPage(database.get('name'), table).then(function (result) {
        table.columns.pushObjects(result.columns);
        table.get('visibleColumns').pushObjects(result.columns);
        table.set('hasNext', result.hasNext);

        self.setColumnPageAvailability(table);
        self.set('isLoading', false);
      }, function (err) {
        self._handleError(err);
      });
    },

    getNextTablePage: function (database) {
      var self = this;

      this.set('isLoading', true);

      if (!database.tables) {
        database.tables = [];
        database.set('visibleTables', []);
      }

      this.get('databaseService').getTablesPage(database).then(function (result) {
        database.tables.pushObjects(result.tables);
        database.get('visibleTables').pushObjects(result.tables);
        database.set('hasNext', result.hasNext);

        self.setTablePageAvailability(database);
        self.set('isLoading', false);
      }, function (err) {
        self._handleError(err);
      });
    },

    getDatabases: function () {
      var self = this;
      var selectedDatabase = this.get('selectedDatabase.name');

      this.set('isLoading', true);

      this.get('databaseService').getDatabases().then(function (databases) {
        self.set('isLoading');
        self.get('databaseService').setDatabaseByName(selectedDatabase);
      })["catch"](function (error) {
        self._handleError(error);

        if(error.status == 401) {
           self.send('passwordLDAPDB');
        }


      });
    }.on('init'),

    syncDatabases: function() {
      var oldDatabaseNames = this.store.all('database').mapBy('name');
      var self = this;
      return this.get('databaseService').getDatabasesFromServer().then(function(data) {
        // Remove the databases from store which are not in server
        data.forEach(function(dbName) {
          if(!oldDatabaseNames.contains(dbName)) {
            self.store.createRecord('database', {
              id: dbName,
              name: dbName
            });
          }
        });
        // Add the databases in store which are new in server
        oldDatabaseNames.forEach(function(dbName) {
          if(!data.contains(dbName)) {
            self.store.find('database', dbName).then(function(db) {
              self.store.unloadRecord(db);
            });
          }
        });
      });
    },

    initiateDatabaseSync: function() {
      // This was required so that the unit test would not stall
      if(ENV['default'].environment !== "test") {
        Ember['default'].run.later(this, function() {
          this.syncDatabases();
          this.initiateDatabaseSync();
        }, 15000);
      }
    }.on('init'),

    resetSearch: function() {
      var resultsTab = this.get('tabs').findBy('view', constants['default'].namingConventions.databaseSearch);
      var databaseExplorerTab = this.get('tabs').findBy('view', constants['default'].namingConventions.databaseTree);
      var tableSearchResults = this.get('tableSearchResults');
      resultsTab.set('visible', false);
      this.set('selectedTab', databaseExplorerTab);
      this.set('tableSearchTerm', '');
      this.set('columnSearchTerm', '');
      tableSearchResults.set('tables', undefined);
      tableSearchResults.set('hasNext', undefined);
    },


    actions: {
      refreshDatabaseExplorer: function () {
        this.getDatabases();
        this.resetSearch();
      },

      passwordLDAPDB: function(){
        var self = this,
            defer = Ember['default'].RSVP.defer();

        self.getDatabases = this.getDatabases;

        this.send('openModal', 'modal-save', {
          heading: "modals.authenticationLDAP.heading",
          text:"",
          type: "password",
          defer: defer
        });

        defer.promise.then(function (text) {
          // make a post call with the given ldap password.
          var password = text;
          var pathName = window.location.pathname;
          var pathNameArray = pathName.split("/");
          var hiveViewVersion = pathNameArray[3];
          var hiveViewName = pathNameArray[4];
          var ldapAuthURL = "/api/v1/views/HIVE/versions/"+ hiveViewVersion + "/instances/" + hiveViewName + "/jobs/auth";

          $.ajax({
            url: ldapAuthURL,
            dataType: "json",
            type: 'post',
            headers: {'X-Requested-With': 'XMLHttpRequest', 'X-Requested-By': 'ambari'},
            contentType: 'application/json',
            data: JSON.stringify({ "password" : password}),
            success: function( data, textStatus, jQxhr ){
              console.log( "LDAP done: " + data );
              self.getDatabases();
            },
            error: function( jqXhr, textStatus, errorThrown ){
              console.log( "LDAP fail: " + errorThrown );
              self.get('notifyService').error( "Wrong Credentials." );
            }
          });

        });
      },

      loadSampleData: function (tableName, database) {
        var self = this;
        this.send('addQuery', Ember['default'].I18n.t('titles.tableSample', { tableName: tableName }));

        Ember['default'].run.later(function () {
          var query = constants['default'].sampleDataQuery.fmt(tableName);

          self.set('selectedDatabase', database);
          self.send('executeQuery', constants['default'].jobReferrer.sample, query);
        });
      },

      getTables: function (dbName) {
        var database = this.get('databases').findBy('name', dbName),
            tables = database.tables,
            pageCount = this.get('pageCount');

        if (!tables) {
          this.getNextTablePage(database);
        } else {
          database.set('visibleTables', tables.slice(0, pageCount));
          this.setTablePageAvailability(database);
        }
      },

      getColumns: function (tableName, database) {
        var table = database.get('visibleTables').findBy('name', tableName),
            pageCount = this.get('pageCount'),
            columns = table.columns;

        if (!columns) {
          this.getNextColumnPage(database, table);
        } else {
          table.set('visibleColumns', columns.slice(0, pageCount));
          this.setColumnPageAvailability(table);
        }
      },

      showMoreTables: function (database) {
        var tables = database.tables,
            visibleTables = database.get('visibleTables'),
            visibleCount = visibleTables.length;

        if (!tables) {
          this.getNextTablePage(database);
        } else {
          if (tables.length > visibleCount) {
            visibleTables.pushObjects(tables.slice(visibleCount, visibleCount + this.get('pageCount')));
            this.setTablePageAvailability(database);
          } else {
            this.getNextTablePage(database);
          }
        }
      },

      showMoreColumns: function (table, database) {
        var columns = table.columns,
            visibleColumns = table.get('visibleColumns'),
            visibleCount = visibleColumns.length;

        if (!columns) {
          this.getNextColumnPage(database, table);
        } else {
          if (columns.length > visibleCount) {
            visibleColumns.pushObjects(columns.slice(visibleCount, visibleCount + this.get('pageCount')));
            this.setColumnPageAvailability(table);
          } else {
            this.getNextColumnPage(database, table);
          }
        }
      },

      searchTables: function (searchTerm) {
        var self = this,
            resultsTab = this.get('tabs').findBy('view', constants['default'].namingConventions.databaseSearch),
            tableSearchResults = this.get('tableSearchResults');

        searchTerm = searchTerm ? searchTerm.toLowerCase() : '';

        this.set('tablesSearchTerm', searchTerm);
        resultsTab.set('visible', true);
        this.set('selectedTab', resultsTab);
        this.set('columnSearchTerm', '');
        this.set('isLoading', true);

        this.get('databaseService').getTablesPage(this.get('selectedDatabase'), searchTerm, true).then(function (result) {
          tableSearchResults.set('tables', result.tables);
          tableSearchResults.set('hasNext', result.hasNext);

          self.set('isLoading', false);
        }, function (err) {
          self._handleError(err);
        });
      },

      searchColumns: function (searchTerm) {
        var self = this,
            database = this.get('selectedDatabase'),
            resultsTab = this.get('tabs').findBy('view', constants['default'].namingConventions.databaseSearch),
            tables = this.get('tableSearchResults.tables');

        searchTerm = searchTerm ? searchTerm.toLowerCase() : '';

        this.set('selectedTab', resultsTab);

        this.set('isLoading', true);

        tables.forEach(function (table) {
          self.get('databaseService').getColumnsPage(database.get('name'), table, searchTerm, true).then(function (result) {
            table.set('columns', result.columns);
            table.set('hasNext', result.hasNext);

            if (tables.indexOf(table) === tables.get('length') -1) {
              self.set('isLoading', false);
            }
          }, function (err) {
            self._handleError(err);
          });
        });
      },

      showMoreResultTables: function () {
        var self = this,
            database = this.get('selectedDatabase'),
            tableSearchResults = this.get('tableSearchResults'),
            searchTerm = this.get('tableSearchTerm');

        this.set('isLoading', true);

        this.get('databaseService').getTablesPage(database, searchTerm).then(function (tablesResult) {
          var tables = tableSearchResults.get('tables');
          var shouldGetColumns = tables.any(function (table) {
            return table.get('columns.length') > 0;
          });

          tables.pushObjects(tablesResult.tables);
          tableSearchResults.set('hasNext', tablesResult.hasNext);

          //if user has already searched for columns for the previously loaded tables,
          //load the columns search results for the newly loaded tables.
          if (shouldGetColumns) {
            tablesResult.tables.forEach(function (table) {
              self.get('databaseService').getColumnsPage(database.get('name'), table, self.get('columnSearchTerm'), true).then(function (result) {
                table.set('columns', result.columns);
                table.set('hasNext', result.hasNext);

                if (tablesResult.tables.indexOf(table) === tablesResult.tables.get('length') -1) {
                  self.set('isLoading', false);
                }
              }, function (err) {
                self._handleError(err);
              });
            });
          } else {
            self.set('isLoading', false);
          }
        }, function (err) {
          self._handleError(err);
        });
      },

      showMoreResultColumns: function (table) {
        var self = this;

        this.set('isLoading', true);

        this.get('databaseService').getColumnsPage(this.get('selectedDatabase.name'), table, this.get('columnSearchTerm')).then(function (result) {
          table.get('columns').pushObjects(result.columns);
          table.set('hasNext', result.hasNext);

          self.set('isLoading', false);
        }, function (err) {
          self._handleError(err);
        });
      }
    }
  });

});
define('hive/controllers/history', ['exports', 'ember', 'hive/mixins/filterable', 'hive/utils/constants'], function (exports, Ember, FilterableMixin, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].ArrayController.extend(FilterableMixin['default'], {
    jobService: Ember['default'].inject.service('job'),
    fileService: Ember['default'].inject.service('file'),

    sortAscending: false,
    sortProperties: ['dateSubmittedTimestamp'],

    init: function () {
      var oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      this._super();

      this.set('columns', Ember['default'].ArrayProxy.create({ content: Ember['default'].A([
        Ember['default'].Object.create({
          caption: 'columns.title',
          property: 'title',
          link: constants['default'].namingConventions.subroutes.historyQuery
        }),
        Ember['default'].Object.create({
          caption: 'columns.status',
          property: 'status'
        }),
        Ember['default'].Object.create({
          caption: 'columns.date',
          property: 'dateSubmittedTimestamp',
          dateRange: Ember['default'].Object.create({
            min: oneMonthAgo,
            max: new Date()
          })
        }),
        Ember['default'].Object.create({
          caption: 'columns.duration',
          property: 'duration',
          numberRange: Ember['default'].Object.create({
            min: 0,
            max: 10,
            units: 'sec'
          })
        })
      ])}));
    },

    model: function () {
      return this.filter(this.get('history'));
    }.property('history', 'filters.@each'),

    updateIntervals: function () {
      var durationColumn;
      var maxDuration;
      var minDuration;

      if (this.get('columns')) {
        durationColumn = this.get('columns').find(function (column) {
          return column.get('caption') === 'columns.duration';
        });

        var items = this.get('history').map(function (item) {
          return item.get(durationColumn.get('property'));
        });

        minDuration = items.length ? Math.min.apply(Math, items) : 0;
        maxDuration = items.length ? Math.max.apply(Math, items) : 0;

        durationColumn.set('numberRange.min', minDuration);
        durationColumn.set('numberRange.max', maxDuration);
      }
    }.observes('history'),

    updateDateRange: function () {
      var dateColumn;
      var maxDate;
      var minDate;

      if (this.get('columns')) {
        dateColumn = this.get('columns').find(function (column) {
          return column.get('caption') === 'columns.date';
        });

        var items = this.get('history').map(function (item) {
          return item.get(dateColumn.get('property'));
        });

        minDate = items.length ? Math.min.apply(Math, items) : new Date();
        maxDate = items.length ? Math.max.apply(Math, items) : new Date();

        dateColumn.set('dateRange.min', minDate);
        dateColumn.set('dateRange.max', maxDate);
      }
    }.observes('history'),

    filterBy: function (filterProperty, filterValue, exactMatch) {
      var column = this.get('columns').find(function (column) {
        return column.get('property') === filterProperty;
      });

      if (column) {
        column.set('filterValue', filterValue, exactMatch);
      } else {
        this.updateFilters(filterProperty, filterValue, exactMatch);
      }
    },

    actions: {
      sort: function (property) {
        //if same column has been selected, toggle flag, else default it to true
        if (this.get('sortProperties').objectAt(0) === property) {
          this.set('sortAscending', !this.get('sortAscending'));
        } else {
          this.set('sortAscending', true);
          this.set('sortProperties', [ property ]);
        }
      },

      interruptJob: function (job) {
        this.get('jobService').stopJob(job);
      },

      loadFile: function (job) {
        this.get('fileService').loadFile(job.get('queryFile')).then(function (file) {
          job.set('file', file);
        });
      },

      clearFilters: function () {
        var columns = this.get('columns');

        if (columns) {
          columns.forEach(function (column) {
            var filterValue = column.get('filterValue');
            var rangeFilter;

            if (filterValue) {
              if (typeof filterValue === 'string') {
                column.set('filterValue');
              } else {
                rangeFilter = column.get('numberRange') || column.get('dateRange');

                rangeFilter.set('from', rangeFilter.get('min'));
                rangeFilter.set('to', rangeFilter.get('max'));
              }
            }
          });
        }

        //call clear filters from Filterable mixin
        this.clearFilters();
      }
    }
  });

});
define('hive/controllers/index', ['exports', 'ember', 'hive/utils/constants', 'hive/utils/functions'], function (exports, Ember, constants, utils) {

  'use strict';

  /** * Licensed to the Apache Software Foundation (ASF) under one
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

  exports['default'] = Ember['default'].Controller.extend({
    jobService: Ember['default'].inject.service(constants['default'].namingConventions.job),
    jobProgressService: Ember['default'].inject.service(constants['default'].namingConventions.jobProgress),
    databaseService: Ember['default'].inject.service(constants['default'].namingConventions.database),
    notifyService: Ember['default'].inject.service(constants['default'].namingConventions.notify),
    session: Ember['default'].inject.service(constants['default'].namingConventions.session),
    settingsService: Ember['default'].inject.service(constants['default'].namingConventions.settings),

    openQueries   : Ember['default'].inject.controller(constants['default'].namingConventions.openQueries),
    udfs          : Ember['default'].inject.controller(constants['default'].namingConventions.udfs),
    logs          : Ember['default'].inject.controller(constants['default'].namingConventions.jobLogs),
    results       : Ember['default'].inject.controller(constants['default'].namingConventions.jobResults),
    explain       : Ember['default'].inject.controller(constants['default'].namingConventions.jobExplain),
    settings      : Ember['default'].inject.controller(constants['default'].namingConventions.settings),
    visualExplain : Ember['default'].inject.controller(constants['default'].namingConventions.visualExplain),
    tezUI         : Ember['default'].inject.controller(constants['default'].namingConventions.tezUI),

    selectedDatabase: Ember['default'].computed.alias('databaseService.selectedDatabase'),
    isDatabaseExplorerVisible: true,
    canKillSession: Ember['default'].computed.and('model.sessionTag', 'model.sessionActive'),

    queryProcessTabs: [
      Ember['default'].Object.create({
        name: Ember['default'].I18n.t('menus.logs'),
        path: constants['default'].namingConventions.subroutes.jobLogs
      }),
      Ember['default'].Object.create({
        name: Ember['default'].I18n.t('menus.results'),
        path: constants['default'].namingConventions.subroutes.jobResults
      }),
      Ember['default'].Object.create({
        name: Ember['default'].I18n.t('menus.explain'),
        path: constants['default'].namingConventions.subroutes.jobExplain
      })
    ],

    queryPanelActions: [
      Ember['default'].Object.create({
        icon: 'fa-expand',
        action: 'toggleDatabaseExplorerVisibility',
        tooltip: Ember['default'].I18n.t('tooltips.expand')
      })
    ],

    init: function () {
      this._super();

      // initialize queryParams with an empty array
      this.set('queryParams', Ember['default'].ArrayProxy.create({ content: Ember['default'].A([]) }));

      this.set('queryProcessTabs', Ember['default'].ArrayProxy.create({ content: Ember['default'].A([
        Ember['default'].Object.create({
          name: Ember['default'].I18n.t('menus.logs'),
          path: constants['default'].namingConventions.subroutes.jobLogs
        }),
        Ember['default'].Object.create({
          name: Ember['default'].I18n.t('menus.results'),
          path: constants['default'].namingConventions.subroutes.jobResults
        }),
        Ember['default'].Object.create({
          name: Ember['default'].I18n.t('menus.explain'),
          path: constants['default'].namingConventions.subroutes.jobExplain
        })
      ])}));

      this.set('queryPanelActions', Ember['default'].ArrayProxy.create({ content: Ember['default'].A([
        Ember['default'].Object.create({
          icon: 'fa-expand',
          action: 'toggleDatabaseExplorerVisibility',
          tooltip: Ember['default'].I18n.t('tooltips.expand')
        })
      ])}));
    },

    canExecute: function () {
      var isModelRunning = this.get('model.isRunning');
      var hasParams = this.get('queryParams.length');

      if (isModelRunning) {
        return false;
      }

      if (hasParams) {
        // all param have values?
        return this.get('queryParams').every(function (param) { return param.value; });
      }

      return true;
    }.property('model.isRunning', 'queryParams.@each.value'),

    currentQueryObserver: function () {
      var query = this.get('openQueries.currentQuery.fileContent'),
          param,
          updatedParams = [],
          currentParams = this.get('queryParams'),
          paramRegExp = /\$\w+/ig,
          paramNames = query.match(paramRegExp) || [];

      paramNames = paramNames.uniq();

      paramNames.forEach(function (name) {
        param = currentParams.findBy('name', name);
        if (param) {
          updatedParams.push(param);
        } else {
          updatedParams.push({ name: name, value: "" });
        }
      });

      currentParams.setObjects(updatedParams);

      this.set('visualExplain.shouldChangeGraph', true);
    }.observes('openQueries.currentQuery.fileContent'),

    _executeQuery: function (referrer, shouldExplain, shouldGetVisualExplain) {
      var queryId,
          query,
          finalQuery,
          job,
          defer = Ember['default'].RSVP.defer(),
          originalModel = this.get('model');

      job = this.store.createRecord(constants['default'].namingConventions.job, {
        title: originalModel.get('title'),
        sessionTag: originalModel.get('sessionTag'),
        dataBase: this.get('selectedDatabase.name'),
        referrer: referrer
      });

      if (!shouldGetVisualExplain) {
        originalModel.set('isRunning', true);
      }

       //if it's a saved query / history entry set the queryId
      if (!originalModel.get('isNew')) {
        queryId = originalModel.get('constructor.typeKey') === constants['default'].namingConventions.job ?
                  originalModel.get('queryId') :
                  originalModel.get('id');

        job.set('queryId', queryId);
      }

      query = this.get('openQueries').getQueryForModel(originalModel);

      query = this.buildQuery(query, shouldExplain, shouldGetVisualExplain);


      // Condition for no query.
      if(query === ';') {
        originalModel.set('isEmptyQuery', true);
        originalModel.set('isRunning', false);
        defer.reject({
          message: 'No query to process.'
        });
        return defer.promise;
      }

      // for now we won't support multiple queries
      // buildQuery will return false it multiple queries
      // are selected
      if (!query) {
        originalModel.set('isRunning', false);
        defer.reject({
          message: 'Running multiple queries is not supported.'
        });

        return defer.promise;
      }

      finalQuery = query;
      finalQuery = this.bindQueryParams(finalQuery);
      finalQuery = this.prependGlobalSettings(finalQuery, job);

      job.set('forcedContent', finalQuery);

      if (shouldGetVisualExplain) {
        return this.getVisualExplainJson(job, originalModel);
      }

      return this.createJob(job, originalModel);
    },

    getVisualExplainJson: function (job, originalModel) {
      var self = this;
      var defer = Ember['default'].RSVP.defer();

      job.save().then(function () {
        self.get('results').getResultsJson(job).then(function (json) {
          defer.resolve(json);
        }, function (err) {
          defer.reject(err);
        });
      }, function (err) {
        defer.reject(err);
      });

      return defer.promise;
    },

    createJob: function (job, originalModel) {
      var defer = Ember['default'].RSVP.defer(),
          self = this,
          openQueries = this.get('openQueries');

      var handleError = function (err) {
        self.set('jobSaveSucceeded');
        originalModel.set('isRunning', undefined);
        defer.reject(err);

        if(err.status == 401) {
            self.send('passwordLDAP', job, originalModel);
        }

      };

      job.save().then(function () {
        //convert tab for current model since the execution will create a new job, and navigate to the new job route.
        openQueries.convertTabToJob(originalModel, job).then(function () {
          self.get('jobProgressService').setupProgress(job);
          self.set('jobSaveSucceeded', true);

          //reset flag on the original model
          originalModel.set('isRunning', undefined);

          defer.resolve(job);
        }, function (err) {
          handleError(err);
        });
      }, function (err) {
        handleError(err);
      });

      return defer.promise;
    },

    prependGlobalSettings: function (query, job) {
      var jobGlobalSettings = job.get('globalSettings');
      var currentGlobalSettings = this.get('settingsService').getSettings();

      // remove old globals
      if (jobGlobalSettings) {
        query.replace(jobGlobalSettings, '');
      }

      job.set('globalSettings', currentGlobalSettings);
      query = currentGlobalSettings + query;

      return query;
    },

    buildQuery: function (query, shouldExplain, shouldGetVisualExplain) {
      var selections = this.get('openQueries.highlightedText'),
          isQuerySelected = selections && selections[0] !== "",
          queryContent = query ? query.get('fileContent') : '',
          queryComponents = this.extractComponents(queryContent),
          finalQuery = '',
          queries = null;

      if (isQuerySelected) {
        queryComponents.queryString = selections.join('');
      }

      queries = queryComponents.queryString.split(';');
      queries = queries.filter(Boolean);

      queries = queries.map(function (query) {
        if (shouldExplain) {
          query = query.replace(/explain formatted|explain/gi, '');

          if (shouldGetVisualExplain) {
            return constants['default'].namingConventions.explainFormattedPrefix + query;
          } else {
            return constants['default'].namingConventions.explainPrefix + query;
          }
        } else {
          return query;
        }
      });

      if (queryComponents.files.length) {
        finalQuery += queryComponents.files.join("\n") + "\n\n";
      }

      if (queryComponents.udfs.length) {
        finalQuery += queryComponents.udfs.join("\n") + "\n\n";
      }

      finalQuery += queries.join(";");
      finalQuery += ";";
      return finalQuery.trim();
    },

    bindQueryParams: function (query) {
      var params = this.get('queryParams');

      if (!params.get('length')) {
        return query;
      }

      params.forEach(function (param) {
        query = query.split(param.name).join(param.value);
      });

      return query;
    },

    displayJobTabs: function () {
      return this.get('content.constructor.typeKey') === constants['default'].namingConventions.job &&
             utils['default'].isInteger(this.get('content.id')) &&
             this.get('jobSaveSucceeded');
    }.property('content', 'jobSaveSucceeded'),

    databasesOrModelChanged: function () {
      this.get('databaseService').setDatabaseByName(this.get('content.dataBase'));
    }.observes('databaseService.databases', 'content'),

    selectedDatabaseChanged: function () {
      this.set('content.dataBase', this.get('selectedDatabase.name'));
    }.observes('selectedDatabase'),

    modelChanged: function () {
      var self = this;
      var content = this.get('content');
      var openQueries = this.get('openQueries');

      this.set('jobSaveSucceeded', true);

      //update open queries list when current query model changes
      openQueries.update(content).then(function (isExplainedQuery) {
        var newId = content.get('id');
        var tab = openQueries.getTabForModel(content);

        //if not an ATS job
        if (content.get('constructor.typeKey') === constants['default'].namingConventions.job && utils['default'].isInteger(newId)) {
          self.get('queryProcessTabs').forEach(function (queryTab) {
            queryTab.set('id', newId);
          });

          if (isExplainedQuery) {
            self.set('explain.content', content);
          } else {
            self.set('logs.content', content);
            self.set('results.content', content);
          }

          self.setExplainVisibility(isExplainedQuery);

          self.transitionToRoute(tab.get('subroute'));
        }
      });
    }.observes('content'),

    csvUrl: function () {
      if (this.get('content.constructor.typeKey') !== constants['default'].namingConventions.job) {
        return;
      }

      if (!utils['default'].insensitiveCompare(this.get('content.status'), constants['default'].statuses.succeeded)) {
        return;
      }

      var url = this.container.lookup('adapter:application').buildURL();
      url += '/' + constants['default'].namingConventions.jobs + '/' + this.get('content.id');
      url += '/results/csv';

      return url;
    }.property('content'),

    downloadMenu: function () {
      var items = [];
      var tabs = this.get('queryProcessTabs');
      var isResultsTabVisible = tabs.findBy('path', constants['default'].namingConventions.subroutes.jobResults).get('visible');

      if (utils['default'].insensitiveCompare(this.get('content.status'), constants['default'].statuses.succeeded) && isResultsTabVisible) {
        items.push({
          title: Ember['default'].I18n.t('buttons.saveHdfs'),
          action: 'saveToHDFS'
        });

        if (this.get('csvUrl')) {
          items.push(
            Ember['default'].Object.create({
              title: Ember['default'].I18n.t('buttons.saveCsv'),
              action: 'downloadAsCSV'
            })
          );
        }
      }

      return items.length ? items : null;
    }.property('content.status', 'queryProcessTabs.@each.visible'),

    extractComponents: function (queryString) {
      var components = {};

      var udfRegEx = new RegExp("(" + constants['default'].namingConventions.udfInsertPrefix + ").+", "ig");
      var fileRegEx = new RegExp("(" + constants['default'].namingConventions.fileInsertPrefix + ").+", "ig");

      components.udfs         = queryString.match(udfRegEx) || [];
      components.files        = queryString.match(fileRegEx) || [];
      components.queryString  = queryString.replace(udfRegEx, "").replace(fileRegEx, "").trim();

      return components;
    },

    saveToHDFS: function (path) {
      var job = this.get('content');

      if (!utils['default'].insensitiveCompare(job.get('status'), constants['default'].statuses.succeeded)) {
        return;
      }

      var self = this;

      var file = path + ".csv";
      var url = this.container.lookup('adapter:application').buildURL();
      url +=  "/jobs/" + job.get('id') + "/results/csv/saveToHDFS";

      Ember['default'].$.getJSON(url, {
          commence: true,
          file: file
      }).then(function (response) {
        self.pollSaveToHDFS(response);
      }, function (error) {
        self.get('notifyService').error(error);
      });
    },

    pollSaveToHDFS: function (data) {
      var self = this;
      var url = this.container.lookup('adapter:application').buildURL();
      url += "/jobs/" + data.jobId + "/results/csv/saveToHDFS";

      Ember['default'].run.later(function () {
        Ember['default'].$.getJSON(url).then(function (response) {
          if (!utils['default'].insensitiveCompare(response.status, constants['default'].results.statuses.terminated)) {
            self.pollSaveToHDFS(response);
          } else {
            self.set('content.isRunning', false);
          }
        }, function (error) {
          self.get('notifyService').error(error);
        });
      }, 2000);
    },

    setExplainVisibility: function (show) {
      var tabs = this.get('queryProcessTabs');

      tabs.findBy('path', constants['default'].namingConventions.subroutes.jobExplain).set('visible', show);
      tabs.findBy('path', constants['default'].namingConventions.subroutes.jobLogs).set('visible', !show);
      tabs.findBy('path', constants['default'].namingConventions.subroutes.jobResults).set('visible', !show);
    },

    queryProcessTitle: function () {
      return Ember['default'].I18n.t('titles.query.process') + ' (' + Ember['default'].I18n.t('titles.query.status') + this.get('content.status') + ')';
    }.property('content.status'),

    updateSessionStatus: function() {
      this.get('session').updateSessionStatus(this.get('model'));
    }.observes('model', 'model.status'),

    actions: {
      passwordLDAP: function(){
        var job = arguments[0],
              originalModel = arguments[1],
              self = this,
              defer = Ember['default'].RSVP.defer();

          self.createJob = this.createJob;

          this.send('openModal', 'modal-save', {
            heading: "modals.authenticationLDAP.heading",
            text:"",
            type: "password",
            defer: defer
          });

          defer.promise.then(function (text) {
              // make a post call with the given ldap password.
              var password = text;
              var pathName = window.location.pathname;
              var pathNameArray = pathName.split("/");
              var hiveViewVersion = pathNameArray[3];
              var hiveViewName = pathNameArray[4];
              var ldapAuthURL = "/api/v1/views/HIVE/versions/"+ hiveViewVersion + "/instances/" + hiveViewName + "/jobs/auth";


              $.ajax({
                  url: ldapAuthURL,
                  dataType: "json",
                  type: 'post',
                  headers: {'X-Requested-With': 'XMLHttpRequest', 'X-Requested-By': 'ambari'},
                  contentType: 'application/json',
                  data: JSON.stringify({ "password" : password}),
                  success: function( data, textStatus, jQxhr ){
                      console.log( "LDAP done: " + data );
                      self.createJob (job,originalModel);
                  },
                  error: function( jqXhr, textStatus, errorThrown ){
                      console.log( "LDAP fail: " + errorThrown );
                          self.get('notifyService').error( "Wrong Credentials." );
                  }
              });

            });
      },

      stopCurrentJob: function () {
        this.get('jobService').stopJob(this.get('model'));
      },

      saveToHDFS: function () {
        var self = this,
            defer = Ember['default'].RSVP.defer();

        this.send('openModal', 'modal-save', {
          heading: "modals.download.hdfs",
          text: this.get('content.title') + '_' + this.get('content.id'),
          defer: defer
        });

        defer.promise.then(function (text) {
          self.set('content.isRunning', true);
          self.saveToHDFS(text);
        });
      },

      downloadAsCSV: function () {
        var self = this,
            defer = Ember['default'].RSVP.defer();

        this.send('openModal', 'modal-save', {
          heading: "modals.download.csv",
          text: this.get('content.title'),
          defer: defer
        });

        defer.promise.then(function (text) {
          // download file ...
          var urlString = "%@/?fileName=%@.csv";
          var url = self.get('csvUrl');
          url = urlString.fmt(url, text);
          window.open(url);
        });
      },

      insertUdf: function (item) {
        var query = this.get('openQueries.currentQuery');

        var queryString = query.get('fileContent');

        var newUdf = constants['default'].namingConventions.udfInsertPrefix + item.get('name') + " as '" + item.get('classname') + "';";
        var newFileResource = item.get('fileResource.path');

        if (item.get('fileResource.path')) {
          newFileResource = constants['default'].namingConventions.fileInsertPrefix + item.get('fileResource.path') + ";";
        }

        var components = this.extractComponents(queryString);

        if (!components.files.contains(newFileResource) && newFileResource) {
          components.files.push(newFileResource);
        }

        if (!components.udfs.contains(newUdf)) {
          components.udfs.push(newUdf);
        }

        var updatedContent = components.files.join("\n") + "\n\n";
        updatedContent += components.udfs.join("\n") + "\n\n";
        updatedContent += components.queryString;

        query.set('fileContent', updatedContent);
      },

      addQuery: (function () {
        var idCounter = 0;

        return function (workSheetName) {
          var model = this.store.createRecord(constants['default'].namingConventions.savedQuery, {
            dataBase: this.get('selectedDatabase.name'),
            title: workSheetName ? workSheetName : Ember['default'].I18n.t('titles.query.tab'),
            queryFile: '',
            id: 'fixture_' + idCounter
          });

          if (idCounter && !workSheetName) {
            model.set('title', model.get('title') + ' (' + idCounter + ')');
          }

          idCounter++;

          this.transitionToRoute(constants['default'].namingConventions.subroutes.savedQuery, model);
        };
      }()),

      saveQuery: function () {
        //case 1. Save a new query from a new query tab -> route changes to new id
        //case 2. Save a new query from an existing query tab -> route changes to new id
        //case 3. Save a new query from a job tab -> route doesn't change
        //case 4. Update an existing query tab. -> route doesn't change

        var self = this,
            defer = Ember['default'].RSVP.defer(),
            currentQuery = this.get('openQueries.currentQuery');

        this.set('model.dataBase', this.get('selectedDatabase.name'));

        this.send('openModal', 'modal-save-query', {
          heading: 'modals.save.heading',
          message: 'modals.save.overwrite',
          text: this.get('content.title'),
          content: this.get('content'),
          defer: defer
        });

        defer.promise.then(function (result) {
          // we need to update the original model
          // because when this is executed
          // it sets the title from the original model
          self.set('model.title', result.get('text'));

          if (result.get('overwrite')) {
            self.get('openQueries').save(self.get('content'), null, true, result.get('text')).then(function () {
              self.get('notifyService').success(Ember['default'].I18n.t('alerts.success.query.update'));
            });
          } else {
            self.get('openQueries').save(self.get('content'), null, false, result.get('text')).then(function (newId) {
              self.get('notifyService').success(Ember['default'].I18n.t('alerts.success.query.save'));

              if (self.get('model.constructor.typeKey') !== constants['default'].namingConventions.job) {
                self.transitionToRoute(constants['default'].namingConventions.subroutes.savedQuery, newId);
              }
            });
          }
        });
      },

      executeQuery: function (referrer, query) {
        var self = this;

        var isExplainQuery = (self.get('openQueries.currentQuery.fileContent').toUpperCase().trim().indexOf(constants['default'].namingConventions.explainPrefix) === 0);

        if(isExplainQuery){
          self.send('explainQuery');
          return;
        }

        var subroute;

        if (query) {
          this.set('openQueries.currentQuery.fileContent', query);
        }

        referrer = referrer || constants['default'].jobReferrer.job;

        this._executeQuery(referrer).then(function (job) {
          if (job.get('status') !== constants['default'].statuses.succeeded) {
            subroute = constants['default'].namingConventions.subroutes.jobLogs;
          } else {
            subroute = constants['default'].namingConventions.subroutes.jobResults;
          }

          self.get('openQueries').updateTabSubroute(job, subroute);
          self.get('notifyService').success(Ember['default'].I18n.t('alerts.success.query.execution'));
          self.transitionToRoute(constants['default'].namingConventions.subroutes.historyQuery, job.get('id'));
        }, function (error) {
          self.get('notifyService').error(error);
        });
      },

      explainQuery: function () {
        var self = this;

        this._executeQuery(constants['default'].jobReferrer.explain, true).then(function (job) {
          self.get('openQueries').updateTabSubroute(job, constants['default'].namingConventions.subroutes.jobExplain);

          self.transitionToRoute(constants['default'].namingConventions.subroutes.historyQuery, job.get('id'));
        }, function (error) {
          self.get('notifyService').error(error);
        });
      },

      toggleDatabaseExplorerVisibility: function () {
        this.toggleProperty('isDatabaseExplorerVisible');
      },

      killSession: function() {
        var self = this;
        var model = this.get('model');

        this.get('session').killSession(model)["catch"](function (response) {
            if ([200, 404].contains(response.status)) {
              model.set('sessionActive', false);
              self.notify.success(Ember['default'].I18n.t('alerts.success.sessions.deleted'));
            } else {
              self.notify.error(response);
            }
          });
      }
    }
  });

});
define('hive/controllers/index/history-query/explain', ['exports', 'ember', 'hive/utils/constants', 'hive/utils/functions'], function (exports, Ember, constants, utils) {

  'use strict';

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

  exports['default'] = Ember['default'].ObjectController.extend({
    cachedExplains: [],

    clearCachedExplainSet: function (jobId) {
      var existingJob = this.get('cachedExplains').findBy('id', jobId);

      if (existingJob) {
        this.set('cachedExplains', this.get('cachedExplains').without(existingJob));
      }
    },

    initExplain: function () {
      var cachedExplain;

      cachedExplain = this.get('cachedExplains').findBy('id', this.get('content.id'));

      if (cachedExplain) {
        this.formatExplainResults(cachedExplain);
      } else {
        this.getExplain(true);
      }
    }.observes('content'),

    getExplain: function (firstPage, rows) {
      var self = this;
      var url = this.container.lookup('adapter:application').buildURL();
      url += '/' + constants['default'].namingConventions.jobs + '/' + this.get('content.id') + '/results';

      if (firstPage) {
        url += '?first=true';
      }

      this.get('content').reload().then(function () {
        Ember['default'].$.getJSON(url).then(function (data) {
          var explainSet;

          //if rows from a previous page read exist, prepend them
          if (rows) {
            data.rows.unshiftObjects(rows);
          }

          if (!data.hasNext) {
            explainSet = self.get('cachedExplains').pushObject(Ember['default'].Object.create({
              id: self.get('content.id'),
              explain: data
            }));

            self.set('content.explain', explainSet);

            self.formatExplainResults(explainSet);
          } else {
            self.getExplain(false, data.rows);
          }
        });
      })
    },

    formatExplainResults: function (explainSet) {
      var formatted = [],
          currentNode,
          currentNodeWhitespace,
          previousNode,
          getLeadingWhitespacesCount = function (str) {
            return str.replace(utils['default'].regexes.whitespaces, '$1').length;
          };

      explainSet = explainSet
                   .get('explain.rows')
                   .map(function (row) {
                      return row[0];
                    })
                   .filter(Boolean)
                   .map(function (str) {
                      return {
                        text: str,
                        parentNode: null,
                        contents: []
                      };
                    });

      for (var i = 0; i < explainSet.length; i++) {
        currentNode = explainSet[i];
        previousNode = explainSet[i-1];

        if (i > 0) {
          currentNodeWhitespace = getLeadingWhitespacesCount(currentNode.text);

          if (currentNodeWhitespace > getLeadingWhitespacesCount(previousNode.text)) {
            currentNode.parentNode = previousNode;
            previousNode.contents.pushObject(currentNode);
          } else {
            for (var j = i - 1; j >= 0; j--) {
              if (currentNodeWhitespace === getLeadingWhitespacesCount(explainSet[j].text)) {
                if (currentNodeWhitespace > 0) {
                  currentNode.parentNode = explainSet[j].parentNode;
                  currentNode.parentNode.contents.pushObject(currentNode);
                } else {
                  formatted.pushObject(currentNode);
                }

                break;
              }
            }
          }
        } else {
          formatted.pushObject(currentNode);
        }
      }

      this.set('formattedExplain', formatted);
    }
  });

});
define('hive/controllers/index/history-query/logs', ['exports', 'ember', 'hive/utils/constants', 'hive/utils/functions'], function (exports, Ember, constants, utils) {

  'use strict';

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

  exports['default'] = Ember['default'].ObjectController.extend({
    fileService: Ember['default'].inject.service(constants['default'].namingConventions.file),
    notifyService: Ember['default'].inject.service(constants['default'].namingConventions.notify),

    needs: [ constants['default'].namingConventions.queryTabs,
             constants['default'].namingConventions.index,
             constants['default'].namingConventions.openQueries ],

    queryTabs: Ember['default'].computed.alias('controllers.' + constants['default'].namingConventions.queryTabs),
    index: Ember['default'].computed.alias('controllers.' + constants['default'].namingConventions.index),
    openQueries: Ember['default'].computed.alias('controllers.' + constants['default'].namingConventions.openQueries),

    reloadJobLogs: function (job) {
      var self = this;
      var handleError = function (error) {
        job.set('isRunning', false);

        self.get('notifyService').error(error);
      };

      job.reload().then(function () {
        if (utils['default'].insensitiveCompare(job.get('status'), constants['default'].statuses.error) ||
            utils['default'].insensitiveCompare(job.get('status'), constants['default'].statuses.failed)) {
          handleError(job.get('statusMessage'));
        }

        self.get('fileService').reloadFile(job.get('logFile')).then(function (file) {
          var fileContent = file.get('fileContent');
          var stillRunning = self.isJobRunning(job);
          var currentIndexModelId = self.get('index.model.id');
          var currentActiveTab = self.get('queryTabs.activeTab.name');

          if (fileContent) {
            job.set('log', fileContent);
          }

          //if the current model is the same with the one displayed, continue reloading job
          if (stillRunning) {
            Ember['default'].run.later(self, function () {
              this.reloadJobLogs(job);
            }, 10000);
          } else if (!stillRunning) {
            job.set('isRunning', undefined);
            job.set('retrievingLogs', false);

            if (utils['default'].insensitiveCompare(job.get('status'), constants['default'].statuses.succeeded)) {
              self.get('openQueries').updateTabSubroute(job, constants['default'].namingConventions.subroutes.jobResults);

              if (job.get('id') === currentIndexModelId && currentActiveTab === constants['default'].namingConventions.index) {
                self.transitionToRoute(constants['default'].namingConventions.subroutes.historyQuery, job.get('id'));
              }
            }
          }

        },function (err) {
          handleError(err);
        });
      }, function (err) {
        handleError(err);
      });
    },

    isJobRunning: function (job) {
      return utils['default'].insensitiveCompare(job.get('status'),
                                      constants['default'].statuses.unknown,
                                      constants['default'].statuses.initialized,
                                      constants['default'].statuses.running,
                                      constants['default'].statuses.pending);
    },

    getLogs: function () {
      var job = this.get('content');

      if (this.isJobRunning(job)) {
        if (!job.get('retrievingLogs')) {
          job.set('retrievingLogs', true);
          job.set('isRunning', true);
          this.reloadJobLogs(job);
        }
      } else if (utils['default'].insensitiveCompare(job.get('status'), constants['default'].statuses.succeeded) && !job.get('dagId')) {
        //if a job that never polled for logs is succeeded, jump straight to results tab.
        this.get('openQueries').updateTabSubroute(job, constants['default'].namingConventions.subroutes.jobResults);
        this.transitionToRoute(constants['default'].namingConventions.subroutes.historyQuery, job.get('id'));
      }
    }.observes('content')
  });

});
define('hive/controllers/index/history-query/results', ['exports', 'ember', 'hive/utils/constants', 'hive/utils/functions'], function (exports, Ember, constants, utils) {

  'use strict';


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

  exports['default'] = Ember['default'].ObjectController.extend({
    cachedResults: [],
    formattedResults: [],

    processResults: function () {
      var results = this.get('results');
      var filterValue = this.get('filterValue');
      var columns;
      var rows;
      var filteredColumns;
      var filteredRows;

      if (!results) {
        return;
      }

      columns = results.schema;
      rows = results.rows;

      if (!columns || !rows) {
        return;
      }

      columns = columns.map(function (column) {
        return {
          name: column[0],
          type: column[1],
          index: column[2] - 1 //normalize index to 0 based
        };
      });

      if (filterValue) {
        filteredColumns = columns.filter(function (column) {
          return utils['default'].insensitiveContains(column.name, filterValue);
        });

        if (filteredColumns.length < columns.length) {
          filteredRows = rows.map(function (row) {
            var updatedRow = [];

            updatedRow.pushObjects(row.filter(function (item, index) {
              return this.findBy('index', index);
            }, this));

            return updatedRow;
          }, filteredColumns);
        } else {
          filteredRows = rows;
        }
      } else {
        filteredColumns = columns;
        filteredRows = rows;
      }

      this.set('formattedResults', { columns: filteredColumns, rows: filteredRows });
    }.observes('results', 'filterValue'),

    keepAlive: function (job) {
      Ember['default'].run.later(this, function () {
        var self = this;
        var url = this.container.lookup('adapter:application').buildURL();
        url += '/' + constants['default'].namingConventions.jobs + '/' + job.get('id') + '/results/keepAlive';

        var existingJob = self.cachedResults.findBy('id', job.get('id'));

        if (existingJob) {
          Ember['default'].$.getJSON(url).fail(function (data) {
            //backend issue, this will be split in done and fail callbacks once its fixed.
            if (data.status === 404) {
              existingJob.set('results', []);
              self.set('error', data.responseJSON.message);
            } else if (data.status === 200) {
              self.keepAlive(job);
            }
          });
        }
      }, 1000 * 300);
    },

    clearCachedResultsSet: function (jobId) {
      this.set('cachedResults', this.get('cachedResults').without(this.get('cachedResults').findBy('id', jobId)));
    },

    initResults: function () {
      var existingJob;

      if (!utils['default'].insensitiveCompare(this.get('content.status'), constants['default'].statuses.succeeded)) {
        return;
      }

      existingJob = this.cachedResults.findBy('id', this.get('content.id'));

      if (existingJob) {
        this.set('results', existingJob.results.findBy('offset', existingJob.get('offset')));
      } else {
        this.send('getNextPage', true);
      }
    }.observes('content.status'),

    disableNext: function () {
      return !this.get('results.hasNext');
    }.property('results'),

    disablePrevious: function () {
      return this.cachedResults.findBy('id', this.get('content.id')).results.indexOf(this.get('results')) <= 0;
    }.property('results'),

    getResultsJson: function (job) {
      var defer = Ember['default'].RSVP.defer();
      var url = this.container.lookup('adapter:application').buildURL();
      url += '/' + constants['default'].namingConventions.jobs + '/' + job.get('id') + '/results?first=true';

      Ember['default'].$.getJSON(url).then(function (results) {
        defer.resolve(JSON.parse(results.rows[0][0]));
      }, function (err) {
        defer.reject(err);
      });

      return defer.promise;
    },

    getResult : function(url){
      var promise = new Ember['default'].RSVP.Promise(function(resolve,reject){
        var getData =  function(){
          //console.log("getData called.");
          Ember['default'].$.getJSON(url).done(function(data){
            console.log('results.js : getResult : got success data');
            resolve(data);
          }).fail(function(err){
            if(err.status == 503 && err.getResponseHeader('Retry-After')){
              var time = Number(err.getResponseHeader('Retry-After'));
              console.log("results.js : getResult : got error : " + err.status + " with retry.");
              Ember['default'].run.later(this,
              function(){
                getData();
              },time*1000);
            }else{
              console.log("results.js : getResult : rejected. ");
              reject(err);
            }
          });
        };
        getData();
      });

      return promise;
    },

    actions: {
      getNextPage: function (firstPage, job) {
        var self = this;
        var id = job ? job.get('id') : this.get('content.id');
        var existingJob = this.cachedResults.findBy('id', id);
        var resultsIndex;
        var url = this.container.lookup('adapter:application').buildURL();
        url += '/' + constants['default'].namingConventions.jobs + '/' + id + '/results';

        if (firstPage) {
          url += '?first=true';
        }

        if (existingJob) {
          resultsIndex = existingJob.results.indexOf(this.get('results'));

          if (~resultsIndex && resultsIndex < existingJob.get('results.length') - 1) {
            this.set('results', existingJob.results.objectAt(resultsIndex + 1));
            return;
          }
        }

        this.getResult(url)
        .then(function (results) {
          //console.log("inside then : ", results);
          if (existingJob) {
            existingJob.results.pushObject(results);
            existingJob.set('offset', results.offset);
          } else {
            self.cachedResults.pushObject(Ember['default'].Object.create({
              id: id,
              results: [ results ],
              offset: results.offset
            }));
          }

          //only set results if the method was called for the current model, not after a keepAlive request.
          if (!job) {
            self.set('results', results);
          }

          if (firstPage) {
            self.keepAlive(job || self.get('content'));
          }

        }, function (err) {
          self.set('error', err.responseText);
        });
      },

      getPreviousPage: function () {
        var existingJob,
            resultsIndex;

        existingJob = this.cachedResults.findBy('id', this.get('content.id'));
        resultsIndex = existingJob.results.indexOf(this.get('results'));

        if (resultsIndex > 0) {
          this.set('results', existingJob.results.objectAt(resultsIndex - 1));
        }
      },

      filterResults: function (value) {
        this.set('filterValue', value);
      }
    }
  });

});
define('hive/controllers/insert-udfs', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].ArrayController.extend({
    needs: [ constants['default'].namingConventions.udfs ],

    model: Ember['default'].A(),

    udfs: Ember['default'].computed.alias('controllers.' + constants['default'].namingConventions.udfs + '.udfs'),

    updateUdfs: function () {
      var self = this,
          udfs = this.get('udfs'),
          udfsWithoutFiles;

      this.clear();

      if (udfs && udfs.get('length')) {
        udfs.getEach('fileResource.id').uniq().forEach(function (fileResourceId) {
          if (fileResourceId) {
            self.pushObject(Ember['default'].Object.create({
              file: udfs.findBy('fileResource.id', fileResourceId).get('fileResource'),
              udfs: udfs.filterBy('fileResource.id', fileResourceId)
            }));
          }
        });

        udfsWithoutFiles = udfs.filter(function (udf) {
          return !udf.get('isNew') && !udf.get('fileResource.id');
        });

        if (udfsWithoutFiles.get('length')) {
         self.pushObject(Ember['default'].Object.create({
            name: "placeholders.select.noFileResource",
            udfs: udfsWithoutFiles
          }));
        }
      }
    }.on('init').observes('udfs.@each.isNew')
  });

});
define('hive/controllers/messages', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Controller.extend({
    notifyService: Ember['default'].inject.service(constants['default'].namingConventions.notify),

    messages: Ember['default'].computed.alias('notifyService.messages'),
    count: Ember['default'].computed.alias('notifyService.unseenMessages.length'),

    actions: {
      removeMessage: function (message) {
        this.get('notifyService').removeMessage(message);
      },

      removeAllMessages: function () {
        this.get('notifyService').removeAllMessages();
      },

      markMessagesAsSeen: function () {
        this.get('notifyService').markMessagesAsSeen();
      }
    }
  });

});
define('hive/controllers/modal-delete', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Controller.extend({
    actions: {
       "delete": function () {
        this.send('closeModal');
        this.defer.resolve();
      },

      close: function () {
        this.send('closeModal');
        this.defer.reject();
      }
    }
  });

});
define('hive/controllers/modal-save-query', ['exports', 'ember', 'hive/controllers/modal-save', 'hive/utils/constants'], function (exports, Ember, ModalSave, constants) {

  'use strict';

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

  exports['default'] = ModalSave['default'].extend({
    showMessage: function () {
      var content = this.get('content');

      return !content.get('isNew') &&
              content.get('title') === this.get('text') &&
              content.get('constructor.typeKey') !== constants['default'].namingConventions.job;
    }.property('content.isNew', 'text'),

    actions: {
      save: function () {
        this.send('closeModal');

        this.defer.resolve(Ember['default'].Object.create({
          text: this.get('text'),
          overwrite: this.get('showMessage')
        }));
      }
    }
  });

});
define('hive/controllers/modal-save', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Controller.extend({
    actions: {
      save: function () {
        this.send('closeModal');
        this.defer.resolve(this.get('text'));
        this.defer.resolve(this.get('type'));
      },

      close: function () {
        this.send('closeModal');
        this.defer.reject();
      }
    }
  });

});
define('hive/controllers/open-queries', ['exports', 'ember', 'hive/utils/constants', 'hive/utils/functions'], function (exports, Ember, constants, utils) {

  'use strict';

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

  exports['default'] = Ember['default'].ArrayController.extend({
    fileService: Ember['default'].inject.service(constants['default'].namingConventions.file),
    databaseService: Ember['default'].inject.service(constants['default'].namingConventions.database),

    needs: [ constants['default'].namingConventions.jobResults,
             constants['default'].namingConventions.jobExplain,
             constants['default'].namingConventions.index
           ],

    jobResults: Ember['default'].computed.alias('controllers.' + constants['default'].namingConventions.jobResults),
    jobExplain: Ember['default'].computed.alias('controllers.' + constants['default'].namingConventions.jobExplain),
    index: Ember['default'].computed.alias('controllers.' + constants['default'].namingConventions.index),

    selectedTables: Ember['default'].computed.alias('databaseService.selectedTables'),
    selectedDatabase: Ember['default'].computed.alias('databaseService.selectedDatabase'),

    init: function () {
      this._super();

      this.set('queryTabs', Ember['default'].ArrayProxy.create({ content: Ember['default'].A([])}));
    },

    pushObject: function (queryFile, model) {
      return this._super(queryFile || Ember['default'].Object.create({
        id: model.get('id'),
        fileContent: ""
      }));
    },

    getTabForModel: function (model) {
      return this.get('queryTabs').find(function (tab) {
        return tab.id === model.get('id') && tab.type === model.get('constructor.typeKey');
      });
    },

    updateTabSubroute: function (model, path) {
      var tab = this.get('queryTabs').find(function (tab) {
        return tab.id === model.get('id') && tab.type === model.get('constructor.typeKey');
      });

      if (tab) {
        tab.set('subroute', path);
      }
    },

    getQueryForModel: function (model) {
      return this.find(function (openQuery) {
        if (model.get('isNew')) {
          return openQuery.get('id') === model.get('id');
        }

        return openQuery.get('id') === model.get('queryFile');
      });
    },

    update: function (model) {
      var path,
          type,
          currentQuery,
          defer = Ember['default'].RSVP.defer(),
          existentTab,
          self = this,
          updateSubroute = function () {
            var isExplainedQuery,
                subroute;

            //jobs that were run from hive ui (exclude ats jobs)
            if (model.get('constructor.typeKey') === constants['default'].namingConventions.job &&
                utils['default'].isInteger(model.get('id'))) {
              isExplainedQuery = self.get('currentQuery.fileContent').indexOf(constants['default'].namingConventions.explainPrefix) > -1;

              if (isExplainedQuery) {
                subroute = constants['default'].namingConventions.subroutes.jobExplain;
              } else {
                subroute = constants['default'].namingConventions.subroutes.jobLogs;
              }

              if (!existentTab.get('subroute')) {
                self.updateTabSubroute(model, subroute);
              }
            }

            defer.resolve(isExplainedQuery);
          };

      existentTab = this.getTabForModel(model);

      if (!existentTab) {
        type = model.get('constructor.typeKey');
        path = type === constants['default'].namingConventions.job ?
               constants['default'].namingConventions.subroutes.historyQuery :
               constants['default'].namingConventions.subroutes.savedQuery;

        existentTab = this.get('queryTabs').pushObject(Ember['default'].Object.create({
          name: model.get('title'),
          id: model.get('id'),
          visible: true,
          path: path,
          type: type
        }));

        if (model.get('isNew')) {
          this.set('currentQuery', this.pushObject(null, model));

          defer.resolve();
        } else {
          this.get('fileService').loadFile(model.get('queryFile')).then(function (file) {
            self.set('currentQuery', self.pushObject(file));

            updateSubroute();
          });

          if (model.get('logFile') && !model.get('log')) {
            this.get('fileService').loadFile(model.get('logFile')).then(function (file) {
              model.set('log', file.get('fileContent'));
            });
          }
        }
      } else {
        currentQuery = this.getQueryForModel(model);
        this.set('currentQuery', currentQuery);

        updateSubroute();
      }

      return defer.promise;
    },

    save: function (model, query, isUpdating, newTitle) {
      var tab = this.getTabForModel(model),
          self = this,
          wasNew,
          defer = Ember['default'].RSVP.defer(),
          jobModel = model;

      if (!query) {
        query = this.getQueryForModel(model);
      }

      if (model.get('isNew')) {
        wasNew = true;
        model.set('title', newTitle);
        model.set('id', null);
      }

      //if current query it's a job, convert it to a savedQuery before saving
      if (model.get('constructor.typeKey') === constants['default'].namingConventions.job) {
        model = this.store.createRecord(constants['default'].namingConventions.savedQuery, {
          dataBase: this.get('selectedDatabase.name'),
          title: newTitle,
          queryFile: model.get('queryFile'),
          owner: model.get('owner')
        });
      }

      tab.set('name', newTitle);

      //if saving a new query from an existing one create a new record and save it
      if (!isUpdating && !model.get('isNew') && model.get('constructor.typeKey') !== constants['default'].namingConventions.job) {
        model = this.store.createRecord(constants['default'].namingConventions.savedQuery, {
          dataBase: this.get('selectedDatabase.name'),
          title: newTitle,
          owner: model.get('owner')
        });

        wasNew = true;
      }

      model.save().then(function (updatedModel) {
        jobModel.set('queryId', updatedModel.get('id'));

        tab.set('isDirty', false);

        var content = query.get('fileContent');
        content = self.get('index').buildQuery(query);
        content = self.get('index').bindQueryParams(content);

        //update query tab path with saved model id if its a new record
        if (wasNew) {
          tab.set('id', updatedModel.get('id'));

          self.get('fileService').loadFile(updatedModel.get('queryFile')).then(function (file) {
            file.set('fileContent', content);
            file.save().then(function (updatedFile) {
              self.removeObject(query);
              self.pushObject(updatedFile);
              self.set('currentQuery', updatedFile);

              defer.resolve(updatedModel.get('id'));
            }, function (err) {
              defer.reject(err);
            });
          }, function (err) {
            defer.reject(err);
          });
        } else {
          query.set('fileContent', content);
          query.save().then(function () {
            self.toggleProperty('tabUpdated');
            defer.resolve(updatedModel.get('id'));

          }, function (err) {
            defer.reject(err);
          });
        }
      }, function (err) {
        defer.reject(err);
      });

      return defer.promise;
    },

    convertTabToJob: function (model, job) {
      var defer = Ember['default'].RSVP.defer(),
          oldQuery = this.getQueryForModel(model),
          tab = this.getTabForModel(model),
          jobId = job.get('id'),
          self = this;

      tab.set('id', job.get('id'));
      tab.set('type', constants['default'].namingConventions.job);
      tab.set('path', constants['default'].namingConventions.subroutes.historyQuery);

      this.get('fileService').loadFile(job.get('queryFile')).then(function (file) {
        //replace old model representing file to reflect model update to job
        if (self.keepOriginalQuery(jobId)) {
          file.set('fileContent', oldQuery.get('fileContent'));
        }

        // Rollback the oldQuery if it is a DS model (type: 'savedQuery)
        if (oldQuery.get('constructor.typeKey') !== undefined) {
          oldQuery.rollback();
        }

        self.removeObject(oldQuery);
        self.pushObject(file);

        defer.resolve();
      }, function (err) {
        defer.reject(err);
      });

      return defer.promise;
    },

    keepOriginalQuery: function () {
      var selected = this.get('highlightedText');
      var hasQueryParams = this.get('index.queryParams.length');

      return selected && selected[0] !== "" || hasQueryParams;
    },

    isDirty: function (model) {
      var query = this.getQueryForModel(model);

      if (model.get('isNew') && !query.get('fileContent')) {
        return false;
      }

      if (query && query.get('isDirty')) {
        return true;
      }

      return !!(!model.get('queryId') && model.get('isDirty'));
    },

    updatedDeletedQueryTab: function (model) {
      var tab = this.getTabForModel(model);

      if (tab) {
        this.closeTab(tab);
      }
    },

    dirtyObserver: function () {
      var tab;
      var model = this.get('index.model');

      if (model) {
        tab = this.getTabForModel(model);

        if (tab) {
          tab.set('isDirty', this.isDirty(model));
        }
      }
    }.observes('currentQuery.isDirty', 'currentQuery.fileContent'),

    closeTab: function (tab, goToNextTab) {
      var remainingTabs = this.get('queryTabs').without(tab);

      this.set('queryTabs', remainingTabs);

      //remove cached results set
      if (tab.type === constants['default'].namingConventions.job) {
        this.get('jobResults').clearCachedResultsSet(tab.id);
        this.get('jobExplain').clearCachedExplainSet(tab.id);
      }

      if (goToNextTab) {
        this.navigateToLastTab();
      }
    },

    navigateToLastTab: function () {
      var lastTab = this.get('queryTabs.lastObject');

      if (lastTab) {
        if (lastTab.type === constants['default'].namingConventions.job) {
          this.transitionToRoute(constants['default'].namingConventions.subroutes.historyQuery, lastTab.id);
        } else {
          this.transitionToRoute(constants['default'].namingConventions.subroutes.savedQuery, lastTab.id);
        }
      } else {
        this.get('index').send('addQuery');
      }
    },

    actions: {
      removeQueryTab: function (tab) {
        var self = this,
            defer;

        this.store.find(tab.type, tab.id).then(function (model) {
          var query = self.getQueryForModel(model);

          if (!self.isDirty(model)) {
            self.closeTab(tab, true);
          } else {
            defer = Ember['default'].RSVP.defer();
            self.send('openModal',
                      'modal-save',
                       {
                          heading: "modals.save.saveBeforeCloseHeading",
                          text: model.get('title'),
                          defer: defer
                       });

            defer.promise.then(function (text) {
              model.set('title', text);
              self.save(model, query, false, text).then(function () {
                self.closeTab(tab, true);
              });
            }, function () {
              model.rollback();
              query.rollback();
              self.closeTab(tab, true);
            });
          }
        });
      },

      getColumnsForAutocomplete: function (tableName, callback) {
        this.get('databaseService').getAllColumns(tableName).then(function () {
          callback();
        });
      },

      changeTabTitle: function(tab) {
        var self = this,
            defer = Ember['default'].RSVP.defer(),
            title = this.get('index.content.title');

        this.send('openModal', 'modal-save', {
          heading: 'modals.changeTitle.heading',
          text: title,
          defer: defer
        });

        defer.promise.then(function (result) {
          self.set('index.model.title', result);
          tab.set('name', result);
        });
      }
    }
  });

});
define('hive/controllers/queries', ['exports', 'ember', 'hive/mixins/filterable', 'hive/utils/constants'], function (exports, Ember, FilterableMixin, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].ArrayController.extend(FilterableMixin['default'], {
    needs: [ constants['default'].namingConventions.routes.history,
             constants['default'].namingConventions.openQueries ],

    history: Ember['default'].computed.alias('controllers.' + constants['default'].namingConventions.routes.history),
    openQueries: Ember['default'].computed.alias('controllers.' + constants['default'].namingConventions.openQueries),

    sortAscending: true,
    sortProperties: [],

    init: function () {
      this._super();

      this.set('columns', Ember['default'].ArrayProxy.create({ content: Ember['default'].A([
         Ember['default'].Object.create({
          caption: "columns.shortQuery",
          property: 'shortQuery',
          link: constants['default'].namingConventions.subroutes.savedQuery
        }),
        Ember['default'].Object.create({
          caption: "columns.title",
          property: 'title',
          link: constants['default'].namingConventions.subroutes.savedQuery
        }),
        Ember['default'].Object.create({
          caption: "columns.database",
          property: 'dataBase',
          link: constants['default'].namingConventions.subroutes.savedQuery
        }),
        Ember['default'].Object.create({
          caption: "columns.owner",
          property: 'owner',
          link: constants['default'].namingConventions.subroutes.savedQuery
        })
      ])}));
    },

    //row buttons
    links: [
      "buttons.history",
      "buttons.delete"
    ],

    model: function () {
      return this.filter(this.get('queries'));
    }.property('queries', 'filters.@each'),

    actions: {
      executeAction: function (action, savedQuery) {
        var self = this;

        switch (action) {
          case "buttons.history":
            this.get('history').filterBy('queryId', savedQuery.get('id'), true);
            this.transitionToRoute(constants['default'].namingConventions.routes.history);
            break;
          case "buttons.delete":
            var defer = Ember['default'].RSVP.defer();
            this.send('openModal',
                      'modal-delete',
                       {
                          heading: "modals.delete.heading",
                          text: "modals.delete.message",
                          defer: defer
                       });

            defer.promise.then(function () {
              savedQuery.destroyRecord();
              self.get('openQueries').updatedDeletedQueryTab(savedQuery);
            });

            break;
        }
      },

      sort: function (property) {
        //if same column has been selected, toggle flag, else default it to true
        if (this.get('sortProperties').objectAt(0) === property) {
          this.set('sortAscending', !this.get('sortAscending'));
        } else {
          this.set('sortAscending', true);
          this.set('sortProperties', [ property ]);
        }
      },

      clearFilters: function () {
        var columns = this.get('columns');

        if (columns) {
          columns.forEach(function (column) {
            var filterValue = column.get('filterValue');

            if (filterValue && typeof filterValue === 'string') {
              column.set('filterValue');
            }
          });
        }

        //call clear filters from Filterable mixin
        this.clearFilters();
      }
    }
  });

});
define('hive/controllers/query-tabs', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Controller.extend({
    jobProgressService: Ember['default'].inject.service(constants['default'].namingConventions.jobProgress),
    openQueries   : Ember['default'].inject.controller(constants['default'].namingConventions.openQueries),
    notifyService: Ember['default'].inject.service(constants['default'].namingConventions.notify),
    index: Ember['default'].inject.controller(),

    tabClassNames : "fa queries-icon query-context-tab",

    tabs: [
      Ember['default'].Object.create({
        iconClass: 'text-icon',
        id: 'query-icon',
        text: 'SQL',
        action: 'setDefaultActive',
        name: constants['default'].namingConventions.index,
        tooltip: Ember['default'].I18n.t('tooltips.query')
      }),
      Ember['default'].Object.create({
        iconClass: 'fa-gear',
        id: 'settings-icon',
        action: 'toggleOverlay',
        template: 'settings',
        outlet: 'overlay',
        into: 'open-queries',
        tooltip: Ember['default'].I18n.t('tooltips.settings')
      }),
      Ember['default'].Object.create({
        iconClass: 'fa-area-chart',
        id: 'visualization-icon',
        action: 'toggleOverlay',
        tooltip: Ember['default'].I18n.t('tooltips.visualization'),
        into: 'index',
        outlet: 'overlay',
        template: 'visualization-ui',
        onTabOpen: 'onTabOpen'
      }),
      Ember['default'].Object.create({
        iconClass: 'fa-link',
        id: 'visual-explain-icon',
        action: 'toggleOverlay',
        template: 'visual-explain',
        outlet: 'overlay',
        into: 'index',
        onTabOpen: 'onTabOpen',
        tooltip: Ember['default'].I18n.t('tooltips.visualExplain')
      }),
      Ember['default'].Object.create({
        iconClass: 'text-icon',
        id: 'tez-icon',
        text: 'TEZ',
        action: 'toggleOverlay',
        template: 'tez-ui',
        outlet: 'overlay',
        into: 'index',
        tooltip: Ember['default'].I18n.t('tooltips.tez')
      }),
      Ember['default'].Object.create({
        iconClass: 'fa-envelope',
        id: 'notifications-icon',
        action: 'toggleOverlay',
        template: 'messages',
        outlet: 'overlay',
        into: 'index',
        badgeProperty: 'count',
        onTabOpen: 'markMessagesAsSeen',
        tooltip: Ember['default'].I18n.t('tooltips.notifications')
      })
    ],

    init: function() {
      this.setupControllers();
      this.setDefaultTab();
      this.setupTabsBadges();
    },

    setupControllers: function() {
      var tabs = this.get('tabs');
      var self = this;

      tabs.map(function (tab) {
        var controller;

        if (tab.get('template')) {
          controller = self.container.lookup('controller:' + tab.get('template'));
          tab.set('controller', controller);
        }
      });
    },

    setDefaultTab: function () {
      var defaultTab = this.get('tabs.firstObject');

      defaultTab.set('active', true);

      this.set('default', defaultTab);
      this.set('activeTab', defaultTab);
    },

    setupTabsBadges: function () {
      var tabs = this.get('tabs').filterProperty('badgeProperty');

      tabs.map(function (tab) {
          Ember['default'].oneWay(tab, 'badge', 'controller.' + tab.badgeProperty);
      });
    },

    closeActiveOverlay: function () {
      this.send('closeOverlay', this.get('activeTab'));
    },

    onTabOpen: function (tab) {
      if (!tab.onTabOpen) {
        return;
      }

      var controller = this.container.lookup('controller:' + tab.template);
      controller.send(tab.onTabOpen, controller);
    },

    openOverlay: function (tab) {
      this.closeActiveOverlay();
      this.set('activeTab.active', false);
      tab.set('active', true);
      this.set('activeTab', tab);

      this.onTabOpen(tab);
      this.send('openOverlay', tab);
    },

    setDefaultActive: function () {
      var activeTab = this.get('activeTab');
      var defaultTab = this.get('default');

      if (activeTab !== defaultTab) {
        this.closeActiveOverlay();
        defaultTab.set('active', true);
        activeTab.set('active', false);
        this.set('activeTab', defaultTab);
      }
    },

    actions: {
      toggleOverlay: function (tab) {
        if (tab !== this.get('default') && tab.get('active')) {
          this.setDefaultActive();
        } else {
          this.openOverlay(tab);
        }
      },

      setDefaultActive: function () {
        this.setDefaultActive();
      }
    }
  });

});
define('hive/controllers/settings', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Controller.extend({
    openQueries: Ember['default'].inject.controller(),
    index: Ember['default'].inject.controller(),

    settingsService: Ember['default'].inject.service('settings'),

    predefinedSettings: Ember['default'].computed.alias('settingsService.predefinedSettings'),
    settings: Ember['default'].computed.alias('settingsService.settings'),

    init: function() {
      this._super();

      this.get('settingsService').loadDefaultSettings();
    },

    excluded: function() {
      var settings = this.get('settings');

      return this.get('predefinedSettings').filter(function(setting) {
        return settings.findBy('key.name', setting.name);
      });
    }.property('settings.@each.key'),

    parseGlobalSettings: function () {
      this.get('settingsService').parseGlobalSettings(this.get('openQueries.currentQuery'), this.get('index.model'));
    }.observes('openQueries.currentQuery', 'openQueries.currentQuery.fileContent', 'openQueries.tabUpdated').on('init'),

    actions: {
      add: function () {
        this.get('settingsService').add();
      },

      remove: function (setting) {
        this.get('settingsService').remove(setting);
      },

      addKey: function (name) {
        this.get('settingsService').createKey(name);
      },

      removeAll: function () {
        this.get('settingsService').removeAll();
      },

      saveDefaultSettings: function() {
        this.get('settingsService').saveDefaultSettings();
      }
    }
  });

});
define('hive/controllers/tez-ui', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Controller.extend({
    needs: [ constants['default'].namingConventions.index ],

    index: Ember['default'].computed.alias('controllers.' + constants['default'].namingConventions.index),

    tezViewURL: null,
    tezApiURL: '/api/v1/views/TEZ',
    tezURLPrefix: '/views/TEZ',
    tezDagPath: '?viewPath=/#/dag/',

    isTezViewAvailable: Ember['default'].computed.bool('tezViewURL'),

    dagId: function () {
      if (this.get('isTezViewAvailable')) {
        return this.get('index.model.dagId');
      }

      return false;
    }.property('index.model.dagId', 'isTezViewAvailable'),

    dagURL: function () {
      if (this.get('dagId')) {
        return "%@%@%@".fmt(this.get('tezViewURL'), this.get('tezDagPath'), this.get('dagId'));
      }

      return false;
    }.property('dagId'),

    getTezView: function () {
      if (this.get('isTezViewAvailable')) {
        return;
      }

      var self = this;
      Ember['default'].$.getJSON(this.get('tezApiURL'))
        .then(function (response) {
          self.getTezViewInstance(response);
        })
        .fail(function (response) {
          self.setTezViewError(response);
        });
    }.on('init'),

    getTezViewInstance: function (data) {
      var self = this;
      var url = data.versions[0].href;

      Ember['default'].$.getJSON(url)
        .then(function (response) {
          if (!response.instances.length) {
            self.setTezViewError(response);
            return;
          }

          self.set('isTezViewAvailable', true);

          var instance = response.instances[0].ViewInstanceInfo;
          self.setTezViewURL(instance);
        });
    },

    setTezViewURL: function (instance) {
      var url = "%@/%@/%@/".fmt(
        this.get('tezURLPrefix'),
        instance.version,
        instance.instance_name
      );

      this.set('tezViewURL', url);
    },

    setTezViewError: function (data) {
      // status: 404 => Tev View isn't deployed
      if (data.status && data.status === 404) {
        this.set('error', 'tez.errors.not.deployed');
        return;
      }

      // no instance created
      if (data.instances && !data.instances.length) {
        this.set('error', 'tez.errors.no.instance');
        return;
      }
    }
  });

});
define('hive/controllers/udfs', ['exports', 'ember', 'hive/mixins/filterable', 'hive/utils/constants'], function (exports, Ember, FilterableMixin, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].ArrayController.extend(FilterableMixin['default'], {
    fileResources: [],

    sortAscending: true,
    sortProperties: [],

    columns: [
      Ember['default'].Object.create({
        caption: 'placeholders.udfs.name',
        property: 'name'
      }),
      Ember['default'].Object.create({
        caption: 'placeholders.udfs.className',
        property: 'classname'
      })
    ],

    model: function () {
      return this.filter(this.get('udfs'));
    }.property('udfs', 'filters.@each'),

    actions: {
      handleAddFileResource: function (udf) {
        var file = this.store.createRecord(constants['default'].namingConventions.fileResource);
        udf.set('fileResource', file);
        udf.set('isEditingResource', true);
      },

      handleDeleteFileResource: function (file) {
        var defer = Ember['default'].RSVP.defer();

        this.send('openModal',
                  'modal-delete',
                   {
                      heading: 'modals.delete.heading',
                      text: 'modals.delete.message',
                      defer: defer
                   });

        defer.promise.then(function () {
          file.destroyRecord();
        });
      },

      handleSaveUdf: function (udf) {
        var self = this,
            saveUdf = function () {
              udf.save().then(function () {
                udf.set('isEditing', false);
                udf.set('isEditingResource', false);
              });
            };

        //replace with a validation system if needed.
        if (!udf.get('name') || !udf.get('classname')) {
          return;
        }

        udf.get('fileResource').then(function (file) {
          if (file) {
            if (!file.get('name') || !file.get('path')) {
              return;
            }

            file.save().then(function () {
              saveUdf();
            });
          } else {
            saveUdf();
          }
        });
      },

      handleDeleteUdf: function (udf) {
        var defer = Ember['default'].RSVP.defer();

        this.send('openModal',
                  'modal-delete',
                   {
                      heading: 'modals.delete.heading',
                      text: 'modals.delete.message',
                      defer: defer
                   });

        defer.promise.then(function () {
          udf.destroyRecord();
        });
      },

      sort: function (property) {
        //if same column has been selected, toggle flag, else default it to true
        if (this.get('sortProperties').objectAt(0) === property) {
          this.set('sortAscending', !this.get('sortAscending'));
        } else {
          this.set('sortAscending', true);
          this.set('sortProperties', [ property ]);
        }
      },

      add: function () {
        this.store.createRecord(constants['default'].namingConventions.udf);
      },

      clearFilters: function () {
        var columns = this.get('columns');

        if (columns) {
          columns.forEach(function (column) {
            var filterValue = column.get('filterValue');

            if (filterValue && typeof filterValue === 'string') {
              column.set('filterValue');
            }
          });
        }

        //call clear filters from Filterable mixin
        this.clearFilters();
      }
    }
  });

});
define('hive/controllers/upload-table', ['exports', 'ember', 'hive/adapters/upload-table', 'hive/utils/constants'], function (exports, Ember, Uploader, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Controller.extend({
    notifyService: Ember['default'].inject.service(constants['default'].namingConventions.notify),
    needs : ['databases'],
    showErrors : false,
    uploader: Uploader['default'].create(),
    baseUrl: "/resources/upload",
    isFirstRowHeader: null, // is first row  header
    header: null,  // header received from server
    files: null, // files that need to be uploaded only file[0] is relevant
    firstRow: [], // the actual first row of the table.
    rows: null,  // preview rows received from server
    databaseName:null,
    selectedDatabase : null,
    filePath : null,
    tableName: null,
    dataTypes : [
       "TINYINT", //
       "SMALLINT", //
       "INT", //
       "BIGINT", //
       "BOOLEAN", //
       "FLOAT", //
       "DOUBLE", //
       "STRING", //
       "BINARY", // -- (Note: Available in Hive 0.8.0 and later)
       "TIMESTAMP", // -- (Note: Available in Hive 0.8.0 and later)
       "DECIMAL", // -- (Note: Available in Hive 0.11.0 and later)
       "DATE", // -- (Note: Available in Hive 0.12.0 and later)
       "VARCHAR", // -- (Note: Available in Hive 0.12.0 and later)
       "CHAR" // -- (Note: Available in Hive 0.13.0 and later)
    ],
    isFirstRowHeaderDidChange: function () {
      console.log("inside onFirstRowHeader : isFirstRowHeader : " + this.get('isFirstRowHeader'));
      if (this.get('isFirstRowHeader') != null && typeof this.get('isFirstRowHeader') !== 'undefined') {
        if (this.get('isFirstRowHeader') == false) {
          if (this.get('rows')) {
            this.get('rows').unshiftObject({row: this.get('firstRow')});
          }
        } else {
          // take first row of
          this.get('header').forEach(function (item, index) {
            console.log("item : ", item);
            console.log("this.get('firstRow').objectAt(index)  : ", this.get('firstRow').objectAt(index));
            Ember['default'].set(item, 'name', this.get('firstRow')[index]);
          }, this);

          this.get('rows').removeAt(0);
        }

        this.printValues();
      }
    }.observes('isFirstRowHeader'),

    uploadForPreview: function (files) {
      console.log("uploaderForPreview called.");
      return this.get('uploader').uploadFiles('preview', files);
    },

    clearFields: function () {
      this.set("header");
      this.set("rows");
      this.set("error");
      this.set('isFirstRowHeader');
      this.set('files');
      this.set("firstRow");
      this.set("selectedDatabase");
      this.set("databaseName");
      this.set("filePath");
      this.set('tableName');

      this.printValues();
    },

    printValues: function () {
      console.log("printing all values : ");
      console.log("header : ", this.get('header'));
      console.log("rows : ", this.get('rows'));
      console.log("error : ", this.get('error'));
      console.log("isFirstRowHeader : ", this.get('isFirstRowHeader'));
      console.log("files : ", this.get('files'));
      console.log("firstRow : ", this.get('firstRow'));
    },
    previewTable: function (data) {
      console.log('inside previewTable');
      this.set("header", data.header);
      this.set("rows", data.rows);
      this.set("firstRow", data.rows[0].row);
      console.log("firstRow : ", this.get('firstRow'));
      this.set('isFirstRowHeader', data.isFirstRowHeader);
    },

    fetchCreateTableStatus: function (jobId, resolve, reject) {
      var self = this;
      this.get('uploader').getCreateTableResult(jobId).then(function (data) {
        console.log("fetchCreateTableStatus : data : ", data);
        var status = data.status;
        if (status == "Succeeded") {
          console.log("resolving fetchCreateTableStatus with : " + data);
          resolve(status);
        } else if (status == "Canceled" || status == "Closed" || status == "Error") {
          console.log("rejecting fetchCreateTableStatus with : " + status);
          reject(new Error(status));
        } else {
          console.log("retrying fetchCreateTableStatus : ");
          self.fetchCreateTableStatus(jobId, resolve, reject);
        }
      }, function (error) {
        console.log("rejecting fetchCreateTableStatus with : " + error);
        reject(error);
      })
    },

    waitForResult: function (jobId) {
      var self = this;
      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        self.fetchCreateTableStatus(jobId,resolve,reject);
      });
    },

    createTable: function () {
      var headers = JSON.stringify(this.get('header'));

      var selectedDatabase = this.get('selectedDatabase');
      if( null == selectedDatabase || typeof selectedDatabase === 'undefined'){
        throw new Error(constants['default'].hive.errors.emptyDatabase);
      }

      this.set('databaseName',this.get('selectedDatabase').get('name'));
      var databaseName = this.get('databaseName');
      var tableName = this.get('tableName');
      var isFirstRowHeader = this.get('isFirstRowHeader');
      console.log("databaseName : " , databaseName, ", tableName : ", tableName, ", isFirstRowHeader : " , isFirstRowHeader , ", headers : ", headers);

      if( null == databaseName || typeof databaseName === 'undefined'){
        throw new Error(constants['default'].hive.errors.emptyDatabase);
      }
      if( null == tableName || typeof tableName === 'undefined'){
        throw new Error(constants['default'].hive.errors.emptyTableName);
      }
      if( null == isFirstRowHeader || typeof isFirstRowHeader === 'undefined'){
        throw new Error(constants['default'].hive.errors.emptyIsFirstRow);
      }

      this.validateColumns();

      return this.get('uploader').createTable({
        "isFirstRowHeader": isFirstRowHeader,
        "header": headers,
        "tableName": tableName,
        "databaseName": databaseName
      });
    },

    validateColumns: function(){
      // TODO :check validation of columnames.
      // throw exception if invalid.
    },
    setError: function(error){
      this.set('error',JSON.stringify(error));
      console.log("upload table error : ",error);
      this.get('notifyService').error(error);
    },

    previewError: function (error) {
      this.setError(error);
    },

    uploadTable: function () {
      this.printValues();
      return this.get('uploader').uploadFiles('upload', this.get('files'), {
        "isFirstRowHeader": this.get("isFirstRowHeader"),
        "filePath": this.get('filePath')
      });
    },

    onUploadSuccessfull: function (data) {
      console.log("onUploadSuccessfull : ", data);
      this.get('notifyService').success( "Uploaded Successfully", "Table " + this.get('tableName') + " created in database " + this.get("databaseName"));
      this.clearFields();
    },

    onUploadError: function (error) {
      console.log("onUploadError : ", error);
      this.setError(error);
    },

    actions: {
      toggleErrors : function(){
        this.toggleProperty('showErrors');
      },
      filesUploaded: function (files) {
        console.log("upload-table.js : uploaded new files : ", files);

        this.clearFields();

        this.set('files', files);
        var name = files[0].name;
        var i = name.indexOf(".");
        var tableName = name.substr(0, i);
        this.set('tableName', tableName);
        var self = this;
        return this.uploadForPreview(files).then(function (data) {
          self.previewTable(data);
        }, function (error) {
          self.previewError(error);
        });
      },

      createTableAndUploadFile: function () {
        var self = this;

        try {
          this.createTable()
            .then(function (jobData) {
              console.log("jobData : ", jobData);
              self.set('filePath', jobData.filePath);
              self.waitForResult(jobData.jobId)
                .then(function (successStatus) {
                  console.log("successStatus : ", successStatus);
                  self.uploadTable().then(function (operationData) {
                    console.log("operation successfull operationData : ", operationData);
                    self.onUploadSuccessfull(operationData);
                  }, function (error) {
                    self.onUploadError(error);
                  });
                }, function (error) {
                  self.onUploadError(error);
                })
            }, function (error) {
              self.onUploadError(error);
            })
        }catch(e){
          self.onUploadError(e);
        }
      }

    }
  });

});
define('hive/controllers/visual-explain', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Controller.extend({
    jobProgressService: Ember['default'].inject.service(constants['default'].namingConventions.jobProgress),
    openQueries   : Ember['default'].inject.controller(constants['default'].namingConventions.openQueries),
    notifyService: Ember['default'].inject.service(constants['default'].namingConventions.notify),

    index: Ember['default'].inject.controller(),
    verticesProgress: Ember['default'].computed.alias('jobProgressService.currentJob.stages'),

    actions: {
      onTabOpen: function () {
        var self = this;

        // Empty query
        if(this.get('openQueries.currentQuery.fileContent').length == 0){
          this.set('json', undefined);
          this.set('noquery', 'hive.errors.no.query');
          return;
        } else {
          this.set('noquery', undefined);
        }
        // Introducing a common function
        var getVisualExplainJson = function(){
          self.set('rerender');
          self.get('index')._executeQuery(constants['default'].jobReferrer.visualExplain, true, true).then(function (json) {
            //this condition should be changed once we change the way of retrieving this json
            if (json['STAGE PLANS']['Stage-1']) {
              self.set('json', json);
            } else {
              self.set('json', {})
            }
          }, function (error) {
            self.set('json', undefined);
            self.get('notifyService').error(error);
          });
          self.toggleProperty('shouldChangeGraph');
        }

        if(this.get('json') == undefined) {
          getVisualExplainJson();

        } else if (this.get('shouldChangeGraph')){
          getVisualExplainJson();

        } else {
          this.set('rerender', true);
          return;
        }

      }
    }
  });

});
define('hive/controllers/visualization-ui', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Controller.extend({
    selectedRowCount: constants['default'].defaultVisualizationRowCount,
    needs: [ constants['default'].namingConventions.index,
              constants['default'].namingConventions.openQueries,
              constants['default'].namingConventions.jobResults
            ],
    index         : Ember['default'].computed.alias('controllers.' + constants['default'].namingConventions.index),
    openQueries   : Ember['default'].computed.alias('controllers.' + constants['default'].namingConventions.openQueries),
    results   : Ember['default'].computed.alias('controllers.' + constants['default'].namingConventions.jobResults),
    notifyService: Ember['default'].inject.service(constants['default'].namingConventions.notify),

    polestarUrl: '',
    voyagerUrl: '',
    polestarPath: 'polestar/#/',
    voyagerPath: 'voyager/#/',

    showDataExplorer: true,
    showAdvVisulization: false,

    visualizationTabs: function () {
      return [
        Ember['default'].Object.create({
          name: 'Data Visualization',
          id: 'visualization',
          url: this.get('polestarUrl')
        }),
        Ember['default'].Object.create({
          name: 'Data Explorer',
          id: 'data_explorer',
          url: this.get('voyagerUrl')
        })
      ]
    }.property('polestarUrl', 'voyagerUrl'),

    activeTab: function () {
      console.log("I am in activeTab function.");
      this.get('visualizationTabs')[0].active = this.get("showDataExplorer");
      this.get('visualizationTabs')[1].active = this.get("showAdvVisulization");
    }.observes('polestarUrl', 'voyagerUrl'),

    alterIframe: function () {
      Ember['default'].$("#visualization_frame").height(Ember['default'].$("#visualization").height());
    },

    actions: {
      onTabOpen: function () {
        var self = this;
        var model = this.get('index.model');
        if (model) {
          var existingJob = this.get('results').get('cachedResults').findBy('id', model.get('id'));
          var url = this.container.lookup('adapter:application').buildURL();
          url += '/' + constants['default'].namingConventions.jobs + '/' + model.get('id') + '/results?&first=true';
          url += '&count='+self.get('selectedRowCount')+'&job_id='+model.get('id')
          if (existingJob) {
            if(existingJob.results[0].rows.length === 0){
              this.set("error", "Query has insufficient results to visualize the data.");
              return;
            }
            this.set("error", null);
            var id = model.get('id');
            this.set("polestarUrl", this.get('polestarPath') + "?url=" + url);
            this.set("voyagerUrl", this.get('voyagerPath') + "?url=" + url);
            Ember['default'].run.scheduleOnce('afterRender', this, function(){
              self.alterIframe();
            });
          } else {
            this.set("error", "No visualization available. Please execute a query and wait for the results to visualize the data.");
          }
        }
      },

        changeRowCount: function () {
          var self = this;
          if(isNaN(self.get('selectedRowCount')) || !(self.get('selectedRowCount')%1 === 0) || (self.get('selectedRowCount') <= 0)){
            self.get('notifyService').error("Please enter a posive integer number.");
            return;
          }
          var model = this.get('index.model');
          if (model) {
            var existingJob = this.get('results').get('cachedResults').findBy('id', model.get('id'));
            var url = this.container.lookup('adapter:application').buildURL();
            url += '/' + constants['default'].namingConventions.jobs + '/' + model.get('id') + '/results?&first=true';
            url += '&count='+self.get('selectedRowCount')+'&job_id='+model.get('id');
            if (existingJob) {
              this.set("error", null);
              var id = model.get('id');

              $('.nav-tabs.visualization-tabs li.active').each(function( index ) {

                if($(this)[index].innerText.indexOf("Data Explorer") > -1){
                  self.set("showDataExplorer",true);
                  self.set("showAdvVisulization",false);
                  self.set("voyagerUrl", self.get('voyagerPath') + "?url=" + url);
                  self.set("polestarUrl", self.get('polestarPath') + "?url=" + url);
                  document.getElementById("visualization_frame").src =  self.get("voyagerUrl");
                }
                if($(this)[index].innerText.indexOf("Advanced Visualization") > -1){
                  self.set("showAdvVisulization",true);
                  self.set("showDataExplorer",false);
                  self.set("voyagerUrl", self.get('voyagerPath') + "?url=" + url);
                  self.set("polestarUrl", self.get('polestarPath') + "?url=" + url);
                  document.getElementById("visualization_frame").src = self.get("polestarUrl");
                }
              })
              document.getElementById("visualization_frame").contentWindow.location.reload();
            } else {
              this.set("error", "No visualization available. Please execute a query and wait for the results to visualize data.");
            }
          }

        }
    }
  });

});
define('hive/helpers/all-uppercase', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.allUppercase = allUppercase;

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

  function allUppercase (input) {
    return input ? input.toUpperCase() : input;
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(allUppercase);

});
define('hive/helpers/code-helper', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.code = code;

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

  function code (text) {
    text = Ember['default'].Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');

    return new Ember['default'].Handlebars.SafeString('<code>' + text + '</code>');
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(code);

});
define('hive/helpers/date-binding', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.pathBinding = pathBinding;

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

  /* globals moment */

  function pathBinding (data, key) {
    return moment(data.get(key)).fromNow();
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(pathBinding);

});
define('hive/helpers/dynamic-component', ['exports', 'ember', 'ember-dynamic-component'], function (exports, Ember, ember_dynamic_component) {

  'use strict';

  exports['default'] = function(options) {
    Ember['default'].assert("You can only pass attributes (such as name=value) not bare " +
                     "values to {{dynamic-component}} '", arguments.length < 2);

    // pass the options through to the resulting view
    // is there a valid type to use here?
    // this works but...
    options.hashTypes['_dynamicOptions'] = "OBJECT";
    options.hash['_dynamicOptions']      = options;

    return Ember['default'].Handlebars.helpers.view.call(this, ember_dynamic_component.DynamicComponentView, options);
  }

});
define('hive/helpers/fa-icon', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var FA_PREFIX = /^fa\-.+/;

  var warn = Ember['default'].Logger.warn;

  /**
   * Handlebars helper for generating HTML that renders a FontAwesome icon.
   *
   * @param  {String} name    The icon name. Note that the `fa-` prefix is optional.
   *                          For example, you can pass in either `fa-camera` or just `camera`.
   * @param  {Object} options Options passed to helper.
   * @return {Ember.Handlebars.SafeString} The HTML markup.
   */
  var faIcon = function(name, options) {
    if (Ember['default'].typeOf(name) !== 'string') {
      var message = "fa-icon: no icon specified";
      warn(message);
      return new Ember['default'].Handlebars.SafeString(message);
    }

    var params = options.hash,
      classNames = [],
      html = "";

    classNames.push("fa");
    if (!name.match(FA_PREFIX)) {
      name = "fa-" + name;
    }
    classNames.push(name);
    if (params.spin) {
      classNames.push("fa-spin");
    }
    if (params.flip) {
      classNames.push("fa-flip-" + params.flip);
    }
    if (params.rotate) {
      classNames.push("fa-rotate-" + params.rotate);
    }
    if (params.lg) {
      warn("fa-icon: the 'lg' parameter is deprecated. Use 'size' instead. I.e. {{fa-icon size=\"lg\"}}");
      classNames.push("fa-lg");
    }
    if (params.x) {
      warn("fa-icon: the 'x' parameter is deprecated. Use 'size' instead. I.e. {{fa-icon size=\"" + params.x + "\"}}");
      classNames.push("fa-" + params.x + "x");
    }
    if (params.size) {
      if (Ember['default'].typeOf(params.size) === "number") {
        classNames.push("fa-" + params.size + "x");
      } else {
        classNames.push("fa-" + params.size);
      }
    }
    if (params.fixedWidth) {
      classNames.push("fa-fw");
    }
    if (params.listItem) {
      classNames.push("fa-li");
    }
    if (params.pull) {
      classNames.push("pull-" + params.pull);
    }
    if (params.border) {
      classNames.push("fa-border");
    }
    if (params.classNames && !Ember['default'].isArray(params.classNames)) {
      params.classNames = [ params.classNames ];
    }
    if (!Ember['default'].isEmpty(params.classNames)) {
      Array.prototype.push.apply(classNames, params.classNames);
    }

    html += "<i";
    html += " class='" + classNames.join(" ") + "'";
    if (params.title) {
      html += " title='" + params.title + "'";
    }
    html += "></i>";
    return new Ember['default'].Handlebars.SafeString(html);
  };

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(faIcon);

  exports.faIcon = faIcon;

});
define('hive/helpers/format-column-type', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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
   used to format the precision and scale of type in database's table's columns
  **/

  var columnTypeFormatter = function(column) {
    var type = column.type;
    var ext = type;
    if( type === "VARCHAR" || type === "CHAR" || type == "DECIMAL"  ) {
        ext += '(' + column.precision;
      if (type == "DECIMAL") {
          ext += "," + column.scale;
      }
      ext += ")";
    }

    return ext;
  };

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(columnTypeFormatter);

});
define('hive/helpers/log-helper', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.log = log;

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

  function log (text) {
    text = Ember['default'].Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');

    return new Ember['default'].Handlebars.SafeString(text);
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(log);

});
define('hive/helpers/path-binding', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.pathBinding = pathBinding;

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

  function pathBinding (data, key) {
    if (!data || !key) {
      return;
    }

    return data.get ? data.get(key) : data[key];
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(pathBinding);

});
define('hive/helpers/preformatted-string', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.preformattedString = preformattedString;

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
  function preformattedString (string) {
    string = string.replace(/\\n/g, '&#10;'); // newline
    string = string.replace(/\\t/g, '&#09;'); // tabs
    string = string.replace(/^\s+|\s+$/g, ''); // trim

    return new Ember['default'].Handlebars.SafeString(string);
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(preformattedString);

});
define('hive/helpers/tb-helper', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.tb = tb;

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

  function tb (key, data) {
    var path = data.get ? data.get(key) : data[key];

    if (!path && key) {
      return Ember['default'].I18n.t(key);
    }

    if (path) {
      return Ember['default'].I18n.t(path);
    }
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(tb);

});
define('hive/initializers/export-application-global', ['exports', 'ember', 'hive/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (config['default'].exportApplicationGlobal !== false) {
      var value = config['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember['default'].String.classify(config['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('hive/initializers/i18n', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  var TRANSLATIONS;

  exports['default'] = {
    name: 'i18n',
    initialize: function () {
      Ember['default'].ENV.I18N_COMPILE_WITHOUT_HANDLEBARS = true;
      Ember['default'].FEATURES.I18N_TRANSLATE_HELPER_SPAN = false;
      Ember['default'].I18n.translations = TRANSLATIONS;
      Ember['default'].TextField.reopen(Ember['default'].I18n.TranslateableAttributes);
    }
  };

  TRANSLATIONS = {
    tooltips: {
      refresh: 'Refresh database',
      loadSample: 'Load sample data',
      query: 'Query',
      settings: 'Settings',
      visualExplain: 'Visual Explain',
      tez: 'Tez',
      visualization: 'Visualization',
      notifications: 'Notifications',
      expand: 'Expand query panel',
      makeSettingGlobal: 'Make setting global',
      overwriteGlobalValue: 'Overwrite global setting value'
    },

    alerts: {
      errors: {
        save: {
          query: "Error when trying to execute the query",
          results: "Error when trying to save the results."
        },
        get: {
          tables: 'Error when trying to retrieve the tables for the selected database',
          columns: 'Error when trying to retrieve the table columns.'
        },
        sessions: {
          "delete": 'Error invalidating sessions'
        },
        job: {
          status: "An error occured while processing the job."
        }
      },
      success: {
        sessions: {
          deleted: 'Session invalidated.'
        },
        settings: {
          saved: 'Settings have been saved.'
        },
        query: {
          execution: 'Query has been submitted.',
          save: 'The query has been saved.',
          update: 'The query has been updated.'
        }
      }
    },

    modals: {
      "delete": {
        heading: 'Confirm deletion',
        message: 'Are you sure you want to delete this item?',
        emptyQueryMessage: "Your query is empty. Do you want to delete this item?"
      },

      save: {
        heading: 'Saving item',
        saveBeforeCloseHeading: "Save item before closing?",
        message: 'Enter name:',
        overwrite: 'Saving will overwrite previously saved query'
      },

      download: {
        csv: 'Download results as CSV',
        hdfs: 'Please enter save path and name'
      },

      changeTitle: {
        heading: 'Rename worksheet'
      },
      authenticationLDAP: {
         heading: 'Enter the LDAP password'
      }
    },

    titles: {
      database: 'Database Explorer',
      explorer: 'Databases',
      results: 'Search Results',
      settings: 'Database Settings',
      query: {
        tab: 'Worksheet',
        editor: 'Query Editor',
        process: 'Query Process Results',
        parameters: 'Parameters',
        visualExplain: 'Visual Explain',
        tez: 'TEZ',
        status: 'Status: ',
        messages: 'Messages',
        visualization: 'Visualization'
      },
      download: 'Save results...',
      tableSample: '{{tableName}} sample'
    },

    placeholders: {
      search: {
        tables: 'Search tables...',
        columns: 'Search columns in result tables...',
        results: 'Filter columns...'
      },
      select: {
        database: 'Select Database...',
        udfs: 'Insert udfs',
        file: 'Select File Resource...',
        noFileResource: '(no file)',
        value: "Select value..."
      },
      fileResource: {
        name: "resource name",
        path: "resource path"
      },
      udfs: {
        name: 'udf name',
        className: 'udf class name',
        path: "resource path",
        database: 'Select Database...'
      },
      settings: {
        key: 'mapred.reduce.tasks',
        value: '1'
      }
    },

    menus: {
      query: 'Query',
      savedQueries: 'Saved Queries',
      history: 'History',
      udfs: 'UDFs',
      uploadTable: 'Upload Table',
      logs: 'Logs',
      results: 'Results',
      explain: 'Explain'
    },

    columns: {
      id: 'id',
      shortQuery: 'preview',
      fileResource: 'file resource',
      title: 'title',
      database: 'database',
      owner: 'owner',
      user: 'user',
      date: 'date submitted',
      duration: 'duration',
      status: 'status',
      expand: '',
      actions: ''
    },

    buttons: {
      addItem: 'Add new item...',
      insert: 'Insert',
      "delete": 'Delete',
      cancel: 'Cancel',
      edit: 'Edit',
      execute: 'Execute',
      explain: 'Explain',
      saveAs: 'Save as...',
      save: 'Save',
      newQuery: 'New Worksheet',
      newUdf: 'New UDF',
      history: 'History',
      ok: 'OK',
      stopJob: 'Stop execution',
      stoppingJob: 'Stopping...',
      close: 'Close',
      clearFilters: 'Clear filters',
      expand: 'Expand message',
      collapse: 'Collapse message',
      previousPage: 'previous',
      uploadTable: 'Upload Table',
      nextPage: 'next',
      loadMore: 'Load more...',
      saveHdfs: 'Save to HDFS',
      saveCsv: 'Download as CSV',
      runOnTez: 'Run on Tez',
      killSession: 'Kill Session'
    },

    labels: {
      noTablesMatch: 'No tables match',
      table: 'Table '
    },

    popover: {
      visualExplain: {
        statistics: "Statistics"
      },
      queryEditorHelp: {
        title: "Did you know?",
        content: {
          line1: "Press CTRL + Space to autocomplete",
          line2: "You can execute queries with multiple SQL statements delimited by a semicolon ';'",
          line3: "You can highlight and run a fragment of a query"
        }
      },
      add: 'Add'
    },

    tez: {
      errors: {
        'not.deployed': "Tez View isn't deployed.",
        'no.instance': "No instance of Tez View found.",
        'no.dag': "No DAG available"
      }
    },

    hive: {
      errors: {
        'no.query': "No query to process.",
        'emptyDatabase' : "Please select Database.",
        'emptyTableName' : "Please enter tableName.",
        'emptyIsFirstRow' : "Please select is First Row Header?"
      }
    },

    emptyList: {
      history: {
        noItems: "No queries were run.",
        noMatches: "No jobs match your filtering criteria",
      },
      savedQueries: {
        noItems: "No queries were saved.",
        noMatches: "No queries match your filtering criteria"
      }
    },

    settings: {
      parsed: "Query settings added"
    },

    generalError: 'Unexpected error'
  };

});
define('hive/mixins/filterable', ['exports', 'ember', 'hive/utils/functions'], function (exports, Ember, utils) {

  'use strict';

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

  exports['default'] = Ember['default'].Mixin.create({
    init: function () {
      this._super();
      this.clearFilters();
    },

    filter: function (items) {
      var self = this;

      if (items && this.get('filters.length')) {
        items = items.filter(function (item) {
          return self.get('filters').every(function (filter) {
            var propValue = item.get(filter.property);

            if (!!filter.value) {
              if (filter.min !== undefined && filter.max !== undefined) {
                if (utils['default'].isInteger(propValue)) {
                  return +propValue >= +filter.min && +propValue <= +filter.max;
                } else if (utils['default'].isDate(propValue)) {
                  return propValue >= filter.min && propValue <= filter.max;
                } else {
                  return false;
                }
              } else if (filter.exactMatch) {
                return propValue == filter.value;
              } else {
                return propValue && propValue.toLowerCase().indexOf(filter.value.toLowerCase()) > -1;
              }
            }

            return false;
          });
        });
      }

      return items;
    },

    updateFilters: function (property, filterValue, exactMatch) {
      var addFilter = function () {
        if (!filterValue) {
          return;
        }

        this.get('filters').pushObject(Ember['default'].Object.create({
          property: property,
          exactMatch: exactMatch,
          min: filterValue.min,
          max: filterValue.max,
          value: filterValue
        }));
      };

      var existentFilter = this.get('filters').find(function (filter) {
        return filter.property === property;
      });

      if (existentFilter) {
        if (filterValue) {
          //remove and add again for triggering collection change thus avoiding to add observers on individual properties of a filter
          this.get('filters').removeObject(existentFilter);
          addFilter.apply(this);
        } else {
          //ensures removal of the filterValue when it's an empty string
          this.set('filters', this.get('filters').without(existentFilter));
        }
      } else {
         addFilter.apply(this);
      }
    },

    clearFilters: function () {
      var filters = this.get('filters');

      if (!filters || filters.get('length')) {
        this.set('filters', Ember['default'].A());
      }
    },

    actions: {
      filter: function (property, filterValue) {
        this.updateFilters(property, filterValue);
      }
    }
  });

});
define('hive/mixins/sortable', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].SortableMixin.reopen({
    sort: function (property) {
      //if same column has been selected, toggle flag, else default it to true
      if (this.get('sortProperties').objectAt(0) === property) {
        this.set('sortAscending', !this.get('sortAscending'));
      } else {
        this.set('sortAscending', true);
        this.set('sortProperties', [ property ]);
      }
    }
  });

});
define('hive/models/database', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

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

  var Database = DS['default'].Model.extend({
    name: DS['default'].attr()
  });

  exports['default'] = Database;

});
define('hive/models/file-resource', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

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

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr(),
    path: DS['default'].attr(),
    owner: DS['default'].attr()
  });

});
define('hive/models/file', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

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

  exports['default'] = DS['default'].Model.extend({
    fileContent: DS['default'].attr(),
    hasNext: DS['default'].attr(),
    page: DS['default'].attr('number'),
    pageCount: DS['default'].attr()
  });

});
define('hive/models/job', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

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

  exports['default'] = DS['default'].Model.extend({
    title: DS['default'].attr('string'),
    queryId: DS['default'].attr(),
    queryFile: DS['default'].attr('string'),
    owner: DS['default'].attr('string'),
    dataBase: DS['default'].attr('string'),
    duration: DS['default'].attr(),
    status: DS['default'].attr('string'),
    statusMessage: DS['default'].attr('string'),
    dateSubmitted: DS['default'].attr('date'),
    forcedContent: DS['default'].attr('string'),
    logFile: DS['default'].attr('string'),
    dagName:  DS['default'].attr('string'),
    dagId: DS['default'].attr('string'),
    sessionTag: DS['default'].attr('string'),
    page: DS['default'].attr(),
    statusDir: DS['default'].attr('string'),
    applicationId: DS['default'].attr(),
    referrer: DS['default'].attr('string'),
    confFile: DS['default'].attr('string'),
    globalSettings: DS['default'].attr('string'),

    dateSubmittedTimestamp: function () {
      var date = this.get('dateSubmitted');

      return date ? date * 1000 : date;
    }.property('dateSubmitted'),

    uppercaseStatus: function () {
      var status = this.get('status');

      return status ? status.toUpperCase() : status;
    }.property('status')
  });

});
define('hive/models/saved-query', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

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

  var Model = DS['default'].Model.extend({
    dataBase: DS['default'].attr('string'),
    title: DS['default'].attr('string'),
    queryFile: DS['default'].attr('string'),
    owner: DS['default'].attr('string'),
    shortQuery: DS['default'].attr('string')
  });

  exports['default'] = Model;

});
define('hive/models/udf', ['exports', 'ember-data', 'hive/utils/constants'], function (exports, DS, constants) {

  'use strict';

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

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr(),
    classname: DS['default'].attr(),
    fileResource: DS['default'].belongsTo(constants['default'].namingConventions.fileResource, { async: true }),
    owner: DS['default'].attr()
  });

});
define('hive/router', ['exports', 'ember', 'hive/config/environment', 'hive/utils/constants'], function (exports, Ember, config, constants) {

  'use strict';

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

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    var savedQueryPath = constants['default'].namingConventions.routes.queries + '/:' + constants['default'].namingConventions.savedQuery + '_id';
    var historyQueryPath = constants['default'].namingConventions.routes.history + '/:' + constants['default'].namingConventions.job + '_id';

    this.route(constants['default'].namingConventions.routes.queries);
    this.route(constants['default'].namingConventions.routes.history);
    this.route(constants['default'].namingConventions.routes.udfs);
    this.route(constants['default'].namingConventions.routes.uploadTable);

    this.resource(constants['default'].namingConventions.routes.index, { path: '/' }, function () {
      this.route(constants['default'].namingConventions.routes.savedQuery, { path: savedQueryPath});
      this.route(constants['default'].namingConventions.routes.historyQuery, { path: historyQueryPath}, function () {
        this.route(constants['default'].namingConventions.routes.logs);
        this.route(constants['default'].namingConventions.routes.results);
        this.route(constants['default'].namingConventions.routes.explain);
      });
    });

    this.route('loading');
  });

  exports['default'] = Router;

});
define('hive/routes/application', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Route.extend({
    notifyService: Ember['default'].inject.service(constants['default'].namingConventions.notify),

    setupController: function (controller, model) {
      var self = this;

      this.store.find(constants['default'].namingConventions.udf).then(function (udfs) {
        self.controllerFor(constants['default'].namingConventions.udfs).set('udfs', udfs);
      }, function (error) {
        self.get('notifyService').error(error);
      });
    },

    actions: {
      openModal: function (modalTemplate, options) {
        this.controllerFor(modalTemplate).setProperties({
          content: options.content || {},
          message: options.message,
          heading: options.heading,
          text: options.text,
          type: options.type || "text",
          defer: options.defer
        });

        return this.render(modalTemplate, {
          into: 'application',
          outlet: 'modal'
        });
      },

      closeModal: function () {
        return this.disconnectOutlet({
          outlet: 'modal',
          parentView: 'application'
        });
      },

      openOverlay: function (overlay) {
        return this.render(overlay.template, {
          outlet: overlay.outlet,
          into: overlay.into
        });
      },

      closeOverlay: function (overlay) {
        return this.disconnectOutlet({
          outlet: overlay.outlet,
          parentView: overlay.into
        });
      },

      removeNotification: function (notification) {
        this.get('notifyService').removeNotification(notification);
      },

      willTransition: function(transition) {
        // close active overlay if we transition
        this.controllerFor('queryTabs').setDefaultActive();

        return transition;
      }
    }
  });

});
define('hive/routes/history', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Route.extend({
    notifyService: Ember['default'].inject.service(constants['default'].namingConventions.notify),

    model: function () {
      var self = this;

      return this.store.find(constants['default'].namingConventions.job)["catch"](function (error) {
        self.get('notifyService').error(error);
      });
    },

    setupController: function (controller, model) {
      if (!model) {
        return;
      }

      var filteredModel = model.filter(function (job) {
         //filter out jobs with referrer type of sample, explain and visual explain
         return (!job.get('referrer') || job.get('referrer') === constants['default'].jobReferrer.job) &&
                !!job.get('id');
      });

      controller.set('history', filteredModel);
    }
  });

});
define('hive/routes/index/history-query/explain', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Route.extend({
    setupController: function (controller, model) {
      this.controllerFor(constants['default'].namingConventions.openQueries).updateTabSubroute(model, constants['default'].namingConventions.subroutes.jobExplain);

      this.controllerFor(constants['default'].namingConventions.routes.index).set('model', model);
    }
  });

});
define('hive/routes/index/history-query/index', ['exports', 'ember', 'hive/utils/constants', 'hive/utils/functions'], function (exports, Ember, constants, utils) {

  'use strict';

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

  exports['default'] = Ember['default'].Route.extend({
    setupController: function (controller, model) {
      var subroute;
      var existingTab = this.controllerFor(constants['default'].namingConventions.openQueries).getTabForModel(model);

      if (existingTab) {
        subroute = existingTab.get('subroute');
      }

      // filter out hdfs jobs
      if (utils['default'].isInteger(model.get('id'))) {
        if (subroute) {
          this.transitionTo(subroute, model);
        } else {
          this.transitionTo(constants['default'].namingConventions.subroutes.jobLogs, model);
        }
      } else {
        this.transitionTo(constants['default'].namingConventions.subroutes.historyQuery, model);
        this.controllerFor(constants['default'].namingConventions.routes.index).set('model', model);
      }
    }
  });

});
define('hive/routes/index/history-query/logs', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Route.extend({
    setupController: function (controller, model) {
      this.controllerFor(constants['default'].namingConventions.openQueries).updateTabSubroute(model, constants['default'].namingConventions.subroutes.jobLogs);

      this.controllerFor(constants['default'].namingConventions.routes.index).set('model', model);
    }
  });

});
define('hive/routes/index/history-query/results', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Route.extend({
    setupController: function (controller, model) {
      this.controllerFor(constants['default'].namingConventions.openQueries).updateTabSubroute(model, constants['default'].namingConventions.subroutes.jobResults);

      this.controllerFor(constants['default'].namingConventions.routes.index).set('model', model);
    }
  });

});
define('hive/routes/index/index', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Route.extend({
    beforeModel: function () {
      var model = this.controllerFor(constants['default'].namingConventions.routes.index).get('model');

      if (model && !model.get('isDeleted')) {
        if (model.get('constructor.typeKey') === constants['default'].namingConventions.job) {
          this.transitionTo(constants['default'].namingConventions.subroutes.historyQuery, model);
        } else {
          this.transitionTo(constants['default'].namingConventions.subroutes.savedQuery, model);
        }
      } else {
        this.controllerFor(constants['default'].namingConventions.openQueries).navigateToLastTab();
      }
    }
  });

});
define('hive/routes/index/saved-query', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Route.extend({
    setupController: function (controller, model) {
      // settings modify fileContent to extract the settings
      // when you load a saved query use the original fileContent
      // this.store.find('file', model.get('queryFile'))
      //   .then(function(queryFile) {
      //     var changes = queryFile.changedAttributes();
      //     if (changes.fileContent && changes.fileContent[0]) {
      //       queryFile.set('fileContent', changes.fileContent[0]);
      //     }
      //   });

      this.controllerFor(constants['default'].namingConventions.routes.index).set('model', model);
    },

    actions: {
      error: function () {
        this.store.unloadAll(constants['default'].namingConventions.savedQuery);
        this.transitionTo(constants['default'].namingConventions.routes.index);
      }
    }
  });

});
define('hive/routes/loading', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

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

	exports['default'] = Ember['default'].Route.extend({
	});

});
define('hive/routes/queries', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Route.extend({
    notifyService: Ember['default'].inject.service(constants['default'].namingConventions.notify),

    model: function () {
      var self = this;

      return this.store.find(constants['default'].namingConventions.savedQuery)["catch"](function (error) {
        self.get('notifyService').error(error);
      });
    },

    setupController: function (controller, model) {
      if (!model) {
        return;
      }

      controller.set('queries', model);
    }
  });

});
define('hive/routes/udfs', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Route.extend({
    notifyService: Ember['default'].inject.service(constants['default'].namingConventions.notify),

    setupController: function (controller, model) {
      this._super();

      var self = this;

      this.store.find(constants['default'].namingConventions.fileResource).then(function (fileResources) {
        controller.set('fileResources', fileResources);
      })["catch"](function (error) {
        self.get('notifyService').error(error);
      });;
    }
  });

});
define('hive/serializers/database', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

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

  exports['default'] = DS['default'].JSONSerializer.extend({
    extractArray: function (store, primaryType, rawPayload) {
      var databases = rawPayload.databases.map(function (database) {
        return {
          id: database,
          name: database
        };
      });

      var payload = { databases: databases };
      return this._super(store, primaryType, payload);
    },

    normalizePayload: function (payload) {
      var normalized = payload.databases.map(function (database) {
        return database;
      });

      return this._super(normalized);
    }
  });

});
define('hive/serializers/file', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

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

  exports['default'] = DS['default'].RESTSerializer.extend({
    primaryKey: 'filePath'
  });

});
define('hive/services/database', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Service.extend({
    store: Ember['default'].inject.service(),

    pageCount: 10,
    selectedDatabase: null,
    selectedTables: null,
    databases: [],

    init: function () {
      this._super();

      var databaseAdapter = this.container.lookup('adapter:database');
      var baseUrl = databaseAdapter.buildURL() + '/' +
                    databaseAdapter.pathForType(constants['default'].namingConventions.database) + '/';

      this.set('baseUrl', baseUrl);
    },

    getDatabases: function () {
      var defer = Ember['default'].RSVP.defer();
      var self = this;

      this.get('store').unloadAll(constants['default'].namingConventions.database);
      this.get('store').fetchAll(constants['default'].namingConventions.database).then(function (databases) {
        self.set('databases', databases);
        defer.resolve(databases);
      }, function (error) {
        defer.reject(error);
      })

      return defer.promise;
    },

    // This will do a ajax call to fetch the current database by by-passing the store.
    // As we want to retain the current state of databases in store and just want to
    // find the current databases in the server
    getDatabasesFromServer: function() {
      var defer = Ember['default'].RSVP.defer();
      var url = this.get('baseUrl');
      Ember['default'].$.getJSON(url).then(function(data) {
        defer.resolve(data.databases);
      }, function(err) {
        defer.reject(err);
      });
      return defer.promise;
    },

    setDatabaseByName: function (name) {
      var database = this.databases.findBy('name', name);

      if (database) {
        this.set('selectedDatabase', database);
      }
    },

    getColumnsPage: function (databaseName, table, searchTerm, firstSearchPage) {
      var defer = Ember['default'].RSVP.defer();

      var url = this.get('baseUrl') +
                databaseName +
                '/table/' +
                table.get('name');

      url += '.page?searchId&count=' + this.get('pageCount');
      url += '&columns=3,5,6,8';

      if (searchTerm) {
        url += '&searchId=searchColumns' + '&like=' + searchTerm;

        if (firstSearchPage) {
          url += '&first=true';
        }
      } else if (!table.get('columns.length')) {
        url += '&first=true';
      }

      Ember['default'].$.getJSON(url).then(function (data) {
        Ember['default'].run(function () {
          var columns;

          columns = data.rows.map(function (row) {
              return Ember['default'].Object.create({
                name: row[0],
                type: row[1],
                precision : row[2],
                scale : row[3]
              });
          });

          defer.resolve({
            columns: columns,
            hasNext: data.hasNext
          });
        });
      }, function (err) {
        defer.reject(err);
      });

      return defer.promise;
    },

    getTablesPage: function (database, searchTerm, firstSearchPage) {
      var defer = Ember['default'].RSVP.defer(),
          url = this.get('baseUrl') +
                database.get('name') +
                '/table.page?count=';

      url += this.get('pageCount');

      if (searchTerm) {
        url += '&searchId=searchTables' + '&like=' + searchTerm;

        if (firstSearchPage) {
          url += '&first=true';
        }
      } else if (!database.get('tables.length')) {
        url += '&first=true';
      }

      Ember['default'].$.getJSON(url).then(function (data) {
        var tables;

        tables = data.rows.map(function (row) {
          return Ember['default'].Object.create({
            name: row[0]
          });
        });

        defer.resolve({
          tables: tables,
          hasNext: data.hasNext
        });
      }, function (err) {
        defer.reject(err);
      });

      return defer.promise;
    },

    getAllTables: function (db) {
      var defer = Ember['default'].RSVP.defer();
      var database = db || this.get('selectedDatabase');
      var self;
      var url;

      if (!database) {
        defer.resolve();
      } else if (database.tables && !database.get('hasNext')) {
        this.set('selectedTables', database.tables.mapProperty('name'));
        defer.resolve();
      } else {
        self = this;
        url = this.get('baseUrl') + database.get('name') + '/table';

        Ember['default'].$.getJSON(url).then(function (data) {
          var tables = data.tables.map(function (table) {
            return Ember['default'].Object.create({
              name: table
            });
          });

          //don't use Ember.Object.set since it can be very expensive for large collections (e.g. 15000 tables),
          //thus we should not do any bindings directly on the 'tables' collection.
          database.tables = tables;

          Ember['default'].run(function () {
            self.set('selectedTables', tables.mapProperty('name'));
          });

          defer.resolve();
        }, function (err) {
          defer.reject(err);
        });
      }

      return defer.promise;
    },

    getAllColumns: function (tableName, db) {
      var database = db || this.get('selectedDatabase');
      var defer = Ember['default'].RSVP.defer();
      var table;
      var self;
      var url;

      if (!database) {
        defer.resolve();
      } else {
        table = database.tables.findBy('name', tableName);

        if (!table) {
          defer.resolve();
        } else if (table.columns && !table.get('hasNext')) {
          this.get('selectedTables')[tableName] = table.columns.mapProperty('name');
          defer.resolve();
        } else {
          self = this;
          url = this.get('baseUrl') + database.get('name') + '/table/' + tableName

          Ember['default'].$.getJSON(url).then(function (data) {
            var columns = data.columns.map(function (column) {
              return Ember['default'].Object.create({
                name: column[0],
                type: column[1]
              });
            });

            table.columns = columns;
            table.set('hasNext', false);

            self.get('selectedTables')[tableName] = columns.mapProperty('name');

            defer.resolve();
          }, function (err) {
            defer.reject(err);
          });
        }
      }

      return defer.promise;
    }
  });

});
define('hive/services/file', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Service.extend({
    files: [],
    store: Ember['default'].inject.service(),

    loadFile: function (path) {
      var self = this;
      var defer = Ember['default'].RSVP.defer();
      var file = this.files.findBy('id', path);

      if (file) {
        defer.resolve(file);
      } else {
        this.get('store').find(constants['default'].namingConventions.file, path).then(function (file) {
          defer.resolve(self.files.pushObject(file));
        }, function (err) {
          defer.reject(err);
        });
      }

      return defer.promise;
    },

    reloadFile: function (path) {
      var defer = Ember['default'].RSVP.defer();

      this.get('store').find(constants['default'].namingConventions.file, path).then(function (file) {
        file.reload().then(function (reloadedFile) {
          defer.resolve(reloadedFile);
        }, function (err) {
          defer.reject(err);
        });
      }, function (err) {
        defer.reject(err);
      });

      return defer.promise;
    }
  });

});
define('hive/services/job-progress', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Service.extend({
    jobs: [],

    setupProgress: function (currentModel) {
      var job = this.jobs.findBy('model', currentModel);

      if (!job) {
        job = this.jobs.pushObject(Ember['default'].Object.create({
          model: currentModel,
          stages: [],
          totalProgress: 0,
          retrievingProgress: false,
        }));
      }

      this.set('currentJob', job);
    },

    updateProgress: function () {
      var job = this.get('currentJob');

      if (!job.get('model.dagId')) {
        return;
      }

      if (job.get('totalProgress') < 100 && !job.get('retrievingProgress')) {
        this.reloadProgress(job);
      }
    }.observes('currentJob.model.dagId'),

    reloadProgress: function (job) {
      var self = this;
      var url = '%@/%@/%@/progress'.fmt(this.container.lookup('adapter:application').buildURL(),
                                           constants['default'].namingConventions.jobs,
                                           job.get('model.id'));

      job.set('retrievingProgress', true);

      Ember['default'].$.getJSON(url).then(function (data) {
        var total = 0;
        var length = Object.keys(data.vertexProgresses).length;

        if (!job.get('stages.length')) {
          data.vertexProgresses.forEach(function (vertexProgress) {
            var progress = vertexProgress.progress * 100;

            job.get('stages').pushObject(Ember['default'].Object.create({
              name: vertexProgress.name,
              value: progress
            }));

            total += progress;
          });
        } else {
          data.vertexProgresses.forEach(function (vertexProgress) {
            var progress = vertexProgress.progress * 100;

            job.get('stages').findBy('name', vertexProgress.name).set('value', progress);

            total += progress;
          });
        }

        total /= length;

        job.set('totalProgress', total);

        if (job.get('model.isRunning') && total < 100) {
          Ember['default'].run.later(function () {
            self.reloadProgress(job);
          }, 1000);
        } else {
          job.set('retrievingProgress');
        }
      });
    },

    isJob: function (model) {
      return model.get('constructor.typeKey') === constants['default'].namingConventions.job;
    }
  });

});
define('hive/services/job', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Service.extend({
    stopJob: function (job) {
      var self = this;
      var id = job.get('id');
      var url = this.container.lookup('adapter:application').buildURL();
      url +=  "/jobs/" + id;

      job.set('isCancelling', true);

      Ember['default'].$.ajax({
         url: url,
         type: 'DELETE',
         headers: {
          'X-Requested-By': 'ambari',
         },
         success: function () {
           job.reload();
         }
      });
    }
  });

});
define('hive/services/notify', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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
  exports['default'] = Ember['default'].Service.extend({
    types: constants['default'].notify,

    messages       : Ember['default'].ArrayProxy.create({ content : [] }),
    notifications  : Ember['default'].ArrayProxy.create({ content : [] }),
    unseenMessages : Ember['default'].ArrayProxy.create({ content : [] }),

    add: function (type, message, body) {
      var formattedBody = this.formatMessageBody(body);

      var notification = Ember['default'].Object.create({
        type    : type,
        message : message,
        body    : formattedBody
      });

      this.messages.pushObject(notification);
      this.notifications.pushObject(notification);
      this.unseenMessages.pushObject(notification);
    },

    info: function (message, body) {
      this.add(this.types.INFO, message, body);
    },

    warn: function (message, body) {
      this.add(this.types.WARN, message, body);
    },

    error: function (error) {
      var message,
          body;

      if (error.responseJSON) {
        message = error.responseJSON.message;
        body = error.responseJSON.trace;
      } else if (error.errorThrown) {
        message = error.errorThrown;
      } else if (error.message) {
        message = error.message;
      } else {
        message = error;
      }

      this.add(this.types.ERROR, message, body);
    },

    success: function (message, body) {
      this.add(this.types.SUCCESS, message, body);
    },

    formatMessageBody: function (body) {
      if (!body) {
        return;
      }

      if (typeof body === "string") {
        return body;
      }

      if (typeof body === "object") {
        var formattedBody = "";
        for (var key in body) {
          formattedBody += "\n\n%@:\n%@".fmt(key, body[key]);
        }

        return formattedBody;
      }
    },

    removeMessage: function (message) {
      this.messages.removeObject(message);
      this.notifications.removeObject(message);
    },

    removeNotification: function (notification) {
      this.notifications.removeObject(notification);
    },

    removeAllMessages: function () {
      this.messages.clear();
    },

    markMessagesAsSeen: function () {
      if (this.unseenMessages.get('length')) {
        this.unseenMessages.removeAt(0, this.unseenMessages.get('length'));
      }
    }
  });

});
define('hive/services/session', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Service.extend({

    updateSessionStatus: function (model) {
      var sessionActive = model.get('sessionActive');
      var sessionTag    = model.get('sessionTag');
      var adapter       = this.container.lookup('adapter:application');
      var url           = adapter.buildURL() + '/jobs/sessions/' + sessionTag;

      if (sessionTag && sessionActive === undefined) {
        adapter.ajax(url, 'GET')
          .then(function (response) {
            model.set('sessionActive', response.session.actual);
          })["catch"](function () {
            model.set('sessionActive', false);
          });
      }
    },

    killSession: function (model) {
      var sessionTag = model.get('sessionTag');
      var adapter    = this.container.lookup('adapter:application');
      var url        = adapter.buildURL() + '/jobs/sessions/' + sessionTag;

      return adapter.ajax(url, 'DELETE');
    }

  });

});
define('hive/services/settings', ['exports', 'ember', 'hive/utils/constants'], function (exports, Ember, constants) {

  'use strict';

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

  exports['default'] = Ember['default'].Service.extend({

    notifyService: Ember['default'].inject.service('notify'),

    settings: Ember['default'].ArrayProxy.create({ content: [] }),
    predefinedSettings: constants['default'].hiveParameters,

    _createSetting: function(name, value) {
      var setting = Ember['default'].Object.createWithMixins({
        valid     : true,
        value     : Ember['default'].computed.alias('selection.value'),
        selection : Ember['default'].Object.create()
      });

      if (name) {
        setting.set('key', Ember['default'].Object.create({ name: name }));
      }

      if (value) {
        setting.set('selection.value', value);
      }

      return setting;
    },

    _createDefaultSettings: function(settings) {
      if (!settings) {
        return;
      }

      for (var key in settings) {
        this.get('settings').pushObject(this._createSetting(key, settings[key]));
      }
    },

    _validate: function () {
      var settings = this.get('settings');
      var predefinedSettings = this.get('predefinedSettings');

      settings.forEach(function (setting) {
        var predefined = predefinedSettings.findBy('name', setting.get('key.name'));

        if (!predefined) {
          return;
        }

        if (predefined.values && predefined.values.contains(setting.get('value'))) {
          setting.set('valid', true);
          return;
        }

        if (predefined.validate && predefined.validate.test(setting.get('value'))) {
          setting.set('valid', true);
          return;
        }

        if (!predefined.validate) {
          setting.set('valid', true);
          return;
        }

        setting.set('valid', false);
      });
    }.observes('settings.@each.value', 'settings.@each.key'),

    add: function() {
      this.get('settings').pushObject(this._createSetting());
    },

    createKey: function(name) {
      var key = { name: name };
      this.get('predefinedSettings').pushObject(key);

      this.get('settings').findBy('key', null).set('key', key);
    },

    remove: function(setting) {
      this.get('settings').removeObject(setting);
    },

    removeAll: function() {
      this.get('settings').clear();
    },

    loadDefaultSettings: function() {
      var adapter       = this.container.lookup('adapter:application');
      var url           = adapter.buildURL() + '/savedQueries/defaultSettings';
      var self = this;

      adapter.ajax(url)
        .then(function(response) {
          self._createDefaultSettings(response.settings);
        })["catch"](function(error) {
          self.get('notifyService').error(error);
        });
    },

    saveDefaultSettings: function() {
      var self     = this;
      var data     = {};
      var adapter  = this.container.lookup('adapter:application');
      var url      = adapter.buildURL() + '/savedQueries/defaultSettings';
      var settings = this.get('settings');

      settings.forEach(function(setting) {
        data[ setting.get('key.name') ] = setting.get('value');
      });

      adapter.ajax(url, 'POST', {
        data: {settings: data }
      })
      .then(function(response) {
        if (response && response.settings) {
          self.get('notifyService').success(Ember['default'].I18n.t('alerts.success.settings.saved'));
        } else {
          self.get('notifyService').error(response);
        }
      });
    },

    getSettings: function() {
      var settings = this.get('settings');
      var asString = "";

      if (!settings.get('length')) {
        return asString;
      }

      settings.forEach(function(setting) {
        asString += "set %@=%@;\n".fmt(setting.get('key.name'), setting.get('value'));
      });

      asString += constants['default'].globalSettings.comment;

      return asString;
    },

    parseGlobalSettings: function(query, model) {
      if (!query || !model || !model.get('globalSettings')) {
        return;
      }

      var globals = model.get('globalSettings');
      var content = query.get('fileContent');

      if (globals !== this.getSettings()) {
        return;
      }

      query.set('fileContent', content.replace(globals, ''));
    }

  });

});
define('hive/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","content");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [3]);
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
        var morph2 = dom.createMorphAt(element0,0,1);
        var morph3 = dom.createMorphAt(element0,1,2);
        inline(env, morph0, context, "notify-widget", [], {"notifications": get(env, context, "notifications")});
        content(env, morph1, context, "navbar-widget");
        content(env, morph2, context, "outlet");
        inline(env, morph3, context, "outlet", ["modal"], {});
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/alert-message-widget', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","alert-message");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          content(env, morph0, context, "message.content");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"type","button");
        dom.setAttribute(el2,"class","close");
        dom.setAttribute(el2,"data-dismiss","alert");
        dom.setAttribute(el2,"aria-hidden","true");
        var el3 = dom.createTextNode("×");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("strong");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [1]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element0, [3]);
        var morph0 = dom.createMorphAt(element2,-1,-1);
        var morph1 = dom.createMorphAt(element0,4,-1);
        element(env, element0, context, "bind-attr", [], {"class": ":alert :alert-dismissible message.typeClass"});
        element(env, element1, context, "action", ["remove"], {});
        element(env, element2, context, "action", ["toggleMessage"], {});
        inline(env, morph0, context, "tb-helper", [get(env, context, "message.title")], {});
        block(env, morph1, context, "if", [get(env, context, "message.isExpanded")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/collapsible-widget', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          element(env, element0, context, "action", ["sendControlAction", get(env, context, "control.action")], {});
          element(env, element0, context, "bind-attr", [], {"class": ":fa control.icon", "title": "control.tooltip"});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          content(env, morph0, context, "yield");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","clearfix");
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("a");
        dom.setAttribute(el2,"data-toggle","tooltip");
        dom.setAttribute(el2,"data-placement","top");
        dom.setAttribute(el2,"title","");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","pull-right widget-controls");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, content = hooks.content, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[3]); }
        var element1 = dom.childAt(fragment, [1]);
        var element2 = dom.childAt(element1, [1]);
        var morph0 = dom.createMorphAt(element2,-1,-1);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [3]),0,1);
        var morph2 = dom.createMorphAt(fragment,2,3,contextualElement);
        element(env, element2, context, "action", ["toggle"], {});
        element(env, element2, context, "bind-attr", [], {"class": ":fa iconClass :collapsible-row", "data-original-title": get(env, context, "heading")});
        content(env, morph0, context, "heading");
        block(env, morph1, context, "each", [get(env, context, "controls")], {"keyword": "control"}, child0, null);
        block(env, morph2, context, "if", [get(env, context, "isExpanded")], {}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/column-filter-widget', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          inline(env, morph0, context, "date-range-widget", [], {"class": "pull-left", "rangeChanged": "sendFilter", "dateRange": get(env, context, "column.dateRange")});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "number-range-widget", [], {"class": "pull-left", "numberRange": get(env, context, "column.numberRange"), "rangeChanged": "sendFilter"});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "extended-input", [], {"type": "text", "class": "pull-left form-control input-sm", "placeholderTranslation": get(env, context, "column.caption"), "value": get(env, context, "filterValue"), "valueChanged": "sendFilter"});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "if", [get(env, context, "column.numberRange")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          element(env, element0, context, "bind-attr", [], {"class": ":pull-right :fa sortAscending:fa-sort-asc:fa-sort-desc"});
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1,"class","pull-right fa fa-unsorted");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("span");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [1]);
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        var morph1 = dom.createMorphAt(element1,0,-1);
        block(env, morph0, context, "if", [get(env, context, "column.dateRange")], {}, child0, child1);
        element(env, element1, context, "action", ["sendSort"], {});
        block(env, morph1, context, "if", [get(env, context, "isSorted")], {}, child2, child3);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/date-range-widget', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","form-inline");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [1]);
        var morph0 = dom.createMorphAt(element0,0,1);
        var morph1 = dom.createMorphAt(element0,1,2);
        inline(env, morph0, context, "input", [], {"type": "text", "value": get(env, context, "displayFromDate"), "class": "input-sm form-control fromDate"});
        inline(env, morph1, context, "input", [], {"type": "text", "value": get(env, context, "displayToDate"), "class": "input-sm form-control toDate"});
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/expander-widget', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","panel panel-default no-margin");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","panel-heading accordion-heading");
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("a");
        dom.setAttribute(el3,"class","accordion-toggle");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","badge pull-right");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","panel-body accordion-body collapse");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","accordion-inner");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [1]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element1, [1]);
        var morph0 = dom.createMorphAt(dom.childAt(element1, [3]),-1,-1);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [5]),-1,-1);
        var morph2 = dom.createMorphAt(dom.childAt(element0, [3, 1]),0,1);
        element(env, element1, context, "action", ["toggle"], {});
        element(env, element2, context, "bind-attr", [], {"class": ":fa isExpanded:fa-caret-down:fa-caret-right"});
        content(env, morph0, context, "heading");
        content(env, morph1, context, "count");
        content(env, morph2, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/job-tr-view', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          content(env, morph0, context, "job.title");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("            ");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n            ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1,"class","spinner small inline-spinner");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              inline(env, morph0, context, "t", ["buttons.stoppingJob"], {});
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("            ");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              inline(env, morph0, context, "t", ["buttons.stopJob"], {});
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            dom.setAttribute(el1,"type","button");
            var el2 = dom.createTextNode("\n");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var morph0 = dom.createMorphAt(element0,0,1);
            element(env, element0, context, "bind-attr", [], {"class": ":btn :btn-warning :btn-sm :pull-right job.isCancelling:disabled"});
            element(env, element0, context, "action", ["stopJob"], {});
            block(env, morph0, context, "if", [get(env, context, "job.isCancelling")], {}, child0, child1);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          dom.setAttribute(el1,"class","secondary-row");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2,"colspan","5");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [1, 1]);
          var morph0 = dom.createMorphAt(element1,0,1);
          var morph1 = dom.createMorphAt(element1,1,2);
          inline(env, morph0, context, "code-helper", [get(env, context, "job.file.fileContent")], {});
          block(env, morph1, context, "if", [get(env, context, "canStop")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("tr");
        dom.setAttribute(el1,"class","main-row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("td");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("td");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("td");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("td");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("td");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("a");
        dom.setAttribute(el3,"class","fa fa-expand pull-right");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, block = hooks.block, inline = hooks.inline, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[3]); }
        var element2 = dom.childAt(fragment, [1]);
        var element3 = dom.childAt(element2, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element2, [1]),0,1);
        var morph1 = dom.createMorphAt(element3,-1,-1);
        var morph2 = dom.createMorphAt(dom.childAt(element2, [5]),-1,-1);
        var morph3 = dom.createMorphAt(dom.childAt(element2, [7]),-1,-1);
        var morph4 = dom.createMorphAt(fragment,2,3,contextualElement);
        element(env, element2, context, "action", ["requestFile"], {});
        block(env, morph0, context, "link-to", ["index.historyQuery", get(env, context, "job")], {}, child0, null);
        element(env, element3, context, "bind-attr", [], {"class": get(env, context, "job.uppercaseStatus")});
        inline(env, morph1, context, "all-uppercase", [get(env, context, "job.status")], {});
        inline(env, morph2, context, "date-binding", [get(env, context, "job"), "dateSubmittedTimestamp"], {});
        content(env, morph3, context, "job.duration");
        block(env, morph4, context, "if", [get(env, context, "expanded")], {}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/modal-widget', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","modal fade");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","modal-dialog");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","modal-content");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","modal-header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"type","button");
        dom.setAttribute(el5,"class","close");
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"aria-hidden","true");
        dom.setAttribute(el6,"data-dismiss","modal");
        var el7 = dom.createTextNode("×");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","sr-only");
        var el7 = dom.createTextNode("Close");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h4");
        dom.setAttribute(el5,"class","modal-title");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","modal-body");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","modal-footer");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"type","button");
        dom.setAttribute(el5,"class","btn btn-sm btn-danger");
        dom.setAttribute(el5,"data-dismiss","modal");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"type","button");
        dom.setAttribute(el5,"class","btn btn-sm btn-success");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, content = hooks.content, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [1, 1, 1]);
        var element1 = dom.childAt(element0, [5]);
        var element2 = dom.childAt(element1, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1, 3]),-1,-1);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
        var morph2 = dom.createMorphAt(dom.childAt(element1, [1]),-1,-1);
        var morph3 = dom.createMorphAt(element2,-1,-1);
        inline(env, morph0, context, "tb-helper", [get(env, context, "heading")], {});
        content(env, morph1, context, "yield");
        inline(env, morph2, context, "t", ["buttons.close"], {});
        element(env, element2, context, "action", ["ok"], {});
        inline(env, morph3, context, "t", ["buttons.ok"], {});
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/navbar-widget', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          content(env, morph0, context, "view.title");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("a");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),-1,-1);
            inline(env, morph0, context, "tb-helper", ["text", get(env, context, "item")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "link-to", [get(env, context, "item.path")], {"tagName": "li"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","navbar navbar-default no-margin");
        dom.setAttribute(el1,"role","navigation");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","container-fluid");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Brand and toggle get grouped for better mobile display ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","navbar-header");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"type","button");
        dom.setAttribute(el4,"class","navbar-toggle collapsed");
        dom.setAttribute(el4,"data-toggle","collapse");
        dom.setAttribute(el4,"data-target","#bs-example-navbar-collapse-1");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","sr-only");
        var el6 = dom.createTextNode("Toggle navigation");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","icon-bar");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","icon-bar");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","icon-bar");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Collect the nav links, forms, and other content for toggling ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","collapse navbar-collapse");
        dom.setAttribute(el3,"id","bs-example-navbar-collapse-1");
        var el4 = dom.createTextNode("\n       ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ul");
        dom.setAttribute(el4,"class","nav navbar-nav");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [1, 1]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [3]),2,3);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [7, 1]),0,1);
        block(env, morph0, context, "link-to", ["index"], {"classNames": "navbar-brand mozBoxSizeFix"}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "view.items")], {"keyword": "item"}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/no-bubbling', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        content(env, morph0, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/notify-widget', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          inline(env, morph0, context, "view", ["notification"], {"notification": get(env, context, "notification")});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        block(env, morph0, context, "each", [get(env, context, "notifications")], {"keyword": "notification"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/number-range-widget', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","slider");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","slider-labels");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2,"class","pull-left");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2,"class","pull-right");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),-1,-1);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),-1,-1);
        content(env, morph0, context, "numberRange.fromDuration");
        content(env, morph1, context, "numberRange.toDuration");
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/panel-widget', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          var child0 = (function() {
            return {
              isHTMLBars: true,
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("                          ");
                dom.appendChild(el0, el1);
                var el1 = dom.createElement("li");
                var el2 = dom.createElement("a");
                dom.appendChild(el1, el2);
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                var hooks = env.hooks, get = hooks.get, element = hooks.element, content = hooks.content;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                var element2 = dom.childAt(fragment, [1, 0]);
                var morph0 = dom.createMorphAt(element2,-1,-1);
                element(env, element2, context, "bind-attr", [], {"href": get(env, context, "item.href")});
                content(env, morph0, context, "item.title");
                return fragment;
              }
            };
          }());
          var child1 = (function() {
            return {
              isHTMLBars: true,
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("                          ");
                dom.appendChild(el0, el1);
                var el1 = dom.createElement("li");
                var el2 = dom.createElement("a");
                dom.appendChild(el1, el2);
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                var hooks = env.hooks, get = hooks.get, element = hooks.element, content = hooks.content;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                var element1 = dom.childAt(fragment, [1, 0]);
                var morph0 = dom.createMorphAt(element1,-1,-1);
                element(env, element1, context, "action", ["sendMenuItemAction", get(env, context, "item.action")], {});
                content(env, morph0, context, "item.title");
                return fragment;
              }
            };
          }());
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, block = hooks.block;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              block(env, morph0, context, "if", [get(env, context, "item.href")], {}, child0, child1);
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","dropdown pull-right");
            var el2 = dom.createTextNode("\n              ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("a");
            dom.setAttribute(el2,"href","#");
            dom.setAttribute(el2,"class","dropdown-toggle");
            dom.setAttribute(el2,"data-toggle","dropdown");
            var el3 = dom.createTextNode(" ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("b");
            dom.setAttribute(el3,"class","caret");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n\n              ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("ul");
            dom.setAttribute(el2,"class","dropdown-menu");
            dom.setAttribute(el2,"role","menu");
            var el3 = dom.createTextNode("\n");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("              ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element3 = dom.childAt(fragment, [1]);
            var morph0 = dom.createMorphAt(dom.childAt(element3, [1]),-1,0);
            var morph1 = dom.createMorphAt(dom.childAt(element3, [3]),0,1);
            content(env, morph0, context, "menuHeading");
            block(env, morph1, context, "each", [get(env, context, "menuItems")], {"keyword": "item"}, child0, null);
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("        ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("i");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, element = hooks.element;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var element0 = dom.childAt(fragment, [1]);
              element(env, element0, context, "action", ["sendMenuItemAction", get(env, context, "iconAction.action")], {});
              element(env, element0, context, "bind-attr", [], {"class": ":pull-right :panel-action-icon :fa iconAction.icon", "title": "iconAction.tooltip"});
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            block(env, morph0, context, "each", [get(env, context, "iconActions")], {"keyword": "iconAction"}, child0, null);
            return fragment;
          }
        };
      }());
      var child2 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","spinner small pull-right");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","panel-heading");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("strong");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element4 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element4,0,1);
          var morph1 = dom.createMorphAt(element4,1,2);
          var morph2 = dom.createMorphAt(dom.childAt(element4, [3]),-1,-1);
          var morph3 = dom.createMorphAt(element4,4,5);
          block(env, morph0, context, "if", [get(env, context, "menuItems")], {}, child0, null);
          block(env, morph1, context, "if", [get(env, context, "iconActions")], {}, child1, null);
          content(env, morph2, context, "heading");
          block(env, morph3, context, "if", [get(env, context, "isLoading")], {}, child2, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","panel-body");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element5 = dom.childAt(fragment, [1]);
        var morph0 = dom.createMorphAt(element5,0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element5, [2]),0,1);
        element(env, element5, context, "bind-attr", [], {"class": ":panel :panel-default classNames"});
        block(env, morph0, context, "if", [get(env, context, "heading")], {}, child0, null);
        content(env, morph1, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/popover-widget', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("span");
        dom.setAttribute(el1,"class","hide");
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
        content(env, morph0, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/progress-widget', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","progress");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [1, 1]);
        var morph0 = dom.createMorphAt(element0,0,1);
        element(env, element0, context, "bind-attr", [], {"class": ":progress-bar :progress-bar-success", "style": get(env, context, "style")});
        content(env, morph0, context, "percentage");
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/query-editor', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        inline(env, morph0, context, "textarea", [], {"id": "code-mirror", "rows": "15", "cols": "20", "value": get(env, context, "query")});
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/select-widget', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","fa fa-remove pull-right");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","fa fa-edit pull-right");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, element = hooks.element;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element1 = dom.childAt(fragment, [1]);
            var element2 = dom.childAt(fragment, [3]);
            element(env, element1, context, "action", ["remove", get(env, context, "item")], {});
            element(env, element2, context, "action", ["edit", get(env, context, "item")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element3 = dom.childAt(fragment, [1]);
          var element4 = dom.childAt(element3, [1]);
          var morph0 = dom.createMorphAt(element4,-1,0);
          var morph1 = dom.createMorphAt(element4,0,1);
          element(env, element3, context, "action", ["select", get(env, context, "item")], {});
          inline(env, morph0, context, "path-binding", [get(env, context, "item"), get(env, context, "labelPath")], {});
          block(env, morph1, context, "if", [get(env, context, "canEdit")], {}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createElement("a");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [0]),-1,-1);
          element(env, element0, context, "action", ["add"], {});
          inline(env, morph0, context, "t", ["buttons.addItem"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","btn-group");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("a");
        dom.setAttribute(el2,"class","btn btn-default dropdown-toggle");
        dom.setAttribute(el2,"data-toggle","dropdown");
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","selected-item pull-left");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","pull-right fa fa-caret-down");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","dropdown-menu");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element5 = dom.childAt(fragment, [1]);
        var element6 = dom.childAt(element5, [3]);
        if (this.cachedFragment) { dom.repairClonedNode(element6,[1]); }
        var morph0 = dom.createMorphAt(dom.childAt(element5, [1, 1]),-1,-1);
        var morph1 = dom.createMorphAt(element6,0,1);
        var morph2 = dom.createMorphAt(element6,1,2);
        content(env, morph0, context, "selectedLabel");
        block(env, morph1, context, "each", [get(env, context, "items")], {"keyword": "item"}, child0, null);
        block(env, morph2, context, "if", [get(env, context, "canAdd")], {}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/tabs-widget', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          var child0 = (function() {
            var child0 = (function() {
              return {
                isHTMLBars: true,
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createTextNode("*");
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  return fragment;
                }
              };
            }());
            var child1 = (function() {
              return {
                isHTMLBars: true,
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createDocumentFragment();
                  var el1 = dom.createTextNode("              ");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createElement("i");
                  dom.setAttribute(el1,"class","fa fa-remove");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createTextNode("\n");
                  dom.appendChild(el0, el1);
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  var hooks = env.hooks, get = hooks.get, element = hooks.element;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  var element1 = dom.childAt(fragment, [1]);
                  element(env, element1, context, "action", ["remove", get(env, context, "tab")], {});
                  return fragment;
                }
              };
            }());
            return {
              isHTMLBars: true,
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("          ");
                dom.appendChild(el0, el1);
                var el1 = dom.createElement("a");
                var el2 = dom.createTextNode("\n            ");
                dom.appendChild(el1, el2);
                var el2 = dom.createTextNode("\n            ");
                dom.appendChild(el1, el2);
                var el2 = dom.createTextNode("\n");
                dom.appendChild(el1, el2);
                var el2 = dom.createTextNode("          ");
                dom.appendChild(el1, el2);
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                var hooks = env.hooks, get = hooks.get, element = hooks.element, content = hooks.content, block = hooks.block;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                var element2 = dom.childAt(fragment, [1]);
                var morph0 = dom.createMorphAt(element2,0,1);
                var morph1 = dom.createMorphAt(element2,1,2);
                var morph2 = dom.createMorphAt(element2,2,3);
                element(env, element2, context, "action", ["titleClick", get(env, context, "tab")], {"on": "doubleClick"});
                content(env, morph0, context, "tab.name");
                block(env, morph1, context, "if", [get(env, context, "tab.isDirty")], {}, child0, null);
                block(env, morph2, context, "if", [get(env, context, "view.removeEnabled")], {}, child1, null);
                return fragment;
              }
            };
          }());
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, block = hooks.block;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              block(env, morph0, context, "link-to", [get(env, context, "tab.path"), get(env, context, "tab.id")], {"tagName": "li"}, child0, null);
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("        ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("li");
              var el2 = dom.createTextNode("\n          ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("a");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n        ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, element = hooks.element, get = hooks.get, content = hooks.content;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var element0 = dom.childAt(fragment, [1]);
              var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),-1,-1);
              element(env, element0, context, "bind-attr", [], {"class": "tab.active:active"});
              element(env, element0, context, "action", ["selectTab", get(env, context, "tab")], {});
              content(env, morph0, context, "tab.name");
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            block(env, morph0, context, "if", [get(env, context, "tab.path")], {}, child0, child1);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "if", [get(env, context, "tab.visible")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1,"class","nav nav-tabs");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,-1);
        var morph1 = dom.createMorphAt(fragment,2,3,contextualElement);
        block(env, morph0, context, "each", [get(env, context, "tabs")], {"keyword": "tab"}, child0, null);
        content(env, morph1, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/tree-view', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "tree-view", [], {"content": get(env, context, "item.contents")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,0,1);
          var morph1 = dom.createMorphAt(element0,1,2);
          content(env, morph0, context, "item.text");
          block(env, morph1, context, "if", [get(env, context, "item.contents")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1,"class","list-unstyled");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,-1);
        block(env, morph0, context, "each", [get(env, context, "content")], {"keyword": "item"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/udf-tr-view', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
            inline(env, morph0, context, "extended-input", [], {"type": "text", "class": "pull-left form-control halfed input-sm", "placeholderTranslation": "placeholders.fileResource.name", "value": get(env, context, "udf.fileResource.name")});
            inline(env, morph1, context, "extended-input", [], {"type": "text", "class": "pull-left form-control halfed input-sm", "placeholderTranslation": "placeholders.fileResource.path", "value": get(env, context, "udf.fileResource.path")});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "select-widget", [], {"items": get(env, context, "fileResources"), "selectedValue": get(env, context, "udf.fileResource"), "labelPath": "name", "defaultLabelTranslation": "placeholders.select.file", "itemAdded": "addFileResource", "itemEdited": "editFileResource", "itemRemoved": "deleteFileResource", "canAdd": true, "canEdit": true});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "if", [get(env, context, "udf.isEditingResource")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("  (");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode(")\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
            content(env, morph0, context, "udf.fileResource.name");
            content(env, morph1, context, "udf.fileResource.path");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "if", [get(env, context, "udf.fileResource")], {}, child0, null);
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "extended-input", [], {"type": "text", "class": "pull-left form-control input-sm", "placeholderTranslation": get(env, context, "column.caption"), "dynamicContextBinding": "udf", "dynamicValueBinding": "column.property"});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "path-binding", [get(env, context, "udf"), get(env, context, "column.property")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("td");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          block(env, morph0, context, "if", [get(env, context, "udf.isEditing")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","pull-right");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          dom.setAttribute(el2,"type","button");
          dom.setAttribute(el2,"class","btn btn-sm btn-warning");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          dom.setAttribute(el2,"type","button");
          dom.setAttribute(el2,"class","btn btn-sm btn-success");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element3 = dom.childAt(fragment, [1]);
          var element4 = dom.childAt(element3, [1]);
          var element5 = dom.childAt(element3, [3]);
          var morph0 = dom.createMorphAt(element4,-1,-1);
          var morph1 = dom.createMorphAt(element5,-1,-1);
          element(env, element4, context, "action", ["cancel"], {});
          inline(env, morph0, context, "t", ["buttons.cancel"], {});
          element(env, element5, context, "action", ["save"], {});
          inline(env, morph1, context, "t", ["buttons.save"], {});
          return fragment;
        }
      };
    }());
    var child4 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","btn-group pull-right");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2,"data-toggle","dropdown");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("a");
          dom.setAttribute(el3,"class","fa fa-gear");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("ul");
          dom.setAttribute(el2,"class","dropdown-menu");
          dom.setAttribute(el2,"role","menu");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          var el4 = dom.createElement("a");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          var el4 = dom.createElement("a");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 3]);
          var element1 = dom.childAt(element0, [1]);
          var element2 = dom.childAt(element0, [3]);
          var morph0 = dom.createMorphAt(dom.childAt(element1, [0]),-1,-1);
          var morph1 = dom.createMorphAt(dom.childAt(element2, [0]),-1,-1);
          element(env, element1, context, "action", ["editUdf"], {});
          inline(env, morph0, context, "t", ["buttons.edit"], {});
          element(env, element2, context, "action", ["deleteUdf"], {});
          inline(env, morph1, context, "t", ["buttons.delete"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("td");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("td");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,-1);
        var morph1 = dom.createMorphAt(fragment,2,3,contextualElement);
        var morph2 = dom.createMorphAt(dom.childAt(fragment, [3]),0,-1);
        block(env, morph0, context, "if", [get(env, context, "udf.isEditing")], {}, child0, child1);
        block(env, morph1, context, "each", [get(env, context, "columns")], {"keyword": "column"}, child2, null);
        block(env, morph2, context, "if", [get(env, context, "udf.isEditing")], {}, child3, child4);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/components/visualization-tabs-widget', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element, get = hooks.get, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),-1,-1);
          element(env, element0, context, "bind-attr", [], {"class": "tab.active:active"});
          element(env, element0, context, "action", ["selectTab", get(env, context, "tab")], {});
          content(env, morph0, context, "tab.name");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1,"class","nav nav-tabs visualization-tabs");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("iframe");
        dom.setAttribute(el1,"id","visualization_frame");
        dom.setAttribute(el1,"style","width:100%;height:1000px;border:0px;");
        dom.setAttribute(el1,"allowfullscreen","true");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,-1);
        block(env, morph0, context, "each", [get(env, context, "tabs")], {"keyword": "tab"}, child0, null);
        element(env, element1, context, "bind-attr", [], {"src": get(env, context, "selectedTab.url")});
        return fragment;
      }
    };
  }()));

});
define('hive/templates/databases-search-results', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("            ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              var el2 = dom.createTextNode("\n              ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("strong");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n              ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("span");
              dom.setAttribute(el2,"class","pull-right");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n            ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, content = hooks.content;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var element3 = dom.childAt(fragment, [1]);
              var morph0 = dom.createMorphAt(dom.childAt(element3, [1]),-1,-1);
              var morph1 = dom.createMorphAt(dom.childAt(element3, [3]),-1,-1);
              content(env, morph0, context, "column.name");
              content(env, morph1, context, "column.type");
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("            ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("strong");
              var el2 = dom.createElement("a");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var element2 = dom.childAt(fragment, [1, 0]);
              var morph0 = dom.createMorphAt(element2,-1,-1);
              element(env, element2, context, "action", ["showMoreResultColumns", get(env, context, "table")], {});
              inline(env, morph0, context, "t", ["buttons.loadMore"], {});
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("a");
            dom.setAttribute(el1,"class","fa fa-th");
            var el2 = dom.createTextNode(" ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n\n        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","columns");
            var el2 = dom.createTextNode("\n");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element4 = dom.childAt(fragment, [3]);
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,-1);
            var morph1 = dom.createMorphAt(element4,0,1);
            var morph2 = dom.createMorphAt(element4,1,2);
            content(env, morph0, context, "table.name");
            block(env, morph1, context, "each", [get(env, context, "table.columns")], {"keyword": "column"}, child0, null);
            block(env, morph2, context, "if", [get(env, context, "table.hasNext")], {}, child1, null);
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("strong");
            var el2 = dom.createElement("a");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element1 = dom.childAt(fragment, [1, 0]);
            var morph0 = dom.createMorphAt(element1,-1,-1);
            element(env, element1, context, "action", ["showMoreResultTables", get(env, context, "database")], {});
            inline(env, morph0, context, "t", ["buttons.loadMore"], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","databases");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"class","fa fa-database");
          var el3 = dom.createTextNode(" ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","tables");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element5 = dom.childAt(fragment, [1]);
          var element6 = dom.childAt(element5, [3]);
          var morph0 = dom.createMorphAt(dom.childAt(element5, [1]),0,-1);
          var morph1 = dom.createMorphAt(element6,0,1);
          var morph2 = dom.createMorphAt(element6,1,2);
          content(env, morph0, context, "selectedDatabase.name");
          block(env, morph1, context, "each", [get(env, context, "tableSearchResults.tables")], {"keyword": "table"}, child0, null);
          block(env, morph2, context, "if", [get(env, context, "tableSearchResults.hasNext")], {}, child1, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","alert alert-warning database-explorer-alert");
          dom.setAttribute(el1,"role","alert");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("strong");
          var el3 = dom.createTextNode("\"");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\"");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,0,1);
          var morph1 = dom.createMorphAt(dom.childAt(element0, [2]),0,1);
          inline(env, morph0, context, "t", ["labels.noTablesMatch"], {});
          content(env, morph1, context, "tablesSearchTerm");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        block(env, morph0, context, "if", [get(env, context, "tableSearchResults.tables")], {}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/databases-tree', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          var child0 = (function() {
            var child0 = (function() {
              var child0 = (function() {
                var child0 = (function() {
                  return {
                    isHTMLBars: true,
                    blockParams: 0,
                    cachedFragment: null,
                    hasRendered: false,
                    build: function build(dom) {
                      var el0 = dom.createDocumentFragment();
                      var el1 = dom.createTextNode("                    ");
                      dom.appendChild(el0, el1);
                      var el1 = dom.createElement("div");
                      var el2 = dom.createTextNode("\n                      ");
                      dom.appendChild(el1, el2);
                      var el2 = dom.createElement("div");
                      dom.setAttribute(el2,"class","column-name");
                      dom.setAttribute(el2,"data-toggle","tooltip");
                      dom.setAttribute(el2,"data-placement","top");
                      dom.setAttribute(el2,"title","");
                      var el3 = dom.createTextNode("\n                      ");
                      dom.appendChild(el2, el3);
                      dom.appendChild(el1, el2);
                      var el2 = dom.createTextNode("\n                      ");
                      dom.appendChild(el1, el2);
                      var el2 = dom.createElement("span");
                      dom.setAttribute(el2,"class","pull-right widget-controls");
                      dom.appendChild(el1, el2);
                      var el2 = dom.createTextNode("\n                    ");
                      dom.appendChild(el1, el2);
                      dom.appendChild(el0, el1);
                      var el1 = dom.createTextNode("\n");
                      dom.appendChild(el0, el1);
                      return el0;
                    },
                    render: function render(context, env, contextualElement) {
                      var dom = env.dom;
                      var hooks = env.hooks, get = hooks.get, element = hooks.element, content = hooks.content, inline = hooks.inline;
                      dom.detectNamespace(contextualElement);
                      var fragment;
                      if (env.useFragmentCache && dom.canClone) {
                        if (this.cachedFragment === null) {
                          fragment = this.build(dom);
                          if (this.hasRendered) {
                            this.cachedFragment = fragment;
                          } else {
                            this.hasRendered = true;
                          }
                        }
                        if (this.cachedFragment) {
                          fragment = dom.cloneNode(this.cachedFragment, true);
                        }
                      } else {
                        fragment = this.build(dom);
                      }
                      var element2 = dom.childAt(fragment, [1]);
                      var element3 = dom.childAt(element2, [1]);
                      var morph0 = dom.createMorphAt(element3,-1,0);
                      var morph1 = dom.createMorphAt(dom.childAt(element2, [3]),-1,-1);
                      element(env, element3, context, "bind-attr", [], {"data-original-title": get(env, context, "column.name")});
                      content(env, morph0, context, "column.name");
                      inline(env, morph1, context, "format-column-type", [get(env, context, "column")], {});
                      return fragment;
                    }
                  };
                }());
                var child1 = (function() {
                  return {
                    isHTMLBars: true,
                    blockParams: 0,
                    cachedFragment: null,
                    hasRendered: false,
                    build: function build(dom) {
                      var el0 = dom.createDocumentFragment();
                      var el1 = dom.createTextNode("                    ");
                      dom.appendChild(el0, el1);
                      var el1 = dom.createElement("strong");
                      var el2 = dom.createElement("a");
                      dom.appendChild(el1, el2);
                      dom.appendChild(el0, el1);
                      var el1 = dom.createTextNode("\n");
                      dom.appendChild(el0, el1);
                      return el0;
                    },
                    render: function render(context, env, contextualElement) {
                      var dom = env.dom;
                      var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline;
                      dom.detectNamespace(contextualElement);
                      var fragment;
                      if (env.useFragmentCache && dom.canClone) {
                        if (this.cachedFragment === null) {
                          fragment = this.build(dom);
                          if (this.hasRendered) {
                            this.cachedFragment = fragment;
                          } else {
                            this.hasRendered = true;
                          }
                        }
                        if (this.cachedFragment) {
                          fragment = dom.cloneNode(this.cachedFragment, true);
                        }
                      } else {
                        fragment = this.build(dom);
                      }
                      var element1 = dom.childAt(fragment, [1, 0]);
                      var morph0 = dom.createMorphAt(element1,-1,-1);
                      element(env, element1, context, "action", ["showMoreColumns", get(env, context, "table"), get(env, context, "database")], {});
                      inline(env, morph0, context, "t", ["buttons.loadMore"], {});
                      return fragment;
                    }
                  };
                }());
                return {
                  isHTMLBars: true,
                  blockParams: 0,
                  cachedFragment: null,
                  hasRendered: false,
                  build: function build(dom) {
                    var el0 = dom.createDocumentFragment();
                    var el1 = dom.createTextNode("                ");
                    dom.appendChild(el0, el1);
                    var el1 = dom.createElement("div");
                    dom.setAttribute(el1,"class","columns");
                    var el2 = dom.createTextNode("\n");
                    dom.appendChild(el1, el2);
                    var el2 = dom.createTextNode("");
                    dom.appendChild(el1, el2);
                    var el2 = dom.createTextNode("                ");
                    dom.appendChild(el1, el2);
                    dom.appendChild(el0, el1);
                    var el1 = dom.createTextNode("\n");
                    dom.appendChild(el0, el1);
                    return el0;
                  },
                  render: function render(context, env, contextualElement) {
                    var dom = env.dom;
                    var hooks = env.hooks, get = hooks.get, block = hooks.block;
                    dom.detectNamespace(contextualElement);
                    var fragment;
                    if (env.useFragmentCache && dom.canClone) {
                      if (this.cachedFragment === null) {
                        fragment = this.build(dom);
                        if (this.hasRendered) {
                          this.cachedFragment = fragment;
                        } else {
                          this.hasRendered = true;
                        }
                      }
                      if (this.cachedFragment) {
                        fragment = dom.cloneNode(this.cachedFragment, true);
                      }
                    } else {
                      fragment = this.build(dom);
                    }
                    var element4 = dom.childAt(fragment, [1]);
                    if (this.cachedFragment) { dom.repairClonedNode(element4,[1]); }
                    var morph0 = dom.createMorphAt(element4,0,1);
                    var morph1 = dom.createMorphAt(element4,1,2);
                    block(env, morph0, context, "each", [get(env, context, "table.visibleColumns")], {"keyword": "column"}, child0, null);
                    block(env, morph1, context, "if", [get(env, context, "table.canGetNextPage")], {}, child1, null);
                    return fragment;
                  }
                };
              }());
              return {
                isHTMLBars: true,
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createDocumentFragment();
                  var el1 = dom.createTextNode("");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createTextNode("");
                  dom.appendChild(el0, el1);
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  var hooks = env.hooks, get = hooks.get, block = hooks.block;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
                  var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
                  block(env, morph0, context, "if", [get(env, context, "table.isExpanded")], {}, child0, null);
                  return fragment;
                }
              };
            }());
            return {
              isHTMLBars: true,
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("");
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                var hooks = env.hooks, get = hooks.get, block = hooks.block;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
                var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
                block(env, morph0, context, "collapsible-widget", [], {"heading": get(env, context, "table.name"), "isExpanded": get(env, context, "table.isExpanded"), "toggledParam": get(env, context, "database"), "iconClass": "fa-table", "expanded": "getColumns", "controls": get(env, context, "tableControls")}, child0, null);
                return fragment;
              }
            };
          }());
          var child1 = (function() {
            return {
              isHTMLBars: true,
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("            ");
                dom.appendChild(el0, el1);
                var el1 = dom.createElement("strong");
                var el2 = dom.createElement("a");
                dom.appendChild(el1, el2);
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                var element0 = dom.childAt(fragment, [1, 0]);
                var morph0 = dom.createMorphAt(element0,-1,-1);
                element(env, element0, context, "action", ["showMoreTables", get(env, context, "database")], {});
                inline(env, morph0, context, "t", ["buttons.loadMore"], {});
                return fragment;
              }
            };
          }());
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("        ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1,"class","tables");
              var el2 = dom.createTextNode("\n");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("        ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, block = hooks.block;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var element5 = dom.childAt(fragment, [1]);
              if (this.cachedFragment) { dom.repairClonedNode(element5,[1]); }
              var morph0 = dom.createMorphAt(element5,0,1);
              var morph1 = dom.createMorphAt(element5,1,2);
              block(env, morph0, context, "each", [get(env, context, "database.visibleTables")], {"keyword": "table"}, child0, null);
              block(env, morph1, context, "if", [get(env, context, "database.canGetNextPage")], {}, child1, null);
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            block(env, morph0, context, "if", [get(env, context, "database.isExpanded")], {}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "collapsible-widget", [], {"heading": get(env, context, "database.name"), "isExpanded": get(env, context, "database.isExpanded"), "iconClass": "fa-database", "expanded": "getTables", "toggledParam": get(env, context, "database")}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","databases");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,-1);
        block(env, morph0, context, "each", [get(env, context, "databases")], {"keyword": "database"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/databases', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("      ");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n\n      ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("hr");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              inline(env, morph0, context, "extended-input", [], {"class": "form-control input-sm mozBoxSizeFix", "placeholderTranslation": "placeholders.search.tables", "valueSearched": "searchTables", "value": get(env, context, "tableSearchTerm")});
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("      ");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n\n      ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("hr");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              inline(env, morph0, context, "extended-input", [], {"class": "form-control input-sm mozBoxSizeFix", "placeholderTranslation": "placeholders.search.columns", "valueSearched": "searchColumns", "value": get(env, context, "columnSearchTerm")});
              return fragment;
            }
          };
        }());
        var child2 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("      ");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              inline(env, morph0, context, "partial", [get(env, context, "selectedTab.view")], {});
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("\n    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n\n    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("hr");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n\n");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n\n");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            if (this.cachedFragment) { dom.repairClonedNode(fragment,[6]); }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            var morph1 = dom.createMorphAt(fragment,3,4,contextualElement);
            var morph2 = dom.createMorphAt(fragment,4,5,contextualElement);
            var morph3 = dom.createMorphAt(fragment,5,6,contextualElement);
            inline(env, morph0, context, "typeahead-widget", [], {"content": get(env, context, "databases"), "optionValuePath": "id", "optionLabelPath": "name", "selection": get(env, context, "selectedDatabase")});
            block(env, morph1, context, "if", [get(env, context, "selectedDatabase")], {}, child0, null);
            block(env, morph2, context, "if", [get(env, context, "tableSearchResults.tables")], {}, child1, null);
            block(env, morph3, context, "tabs-widget", [], {"tabs": get(env, context, "tabs"), "selectedTab": get(env, context, "selectedTab")}, child2, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "if", [get(env, context, "databases")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        block(env, morph0, context, "panel-widget", [], {"headingTranslation": "titles.database", "isLoading": get(env, context, "isLoading"), "classNames": "database-explorer", "iconActions": get(env, context, "panelIconActions")}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/history', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "column-filter-widget", [], {"class": "pull-left", "column": get(env, context, "column"), "filterValue": get(env, context, "column.filterValue"), "sortAscending": get(env, context, "controller.sortAscending"), "sortProperties": get(env, context, "controller.sortProperties"), "columnSorted": "sort", "columnFiltered": "filter"});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "tb-helper", ["caption", get(env, context, "column")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("th");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          block(env, morph0, context, "if", [get(env, context, "column.caption")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("          ");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              inline(env, morph0, context, "job-tr-view", [], {"job": get(env, context, "item"), "onStopJob": "interruptJob", "onFileRequested": "loadFile"});
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            block(env, morph0, context, "each", [get(env, context, "this")], {"keyword": "item"}, child0, null);
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("tr");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            dom.setAttribute(el2,"colspan","5");
            var el3 = dom.createTextNode("\n            ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("h4");
            dom.setAttribute(el3,"class","empty-list");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n          ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1, 1]),-1,-1);
            inline(env, morph0, context, "t", ["emptyList.history.noMatches"], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "if", [get(env, context, "model.length")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2,"colspan","5");
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("h4");
          dom.setAttribute(el3,"class","empty-list");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1, 1]),-1,-1);
          inline(env, morph0, context, "t", ["emptyList.history.noItems"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("table");
        dom.setAttribute(el1,"class","table table-expandable");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("thead");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"type","btn");
        dom.setAttribute(el5,"class","btn btn-sm btn-warning pull-right clear-filters");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tbody");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, element = hooks.element, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [1]);
        var element1 = dom.childAt(element0, [1, 1]);
        var element2 = dom.childAt(element1, [2, 1]);
        var morph0 = dom.createMorphAt(element1,0,1);
        var morph1 = dom.createMorphAt(element2,-1,-1);
        var morph2 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
        block(env, morph0, context, "each", [get(env, context, "columns")], {"keyword": "column"}, child0, null);
        element(env, element2, context, "action", ["clearFilters"], {});
        inline(env, morph1, context, "t", ["buttons.clearFilters"], {});
        block(env, morph2, context, "if", [get(env, context, "history.length")], {}, child1, child2);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            dom.setAttribute(el1,"type","button");
            dom.setAttribute(el1,"class","btn btn-sm btn-success execute-query");
            var el2 = dom.createTextNode("\n              ");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element4 = dom.childAt(fragment, [1]);
            var morph0 = dom.createMorphAt(element4,0,1);
            element(env, element4, context, "action", ["executeQuery"], {});
            inline(env, morph0, context, "t", ["buttons.execute"], {});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                ");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n                ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1,"class","spinner small inline-spinner");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              inline(env, morph0, context, "t", ["buttons.stoppingJob"], {});
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                ");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              inline(env, morph0, context, "t", ["buttons.stopJob"], {});
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            dom.setAttribute(el1,"type","button");
            var el2 = dom.createTextNode("\n");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("            ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element3 = dom.childAt(fragment, [1]);
            var morph0 = dom.createMorphAt(element3,0,1);
            element(env, element3, context, "bind-attr", [], {"class": ":btn :btn-sm :btn-warning model.isCancelling:disabled"});
            element(env, element3, context, "action", ["stopCurrentJob"], {});
            block(env, morph0, context, "if", [get(env, context, "model.isCancelling")], {}, child0, child1);
            return fragment;
          }
        };
      }());
      var child2 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            dom.setAttribute(el1,"type","button");
            dom.setAttribute(el1,"class","btn btn-sm btn-danger kill-session");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element2 = dom.childAt(fragment, [1]);
            var morph0 = dom.createMorphAt(element2,-1,-1);
            element(env, element2, context, "action", ["killSession"], {});
            inline(env, morph0, context, "t", ["buttons.killSession"], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","toolbox");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          dom.setAttribute(el2,"type","button");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          dom.setAttribute(el2,"type","button");
          dom.setAttribute(el2,"class","btn btn-sm btn-default save-query-as");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          dom.setAttribute(el2,"type","button");
          dom.setAttribute(el2,"class","btn btn-sm btn-primary  pull-right");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline, get = hooks.get, block = hooks.block, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element5 = dom.childAt(fragment, [2]);
          var element6 = dom.childAt(element5, [2]);
          var element7 = dom.childAt(element5, [4]);
          var element8 = dom.childAt(element5, [8]);
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          var morph1 = dom.createMorphAt(element5,0,1);
          var morph2 = dom.createMorphAt(element6,0,1);
          var morph3 = dom.createMorphAt(element7,-1,-1);
          var morph4 = dom.createMorphAt(element5,5,6);
          var morph5 = dom.createMorphAt(element5,6,7);
          var morph6 = dom.createMorphAt(element8,-1,-1);
          inline(env, morph0, context, "render", ["open-queries"], {});
          block(env, morph1, context, "if", [get(env, context, "canExecute")], {}, child0, child1);
          element(env, element6, context, "bind-attr", [], {"class": ":btn :btn-sm :btn-default canExecute::disabled"});
          element(env, element6, context, "action", ["explainQuery"], {});
          inline(env, morph2, context, "t", ["buttons.explain"], {});
          element(env, element7, context, "action", ["saveQuery"], {});
          inline(env, morph3, context, "t", ["buttons.saveAs"], {});
          inline(env, morph4, context, "render", ["insert-udfs"], {});
          block(env, morph5, context, "if", [get(env, context, "canKillSession")], {}, child2, null);
          element(env, element8, context, "action", ["addQuery"], {});
          inline(env, morph6, context, "t", ["buttons.newQuery"], {});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            block(env, morph0, context, "progress-widget", [], {"value": get(env, context, "jobProgressService.currentJob.totalProgress")}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "if", [get(env, context, "jobProgressService.currentJob.stages.length")], {}, child0, null);
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("              ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              var el2 = dom.createTextNode("\n                ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("label");
              dom.setAttribute(el2,"class","col-sm-3 control-label");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n                  ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("div");
              dom.setAttribute(el2,"class","col-sm-9");
              var el3 = dom.createTextNode("\n                    ");
              dom.appendChild(el2, el3);
              var el3 = dom.createTextNode("\n                  ");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n              ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, element = hooks.element, content = hooks.content, get = hooks.get, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var element1 = dom.childAt(fragment, [1]);
              var morph0 = dom.createMorphAt(dom.childAt(element1, [1]),-1,-1);
              var morph1 = dom.createMorphAt(dom.childAt(element1, [3]),0,1);
              element(env, element1, context, "bind-attr", [], {"class": ":form-group param.value:has-success:has-error"});
              content(env, morph0, context, "param.name");
              inline(env, morph1, context, "input", [], {"value": get(env, context, "param.value"), "placeholder": "value", "class": "form-control"});
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","form-horizontal");
            var el2 = dom.createTextNode("\n");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("          ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
            block(env, morph0, context, "each", [get(env, context, "queryParams")], {"keyword": "param"}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "panel-widget", [], {"headingTranslation": "titles.query.parameters"}, child0, null);
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("            ");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, content = hooks.content;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              content(env, morph0, context, "outlet");
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            block(env, morph0, context, "tabs-widget", [], {"tabs": get(env, context, "queryProcessTabs"), "selectedTab": get(env, context, "selectedQueryProcessTab")}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "panel-widget", [], {"heading": get(env, context, "queryProcessTitle"), "isLoading": get(env, context, "content.isRunning"), "menuItems": get(env, context, "downloadMenu"), "menuHeadingTranslation": "titles.download", "classNames": "query-process-results-panel"}, child0, null);
          return fragment;
        }
      };
    }());
    var child4 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("ul");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),-1,-1);
          var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),-1,-1);
          var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),-1,-1);
          inline(env, morph0, context, "t", ["popover.queryEditorHelp.content.line1"], {});
          inline(env, morph1, context, "t", ["popover.queryEditorHelp.content.line2"], {});
          inline(env, morph2, context, "t", ["popover.queryEditorHelp.content.line3"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","index-content");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","main-content");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("aside");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","query-menu");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, inline = hooks.inline, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element9 = dom.childAt(fragment, [1]);
        var element10 = dom.childAt(element9, [1]);
        var element11 = dom.childAt(element10, [1]);
        var element12 = dom.childAt(element10, [3]);
        var element13 = dom.childAt(element9, [4]);
        var morph0 = dom.createMorphAt(element11,0,1);
        var morph1 = dom.createMorphAt(element12,0,1);
        var morph2 = dom.createMorphAt(element12,1,2);
        var morph3 = dom.createMorphAt(element12,2,3);
        var morph4 = dom.createMorphAt(element12,3,4);
        var morph5 = dom.createMorphAt(element9,2,3);
        var morph6 = dom.createMorphAt(element13,0,1);
        var morph7 = dom.createMorphAt(element13,1,2);
        element(env, element11, context, "bind-attr", [], {"class": "isDatabaseExplorerVisible:col-md-3:no-width :col-xs-3 :no-padding"});
        inline(env, morph0, context, "render", ["databases"], {});
        element(env, element12, context, "bind-attr", [], {"class": "isDatabaseExplorerVisible:col-md-9:col-md-12 :col-xs-9 :query-container"});
        block(env, morph1, context, "panel-widget", [], {"headingTranslation": "titles.query.editor", "classNames": "query-editor-panel", "iconActions": get(env, context, "queryPanelActions")}, child0, null);
        block(env, morph2, context, "if", [get(env, context, "displayJobTabs")], {}, child1, null);
        block(env, morph3, context, "if", [get(env, context, "queryParams")], {}, child2, null);
        block(env, morph4, context, "if", [get(env, context, "displayJobTabs")], {}, child3, null);
        inline(env, morph5, context, "outlet", ["overlay"], {});
        block(env, morph6, context, "popover-widget", [], {"classNames": "fa fa-info-circle queries-icon", "titleTranslation": "popover.queryEditorHelp.title"}, child4, null);
        inline(env, morph7, context, "render", ["query-tabs"], {});
        return fragment;
      }
    };
  }()));

});
define('hive/templates/index/history-query/explain', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "tree-view", [], {"content": get(env, context, "header.contents")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "expander-widget", [], {"heading": get(env, context, "header.text")}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        block(env, morph0, context, "each", [get(env, context, "formattedExplain")], {"keyword": "header"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/index/history-query/logs', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        inline(env, morph0, context, "log-helper", [get(env, context, "model.log")], {});
        return fragment;
      }
    };
  }()));

});
define('hive/templates/index/history-query/results', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("th");
            var el2 = dom.createTextNode(" ");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(" ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
            content(env, morph0, context, "column.name");
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("              ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("td");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, content = hooks.content;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),-1,-1);
              content(env, morph0, context, "item");
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("tr");
            var el2 = dom.createTextNode("\n");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("          ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
            block(env, morph0, context, "each", [get(env, context, "row")], {"keyword": "item"}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","query-results-tools");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","pull-right");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("button");
          dom.setAttribute(el3,"type","button");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("button");
          dom.setAttribute(el3,"type","button");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("table");
          dom.setAttribute(el1,"class","table table-expandable");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("thead");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("tr");
          var el4 = dom.createTextNode("\n");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("        ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("tbody");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("      ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline, element = hooks.element, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [2]);
          var element2 = dom.childAt(element1, [1]);
          var element3 = dom.childAt(element1, [3]);
          var element4 = dom.childAt(fragment, [3]);
          var morph0 = dom.createMorphAt(element0,0,1);
          var morph1 = dom.createMorphAt(element2,-1,-1);
          var morph2 = dom.createMorphAt(element3,-1,-1);
          var morph3 = dom.createMorphAt(dom.childAt(element4, [1, 1]),0,1);
          var morph4 = dom.createMorphAt(dom.childAt(element4, [3]),0,1);
          inline(env, morph0, context, "extended-input", [], {"type": "text", "class": "pull-left input-sm form-control", "placeholderTranslation": "placeholders.search.results", "valueChanged": "filterResults"});
          element(env, element2, context, "action", ["getPreviousPage"], {});
          element(env, element2, context, "bind-attr", [], {"class": ":btn :btn-sm :btn-default disablePrevious:disabled"});
          inline(env, morph1, context, "t", ["buttons.previousPage"], {});
          element(env, element3, context, "action", ["getNextPage"], {});
          element(env, element3, context, "bind-attr", [], {"class": ":btn :btn-sm :btn-default disableNext:disabled"});
          inline(env, morph2, context, "t", ["buttons.nextPage"], {});
          block(env, morph3, context, "each", [get(env, context, "formattedResults.columns")], {"keyword": "column"}, child0, null);
          block(env, morph4, context, "each", [get(env, context, "formattedResults.rows")], {"keyword": "row"}, child1, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          content(env, morph0, context, "error");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","query-results");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,-1);
        block(env, morph0, context, "if", [get(env, context, "results")], {}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/insert-udfs', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("            ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("a");
              dom.setAttribute(el1,"tabindex","-1");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, content = hooks.content;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),-1,-1);
              content(env, morph0, context, "item.file.name");
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("            ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("a");
              dom.setAttribute(el1,"tabindex","-1");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),-1,-1);
              inline(env, morph0, context, "tb-helper", [get(env, context, "item.name")], {});
              return fragment;
            }
          };
        }());
        var child2 = (function() {
          var child0 = (function() {
            return {
              isHTMLBars: true,
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("                  ");
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                var hooks = env.hooks, content = hooks.content;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
                content(env, morph0, context, "udf.name");
                return fragment;
              }
            };
          }());
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("              ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("li");
              var el2 = dom.createTextNode("\n");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("              ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, block = hooks.block;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
              block(env, morph0, context, "no-bubbling", [], {"click": "insertUdf", "data": get(env, context, "udf"), "tagName": "a"}, child0, null);
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1,"class","dropdown dropdown-submenu");
            var el2 = dom.createTextNode("\n");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("ul");
            dom.setAttribute(el2,"class","dropdown-menu");
            var el3 = dom.createTextNode("\n");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("          ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var morph0 = dom.createMorphAt(element0,0,1);
            var morph1 = dom.createMorphAt(dom.childAt(element0, [2]),0,1);
            block(env, morph0, context, "if", [get(env, context, "item.file")], {}, child0, child1);
            block(env, morph1, context, "each", [get(env, context, "item.udfs")], {"keyword": "udf"}, child2, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","dropdown insert-udfs");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"role","button");
          dom.setAttribute(el2,"data-toggle","dropdown");
          dom.setAttribute(el2,"class","btn btn-default btn-sm");
          dom.setAttribute(el2,"data-target","#");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("span");
          dom.setAttribute(el3,"class","caret");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("ul");
          dom.setAttribute(el2,"class","dropdown-menu pull-right");
          dom.setAttribute(el2,"role","menu");
          dom.setAttribute(el2,"aria-labelledby","dropdownMenu");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element1, [1]),0,1);
          var morph1 = dom.createMorphAt(dom.childAt(element1, [3]),0,1);
          inline(env, morph0, context, "t", ["placeholders.select.udfs"], {});
          block(env, morph1, context, "each", [get(env, context, "this")], {"keyword": "item"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        block(env, morph0, context, "if", [get(env, context, "this.length")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/loading', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","spinner");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        return fragment;
      }
    };
  }()));

});
define('hive/templates/logs', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        inline(env, morph0, context, "log-helper", [get(env, context, "model.log")], {});
        return fragment;
      }
    };
  }()));

});
define('hive/templates/message', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,0,1);
          element(env, element0, context, "action", ["expand"], {"target": "view"});
          content(env, morph0, context, "view.notification.message");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          content(env, morph0, context, "view.notification.message");
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("pre");
          dom.setAttribute(el1,"class","message-body");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          inline(env, morph0, context, "preformatted-string", [get(env, context, "view.notification.body")], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"type","button");
        dom.setAttribute(el2,"class","close");
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"aria-hidden","true");
        var el4 = dom.createTextNode("×");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("i");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [1]);
        var element2 = dom.childAt(element1, [1]);
        var element3 = dom.childAt(element1, [3]);
        var morph0 = dom.createMorphAt(element1,4,5);
        var morph1 = dom.createMorphAt(element1,5,-1);
        element(env, element1, context, "bind-attr", [], {"class": ":alert :notification view.typeClass"});
        element(env, element2, context, "action", ["close"], {"target": "view"});
        element(env, element3, context, "bind-attr", [], {"class": ":fa view.typeIcon"});
        block(env, morph0, context, "if", [get(env, context, "view.notification.body")], {}, child0, child1);
        block(env, morph1, context, "if", [get(env, context, "view.isExpanded")], {}, child2, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/messages', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            dom.setAttribute(el1,"class","btn btn-danger btn-xs");
            var el2 = dom.createElement("i");
            dom.setAttribute(el2,"class","fa fa-minus");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(" Clear All");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            element(env, element0, context, "action", ["removeAllMessages"], {});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "view", ["message"], {"notification": get(env, context, "message")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","messages-controls");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[3]); }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          var morph1 = dom.createMorphAt(fragment,2,3,contextualElement);
          block(env, morph0, context, "if", [get(env, context, "messages.length")], {}, child0, null);
          block(env, morph1, context, "each", [get(env, context, "messages")], {"keyword": "message"}, child1, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","messages");
        dom.setAttribute(el1,"class","index-overlay");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,-1);
        block(env, morph0, context, "panel-widget", [], {"headingTranslation": "titles.query.messages"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/modal-delete', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          inline(env, morph0, context, "tb-helper", [get(env, context, "text")], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        block(env, morph0, context, "modal-widget", [], {"heading": get(env, context, "heading"), "close": "close", "ok": "delete"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/modal-save-query', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","label label-warning");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),-1,-1);
            inline(env, morph0, context, "tb-helper", [get(env, context, "message")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[2]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
          inline(env, morph0, context, "input", [], {"type": "text", "class": "form-control", "value": get(env, context, "text")});
          block(env, morph1, context, "if", [get(env, context, "showMessage")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        block(env, morph0, context, "modal-widget", [], {"heading": get(env, context, "heading"), "close": "close", "ok": "save"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/modal-save', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          inline(env, morph0, context, "input", [], {"type": get(env, context, "type"), "class": "form-control", "value": get(env, context, "text")});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        block(env, morph0, context, "modal-widget", [], {"heading": get(env, context, "heading"), "close": "close", "ok": "save"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/notification', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"type","button");
        dom.setAttribute(el2,"class","close");
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"aria-hidden","true");
        var el4 = dom.createTextNode("×");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("i");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [1]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element0, [3]);
        var morph0 = dom.createMorphAt(element0,4,5);
        element(env, element0, context, "bind-attr", [], {"class": ":alert :notification view.typeClass"});
        element(env, element1, context, "action", ["close"], {"target": "view"});
        element(env, element2, context, "bind-attr", [], {"class": ":fa view.typeIcon"});
        content(env, morph0, context, "view.notification.message");
        return fragment;
      }
    };
  }()));

});
define('hive/templates/open-queries', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline, get = hooks.get;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
          inline(env, morph0, context, "outlet", ["overlay"], {});
          inline(env, morph1, context, "query-editor", [], {"tables": get(env, context, "selectedTables"), "query": get(env, context, "currentQuery.fileContent"), "editor": get(env, context, "view.editor"), "highlightedText": get(env, context, "highlightedText"), "columnsNeeded": "getColumnsForAutocomplete"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        block(env, morph0, context, "tabs-widget", [], {"tabs": get(env, context, "queryTabs"), "removeClicked": "removeQueryTab", "canRemove": true, "onActiveTitleClick": "changeTabTitle"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/queries', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "column-filter-widget", [], {"class": "pull-left", "column": get(env, context, "column"), "filterValue": get(env, context, "column.filterValue"), "sortAscending": get(env, context, "controller.sortAscending"), "sortProperties": get(env, context, "controller.sortProperties"), "columnSorted": "sort", "columnFiltered": "filter"});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            content(env, morph0, context, "column.caption");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("th");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          block(env, morph0, context, "if", [get(env, context, "column.caption")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          var child0 = (function() {
            var child0 = (function() {
              return {
                isHTMLBars: true,
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createDocumentFragment();
                  var el1 = dom.createTextNode("                  ");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createTextNode("\n");
                  dom.appendChild(el0, el1);
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  var hooks = env.hooks, content = hooks.content;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
                  content(env, morph0, context, "query.shortQuery");
                  return fragment;
                }
              };
            }());
            var child1 = (function() {
              return {
                isHTMLBars: true,
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createDocumentFragment();
                  var el1 = dom.createTextNode("                  ");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createTextNode("\n");
                  dom.appendChild(el0, el1);
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  var hooks = env.hooks, content = hooks.content;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
                  content(env, morph0, context, "query.title");
                  return fragment;
                }
              };
            }());
            var child2 = (function() {
              var child0 = (function() {
                return {
                  isHTMLBars: true,
                  blockParams: 0,
                  cachedFragment: null,
                  hasRendered: false,
                  build: function build(dom) {
                    var el0 = dom.createDocumentFragment();
                    var el1 = dom.createTextNode("                        ");
                    dom.appendChild(el0, el1);
                    var el1 = dom.createElement("li");
                    var el2 = dom.createElement("a");
                    dom.appendChild(el1, el2);
                    dom.appendChild(el0, el1);
                    var el1 = dom.createTextNode("\n");
                    dom.appendChild(el0, el1);
                    return el0;
                  },
                  render: function render(context, env, contextualElement) {
                    var dom = env.dom;
                    var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline;
                    dom.detectNamespace(contextualElement);
                    var fragment;
                    if (env.useFragmentCache && dom.canClone) {
                      if (this.cachedFragment === null) {
                        fragment = this.build(dom);
                        if (this.hasRendered) {
                          this.cachedFragment = fragment;
                        } else {
                          this.hasRendered = true;
                        }
                      }
                      if (this.cachedFragment) {
                        fragment = dom.cloneNode(this.cachedFragment, true);
                      }
                    } else {
                      fragment = this.build(dom);
                    }
                    var element0 = dom.childAt(fragment, [1]);
                    var morph0 = dom.createMorphAt(dom.childAt(element0, [0]),-1,-1);
                    element(env, element0, context, "action", ["executeAction", get(env, context, "link"), get(env, context, "query")], {});
                    inline(env, morph0, context, "tb-helper", [get(env, context, "link")], {});
                    return fragment;
                  }
                };
              }());
              return {
                isHTMLBars: true,
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createDocumentFragment();
                  var el1 = dom.createTextNode("                  ");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createElement("div");
                  dom.setAttribute(el1,"class","btn-group pull-right");
                  var el2 = dom.createTextNode("\n                    ");
                  dom.appendChild(el1, el2);
                  var el2 = dom.createElement("span");
                  dom.setAttribute(el2,"data-toggle","dropdown");
                  var el3 = dom.createTextNode("\n                      ");
                  dom.appendChild(el2, el3);
                  var el3 = dom.createElement("a");
                  dom.setAttribute(el3,"class","fa fa-gear");
                  dom.appendChild(el2, el3);
                  var el3 = dom.createTextNode("\n                    ");
                  dom.appendChild(el2, el3);
                  dom.appendChild(el1, el2);
                  var el2 = dom.createTextNode("\n                    ");
                  dom.appendChild(el1, el2);
                  var el2 = dom.createElement("ul");
                  dom.setAttribute(el2,"class","dropdown-menu");
                  dom.setAttribute(el2,"role","menu");
                  var el3 = dom.createTextNode("\n");
                  dom.appendChild(el2, el3);
                  var el3 = dom.createTextNode("                    ");
                  dom.appendChild(el2, el3);
                  dom.appendChild(el1, el2);
                  var el2 = dom.createTextNode("\n                  ");
                  dom.appendChild(el1, el2);
                  dom.appendChild(el0, el1);
                  var el1 = dom.createTextNode("\n");
                  dom.appendChild(el0, el1);
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  var hooks = env.hooks, get = hooks.get, block = hooks.block;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 3]),0,1);
                  block(env, morph0, context, "each", [get(env, context, "controller.links")], {"keyword": "link"}, child0, null);
                  return fragment;
                }
              };
            }());
            return {
              isHTMLBars: true,
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("            ");
                dom.appendChild(el0, el1);
                var el1 = dom.createElement("tr");
                var el2 = dom.createTextNode("\n              ");
                dom.appendChild(el1, el2);
                var el2 = dom.createElement("td");
                var el3 = dom.createTextNode("\n");
                dom.appendChild(el2, el3);
                var el3 = dom.createTextNode("              ");
                dom.appendChild(el2, el3);
                dom.appendChild(el1, el2);
                var el2 = dom.createTextNode("\n\n              ");
                dom.appendChild(el1, el2);
                var el2 = dom.createElement("td");
                var el3 = dom.createTextNode("\n");
                dom.appendChild(el2, el3);
                var el3 = dom.createTextNode("              ");
                dom.appendChild(el2, el3);
                dom.appendChild(el1, el2);
                var el2 = dom.createTextNode("\n\n              ");
                dom.appendChild(el1, el2);
                var el2 = dom.createElement("td");
                dom.appendChild(el1, el2);
                var el2 = dom.createTextNode("\n\n              ");
                dom.appendChild(el1, el2);
                var el2 = dom.createElement("td");
                dom.appendChild(el1, el2);
                var el2 = dom.createTextNode("\n\n              ");
                dom.appendChild(el1, el2);
                var el2 = dom.createElement("td");
                var el3 = dom.createTextNode("\n");
                dom.appendChild(el2, el3);
                var el3 = dom.createTextNode("              ");
                dom.appendChild(el2, el3);
                dom.appendChild(el1, el2);
                var el2 = dom.createTextNode("\n            ");
                dom.appendChild(el1, el2);
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                var hooks = env.hooks, get = hooks.get, block = hooks.block, content = hooks.content;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                var element1 = dom.childAt(fragment, [1]);
                var morph0 = dom.createMorphAt(dom.childAt(element1, [1]),0,1);
                var morph1 = dom.createMorphAt(dom.childAt(element1, [3]),0,1);
                var morph2 = dom.createMorphAt(dom.childAt(element1, [5]),-1,-1);
                var morph3 = dom.createMorphAt(dom.childAt(element1, [7]),-1,-1);
                var morph4 = dom.createMorphAt(dom.childAt(element1, [9]),0,1);
                block(env, morph0, context, "link-to", ["index.savedQuery", get(env, context, "query")], {}, child0, null);
                block(env, morph1, context, "link-to", ["index.savedQuery", get(env, context, "query")], {}, child1, null);
                content(env, morph2, context, "query.dataBase");
                content(env, morph3, context, "query.owner");
                block(env, morph4, context, "unless", [get(env, context, "query.isNew")], {}, child2, null);
                return fragment;
              }
            };
          }());
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, block = hooks.block;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              block(env, morph0, context, "unless", [get(env, context, "query.isNew")], {}, child0, null);
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            block(env, morph0, context, "each", [get(env, context, "this")], {"keyword": "query"}, child0, null);
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("tr");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            dom.setAttribute(el2,"colspan","5");
            var el3 = dom.createTextNode("\n            ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("h4");
            dom.setAttribute(el3,"class","empty-list");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n          ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1, 1]),-1,-1);
            inline(env, morph0, context, "t", ["emptyList.savedQueries.noMatches"], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "if", [get(env, context, "model.length")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2,"colspan","5");
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("h4");
          dom.setAttribute(el3,"class","empty-list");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1, 1]),-1,-1);
          inline(env, morph0, context, "t", ["emptyList.savedQueries.noItems"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("table");
        dom.setAttribute(el1,"class","table");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("thead");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"type","btn");
        dom.setAttribute(el5,"class","btn btn-sm btn-warning pull-right clear-filters");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tbody");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, element = hooks.element, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element2 = dom.childAt(fragment, [1]);
        var element3 = dom.childAt(element2, [1, 1]);
        var element4 = dom.childAt(element3, [2, 1]);
        var morph0 = dom.createMorphAt(element3,0,1);
        var morph1 = dom.createMorphAt(element4,-1,-1);
        var morph2 = dom.createMorphAt(dom.childAt(element2, [3]),0,1);
        block(env, morph0, context, "each", [get(env, context, "columns")], {"keyword": "column"}, child0, null);
        element(env, element4, context, "action", ["clearFilters"], {});
        inline(env, morph1, context, "t", ["buttons.clearFilters"], {});
        block(env, morph2, context, "if", [get(env, context, "queries.length")], {}, child1, child2);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/query-tabs', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","badge");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),-1,-1);
            content(env, morph0, context, "tab.badge");
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            content(env, morph0, context, "tab.text");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, element = hooks.element, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          if (this.cachedFragment) { dom.repairClonedNode(element0,[1]); }
          var morph0 = dom.createMorphAt(element0,0,1);
          var morph1 = dom.createMorphAt(element0,1,2);
          element(env, element0, context, "action", [get(env, context, "tab.action"), get(env, context, "tab")], {});
          element(env, element0, context, "bind-attr", [], {"class": ":query-menu-tab tabClassNames tab.iconClass tab.active:active tab.flash:flash", "title": "tab.tooltip", "id": "tab.id"});
          block(env, morph0, context, "if", [get(env, context, "tab.badge")], {}, child0, null);
          block(env, morph1, context, "if", [get(env, context, "tab.text")], {}, child1, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        block(env, morph0, context, "each", [get(env, context, "tabs")], {"keyword": "tab"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/redirect', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('hive/templates/settings', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          dom.setAttribute(el1,"class","btn btn-danger btn-xs");
          var el2 = dom.createElement("i");
          dom.setAttribute(el2,"class","fa fa-minus");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" Remove All");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element4 = dom.childAt(fragment, [1]);
          element(env, element4, context, "action", ["removeAll"], {});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                  ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "select-widget", [], {"items": get(env, context, "setting.key.values"), "labelPath": "value", "selectedValue": get(env, context, "setting.selection"), "defaultLabelTranslation": "placeholders.select.value"});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                  ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "input", [], {"class": "input-sm form-control", "placeholderTranslation": "placeholders.select.value", "value": get(env, context, "setting.selection.value")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","setting col-md-12 col-sm-12");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("form");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","form-group");
          var el4 = dom.createTextNode("\n          ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","input-group");
          var el5 = dom.createTextNode("\n            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          dom.setAttribute(el5,"class","input-group-addon");
          var el6 = dom.createTextNode("\n\n              ");
          dom.appendChild(el5, el6);
          var el6 = dom.createElement("div");
          dom.setAttribute(el6,"class","typeahead-container");
          var el7 = dom.createTextNode("\n                ");
          dom.appendChild(el6, el7);
          var el7 = dom.createTextNode("\n              ");
          dom.appendChild(el6, el7);
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n            ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("div");
          var el6 = dom.createTextNode("\n              ");
          dom.appendChild(el5, el6);
          var el6 = dom.createElement("div");
          dom.setAttribute(el6,"class","setting-input-value");
          var el7 = dom.createTextNode("\n");
          dom.appendChild(el6, el7);
          var el7 = dom.createTextNode("              ");
          dom.appendChild(el6, el7);
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n\n              ");
          dom.appendChild(el5, el6);
          var el6 = dom.createElement("span");
          dom.setAttribute(el6,"class","fa fa-times-circle remove pull-right");
          dom.appendChild(el5, el6);
          var el6 = dom.createTextNode("\n            ");
          dom.appendChild(el5, el6);
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n          ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1, 1, 1]);
          var element1 = dom.childAt(element0, [1, 1]);
          var element2 = dom.childAt(element0, [3]);
          var element3 = dom.childAt(element2, [3]);
          var morph0 = dom.createMorphAt(element1,0,1);
          var morph1 = dom.createMorphAt(dom.childAt(element2, [1]),0,1);
          element(env, element1, context, "bind-attr", [], {"keyname": "setting.key.name"});
          inline(env, morph0, context, "typeahead-widget", [], {"options": get(env, context, "predefinedSettings"), "excluded": get(env, context, "excluded"), "optionLabelPath": "name", "optionValuePath": "name", "plugins": "remove_button,restore_on_backspace", "selection": get(env, context, "setting.key"), "safeValue": get(env, context, "setting.key.name"), "create": "addKey"});
          element(env, element2, context, "bind-attr", [], {"class": ":input-group-addon setting.valid::has-error"});
          block(env, morph1, context, "if", [get(env, context, "setting.key.values")], {}, child0, child1);
          element(env, element3, context, "action", ["remove", get(env, context, "setting")], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","editor-overlay settings-container fadeIn");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","settings-controls");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","btn btn-success btn-xs");
        var el4 = dom.createElement("i");
        dom.setAttribute(el4,"class","fa fa-plus");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(" Add");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","btn btn-success btn-xs pull-right");
        var el4 = dom.createElement("i");
        dom.setAttribute(el4,"class","fa fa-plus");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(" Save Default Settings");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element5 = dom.childAt(fragment, [1]);
        var element6 = dom.childAt(element5, [1]);
        var element7 = dom.childAt(element6, [1]);
        var element8 = dom.childAt(element6, [4]);
        var morph0 = dom.createMorphAt(element6,2,3);
        var morph1 = dom.createMorphAt(element5,2,-1);
        element(env, element7, context, "action", ["add"], {});
        block(env, morph0, context, "if", [get(env, context, "settings.length")], {}, child0, null);
        element(env, element8, context, "action", ["saveDefaultSettings"], {});
        block(env, morph1, context, "each", [get(env, context, "settings")], {"keyword": "setting"}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/tez-ui', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("iframe");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, element = hooks.element;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            element(env, element0, context, "bind-attr", [], {"src": get(env, context, "dagURL")});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("        ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1,"class","alert alert-danger");
              dom.setAttribute(el1,"role","alert");
              var el2 = dom.createElement("strong");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 0]),-1,-1);
              inline(env, morph0, context, "tb-helper", [get(env, context, "error")], {});
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("        ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1,"class","alert alert-danger");
              dom.setAttribute(el1,"role","alert");
              var el2 = dom.createElement("strong");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 0]),-1,-1);
              inline(env, morph0, context, "tb-helper", ["tez.errors.no.dag"], {});
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            block(env, morph0, context, "if", [get(env, context, "error")], {}, child0, child1);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "if", [get(env, context, "dagURL")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","tez-ui");
        dom.setAttribute(el1,"class","index-overlay");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,-1);
        block(env, morph0, context, "panel-widget", [], {"headingTranslation": "titles.query.tez"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/udfs', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("th");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          inline(env, morph0, context, "column-filter-widget", [], {"class": "pull-left", "column": get(env, context, "column"), "filterValue": get(env, context, "column.filterValue"), "sortAscending": get(env, context, "controller.sortAscending"), "sortProperties": get(env, context, "controller.sortProperties"), "columnSorted": "sort", "columnFiltered": "filter"});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          inline(env, morph0, context, "udf-tr-view", [], {"udf": get(env, context, "udf"), "fileResources": get(env, context, "fileResources"), "columns": get(env, context, "columns"), "onAddFileResource": "handleAddFileResource", "onDeleteFileResource": "handleDeleteFileResource", "onSaveUdf": "handleSaveUdf", "onDeleteUdf": "handleDeleteUdf"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("table");
        dom.setAttribute(el1,"class","table");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("thead");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","pull-right");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("button");
        dom.setAttribute(el6,"type","button");
        dom.setAttribute(el6,"class","btn btn-sm btn-warning clear-filters");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("button");
        dom.setAttribute(el6,"type","button");
        dom.setAttribute(el6,"class","btn btn-sm btn-success add-udf");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tbody");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline, get = hooks.get, block = hooks.block, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [1]);
        var element1 = dom.childAt(element0, [1, 1]);
        var element2 = dom.childAt(element1, [4, 1]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element2, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element1, [1]),-1,-1);
        var morph1 = dom.createMorphAt(element1,2,3);
        var morph2 = dom.createMorphAt(element3,-1,-1);
        var morph3 = dom.createMorphAt(element4,-1,-1);
        var morph4 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
        inline(env, morph0, context, "t", ["columns.fileResource"], {});
        block(env, morph1, context, "each", [get(env, context, "columns")], {"keyword": "column"}, child0, null);
        element(env, element3, context, "action", ["clearFilters"], {});
        inline(env, morph2, context, "t", ["buttons.clearFilters"], {});
        element(env, element4, context, "action", ["add"], {});
        inline(env, morph3, context, "t", ["buttons.newUdf"], {});
        block(env, morph4, context, "each", [get(env, context, "this")], {"keyword": "udf"}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/upload-table', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          inline(env, morph0, context, "render", ["messages"], {});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("      ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("th");
              var el2 = dom.createTextNode(" ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,-1);
              inline(env, morph0, context, "input", [], {"type": "text", "class": "form-control", "value": get(env, context, "column.name")});
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("      ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("th");
              var el2 = dom.createTextNode(" ");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n      ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
              inline(env, morph0, context, "typeahead-widget", [], {"content": get(env, context, "dataTypes"), "selection": get(env, context, "column.type")});
              return fragment;
            }
          };
        }());
        var child2 = (function() {
          var child0 = (function() {
            return {
              isHTMLBars: true,
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("      ");
                dom.appendChild(el0, el1);
                var el1 = dom.createElement("td");
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                var hooks = env.hooks, content = hooks.content;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),-1,-1);
                content(env, morph0, context, "item");
                return fragment;
              }
            };
          }());
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("    ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("tr");
              var el2 = dom.createTextNode("\n");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("    ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, block = hooks.block;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
              block(env, morph0, context, "each", [get(env, context, "row.row")], {"keyword": "item"}, child0, null);
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("  ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","query-results-tools");
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2,"class","pull-right");
            var el3 = dom.createTextNode("\n      ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("button");
            dom.setAttribute(el3,"type","button");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n    ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n  ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n\n  ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2,"class","col-md-3");
            var el3 = dom.createTextNode("Database :\n      ");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n    ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2,"class","col-md-3");
            var el3 = dom.createTextNode("Table Name : ");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n    ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2,"class","col-md-3");
            var el3 = dom.createTextNode("Is First Row Header? :");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n    ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n  ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"id","upload-table");
            var el2 = dom.createTextNode("\n  ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("table");
            dom.setAttribute(el2,"class","table table-expandable");
            var el3 = dom.createTextNode("\n    ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("thead");
            var el4 = dom.createTextNode("\n    ");
            dom.appendChild(el3, el4);
            var el4 = dom.createElement("tr");
            var el5 = dom.createTextNode("\n");
            dom.appendChild(el4, el5);
            var el5 = dom.createTextNode("    ");
            dom.appendChild(el4, el5);
            dom.appendChild(el3, el4);
            var el4 = dom.createTextNode("\n    ");
            dom.appendChild(el3, el4);
            var el4 = dom.createElement("tr");
            var el5 = dom.createTextNode("\n");
            dom.appendChild(el4, el5);
            var el5 = dom.createTextNode("    ");
            dom.appendChild(el4, el5);
            dom.appendChild(el3, el4);
            var el4 = dom.createTextNode("\n    ");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n    ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("tbody");
            var el4 = dom.createTextNode("\n");
            dom.appendChild(el3, el4);
            var el4 = dom.createTextNode("    ");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n  ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, inline = hooks.inline, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1, 1, 1]);
            var element1 = dom.childAt(fragment, [3]);
            var element2 = dom.childAt(fragment, [5, 1]);
            var element3 = dom.childAt(element2, [1]);
            var morph0 = dom.createMorphAt(element0,-1,-1);
            var morph1 = dom.createMorphAt(dom.childAt(element1, [1]),0,1);
            var morph2 = dom.createMorphAt(dom.childAt(element1, [3]),0,1);
            var morph3 = dom.createMorphAt(dom.childAt(element1, [5]),0,1);
            var morph4 = dom.createMorphAt(dom.childAt(element3, [1]),0,1);
            var morph5 = dom.createMorphAt(dom.childAt(element3, [3]),0,1);
            var morph6 = dom.createMorphAt(dom.childAt(element2, [3]),0,1);
            element(env, element0, context, "action", ["createTableAndUploadFile"], {});
            element(env, element0, context, "bind-attr", [], {"class": ":btn :btn-sm :btn-default"});
            inline(env, morph0, context, "t", ["buttons.uploadTable"], {});
            inline(env, morph1, context, "typeahead-widget", [], {"content": get(env, context, "controllers.databases.databases"), "optionValuePath": "id", "optionLabelPath": "name", "selection": get(env, context, "selectedDatabase"), "placeholder": "Select a Database"});
            inline(env, morph2, context, "input", [], {"type": "text", "class": "form-control", "placeHolder": "Table Name", "value": get(env, context, "tableName")});
            inline(env, morph3, context, "input", [], {"id": "isFirstRowHeader", "type": "checkbox", "class": "form-control", "checked": get(env, context, "isFirstRowHeader")});
            block(env, morph4, context, "each", [get(env, context, "header")], {"keyword": "column"}, child0, null);
            block(env, morph5, context, "each", [get(env, context, "header")], {"keyword": "column"}, child1, null);
            block(env, morph6, context, "each", [get(env, context, "rows")], {"keyword": "row"}, child2, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("<div class='fa query-menu-tab fa queries-icon query-context-tab fa-envelope'></div>");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[3]); }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,1);
          var morph1 = dom.createMorphAt(fragment,3,4,contextualElement);
          inline(env, morph0, context, "file-upload", [], {"filesUploaded": "filesUploaded"});
          block(env, morph1, context, "if", [get(env, context, "rows")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","pull-right");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("i");
        dom.setAttribute(el2,"class","query-menu-tab fa queries-icon query-context-tab fa-envelope");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"style","width : 90%");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","main-content");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[5]); }
        var element4 = dom.childAt(fragment, [1, 1]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [3, 1]),0,-1);
        var morph1 = dom.createMorphAt(fragment,4,5,contextualElement);
        element(env, element4, context, "action", ["toggleErrors"], {});
        block(env, morph0, context, "if", [get(env, context, "showErrors")], {}, child0, null);
        block(env, morph1, context, "unless", [get(env, context, "showErrors")], {}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/visual-explain', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("      ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1,"class","alert alert-danger");
              dom.setAttribute(el1,"role","alert");
              var el2 = dom.createElement("strong");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 0]),-1,-1);
              inline(env, morph0, context, "tb-helper", ["hive.errors.no.query"], {});
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("      ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1,"class","spinner");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            block(env, morph0, context, "if", [get(env, context, "noquery")], {}, child0, child1);
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","edge");
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2,"class","edge-path");
            var el3 = dom.createTextNode("\n          ");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n        ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element5 = dom.childAt(fragment, [1, 1]);
            var morph0 = dom.createMorphAt(element5,0,1);
            element(env, element5, context, "bind-attr", [], {"style": "edge.style"});
            content(env, morph0, context, "edge.type");
            return fragment;
          }
        };
      }());
      var child2 = (function() {
        var child0 = (function() {
          var child0 = (function() {
            var child0 = (function() {
              return {
                isHTMLBars: true,
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createDocumentFragment();
                  var el1 = dom.createTextNode("                  ");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createElement("p");
                  var el2 = dom.createElement("strong");
                  dom.appendChild(el1, el2);
                  dom.appendChild(el0, el1);
                  var el1 = dom.createTextNode("\n                  ");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createTextNode("\n");
                  dom.appendChild(el0, el1);
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  var hooks = env.hooks, inline = hooks.inline, content = hooks.content;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 0]),-1,-1);
                  var morph1 = dom.createMorphAt(fragment,2,3,contextualElement);
                  inline(env, morph0, context, "t", ["labels.table"], {});
                  content(env, morph1, context, "node.label");
                  return fragment;
                }
              };
            }());
            var child1 = (function() {
              var child0 = (function() {
                return {
                  isHTMLBars: true,
                  blockParams: 0,
                  cachedFragment: null,
                  hasRendered: false,
                  build: function build(dom) {
                    var el0 = dom.createDocumentFragment();
                    var el1 = dom.createTextNode("                    ");
                    dom.appendChild(el0, el1);
                    var el1 = dom.createTextNode("\n");
                    dom.appendChild(el0, el1);
                    return el0;
                  },
                  render: function render(context, env, contextualElement) {
                    var dom = env.dom;
                    var hooks = env.hooks, content = hooks.content;
                    dom.detectNamespace(contextualElement);
                    var fragment;
                    if (env.useFragmentCache && dom.canClone) {
                      if (this.cachedFragment === null) {
                        fragment = this.build(dom);
                        if (this.hasRendered) {
                          this.cachedFragment = fragment;
                        } else {
                          this.hasRendered = true;
                        }
                      }
                      if (this.cachedFragment) {
                        fragment = dom.cloneNode(this.cachedFragment, true);
                      }
                    } else {
                      fragment = this.build(dom);
                    }
                    var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
                    content(env, morph0, context, "node.label");
                    return fragment;
                  }
                };
              }());
              var child1 = (function() {
                var child0 = (function() {
                  var child0 = (function() {
                    return {
                      isHTMLBars: true,
                      blockParams: 0,
                      cachedFragment: null,
                      hasRendered: false,
                      build: function build(dom) {
                        var el0 = dom.createDocumentFragment();
                        var el1 = dom.createTextNode("                            ");
                        dom.appendChild(el0, el1);
                        var el1 = dom.createTextNode("\n");
                        dom.appendChild(el0, el1);
                        return el0;
                      },
                      render: function render(context, env, contextualElement) {
                        var dom = env.dom;
                        var hooks = env.hooks, content = hooks.content;
                        dom.detectNamespace(contextualElement);
                        var fragment;
                        if (env.useFragmentCache && dom.canClone) {
                          if (this.cachedFragment === null) {
                            fragment = this.build(dom);
                            if (this.hasRendered) {
                              this.cachedFragment = fragment;
                            } else {
                              this.hasRendered = true;
                            }
                          }
                          if (this.cachedFragment) {
                            fragment = dom.cloneNode(this.cachedFragment, true);
                          }
                        } else {
                          fragment = this.build(dom);
                        }
                        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
                        content(env, morph0, context, "section.statistics");
                        return fragment;
                      }
                    };
                  }());
                  var child1 = (function() {
                    var child0 = (function() {
                      return {
                        isHTMLBars: true,
                        blockParams: 0,
                        cachedFragment: null,
                        hasRendered: false,
                        build: function build(dom) {
                          var el0 = dom.createDocumentFragment();
                          var el1 = dom.createTextNode("                            ");
                          dom.appendChild(el0, el1);
                          var el1 = dom.createElement("p");
                          var el2 = dom.createTextNode(" ");
                          dom.appendChild(el1, el2);
                          dom.appendChild(el0, el1);
                          var el1 = dom.createTextNode("\n");
                          dom.appendChild(el0, el1);
                          return el0;
                        },
                        render: function render(context, env, contextualElement) {
                          var dom = env.dom;
                          var hooks = env.hooks, content = hooks.content;
                          dom.detectNamespace(contextualElement);
                          var fragment;
                          if (env.useFragmentCache && dom.canClone) {
                            if (this.cachedFragment === null) {
                              fragment = this.build(dom);
                              if (this.hasRendered) {
                                this.cachedFragment = fragment;
                              } else {
                                this.hasRendered = true;
                              }
                            }
                            if (this.cachedFragment) {
                              fragment = dom.cloneNode(this.cachedFragment, true);
                            }
                          } else {
                            fragment = this.build(dom);
                          }
                          var element1 = dom.childAt(fragment, [1]);
                          var morph0 = dom.createMorphAt(element1,-1,0);
                          var morph1 = dom.createMorphAt(element1,0,-1);
                          content(env, morph0, context, "field.label");
                          content(env, morph1, context, "field.value");
                          return fragment;
                        }
                      };
                    }());
                    return {
                      isHTMLBars: true,
                      blockParams: 0,
                      cachedFragment: null,
                      hasRendered: false,
                      build: function build(dom) {
                        var el0 = dom.createDocumentFragment();
                        var el1 = dom.createTextNode("");
                        dom.appendChild(el0, el1);
                        var el1 = dom.createTextNode("");
                        dom.appendChild(el0, el1);
                        return el0;
                      },
                      render: function render(context, env, contextualElement) {
                        var dom = env.dom;
                        var hooks = env.hooks, get = hooks.get, block = hooks.block;
                        dom.detectNamespace(contextualElement);
                        var fragment;
                        if (env.useFragmentCache && dom.canClone) {
                          if (this.cachedFragment === null) {
                            fragment = this.build(dom);
                            if (this.hasRendered) {
                              this.cachedFragment = fragment;
                            } else {
                              this.hasRendered = true;
                            }
                          }
                          if (this.cachedFragment) {
                            fragment = dom.cloneNode(this.cachedFragment, true);
                          }
                        } else {
                          fragment = this.build(dom);
                        }
                        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
                        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
                        block(env, morph0, context, "if", [get(env, context, "field.value")], {}, child0, null);
                        return fragment;
                      }
                    };
                  }());
                  return {
                    isHTMLBars: true,
                    blockParams: 0,
                    cachedFragment: null,
                    hasRendered: false,
                    build: function build(dom) {
                      var el0 = dom.createDocumentFragment();
                      var el1 = dom.createTextNode("                        ");
                      dom.appendChild(el0, el1);
                      var el1 = dom.createElement("p");
                      var el2 = dom.createTextNode("\n");
                      dom.appendChild(el1, el2);
                      var el2 = dom.createTextNode("                          ");
                      dom.appendChild(el1, el2);
                      var el2 = dom.createElement("strong");
                      var el3 = dom.createTextNode("\n                            ");
                      dom.appendChild(el2, el3);
                      var el3 = dom.createTextNode(". ");
                      dom.appendChild(el2, el3);
                      var el3 = dom.createTextNode("\n                          ");
                      dom.appendChild(el2, el3);
                      dom.appendChild(el1, el2);
                      var el2 = dom.createTextNode("\n                          ");
                      dom.appendChild(el1, el2);
                      var el2 = dom.createTextNode("\n                        ");
                      dom.appendChild(el1, el2);
                      dom.appendChild(el0, el1);
                      var el1 = dom.createTextNode("\n\n");
                      dom.appendChild(el0, el1);
                      var el1 = dom.createTextNode("");
                      dom.appendChild(el0, el1);
                      return el0;
                    },
                    render: function render(context, env, contextualElement) {
                      var dom = env.dom;
                      var hooks = env.hooks, block = hooks.block, content = hooks.content, get = hooks.get;
                      dom.detectNamespace(contextualElement);
                      var fragment;
                      if (env.useFragmentCache && dom.canClone) {
                        if (this.cachedFragment === null) {
                          fragment = this.build(dom);
                          if (this.hasRendered) {
                            this.cachedFragment = fragment;
                          } else {
                            this.hasRendered = true;
                          }
                        }
                        if (this.cachedFragment) {
                          fragment = dom.cloneNode(this.cachedFragment, true);
                        }
                      } else {
                        fragment = this.build(dom);
                      }
                      if (this.cachedFragment) { dom.repairClonedNode(fragment,[3]); }
                      var element2 = dom.childAt(fragment, [1]);
                      var element3 = dom.childAt(element2, [2]);
                      var morph0 = dom.createMorphAt(element2,0,1);
                      var morph1 = dom.createMorphAt(element3,0,1);
                      var morph2 = dom.createMorphAt(element3,1,2);
                      var morph3 = dom.createMorphAt(element2,3,4);
                      var morph4 = dom.createMorphAt(fragment,2,3,contextualElement);
                      block(env, morph0, context, "popover-widget", [], {"classNames": "fa fa-info-circle", "titleTranslation": "popover.visualExplain.statistics"}, child0, null);
                      content(env, morph1, context, "section.index");
                      content(env, morph2, context, "section.title");
                      content(env, morph3, context, "section.value");
                      block(env, morph4, context, "each", [get(env, context, "section.fields")], {"keyword": "field"}, child1, null);
                      return fragment;
                    }
                  };
                }());
                return {
                  isHTMLBars: true,
                  blockParams: 0,
                  cachedFragment: null,
                  hasRendered: false,
                  build: function build(dom) {
                    var el0 = dom.createDocumentFragment();
                    var el1 = dom.createTextNode("                    ");
                    dom.appendChild(el0, el1);
                    var el1 = dom.createElement("div");
                    dom.setAttribute(el1,"class","node-heading");
                    var el2 = dom.createTextNode("\n                      ");
                    dom.appendChild(el1, el2);
                    var el2 = dom.createElement("strong");
                    dom.appendChild(el1, el2);
                    var el2 = dom.createTextNode("\n                    ");
                    dom.appendChild(el1, el2);
                    dom.appendChild(el0, el1);
                    var el1 = dom.createTextNode("\n                    ");
                    dom.appendChild(el0, el1);
                    var el1 = dom.createElement("div");
                    dom.setAttribute(el1,"class","node-content");
                    var el2 = dom.createTextNode("\n");
                    dom.appendChild(el1, el2);
                    var el2 = dom.createTextNode("                    ");
                    dom.appendChild(el1, el2);
                    dom.appendChild(el0, el1);
                    var el1 = dom.createTextNode("\n                    ");
                    dom.appendChild(el0, el1);
                    var el1 = dom.createTextNode("\n");
                    dom.appendChild(el0, el1);
                    return el0;
                  },
                  render: function render(context, env, contextualElement) {
                    var dom = env.dom;
                    var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block, inline = hooks.inline;
                    dom.detectNamespace(contextualElement);
                    var fragment;
                    if (env.useFragmentCache && dom.canClone) {
                      if (this.cachedFragment === null) {
                        fragment = this.build(dom);
                        if (this.hasRendered) {
                          this.cachedFragment = fragment;
                        } else {
                          this.hasRendered = true;
                        }
                      }
                      if (this.cachedFragment) {
                        fragment = dom.cloneNode(this.cachedFragment, true);
                      }
                    } else {
                      fragment = this.build(dom);
                    }
                    var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1]),-1,-1);
                    var morph1 = dom.createMorphAt(dom.childAt(fragment, [3]),0,1);
                    var morph2 = dom.createMorphAt(fragment,4,5,contextualElement);
                    content(env, morph0, context, "node.label");
                    block(env, morph1, context, "each", [get(env, context, "node.contents")], {"keyword": "section"}, child0, null);
                    inline(env, morph2, context, "progress-widget", [], {"value": get(env, context, "node.progress")});
                    return fragment;
                  }
                };
              }());
              return {
                isHTMLBars: true,
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createDocumentFragment();
                  var el1 = dom.createTextNode("");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createTextNode("");
                  dom.appendChild(el0, el1);
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  var hooks = env.hooks, get = hooks.get, block = hooks.block;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
                  var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
                  block(env, morph0, context, "if", [get(env, context, "node.isOutputNode")], {}, child0, child1);
                  return fragment;
                }
              };
            }());
            return {
              isHTMLBars: true,
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("              ");
                dom.appendChild(el0, el1);
                var el1 = dom.createElement("div");
                var el2 = dom.createTextNode("\n");
                dom.appendChild(el1, el2);
                var el2 = dom.createTextNode("              ");
                dom.appendChild(el1, el2);
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                var hooks = env.hooks, element = hooks.element, get = hooks.get, block = hooks.block;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                var element4 = dom.childAt(fragment, [1]);
                var morph0 = dom.createMorphAt(element4,0,1);
                element(env, element4, context, "bind-attr", [], {"class": "node.isTableNode:table-node node.isOutputNode:output-node :node", "title": "node.id"});
                block(env, morph0, context, "if", [get(env, context, "node.isTableNode")], {}, child0, child1);
                return fragment;
              }
            };
          }());
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, block = hooks.block;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              block(env, morph0, context, "each", [get(env, context, "group.contents")], {"keyword": "node"}, child0, null);
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("            ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1,"class","node");
              var el2 = dom.createTextNode("\n              ");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n            ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, element = hooks.element, content = hooks.content;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var element0 = dom.childAt(fragment, [1]);
              var morph0 = dom.createMorphAt(element0,0,1);
              element(env, element0, context, "bind-attr", [], {"title": "group.label"});
              content(env, morph0, context, "group.label");
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","node-container");
            var el2 = dom.createTextNode("\n");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
            block(env, morph0, context, "if", [get(env, context, "group.contents")], {}, child0, child1);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"id","no-visual-explain-graph");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"id","visual-explain-graph");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","nodes");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element6 = dom.childAt(fragment, [4]);
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          var morph1 = dom.createMorphAt(element6,0,1);
          var morph2 = dom.createMorphAt(dom.childAt(element6, [2]),0,1);
          block(env, morph0, context, "unless", [get(env, context, "json")], {}, child0, null);
          block(env, morph1, context, "each", [get(env, context, "view.edges")], {"keyword": "edge"}, child1, null);
          block(env, morph2, context, "each", [get(env, context, "view.verticesGroups")], {"keyword": "group"}, child2, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","visual-explain");
        dom.setAttribute(el1,"class","index-overlay");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,-1);
        block(env, morph0, context, "panel-widget", [], {"headingTranslation": "titles.query.visualExplain"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('hive/templates/visualization-ui', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","alert alert-danger");
            dom.setAttribute(el1,"role","alert");
            var el2 = dom.createElement("strong");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 0]),-1,-1);
            content(env, morph0, context, "error");
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        var child0 = (function() {
          var child0 = (function() {
            return {
              isHTMLBars: true,
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createTextNode("\n");
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                return fragment;
              }
            };
          }());
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("        ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1,"class","max-rows");
              var el2 = dom.createTextNode("\n          ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("label");
              var el3 = dom.createTextNode("Maximum Row Count: ");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode(" ");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n          ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("button");
              var el3 = dom.createTextNode("OK");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n        ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, inline = hooks.inline, element = hooks.element, block = hooks.block;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              if (this.cachedFragment) { dom.repairClonedNode(fragment,[3]); }
              var element0 = dom.childAt(fragment, [1]);
              var element1 = dom.childAt(element0, [4]);
              var morph0 = dom.createMorphAt(element0,2,3);
              var morph1 = dom.createMorphAt(fragment,2,3,contextualElement);
              inline(env, morph0, context, "input", [], {"value": get(env, context, "selectedRowCount"), "placeholder": get(env, context, "selectedRowCount")});
              element(env, element1, context, "action", ["changeRowCount"], {});
              block(env, morph1, context, "visualization-tabs-widget", [], {"tabs": get(env, context, "visualizationTabs")}, child0, null);
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("          ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1,"class","alert alert-danger");
              dom.setAttribute(el1,"role","alert");
              var el2 = dom.createElement("strong");
              var el3 = dom.createTextNode("An unknown error occurred! Please try again later.");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            block(env, morph0, context, "if", [get(env, context, "polestarUrl")], {}, child0, child1);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "if", [get(env, context, "error")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","visualization");
        dom.setAttribute(el1,"class","index-overlay");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,-1);
        block(env, morph0, context, "panel-widget", [], {"headingTranslation": "titles.query.visualization"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('hive/tests/blanket-options', function () {

  'use strict';

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

  /*globals blanket, module */

  var options = {
    modulePrefix: "hive",
    filter: "//.*hive/.*/",
    antifilter: "//.*(tests|template).*/",
    loaderExclusions: ['ember-cli-jquery-ui', 'hive/config/environment'],
    enableCoverage: true,
    cliOptions: {
      reporters: ['json']
    }
  };

  if (typeof exports === 'undefined') {
    blanket.options(options);
  } else {
    module.exports = options;
  }

});
define('hive/tests/helpers/api-mock', ['exports', 'hive/adapters/database'], function (exports, applicationAdapter) {

  'use strict';

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

  exports['default'] = function() {
    var baseUrl = applicationAdapter['default'].create().buildURL();
    var databases = ['db1', 'db2', 'db3'];

    this.get(baseUrl + '/resources/ddl/database', function (req) {
      var db = {
        databases: databases
      };

      return [200, {"Content-Type": "application/json"}, JSON.stringify(db)];
    });

    this.get(baseUrl + '/resources/ddl/database/db1/table.page', function (req) {
      var tables = {
        rows: [
          ['table1'],
          ['table2'],
          ['table3']
        ]
      };

      return [200, {"Content-Type": "application/json"}, JSON.stringify(tables)];
    });

    this.get(baseUrl + '/resources/ddl/database/db1/table', function (req) {
      var tables = {
        tables: [
          ['table1'],
          ['table2'],
          ['table3']
        ],
        database: 'db1'
      };

      return [200, {"Content-Type": "application/json"}, JSON.stringify(tables)];
    });

    this.get(baseUrl + '/resources/ddl/database/db1/table/table1.page', function (req) {
      var columns = {
        rows: [
          ['column1', 'STRING'],
          ['column2', 'STRING'],
          ['column3', 'STRING']
        ]
      };

      return [200, {"Content-Type": "application/json"}, JSON.stringify(columns)];
    });

    this.get(baseUrl + '/udfs', function (req) {
      var udf = {
        "udfs": [{
          "name": "TestColumn",
          "classname": "TestClassName",
          "fileResource": 1,
          "id": 1,
          "owner": "owner1"
        },
        {
          "name": "Test2Columns",
          "classname": "Test2ClassName",
          "fileResource": 1,
          "id": 2,
          "owner": "owner2"
        }]
      };

      return [200, {"Content-Type": "application/json"}, JSON.stringify(udf)];
    });

    this.post(baseUrl + '/jobs', function (req) {
      var job = {
        "job": {
          "status":"Finished",
          "dataBase":"db1",
          "dateSubmitted":1421677418,
          "logFile":"job1/logs",
          "properties":{},
          "fileResources":[],
          "statusDir":"job1",
          "id":1,
          "title":"Worksheet",
          "duration":2,
          "forcedContent":"",
          "owner":"admin",
          "confFile":"job1/conf",
          "queryId":null,
          "queryFile":"job1.hql"
        }
      };

      return [200, {"Content-Type": "application/json"}, JSON.stringify(job)];
    });

    this.get(baseUrl + '/resources/file/job1.hql', function (req) {
      var file = {
        "file": {
          "filePath": "job1.hql",
          "fileContent": "select * from big",
          "hasNext": false,
          "page": 0,
          "pageCount": 1
        }
      };

      return [200, {"Content-Type": "application/json"}, JSON.stringify(file)];
    });

    this.get(baseUrl + '/savedQueries', function(req) {
      var savedQueries = {
        "savedQueries": [{
          "queryFile": "saved1.hql",
          "dataBase": "db1",
          "title": "saved1",
          "shortQuery": "",
          "id": 1,
          "owner": "owner1"
        }, {
          "queryFile": "saved2.hql",
          "dataBase": "db2",
          "title": "saved2",
          "shortQuery": "select count(field_0) from big;",
          "id": 2,
          "owner": "owner2"
        }]
      };

      return [200, {"Content-Type": "application/json"}, JSON.stringify(savedQueries)];
    });

    this.get(baseUrl + '/savedQueries/defaultSettings', function (req) {
      var defaultSettings = {
        "defaultSettings" : []
      };

      return [200, {"Content-Type": "application/json"}, JSON.stringify(defaultSettings)];
    });

    this.get(baseUrl + '/resources/file/saved1.hql', function (req) {
      var file = {
        "file": {
          "filePath": "saved1.hql",
          "fileContent": "select * from saved1",
          "hasNext": false,
          "page": 0,
          "pageCount": 0
        }
      };

      return [200, {"Content-Type": "application/json"}, JSON.stringify(file)];
    });

    this.get(baseUrl + '/jobs', function (req) {
      var jobs = {
        "jobs": [
          {
            "title": "Query1",
            "queryFile": "saved1.hql",
            "statusDir": "statusdir",
            "dateSubmitted": 1421240048,
            "duration": 97199,
            "status": "Finished",
            "forcedContent": "",
            "id": 1,
            "owner": "admin",
            "logFile": "logs1",
            "confFile": "conf1"
          },
          {
            "title": "Query2",
            "queryFile": "saved1.hql",
            "statusDir": "statusdir",
            "dateSubmitted": 1421240048,
            "duration": 97199,
            "status": "Finished",
            "forcedContent": "",
            "id": 2,
            "owner": "admin",
            "logFile": "logs2",
            "confFile": "conf2"
          },
          {
            "title": "Query3",
            "queryFile": "saved1.hql",
            "statusDir": "statusdir",
            "dateSubmitted": 1421240048,
            "duration": 97199,
            "status": "Running",
            "forcedContent": "",
            "id": 3,
            "owner": "admin",
            "logFile": "logs3",
            "confFile": "conf3"
          },
          {
            "title": "Query4",
            "queryFile": "saved1.hql",
            "statusDir": "statusdir",
            "dateSubmitted": 1421240048,
            "duration": 97199,
            "status": "Error",
            "forcedContent": "",
            "id": 4,
            "owner": "admin",
            "logFile": "logs4",
            "confFile": "con51"
          }
        ]
      };

      return [200, {"Content-Type": "application/json"}, JSON.stringify(jobs)];
    });

    this.get(baseUrl + '/fileResources', function (req) {
      var files = {
        "fileResources": [
          {
            "name": "TestName",
            "path": "TestPath",
            "id": 1,
            "owner": "owner1"
          }
        ]
      };

      return [200, {"Content-Type": "application/json"}, JSON.stringify(files)];
    });

    this.get(baseUrl + '/fileResources/1', function (req) {
      var files = {
        "fileResources": [
          {
            "name": "TestName",
            "path": "TestPath",
            "id": 1,
            "owner": "owner1"
          }
        ]
      };

      return [200, {"Content-Type": "application/json"}, JSON.stringify(files)];
    });

    this.get(baseUrl + '/api/v1/views/TEZ', function (req) {
      var data = {
        versions: [
          {
            href: baseUrl + '/api/v1/view/TEZ/instanceURL'
          }
        ]
      };

      return [200, {"Content-Type": "application/json"}, JSON.stringify(data)];
    });

    this.get(baseUrl + '/api/v1/views/TEZ/instanceURL', function (req) {
      var data = {
        instances: [
          {
            ViewInstanceInfo: {
              instance_name: 'tez',
              version: 1
            }
          }
        ]
      };

      return [200, {"Content-Type": "application/json"}, JSON.stringify(data)];
    });
  }

});
define('hive/tests/helpers/resolver', ['exports', 'ember/resolver', 'hive/config/environment'], function (exports, Resolver, config) {

  'use strict';

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

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('hive/tests/helpers/start-app', ['exports', 'ember', 'hive/app', 'hive/router', 'hive/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';

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

  function startApp(attrs) {
    var App;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Router['default'].reopen({
      location: 'none'
    });

    Ember['default'].run(function() {
      App = Application['default'].create(attributes);
      App.setupForTesting();
      App.injectTestHelpers();
    });

    // App.reset(); // this shouldn't be needed, i want to be able to "start an app at a specific URL"

    return App;
  }
  exports['default'] = startApp;

});
define('hive/tests/integration/database-test', ['ember', 'ember-qunit', 'hive/tests/helpers/start-app', 'hive/tests/helpers/api-mock'], function (Ember, ember_qunit, startApp, api) {

  'use strict';

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

  var App;
  var server;

  module('Integration: Databases', {
    setup: function() {
      App = startApp['default']();
      /* global Pretender: true */
      server = new Pretender(api['default']);
    },
    teardown: function() {
      Ember['default'].run(App, App.destroy);
      server.shutdown();
    }
  });

  ember_qunit.test('Database Explorer is displayed and populated with databases from server.', function (assert) {
    assert.expect(2);

    visit('/');

    andThen(function() {
      equal(find('.database-explorer').length, 1, 'Databases panel is visible.');
      equal(find('.database-explorer .databases').children().length, 3, 'Databases are listed.');
    });
  });

  ember_qunit.test('Expanding a database will retrieve the first page of tables for that database.', function () {
    expect(1);

    visit('/');

    andThen(function () {
      var targetDB = find('.fa-database').first();

      click(targetDB);

      andThen(function () {
        equal(find('.fa-table').length, 3);
      });
    });
  });

  ember_qunit.test('Expanding a table will retrieve the first page of columns for that table.', function () {
    expect(2);

    visit('/');

    andThen(function () {
      var targetDB = find('.fa-database').first();

      click(targetDB);

      andThen(function () {
        var targetTable = find('.fa-table').first();

        click(targetTable);

        andThen(function () {
          equal(find('.columns').length, 1, 'Columns container was loaded.');
          equal(find('.columns strong').length, 3, '3 columns were loaded for selected table.');
        });
      });
    });
  });

  ember_qunit.test('Searching for a table will display table results and column search field', function () {
    expect(2);

    visit('/');

    andThen(function () {
      fillIn(find('input').first(), 'table');
      keyEvent(find('input').first(), 'keyup', 13);

      andThen(function () {
        equal(find('input').length, 2, 'Columns search input has been rendered.');
        equal(find('.nav-tabs li').length, 2, 'Results tab has been redendered.');
      });
    });
  });

});
define('hive/tests/integration/history-test', ['ember', 'ember-qunit', 'hive/tests/helpers/start-app', 'hive/tests/helpers/api-mock'], function (Ember, ember_qunit, startApp, api) {

  'use strict';

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

  var App;
  var server;

  module('Integration: History', {
    setup: function() {
      App = startApp['default']();
      /* global Pretender: true */
      server = new Pretender(api['default']);
    },

    teardown: function() {
      Ember['default'].run(App, App.destroy);
      server.shutdown();
    }
  });

  ember_qunit.test('Save Queries should list saved queries', function() {
    expect(1);

    visit("/history");

    andThen(function() {
      equal(find('#content .table tbody tr').length, 4);
    });
  });

  ember_qunit.test('User should be able to filter the jobs', function() {
    expect(4);

    visit("/history");

    fillIn('column-filter input[placeholder=title]', "Query1");
    keyEvent('column-filter input[placeholder=title]', 'keyup');

    andThen(function() {
      equal(find('#content .table tbody tr:visible').length, 1, 'User is able to filter by title');
    });

    click('.clear-filters');
    andThen(function() {
      equal(find('#content .table tbody tr:visible').length, 4);
    });


    fillIn('column-filter input[placeholder=status]', "Finished");
    keyEvent('column-filter input[placeholder=status]', 'keyup');

    andThen(function() {
      equal(find('#content .table tbody tr:visible').length, 2, 'User is able to filter by status');
    });

    click('.clear-filters');
    andThen(function() {
      equal(find('#content .table tbody tr:visible').length, 4);
    });
  });

  ember_qunit.test('A query item should expand to show the HQL', function() {
    expect(3);
    visit("/history");

    andThen(function() {
      equal(find('.table-expandable tbody .secondary-row').length, 0, 'All queries are collapsed');
    });

    click('.table-expandable tbody tr:first-child');

    andThen(function() {
      equal(find('.table-expandable tbody .secondary-row').length, 1, 'One query is expanded');
      ok(find('.table-expandable tbody tr:first-child').next().hasClass('secondary-row'), 'Clicked query is expanded');
    });
  });

});
define('hive/tests/integration/query-editor-test', ['ember', 'ember-qunit', 'hive/tests/helpers/start-app', 'hive/tests/helpers/api-mock'], function (Ember, ember_qunit, startApp, api) {

  'use strict';

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

  var App;
  var server;

  module('Integration: Query Editor', {
    setup: function() {
      App = startApp['default']();
      /* global Pretender: true */
      server = new Pretender(api['default']);
    },

    teardown: function() {
      Ember['default'].run(App, App.destroy);
      server.shutdown();
    }
  });

  ember_qunit.test('Query Editor is visible', function() {
    expect(1);

    visit("/");

    andThen(function() {
      equal(find('.query-editor-panel').length, 1, 'Query Editor is visible');
    });
  });

  ember_qunit.test('Can execute query either with full or partial selection', function() {
    expect(3);

    var query1 = "select count(*) from table1;",
        query2 = "select color from z;",
        query3 = "select fruit from z;",
        query4 = query2 + "\n" + query3,
        editor;

    visit("/");

    Ember['default'].run(function() {
      editor = find('.CodeMirror').get(0).CodeMirror;
      editor.setValue(query1);
    });

    click('.execute-query');

    andThen(function() {
      equal(find('.query-process-results-panel').length, 1, 'Job tabs are visible.');
    });

    Ember['default'].run(function() {
      editor.setValue(query4);
      editor.setSelection({ line: 1, ch: 0 }, { line: 1, ch: 20 });
    });

    click('.execute-query');

    andThen(function() {
      equal(editor.getValue(), query4, 'Editor value didn\'t change');
      equal(editor.getSelection(), query3, 'Query 3 is selected');
    });
  });


  ember_qunit.test('Can save query', function() {
    expect(2);

    visit("/");

    andThen(function() {
      equal(find('.modal-dialog').length, 0, 'Modal dialog is hidden');
    });

    Ember['default'].run(function() {
      find('.CodeMirror').get(0).CodeMirror.setValue('select count(*) from table1');
    });

    click('.save-query-as');

    andThen(function() {
      equal(find('.modal-dialog').length, 1, 'Modal dialog is shown');
    });

    click('.modal-footer .btn-danger');
  });

});
define('hive/tests/integration/saved-queries-test', ['ember', 'ember-qunit', 'hive/tests/helpers/start-app', 'hive/tests/helpers/api-mock'], function (Ember, ember_qunit, startApp, api) {

  'use strict';

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

  var App;
  var server;

  module('Integration: Saved Queries', {
    setup: function() {
      App = startApp['default']();
      /* global Pretender: true */
      server = new Pretender(api['default']);
    },

    teardown: function() {
      Ember['default'].run(App, App.destroy);
      server.shutdown();
    }
  });

  ember_qunit.test('Save Queries should list saved queries', function() {
    expect(1);

    visit("/queries");


    andThen(function() {
      equal(find('#content .table tbody tr').length, 2);
    });
  });

  ember_qunit.test('User should be able to filter the queries', function() {
    expect(8);

    visit("/queries");

    fillIn('column-filter input[placeholder=preview]', "select count");
    keyEvent('column-filter input[placeholder=preview]', 'keyup');

    andThen(function() {
      equal(find('#content .table tbody tr:visible').length, 1, 'User is able to filter by short query form.');
    });

    click('.clear-filters');
    andThen(function() {
      equal(find('#content .table tbody tr:visible').length, 2);
    });

    fillIn('column-filter input[placeholder=title]', "saved1");
    keyEvent('column-filter input[placeholder=title]', 'keyup');

    andThen(function() {
      equal(find('#content .table tbody tr:visible').length, 1, 'User is able to filter by title');
    });

    click('.clear-filters');
    andThen(function() {
      equal(find('#content .table tbody tr:visible').length, 2);
    });

    fillIn('column-filter input[placeholder=database]', "db1");
    keyEvent('column-filter input[placeholder=database]', 'keyup');

    andThen(function() {
      equal(find('#content .table tbody tr:visible').length, 1, 'User is able to filter by database');
    });

    click('.clear-filters');
    andThen(function() {
      equal(find('#content .table tbody tr:visible').length, 2);
    });

    fillIn('column-filter input[placeholder=owner]', "owner1");
    keyEvent('column-filter input[placeholder=owner]', 'keyup');

    andThen(function() {
      equal(find('#content .table tbody tr:visible').length, 1, 'User is able to filter by owner');
    });

    click('.clear-filters');
    andThen(function() {
      equal(find('#content .table tbody tr:visible').length, 2);
    });
  });

  ember_qunit.test('User is able to load a query from saved queries', function() {
    expect(1);

    visit("/queries");
    click('#content .table tbody tr:first-child td:first-child a');

    andThen(function() {
      equal(currentURL(), "/queries/1", 'User is redirected');
    });
  });

  ember_qunit.test('Saved Query options menu', function() {
    expect(2);

    visit("/queries");
    click('.fa-gear');

    andThen(function() {
      equal(find('.dropdown-menu:visible').length, 1, 'Query menu is visible');
      equal(find('.dropdown-menu:visible li').length, 2, 'Query menu has 2 options');
    });
  });

});
define('hive/tests/integration/tez-ui-test', ['ember', 'ember-qunit', 'hive/tests/helpers/start-app', 'hive/tests/helpers/api-mock'], function (Ember, ember_qunit, startApp, api) {

  'use strict';

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

  var App;
  var server;

  module('Integration: Tez UI', {
    setup: function() {
      App = startApp['default']();
      /* global Pretender: true */
      server = new Pretender(api['default']);
    },

    teardown: function() {
      Ember['default'].run(App, App.destroy);
      server.shutdown();
    }
  });

  ember_qunit.test('An error is show when there is no dag', function() {
    expect(1);

    visit("/");
    click('#tez-icon');

    andThen(function() {
      ok(find('.panel .alert .alert-danger'), 'Error is visible');
    });
  });

});
define('hive/tests/integration/udfs-test', ['ember', 'ember-qunit', 'hive/tests/helpers/start-app', 'hive/tests/helpers/api-mock'], function (Ember, ember_qunit, startApp, api) {

  'use strict';

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

  var App;
  var server;

  module('Integration: Udfs', {
    setup: function() {
      App = startApp['default']();
      /* global Pretender: true */
      server = new Pretender(api['default']);
    },

    teardown: function() {
      Ember['default'].run(App, App.destroy);
      server.shutdown();
    }
  });

  ember_qunit.test('Save Queries should list saved queries', function() {
    expect(1);

    visit("/udfs");

    andThen(function() {
      equal(find('#content .table tbody tr').length, 2);
    });
  });

  ember_qunit.test('User should be able to filter the udfs', function() {
    expect(4);

    visit("/udfs");

    fillIn('column-filter input[placeholder="udf name"]', "TestColumn");
    keyEvent('column-filter input[placeholder="udf name"]', 'keyup');

    andThen(function() {
      equal(find('#content .table tbody tr:visible').length, 1, 'User is able to filter by name');
    });

    click('.clear-filters');

    andThen(function() {
      equal(find('#content .table tbody tr:visible').length, 2);
    });

    fillIn('column-filter input[placeholder="udf class name"]', "TestClassName");
    keyEvent('column-filter input[placeholder="udf class name"]', 'keyup');

    andThen(function() {
      equal(find('#content .table tbody tr:visible').length, 1, 'User is able to filter by class name');
    });

    click('.clear-filters');

    andThen(function() {
      equal(find('#content .table tbody tr:visible').length, 2);
    });
  });

  ember_qunit.test('User is able to add udf', function() {
    expect(1);

    visit("/udfs");
    click('.add-udf');

    andThen(function() {
      equal(find('#content .table tbody tr').length, 3);
    });
  });

});
define('hive/tests/test-helper', ['hive/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

  'use strict';

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

  ember_qunit.setResolver(resolver['default']);

});
define('hive/tests/unit/adapters/application', ['ember-qunit', 'hive/utils/constants'], function (ember_qunit, constants) {

  'use strict';

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

  ember_qunit.moduleFor('adapter:application', 'ApplicationAdapter', {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('X-Requested-By header is set.', function() {
    expect(1);

    var adapter = this.subject();

    ok(adapter.get('headers.X-Requested-By'), 'X-Requested-By is set to a truthy value.');
  });

  ember_qunit.test('buildUrl returns an url with default values for version and instance paramters if not running within an Ambari instance.', function () {
    expect(1);

    var adapter = this.subject();

    var url = adapter.buildURL();

    equal(url, constants['default'].adapter.apiPrefix + constants['default'].adapter.version + constants['default'].adapter.instancePrefix + 'Hive');
  });

});
define('hive/tests/unit/adapters/file', ['ember-qunit', 'hive/utils/constants'], function (ember_qunit, constants) {

  'use strict';

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

  ember_qunit.moduleFor('adapter:file', 'FileAdapter', {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('pathForType returns correct path.', function() {
    expect(1);

    var adapter = this.subject();
    var type = 'dummy';

    equal(adapter.pathForType(type), constants['default'].adapter.resourcePrefix + type);
  });

});
define('hive/tests/unit/components/alert-message-widget-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleForComponent('alert-message-widget', 'AlertMessageWidgetComponent', {
    needs: []
  });

  ember_qunit.test('isExpanded is toggled on click', function() {
    expect(2);

    var message = Ember['default'].Object.create({ isExpanded: false});

    var component = this.subject({
      message: message
    });

    Ember['default'].run(function() {
      component.send('toggleMessage');
    });

    equal(component.get('message.isExpanded'), true, 'isExpanded is set to true');

    Ember['default'].run(function() {
      component.send('toggleMessage');
    });

    equal(component.get('message.isExpanded'), false, 'isExpanded is set to false');
  });

  ember_qunit.test('removeLater should be called when the message is toggled', function() {
    expect(1);

    var message = Ember['default'].Object.create({ isExpanded: false});

    var targetObject = {
      removeLater: function() {
        ok(true, 'External removeLater called');
      }
    };

    var component = this.subject({
      targetObject: targetObject,
      removeLater: 'removeLater',
      message: message
    });

    Ember['default'].run(function() {
      component.send('toggleMessage');
    });

    Ember['default'].run(function() {
      component.send('toggleMessage');
    });
  });

  ember_qunit.test('remove action should call external removeMessage', function() {
    expect(1);

    var targetObject = {
      removeMessage: function() {
        ok(true, 'External removeMessage called');
      }
    };

    var component = this.subject({
      targetObject: targetObject,
      removeMessage: 'removeMessage'
    });

    Ember['default'].run(function() {
      component.send('remove', {});
    });
  });

});
define('hive/tests/unit/components/collapsible-widget-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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
  ember_qunit.moduleForComponent('collapsible-widget', 'CollapsibleWidgetComponent', {
    unit: true
  });

  ember_qunit.test('Component expand/collapse toggle action', function () {
    expect(1);

    var targetObject = {
      expanded: function() {
        ok(true, 'External expanded called');
      }
    };

    var component = this.subject({
      targetObject: targetObject,
      isExpanded: 'isExpanded',
      expanded: 'expanded'
    });

    var $component = this.render();

    Ember['default'].run(function() {
      component.set('isExpanded', false);
      component.send('toggle', {});
     });
  });

});
define('hive/tests/unit/components/column-filter-widget-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleForComponent('column-filter-widget', 'ColumnFilterWidgetComponent', {
    needs: ['component:extended-input']
  });

  ember_qunit.test('if a filterValue is set when the element is inserted, an action is being sent announcing a filter change', function () {
    expect(1);

    var column = Ember['default'].Object.create({
      caption: 'missing.translation'
    });

    var component = this.subject({ column: column });

    Ember['default'].run(function () {
      component.set('filterValue', 'initial filter value');
    });

    var targetObject = {
      externalAction: function(){
        ok(true, 'initial filterValue set. Action has been sent.');
      }
    };

    component.set('columnFiltered', 'externalAction');
    component.set('targetObject', targetObject);

    var $component = this.$();
  });

  ember_qunit.test('isSorted returns true if the table is sorted by this column property', function () {
    expect(1);

    var component = this.subject();

    var column = Ember['default'].Object.create({
      property: 'some prop'
    });

    Ember['default'].run(function () {
      component.set('column', column);
      component.set('sortProperties', [column.property]);
    });

    ok(component.get('isSorted'));
  });

  ember_qunit.test('isSorted returns false if the table is sorted by some other column', function () {
    expect(1);

    var component = this.subject();

    var column = Ember['default'].Object.create({
      property: 'some prop'
    });

    Ember['default'].run(function () {
      component.set('column', column);
      component.set('sortProperties', ['other prop']);
    });

    ok(!component.get('isSorted'));
  });

  ember_qunit.test('isSorted returns false if the table is not sorted by any column', function () {
    expect(1);

    var component = this.subject();

    var column = Ember['default'].Object.create({
      property: 'some prop'
    });

    Ember['default'].run(function () {
      component.set('column', column);
      component.set('sortProperties', []);
    });

    ok(!component.get('isSorted'));
  });

  ember_qunit.test('when sendSort gets called, the columnSorted action gets sent.', function () {
    expect(1);

    var component = this.subject();

    var targetObject = {
      externalAction: function(){
        ok(true, 'columnSorted action has been intercepted.');
      }
    };

    Ember['default'].run(function () {
      component.set('targetObject', targetObject);
      component.set('columnSorted', 'externalAction');

      component.send('sendSort');
    });
  });

  ember_qunit.test('when sendFilter gets called, the columnFiltered action gets sent.', function () {
    expect(1);

    var component = this.subject();

    var targetObject = {
      externalAction: function(){
        ok(true, 'columnFiltered action has been intercepted.');
      }
    };

    Ember['default'].run(function () {
      component.set('targetObject', targetObject);
      component.set('columnFiltered', 'externalAction');

      component.send('sendFilter');
    });
  });

});
define('hive/tests/unit/components/date-range-widget-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  /* global moment */

  ember_qunit.moduleForComponent('date-range-widget', 'DateRangeWidgetComponent', {
    needs: ['component:extended-input']
  });

  ember_qunit.test('Date fields are set correctly', function() {
    expect(2);

    var component = this.subject();

    var min = moment('04/11/2014', 'DD/MM/YYYY');
    var max = moment('04/12/2014', 'DD/MM/YYYY');
    var from = moment('04/11/2014', 'DD/MM/YYYY');
    var to = moment('04/12/2014', 'DD/MM/YYYY');

    var dateRange = Ember['default'].Object.create({
      from: from.toString(),
      to: to.toString(),
      min: min.toString(),
      max: max.toString()
    });

    component.set('dateRange', Ember['default'].Object.create());

    var $component = this.$();

    Ember['default'].run(function() {
      component.set('dateRange', dateRange);
    });

    equal($component.find('.fromDate').val(), moment(from).format('MM/DD/YYYY'), "From date is set correctly");
    equal($component.find('.toDate').val(), moment(to).format('MM/DD/YYYY'), "To date is set correctly");
  });

  ember_qunit.test('Date fields updates when the date is changed', function() {
    expect(2);

    var component = this.subject();

    var min = moment('04/11/2014', 'DD/MM/YYYY');
    var max = moment('04/12/2014', 'DD/MM/YYYY');
    var from = moment('04/11/2014', 'DD/MM/YYYY');
    var to = moment('04/12/2014', 'DD/MM/YYYY');

    var dateRange = Ember['default'].Object.create({
      from: from.toString(),
      to: to.toString(),
      min: min.toString(),
      max: max.toString()
    });

    Ember['default'].run(function() {
      component.set('dateRange', dateRange);
    });

    var $component = this.$();
    $component.find('.fromDate').datepicker('setDate', '10/10/2014');
    $component.find('.toDate').datepicker('setDate', '11/11/2014');

    equal($component.find('.fromDate').val(), '10/10/2014', "From date field is updated");
    equal($component.find('.toDate').val(), '11/11/2014', "To date field is updated");
  });

  ember_qunit.test('Display dates are formatted correctly', function(){
    expect(2);

    var component = this.subject();

    var min = moment('04/11/2014', 'DD/MM/YYYY');
    var max = moment('04/12/2014', 'DD/MM/YYYY');
    var from = moment('04/11/2014', 'DD/MM/YYYY');
    var to = moment('04/12/2014', 'DD/MM/YYYY');

    var dateRange = Ember['default'].Object.create({
      from: from.toString(),
      to: to.toString(),
      min: min.toString(),
      max: max.toString()
    });

    Ember['default'].run(function () {
      component.set('dateRange', dateRange);
    });

    equal(component.get('displayFromDate'), '11/04/2014', "displayFromDate is formatted correctly");
    equal(component.get('displayToDate'), '12/04/2014', "displayToDate is formatted correctly");
  });

  ember_qunit.test('If from/to are not passed they are set to min/max', function() {
    expect(2);

    var component = this.subject();

    var min = moment('04/11/2014', 'DD/MM/YYYY');
    var max = moment('04/12/2014', 'DD/MM/YYYY');

    var dateRange = Ember['default'].Object.create({
      min: min.toString(),
      max: max.toString()
    });

    Ember['default'].run(function () {
      component.set('dateRange', dateRange);
    });

    var $component = this.$();

    equal(component.get('dateRange.from'), min.toString(), "From date is to min date");
    equal(component.get('dateRange.to'), max.toString(), "To date is set to max date");
  });

});
define('hive/tests/unit/components/expander-widget-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleForComponent('expander-widget', 'ExpanderWidgetComponent', {
    unit: true
  });

  ember_qunit.test('should set the heading when provided.', function () {
    expect(2);

    var component = this.subject();
    var $component = this.$();
    var heading = 'some header';

    equal($component.find('.accordion-toggle').text(), '');

    Ember['default'].run(function () {
      component.set('heading', heading);
    });

    equal($component.find('.accordion-toggle').text(), heading);
  });

  ember_qunit.test('should correctly toggle isExpanded property.', function () {
    expect(2);

    var component = this.subject();
    this.$();

    Ember['default'].run(function(){
      component.send('toggle');
    });

    equal(component.get('isExpanded'), true);

    Ember['default'].run(function(){
      component.send('toggle');
    });

    equal(component.get('isExpanded'), false);
  });

});
define('hive/tests/unit/components/extended-input-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleForComponent('extended-input', 'ExtendedInputComponent', {
    unit: true
  });

  ember_qunit.test('Component has dynamicValue and dynamicContext', function () {
    expect(1);

    var component = this.subject({
      dynamicValue: 'dynamicValue',
      dynamicContext: Ember['default'].Object.create({ 'dynamicValue' : 'test' })
    });

    var $component = this.$();

    equal(component.get('value'), 'test', 'Value is set to dynamicValue value');
  });


  ember_qunit.test('Component has no dynamicValue and dynamicContext', function () {
    expect(1);

    var component = this.subject();
    var $component = this.$();

    ok(!component.get('value'), 'Value is not set as dynamicValue value');
  });

  ember_qunit.test("Component's dynamicValue is set", function () {
    expect(1);

    var component = this.subject({
      dynamicValue: 'dynamicValue',
      dynamicContext: Ember['default'].Object.create({ 'dynamicValue' : 'test' })
    });

    var $component = this.$();

    Ember['default'].run(function() {
      component.sendValueChanged();

      equal(component.get('value'), component.dynamicContext.get('dynamicValue'), "Value is set and dynamicValue is set");
    });
  });

  ember_qunit.test("Component's dynamicValue is not set", function () {
    expect(1);

    var component = this.subject({
      dynamicValue: 'dynamicValue',
      dynamicContext: Ember['default'].Object.create({ })
    });

    var $component = this.$();

    Ember['default'].run(function() {
      component.sendValueChanged();

      equal(component.get('value'), undefined, "Value is not set");
    });
  });

});
define('hive/tests/unit/components/job-tr-view-test', ['ember', 'hive/utils/constants', 'ember-qunit'], function (Ember, constants, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleForComponent('job-tr-view', 'JobTrViewComponent', {
    unit: true
  });

  ember_qunit.test('Statuses are computed correctly', function (assert) {
    assert.expect(5);

    var component = this.subject();

    Ember['default'].run(function() {
      component.set('job', Ember['default'].Object.create());
      component.set('job.status', constants['default'].statuses.running);
    });

    assert.equal(component.get('canStop'), true, 'Status is running canStop returns true');

    Ember['default'].run(function() {
      component.set('job.status', constants['default'].statuses.initialized);
    });

    assert.equal(component.get('canStop'), true, 'Status is initialized canStop returns true');

    Ember['default'].run(function() {
      component.set('job.status', constants['default'].statuses.pending);
    });

    assert.equal(component.get('canStop'), true, 'Status is pending canStop returns true');

    Ember['default'].run(function() {
      component.set('job.status', constants['default'].statuses.canceled);
    });

    assert.equal(component.get('canStop'), false, 'Status is canceled canStop returns false');

    Ember['default'].run(function() {
      component.set('job.status', constants['default'].statuses.unknown);
    });

    assert.equal(component.get('canStop'), false, 'Status is unknown canStop returns false');
  });

});
define('hive/tests/unit/components/modal-widget-test', ['ember', 'hive/utils/constants', 'ember-qunit'], function (Ember, constants, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleForComponent('modal-widget', 'ModalWidgetComponent', {
    needs: ['helper:tb-helper']
  });

  ember_qunit.test('It send ok action on keyPress enter', function(assert) {
    assert.expect(1);

    Ember['default'].run.debounce = function(target, func) {
      func.call(target);
    };

    var component = this.subject({
      ok: 'ok',
      targetObject: {
        ok: function() {
          assert.ok(1, 'OK action sent');
        }
      }
    });

    var $component = this.$();

    component.keyPress({ which: 13 });
    Ember['default'].$('.modal-backdrop').remove(); // remove overlay
  });

  ember_qunit.test('It send close action on keyPress escape', function(assert) {
    assert.expect(1);

    Ember['default'].run.debounce = function(target, func) {
      func.call(target);
    };

    var component = this.subject({
      close: 'close',
      targetObject: {
        close: function() {
          assert.ok(1, 'Close action sent');
        }
      }
    });

    var $component = this.$();

    component.keyPress({ which: 27 });
    Ember['default'].$('.modal-backdrop').remove(); // remove overlay
  });

});
define('hive/tests/unit/components/no-bubbling-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleForComponent('no-bubbling', 'NoBubblingWidgetComponent', {
    unit: true
  });


  ember_qunit.test('External actions', function() {
    expect(2);

    var component = this.subject({
      targetObject: {
        click: function(data) {
          ok(true, 'External click action called');
          equal(data, 'data', 'Data is sent with the action');
        }
      },
      click: 'click',
      data: 'data'
    });

    var $component = this.$();

    $component.trigger('click');
  });

});
define('hive/tests/unit/components/number-range-widget-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  /* global moment */

  ember_qunit.moduleForComponent('number-range-widget', 'NumberRangeWidgetComponent', {
    needs: ['component:extended-input']
  });


  ember_qunit.test('Component is initialized correctly', function() {
    expect(2);

    var numberRange = Ember['default'].Object.create({
      max: 1,
      min: 0
    });

    var component = this.subject({ numberRange: numberRange });
    var $component = this.$();

    equal(component.get('numberRange.from'), numberRange.get('min'), 'from is set to min');
    equal(component.get('numberRange.to'), numberRange.get('max'), 'to is set to max');

  });

  ember_qunit.test('external change action is called', function() {
    expect(1);

    var targetObject = {
      rangeChanged: function() {
        ok(true, 'rangeChanged external action called');
      }
    };

    var numberRange = Ember['default'].Object.create({
      max: 1,
      min: 0
    });

    var component = this.subject({
      numberRange: numberRange,
      targetObject: targetObject,
      rangeChanged: 'rangeChanged'
    });

    var $component = this.$();

    Ember['default'].run(function() {
      $component.find('.slider').slider('value', 1);
    });
  });

});
define('hive/tests/unit/components/popover-widget-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleForComponent('popover-widget', 'PopoverWidgetComponent', {
    unit: true
  });

  ember_qunit.test('Component initializes correctly', function () {
    expect(2);

    var component = this.subject({
      template: Ember['default'].Handlebars.compile("test")
    });
    var $component = this.$();

    ok($component, "Popover element is initialized");
    equal($component.attr('data-content').trim(), "test", "data-content is populated");
  });

});
define('hive/tests/unit/components/progress-widget-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleForComponent('progress-widget', 'ProgressWidgetComponent', {
    unit: true
  });

  ember_qunit.test('Percentage is updated on value change', function() {
    var component = this.subject({
      value: 0
    });

    this.$();

    equal(component.get('percentage'), '0%', 'Progress is at 0%');

    Ember['default'].run(function() {
      component.set('value', 50);
    });

    equal(component.get('percentage'), '50%', 'Progress is at 50%');
  });

});
define('hive/tests/unit/components/query-editor-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleForComponent('query-editor', 'QueryEditorComponent', {
    unit: true
  });

  ember_qunit.test('initEditor sets the editor on didInsertElement', function () {
    expect(2);

    var component = this.subject();

    equal(component.get('editor'), undefined, 'element not rendered. Editor not set.');

    this.$();

    ok(component.get('editor'), 'element rendered. Editor set.');
  });

  ember_qunit.test('updateValue sets the query value on the editor.', function () {
    expect(1);

    var component = this.subject();

    var query = 'select something';

    this.$();

    Ember['default'].run(function () {
      component.set(('query'), query);
    });

    equal(component.get('editor').getValue(), query, 'set query property. Updated editor value property.');
  });

});
define('hive/tests/unit/components/select-widget-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleForComponent('select-widget', 'SelectWidgetComponent', {
    needs: ['helper:path-binding']
  });

  ember_qunit.test('selectedLabel returns the selectedValue property indicated by labelPath if selectedValue and labelPath are set.', function () {
    expect(1);

    var component = this.subject();

    var selectedValue = Ember['default'].Object.extend({
      label: 'db'
    }).create();

    var labelPath = 'label';

    Ember['default'].run(function () {
      component.set('labelPath', labelPath);
      component.set('selectedValue', selectedValue);
    });

    equal(component.get('selectedLabel'), selectedValue.label, 'selectedValue and labelPath are set. selectedLabel returns selectedValue[labelPath].');
  });

  ember_qunit.test('selectedLabel returns defaultLabel if selectedValue is falsy and defaultLabel is set.', function () {
    expect(1);

    var component = this.subject();

    var defaultLabel = 'select...';

    Ember['default'].run(function () {
      component.set('defaultLabel', defaultLabel);
    });

    equal(component.get('selectedLabel'), defaultLabel, 'selectedValue falsy and defaultLabel set. selectedLabel returns defaultLabel.');
  });

  ember_qunit.test('selectedLabel returns undefined if neither selectedValue nor defaultLabel are set.', function () {
    expect(1);

    var component = this.subject();

    equal(component.get('selectedLabel'), undefined, 'selectedValue and defaultLabel are falsy. selectedLabel returns undefined.');
  });

  ember_qunit.test('selectedLabel is computed when selectedValue changes.', function () {
    expect(2);

    var component = this.subject();

    var selectedValue = Ember['default'].Object.extend({
      label: 'db'
    }).create();

    var labelPath = 'label';

    equal(component.get('selectedLabel'), undefined, 'selectedValue and defaultLabel are falsy. selectedLabel returns undefined.');

    Ember['default'].run(function () {
      component.set('labelPath', labelPath);
      component.set('selectedValue', selectedValue);
    });

    equal(component.get('selectedLabel'), selectedValue.label, 'selectedValue and labelPath are set. selectedLabel returns selectedValue[labelPath].');
  });

  ember_qunit.test('renders an li tag for each item in the items collection.', function () {
    expect(2);

    var component = this.subject();
    var $component = this.$();

    equal($component.find('li').length, 0, 'items collection is not set. No li tags are rendered.');

    Ember['default'].run(function() {
      var items = Ember['default'].ArrayProxy.create({ content: Ember['default'].A([Ember['default'].Object.create(), Ember['default'].Object.create()])});
      component.set('labelPath', 'name');
      component.set('items', items);
    });

    equal($component.find('li').length, 2, 'items collection is set containing one item. One li tag is rendered.');
  });

  ember_qunit.test('if no selected item nor defaultLabel set the selected value with first item', function () {
    expect(1);

    var items = [
      'item1',
      'item2'
    ];

    var component = this.subject({ items: items });
    var $component = this.$();

    equal(component.get('selectedValue'), 'item1', 'selectedValue is set to first item')
  });

  ember_qunit.test('component actions', function() {
    expect(7);

    var targetObject = {
      itemAdded: function() {
        ok(true, 'External action itemAdded called')
      },
      itemEdited: function(item) {
        ok(true, 'External action itemEdited called');
        equal(item, 'editedItem', 'Data is sent with action');
      },
      itemRemoved: function(item) {
        ok(true, 'External action itemRemoved called');
        equal(item, 'removedItem', 'Data is sent with action');
      }
    };
    var component = this.subject({
      items: ['item'],
      itemAdded: 'itemAdded',
      itemEdited: 'itemEdited',
      itemRemoved: 'itemRemoved',
      targetObject: targetObject
    });

    var $component = this.$();

    equal(component.get('selectedValue'), 'item', 'selectedValue is set to first item');

    Ember['default'].run(function() {
      component.send('select', 'newItem');
      component.send('add');
      component.send('edit', 'editedItem');
      component.send('remove', 'removedItem');
    });

    equal(component.get('selectedValue'), 'newItem', 'selectedValue is set to newItem');



  });

});
define('hive/tests/unit/components/tabs-wiget-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleForComponent('tabs-widget', 'TabsWidgetComponent', {
    needs: []
  });

  ember_qunit.test('First tab active by default', function() {
    expect(2);

    var tabs = Ember['default'].ArrayProxy.create({content: Ember['default'].A([
      Ember['default'].Object.create(),
      Ember['default'].Object.create()
    ])});

    var component = this.subject({ tabs: tabs });
    var $component = this.$();

    ok(component.get('tabs.firstObject.active'), 'First tab is active');
    ok(!component.get('tabs.lastObject.active'), 'Second tab is not active');
  });


  ember_qunit.test('Set active tab on init', function() {
    expect(2);

    var tabs = Ember['default'].ArrayProxy.create({content: Ember['default'].A([
      Ember['default'].Object.create(),
      Ember['default'].Object.create(),
      Ember['default'].Object.create({ active: true })
    ])});

    var component = this.subject({ tabs: tabs });

    ok(!component.get('tabs.firstObject.active'), 'First tab is not active');
    ok(component.get('tabs.lastObject.active'), 'Last tab is active');
  });


  ember_qunit.test('Set active tab', function() {
    expect(3);

    var tabs = Ember['default'].ArrayProxy.create({content: Ember['default'].A([
      Ember['default'].Object.create(),
      Ember['default'].Object.create(),
      Ember['default'].Object.create({ active: true })
    ])});

    var component = this.subject({ tabs: tabs });

    ok(!component.get('tabs.firstObject.active'), 'First tab is not active');
    ok(component.get('tabs.lastObject.active'), 'Last tab is active');

    Ember['default'].run(function() {
      component.send('selectTab', tabs.objectAt(1));
    });

    ok(component.get('tabs').objectAt(1).get('active'), 'Second tab is active');
  });

  ember_qunit.test('removeEnabled tabs', function() {
    expect(2);

    var tabs = Ember['default'].ArrayProxy.create({content: Ember['default'].A([
      Ember['default'].Object.create(),
      Ember['default'].Object.create(),
      Ember['default'].Object.create({ active: true })
    ])});

    var component = this.subject({ tabs: tabs, canRemove: true });

    ok(component.get('removeEnabled'), 'More than one tab removeEnabled returns true');

    Ember['default'].run(function() {
      component.get('tabs').popObject();
      component.get('tabs').popObject();
    });

    ok(!component.get('removeEnabled'), 'Only one tab removeEnabled returns false');
  });

  ember_qunit.test('remove tab', function () {
    expect(1);

    var targetObject = {
      removeTabAction: function() {
        ok(true, 'External remove tab action called');
      }
    };

    var component = this.subject({
      'removeClicked': 'removeTabAction',
      'targetObject': targetObject
    });

    Ember['default'].run(function() {
      component.send('remove', {});
    });
  });

});
define('hive/tests/unit/components/typeahead-widget-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleForComponent('typeahead-widget', 'TypeaheadWidgetComponent', {
    needs: ['component:ember-selectize']
  });

  ember_qunit.test('Component is initialized correctly', function () {
    expect(2);

    var items = [
      {name: 'item 1', id: 1},
      {name: 'item 2', id: 2},
      {name: 'item 3', id: 3},
      {name: 'item 4', id: 4}
    ];

    var component = this.subject({
      content: items,
      optionValuePath: 'content.id',
      optionLabelPath: 'content.name'
    });

    this.$();

    equal(component.get('content.length'), items.length, 'Items are set');
    equal(component.get('selection'), items[0], 'First object is set as default value');
  });

});
define('hive/tests/unit/controllers/databases-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  var controller;
  var store;

  ember_qunit.moduleFor('controller:databases', 'DatabasesController', {
    needs: [ 'adapter:database',
             'service:database',
             'service:notify',
             'model:database' ],

    setup: function () {
      //mock getDatabases which is called on controller init
      this.container.lookup('service:database').getDatabases = function () {
        var defer = Ember['default'].RSVP.defer();

        defer.resolve();

        return defer.promise;
      };

      //mock getDatabasesFromServer which is called by the poller
      this.container.lookup('service:database').getDatabasesFromServer = function () {
       var defer = Ember['default'].RSVP.defer();

       var databases = [ "database_a", "database_b"];

       defer.resolve(databases);
       return defer.promise;
       };

      store = this.container.lookup('store:main');
      controller = this.subject();
      controller.store = store;

    },

    teardown: function () {
      Ember['default'].run(controller, controller.destroy);
    }
  });

  ember_qunit.test('controller is initialized properly.', function () {
    expect(5);

    var controller = this.subject();

    ok(controller.get('tableSearchResults'), 'table search results collection was initialized.');
    ok(controller.get('tabs'), 'tabs collection was initialized.');
    equal(controller.get('tabs.length'), 2, 'tabs collection contains two tabs');
    equal(controller.get('tabs').objectAt(0).get('name'), Ember['default'].I18n.t('titles.explorer'), 'first tab is database explorer.');
    equal(controller.get('tabs').objectAt(1).get('name'), Ember['default'].I18n.t('titles.results'), 'second tab is search results');
  });

  ember_qunit.test('setTablePageAvailability sets canGetNextPage true if given database hasNext flag is true.', function () {
    expect(1);

    var database = Ember['default'].Object.create( { hasNext: true } );

    controller.setTablePageAvailability(database);

    equal(database.get('canGetNextPage'), true);
  });

  ember_qunit.test('setTablePageAvailability sets canGetNextPage true if given database has more loaded tables than the visible ones.', function () {
    expect(1);

    var database = Ember['default'].Object.create({
      tables: [1],
      visibleTables: []
    });

    controller.setTablePageAvailability(database);

    equal(database.get('canGetNextPage'), true);
  });

  ember_qunit.test('setTablePageAvailability sets canGetNextPage falsy if given database hasNext flag is falsy and all loaded tables are visible.', function () {
    expect(1);

    var database = Ember['default'].Object.create({
      tables: [1],
      visibleTables: [1]
    });

    controller.setTablePageAvailability(database);

    ok(!database.get('canGetNextPage'));
  });

  ember_qunit.test('setColumnPageAvailability sets canGetNextPage true if given table hasNext flag is true.', function () {
    expect(1);

    var table = Ember['default'].Object.create( { hasNext: true } );

    controller.setColumnPageAvailability(table);

    equal(table.get('canGetNextPage'), true);
  });

  ember_qunit.test('setColumnPageAvailability sets canGetNextPage true if given table has more loaded columns than the visible ones.', function () {
    expect(1);

    var table = Ember['default'].Object.create({
      columns: [1],
      visibleColumns: []
    });

    controller.setColumnPageAvailability(table);

    equal(table.get('canGetNextPage'), true);
  });

  ember_qunit.test('setColumnPageAvailability sets canGetNextPage true if given database hasNext flag is falsy and all loaded columns are visible.', function () {
    expect(1);

    var table = Ember['default'].Object.create({
      columns: [1],
      visibleColumns: [1]
    });

    controller.setColumnPageAvailability(table);

    ok(!table.get('canGetNextPage'));
  });

  ember_qunit.test('getTables sets the visibleTables as the first page of tables if they are already loaded', function () {
    expect(2);

    var database = Ember['default'].Object.create({
      name: 'test_db',
      tables: [1, 2, 3]
    });

    controller.get('databases').pushObject(database);
    controller.set('pageCount', 2);

    controller.send('getTables', 'test_db');

    equal(database.get('visibleTables.length'), controller.get('pageCount'), 'there are 2 visible tables out of 3.');
    equal(database.get('canGetNextPage'), true, 'user can get next tables page.');
  });

  ember_qunit.test('getColumns sets the visibleColumns as the first page of columns if they are already loaded.', function () {
    expect(2);

    var table = Ember['default'].Object.create({
      name: 'test_table',
      columns: [1, 2, 3]
    });

    var database = Ember['default'].Object.create({
      name: 'test_db',
      tables: [ table ],
      visibleTables: [ table ]
    });

    controller.set('pageCount', 2);

    controller.send('getColumns', 'test_table', database);

    equal(table.get('visibleColumns.length'), controller.get('pageCount'), 'there are 2 visible columns out of 3.');
    equal(table.get('canGetNextPage'), true, 'user can get next columns page.');
  });

  ember_qunit.test('showMoreTables pushes more tables to visibleTables if there are still hidden tables loaded.', function () {
    expect(2);

    var database = Ember['default'].Object.create({
      name: 'test_db',
      tables: [1, 2, 3],
      visibleTables: [1]
    });

    controller.get('databases').pushObject(database);
    controller.set('pageCount', 1);

    controller.send('showMoreTables', database);

    equal(database.get('visibleTables.length'), controller.get('pageCount') * 2, 'there are 2 visible tables out of 3.');
    equal(database.get('canGetNextPage'), true, 'user can get next tables page.');
  });

  ember_qunit.test('showMoreColumns pushes more columns to visibleColumns if there are still hidden columns loaded.', function () {
    expect(2);

    var table = Ember['default'].Object.create({
      name: 'test_table',
      columns: [1, 2, 3],
      visibleColumns: [1]
    });

    var database = Ember['default'].Object.create({
      name: 'test_db',
      tables: [ table ],
      visibleTables: [ table ]
    });

    controller.set('pageCount', 1);

    controller.send('showMoreColumns', table, database);

    equal(table.get('visibleColumns.length'), controller.get('pageCount') * 2, 'there are 2 visible columns out of 3.');
    equal(table.get('canGetNextPage'), true, 'user can get next columns page.');
  });

  ember_qunit.test('syncDatabases pushed more databases when new databases are added in the backend', function() {
    expect(3);

    var databaseA = {
      id: "database_a",
      name: "database_a"
    };

    Ember['default'].run(function() {
      store.createRecord('database', databaseA);
      controller.syncDatabases();
    });

    var latestDbNames = store.all('database').mapBy('name');
    equal(latestDbNames.length, 2, "There is 1 additional database added to hive");
    equal(latestDbNames.contains("database_a"), true, "New database list should contain the old database name.");
    equal(latestDbNames.contains("database_b"), true, "New database list should contain the new database name.");
  });

  ember_qunit.test('syncDatabases removed database when old databases are removed in the backend', function() {
    expect(4);

    var latestDbNames;

    var databaseA = {
      id: "database_a",
      name: "database_a"
    };
    var databaseB = {
      id: "database_b",
      name: "database_b"
    };
    var databaseC = {
      id: "database_c",
      name: "database_c"
    };

    Ember['default'].run(function() {
      store.createRecord('database', databaseA);
      store.createRecord('database', databaseB);
      store.createRecord('database', databaseC);
      controller.syncDatabases();
    });

    latestDbNames = store.all('database').mapBy('name');
    equal(latestDbNames.length, 2, "One database is removed from hive");
    equal(latestDbNames.contains("database_a"), true, "New database list should contain the old database name.");
    equal(latestDbNames.contains("database_b"), true, "New database list should contain the old database name.");
    equal(latestDbNames.contains("database_c"), false, "New database list should not contain the database name removed in the backend.");

  });

});
define('hive/tests/unit/controllers/history-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleFor('controller:history', 'HistoryController', {
    needs: [ 'service:file', 'service:job' ]
  });

  ember_qunit.test('controller is initialized correctly', function () {
    expect(1);

    var component = this.subject();

    equal(component.get('columns.length'), 4, 'Columns are initialized');
  });

  ember_qunit.test('date range is set correctly', function () {
    expect(2);

    var component = this.subject();
    var min = parseInt(Date.now() / 1000) - (60 * 60 * 24 * 60);
    var max = parseInt(Date.now() / 1000);

    var history = Ember['default'].ArrayProxy.create({ content: [
      Ember['default'].Object.create({
        dateSubmittedTimestamp: min
      }),
      Ember['default'].Object.create({
        dateSubmittedTimestamp: max
      })
    ]});

    Ember['default'].run(function() {
      component.set('history', history);
    });

    var dateColumn = component.get('columns').find(function (column) {
      return column.get('caption') === 'columns.date';
    });

    equal(dateColumn.get('dateRange.min'), min, 'Min date is set correctly');
    equal(dateColumn.get('dateRange.max'), max, 'Max date is set correctly');
  });

  ember_qunit.test('interval duration is set correctly', function () {
    expect(2);

    var component = this.subject();

    var history = Ember['default'].ArrayProxy.create({ content: [
      Ember['default'].Object.create({
        duration: 20
      }),
      Ember['default'].Object.create({
        duration: 300
      })
    ]});

    Ember['default'].run(function() {
      component.set('history', history);
    });

    var durationColumn = component.get('columns').find(function (column) {
      return column.get('caption') === 'columns.duration';
    });

    equal(durationColumn.get('numberRange.min'), 20, 'Min value is set correctly');
    equal(durationColumn.get('numberRange.max'), 300, 'Max value is set correctly');
  });

  ember_qunit.test('history filtering', function() {
    expect(2);

    var component = this.subject();

    var history = Ember['default'].ArrayProxy.create({
      content: [
        Ember['default'].Object.create({
          name: 'HISTORY',
          status: 1
        }),
        Ember['default'].Object.create({
          name: '1HISTORY',
          status: 2
        })
      ]
    });

    Ember['default'].run(function() {
      component.set('history', history);
    });

    equal(component.get('model.length'), 2, 'No filters applied we have 2 models');

    Ember['default'].run(function() {
      component.filterBy('name', 'HISTORY', true);
    });

    equal(component.get('model.length'), 1, 'Filter by name we have 1 filtered model');
  });

});
define('hive/tests/unit/controllers/index-test', ['ember', 'ember-qunit', 'hive/utils/constants'], function (Ember, ember_qunit, constants) {

  'use strict';

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

  ember_qunit.moduleFor('controller:index', 'IndexController', {
    needs: [
            'controller:open-queries',
            'controller:udfs',
            'controller:index/history-query/logs',
            'controller:index/history-query/results',
            'controller:index/history-query/explain',
            'controller:settings',
            'controller:visual-explain',
            'controller:tez-ui',
            'service:job',
            'service:file',
            'service:database',
            'service:notify',
            'service:job-progress',
            'service:session',
            'service:settings',
            'adapter:application',
            'adapter:database'
          ]
  });

  ember_qunit.test('modelChanged calls update on the open-queries cotnroller.', function () {
    expect(1);

    var controller = this.subject();

    controller.set('openQueries.update', function () {
      var defer = Ember['default'].RSVP.defer();

      ok(true, 'index model has changed. update was called on open-queries controller.');

      defer.resolve();

      return defer.promise;
    });

    Ember['default'].run(function () {
      controller.set('model', Ember['default'].Object.create());
    });
  });

  ember_qunit.test('bindQueryParams replaces param placeholder with values', function() {
    expect(1);

    var controller = this.subject();
    var queryParams = [
      { name: '$what', value: 'color' },
      { name: '$where', value: 'z'}
    ];

    var query = "select $what from $where";
    var replacedQuery = "select color from z";

    Ember['default'].run(function() {
      controller.get('queryParams').setObjects(queryParams);
    });

    equal(controller.bindQueryParams(query), replacedQuery, 'Params replaced correctly');
  });

  ember_qunit.test('bindQueryParams replaces same param multiple times', function() {
    expect(1);

    var controller = this.subject();
    var queryParams = [
      { name: '$what', value: 'color' },
      { name: '$where', value: 'z'}
    ];

    var query = "select $what from $where as $what";
    var replacedQuery = "select color from z as color";

    Ember['default'].run(function() {
      controller.get('queryParams').setObjects(queryParams);
    });

    equal(controller.bindQueryParams(query), replacedQuery, 'Params replaced correctly');
  });

  ember_qunit.test('parseQueryParams sets queryParams when query changes', function() {
    expect(4);


    var query = Ember['default'].Object.create({
      id: 1,
      fileContent: "select $what from $where"
    });
    var updatedQuery = "select $what from $where and $where";

    var controller = this.subject({
      model: query
    });

    Ember['default'].run(function() {
      controller.set('openQueries.queryTabs', [query]);
      controller.set('openQueries.currentQuery', query);
    });

    equal(controller.get('queryParams.length'), 2, '2 queryParams parsed');
    equal(controller.get('queryParams').objectAt(0).name, '$what', 'First param parsed correctly');
    equal(controller.get('queryParams').objectAt(1).name, '$where', 'Second param parsed correctly');

    Ember['default'].run(function() {
      controller.set('openQueries.currentQuery.fileContent', updatedQuery);
    });

    equal(controller.get('queryParams.length'), 2, 'Can use same param multiple times');
  });

  ember_qunit.test('canExecute return false if query is executing', function() {
    expect(2);
    var controller = this.subject();

    Ember['default'].run(function() {
      controller.set('openQueries.update', function () {
        var defer = Ember['default'].RSVP.defer();
        defer.resolve();
        return defer.promise;
      });

      controller.set('model', Ember['default'].Object.create({ 'isRunning': false }));
      controller.set('queryParams', []);
    });

    ok(controller.get('canExecute'), 'Query is not executing => canExecute return true');

    Ember['default'].run(function() {
      controller.set('model', Ember['default'].Object.create({ 'isRunning': true }));
    });

    ok(!controller.get('canExecute'), 'Query is executing => canExecute return false');
  });

  ember_qunit.test('canExecute return false if queryParams doesnt\'t have values', function() {
    expect(2);
    var controller = this.subject();

    var paramsWithoutValues = [
      { name: '$what', value: '' },
      { name: '$where', value: '' }
    ];

    var paramsWithValues = [
      { name: '$what', value: 'value1' },
      { name: '$where', value: 'value2' }
    ];

    Ember['default'].run(function() {
      controller.set('openQueries.update', function () {
        var defer = Ember['default'].RSVP.defer();
        defer.resolve();
        return defer.promise;
      });
      controller.set('model', Ember['default'].Object.create({ 'isRunning': false }));
      controller.get('queryParams').setObjects(paramsWithoutValues);
    });

    ok(!controller.get('canExecute'), 'Params without value => canExecute return false');

    Ember['default'].run(function() {
      controller.get('queryParams').setObjects(paramsWithValues);
    });

    ok(controller.get('canExecute'), 'Params with values => canExecute return true');
  });

  ember_qunit.test('Execute EXPLAIN type query', function() {
    expect(1);

    var query = Ember['default'].Object.create({
      id: 1,
      fileContent: "explain select 1" // explain type query
    });

    var controller = this.subject({
      model: query,
      _executeQuery: function (referer) {
        equal(referer, constants['default'].jobReferrer.explain, 'Explain type query successful.');
        return {then: function() {}};
      }
    });

    Ember['default'].run(function() {
        controller.set('openQueries.queryTabs', [query]);
        controller.set('openQueries.currentQuery', query);
        controller.send('executeQuery');
    });

  });

  ember_qunit.test('Execute non EXPLAIN type query', function() {
    expect(1);

    var query = Ember['default'].Object.create({
      id: 1,
      fileContent: "select 1" //non explain type query
    });

    var controller = this.subject({
      model: query,
      _executeQuery: function (referer) {
        equal(referer, constants['default'].jobReferrer.job , 'non Explain type query successful.');
        return {then: function() {}};
      }
    });

    Ember['default'].run(function() {
        controller.set('openQueries.queryTabs', [query]);
        controller.set('openQueries.currentQuery', query);
        controller.send('executeQuery');
    });

  });


  ember_qunit.test('csvUrl returns if the current query is not a job', function() {
    expect(1);
    var content = Ember['default'].Object.create({
        constructor: {
          typeKey: 'notJob'
        }
    });

    var controller = this.subject({ content: content });
    ok(!controller.get('csvUrl'), 'returns if current query is not a job');
  });

  ember_qunit.test('csvUrl returns is status in not SUCCEEDED', function() {
    expect(1);
    var content= Ember['default'].Object.create({
        constructor: {
          typeKey: 'job'
        },
        status: 'notSuccess'
    });

    var controller = this.subject({ content: content });
    ok(!controller.get('csvUrl'), 'returns if current status is not success');
  });

  ember_qunit.test('csvUrl return the download results as csv link', function() {
    expect(1);
    var content = Ember['default'].Object.create({
        constructor: {
          typeKey: 'job'
        },
        status: 'SUCCEEDED',
        id: 1
    });

    var controller = this.subject({ content: content });
    ok(controller.get('csvUrl'));
  });

  ember_qunit.test('donwloadMenu returns null if status is not succes and results are not visible ', function() {
    expect(1);
    var content = Ember['default'].Object.create({
        status: 'notSuccess',
        queryProcessTabs: [{
          path: 'index.historyQuery.results',
          visible: false
        }]
    });

    var controller = this.subject({ content: content });
    ok(!controller.get('downloadMenu'), 'Returns null');
  });

  ember_qunit.test('donwloadMenu returns only saveToHDFS if csvUrl is false', function() {
    expect(1);
    var content = Ember['default'].Object.create({
        constructor: {
          typeKey: 'notjob'
        },
        status: 'SUCCEEDED',
    });

    var controller = this.subject({ content: content });
    Ember['default'].run(function() {
      var tabs = controller.get('queryProcessTabs');
      var results = tabs.findBy('path', 'index.historyQuery.results');
      results.set('visible', true);
    });

    equal(controller.get('downloadMenu.length'), 1, 'Returns only saveToHDFS');
  });

  ember_qunit.test('donwloadMenu returns saveToHDFS and csvUrl', function() {
    expect(1);
    var content = Ember['default'].Object.create({
        constructor: {
          typeKey: 'job'
        },
        status: 'SUCCEEDED',
    });

    var controller = this.subject({ content: content });
    Ember['default'].run(function() {
      var tabs = controller.get('queryProcessTabs');
      var results = tabs.findBy('path', 'index.historyQuery.results');
      results.set('visible', true);
    });

    equal(controller.get('downloadMenu.length'), 2, 'Returns saveToHDFS and csvUrl');
  });

});
define('hive/tests/unit/controllers/insert-udfs-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleFor('controller:insert-udfs', 'InsertUdfsController', {
    needs: 'controller:udfs'
  });

  ember_qunit.test('controller is initialized correctly', function () {
    expect(1);

    var udfs = Ember['default'].A([
      Ember['default'].Object.create({ fileResource: { id: 1 } }),
      Ember['default'].Object.create({ fileResource: { id: 1 } }),
      Ember['default'].Object.create({ fileResource: { id: 2 } }),
      Ember['default'].Object.create({ fileResource: { id: 2 } })
    ]);

    var component = this.subject();

    Ember['default'].run(function() {
      component.set('udfs', udfs);
    });

    equal(component.get('length'), 2, 'should contain unique file resources');
  });

  ember_qunit.test('controller updates on new udfs', function () {
    expect(2);

    var udfs = Ember['default'].A([
      Ember['default'].Object.create({ fileResource: { id: 1 } }),
      Ember['default'].Object.create({ fileResource: { id: 2 } }),
    ]);

    var component = this.subject();

    Ember['default'].run(function() {
      component.set('udfs', udfs);
    });

    equal(component.get('length'), 2, '');

    var newUdf = Ember['default'].Object.create({ isNew: true, fileResource: { id: 3 } });

    Ember['default'].run(function() {
      component.get('udfs').pushObject(newUdf);
    });

    equal(component.get('length'), 3, '');
  });

});
define('hive/tests/unit/controllers/messages-test', ['ember', 'hive/utils/constants', 'ember-qunit'], function (Ember, constants, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleFor('controller:messages', 'MessagesController', {
  });

  ember_qunit.test('Controller is initialized', function() {
    var controller = this.subject();

    ok(controller, 'Controller is initialized');
  });

  ember_qunit.test('Controller action', function() {
    var controller = this.subject({
      notifyService: Ember['default'].Object.create({
        removeMessage: function(message) {
          ok(1, 'removeMessage action called');
        },
        removeAllMessages: function() {
          ok(1, 'removeAllMessages action called');
        },
        markMessagesAsSeen: function(message) {
          ok(1, 'markMessagesAsSeen action called');
        }
      })
    });

    Ember['default'].run(function() {
      controller.send('removeMessage');
      controller.send('removeAllMessages');
      controller.send('markMessagesAsSeen');
    });

  });

});
define('hive/tests/unit/controllers/open-queries-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleFor('controller:open-queries', 'OpenQueriesController', {
    needs: [ 'controller:index/history-query/results',
             'controller:index/history-query/explain',
             'controller:index',
             'controller:settings',
             'service:file',
             'service:database'
           ]
  });

  ember_qunit.test('when initialized, controller sets the queryTabs.', function () {
    expect(1);

    var controller = this.subject();

    ok(controller.get('queryTabs', 'queryTabs is initialized.'));
  });

  ember_qunit.test('pushObject override creates a new queryFile mock and adds it to the collection if none provided.', function () {
    expect(3);

    var controller = this.subject();

    var model = Ember['default'].Object.create({
      id: 5
    });

    controller.pushObject(null, model);

    equal(controller.get('length'), 1, 'a new object was added to the open queries collection.');
    equal(controller.objectAt(0).id, model.get('id'), 'the object id was set to the model id.');
    equal(controller.objectAt(0).get('fileContent'), '', 'the object fileContent is initialized with empty string.');
  });

  ember_qunit.test('getTabForModel retrieves the tab that has the id and the type equal to the ones of the given model.', function () {
    expect(1);

    var controller = this.subject();

    var model = Ember['default'].Object.create({
      id: 1
    });

    controller.get('queryTabs').pushObject(Ember['default'].Object.create({
      id: model.get('id')
    }));

    equal(controller.getTabForModel(model), controller.get('queryTabs').objectAt(0), 'retrieves correct tab for the given model.');
  });

  ember_qunit.test('getQueryForModel retrieves the query by id equality if a new record is given', function () {
    expect(1);

    var controller = this.subject();

    var model = Ember['default'].Object.create({
      id: 1,
      isNew: true
    });

    controller.pushObject(null, model);

    equal(controller.getQueryForModel(model).get('id'), model.get('id'), 'a new record was given, the method retrieves the query by id equality');
  });

  ember_qunit.test('getQueryForModel retrieves the query by record id equality with model queryFile path if a saved record is given', function () {
    expect(1);

    var controller = this.subject();

    var model = Ember['default'].Object.create({
      id: 1,
      queryFile: 'some/path'
    });

    controller.pushObject(Ember['default'].Object.create({
      id: model.get('queryFile')
    }));

    equal(controller.getQueryForModel(model).get('id'), model.get('queryFile'), 'a saved record was given, the method retrieves the query by id equality with record queryFile path.');
  });

});
define('hive/tests/unit/controllers/queries-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleFor('controller:queries', 'QueriesController', {
    needs: [
      'controller:history',
      'controller:open-queries'
    ]
  });

  ember_qunit.test('controller is initialized', function() {
    expect(1);

    var component = this.subject();

    equal(component.get('columns.length'), 4, 'Columns are initialized correctly');
  });

});
define('hive/tests/unit/controllers/settings-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleFor('controller:settings', 'SettingsController', {
    needs: [
      'controller:databases',
      'controller:index',
      'controller:open-queries',
      'controller:index/history-query/results',
      'controller:index/history-query/explain',
      'controller:udfs',
      'controller:index/history-query/logs',
      'controller:visual-explain',
      'controller:tez-ui',
      'adapter:database',
      'adapter:application',
      'service:settings',
      'service:notify',
      'service:database',
      'service:file',
      'service:session',
      'service:job',
      'service:job-progress'
    ]
  });

  ember_qunit.test('can add a setting', function() {
    var controller = this.subject();

    ok(!controller.get('settings.length'), 'No initial settings');

    Ember['default'].run(function() {
      controller.send('add');
    });

    equal(controller.get('settings.length'), 1, 'Can add settings');
  });

  ember_qunit.test('validate', function() {
    var predefinedSettings = [
      {
        name: 'some.key',
        validate: new RegExp(/^\d+$/) // digits
      }
    ];

    var controller = this.subject({
      predefinedSettings: predefinedSettings
    });

    controller.set('openQueries.update', function () {
      var defer = Ember['default'].RSVP.defer();
      defer.resolve();

      return defer.promise;
    });

    var settings = [
      Ember['default'].Object.create({key: { name: 'some.key' }, value: 'value'}),
      Ember['default'].Object.create({key: { name: 'some.key' }, value: '123'})
    ];

    Ember['default'].run(function() {
      controller.set('settings', settings);
    });

    var currentSettings = controller.get('settings');
    ok(!currentSettings.get('firstObject.valid'), "First setting doesn\' pass validataion");
    ok(currentSettings.get('lastObject.valid'), 'Second setting passes validation');
  });

  ember_qunit.test('Actions', function(assert) {
    assert.expect(5);

    var settingsService = Ember['default'].Object.create({
      add: function() {
        assert.ok(true, 'add called');
      },
      remove: function(setting) {
        assert.ok(setting, 'Setting param is sent');
      },
      createKey: function(name) {
        assert.ok(name, 'Name param is sent');
      },
      removeAll: function() {
        assert.ok(true, 'removeAll called');
      },
      saveDefaultSettings: function() {
        assert.ok(true, 'saveDefaultSettings called');
      }
    });

    var controller = this.subject();
    controller.set('settingsService', settingsService);

    Ember['default'].run(function() {
      controller.send('add');
      controller.send('remove', {});
      controller.send('addKey', {});
      controller.send('removeAll');
      controller.send('saveDefaultSettings');
    });
  });


  ember_qunit.test('Excluded settings', function(assert) {
    var controller = this.subject();

    console.log(controller.get('predefinedSettings'));
    assert.equal(controller.get('excluded').length, 0, 'Initially there are no excluded settings');

    Ember['default'].run(function() {
      controller.get('settings').pushObject(Ember['default'].Object.create({ key: { name: 'hive.tez.container.size' }}));
      controller.get('settings').pushObject(Ember['default'].Object.create({ key: { name: 'hive.prewarm.enabled' }}));
    });

    assert.equal(controller.get('excluded').length, 2, 'Two settings are excluded');
  });

});
define('hive/tests/unit/controllers/tez-ui-test', ['ember', 'ember-data', 'ember-qunit'], function (Ember, DS, ember_qunit) {

  'use strict';

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

  var container;

  ember_qunit.moduleFor('controller:tez-ui', 'TezUIController', {
    needs: [
      'controller:index',
      'service:job',
      'service:file',
      'controller:open-queries',
      'controller:databases',
      'controller:udfs',
      'controller:index/history-query/logs',
      'controller:index/history-query/results',
      'controller:index/history-query/explain',
      'controller:settings',
      'controller:visual-explain',
      'adapter:database',
      'service:database',
      'service:notify',
      'service:job-progress',
      'service:session',
      'service:settings'
    ],

    setup: function() {
      container = new Ember['default'].Container();
      container.register('store:main', Ember['default'].Object.extend({
        find: Ember['default'].K
      }));
    }
  });

  ember_qunit.test('controller is initialized properly.', function () {
    expect(1);

    var controller = this.subject();

    ok(controller);
  });

  ember_qunit.test('dagId returns false if there is  no tez view available', function() {
    var controller = this.subject();

    ok(!controller.get('dagId'), 'dagId is false without a tez view available');
  });

  // test('dagId returns the id if there is view available', function() {
  //   var controller = this.subject({
  //   });

  //   Ember.run(function() {
  //     controller.set('index.model', Ember.Object.create({
  //       id: 2,
  //       dagId: 3
  //     }));

  //     controller.set('isTezViewAvailable', true);
  //   });

  //   equal(controller.get('dagId'), 3, 'dagId is truthy');
  // });

  ember_qunit.test('dagURL returns false if no dag id is available', function() {
    var controller = this.subject();

    ok(!controller.get('dagURL'), 'dagURL is false');
  });

  ember_qunit.test('dagURL returns the url if dag id is available', function() {
    var controller = this.subject({
      tezViewURL: '1',
      tezDagPath: '2',
      dagId: '3'
    });

    equal(controller.get('dagURL'), '123');
  });

});
define('hive/tests/unit/controllers/udfs-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleFor('controller:udfs', 'UdfsController', {});

  ember_qunit.test('controller is initialized', function() {
    expect(3);

    var component = this.subject();

    equal(component.get('columns.length'), 2, 'Columns are initialized correctly');
    ok(component.get('sortAscending'), 'Sort ascending is true');
    equal(component.get('sortProperties.length'), 0, 'sortProperties is empty');
  });

  ember_qunit.test('sort', function() {
   expect(2);

    var component = this.subject();

    Ember['default'].run(function () {
      component.send('sort', 'prop');
    });

    ok(component.get('sortAscending'), 'New sort prop sortAscending is set to true');
    equal(component.get('sortProperties').objectAt(0), "prop", 'sortProperties is set to prop');
  });

  ember_qunit.test('add', function() {
    expect(1);

    var store = {
      createRecord: function(name) {
        ok(name, 'store.createRecord called');
      }
    };
    var component = this.subject({ store: store });

    Ember['default'].run(function () {
      component.send('add');
    });
  });

});
define('hive/tests/unit/helpers/path-binding-test', ['hive/helpers/path-binding', 'ember'], function (path_binding, Ember) {

  'use strict';

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

  module('PathBindingHelper');

  // Replace this with your real tests.
  test('it should retrieve property value for a given object.', function() {
    var obj = Ember['default'].Object.extend({
      name: 'some name'
    }).create();

    var result = path_binding.pathBinding(obj, 'name');
    equal(result, obj.get('name'));
  });

});
define('hive/tests/unit/services/notify-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleFor('service:notify', 'NotifyService');

  ember_qunit.test('Service initialized correctly', function () {
    expect(3);

    var service = this.subject();
    service.removeAllMessages();
    service.markMessagesAsSeen();

    equal(service.get('messages.length'), 0, 'No messages');
    equal(service.get('notifications.length'), 0, 'No notifications');
    equal(service.get('unseenMessages.length'), 0, 'No unseenMessages');
  });

  ember_qunit.test('Can add notification', function() {
    expect(3);
    var service = this.subject();

    service.add('notif', 'message', 'body');

    equal(service.get('messages.length'), 1, 'one message added');
    equal(service.get('notifications.length'), 1, 'one notifications added');
    equal(service.get('unseenMessages.length'), 1, 'one unseenMessages added');
  });

  ember_qunit.test('Can add info notification', function() {
    expect(1);
    var service = this.subject();

    service.info('message', 'body');
    equal(service.get('messages.lastObject.type.typeClass'), 'alert-info', 'Info notification added');
  });

  ember_qunit.test('Can add warn notification', function() {
    expect(1);
    var service = this.subject();

    service.warn('message', 'body');
    equal(service.get('messages.lastObject.type.typeClass'), 'alert-warning', 'Warn notification added');
  });

  ember_qunit.test('Can add error notification', function() {
    expect(1);
    var service = this.subject();

    service.error('message', 'body');
    equal(service.get('messages.lastObject.type.typeClass'), 'alert-danger', 'Error notification added');
  });

  ember_qunit.test('Can add success notification', function() {
    expect(1);
    var service = this.subject();

    service.success('message', 'body');
    equal(service.get('messages.lastObject.type.typeClass'), 'alert-success', 'Success notification added');
  });

  ember_qunit.test('Can format message body', function() {
    expect(3);

    var objectBody = {
      k1: 'v1',
      k2: 'v2'
    };
    var formatted = "\n\nk1:\nv1\n\nk2:\nv2";
    var service = this.subject();

    ok(!service.formatMessageBody(), 'Return nothing if no body is passed');
    equal(service.formatMessageBody('some string'), 'some string', 'Return the body if it is a string');
    equal(service.formatMessageBody(objectBody), formatted, 'Parse the keys and return a string if it is an object');
  });

  ember_qunit.test('Can removeMessage', function() {
    expect(4);

    var service = this.subject();
    var messagesCount = service.get('messages.length');
    var notificationCount = service.get('notifications.length');

    service.add('type', 'message', 'body');

    equal(service.get('messages.length'), messagesCount + 1, 'Message added');
    equal(service.get('notifications.length'), notificationCount + 1, 'Notification added');

    var message = service.get('messages.lastObject');
    service.removeMessage(message);

    equal(service.get('messages.length'), messagesCount, 'Message removed');
    equal(service.get('notifications.length'), notificationCount, 'Notification removed');
  });

  ember_qunit.test('Can removeNotification', function() {
    expect(2);

    var service = this.subject();
    var notificationCount = service.get('notifications.length');

    service.add('type', 'message', 'body');

    equal(service.get('notifications.length'), notificationCount + 1, 'Notification added');

    var notification = service.get('notifications.lastObject');
    service.removeNotification(notification);

    equal(service.get('notifications.length'), notificationCount, 'Notification removed');
  });

  ember_qunit.test('Can removeAllMessages', function() {
    expect(2);

    var service = this.subject();

    service.add('type', 'message', 'body');
    service.add('type', 'message', 'body');
    service.add('type', 'message', 'body');

    ok(service.get('messages.length'), 'Messages are present');
    service.removeAllMessages();
    equal(service.get('messages.length'), 0, 'No messages found');
  });

  ember_qunit.test('Can markMessagesAsSeen', function() {
    expect(2);

    var service = this.subject();

    service.add('type', 'message', 'body');
    service.add('type', 'message', 'body');
    service.add('type', 'message', 'body');

    ok(service.get('unseenMessages.length'), 'There are unseen messages');
    service.markMessagesAsSeen();
    equal(service.get('unseenMessages.length'), 0, 'No unseen messages');
  });

});
define('hive/tests/unit/services/settings-test', ['ember', 'ember-qunit'], function (Ember, ember_qunit) {

  'use strict';

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

  ember_qunit.moduleFor('service:settings', 'SettingsService');

  ember_qunit.test('Init', function(assert) {
    var service = this.subject();
    assert.ok(service);
  });

  ember_qunit.test('Can create a setting object', function(assert) {
    assert.expect(2);

    var service = this.subject();

    var setting = service._createSetting('sName', 'sValue');

    assert.equal(setting.get('key.name'), 'sName', 'Settign has the correct name');
    assert.equal(setting.get('value'), 'sValue', 'Settign has the correct value');

    service.removeAll();
  });

  ember_qunit.test('Can create default settings', function(assert) {
    assert.expect(2);

    var service = this.subject();

    var settings = {
      'sName1': 'sValue1',
      'sName2': 'sValue2',
      'sName3': 'sValue3'
    };

    service._createDefaultSettings();

    assert.equal(service.get('settings.length'), 0, '0 settings created');

    service._createDefaultSettings(settings);

    assert.equal(service.get('settings.length'), 3, '3 settings created');

    service.removeAll();
  });

  ember_qunit.test('Can add a setting', function(assert) {
    assert.expect(2);

    var service = this.subject();
    assert.equal(service.get('settings.length'), 0, 'No settings');
    service.add();
    service.add();
    assert.equal(service.get('settings.length'), 2, '2 settings added');

    service.removeAll();
  });

  ember_qunit.test('Can remove a setting', function(assert) {
    assert.expect(2);

    var service = this.subject();

    service.add();
    service.add();

    assert.equal(service.get('settings.length'), 2, '2 settings added');
    var firstSetting = service.get('settings.firstObject');
    service.remove(firstSetting);
    assert.equal(service.get('settings.length'), 1, 'Setting removed');

    service.removeAll();
  });

  ember_qunit.test('Can create key', function(assert) {
    assert.expect(2);
    var service = this.subject();

    assert.ok(!service.get('predefinedSettings').findBy('name', 'new.key.name'), 'Key doesn\'t exist');

    var setting = service._createSetting();
    setting.set('key', null);
    service.get('settings').pushObject(setting);
    service.createKey('new.key.name');

    assert.ok(service.get('predefinedSettings').findBy('name', 'new.key.name'), 'Key created');

    service.removeAll();
  });

  ember_qunit.test('Can get settings string', function(assert) {
    var service = this.subject();

    var noSettings = service.getSettings();
    assert.equal(noSettings, "", 'An empty string is returned if there are no settings');

    var settings = {
      'sName1': 'sValue1',
      'sName2': 'sValue2'
    };

    service._createDefaultSettings(settings);

    var expectedWithSettings = "set sName1=sValue1;\nset sName2=sValue2;\n--Global Settings--\n\n";
    var withSettings = service.getSettings();

    assert.equal(withSettings, expectedWithSettings, 'Returns correct string');
  });

  ember_qunit.test('It can parse global settings', function(assert) {
    var service = this.subject();

    assert.ok(!service.parseGlobalSettings(), 'It returns if query or model is not passed');

    var settings = {
      'sName1': 'sValue1',
      'sName2': 'sValue2'
    };


    var globalSettingsString = "set sName1=sValue1;\nset sName2=sValue2;\n--Global Settings--\n\n";

    var model = Ember['default'].Object.create({
      globalSettings: globalSettingsString
    });

    var query = Ember['default'].Object.create({
      fileContent: globalSettingsString + "{{match}}"
    });

    assert.ok(!service.parseGlobalSettings(query, model), 'It returns if current settings don\'t match models global settings');

    service._createDefaultSettings(settings);

    service.parseGlobalSettings(query, model);

    assert.equal(query.get('fileContent'), "{{match}}", 'It parsed global settings');
  });

});
define('hive/tests/unit/views/visual-explain-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

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

  var view;

  ember_qunit.moduleFor('view:visual-explain', 'VisualExplainView', {
    setup: function() {
      var controller = Ember.Controller.extend({}).create();

      view = this.subject({
        controller: controller
      });

      Ember.run(function() {
        view.appendTo('#ember-testing');
      });
    },

    teardown: function() {
      Ember.run(view, view.destroy);
    },
  });

  //select count (*) from power
  var selectCountJson = {"STAGE PLANS":{"Stage-1":{"Tez":{"DagName:":"hive_20150608120000_b930a285-dc6a-49b7-86b6-8bee5ecdeacd:96","Vertices:":{"Reducer 2":{"Reduce Operator Tree:":{"Group By Operator":{"mode:":"mergepartial","aggregations:":["count(VALUE._col0)"],"outputColumnNames:":["_col0"],"children":{"Select Operator":{"expressions:":"_col0 (type: bigint)","outputColumnNames:":["_col0"],"children":{"File Output Operator":{"Statistics:":"Num rows: 1 Data size: 8 Basic stats: COMPLETE Column stats: COMPLETE","compressed:":"false","table:":{"serde:":"org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe","input format:":"org.apache.hadoop.mapred.TextInputFormat","output format:":"org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat"}}},"Statistics:":"Num rows: 1 Data size: 8 Basic stats: COMPLETE Column stats: COMPLETE"}},"Statistics:":"Num rows: 1 Data size: 8 Basic stats: COMPLETE Column stats: COMPLETE"}}},"Map 1":{"Map Operator Tree:":[{"TableScan":{"alias:":"power","children":{"Select Operator":{"children":{"Group By Operator":{"mode:":"hash","aggregations:":["count()"],"outputColumnNames:":["_col0"],"children":{"Reduce Output Operator":{"sort order:":"","value expressions:":"_col0 (type: bigint)","Statistics:":"Num rows: 1 Data size: 8 Basic stats: COMPLETE Column stats: COMPLETE"}},"Statistics:":"Num rows: 1 Data size: 8 Basic stats: COMPLETE Column stats: COMPLETE"}},"Statistics:":"Num rows: 0 Data size: 132960632 Basic stats: PARTIAL Column stats: COMPLETE"}},"Statistics:":"Num rows: 0 Data size: 132960632 Basic stats: PARTIAL Column stats: COMPLETE"}}]}},"Edges:":{"Reducer 2":{"parent":"Map 1","type":"SIMPLE_EDGE"}}}},"Stage-0":{"Fetch Operator":{"limit:":"-1","Processor Tree:":{"ListSink":{}}}}},"STAGE DEPENDENCIES":{"Stage-1":{"ROOT STAGE":"TRUE"},"Stage-0":{"DEPENDENT STAGES":"Stage-1"}}};

  //select power.adate, power.atime from power join power2 on power.adate = power2.adate
  var joinJson = {"STAGE PLANS":{"Stage-1":{"Tez":{"DagName:":"hive_20150608124141_acde7f09-6b72-4ad4-88b0-807d499724eb:107","Vertices:":{"Reducer 2":{"Reduce Operator Tree:":{"Merge Join Operator":{"outputColumnNames:":["_col0","_col1"],"children":{"Select Operator":{"expressions:":"_col0 (type: string), _col1 (type: string)","outputColumnNames:":["_col0","_col1"],"children":{"File Output Operator":{"Statistics:":"Num rows: 731283 Data size: 73128349 Basic stats: COMPLETE Column stats: NONE","compressed:":"false","table:":{"serde:":"org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe","input format:":"org.apache.hadoop.mapred.TextInputFormat","output format:":"org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat"}}},"Statistics:":"Num rows: 731283 Data size: 73128349 Basic stats: COMPLETE Column stats: NONE"}},"Statistics:":"Num rows: 731283 Data size: 73128349 Basic stats: COMPLETE Column stats: NONE","condition map:":[{"":"Inner Join 0 to 1"}],"condition expressions:":{"1":"","0":"{KEY.reducesinkkey0} {VALUE._col0}"}}}},"Map 1":{"Map Operator Tree:":[{"TableScan":{"filterExpr:":"adate is not null (type: boolean)","alias:":"power2","children":{"Filter Operator":{"predicate:":"adate is not null (type: boolean)","children":{"Reduce Output Operator":{"Map-reduce partition columns:":"adate (type: string)","sort order:":"+","Statistics:":"Num rows: 664803 Data size: 66480316 Basic stats: COMPLETE Column stats: NONE","key expressions:":"adate (type: string)"}},"Statistics:":"Num rows: 664803 Data size: 66480316 Basic stats: COMPLETE Column stats: NONE"}},"Statistics:":"Num rows: 1329606 Data size: 132960632 Basic stats: COMPLETE Column stats: NONE"}}]},"Map 3":{"Map Operator Tree:":[{"TableScan":{"filterExpr:":"adate is not null (type: boolean)","alias:":"power","children":{"Filter Operator":{"predicate:":"adate is not null (type: boolean)","children":{"Reduce Output Operator":{"Map-reduce partition columns:":"adate (type: string)","sort order:":"+","value expressions:":"atime (type: string)","Statistics:":"Num rows: 332402 Data size: 66480416 Basic stats: COMPLETE Column stats: NONE","key expressions:":"adate (type: string)"}},"Statistics:":"Num rows: 332402 Data size: 66480416 Basic stats: COMPLETE Column stats: NONE"}},"Statistics:":"Num rows: 664803 Data size: 132960632 Basic stats: COMPLETE Column stats: NONE"}}]}},"Edges:":{"Reducer 2":[{"parent":"Map 1","type":"SIMPLE_EDGE"},{"parent":"Map 3","type":"SIMPLE_EDGE"}]}}},"Stage-0":{"Fetch Operator":{"limit:":"-1","Processor Tree:":{"ListSink":{}}}}},"STAGE DEPENDENCIES":{"Stage-1":{"ROOT STAGE":"TRUE"},"Stage-0":{"DEPENDENT STAGES":"Stage-1"}}};

  // Replace this with your real tests.
  ember_qunit.test('it renders dag when controller.json changes.', function (assert) {
    assert.expect(1);

    view.renderDag = function () {
      assert.ok(true, 'dag rendering has been called on json set.');
    };

    view.set('controller.json', selectCountJson);
  });

  ember_qunit.test('renderDag generates correct number of nodes and edges.', function (assert) {
    assert.expect(4);

    Ember.run(function () {
      view.set('controller.json', selectCountJson);

      assert.equal(view.get('graph').nodes().length, 4);
      assert.equal(view.get('graph').edges().length, 3);

      view.set('controller.json', joinJson);

      assert.equal(view.get('graph').nodes().length, 7);
      assert.equal(view.get('graph').edges().length, 6);
    });
  });

  ember_qunit.test('progress gets updated for each node.', function (assert) {
    expect(2);

    Ember.run(function () {
      view.set('controller.json', selectCountJson);

      var targetNode;
      var verticesGroups = view.get('verticesGroups');

      verticesGroups.some(function (verticesGroup) {
        var node = verticesGroup.contents.findBy('label', 'Map 1');

        if (node) {
          targetNode = node;
          return true;
        }
      });

      assert.equal(targetNode.get('progress'), undefined, 'initial progress is falsy.');

      view.set('controller.verticesProgress', [
        Ember.Object.create({
          name: 'Map 1',
          value: 1
        })
      ]);

      assert.equal(targetNode.get('progress'), 1, 'progress gets updated to given value.');
    });
  });

});
define('hive/transforms/date', ['exports', 'ember', 'ember-data'], function (exports, Ember, DS) {

  'use strict';

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

  exports['default'] = DS['default'].Transform.extend({

    deserialize: function (serialized) {
      var type = typeof serialized;

      if (type === "string") {
        return new Date(Ember['default'].Date.parse(serialized));
      } else if (type === "number") {
        return new Date(serialized);
      } else if (serialized === null || serialized === undefined) {
        // if the value is not present in the data,
        // return undefined, not null.
        return serialized;
      } else {
        return null;
      }
    },

    serialize: function (date) {
      if (date instanceof Date) {
        // Serialize it as a number to maintain millisecond precision
        return Number(date);
      } else {
        return null;
      }
    }

  });

});
define('hive/utils/constants', ['exports', 'ember', 'hive/utils/functions'], function (exports, Ember, helpers) {

  'use strict';

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

  exports['default'] = Ember['default'].Object.create({
    appTitle: 'Hive',

    /**
     * This should reflect the naming conventions accross the application.
     * Changing one value also means changing the filenames for the chain of files
     * represented by that value (routes, controllers, models etc).
     * This dependency goes both ways.
    */
    namingConventions: {
      routes: {
        index: 'index',
        savedQuery: 'savedQuery',
        historyQuery: 'historyQuery',
        queries: 'queries',
        history: 'history',
        udfs: 'udfs',
        logs: 'logs',
        results: 'results',
        explain: 'explain',
        uploadTable :'upload-table',
        visualization: 'visualization'
      },

      subroutes: {
        savedQuery: 'index.savedQuery',
        historyQuery: 'index.historyQuery',
        jobLogs: 'index.historyQuery.logs',
        jobResults: 'index.historyQuery.results',
        jobExplain: 'index.historyQuery.explain'
      },

      index: 'index',
      udf: 'udf',
      udfs: 'udfs',
      udfInsertPrefix: 'create temporary function ',
      fileInsertPrefix: 'add jar ',
      explainPrefix: 'EXPLAIN ',
      explainFormattedPrefix: 'EXPLAIN FORMATTED ',
      insertUdfs: 'insert-udfs',
      job: 'job',
      jobs: 'jobs',
      history: 'history',
      savedQuery: 'saved-query',
      database: 'database',
      databases: 'databases',
      openQueries: 'open-queries',
      visualExplain: 'visual-explain',
      notify: 'notify',
      tezUI: 'tez-ui',
      file: 'file',
      fileResource: 'file-resource',
      alerts: 'alerts',
      logs: 'logs',
      results: 'results',
      jobResults: 'index/history-query/results',
      jobLogs: 'index/history-query/logs',
      jobExplain: 'index/history-query/explain',
      databaseTree: 'databases-tree',
      databaseSearch: 'databases-search-results',
      settings: 'settings',
      jobProgress: 'job-progress',
      queryTabs: 'query-tabs',
      session: 'session'
    },

    hiveParameters: [
      {
        name: 'hive.tez.container.size',
        validate: helpers['default'].regexes.digits
      },

      {
        name: 'hive.prewarm.enabled',
        values: helpers['default'].validationValues.bool
      },
      {
        name: 'hive.prewarm.numcontainers',
        validate: helpers['default'].regexes.digits
      },
      {
        name: 'hive.tez.auto.reducer.parallelism',
        values: helpers['default'].validationValues.bool
      },
      {
        name: 'hive.execution.engine',
        values: helpers['default'].validationValues.execEngine
      },
      {
        name: 'hive.vectorized.execution.enabled',
        values: helpers['default'].validationValues.bool
      },
      {
        name: 'hive.auto.convert.join',
        values: helpers['default'].validationValues.bool
      },
      {
        name: 'tez.am.resource.memory.mb',
        validate: helpers['default'].regexes.digits
      },
      {
        name: 'tez.am.container.idle.release-timeout-min.millis',
        validate: helpers['default'].regexes.digits
      },
      {
        name: 'tez.am.container.idle.release-timeout-max.millis',
        validate: helpers['default'].regexes.digits
      },
      {
        name: 'tez.queue.name',
        validate: helpers['default'].regexes.name
      },
      {
        name: 'tez.runtime.io.sort.mb',
        validate: helpers['default'].regexes.digits
      },
      {
        name: 'tez.runtime.sort.threads',
        validate: helpers['default'].regexes.digits
      },
      {
        name: 'tez.runtime.compress.codec',
        validate: helpers['default'].regexes.dotPath
      },
      {
        name: 'tez.grouping.min-size',
        validate: helpers['default'].regexes.digits
      },
      {
        name: 'tez.grouping.max-size',
        validate: helpers['default'].regexes.digits
      },
      {
        name: 'tez.generate.debug.artifacts',
        values: helpers['default'].validationValues.bool
      }
    ],

    jobReferrer: {
      sample: 'sample',
      explain: 'explain',
      visualExplain: 'visualExplain',
      job: 'job'
    },

    statuses: {
      unknown: "UNKNOWN",
      initialized: "INITIALIZED",
      running: "RUNNING",
      succeeded: "SUCCEEDED",
      canceled: "CANCELED",
      closed: "CLOSED",
      error: "ERROR",
      failed: 'FAILED',
      killed: 'KILLED',
      pending: "PENDING"
    },

    alerts: {
      warning: 'warning',
      error: 'danger',
      success: 'success'
    },

    results: {
      save: {
        csv: 'Save as csv',
        hdfs: 'Save to HDFS'
      },
      statuses: {
        terminated: "TERMINATED",
        runnable: "RUNNABLE"
      }
    },

    //this can be replaced by a string.format implementation
    adapter: {
      version: '1.0.0',
      instance: 'Hive',
      apiPrefix: '/api/v1/views/HIVE/versions/',
      instancePrefix: '/instances/',
      resourcePrefix: 'resources/'
    },

    sampleDataQuery: 'SELECT * FROM %@ LIMIT 100;',

    notify: {
      ERROR:  {
        typeClass : 'alert-danger',
        typeIcon  : 'fa-exclamation-triangle'
      },
      WARN: {
        typeClass : 'alert-warning',
        typeIcon  : 'fa-times-circle'
      },
      SUCCESS: {
        typeClass : 'alert-success',
        typeIcon  : 'fa-check'
      },
      INFO: {
        typeClass : 'alert-info',
        typeIcon  : 'fa-info'
      }
    },

    globalSettings: {
      comment: "--Global Settings--\n\n"
    },

    defaultVisualizationRowCount: 10000

  });

});
define('hive/utils/dag-rules', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].ArrayProxy.create({
    content: Ember['default'].A(
      [
        {
          targetOperator: 'TableScan',
          targetProperty: 'alias:',
          label: 'Table Scan:',

          fields: [
            {
              label: 'filterExpr:',
              targetProperty: 'filterExpr:'
            }
          ]
        },
        {
          targetOperator: 'Filter Operator',
          targetProperty: 'predicate:',
          label: 'Filter:',

          fields: []
        },
        {
          targetOperator: 'Map Join Operator',
          label: 'Map Join',

          fields: []
        },
        {
          targetOperator: 'Merge Join Operator',
          label: 'Merge Join',

          fields: []
        },
        {
          targetOperator: 'Select Operator',
          label: 'Select',

          fields: []
        },
        {
          targetOperator: 'Reduce Output Operator',
          label: 'Reduce',

          fields: [
            {
              label: 'Partition columns:',
              targetProperty: 'Map-reduce partition columns:'
            },
            {
              label: 'Key expressions:',
              targetProperty: 'key expressions:'
            },
            {
              label: 'Sort order:',
              targetProperty: 'sort order:'
            }
          ]
        },
        {
          targetOperator: 'File Output Operator',
          label: 'File Output Operator',

          fields: []
        },
        {
          targetOperator: 'Group By Operator',
          label: 'Group By:',

          fields: [
            {
              label: 'Aggregations:',
              targetProperties: 'aggregations:'
            },
            {
              label: 'Keys:',
              targetProperty: 'keys:'
            }
          ]
        },
        {
          targetOperator: 'Limit',
          targetProperty: 'Number of rows:',
          label: 'Limit:',

          fields: []
        },
        {
          targetOperator: 'Extract',
          label: 'Extract',

          fields: []
        },
        {
          targetOperator: 'PTF Operator',
          label: 'Partition Table Function',

          fields: []
        },
        {
          targetOperator: 'Dynamic Partitioning Event Operator',
          labelel: 'Dynamic Partitioning Event',

          fields: [
            {
              label: 'Target column:',
              targetProperty: 'Target column:'
            },
            {
              label: 'Target Vertex:',
              targetProperty: 'Target Vertex:'
            },
            {
              label: 'Partition key expr:',
              targetProperty: 'Partition key expr:'
            }
          ]
        }
      ]
    )
  });

});
define('hive/utils/functions', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].Object.create({
    isInteger: function (x) {
      return !isNaN(x);
    },

    isDate: function (date) {
      return moment(date).isValid();
    },

    regexes: {
      allUppercase: /^[^a-z]*$/,
      whitespaces: /^(\s*).*$/,
      digits: /^\d+$/,
      name: /\w+/ig,
      dotPath: /[a-z.]+/i,
      setSetting: /^set\s+[\w-.]+(\s+|\s?)=(\s+|\s?)[\w-.]+(\s+|\s?);/gim
    },

    validationValues: {
      bool: [
        Ember['default'].Object.create({ value: 'true' }),
        Ember['default'].Object.create({ value: 'false' })
      ],

      execEngine: [
        Ember['default'].Object.create({ value: 'tez' }),
        Ember['default'].Object.create({ value: 'mr' })
      ]
    },

    insensitiveCompare: function (sourceString) {
      var args = Array.prototype.slice.call(arguments, 1);

      if (!sourceString) {
        return false;
      }

      return !!args.find(function (arg) {
        return sourceString.match(new RegExp('^' + arg + '$', 'i'));
      });
    },

    insensitiveContains: function (sourceString, destString) {
      return sourceString.toLowerCase().indexOf(destString.toLowerCase()) > -1;
    },

    convertToArray : function (inputObj) {
      var array = [];

      for (var key in inputObj) {
        if (inputObj.hasOwnProperty(key)) {
          array.pushObject({
            name: key,
            value: inputObj[key]
          });
        }
      }
      return array;
    },

    /**
     * Convert number of seconds into time object HH MM SS
     *
     * @param integer secs Number of seconds to convert
     * @return object
    */
    secondsToHHMMSS: function (secs)
     {
      var hours = Math.floor(secs / (60 * 60));

      var divisor_for_minutes = secs % (60 * 60);
      var minutes = Math.floor(divisor_for_minutes / 60);

      var divisor_for_seconds = divisor_for_minutes % 60;
      var seconds = Math.ceil(divisor_for_seconds);

      var obj = {
        "h": hours,
        "m": minutes,
        "s": seconds
      };
      return  ((obj.h > 0) ? obj.h + ' hr ' : '') + ((obj.m > 0) ? obj.m + ' min ' : '') + ((obj.s >= 0) ? obj.m + ' sec ' : '');
    }

  });

});
define('hive/views/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].View.extend({
    didInsertElement: function() {
      this._super();
      Ember['default'].$('body').tooltip({
        selector: '[data-toggle="tooltip"]'
      });
    }
  });

});
define('hive/views/message', ['exports', 'ember', 'hive/views/notification'], function (exports, Ember, NotificationView) {

  'use strict';

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
  exports['default'] = NotificationView['default'].extend({
    templateName : 'message',
    removeLater  : Ember['default'].K,
    isExpanded  : false,
    removeMessage: 'removeMessage',

    actions: {
      expand: function () {
        this.toggleProperty('isExpanded');
      },

      close: function () {
        this.get('controller').send('removeMessage', this.get('notification'));
      }
    }
  });

});
define('hive/views/messages', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].View.extend({
    didInsertElement: function () {
      var target = this.$('#messages');
      var panel = this.$('#messages .panel-body');

      panel.css('min-height', $('.main-content').height());
      target.animate({ width: $('.main-content').width() }, 'fast');
    },

    willDestroyElement: function () {
      var target = this.$('#messages');
      var panel = this.$('#messages .panel-body');

      panel.css('min-height', 0);
      target.css('width', 0);
    }
  });

});
define('hive/views/notification', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].View.extend({
    closeAfter         : 5000,
    isHovering         : false,
    templateName       : 'notification',
    removeNotification : 'removeNotification',

    setup: function () {
      this.set('typeClass', this.get('notification.type.typeClass'));
      this.set('typeIcon', this.get('notification.type.typeIcon'));
    }.on('init'),

    removeLater: function () {
      Ember['default'].run.later(this, function () {
        if (this.get('isHovering')) {
          this.removeLater();
        } else if (this.element) {
          this.send('close');
        }
      }, this.get('closeAfter'));
    }.on('didInsertElement'),

    mouseEnter: function () { this.set('isHovering', true);  },
    mouseLeave: function () { this.set('isHovering', false); },

    actions: {
      close: function () {
        this.remove();
        this.get('parentView').send('removeNotification', this.get('notification'));
      }
    }
  });

});
define('hive/views/tez-ui', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].View.extend({
    didInsertElement: function () {
      var target = this.$('#tez-ui');
      var panel = this.$('#tez-ui .panel-body');

      panel.css('min-height', $('.main-content').height());
      target.animate({ width: $('.main-content').width() }, 'fast');
    },

    willDestroyElement: function () {
      var target = this.$('#tez-ui');
      var panel = this.$('#tez-ui .panel-body');

      panel.css('min-height', 0);
      target.css('width', 0);
    }
  });

});
define('hive/views/visual-explain', ['exports', 'ember', 'hive/utils/dag-rules', 'hive/utils/functions'], function (exports, Ember, dagRules, utils) {

  'use strict';

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

  /* globals dagre */

  exports['default'] = Ember['default'].View.extend({
    verticesGroups: [],
    edges: [],

    willInsertElement: function () {
      this.set('graph', new dagre.graphlib.Graph());
    },

    didInsertElement: function () {
      this._super();

      var target = this.$('#visual-explain');
      var panel = this.$('#visual-explain .panel-body');

      panel.css('min-height', $('.main-content').height());
      target.animate({ width: $('.main-content').width() }, 'fast');

      this.$('#visual-explain-graph').draggable();

      if (this.get('controller.rerender')) {
        this.renderDag();
      }
    },

    willDestroyElement: function () {
      var target = this.$('#visual-explain');
      var panel = this.$('#visual-explain .panel-body');

      panel.css('min-height', 0);
      target.css('width', 0);
    },

    updateProgress: function () {
      var verticesProgress = this.get('controller.verticesProgress');
      var verticesGroups = this.get('verticesGroups');

      if (!verticesGroups || !verticesProgress || !verticesProgress.length) {
        return;
      }

      verticesGroups.forEach(function (verticesGroup) {
        verticesGroup.contents.forEach(function (node) {
          var progress = verticesProgress.findBy('name', node.get('label'));

          if (progress) {
            node.set('progress', progress.get('value'));
          }
        });
      });
    }.observes('controller.verticesProgress.@each.value', 'verticesGroups'),

    jsonChanged: function () {
      var json = this.get('controller.json');
      this.renderDag();
    }.observes('controller.json'),

    getOffset: function (el) {
      var _x = 0;
      var _y = 0;
      var _w = el.offsetWidth|0;
      var _h = el.offsetHeight|0;
      while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
          _x += el.offsetLeft - el.scrollLeft;
          _y += el.offsetTop - el.scrollTop;
          el = el.offsetParent;
      }
      return { top: _y, left: _x, width: _w, height: _h };
    },

    addEdge: function (div1, div2, thickness, type) {
      var off1 = this.getOffset(div1);
      var off2 = this.getOffset(div2);
      // bottom right
      var x1 = off1.left + off1.width / 2;
      var y1 = off1.top + off1.height;
      // top right
      var x2 = off2.left + off2.width / 2;
      var y2 = off2.top;
      // distance
      var length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
      // center
      var cx = ((x1 + x2) / 2) - (length / 2);
      var cy = ((y1 + y2) / 2) - (thickness / 2) - 73;
      // angle
      var angle = Math.round(Math.atan2((y1-y2), (x1-x2)) * (180 / Math.PI));

      if (angle < -90) {
        angle = 180 + angle;
      }

      var style = "left: %@px; top: %@px; width: %@px; transform:rotate(%@4deg);";
      style = style.fmt(cx, cy, length, angle);

      var edgeType;

      if (type) {
        if (type === 'BROADCAST_EDGE') {
          edgeType = 'BROADCAST';
        } else {
          edgeType = 'SHUFFLE';
        }
      }

      this.get('edges').pushObject({
        style: style,
        type: edgeType
      });
    },

    getNodeContents: function (operator, contents, table, vertex) {
      var currentTable = table,
        contents = contents || [],
        nodeName,
        node,
        ruleNode,
        nodeLabelValue,
        self = this;

      if (operator.constructor === Array) {
        operator.forEach(function (childOperator) {
          self.getNodeContents(childOperator, contents, currentTable, vertex);
        });

        return contents;
      } else {
        nodeName = Object.getOwnPropertyNames(operator)[0];
        node = operator[nodeName];
        ruleNode = dagRules['default'].findBy('targetOperator', nodeName);

        if (ruleNode) {
          if (nodeName.indexOf('Map Join') > -1) {
            nodeLabelValue = this.handleMapJoinNode(node, currentTable);
            currentTable = null;
          } else if (nodeName.indexOf('Merge Join') > -1) {
            nodeLabelValue = this.handleMergeJoinNode(node, vertex);
          } else {
            nodeLabelValue = node[ruleNode.targetProperty];
          }

          contents.pushObject({
            title: ruleNode.label,
            statistics: node["Statistics:"],
            index: contents.length + 1,
            value: nodeLabelValue,
            fields: ruleNode.fields.map(function (field) {
              var value = node[field.targetProperty || field.targetProperties];

              return {
                label: field.label,
                value: value
              };
            })
          });

          if (node.children) {
            return this.getNodeContents(node.children, contents, currentTable, vertex);
          } else {
            return contents;
          }
        } else {
          return contents;
        }
      }
    },

    handleMapJoinNode: function (node, table) {
      var rows = table || "<rows from above>";
      var firstTable = node["input vertices:"][0] || rows;
      var secondTable = node["input vertices:"][1] || rows;

      var joinString = node["condition map:"][0][""];
      joinString = joinString.replace("0", firstTable);
      joinString = joinString.replace("1", secondTable);
      joinString += " on ";
      joinString += node["keys:"][0] + "=";
      joinString += node["keys:"][1];

      return joinString;
    },

    handleMergeJoinNode: function (node, vertex) {
      var graphData = this.get('controller.json')['STAGE PLANS']['Stage-1']['Tez'];
      var edges = graphData['Edges:'];
      var index = 0;
      var joinString = node["condition map:"][0][""];

      edges[vertex].toArray().forEach(function (edge) {
        if (edge.type === "SIMPLE_EDGE") {
          joinString.replace(String(index), edge.parent);
          index++;
        }
      });

      return joinString;
    },

    //sets operator nodes
    setNodes: function (vertices) {
      var g = this.get('graph');
      var self = this;

      vertices.forEach(function (vertex) {
        var contents = [];
        var operator;
        var currentTable;

        if (vertex.name.indexOf('Map') > -1) {
          if (vertex.value && vertex.value['Map Operator Tree:']) {
            operator = vertex.value['Map Operator Tree:'][0];
            currentTable = operator["TableScan"]["alias:"];
          } else {
            //https://hortonworks.jira.com/browse/BUG-36168
            operator = "None";
          }
        } else if (vertex.name.indexOf('Reducer') > -1) {
          operator = vertex.value['Reduce Operator Tree:'];
        }

        if (operator) {
          contents = self.getNodeContents(operator, null, currentTable, vertex.name);

          g.setNode(vertex.name, {
            contents: contents,
            id: vertex.name,
            label: vertex.name
          });
        }
      });

      return this;
    },

    //sets edges between operator nodes
    setEdges: function (edges) {
      var g = this.get('graph');
      var invalidEdges = [];
      var edgesToBeRemoved = [];
      var isValidEdgeType = function (type) {
        return type === "SIMPLE_EDGE" ||
               type === "BROADCAST_EDGE";
      };

      edges.forEach(function (edge) {
        var parent;
        var type;

        if (edge.value.constructor === Array) {
          edge.value.forEach(function (childEdge) {
            parent = childEdge.parent;
            type = childEdge.type;

            if (isValidEdgeType(type)) {
              g.setEdge(parent, edge.name);
              g.edge({v: parent, w: edge.name}).type = type;
            } else {
              invalidEdges.pushObject({
                vertex: edge.name,
                edge: childEdge
              });
            }
          });
        } else {
          parent = edge.value.parent;
          type = edge.value.type;

          if (isValidEdgeType(type)) {
            g.setEdge(parent, edge.name);
            g.edge({v: parent, w: edge.name}).type = type;
          } else {
            invalidEdges.pushObject({
              vertex: edge.name,
              edge: edge.name
            });
          }
        }
      });

      invalidEdges.forEach(function (invalidEdge) {
        var parent;
        var targetEdge = g.edges().find(function (graphEdge) {
          return graphEdge.v === invalidEdge.edge.parent ||
                 graphEdge.w === invalidEdge.edge.parent;
        });

        var targetVertex;

        if (targetEdge) {
          edgesToBeRemoved.pushObject(targetEdge);

          if (targetEdge.v === invalidEdge.edge.parent) {
            targetVertex = targetEdge.w;
          } else {
            targetVertex = targetEdge.v;
          }

          parent = invalidEdge.vertex;

          g.setEdge({v: parent, w: targetVertex});
          g.setEdge({v: parent, w: targetVertex}).type = "BROADCAST_EDGE";
        }
      });

      edgesToBeRemoved.uniq().forEach(function (edge) {
        g.removeEdge(edge.v, edge.w, edge.name);
      });

      return this;
    },

    //sets nodes for tables and their edges
    setTableNodesAndEdges: function (vertices) {
      var g = this.get('graph');

      vertices.forEach(function (vertex) {
        var operator;
        var table;
        var id;

        if (vertex.name.indexOf('Map') > -1 && vertex.value && vertex.value['Map Operator Tree:']) {
          operator = vertex.value['Map Operator Tree:'][0];
          for (var node in operator) {
            table = operator[node]['alias:'];

            //create unique identifier by using table + map pairs so that we have
            //different nodes for the same table if it's a table connected to multiple Map operators
            id = table + ' for ' + vertex.name;

            g.setNode(id, { id: id, label: table, isTableNode: true });
            g.setEdge(id, vertex.name);
          }
        }
      });

      dagre.layout(g);

      return this;
    },

    createNodeGroups: function () {
      var groupedNodes = [];
      var g = this.get('graph');
      var lastRowNode;
      var fileOutputOperator;

      g.nodes().forEach(function (value) {
        var node = g.node(value);

        if (node) {
          var existentRow = groupedNodes.findBy('topOffset', node.y);

          if (!existentRow) {
             groupedNodes.pushObject({
                topOffset: node.y,
                contents: [ Ember['default'].Object.create(node) ]
             });
          } else {
            existentRow.contents.pushObject(Ember['default'].Object.create(node));
          }
        }
      });

      groupedNodes = groupedNodes.sortBy('topOffset');
      groupedNodes.forEach(function (group) {
        group.contents = group.contents.sortBy('x');
      });

      lastRowNode = groupedNodes.get('lastObject.contents.lastObject');
      fileOutputOperator = lastRowNode.contents.get('lastObject');

      g.setNode(fileOutputOperator.title, { id: fileOutputOperator.title, label: fileOutputOperator.title, isOutputNode: true });
      g.setEdge(fileOutputOperator.title, lastRowNode.id);

      groupedNodes.pushObject({
        contents: [ Ember['default'].Object.create(g.node(fileOutputOperator.title)) ]
      });

      lastRowNode.contents.removeObject(fileOutputOperator);

      this.set('verticesGroups', groupedNodes);

      return this;
    },

    renderEdges: function () {
      var self = this;
      var g = this.get('graph');

      Ember['default'].run.later(function () {
        g.edges().forEach(function (value) {
          var firstNode = self.$("[title='" + value.v + "']");
          var secondNode = self.$("[title='" + value.w + "']");

          if (firstNode && secondNode) {
            self.addEdge(firstNode[0], secondNode[0], 2, g.edge(value).type);
          }

        });
      }, 400);
    },

    renderDag: function () {
      var json = this.get('controller.json');
      var isVisualExplain = json && (json['STAGE PLANS'] != undefined) &&  (json['STAGE PLANS']['Stage-1'] != undefined) && (json['STAGE PLANS']['Stage-1']['Tez'] != undefined);
      if (isVisualExplain) {
        this.set('edges', []);

        // Create a new directed graph
        var g = this.get('graph');

        var graphData = json['STAGE PLANS']['Stage-1']['Tez'];
        var vertices = utils['default'].convertToArray(graphData['Vertices:']);
        var edges = utils['default'].convertToArray(graphData['Edges:']);

        // Set an object for the graph label
        g.setGraph({});

        // Default to assigning a new object as a label for each new edge.
        g.setDefaultEdgeLabel(function () { return {}; });

        this.setNodes(vertices)
          .setEdges(edges)
          .setTableNodesAndEdges(vertices)
          .createNodeGroups()
          .renderEdges();
      } else {

        if(!this.get('controller.noquery')) {
          $('#no-visual-explain-graph').html('Visual explain is not available.');
        }

      }

    }
  });

});
define('hive/views/visualization-ui', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

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

  exports['default'] = Ember['default'].View.extend({
    didInsertElement: function () {
      var target = this.$('#visualization');
      var panel = this.$('#visualization .panel-body').first();

      panel.css('min-height', $('.main-content').height());
      target.animate({ width: $('.main-content').width() }, 'fast');
    },

    willDestroyElement: function () {
      var target = this.$('#visualization');
      var panel = this.$('#visualization .panel-body');

      panel.css('min-height', 0);
      target.css('width', 0);
    }
  });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('hive/config/environment', ['ember'], function(Ember) {
  var prefix = 'hive';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("hive/tests/test-helper");
} else {
  require("hive/app")["default"].create({"LOG_ACTIVE_GENERATION":true,"LOG_VIEW_LOOKUPS":true});
}

/* jshint ignore:end */
//# sourceMappingURL=hive.map