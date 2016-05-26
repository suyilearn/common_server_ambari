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
require.register("test/unit/components/code_mirror_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


moduleForComponent('code-mirror', 'App.CodeMirrorComponent',{
  setup:function (container) {
    container.register('model:file', App.File);
    container.register('model:script', App.Script);
    container.register('store:main', DS.Store);
    container.register('adapter:application', DS.FixtureAdapter);
    container.register('serializer:application', DS.RESTSerializer);
    container.register('transform:boolean', DS.BooleanTransform);
    container.register('transform:date',    DS.DateTransform);
    container.register('transform:number',  DS.NumberTransform);
    container.register('transform:string',  DS.StringTransform);
    container.register('transform:isodate',  App.IsodateTransform);
  }
});

test('fill editor with script',function () {
  expect(1);
  var editor = this.subject(),
      store = this.container.lookup('store:main');

  this.append();

  Em.run(function () {
    var script = store.createRecord('file', {fileContent:'test_content'});
    editor.set('content',script);
    stop();
    script.save().then(function () {
      start();
      script.set('isFulfilled',true);
      equal(editor.get('codeMirror').getValue(),'test_content');
    });
  });
});

test('can toggle fullscreen mode',function  () {
  var editor = this.subject();
  this.append();

  Em.run(function() {
    var fs_state = editor.get('codeMirror').getOption('fullScreen');

    Em.run(function() {
      editor.toggleProperty('fullscreen');
    });

    Em.run.next(function() {
      equal(editor.get('codeMirror').getOption('fullScreen'),!fs_state);
    });
  });
});

test('sync between script and editor content', function() {
  expect(2);
  var editor = this.subject(),
      store = this.container.lookup('store:main');

  this.append();

  var script,
      cm = editor.get('codeMirror'),
      test_content = 'content',
      test_addition = 'addition',
      final_content = test_content + test_addition;

  Em.run(function() {
    script = store.createRecord('file', {fileContent:test_content});
  });

  Em.run(function () {
    editor.set('content',script);
    cm.setCursor({line:0,ch:test_content.length});
    cm.replaceRange(test_addition,{line:0,ch:test_content.length},{line:0,ch:test_content.length});
  });

  equal(cm.getCursor().ch,final_content.length,'script content updates when editor changes');

  Em.run(function() {
    script.set('fileContent',test_addition);
  });

  equal(cm.getValue(),test_addition, 'editor content updates when script changes');

});



});

require.register("test/unit/components/job_progress_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


moduleForComponent('job-progress', 'App.JobProgressComponent', {
  setup:function (container) {
    container.register('model:file', App.File);
    container.register('model:job', App.Job);
    container.register('store:main', DS.Store);
  }
});

test('update progress bar', function () {
  var job,
      bar,
      wrap,
      store = this.container.lookup('store:main');

  Em.run(function() {
    job = store.createRecord('job',{percentComplete:0});
  });

  wrap = this.subject({job:job});
  this.append();
  bar = wrap.$().find('.progress-bar');

  ok((100 * parseFloat(bar.css('width')) / parseFloat(bar.parent().css('width'))) == 0);

  Em.run(function() {
    job.set('percentComplete',100);
  });

  andThen(function() {
    ok((100 * parseFloat(bar.css('width')) / parseFloat(bar.parent().css('width'))) == 100);
  });

});



});

