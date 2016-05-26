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
require.register("adapter", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App = require('app');

function promiseArray(promise, label) {
  return Ember.ArrayProxy.extend(Ember.PromiseProxyMixin).create({
    promise: Ember.RSVP.Promise.cast(promise, label)
  });
}


function serializerForAdapter(adapter, type) {
  var serializer = adapter.serializer,
      defaultSerializer = adapter.defaultSerializer,
      container = adapter.container;

  if (container && serializer === undefined) {
    serializer = serializerFor(container, type.typeKey, defaultSerializer);
  }

  if (serializer === null || serializer === undefined) {
    serializer = {
      extract: function(store, type, payload) { return payload; }
    };
  }

  return serializer;
}

function serializerFor(container, type, defaultSerializer) {
  return container.lookup('serializer:'+type) ||
                 container.lookup('serializer:application') ||
                 container.lookup('serializer:' + defaultSerializer) ||
                 container.lookup('serializer:-default');
}

function _listdir(adapter, store, type, query, recordArray) {
  var promise = adapter.listdir(store, type, query, recordArray),
      serializer = serializerForAdapter(adapter, type),
      label = "";

  return Ember.RSVP.Promise.cast(promise, label).then(function(adapterPayload) {
    var payload = serializer.extract(store, type, adapterPayload, null, 'findAll');

    Ember.assert("The response from a findQuery must be an Array, not " + Ember.inspect(payload), Ember.typeOf(payload) === 'array');

    recordArray.load(payload);
    return recordArray;
  }, null, "DS: Extract payload of findQuery " + type);
}

function _move(adapter, store, record, query) {
  var type = store.modelFor('file'),
      promise = adapter.move(store, type, record, query),
      serializer = serializerForAdapter(adapter, type),
      label = "";

  return promise.then(function(adapterPayload) {
    var payload;

    if (adapterPayload) {
      payload = serializer.extractSingle(store, type, adapterPayload);
    } else {
      payload = adapterPayload;
    }

    //TODO very shady activity :/
    if (typeof record == 'object') {
      store.unloadRecord(record);
    }

    return store.push('file', payload);
  }, function(reason) {

    throw reason;
  }, label);
}

function _mkdir(adapter, store, type, query) {
  var promise = adapter.mkdir(store, type, query),
      serializer = serializerForAdapter(adapter, type),
      label = "";

  return promise.then(function(adapterPayload) {
    var payload;

    if (adapterPayload) {
      payload = serializer.extractSingle(store, type, adapterPayload);
    } else {
      payload = adapterPayload;
    }

    return store.push('file', payload);
  }, function(reason) {
    throw reason;
  }, label);
}

function _remove(adapter, store, record, query, toTrash) {
  var type = record.constructor;
  var method = (toTrash)?'moveToTrash':'remove';
  var promise = adapter[method](store, type, query),
      serializer = serializerForAdapter(adapter, type),
      label = "";

  return promise.then(function(adapterPayload) {
    store.unloadRecord(record);
    return record;
  }, function(reason) {
    if (reason instanceof DS.InvalidError) {
      store.recordWasInvalid(record, reason.errors);
    } else {
      record.rollback();
      //store.recordWasError(record, reason);
    }

    throw reason;
  }, label);
}

Ember.Inflector.inflector.uncountable('fileops');
Ember.Inflector.inflector.uncountable('download');
Ember.Inflector.inflector.uncountable('upload');

function getNamespaceUrl() {
  var parts = window.location.pathname.match(/\/[^\/]*/g);
  var view = parts[1];
  var version = '/versions' + parts[2];
  var instance = parts[3];
  if (parts.length == 4) { // version is not present
    instance = parts[2];
    version = '';
  }
  return 'api/v1/views' + view + version + '/instances' + instance + '/';
}

App.ApplicationStore = DS.Store.extend({
  adapter: DS.RESTAdapter.extend({
    namespace: getNamespaceUrl() + 'resources/files',
    headers: {
      'X-Requested-By': 'ambari'
    },

    /**
      @method ajaxOptions
      @param {String} url
      @param {String} type The request type GET, POST, PUT, DELETE etc.
      @param {Object} hash
      @return {Object} hash
    */
    ajaxOptions: function(url, type, options) {
      var hash = options || {};
      hash.url = url;
      hash.type = type;
      hash.dataType = 'json';
      hash.context = this;

      if (hash.data && type !== 'GET') {
        hash.contentType = 'application/json; charset=utf-8';
        hash.data = JSON.stringify(hash.data);
      }

      var headers = this.get('headers');

      if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!navigator.userAgent.match(/Trident.*rv[ :]*11\./))) {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
      }

      if (headers !== undefined) {
        hash.beforeSend = function (xhr) {
          Ember.keys(headers).forEach(function (key) {
            xhr.setRequestHeader(key, headers[key]);
          });
        };
      }

      return hash;
    },
    listdir: function(store, type, query) {
      return this.ajax(this.buildURL('fileops','listdir'), 'GET', { data: query });
    },
    move:function (store, type, record, query) {
      return this.ajax(this.buildURL('fileops','rename'), 'POST', { data: query });
    },
    updateRecord:function (store, type, record) {
      var query = {
        "path":record.get('path'),
        "mode":record.get('permission')
      };
      return this.ajax(this.buildURL('fileops','chmod'), 'POST', { data: query });
    },
    mkdir:function (store, type, query) {
      return this.ajax(this.buildURL('fileops','mkdir'), 'PUT', { data: query });
    },
    remove:function (store, type, query) {
      return this.ajax(this.buildURL('fileops','remove'), 'DELETE', { data: query });
    },
    moveToTrash:function (store, type, query) {
      return this.ajax(this.buildURL('fileops','moveToTrash'), 'DELETE', { data: query });
    },
    downloadUrl:function (option, query) {
      return [this.buildURL('download',option),Em.$.param(query)].join('?');
    },
    linkFor:function (option, query) {
      return this.ajax(this.buildURL('download',[option,'generate-link'].join('/')), 'POST', { data: query });
    }
  }),
  listdir:function (path) {
    var query = {path: path};
    var type = this.modelFor('file');
    var array = this.recordArrayManager
      .createAdapterPopulatedRecordArray(type, query);
    this.recordArrayManager.registerFilteredRecordArray(array, type);

    var adapter = this.adapterFor(type);

    Ember.assert("You tried to load a query but you have no adapter (for " + type + ")", adapter);
    Ember.assert("You tried to load a query but your adapter does not implement `listdir`", adapter.listdir);

    return promiseArray(_listdir(adapter, this, type, query, array));
  },
  move:function (record, path) {
    var oldpath = (typeof record === 'string')?record:record.get('id');
    var query = {
      "src":oldpath,
      "dst":path
    };
    var promiseLabel = "DS: Model#move " + this;
    var resolver = Ember.RSVP.defer(promiseLabel);
    var adapter = this.adapterFor(record.constructor);

    resolver.resolve(_move(adapter, this, record, query));

    return DS.PromiseObject.create({ promise: resolver.promise });
  },
  chmod:function (record, path) {
    return record.save();
  },
  mkdir:function (path) {
    var query = {
      "path":path
    };
    var type = this.modelFor('file');
    var promiseLabel = "DS: Model#mkdir " + this;
    var resolver = Ember.RSVP.defer(promiseLabel);
    var adapter = this.adapterFor(type);

    resolver.resolve(_mkdir(adapter, this, type, query));

    return DS.PromiseObject.create({ promise: resolver.promise });
  },
  remove:function (record, toTrash) {
    var query = {
      "path":record.get('path'),
      "recursive":true
    };
    var type = this.modelFor('file');
    var promiseLabel = "DS: Model#remove " + this;
    var resolver = Ember.RSVP.defer(promiseLabel);
    var adapter = this.adapterFor(type);

    record.deleteRecord();
    resolver.resolve(_remove(adapter, this, record, query, toTrash));

    return DS.PromiseObject.create({ promise: resolver.promise });
  },
  /**
   * get dowload link
   * @param  {Array} files     records for download
   * @param  {String} option            browse, zip or concat
   * @param  {Boolean} downloadArg
   * @return {Promise}
   */
  linkFor:function (files, option, downloadArg, checkperm) {
    var resolver = Ember.RSVP.defer('promiseLabel');
    var query, adapter = this.adapterFor(this.modelFor('file')),
        download = downloadArg || true,
        checkPermission = checkperm || false;
        option = option || "browse";

    if (option == 'browse') {
      query = { "path": (files.get('firstObject.path') || files.get('id')), "download": download, "checkperm": checkPermission };
      resolver.resolve(adapter.downloadUrl('browse',query));
      return resolver.promise;
    }

    query = {
      "entries": [],
      "download": download
    };

    files.forEach(function (item) {
      query.entries.push(item.get('path'));
    });

    resolver.resolve(adapter.linkFor(option, query));

    return resolver.promise.then(function(response) {
      return adapter.downloadUrl(option,response);
    }, function(reason) {
      throw reason;
    });
  }
});

App.FileSerializer = DS.RESTSerializer.extend({
  primaryKey:'path',
  extractSingle: function(store, type, payload, id, requestType) {
    payload = {'files': payload};
    return this._super(store, type, payload, id, requestType);
  },
  extractChmod:function(store, type, payload, id, requestType) {
    return this.extractSingle(store, type, payload, id, requestType);
  }
});

App.Uploader = Ember.Uploader.create({
  url: '',
  type:'PUT',
  upload: function(file,extraData) {
    var data = this.setupFormData(file,extraData);
    var url  = this.get('url');
    var type = this.get('type');
    var self = this;

    this.set('isUploading', true);

    return this.ajax(url, data, type)
      .then(Em.run.bind(this,this.uploadSuccess),Em.run.bind(this,this.uploadFailed));
  },
  uploadSuccess:function(respData) {
    this.didUpload(respData);
    return respData;
  },
  uploadFailed:function (error) {
    this.set('isUploading', false);
    this.sendAlert(error);
    return error;
  },
  sendAlert: Em.K,
  ajax: function(url, params, method) {
    var self = this;
    var settings = {
      url: url,
      type: method || 'POST',
      contentType: false,
      processData: false,
      xhr: function() {
        var xhr = Ember.$.ajaxSettings.xhr();
        xhr.upload.onprogress = function(e) {
          self.didProgress(e);
        };
        return xhr;
      },
      beforeSend:function (xhr) {
        xhr.setRequestHeader('X-Requested-By', 'ambari');
      },
      data: params
    };

    return this._ajax(settings);
  }
});

