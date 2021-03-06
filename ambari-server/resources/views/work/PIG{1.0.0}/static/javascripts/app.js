(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
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

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
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

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("app", function(exports, require, module) {
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

// Application bootstrapper
module.exports = Em.Application.create({
  //LOG_TRANSITIONS: true, 
  //LOG_TRANSITIONS_INTERNAL: true
  smokeTests: false,

  errorLog: "",

  getNamespaceUrl: function() {
    var parts = window.location.pathname.match(/\/[^\/]*/g);
    var view = parts[1];
    var version = '/versions' + parts[2];
    var instance = parts[3];
    if (parts.length == 4) { // version is not present
      instance = parts[2];
      version = '';
    }
    var namespaceUrl = 'api/v1/views' + view + version + '/instances' + instance;
    return namespaceUrl;
  }
});

});

require.register("components/codeMirror", function(exports, require, module) {
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

var App = require('app');

App.CodeMirrorComponent = Ember.Component.extend({
  tagName: "textarea",
  readOnly:false,
  codeMirror:null,
  fullscreen:false,
  updateCM:function () {
    var cm = this.get('codeMirror');
    if (this.get('readOnly')) {
      cm.setValue((this.get('content.fileContent')||''));
      return cm.setOption('readOnly',true);
    }
    var cmElement = $(cm.display.wrapper);
    if (this.get('content.isFulfilled')) {
      cm.setOption('readOnly',false);
      cmElement.removeClass('inactive');
      cm.setValue((this.get('content.fileContent')||''));
      cm.markClean();
    } else {
      cm.setOption('readOnly',true);
      cmElement.addClass('inactive');
    }
  }.observes('codeMirror', 'content.isFulfilled'),
  toggleFullScreen:function () {
    Em.run.next(this,function () {
      this.get('codeMirror').setOption("fullScreen", this.get('fullscreen'));
    });
  }.observes('fullscreen'),
  didInsertElement: function() {
    var cm = CodeMirror.fromTextArea(this.get('element'),{
      lineNumbers: true,
      matchBrackets: true,
      indentUnit: 4,
      keyMap: "emacs",
      mode: "text/x-pig",
      extraKeys: {
        "Ctrl-Space": function (cm) {
          if (!cm.getOption('readOnly')) {
            cm.showHint({completeSingle:false});
          }
        },
        "F11": function(cm) {
          this.set('fullscreen',!this.get("fullscreen"));
        }.bind(this),
        "Esc": function(cm) {
          if (this.get("fullscreen")) this.set("fullscreen", false);
        }.bind(this)
      }
    });

    var updateToggle = function () {
      var addMargin = $('.CodeMirror-vscrollbar').css('display') === "block";
      var margin = $('.CodeMirror-vscrollbar').width();
      $('.fullscreen-toggle').css('right',((addMargin)?3+margin:3));
    };

    cm.on('viewportChange',updateToggle);

    $('.editor-container').resizable({
      stop:function () {
        cm.setSize(null, this.style.height);
        updateToggle();
      },
      resize: function() {
        this.getElementsByClassName('CodeMirror')[0].style.height = this.style.height;
        this.getElementsByClassName('CodeMirror-gutters')[0].style.height = this.style.height;
      },
      minHeight:218,
      handles: {'s': '#sgrip' }
    });

    this.set('codeMirror',cm);
    if (!this.get('readOnly')) {
      cm.on('keyup',function (cm, e) {
        var inp = String.fromCharCode(e.keyCode);
        if (e.type == "keyup" && /[a-zA-Z0-9-_ ]/.test(inp)) {
          cm.showHint({completeSingle:false});
        }
      });
      cm.focus();
      cm.on('change', Em.run.bind(this,this.editorDidChange));
    }
  },
  editorDidChange:function () {
    var pig_script = this.get('content');
    if (pig_script.get('isLoaded')){
      pig_script.set('fileContent',this.get('codeMirror').getValue());
      this.get('codeMirror').markClean();
    }
  },
  scriptDidChange:function () {
    if (this.get('codeMirror').isClean() && this.get('content.isDirty')) {
      this.get('codeMirror').setValue(this.get(('content.fileContent')||''));
    }
  }.observes('content.fileContent'),
  willClearRender:function () {
    this.set('fullscreen', false);
    this.get('codeMirror').toTextArea();
  }
});

});

require.register("components/helpers-data", function(exports, require, module) {
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

module.exports = [
  {
    'title':'Eval Functions',
    'helpers':[
      'AVG(%VAR%)',
      'CONCAT(%VAR1%, %VAR2%)',
      'COUNT(%VAR%)',
      'COUNT_START(%VAR%)',
      'IsEmpty(%VAR%)',
      'DIFF(%VAR1%, %VAR2%)',
      'MAX(%VAR%)',
      'MIN(%VAR%)',
      'SIZE(%VAR%)',
      'SUM(%VAR%)',
      'TOKENIZE(%VAR%, %DELIM%)'
    ]
  },
  {
    'title':'Relational Operators',
    'helpers':[
      'COGROUP %VAR% BY %VAR%',
      'CROSS %VAR1%, %VAR2%;',
      'DISTINCT %VAR%;',
      'FILTER %VAR% BY %COND%',
      'FLATTEN(%VAR%)',
      'FOREACH %DATA% GENERATE %NEW_DATA%',
      'FOREACH %DATA% {%NESTED_BLOCK%}',
      'GROUP %VAR% BY %VAR%',
      'GROUP %VAR% ALL',
      'JOIN %VAR% BY ',
      'LIMIT %VAR% %N%',
      'ORDER %VAR% BY %FIELD%',
      'SAMPLE %VAR% %SIZE%',
      'SPLIT %VAR1% INTO %VAR2% IF %EXPRESSIONS%',
      'UNION %VAR1%, %VAR2%'
    ]
  },
  {
    'title':'I/0',
    'helpers':[
      "LOAD '%FILE%';",
      'DUMP %VAR%;',
      'STORE %VAR% INTO %PATH%;'
    ]
  },
  {
    'title':'Debug',
    'helpers':[
      'EXPLAIN %VAR%;',
      'ILLUSTRATE %VAR%;',
      'DESCRIBE %VAR%;'
    ]
  },
  {
    'title':'HCatalog',
    'helpers':[
      "LOAD '%TABLE%' USING org.apache.hive.hcatalog.pig.HCatLoader();"
    ]
  },
  {
    'title':'Math',
    'helpers':[
      'ABS(%VAR%)',
      'ACOS(%VAR%)',
      'ASIN(%VAR%)',
      'ATAN(%VAR%)',
      'CBRT(%VAR%)',
      'CEIL(%VAR%)',
      'COS(%VAR%)',
      'COSH(%VAR%)',
      'EXP(%VAR%)',
      'FLOOR(%VAR%)',
      'LOG(%VAR%)',
      'LOG10(%VAR%)',
      'RANDOM(%VAR%)',
      'ROUND(%VAR%)',
      'SIN(%VAR%)',
      'SINH(%VAR%)',
      'SQRT(%VAR%)',
      'TAN(%VAR%)',
      'TANH(%VAR%)'
    ]
  },
  {
    'title':'Tuple, Bag, Map Functions',
    'helpers':[
      'TOTUPLE(%VAR%)',
      'TOBAG(%VAR%)',
      'TOMAP(%KEY%, %VALUE%)',
      'TOP(%topN%, %COLUMN%, %RELATION%)'
    ]
  },
  {
    'title':'String Functions',
    'helpers':[
      "INDEXOF(%STRING%, '%CHARACTER%', %STARTINDEX%)",
      "LAST_INDEX_OF(%STRING%, '%CHARACTER%', %STARTINDEX%)",
      "LOWER(%STRING%)",
      "REGEX_EXTRACT(%STRING%, %REGEX%, %INDEX%)",
      "REGEX_EXTRACT_ALL(%STRING%, %REGEX%)",
      "REPLACE(%STRING%, '%oldChar%', '%newChar%')",
      "STRSPLIT(%STRING%, %REGEX%, %LIMIT%)",
      "SUBSTRING(%STRING%, %STARTINDEX%, %STOPINDEX%)",
      "TRIM(%STRING%)",
      "UCFIRST(%STRING%)",
      "UPPER(%STRING%)"
    ]
  },
  {
    'title':'Macros',
    'helpers':[
      "IMPORT '%PATH_TO_MACRO%';"
    ]
  },
  {
    'title':'HBase',
    'helpers':[
      "LOAD 'hbase://%TABLE%' USING org.apache.pig.backend.hadoop.hbase.HBaseStorage('%columnList%')",
      "STORE %VAR% INTO 'hbase://%TABLE%' USING org.apache.pig.backend.hadoop.hbase.HBaseStorage('%columnList%')"
    ]
  },
  {
    'title':'Python UDF',
    'helpers':[
      "REGISTER 'python_udf.py' USING jython AS myfuncs;"
    ]
  }
]

});

;require.register("components/highlightErrors", function(exports, require, module) {
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

var App = require('app');


App.HighlightErrorsComponent = Em.Component.extend({
  text:'',
  hasErrors:false,
  lines: function () {
    var text = this.get('text')||'',
        splitted = text.split('\n'),
        lines = [],
        foundErrors = false;

    splitted.forEach(function (line) {
      if (line.match(' ERROR ')) {
        foundErrors = true;
        lines.push({error:'error',content:line});
      } else {
        lines.push({error:'',content:line});
      };
    });

    this.set('hasErrors',foundErrors);

    return lines;
  }.property('text'),
  layout:Em.Handlebars.compile('{{#each line in lines}} <pre class="{{unbound line.error}}" > {{line.content}} </pre>{{/each}}')
});

});

require.register("components/jobProgress", function(exports, require, module) {
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

var App = require('app');

App.JobProgressComponent = Em.Component.extend({
  job:null,
  classNames:['progress'],
  didInsertElement:function () {
    this.update();
  },
  update:function () {
    var progress = (!this.get('job.isTerminated'))?this.get('job.percentStatus'):100;
    this.$().find('.progress-bar').css('width',progress+'%');
  }.observes('job.percentStatus'),
  layout:Em.Handlebars.compile('<div {{bind-attr class=":progress-bar job.isTerminated:progress-bar-danger:progress-bar-success" }}role="progressbar"></div>')
});

});

require.register("components/pathInput", function(exports, require, module) {
/*
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

var App = require('app');

App.PathInputComponent = Em.TextField.extend({

  typeaheadInit:function () {
    this.$().typeahead({
      source:Em.run.bind(this,this.typeaheadSource)
    });
  }.on('didInsertElement'),

  typeaheadSource:function (query,process) {

    var adapter = this.store.adapterFor(App.File),
        url = adapter.buildURL(true, query.replace(/[^/]+$/,''));

    adapter.ajax(url, 'GET', {data:{action:'ls'}}).then(function (data) {

      var ls = data.ls.map(function(item){
          var parser = document.createElement('a');
          parser.href = item.replace(/.*?:/, "");
          return decodeURI(parser.pathname);
      });

      process(ls);
    });
  },

  typeaheadClear:function () {
    this.$().typeahead('destroy');
  }.on('willClearRender')

});

});

require.register("components/pigHelper", function(exports, require, module) {
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

var App = require('app');
var pigHelpers = require('./helpers-data');

App.PigHelperComponent = Em.Component.extend({
  layoutName: 'components/pigHelper',
  helpers: pigHelpers,
  editor: null,
  actions:{
    putToEditor:function (helper) {
      var editor = this.get('editor');
      var cursor = editor.getCursor();
      var pos = this.findPosition(helper);

      editor.replaceRange(helper, cursor, cursor);
      editor.focus();

      if (pos.length>1) {
        editor.setSelection(
          {line:cursor.line, ch:cursor.ch + pos[0]},
          {line:cursor.line, ch:cursor.ch + pos[1]+1}
        );
      }

      return false;
    }
  },
  findPosition: function (curLine){
    var pos = curLine.indexOf("%");
    var posArr = [];
    while(pos > -1) {
      posArr.push(pos);
      pos = curLine.indexOf("%", pos+1);
    }
    return posArr;
  }
});

});

require.register("components/scriptListRow", function(exports, require, module) {
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

var App = require('app');

App.ScriptListRowComponent = Em.Component.extend({
  layoutName:'components/scriptListRow',
  jobs:[],
  script:null,
  tagName:'tr',
  scriptJobs:function () {
    var scriptId = this.get('script.id');
    var scriptJobs = this.get('jobs').filter(function (job) {
      return job.get('scriptId') == scriptId;
    });
    return scriptJobs;
  }.property('jobs.content'),
  scriptJobsIds: Ember.computed.mapBy('scriptJobs', 'id'),
  currentJobId:Em.computed.max('scriptJobsIds'),
  currentJob:function () {
    var jobId = this.get('currentJobId');
    var scriptJob = this.get('scriptJobs').filter(function (job) {
      return job.get('id') == jobId;
    });
    return scriptJob.get('firstObject');
  }.property('currentJobId','scriptJobs'),
  copyAction:'copyScript',
  deleteAction:'deletescript',
  actions:{
    copyScript: function(script){
      this.sendAction('copyAction',script);
    },
    deletescript: function(script){
      this.sendAction('deleteAction',script);
    }
  }
});

});

require.register("components/tabControl", function(exports, require, module) {
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

var App = require('app');

App.TabControlComponent = Em.Component.extend({
  actions:{
    popTab:function (name){
      this.sendAction('popTab',name);
    }
  },
  tagName:'li',
  classNameBindings:['isActive:active','isJob:job','disabled:disabled'],
  disabled:function () {
    return !this.get('target');
  }.property('target'),
  isActive:function () {
    return this.get('tab') == this.get('current');
  }.property('tab','current'),
  isJob:function () {
    return !(this.get('tab') == 'history' || this.get('tab') == 'script');
  }.property('tab'),
  layout:Em.Handlebars.compile('{{yield}}{{#if isJob}}<button {{action \'popTab\' tab }} class="btn" ><i class="fa fa-close"></i></button>{{/if}}'),
  tooltip:function () {
    if (this.get('disabled')){
      this.$().tooltip({title:'The script has been deleted and is no longer available.',placement:'bottom'});
    }
  }.on('didInsertElement')
});

});

require.register("controllers/errorLog", function(exports, require, module) {
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

var App = require('app');

App.PigErrorLogController = Ember.ObjectController.extend({
  errorLog: 'No trace'
});

});

require.register("controllers/modal/confirmAway", function(exports, require, module) {
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

var App = require('app');

App.ConfirmAwayController = Ember.ObjectController.extend({
  needs:['pig'],
  buttons: [
    {
      title: Em.I18n.t('common.cancel'),
      action: "cancel",
      classBindings:[':btn',':btn-default']
    },
    {
      title: Em.I18n.t('common.discard_changes'),
      action: "option",
      classBindings:[':btn',':btn-danger']
    },
    {
      title: Em.I18n.t('common.save'),
      action: "ok",
      classBindings:[':btn',':btn-success']
    }
  ],
  waitingTransition:null,
  actions:{
    confirm:function () {
      var transition = this.get('content');
      var script = this.get('controllers.pig.activeScript');
      this.get('controllers.pig').send('saveScript',script,this.saveCallback.bind(this));
      this.set('waitingTransition',transition);
    },
    discard:function () {
      var script = this.get('controllers.pig.activeScript');
      var filePromise = script.get('pigScript');
      var transition = this.get('content');
      this.set('waitingTransition',transition);
      filePromise.then(function (file) {
        script.rollback();
        file.rollback();
        this.get('waitingTransition').retry();
      }.bind(this));
    }
  },
  saveCallback:function(response){
    this.get('waitingTransition').retry();
    this.send('showAlert', {'message':Em.I18n.t('scripts.alert.script_saved',{title: response[1].get('title')}),status:'success'});
  }
});

});

require.register("controllers/modal/confirmDelete", function(exports, require, module) {
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

var App = require('app');

App.ConfirmDeleteController = Ember.ObjectController.extend({
  needs:['pig'],
  buttons: [
    {
      title: Em.I18n.t('common.cancel'),
      action: "cancel",
      classBindings:[':btn',':btn-default']
    },
    {
      title: Em.I18n.t('common.delete'),
      action: "ok",
      classBindings:[':btn',':btn-danger']
    }
  ],
  actions:{
    confirm:function () {
      this.get('controllers.pig').send('confirmdelete',this.get('content'));
    }
  }
});

});

require.register("controllers/modal/createScript", function(exports, require, module) {
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

var App = require('app');

App.CreateScriptController = Ember.ObjectController.extend({
  needs:['pigScripts'],
  filePath:'',
  buttons: [
    {
      title: Em.I18n.t('common.cancel'),
      action: "cancel",
      classBindings:[':btn',':btn-default']
    },
    {
      title: Em.I18n.t('common.create'),
      action: "ok",
      classBindings:[':btn',':btn-success','isValid::disabled']
    }
  ],
  clearFilePath:function () {
    this.set('filePath','');
    this.set('titleErrorMessage','');
  }.observes('content'),
  actions:{
    confirm:function () {
      this.get('controllers.pigScripts').send('confirmcreate',this.get('content'),this.get('filePath'));
    },
    cancel:function (script) {
      this.get('content').deleteRecord();
    }
  },
  titleErrorMessage:'',
  clearAlert:function () {
    if (!this.get('content.isBlankTitle')) {
      this.set('titleErrorMessage','');
    }
  }.observes('content.title'),
  titleChange:function () {
    var target = this.get('targetObject');
    var message = (Ember.isBlank(target.get('content.title')))?Em.I18n.t('scripts.modal.error_empty_title'):'';

    target.set('titleErrorMessage',message);
  },
  isValid:function () {
    return !this.get('content.isBlankTitle');
  }.property('content.isBlankTitle')
});

});

require.register("controllers/modal/createUdf", function(exports, require, module) {
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

var App = require('app');

App.CreateUdfController = Ember.ObjectController.extend({
  needs:['pigUdfs'],
  buttons: [
    {
      title: Em.I18n.t('common.cancel'),
      action: "cancel",
      classBindings:[':btn',':btn-default']
    },
    {
      title: Em.I18n.t('common.create'),
      action: "ok",
      classBindings:[':btn',':btn-success','isValid::disabled']
    }
  ],
  actions:{
    confirm:function () {
      this.get('controllers.pigUdfs').send('createUdf',this.get('content'),this.get('filePath'));
    },
    cancel:function () {
      this.get('content').deleteRecord();
    }
  },
  isValid:function () {
    return !Em.isBlank(this.get('content.name')) && !Em.isBlank(this.get('content.path'));
  }.property('content.name','content.path')
});

});

require.register("controllers/modal/deleteJob", function(exports, require, module) {
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

var App = require('app');

App.DeleteJobController = Ember.ObjectController.extend({
  needs:['script'],
  buttons: [
    {
      title: Em.I18n.t('common.cancel'),
      action: "cancel",
      classBindings:[':btn',':btn-default']
    },
    {
      title: Em.I18n.t('common.delete'),
      action: "ok",
      classBindings:[':btn',':btn-danger']
    }
  ],
  actions:{
    confirm:function () {
      this.get('controllers.script').send('deleteJob',this.get('content'));
    }
  }
});

});

require.register("controllers/modal/deleteUdf", function(exports, require, module) {
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

var App = require('app');

App.DeleteUdfController = Ember.ObjectController.extend({
  needs:['pigUdfs'],
  buttons: [
    {
      title: Em.I18n.t('common.cancel'),
      action: "cancel",
      classBindings:[':btn',':btn-default']
    },
    {
      title: Em.I18n.t('common.delete'),
      action: "ok",
      classBindings:[':btn',':btn-danger']
    }
  ],
  actions:{
    confirm:function () {
      this.get('controllers.pigUdfs').send('deleteUdf',this.get('content'));
    }
  }
});

});

require.register("controllers/modal/gotoCopy", function(exports, require, module) {
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

var App = require('app');

App.GotoCopyController = Ember.ObjectController.extend({
  needs:['pig'],
  buttons: [
    {
      title: Em.I18n.t('scripts.modal.continue_editing'),
      action: "cancel",
      classBindings:[':btn',':btn-default']
    },
    {
      title: Em.I18n.t('scripts.modal.go_to_copy'),
      action: "ok",
      classBindings:[':btn',':btn-primary']
    }
  ],
  actions:{
    confirm:function () {
      this.transitionToRoute('script.edit',this.get('content.id'));
    }
  }
});

});

require.register("controllers/modal/logDownload", function(exports, require, module) {
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

var App = require('app');

App.LogDownloadController = Ember.ObjectController.extend(App.FileHandler,{
  buttons: [
    {
      title: Em.I18n.t('common.close'),
      action: "cancel",
      classBindings:[':btn',':btn-default']
    }
  ],
  jobLogsLoader:function (output) {
    var jobId = this.get('content.id');
    var url = ['jobs',jobId, 'results','stderr'].join('/');

    return this.fileProxy(url);
  }.property('content'),

  suggestedFilename: function() {
    return this.get("content.jobId").toLowerCase().replace(/\W+/g, "_") + '_logs.txt';
  }.property("content.jobId"),

  jobLogs:function () {
    return this.get('jobLogsLoader.content.fileContent');
  }.property("content","jobLogsLoader.isPending"),

  actions:{
    download:function () {
      return this.downloadFile(this.get("jobLogs"), this.get("suggestedFilename"));
    }
  }
});

});

require.register("controllers/modal/pigModal", function(exports, require, module) {
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

var App = require('app');

App.PigModalComponent = Ember.Component.extend({
  didClose:'removeModal',
  size:'',
  buttons:Em.computed.alias('targetObject.buttons'),
  isValid:Em.computed.alias('targetObject.isValid'),
  buttonViews:function () {
    var data = this.get('buttons') || [];
    var views = [];

    data.forEach(function (btn) {
      views.push(Em.Component.extend({
        tagName:'button',
        title:btn.title,
        action:btn.action,
        click:function () {
          this.sendAction();
        },
        classNameBindings: btn.classBindings,
        layout:Em.Handlebars.compile('{{view.title}}')
      }));
    });

    return views;
  }.property('buttons'),
  large:function () {
    return this.get('size') =='lg';
  }.property('size'),
  small:function () {
    return this.get('size') =='sm';
  }.property('size'),
  layoutName:'modal/modalLayout',
  actions: {
    ok: function() {
      this.$('.modal').modal('hide');
      this.sendAction('ok');
    },
    cancel:function () {
      this.$('.modal').modal('hide');
      this.sendAction('close');
    },
    option:function () {
      this.$('.modal').modal('hide');
      this.sendAction('option');
    }
  },
  keyUp:function (e) {
    if (e.keyCode == 27) {
      return this.sendAction('close');
    }
  },
  keyDown:function (e) {
    if (e.keyCode == 13 && this.get('targetObject.isValid')) {
      this.$('.modal').modal('hide');
      return this.sendAction('ok');
    }
  },
  show: function() {
    var modal = this.$('.modal').modal();
    modal.off('hidden.bs.modal');
    modal.off('shown.bs.modal');
    modal.on('shown.bs.modal',function () {
      this.find('input').first().focus();
    }.bind(modal));
    modal.on('hidden.bs.modal', function() {
      this.sendAction('didClose');
    }.bind(this));
  }.on('didInsertElement')
});

});

require.register("controllers/modal/resultsDownload", function(exports, require, module) {
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

var App = require('app');

App.ResultsDownloadController = Ember.ObjectController.extend(App.FileHandler,{
  buttons: [
    {
      title: Em.I18n.t('common.close'),
      action: "cancel",
      classBindings:[':btn',':btn-default']
    }
  ],
  jobResultsLoader:function (output) {
    var jobId = this.get('content.id');
    var url = ['jobs',jobId, 'results','stdout'].join('/');

    return this.fileProxy(url);
  }.property('content'),

  suggestedFilename: function() {
    return this.get("content.jobId").toLowerCase().replace(/\W+/g, "_") + '_results.txt';
  }.property("content.jobId"),

  jobResults:function () {
    return this.get('jobResultsLoader.content.fileContent');
  }.property("content","jobResultsLoader.isPending"),

  actions:{
    download:function () {
      return this.downloadFile(this.get("jobResults"), this.get("suggestedFilename"));
    }
  }
});

});

require.register("controllers/page", function(exports, require, module) {
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

var App = require('app');

App.PageController = Ember.ObjectController.extend({
  currentPage: Ember.computed.alias('parentController.page'),

  isActive:function() {
    return this.get('number') === this.get('currentPage');
  }.property('number', 'currentPage')
});

});

require.register("controllers/pig", function(exports, require, module) {
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

var App = require('app');

App.PigController = Em.ArrayController.extend({
  needs:['scriptEdit'],
  category: 'scripts',
  navs: [
    {name:'scripts',url:'pig',label: Em.I18n.t('scripts.scripts'),icon:'fa-file-code-o'},
    {name:'udfs',url:'pig.udfs',label:Em.I18n.t('udfs.udfs'),icon:'fa-plug'},
    {name:'history',url:'pig.history',label:Em.I18n.t('common.history'),icon:'fa-clock-o'}
  ],
  actions:{
    closeScript:function () {
      this.transitionToRoute('pig');
    },
    saveScript: function (script,onSuccessCallback) {
      return script.get('pigScript').then(function (file){
        return Ember.RSVP.all([file.save(),script.save()]);
      }).then(onSuccessCallback || Em.run.bind(this,'saveScriptSuccess'), Em.run.bind(this,'saveScriptFailed'));
    },
    deletescript:function (script) {
      return this.send('openModal','confirmDelete',script);
    },
    confirmdelete:function (script) {
      script.deleteRecord();
      return script.save().then(Em.run.bind(this,'deleteScriptSuccess'),Em.run.bind(this,'deleteScriptFailed'));
    },
    copyScript:function (script) {
      var newScript = this.store.createRecord('script',{
        title:script.get('title')+' (copy)',
        templetonArguments:script.get('templetonArguments')
      });
      newScript.save().then(function (savedScript) {
        return Em.RSVP.all([savedScript.get('pigScript'),script.get('pigScript.fileContent')]);
      }).then(function (data) {
        return data.objectAt(0).set('fileContent',data.objectAt(1)).save();
      }).then(function () {
        this.send('showAlert', {'message':script.get('title') + ' is copied.',status:'success'});
        if (this.get('activeScript')) {
          this.send('openModal','gotoCopy',newScript);
        }
      }.bind(this));
    }
  },

  activeScriptId:null,

  disableScriptControls:Em.computed.alias('controllers.scriptEdit.isRenaming'),

  activeScript:function () {
    return (this.get('activeScriptId'))?this.get('content').findBy('id',this.get('activeScriptId').toString()):null;
  }.property('activeScriptId',"content.[]"),

  /*
   *Is script or script file is dirty.
   * @return {boolean}
   */
  scriptDirty:function () {
    return this.get('activeScript.isDirty') || this.get('activeScript.pigScript.isDirty');
  }.property('activeScript.pigScript.isDirty','activeScript.isDirty'),

  saveEnabled:function () {
    return this.get('scriptDirty') && !this.get('disableScriptControls');
  }.property('scriptDirty','disableScriptControls'),

  saveScriptSuccess: function (script) {
    this.send('showAlert', {
      'message': Em.I18n.t('scripts.alert.script_saved', { 'title' : script.get('title') } ),
      'status': 'success'
    });
  },

  saveScriptFailed: function (error) {
    this.send('showAlert', {
      'message': Em.I18n.t('scripts.alert.save_error'),
      'status': 'error',
      'trace': (error && error.responseJSON.trace) ? error.responseJSON.trace : null
    });
  },

  deleteScriptSuccess: function (script) {
    this.transitionToRoute('pig.scripts');
    this.send('showAlert', {
      'message': Em.I18n.t('scripts.alert.script_deleted', { 'title': script.get('title') } ),
      'status': 'success'
    });
  },

  deleteScriptFailed: function (error) {
    this.send('showAlert', {
      'message': Em.I18n.t('scripts.alert.delete_failed'),
      'status': 'error',
      'trace': (error && error.responseJSON.trace) ? error.responseJSON.trace : null
    });
  }
});

});