require.register("test/unit/controllers/pig_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


moduleFor('controller:pig', 'App.PigController', {
  needs:['controller:scriptEdit','controller:script','model:script'],
  setup:function () {
    var store = this.container.lookup('store:main');
    var _this = this;
    Ember.run(function() {
      store.createRecord('script',{pigScript:store.createRecord('file')});
      _this.subject({
        model: store.all('script')
      })
    });
  }
},function (container) {
  container.register('model:file', App.File);
  container.register('model:script', App.Script);
  container.register('store:main', DS.Store);
  container.register('adapter:application', DS.FixtureAdapter);
  container.register('serializer:application', DS.RESTSerializer);
  container.register('transform:boolean', DS.BooleanTransform);
  container.register('transform:date',    DS.DateTransform);
  container.register('transform:number',  DS.NumberTransform);
  container.register('transform:string',  DS.StringTransform);
  container.register('transform:isodate',  App.IsodateTransform);
});

test('Can get active Script after active Script Id script is set', function () {
  var pig = this.subject();
  var script = pig.get('content.firstObject');

  Ember.run(function() {
    pig.set('activeScriptId', script.get('id'));
    deepEqual(script, pig.get('activeScript'), 'script is set');
  });
});

test('Can\'t save Script while ranaming', function () {
  var pig = this.subject();
  var se = pig.get('controllers.scriptEdit');
  var script = pig.get('content.firstObject');

  Em.run(function () {
    stop();
    script.save().then(function () {
      start();
      se.set('isRenaming',true);
      pig.set('activeScriptId', script.get('id'));
      equal(pig.get('saveEnabled'),false,'save is disabled')
    });
  })
});

test('scriptDirty property test', function () {
  var pig = this.subject();
  var script = pig.get('content.firstObject');

  Em.run(function () {
    stop();
    script.save().then(function () {
      start();
      pig.set('activeScriptId', script.get('id'));
      script.set('templetonArguments','test_agrument');
      equal(pig.get('scriptDirty'),true,'scriptDirty is True when Script is modified');
      script.set('pigScript.fileContent','test_content');
      equal(pig.get('scriptDirty'),true,'scriptDirty is True when both Script and File is modified');
      script.rollback();
      equal(pig.get('scriptDirty'),true,'scriptDirty is True when File is modified');
      script.get('pigScript').then(function (file) {
        file.rollback();
        equal(pig.get('scriptDirty'),false,'scriptDirty is False when File and Script is not modified');
      });
    });
  })
});

});