App.IsodateTransform = DS.Transform.extend({
  deserialize: function (serialized) {
    if (serialized) {
      return moment.utc(serialized).toDate();
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

Ember.Handlebars.registerBoundHelper('showDate', function(date,format) {
  return moment(date).format(format);
});

Ember.Handlebars.registerBoundHelper('showDateUnix', function(date,format) {
  return moment.unix(date).format(format);
});

Ember.Handlebars.registerBoundHelper('capitalize', function(string) {
  return string.capitalize();
});

Ember.Handlebars.registerBoundHelper('humanSize', function(fileSizeInBytes) {
  var i = -1;
  var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
  do {
      fileSizeInBytes = fileSizeInBytes / 1024;
      i++;
  } while (fileSizeInBytes > 1024);

  return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
});

});

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

module.exports = Em.Application.create();

});

require.register("components/breadCrumbs", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.BreadCrumbsComponent = Ember.CollectionView.extend({
  classNames: ['breadcrumb pull-left'],
  tagName: 'ul',
  path:'',
  content: function (argument) {
    var crumbs = [];
    var currentPath = this.get('path').match(/((?!\/)\S)+/g)||[];
    currentPath.forEach(function (cur,i,array) {
      return crumbs.push({name:cur,path:'/'+array.slice(0,i+1).join('/')});
    });
    crumbs.unshift({name:'/',path:'/'});
    crumbs.set('lastObject.last','true');
    return crumbs;
  }.property('path'),
  itemViewClass: Ember.View.extend({
    classNameBindings: ['isActive:active'],
    template: Ember.Handlebars.compile("{{#link-to 'files' (query-params path=view.content.path)}}{{view.content.name}}{{/link-to}}"),
    isActive: function () {
      return this.get('content.last');
    }.property('content'),
    click:function () {
      if (this.get('isActive')) {
        this.get('controller').send('refreshDir');
      }
    }
  })
});

});

require.register("components/bsPopover", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.BsPopoverComponent = Ember.BsPopoverComponent.extend({});

});

require.register("components/bulkCheckbox", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.BulkCheckboxComponent = Em.Checkbox.extend({
  selectedAll:Em.computed.alias('checked'),
  selectAll:function () {
    this.get('content').setEach('selected',this.get('selectedAll'));
  }.on('change'),
  selection:function () {
    this.set('selectedAll', !!(this.get('content.length') && this.get('content').isEvery('selected',true)));
  }.observes('content.@each.selected')
});

});

require.register("components/confirmDelete", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.DropdownWrapComponent = Em.Component.extend({
  onResetConfirm:function () {
    var childs = this.get('childViews').filter(function (view) {
      return view instanceof App.ConfirmDeleteComponent;
    });
    childs.setEach('isRemoving',false);
  }.on('resetConfirm'),
  didInsertElement:function(){
    this.$().on('hidden.bs.dropdown',Em.run.bind(this,this.onResetConfirm));
  }
});

App.ConfirmDeleteComponent = Em.Component.extend({
  layoutName:'components/deleteBulk',
  tagName:'li',
  classNameBindings:['access::disabled'],
  deleteForever:false,
  access:false,
  isRemoving:false,
  cancelRemoving:function () {
    this.set('isRemoving',false);
  },
  click:function  (e) {
    if (!$(e.target).hasClass('delete')) {
      e.stopPropagation();
    }
  },
  actions:{
    ask:function () {
      if (this.get('access')) {
        this.get('parentView').trigger('resetConfirm');
        this.set('isRemoving',true);
      }
      return false;
    },
    cancel:function () {
      this.cancelRemoving();
    },
    confirm:function () {
      if (this.get('access')) {
        this.sendAction('confirm',this.get('deleteForever'));
      }
    }
  }
});

});

require.register("components/contextMenu", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.ContextMenuComponent = Em.Component.extend({
  layoutName:'components/contextMenu',

  onTargetChange:function () {
    this.$().off('hidden.bs.context');
    this.$().on('hidden.bs.context', Em.run.bind(this, this.resetConfirmations));
  }.observes('target'),

  resetConfirmations:function () {
    this.triggerRecursively('resetConfirm');
  },

  actions:{
    removeFile:function () {
      this.get('target').send('deleteFile',true);
    },
    moveToTrash:function () {
      this.get('target').send('deleteFile');
    }
  }

});

});

require.register("components/mkdirInput", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.MkdirInputComponent = Em.Component.extend({
  layoutName:'components/mkdirInput',
  newDirName:'',
  isMkdir:false,
  path:'',
  actions:{
    create:function () {
      var name = this.get('newDirName');

      if (Em.isEmpty(name)) {
        return false;
      }
      newDir = [this.get('path'),name].join('/').replace('//','/');

      this.sendAction('create',newDir);
      this.setProperties({'newDirName':'','isMkdir':false});
    },
    edit:function () {
      this.set('isMkdir',true);
    },
    cancel:function () {
      this.setProperties({'newDirName':'','isMkdir':false});
    }
  },
  focusOnInput: function () {
    Em.run.next(this,function() {
      this.$('.mkdir-input').focus();
    });
  }.observes('isMkdir'),
});

});

require.register("components/popoverDelete", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

Em.BsPopoverComponent.reopen({
  willClearRender:function () {
    var triggers = this.triggers.split(' ');

      for (var i = triggers.length; i--;) {
          var trigger = triggers[i];

          if (trigger == 'click') {
              this.$element.off('click');
          } else if (trigger != 'manual') {
              var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focus';
              var eventOut = trigger == 'hover' ? 'mouseleave' : 'blur';

              this.$element.off(eventIn);
              this.$element.off(eventOut);
          }
      }
  }
});

App.PopoverDeleteComponent = Em.Component.extend({
  popover:Em.computed.alias('childViews.firstObject'),
  layoutName:'components/deletePopover',
  deleteForever:false,
  actions:{
    confirm:function (deleteForever) {
      this.sendAction('confirm',this.get('deleteForever'));
    },
    close:function () {
      this.set('popover.isVisible',false);
    }
  },
  didInsertElement:function () {
    $('body').on('click.popover', Em.run.bind(this,this.hideMultiply));
  },
  hideMultiply:function (e) {
    if (!this.$()) {
      return;
    }
    if (!this.$().is(e.target) && this.$().has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
          this.set('popover.isVisible',false);
    }
  },
  willClearRender:function () {
    this.get('popover').$element.off('click');
    $('body').off('click.popover');
  }
});

});

require.register("components/renameInput", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.RenameInputComponent = Ember.Component.extend({
  tagName:'span',
  layoutName:'components/renameInput',
  actions:{
    rename:function (opt) {
      var tmpName;

      switch (opt) {
        case 'edit': this.set('isRenaming',true); break;
        case 'cancel': this.set('isRenaming',false); break;
        case 'confirm':
          tmpName = this.get('tmpName');
          if (tmpName.length ===0) {
            break;
          }
          this.sendAction('confirm',this.get('filePath'),tmpName);
          this.set('isRenaming',false);
          break;

        default: this.toggleProperty('isRenaming');
      }
    }
  },

  /**
   * passed params
   */
  file:null,
  actionName:null,
  isRenaming:false,

  fileName:function () {
    var file = this.get('file');
    return (file instanceof DS.Model)?file.get('name'):file.substr(file.lastIndexOf('/')+1);
  }.property('file'),

  filePath:function () {
    var file = this.get('file');
    return (file instanceof DS.Model)?file.get('path'):file;
  }.property('file'),

  setTmpName:function () {
    if (this.get('isRenaming')) {
      this.set('tmpName',this.get('fileName'));
    } else {
      this.set('tmpName','');
    }
  }.observes('isRenaming'),

  onFileChange:function () {
    this.set('isRenaming',false);
  }.observes('file'),

  renameInputView: Em.TextField.extend({
    controller:null,
    didInsertElement:function () {
      var element = $(this.get('element'));
      element.focus().val(this.value);
    },
    keyUp: function(e) {
      var target = this.get('targetObject');
      if (e.keyCode==13) {
        return target.send('rename', 'confirm');
      }

      if (e.keyCode==27) {
        return target.send('rename', 'cancel');
      }
    }
  })
});

});

require.register("components/sortArrow", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.SortArrowComponent = Em.Component.extend({
  layout:Ember.Handlebars.compile('<i {{bind-attr class=":fa asc:fa-chevron-down:fa-chevron-up cur::fa-gr view.cur::fa-rotate-270" }} ></i>'),
  classNames:['pull-right'],
  tagName:'span',
  sPs:[],
  sA:false,
  sP:null,
  asc:true,
  cur:false,
  sorting:function () {
    var isSp = this.get('sPs.firstObject') == this.get('sP');
    this.setProperties({'asc':(isSp)?this.get('sA'):true,'cur':isSp});
  }.observes('sPs','sA').on('didInsertElement')
});

});

require.register("components/toggleContext", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

function _shake (element) {
  var l = 5;
  for ( var i = 0; i < 4; i++ ) {
    element.animate( (l>0) ? {'margin-left':(l=-l)+'px','padding-left':0}:{'padding-left':+(l=-l)+'px','margin-left':0}, 50, function (el) {
      element.css({'padding-left':0,'margin-left':0});
    });
  }
}

App.ToggleContextComponent = Em.Component.extend({
  didInsertElement:function () {
    var fileRow = this.$().parents('tr'),
        beforeHandler = Ember.run.bind(this, this.setContext),
        itemHandler = Ember.run.bind(this, this.itemHandler);

    fileRow.on('click',Ember.run.bind(this, this.openOnClick));

    fileRow.contextmenu({
      target:'#context-menu',
      before:beforeHandler,
      onItem:itemHandler
    });
  },
  setContext:function(e) {
    if (this.get('targetObject.isMoving')) {
      return false;
    }
    this.set('targetObject.parentController.targetContextMenu',this.get('targetObject'));
    return true;
  },
  itemHandler:function (t,e) {
    if (e.target.dataset.disabled) {
      return false;
    }
  },
  openOnClick:function (e) {
    if($(e.target).is('td') || $(e.target).hasClass('allow-open')){
      this.get('targetObject').send('open');
    }
  },
  willClearRender:function () {
    var fileRow = this.$().parents('tr');
    fileRow.off('click');
    fileRow.data('context').closemenu();
    fileRow.data('context').destroy();
  }
});

App.FileShakerComponent = Em.Component.extend({
  action:'',
  isValid:false,
  click:function () {
    if (this.get('isValid')) {
      this.sendAction('action');
    } else {
      _shake(this.$());
    }
  }
});

});