require.register("controllers/pigAlert", function(exports, require, module) {
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

var App = require('app');

App.PigAlertController = Ember.ArrayController.extend({
  needs: ['pigErrorLog'],
  actions:{
    removeAlertObject:function (alert) {
      this.get('content').removeObject(alert);
    },
    showErrorLog:function (context) {
      this.set('controllers.pigErrorLog.errorLog',context.trace);
      this.transitionToRoute('pig.errorLog');
    }
  }
});

});

require.register("controllers/pigHistory", function(exports, require, module) {
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

var App = require('app');

App.PigHistoryController = Em.ArrayController.extend(App.Pagination,{
  needs:['pig'],
  sortProperties: ['dateStarted'],
  sortAscending: false,
  scriptIds:Em.computed.mapBy('controllers.pig.content','id'),
  actions:{
    logsPopup:function (job) {
      this.send('openModal','logDownload',job);
    },
    resultsPopup:function (job) {
      this.send('openModal','resultsDownload',job);
    },
    goToScript:function (id) {
      this.transitionToRoute('script.edit',id);
    },
    deleteJob:function (job) {
      this.send('openModal','deleteJob',job);
    }
  }
});

});

require.register("controllers/pigScripts", function(exports, require, module) {
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

var App = require('app');

App.PigScriptsController = Em.ArrayController.extend(App.Pagination,{
  sortProperties: ['dateCreatedUnix'],
  sortAscending: false,
  needs:['pig'],
  actions:{
    createScript:function () {
      return this.send('openModal', 'createScript', this.store.createRecord('script'));
    },
    confirmcreate:function (script,filePath) {
      if (filePath) {
        return Em.RSVP.Promise.all([Em.RSVP.resolve(script), this.getOrCreateFile(filePath)])
          .then(this.setFileAndSave.bind(this), Em.run.bind(this,'createScriptError', script));
      } else {
        script.save().then(this.createScriptSuccess.bind(this), Em.run.bind(this,'createScriptError',script));
      }
    },
    deletescript:function (script) {
      this.get('controllers.pig').send('deletescript',script);
    },
    copyScript:function (script) {
      this.get('controllers.pig').send('copyScript',script);
    }
  },

  getOrCreateFile: function (path) {
    var store = this.get('store');

    return new Em.RSVP.Promise(function (resolve, reject) {
      store.find('file',path).then(function (file) {
          resolve(file);
        }, function (error) {
          if (error.status === 404) {
            var newFile = store.createRecord('file',{
              id:path,
              fileContent:''
            });

            newFile.save().then(function (file) {
              resolve(file);
            }, function (error) {
              reject(error);
            });
          } else {
            reject(error);
          }
        });
    });
  },

  setFileAndSave: function (data) {
    var script = data.objectAt(0),
        file = data.objectAt(1);

    var pr = script.set('pigScript',file).save();

    return pr.then(this.createScriptSuccess.bind(this),Em.run.bind(this,'createScriptError',script));
  },

  createScriptSuccess:function (script) {
    this.transitionToRoute('script.edit',script);
    this.send('showAlert', {
      'message': Em.I18n.t('scripts.alert.script_created', { 'title' : script.get('title') } ),
      'status': 'success'
    });
  },

  createScriptError: function (script, error) {
    script.deleteRecord();
    this.send('showAlert', {
      'message': Em.I18n.t('scripts.alert.create_failed'),
      'status': 'error',
      'trace': (error.responseJSON) ? error.responseJSON.trace : error.message
    });
  },

  jobs:function () {
    return this.store.find('job');
  }.property()
});

});

require.register("controllers/pigUdfs", function(exports, require, module) {
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

var App = require('app');

App.PigUdfsController = Em.ArrayController.extend(App.Pagination,{
  actions:{
    createUdfModal:function () {
      return this.send('openModal','createUdf',this.store.createRecord('udf'));
    },
    createUdf:function (udf) {
      return udf.save().then(this.onCreateSuccess.bind(this),this.onCreateFail.bind(this));
    },
    deleteUdfModal:function(udf){
      return this.send('openModal','deleteUdf',udf);
    },
    deleteUdf:function(udf){
      udf.deleteRecord();
      return udf.save().then(this.onDeleteSuccess.bind(this),this.onDeleteFail.bind(this));
    }
  },
  onCreateSuccess:function (model) {
    this.send('showAlert', {
      message: Em.I18n.t('udfs.alert.udf_created',{name : model.get('name')}),
      status:'success'
    });
  },
  onCreateFail:function (error) {
    var trace = (error && error.responseJSON.trace)?error.responseJSON.trace:null;
    this.send('showAlert', {
      message:Em.I18n.t('udfs.alert.create_failed'),
      status:'error',
      trace:trace
    });
  },
  onDeleteSuccess: function(model){
    this.send('showAlert', {
      message: Em.I18n.t('udfs.alert.udf_deleted',{name : model.get('name')}),
      status:'success'
    });
  },
  onDeleteFail:function(error){
    var trace = (error && error.responseJSON.trace)?error.responseJSON.trace:null;
    this.send('showAlert', {
      message: Em.I18n.t('udfs.alert.delete_failed'),
      status:'error',
      trace:trace
    });
  }
});

});

require.register("controllers/script", function(exports, require, module) {
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

var App = require('app');

App.ScriptController = Em.ObjectController.extend({
  init: function(){
    this.pollster.set('target',this);
    this._super();
  },
  actions :{
    deactivateJob:function (jobId) {
      var rejected = this.get('activeJobs').rejectBy('id',jobId);
      this.set('activeJobs',rejected);
      if (!this.get('controllers.pig.activeScript')) {
        this.transitionToRoute('pig.history');
      }
      else if (this.get('activeTab') == jobId) {
        this.transitionToRoute('script.edit',this.get('controllers.pig.activeScript.id'));
      }
    },
    deleteJob:function (job) {
      job.deleteRecord();
      job.save().then(this.deleteJobSuccess.bind(this),Em.run.bind(this,this.deleteJobFailed,job));
      this.get('activeJobs').removeObject(job);
    }
  },

  deleteJobSuccess:function (data) {
    this.send('showAlert', {message:Em.I18n.t('job.alert.job_deleted'),status:'info'});
  },
  deleteJobFailed:function (job,error) {
    var trace = (error.responseJSON)?error.responseJSON.trace:null;
    job.rollback();
    this.send('showAlert', {message:Em.I18n.t('job.alert.delete_filed'),status:'error',trace:trace});
  },

  needs:['pig'],

  activeTab: 'script',

  isScript:true,

  activeJobs:Em.A(),
  activeJobsIds:Em.computed.mapBy('activeJobs','id'),
  activeScriptId:Em.computed.alias('controllers.pig.activeScript.id'),

  staticTabs:function () {
    return [
      {label:'Script',name:'script',url:'script.edit',target:this.get('activeScriptId')},
      {label:'History',name:'history',url:'script.history',target:this.get('activeScriptId')}
    ];
  }.property('activeScriptId'),


  jobTabs:function () {
    var jobTabs = [];
    this.get('activeJobs').forEach(function (job) {
      jobTabs.push({
        label:job.get('title') + ' - ' + job.get('status').decamelize().capitalize(),
        name:job.get('id'),
        url:'script.job',
        target:job.get('id')
      });
    });
    return jobTabs;
  }.property('activeJobs.[]','activeJobs.@each.status'),

  tabs:Em.computed.union('staticTabs','jobTabs'),

  pollster:Em.Object.createWithMixins(Ember.ActionHandler,{
    jobs:[],
    timer:null,
    start: function(jobs){
      this.stop();
      this.set('jobs',jobs);
      this.onPoll();
    },
    stop: function(){
      Em.run.cancel(this.get('timer'));
    },
    onPoll: function() {
      this.get('jobs').forEach(function (job) {
        if (job.get('jobInProgress')) {
          job.reload().catch(function (error) {
            this.send('showAlert',{
              message:Em.I18n.t('job.alert.delete_filed'),
              status:'error',
              trace:(error.responseJSON)?error.responseJSON.trace:null
            });
            this.jobs.removeObject(job);
          }.bind(this));
        } else {
          this.jobs.removeObject(job);
        }
      }.bind(this));

      if (this.get('jobs.length') > 0) {
        this.set('timer', Ember.run.later(this, function() {
          this.onPoll();
        }, 10000));
      }
    }
  }),

  pollingWatcher:function () {
    var pollster = this.get('pollster');
    if (this.get('activeJobs.length') > 0) {
      pollster.start(this.get('activeJobs').copy());
    } else {
      pollster.stop();
    }
  }.observes('activeJobs.@each'),

  activeJobsWatcher:function () {
    if (this.get('activeJobs.firstObject.scriptId') != this.get('controllers.pig.activeScriptId')) {
      this.set('activeJobs',[]);
    }
  }.observes('controllers.pig.activeScriptId')
});

});