require.register("test/unit/controllers/script_edit_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


moduleFor('controller:scriptEdit', 'App.ScriptEditController', {
  needs:['controller:script'],
  setup:function () {
    var store = this.container.lookup('store:main');
    var _this = this;
    Ember.run(function() {
      _this.subject({
        model: store.createRecord('script',{pigScript:store.createRecord('file')})
      });
    });
  }
},function (container) {
  container.register('model:file', App.File);
  container.register('model:script', App.Script);
  container.register('model:job', App.Job);
  container.register('store:main', DS.Store);
  container.register('adapter:application', DS.FixtureAdapter);
  container.register('serializer:application', DS.RESTSerializer);
  container.register('transform:boolean', DS.BooleanTransform);
  container.register('transform:date', DS.DateTransform);
  container.register('transform:number', DS.NumberTransform);
  container.register('transform:string', DS.StringTransform);
  container.register('transform:isodate', App.IsodateTransform);
});

test('script parameters parsing test',function () {
  var controller = this.subject();

  Em.run(function () {
    controller.set('content.pigScript.fileContent','%test_param%');
    equal(controller.get('pigParams.length'),1,'can set pig parameter');
    equal(controller.get('pigParams.firstObject.title'), 'test_param', 'pig parameter parsed right');
    controller.set('content.pigScript.fileContent','%test_param% %test_param%');
    equal(controller.get('pigParams.length'),1,'controller has no pig parameter duplicates');
  });

});

test('run job without parameters',function () {
  expect(3);
  var controller = this.subject();
  var store = this.container.lookup('store:main');

  Em.run(function () {

    var file = store.createRecord('file', {
      id:1,
      fileContent:'test_content'
    });

    var script = store.createRecord('script',{
      id:1,
      templetonArguments:'-test_argument',
      title:'test_script',
      pigScript:file
    });

    controller.set('model',script);
    controller.set('store',store);

    stop();

    controller.prepareJob('execute',[file,script]).then(function (job) {
      deepEqual(job.toJSON(),{
        title: 'test_script',
        jobType: null,
        pigScript: '1',
        scriptId: 1,
        templetonArguments: '-test_argument',
        dateStarted: undefined,
        duration: null,
        forcedContent: null,
        jobId: null,
        owner: null,
        percentComplete: null,
        sourceFile: null,
        sourceFileContent: null,
        status: null,
        statusDir: null
      },'execute processed correctly');

      return controller.prepareJob('explain',[file,script]);
    }).then(function (job) {
      deepEqual(job.toJSON(),{
        title: 'Explain: "test_script"',
        jobType: 'explain',
        pigScript: null,
        scriptId: 1,
        templetonArguments: '',
        dateStarted: undefined,
        duration: null,
        forcedContent: 'explain -script ${sourceFile}',
        jobId: null,
        owner: null,
        percentComplete: null,
        sourceFile: '1',
        sourceFileContent: null,
        status: null,
        statusDir: null
      },'explain processed correctly');

      return controller.prepareJob('syntax_check',[file,script]);
    }).then(function (job) {
      deepEqual(job.toJSON(),{
        title: 'Syntax check: "test_script"',
        jobType: 'syntax_check',
        pigScript: '1',
        scriptId: 1,
        templetonArguments: '-test_argument\t-check',
        dateStarted: undefined,
        duration: null,
        forcedContent: null,
        jobId: null,
        owner: null,
        percentComplete: null,
        sourceFile: null,
        sourceFileContent: null,
        status: null,
        statusDir: null
      },'syntax check processed correctly');
      start();
    });
  });
});

test('run job with parameters',function () {
  expect(3);
  var controller = this.subject();
  var store = this.container.lookup('store:main');

  Em.run(function () {

    var file = store.createRecord('file',{
      id:1,
      fileContent:'test_content %test_parameter%'
    });

    var script = store.createRecord('script',{
      id:1,
      templetonArguments:'-test_argument',
      title:'test_script',
      pigScript:file
    });

    controller.get('pigParams').pushObject(Em.Object.create({param:'%test_parameter%',value:'test_parameter_value',title:'test_parameter'}));
    controller.set('model',script);
    controller.set('store',store);

    stop();

    controller.prepareJob('execute',[file,script]).then(function (job) {
      deepEqual(job.toJSON(),{
        title: 'test_script',
        jobType: null,
        pigScript: null,
        scriptId: 1,
        templetonArguments: '-test_argument',
        dateStarted: undefined,
        duration: null,
        forcedContent: 'test_content test_parameter_value',
        jobId: null,
        owner: null,
        percentComplete: null,
        sourceFile: null,
        sourceFileContent: null,
        status: null,
        statusDir: null
      },'execute with parameters processed correctly');

      return controller.prepareJob('explain',[file,script]);
    }).then(function (job) {
      deepEqual(job.toJSON(),{
        title: 'Explain: "test_script"',
        jobType: 'explain',
        pigScript: null,
        scriptId: 1,
        templetonArguments: '',
        dateStarted: undefined,
        duration: null,
        forcedContent: 'explain -script ${sourceFile}',
        jobId: null,
        owner: null,
        percentComplete: null,
        sourceFile: null,
        sourceFileContent: 'test_content test_parameter_value',
        status: null,
        statusDir: null
      },'explain with parameters processed correctly');

      return controller.prepareJob('syntax_check',[file,script]);
    }).then(function (job) {
      deepEqual(job.toJSON(),{
        title: 'Syntax check: "test_script"',
        jobType: 'syntax_check',
        pigScript: null,
        scriptId: 1,
        templetonArguments: '-test_argument\t-check',
        dateStarted: undefined,
        duration: null,
        forcedContent: 'test_content test_parameter_value',
        jobId: null,
        owner: null,
        percentComplete: null,
        sourceFile: null,
        sourceFileContent: null,
        status: null,
        statusDir: null
      },'syntax check with parameters processed correctly');
      start();
    });
  });
});

test('rename test',function () {
  expect(3);
  var controller = this.subject();
  var script = controller.get('content');
  stop();

  Em.run(function () {
    var original_title = 'test_title';

    script.set('title',original_title);

    script.save().then(function (script) {
      start();
      controller.send('rename','ask');

      ok(controller.get('oldTitle') == original_title && controller.get('isRenaming'), 'start renaming ok');

      script.set('title','wrong_title');

      controller.send('rename','cancel');

      ok(script.get('title') == original_title && controller.get('oldTitle') == '' && !controller.get('isRenaming'),'undo renaming ok');

      controller.send('rename','ask');
      script.set('title','right_title');
      stop();
      controller.send('rename','right_title');

      script.didUpdate = function () {
        start();
        ok(script.get('title') == 'right_title' && controller.get('oldTitle') == '' && !controller.get('isRenaming'),'rename done');
      };
    });
  });
});

test('add templeton arguments',function () {
  expect(4);
  var controller = this.subject();
  var script = controller.get('content');

  Em.run(function () {
    var arg1 = '-test_argument',
        arg2 = '-other_test_argument';

    controller.set('tmpArgument',arg1);
    controller.send('addArgument',arg1);
    ok(script.get('templetonArguments') == arg1 && controller.get('tmpArgument') == '','can add argument');

    controller.set('tmpArgument',arg1);
    controller.send('addArgument',arg1);
    ok(script.get('templetonArguments') == arg1 && controller.get('tmpArgument') == arg1,'can\'t add duplicates');

    controller.set('tmpArgument',arg2);
    controller.send('addArgument',arg2);
    ok((script.get('templetonArguments') == arg1+'\t'+arg2 || script.get('templetonArguments') == arg2+'\t'+arg1) && controller.get('tmpArgument') == '','can add more arguments');

    controller.send('removeArgument',arg2);
    ok(script.get('templetonArguments') == arg1, 'can remove argument');
  });
});

});