require.register("components/uploader", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.FileUploaderComponent = Ember.Component.extend({
  didInsertElement:function () {
    var _this = this;
    this.uploader.reopen({
      sendAlert:function (e) {
        _this.sendAction('alert',e);
      }
    });
    this.fileInput.reopen({
      filesDidChange: function() {
        var files = this.get('files');
        if (!files) {
          this.set('parentView.files',null);
          this.set('parentView.controlInput.value','');
          this.set('value','');
          return;
        }
        var numFiles = files ? files.length : 1;
        var label = this.get('value').replace(/\\/g, '/').replace(/.*\//, '');
        var log = numFiles > 1 ? numFiles + ' files selected' : label;

        this.set('parentView.controlInput.value',log);
        this.set('parentView.files',files);

      }.observes('files')
    });
  },
  actions:{
    upload:function () {
      this.uploadFile();
    },
    clear:function () {
      this.set('fileInput.files',null);
    }
  },
  uploader: null,
  layoutName:'components/uploader',
  path:'',
  info:'',
  files:null,
  isFiles:function () {
    return !this.get('files.length');
  }.property('files'),
  uploadFile:function () {
    var path = this.get('path');
    var uploader = this.get('uploader');
    var uploadBtn = Ladda.create(this.uploadButton.get('element'));
    var reset = function () {
      uploadBtn.stop();
      this.send('clear');
    };
    if (!uploader.get('isUploading')) {
      if (!Ember.isEmpty(this.get('files'))) {
        var file = this.get('files')[0];
        uploadBtn.start();
        uploader.on('progress',function (e) {
          uploadBtn.setProgress(e.percent/100);
        });
        uploader.upload(file,{path:path}).finally(Em.run.bind(this,reset));
      }
    }
  },
  uploadButton: Em.View.createWithMixins(Ember.TargetActionSupport, {
    tagName:'button',
    target: Ember.computed.alias('controller'),
    classNames:['btn','ladda-button'],
    classNameBindings:['isFiles:hide','target.isError:btn-danger:btn-success'],
    attributeBindings: ["data-style","data-size"],
    action:'upload',
    click: function() {
      this.triggerAction();
    }
  }),
  fileInput : Ember.TextField.create({
    type: 'file',
    attributeBindings: ['multiple'],
    multiple: false,
    files:null,
    change: function(e) {
      var input = e.target;
      if (!Ember.isEmpty(input.files)) {
        this.set('files', input.files);
      }
    }
  }),
  controlInput:Ember.TextField.create({
    readonly:true,
    classNames:['form-control']
  })
});
});

require.register("controllers/chmodModal", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

var _permissionsProp = function(n, l) {
  return function (arg,val) {
    if (arguments.length > 1) {
      this.set('permissions', this.replaceAt(n,(val)?l:'-'));
      return val;
    }
    return this.get('permissions')[n]===l;
  };
};

App.ChmodModalController = Em.ObjectController.extend({
  needs:['files'],
  classNames:'chmod-row',
  file:Em.computed.alias('content'),
  permissions:Em.computed.alias('file.permission'),
  usrR:_permissionsProp(1, 'r').property('permissions'),
  usrW:_permissionsProp(2, 'w').property('permissions'),
  usrE:_permissionsProp(3, 'x').property('permissions'),
  grpR:_permissionsProp(4, 'r').property('permissions'),
  grpW:_permissionsProp(5, 'w').property('permissions'),
  grpE:_permissionsProp(6, 'x').property('permissions'),
  otrR:_permissionsProp(7, 'r').property('permissions'),
  otrW:_permissionsProp(8, 'w').property('permissions'),
  otrE:_permissionsProp(9, 'x').property('permissions'),
  replaceAt:function (index,p) {
    var perm = this.get('permissions');
    return perm.substr(0, index) + p + perm.substr(index + p.length);
  }
});

});

require.register("controllers/error", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.ErrorController = Ember.ObjectController.extend({
  actions: {
    toggleStackTrace:function () {
      var value = this.get('isExpanded');
      this.set('isExpanded', !value);
    }
  },

  isExpanded: false,

  publicMessage:function () {
    var content = this.get('content');
    var text = content.statusText;
    if (content && content.responseText) {
      var json = JSON.parse(content.responseText);
      text = json.message;
    } else if (content && content.message) {
      text = content.message;
    }
    return text;
  }.property('content'),
  stackTrace:function () {
    var content = this.get('content');
    var trace = null;
    if (content && content.responseText) {
      var json = JSON.parse(content.responseText);
      trace = json.trace;
    }
    return trace;
  }.property('content')
});

});

require.register("controllers/file", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.FileController = Ember.ObjectController.extend({
  needs:['files'],
  actions:{
    confirmPreview:function (file) {
      this.downloadFile(file, "browse");
    },
    download:function (option) {
      this.downloadFile(this.get('content'), option);
    },
    preview:function (option) {
      this.send('showPreviewModal',this.get('content'));
    },
    showChmod:function () {
      this.send('showChmodModal',this.get('content'));
    },
    rename:function (opt,name) {
      var file = this.get('content'),
          path = file.get('path'),
          newPath;

      if (name === file.get('name') || Em.isEmpty(name)) {
        return this.set('isRenaming',!Em.isEmpty(name));
      }

      newPath = path.substring(0,path.lastIndexOf('/')+1)+name;

      this.store.move(file,newPath)
        .then(Em.run.bind(this,this.set,'isRenaming',false),Em.run.bind(this,this.sendAlert));
    },
    editName:function () {
      this.set('isRenaming',true);
    },
    open:function (file) {
      if (this.get('content.isDirectory')) {
        return this.transitionToRoute('files',{queryParams: {path: this.get('content.id')}});
      } else{
        //return this.send('download');
        return this.send('preview');
      }
    },
    deleteFile:function (deleteForever) {
      this.store
        .remove(this.get('content'),!deleteForever)
        .then(null,Em.run.bind(this,this.deleteErrorCallback,this.get('content')));
    }
  },
  selected:false,
  isRenaming:false,
  isMovingToTrash:false,
  chmodVisible:false,
  targetContextMenu:null,
  isPermissionsDirty:function () {
    var file = this.get('content');
    var diff = file.changedAttributes();
    return !!diff.permission;
  }.property('content.permission'),
  isMoving:function () {
    var movingFile = this.get('parentController.movingFile.path');
    var thisFile = this.get('content.id');
    return movingFile === thisFile;
  }.property('parentController.movingFile'),

  setSelected:function (controller,observer) {
    this.set('selected',this.get(observer));
  }.observes('content.selected'),

  renameSuccessCallback:function (record,error) {
    record.rollback();
    this.sendAlert(error);
  },

  dirInfo: Em.computed.alias('controllers.files.content.meta'),

  deleteErrorCallback:function (record,error) {
    this.get('parentController.model').pushRecord(record);
    this.send('showAlert',error);
  },

  sendAlert:function (error) {
    this.send('showAlert',error);
  },
  downloadFile: function(files, option) {
    var _this = this;
    this.store.linkFor([files], option, false, true).then(function(link) {
      var that = _this;
      Ember.$.get(link).done(function(data) {
        if(data.allowed) {
          that.store.linkFor([files],option).then(function (link) {
            window.location.href = link;
          },Em.run.bind(that,that.sendAlert));
        }
      }).fail(function(jqXHR, textStatus, errorThrown) {
        that.send('showAlert', jqXHR);
      });
    }, Em.run.bind(this,this.sendAlert));
  }
});

});

require.register("controllers/files", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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
var bind = Ember.run.bind;

App.FilesController = Ember.ArrayController.extend({
  actions:{
    moveFile:function (opt,fileArg) {
      var src, title,
          file = fileArg || this.get('selectedFiles.firstObject'),
          moving = this.get('movingFile');

      if (opt == 'cut') {
        src = file.toJSON({includeId: true});
        src = Em.merge(src,{name:file.get('name'),path:file.get('path')});
        this.set('movingFile',src);
      }

      if (opt == 'move') {
        this.store.move(moving.path,[this.get('path'),moving.name].join('/').replace('//','/'))
          .then(bind(this,this.set,'movingFile',null),bind(this,this.throwAlert));
      }

      if (opt == 'cancel') {
        this.set('movingFile',null);
      }
    },
    showRenameInput:function () {
      this.toggleProperty('isRenaming');
    },
    renameDir:function (path,newName) {
      var _this = this,
          basedir = path.substring(0,path.lastIndexOf('/')+1);
          newPath = basedir + newName;

      if (path === newPath) {
        return false;
      }

      this.store.listdir(basedir).then(function (listdir) {
        var recordExists = listdir.isAny('id',newPath);

        listdir.forEach(function (file) {
          _this.store.unloadRecord(file);
        });

        if (recordExists) {
          return _this.throwAlert({message:newPath + ' already exists.'});
        }

        return _this.store.move(path,newPath);
      }).then(function (newDir) {
        if (newDir) {
          _this.store.unloadRecord(newDir);
          _this.set('path',newPath);
        }
      }).catch(bind(this,this.throwAlert));

    },
    deleteFile:function (deleteForever) {
      var self = this,
          selected = this.get('selectedFiles'),
          moveToTrash = !deleteForever;
      selected.forEach(function (file) {
        self.store.remove(file,moveToTrash).then(null,bind(self,self.deleteErrorCallback,file));
      });
    },
    download:function (option) {
      var files = this.get('selectedFiles').filterBy('readAccess',true);
      var content = this.get('content');
      this.store.linkFor(content, option).then(function (link) {
        window.location.href = link;
      });
    },

    mkdir:function (newDirName) {
      this.store.mkdir(newDirName)
        .then(bind(this,this.mkdirSuccessCalback),bind(this,this.throwAlert));
    },
    upload:function (opt) {
      if (opt === 'open') {
        this.set('isUploading',true);
      }

      if (opt === 'close') {
        this.set('isUploading',false);
      }
    },
    sort:function (pr) {
      var currentProperty = this.get('sortProperties');
      if (pr == currentProperty[0] || pr == 'toggle') {
        this.toggleProperty('sortAscending');
      } else{
        this.set('sortProperties',[pr]);
        this.set('sortAscending',true);
      }
    },
    confirmChmod:function (file) {
      this.store
        .chmod(file)
        .then(null,Em.run.bind(this,this.chmodErrorCallback,file));
    },
    confirmPreview:function (file) {
      //this.send('download');
      this.store.linkFor(file, "browse").then(function (link) {
        window.location.href = link;
      });
    },
    clearSearchField:function () {
      this.set('searchString','');
    }
  },
  init:function () {
    if (App.testing) {
      return this._super();
    }
    var controller = this;
    var adapter = controller.store.adapterFor('file');
    var url = adapter.buildURL('upload');
    this.uploader.set('url',url);
    this.uploader.on('didUpload', function (payload) {
      controller.store.pushPayload('file', {'file': payload });
    });
    this._super();
  },

  sortProperties: ['name'],
  sortAscending: true,

  needs: ["file"],
  movingFile:null,
  uploader:App.Uploader,
  isRenaming:false,
  isUploading:false,
  queryParams: ['path'],
  path: '/',
  isRootDir:Ember.computed.equal('path', '/'),
  hideMoving:function () {
    return (this.movingFile)?[this.path,this.movingFile.name].join('/').replace('//','/')===this.movingFile.path:false;
  }.property('movingFile','path'),
  currentDir:function () {
    return this.get('path').split('/').get('lastObject') || '/';
  }.property('path'),
  selectedOne:Ember.computed.equal('selectedFiles.length', 1),
  isSelected:Ember.computed.gt('selectedFiles.length', 0),
  selectedFiles:function () {
    return this.get('content').filterBy('selected', true);
  }.property('content.@each.selected'),
  canConcat:function () {
    return this.get('selectedFiles').filterProperty('isDirectory').get('length')===0;
  }.property('selectedFiles.length'),

  isSortPropertyEqualsDate: function() {
    return this.get('sortProperties').get('firstObject') === 'date';
  }.property('sortProperties.firstObject'),

  searchString:'',
  fileList: function () {
    var fileList = this.get('arrangedContent');
    var search = this.get('searchString');
    return (search)?fileList.filter(function (file) {
      return !!file.get('name').match(search);
    }):fileList;
  }.property('arrangedContent','searchString'),

  mkdirSuccessCalback:function (newDir) {
    if (newDir.get('path') != [this.get('path'),newDir.get('name')].join('/')){
      newDir.unloadRecord();
      newDir.store.listdir(this.get('path'));
    }
  },

  clearSearch:function () {
    this.set('searchString','');
  }.observes('path'),

  deleteErrorCallback:function (record,error) {
    this.model.pushRecord(record);
    this.throwAlert(error);
  },

  chmodErrorCallback:function (record,error) {
    record.rollback();
    this.throwAlert({message:'Permissions change failed'});
  },

  throwAlert:function (error) {
    this.send('showAlert',error);
  },

  showSpinner:function () {
    this.set('isLoadingFiles',true);
  },

  hideSpinner:function () {
    this.set('isLoadingFiles',false);
  }
});



});