require.register("controllers/scriptEdit", function(exports, require, module) {
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

var App = require('app');

App.ScriptEditController = Em.ObjectController.extend({
  needs:['script'],
  pigParams: Em.A(),
  isExec:false,
  isRenaming:false,
  titleWarn:false,
  tmpArgument:'',
  editor:null,
  fullscreen:false,

  handleRenaming:function () {
    if (this.get('content.title')) {
      this.set('titleWarn',false);
    }
  }.observes('content.title','isRenaming'),

  pigParamsMatch:function (controller) {
    var editorContent = this.get('content.pigScript.fileContent');
    if (editorContent) {
      var match_var = editorContent.match(/\%\w+\%/g);
      if (match_var) {
        var oldParams = controller.get('pigParams');
        controller.set('pigParams',[]);
        match_var.forEach(function (param) {
          var suchParams = controller.pigParams.filterProperty('param',param);
          if (suchParams.length == 0){
            var oldParam = oldParams.filterProperty('param',param);
            var oldValue = oldParam.get('firstObject.value');
            controller.pigParams.pushObject(Em.Object.create({param:param,value:oldValue,title:param.replace(/%/g,'')}));
          }
        });
      } else {
        controller.set('pigParams',[]);
      }
    } else {
      controller.set('pigParams',[]);
    }
  }.observes('content.pigScript.fileContent','content.id'),


  oldTitle:'',
  actions: {
    rename:function (opt) {
      var changedAttributes = this.get('content').changedAttributes();

      if (opt === 'ask') {
        this.setProperties({'oldTitle':this.get('content.title'),'isRenaming':true});
      }

      if (opt === 'cancel') {
        this.setProperties({'content.title':this.get('oldTitle'),'isRenaming':false,'oldTitle':''});
      }

      if (opt === this.get('content.title') && !Em.isBlank(this.get('content.title'))) {
        if (Em.isArray(changedAttributes.title)) {
          this.get('content').save().then(function () {
            this.send('showAlert', {message:Em.I18n.t('editor.title_updated'),status:'success'});
          }.bind(this));
        }
        this.setProperties({'oldTitle':'','isRenaming':false});
      }
    },
    addArgument:function (arg) {
      var settled = this.get('content.argumentsArray');
      if (!arg) {
        return false;
      }
      if (!settled.contains(arg)) {
        this.setProperties({'content.argumentsArray': settled.pushObject(arg) && settled,'tmpArgument':''});
      } else {
        this.send('showAlert', {'message': Em.I18n.t('scripts.alert.arg_present'), status:'info'});
      }
    },
    removeArgument:function (arg) {
      this.set('content.argumentsArray',this.get('content.argumentsArray').removeObject(arg));
    },
    execute: function (script, operation) {
      this.set('isExec',true);

      return Ember.RSVP.resolve(script.get('pigScript'))
        .then(function (file) {
          return Ember.RSVP.all([file.save(),script.save()]);
        })
        .then(function (data) {
          return this.prepareJob(operation,data);
        }.bind(this))
        .then(this.executeSuccess.bind(this), this.executeError.bind(this))
        .finally(Em.run.bind(this,this.set,'isExec',false));
    },
    toggleTez:function () {
      this.toggleProperty('executeOnTez');
    },
    fullscreen:function () {
      this.toggleProperty('fullscreen');
    }
  },

  executeSuccess:function (job) {
    this.send('showAlert', {message:Em.I18n.t('job.alert.job_started'),status:'success'});
    if (this.target.isActive('script.edit')) {
      Em.run.next(this,this.transitionToRoute,'script.job',job);
    }
  },

  executeError:function (error) {
    var trace = (error.responseJSON)?error.responseJSON.trace:null;
    this.send('showAlert', {message:Em.I18n.t('job.alert.start_filed'),status:'error',trace:trace});
  },

  executeOnTez:false,

  prepareJob:function (type, data) {
    var job, promise,
        exc = 'execute' == type,
        exp = 'explain' == type,
        chk = 'syntax_check' == type,
        file = data[0],
        script = data[1],
        pigParams = this.get('pigParams') || [],
        fileContent = file.get('fileContent'),
        args = script.get('templetonArguments'),
        title = script.get('title'),
        hasParams = pigParams.length > 0;

    pigParams.forEach(function (param) {
      var rgParam = new RegExp(param.param,'g');
      fileContent = fileContent.replace(rgParam,param.value);
    });

    if (this.get('executeOnTez') && args.indexOf('-x\ttez') < 0) {
      args = args + (args ? "\t" : "") + '-x\ttez';
    }

    job = this.store.createRecord('job', {

      /**
       * Link to script.
       * @type {String}
       */
      scriptId:script.get('id'),

      /**
       * Add '-check' argument for syntax check and remove all arguments for explain.
       * @type {String}
       */
      templetonArguments:(exc)?args:(chk)?(!args.match(/-check/g))?args+(args?"\t":"")+'-check':args:'',

      /**
       * Modify title for syntax check and operations.
       * @type {String}
       */
      title:(exc)?title:(chk)?'Syntax check: "%@"'.fmt(title):'Explain: "%@"'.fmt(title),

      /**
       * If the script has parameters, set this value to script with replaced ones.
       * And if operations is explain, set it to reference to sourceFile.
       * @type {String}
       */
      forcedContent:(exp)?'explain -script ${sourceFile}':(hasParams)?fileContent:null,

      /**
       * If other, than execute, need to set job type.
       * @type {String}
       */
      jobType:(!exc)?type:null,

      /**
       * If execute of syntax_check without params, just set App.File instance.
       * @type {App.File}
       */
      pigScript:(!exp && !hasParams)?file:null,

      /**
       * For explain job type need sourceFile ...
       * @type {String}
       */
      sourceFile:(exp && !hasParams)?file.get('id'):null,

      /**
       * ... or sourceFileContent if script has parameters.
       * @type {String}
       */
      sourceFileContent:(exp && hasParams)?fileContent:null
    });

    promise = job.save();

    Em.run.next(promise, promise.catch, Em.run.bind(job,job.deleteRecord));

    return promise;
  },

  /**
   * available UDFs
   * @return {App.Udf} promise
   */
  ufdsList:function () {
    return this.store.find('udf');
  }.property('udf')
});

});

require.register("controllers/scriptHistory", function(exports, require, module) {
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

var App = require('app');

App.ScriptHistoryController = Em.ArrayController.extend(App.Pagination,{
  sortProperties: ['dateStarted'],
  sortAscending: false,
  actions:{
    logsPopup:function (job) {
      this.send('openModal','logDownload',job);
    },
    resultsPopup:function (job) {
      this.send('openModal','resultsDownload',job);
    },
    deleteJob:function (job) {
      this.send('openModal','deleteJob',job);
    }
  }
});

});

require.register("controllers/scriptJob", function(exports, require, module) {
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

var App = require('app');

App.ScriptJobController = Em.ObjectController.extend(App.FileHandler,{
  fullscreen:false,
  scriptContents:function () {
    var job = this.get('content'),
        controller = this,
        promise = new Ember.RSVP.Promise(function (resolve,reject){
          var file = (job.get('jobType') !== 'explain') ? job.get('pigScript') : job.store.find('file',[job.get('statusDir'),'source.pig'].join('/'));

          return file.then(function (data) {
            resolve(data);
          },function (error) {
            var response = (error.responseJSON)?error.responseJSON:{};
            reject(response.message);
            if (error.status != 404) {
              controller.send('showAlert', {'message': Em.I18n.t('job.alert.promise_error',
                {status:response.status, message:response.message}), status:'error', trace: response.trace});
            }
          });
        });
    return Ember.ObjectProxy.extend(Ember.PromiseProxyMixin).create({
      promise: promise
    });
  }.property('content'),



  jobResultsHidden:true,

  jobResults:function (output) {
    var jobId = this.get('content.id');
    var url = ['jobs', jobId, 'results', 'stdout'].join('/');

    return this.fileProxy(url);
  }.property('content'),

  showJobResults:function () {
    if (!Em.isEmpty(this.get('jobResults.content.fileContent'))) {
      this.set('jobResultsHidden',false);
    }
  }.observes('jobResults.content.fileContent'),

  jobLogsHidden:true,

  jobLogs:function (output) {
    var jobId = this.get('content.id');
    var url = ['jobs', jobId, 'results', 'stderr'].join('/');

    return this.fileProxy(url);
  }.property('content'),

  showJobLogs:function () {
    if (!Em.isEmpty(this.get('jobLogs.content.fileContent')) && this.get('jobResults.isFulfilled') && Em.isEmpty(this.get('jobResults.content.fileContent'))) {
      this.set('jobLogsHidden',false);
    }
  }.observes('jobLogs.content.fileContent','jobResults.isFulfilled','jobResults.content.fileContent'),

  hasErrorInLogs:false,

  resetLogsErrors:function () {
    if (this.get('jobLogs.isPending')) this.set('hasErrorInLogs',false);
  }.observes('jobLogs.isPending'),

  suggestedFilenamePrefix: function() {
    return this.get("content.jobId").toLowerCase().replace(/\W+/g, "_");
  }.property("content.jobId"),

  reloadOutputs: function(){
    Em.run.later(this,function () {
      if (this.get('content.jobInProgress')) {
        Em.run.debounce(this,'notifyPropertyChange','content',5000);
      };
    },10000);
   }.observes('content'),

  actions:{
    download:function (opt) {
      var file = (opt == 'results')?'jobResults.content.fileContent':'jobLogs.content.fileContent';
      var suffix = (opt == 'results')?'_results.txt':'_logs.txt';
      return this.downloadFile(this.get(file), this.get("suggestedFilenamePrefix")+suffix);
    },
    fullscreen:function () {
      this.toggleProperty('fullscreen');
    }
  }
});

});

require.register("controllers/splash", function(exports, require, module) {
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

var App = require('app');

App.SplashController = Ember.ObjectController.extend({
  actions: {
    toggleStackTrace:function () {
      var value = this.get('isExpanded');
      this.set('isExpanded', !value);
    }
  },
  isExpanded: false,

  errors: "",
  stackTrace: "",
  startTests: function(model) {
    var url = App.getNamespaceUrl() + '/resources/pig/help/';
    var self = this;
    var processResponse = function(name, data) {
      model.set(name + 'Test', data.status == 200);

      if (data.status != 200) {
        var checkFailedMessage = "Service '" + name + "' check failed";
        var errors = self.get("errors");
        errors += checkFailedMessage;
        errors += (data.message)?(': <i>' + data.message + '</i><br>'):'<br>';
        self.set("errors", errors);
      }

      if (data.trace != null) {
        var stackTrace = self.get("stackTrace");
        stackTrace += checkFailedMessage + ':\n' + data.trace;
        self.set("stackTrace", stackTrace);
      }
      model.set(name + 'TestDone', true);
      var percent = model.get('percent');
      model.set('percent', percent + 33.33);
    };
    var promises = ['storage', 'webhcat', 'hdfs'].map(function(name) {
      return Ember.$.getJSON('/' + url + name + 'Status')
               .then(
                 function(data) {
                   processResponse(name, data);
                 },
                 function(reason) {
                   processResponse(name, reason.responseJSON);
                 }
               );
    });

    return Ember.RSVP.all(promises);
  },
  progressBarStyle: function() {
    return 'width: ' + this.get("model").get("percent") + '%;';
  }.property("model.percent")
});

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

window.App = require('app');

App.ApplicationAdapter = DS.RESTAdapter.extend({
  namespace: App.getNamespaceUrl(),
  headers: {
   'X-Requested-By': 'ambari'
  }
});

App.FileAdapter = App.ApplicationAdapter.extend({
  pathForType: function() {
    return 'resources/file';
  }
});

App.JobAdapter = App.ApplicationAdapter.extend({
  deleteRecord: function (store, type, record)  {
    var id = record.get('id');
    return this.ajax(this.buildURL(type.typeKey, id)+ '?remove=true', "DELETE");
  }
});

App.JobSerializer = DS.RESTSerializer.extend({
  normalizeHash: {
    jobs: function(hash) {
      delete hash.inProgress;
      return hash;
    },
    job: function(hash) {
      delete hash.inProgress;
      return hash;
    }
  }
});

App.FileSerializer = DS.RESTSerializer.extend({
  primaryKey:'filePath'
});

App.IsodateTransform = DS.Transform.extend({
  deserialize: function (serialized) {
    if (serialized) {
      return moment.unix(serialized).toDate();
    }
    return serialized;
  },
  serialize: function (deserialized) {
    if (deserialized) {
      return moment(deserialized).format('X');
    }
    return deserialized;
  }
});

App.FileSaver = Ember.Object.extend({
  save: function(fileContents, mimeType, filename) {
    window.saveAs(new Blob([fileContents], {type: mimeType}), filename);
  }
});

App.register('lib:fileSaver', App.FileSaver);



Ember.Handlebars.registerBoundHelper('showDate', function(date,format) {
  return moment(date).format(format);
});

Em.TextField.reopen(Em.I18n.TranslateableAttributes);

require('translations');
require('router');


// mixins
require("mixins/fileHandler");
require("mixins/pagination");
require("mixins/routeError");

//routes
require("routes/pig");
require("routes/pigHistory");
require("routes/pigScripts");
require("routes/pigUdfs");
require("routes/script");
require("routes/scriptEdit");
require("routes/scriptHistory");
require("routes/scriptJob");
require("routes/splash");

//models
require("models/file");
require("models/pig_job");
require("models/pig_script");
require("models/udf");

//views
require("views/pig");
require("views/pig/alert");
require("views/pig/history");
require("views/pig/loading");
require("views/pig/scripts");
require("views/pig/udfs");
require("views/script/edit");
require("views/script/job");

//controllers
require("controllers/errorLog");
require("controllers/modal/confirmAway");
require("controllers/modal/confirmDelete");
require("controllers/modal/deleteJob");
require("controllers/modal/deleteUdf");
require("controllers/modal/createScript");
require("controllers/modal/createUdf");
require("controllers/modal/gotoCopy");
require("controllers/modal/logDownload");
require("controllers/modal/pigModal");
require("controllers/modal/resultsDownload");
require("controllers/page");
require("controllers/pig");
require("controllers/pigAlert");
require("controllers/pigHistory");
require("controllers/pigScripts");
require("controllers/pigUdfs");
require("controllers/script");
require("controllers/scriptEdit");
require("controllers/scriptHistory");
require("controllers/scriptJob");
require("controllers/splash");

//templates
require("templates/application");
require("templates/components/pigHelper");
require("templates/components/scriptListRow");
require("templates/loading");
require("templates/modal/confirmAway");
require("templates/modal/confirmDelete");
require("templates/modal/createScript");
require("templates/modal/deleteJob");
require("templates/modal/deleteUdf");
require("templates/modal/createUdf");
require("templates/modal/gotoCopy");
require("templates/modal/logDownload");
require("templates/modal/modalLayout");
require("templates/modal/resultsDownload");
require("templates/partials/alert-content");
require("templates/partials/paginationControls");
require("templates/pig");
require("templates/pig/alert");
require("templates/pig/errorLog");
require("templates/pig/history");
require("templates/pig/loading");
require("templates/pig/scripts");
require("templates/pig/udfs");
require("templates/script");
require("templates/script/edit");
require("templates/script/history");
require("templates/script/job");
require("templates/splash");
require('templates/error');

//components
require("components/codeMirror");
require("components/helpers-data");
require("components/jobProgress");
require("components/pigHelper");
require("components/scriptListRow");
require("components/tabControl");
require("components/pathInput");
require("components/highlightErrors");

});

require.register("mixins/fileHandler", function(exports, require, module) {
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

var App = require('app');

var _promise = function (controller, url, output) {
  return new Ember.RSVP.Promise(function(resolve,reject){
    return Em.$.getJSON(url).then(function (data) {
      resolve(data.file);
    },function (error) {
      var response = (error.responseJSON)?error.responseJSON:{};
      reject(response.message);
      if (error.status != 404) {
        controller.send('showAlert', {'message': Em.I18n.t('job.alert.promise_error',
          {status:response.status, message:response.message}), status:'error', trace: response.trace});
      }
    });
  });
};

App.FileHandler = Ember.Mixin.create({
  fileProxy:function (url) {
    var promise,
        host = this.store.adapterFor('application').get('host'),
        namespace = this.store.adapterFor('application').get('namespace');

    url = [host, namespace, url].join('/');
    promise = _promise(this, url,'stdout');

    return Ember.ObjectProxy.extend(Ember.PromiseProxyMixin).create({
      promise: promise
    });
  },
  downloadFile:function (file,saveAs) {
    return this.fileSaver.save(file, "application/json", saveAs);
  }
});

App.inject('controller', 'fileSaver', 'lib:fileSaver');

});