require.register("test/unit/controllers/script_history_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


moduleFor('controller:scriptHistory', 'App.ScriptHistoryController');

test('logs action',function () {
  var controller = this.subject();
  var job = Em.Object.create({isJob:true});

  var targetObject = {
    send: function(action,modalName,job){
      ok(action =="openModal" && modalName == "logDownload" && job.get('isJob'));
    }
  };

  controller.set('target', targetObject);

  controller.send('logsPopup',job);

});

test('results action',function () {
  var controller = this.subject();
  var job = Em.Object.create({isJob:true});

  var targetObject = {
    send: function(action,modalName,job){
      ok(action =="openModal" && modalName == "resultsDownload" && job.get('isJob'));
    }
  };

  controller.set('target', targetObject);

  controller.send('resultsPopup',job);

});

test('delete action',function () {
  var controller = this.subject();
  var job = Em.Object.create({isJob:true});

  var targetObject = {
    send: function(action,modalName,job){
      ok(action =="openModal" && modalName == "deleteJob" && job.get('isJob'));
    }
  };

  controller.set('target', targetObject);

  controller.send('deleteJob',job);

});

});

require.register("test/unit/controllers/script_job_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


moduleFor('controller:scriptJob', 'App.ScriptJobController',{},function (container) {
  container.register('model:file', App.File);
  container.register('model:script', App.Script);
  container.register('model:job', App.Job);
  container.register('store:main', DS.Store);
  container.register('adapter:application', DS.FixtureAdapter);
  container.register('serializer:application', DS.RESTSerializer);
  container.register('transform:boolean', DS.BooleanTransform);
  container.register('transform:date', DS.DateTransform);
  container.register('transform:number', DS.NumberTransform);
  container.register('transform:string', DS.StringTransform);
  container.register('transform:isodate', App.IsodateTransform);
});

test('filename prefix',function () {
  var _this = this,
      controller,
      store = this.container.lookup('store:main'),
      testId = 'job_1234567890000_0000';

  Em.run(function () {
    controller = _this.subject({
      model: store.createRecord('job',{jobId:testId})
    });
    ok(controller.get('suggestedFilenamePrefix') == testId);
  });

});

test('get script content',function () {
  var _this = this,
      controller,
      store = this.container.lookup('store:main');

  Em.run(function () {
    controller = _this.subject({
      model: store.createRecord('job',{pigScript:store.createRecord('file',{fileContent:'test_content'})})
    });
    controller.get('scriptContents').then(function (scriptContents) {
      ok(controller.get('scriptContents.isFulfilled') && controller.get('scriptContents.fileContent') == 'test_content','file loaded');
    });
    ok(controller.get('scriptContents.isPending'), 'file is loading');
  });

});

test('toggle fullscreen', function () {
  var controller = this.subject();

  Em.run(function () {
    controller.send('fullscreen');
    ok(controller.get('fullscreen'));
  });
});

});