require.register("controllers/filesAlert", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.FilesAlertController = App.ErrorController.extend({
  content:null,
  output:function () {
    var error = this.get('content'),
        message = (error.responseJSON)?error.responseJSON.message:error.message,
        output;

    if (message) {
      message = message.split('\n').objectAt(0);
    }

    return message;
  }.property('content')
});

});

require.register("controllers/previewModal", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.PreviewModalController = Em.ObjectController.extend({
    needs:['files', 'file'],
    offset: 3000 ,
    startIndex:0,
    file:Em.computed.alias('content'),
    filePageText:'',
    reload: false,
    pagecontent: Ember.computed('file', 'startIndex', 'endIndex', 'reload', function() {
        var file = this.get('file');
        var filepath = file.get('path');
        var filePageText = this.get('filePageText');

        var self = this,
            defer = Ember.RSVP.defer(),
            startIndex = this.get('startIndex'),
            endIndex  = this.get('endIndex');

        var pathName = window.location.pathname;
        var pathNameArray = pathName.split("/");
        var ViewVersion = pathNameArray[3];
        var viewName = pathNameArray[4];
        var previewServiceURL = "/api/v1/views/FILES/versions/"+ ViewVersion + "/instances/" + viewName + "/resources/files/preview/file" + '?path=' + filepath + '&start='+ startIndex +'&end='+ endIndex;

        var previousText = $('.preview-content').text();

        $.ajax({
            url: previewServiceURL,
            dataType: "json",
            type: 'get',
            async: false,
            contentType: 'application/json',
            success: function( response, textStatus, jQxhr ){
                self.set('filePageText', previousText + response.data);
                self.set('isFileEnd',response.isFileEnd);
            },
            error: function( jqXhr, textStatus, errorThrown ){
                console.log( "Preview Fail pagecontent : " + errorThrown );
              self.send('removePreviewModal');
              self.send('showAlert', jqXhr);
              self.set('reload', !self.get('reload'));
            }
        });

        if(self.get('isFileEnd') == true){
           this.set('showNext', false);
        }
        return self.get('filePageText');
    }),
    endIndex: Ember.computed('startIndex', 'offset', function() {
        var startIndex = this.get('startIndex'),
            offset  = this.get('offset');
        return startIndex + offset;
    }),
    showPrev : Ember.computed('startIndex', function() {
        var startIndex = this.get('startIndex');
        this.set('showNext', true);
        return ((startIndex == 0) ? false : true );
    }),
    showNext : true,
    actions:{
        next: function(){
            console.log('Next');
            this.set('startIndex', this.get('startIndex') + this.get('offset'));
            return this.get('filePageText');
        },
        prev: function(){
            console.log('Prev');
            this.set('startIndex', (this.get('startIndex') - this.get('offset')) > 0 ? (this.get('startIndex') - this.get('offset')) : 0);
        }
    }
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

//////////////////////////////////
// Adapter
//////////////////////////////////

require('adapter');

//////////////////////////////////
// Templates
//////////////////////////////////

require('templates/application');
require('templates/index');
require('templates/files');
require('templates/error');
require('templates/modal/chmod');
require('templates/modal/preview');
require('templates/util/errorRow');
require('templates/util/fileRow');

require('templates/components/uploader');
require('templates/components/renameInput');
require('templates/components/deletePopover');
require('templates/components/mkdirInput');
require('templates/components/contextMenu');
require('templates/components/deleteBulk');

//////////////////////////////////
// Models
//////////////////////////////////

require('models/file');

/////////////////////////////////
// Controllers
/////////////////////////////////

require('controllers/files');
require('controllers/file');
require('controllers/error');
require('controllers/filesAlert');
require('controllers/chmodModal');
require('controllers/previewModal');

/////////////////////////////////
// Components
/////////////////////////////////

require('components/uploader');
require('components/contextMenu');
require('components/renameInput');
require('components/bsPopover');
require('components/confirmDelete');
require('components/sortArrow');
require('components/breadCrumbs');
require('components/popoverDelete');
require('components/bulkCheckbox');
require('components/mkdirInput');
require('components/toggleContext');

/////////////////////////////////
// Views
/////////////////////////////////

require('views/file');
require('views/files');
require('views/filesAlert');
require('views/modalChmod');
require('views/modalPreview');

/////////////////////////////////
// Routes
/////////////////////////////////

require('routes/file');
require('routes/error');

/////////////////////////////////
// Router
/////////////////////////////////

require('router');

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

var dsa = DS.attr;

App.File = DS.Model.extend({
  path: function() {
    return this.get('id');
  }.property('id'),
  basedir:function () {
    var path = this.get('id');
    return path.substring(0,path.lastIndexOf('/'))||'/';
  }.property('id'),
  isDirectory: dsa('boolean'),
  readAccess: dsa('boolean'),
  writeAccess: dsa('boolean'),
  executeAccess: dsa('boolean'),
  len: dsa('number'),
  owner: dsa('string'),
  group: dsa('string'),
  permission: dsa('string'),
  accessTime: dsa('isodate'),
  modificationTime: dsa('isodate'),
  blockSize: dsa('number'),
  replication: dsa('number'),
  name:function () {
    var splitpath = this.get('path').split('/');
    return splitpath.get(splitpath.length-1);
  }.property('path'),
  date:function () {
    return parseInt(moment(this.get('modificationTime')).format('X'));
  }.property('modificationTime'),
  size: Em.computed.alias('len')
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

App = require('app');

App.Router.map(function() {
  this.route('files', { queryParams:['path'],path: '/',});
});

});

require.register("routes/error", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.ErrorRoute = Em.Route.extend({});

});

require.register("routes/file", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.FilesRoute = Em.Route.extend({
  queryParams: {
    path: {
      refreshModel: true
    }
  },
  actions:{
    refreshDir:function () {
      this.refresh();
    },
    loading:function  (argument) {
      var target = this.controllerFor('files');
      target.showSpinner();
      this.router.one('didTransition', target, 'hideSpinner');
    },
    error:function (error,transition,e) {
      this.controllerFor('files').set('isLoadingFiles', false);
      if (this.router._lookupActiveView('files')) {
        this.send('showAlert',error);
      } else {
        return true;
      }
    },
    dirUp: function () {
      var currentPath = this.controllerFor('files').get('path');
      var upDir = currentPath.substring(0,currentPath.lastIndexOf('/'));
      var target = upDir || '/';
      return this.transitionTo('files',{queryParams: {path: target}});
    },
    willTransition:function (argument) {
      var hasModal = this.router._lookupActiveView('modal.chmod'),
          hasAlert = this.router._lookupActiveView('files.alert'),
          hasPreviewModal = this.router._lookupActiveView('modal.preview');

      Em.run.next(function(){
        if (hasAlert) this.send('removeAlert');
        if (hasModal) this.send('removeChmodModal');
        if (hasPreviewModal) this.send('removePreviewModal');
      }.bind(this));
    },

    showChmodModal:function (content) {
      this.controllerFor('chmodModal').set('content',content);
      this.render('modal.chmod',{
        into:'files',
        outlet:'modal',
        controller:'chmodModal'
      });
    },

    showPreviewModal :function (content) {
      var controller = this.controllerFor('previewModal');
      controller.set('reload', true);
      controller.set('content',content);
      controller.set('startIndex',0);

      this.render('modal.preview',{
        into:'files',
        outlet:'modal',
        controller:'previewModal'
      });
    },

    removeChmodModal:function () {
      this.disconnectOutlet({
        outlet: 'modal',
        parentView: 'files'
      });
    },
    removePreviewModal:function () {
      this.disconnectOutlet({
        outlet: 'modal',
        parentView: 'files'
      });
    },
    showAlert:function (error) {
      this.controllerFor('filesAlert').set('content',error);
      this.render('files.alert',{
        into:'files',
        outlet:'error',
        controller:'filesAlert'
      });
    },
    removeAlert:function () {
      this.disconnectOutlet({
        outlet: 'error',
        parentView: 'files'
      });
    }
  },
  model:function (params) {
    var path = (Em.isEmpty(params.path))?'/':params.path;
    var model = this.store.listdir(path);
    this.set('prevModel',model);
    return model;
  },
  prevModel:null,
  beforeModel:function () {
    if (this.get('prevModel.isPending')) {
      this.get('prevModel').then(function (files) {
        files.forEach(function (file) {
          file.store.unloadRecord(file);
        });
      });
    }
  },
  afterModel: function (model) {
    this.store.all('file').forEach(function (file) {
      if (!model.contains(file)) {
        file.unloadRecord();
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


  data.buffer.push("\n\n<div class=\"wrap\">\n  ");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/components/chmodInput", function(exports, require, module) {
Ember.TEMPLATES["components/chmodInput"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("\n\n<td colspan=\"8\" class=\"\">\n\n<div class=\"modal chmodal\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" data-backdrop=\"static\">\n  <div class=\"modal-dialog modal-sm\">\n    <div class=\"modal-content\">\n      <div class=\"modal-header\">\n        <button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button>\n        <h4 class=\"modal-title\">Edit permission</h4>\n      </div>\n      <div class=\"modal-body\">\n\n        <form class=\"form-horizontal\" role=\"form\">\n          <div class=\"form-group\">\n            <label class=\"col-sm-2 control-label\">User</label>\n            <div class=\"col-sm-10\">\n              <div class=\"btn-group\" data-toggle=\"buttons\">\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm usrR:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("usrR")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Read</span>\n                </label>\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm usrW:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("usrW")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Write</span>\n                </label>\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm usrE:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("usrE")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Execute</span>\n                </label>\n              </div>\n            </div>\n          </div>\n          <div class=\"form-group\">\n            <label class=\"col-sm-2 control-label\">Group</label>\n            <div class=\"col-sm-10\">\n              <div class=\"btn-group\" data-toggle=\"buttons\">\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm grpR:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("grpR")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Read</span>\n                </label>\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm grpW:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("grpW")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Write</span>\n                </label>\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm grpE:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("grpE")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Execute</span>\n                </label>\n              </div>\n            </div>\n          </div>\n          <div class=\"form-group\">\n            <label class=\"col-sm-2 control-label\">Other</label>\n            <div class=\"col-sm-10\">\n              <div class=\"btn-group\" data-toggle=\"buttons\">\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm otrR:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("otrR")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Read</span>\n                </label>\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm otrW:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("otrW")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Write</span>\n                </label>\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm otrE:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("otrE")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Execute</span>\n                </label>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"form-group\">\n            <div class=\"col-sm-offset-2 col-sm-10\">\n              <div class=\"checkbox\">\n                <label>\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox")
  },hashTypes:{'type': "STRING"},hashContexts:{'type': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span> Modify recursively</span>\n                </label>\n              </div>\n            </div>\n          </div>\n        </form>\n\n      </div>\n      <div class=\"modal-footer\">\n        <button type=\"button\" class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "close", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Close</button>\n        <button type=\"button\" class=\"btn btn-primary\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "confirm", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Save changes</button>\n      </div>\n    </div>\n  </div>\n</div>\n\n</td>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/components/contextMenu", function(exports, require, module) {
Ember.TEMPLATES["components/contextMenu"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n<div id=\"context-menu\">\n  <ul class=\"dropdown-menu dropdown-context compressed-context\" role=\"menu\">\n    ");
  stack1 = helpers['if'].call(depth0, "view.target.content.isDirectory", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <li><a tabindex=\"-1\" href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "moveFile", "cut", "view.target.content", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","STRING","ID"],data:data})));
  data.buffer.push(">Move</a></li>\n    <li><a tabindex=\"-1\" href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "showChmod", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" >Permissions</a></li>\n    <li><a tabindex=\"-1\" href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "editName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" >Rename</a></li>\n    <li class=\"divider\"></li>\n    <li class=\"dropdown-submenu\">\n      <a href=\"#\" data-disabled=\"disabled\">\n      <span> Delete </span>\n        <i class=\"fa fa-chevron-right pull-right fa-right\"></i>\n      </a>\n      <ul class=\"dropdown-menu\">\n        ");
  data.buffer.push(escapeExpression((helper = helpers['confirm-delete'] || (depth0 && depth0['confirm-delete']),options={hash:{
    'confirm': ("removeFile"),
    'deleteForever': (true),
    'access': (true)
  },hashTypes:{'confirm': "STRING",'deleteForever': "BOOLEAN",'access': "BOOLEAN"},hashContexts:{'confirm': depth0,'deleteForever': depth0,'access': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "confirm-delete", options))));
  data.buffer.push("\n        ");
  data.buffer.push(escapeExpression((helper = helpers['confirm-delete'] || (depth0 && depth0['confirm-delete']),options={hash:{
    'confirm': ("moveToTrash"),
    'deleteForever': (false),
    'access': (true)
  },hashTypes:{'confirm': "STRING",'deleteForever': "BOOLEAN",'access': "BOOLEAN"},hashContexts:{'confirm': depth0,'deleteForever': depth0,'access': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "confirm-delete", options))));
  data.buffer.push("\n      </ul>\n    </li>\n  </ul>\n</div>\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n      <li><a tabindex=\"-1\" href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "open", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Open folder</a></li>\n    ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n      <li><a tabindex=\"-1\" href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "download", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Download</a></li>\n    ");
  return buffer;
  }

  data.buffer.push("\n\n");
  options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data}
  if (helper = helpers['dropdown-wrap']) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0['dropdown-wrap']); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers['dropdown-wrap']) { stack1 = blockHelperMissing.call(depth0, 'dropdown-wrap', {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data}); }
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/components/deleteBulk", function(exports, require, module) {
Ember.TEMPLATES["components/deleteBulk"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n<a  tabindex=\"-1\">\n  ");
  stack1 = helpers['if'].call(depth0, "deleteForever", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  <div class=\"btn-group text-center dropdown-confirm\">\n    <button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" type=\"button\" class=\"btn btn-xs btn-danger\">\n      <span class=\"glyphicon glyphicon-remove\"></span>\n    </button>\n    <button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "confirm", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" type=\"button\" class=\"btn btn-xs btn-success delete\">\n      <span class=\"glyphicon glyphicon-ok delete\"></span>\n    </button>\n  </div>\n</a>\n");
  return buffer;
  }
function program2(depth0,data) {
  
  
  data.buffer.push("\n    <i class=\"fa fa-fw fa-exclamation-triangle\"></i>\n    <span class=\"sub-label\" > Delete forever </span>\n  ");
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n    <i class=\"fa fa-fw fa-trash-o\"></i>\n    <span class=\"sub-label\" >Move To Trash</span>\n  ");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n<a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "ask", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" tabindex=\"-1\" href=\"#\">\n  ");
  stack1 = helpers['if'].call(depth0, "deleteForever", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</a>\n");
  return buffer;
  }
function program7(depth0,data) {
  
  
  data.buffer.push("\n    <i class=\"fa fa-fw fa-exclamation-triangle\"></i> <span class=\"sub-label\" > Delete forever </span>\n  ");
  }

function program9(depth0,data) {
  
  
  data.buffer.push("\n    <i class=\"fa fa-fw fa-trash-o\"></i> <span class=\"sub-label\" >Move To Trash</span>\n  ");
  }

  data.buffer.push("\n\n");
  stack1 = helpers['if'].call(depth0, "isRemoving", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/components/deletePopover", function(exports, require, module) {
Ember.TEMPLATES["components/deletePopover"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n  <div class=\"input-group\" >\n    <div class=\"btn-group \">\n      <button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "close", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" type=\"button\" class=\"btn btn-xs btn-danger\">\n        <i class=\"fa fa-times fa-fw\"></i>\n      </button>\n      <button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "confirm", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" type=\"button\" class=\"btn btn-xs btn-success\">\n        <i class=\"fa fa-check fa-fw\"></i>\n      </button>\n    </div>\n    <div class=\"checkbox delete-forever\">\n      <label>\n      ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checkedBinding': ("deleteForever")
  },hashTypes:{'type': "STRING",'checkedBinding': "STRING"},hashContexts:{'type': depth0,'checkedBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" Delete forever\n      </label>\n    </div>\n  </div>\n");
  return buffer;
  }

  data.buffer.push("\n\n<a data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Delete\"> <i class=\"fa fa-trash-o fa-lg\"></i> </a>\n\n");
  stack1 = (helper = helpers['bs-popover'] || (depth0 && depth0['bs-popover']),options={hash:{
    'triggers': ("click"),
    'placement': ("left")
  },hashTypes:{'triggers': "STRING",'placement': "STRING"},hashContexts:{'triggers': depth0,'placement': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "bs-popover", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/components/mkdirInput", function(exports, require, module) {
Ember.TEMPLATES["components/mkdirInput"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n  <button type=\"button\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "edit", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-default :btn-sm :pull-right :mkdirwrap canCreate::disabled")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n    <i class=\"fa fa-plus\"></i> New directory\n  </button>\n");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n  <div class=\"input-group input-group-sm pull-right mkdir-area\">\n    ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'class': ("form-control mkdir-input"),
    'valueBinding': ("newDirName"),
    'placeholder': ("Enter Directory Name"),
    'enter': ("create")
  },hashTypes:{'class': "STRING",'valueBinding': "STRING",'placeholder': "STRING",'enter': "STRING"},hashContexts:{'class': depth0,'valueBinding': depth0,'placeholder': depth0,'enter': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n    <div class=\"input-group-btn\">\n      <button  type=\"button\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-danger :btn-sm :btn-mkdir-cancel")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n        <i class=\"fa fa-times\"></i> Cancel\n      </button>\n    </div>\n    <div class=\"input-group-btn\">\n      <button  type=\"button\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "create", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("newDirName::disabled :btn :btn-success :btn-sm :btn-mkdir")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n        <i class=\"fa fa-check\"></i> Create\n      </button>\n    </div>\n  </div>\n");
  return buffer;
  }

  data.buffer.push("\n\n");
  stack1 = helpers.unless.call(depth0, "isMkdir", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/components/renameInput", function(exports, require, module) {
Ember.TEMPLATES["components/renameInput"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n\n<div class=\"input-group input-group-sm rename-area\">\n  ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.renameInputView", {hash:{
    'class': ("form-control rename-input"),
    'valueBinding': ("tmpName")
  },hashTypes:{'class': "STRING",'valueBinding': "STRING"},hashContexts:{'class': depth0,'valueBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n  <div class=\"input-group-btn\">\n    <button  type=\"button\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "rename", "cancel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-danger :btn-xs :btn-rename-cancel isRenaming:show")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n      <i class=\"fa fa-times\"></i> Cancel\n    </button>\n  </div>\n  <div class=\"input-group-btn\">\n    <button  type=\"button\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "rename", "confirm", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-success :btn-xs :btn-rename isRenaming:show")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n      <i class=\"fa fa-check\"></i> Rename\n    </button>\n  </div>\n</div>\n\n");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n  ");
  stack1 = helpers._triageMustache.call(depth0, "yield", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n");
  return buffer;
  }

  data.buffer.push("\n");
  stack1 = helpers['if'].call(depth0, "isRenaming", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/components/uploader", function(exports, require, module) {
Ember.TEMPLATES["components/uploader"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n      <span class=\"ladda-label\">Upload</span>\n    ");
  }

  data.buffer.push("\n\n<div class=\"input-group input-group-sm\">\n  <span class=\"input-group-btn\">\n    <span class=\"btn btn-primary btn-file\">\n      Browse… ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "fileInput", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n    </span>\n    <span  ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-danger isFiles:hide")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "clear", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("  >\n      Clear\n    </span>\n  </span>\n  <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":input-group-btn :btn-upload isFiles:hide")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n    ");
  stack1 = helpers.view.call(depth0, "uploadButton", {hash:{
    'data-style': ("expand-right"),
    'data-size': ("xs")
  },hashTypes:{'data-style': "STRING",'data-size': "STRING"},hashContexts:{'data-style': depth0,'data-size': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </span>\n  ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "controlInput", {hash:{
    'placeholder': ("Select files to upload.")
  },hashTypes:{'placeholder': "STRING"},hashContexts:{'placeholder': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n</div>\n\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/error", function(exports, require, module) {
Ember.TEMPLATES["error"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n      <a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleStackTrace", "post", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n        <i ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":fa isExpanded:fa-toggle-down:fa-toggle-right")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></i>\n        ");
  stack1 = helpers['if'].call(depth0, "isExpanded", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </a>\n    ");
  stack1 = helpers['if'].call(depth0, "isExpanded", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program2(depth0,data) {
  
  
  data.buffer.push(" Collapse Stack Trace ");
  }

function program4(depth0,data) {
  
  
  data.buffer.push(" Expand Stack Trace ");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <pre class=\"prettyprint\">");
  stack1 = helpers._triageMustache.call(depth0, "stackTrace", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</pre>\n    ");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"container\">\n  <div class=\"alert alert-danger collapse-group\">\n    <strong>");
  stack1 = helpers._triageMustache.call(depth0, "content.status", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</strong> ");
  stack1 = helpers._triageMustache.call(depth0, "publicMessage", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </div>\n  ");
  stack1 = helpers['if'].call(depth0, "stackTrace", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/files", function(exports, require, module) {
Ember.TEMPLATES["files"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n      <a href=\"#\" class=\"dir-name\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "refreshDir", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "currentDir", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n      <a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("isRootDir:hide")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "showRenameInput", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("><i class=\"fa fa-edit\"></i></a>\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <i ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "clearSearchField", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" class=\"fa fa-times form-control-feedback\"></i>\n      ");
  return buffer;
  }

function program5(depth0,data) {
  
  
  data.buffer.push(" Asc ");
  }

function program7(depth0,data) {
  
  
  data.buffer.push(" Desc ");
  }

function program9(depth0,data) {
  
  
  data.buffer.push("\n                  Last Modified\n                ");
  }

function program11(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.capitalize || (depth0 && depth0.capitalize),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "sortProperties.firstObject", options) : helperMissing.call(depth0, "capitalize", "sortProperties.firstObject", options))));
  data.buffer.push("\n                ");
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n          <div id=\"bulkDropdown\" class=\"btn-group\">\n            <span class=\"input-group-addon\">\n              <div class=\"checkbox\">\n                ");
  data.buffer.push(escapeExpression((helper = helpers['bulk-checkbox'] || (depth0 && depth0['bulk-checkbox']),options={hash:{
    'content': ("fileList")
  },hashTypes:{'content': "ID"},hashContexts:{'content': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "bulk-checkbox", options))));
  data.buffer.push("\n              </div>\n            </span>\n            <button  type=\"button\" data-toggle=\"dropdown\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-xs :btn-default :dropdown-toggle isSelected::disabled")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n              <span class=\"caret\"></span>\n            </button>\n            <ul class=\"dropdown-menu pull-right\" role=\"menu\">\n              <li><a href=\"#\"  ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "download", "zip", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" ><i class=\"fa fa-archive fa-fw\"></i> Download zip</a></li>\n              ");
  stack1 = helpers['if'].call(depth0, "canConcat", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n              <li class=\"divider\"></li>\n              <li class=\"dropdown-submenu\">\n                <a href=\"#\" disabled=\"disabled\">\n                  <i class=\"fa fa-chevron-left fa-gr fa-fw\"></i> Delete\n                </a>\n                <ul class=\"dropdown-menu left-submenu\">\n                  ");
  data.buffer.push(escapeExpression((helper = helpers['confirm-delete'] || (depth0 && depth0['confirm-delete']),options={hash:{
    'confirm': ("deleteFile"),
    'deleteForever': (true),
    'selector': ("bulkDropdown"),
    'access': (true)
  },hashTypes:{'confirm': "STRING",'deleteForever': "BOOLEAN",'selector': "STRING",'access': "BOOLEAN"},hashContexts:{'confirm': depth0,'deleteForever': depth0,'selector': depth0,'access': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "confirm-delete", options))));
  data.buffer.push("\n                  ");
  data.buffer.push(escapeExpression((helper = helpers['confirm-delete'] || (depth0 && depth0['confirm-delete']),options={hash:{
    'confirm': ("deleteFile"),
    'deleteForever': (false),
    'selector': ("bulkDropdown"),
    'access': (true)
  },hashTypes:{'confirm': "STRING",'deleteForever': "BOOLEAN",'selector': "STRING",'access': "BOOLEAN"},hashContexts:{'confirm': depth0,'deleteForever': depth0,'selector': depth0,'access': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "confirm-delete", options))));
  data.buffer.push("\n                </ul>\n              </li>\n            </ul>\n          </div>\n        ");
  return buffer;
  }
function program14(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n              <li><a href=\"#\"  ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "download", "concat", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" ><i class=\"fa fa-th fa-fw\"></i> Concat</a></li>\n              ");
  return buffer;
  }

function program16(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n      ");
  stack1 = helpers['if'].call(depth0, "movingFile", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(17, program17, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      ");
  return buffer;
  }
function program17(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n        <tr class=\"isMoving\">\n          <td>\n            ");
  stack1 = helpers['if'].call(depth0, "movingFile.isDirectory", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(20, program20, data),fn:self.program(18, program18, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          </td>\n          <td>\n            <div class=\"file-name\">\n                <span>\n                  <a>\n                  ");
  stack1 = helpers._triageMustache.call(depth0, "movingFile.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                  </a>\n                </span>\n                <span class=\"help-block mod-time\">\n                  <small>\n                    Updated ");
  data.buffer.push(escapeExpression((helper = helpers.showDateUnix || (depth0 && depth0.showDateUnix),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["ID","STRING"],data:data},helper ? helper.call(depth0, "movingFile.modificationTime", "YYYY-MM-DD HH:mm", options) : helperMissing.call(depth0, "showDateUnix", "movingFile.modificationTime", "YYYY-MM-DD HH:mm", options))));
  data.buffer.push("\n                  </small>\n                </span>\n              </div>\n          </td>\n          <td>\n            ");
  stack1 = helpers.unless.call(depth0, "content.isDirectory", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(22, program22, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          </td>\n          <td >");
  stack1 = helpers._triageMustache.call(depth0, "movingFile.owner", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n          <td>");
  stack1 = helpers._triageMustache.call(depth0, "movingFile.group", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n          <td>");
  stack1 = helpers._triageMustache.call(depth0, "movingFile.permission", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n          <td >\n            <ul class=\"list-inline file-actions text-right\">\n              <li>\n                <a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "moveFile", "move", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Paste\"><i class=\"fa fa-clipboard fa-lg\"></i></a>\n              </li>\n            </ul>\n          </td>\n          <td >\n            <a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "moveFile", "cancel", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Cancel moving\"> <i class=\"fa fa-times fa-lg\"></i> </a>\n          </td>\n        </tr>\n      ");
  return buffer;
  }
function program18(depth0,data) {
  
  
  data.buffer.push("\n            <i class=\"fa fa-folder\"></i>\n            ");
  }

function program20(depth0,data) {
  
  
  data.buffer.push("\n            <i class=\"fa fa-file\"></i>\n            ");
  }

function program22(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n              ");
  data.buffer.push(escapeExpression((helper = helpers.humanSize || (depth0 && depth0.humanSize),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "movingFile.len", options) : helperMissing.call(depth0, "humanSize", "movingFile.len", options))));
  data.buffer.push("\n            ");
  return buffer;
  }

function program24(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n      ");
  data.buffer.push(escapeExpression((helper = helpers['cloaked-collection'] || (depth0 && depth0['cloaked-collection']),options={hash:{
    'cloakView': ("file"),
    'content': ("fileList"),
    'itemController': ("file"),
    'loadingHTML': ("<td colspan=\"8\" class=\"text-center\"><i class=\"fa fa-refresh\"></i></td>"),
    'tagName': ("tbody"),
    'defaultHeight': ("47")
  },hashTypes:{'cloakView': "STRING",'content': "ID",'itemController': "STRING",'loadingHTML': "STRING",'tagName': "STRING",'defaultHeight': "STRING"},hashContexts:{'cloakView': depth0,'content': depth0,'itemController': depth0,'loadingHTML': depth0,'tagName': depth0,'defaultHeight': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "cloaked-collection", options))));
  data.buffer.push("\n    ");
  return buffer;
  }

function program26(depth0,data) {
  
  
  data.buffer.push("\n      <tbody>\n        <td colspan=\"8\" class=\"text-center\"><i class=\"fa fa-refresh fa-spin\"></i></td>\n      </tbody>\n    ");
  }

function program28(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <tr ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("isLoadingFiles:hide")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n          <td colspan=\"8\">\n            No files\n          </td>\n        </tr>\n      ");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"panel-default panel-files\">\n  <div class=\"panel-heading\">\n    \n    ");
  data.buffer.push(escapeExpression((helper = helpers['bread-crumbs'] || (depth0 && depth0['bread-crumbs']),options={hash:{
    'path': ("path")
  },hashTypes:{'path': "ID"},hashContexts:{'path': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "bread-crumbs", options))));
  data.buffer.push("\n\n    <div class=\"um-section\">\n    \n    <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("isUploading::hide :pull-right")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n      <button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "upload", "close", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" type=\"button\" class=\"close\" aria-hidden=\"true\">&times;</button>\n      ");
  data.buffer.push(escapeExpression((helper = helpers['file-uploader'] || (depth0 && depth0['file-uploader']),options={hash:{
    'path': ("path"),
    'uploader': ("uploader"),
    'store': ("controller.store"),
    'dirStatus': ("content.meta"),
    'class': ("upload-area pull-right"),
    'alert': ("showAlert")
  },hashTypes:{'path': "ID",'uploader': "ID",'store': "ID",'dirStatus': "ID",'class': "STRING",'alert': "STRING"},hashContexts:{'path': depth0,'uploader': depth0,'store': depth0,'dirStatus': depth0,'class': depth0,'alert': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "file-uploader", options))));
  data.buffer.push("\n    </div>\n\n    <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("isUploading:hide: :pull-right :uploadwrap")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n      <button type=\"button\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "upload", "open", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-default :btn-sm :pull-right")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n        <i class=\"fa fa-upload\"></i> Upload\n      </button>\n    </div>\n\n    \n    ");
  data.buffer.push(escapeExpression((helper = helpers['mkdir-input'] || (depth0 && depth0['mkdir-input']),options={hash:{
    'create': ("mkdir"),
    'path': ("path"),
    'canCreate': (true)
  },hashTypes:{'create': "STRING",'path': "ID",'canCreate': "BOOLEAN"},hashContexts:{'create': depth0,'path': depth0,'canCreate': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "mkdir-input", options))));
  data.buffer.push("\n\n    </div>\n  </div>\n\n  <div class=\"panel-body\">\n    <h4 class=\"i-am-in pull-left\"> <i class=\"fa fa-folder fa-lg\"></i>\n    ");
  stack1 = (helper = helpers['rename-input'] || (depth0 && depth0['rename-input']),options={hash:{
    'file': ("path"),
    'confirm': ("renameDir"),
    'isRenaming': ("isRenaming"),
    'class': ("renameable stocked half")
  },hashTypes:{'file': "ID",'confirm': "STRING",'isRenaming': "ID",'class': "STRING"},hashContexts:{'file': depth0,'confirm': depth0,'isRenaming': depth0,'class': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "rename-input", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </h4>\n\n    <div class=\"input-group input-group-sm input-group-search\">\n      ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'valueBinding': ("searchString"),
    'class': ("form-control input-search"),
    'placeholder': ("Search File Names")
  },hashTypes:{'valueBinding': "STRING",'class': "STRING",'placeholder': "STRING"},hashContexts:{'valueBinding': depth0,'class': depth0,'placeholder': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n      ");
  stack1 = helpers['if'].call(depth0, "searchString", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      <div class=\"input-group-addon\"><i class=\"fa fa-search\"></i></div>\n    </div>\n  </div>\n\n  <table class=\"table table-hover table-files\">\n    <thead>\n      <tr>\n        <th class=\"icon\"></th>\n        <th class=\"path\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sort", "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push("> Name ");
  data.buffer.push(escapeExpression((helper = helpers['sort-arrow'] || (depth0 && depth0['sort-arrow']),options={hash:{
    'sPs': ("sortProperties"),
    'sA': ("sortAscending"),
    'sP': ("name")
  },hashTypes:{'sPs': "ID",'sA': "ID",'sP': "STRING"},hashContexts:{'sPs': depth0,'sA': depth0,'sP': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "sort-arrow", options))));
  data.buffer.push(" </th>\n        <th class=\"size\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sort", "size", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Size ");
  data.buffer.push(escapeExpression((helper = helpers['sort-arrow'] || (depth0 && depth0['sort-arrow']),options={hash:{
    'sPs': ("sortProperties"),
    'sA': ("sortAscending"),
    'sP': ("size")
  },hashTypes:{'sPs': "ID",'sA': "ID",'sP': "STRING"},hashContexts:{'sPs': depth0,'sA': depth0,'sP': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "sort-arrow", options))));
  data.buffer.push("</th>\n        <th class=\"date\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sort", "date", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Last Modified ");
  data.buffer.push(escapeExpression((helper = helpers['sort-arrow'] || (depth0 && depth0['sort-arrow']),options={hash:{
    'sPs': ("sortProperties"),
    'sA': ("sortAscending"),
    'sP': ("date")
  },hashTypes:{'sPs': "ID",'sA': "ID",'sP': "STRING"},hashContexts:{'sPs': depth0,'sA': depth0,'sP': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "sort-arrow", options))));
  data.buffer.push("</th>\n        <th class=\"owner\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sort", "owner", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Owner ");
  data.buffer.push(escapeExpression((helper = helpers['sort-arrow'] || (depth0 && depth0['sort-arrow']),options={hash:{
    'sPs': ("sortProperties"),
    'sA': ("sortAscending"),
    'sP': ("owner")
  },hashTypes:{'sPs': "ID",'sA': "ID",'sP': "STRING"},hashContexts:{'sPs': depth0,'sA': depth0,'sP': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "sort-arrow", options))));
  data.buffer.push("</th>\n        <th class=\"grp\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sort", "group", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" >Group ");
  data.buffer.push(escapeExpression((helper = helpers['sort-arrow'] || (depth0 && depth0['sort-arrow']),options={hash:{
    'sPs': ("sortProperties"),
    'sA': ("sortAscending"),
    'sP': ("group")
  },hashTypes:{'sPs': "ID",'sA': "ID",'sP': "STRING"},hashContexts:{'sPs': depth0,'sA': depth0,'sP': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "sort-arrow", options))));
  data.buffer.push("</th>\n        <th class=\"perm\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sort", "permission", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" >Permission ");
  data.buffer.push(escapeExpression((helper = helpers['sort-arrow'] || (depth0 && depth0['sort-arrow']),options={hash:{
    'sPs': ("sortProperties"),
    'sA': ("sortAscending"),
    'sP': ("permission")
  },hashTypes:{'sPs': "ID",'sA': "ID",'sP': "STRING"},hashContexts:{'sPs': depth0,'sA': depth0,'sP': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "sort-arrow", options))));
  data.buffer.push("</th>\n        <th class=\"download\">\n          <div class=\"btn-group btn-sort pull-right\" data-toggle=\"tooltip\" data-placement=\"left\" title=\"Sort by:\">\n            <button type=\"button\" class=\"btn btn-xs btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sort", "toggle", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">\n            ");
  stack1 = helpers['if'].call(depth0, "sortAscending", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </button>\n\n            <button type=\"button\" class=\"btn btn-xs btn-default dropdown-toggle\" data-toggle=\"dropdown\">\n              <span>\n                ");
  stack1 = helpers['if'].call(depth0, "isSortPropertyEqualsDate", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(11, program11, data),fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n              </span>\n              <span class=\"caret\"></span>\n            </button>\n            <ul class=\"dropdown-menu\" role=\"menu\">\n              <li><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sort", "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" >Name</a></li>\n              <li><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sort", "size", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" >Size</a></li>\n              <li><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sort", "date", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" >Last Modified</a></li>\n              <li><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sort", "owner", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" >Owner</a></li>\n              <li><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sort", "group", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" >Group</a></li>\n              <li><a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sort", "permission", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" >Permission</a></li>\n            </ul>\n          </div>\n        </th>\n        <th class=\"check\">\n        ");
  options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[],types:[],data:data}
  if (helper = helpers['dropdown-wrap']) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0['dropdown-wrap']); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers['dropdown-wrap']) { stack1 = blockHelperMissing.call(depth0, 'dropdown-wrap', {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[],types:[],data:data}); }
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr>\n        <td><i class=\"fa fa-folder\"></i></td>\n        <td  ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "dirUp", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" colspan=\"7\">\n          <strong> .. </strong>\n        </td>\n      </tr>\n      <tr class=\"error-row\">\n        <td colspan=\"8\" class=\"danger\">\n          ");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "error", options) : helperMissing.call(depth0, "outlet", "error", options))));
  data.buffer.push("\n        </td>\n      </tr>\n      ");
  stack1 = helpers.unless.call(depth0, "hideMoving", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </tbody>\n    ");
  stack1 = helpers.unless.call(depth0, "isLoadingFiles", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(26, program26, data),fn:self.program(24, program24, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <tbody>\n      ");
  stack1 = helpers.unless.call(depth0, "fileList", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(28, program28, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </tbody>\n  </table>\n  ");
  data.buffer.push(escapeExpression((helper = helpers['context-menu'] || (depth0 && depth0['context-menu']),options={hash:{
    'target': ("targetContextMenu")
  },hashTypes:{'target': "ID"},hashContexts:{'target': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "context-menu", options))));
  data.buffer.push("\n  ");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "modal", options) : helperMissing.call(depth0, "outlet", "modal", options))));
  data.buffer.push("\n</div>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/index", function(exports, require, module) {
Ember.TEMPLATES["index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '';


  data.buffer.push("\n\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/modal/chmod", function(exports, require, module) {
Ember.TEMPLATES["modal/chmod"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("\n\n\n<div class=\"modal chmodal\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" data-backdrop=\"static\">\n  <div class=\"modal-dialog modal-sm\">\n    <div class=\"modal-content\">\n      <div class=\"modal-header\">\n        <button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button>\n        <h4 class=\"modal-title\">Edit permission</h4>\n      </div>\n      <div class=\"modal-body\">\n\n        <form class=\"form-horizontal\" role=\"form\">\n          <div class=\"form-group\">\n            <label class=\"col-sm-2 control-label\">User</label>\n            <div class=\"col-sm-10\">\n              <div class=\"btn-group\" data-toggle=\"buttons\">\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm usrR:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("usrR")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Read</span>\n                </label>\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm usrW:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("usrW")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Write</span>\n                </label>\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm usrE:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("usrE")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Execute</span>\n                </label>\n              </div>\n            </div>\n          </div>\n          <div class=\"form-group\">\n            <label class=\"col-sm-2 control-label\">Group</label>\n            <div class=\"col-sm-10\">\n              <div class=\"btn-group\" data-toggle=\"buttons\">\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm grpR:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("grpR")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Read</span>\n                </label>\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm grpW:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("grpW")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Write</span>\n                </label>\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm grpE:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("grpE")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Execute</span>\n                </label>\n              </div>\n            </div>\n          </div>\n          <div class=\"form-group\">\n            <label class=\"col-sm-2 control-label\">Other</label>\n            <div class=\"col-sm-10\">\n              <div class=\"btn-group\" data-toggle=\"buttons\">\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm otrR:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("otrR")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Read</span>\n                </label>\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm otrW:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("otrW")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Write</span>\n                </label>\n                <label ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-sm otrE:btn-primary:btn-default :btn-chmod")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checked': ("otrE")
  },hashTypes:{'type': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span>Execute</span>\n                </label>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"form-group\">\n            <div class=\"col-sm-offset-2 col-sm-10\">\n              <div class=\"checkbox\">\n                <label>\n                  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox")
  },hashTypes:{'type': "STRING"},hashContexts:{'type': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" <span> Modify recursively</span>\n                </label>\n              </div>\n            </div>\n          </div>\n        </form>\n\n      </div>\n      <div class=\"modal-footer\">\n        <button type=\"button\" class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "close", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Close</button>\n        <button type=\"button\" class=\"btn btn-primary\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "confirm", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Save changes</button>\n      </div>\n    </div>\n  </div>\n</div>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/modal/preview", function(exports, require, module) {
Ember.TEMPLATES["modal/preview"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression;


  data.buffer.push("\n<div class=\"modal preview\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" data-backdrop=\"static\">\n    <div class=\"modal-dialog modal-lg\">\n        <div class=\"modal-content\">\n            <div class=\"modal-header\">\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button>\n                <h4 class=\"modal-title\">File Preview</h4>\n                ");
  stack1 = helpers._triageMustache.call(depth0, "file.path", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </div>\n            <pre class=\"modal-body preview-content\" style=\"white-space:pre;margin: 10px; padding: 10px;overflow-y: auto; height: 350px\">");
  stack1 = helpers._triageMustache.call(depth0, "pagecontent", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</pre>\n            <div class=\"modal-footer\">\n                <button type=\"button\" class=\"btn btn-default\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "close", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Close</button>\n                <button type=\"button\" class=\"btn btn-primary\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "confirm", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Download File</button>\n            </div>\n        </div>\n    </div>\n</div>");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/util/errorRow", function(exports, require, module) {
Ember.TEMPLATES["util/errorRow"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n      <a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleStackTrace", "post", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n        <i ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":fa isExpanded:fa-toggle-down:fa-toggle-right")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></i>\n        ");
  stack1 = helpers['if'].call(depth0, "isExpanded", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </a>\n      ");
  stack1 = helpers['if'].call(depth0, "isExpanded", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program2(depth0,data) {
  
  
  data.buffer.push(" Collapse Stack Trace ");
  }

function program4(depth0,data) {
  
  
  data.buffer.push(" Expand Stack Trace ");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n          <pre class=\"prettyprint\">");
  stack1 = helpers._triageMustache.call(depth0, "stackTrace", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</pre>\n      ");
  return buffer;
  }

  data.buffer.push("\n\n<div>\n  <button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "removeAlert", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" type=\"button\" class=\"close\" aria-hidden=\"true\">&times;</button>\n  <div class=\"text-center\"><strong>");
  stack1 = helpers._triageMustache.call(depth0, "content.status", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </strong> ");
  stack1 = helpers._triageMustache.call(depth0, "output", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  stack1 = helpers['if'].call(depth0, "stackTrace", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </div>\n</div>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("templates/util/fileRow", function(exports, require, module) {
Ember.TEMPLATES["util/fileRow"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  data.buffer.push("\n    <i class=\"fa fa-folder\"></i>\n    ");
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n    <i class=\"fa fa-file\"></i>\n    ");
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n      <div class=\"file-name allow-open\">\n      ");
  stack1 = (helper = helpers['file-shaker'] || (depth0 && depth0['file-shaker']),options={hash:{
    'action': ("open"),
    'isValid': (true)
  },hashTypes:{'action': "STRING",'isValid': "BOOLEAN"},hashContexts:{'action': depth0,'isValid': depth0},inverse:self.noop,fn:self.program(6, program6, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "file-shaker", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </div>\n    ");
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <span>\n          <a>\n            <strong>\n              ");
  stack1 = helpers._triageMustache.call(depth0, "content.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </strong>\n          </a>\n        </span>\n      ");
  return buffer;
  }

function program8(depth0,data) {
  
  var helper, options;
  data.buffer.push(escapeExpression((helper = helpers.humanSize || (depth0 && depth0.humanSize),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "content.size", options) : helperMissing.call(depth0, "humanSize", "content.size", options))));
  }

function program10(depth0,data) {
  
  
  data.buffer.push("-");
  }

function program12(depth0,data) {
  
  
  data.buffer.push(" <span>*</span>  ");
  }

function program14(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n      <ul class=\"list-inline file-actions text-right\">\n        <li>\n          ");
  stack1 = helpers['if'].call(depth0, "content.isDirectory", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(17, program17, data),fn:self.program(15, program15, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </li>\n        <li>\n          <a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "moveFile", "cut", "content", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","STRING","ID"],data:data})));
  data.buffer.push(" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Move\"><i class=\"fa fa-level-down fa-rotate-270 fa-fw fa-lg\"></i></a>\n        </li>\n        <li>");
  data.buffer.push(escapeExpression((helper = helpers['popover-delete'] || (depth0 && depth0['popover-delete']),options={hash:{
    'confirm': ("deleteFile")
  },hashTypes:{'confirm': "STRING"},hashContexts:{'confirm': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "popover-delete", options))));
  data.buffer.push("</li>\n      </ul>\n    ");
  return buffer;
  }
function program15(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "download", "zip", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" target=\"_blank\" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Download zip\"><i class=\"fa fa-archive fa-fw fa-lg\"></i></a>\n          ");
  return buffer;
  }

function program17(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "download", "browse", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" target=\"_blank\" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Download\"><i class=\"fa fa-download fa-fw fa-lg\"></i></a>\n          ");
  return buffer;
  }

function program19(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n    <a href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "moveFile", "cancel", {hash:{
    'target': ("parentController")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Cancel moving\"> <i class=\"fa fa-times fa-lg\"></i></a>\n  ");
  return buffer;
  }

function program21(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n    ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'checkedBinding': ("content.selected")
  },hashTypes:{'type': "STRING",'checkedBinding': "STRING"},hashContexts:{'type': depth0,'checkedBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n  ");
  return buffer;
  }

  data.buffer.push("\n\n  <td>\n    ");
  stack1 = helpers['if'].call(depth0, "content.isDirectory", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </td>\n  <td>\n    ");
  stack1 = (helper = helpers['rename-input'] || (depth0 && depth0['rename-input']),options={hash:{
    'fileBinding': ("content"),
    'confirm': ("rename"),
    'isRenaming': ("isRenaming")
  },hashTypes:{'fileBinding': "STRING",'confirm': "STRING",'isRenaming': "ID"},hashContexts:{'fileBinding': depth0,'confirm': depth0,'isRenaming': depth0},inverse:self.noop,fn:self.program(5, program5, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "rename-input", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </td>\n  <td>\n    ");
  stack1 = helpers.unless.call(depth0, "content.isDirectory", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </td>\n  <td>\n    <small class='allow-open'>\n      ");
  data.buffer.push(escapeExpression((helper = helpers.showDate || (depth0 && depth0.showDate),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["ID","STRING"],data:data},helper ? helper.call(depth0, "modificationTime", "YYYY-MM-DD HH:mm", options) : helperMissing.call(depth0, "showDate", "modificationTime", "YYYY-MM-DD HH:mm", options))));
  data.buffer.push("\n    </small>\n  </td>\n  <td >");
  stack1 = helpers._triageMustache.call(depth0, "content.owner", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n  <td>");
  stack1 = helpers._triageMustache.call(depth0, "content.group", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n  <td class=\"permission-cell\">\n    ");
  stack1 = helpers._triageMustache.call(depth0, "content.permission", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  stack1 = helpers['if'].call(depth0, "isPermissionsDirty", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </td>\n  <td>\n    ");
  stack1 = helpers.unless.call(depth0, "isMoving", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </td>\n  <td>\n  ");
  stack1 = helpers['if'].call(depth0, "isMoving", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(21, program21, data),fn:self.program(19, program19, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  stack1 = helpers._triageMustache.call(depth0, "toggle-context", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </td>\n");
  return buffer;
  
});
module.exports = module.id;
});

require.register("views/file", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

Em.CloakedView.reopen({
  classNames:['file-row'],
  classNameBindings:['_containedView.controller.isMoving:isMoving']
});

Ember.CloakedView.reopen({
  cloak:Em.K
});

App.FileView = Em.View.extend({
  templateName: 'util/fileRow',
  tagName:'tr'
});

});

require.register("views/files", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.FilesView = Em.View.extend({
    templateName: 'files',
    didInsertElement:function () {
      this.scheduleRebind();
    },
    scheduleRebind:function () {
      Em.run.scheduleOnce('render', this, this.get('reBindTooltips'));
    },
    reBindTooltips:function () {
      this.$().tooltip({selector:'[data-toggle=tooltip]'});
    }
});

});

require.register("views/filesAlert", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.FilesAlertView = Em.View.extend({
  templateName:'util/errorRow'
});

});

require.register("views/modalChmod", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.ModalChmodView = Em.View.extend({
  actions:{
    confirm:function (file) {
      this.get('controller.controllers.files').send('confirmChmod',this.get('controller.file'));
      this.$('.chmodal').modal('hide');
    },
    close:function () {
      var file = this.get('controller.file');
      var diff = file.changedAttributes();
      if (diff.permission) {
        file.set('permission',diff.permission[0]);
      }
      this.$('.chmodal').modal('hide');
    }
  },
  didInsertElement:function (argument) {
    this.$('.btn-chmod').each(function () {
      $(this).toggleClass('active',$(this).children('input').is(':checked'));
    });

    this.$('.chmodal').modal();
    this.$('.chmodal').on('hidden.bs.modal',function  () {
      this.get('controller.controllers.files').send('removeChmodModal');
    }.bind(this));
  },
  willClearRender:function  () {
    this.$('.chmodal').off('hidden.bs.modal');
    this.$('.chmodal').modal('hide');
  }
});
});

require.register("views/modalPreview", function(exports, require, module) {
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

App.ModalPreviewView = Em.View.extend({
  actions:{
    confirm:function (file) {
      this.get('controller.controllers.file').send('confirmPreview', this.get('controller.file'));
      this.$('.preview').modal('hide');
    },
    close:function () {
      this.$('.preview').modal('hide');
    }
  },
  didInsertElement:function (argument) {
    var self = this;

    this.$('.preview').modal();

    this.$('.preview').on('hidden.bs.modal',function  () {
      this.get('controller.controllers.files').send('removePreviewModal');
    }.bind(this));

    this.$('.preview-content').on('scroll', function() {
      if($(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight) {
        self.get('controller').send('next');
      }
    });

  },
  willClearRender:function  () {
    this.$('.preview').off('hidden.bs.modal');
    this.$('.preview').modal('hide');
  }
});
});


//# sourceMappingURL=app.js.map