require.register("mixins/pagination", function(exports, require, module) {
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

var App = require('app');

App.Pagination = Ember.Mixin.create({
  actions:{
    selectPage: function(number) {
      this.set('page', number);
    },

    toggleOrder: function() {
      this.toggleProperty('sortAscending');
    }
  },

  page: 1,

  perPage: 10,

  perPageOptions:[10,25,50,100],

  pageWatcher:function () {
    if (this.get('page') > this.get('totalPages')) {
      this.set('page',this.get('totalPages') || 1);
    }
  }.observes('totalPages'),

  totalPages: function() {
    return Math.ceil(this.get('length') / this.get('perPage'));
  }.property('length', 'perPage'),

  pages: function() {
    var collection = Ember.A();

    for(var i = 0; i < this.get('totalPages'); i++) {
      collection.pushObject(Ember.Object.create({
        number: i + 1
      }));
    }

    return collection;
  }.property('totalPages'),

  hasPages: function() {
    return this.get('totalPages') > 1;
  }.property('totalPages'),

  prevPage: function() {
    var page = this.get('page');
    var totalPages = this.get('totalPages');

    if(page > 1 && totalPages > 1) {
      return page - 1;
    } else {
      return null;
    }
  }.property('page', 'totalPages'),

  nextPage: function() {
    var page = this.get('page');
    var totalPages = this.get('totalPages');

    if(page < totalPages && totalPages > 1) {
      return page + 1;
    } else {
      return null;
    }
  }.property('page', 'totalPages'),


  paginatedContent: function() {
    var start = (this.get('page') - 1) * this.get('perPage');
    var end = start + this.get('perPage');

    return this.get('arrangedContent').slice(start, end);
  }.property('page', 'totalPages', 'arrangedContent.[]'),

  paginationInfo: function () {
    var start = (this.get('page') - 1) * this.get('perPage') + 1;
    var end = start + this.get('paginatedContent.length') - 1;
    return start + ' - ' + end + ' of ' + this.get('arrangedContent.length');
  }.property('page', 'arrangedContent.length', 'perPage')
});

});

require.register("mixins/routeError", function(exports, require, module) {
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

var App = require('app');

App.RouteError = Ember.Mixin.create({
  errorMassage:'',
  actions:{
    error:function (error) {
      this.controllerFor('pig').set('category','');
      var trace = (error.hasOwnProperty('responseJSON'))?error.responseJSON.trace:null;
      this.send('showAlert', {message:this.get('errorMassage'), status:'error', trace:trace});
    }
  }
});

});

require.register("models/file", function(exports, require, module) {
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

var App = require('app');

App.File = DS.Model.extend({
  fileContent: DS.attr('string'),
  hasNext:DS.attr('boolean'),
  page:DS.attr('number'),
  pageCount:DS.attr('number')
});

});

require.register("models/pig_job", function(exports, require, module) {
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

var App = require('app');

App.Job = DS.Model.extend({
  pigScript:DS.belongsTo('file', { async: true }),
  //pythonScript:DS.belongsTo('script'),
  scriptId: DS.attr('number'),
  title: DS.attr('string'),
  templetonArguments:DS.attr('string'),
  owner: DS.attr('string'),
  forcedContent:DS.attr('string'),
  duration: DS.attr('number'),
  durationTime:function () {
    return moment.duration(this.get('duration'), "seconds").format("h [hrs], m [min], s [sec]");
  }.property('duration'),

  sourceFile:DS.attr('string'),
  sourceFileContent:DS.attr('string'),

  statusDir: DS.attr('string'),
  status: DS.attr('string'),
  dateStarted:DS.attr('isodate'),
  jobId: DS.attr('string'),
  jobType: DS.attr('string'),
  percentComplete: DS.attr('number'),
  percentStatus:function () {
    if (this.get('isTerminated')) {
      return 100;
    }
    return (this.get('status')==='COMPLETED')?100:(this.get('percentComplete')||0);
  }.property('status','percentComplete'),

  isTerminated:function(){
    return (this.get('status')=='KILLED'||this.get('status')=='FAILED');
  }.property('status'),
  isKilling:false,
  kill:function(success,error){
    var self = this;
    var host = self.store.adapterFor('application').get('host');
    var namespace = self.store.adapterFor('application').get('namespace');
    var url = [host, namespace,'jobs',self.get('id')].join('/');

    self.set('isKilling',true);
    return Em.$.ajax(url, {
      type:'DELETE',
      contentType:'application/json',
      beforeSend:function(xhr){
        xhr.setRequestHeader('X-Requested-By','ambari');
      }
    }).always(function() {
      self.set('isKilling',false);
    }).then(success,error);
  },

  jobSuccess:function () {
    return this.get('status') == 'COMPLETED';
  }.property('status'),

  jobError:function () {
    return this.get('status') == 'SUBMIT_FAILED' || this.get('status') == 'KILLED' || this.get('status') == 'FAILED';
  }.property('status'),

  jobInProgress:function () {
    return this.get('status') == 'SUBMITTING' || this.get('status') == 'SUBMITTED' || this.get('status') == 'RUNNING';
  }.property('status'),

  argumentsArray:function (key,val) {
    if (arguments.length >1) {
      var oldargs = (this.get('templetonArguments'))?this.get('templetonArguments').w():[];
      if (val.length != oldargs.length) {
        this.set('templetonArguments',val.join('\t'));
      }
    }
    var args = this.get('templetonArguments');
    return (args && args.length > 0)?args.w():[];
  }.property('templetonArguments'),

  notFound: function() {
    if (this.get('isLoaded')) {
      this.set('status','FAILED');
    }
  }
});

});

require.register("models/pig_script", function(exports, require, module) {
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

var App = require('app');

App.Script = DS.Model.extend({
  title:DS.attr('string'),
  pigScript:DS.belongsTo('file', { async: true }),
  dateCreated:DS.attr('isodate', { defaultValue: moment()}),
  templetonArguments:DS.attr('string'),
  pythonScript:DS.attr('string'),
  owner:DS.attr('string'),
  opened:DS.attr('string'),
  // nav item identifier
  name:function (){
    return this.get('title') + this.get('id');
  }.property('title'),
  label:function (){
    return this.get('title');
  }.property('title'),

  argumentsArray:function (key,val) {
    if (arguments.length >1) {
      var oldargs = (this.get('templetonArguments'))?this.get('templetonArguments').w():[];
      if (val.length != oldargs.length) {
        this.set('templetonArguments',val.join('\t'));
      }
    }
    var args = this.get('templetonArguments');
    return (args && args.length > 0)?args.w():[];
  }.property('templetonArguments'),

  dateCreatedUnix:function () {
    return moment(this.get('dateCreated')).unix();
  }.property('dateCreated'),

  isBlankTitle:function () {
    return Ember.isBlank(this.get('title'));
  }.property('title')
});

});

require.register("models/udf", function(exports, require, module) {
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

var App = require('app');

App.Udf = DS.Model.extend({
    path: DS.attr('string'),
    name: DS.attr('string'),
    owner: DS.attr('string')
});

});

require.register("router", function(exports, require, module) {
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

var App = require('app');

App.Router.map(function () {
  this.resource('pig', { path: "/" }, function() {
    this.route('scripts', { path: "/list" });
    this.resource('script', { path: "/script" }, function () {
      this.route('edit', { path: "/edit/:script_id" });
      this.route('history', { path: "/history/:script_id" });
      this.route('job', { path: "/job/:job_id" });
    });
    this.route('udfs');
    this.route('history');
    this.route('errorLog');
  });
  this.route('splash');
});

});

require.register("routes/pig", function(exports, require, module) {
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

var App = require('app');

App.PigRoute = Em.Route.extend({
  beforeModel: function(transition) {
    App.set('previousTransition', transition);
  },
  redirect: function () {
    var testsConducted = App.get("smokeTests");
    if (!testsConducted) {
        App.set("smokeTests", true);
        this.transitionTo('splash');
    }
  },
  actions: {
    gotoSection: function(nav) {
      this.transitionTo((nav.hasOwnProperty('url'))?nav.url:this.routeName);
    },
    /**
     * Show alert
     *
     *  Alert object example:
     *
     *  {
     *    message: alert message,
     *    status: alert status (success||error||info),
     *    trace: alert trace
     *  }
     *
     * @param  {Object} alert
     * @return {Object}
     */
    showAlert:function (alert) {
      return this.controllerFor('pigAlert').get('content').pushObject(Em.Object.create(alert));
    },
    openModal: function(modalName, content) {
      this.controllerFor(modalName).set('model', content);
      return this.render(['modal',modalName].join('/'), {
        into: 'pig',
        outlet: 'modal',
        controller: modalName
      });
    },
    removeModal: function() {
      return this.disconnectOutlet({
        outlet: 'modal',
        parentView: 'pig'
      });
    }
  },
  model: function() {
    return this.store.find('script');
  },
  renderTemplate: function() {
    this.render('pig');
    this.render('pig/alert', {into:'pig',outlet:'alert',controller:'pigAlert'});
  }
});

App.PigIndexRoute = Em.Route.extend({
  redirect:function () {
    this.transitionTo('pig.scripts');
  }
});

App.ErrorRoute = Ember.Route.extend({
  setupController:function (controller,error) {
    var data;
    if(!(error instanceof Error)) {
      data = JSON.parse(error.responseText);
    } else {
      data = error;
    }
    controller.set('model',data);
  }
});

});

require.register("routes/pigHistory", function(exports, require, module) {
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

var App = require('app');

App.PigHistoryRoute = Em.Route.extend(App.RouteError, {
  errorMassage:Em.I18n.t('history.load_error'),
  enter: function() {
    this.controllerFor('pig').set('category',"history");
  },
  model: function() {
    return this.store.find('job');
  },
  setupController:function (controller,model) {
    var scripts = this.modelFor('pig');
    var filtered = model.filter(function(job) {
      return job.get('status') != 'SUBMIT_FAILED' && scripts.get('content').isAny('id',job.get('scriptId').toString());
    });
    controller.set('model',model);
  }
});

});

require.register("routes/pigScripts", function(exports, require, module) {
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

var App = require('app');

App.PigScriptsRoute = Em.Route.extend(App.RouteError, {
  errorMassage:Em.I18n.t('scripts.load_error'),
  enter: function() {
    this.controllerFor('pig').set('category','scripts');
  },
  model: function(object,transition) {
    return this.store.find('script');
  }
});

});

require.register("routes/pigUdfs", function(exports, require, module) {
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

var App = require('app');

App.PigUdfsRoute = Em.Route.extend(App.RouteError, {
  errorMassage:Em.I18n.t('udfs.load_error'),
  enter: function() {
    this.controllerFor('pig').set('category',"udfs");
  },
  model: function() {
    return this.store.find('udf');
  }
});

});

require.register("routes/script", function(exports, require, module) {
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

var App = require('app');

App.ScriptRoute = Em.Route.extend({
  actions:{
    willTransition:function (transition) {
      if (this.controllerFor('script.edit').get('isExec')) {
        return transition.abort();
      }
      if (this.controllerFor('script.edit').get('isRenaming')) {
        this.controllerFor('script.edit').set('titleWarn',true);
        return transition.abort();
      }
      var isAway = this.isGoingAway(transition);
      var scriptDirty = this.controllerFor('pig').get('scriptDirty');
      if (isAway && scriptDirty) {
        transition.abort();
        this.send('openModal','confirmAway',transition);
      }
    },
    error:function (error) {
      var msg, trace = (error && error.responseJSON.trace)?error.responseJSON.trace:null;
      if (error.status = 404) {
        this.store.all('script').filterBy('isLoaded',false).forEach(function (notLoaded) {
          notLoaded.unloadRecord();
        });
        msg = Em.I18n.t('scripts.not_found');
      } else {
        msg = Em.I18n.t('scripts.load_error_single');
      }
      this.send('showAlert', {'message': msg, status:'error', trace:trace});
      this.transitionTo('pig');
    }
  },
  enter:function () {
    this.controllerFor('pig').set('category', '');
  },
  deactivate: function() {
    this.controllerFor('pig').set('activeScriptId', null);
    this.controllerFor('script').set('activeJobs',[]);
  },
  isGoingAway:function (transition) {
    var isScriptAway = !transition.targetName.match(/^script./);
    if (!isScriptAway) {
      var targetParams = transition.params[transition.targetName];
      if (targetParams['script_id']) {
        return targetParams['script_id'] != this.controllerFor('pig').get('activeScriptId');
      }
      if (targetParams['job_id'] && this.modelFor('script.history')) {
        return this.modelFor('script.history').get('content').filterBy('id',targetParams['job_id']).length == 0;
      }
    }
    return isScriptAway;
  }
});

});

require.register("routes/scriptEdit", function(exports, require, module) {
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

var App = require('app');

App.ScriptEditRoute = Em.Route.extend({
  enter:function () {
    this.controllerFor('script').set('activeTab','script');
  },
  isExec:false,
  model: function(params) {
    return this.store.find('script',params.script_id);
  },
  afterModel:function  (model) {
    this.controllerFor('pig').set('activeScriptId', model.get('id'));
  },
  renderTemplate: function() {
    this.render('script/edit');
  }
});

});