require.register("test/unit/controllers/script_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


moduleFor('controller:script', 'App.ScriptController',
  {
    needs:['controller:pig','controller:scriptEdit'],
    teardown:function (container) {
      container.lookup('store:main').unloadAll('job');
      container.lookup('store:main').unloadAll('script');
      container.lookup('store:main').unloadAll('file');
    }
  },
  function (container) {
    container.register('model:file', App.File);
    container.register('model:script', App.Script);
    container.register('model:job', App.Job);
    container.register('store:main', DS.Store);
    container.register('adapter:application', DS.FixtureAdapter);
    container.register('serializer:application', DS.RESTSerializer);
    container.register('transform:boolean', DS.BooleanTransform);
    container.register('transform:date', DS.DateTransform);
    container.register('transform:number', DS.NumberTransform);
    container.register('transform:string', DS.StringTransform);
    container.register('transform:isodate', App.IsodateTransform);
  }
);

App.Job.reopenClass({
  FIXTURES: [
    { id: 1, status: 'SUBMITTED', scriptId:1, title: 'test_job'},
    { id: 2, status: 'SUBMITTED', scriptId:1, title: 'test_job'},
    { id: 3, status: 'SUBMITTED', scriptId:2, title: 'test_job'}
  ]
});

App.Script.reopenClass({
  FIXTURES: [
    { id: 1 },
    { id: 2 },
    { id: 3 }
  ]
});

test('polling starts when activeJobs is set',function () {
  expect(1);
  var controller = this.subject(),
      store = this.container.lookup('store:main');
  Em.run(function () {
    stop();
    store.find('job',1).then(function (job) {
      start();
      controller.set('activeJobs',[job]);
      ok(controller.get('pollster.timer'));
    });
  });
});

test('reset activeJobs when activeScript id changes',function () {
  expect(1);
  var controller = this.subject(),
      store = this.container.lookup('store:main');
  var pig = controller.get('controllers.pig');


  var scripts = store.find('script');
  var jobs = store.find('job');
  Em.run(function () {
    stop();
    Em.RSVP.all([scripts,jobs]).then(function () {
      start();
      var initialJobs = jobs.filterBy('scriptId',1);

      pig.set('model',scripts);
      pig.set('activeScriptId',1);
      controller.set('activeJobs',initialJobs);

      pig.set('activeScriptId',2);

      ok(Em.isEmpty(controller.get('activeJobs')));
    });
  });
});

test('tabs test',function () {
  expect(5);
  var controller = this.subject(),
      store = this.container.lookup('store:main'),
      pig = controller.get('controllers.pig');

  stop();
  store.find('job').then(function (jobs) {
    start();
    Em.run(function () {
      ok(controller.get('tabs.length')==2,'start with two tabs');

      controller.get('activeJobs').pushObject(jobs.objectAt(0));
      stop();
      Em.run.next(function () {
        start();
        ok(controller.get('tabs.length') == 3, 'added new tab for active job');

        jobs.objectAt(0).set('status','RUNNING');
        ok(controller.get('jobTabs.firstObject.label').toUpperCase().match(/RUNNING$/), 'label updates on job status change');

        controller.get('activeJobs').pushObject(jobs.objectAt(1));
        stop();
        Em.run.next(function () {
          start();
          ok(controller.get('tabs.length') == 4, 'added one more tab for active job');

          pig.set('activeScriptId',2);

          stop();
          Em.run.next(function () {
            start();
            ok(controller.get('tabs.length') == 2, 'reset tabs on script change');
          })
        });
      });
    });
  });
});

});