require.register("routes/scriptHistory", function(exports, require, module) {
/*
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

var App = require('app');

App.ScriptHistoryRoute = Em.Route.extend({
  enter: function() {
    this.controllerFor('script').set('activeTab','history');
  },
  beforeModel:function (t) {
    var asId = t.params[t.targetName].hasOwnProperty('script_id') && t.params[t.targetName]['script_id'];
    this.controllerFor('pig').set('activeScriptId',asId);
  },
  model:function(param) {
    return this.store.find('job', {scriptId: param.script_id});
  }
});

});

require.register("routes/scriptJob", function(exports, require, module) {
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

var App = require('app');

App.ScriptJobRoute = Em.Route.extend({
    actions: {
      error: function(error, transition) {
        Em.warn(error.stack);
        var trace = null;
        if (error && error.responseJSON.trace)
          trace = error.responseJSON.trace;
        transition.send('showAlert', {'message':Em.I18n.t('job.alert.load_error',{message:error.message}), status:'error', trace:trace});
        this.transitionTo('pig');
      },
      navigate:function (argument) {
        return this.transitionTo(argument.route)
      },
      killjob:function (job) {
        var self = this;
        job.kill(function () {
          job.reload();
          self.send('showAlert', {'message': Em.I18n.t('job.alert.job_killed',{title:self.get('title')}), status:'info'});
        },function (reason) {
          var trace = (reason && reason.responseJSON.trace)?reason.responseJSON.trace:null;
          self.send('showAlert', {'message': Em.I18n.t('job.alert.job_kill_error'), status:'error', trace:trace});
        });
      }
    },
    model:function (q,w) {
      return this.store.find('job',q.job_id);
    },
    setupController: function(controller, model) {
      controller.set('model', model);
    },
    afterModel:function (job) {
      this.controllerFor('pig').set('activeScriptId', job.get('scriptId'));
      this.controllerFor('script').get('activeJobs').addObject(job);
      this.controllerFor('script').set('activeTab',job.get('id'));
    }
});

});

require.register("routes/splash", function(exports, require, module) {
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

var App = require('app');

App.SplashRoute = Em.Route.extend({
  model: function() {
    return Ember.Object.create({
      storageTest: null,
      storageTestDone: null,
      webhcatTest: null,
      webhcatTestDone: null,
      hdfsTest: null,
      hdfsTestDone: null,
      percent: 0
    });
  },
  renderTemplate: function() {
    this.render('splash');
  },
  setupController: function(controller, model) {
    controller.set('model', model);
    var self = this;
    controller.startTests(model).then(function() {
      if (model.get("storageTest") && model.get("webhcatTest") && model.get("hdfsTest")) {
        Ember.run.later(this, function() {
          previousTransition = App.get('previousTransition');
          if (previousTransition) {
            previousTransition.retry();
          } else {
            self.transitionTo('pig.scripts');
          }
        }, 1000);
      }
    });
  }
});

});

require.register("templates/application", function(exports, require, module) {
Ember.TEMPLATES["application"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1;


  data.buffer.push("\n\n<div class=\"wrap\">\n	");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/components/pigHelper", function(exports, require, module) {
Ember.TEMPLATES["components/pigHelper"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <li class=\"dropdown-submenu\">\n      <a>");
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n      <ul class=\"dropdown-menu\">\n        ");
  stack1 = helpers.each.call(depth0, "helpers", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </ul>\n    </li>\n  ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n          <li><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "putToEditor", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" >");
  stack1 = helpers._triageMustache.call(depth0, "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a></li>\n        ");
  return buffer;
  }

  data.buffer.push("\n\n<button type=\"button\" class=\"btn btn-default btn-xs dropdown-toggle\" data-toggle=\"dropdown\">\n  ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "editor.pighelper", options) : helperMissing.call(depth0, "t", "editor.pighelper", options))));
  data.buffer.push("\n  <span class=\"caret\"></span>\n</button>\n<ul class=\"dropdown-menu\" id=\"pig_helper\">\n  ");
  stack1 = helpers.each.call(depth0, "view.helpers", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</ul>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/components/scriptListRow", function(exports, require, module) {
Ember.TEMPLATES["components/scriptListRow"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    ");
  stack1 = helpers['if'].call(depth0, "script.isNew", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  stack1 = helpers.unless.call(depth0, "script.isNew", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program2(depth0,data) {
  
  
  data.buffer.push("\n      <div class=\"spinner-sm\"></div>\n    ");
  }

function program4(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n      ");
  stack1 = helpers._triageMustache.call(depth0, "script.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n    <span class=\"date\">");
  data.buffer.push(escapeExpression((helper = helpers.showDate || (depth0 && depth0.showDate),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["ID","STRING"],data:data},helper ? helper.call(depth0, "currentJob.dateStarted", "YYYY-MM-DD HH:mm", options) : helperMissing.call(depth0, "showDate", "currentJob.dateStarted", "YYYY-MM-DD HH:mm", options))));
  data.buffer.push("</span>\n  ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n    ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.not_run_message", options) : helperMissing.call(depth0, "t", "scripts.not_run_message", options))));
  data.buffer.push("\n  ");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n  <h4>\n    <span class=\"label label-warning\">");
  stack1 = helpers._triageMustache.call(depth0, "currentJob.status", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n  </h4>\n");
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n  <i class=\"fa fa-fw fa-lg fa-check green\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.success", options) : helperMissing.call(depth0, "t", "common.success", options))));
  data.buffer.push(" <small> (");
  stack1 = helpers._triageMustache.call(depth0, "currentJob.durationTime", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(")</small>\n");
  return buffer;
  }

function program14(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n  <i class=\"fa fa-fw fa-lg fa-exclamation red\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.error", options) : helperMissing.call(depth0, "t", "common.error", options))));
  data.buffer.push("\n");
  return buffer;
  }

function program16(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n    ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(17, program17, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "script.history", "script.id", options) : helperMissing.call(depth0, "link-to", "script.history", "script.id", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "copyScript", "script", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push("><i class=\"fa fa-copy\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.copy", options) : helperMissing.call(depth0, "t", "common.copy", options))));
  data.buffer.push("</a>\n    <a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deletescript", "script", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push("><i class=\"fa fa-trash-o\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.delete", options) : helperMissing.call(depth0, "t", "common.delete", options))));
  data.buffer.push("</a>\n  ");
  return buffer;
  }
function program17(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("<i class=\"fa fa-clock-o\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.history", options) : helperMissing.call(depth0, "t", "common.history", options))));
  return buffer;
  }

  data.buffer.push("\n\n<td class=\"first\">\n  ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "script.edit", "script.id", options) : helperMissing.call(depth0, "link-to", "script.edit", "script.id", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</td>\n<td>\n  ");
  stack1 = helpers['if'].call(depth0, "currentJob", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</td>\n<td>\n");
  stack1 = helpers['if'].call(depth0, "currentJob.jobInProgress", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  stack1 = helpers['if'].call(depth0, "currentJob.jobSuccess", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  stack1 = helpers['if'].call(depth0, "currentJob.jobError", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</td>\n<td>\n  ");
  stack1 = helpers.unless.call(depth0, "isNew", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</td>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/error", function(exports, require, module) {
Ember.TEMPLATES["error"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n        <a data-toggle=\"collapse\" class=\"btn btn-danger btn-xs\" href=\"#collapseTrace\">Trace <span class=\"caret\"></span></a>\n      ");
  }

  data.buffer.push("\n\n<div class=\"panel panel-danger\">\n  <div class=\"panel-heading\">\n    <div class=\"text-center\">\n      <strong>");
  stack1 = helpers._triageMustache.call(depth0, "content.status", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</strong>  ");
  stack1 = helpers._triageMustache.call(depth0, "content.message", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      ");
  stack1 = helpers['if'].call(depth0, "content.trace", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n  </div>\n  <div id=\"collapseTrace\" class=\"panel-collapse collapse\">\n    <div class=\"panel-body\">\n      <pre>\n        ");
  stack1 = helpers._triageMustache.call(depth0, "content.trace", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </pre>\n    </div>\n  </div>\n</div>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/loading", function(exports, require, module) {
Ember.TEMPLATES["loading"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '';


  data.buffer.push("\n\n<div class=\"spinner spinner-bg\"></div>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/modal/confirmAway", function(exports, require, module) {
Ember.TEMPLATES["modal/confirmAway"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n  <div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h4 class=\"modal-title\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.warning", options) : helperMissing.call(depth0, "t", "common.warning", options))));
  data.buffer.push("</h4>\n  </div>\n  <div class=\"modal-body\">\n    ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.modal.unsaved_changes_warning", options) : helperMissing.call(depth0, "t", "scripts.modal.unsaved_changes_warning", options))));
  data.buffer.push("\n  </div>\n");
  return buffer;
  }

  data.buffer.push("\n\n");
  stack1 = (helper = helpers['pig-modal'] || (depth0 && depth0['pig-modal']),options={hash:{
    'ok': ("confirm"),
    'option': ("discard")
  },hashTypes:{'ok': "STRING",'option': "STRING"},hashContexts:{'ok': depth0,'option': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "pig-modal", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/modal/confirmDelete", function(exports, require, module) {
Ember.TEMPLATES["modal/confirmDelete"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n  <div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h4 class=\"modal-title\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.modal.confirm_delete", options) : helperMissing.call(depth0, "t", "scripts.modal.confirm_delete", options))));
  data.buffer.push("</h4>\n  </div>\n  <div class=\"modal-body\">\n    <p>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{
    'titleBinding': ("content.title")
  },hashTypes:{'titleBinding': "STRING"},hashContexts:{'titleBinding': depth0},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.modal.confirm_delete_massage", options) : helperMissing.call(depth0, "t", "scripts.modal.confirm_delete_massage", options))));
  data.buffer.push("</p>\n  </div>\n");
  return buffer;
  }

  data.buffer.push("\n\n");
  stack1 = (helper = helpers['pig-modal'] || (depth0 && depth0['pig-modal']),options={hash:{
    'ok': ("confirm")
  },hashTypes:{'ok': "STRING"},hashContexts:{'ok': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "pig-modal", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/modal/createScript", function(exports, require, module) {
Ember.TEMPLATES["modal/createScript"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n  <div class=\"modal-header\">\n    <button type=\"button\" class=\"close\"  ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h4 class=\"modal-title\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.modal.create_script", options) : helperMissing.call(depth0, "t", "scripts.modal.create_script", options))));
  data.buffer.push("</h4>\n  </div>\n  <div class=\"modal-body\">\n  <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":form-group titleErrorMessage:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n      <label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.title", options) : helperMissing.call(depth0, "t", "scripts.title", options))));
  data.buffer.push("</label>\n      ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'class': ("form-control"),
    'placeholderTranslation': ("scripts.modal.script_title_placeholder"),
    'valueBinding': ("content.title"),
    'change': ("titleChange")
  },hashTypes:{'class': "STRING",'placeholderTranslation': "STRING",'valueBinding': "STRING",'change': "ID"},hashContexts:{'class': depth0,'placeholderTranslation': depth0,'valueBinding': depth0,'change': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n    </div>\n    ");
  stack1 = helpers['if'].call(depth0, "content.isBlankTitle", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <div class=\"form-group\">\n      <label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.path", options) : helperMissing.call(depth0, "t", "scripts.path", options))));
  data.buffer.push("</label>\n      ");
  data.buffer.push(escapeExpression((helper = helpers['path-input'] || (depth0 && depth0['path-input']),options={hash:{
    'class': ("form-control"),
    'placeholderTranslation': ("scripts.modal.file_path_placeholder"),
    'valueBinding': ("filePath"),
    'storeBinding': ("content.store")
  },hashTypes:{'class': "STRING",'placeholderTranslation': "STRING",'valueBinding': "STRING",'storeBinding': "STRING"},hashContexts:{'class': depth0,'placeholderTranslation': depth0,'valueBinding': depth0,'storeBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "path-input", options))));
  data.buffer.push("\n      <small class=\"pull-right help-block\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.modal.file_path_hint", options) : helperMissing.call(depth0, "t", "scripts.modal.file_path_hint", options))));
  data.buffer.push("</small>\n    </div>\n  </div>\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n      <div  ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":alert :alert-danger titleErrorMessage::hide")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "titleErrorMessage", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n    ");
  return buffer;
  }

  data.buffer.push("\n\n");
  stack1 = (helper = helpers['pig-modal'] || (depth0 && depth0['pig-modal']),options={hash:{
    'ok': ("confirm"),
    'close': ("cancel")
  },hashTypes:{'ok': "STRING",'close': "STRING"},hashContexts:{'ok': depth0,'close': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "pig-modal", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/modal/createUdf", function(exports, require, module) {
Ember.TEMPLATES["modal/createUdf"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n  <div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h4 class=\"modal-title\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "udfs.modal.create_udf", options) : helperMissing.call(depth0, "t", "udfs.modal.create_udf", options))));
  data.buffer.push("</h4>\n  </div>\n  <div class=\"modal-body\">\n  <div class=\"form-group\">\n      <label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.name", options) : helperMissing.call(depth0, "t", "common.name", options))));
  data.buffer.push("</label>\n      ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'class': ("form-control"),
    'placeholderTranslation': ("udfs.modal.udf_name"),
    'valueBinding': ("content.name")
  },hashTypes:{'class': "STRING",'placeholderTranslation': "STRING",'valueBinding': "STRING"},hashContexts:{'class': depth0,'placeholderTranslation': depth0,'valueBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n    </div>\n    <div class=\"form-group\">\n      <label>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.path", options) : helperMissing.call(depth0, "t", "common.path", options))));
  data.buffer.push("</label>\n      ");
  data.buffer.push(escapeExpression((helper = helpers['path-input'] || (depth0 && depth0['path-input']),options={hash:{
    'class': ("form-control"),
    'placeholderTranslation': ("udfs.modal.hdfs_path"),
    'valueBinding': ("content.path"),
    'storeBinding': ("content.store")
  },hashTypes:{'class': "STRING",'placeholderTranslation': "STRING",'valueBinding': "STRING",'storeBinding': "STRING"},hashContexts:{'class': depth0,'placeholderTranslation': depth0,'valueBinding': depth0,'storeBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "path-input", options))));
  data.buffer.push("\n    </div>\n  </div>\n");
  return buffer;
  }

  data.buffer.push("\n\n");
  stack1 = (helper = helpers['pig-modal'] || (depth0 && depth0['pig-modal']),options={hash:{
    'ok': ("confirm"),
    'close': ("cancel")
  },hashTypes:{'ok': "STRING",'close': "STRING"},hashContexts:{'ok': depth0,'close': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "pig-modal", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/modal/deleteJob", function(exports, require, module) {
Ember.TEMPLATES["modal/deleteJob"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n  <div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h4 class=\"modal-title\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.modal.confirm_delete", options) : helperMissing.call(depth0, "t", "scripts.modal.confirm_delete", options))));
  data.buffer.push("</h4>\n  </div>\n  <div class=\"modal-body\">\n    <p>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{
    'titleBinding': ("content.title")
  },hashTypes:{'titleBinding': "STRING"},hashContexts:{'titleBinding': depth0},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.modal.confirm_delete_massage", options) : helperMissing.call(depth0, "t", "job.modal.confirm_delete_massage", options))));
  data.buffer.push("</p>\n  </div>\n");
  return buffer;
  }

  data.buffer.push("\n\n");
  stack1 = (helper = helpers['pig-modal'] || (depth0 && depth0['pig-modal']),options={hash:{
    'ok': ("confirm")
  },hashTypes:{'ok': "STRING"},hashContexts:{'ok': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "pig-modal", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/modal/deleteUdf", function(exports, require, module) {
Ember.TEMPLATES["modal/deleteUdf"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n  <div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h4 class=\"modal-title\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.modal.confirm_delete", options) : helperMissing.call(depth0, "t", "scripts.modal.confirm_delete", options))));
  data.buffer.push("</h4>\n  </div>\n  <div class=\"modal-body\">\n    <p>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{
    'titleBinding': ("content.name")
  },hashTypes:{'titleBinding': "STRING"},hashContexts:{'titleBinding': depth0},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "udfs.modal.delete_udf", options) : helperMissing.call(depth0, "t", "udfs.modal.delete_udf", options))));
  data.buffer.push("</p>\n  </div>\n");
  return buffer;
  }

  data.buffer.push("\n\n");
  stack1 = (helper = helpers['pig-modal'] || (depth0 && depth0['pig-modal']),options={hash:{
    'ok': ("confirm")
  },hashTypes:{'ok': "STRING"},hashContexts:{'ok': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "pig-modal", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/modal/gotoCopy", function(exports, require, module) {
Ember.TEMPLATES["modal/gotoCopy"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n  <div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h4 class=\"modal-title\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.modal.copy_created", options) : helperMissing.call(depth0, "t", "scripts.modal.copy_created", options))));
  data.buffer.push("</h4>\n  </div>\n  <div class=\"modal-body\">\n    <p>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{
    'titleBinding': ("content.title")
  },hashTypes:{'titleBinding': "STRING"},hashContexts:{'titleBinding': depth0},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.modal.copy_created_massage", options) : helperMissing.call(depth0, "t", "scripts.modal.copy_created_massage", options))));
  data.buffer.push("</p>\n  </div>\n");
  return buffer;
  }

  data.buffer.push("\n\n");
  stack1 = (helper = helpers['pig-modal'] || (depth0 && depth0['pig-modal']),options={hash:{
    'ok': ("confirm")
  },hashTypes:{'ok': "STRING"},hashContexts:{'ok': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "pig-modal", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/modal/logDownload", function(exports, require, module) {
Ember.TEMPLATES["modal/logDownload"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n  <div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    ");
  stack1 = helpers['if'].call(depth0, "jobLogsLoader.isFulfilled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <h4 class=\"modal-title\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.logs", options) : helperMissing.call(depth0, "t", "job.logs", options))));
  data.buffer.push(" </h4>\n  </div>\n  <div class=\"modal-body\">\n    ");
  stack1 = helpers['if'].call(depth0, "jobLogsLoader.isPending", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </div>\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n    <p class=\"pull-right\" ><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "download", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("><i class=\"fa fa-download\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.download", options) : helperMissing.call(depth0, "t", "common.download", options))));
  data.buffer.push("</a></p>\n    ");
  return buffer;
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n      <div class=\"spinner-sm\"></div>\n    ");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n      ");
  stack1 = helpers['if'].call(depth0, "jobLogsLoader.isFulfilled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      ");
  stack1 = helpers['if'].call(depth0, "jobLogsLoader.isRejected", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n      <pre>");
  stack1 = helpers._triageMustache.call(depth0, "jobLogsLoader.content.fileContent", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</pre>\n      ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        ");
  stack1 = helpers._triageMustache.call(depth0, "jobLogsLoader.reason", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      ");
  return buffer;
  }

  data.buffer.push("\n\n");
  stack1 = (helper = helpers['pig-modal'] || (depth0 && depth0['pig-modal']),options={hash:{
    'ok': ("confirm"),
    'size': ("lg"),
    'class': ("logModal")
  },hashTypes:{'ok': "STRING",'size': "STRING",'class': "STRING"},hashContexts:{'ok': depth0,'size': depth0,'class': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "pig-modal", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/modal/modalLayout", function(exports, require, module) {
Ember.TEMPLATES["modal/modalLayout"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n          ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "", {hash:{
    'isValidBinding': ("view.isValid")
  },hashTypes:{'isValidBinding': "STRING"},hashContexts:{'isValidBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n        ");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"modal fade in\" data-backdrop=\"static\">\n  <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":modal-dialog large:modal-lg small:modal-sm")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n    <div class=\"modal-content\">\n      ");
  stack1 = helpers._triageMustache.call(depth0, "yield", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      <div class=\"modal-footer\">\n        ");
  stack1 = helpers.each.call(depth0, "buttonViews", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </div>\n    </div><!-- /.modal-content -->\n  </div><!-- /.modal-dialog -->\n</div><!-- /.modal -->\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/modal/resultsDownload", function(exports, require, module) {
Ember.TEMPLATES["modal/resultsDownload"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n  <div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n      ");
  stack1 = helpers['if'].call(depth0, "jobResultsLoader.isFulfilled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <h4 class=\"modal-title\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.results", options) : helperMissing.call(depth0, "t", "job.results", options))));
  data.buffer.push("</h4>\n  </div>\n  <div class=\"modal-body\">\n    ");
  stack1 = helpers['if'].call(depth0, "jobResultsLoader.isPending", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </div>\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n      <p class=\"pull-right\" ><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "download", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("><i class=\"fa fa-download\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.download", options) : helperMissing.call(depth0, "t", "common.download", options))));
  data.buffer.push("</a></p>\n      ");
  return buffer;
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n      <div class=\"spinner-sm\"></div>\n    ");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n      ");
  stack1 = helpers['if'].call(depth0, "jobResultsLoader.isFulfilled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      ");
  stack1 = helpers['if'].call(depth0, "jobResultsLoader.isRejected", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n      <pre>");
  stack1 = helpers._triageMustache.call(depth0, "jobResultsLoader.content.fileContent", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</pre>\n      ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        ");
  stack1 = helpers._triageMustache.call(depth0, "jobResultsLoader.reason", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      ");
  return buffer;
  }

  data.buffer.push("\n\n");
  stack1 = (helper = helpers['pig-modal'] || (depth0 && depth0['pig-modal']),options={hash:{
    'ok': ("confirm"),
    'size': ("lg"),
    'class': ("resultsModal")
  },hashTypes:{'ok': "STRING",'size': "STRING",'class': "STRING"},hashContexts:{'ok': depth0,'size': depth0,'class': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "pig-modal", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/partials/alert-content", function(exports, require, module) {
Ember.TEMPLATES["partials/alert-content"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n    <a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "showErrorLog", "view.content", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.showErrorLog", options) : helperMissing.call(depth0, "t", "common.showErrorLog", options))));
  data.buffer.push("</a>\n");
  return buffer;
  }

  data.buffer.push("\n\n<button type=\"button\" class=\"close\" >&times;</button>\n<p>\n  ");
  stack1 = helpers._triageMustache.call(depth0, "view.content.message", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</p>\n");
  stack1 = helpers['if'].call(depth0, "view.content.trace", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/partials/paginationControls", function(exports, require, module) {
Ember.TEMPLATES["partials/paginationControls"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <li><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectPage", "prevPage", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push("><i class=\"fa fa-arrow-left\"></i></a></li>\n      ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n        <li class=\"disabled\"><a><i class=\"fa fa-arrow-left\"></i></a></li>\n      ");
  }

function program5(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <li><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectPage", "nextPage", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push("><i class=\"fa fa-arrow-right\"></i></a></li>\n      ");
  return buffer;
  }

function program7(depth0,data) {
  
  
  data.buffer.push("\n        <li class=\"disabled\"><a><i class=\"fa fa-arrow-right\"></i></a></li>\n      ");
  }

  data.buffer.push("\n\n<div class=\"pagination-block\">\n  <div class=\"items-count\">\n    <label >");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.show", options) : helperMissing.call(depth0, "t", "common.show", options))));
  data.buffer.push("\n      ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "select", {hash:{
    'content': ("perPageOptions"),
    'class': ("form-control"),
    'value': ("perPage")
  },hashTypes:{'content': "ID",'class': "STRING",'value': "ID"},hashContexts:{'content': depth0,'class': depth0,'value': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n    </label>\n  </div>\n  <div class=\"items-info\">\n    <span>");
  stack1 = helpers._triageMustache.call(depth0, "paginationInfo", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n  </div>\n  <div class=\"items-buttons\">\n    <ul class=\"pagination\">\n      ");
  stack1 = helpers['if'].call(depth0, "prevPage", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      ");
  stack1 = helpers['if'].call(depth0, "nextPage", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </ul>\n  </div>\n</div>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/pig", function(exports, require, module) {
Ember.TEMPLATES["pig"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <span>");
  stack1 = helpers._triageMustache.call(depth0, "activeScript.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n                <span>...</span>\n              ");
  }

  data.buffer.push("\n\n<div class=\"container-fluid\">\n  <div class=\"row\">\n    <div class=\"col-md-3 navigation\">\n      <div class=\"well\">\n\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "nav-items", {hash:{
    'content': ("navs")
  },hashTypes:{'content': "ID"},hashContexts:{'content': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n        <div class=\"nav-script-wrap\">\n          <div class=\" nav-script\" >\n            <div>\n              <button type=\"button\" class=\"close_script\" tabindex=\"-1\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeScript", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                <i class=\"fa fa-times\"></i>\n              </button>\n            </div>\n            <div class=\"script-title\">\n              ");
  stack1 = helpers.unless.call(depth0, "activeScript.isBlankTitle", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </div>\n           <ul class=\"script-actions list-unstyled\">\n              <li><a href=\"#\" tabindex=\"-1\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "saveScript", "activeScript", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-block saveEnabled::disabled")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" ><i class=\"fa fa-fw fa-save\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.save", options) : helperMissing.call(depth0, "t", "common.save", options))));
  data.buffer.push("</a></li>\n              <li><a href=\"#\" tabindex=\"-1\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "copyScript", "activeScript", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-block disableScriptControls:disabled")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" ><i class=\"fa fa-fw fa-copy\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.copy", options) : helperMissing.call(depth0, "t", "common.copy", options))));
  data.buffer.push("</a></li>\n              <li class=\"divider\"></li>\n              <li><a href=\"#\" tabindex=\"-1\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deletescript", "activeScript", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-block disableScriptControls:disabled")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("  ><i class=\"fa fa-fw fa-trash-o\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.delete", options) : helperMissing.call(depth0, "t", "common.delete", options))));
  data.buffer.push("</a></li>\n            </ul>\n          </div>\n        </div>\n      </div>\n\n      ");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "alert", options) : helperMissing.call(depth0, "outlet", "alert", options))));
  data.buffer.push("\n    </div>\n    <div class=\"col-md-9 main-content\">\n      ");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n  </div>\n</div>\n\n");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "modal", options) : helperMissing.call(depth0, "outlet", "modal", options))));
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/pig/alert", function(exports, require, module) {
Ember.TEMPLATES["pig/alert"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', escapeExpression=this.escapeExpression;


  data.buffer.push("\n\n<div id=\"alert-wrap\">\n ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.alertsView", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n</div>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/pig/errorLog", function(exports, require, module) {
Ember.TEMPLATES["pig/errorLog"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("\n\n<h1>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.errorLog", options) : helperMissing.call(depth0, "t", "common.errorLog", options))));
  data.buffer.push("</h1>\n\n<pre class=\"prettyprint\">\n");
  stack1 = helpers._triageMustache.call(depth0, "errorLog", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</pre>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/pig/history", function(exports, require, module) {
Ember.TEMPLATES["pig/history"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n      <tr>\n        <td>");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "script.job", "id", options) : helperMissing.call(depth0, "link-to", "script.job", "id", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n        <td>\n          ");
  stack1 = helpers.view.call(depth0, "view.scriptLink", {hash:{
    'scriptId': ("scriptId"),
    'allIds': ("controller.scriptIds")
  },hashTypes:{'scriptId': "ID",'allIds': "ID"},hashContexts:{'scriptId': depth0,'allIds': depth0},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </td>\n        <td>\n          <h4>\n            <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":label jobSuccess:label-success jobError:label-danger jobInProgress:label-warning ")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" class=\"label label-success\">");
  stack1 = helpers._triageMustache.call(depth0, "status", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n          </h4>\n        </td>\n        <td>");
  stack1 = helpers.unless.call(depth0, "jobInProgress", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n        <td>\n          ");
  stack1 = helpers.unless.call(depth0, "jobInProgress", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteJob", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" href=\"#\"><i class=\"fa fa-trash-o\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.delete", options) : helperMissing.call(depth0, "t", "common.delete", options))));
  data.buffer.push("</a>\n        </td>\n      </tr>\n    ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push(" ");
  data.buffer.push(escapeExpression((helper = helpers.showDate || (depth0 && depth0.showDate),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["ID","STRING"],data:data},helper ? helper.call(depth0, "dateStarted", "YYYY-MM-DD HH:mm", options) : helperMissing.call(depth0, "showDate", "dateStarted", "YYYY-MM-DD HH:mm", options))));
  data.buffer.push(" ");
  return buffer;
  }

function program4(depth0,data) {
  
  var stack1;
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

function program6(depth0,data) {
  
  var stack1;
  stack1 = helpers._triageMustache.call(depth0, "durationTime", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

function program8(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n            <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "logsPopup", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" href=\"#\"> <i class=\"fa fa-file-text-o\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.logs", options) : helperMissing.call(depth0, "t", "job.logs", options))));
  data.buffer.push("</a>\n            <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "resultsPopup", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" href=\"#\"> <i class=\"fa fa-table\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.results", options) : helperMissing.call(depth0, "t", "job.results", options))));
  data.buffer.push("</a>\n          ");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n    <div class=\"alert alert-info\" role=\"alert\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "history.no_jobs_message", options) : helperMissing.call(depth0, "t", "history.no_jobs_message", options))));
  data.buffer.push("</div>\n  ");
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n  ");
  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "partials/paginationControls", options) : helperMissing.call(depth0, "partial", "partials/paginationControls", options))));
  data.buffer.push("\n");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"panel-history\">\n  <div class=\"title-row\">\n    <h3 class=\"pull-left\"> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.history", options) : helperMissing.call(depth0, "t", "common.history", options))));
  data.buffer.push("</h3>\n  </div>\n  <table class=\"table table-striped \">\n    <thead>\n      <tr class=\"label-row\">\n        <th class=\"first\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.date", options) : helperMissing.call(depth0, "t", "common.date", options))));
  data.buffer.push("</th>\n        <th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.script", options) : helperMissing.call(depth0, "t", "scripts.script", options))));
  data.buffer.push("</th>\n        <th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.status", options) : helperMissing.call(depth0, "t", "job.status", options))));
  data.buffer.push("</th> \n        <th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "history.duration", options) : helperMissing.call(depth0, "t", "history.duration", options))));
  data.buffer.push("</th>\n        <th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.actions", options) : helperMissing.call(depth0, "t", "common.actions", options))));
  data.buffer.push("</th>\n      </tr>\n    </thead>\n    <tbody>\n    ");
  stack1 = helpers.each.call(depth0, "paginatedContent", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </tbody>\n  </table>\n  ");
  stack1 = helpers.unless.call(depth0, "content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n\n");
  stack1 = helpers['if'].call(depth0, "content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/pig/loading", function(exports, require, module) {
Ember.TEMPLATES["pig/loading"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '';


  data.buffer.push("\n\n\n<div class=\"spinner-bg center-block\"></div>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/pig/scripts", function(exports, require, module) {
Ember.TEMPLATES["pig/scripts"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n      ");
  data.buffer.push(escapeExpression((helper = helpers['script-list-row'] || (depth0 && depth0['script-list-row']),options={hash:{
    'script': (""),
    'jobs': ("controller.jobs")
  },hashTypes:{'script': "ID",'jobs': "ID"},hashContexts:{'script': depth0,'jobs': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "script-list-row", options))));
  data.buffer.push("\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n    ");
  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "partials/paginationControls", options) : helperMissing.call(depth0, "partial", "partials/paginationControls", options))));
  data.buffer.push("\n  ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n    <div class=\"alert alert-info\" role=\"alert\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.noScripts", options) : helperMissing.call(depth0, "t", "scripts.noScripts", options))));
  data.buffer.push("</div>\n  ");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"scriptlist\">\n  <div class=\"title-row\">\n    <h3 class=\"pull-left\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.scripts", options) : helperMissing.call(depth0, "t", "scripts.scripts", options))));
  data.buffer.push("</h3>\n    <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createScript", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" class=\"btn btn-default pull-right new-script\"><i class=\"fa fa-plus\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.newscript", options) : helperMissing.call(depth0, "t", "scripts.newscript", options))));
  data.buffer.push("</a>\n  </div>\n  <table class=\"table table-striped \">\n    <thead>\n      <tr class=\"label-row\">\n        <th class=\"first\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.name", options) : helperMissing.call(depth0, "t", "common.name", options))));
  data.buffer.push("</th>\n        <th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.last_executed", options) : helperMissing.call(depth0, "t", "scripts.last_executed", options))));
  data.buffer.push("</th>\n        <th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.last_results", options) : helperMissing.call(depth0, "t", "scripts.last_results", options))));
  data.buffer.push("</th>\n        <th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.actions", options) : helperMissing.call(depth0, "t", "common.actions", options))));
  data.buffer.push("</th>\n      </tr>\n    </thead>\n    <tbody>\n    ");
  stack1 = helpers.each.call(depth0, "paginatedContent", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </tbody>\n  </table>\n\n  ");
  stack1 = helpers['if'].call(depth0, "content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n  ");
  stack1 = helpers.unless.call(depth0, "content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n\n");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "modal", options) : helperMissing.call(depth0, "outlet", "modal", options))));
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/pig/udfs", function(exports, require, module) {
Ember.TEMPLATES["pig/udfs"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n        <tr> \n          <td> ");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n          <td> ");
  stack1 = helpers._triageMustache.call(depth0, "path", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n          <td> ");
  stack1 = helpers._triageMustache.call(depth0, "owner", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n          <td><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteUdfModal", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" ><i class=\"fa fa-trash-o\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.delete", options) : helperMissing.call(depth0, "t", "common.delete", options))));
  data.buffer.push("</a></td>\n        </tr>\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n    ");
  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "partials/paginationControls", options) : helperMissing.call(depth0, "partial", "partials/paginationControls", options))));
  data.buffer.push("\n  ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n    <div class=\"alert alert-info\" role=\"alert\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "udfs.noUDFs", options) : helperMissing.call(depth0, "t", "udfs.noUDFs", options))));
  data.buffer.push("</div>\n  ");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"panel-udfs\">\n  <div class=\"title-row\">\n    <h3 class=\"pull-left\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "udfs.udfs", options) : helperMissing.call(depth0, "t", "udfs.udfs", options))));
  data.buffer.push("</h3>\n    <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createUdfModal", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" class=\"btn btn-default pull-right upload-udf\"><span class=\"glyphicon glyphicon-plus\"></span> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "udfs.create", options) : helperMissing.call(depth0, "t", "udfs.create", options))));
  data.buffer.push("</a>\n  </div>\n  <table class=\"table table-striped\">\n    <thead> \n      <tr class=\"label-row\">\n        <th class=\"first\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.name", options) : helperMissing.call(depth0, "t", "common.name", options))));
  data.buffer.push("</th> \n        <th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.path", options) : helperMissing.call(depth0, "t", "common.path", options))));
  data.buffer.push("</th> \n        <th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.owner", options) : helperMissing.call(depth0, "t", "common.owner", options))));
  data.buffer.push("</th> \n        <th></th> \n      </tr>\n    </thead>\n    <tbody>\n    ");
  stack1 = helpers.each.call(depth0, "paginatedContent", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </tbody>\n  </table>\n\n  ");
  stack1 = helpers['if'].call(depth0, "content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n  ");
  stack1 = helpers.unless.call(depth0, "content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n</div>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/script", function(exports, require, module) {
Ember.TEMPLATES["script"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n    ");
  stack1 = (helper = helpers['tab-control'] || (depth0 && depth0['tab-control']),options={hash:{
    'tab': ("name"),
    'current': ("controller.activeTab"),
    'popTab': ("deactivateJob"),
    'target': ("target")
  },hashTypes:{'tab': "ID",'current': "ID",'popTab': "STRING",'target': "ID"},hashContexts:{'tab': depth0,'current': depth0,'popTab': depth0,'target': depth0},inverse:self.noop,fn:self.program(2, program2, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "tab-control", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n      ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'disabled': ("view.disabled")
  },hashTypes:{'disabled': "ID"},hashContexts:{'disabled': depth0},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0,depth0],types:["ID","ID"],data:data},helper ? helper.call(depth0, "url", "target", options) : helperMissing.call(depth0, "link-to", "url", "target", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program3(depth0,data) {
  
  var stack1;
  stack1 = helpers._triageMustache.call(depth0, "label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

  data.buffer.push("\n\n<ul class=\"nav nav-tabs nav-tabs-script\" role=\"tablist\">\n  ");
  stack1 = helpers.each.call(depth0, "tabs", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</ul>\n\n");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/script/edit", function(exports, require, module) {
Ember.TEMPLATES["script/edit"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n        <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn-group :pull-right isRenaming:hide")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n          <button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "execute", "content", "execute", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","STRING"],data:data})));
  data.buffer.push(" type=\"button\" class=\"btn btn-primary\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "editor.execute", options) : helperMissing.call(depth0, "t", "editor.execute", options))));
  data.buffer.push("</button>\n\n          <button type=\"button\" class=\"btn btn-primary dropdown-toggle\" data-toggle=\"dropdown\">\n            <span class=\"caret\"></span>\n            <span class=\"sr-only\">Toggle Dropdown</span>\n          </button>\n          <ul class=\"dropdown-menu\" role=\"menu\">\n            <li><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "execute", "content", "explain", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","STRING"],data:data})));
  data.buffer.push(" >");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "editor.explain", options) : helperMissing.call(depth0, "t", "editor.explain", options))));
  data.buffer.push("</a></li>\n            <li><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "execute", "content", "syntax_check", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","STRING"],data:data})));
  data.buffer.push(" >");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "editor.syntax_check", options) : helperMissing.call(depth0, "t", "editor.syntax_check", options))));
  data.buffer.push("</a></li>\n          </ul>\n        </div>\n        <div class=\"btn-group btn-group-xs pull-right tez-exec\">\n          <label class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleTez", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n            <i ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":fa executeOnTez:fa-check-square-o:fa-square-o")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "editor.execute_on_tez", options) : helperMissing.call(depth0, "t", "editor.execute_on_tez", options))));
  data.buffer.push("\n          </label>\n        </div>\n        ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n        <div class=\"spinner-sm pull-right\"></div>\n      ");
  }

function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <div class=\"script-title\">\n          <h4> ");
  stack1 = helpers._triageMustache.call(depth0, "content.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" <a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "rename", "ask", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" class=\"btn-rename\"><i class=\"fa fa-pencil\"></i></a></h4>\n        </div>\n      ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n        <div  ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":input-group :input-title titleWarn:has-error")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n          ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.focusInput", {hash:{
    'id': ("title"),
    'placeholderTranslation': ("scripts.modal.script_title_placeholder"),
    'class': ("form-control"),
    'valueBinding': ("content.title"),
    'action': ("rename")
  },hashTypes:{'id': "STRING",'placeholderTranslation': "STRING",'class': "STRING",'valueBinding': "STRING",'action': "STRING"},hashContexts:{'id': depth0,'placeholderTranslation': depth0,'class': depth0,'valueBinding': depth0,'action': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n          <div class=\"input-group-btn\">\n            <button  type=\"button\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "rename", "cancel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-default :btn-rename-cancel")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n              <i class=\"fa fa-lg fa-remove\"></i> <span class=\"hidden-xs\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.cancel", options) : helperMissing.call(depth0, "t", "common.cancel", options))));
  data.buffer.push("</span>\n            </button>\n          </div>\n          <div class=\"input-group-btn\">\n            <button  type=\"button\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "rename", "content.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-success :btn-rename-confirm content.isBlankTitle:disabled")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n              <i class=\"fa fa-lg fa-check\"></i> <span class=\"hidden-xs\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "editor.save", options) : helperMissing.call(depth0, "t", "editor.save", options))));
  data.buffer.push("</span>\n            </button>\n          </div>\n        </div>\n      ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <li><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "insertUdf", "", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a></li>\n          ");
  return buffer;
  }

function program11(depth0,data) {
  
  
  data.buffer.push("\n          <div class=\"spinner-sm\"></div>\n        ");
  }

function program13(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n          ");
  stack1 = helpers._triageMustache.call(depth0, "content.pigScript.id", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }

function program15(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n      <div class=\"form-group\">\n        <label class=\"control-label\">");
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</label>\n        <div class=\"\">\n         ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'class': ("form-control input-sm"),
    'valueBinding': ("value")
  },hashTypes:{'class': "STRING",'valueBinding': "STRING"},hashContexts:{'class': depth0,'valueBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n        </div>\n      </div>\n    ");
  return buffer;
  }

function program17(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n        <div class=\"arguments-wrap\">\n          ");
  stack1 = helpers.each.call(depth0, "argumentsArray", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(18, program18, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n        ");
  return buffer;
  }
function program18(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <span class=\"label label-primary\"> <span class=\"pull-left\" >");
  stack1 = helpers._triageMustache.call(depth0, "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>  <a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "removeArgument", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":close :rm-arg")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("><i class=\"fa fa-remove\"></i></a> </span>\n          ");
  return buffer;
  }

function program20(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n          <div class=\"alert alert-info\" role=\"alert\">\n            ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "editor.no_arguments_message", options) : helperMissing.call(depth0, "t", "editor.no_arguments_message", options))));
  data.buffer.push("\n          </div>\n        ");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"edit-script\">\n  <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":panel :panel-editscript fullscreen:fullscreen content.isError:panel-danger:panel-default")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n    <div class=\"panel-heading\">\n      ");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "nav", options) : helperMissing.call(depth0, "outlet", "nav", options))));
  data.buffer.push("\n\n      \n      ");
  stack1 = helpers.unless.call(depth0, "isExec", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n      \n      ");
  stack1 = helpers.unless.call(depth0, "isRenaming", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    </div>\n    <div class=\"panel-body\" >\n      <div class=\"pull-left\">\n      ");
  data.buffer.push(escapeExpression((helper = helpers['pig-helper'] || (depth0 && depth0['pig-helper']),options={hash:{
    'class': ("btn-group"),
    'editor': ("editor")
  },hashTypes:{'class': "STRING",'editor': "ID"},hashContexts:{'class': depth0,'editor': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "pig-helper", options))));
  data.buffer.push("\n        <div class=\"btn-group\">\n          <button type=\"button\" data-toggle=\"dropdown\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-default :btn-xs :dropdown-toggle ufdsList.length::disabled")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n            ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "editor.udfhelper", options) : helperMissing.call(depth0, "t", "editor.udfhelper", options))));
  data.buffer.push("\n            <span class=\"caret\"></span>\n          </button>\n          <ul class=\"dropdown-menu\">\n          ");
  stack1 = helpers.each.call(depth0, "ufdsList", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          </ul>\n        </div>\n      </div>\n      <div class=\"fullscreen-toggle pull-right\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "fullscreen", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" data-toggle=\"tooltip\" data-placement=\"bottom\"  ");
  data.buffer.push(escapeExpression((helper = helpers.translateAttr || (depth0 && depth0.translateAttr),options={hash:{
    'title': ("editor.toggle_fullscreen")
  },hashTypes:{'title': "STRING"},hashContexts:{'title': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "translateAttr", options))));
  data.buffer.push("><i ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":fa :fa-lg fullscreen:fa-compress:fa-expand")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" ></i></div>\n      <kbd class=\"file-path pull-right\" data-toggle=\"tooltip\" data-placement=\"bottom\" ");
  data.buffer.push(escapeExpression((helper = helpers.translateAttr || (depth0 && depth0.translateAttr),options={hash:{
    'title': ("udfs.tooltips.path")
  },hashTypes:{'title': "STRING"},hashContexts:{'title': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "translateAttr", options))));
  data.buffer.push(" >\n        ");
  stack1 = helpers.unless.call(depth0, "content.pigScript.isLoaded", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(13, program13, data),fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </kbd>\n    </div>\n    <div class=\"editor-container\">\n      ");
  data.buffer.push(escapeExpression((helper = helpers['code-mirror'] || (depth0 && depth0['code-mirror']),options={hash:{
    'id': ("pig_script"),
    'content': ("content.pigScript"),
    'codeMirror': ("editor"),
    'fullscreen': ("fullscreen")
  },hashTypes:{'id': "STRING",'content': "ID",'codeMirror': "ID",'fullscreen': "ID"},hashContexts:{'id': depth0,'content': depth0,'codeMirror': depth0,'fullscreen': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "code-mirror", options))));
  data.buffer.push("\n      <div class=\"ui-resizable-handle ui-resizable-s\" id=\"sgrip\"><i class=\"fa fa-ellipsis-h\"></i></div>\n    </div>\n  </div>\n\n\n  <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":params-block pigParams::hidden")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n    <div class=\"block-title\">\n      <h4>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "editor.params", options) : helperMissing.call(depth0, "t", "editor.params", options))));
  data.buffer.push("</h4>\n    </div>\n    <div class=\"form-inline pigParams\">\n    ");
  stack1 = helpers.each.call(depth0, "pigParams", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(15, program15, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n  </div>\n\n  <div class=\"arguments-block\">\n    <div class=\"block-title\">\n      <h4>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "editor.arguments", options) : helperMissing.call(depth0, "t", "editor.arguments", options))));
  data.buffer.push("</h4>\n    </div>\n    <div class=\"row\">\n      <div class=\"col-md-8 \">\n        ");
  stack1 = helpers['if'].call(depth0, "argumentsArray", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(20, program20, data),fn:self.program(17, program17, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </div>\n      <div class=\"col-md-4 \">\n        <div class=\"input-group\">\n          ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'action': ("addArgument"),
    'placeholderTranslation': ("editor.pig_argument"),
    'class': ("form-control"),
    'valueBinding': ("tmpArgument")
  },hashTypes:{'action': "STRING",'placeholderTranslation': "STRING",'class': "STRING",'valueBinding': "STRING"},hashContexts:{'action': depth0,'placeholderTranslation': depth0,'class': depth0,'valueBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n          <span class=\"input-group-btn\">\n            <button class=\"btn btn-default pull-right\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "addArgument", "tmpArgument", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" ><i class=\"fa fa-plus\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.add", options) : helperMissing.call(depth0, "t", "common.add", options))));
  data.buffer.push("</button>\n          </span>\n        </div>\n      </div>\n\n    </div>\n  </div>\n\n  ");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "main", options) : helperMissing.call(depth0, "outlet", "main", options))));
  data.buffer.push("\n\n</div>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/script/history", function(exports, require, module) {
Ember.TEMPLATES["script/history"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n        <tr>\n          <td>");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "script.job", "id", options) : helperMissing.call(depth0, "link-to", "script.job", "id", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n          <td>\n            <h4>\n              <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":label jobSuccess:label-success jobError:label-danger jobInProgress:label-warning ")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" class=\"label label-success\">");
  stack1 = helpers._triageMustache.call(depth0, "status", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n            </h4>\n          </td>\n          <td>");
  stack1 = helpers.unless.call(depth0, "jobInProgress", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n          <td>\n            ");
  stack1 = helpers.unless.call(depth0, "jobInProgress", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            <a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteJob", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push("><i class=\"fa fa-trash-o\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.delete", options) : helperMissing.call(depth0, "t", "common.delete", options))));
  data.buffer.push("</a>\n          </td>\n        </tr>\n      ");
  return buffer;
  }
function program2(depth0,data) {
  
  var helper, options;
  data.buffer.push(escapeExpression((helper = helpers.showDate || (depth0 && depth0.showDate),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["ID","STRING"],data:data},helper ? helper.call(depth0, "dateStarted", "YYYY-MM-DD HH:mm", options) : helperMissing.call(depth0, "showDate", "dateStarted", "YYYY-MM-DD HH:mm", options))));
  }

function program4(depth0,data) {
  
  var stack1;
  stack1 = helpers._triageMustache.call(depth0, "durationTime", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

function program6(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n              <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "logsPopup", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" href=\"#\"> <i class=\"fa fa-file-text-o\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.logs", options) : helperMissing.call(depth0, "t", "job.logs", options))));
  data.buffer.push("</a>\n              <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "resultsPopup", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" href=\"#\"> <i class=\"fa fa-table\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.results", options) : helperMissing.call(depth0, "t", "job.results", options))));
  data.buffer.push("</a>\n            ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n  <div class=\"alert alert-info\" role=\"alert\">");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "scripts.no_jobs_message", options) : helperMissing.call(depth0, "t", "scripts.no_jobs_message", options))));
  data.buffer.push("</div>\n");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n  ");
  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "partials/paginationControls", options) : helperMissing.call(depth0, "partial", "partials/paginationControls", options))));
  data.buffer.push("\n");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"script_history_container\">\n  <table class=\"table table-striped\">\n    <thead>\n      <tr>\n          <th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.date", options) : helperMissing.call(depth0, "t", "common.date", options))));
  data.buffer.push("</th>\n          <th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.status", options) : helperMissing.call(depth0, "t", "job.status", options))));
  data.buffer.push("</th>\n          <th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "history.duration", options) : helperMissing.call(depth0, "t", "history.duration", options))));
  data.buffer.push("</th>\n          <th>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.actions", options) : helperMissing.call(depth0, "t", "common.actions", options))));
  data.buffer.push("</th>\n      </tr>\n    </thead>\n    <tbody>\n      ");
  stack1 = helpers.each.call(depth0, "paginatedContent", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </tbody>\n  </table>\n</div>\n");
  stack1 = helpers.unless.call(depth0, "content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  stack1 = helpers['if'].call(depth0, "content", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/script/job", function(exports, require, module) {
Ember.TEMPLATES["script/job"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push(" <span class=\"label label-danger\"><i class=\"fa fa-exclamation\"></i></span> ");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <div class=\"col-md-2\">\n          ");
  stack1 = helpers.unless.call(depth0, "isKilling", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  stack1 = helpers['if'].call(depth0, "isKilling", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n      ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n            <button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "killjob", "content", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" type=\"button\" class=\"btn btn-block btn-danger btn-sm kill-button\"><i class=\"fa fa-times\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.kill_job", options) : helperMissing.call(depth0, "t", "job.kill_job", options))));
  data.buffer.push("</button>\n          ");
  return buffer;
  }

function program6(depth0,data) {
  
  
  data.buffer.push("\n            <div class=\"spinner-sm pull-left kill-button\"></div>\n          ");
  }

function program8(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n      <div class=\"panel-heading\">\n        <h4 class=\"panel-title\">\n          <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleCollapse", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" href=\"#\">\n            <i ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":toggle-icon :fa :fa-fw :fa-chevron-right view.collapsed::fa-rotate-90")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></i>\n            ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.results", options) : helperMissing.call(depth0, "t", "job.results", options))));
  data.buffer.push("\n          </a>\n          ");
  stack1 = helpers.unless.call(depth0, "jobInProgress", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </h4>\n      </div>\n      <div id=\"scriptResults\" class=\"panel-collapse collapse\">\n        <div class=\"panel-body\">\n        ");
  stack1 = helpers['if'].call(depth0, "jobResults.isPending", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(14, program14, data),fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n      </div>\n    ");
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "jobResults.isFulfilled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  return buffer;
  }
function program10(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n              <p class=\"pull-right\" ><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "download", "results", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push("><i class=\"fa fa-download\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.download", options) : helperMissing.call(depth0, "t", "common.download", options))));
  data.buffer.push("</a></p>\n            ");
  return buffer;
  }

function program12(depth0,data) {
  
  
  data.buffer.push("\n          <div class=\"spinner-sm\"></div>\n        ");
  }

function program14(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n          ");
  stack1 = helpers['if'].call(depth0, "jobResults.isFulfilled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(15, program15, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  stack1 = helpers.unless.call(depth0, "jobInProgress", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(17, program17, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program15(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n          <pre>");
  stack1 = helpers._triageMustache.call(depth0, "jobResults.content.fileContent", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</pre>\n          ");
  return buffer;
  }

function program17(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "jobResults.isRejected", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(18, program18, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  return buffer;
  }
function program18(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n              <div class=\"alert alert-danger\" role=\"alert\">\n                ");
  stack1 = helpers._triageMustache.call(depth0, "jobResults.reason", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n              </div>\n            ");
  return buffer;
  }

function program20(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n      <div class=\"panel-heading\">\n        <h4 class=\"panel-title\">\n          <a  ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleCollapse", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" href=\"#\">\n            <i ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":toggle-icon :fa :fa-fw :fa-chevron-right view.collapsed::fa-rotate-90")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" ></i>\n            ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.logs", options) : helperMissing.call(depth0, "t", "job.logs", options))));
  data.buffer.push(" ");
  stack1 = helpers['if'].call(depth0, "hasErrorInLogs", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          </a>\n          ");
  stack1 = helpers.unless.call(depth0, "jobInProgress", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(21, program21, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </h4>\n      </div>\n      <div id=\"scriptLogs\" class=\"panel-collapse collapse\">\n        <div class=\"panel-body\">\n        ");
  stack1 = helpers['if'].call(depth0, "jobLogs.isPending", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(24, program24, data),fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n      </div>\n    ");
  return buffer;
  }
function program21(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "jobLogs.isFulfilled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(22, program22, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  return buffer;
  }
function program22(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n              <p class=\"pull-right\" ><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "download", "logs", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push("><i class=\"fa fa-download\"></i> ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.download", options) : helperMissing.call(depth0, "t", "common.download", options))));
  data.buffer.push("</a></p>\n            ");
  return buffer;
  }

function program24(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n          ");
  stack1 = helpers['if'].call(depth0, "jobLogs.isFulfilled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(25, program25, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  stack1 = helpers.unless.call(depth0, "jobInProgress", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(27, program27, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program25(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n            ");
  data.buffer.push(escapeExpression((helper = helpers['highlight-errors'] || (depth0 && depth0['highlight-errors']),options={hash:{
    'text': ("jobLogs.content.fileContent"),
    'hasErrors': ("hasErrorInLogs")
  },hashTypes:{'text': "ID",'hasErrors': "ID"},hashContexts:{'text': depth0,'hasErrors': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "highlight-errors", options))));
  data.buffer.push("\n          ");
  return buffer;
  }

function program27(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "jobLogs.isRejected", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(28, program28, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  return buffer;
  }
function program28(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n              <div class=\"alert alert-danger\" role=\"alert\">\n                ");
  stack1 = helpers._triageMustache.call(depth0, "jobLogs.reason", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n              </div>\n            ");
  return buffer;
  }

function program30(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n      <div class=\"panel-heading\">\n        <h4 class=\"panel-title\">\n          <a  ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleCollapse", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" href=\"#\">\n            <i ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":toggle-icon :fa :fa-fw :fa-chevron-right view.collapsed::fa-rotate-90")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></i>\n            ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.script_details", options) : helperMissing.call(depth0, "t", "job.script_details", options))));
  data.buffer.push("\n          </a>\n        </h4>\n      </div>\n      <div id=\"scriptDetails\" class=\"panel-collapse collapse\">\n        <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":panel-body :body-title :body-title-contents fullscreen:fullscreen ")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n          ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.script_contents", options) : helperMissing.call(depth0, "t", "job.script_contents", options))));
  data.buffer.push(":\n          <div class=\"fullscreen-toggle pull-right\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "fullscreen", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" data-toggle=\"tooltip\" data-placement=\"bottom\" ");
  data.buffer.push(escapeExpression((helper = helpers.translateAttr || (depth0 && depth0.translateAttr),options={hash:{
    'title': ("editor.toggle_fullscreen")
  },hashTypes:{'title': "STRING"},hashContexts:{'title': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "translateAttr", options))));
  data.buffer.push("><i ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":fa :fa-lg fullscreen:fa-compress:fa-expand")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" ></i></div>\n        </div>\n          ");
  stack1 = helpers['if'].call(depth0, "scriptContents.isPending", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(33, program33, data),fn:self.program(31, program31, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <div class=\"panel-body body-title\">\n          ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "common.arguments", options) : helperMissing.call(depth0, "t", "common.arguments", options))));
  data.buffer.push(":\n        </div>\n        <div class=\"panel-body arguments-wrap\">\n          ");
  stack1 = helpers['if'].call(depth0, "argumentsArray", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(42, program42, data),fn:self.program(39, program39, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n      </div>\n    ");
  return buffer;
  }
function program31(depth0,data) {
  
  
  data.buffer.push("\n            <div class=\"panel-body\">\n              <div class=\"spinner-sm\"></div>\n            </div>\n          ");
  }

function program33(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "scriptContents.isFulfilled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(36, program36, data),fn:self.program(34, program34, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  return buffer;
  }
function program34(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n              <div class=\"editor-container\">\n                ");
  data.buffer.push(escapeExpression((helper = helpers['code-mirror'] || (depth0 && depth0['code-mirror']),options={hash:{
    'id': ("pig_script"),
    'content': ("scriptContents"),
    'readOnly': (true),
    'fullscreen': ("fullscreen")
  },hashTypes:{'id': "STRING",'content': "ID",'readOnly': "BOOLEAN",'fullscreen': "ID"},hashContexts:{'id': depth0,'content': depth0,'readOnly': depth0,'fullscreen': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "code-mirror", options))));
  data.buffer.push("\n                <div class=\"ui-resizable-handle ui-resizable-s\" id=\"sgrip\"><i class=\"fa fa-ellipsis-h\"></i></div>\n              </div>\n            ");
  return buffer;
  }

function program36(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n              ");
  stack1 = helpers['if'].call(depth0, "scriptContents.isRejected", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(37, program37, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program37(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <div class=\"alert alert-danger\" role=\"alert\">\n                 ");
  stack1 = helpers._triageMustache.call(depth0, "scriptContents.reason", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </div>\n              ");
  return buffer;
  }

function program39(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers.each.call(depth0, "argumentsArray", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(40, program40, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  return buffer;
  }
function program40(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n              <span class=\"label label-primary\">");
  stack1 = helpers._triageMustache.call(depth0, "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n            ");
  return buffer;
  }

function program42(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n            <div class=\"alert alert-info\" role=\"alert\">\n              ");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.no_arguments_message", options) : helperMissing.call(depth0, "t", "job.no_arguments_message", options))));
  data.buffer.push("\n            </div>\n          ");
  return buffer;
  }

  data.buffer.push("\n<div class=\"job-container\">\n  <h3>\n    ");
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" - <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":label jobSuccess:label-success jobError:label-danger jobInProgress:label-warning ")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "status", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n    ");
  stack1 = helpers['if'].call(depth0, "hasErrorInLogs", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </h3>\n\n    <div class=\"row\">\n\n      <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("jobInProgress:col-md-10:col-md-12 :progress-wrap")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n        ");
  data.buffer.push(escapeExpression((helper = helpers['job-progress'] || (depth0 && depth0['job-progress']),options={hash:{
    'job': ("content")
  },hashTypes:{'job': "ID"},hashContexts:{'job': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "job-progress", options))));
  data.buffer.push("\n      </div>\n      ");
  stack1 = helpers['if'].call(depth0, "jobInProgress", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </d\niv>\n  <table class=\"table job-info\">\n    <tbody>\n      <tr>\n        <td>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.jobId", options) : helperMissing.call(depth0, "t", "job.jobId", options))));
  data.buffer.push("</td>\n        <td>");
  stack1 = helpers._triageMustache.call(depth0, "jobId", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n      </tr>\n      <tr>\n        <td>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "job.started", options) : helperMissing.call(depth0, "t", "job.started", options))));
  data.buffer.push("</td>\n        <td>");
  data.buffer.push(escapeExpression((helper = helpers.showDate || (depth0 && depth0.showDate),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["ID","STRING"],data:data},helper ? helper.call(depth0, "dateStarted", "YYYY-MM-DD HH:mm", options) : helperMissing.call(depth0, "showDate", "dateStarted", "YYYY-MM-DD HH:mm", options))));
  data.buffer.push("</td>\n      </tr>\n    </tbody>\n  </table>\n\n    ");
  stack1 = helpers.view.call(depth0, "view.collapsePanel", {hash:{
    'class': ("panel panel-default"),
    'collapsed': ("jobResultsHidden")
  },hashTypes:{'class': "STRING",'collapsed': "ID"},hashContexts:{'class': depth0,'collapsed': depth0},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n\n    ");
  stack1 = helpers.view.call(depth0, "view.collapsePanel", {hash:{
    'classBinding': (":panel :panel-default"),
    'collapsed': ("jobLogsHidden")
  },hashTypes:{'classBinding': "STRING",'collapsed': "ID"},hashContexts:{'classBinding': depth0,'collapsed': depth0},inverse:self.noop,fn:self.program(20, program20, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n\n    ");
  stack1 = helpers.view.call(depth0, "view.collapsePanel", {hash:{
    'class': ("panel panel-default"),
    'hasEditor': (true)
  },hashTypes:{'class': "STRING",'hasEditor': "BOOLEAN"},hashContexts:{'class': depth0,'hasEditor': depth0},inverse:self.noop,fn:self.program(30, program30, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n</div>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/splash", function(exports, require, module) {
Ember.TEMPLATES["splash"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "storageTest", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  return buffer;
  }
function program2(depth0,data) {
  
  
  data.buffer.push("\n              <span class=\"glyphicon glyphicon-ok green\"></span>\n            ");
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n              <span class=\"glyphicon glyphicon-remove red\"></span>\n            ");
  }

function program6(depth0,data) {
  
  
  data.buffer.push("\n            <span class=\"glyphicon glyphicon-arrow-right\"></span>\n          ");
  }

function program8(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "hdfsTest", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "webhcatTest", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(13, program13, data),fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  return buffer;
  }
function program11(depth0,data) {
  
  
  data.buffer.push("\n                <span class=\"glyphicon glyphicon-ok green\"></span>\n            ");
  }

function program13(depth0,data) {
  
  
  data.buffer.push("\n                <span class=\"glyphicon glyphicon-remove red\"></span>\n            ");
  }

function program15(depth0,data) {
  
  
  data.buffer.push("\n              <span class=\"glyphicon glyphicon-arrow-right\"></span>\n          ");
  }

function program17(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n  <h3>Issues detected</h3>\n  <p>");
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "errors", {hash:{
    'unescaped': ("true")
  },hashTypes:{'unescaped': "STRING"},hashContexts:{'unescaped': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</p>\n  ");
  return buffer;
  }

function program19(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleStackTrace", "post", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n      ");
  stack1 = helpers['if'].call(depth0, "isExpanded", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(22, program22, data),fn:self.program(20, program20, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </a>\n    ");
  stack1 = helpers['if'].call(depth0, "isExpanded", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(24, program24, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program20(depth0,data) {
  
  
  data.buffer.push("\n          <span class=\"glyphicon glyphicon-collapse-down\"></span> Collapse Stack Trace\n      ");
  }

function program22(depth0,data) {
  
  
  data.buffer.push("\n          <span class=\"glyphicon glyphicon-expand\"></span> Expand Stack Trace\n      ");
  }

function program24(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n      <pre class=\"prettyprint\">\n        ");
  stack1 = helpers._triageMustache.call(depth0, "stackTrace", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </pre>\n    ");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"container-fluid\">\n  <h1>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "splash.welcome", options) : helperMissing.call(depth0, "t", "splash.welcome", options))));
  data.buffer.push("</h1>\n  <h2>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "splash.please_wait", options) : helperMissing.call(depth0, "t", "splash.please_wait", options))));
  data.buffer.push("</h2>\n\n  <div class=\"progress progress-striped active\">\n    <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'style': ("progressBarStyle")
  },hashTypes:{'style': "STRING"},hashContexts:{'style': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n    </div>\n  </div>\n\n  <table class=\"table\">\n    <tbody>\n      <tr>\n        <td>\n          ");
  stack1 = helpers['if'].call(depth0, "storageTestDone", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </td>\n        <td>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "splash.storage_test", options) : helperMissing.call(depth0, "t", "splash.storage_test", options))));
  data.buffer.push("</td>\n      </tr>\n\n      <tr>\n        <td>\n          ");
  stack1 = helpers['if'].call(depth0, "hdfsTestDone", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </td>\n        <td>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "splash.hdfs_test", options) : helperMissing.call(depth0, "t", "splash.hdfs_test", options))));
  data.buffer.push("</td>\n      </tr>\n\n      <tr>\n        <td>\n          ");
  stack1 = helpers['if'].call(depth0, "webhcatTestDone", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(15, program15, data),fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </td>\n        <td>");
  data.buffer.push(escapeExpression((helper = helpers.t || (depth0 && depth0.t),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "splash.webhcat_test", options) : helperMissing.call(depth0, "t", "splash.webhcat_test", options))));
  data.buffer.push("</td>\n      </tr>\n\n    </tbody>\n  </table>\n\n  ");
  stack1 = helpers['if'].call(depth0, "errors", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(17, program17, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  stack1 = helpers['if'].call(depth0, "stackTrace", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(19, program19, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n");
  return buffer;
  
});
module.exports = module.id;
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

Ember.I18n.translations = {
  'common':{
    'create': 'Create',
    'add':"Add",
    'edit':"Edit",
    'name':"Name",
    'path':"Path",
    'owner':"Owner",
    'save':"Save",
    'delete':"Delete",
    'created':"Created",
    'history':"History",
    'clone':"Clone",
    'cancel':"Cancel",
    'discard_changes':"Discard Changes",
    'arguments':"Arguments",
    'errorLog':"Stack Trace",
    'showErrorLog':"Show Stack Trace",
    'warning':"Warning",
    'close':"Close",
    'download':"Download",
    'show':'Show:',
    'actions':'Actions',
    'date':'Date',
    'success':'Success',
    'error':'Error',
    'copy':'Copy'
  },
  'scripts':{
    'script':"Script",
    'scripts':"Scripts",
    'newscript': "New Script",
    'title': "Name",
    'path': "Script HDFS Location (optional)",
    'not_run_message': "Not run",
    'noScripts': "No pig scripts have been created. To get started, click New Script.",
    'last_executed':'Last Executed',
    'last_results':'Last Results',
    'no_jobs_message':'This script has not been executed',
    'load_error':'Error loading scripts',
    'load_error_single':'Error loading script',
    'not_found':'Script not found',
    'modal':{
      'create_script':'New Script',
      'unsaved_changes_warning':'You have unsaved changes in script.',
      'script_title_placeholder': 'Script name',
      'file_path_placeholder':'/hdfs/path/to/pig/script',
      'file_path_hint':'Leave empty to create file automatically.',
      'copy_created_massage':'{{title}} created successfully.',
      'copy_created':'Copy Created',
      'continue_editing':'Continue Editing',
      'go_to_copy':'Go to Copy',

      'error_empty_title':'Name cannot be empty',

      'confirm_delete':'Confirm Delete',
      'confirm_delete_massage':'Are you sure you want to delete {{title}} script?'
    },
    'alert':{
      'file_not_found':'File not found',
      'arg_present':'Argument already present',
      'file_exist_error':'File already exist',
      'script_saved':'{{title}} saved!',
      'script_created':'{{title}} created',
      'script_deleted':'{{title}} deleted',
      'create_failed':'Failed to create script',
      'delete_failed':'Delete failed',
      'save_error':'Error while saving script',
      'save_error_reason':'{{message}}',
      'rename_unfinished':'Please rename script first.'
    }
  },
  'editor':{
    'title_updated':'Name updated',
    'pig_argument':'Pig argument',
    'pighelper':'PIG helper',
    'udfhelper':'UDF helper',
    'actions':'Actions',
    'save':'Save',
    'params':'Params',
    'arguments':'Arguments',
    'no_arguments_message':'This pig script has no arguments defined.',
    'execute':'Execute',
    'explain':'Explain',
    'syntax_check':'Syntax check',
    'execute_on_tez':'Execute on Tez',
    'toggle_fullscreen':'Toggle fullscreen (F11)'
  },
  'job':{
    'title': "Title",
    'name': "Name",
    'results':'Results',
    'logs':'Logs',
    'job_status':'Job status: ',
    'status':'Status',
    'jobId':'Job ID',
    'started':'Started',
    'noJobs': "No jobs to display",
    'kill_job': "Kill Job",
    'script_details': "Script Details",
    'script_contents': "Script contents",
    'no_arguments_message':'This job was executed without arguments.',
    'alert':{
      'job_started' :'Job started!',
      'job_killed' :'{{title}} job killed',
      'job_kill_error' :'Job kill failed',
      'start_filed' :'Job failed to start',
      'load_error' :'Error loading job. Reason: {{message}}',
      'stdout_error' :'Error loading STDOUT. \n Status: {{status}} Message: {{message}}',
      'stderr_error' :'Error loading STDERR. \n Status: {{status}} Message: {{message}}',
      'exit_error' :'Error loading EXITCODE. \n Status: {{status}} Message: {{message}}',
      'promise_error' :'Error loading file. \n Status: {{status}} Message: {{message}}',
      'job_deleted' :'Job deleted successfully',
      'delete_filed' :'Failed to delete job'
    },
    'job_results':{
      'stdout':'Stdout',
      'stderr':'Stderr',
      'exitcode':'Exit code',
      'stdout_loading':'Loading stdout...',
      'stderr_loading':'Loading stderr...',
      'exitcode_loading':'Loading exitcode...'
    },
    'modal':{
      'confirm_delete_massage':'Are you sure you want to delete {{title}} job?'
    }
  },
  'udfs':{
    'udfs':'UDFs',
    'create':'Create UDF',
    'load_error':'Error loading UDFs',
    'tooltips':{
      'path':'Path of this script file on HDFS'
    },
    'noUDFs': "No UDFs to display",
    'alert':{
      'udf_created':'{{name}} created',
      'udf_deleted':'{{name}} deleted',
      'create_failed':'Failed to create UDF',
      'delete_failed':'Delete failed'
    },
    'modal':{
      'create_udf':'Create UDF',
      'udf_name':'UDF name',
      'hdfs_path':'/hdfs/path/to/udf',
      'delete_udf':'Are you sure you want to delete {{title}} udf?'
    }
  },
  'history':{
    'duration':'Duration',
    'no_jobs_message':'No jobs was run',
    'load_error':'Error loading pig history.'
  },
  'splash':{
    'welcome':'Welcome to the Pig View',
    'please_wait':'Testing connection to services...please wait.',
    'storage_test':'Storage test',
    'hdfs_test':'HDFS test',
    'webhcat_test':'WebHCat test'
  }
};

});

require.register("views/pig", function(exports, require, module) {
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

var App = require('app');

App.PigView = Em.View.extend({
  hideScript:true,
  selectedBinding: 'controller.category',
  navs: [
    {name:'scripts',url:'pig',label: Em.I18n.t('scripts.scripts'),icon:'fa-file-code-o'},
    {name:'udfs',url:'pig.udfs',label:Em.I18n.t('udfs.udfs'),icon:'fa-plug'},
    {name:'history',url:'pig.history',label:Em.I18n.t('common.history'),icon:'fa-clock-o'}
  ],

  initToolip:function () {
    this.$('button.close_script').tooltip({title:Em.I18n.t('common.close'),placement:'bottom',container:'body'});
  }.on('didInsertElement'),

  showSideBar:function () {
    Em.run.later(this, function (show) {
      this.$('.nav-script-wrap').toggleClass('in',show);
    },!!this.get('controller.activeScript'),250);
  }.observes('controller.activeScript')
});

App.NavItemsView = Ember.CollectionView.extend({
  tagName: 'div',
  classNames:['list-group', 'nav-main'],
  content: [],
  mouseEnter:function  (argument) {
    this.get('parentView').$('.nav-script-wrap').addClass('reveal');
  },
  mouseLeave:function  (argument) {
    this.get('parentView').$('.nav-script-wrap').removeClass('reveal');
  },
  itemViewClass: Ember.Component.extend({
    tagName: 'a',
    layout: Em.Handlebars.compile(
      '<i class="fa fa-fw fa-2x {{unbound view.content.icon}}"></i> '+
      '<span>{{view.content.label}}</span>'
    ),
    classNames: ['list-group-item pig-nav-item text-left'],
    classNameBindings: ['isActive:active'],
    action: 'gotoSection',
    click: function() {
      this.sendAction('action',this.get('content'));
    },
    isActive: function () {
      return this.get('content.name') === this.get('parentView.parentView.selected');
    }.property('content.name', 'parentView.parentView.selected')
  })
});

});

require.register("views/pig/alert", function(exports, require, module) {
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

var App = require('app');

App.PigAlertView = Ember.View.extend({
  alertsView : Ember.CollectionView.extend({
    content:Em.computed.alias('controller.content'),
    itemViewClass: Ember.View.extend({
      classNames: ['alert fade in'],
      classNameBindings: ['alertClass'],
      attributeBindings:['dismiss:data-dismiss'],
      dismiss:'alert',
      templateName: 'partials/alert-content',
      didInsertElement:function () {
        this.$().bind('closed.bs.alert', Ember.run.bind(this, 'clearAlert'));

        if (this.get('content.status') != 'error') {
          Ember.run.debounce(this, 'close', 3000);
        }
      },
      close : function () {
        if (Em.isArray(this.$())) {
          this.$().alert('close');
        }
      },
      clearAlert:function () {
        return this.get('controller').send('removeAlertObject',this.get('content'));
      },
      alertClass: function () {
        var classes = {'success':'alert-success','error':'alert-danger','info':'alert-info'};
        return classes[this.get('content.status')];
      }.property('content.status')
    })
  })
});

});

require.register("views/pig/history", function(exports, require, module) {
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

var App = require('app');

App.PigHistoryView = Em.View.extend({
  initTooltips:function () {
    if ( this.$('td:last-child a')) {
      Em.run.next(this.addTooltip.bind(this));
    }
  }.on('didInsertElement').observes('controller.page','controller.content.@each'),
  addTooltip:function () {
    this.$('td:last-child a').tooltip({placement:'bottom'});
  },
  scriptLink:Em.Component.extend({
    tagName:'a',
    classNames:['scriptLink'],
    classNameBindings:['hasScript::inactive'],
    action:'goToScript',
    hasScript:function () {
      var all = this.get('allIds'),
          current = (this.get('scriptId'))?this.get('scriptId').toString():'';
      return all.contains(current);
    }.property('scriptId'),
    click:function () {
      if (this.get('hasScript')) {
        this.sendAction('action',this.get('scriptId'));
      }
    }
  })
});

});

require.register("views/pig/loading", function(exports, require, module) {
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

var App = require('app');

App.LoadingView = Em.View.extend({
  template: Em.Handlebars.compile('<div class="spinner-bg center-block"></div>')
});

});

require.register("views/pig/scripts", function(exports, require, module) {
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

var App = require('app');

App.PigScriptsView = Em.View.extend({
});

});

require.register("views/pig/udfs", function(exports, require, module) {
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

var App = require('app');

App.PigUdfsView = Em.View.extend({
  templateName: 'pig/udfs'
});

});

require.register("views/script/edit", function(exports, require, module) {
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

var App = require('app');

App.ScriptEditView = Em.View.extend({
  didInsertElement:function () {
    $('.file-path, .fullscreen-toggle').tooltip();
  },
  willClearRender:function () {
    this.set("controller.fullscreen", false);
  },
  showTitleWarn:function () {
    if (this.get('controller.titleWarn')) {
      this.$('#title').tooltip({
        trigger:"manual",
        placement:"bottom",
        title:Em.I18n.t('scripts.alert.rename_unfinished')
      }).tooltip('show');
    }
  }.observes('controller.titleWarn'),
  actions:{
    insertUdf:function (udf) {
      var code = this.get('controller.content.pigScript.fileContent'),
      registered = 'REGISTER ' + udf.get('path') + '\n' + code;
      this.set('controller.content.pigScript.fileContent',registered);
    }
  },
  focusInput:Em.TextField.extend({
    becomeFocused: function () {
      this.$().focus().val(this.$().val());
    }.on('didInsertElement'),
    cancel:function (argument) {
      this.sendAction('action','cancel');
    }
  })
});

});

require.register("views/script/job", function(exports, require, module) {
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

var App = require('app');

App.ScriptJobView = Em.View.extend({
  collapsePanel: Em.View.extend({
    actions:{
      toggleCollapse:function () {
        this.toggleProperty('collapsed');
      }
    },
    collapsed:true,
    collapseControl: function () {
      this.$('.collapse').collapse(this.get('collapsed') ? 'hide' : 'show');
    }.observes('collapsed'),
    initCollapse:function () {
      this.$('.collapse').collapse({
        toggle: !this.get('collapsed')
      })
    }.on('didInsertElement'),
    hasEditor:false,
    fixEditor:function () {
      if (this.get('hasEditor')) {
        this.$().on('shown.bs.collapse', function (e) {
          var cme = this.$('.CodeMirror').get(0);
          if (cme && cme.CodeMirror) {
            cme.CodeMirror.setSize(null, this.$('.editor-container').height());
          }
        }.bind(this));
      }
    }.on('didInsertElement')
  }),
  bindTooltips:function () {
    $('.fullscreen-toggle').tooltip();
  }.on('didInsertElement')
});

});


//# sourceMappingURL=app.js.map