require.register("test/unit/models/job_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


moduleForModel('job', 'App.Job',{
  needs:['model:file']
});

test('file relationship', function() {
  expect(2);
  var Job = this.store().modelFor('job'),
      relationship = Ember.get(Job, 'relationshipsByName').get('pigScript');

  equal(relationship.kind, 'belongsTo');
  equal(relationship.type.typeKey, App.File.typeKey);
});

test('duration format',function() {
  expect(3);
  var job = this.subject();

  Em.run(function(){
    job.set('duration', 60);
  });

  equal(job.get('durationTime'),"1 min, 0 sec");

  Em.run(function(){
    job.set('duration', 60*60);
  });

  equal(job.get('durationTime'),"1 hrs, 0 min, 0 sec");

  Em.run(function(){
    job.set('duration', 60*60*24);
  });

  equal(job.get('durationTime'),"24 hrs, 0 min, 0 sec");
});

test('percentStatus',function() {
  expect(2);
  var job = this.subject();

  Em.run(function(){
    job.setProperties({'percentComplete': 50,'status':'RUNNING'});
  });

  equal(job.get('percentStatus'),50);

  Em.run(function(){
    job.set('status','FAILED');
  });

  equal(job.get('percentStatus'),100);

});

test('setting argumets array property',function () {
  var job = this.subject(),
      args = job.get('argumentsArray');

  ok(args.length === 0 && !job.get('templetonArguments'));

  Em.run(function(){
    job.set('argumentsArray',args.pushObject('test_agr') && args);
  });

  ok(job.get('argumentsArray').length == 1 && job.get('templetonArguments') == 'test_agr')
});


});

require.register("test/unit/models/script_test", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


moduleForModel('script', 'App.Script',{
  needs:['model:file']
});

test('setting argumets array property',function () {
  var script = this.subject(),
      args = script.get('argumentsArray');

  ok(args.length === 0 && !script.get('templetonArguments'));

  Em.run(function(){
    script.set('argumentsArray',args.pushObject('test_agr') && args);
  });

  ok(script.get('argumentsArray').length == 1 && script.get('templetonArguments') == 'test_agr')
});

test('file relationship', function() {
  var Script = this.store().modelFor('script'),
      relationship = Ember.get(Script, 'relationshipsByName').get('pigScript');

  equal(relationship.kind, 'belongsTo');
  equal(relationship.type.typeKey, App.File.typeKey);
});

test('blank title test',function () {
  expect(4);
  var script = this.subject();

  Em.run(function(){
    script.set('title','');
  });

  ok(script.get('isBlankTitle'),'script with empty string title is falsy');

  Em.run(function(){
    script.set('title',' ');
  });

  ok(script.get('isBlankTitle'),'script with whitespase title is falsy');

  Em.run(function(){
    script.set('title','\t');
  });

  ok(script.get('isBlankTitle'),'script with tabulation title is falsy');

  Em.run(function(){
    script.set('title','test_title');
  });

  ok(!script.get('isBlankTitle'),'script with non-whitespace title is truthy');
});

});


//# sourceMappingURL=test.js.map