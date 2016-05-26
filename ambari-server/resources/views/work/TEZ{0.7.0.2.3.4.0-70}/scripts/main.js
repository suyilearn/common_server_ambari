(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

Ember.FEATURES.I18N_TRANSLATE_HELPER_SPAN = false;
Ember.ENV.I18N_COMPILE_WITHOUT_HANDLEBARS = true;

var App = window.App = Em.Application.createWithMixins(Bootstrap, {
  // Basic logging, e.g. "Transitioned into 'post'"
  LOG_TRANSITIONS: true,

  // Extremely detailed logging, highlighting every internal
  // step made while transitioning into a route, including
  // `beforeModel`, `model`, and `afterModel` hooks, and
  // information about redirects and aborted transitions
  LOG_TRANSITIONS_INTERNAL: true,

  env: {
    isStandalone: true, // Can ne set false in the wrapper initializer
    isIE: navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0
  },

  setConfigs: function (configs) {
    if(configs.envDefaults.version == "${version}") {
      delete configs.envDefaults.version;
    }
    App.Helpers.misc.merge(App.Configs, configs);
    $.extend(App.env, {
      timelineBaseUrl: App.Helpers.misc.normalizePath(App.env.timelineBaseUrl),
      RMWebUrl: App.Helpers.misc.normalizePath(App.env.RMWebUrl)
    });
    App.advanceReadiness();
  }
});

Em.Application.initializer({
  name: "objectTransforms",

  initialize: function(container, application) {
    application.register('transform:object', DS.Transform.extend({
      deserialize: function(serialized) {
        return Em.none(serialized) ? {} : serialized;
      },

      serialized: function(deserialized) {
        return Em.none(deserialized) ? {} : deserialized;
      }
    }));
  }
});

App.deferReadiness();

App.Helpers = Em.Namespace.create(),
App.Mappers = Em.Namespace.create(),
App.Configs = Em.Namespace.create();

App.ready = function () {
  $.extend(App.env, App.Configs.envDefaults);

  $(document).tooltip({
    delay: 20,
    tooltipClass: 'generic-tooltip'
  });

  ["timelineBaseUrl", "RMWebUrl"].forEach(function(item) {
    if (!!App.env[item]) {
      App.env[item] = App.Helpers.misc.normalizePath(App.env[item]);
    }
  })

  App.ApplicationAdapter = App.TimelineRESTAdapter.extend({
    host: App.env.timelineBaseUrl
  });
  App.ApplicationSerializer = App.TimelineSerializer.extend();

  App.AppDetailAdapter = DS.RESTAdapter.extend({
    ajax: function(url, method, hash) {
      hash = hash || {}; // hash may be undefined
      hash.crossDomain = true;
      hash.xhrFields = {withCredentials: true};
      hash.targetServer = "Timeline Server";
      return this._super(url, method, hash);
    },
    namespace: App.Configs.restNamespace.applicationHistory,
    host: App.env.timelineBaseUrl,
    pathForType: function() {
      return "apps";
    },
  });

  App.DagVertexAdapter =
  App.VertexAdapter = App.ApplicationAdapter.extend({
    _setInputs: function (store, data) {
      var dagId = Ember.get(data, 'primaryfilters.TEZ_DAG_ID.0'),
          vertexName = Ember.get(data, 'otherinfo.vertexName');
      if(dagId) {
        return store.find('dag', dagId).then(function (dag) {
          if(dag.get('vertices') instanceof Array) {
            var vertexData = dag.get('vertices').findBy('vertexName', vertexName);
            if(vertexData && vertexData.additionalInputs) {
              data.inputs = vertexData.additionalInputs;
            }
            if(vertexData && vertexData.additionalOutputs) {
              data.outputs = vertexData.additionalOutputs;
            }
          }
          return data;
        });
      }
      else {
        return Em.RSVP.Promise(data);
      }
    },
    find: function(store, type, id) {
      var that = this;
      return this._super(store, type, id).then(function (data) {
        return that._setInputs(store, data);
      });
    },
    findQuery: function(store, type, queryObj, records) {
      var that = this;
      return that._super(store, type, queryObj, records ).then(function (data) {
        var fetchers = [];
        data.entities.forEach(function (datum) {
          fetchers.push(that._setInputs(store, datum));
        });
        return Em.RSVP.allSettled(fetchers).then(function () {
          return data;
        });
      });
    }
  });

  App.AMInfoAdapter = DS.RESTAdapter.extend({
    ajax: function(url, method, hash) {
      hash = hash || {}; // hash may be undefined
      if (hash && hash.data && hash.data.__app_id__) {
        url = url.replace('__app_id__', hash.data.__app_id__);
        delete hash.data['__app_id__'];
      }
      hash.crossDomain = true;
      hash.xhrFields = {withCredentials: true};
      hash.targetServer = "Resource Manager";
      return this._super(url, method, hash);
    },
    host: App.env.RMWebUrl,
    namespace: App.Configs.restNamespace.aminfo,
  });

  App.DagProgressAdapter = App.AMInfoAdapter.extend({
    buildURL: function(type, id, record) {
      var url = this._super(type, undefined, record);
      return url.replace('__app_id__', record.get('appId'))
        .fmt(record.get('dagIdx'));
    },
    pathForType: function() {
      return 'dagProgress?dagID=%@';
    }
  });

  App.VertexProgressAdapter = App.AMInfoAdapter.extend({
    findQuery: function(store, type, query) {
      var record = query.metadata;
      delete query.metadata;
      return this.ajax(
        this.buildURL(Ember.String.pluralize(type.typeKey),
          record.vertexIds, Em.Object.create(record)), 'GET', { data: query});
    },
    buildURL: function(type, id, record) {
      var url = this._super(type, undefined, record);
      return url.replace('__app_id__', record.get('appId'))
        .fmt(record.get('dagIdx'), id);
    },
    pathForType: function(typeName) {
      return typeName + '?dagID=%@&vertexID=%@';
    }
  });

  // v2 version of am web services
  App.DagInfoAdapter = App.AMInfoAdapter.extend({
    namespace: App.Configs.restNamespace.aminfoV2,
    findQuery: function(store, type, query) {
      var record = query.metadata;
      delete query.metadata;
      return this.ajax(
        this.buildURL(Ember.String.pluralize(type.typeKey),
          record.dagID, Em.Object.create(record)), 'GET', { data: query});
    },
    buildURL: function(type, id, record) {
      var url = this._super(type, undefined, record);
      return url.replace('__app_id__', record.get('appID'))
        .fmt(id, record.get('counters'));
    },
    pathForType: function(typeName) {
      return 'dagInfo?dagID=%@&counters=%@';
    }
  });


  App.VertexInfoAdapter = App.AMInfoAdapter.extend({
    namespace: App.Configs.restNamespace.aminfoV2,
    findQuery: function(store, type, query) {
      var record = query.metadata;
      delete query.metadata;
      return this.ajax(
        this.buildURL(Ember.String.pluralize(type.typeKey),
          record.vertexID, Em.Object.create(record)), 'GET', { data: query});
    },
    buildURL: function(type, id, record) {
      var url = this._super(type, undefined, record);
      return url.replace('__app_id__', record.get('appID'))
        .fmt(record.get('dagID'), id, record.get('counters'));
    },
    pathForType: function(typeName) {
      return 'verticesInfo?dagID=%@&vertexID=%@&counters=%@';
    }
  });

  App.TaskInfoAdapter = App.AMInfoAdapter.extend({
    namespace: App.Configs.restNamespace.aminfoV2,
    findQuery: function(store, type, query) {
      var record = query.metadata;
      delete query.metadata;
      return this.ajax(
        this.buildURL(Ember.String.pluralize(type.typeKey),
          record.taskID, Em.Object.create(record)), 'GET', { data: query});
    },
    buildURL: function(type, id, record) {
      var url = this._super(type, undefined, record);
      return url.replace('__app_id__', record.get('appID'))
        .fmt(record.get('dagID'), id, record.get('counters'));
    },
    pathForType: function(typeName) {
      return 'tasksInfo?dagID=%@&taskID=%@&counters=%@';
    }
  });

  App.AttemptInfoAdapter = App.AMInfoAdapter.extend({
    namespace: App.Configs.restNamespace.aminfoV2,
    findQuery: function(store, type, query) {
      var record = query.metadata;
      delete query.metadata;
      return this.ajax(
        this.buildURL(Ember.String.pluralize(type.typeKey),
          record.attemptID, Em.Object.create(record)), 'GET', { data: query});
    },
    buildURL: function(type, id, record) {
      var url = this._super(type, undefined, record);
      return url.replace('__app_id__', record.get('appID'))
        .fmt(record.get('dagID'), record.get('taskID'), id, record.get('counters'));
    },
    pathForType: function(typeName) {
      return 'attemptsInfo?dagID=%@&taskID=%@&attemptID=%@&counters=%@';
    }
  });

  App.ClusterAppAdapter = DS.RESTAdapter.extend({
    host: App.env.RMWebUrl,
    namespace: App.Configs.restNamespace.cluster,
    pathForType: function() {
      return 'apps';
    }
  });

};

$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
  jqXHR.requestOptions = originalOptions;
});

$.ajaxSetup({
  cache: false
});

/* Order and include */


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function constructDefaultUrl(location, port) {
  var protocol,
      hostname;
  if (App.env.isStandalone && location.protocol != 'file:') {
    protocol = location.protocol;
    hostname = location.hostname;
  } else {
    protocol = 'http:';
    hostname = 'localhost';
  }
  return '%@//%@:%@'.fmt(protocol, hostname, port);
}

var getDefaultTimelineUrl = function() {
  return constructDefaultUrl(window.location, 8188);
};

var getDefaultRMWebUrl = function() {
  return constructDefaultUrl(window.location, 8088);
};

$.extend(true, App.Configs, {
  envDefaults: {
    version: "0.7.0",

    timelineBaseUrl: getDefaultTimelineUrl(),
    RMWebUrl: getDefaultRMWebUrl()
  },

  restNamespace: {
    timeline: 'ws/v1/timeline',
    applicationHistory: 'ws/v1/applicationhistory',
    aminfo: 'proxy/__app_id__/ws/v1/tez',
    aminfoV2: 'proxy/__app_id__/ws/v2/tez',
    cluster: 'ws/v1/cluster'
  },

  otherNamespace: {
    cluster: 'cluster',
  },

  tables: {
    entity: {
      dag: [
        // DAG Counters
        {
          counterName :"NUM_FAILED_TASKS",
          counterGroupName :"org.apache.tez.common.counters.DAGCounter",
        },
        {
          counterName :"NUM_KILLED_TASKS",
          counterGroupName :"org.apache.tez.common.counters.DAGCounter",
        },
        {
          counterName :"NUM_SUCCEEDED_TASKS",
          counterGroupName :"org.apache.tez.common.counters.DAGCounter",
        },
        {
          counterName :"TOTAL_LAUNCHED_TASKS",
          counterGroupName :"org.apache.tez.common.counters.DAGCounter",
        },
        {
          counterName :"OTHER_LOCAL_TASKS",
          counterGroupName :"org.apache.tez.common.counters.DAGCounter",
        },
        {
          counterName :"DATA_LOCAL_TASKS",
          counterGroupName :"org.apache.tez.common.counters.DAGCounter",
        },
        {
          counterName :"RACK_LOCAL_TASKS",
          counterGroupName :"org.apache.tez.common.counters.DAGCounter",
        },
        {
          counterName :"SLOTS_MILLIS_TASKS",
          counterGroupName :"org.apache.tez.common.counters.DAGCounter",
        },
        {
          counterName :"FALLOW_SLOTS_MILLIS_TASKS",
          counterGroupName :"org.apache.tez.common.counters.DAGCounter",
        },
        {
          counterName :"TOTAL_LAUNCHED_UBERTASKS",
          counterGroupName :"org.apache.tez.common.counters.DAGCounter",
        },
        {
          counterName :"NUM_UBER_SUBTASKS",
          counterGroupName :"org.apache.tez.common.counters.DAGCounter",
        },
        {
          counterName :"NUM_FAILED_UBERTASKS",
          counterGroupName :"org.apache.tez.common.counters.DAGCounter",
        },

        {
          counterName: "REDUCE_OUTPUT_RECORDS",
          counterGroupName: "REDUCE_OUTPUT_RECORDS",
        },
        {
          counterName: "REDUCE_SKIPPED_GROUPS",
          counterGroupName: "REDUCE_SKIPPED_GROUPS",
        },
        {
          counterName: "REDUCE_SKIPPED_RECORDS",
          counterGroupName: "REDUCE_SKIPPED_RECORDS",
        },
        {
          counterName: "COMBINE_OUTPUT_RECORDS",
          counterGroupName: "COMBINE_OUTPUT_RECORDS",
        },
        {
          counterName: "SKIPPED_RECORDS",
          counterGroupName: "SKIPPED_RECORDS",
        },
        {
          counterName: "INPUT_GROUPS",
          counterGroupName: "INPUT_GROUPS",
        }
      ]
    }
  },

  defaultCounters: [
    // File System Counters
    {
      counterName: 'FILE_BYTES_READ',
      counterGroupName: 'org.apache.tez.common.counters.FileSystemCounter',
    },
    {
      counterName: 'FILE_BYTES_WRITTEN',
      counterGroupName: 'org.apache.tez.common.counters.FileSystemCounter',
    },
    {
      counterName: 'FILE_READ_OPS',
      counterGroupName: 'org.apache.tez.common.counters.FileSystemCounter',
    },
    {
      counterName: 'FILE_LARGE_READ_OPS',
      counterGroupName: 'org.apache.tez.common.counters.FileSystemCounter',
    },
    {
      counterName: 'FILE_WRITE_OPS',
      counterGroupName: 'org.apache.tez.common.counters.FileSystemCounter',
    },
    {
      counterName: 'HDFS_BYTES_READ',
      counterGroupName: 'org.apache.tez.common.counters.FileSystemCounter',
    },
    {
      counterName: 'HDFS_BYTES_WRITTEN',
      counterGroupName: 'org.apache.tez.common.counters.FileSystemCounter',
    },
    {
      counterName: 'HDFS_READ_OPS',
      counterGroupName: 'org.apache.tez.common.counters.FileSystemCounter',
    },
    {
      counterName: 'HDFS_LARGE_READ_OPS',
      counterGroupName: 'org.apache.tez.common.counters.FileSystemCounter',
    },
    {
      counterName: 'HDFS_WRITE_OPS',
      counterGroupName: 'org.apache.tez.common.counters.FileSystemCounter',
    },

    // Task Counters
    {
      counterName: "NUM_SPECULATIONS",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "REDUCE_INPUT_GROUPS",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "REDUCE_INPUT_RECORDS",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "SPLIT_RAW_BYTES",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "COMBINE_INPUT_RECORDS",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "SPILLED_RECORDS",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "NUM_SHUFFLED_INPUTS",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "NUM_SKIPPED_INPUTS",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "NUM_FAILED_SHUFFLE_INPUTS",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "MERGED_MAP_OUTPUTS",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "GC_TIME_MILLIS",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "CPU_MILLISECONDS",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "PHYSICAL_MEMORY_BYTES",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "VIRTUAL_MEMORY_BYTES",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "COMMITTED_HEAP_BYTES",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "INPUT_RECORDS_PROCESSED",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "OUTPUT_RECORDS",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "OUTPUT_LARGE_RECORDS",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "OUTPUT_BYTES",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "OUTPUT_BYTES_WITH_OVERHEAD",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "OUTPUT_BYTES_PHYSICAL",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "ADDITIONAL_SPILLS_BYTES_WRITTEN",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "ADDITIONAL_SPILLS_BYTES_READ",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "ADDITIONAL_SPILL_COUNT",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "SHUFFLE_BYTES",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "SHUFFLE_BYTES_DECOMPRESSED",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "SHUFFLE_BYTES_TO_MEM",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "SHUFFLE_BYTES_TO_DISK",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "SHUFFLE_BYTES_DISK_DIRECT",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "NUM_MEM_TO_DISK_MERGES",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "NUM_DISK_TO_DISK_MERGES",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "SHUFFLE_PHASE_TIME",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "MERGE_PHASE_TIME",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "FIRST_EVENT_RECEIVED",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
    {
      counterName: "LAST_EVENT_RECEIVED",
      counterGroupName: "org.apache.tez.common.counters.TaskCounter",
    },
  ]
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
App.Helpers.Pollster = Ember.Object.extend({
  interval: function() {
    return this.get('_interval') || 10000; // Time between polls (in ms)
  }.property().readOnly(),

  // Schedules the function `f` to be executed every `interval` time.
  // if runImmediate is set first run is scheduled immedietly
  schedule: function(f, runImmediete) {
    var timer = this.get('timer');
    if(timer) {
      return timer;
    }
    return Ember.run.later(this, function() {
      f.apply(this);
      this.set('timer', null);
      this.set('timer', this.schedule(f));
    }, this.get('interval'));
  },

  // Stops the pollster
  stop: function() {
    Ember.run.cancel(this.get('timer'));
    this.set('timer', null);
  },

  // Starts the pollster, i.e. executes the `onPoll` function every interval.
  start: function(runImmediate, interval) {
    if (!!interval && interval > 1000) {
      this.set('_interval', interval)
    }
    var callback = this.get('onPoll');
    if (runImmediate) {
      callback.apply(this);
    }
    this.set('timer', this.schedule(callback, runImmediate));
  },

  onPoll: function(){
    // Issue JSON request and add data to the store
  }
});

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.Helpers.date = {

  /**
   * List of monthes short names
   * @type {string[]}
   */
  dateMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  /**
   * List of days short names
   * @type {string[]}
   */
  dateDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

  /**
   * Add leading zero
   *
   * @param {string} time
   * @returns {string}
   * @method dateFormatZeroFirst
   */
  dateFormatZeroFirst: function (time) {
    if (time < 10) return '0' + time;
    return ""  + time;
  },

  /**
   * Convert timestamp to date-string 'DAY_OF_THE_WEEK, MONTH DAY, YEAR HOURS:MINUTES'
   *
   * @param {number} timestamp
   * @param {bool} showSeconds should seconds be added to result string. true by default.
   * @param {bool} showMilliseconds should miliseconds be added to result string (if <code>showSeconds</code> is false, milliseconds wouldn't be added)
   * @return {*} date
   * @method dateFormat
   */
  dateFormat: function (timestamp, showSeconds, showMilliseconds) {
    if (!App.Helpers.number.isValidInt(timestamp) || timestamp == 0) {
      return "";
    }
    if(showSeconds == undefined) showSeconds = true;
    var format = 'DD MMM YYYY HH:mm';
    if (showSeconds) {
      format += ':ss';
      if (showMilliseconds) {
        format += ':SSS';
      }
    }
    var zone = moment.tz.zone(App.get('env.timezone'));
    if (zone == null)  {
      return moment.utc(timestamp).local().format(format);
    }
    return moment.tz(timestamp, zone.name).format(format);
  },

  /**
   * Convert timestamp to date-string 'DAY_OF_THE_WEEK MONTH DAY YEAR'
   *
   * @param {string} timestamp
   * @return {string}
   * @method dateFormatShort
   */
  dateFormatShort: function (timestamp) {
    if (!App.Helpers.number.isValidInt(timestamp)) {
      return timestamp;
    }
    var format = 'ddd MMM DD YYYY';
    var date = moment((new Date(timestamp)).toISOString().replace('Z', '')).format(format);
    var today = moment((new Date()).toISOString().replace('Z', '')).format(format);
    if (date === today) {
      return 'Today ' + (new Date(timestamp)).toLocaleTimeString();
    }
    return date;
  },

  /**
   * Convert starTimestamp to 'DAY_OF_THE_WEEK, MONTH DAY, YEAR HOURS:MINUTES', except for the case: year equals 1969
   *
   * @param {string} startTimestamp
   * @return {string} startTimeSummary
   * @method startTime
   */
  startTime: function (startTimestamp) {
    if (!App.Helpers.number.isValidInt(startTimestamp)) {
      return '';
    }
    var startDate = new Date(startTimestamp);
    var months = this.dateMonths;
    var days = this.dateDays;
    // generate start time
    if (startDate.getFullYear() == 1969 || startTimestamp < 1) {
      return 'Not started';
    }
    var startTimeSummary = '';
    if (new Date(startTimestamp).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0)) { //today
      startTimeSummary = 'Today ' + this.dateFormatZeroFirst(startDate.getHours()) + ':' + this.dateFormatZeroFirst(startDate.getMinutes());
    } else {
      startTimeSummary = days[startDate.getDay()] + ' ' + months[startDate.getMonth()] + ' ' +
        this.dateFormatZeroFirst(startDate.getDate()) + ' ' + startDate.getFullYear() + ' '
        + this.dateFormatZeroFirst(startDate.getHours()) + ':' + this.dateFormatZeroFirst(startDate.getMinutes());
    }
    return startTimeSummary;
  },

  /**
   * Provides the duration between the given start and end timestamp. If start time
   * not valid, duration will be ''. If end time is not valid, duration will
   * be till now, showing 'Lasted for xxx secs'.
   *
   * @param {string} startTimestamp
   * @param {string} endTimestamp
   * @return {string} durationSummary
   * @method durationSummary
   */
  durationSummary: function (startTimestamp, endTimestamp) {
    // generate duration
    var durationSummary = '';
    var startDate = new Date(startTimestamp);
    var endDate = new Date(endTimestamp);
    if (startDate.getFullYear() == 1969 || startTimestamp < 1) {
      // not started
      return Em.I18n.t('common.na');
    }
    if (endDate.getFullYear() != 1969 && endTimestamp > 0) {
      return '' + this.timingFormat(endTimestamp - startTimestamp, 1); //lasted for xx secs
    } else {
      // still running, duration till now
      var t = new Date().getTime(),
        time = (t - startTimestamp) < 0 ? 0 : (t - startTimestamp);
      durationSummary = '' + this.timingFormat(time, 1);
    }
    return durationSummary;
  },

  /**
   * Convert time in mseconds to
   * 30 ms = 30 ms
   * 300 ms = 300 ms
   * 999 ms = 999 ms
   * 1000 ms = 1.00 secs
   * 3000 ms = 3.00 secs
   * 35000 ms = 35.00 secs
   * 350000 ms = 350.00 secs
   * 999999 ms = 999.99 secs
   * 1000000 ms = 16.66 mins
   * 3500000 secs = 58.33 mins
   *
   * @param {number} time
   * @param {bool} zeroValid for the case to show 0 when time is 0, not null
   * @return {string|null} formatted date
   * @method timingFormat
   */
  timingFormat: function (time, /* optional */ zeroValid) {
    var intTime = parseInt(time);
    if (zeroValid && intTime <= 0) {
      return 0 + ' secs';
    }
    if (!intTime) {
      return null;
    }
    var timeStr = intTime.toString();
    var lengthOfNumber = timeStr.length;
    var oneMinMs = 60000;
    var oneHourMs = 3600000;
    var oneDayMs = 86400000;

    if (lengthOfNumber < 4) {
      time = Math.floor(time);
      return time + ' ms';
    } else if (lengthOfNumber < 7) {
      time = (time / 1000).toFixed(2);
      time = Math.floor(time);
      return time + ' secs';
    } else if (time < oneHourMs) {
      time = (time / oneMinMs).toFixed(2);
      return time + ' mins';
    } else if (time < oneDayMs) {
      time = (time / oneHourMs).toFixed(2);
      return time + ' hours';
    } else {
      time = (time / oneDayMs).toFixed(2);
      return time + ' days';
    }
  },

  /**
   * Provides the duration between the given start and end time. If start time
   * is not given, duration will be 0. If end time is not given, duration will
   * be till now.
   *
   * @param {Number} startTime Start time from epoch
   * @param {Number} endTime End time from epoch
   * @return {Number} duration
   * @method duration
   */
  duration: function (startTime, endTime) {
    if (!startTime || !endTime) return undefined;
    var duration = 0;
    if (startTime && startTime > 0) {
      if (!endTime || endTime < 1) {
        endTime = new Date().getTime();
      }
      duration = endTime - startTime;
    }
    return duration;
  }
};


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.Helpers.Dialogs = Em.Namespace.create({

  /**
   * Shows an alert box with a title and body
   * @param title {String} The alert window title
   * @param message {String} The alert message
   * @param controller {Controller} Active ember controller
   */
   alert: function (title, message, controller) {
      Bootstrap.ModalManager.open(
      'alertModal',
      title,
      Ember.View.extend({
        template: Em.Handlebars.compile(
          '<p id="modalMessage">%@</p>'.fmt(message)
        )
      }), [
        Ember.Object.create({title: 'OK', dismiss: 'modal'})
      ], controller);
   },

  /*
   * Displays a dialog with a multiselector based on the provided data.
   * - Helper looks for id & displayText in listItems.
   * @param listItems Array of all items
   * @param selectedItems
   * @param keyHash Defines the key that helper must use to get value from item.
   * @return Returns a promoise that would be fulfilled when Ok is pressed
   */
  displayMultiSelect: function (title, listItems, selectedItems, keyHash) {
    /*
     * Looks in an object for properties.
     */
    function getProperty(object, propertyName) {
      var propertyName = (keyHash && keyHash[propertyName]) || propertyName;
      return object[propertyName] || (object.get && object.get(propertyName));
    }

    var container = $( "<div/>" ),
        listHTML = "<input type='hidden' autofocus='autofocus'/>";

    listItems.forEach(function (item) {
      var id = getProperty(item, 'id'),
          displayText = getProperty(item, 'displayText');

      listHTML += '<li class="no-wrap"><input id=%@ type="checkbox" %@ /> %@</li>'.fmt(
        id,
        selectedItems[id] ? 'checked' : '',
        displayText
      );
    });

    container.append('<ol class="selectable"> %@ </ol>'.fmt(listHTML));

    return new Em.RSVP.Promise(function (resolve, reject) {
      var dialogOptions = {
        modal: true,
        title: title,
        width: 350,
        height: 500,
        resizable: false,
        open: function() {
          $(this).closest(".ui-dialog")
          .find(".ui-dialog-titlebar-close")
          .append('<span\
              class="ui-button-icon-primary ui-icon ui-icon-closethick align-close-button">\
              </span>');
        },
        buttons: {
          Ok: function() {
            var visibleColumnIds = {};

            container.find('input:checked').each(function(index, checkbox){
              visibleColumnIds[checkbox.id] = true;
            });
            resolve(visibleColumnIds);

            $( this ).dialog("close");
            container.remove();
          }
        }
      };

      if($('#dialog-container').length) {
        dialogOptions.appendTo = '#dialog-container';
      }

      container.dialog(dialogOptions);
    });
  }
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.Helpers.emData = {
  /**
   * Merge data from an array of records to another
   * @param target {Array} Target record array
   * @param source {Array} Source record array
   * @param mergeProps {Array} Array of strings of property names to be merged
   * @return true if merge was success, else false
   */
  mergeRecords: function (target, source, mergeProps) {

    if(source && target && mergeProps) {
      target.forEach(function (row) {
        var info = source.findBy('id', row.get('id')),
            merge = !!info;

        if(info && info.get('counters')) {
          row.set('counterGroups',
            App.Helpers.misc.mergeCounterInfo(
              row.get('counterGroups'),
              info.get('counters')
            ).slice(0)
          );
          row.didLoad();// To update the record time stamp
        }

        if(merge && row.get('progress') && info.get('progress')) {
          if(row.get('progress') >= info.get('progress')) {
            merge = false;
          }
        }

        if(merge) {
          row.setProperties(info.getProperties.apply(info, mergeProps));
          row.didLoad();// To update the record time stamp
        }
      });
      return true;
    }
    return false;
  }
};


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.Helpers.EntityArrayPollster = App.Helpers.Pollster.extend({
  entityType: null, // Entity type to be polled
  store: null,
  mergeProperties: [],
  options: null,

  isRunning: false,
  isWaiting: false,

  polledRecords: null,
  targetRecords: [],

  _ready: function () {
    return this.get('entityType') &&
        this.get('store') &&
        this.get('options') &&
        this.get('targetRecords.length');
  }.property('entityType', 'store', 'options', 'targetRecords.length'),

  start: function(runImmediate, interval) {
    if(!this.get('isRunning')) {
      this.set('isRunning', true);
      this._super(runImmediate == undefined ? true : runImmediate, interval);
    }
  },

  stop: function() {
    if(this.get('isRunning')) {
      this._super();
      this.set('isRunning', false);
    }
  },

  onPoll: function(){
    if(!this.get('isWaiting') && this.get('_ready')) {
      this.set('isWaiting', true);

      return this.store.findQuery(this.get('entityType'), {
        metadata: this.get('options')
      }).then(this._callIfRunning(this, 'onResponse')).
      catch(this._callIfRunning(this, 'onFailure')).
      finally(this._final.bind(this));
    }
  },

  _preRequisitesObserver: function () {
    if(this.get('isRunning')) {
      this.onPoll();
    }
  }.observes('options', 'targetRecords'),

  _callIfRunning: function (that, funName) {
    return function (data) {
      var fun = that.get(funName);
      if(fun && that.get('isRunning')) {
        fun.call(that, data);
      }
    };
  },

  onResponse: function (data) {
    this.set('polledRecords', data);
    this.mergeToTarget();
  },

  onFailure: function (err) {
    // Implement based on requirement
  },

  _final: function () {
    this.set('isWaiting', false);
  },

  mergeToTarget: function () {
    App.Helpers.emData.mergeRecords(
      this.get('targetRecords'),
      this.get('polledRecords'),
      this.get('mergeProperties') || []
    );
  }.observes('targetRecords').on('init')
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/*
 * A singleton class to control the error bar.
 */
App.Helpers.ErrorBar = (function () {
  var _instance; // Singleton instance of the class

  var ErrorBar = Em.Object.extend({
    init: function () {
      var errorBar = $('.error-bar');
      errorBar.find('.close').click(function () {
        if(_instance) {
          _instance.hide();
        }
      });
    },
    /*
     * Displays an error message in the error bar.
     * @param message String Error message
     * @param details String HTML to be displayed as details.
     */
    show: function (message, details) {
      var errorBar = $('.error-bar'),
          messageElement,
          lineEndIndex;

      errorBar.find('.expander').unbind('click');
      errorBar.find('.details').removeClass('visible');

      if(typeof message == 'string') {
        lineEndIndex = message.indexOf('\n');

        if(lineEndIndex == -1) {
          lineEndIndex = message.indexOf('<br');
        }

        if(lineEndIndex != -1) {
          details = details ? "<br />" + details : "";
          details = message.substr(lineEndIndex) + details;
          message = message.substr(0, lineEndIndex);
        }
      }

      if(details) {
        messageElement = $('<a class="expander" href="#">' + message + '</a>');
        messageElement.click(function (event) {
          errorBar.find('.details').toggleClass('visible');
          event.preventDefault();
        });

        errorBar.find('.details').html(details.replace(/\n/g, "<br />"));
      }
      else {
        messageElement = $('<span>' + message + '</span>');
      }

      errorBar.find('.message').empty().append(messageElement);
      errorBar.addClass('visible');
    },

    /*
     * Hides if the error bar is visible.
     */
    hide: function () {
      var errorBar = $('.error-bar').first();

      errorBar.find('.expander').unbind('click');
      errorBar.find('.details').removeClass('visible');

      errorBar.removeClass('visible');
    }
  });

  ErrorBar.getInstance = function(){
    return _instance || (_instance = ErrorBar.create());
  };
  return ErrorBar;
})();



})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.Helpers.fullscreen = (function(){
  function inFullscreenMode() {
    return document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;
  }

  return {
    inFullscreenMode: inFullscreenMode,
    toggle: function (element) {
      if (inFullscreenMode()) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } else {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
      }

      return inFullscreenMode();
    }
  };
})();

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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
   * formats the given unix timestamp. returns Not Available if its not a number.
   *
   * @param {number} unixtimestamp 
   * @returns {string} 
   * @method formatUnixTimestamp
   */
Em.Handlebars.helper('formatUnixTimestamp', function(timestamp) {
	if (!App.Helpers.number.isValidInt(timestamp)) return 'Not Available';
	if (timestamp > 0) {
		return App.Helpers.date.dateFormat(timestamp);
	}
	return '';
});

/**
 * Format value with US style thousands separator
 * @param {string/number} value to be formatted
 * @returns {string} Formatted string
 */
Em.Handlebars.helper('formatNumThousands', function (value) {
  return App.Helpers.number.formatNumThousands(value);
});

/*
 * formats the duration.
 *
 * @param {duration} duration in milliseconds
 * @return {Number}
 * @method formatDuration
 */
Em.Handlebars.helper('formatDuration', function(startTime, endTime) {
  if (!endTime || !startTime) {
    return 'Not Available';
  }

	// unixtimestamp is in seconds. javascript expects milliseconds.
	if (endTime < startTime) {
		endTime = new Date().getTime();
	}

	return App.Helpers.date.durationSummary(startTime, endTime);
});

Em.Handlebars.helper('formatTimeMillis', function(duration) {
  return App.Helpers.date.timingFormat(duration, true);
});

function replaceAll(str, str1, str2, ignore) 
{
    return str.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

//TODO: needs better indendation.
Em.Handlebars.helper('formatDiagnostics', function(diagnostics) {
  var x = replaceAll(diagnostics, '[', '<div class="log-indent"><i>&nbsp;</i>');
  x = replaceAll(x, '],', '</div>');
  x = replaceAll(x, ']', '</div>');
  x = replaceAll(x, '\n', '<br />');
  x = replaceAll(x, '\t', '<span class="log-indent" /></span>');
  return new Handlebars.SafeString(x);
});

/**
 * Returns first-item class if called from inside a loop/each.
 * @param view Will be _view in hbs
 */
Em.Handlebars.helper('firstItemCSS', function(view) {
  return view && view.contentIndex == 0 ? 'first-item' : '';
});


})();

(function() {

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

zip.workerScriptsPath = "scripts/zip.js/";

App.Helpers.io = {
  /* Allow queuing of downloads and then get a callback once all the downloads are done.
   * sample usage.
   * var downloader = App.Helpers.io.fileDownloader();
   * downloader.queueItem({
   *   url: 'http://....',
   *   onItemFetched: function(data, context) {...},
   *   context: {}, // context object gets passed back to the callback
   * });
   * downloader.queueItem({...}); //queue in other items
   * downloader.finish(); // once all items are queued. items can be queued from
   *                      // callbacks too. in that case the finish should be called
   *                      // once all items are queued.
   * downloader.then(successCallback).catch(failurecallback).finally(callback)
   */
  fileDownloader: function(options) {
    var itemList = [],
        opts = options || {},
        numParallel = opts.numParallel || 5,
        hasMoreInputs = true,
        inProgress = 0,
        hasFailed = false,
        pendingRequests = {},
        pendingRequestID = 0,
        failureReason = 'Unknown',
        deferredPromise = Em.RSVP.defer();

    function checkForCompletion() {
      if (hasFailed) {
        if (inProgress == 0) {
          deferredPromise.reject("Unknown Error");
        }
        return;
      }

      if (hasMoreInputs || itemList.length > 0 || inProgress > 0) {
        return;
      }

      deferredPromise.resolve();
    }

    function getRequestId() {
      return "req_" + pendingRequestID++;
    }

    function abortPendingRequests() {
      $.each(pendingRequests, function(idx, val) {
        try {
          val.abort("abort");
        } catch(e) {}
      });
    }

    function markFailed(reason) {
      if (!hasFailed) {
        hasFailed = true;
        failureReason = reason;
        abortPendingRequests();
      }
    }

    function processNext() {
      if (inProgress >= numParallel) {
        Em.Logger.debug("delaying download as %@ of %@ is in progress".fmt(inProgress, numParallel));
        return;
      }

      if (itemList.length < 1) {
        Em.Logger.debug("no items to download");
        checkForCompletion();
        return;
      }

      inProgress++;
      Em.Logger.debug("starting download %@".fmt(inProgress));
      var item = itemList.shift();

      var xhr = $.ajax({
        crossOrigin: true,
        url: item.url,
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        },
      });
      var reqID = getRequestId();
      pendingRequests[reqID] = xhr;

      xhr.done(function(data, statusText, xhr) {
        delete pendingRequests[reqID];

        if ($.isFunction(item.onItemFetched)) {
          try {
            item.onItemFetched(data, item.context);
          } catch (e) {
            markFailed(e || 'failed to process data');
            inProgress--;
            checkForCompletion();
            return;
          }
        }

        inProgress--;
        processNext();
      }).fail(function(xhr, statusText, errorObject) {
        delete pendingRequests[reqID];
        markFailed(statusText);
        inProgress--;
        checkForCompletion();
      });
    }

    return DS.PromiseObject.create({
      promise: deferredPromise.promise,

      queueItems: function(options) {
        options.forEach(this.queueItem);
      },

      queueItem: function(option) {
        itemList.push(option);
        processNext();
      },

      finish: function() {
        hasMoreInputs = false;
        checkForCompletion();
      },

      cancel: function() {
        markFailed("User cancelled");
        checkForCompletion();
      }
    });
  },


  /*
   * allows to zip files and download that.
   * usage: 
   * zipHelper = App.Helpers.io.zipHelper({
   *   onProgress: function(filename, current, total) { ...},
   *   onAdd: function(filename) {...}
   * });
   * zipHelper.addFile({name: filenameinsidezip, data: data);
   * // add all files
   * once all files are added call the close
   * zipHelper.close(); // or .abort to abort zip
   * zipHelper.then(function(zippedBlob) {
   *   saveAs(filename, zippedBlob);
   * }).catch(failureCallback);
   */
  zipHelper: function(options) {
    var opts = options || {},
        zipFileEntry,
        zipWriter,
        completion = Em.RSVP.defer(),
        fileList = [],
        completed = 0,
        currentIdx = -1,
        numFiles = 0,
        hasMoreInputs = true,
        inProgress = false,
        hasFailed = false;

    zip.createWriter(new zip.BlobWriter("application/zip"), function(writer) {
      zipWriter = writer;
      checkForCompletion();
      nextFile();
    });

    function checkForCompletion() {
      if (hasFailed) {
        if (zipWriter) {
          Em.Logger.debug("aborting zipping. closing file.");
          zipWriter.close(completion.reject);
          zipWriter = null;
        }
      } else {
        if (!hasMoreInputs && numFiles == completed) {
          Em.Logger.debug("completed zipping. closing file.");
          zipWriter.close(completion.resolve);
        }
      }
    }

    function onProgress(current, total) {
      if ($.isFunction(opts.onProgress)) {
        opts.onProgress(fileList[currentIdx].name, current, total);
      }
    }

    function onAdd(filename) {
      if ($.isFunction(opts.onAdd)) {
        opts.onAdd(filename);
      }
    }

    function nextFile() {
      if (hasFailed || completed == numFiles || inProgress) {
        return;
      }

      currentIdx++;
      var file = fileList[currentIdx];
      inProgress = true;
      onAdd(file.name);
      zipWriter.add(file.name, new zip.TextReader(file.data), function() {
        completed++;
        inProgress = false;
        if (currentIdx < numFiles - 1) {
          nextFile();
        }
        checkForCompletion();
      }, onProgress);
    }

    return DS.PromiseObject.create({
      addFiles: function(files) {
        files.forEach(this.addFile);
      },

      addFile: function(file) {
        if (hasFailed) {
          Em.Logger.debug("Skipping add of file %@ as zip has been aborted".fmt(file.name));
          return;
        }
        numFiles++;
        fileList.push(file);
        if (zipWriter) {
          Em.Logger.debug("addinng file from addFile: " + file.name);
          nextFile();
        }
      },

      close: function() {
        hasMoreInputs = false;
        checkForCompletion();
      },

      promise: completion.promise,

      abort: function() {
        hasFailed = true;
        this.close();
      }
    });
  }
};


})();

(function() {

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

App.Helpers.misc = {
  getStatusClassForEntity: function(status, hasFailedTasks) {
    if(!status) return '';

    switch(status) {
      case 'FAILED':
        return 'failed';
      case 'KILLED':
        return 'killed';
      case 'RUNNING':
        return 'running';
      case 'ERROR':
        return 'error';
      case 'SUCCEEDED':
        if (!!hasFailedTasks) {
          return 'warning';
        }
        /*
        TODO: TEZ-2113
        var counterGroups = dag.get('counterGroups');
        var numFailedTasks = this.getCounterValueForDag(counterGroups,
          dag.get('id'), 'org.apache.tez.common.counters.DAGCounter',
          'NUM_FAILED_TASKS'
        ); 

        if (numFailedTasks > 0) {
          return 'warning';
        }*/

        return 'success';
      case 'UNDEFINED':
        return 'unknown';
      case 'SCHEDULED':
        return 'schedule';
      default:
        return 'submitted';
    }
  },

  getRealStatus: function(entityState, yarnAppState, yarnAppFinalState) {
    if (entityState != 'RUNNING' || (yarnAppState != 'FINISHED' && yarnAppState != 'KILLED' && yarnAppState != 'FAILED')) {
      return entityState;
    }

    if (yarnAppState == 'KILLED' || yarnAppState == 'FAILED') {
      return yarnAppState;
    }

    return yarnAppFinalState;
  },

	getCounterValueForDag: function(counterGroups, dagID, counterGroupName, counterName) {
		if (!counterGroups) {
			return 0;
		}

		var cgName = dagID + '/' + counterGroupName;
		var cg = 	counterGroups.findBy('id', cgName);
		if (!cg) {
			return 0;
		}
		var counters = cg.get('counters');
		if (!counters) {
			return 0;
		}
		
		var counter = counters.findBy('id', cgName + '/' + counterName);
		if (!counter) return 0;

		return counter.get('value');
	},

  isValidDagStatus: function(status) {
    return $.inArray(status, ['SUBMITTED', 'INITING', 'RUNNING', 'SUCCEEDED',
      'KILLED', 'FAILED', 'ERROR']) != -1;
  },

  isFinalDagStatus: function(status) {
    return $.inArray(status, ['SUCCEEDED', 'KILLED', 'FAILED', 'ERROR']) != -1;
  },

  isValidTaskStatus: function(status) {
    return $.inArray(status, ['RUNNING', 'SUCCEEDED', 'FAILED', 'KILLED']) != -1;
  },

  isStatusInUnsuccessful: function(status) {
    return $.inArray(status, ['FAILED', 'KILLED', 'UNDEFINED']) != -1;
  },

  /**
   * To trim a complete class path with namespace to the class name.
   */
  getClassName: function (classPath) {
    return classPath.substr(classPath.lastIndexOf('.') + 1);
  },

  /**
   * Return a normalized group name for a counter name
   * @param groupName {String}
   * @return Normlaized name
   */
  getCounterGroupDisplayName: function (groupName) {
    var displayName = App.Helpers.misc.getClassName(groupName), // Remove path
        ioParts,
        toText;

    function removeCounterFromEnd(text) {
      if(text.substr(-7) == 'Counter') {
        text = text.substr(0, text.length - 7);
      }
      return text;
    }

    displayName = removeCounterFromEnd(displayName);

    // Reformat per-io counters
    switch(App.Helpers.misc.checkIOCounterGroup(displayName)) {
      case 'in':
        ioParts = displayName.split('_INPUT_');
        toText = 'to %@ Input'.fmt(ioParts[1]);
      break;
      case 'out':
        ioParts = displayName.split('_OUTPUT_');
        toText = 'to %@ Output'.fmt(ioParts[1]);
      break;
    }
    if(ioParts) {
      ioParts = ioParts[0].split('_');
      if(ioParts.length > 1) {
        displayName = '%@ - %@ %@'.fmt(
          removeCounterFromEnd(ioParts.shift()),
          ioParts.join('_'),
          toText
        );
      }
    }

    return displayName;
  },

  /*
   * Normalizes counter style configurations
   * @param counterConfigs Array
   * @return Normalized configurations
   */
  normalizeCounterConfigs: function (counterConfigs, controller) {
    return counterConfigs.map(function (configuration) {
      var groupName = configuration.counterGroupName || configuration.groupId,
          counterName = configuration.counterName || configuration.counterId;

      configuration.headerCellName = '%@ - %@'.fmt(
        App.Helpers.misc.getCounterGroupDisplayName(groupName),
        counterName
      );
      configuration.id = '%@/%@'.fmt(groupName, counterName),

      configuration.observePath = true;
      configuration.contentPath = 'counterGroups';
      configuration.counterGroupName = groupName;
      configuration.counterName = counterName;

      if(controller) {
        configuration.onSort = controller.onInProgressColumnSort.bind(controller);
      }

      configuration.getSortValue = App.Helpers.misc.getCounterCellContent;
      configuration.getCellContent =
          configuration.getSearchValue = App.Helpers.misc.getCounterCellContentFormatted;
      return configuration;
    });
  },

  getCounterQueryParam: function (columns) {
    var counterHash = {},
        counters = [];

    columns.forEach(function (column) {
      var groupName = column.get('counterGroupName'),
          counterName = column.get('counterName');
      if(column.get('contentPath') == 'counterGroups') {
        counterHash[groupName] = counterHash[groupName] || [];
        counterHash[groupName].push(counterName);
      }
    });
    for(var groupName in counterHash) {
      counters.push('%@/%@'.fmt(groupName, counterHash[groupName].join(',')));
    }

    return counters.join(';');
  },

  /*
   * Merges counter information from AM counter object into ATS counters array
   */
  mergeCounterInfo: function (targetATSCounters, sourceAMCounters) {
    var atsCounters, atsCounter,
        counters;

    targetATSCounters = targetATSCounters || [];

    try{
      for(var counterGroupName in sourceAMCounters) {
        counters = sourceAMCounters[counterGroupName],
        atsCounters = targetATSCounters.findBy('counterGroupName', counterGroupName);
        if(!atsCounters) {
          atsCounters = [];
          targetATSCounters.pushObject({
            counterGroupName: counterGroupName,
            counterGroupDisplayName: counterGroupName,
            counters: atsCounters
          });
        }
        else {
          atsCounters = atsCounters.counters;
        }
        for(var counterName in counters) {
          atsCounter = atsCounters.findBy('counterName', counterName);
          if(atsCounter) {
            Em.set(atsCounter, 'counterValue', counters[counterName]);
          }
          else {
            atsCounters.pushObject({
              "counterName": counterName,
              "counterDisplayName": counterName,
              "counterValue": counters[counterName]
            });
          }
        }
      }
    }
    catch(e){
      Em.Logger.info("Counter merge failed", e);
    }

    return targetATSCounters;
  },

  /*
   * Creates column definitions form configuration object array
   * @param columnConfigs Array
   * @return columnDefinitions Array
   */
  createColumnsFromConfigs: function (columnConfigs) {
    return columnConfigs.map(function (columnConfig) {
      if(columnConfig.getCellContentHelper) {
        columnConfig.getCellContent = App.Helpers.get(columnConfig.getCellContentHelper);
      }
      columnConfig.minWidth = columnConfig.minWidth || 135;

      return columnConfig.filterID ?
          App.ExTable.ColumnDefinition.createWithMixins(App.ExTable.FilterColumnMixin, columnConfig) :
          App.ExTable.ColumnDefinition.create(columnConfig);
    });
  },

  createColumnDescription: function (columnConfigs) {
    return columnConfigs.map(function (column) {
      return App.BasicTableComponent.ColumnDefinition.create(column);
    });
  },

  /*
   * Returns a counter value from for a row
   * @param row
   * @return value
   */
  getCounterCellContent: function (row) {
    var contentPath = this.id.split('/'),
        value = null;

    try{
      value = row.get('counterGroups').
          findBy('counterGroupName', contentPath[0])
          ['counters'].
          findBy('counterName', contentPath[1])
          ['counterValue'];
    }catch(e){}

    return value;
  },

  /*
   * Returns a counter value from for a row
   * @param row
   * @return value
   */
  getCounterCellContentFormatted: function (row) {
    var value = App.Helpers.misc.getCounterCellContent.call(this, row);
    return App.Helpers.number.formatNumThousands(value);
  },

  /* 
   * returns a formatted message, the real cause is unknown and the error object details
   * depends on the error cause. the function tries to handle ajax error or a native errors
   */
  formatError: function(error, defaultErrorMessage) {
    var msg;
    // for cross domain requests, the error is not set if no access control headers were found.
    // this could be either because there was a n/w error or the cors headers being not set.
    if (error.status === 0 && error.statusText === 'error') {
      msg = defaultErrorMessage || error.message;
    } else {
      msg = error.statusText || error.message;
    }
    msg = msg || 'Unknown error';
    if (!!error.responseText) {
      msg += error.responseText;
    }

    if(error.requestOptions) {
      msg = '%@<br/>Could not retrieve expected data from %@ @ %@'.fmt(
        msg,
        error.requestOptions.targetServer,
        error.requestOptions.url
      )
    }

    return {
      errCode: error.status || 'Unknown', 
      msg: msg,
      details: error.stack
    };
  },

  /**
   * Normalize path
   * @param path {String}
   * @return normalized path {String}
   */
  normalizePath: function (path) {
    if(path && path.charAt(path.length - 1) == '/') {
      path = path.slice(0, -1);
    }
    return path;
  },

  // Tez originally shows the status for task and task attempt only on
  // completion. this causes confusion to the user as the status would not be
  // displayed. so if status is not set return the status as 'RUNNING'. We do
  // not diffentiate between running and scheduled.
  getFixedupDisplayStatus: function(originalStatus) {
    // if status is not set show it as running, since originally the task did
    // not have a status set on scheduled/running.
    // with the new version we set the status of task as scheduled and that of
    // task attempt as running
    if (!originalStatus || originalStatus == 'SCHEDULED') {
      originalStatus = 'RUNNING';
    }
    return originalStatus;
  },

  /**
   * Merge content of obj2 into obj2, array elements will be concated.
   * @param obj1 {Object}
   * @param obj2 {Object}
   */
  merge: function objectMerge(obj1, obj2) {
    $.each(obj2, function (key, val) {
      if(Array.isArray(obj1[key]) && Array.isArray(val)) {
        $.merge(obj1[key], val);
      }
      else if($.isPlainObject(obj1[key]) && $.isPlainObject(val)) {
        objectMerge(obj1[key], val);
      }
      else {
        obj1[key] = val;
      }
    });
  },

  getTaskIndex: function(dagID, taskID) {
    var idPrefix = 'task_%@_'.fmt(dagID.substr(4));
    return taskID.indexOf(idPrefix) == 0 ? taskID.substr(idPrefix.length) : id;
  },

  getVertexIdFromName: function(idToNameMap, vertexName) {
    idToNameMap = idToNameMap || {};
    var vertexId = undefined;
    $.each(idToNameMap, function(id, name) {
      if (name === vertexName) {
        vertexId = id;
        return false;
      }
    });
    return vertexId;
  },

  /* Gets the application id from dagid
   * @param dagId {String}
   * @return application id for the dagid {String}
   */
  getAppIdFromDagId: function(dagId) {
    var dagIdRegex = /^dag_(\d+)_(\d+)_\d+$/,
        appId = undefined;
    if (dagIdRegex.test(dagId)) {
      appId = dagId.replace(dagIdRegex, 'application_$1_$2');
    }
    return appId;
  },

  /* Gets the application id from vertex id
   * @param vertexId {String}
   * @return application id for the vertexId {String}
   */
  getAppIdFromVertexId: function(vertexId) {
    var vertexIdRegex = /^vertex_(\d+)_(\d+)_\d+_\d+$/
        appId = undefined;
    if (vertexIdRegex.test(vertexId)) {
      appId = vertexId.replace(vertexIdRegex, 'application_$1_$2');
    }
    return appId;
  },  

  /* Gets the dag index from the dag id
   * @param dagId {String}
   * @return dag index for the given dagId {String}
   */
  getDagIndexFromDagId: function(dagId) {
    return dagId.split('_').splice(-1).pop();
  },

  /*
   * Return index for the given id
   * @param id {string}
   * @return index {Number}
   */
  getIndexFromId: function (id) {
    return parseInt(id.split('_').splice(-1).pop());
  },

  /**
   * Remove the specific record from store
   * @param store {DS.Store}
   * @param type {String}
   * @param id {String}
   */
  //TODO: TEZ-2876 Extend store to have a loadRecord function that skips the cache
  removeRecord: function (store, type, id) {
    var record = store.getById(type, id);
    if(record) {
      store.unloadRecord(record);
    }
  },

  downloadDAG: function(dagID, options) {
    var opts = options || {},
        batchSize = opts.batchSize || 1000,
        baseurl = '%@/%@'.fmt(App.env.timelineBaseUrl, App.Configs.restNamespace.timeline),
        itemsToDownload = [
          {
            url: getUrl('TEZ_APPLICATION', 'tez_' + this.getAppIdFromDagId(dagID)),
            context: { name: 'application', type: 'TEZ_APPLICATION' },
            onItemFetched: processSingleItem
          },
          {
            url: getUrl('TEZ_DAG_ID', dagID),
            context: { name: 'dag', type: 'TEZ_DAG_ID' },
            onItemFetched: processSingleItem
          },
          {
            url: getUrl('TEZ_VERTEX_ID', dagID),
            context: { name: 'vertices', type: 'TEZ_VERTEX_ID', part: 0 },
            onItemFetched: processMultipleItems
          },
          {
            url: getUrl('TEZ_TASK_ID', dagID),
            context: { name: 'tasks', type: 'TEZ_TASK_ID', part: 0 },
            onItemFetched: processMultipleItems
          },
          {
            url: getUrl('TEZ_TASK_ATTEMPT_ID', dagID),
            context: { name: 'task_attempts', type: 'TEZ_TASK_ATTEMPT_ID', part: 0 },
            onItemFetched: processMultipleItems
          }
        ],
        numItemTypesToDownload = itemsToDownload.length,
        downloader = App.Helpers.io.fileDownloader(),
        zipHelper = App.Helpers.io.zipHelper({
          onProgress: function(filename, current, total) {
            Em.Logger.debug('%@: %@ of %@'.fmt(filename, current, total));
          },
          onAdd: function(filename) {
            Em.Logger.debug('adding %@ to Zip'.fmt(filename));
          }
        });

    function getUrl(type, dagID, fromID) {
      var url;
      if (type == 'TEZ_DAG_ID' || type == 'TEZ_APPLICATION') {
        url = '%@/%@/%@'.fmt(baseurl, type, dagID);
      } else {
        url = '%@/%@?primaryFilter=TEZ_DAG_ID:%@&limit=%@'.fmt(baseurl, type, dagID, batchSize + 1);
        if (!!fromID) {
          url = '%@&fromId=%@'.fmt(url, fromID);
        }
      }
      return url;
    }

    function checkIfAllDownloaded() {
      numItemTypesToDownload--;
      if (numItemTypesToDownload == 0) {
        downloader.finish();
      }
    }

    function processSingleItem(data, context) {
      var obj = {};
      obj[context.name] = data;

      zipHelper.addFile({name: '%@.json'.fmt(context.name), data: JSON.stringify(obj, null, 2)});
      checkIfAllDownloaded();
    }

    function processMultipleItems(data, context) {
      var obj = {};
      var nextBatchStart = undefined;

      if (!$.isArray(data.entities)) {
        throw "invalid data";
      }

      // need to handle no more entries , zero entries
      if (data.entities.length > batchSize) {
        nextBatchStart = data.entities.pop().entity;
      }
      obj[context.name] = data.entities;

      zipHelper.addFile({name: '%@_part_%@.json'.fmt(context.name, context.part), data: JSON.stringify(obj, null, 2)});

      if (!!nextBatchStart) {
        context.part++;
        downloader.queueItem({
          url: getUrl(context.type, dagID, nextBatchStart),
          context: context,
          onItemFetched: processMultipleItems
        });
      } else {
        checkIfAllDownloaded();
      }
    }

    downloader.queueItems(itemsToDownload);

    downloader.then(function() {
      Em.Logger.info('Finished download');
      zipHelper.close();
    }).catch(function(e) {
      Em.Logger.error('Failed to download: ' + e);
      zipHelper.abort();
    });

    var that = this;
    zipHelper.then(function(zippedBlob) {
      saveAs(zippedBlob, '%@.zip'.fmt(dagID));
      if ($.isFunction(opts.onSuccess)) {
        opts.onSuccess();
      }
    }).catch(function() {
      Em.Logger.error('zip Failed');
      if ($.isFunction(opts.onFailure)) {
        opts.onFailure();
      }
    });

    return {
      cancel: function() {
        downloader.cancel();
      }
    }
  },

  /**
   * Returns in/out/empty string based counter group type
   * @param counterGroupName {String}
   * @return in/out/empty string
   */
  checkIOCounterGroup: function (counterGroupName) {
    if(counterGroupName == undefined){
      debugger;
    }
    var relationPart = counterGroupName.substr(counterGroupName.indexOf('_') + 1);
    if(relationPart.match('_INPUT_')) {
      return 'in';
    }
    else if(relationPart.match('_OUTPUT_')) {
      return 'out';
    }
    return '';
  },

  /**
   * Return unique values form array based on a property
   * @param array {Array}
   * @param property {String}
   * @return uniqueArray {Array}
   */
  getUniqueByProperty: function (array, property) {
    var propHash = {},
        uniqueArray = [];

    array.forEach(function (item) {
      if(item && !propHash[item[property]]) {
        uniqueArray.push(item);
        propHash[item[property]] = true;
      }
    });

    return uniqueArray;
  },

  /*
   * Extends the path and adds new query params into an url
   * @param url {String} Url to modify
   * @param path {String} Path to be added
   * @param queryParams {Object} Params to be added
   * @return modified path
   */
  modifyUrl: function (url, path, queryParams) {
    var urlParts = url.split('?'),
        params = {};

    if(queryParams) {
      if(urlParts[1]) {
        params = urlParts[1].split('&').reduce(function (obj, param) {
          var paramParts;
          if(param.trim()) {
            paramParts = param.split('=');
            obj[paramParts[0]] = paramParts[1];
          }
          return obj;
        }, {});
      }

      params = $.extend(params, queryParams);

      queryParams = [];
      $.map(params, function (val, key) {
        queryParams.push(key + "=" + val);
      });

      urlParts[1] = queryParams.join('&');
    }

    urlParts[0] += path || '';

    return urlParts[1] ? '%@?%@'.fmt(urlParts[0], urlParts[1]) : urlParts[0];
  },

  constructLogLinks: function (attempt, yarnAppState, amUser) {
    var path,
        link,
        logLinks = {},
        params = amUser ? {
          "user.name": amUser
        } : {};

    if(attempt) {
      link = attempt.get('inProgressLog') || attempt.get('completedLog');
      if(link) {
        if(!link.match("/syslog_")) {
          path = "/syslog_" + attempt.get('id');
          if(amUser) {
            path += "/" + amUser;
          }
        }
        logLinks.viewUrl = App.Helpers.misc.modifyUrl(link, path, params);
      }

      link = attempt.get('completedLog');
      if (link && yarnAppState === 'FINISHED' || yarnAppState === 'KILLED' || yarnAppState === 'FAILED') {
        params["start"] = "0";

        if(!link.match("/syslog_")) {
          path = "/syslog_" + attempt.get('id');
          if(amUser) {
            path += "/" + amUser;
          }
        }

        logLinks.downloadUrl = App.Helpers.misc.modifyUrl(link, path, params);
      }
    }

    return logLinks;
  },

  timelinePathForType: (function () {
    var typeToPathMap = {
      dag: 'TEZ_DAG_ID',

      vertex: 'TEZ_VERTEX_ID',
      dagVertex: 'TEZ_VERTEX_ID',

      task: 'TEZ_TASK_ID',
      dagTask: 'TEZ_TASK_ID',
      vertexTask: 'TEZ_TASK_ID',

      taskAttempt: 'TEZ_TASK_ATTEMPT_ID',
      dagTaskAttempt: 'TEZ_TASK_ATTEMPT_ID',
      vertexTaskAttempt: 'TEZ_TASK_ATTEMPT_ID',
      taskTaskAttempt: 'TEZ_TASK_ATTEMPT_ID',

      hiveQuery: 'HIVE_QUERY_ID',

      tezApp: 'TEZ_APPLICATION'
    };
    return function (type) {
      return typeToPathMap[type];
    };
  })(),

  getTimelineFilterForType: (function () {
    var typeToPathMap = {
      dag: 'TEZ_DAG_ID',

      vertex: 'TEZ_VERTEX_ID',
      dagVertex: 'TEZ_VERTEX_ID',

      task: 'TEZ_TASK_ID',
      dagTask: 'TEZ_TASK_ID',
      vertexTask: 'TEZ_TASK_ID',

      taskAttempt: 'TEZ_TASK_ATTEMPT_ID',
      dagTaskAttempt: 'TEZ_TASK_ATTEMPT_ID',
      vertexTaskAttempt: 'TEZ_TASK_ATTEMPT_ID',
      taskTaskAttempt: 'TEZ_TASK_ATTEMPT_ID',

      hiveQuery: 'HIVE_QUERY_ID',

      tezApp: 'applicationId'
    };
    return function (type) {
      return typeToPathMap[type];
    };
  })(),

  dagStatusUIOptions: [
    { label: 'All', id: null },
    { label: 'Submitted', id: 'SUBMITTED' },
    { label: 'Running', id: 'RUNNING' },
    { label: 'Succeeded', id: 'SUCCEEDED' },
    { label: 'Failed', id: 'FAILED' },
    { label: 'Error', id: 'ERROR' },
  ],

  vertexStatusUIOptions: [
    { label: 'All', id: null },
    { label: 'Running', id: 'RUNNING' },
    { label: 'Succeeded', id: 'SUCCEEDED' },
    { label: 'Failed', id: 'FAILED' },
    { label: 'Killed', id: 'KILLED' },
    { label: 'Error', id: 'ERROR' },
  ],

  taskStatusUIOptions: [
    { label: 'All', id: null },
    { label: 'Running', id: 'SCHEDULED' },
    { label: 'Succeeded', id: 'SUCCEEDED' },
    { label: 'Failed', id: 'FAILED' },
    { label: 'Killed', id: 'KILLED' },
  ],

  taskAttemptStatusUIOptions: [
    { label: 'All', id: null },
    { label: 'Running', id: 'RUNNING' },
    { label: 'Succeeded', id: 'SUCCEEDED' },
    { label: 'Failed', id: 'FAILED' },
    { label: 'Killed', id: 'KILLED' },
  ],

  defaultQueryParamsConfig: {
    refreshModel: true,
    replace: true
  },

  /**
   * Load app details form RM if available, else load from ATS if AHS is enabled
   * @param store {Store}
   * @param appId {String}
   * @param useCache {Boolean}
   */
  loadApp: function (store, appId, useCache) {
    if(!useCache) {
      App.Helpers.misc.removeRecord(store, 'appDetail', appId);
      App.Helpers.misc.removeRecord(store, 'clusterApp', appId);
    }

    return store.find('clusterApp', appId).catch(function () {
      return store.find('appDetail', appId);
    }).catch(function (error) {
      error.message = "Couldn't get details of application %@. RM is not reachable, and history service is not enabled.".fmt(appId);
      throw error;
    });
  }

}


})();

(function() {

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

App.Helpers.number = {

  MAX_SAFE_INTEGER: 9007199254740991,

  /**
   * Convert byte size to other metrics.
   * 
   * @param {Number} bytes to convert to string
   * @param {Number} precision Number to adjust precision of return value. Default is 0.
   * @param {String} parseType
   *           JS method name for parse string to number. Default is "parseInt".
   * @param {Number} multiplyBy bytes by this number if given. This is needed
   *          as <code>null * 1024 = 0</null>
   * @remarks The parseType argument can be "parseInt" or "parseFloat".
   * @return {String} Returns converted value with abbreviation.
   */
  bytesToSize: function (bytes, precision, parseType, multiplyBy) {
    if (isNaN(bytes)) bytes = 0;
    if (Em.isNone(bytes)) {
      return 'n/a';
    } else {
      if (arguments[2] === undefined) {
        parseType = 'parseInt';
      }
      if (arguments[3] === undefined) {
        multiplyBy = 1;
      }
      var value = bytes * multiplyBy;
      var sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB' ];
      var posttxt = 0;
      while (value >= 1024) {
        posttxt++;
        value = value / 1024;
      }
      if (value === 0) {
        precision = 0;
      }
      var parsedValue = window[parseType](value);
      return parsedValue.toFixed(precision) + " " + sizes[posttxt];
    }
  },

  /**
   * Validates if the given string or number is an integer between the
   * values of min and max (inclusive). The minimum and maximum
   * checks are ignored if their valid is NaN.
   *
   * @method validateInteger
   * @param {string|number} str - input string
   * @param {string|number} [min]
   * @param {string|number} [max]
   */
  validateInteger : function(str, min, max) {
    if (Em.isNone(str) || (str + "").trim().length < 1) {
      return Em.I18n.t('number.validate.empty');
    }
    str = (str + "").trim();
    var number = parseInt(str);
    if (isNaN(number)) {
      return Em.I18n.t('number.validate.notValidNumber');
    }
    if (str.length != (number + "").length) {
      // parseInt("1abc") returns 1 as integer
      return Em.I18n.t('number.validate.notValidNumber');
    }
    if (!isNaN(min) && number < min) {
      return Em.I18n.t('number.validate.lessThanMinumum').fmt(min);
    }
    if (!isNaN(max) && number > max) {
      return Em.I18n.t('number.validate.moreThanMaximum').fmt(max);
    }
    return null;
  },

  /**
   * Format value with US style thousands separator
   * @param {string/number} value to be formatted
   * @returns {string} Formatted string
   */
  formatNumThousands: function (value) {
    if(/^[\d\.]+$/.test(value)) {
      var parts = value.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }
    return value;
  },

  /**
   * Checks if the value is an integer or can be converted to an integer.
   * a value of NaN returns false.
   * @method: isValidInt
   * @param {string|number} value to check
   * @return {boolean} 
   */
  isValidInt: function(value) {
    return value % 1 == 0;
  },

  /**
   * converts fraction to percentage.
   * @param {number} fraction assumes < 1
   * @return {float} fixed decimal point formatted percentage
   */
  fractionToPercentage: function(number, decimal) {
    decimal = decimal || 2;
    return parseFloat((number * 100).toFixed(decimal)) + ' %';
  }

};

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
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

  'any': 'Any',
  'apply': 'Apply',
  'ok': 'Ok',
  'cancel': 'Cancel',

  'common.id': 'Entity Id',
  'common.applicationId': 'Application Id',
  'common.status':'Status',
  'common.time.start': 'Start Time',
  'common.time.end': 'End Time',
  'common.name': 'Name',
  'common.tasks':'Tasks',
  'common.na': 'n/a',
  'common.value': 'Value',
  'common.user': 'User',
  'common.time.duration': 'Duration',

  'number.validate.empty': 'cannot be empty',
  'number.validate.notValidNumber': 'not a valid number',
  'number.validate.lessThanMinumum': 'value less than %@1',
  'number.validate.moreThanMaximum': 'value greater than %@1',

  'common.loading': 'Loading...',
  'http.error.400': 'Unable to load data.',
  'dags.nothingToShow': 'No Dags to display',

  'jobs.type':'Jobs Type',
  'jobs.type.hive':'Hive',
  'jobs.show.up.to':'Show up to',
  'jobs.filtered.jobs':'%@ jobs showing',
  'jobs.filtered.clear':'clear filters',
  'jobs.column.id':'Id',
  'jobs.column.user':'User',
  'jobs.column.start.time':'Start Time',
  'jobs.column.end.time':'End Time',
  'jobs.column.duration':'Duration',
  'jobs.new_jobs.info':'New jobs available on server.',
  'jobs.loadingTasks': 'Loading...',

  'jobs.nothingToShow': 'No jobs to display',
  'jobs.error.ats.down': 'Jobs data cannot be shown since YARN App Timeline Server is not running.',
  'jobs.error.400': 'Unable to load data.',
  'jobs.table.custom.date.am':'AM',
  'jobs.table.custom.date.pm':'PM',
  'jobs.table.custom.date.header':'Select Custom Dates',
  'jobs.table.job.fail':'Job failed to run',
  'jobs.customDateFilter.error.required':'This field is required',
  'jobs.customDateFilter.error.date.order':'End Date must be after Start Date',
  'jobs.customDateFilter.startTime':'Start Time',
  'jobs.customDateFilter.endTime':'End Time',
  'jobs.hive.failed':'JOB FAILED',
  'jobs.hive.more':'show more',
  'jobs.hive.less':'show less',
  'jobs.hive.query':'Hive Query',
  'jobs.hive.stages':'Stages',
  'jobs.hive.yarnApplication':'YARN&nbsp;Application',
  'jobs.hive.tez.tasks':'Tez Tasks',
  'jobs.hive.tez.hdfs':'HDFS',
  'jobs.hive.tez.localFiles':'Local Files',
  'jobs.hive.tez.spilledRecords':'Spilled Records',
  'jobs.hive.tez.records':'Records',
  'jobs.hive.tez.reads':'%@1 reads',
  'jobs.hive.tez.writes':'%@1 writes',
  'jobs.hive.tez.records.count':'%@1 Records',
  'jobs.hive.tez.operatorPlan':'Operator Plan',
  'jobs.hive.tez.dag.summary.metric':'Summary Metric',
  'jobs.hive.tez.dag.error.noDag.title':'No Tez Information',
  'jobs.hive.tez.dag.error.noDag.message':'This job does not identify any Tez information.',
  'jobs.hive.tez.dag.error.noDagId.title':'No Tez Information',
  'jobs.hive.tez.dag.error.noDagId.message':'No Tez information was found for this job. Either it is waiting to be run, or has exited unexpectedly.',
  'jobs.hive.tez.dag.error.noDagForId.title':'No Tez Information',
  'jobs.hive.tez.dag.error.noDagForId.message':'No details were found for the Tez ID given to this job.',
  'jobs.hive.tez.metric.input':'Input',
  'jobs.hive.tez.metric.output':'Output',
  'jobs.hive.tez.metric.recordsRead':'Records Read',
  'jobs.hive.tez.metric.recordsWrite':'Records Written',
  'jobs.hive.tez.metric.tezTasks':'Tez Tasks',
  'jobs.hive.tez.metric.spilledRecords':'Spilled Records',
  'jobs.hive.tez.edge.':'Unknown',
  'jobs.hive.tez.edge.contains':'Contains',
  'jobs.hive.tez.edge.broadcast':'Broadcast',
  'jobs.hive.tez.edge.scatter_gather':'Shuffle',

  'app.loadingPlaceholder': 'Loading...',
  'apps.item.dag.job': 'Job',
  'apps.item.dag.jobId': 'Job Id',
  'apps.item.dag.type': 'Job Type',
  'apps.item.dag.status': 'Status',
  'apps.item.dag.num_stages': 'Total Stages',
  'apps.item.dag.stages': 'Tasks per Stage',
  'apps.item.dag.maps': 'Maps',
  'apps.item.dag.reduces': 'Reduces',
  'apps.item.dag.input': 'Input',
  'apps.item.dag.output': 'Output',
  'apps.item.dag.duration': 'Duration',

  'menu.item.jobs':'Jobs'

};


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.AutoCounterColumnMixin = Em.Mixin.create({

  baseEntityType: null, // Must be set in the controller that uses this Mixin

  columnSelectorMessage: function () {
    return "<span class='per-io'>Per-IO counter</span> selection wouldn't persist across %@.".fmt(
      this.get('filterEntityType').pluralize()
    );
  }.property('filterEntityType'),

  columnConfigs: function() {
    var counterConfigs = App.Helpers.misc.normalizeCounterConfigs(
      App.get('Configs.defaultCounters').concat(
        App.get('Configs.tables.entity.' + this.get('baseEntityType')) || [],
        App.get('Configs.tables.sharedColumns') || []
      )
    , this), dynamicCounterConfigs = [];

    this.get('data').forEach(function (row) {
      var counterGroups = row.get('counterGroups');
      if(counterGroups) {
        counterGroups.forEach(function (group) {
          group.counters.forEach(function (counter) {
            dynamicCounterConfigs.push({
              counterName: counter.counterName,
              counterGroupName: group.counterGroupName
            });
          });
        });
      }
    });

    return this.get('defaultColumnConfigs').concat(
      App.Helpers.misc.getUniqueByProperty(counterConfigs.concat(
        App.Helpers.misc.normalizeCounterConfigs(dynamicCounterConfigs)
      ), 'id')
    );
  }.property('data', 'defaultColumnConfigs', 'baseEntityType')

});

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function isObjectsDifferent(obj1, obj2) {
  var property;
  for(property in obj1) {
    if(obj1[property] !== obj2[property]) {
      return true;
    }
  }
  for(property in obj2) {
    if(obj1[property] !== obj2[property]) {
      return true;
    }
  }
  return false;
}

App.ColumnSelectorMixin = Em.Mixin.create({

  name: 'PaginatedContentMixin',

  _storeKey: '',
  visibleColumnIds: {},
  columnConfigs: [],
  selectOptions: [],

  columnSelectorTitle: 'Column Selector',
  columnSelectorMessage: '',

  init: function(){
    var visibleColumnIds;

    this._storeKey = this.controllerName + ':visibleColumnIds';
    try {
      visibleColumnIds = JSON.parse(localStorage.getItem(this._storeKey));
    }catch(e){}

    visibleColumnIds = visibleColumnIds || {};

    this.get('defaultColumnConfigs').forEach(function (config) {
      if(visibleColumnIds[config.id] != false) {
        visibleColumnIds[config.id] = true;
      }
    });

    this._super();
    this.set('visibleColumnIds', visibleColumnIds);
  }.observes('defaultColumnConfigs'), //To reset on entity change

  columns: function() {
    var visibleColumnConfigs = this.get('columnConfigs').filter(function (column) {
      return this.visibleColumnIds[column.id];
    }, this);

    return App.Helpers.misc.createColumnDescription(visibleColumnConfigs);
  }.property('visibleColumnIds', 'columnConfigs'),

  _getSelectOptions: function () {
    var group = null,
        highlight = false,
        visibleColumnIds = this.get('visibleColumnIds');

    return this.get('columnConfigs').map(function (config) {
      var css = '';

      highlight = highlight ^ (config.counterGroupName != group),
      group = config.counterGroupName;

      if(highlight) {
        css += ' highlight';
      }
      if(group && App.Helpers.misc.checkIOCounterGroup(group)) {
        css += ' per-io';
      }

      return Em.Object.create({
        id: config.id,
        displayText: config.headerCellName,
        css: css,
        selected: visibleColumnIds[config.id]
      });
    });
  },

  actions: {
    selectColumns: function () {
      this.set('selectOptions', this._getSelectOptions());

      Bootstrap.ModalManager.open(
        'columnSelector',
        this.get('columnSelectorTitle'),
        App.MultiSelectView.extend({
          options: this.get('selectOptions'),
          message: this.get('columnSelectorMessage')
        }),
        [Ember.Object.create({
          title: 'Ok',
          dismiss: 'modal',
          clicked: 'selectionChange'
        }), Ember.Object.create({
          title: 'Cancel',
          dismiss: 'modal',
        })],
        this
      );
    },

    selectionChange: function () {
      var visibleColumnIds = {},
          selectionToSave = {};

      this.get('selectOptions').forEach(function (option) {
        var isSelected = option.get('selected'),
            id = option.get('id'),
            groupName = id.split('/')[0];

        visibleColumnIds[id] = isSelected;
        if(!groupName.match('_INPUT_') && !groupName.match('_OUTPUT_')) {
          selectionToSave[id] = isSelected;
        }
      });

      if(isObjectsDifferent(visibleColumnIds, this.get('visibleColumnIds'))) {
        try {
          localStorage.setItem(this._storeKey , JSON.stringify(selectionToSave));
        }catch(e){}
        this.set('visibleColumnIds', visibleColumnIds);
      }
    }
  }
});

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var dataCache = {};

App.DataArrayLoaderMixin = Em.Mixin.create({
  data: [],
  loading: false,

  entityType: null,
  filterEntityType: null,
  filterEntityId: null,

  // At a time for an entity type, records under one single domain value will only be cached.
  cacheDomain: undefined,

  isRefreshable: true,

  _cacheKey: function () {
    return [
      this.get('filterEntityType'),
      this.get('filterEntityId'),
      this.get('entityType'),
    ].join(':');
  }.property('filterEntityType', 'filterEntityId', 'entityType'),

  getFilter: function (limit) {
    return {
      limit: limit || App.Helpers.number.MAX_SAFE_INTEGER,
      primaryFilter: '%@:%@'.fmt(
        App.Helpers.misc.getTimelineFilterForType(this.get('filterEntityType')),
        this.get('filterEntityId')
      )
    };
  },

  loadData: function (skipCache) {
    var data;

    if(this.get('loading')) {
      return false;
    }

    if(!skipCache) {
      data = dataCache[this.get('_cacheKey')];
    }

    if(data && data.get('content.length')) {
      this.set('data', data);
    }
    else {
      this.loadAllData();
    }

    return true;
  },

  loadAllData: function () {
    this.set('loading', true);

    // Load all rows
    return this.beforeLoad().
      then(this.load.bind(this, this.getFilter())).
      then(this.afterLoad.bind(this)).
      then(this.cacheData.bind(this)).
      then(this.set.bind(this, 'loading', false)).
      catch(this.errorHandler.bind(this));
  },

  beforeLoad: function () {
    return new Em.RSVP.resolve();
  },

  load: function (filter) {
    var entityType = this.get('entityType'),
        store = this.get('store'),
        data = dataCache[this.get('_cacheKey')],
        domainKey = entityType + ":Domain";

    if(this.get('cacheDomain') != dataCache[domainKey]) {
      store.unloadAll(entityType);
      dataCache[domainKey] = this.get('cacheDomain');
    }
    else if(data) {
      data.toArray().forEach(function (record) {
        record.unloadRecord();
      });
      dataCache[this.get('_cacheKey')] = null;
    }

    return store.findQuery(entityType, filter).
      then(this.set.bind(this, 'data')).
      catch(this.errorHandler.bind(this));
  },

  cacheData: function () {
    dataCache[this.get('_cacheKey')] = this.get('data');
  },

  errorHandler: function (error) {
    Em.Logger.error(error);
    var err = App.Helpers.misc.formatError(error, 'Error while loading %@. CORS might not be enabled for YARN ResourceManager and/or Timeline Server.'.fmt(this.get('entityType')));
    var msg = 'Error code: %@, message: %@'.fmt(err.errCode, err.msg);
    App.Helpers.ErrorBar.getInstance().show(msg, err.details);
  },

  afterLoad: function () {
    return new Em.RSVP.resolve();
  },
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// TODO : document
App.Helpers.DisplayHelper = Em.Mixin.create({
	startTimeDisplay: function() {
		var startTime = this.get('startTime');
		return startTime > 0 ? App.Helpers.date.dateFormat(startTime) : '';
	}.property('startTime'),

	endtimeDisplay: function() {
		var endTime = this.get('endTime');
		return endTime > 0 ?  App.Helpers.date.dateFormat(endTime) : '';
	}.property('endTime'),

	duration: function() {
		var startTime = this.get('startTime');
    var endTime = this.get('endTime');
    if(endTime < startTime || endTime == undefined) {
      endTime =  new Date().getTime();
    }
    return App.Helpers.date.duration(startTime, endTime);
	}.property('startTime', 'endTime')
});

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.ModelRefreshMixin = Em.Mixin.create({
  isRefreshable: true,

  load: function () {
    var model = this.get('content');
    if(model && $.isFunction(model.reload)) {
      model.reload();
    }
  },

  actions: {
    refresh: function () {
      App.Helpers.ErrorBar.getInstance().hide();
      this.load();
    }
  }
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.PaginatedContentMixin = Em.Mixin.create({
  // paging related values. These are bound automatically to the values in url. via the queryParams
  // defined in the route.
  rowCount: 10,

  page: 1,
  fromID: null,

  // The dropdown contents for number of items to show.
  rowCountOptions: [5, 10, 25, 50, 100],
  maxRowCount: function () {
    return Math.max.apply(null, this.get('rowCountOptions'));
  }.property('rowCountOptions'),

  isRefreshable: true,

  /* There is currently no efficient way in ATS to get pagination data, so we fake one.
   * store the first dag id on a page so that we can navigate back and store the last one 
   * (not shown on page to get the id where next page starts)
   */
  navIDs: [],

  queryParams: {
    rowCount: true,
  },

  entities: [],
  _paginationFilters: {},
  loading: true,

  load: function() {
    this.resetNavigation();
    this.loadEntities();
  }.observes('rowCount'),

  lastPage: function () {
    return this.get('navIDs.length') + 1;
  }.property('navIDs.length'),

  sortedContent: function() {
    // convert to a ArrayController. we do not sort at this point as the data is
    // not globally sorted, and the total number of elements in array is unknown
    var sorted = Em.ArrayController.create({
      model: this.get('entities')
    });
    this.updatePagination(sorted.toArray());
    return sorted.slice(0, this.rowCount);
  }.property('entities', 'numEntities'),

  updateLoading: function () {
    this.set('loading', false);
  },

  loadEntities: function() {
    var that = this;
    var childEntityType = this.get('childEntityType');
    var defaultErrMsg = 'Error while loading %@.'
      .fmt(childEntityType);


    that.set('loading', true);

    this.get('store').unloadAll(childEntityType);
    this.get('store').findQuery(childEntityType, this.getFilterProperties()).then(function(entities){
      that.set('entities', entities);
      var loaders = [];
      try {
        var loader = Em.tryInvoke(that, 'loadAdditional');
        if (!!loader) {
          loaders.push(loader);
        }
      } catch(error) {
        Em.Logger.error("Exception invoking additional load", error);
      }
      Em.RSVP.allSettled(loaders).then(function(){
        that.updateLoading();
      });
    }).catch(function(error){
      Em.Logger.error(error);
      var err = App.Helpers.misc.formatError(error, defaultErrMsg);
      var msg = 'error code: %@, message: %@'.fmt(err.errCode, err.msg);
      App.Helpers.ErrorBar.getInstance().show(msg, err.details);
    });
  },

  setFiltersAndLoadEntities: function(filters) {
    this._paginationFilters = filters;
    this.load();
  },

  resetNavigation: function() {
    this.set('navIDs', []);
    this.set('fromID', null);
    this.set('page', 1);
  },

  updatePagination: function(dataArray) {
    var nextFromId = null,
        navIDs = this.get('navIDs'),
        rowCount = this.get('rowCount');

    if(dataArray && dataArray.length == rowCount + 1) {
      nextFromId = dataArray.objectAt(rowCount).get('id');
      if (navIDs.indexOf(nextFromId) == -1 &&
          this.get('page') >= navIDs.get('length')) {
          navIDs.pushObject(nextFromId);
      }
    }
  },

  actions:{
    refresh: function () {
      this.load();
    },

    changePage: function (pageNum) {
      this.set('fromID', this.get('navIDs.' + (pageNum - 2)) || null);
      this.set('loading', true);
      this.set('page', pageNum);
      this.loadEntities();
    }
  },

  _concatFilters: function(obj) {
    var p = [];
    for(var k in obj) {
      if (!Em.empty(obj[k])) {
        p.push(k + ':' + obj[k]);
      }
    }
    return p.join(',');
  },

  getFilterProperties: function() {
    var params = {
      limit: Math.min(this.rowCount, this.get('maxRowCount')) + 1
    };

    var f = this._paginationFilters;
    var primary = f.primary || {};
    var secondary = f.secondary || {};

    // TimelineRest API allows only one primaryFilter but any number of
    // secondary filters. secondary filters are first checked in otherInfo
    // field and then in primaryFilter field. this is tricky (for ex. when
    // otherInfo and primaryFilter has same key). so we move all filters
    // other than first non null primary to secondary.
    var foundOnePrimaryFilter = false;
    $.each(primary, function(name, value) {
      if (!value) {
        delete primary[name];
        return true;
      }
      if (foundOnePrimaryFilter) {
        secondary[name] = value;
        delete primary[name];
      }
      foundOnePrimaryFilter = true;
    });

    primary = this._concatFilters(primary);
    secondary = this._concatFilters(secondary);

    if (!Em.empty(primary)) {
      params['primaryFilter'] = primary;
    }

    if (!Em.empty(secondary)) {
      params['secondaryFilter'] = secondary;
    }

    if (!Em.empty(this.get('fromID'))) {
      params['fromId'] = this.get('fromID');
    }

    return params;
  },
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.Router.map(function() {
  this.resource('dags', { path: '/' });
  this.resource('dag', { path: '/dag/:dag_id'}, function() {
    this.route('vertices');
    this.route('view');
    this.route('tasks');
    this.route('taskAttempts');
    this.route('counters');
    this.route('swimlane');
  });

  this.resource('tez-app', {path: '/tez-app/:app_id'}, function(){
    this.route('dags');
    this.route('configs');
  });

  this.resource('vertex', {path: '/vertex/:vertex_id'}, function(){
    this.route('tasks');
    this.route('additionals');
    this.resource('input', {path: '/input/:input_id'}, function(){
      this.route('configs');
    });
    this.resource('output', {path: '/output/:input_id'}, function(){
      this.route('configs');
    });
    this.route('taskAttempts');
    this.route('counters');
    this.route('details');
    this.route('swimlane');
  });

  this.resource('tasks', {path: '/tasks'});
  this.resource('task', {path: '/task/:task_id'}, function(){
    this.route('attempts');
    this.route('counters');
  });

  this.resource('taskAttempt', {path: '/task_attempt/:task_attempt_id'}, function() {
    this.route('counters');
  });

  this.resource('error', {path: '/error'});
});

/* --- Router helper functions --- */

function renderSwimlanes () {
  this.render('common/swimlanes');
}

function renderConfigs() {
  this.render('common/configs');
}

function renderTable() {
  this.render('common/table');
}

/*
 * Creates a setupController function
 * @param format Unformatted title string.
 * @param Optional, arguments as string can be tailed after format to specify the property path.
 *        i.e. 'Dag - %@ (%@)', 'name', 'id' would give 'Dag - dag_name (dag_id)'
 * @return setupController function
 */
function setupControllerFactory(format) {
  var fmtArgs = Array.prototype.slice.call(arguments, 1);

  return function (controller, model) {
    var fmtValues, title;

    if(format) {
      if(model && fmtArgs.length) {
        fmtValues = fmtArgs.map(function (key) {
          return model.get(key);
        }),
        title = format.fmt.apply(format, fmtValues);
      }
      else {
        title = format;
      }

      $(document).attr('title', title);
    }

    this._super(controller, model);
    if(controller.setup) {
      controller.setup();
    }

    if(controller.loadData) {
      controller.loadData();
    }
  };
}

/* --- Base route class --- */
App.BaseRoute = Em.Route.extend({
  setupController: setupControllerFactory(),
  resetController: function() {
    if(this.controller.reset) {
      this.controller.reset();
    }
  },
  actions: {
    pollingEnabledChanged: function (enabled) {
      if(this.get('controller.pollster')) {
        this.set('controller.pollingEnabled', enabled);
      }
      return true;
    }
  }
});

App.ApplicationRoute = Em.Route.extend({
  actions: {
    willTransition: function(transition) {
      App.Helpers.ErrorBar.getInstance().hide();
      $(document).tooltip("close");
    },
    error: function(error, transition, originRoute) {
      this.replaceWith('error');
      Em.Logger.error(error);
      var defaultError = 'Error while loading %@.'.fmt(transition.targetName);
      var err = App.Helpers.misc.formatError(error, defaultError);
      var msg = 'error code: %@, message: %@'.fmt(err.errCode, err.msg);
      App.Helpers.ErrorBar.getInstance().show(msg, error.details);
    },
  }
});
/* --- Dag related routes --- */

App.DagsRoute = App.BaseRoute.extend({
  queryParams:  {
    count: App.Helpers.misc.defaultQueryParamsConfig,
    fromID: App.Helpers.misc.defaultQueryParamsConfig,
    user: App.Helpers.misc.defaultQueryParamsConfig,
    status: App.Helpers.misc.defaultQueryParamsConfig,
    appid: App.Helpers.misc.defaultQueryParamsConfig,
    dag_name: App.Helpers.misc.defaultQueryParamsConfig
  },
  setupController: setupControllerFactory('All Dags'),
});

App.DagRoute = App.BaseRoute.extend({
  model: function(params) {
    return this.store.find('dag', params.dag_id);
  },
  afterModel: function(model) {
    return this.controllerFor('dag').loadAdditional(model);
  },
  setupController: setupControllerFactory('Dag: %@ (%@)', 'name', 'id'),
});

App.DagViewRoute = App.BaseRoute.extend({
  setupController: setupControllerFactory()
});

App.DagSwimlaneRoute = App.BaseRoute.extend({
  renderTemplate: renderSwimlanes,
  model: function(params) {
    var model = this.modelFor('dag'),
        queryParams = {'primaryFilter': 'TEZ_DAG_ID:' + model.id};
    this.store.unloadAll('task_attempt');
    return this.store.findQuery('task_attempt', queryParams);
  },
  setupController: setupControllerFactory()
});

/* --- Task related routes --- */

App.TaskRoute = App.BaseRoute.extend({
  model: function(params) {
    return this.store.find('task', params.task_id);
  },
  afterModel: function(model) {
    return this.controllerFor('task').loadAdditional(model);
  },
  setupController: setupControllerFactory('Task: %@', 'id')
});

App.TasksRoute = App.BaseRoute.extend({
  setupController: setupControllerFactory()
});

/* --- Vertex related routes --- */

App.VertexRoute = App.BaseRoute.extend({
  model: function(params) {
    return this.store.find('vertex', params.vertex_id);
  },
  afterModel: function(model) {
    return this.controllerFor('vertex').loadAdditional(model);
  },
  setupController: setupControllerFactory('Vertex: %@ (%@)', 'name', 'id')
});

App.VertexAdditionalsRoute = App.BaseRoute.extend({
  setupController: function(controller, model) {
    this._super(controller, model);
    controller.loadEntities();
  }
});

App.InputRoute = App.BaseRoute.extend({
  model: function (params) {
    var model = this.modelFor('vertex');
    return model.get('inputs').findBy('id', params.input_id);
  },
  setupController: setupControllerFactory()
});

App.OutputRoute = App.BaseRoute.extend({
  model: function (params) {
    var model = this.modelFor('vertex');
    return model.get('outputs').findBy('id', params.input_id);
  },
  setupController: setupControllerFactory()
});

App.VertexSwimlaneRoute = App.BaseRoute.extend({
  renderTemplate: renderSwimlanes,
  model: function(params) {
    var model = this.modelFor('vertex'),
        queryParams = {'primaryFilter': 'TEZ_VERTEX_ID:' + model.id };
    this.store.unloadAll('task_attempt');
    return this.store.find('task_attempt', queryParams);
  },
  setupController: setupControllerFactory()
});

/* --- Task Attempt related routes--- */

App.TaskAttemptRoute = App.BaseRoute.extend({
  model: function(params) {
    return this.store.find('task_attempt', params.task_attempt_id);
  },
  afterModel: function(model) {
    return this.controllerFor('task_attempt').loadAdditional(model);
  },
  setupController: setupControllerFactory('Task Attempt: %@', 'id')
});

App.TaskAttemptsRoute = App.BaseRoute.extend({
  renderTemplate: renderTable,
  setupController: setupControllerFactory('Task Attempt: %@', 'id')
});

/* --- Tez-app related routes --- */

App.TezAppRoute = App.BaseRoute.extend({
  model: function(params) {
    var store = this.store;
    return store.find('tezApp', 'tez_' + params.app_id).then(function (tezApp){
      if(!tezApp.get('appId')) return tezApp;
      return App.Helpers.misc.loadApp(store, tezApp.get('appId')).then(function (appDetails){
        tezApp.set('appDetail', appDetails);
        return tezApp;
      }).catch(function() {
        return tezApp;
      });
    });
  },
  setupController: setupControllerFactory('Application: %@', 'id')
});

App.TezAppIndexRoute = App.BaseRoute.extend({
  setupController: setupControllerFactory()
});

App.TezAppDagsRoute = App.BaseRoute.extend({
  renderTemplate: renderTable,
  setupController: setupControllerFactory()
});

App.TezAppConfigsRoute = App.BaseRoute.extend({
  renderTemplate: renderConfigs
});

/* --- Shared routes --- */
App.DagIndexRoute = App.BaseRoute.extend({
  setupController: setupControllerFactory()
});

App.DagTasksRoute =
    App.DagVerticesRoute =
    App.DagTaskAttemptsRoute =
    App.VertexTasksRoute =
    App.VertexTaskAttemptsRoute =
    App.BaseRoute.extend({
      renderTemplate: renderTable,
      setupController: setupControllerFactory()
    });

App.DagCountersRoute =
    App.VertexCountersRoute =
    App.TaskCountersRoute =
    App.TaskAttemptCountersRoute =
    App.BaseRoute.extend({
      renderTemplate: function() {
        this.render('common/counters');
      }
    });


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.Checkbox = Em.Checkbox.extend({
  change: function() {
    var value = this.get('checked'),
        target = this.get('target') || this.get('context');

    if(target) {
      Em.run.later(target.send.bind(target, this.get('action'), value), 100);
    }
    return true;
  }
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.DagViewView = Ember.View.extend({
  setHeight: function () {
    var container = $('.dag-view-component-container'),
        offset;
    if(container) {
      offset = container.offset();
      container.height(
        Math.max(
          // 50 pixel is left at the bottom
          offset ? $(window).height() - offset.top - 50 : 0,
          450 // Minimum dag view component container height
        )
      );
    }
  },

  didInsertElement: function() {
    $(window).on('resize', this.setHeight);
    this.setHeight();
  },

  willDestroyElement: function () {
    $(window).off('resize', this.setHeight);
  }
});

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.Dropdown = Em.Select.extend({
  currentValue: null,
  init: function () {
    this._super();
    this.set('currentValue', this.get('value'));
  },
  change: function() {
    var value = this.get('value'),
        target = this.get('target') || this.get('context');

    if(target && value != this.get('currentValue')) {
      Em.run.later(target.send.bind(target, this.get('action'), value), 100);
      this.set('currentValue', value);
    }
    return true;
  }
});

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.ExtraTableButtonsView = Ember.View.extend({
  templateName: 'views/extra-table-buttons',

  classNames: ['extra-table-buttons']
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.MultiSelectView = Ember.View.extend({
  templateName: 'views/multi-select',
  classNames: ['multi-select'],

  selectAll: false,
  searchRegex: '',

  options: null, //Must be set by sub-classes or instances

  _validRegEx: function () {
    var regExText = this.get('searchRegex');
    regExText = regExText.substr(regExText.indexOf(':') + 1);
    try {
      new RegExp(regExText, 'im');
    }
    catch(e) {
      return false;
    }
    return true;
  }.property('searchRegex'),

  visibleOptions: function () {
    var options = this.get('options'),
        regExText = this.get('searchRegex'),
        regEx;

    if (Em.isEmpty(regExText) || !this.get('_validRegEx')) {
      return options;
    }

    regEx = new RegExp(regExText, 'i');
    return options.filter(function (option) {
      return regEx.test(option.get('displayText'));
    });
  }.property('options', 'searchRegex'),

  _selectObserver: function () {
    var selectedCount = 0;
    this.get('visibleOptions').forEach(function (option) {
      if(option.get('selected')) {
        selectedCount++;
      }
    });
    this.set('selectAll', selectedCount > 0 && selectedCount == this.get('visibleOptions.length'));
  }.observes('visibleOptions.@each.selected'),

  actions: {
    selectAll: function (checked) {
      this.get('visibleOptions').forEach(function (option) {
        option.set('selected', checked);
      });
    }
  }
});

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.SwimlanesView = Ember.View.extend({

  didInsertElement: function() {
    var _tip;     // Instance of tip.js
    var task_attempts = this.get("content");
    var controller = this.get("controller");
    var timeBegin = d3.min(task_attempts, function (d) { return d.get('startTime') });
    var timeEnd = d3.max(task_attempts, function (d) { return d.get('endTime') });
    var containers = d3.set(task_attempts.map(function (d) {return d.get('containerId')})).values().sort();
    var laneLength = containers.length;

    var margin = {top: 20, right: 15, bottom: 15, left: 280};
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    var laneHeight = 18;
    var miniHeight = laneLength * laneHeight;

    //scales
    var x = d3.scale.linear()
    .range([0, width])
    .domain([timeBegin, timeEnd]);

    var y = d3.scale.ordinal()
    .domain(containers)
    .rangeRoundBands([0, miniHeight], .20);

    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(0)
    .tickFormat(function(d) { return (d - timeBegin)/1000; });

    var yAxis = d3.svg.axis()
    .scale(y)
    .tickSize(0)
    .orient("left");

    var svg = d3.select('.svg-container')
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "svg");
    _tip = App.DagViewComponent.tip;
    _tip.init($('.tool-tip'), $(svg.node()));

    var mini = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "mini");

    mini.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .selectAll("text")
    .style("text-anchor", "end");

    mini.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + miniHeight + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-90)" );

    // draw container rectangles
    mini.append("g").selectAll("container")
    .data(containers)
    .enter().append("a").attr("xlink:href","file:///Users/jeagles/myember/")
    .append("rect")
    .attr("class", "container")
    .attr("x", 0)
    .attr("y", function(d) {return y(d);})
    .attr("width", width)
    .attr("rx", 6)
    .attr("height", y.rangeBand());

    // draw task attempt rectangles
    mini.append("g").selectAll("task_attempt")
    .data(task_attempts)
    .enter().append("rect")
    .attr("class", function(d) {return "task_attempt";})
    .attr("x", function(d) {return x(d.get('startTime'));})
    .attr("y", function(d) {return y(d.get('containerId'));})
    .attr("width", function(d) {return x(d.get('endTime')) - x(d.get('startTime'));})
    .attr("rx", 6)
    .attr("height", y.rangeBand())
    .on({
      mouseover: _onMouseOver,
      mouseout: _tip.hide,
      click: function (d) { controller.send('taskAttemptClicked', d.get('id'))}
    });

  /**
   * Mouse over handler for all displayed SVG DOM elements.
   * Later the implementation will be refactored and moved into the respective DataNode.
   * d {DataNode} Contains data to be displayed
   */
  function _onMouseOver(d) {
    var event = d3.event,
        node = event.target,
        tooltipData = {}; // Will be populated with {title/text/kvList}.

    node = node.correspondingUseElement || node;

    switch(_getType(node)) {
      case "task_attempt":
        node = d3.event.target;
        tooltipData = {
          position: {
            x: event.clientX,
            y: event.clientY
          },
          title: '%@'.fmt(
            "Task Attempt"
          )
        };
        tooltipData.kvList = {
          "Id": d.get('id'),
          "Task Id": d.get("taskID"),
          "Vertex Id": d.get("vertexID"),
          "DAG Id": d.get("dagID"),
          "Start Time": App.Helpers.date.dateFormat(d.get("startTime")),
          "End Time": App.Helpers.date.dateFormat(d.get("endTime")),
          "Duration": App.Helpers.date.timingFormat(App.Helpers.date.duration(d.get("startTime"), d.get("endTime"))),
        };
      break;
    }

    _tip.show(node, tooltipData, event);
  }

  function _getType(node) {
    return $(node).attr('class');
  }

    /*
    // TODO: task attempt labels - draw labels if they fit
    mini.append("g").selectAll("task_attempt_label")
    .data(task_attempts)
    .enter().append("text")
    .text(function(d) {return d.get('id');})
    .attr("x", function(d) {return x(d.get('startTime'));})
    .attr("y", function(d) {return y(d.get('containerId'));})
    .attr("dy", ".5ex");
    */

  },
});


})();

(function() {

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

App.TimelineRESTAdapter = DS.RESTAdapter.extend({
  ajax: function(url, method, hash) {
    hash = hash || {}; // hash may be undefined
    hash.crossDomain = true;
    hash.xhrFields = {withCredentials: true};
    hash.targetServer = "Timeline Server";
    return this._super(url, method, hash);
  },
	namespace: App.Configs.restNamespace.timeline,
	pathForType: App.Helpers.misc.timelinePathForType
});

App.TimelineSerializer = DS.RESTSerializer.extend({
	extractSingle: function(store, primaryType, rawPayload, recordId) {
		// rest serializer expects singular form of model as the root key.
		var payload = {};
		payload[primaryType.typeKey] = rawPayload;
		return this._super(store, primaryType, payload, recordId);
	},

	extractArray: function(store, primaryType, rawPayload) {
		// restserializer expects a plural of the model but TimelineServer returns
		// it in entities.
		var payload = {};
		payload[primaryType.typeKey.pluralize()] = rawPayload.entities;
		return this._super(store, primaryType, payload);
	},

  // normalizes countergroups returns counterGroups and counters.
  normalizeCounterGroupsHelper: function(parentType, parentID, entity) {
    // create empty countergroups if not there - to make code below easier.
    entity.otherinfo.counters = entity.otherinfo.counters || {}
    entity.otherinfo.counters.counterGroups = entity.otherinfo.counters.counterGroups || [];

    var counterGroups = [];
    var counters = [];

    var counterGroupsIDs = entity.otherinfo.counters.counterGroups.map(function(counterGroup) {
      var cg = {
        id: parentID + '/' + counterGroup.counterGroupName,
        name: counterGroup.counterGroupName,
        displayName: counterGroup.counterGroupDisplayName,
        parentID: { // polymorphic requires type and id.
          type: parentType,
          id: parentID
        }
      };
      cg.counters = counterGroup.counters.map(function(counter){
        var c = {
          id: cg.id + '/' + counter.counterName,
          name: counter.counterName,
          displayName: counter.counterName,
          value: counter.counterValue,
          parentID: cg.id
        };
        counters.push(c);
        return c.id;
      });
      counterGroups.push(cg);
      return cg.id;
    });

    return {
      counterGroups: counterGroups,
      counters: counters,
      counterGroupsIDs: counterGroupsIDs
    }
  }
});


var timelineJsonToDagMap = {
  id: 'entity',
  submittedTime: 'starttime',
  startTime: 'otherinfo.startTime',
  endTime: 'otherinfo.endTime',
  name: 'primaryfilters.dagName.0',
  user: 'primaryfilters.user.0',
  status: 'otherinfo.status',
  callerId: 'primaryfilters.callerId.0',

  progress: {
    custom: function(source) {
      return Em.get(source, 'otherinfo.status') == 'SUCCEEDED' ? 1 : null;
    }
  },

  containerLogs: {
    custom: function(source) {

      var containerLogs = [];
      var otherinfo = Em.get(source, 'otherinfo');
      for (var key in otherinfo) {
        if (key.indexOf('inProgressLogsURL_') === 0) {
          var logs = Em.get(source, 'otherinfo.' + key);
          if (logs.indexOf('http') !== 0) {
            logs = 'http://' + logs;
          }
          var attemptid = key.substring(18);
          containerLogs.push({id : attemptid, containerLog: logs});
        }
      }
      return containerLogs;
    }
  },
  hasFailedTaskAttempts: {
    custom: function(source) {
      // if no other info is available we say no failed tasks attempts.
      // since otherinfo is populated only at the end.
      var numFailedAttempts = Em.get(source, 'otherinfo.numFailedTaskAttempts');
      return !!numFailedAttempts && numFailedAttempts > 0;
    }
  },
  numFailedTasks: 'otherinfo.numFailedTasks',
  diagnostics: 'otherinfo.diagnostics',

  counterGroups: 'otherinfo.counters.counterGroups',

  planName: 'otherinfo.dagPlan.dagName',
  planVersion: 'otherinfo.dagPlan.version',
  amWebServiceVersion: {
    custom: function(source) {
      return Em.get(source, 'otherinfo.amWebServiceVersion') || '1';
    }
  },
  appContextInfo: {
    custom: function (source) {
      var appType = undefined,
          info = undefined;
      var dagInfoStr = Em.get(source, 'otherinfo.dagPlan.dagInfo');
      if (!!dagInfoStr) {
        try {
          var dagInfo = $.parseJSON(dagInfoStr);
          appType = dagInfo['context'];
          info = dagInfo['description'];
        } catch (e) {
          info = dagInfoStr;
        }
      }

      return {
        appType: appType,
        info: info
      };
    }
  },
  vertices: 'otherinfo.dagPlan.vertices',
  edges: 'otherinfo.dagPlan.edges',
  vertexGroups: 'otherinfo.dagPlan.vertexGroups',

  vertexIdToNameMap: {
    custom: function(source) {
      var nameToIdMap = Em.get(source, 'otherinfo.vertexNameIdMapping') || {};
      var idToNameMap = {};
      $.each(nameToIdMap, function(vertexName, vertexId) {
        idToNameMap[vertexId] = vertexName;
      });
      return idToNameMap;
    }
  },
};

App.DagSerializer = App.TimelineSerializer.extend({
  normalize: function(type, hash, prop) {
    return Em.JsonMapper.map(hash, timelineJsonToDagMap);
  },
});

var timelineJsonToTaskAttemptMap = {
  id: 'entity',
  startTime: 'otherinfo.startTime',
  endTime: 'otherinfo.endTime',
  status: 'otherinfo.status',
  diagnostics: 'otherinfo.diagnostics',
  counterGroups: 'otherinfo.counters.counterGroups',

  progress: {
    custom: function(source) {
      return Em.get(source, 'otherinfo.status') == 'SUCCEEDED' ? 1 : null;
    }
  },

  inProgressLog: 'otherinfo.inProgressLogsURL',
  completedLog: 'otherinfo.completedLogsURL',

  taskID: 'primaryfilters.TEZ_TASK_ID.0',
  vertexID: 'primaryfilters.TEZ_VERTEX_ID.0',
  dagID: 'primaryfilters.TEZ_DAG_ID.0',
  containerId: 'otherinfo.containerId',
  nodeId: 'otherinfo.nodeId',
  diagnostics: 'otherinfo.diagnostics'
};

App.DagTaskAttemptSerializer =
App.VertexTaskAttemptSerializer =
App.TaskTaskAttemptSerializer =
App.TaskAttemptSerializer = App.TimelineSerializer.extend({
  normalize: function(type, hash, prop) {
    return Em.JsonMapper.map(hash, timelineJsonToTaskAttemptMap);
  },
});

var timelineJsonToTaskMap = {
  id: 'entity',
  dagID: 'primaryfilters.TEZ_DAG_ID.0',
  startTime: 'otherinfo.startTime',
  vertexID: 'primaryfilters.TEZ_VERTEX_ID.0',
  endTime: 'otherinfo.endTime',
  status: 'otherinfo.status',
  progress: {
    custom: function(source) {
      return Em.get(source, 'otherinfo.status') == 'SUCCEEDED' ? 1 : null;
    }
  },
  numFailedTaskAttempts: 'otherinfo.numFailedTaskAttempts',
  diagnostics: 'otherinfo.diagnostics',
  counterGroups: 'otherinfo.counters.counterGroups',
  successfulAttemptId: 'otherinfo.successfulAttemptId',
  attempts: 'relatedentities.TEZ_TASK_ATTEMPT_ID',
  numAttempts: 'relatedentities.TEZ_TASK_ATTEMPT_ID.length'
};

App.DagTaskSerializer =
App.VertexTaskSerializer =
App.TaskSerializer = App.TimelineSerializer.extend({
  normalize: function(type, hash, prop) {
    return Em.JsonMapper.map(hash, timelineJsonToTaskMap);
  },
});

var timelineJsonToVertexMap = {
  id: 'entity',
  name: 'otherinfo.vertexName',
  dagID: 'primaryfilters.TEZ_DAG_ID.0',
  processorClassName: 'processorClassName',
  counterGroups: 'otherinfo.counters.counterGroups',
  inputs: 'inputs',
  outputs: 'outputs',

  startTime: 'otherinfo.startTime',
  endTime: 'otherinfo.endTime',

  progress: {
    custom: function(source) {
      return Em.get(source, 'otherinfo.status') == 'SUCCEEDED' ? 1 : null;
    }
  },
  runningTasks: {
    custom: function(source) {
      return Em.get(source, 'otherinfo.status') == 'SUCCEEDED' ? 0 : null;
    }
  },
  pendingTasks: {
    custom: function(source) {
      return Em.get(source, 'otherinfo.status') == 'SUCCEEDED' ? 0 : null;
    }
  },

  status: 'otherinfo.status',
  hasFailedTaskAttempts: {
    custom: function(source) {
      // if no other info is available we say no failed tasks attempts.
      // since otherinfo is populated only at the end.
      var numFailedAttempts = Em.get(source, 'otherinfo.numFailedTaskAttempts');
      return !!numFailedAttempts && numFailedAttempts > 0;
    }
  },
  diagnostics: 'otherinfo.diagnostics',

  failedTaskAttempts: 'otherinfo.numFailedTaskAttempts',
  killedTaskAttempts: 'otherinfo.numKilledTaskAttempts',

  failedTasks: 'otherinfo.numFailedTasks',
  sucessfulTasks: 'otherinfo.numSucceededTasks',
  numTasks: 'otherinfo.numTasks',
  killedTasks: 'otherinfo.numKilledTasks',

  firstTaskStartTime: 'otherinfo.stats.firstTaskStartTime',
  lastTaskFinishTime:  'otherinfo.stats.lastTaskFinishTime',

  firstTasksToStart:  'otherinfo.stats.firstTasksToStart',
  lastTasksToFinish:  'otherinfo.stats.lastTasksToFinish',

  minTaskDuration:  'otherinfo.stats.minTaskDuration',
  maxTaskDuration:  'otherinfo.stats.maxTaskDuration',
  avgTaskDuration:  'otherinfo.stats.avgTaskDuration',

  shortestDurationTasks:  'otherinfo.stats.shortestDurationTasks',
  longestDurationTasks:  'otherinfo.stats.longestDurationTasks'
};

App.VertexSerializer = App.TimelineSerializer.extend({
  _normalizeSingleVertexPayload: function(vertex) {
    processorClassName = Ember.get(vertex, 'otherinfo.processorClassName') || "",
    inputs = [],
    inputIds = [],
    outputs = [],
    outputIds = [];

    vertex.processorClassName = processorClassName.substr(processorClassName.lastIndexOf('.') + 1);

    if(vertex.inputs) {
      vertex.inputs.forEach(function (input, index) {
        input.entity = vertex.entity + '-input' + index;
        inputIds.push(input.entity);
        inputs.push(input);
      });
      vertex.inputs = inputIds;
    }

    if(vertex.outputs) {
      vertex.outputs.forEach(function (output, index) {
        output.entity = vertex.entity + '-output' + index;
        outputIds.push(output.entity);
        outputs.push(output);
      });
      vertex.outputs = outputIds;
    }

    return {
      vertex: vertex,
      inputs: inputs,
      outputs: outputs
    };
  },

  normalizePayload: function(rawPayload, property) {
    var pluralizedPoperty,
        normalizedPayload,
        n;

    property = property || 'vertex',
    pluralizedPoperty = property.pluralize();;
    if (!!rawPayload[pluralizedPoperty]) {
      normalizedPayload = {
        inputs: [],
        outputs: [],
      };
      normalizedPayload[pluralizedPoperty] = [];

      rawPayload[pluralizedPoperty].forEach(function(vertex){
        n = this._normalizeSingleVertexPayload(vertex);
        normalizedPayload[pluralizedPoperty].push(n.vertex);
        [].push.apply(normalizedPayload.inputs, n.inputs);
        [].push.apply(normalizedPayload.outputs, n.outputs);
      }, this);

      // delete so that we dont hang on to the json data.
      delete rawPayload[pluralizedPoperty];

      return normalizedPayload;
    } else {
      n = this._normalizeSingleVertexPayload(rawPayload[property]);
      normalizedPayload = {
        inputs : n.inputs,
        outputs: n.outputs
      };
      normalizedPayload[property] = n.vertex;

      return normalizedPayload;
    }
  },

  normalize: function(type, hash, prop) {
    return Em.JsonMapper.map(hash, timelineJsonToVertexMap);
  },
});

App.DagVertexSerializer = App.VertexSerializer.extend({
  normalizePayload: function (rawPayload) {
    return this._super(rawPayload, 'dagVertex');
  }
});

App.InputSerializer = App.TimelineSerializer.extend({
  _map: {
    id: 'entity',
    inputName: 'name',
    inputClass: 'class',
    inputInitializer: 'initializer',
    configs: 'configs'
  },
  _normalizeData: function(data) {
    var userPayload = JSON.parse(data.userPayloadAsText || null),
        store = this.get('store'),
        configs,
        configKey,
        configIndex = 0,
        id;

    data.configs = [];

    if(userPayload) {
      configs = userPayload.config || userPayload.dist;
      for(configKey in configs) {
        id = data.entity + configIndex++;
        data.configs.push(id);
        store.push('KVDatum', {
          id: id,
          key: configKey,
          value: configs[configKey]
        });
      }
    }

    return data;
  },
  normalize: function(type, hash, prop) {
    return Em.JsonMapper.map(this._normalizeData(hash), this._map);
  }
});

App.OutputSerializer = App.TimelineSerializer.extend({
  _map: {
    id: 'entity',
    outputName: 'name',
    outputClass: 'class',
    configs: 'configs'
  },
  _normalizeData: function(data) {
    var userPayload = JSON.parse(data.userPayloadAsText || null),
        store = this.get('store'),
        configs,
        configKey,
        configIndex = 0,
        id;

    data.configs = [];

    if(userPayload) {
      configs = userPayload.config || userPayload.dist;
      for(configKey in configs) {
        id = data.entity + configIndex++;
        data.configs.push(id);
        store.push('KVDatum', {
          id: id,
          key: configKey,
          value: configs[configKey]
        });
      }
    }

    return data;
  },
  normalize: function(type, hash, prop) {
    return Em.JsonMapper.map(this._normalizeData(hash), this._map);
  }
});

var timelineJsonToAppDetailMap = {
  id: 'appId',
  attemptId: {
    custom: function(source) {
      // while an attempt is in progress the attempt id contains a '-'
      return (Em.get(source, 'currentAppAttemptId') || '').replace('-','');
    }
  },

  name: 'name',
  queue: 'queue',
  user: 'user',
  type: 'type',

  startedTime: 'startedTime',
  elapsedTime: 'elapsedTime',
  finishedTime: 'finishedTime',
  submittedTime: 'submittedTime',

  status: 'appState',

  finalStatus: 'finalAppStatus',
  diagnostics: 'otherinfo.diagnostics',
};

App.AppDetailSerializer = App.TimelineSerializer.extend({
  normalize: function(type, hash, prop) {
    return Em.JsonMapper.map(hash, timelineJsonToAppDetailMap);
  },
});

var timelineJsonToTezAppMap = {
  id: 'entity',

  appId: 'appId',

  entityType: 'entitytype',

  startedTime: 'startedTime',
  domain: 'domain',

  user: 'primaryfilters.user.0',

  dags: 'relatedentities.TEZ_DAG_ID',
  configs: 'configs',

  tezBuildTime: 'otherinfo.tezVersion.buildTime',
  tezRevision: 'otherinfo.tezVersion.revision',
  tezVersion: 'otherinfo.tezVersion.version'
};

App.TezAppSerializer = App.TimelineSerializer.extend({
  _normalizeSinglePayload: function(rawPayload){
    var configs = rawPayload.otherinfo.config,
    appId = rawPayload.entity.substr(4),
    kVData = [],
    id;

    rawPayload.appId = appId;
    rawPayload.configs = [];

    for(var key in configs) {
      id = appId + key;
      rawPayload.configs.push(id);
      kVData.push({
        id: id,
        key: key,
        value: configs[key]
      });
    }

    return {
      tezApp: rawPayload,
      kVData: kVData
    };
  },
  normalizePayload: function(rawPayload) {
    if (!!rawPayload.tezApps) {
      var normalizedPayload = {
        tezApps: [],
        kVData: []
      },
      push = Array.prototype.push;
      rawPayload.tezApps.forEach(function(app){
        var n = this._normalizeSinglePayload(app);
        normalizedPayload.tezApps.push(n.tezApp);
        push.apply(normalizedPayload.kVData,n.kVData);
      });
      return normalizedPayload;
    }
    else {
      return this._normalizeSinglePayload(rawPayload.tezApp)
    }
  },
  normalize: function(type, hash, prop) {
    return Em.JsonMapper.map(hash, timelineJsonToTezAppMap);
  },
});

var timelineJsonToHiveQueryMap = {
  id: 'entity',
  query: 'otherinfo.QUERY'
};

App.HiveQuerySerializer = App.TimelineSerializer.extend({
  _normalizeSingleDagPayload: function(hiveQuery) {
    return {
      hiveQuery: hiveQuery
    }
  },

  normalizePayload: function(rawPayload){
    // we handled only single hive
    return this._normalizeSingleDagPayload(rawPayload.hiveQuery);
  },

  normalize: function(type, hash, prop) {
    return Em.JsonMapper.map(hash, timelineJsonToHiveQueryMap);
  }
});

App.VertexProgressSerializer = App.DagProgressSerializer = DS.RESTSerializer.extend({});

// v2 version of am web services
App.DagInfoSerializer = DS.RESTSerializer.extend({
  normalizePayload: function(rawPayload) {
    return {
      dagInfo : [rawPayload.dag]
    }
  }
});

App.VertexInfoSerializer = DS.RESTSerializer.extend({
  map: {
    id: 'id',
    progress: 'progress',
    status: 'status',
    numTasks: 'totalTasks',
    runningTasks: 'runningTasks',
    sucessfulTasks: 'succeededTasks',
    failedTaskAttempts: 'failedTaskAttempts',
    killedTaskAttempts: 'killedTaskAttempts',
    counters: 'counters'
  },
  normalizePayload: function(rawPayload) {
    return {
      vertexInfo : rawPayload.vertices
    }
  },
  normalize: function(type, hash, prop) {
    return Em.JsonMapper.map(hash, this.get('map'));
  }
});

App.TaskInfoSerializer = DS.RESTSerializer.extend({
  normalizePayload: function(rawPayload) {
    return {
      taskInfo : rawPayload.tasks
    }
  }
});

App.AttemptInfoSerializer = DS.RESTSerializer.extend({
  normalizePayload: function(rawPayload) {
    return {
      attemptInfo : rawPayload.attempts
    }
  }
});

App.ClusterAppSerializer = App.TimelineSerializer.extend({
  map: {
    id: 'id',
    status: 'state',
    finalStatus: 'finalStatus',

    name: 'name',
    queue: 'queue',
    user: 'user',
    type: 'type',

    startedTime: 'startedTime',
    elapsedTime: 'elapsedTime',
    finishedTime: 'finishedTime',

    progress: 'progress'
  },

  _normalizeSingleDagPayload: function(rawPayload) {
    return {
      clusterApp: rawPayload.clusterApp.app
    }
  },

  normalizePayload: function(rawPayload){
    // we handled only single clusterApp
    return this._normalizeSingleDagPayload(rawPayload);
  },

  normalize: function(type, hash, prop) {
    return Em.JsonMapper.map(hash, this.get('map'));
  }
});


})();

(function() {

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

App.AbstractEntity = DS.Model.extend({
  // type of the entity. should be one of App.EntityType
  entityType: DS.attr('string'),
  timeStamp: null,

  didLoad: function () {
    this.set('timeStamp', new Date());
  },

  observeReloading: function () {
    if(!this.get('isReloading')) {
      this.didLoad();
    }
  }.observes('isReloading')
});

App.EntityType = {
  DAG: 'dag',
  VERTEX: 'vertex',
  TASK: 'task',
  TASK_ATTEMPT: 'task_attempt',
};


})();

(function() {

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

App.Dag = App.AbstractEntity.extend({

  idx: function() {
    return App.Helpers.misc.getDagIndexFromDagId(this.get('id'));
  }.property('id'),

  submittedTime: DS.attr('number'),

  // start time of the entity
  startTime: DS.attr('number'),

  // end time of the entity
  endTime: DS.attr('number'),

  duration: function () {
    return App.Helpers.date.duration(this.get('startTime'), this.get('endTime'))
  }.property('startTime', 'endTime'),

  // set type to DAG
  entityType: App.EntityType.DAG,

  // Name of the dag.
  name: DS.attr('string'),

  // user name who ran this dag.
  user: DS.attr('string'),

  // application ID of this dag.
  applicationId: function() {
    return App.Helpers.misc.getAppIdFromDagId(this.get('id'));
  }.property('id'),

  tezApp: DS.belongsTo('tezApp'),
  appDetail: DS.attr('object'),

  progress: DS.attr('number'),

  // status
  status: DS.attr('string'),
  hasFailedTaskAttempts: DS.attr('boolean'),
  hasFailedTasks: function() {
    var f = this.get('numFailedTasks');
    return !!f && f > 0;
  }.property('numFailedTasks'),
  numFailedTasks: DS.attr('number'),

  // diagnostics info if any.
  diagnostics: DS.attr('string'),

  // Dag plan related data
  planName: DS.attr('string'),
  planVersion: DS.attr('number'),
  appContextInfo: DS.attr('object'),
  vertices: DS.attr('array'), // Serialize when required
  edges: DS.attr('array'), // Serialize when required
  vertexGroups: DS.attr('array'),
  vertexIdToNameMap: DS.attr('array'),

  counterGroups: DS.attr('array'),
  amWebServiceVersion: DS.attr('string'),

  callerId: DS.attr('string')

});

App.CounterGroup = DS.Model.extend({
  name: DS.attr('string'),

  displayName: DS.attr('string'),

  counters: DS.hasMany('counter', { inverse: 'parent' }),

  parent: DS.belongsTo('abstractEntity', { polymorphic: true })
});

App.Counter = DS.Model.extend({
  name: DS.attr('string'),

  displayName: DS.attr('string'),

  value: DS.attr('number'),

  parent: DS.belongsTo('counterGroup')
});

App.Edge = DS.Model.extend({

  fromVertex: DS.belongsTo('vertex'),

  toVertex: DS.belongsTo('vertex'),

  /**
   * Type of this edge connecting vertices. Should be one of constants defined
   * in 'App.EdgeType'.
   */
  edgeType: DS.attr('string'),

  dag: DS.belongsTo('dag')
});

App.Vertex = App.AbstractEntity.extend({
  name: DS.attr('string'),
  vertexIdx: function() {
    return this.get('id').split('_').splice(-1).pop();
  }.property('id'),

  dag: DS.belongsTo('dag'),
  dagID: DS.attr('string'),
  applicationId: function() {
    return App.Helpers.misc.getAppIdFromVertexId(this.get('id'));
  }.property('id'),
  dagIdx: function() {
    return this.get('dagID').split('_').splice(-1).pop();
  }.property('dagID'),

  tezApp: DS.belongsTo('tezApp'),

  /**
   * State of this vertex. Should be one of constants defined in
   * App.VertexState.
   */
  status: DS.attr('string'),
  hasFailedTaskAttempts: DS.attr('boolean'),
  hasFailedTasks: function() {
    var f = this.get('failedTasks');
    return !!f && f > 0;
  }.property('failedTasks'),

  progress: DS.attr('number'),

  /**
   * Vertex type has to be one of the types defined in 'App.VertexType'
   * @return {string}
   */
  type: DS.attr('string'),

  /**
   * A vertex can have multiple incoming edges.
   */
  incomingEdges: DS.hasMany('edge', {inverse: 'fromVertex' }),

  /**
   * This vertex can have multiple outgoing edges.
   */
  outgoingEdges: DS.hasMany('edge', {inverse: 'toVertex'}),

  startTime: DS.attr('number'),

  endTime: DS.attr('number'),

  firstTaskStartTime: DS.attr('number'),

  firstTasksToStart: DS.attr('string'),

  lastTaskFinishTime: DS.attr('number'),

  lastTasksToFinish: DS.attr('string'),

  minTaskDuration: DS.attr('number'),

  maxTaskDuration: DS.attr('number'),

  avgTaskDuration: DS.attr('number'),

  shortestDurationTasks: DS.attr('string'),

  longestDurationTasks: DS.attr('string'),

  processorClassName: DS.attr('string'),

  /**
   * Provides the duration of this job. If the job has not started, duration
   * will be given as 0. If the job has not ended, duration will be till now.
   *
   * @return {Number} Duration in milliseconds.
   */
  duration: function () {
    return App.Helpers.date.duration(this.get('startTime'), this.get('endTime'))
  }.property('startTime', 'endTime'),

  /**
   * Each Tez vertex can perform arbitrary application specific computations
   * inside. The application can provide a list of operations it has provided in
   * this vertex.
   *
   * Array of strings. [{string}]
   */
  operations: DS.attr('array'),

  /**
   * Provides additional information about the 'operations' performed in this
   * vertex. This is shown directly to the user.
   */
  operationPlan: DS.attr('string'),

  /**
   * Number of actual Map/Reduce tasks in this vertex
   */
  numTasks: DS.attr('number'),

  name: DS.attr('string'),

  failedTasks: DS.attr('number'),
  sucessfulTasks: DS.attr('number'),
  runningTasks: DS.attr('number'),
  pendingTasks: DS.attr('number'),
  numTasks: DS.attr('number'),
  killedTasks: DS.attr('number'),

  failedTaskAttempts: DS.attr('number'),
  killedTaskAttempts: DS.attr('number'),

  diagnostics: DS.attr('string'),

  counterGroups: DS.attr('array'),

  tasksNumber: function () {
    return this.getWithDefault('tasksCount', 0);
  }.property('tasksCount'),

  /**
   * Local filesystem usage metrics for this vertex
   */
  fileReadBytes: DS.attr('number'),

  fileWriteBytes: DS.attr('number'),

  fileReadOps: DS.attr('number'),

  fileWriteOps: DS.attr('number'),

  /**
   * Spilled records
   */
  spilledRecords: DS.attr('number'),

  /**
   * HDFS usage metrics for this vertex
   */
  hdfsReadBytes: DS.attr('number'),

  hdfsWriteBytes: DS.attr('number'),

  hdfsReadOps: DS.attr('number'),

  hdfsWriteOps: DS.attr('number'),

  /**
   * Record metrics for this vertex
   */
  recordReadCount: DS.attr('number'),

  recordWriteCount: DS.attr('number'),

  inputs: DS.hasMany('input'),
  outputs: DS.hasMany('output'),

  totalReadBytes: function () {
    return this.get('fileReadBytes') + this.get('hdfsReadBytes');
  }.property('fileReadBytes', 'hdfsReadBytes'),

  totalWriteBytes: function () {
    return this.get('fileWriteBytes') + this.get('hdfsWriteBytes');
  }.property('fileWriteBytes', 'hdfsWriteBytes'),

  totalReadBytesDisplay: function () {
    return  App.Helpers.number.bytesToSize(this.get('totalReadBytes'));
  }.property('totalReadBytes'),

  totalWriteBytesDisplay: function () {
    return  App.Helpers.number.bytesToSize(this.get('totalWriteBytes'));
  }.property('totalWriteBytes'),

  durationDisplay: function () {
    return App.Helpers.date.timingFormat(this.get('duration'), true);
  }.property('duration')
});
App.DagVertex = App.Vertex.extend({});

App.Input = App.AbstractEntity.extend({
  entity: DS.attr('string'),

  inputName: DS.attr('string'),
  inputClass: DS.attr('string'),
  inputInitializer: DS.attr('string'),

  configs: DS.hasMany('kVData', { async: false })
});

App.Output = App.AbstractEntity.extend({
  entity: DS.attr('string'),

  outputName: DS.attr('string'),
  outputClass: DS.attr('string'),

  configs: DS.hasMany('kVData', { async: false })
});

App.AppDetail = App.AbstractEntity.extend({
  attemptId: DS.attr('string'),

  user: DS.attr('string'),
  name: DS.attr('string'),
  queue: DS.attr('string'),
  type: DS.attr('string'),

  status: DS.attr('string'),
  finalStatus: DS.attr('string'),
  progress: DS.attr('string'),

  startedTime: DS.attr('number'),
  elapsedTime: DS.attr('number'),
  finishedTime: DS.attr('number'),
  submittedTime: DS.attr('number'),

  diagnostics: DS.attr('string'),
});

App.TezApp = App.AbstractEntity.extend({
  appId: DS.attr('string'),
  entityType: DS.attr('string'),
  domain: DS.attr('string'),
  user: DS.attr('string'),

  startedTime: DS.attr('number'),

  appDetail: DS.attr('object'),
  dags: DS.hasMany('dag', { async: true }),

  configs: DS.hasMany('kVData', { async: false }),

  tezBuildTime: DS.attr('string'),
  tezRevision: DS.attr('string'),
  tezVersion: DS.attr('string'),
});

App.ClusterApp = App.AbstractEntity.extend({
  status: DS.attr('string'),
  finalStatus: DS.attr('string'),

  user: DS.attr('string'),
  name: DS.attr('string'),
  queue: DS.attr('string'),
  type: DS.attr('string'),

  startedTime: DS.attr('number'),
  elapsedTime: DS.attr('number'),
  finishedTime: DS.attr('number'),
  submittedTime: DS.attr('number'),

  progress: DS.attr('number'),

  isComplete: function () {
    var status = this.get('status');
    return status == 'FINISHED' || status == 'FAILED' || status == 'KILLED';
  }.property('status')
});

App.Task = App.AbstractEntity.extend({
  status: DS.attr('string'),

  index: function () {
    var id = this.get('id'),
        idPrefix = 'task_%@_'.fmt(this.get('dagID').substr(4));
    return id.indexOf(idPrefix) == 0 ? id.substr(idPrefix.length) : id;
  }.property('id'),

  dagID: DS.attr('string'),

  progress: DS.attr('number'),

  successfulAttemptId: DS.attr('string'),

  attempts: DS.attr('array'),

  vertex: DS.belongsTo('vertex'),
  vertexID: DS.attr('string'),

  tezApp: DS.belongsTo('tezApp'),

  startTime: DS.attr('number'),

  endTime: DS.attr('number'),

  duration: function () {
    return App.Helpers.date.duration(this.get('startTime'), this.get('endTime'))
  }.property('startTime', 'endTime'),

  diagnostics: DS.attr('string'),

  numAttempts: DS.attr('number'),

  pivotAttempt: DS.belongsTo('taskAttempt'),

  counterGroups: DS.attr('array'), // Serialize when required
  numFailedTaskAttempts: DS.attr('number'),
  hasFailedTaskAttempts: function() {
    var numAttempts = this.get('numFailedTaskAttempts') || 0;
    return numAttempts > 1;
  }.property('numFailedTaskAttempts')
});
App.DagTask = App.Task.extend({});
App.VertexTask = App.Task.extend({});

App.DagProgress = DS.Model.extend({
  progress: DS.attr('number'),
  appId: DS.attr('string'),
  dagIdx: DS.attr('number')
});

App.VertexProgress = DS.Model.extend({
  progress: DS.attr('number'),
  appId: DS.attr('string'),
  dagIdx: DS.attr('string')
});

App.DagInfo = DS.Model.extend({
  // we need appId and dagIdx as they are used for querying with AM
  appId: function() {
    return App.Helpers.misc.getAppIdFromDagId(this.get('id'));
  }.property('id'),
  dagIdx: function() {
    return App.Helpers.misc.getDagIndexFromDagId(this.get('id'));
  }.property('id'),

  progress: DS.attr('number'),
  status: DS.attr('string'),
  counters: DS.attr('object')
});

App.VertexInfo = DS.Model.extend({
  // we need appId and dagIdx as they are used for querying with AM
  appId: function() {
    return App.Helpers.misc.getAppIdFromDagId(this.get('id'));
  }.property('id'),
  dagIdx: function() {
    return App.Helpers.misc.getDagIndexFromDagId(this.get('id'));
  }.property('id'),

  progress: DS.attr('number'),
  status: DS.attr('string'),
  numTasks: DS.attr('number'),
  runningTasks: DS.attr('number'),
  sucessfulTasks: DS.attr('number'),
  failedTaskAttempts: DS.attr('number'),
  killedTaskAttempts: DS.attr('number'),

  pendingTasks: function() {
    return this.get('numTasks') - this.get('runningTasks') - this.get('sucessfulTasks');
  }.property('numTasks', 'runningTasks', 'sucessfulTasks'),

  counters: DS.attr('object')
});

App.TaskInfo = DS.Model.extend({
  progress: DS.attr('number'),
  status: DS.attr('string'),
  counters: DS.attr('object')
});

App.AttemptInfo = DS.Model.extend({
  progress: DS.attr('number'),
  status: DS.attr('string'),
  counters: DS.attr('object')
});

App.KVDatum = DS.Model.extend({
  key: DS.attr('string'),
  value: DS.attr('string'),
});

App.HiveQuery = DS.Model.extend({
  query: DS.attr('string')
});

App.VertexState = {
  NEW: "NEW",
  INITIALIZING: "INITIALIZING",
  INITED: "INITED",
  RUNNING: "RUNNING",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
  KILLED: "KILLED",
  ERROR: "ERROR",
  TERMINATING: "TERMINATING",
  JOBFAILED: "JOB FAILED"
};

App.VertexType = {
  MAP: 'MAP',
  REDUCE: 'REDUCE',
  UNION: 'UNION'
};

App.EdgeType = {
  SCATTER_GATHER: "SCATTER_GATHER",
  BROADCAST: "BROADCAST",
  CONTAINS: "CONTAINS"
};


})();

(function() {

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

App.TaskAttempt = App.AbstractEntity.extend({
  index: function () {
    var id = this.get('id'),
        idPrefix = 'attempt_%@_'.fmt(this.get('dagID').substr(4));
    return id.indexOf(idPrefix) == 0 ? id.substr(idPrefix.length) : id;
  }.property('id'),

  progress: DS.attr('number'),

  // start time of the entity
  startTime: DS.attr('number'),

  // end time of the entity
  endTime: DS.attr('number'),

  duration: function () {
    return App.Helpers.date.duration(this.get('startTime'), this.get('endTime'))
  }.property('startTime', 'endTime'),

  entityType: App.EntityType.TASK_ATTEMPT,

  // container
  containerId: DS.attr('string'),
  nodeId: DS.attr('string'),

  // status of the task attempt
  status: DS.attr('string'),

  task: DS.belongsTo('task'),
  taskID: DS.attr('string'),
  vertexID: DS.attr('string'),
  dagID: DS.attr('string'),

  inProgressLog: DS.attr('string'),
  completedLog: DS.attr('string'),

  diagnostics: DS.attr('string'),

  counterGroups: DS.attr('array'),
});
App.DagTaskAttempt = App.TaskAttempt.extend({});
App.VertexTaskAttempt = App.TaskAttempt.extend({});
App.TaskTaskAttempt = App.TaskAttempt.extend({});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.BaseController = Em.ObjectController.extend({
  controllerName: null, // Must be set by the respective controllers

  isActive: false,

  setup: function () {
    this.set('isActive', true);
  },
  reset: function () {
    this.set('isActive', false);
  },

  getStoreKey: function (subKey) {
    return "%@:%@".fmt(this.get('controllerName'), subKey);
  },
  storeConfig: function (key, value) {
    try {
      localStorage.setItem(this.getStoreKey(key) , JSON.stringify(value));
    }catch(e){
      return e;
    }
    return value;
  },
  fetchConfig: function (key) {
    try {
      return JSON.parse(localStorage.getItem(this.getStoreKey(key)));
    }catch(e){}
    return undefined;
  },

});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var DEFAULT_MERGE_PROPS = ['status', 'progress'];

App.PollingController = App.BaseController.extend({

  pollster: null,
  pollingEnabled: null,
  showAutoUpdate: true,

  persistConfigs: true,

  pollingType: null,
  pollingOptions: null,

  init: function () {
    var pollingEnabled;

    this._super();
    this.set('pollster', App.Helpers.EntityArrayPollster.create({
      store: this.get('store'),

      mergeProperties: DEFAULT_MERGE_PROPS,
      entityType: this.get('pollingType'),
      options: this.get('pollingOptions'),

      onFailure: this.onPollingFailure.bind(this)
    }));

    if(this.get('persistConfigs')) {
      pollingEnabled = this.fetchConfig('pollingEnabled');
      if(pollingEnabled == undefined) {
        pollingEnabled = true;
      }
      Ember.run.later(this, this.set, 'pollingEnabled', pollingEnabled, 100);
    }
  },

  setup: function () {
    this._super();
    Ember.run.later(this, this.send, 'pollingEnabledChanged', this.get('pollingEnabled'));
  },

  pollingEnabledObserver: function () {
    var pollingEnabled = this.get('pollingEnabled');

    if(this.get('persistConfigs')) {
      this.storeConfig('pollingEnabled', pollingEnabled);
    }

    this.send('pollingEnabledChanged', pollingEnabled);

    if(!pollingEnabled && this.get('pollster.isRunning')) {
      this.get('pollster').stop();
      this.set('pollster.polledRecords', null);
      this.applicationComplete();
    }
  }.observes('pollingEnabled'),

  onPollingFailure: function (error) {
    var appID = this.get('pollster.options.appID'),
        that = this;

    App.Helpers.misc.removeRecord(this.get('store'), 'clusterApp', appID);
    this.get('store').find('clusterApp', appID).then(function (app) {
      if(app.get('isComplete')) {
        that.get('pollster').stop();
        that.applicationComplete();
      }
      else {
        error.message = "Application Master (AM) is out of reach. Either it's down, or CORS is not enabled for YARN ResourceManager.";
        that.applicationFailed(error);
      }
    }).catch(function (error) {
      that.get('pollster').stop();
      error.message = "Resource Manager (RM) is out of reach. Either it's down, or CORS is not enabled.";
      that.applicationFailed(error);
    });
  },

  applicationComplete: function () {
    this.get('pollster').stop();
    this.set('pollster.polledRecords', null);
    if(this.load) {
      this.load();
    }
  },

  applicationFailed: function (error) {
    // TODO: TEZ-2877 - #1
    Em.Logger.error(error);
    var err = App.Helpers.misc.formatError(error, error.message);
    var msg = 'Error code: %@, message: %@'.fmt(err.errCode, err.msg);
    App.Helpers.ErrorBar.getInstance().show(msg, err.details);
  }

});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.TablePageController = App.PollingController.extend(
    App.DataArrayLoaderMixin,
    App.ColumnSelectorMixin, {
      queryParams: ['pageNum', 'rowCount', 'searchText', 'sortColumnId', 'sortOrder'],

      sortColumnId: '',
      sortOrder: '',

      pageNum: 1,
      rowCount: 25,

      searchText: '',
      rowsDisplayed: [],

      isRefreshable: true,

      parentStatus: null,

      rowsDisplayedObserver: function () {
        this.set('pollster.targetRecords', this.get('rowsDisplayed'));
      }.observes('rowsDisplayed', 'pollster'),

      parentStatusObserver: function () {
        var parentStatus = this.get('status'),
            previousStatus = this.get('parentStatus');

        if(parentStatus != previousStatus && previousStatus == 'RUNNING' && this.get('pollingEnabled')) {
          this.get('pollster').stop();
          this.loadData(true);
        }
        this.set('parentStatus', parentStatus);
      }.observes('status'),

      applicationComplete: function () {
        this.set('pollster.polledRecords', null);
        this.loadData(true);
      },

      statusMessage: function () {
        return this.get('loading') ? "Loading all records..." : null;
      }.property('loading'),

      onInProgressColumnSort: function (columnDef) {
        var inProgress = this.get('pollster.isRunning');
        if(inProgress) {
          App.Helpers.Dialogs.alert(
            'Cannot sort',
            'Sorting on %@ is disabled for running DAGs!'.fmt(columnDef.get('headerCellName')),
            this
          );
        }
        return !inProgress;
      },

      actions: {
        refresh: function () {
          this.loadData(true);
        },
        tableRowsChanged: function (rows) {
          this.set('rowsDisplayed', rows);
        }
      }
    }
);


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.DagTaskAttemptsController = App.TablePageController.extend({

  controllerName: 'DagTaskAttemptsController',
  needs: "dag",

  entityType: 'dagTaskAttempt',
  filterEntityType: 'dag',
  filterEntityId: Ember.computed.alias('controllers.dag.id'),

  cacheDomain: Ember.computed.alias('controllers.dag.id'),

  pollingType: 'attemptInfo',

  pollsterControl: function () {
    if(this.get('status') == 'RUNNING' &&
        this.get('amWebServiceVersion') != '1' &&
        !this.get('loading') &&
        this.get('isActive') &&
        this.get('pollingEnabled') &&
        this. get('rowsDisplayed.length') > 0) {
      this.get('pollster').start();
    }
    else {
      this.get('pollster').stop();
    }
  }.observes('status', 'amWebServiceVersion', 'rowsDisplayed', 'loading', 'isActive', 'pollingEnabled'),

  pollsterOptionsObserver: function () {
    this.set('pollster.options', {
      appID: this.get('applicationId'),
      dagID: this.get('idx'),
      counters: this.get('countersDisplayed'),
      attemptID: this.get('rowsDisplayed').map(function (row) {
          var attemptIndex = App.Helpers.misc.getIndexFromId(row.get('id')),
              taskIndex = App.Helpers.misc.getIndexFromId(row.get('taskID')),
              vertexIndex = App.Helpers.misc.getIndexFromId(row.get('vertexID'));
          return '%@_%@_%@'.fmt(vertexIndex, taskIndex, attemptIndex);
        }).join(',')
    });
  }.observes('applicationId', 'idx', 'rowsDisplayed'),

  countersDisplayed: function () {
    return App.Helpers.misc.getCounterQueryParam(this.get('columns'));
  }.property('columns'),

  beforeLoad: function () {
    var dagController = this.get('controllers.dag'),
        model = dagController.get('model');
    return model.reload().then(function () {
      return dagController.loadAdditional(model);
    });
  },

  afterLoad: function () {
    var data = this.get('data'),
        isUnsuccessfulDag = App.Helpers.misc.isStatusInUnsuccessful(
          this.get('controllers.dag.status')
        );

    data.forEach(function (attempt) {
      var attemptStatus = App.Helpers.misc
        .getFixedupDisplayStatus(attempt.get('status'));
      if (attemptStatus == 'RUNNING' && isUnsuccessfulDag) {
        attemptStatus = 'KILLED'
      }
      if (attemptStatus != attempt.get('status')) {
        attempt.set('status', attemptStatus);
      }
    });

    return this._super();
  },

  defaultColumnConfigs: function() {
    var that = this,
        vertexIdToNameMap = this.get('controllers.dag.vertexIdToNameMap') || {};
    return [
      {
        id: 'taskId',
        headerCellName: 'Task Index',
        templateName: 'components/basic-table/linked-cell',
        contentPath: 'taskID',
        getCellContent: function (row) {
          var taskId = row.get('taskID'),
              idPrefix = 'task_%@_'.fmt(row.get('dagID').substr(4));
          return {
            linkTo: 'task',
            entityId: taskId,
            displayText: taskId.indexOf(idPrefix) == 0 ? taskId.substr(idPrefix.length) : taskId
          };
        },
        getSearchValue: function (row) {
          var id = row.get('taskID'),
              idPrefix = 'task_%@_'.fmt(row.get('dagID').substr(4));
          return id.indexOf(idPrefix) == 0 ? id.substr(idPrefix.length) : id;
        }
      },
      {
        id: 'attemptNo',
        headerCellName: 'Attempt No',
        templateName: 'components/basic-table/linked-cell',
        contentPath: 'id',
        getCellContent: function(row) {
          var attemptID = row.get('id') || '';
          return {
            linkTo: 'taskAttempt',
            displayText: attemptID.split(/[_]+/).pop(),
            entityId: attemptID
          };
        },
        getSearchValue: function (row) {
          var attemptID = row.get('id') || '';
          return attemptID.split(/[_]+/).pop();
        },
        getSortValue: function (row) {
          var attemptID = row.get('id') || '';
          return attemptID.split(/[_]+/).pop();
        }
      },
      {
        id: 'status',
        headerCellName: 'Status',
        templateName: 'components/basic-table/status-cell',
        contentPath: 'status',
        observePath: true,
        onSort: this.onInProgressColumnSort.bind(this),
        getCellContent: function(row) {
          var status = App.Helpers.misc.getFixedupDisplayStatus(row.get('status'));
          return {
            status: status,
            statusIcon: App.Helpers.misc.getStatusClassForEntity(status)
          };
        }
      },
      {
        id: 'progress',
        headerCellName: 'Progress',
        contentPath: 'progress',
        observePath: true,
        onSort: this.onInProgressColumnSort.bind(this),
        templateName: 'components/basic-table/progress-cell'
      },
      {
        id: 'vertexName',
        headerCellName: 'Vertex Name',
        contentPath: 'vertexID',
        getCellContent: function(row) {
          var vertexId = row.get('vertexID');
          return vertexIdToNameMap[vertexId] || vertexId;
        },
        getSearchValue: function (row) {
          var vertexId = row.get('vertexID');
          return vertexIdToNameMap[vertexId] || vertexId;
        },
        getSortValue: function (row) {
          var vertexId = row.get('vertexID');
          return vertexIdToNameMap[vertexId] || vertexId;
        }
      },
      {
        id: 'startTime',
        headerCellName: 'Start Time',
        contentPath: 'startTime',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('startTime'));
        },
        getSearchValue: function(row) {
          return App.Helpers.date.dateFormat(row.get('startTime'));
        }
      },
      {
        id: 'endTime',
        headerCellName: 'End Time',
        contentPath: 'endTime',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('endTime'));
        },
        getSearchValue: function(row) {
          return App.Helpers.date.dateFormat(row.get('endTime'));
        },
      },
      {
        id: 'duration',
        headerCellName: 'Duration',
        contentPath: 'duration',
        getCellContent: function(row) {
          return App.Helpers.date.timingFormat(row.get('duration'), 1);
        },
        getSearchValue: function(row) {
          return App.Helpers.date.timingFormat(row.get('duration'), 1);
        },
      },
      {
        id: 'containerId',
        headerCellName: 'Container',
        contentPath: 'containerId'
      },
      {
        id: 'nodeId',
        headerCellName: 'Node',
        contentPath: 'nodeId'
      },
      {
        id: 'actions',
        headerCellName: 'Actions',
        templateName: 'components/basic-table/linked-cell',
        searchAndSortable: false,
        contentPath: 'id',
        getCellContent: function(row) {
          var attemptID = row.get('id') || '';
          return {
            linkTo: 'taskAttempt.counters',
            displayText: 'counters',
            entityId: attemptID
          };
        }
      },
      {
        id: 'logs',
        headerCellName: 'Logs',
        templateName: 'components/basic-table/logs-cell',
        searchAndSortable: false,
        getCellContent: function(row) {
          var cellContent = App.Helpers.misc.constructLogLinks(
                row,
                that.get('controllers.dag.yarnAppState'),
                that.get('controllers.dag.tezApp.user')
              );

          cellContent.notAvailable = cellContent.viewUrl || cellContent.downloadUrl;
          return cellContent;
        }
      }
    ];
  }.property(
    'controllers.dag.vertexIdToNameMap',
    'controllers.dag.yarnAppState',
    'controllers.dag.tezApp.user'
  ),

  columnConfigs: function() {
    return this.get('defaultColumnConfigs').concat(
      App.Helpers.misc.normalizeCounterConfigs(
        App.get('Configs.defaultCounters').concat(
          App.get('Configs.tables.entity.taskAttempt') || [],
          App.get('Configs.tables.sharedColumns') || []
        )
      , this)
    );
  }.property('defaultColumnConfigs'),

});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.DagViewController = App.TablePageController.extend({
  controllerName: 'DagViewController',
  needs: ["dag", "dagVertices"],

  entityType: 'dagVertex',
  filterEntityType: 'dag',
  filterEntityId: Ember.computed.alias('controllers.dag.id'),

  cacheDomain: Ember.computed.alias('controllers.dag.id'),

  showAutoUpdate: false,

  columnSelectorTitle: 'Customize vertex tooltip',

  beforeLoad: function () {
    var dagController = this.get('controllers.dag'),
        model = dagController.get('model');
    return model.reload().then(function () {
      return dagController.loadAdditional(model);
    });
  },

  afterLoad: function () {
    var data = this.get('data'),
        runningVerticesIdx,
        isUnsuccessfulDag = App.Helpers.misc.isStatusInUnsuccessful(
          this.get('controllers.dag.status')
        );

    if(isUnsuccessfulDag) {
      data.filterBy('status', 'RUNNING').forEach(function (vertex) {
        vertex.set('status', 'KILLED');
      });
    }

    return this._super();
  },

  redirect: function (details) {
    switch(details.type) {
      case 'vertex':
        this.transitionToRoute('vertex', details.d.get('data.id'));
      break;
      case 'task':
        this.transitionToRoute('vertex.tasks', details.d.get('data.id'));
      break;
      case 'io':
        this.transitionToRoute('vertex.additionals', details.d.get('data.id'));
      break;
      case 'input':
        this.transitionToRoute('input.configs', details.d.get('parent.data.id'), details.d.entity);
      break;
      case 'output':
        this.transitionToRoute('output.configs', details.d.get('vertex.data.id'), details.d.entity);
      break;
    }
  },

  actions: {
    modalConfirmed: function () {
      this.redirect(this.get('redirectionDetails'));
    },
    modalCanceled: function () {
    },
    entityClicked: function (details) {

      /**
       * In IE 11 under Windows 7, mouse events are not delivered to the page
       * anymore at all after a SVG use element that was under the mouse is
       * removed from the DOM in the event listener in response to a mouse click.
       * See https://connect.microsoft.com/IE/feedback/details/796745
       *
       * This condition and related actions must be removed once the bug is fixed
       * in all supported IE versions
       */
      if(App.env.isIE) {
        this.set('redirectionDetails', details);
        Bootstrap.ModalManager.confirm(
          this,
          'Confirmation Required!',
          'You will be redirected to %@ page'.fmt(
            details.type == "io" ? "additionals" : details.type
          )
        );
      }
      else {
        this.redirect(details);
      }
    }
  },

  defaultColumnConfigs: function() {
    return this.get('controllers.dagVertices.defaultColumnConfigs');
  }.property(),

  columnConfigs: function() {
    var configs = this.get('controllers.dagVertices.columnConfigs');
    return configs.filter(function (config) {
      return (config.contentPath) ||
          (config.getCellContent && config.searchAndSortable != false);
    });
  }.property(),

  viewData: function () {
    var vertices = this.get('controllers.dag.vertices') || [],
        entities = this.get('data') || [],
        finalVertex,
        dagStatus = this.get('controllers.dag.status'),
        needsStatusFixup = App.Helpers.misc.isStatusInUnsuccessful(dagStatus);

    entities = entities.reduce(function (obj, vertexData) {
      obj[vertexData.get('name')] = vertexData;
      return obj;
    }, {});

    vertices.forEach(function (vertex) {
      vertex.data = entities[vertex.vertexName];
      if (needsStatusFixup && vertex.data && vertex.data.get('status') == 'RUNNING') {
        vertex.data.set('status', 'KILLED');
      }
    });

    return {
      vertices: vertices,
      edges: this.get('controllers.dag.edges'),
      vertexGroups: this.get('controllers.dag.vertexGroups')
    };
  }.property('data', 'controllers.dag.vertices', 'controllers.dag')
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.DagController = App.PollingController.extend(App.Helpers.DisplayHelper, {
  controllerName: 'DagController',
  pageTitle: 'Dag',

  loading: true,

  pollingType: 'dagInfo',
  persistConfigs: false,

  pollsterControl: function () {
    if(this.get('status') == 'RUNNING' &&
        this.get('amWebServiceVersion') != '1' &&
        this.get('pollingEnabled') &&
        this.get('isActive')) {
      this.get('pollster').start();
    }
    else {
      this.get('pollster').stop();
    }
  }.observes('status', 'amWebServiceVersion', 'isActive', 'pollingEnabled'),

  pollsterOptionsObserver: function () {
    var model = this.get('model');

    this.get('pollster').setProperties( (model && model.get('status') != 'SUCCEEDED') ? {
      targetRecords: [model],
      options: {
        appID: this.get('applicationId'),
        dagID: App.Helpers.misc.getIndexFromId(this.get('id')),
      }
    } : {
      targetRecords: [],
      options: null
    });
  }.observes('applicationId', 'model', 'model.status', 'id'),

  loadAdditional: function(dag) {
    var that = this;
    var loaders = [];
    var applicationId = dag.get('applicationId');

    var appDetailLoader = App.Helpers.misc.loadApp(this.store, applicationId)
      .then(function(app){
        dag.set('appDetail', app);
        var status = app.get('status');
        if (status) {
          dag.set('yarnAppState', status);
        }
        dag.set('status', App.Helpers.misc.getRealStatus(dag.get('status'), app.get('status'), app.get('finalStatus')));
      }).catch(function(){});
    App.Helpers.misc.removeRecord(this.store, 'tezApp', 'tez_' + applicationId);
    var tezAppLoader = this.store.find('tezApp', 'tez_' + applicationId)
      .then(function(app){
        dag.set('tezApp', app);
      }).catch(function(){});

    loaders.push(appDetailLoader);
    loaders.push(tezAppLoader);

    Em.RSVP.allSettled(loaders).then(function(){
      that.set('loading', false);
    });

    if (!dag.get('appContextInfo.info') && App.get('env.compatibilityMode')) {
      var dagName = dag.getWithDefault('name', '');
      var hiveQueryId = dagName.replace(/([^:]*):.*/, '$1');
      if (dagName !=  hiveQueryId && !!hiveQueryId) {
        this.store.find('hiveQuery', hiveQueryId).then(function (hiveQueryData) {
          var queryInfoStr = Em.get(hiveQueryData || {}, 'query') || '{}';
          var queryInfo = $.parseJSON(queryInfoStr);
          dag.set('appContextInfo', {
            appType: 'Hive',
            info: queryInfo['queryText']
          });
        }).catch(function (e) {
          // ignore.
        });
      }
    }

    var allLoaders = Em.RSVP.all(loaders);
    allLoaders.then(function(){
      if (dag.get('status') === 'RUNNING') {
        // update the progress info if available. this need not block the UI
        if (dag.get('amWebServiceVersion') == '1' || !that.get('pollingEnabled')) {
          that.updateInfoFromAM(dag);
        }
      }
      else if(dag.get('status') == 'SUCCEEDED') {
        dag.set('progress', 1);
      }
    });

    return allLoaders;
  },

  // called only for v1 version of am api.
  updateInfoFromAM: function(dag) {
    var that = this;
    App.Helpers.misc.removeRecord(this.get('store'), 'dagProgress', dag.get('id'));
    var aminfoLoader = this.store.find('dagProgress', dag.get('id'), {
      appId: dag.get('applicationId'),
      dagIdx: dag.get('idx')
    }).then(function(dagProgressInfo) {
      that.set('progress', dagProgressInfo.get('progress'));
    }).catch(function (error) {
      error.message = "Failed to fetch dagProgress. Application Master (AM) is out of reach. Either it's down, or CORS is not enabled for YARN ResourceManager.";
      Em.Logger.error(error);
      var err = App.Helpers.misc.formatError(error);
      var msg = 'Error code: %@, message: %@'.fmt(err.errCode, err.msg);
      App.Helpers.ErrorBar.getInstance().show(msg, err.details);
    });
  },

  enableAppIdLink: function() {
    return !!this.get('tezApp');
  }.property('applicationId', 'tezApp'),

  childDisplayViews: [
    Ember.Object.create({title: 'DAG Details', linkTo: 'dag.index'}),
    Ember.Object.create({title: 'DAG Counters', linkTo: 'dag.counters'}),
    Ember.Object.create({title: 'Graphical View', linkTo: 'dag.view'}),
    Ember.Object.create({title: 'All Vertices', linkTo: 'dag.vertices'}),
    Ember.Object.create({title: 'All Tasks', linkTo: 'dag.tasks'}),
    Ember.Object.create({title: 'All TaskAttempts', linkTo: 'dag.taskAttempts'}),
    //See BUG-36811 Ember.Object.create({title: 'Swimlane', linkTo: 'dag.swimlane'})
  ],

});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.DagCountersController = App.PollingController.extend(App.Helpers.DisplayHelper, App.ModelRefreshMixin, {
  controllerName: 'DagCountersController',

  pollingType: 'dagInfo',

  pollsterControl: function () {
    if(this.get('status') == 'RUNNING' &&
        this.get('amWebServiceVersion') != '1' &&
        this.get('pollingEnabled') &&
        this.get('isActive')) {
      this.get('pollster').start();
    }
    else {
      this.get('pollster').stop();
    }
  }.observes('status', 'amWebServiceVersion', 'isActive', 'pollingEnabled'),

  pollsterOptionsObserver: function () {
    var model = this.get('model');

    this.get('pollster').setProperties( (model && model.get('status') != 'SUCCEEDED') ? {
      targetRecords: [model],
      options: {
        appID: this.get('applicationId'),
        dagID: App.Helpers.misc.getIndexFromId(this.get('id')),
        counters: '*'
      }
    } : {
      targetRecords: [],
      options: null
    });
  }.observes('applicationId', 'model', 'model.status', 'id'),

  applicationComplete: function () {
    this.get('pollster').stop();
    this.set('pollster.polledRecords', null);
  }
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.DagIndexController = App.TablePageController.extend({
  controllerName: 'DagIndexController',
  needs: "dag",

  entityType: 'dagVertex',
  filterEntityType: 'dag',
  filterEntityId: Ember.computed.alias('controllers.dag.id'),

  cacheDomain: Ember.computed.alias('controllers.dag.id'),

  pollingType: 'vertexInfo',

  _isRunning: false,
  _autoReloaded: false,

  init: function () {
    this._super();
    this.set('pollster.mergeProperties', ['progress', 'status', 'runningTasks', 'pendingTasks',
      'sucessfulTasks', 'failedTaskAttempts', 'killedTaskAttempts']);
  },

  reset: function () {
    this._super();
    this.set('data', null);
    this.set('_autoReloaded', false);
  },

  _statusObserver: function () {
    var rowsDisplayed,
        isRunning = false;

    if(this.get('status') == 'RUNNING') {
      isRunning = true;
    }
    else if(rowsDisplayed = this.get('rowsDisplayed')){
      rowsDisplayed.forEach(function (row) {
        if(row.get('status') == 'RUNNING') {
          isRunning = true;
        }
      });
    }

    this.set('_isRunning', isRunning);
  }.observes('status', 'rowsDisplayed.@each.status'),

  pollingObserver: function () {
    if(this.get('pollingEnabled')) {
      this.set('_autoReloaded', false);
    }
  }.observes('pollingEnabled'),

  pollsterControl: function () {
    if(this.get('_isRunning') &&
        this.get('amWebServiceVersion') != '1' &&
        !this.get('loading') &&
        this.get('isActive') &&
        this.get('pollingEnabled') &&
        this.get('rowsDisplayed.length') > 0) {
      this.get('pollster').start(!this.get('_autoReloaded'));
    }
    else {
      this.get('pollster').stop();
    }
  }.observes('_isRunning', 'amWebServiceVersion', 'loading', 'isActive', 'pollingEnabled', 'rowsDisplayed'),

  parentStatusObserver: function () {
    var parentStatus = this.get('status'),
        previousStatus = this.get('parentStatus');

    if(parentStatus != previousStatus && previousStatus == 'RUNNING' && this.get('pollingEnabled')) {
      this.get('pollster').stop();
      this.set('_autoReloaded', true);
      this.loadData(true);
    }
    this.set('parentStatus', parentStatus);
  }.observes('status'),

  applicationComplete: function () {
    this.set('_autoReloaded', true);
    this._super();
    if(this.get('controllers.dag.status') == 'SUCCEEDED') {
      this.set('controllers.dag.progress', 1);
    }
  },

  pollsterOptionsObserver: function () {
    this.set('pollster.options', {
      appID: this.get('applicationId'),
      dagID: this.get('idx')
    });
  }.observes('applicationId', 'idx').on('init'),

  progressDetails: null,

  progressObserver: function () {
    var vertexInfoContent = this.get('pollster.polledRecords.content'),
        progressDetails = null,
        succeededTasks = null,
        totalTasks = null,
        completedVertices = null;

    if(vertexInfoContent && vertexInfoContent.length) {
      liveData = vertexInfoContent,
      succeededTasks = 0,
      totalTasks = 0,
      completedVertices = 0;

      liveData.forEach(function (vertex) {
        succeededTasks += parseInt(vertex.get('sucessfulTasks'));
        totalTasks += parseInt(vertex.get('numTasks'));
        if(vertex.get('progress') >= 1) {
          completedVertices++;
        }
      });

      progressDetails = {
        succeededTasks: succeededTasks,
        completedVertices: completedVertices,
        totalTasks: totalTasks
      };
    }

    this.set('progressDetails', progressDetails);
  }.observes('pollster.polledRecords'),

  dataObserver: function () {
    var data = this.get('data.content');
    this.set('rowsDisplayed', data ? data.slice(0) : null);
  }.observes('data'),

  beforeLoad: function () {
    var dagController = this.get('controllers.dag'),
        model = dagController.get('model');
    return model.reload().then(function () {
      return dagController.loadAdditional(model);
    });
  },

  afterLoad: function () {
    var data = this.get('data'),
        runningVerticesIdx,
        isUnsuccessfulDag = App.Helpers.misc.isStatusInUnsuccessful(
          this.get('controllers.dag.status')
        );

    if(isUnsuccessfulDag) {
      data.filterBy('status', 'RUNNING').forEach(function (vertex) {
        vertex.set('status', 'KILLED');
      });
    }

    if (this.get('controllers.dag.amWebServiceVersion') == '1') {
      this._loadProgress(data);
    }

    return this._super();
  },

  // Load progress in parallel for v1 version of the api
  _loadProgress: function (vertices) {
    var that = this,
        runningVerticesIdx = vertices
      .filterBy('status', 'RUNNING')
      .map(function(item) {
        return item.get('id').split('_').splice(-1).pop();
      });

    if (runningVerticesIdx.length > 0) {
      this.store.unloadAll('vertexProgress');
      this.store.findQuery('vertexProgress', {
        metadata: {
          appId: that.get('applicationId'),
          dagIdx: that.get('idx'),
          vertexIds: runningVerticesIdx.join(',')
        }
      }).then(function(vertexProgressInfo) {
          App.Helpers.emData.mergeRecords(
            that.get('rowsDisplayed'),
            vertexProgressInfo,
            ['progress']
          );
      }).catch(function(error) {
        error.message = "Failed to fetch vertexProgress. Application Master (AM) is out of reach. Either it's down, or CORS is not enabled for YARN ResourceManager.";
        Em.Logger.error(error);
        var err = App.Helpers.misc.formatError(error);
        var msg = 'Error code: %@, message: %@'.fmt(err.errCode, err.msg);
        App.Helpers.ErrorBar.getInstance().show(msg, err.details);
      });
    }
  },

  defaultColumnConfigs: function() {
    var vertexIdToNameMap = this.get('vertexIdToNameMap');

    return App.Helpers.misc.createColumnDescription([
      {
        id: 'vertexName',
        headerCellName: 'Vertex Name',
        templateName: 'components/basic-table/linked-cell',
        contentPath: 'name',
        getCellContent: function(row) {
          return {
            linkTo: 'vertex',
            entityId: row.get('id'),
            displayText: vertexIdToNameMap[row.get('id')]
          };
        }
      },
      {
        id: 'status',
        headerCellName: 'Status',
        templateName: 'components/basic-table/status-cell',
        contentPath: 'status',
        observePath: true,
        getCellContent: function(row) {
          var status = row.get('status');
          return {
            status: status,
            statusIcon: App.Helpers.misc.getStatusClassForEntity(status,
              row.get('hasFailedTaskAttempts'))
          };
        }
      },
      {
        id: 'progress',
        headerCellName: 'Progress',
        contentPath: 'progress',
        observePath: true,
        templateName: 'components/basic-table/progress-cell'
      },
      {
        id: 'totalTasks',
        headerCellName: 'Total Tasks',
        contentPath: 'numTasks',
        observePath: true,
      },
      {
        id: 'succeededTasks',
        headerCellName: 'Succeeded Tasks',
        contentPath: 'sucessfulTasks',
        observePath: true,
      },
      {
        id: 'runningTasks',
        headerCellName: 'Running Tasks',
        contentPath: 'runningTasks',
        observePath: true,
      },
      {
        id: 'pendingTasks',
        headerCellName: 'Pending Tasks',
        contentPath: 'pendingTasks',
        observePath: true,
      },
      {
        id: 'failedTasks',
        headerCellName: 'Failed Task Attempts',
        contentPath: 'failedTaskAttempts',
        observePath: true,
      },
      {
        id: 'killedTasks',
        headerCellName: 'Killed Task Attempts',
        contentPath: 'killedTaskAttempts',
        observePath: true,
      }
    ]);
  }.property('vertexIdToNameMap'),

  actions: {
    downloadDagJson: function() {
      var dagID = this.get('id');
      var downloader = App.Helpers.misc.downloadDAG(this.get('id'), {
        batchSize: 500,
        onSuccess: function() {
          Bootstrap.ModalManager.close('downloadModal');
        },
        onFailure: function() {
          $('#modalMessage').html('<i class="fa fa-lg fa-exclamation-circle margin-small-horizontal" ' +
          'style="color:red"></i>&nbsp;Error downloading data');
        }
      });
      this.set('tmpDownloader', downloader);
      var modalDialogView = Ember.View.extend({
        template: Em.Handlebars.compile(
          '<p id="modalMessage"><i class="fa fa-lg fa-spinner fa-spin margin-small-horizontal" ' +
          'style="color:green"></i>Downloading data for dag %@</p>'.fmt(dagID)
        )
      });
      var buttons = [
        Ember.Object.create({title: 'Cancel', dismiss: 'modal', clicked: 'cancelDownload'})
      ];
      Bootstrap.ModalManager.open('downloadModal', 'Download data',
        modalDialogView, buttons, this);
    },

    cancelDownload: function() {
      var currentDownloader = this.get('tmpDownloader');
      if (!!currentDownloader) {
        currentDownloader.cancel();
      }
      this.set('tmpDownloader', undefined);
    }
  },

  dagRunning: function () {
    var progress = this.get('dagProgress');
    return progress != null && progress < 1;
  }.property('dagProgress'),

  taskIconStatus: function() {
    return App.Helpers.misc.getStatusClassForEntity(this.get('model.status'),
      this.get('hasFailedTaskAttempts'));
  }.property('id', 'model.status', 'hasFailedTaskAttempts'),

  progressStr: function() {
    var pct;
    if (Ember.typeOf(this.get('progress')) === 'number' && this.get('status') == 'RUNNING') {
      pct = App.Helpers.number.fractionToPercentage(this.get('progress'));
    }
    return pct;
  }.property('id', 'status', 'progress'),

  totalTasks: function() {
    return App.Helpers.misc.getCounterValueForDag(this.get('counterGroups'),
      this.get('id'), 'org.apache.tez.common.counters.DAGCounter', 'TOTAL_LAUNCHED_TASKS')
  }.property('id', 'counterGroups'),

  sucessfulTasks: function() {
    return App.Helpers.misc.getCounterValueForDag(this.get('counterGroups'), this.get('id'),
      'org.apache.tez.common.counters.DAGCounter', 'NUM_SUCCEEDED_TASKS')
  }.property('id', 'counterGroups'),

  failedTasks: function() {
    return App.Helpers.misc.getCounterValueForDag(this.get('counterGroups'), this.get('id'),
      'org.apache.tez.common.counters.DAGCounter', 'NUM_FAILED_TASKS')
  }.property('id', 'counterGroups'),

  killedTasks: function() {
    return App.Helpers.misc.getCounterValueForDag(this.get('counterGroups'), this.get('id'),
      'org.apache.tez.common.counters.DAGCounter', 'NUM_KILLED_TASKS')
  }.property('id', 'counterGroups'),

  failedTasksLink: function() {
    return '#/dag/%@/tasks?searchText=Status%3AFAILED'.fmt(this.get('id'));
  }.property('id'),

  failedTaskAttemptsLink: function() {
    return '#/dag/%@/taskAttempts?searchText=Status%3AFAILED'.fmt(this.get('id'));
  }.property('id'),

  appContext: function() {
    return this.get('appContextInfo.info')
  }.property('appContextInfo.info'),

  appContextHeading: function() {
    var appContextType = this.get('appContextInfo.appType');
    return 'Additional Info' + (!!appContextType ? ' from ' + appContextType : '');
  }.property('appContextInfo.appType'),

  appInfoContextType: function() {
    switch (this.get('appContextInfo.appType')) {
      case 'Hive':
        return 'text/x-hive';
      case 'Pig':
        return 'text/x-pig';
      default:
        return 'text/x-sql';
    }
  }.property('appContextInfo.appType'),

});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.DagSwimlaneController = Em.ArrayController.extend({
  needs: "dag",
  controllerName: "DagSwimlaneController",
  pageTitle: "Task Attempts",
  pageSubTitle: "All Task Attempts",
  dag_id: Em.computed.alias('controllers.dag.id'),

  getFilterParams: function(params) {
    var dag_id = this.get('dag_id');
    var filterParams = {};
    if (dag_id) {
      filterParams['primaryFilter'] = 'TEZ_DAG_ID:' + dag_id;
    }

    return filterParams;
  },

  actions: {
    taskAttemptClicked: function (id) {
      this.transitionToRoute('taskAttempt', id);
    },
  },
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.DagTasksController = App.TablePageController.extend({
  controllerName: 'DagTasksController',
  needs: "dag",

  entityType: 'dagTask',
  filterEntityType: 'dag',
  filterEntityId: Ember.computed.alias('controllers.dag.id'),

  cacheDomain: Ember.computed.alias('controllers.dag.id'),

  pollingType: 'taskInfo',

  pollsterControl: function () {
    if(this.get('status') == 'RUNNING' &&
        this.get('amWebServiceVersion') != '1' &&
        !this.get('loading') &&
        this.get('isActive') &&
        this.get('pollingEnabled') &&
        this. get('rowsDisplayed.length') > 0) {
      this.get('pollster').start();
    }
    else {
      this.get('pollster').stop();
    }
  }.observes('status', 'amWebServiceVersion', 'rowsDisplayed', 'loading', 'isActive', 'pollingEnabled'),

  pollsterOptionsObserver: function () {
    this.set('pollster.options', {
      appID: this.get('applicationId'),
      dagID: this.get('idx'),
      counters: this.get('countersDisplayed'),
      taskID: this.get('rowsDisplayed').map(function (row) {
          var taskIndex = App.Helpers.misc.getIndexFromId(row.get('id')),
          vertexIndex = App.Helpers.misc.getIndexFromId(row.get('vertexID'));
          return '%@_%@'.fmt(vertexIndex, taskIndex);
        }).join(',')
    });
  }.observes('applicationId', 'idx', 'rowsDisplayed'),

  countersDisplayed: function () {
    return App.Helpers.misc.getCounterQueryParam(this.get('columns'));
  }.property('columns'),

  beforeLoad: function () {
    var dagController = this.get('controllers.dag'),
        model = dagController.get('model');
    return model.reload().then(function () {
      return dagController.loadAdditional(model);
    });
  },

  afterLoad: function () {
    var data = this.get('data'),
        isUnsuccessfulDag = App.Helpers.misc.isStatusInUnsuccessful(
          this.get('controllers.dag.status')
        );

    data.forEach(function (task) {
      var taskStatus = App.Helpers.misc.getFixedupDisplayStatus(task.get('status'));

      if (taskStatus == 'RUNNING' && isUnsuccessfulDag) {
        taskStatus = 'KILLED'
      }
      if (taskStatus != task.get('status')) {
        task.set('status', taskStatus);
      }
    });

    return this._super();
  },

  defaultColumnConfigs: function() {
    var that = this,
        vertexIdToNameMap = this.get('controllers.dag.vertexIdToNameMap') || {};

    function getLogContent(attempt) {
      var cellContent = App.Helpers.misc.constructLogLinks(
            attempt,
            that.get('controllers.dag.yarnAppState'),
            that.get('controllers.dag.tezApp.user')
          );

      cellContent.notAvailable = cellContent.viewUrl || cellContent.downloadUrl;
      return cellContent;
    }

    return [
      {
        id: 'id',
        headerCellName: 'Task Index',
        templateName: 'components/basic-table/linked-cell',
        contentPath: 'id',
        getCellContent: function (row) {
          var id = row.get('id'),
              idPrefix = 'task_%@_'.fmt(row.get('dagID').substr(4));
          return {
            linkTo: 'task',
            entityId: id,
            displayText: id.indexOf(idPrefix) == 0 ? id.substr(idPrefix.length) : id
          };
        },
        getSearchValue: function (row) {
          var id = row.get('id'),
              idPrefix = 'task_%@_'.fmt(row.get('dagID').substr(4));
          return id.indexOf(idPrefix) == 0 ? id.substr(idPrefix.length) : id;
        }
      },
      {
        id: 'vertexName',
        headerCellName: 'Vertex Name',
        contentPath: 'vertexID',
        getCellContent: function(row) {
          var vertexId = row.get('vertexID');
          return vertexIdToNameMap[vertexId] || vertexId;
        },
        getSearchValue: function(row) {
          var vertexId = row.get('vertexID');
          return vertexIdToNameMap[vertexId] || vertexId;
        },
        getSortValue: function(row) {
          var vertexId = row.get('vertexID');
          return vertexIdToNameMap[vertexId] || vertexId;
        }
      },
      {
        id: 'status',
        headerCellName: 'Status',
        templateName: 'components/basic-table/status-cell',
        contentPath: 'status',
        observePath: true,
        onSort: this.onInProgressColumnSort.bind(this),
        getCellContent: function(row) {
          var status = row.get('status');
          return {
            status: status,
            statusIcon: App.Helpers.misc.getStatusClassForEntity(status,
              row.get('hasFailedTaskAttempts'))
          };
        }
      },
      {
        id: 'progress',
        headerCellName: 'Progress',
        contentPath: 'progress',
        observePath: true,
        onSort: this.onInProgressColumnSort.bind(this),
        templateName: 'components/basic-table/progress-cell'
      },
      {
        id: 'startTime',
        headerCellName: 'Start Time',
        contentPath: 'startTime',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('startTime'));
        },
        getSearchValue: function(row) {
          return App.Helpers.date.dateFormat(row.get('startTime'));
        }
      },
      {
        id: 'endTime',
        headerCellName: 'End Time',
        contentPath: 'endTime',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('endTime'));
        },
        getSearchValue: function(row) {
          return App.Helpers.date.dateFormat(row.get('endTime'));
        },
      },
      {
        id: 'duration',
        headerCellName: 'Duration',
        contentPath: 'duration',
        getCellContent: function(row) {
          return App.Helpers.date.timingFormat(row.get('duration'), 1);
        },
        getSearchValue: function(row) {
          return App.Helpers.date.timingFormat(row.get('duration'), 1);
        },
      },
      {
        id: 'actions',
        headerCellName: 'Actions',
        templateName: 'components/basic-table/task-actions-cell',
        contentPath: 'id',
        searchAndSortable: false
      },
      {
        id: 'logs',
        headerCellName: 'Logs',
        templateName: 'components/basic-table/logs-cell',
        searchAndSortable: false,
        getCellContent: function(row) {
          var taskAttemptId = row.get('successfulAttemptId') || row.get('attempts.lastObject'),
              store = that.get('store');

          if (taskAttemptId) {
            return store.find('taskAttempt', taskAttemptId).then(getLogContent);
          }
        }
      }
    ];
  }.property(
    'controllers.dag.vertexIdToNameMap',
    'controllers.dag.yarnAppState',
    'controllers.dag.tezApp.user'
  ),

  columnConfigs: function() {
    return this.get('defaultColumnConfigs').concat(
      App.Helpers.misc.normalizeCounterConfigs(
        App.get('Configs.defaultCounters').concat(
          App.get('Configs.tables.entity.task') || [],
          App.get('Configs.tables.sharedColumns') || []
        )
      , this)
    );
  }.property('defaultColumnConfigs'),

});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.DagVerticesController = App.TablePageController.extend({
  controllerName: 'DagVerticesController',
  needs: "dag",

  entityType: 'dagVertex',
  filterEntityType: 'dag',
  filterEntityId: Ember.computed.alias('controllers.dag.id'),

  cacheDomain: Ember.computed.alias('controllers.dag.id'),

  pollingType: 'vertexInfo',

  pollsterControl: function () {

    if(this.get('status') == 'RUNNING' &&
        this.get('amWebServiceVersion') != '1' &&
        !this.get('loading') &&
        this.get('isActive') &&
        this.get('pollingEnabled') &&
        this. get('rowsDisplayed.length') > 0) {
      this.get('pollster').start();
    }
    else {
      this.get('pollster').stop();
    }
  }.observes('status', 'amWebServiceVersion', 'rowsDisplayed', 'loading', 'isActive', 'pollingEnabled'),

  pollsterOptionsObserver: function () {
    this.set('pollster.options', {
      appID: this.get('applicationId'),
      dagID: this.get('idx'),
      counters: this.get('countersDisplayed'),
      vertexID: this.get('rowsDisplayed').map(function (row) {
          return App.Helpers.misc.getIndexFromId(row.get('id'));
        }).join(',')
    });
  }.observes('applicationId', 'idx', 'rowsDisplayed'),

  countersDisplayed: function () {
    return App.Helpers.misc.getCounterQueryParam(this.get('columns'));
  }.property('columns'),

  beforeLoad: function () {
    var dagController = this.get('controllers.dag'),
        model = dagController.get('model');
    return model.reload().then(function () {
      return dagController.loadAdditional(model);
    });
  },

  afterLoad: function () {
    var data = this.get('data'),
        runningVerticesIdx,
        isUnsuccessfulDag = App.Helpers.misc.isStatusInUnsuccessful(
          this.get('controllers.dag.status')
        );

    if(isUnsuccessfulDag) {
      data.filterBy('status', 'RUNNING').forEach(function (vertex) {
        vertex.set('status', 'KILLED');
      });
    }

    if (this.get('controllers.dag.amWebServiceVersion') == '1') {
      this._loadProgress(data);
    }

    return this._super();
  },

  // Load progress in parallel for v1 version of the api
  _loadProgress: function (vertices) {
    var that = this,
        runningVerticesIdx = vertices
      .filterBy('status', 'RUNNING')
      .map(function(item) {
        return item.get('id').split('_').splice(-1).pop();
      });

    if (runningVerticesIdx.length > 0) {
      this.store.unloadAll('vertexProgress');
      this.store.findQuery('vertexProgress', {
        metadata: {
          appId: that.get('applicationId'),
          dagIdx: that.get('idx'),
          vertexIds: runningVerticesIdx.join(',')
        }
      }).then(function(vertexProgressInfo) {
          App.Helpers.emData.mergeRecords(
            that.get('rowsDisplayed'),
            vertexProgressInfo,
            ['progress']
          );
      }).catch(function(error) {
        error.message = "Failed to fetch vertexProgress. Application Master (AM) is out of reach. Either it's down, or CORS is not enabled for YARN ResourceManager.";
        Em.Logger.error(error);
        var err = App.Helpers.misc.formatError(error);
        var msg = 'Error code: %@, message: %@'.fmt(err.errCode, err.msg);
        App.Helpers.ErrorBar.getInstance().show(msg, err.details);
      });
    }
  },

  defaultColumnConfigs: function() {
    function onProgressChange() {
      var progress = this.get('vertex.progress'),
          pct,
          status;
      status = this.get('vertex.status');
      if (Ember.typeOf(progress) === 'number' && status == 'RUNNING') {
        pct = App.Helpers.number.fractionToPercentage(progress);
      }
      this.setProperties({
        progress: pct,
        status: status,
        statusIcon: App.Helpers.misc.getStatusClassForEntity(status,
          this.get('vertex.hasFailedTaskAttempts'))
      });
    }

    return [
      {
        id: 'vertexName',
        headerCellName: 'Vertex Name',
        templateName: 'components/basic-table/linked-cell',
        contentPath: 'name',
        getCellContent: function(row) {
          return {
            linkTo: 'vertex',
            entityId: row.get('id'),
            displayText: row.get('name')
          };
        }
      },
      {
        id: 'id',
        headerCellName: 'Vertex ID',
        contentPath: 'id',
      },
      {
        id: 'status',
        headerCellName: 'Status',
        templateName: 'components/basic-table/status-cell',
        contentPath: 'status',
        observePath: true,
        getCellContent: function(row) {
          var status = row.get('status');
          return {
            status: status,
            statusIcon: App.Helpers.misc.getStatusClassForEntity(status)
          };
        }
      },
      {
        id: 'progress',
        headerCellName: 'Progress',
        contentPath: 'progress',
        observePath: true,
        templateName: 'components/basic-table/progress-cell'
      },
      {
        id: 'startTime',
        headerCellName: 'Start Time',
        contentPath: 'startTime',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('startTime'));
        },
        getSearchValue: function(row) {
          return App.Helpers.date.dateFormat(row.get('startTime'));
        }
      },
      {
        id: 'endTime',
        headerCellName: 'End Time',
        contentPath: 'endTime',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('endTime'));
        },
        getSearchValue: function(row) {
          return App.Helpers.date.dateFormat(row.get('endTime'));
        },
      },
      {
        id: 'duration',
        headerCellName: 'Duration',
        contentPath: 'duration',
        getCellContent: function(row) {
          return App.Helpers.date.timingFormat(row.get('duration'), 1);
        },
        getSearchValue: function(row) {
          return App.Helpers.date.timingFormat(row.get('duration'), 1);
        }
      },
      {
        id: 'firstTaskStartTime',
        headerCellName: 'First Task Start Time',
        contentPath: 'firstTaskStartTime',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('firstTaskStartTime'));
        },
        getSearchValue: function(row) {
          return App.Helpers.date.dateFormat(row.get('firstTaskStartTime'));
        }
      },
      {
        id: 'tasks',
        headerCellName: 'Tasks',
        contentPath: 'numTasks'
      },
      {
        id: 'processorClass',
        headerCellName: 'Processor Class',
        contentPath: 'processorClassName'
      },
      {
        id: 'configurations',
        headerCellName: 'Source/Sink Configs',
        templateName: 'components/basic-table/vertex-configurations-cell',
        searchAndSortable: false,
        getCellContent: function(row) {
          var firstInputId = row.get('inputs.content.0.id'),
              firstOutputId = row.get('outputs.content.0.id');
          return {
            linkToAdditionals: row.get('inputs.content.length') > 1 ||
                row.get('outputs.content.length') > 1 ||
                (firstInputId != undefined && firstOutputId != undefined),
            inputId: firstInputId,
            outputId: firstOutputId,
            vertexId: row.get('id')
          };
        }
      }
    ];
  }.property(),

  columnConfigs: function() {
    return this.get('defaultColumnConfigs').concat(
      App.Helpers.misc.normalizeCounterConfigs(
        App.get('Configs.defaultCounters').concat(
          App.get('Configs.tables.entity.vertex') || [],
          App.get('Configs.tables.sharedColumns') || []
        )
      )
    );
  }.property('defaultColumnConfigs'),

});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.DagsController = Em.ObjectController.extend(App.PaginatedContentMixin, App.ColumnSelectorMixin, {
  childEntityType: 'dag',

	controllerName: 'DagsController',

	pageTitle: 'Tez DAGs',

	pageSubTitle: 'All Tez DAGs',

  // query parameters supported through url. The same named variables in this controller get
  // bound automatically to the ones defined in the route.
  queryParams: {
    status_filter: 'status',
    user_filter: 'user',
    appId_filter: 'appid',
    id_filter: 'id',
    dagName_filter: 'dag_name',
    callerId_filter: 'caller_id'
  },

  fromID: null,

  status_filter: null,
  user_filter: null,
  appId_filter: null,
  id_filter: null,
  dagName_filter: null,
  callerId_filter: null,

  boundFilterValues: Em.Object.create({
    status: null
  }),
  visibleFilters: null,

  init: function () {
    this._super();
    this._filterVisiblilityObserver();
  },

  _paramObserver: function () {
    this.set('boundFilterValues', Em.Object.create({
      status: this.get('status_filter'),
      user: this.get('user_filter'),
      appId: this.get('appId_filter'),
      id: this.get('id_filter'),
      dagName: this.get('dagName_filter'),
      callerId: this.get('callerId_filter')
    }));
  }.observes('status_filter', 'user_filter', 'appId_filter', 'dagName_filter', 'id_filter',
      'callerId_filter'),

  _filterVisiblilityObserver: function () {
    var visibleFilters = Em.Object.create();
    this.get('columns').forEach(function (column) {
      if(column.get('enableFilter')) {
        visibleFilters.set(column.get('id'), true);
      }
    });
    this.set('visibleFilters', visibleFilters);
  }.observes('columns'),

  loadData: function() {
    var filters = {
      primary: {
        dagName: this.dagName_filter,
        applicationId: this.appId_filter,
        user: this.user_filter,
        callerId: this.callerId_filter
      },
      secondary: {
      }
    }
    if (App.Helpers.misc.isFinalDagStatus(this.status_filter)) {
      filters.primary['status'] = this.status_filter;
    } else {
      filters.secondary['status'] = this.status_filter;
    }
    this.setFiltersAndLoadEntities(filters);
  },

  loadEntities: function() {
    var that = this,
    store = this.get('store'),
    childEntityType = this.get('childEntityType'),
    finder,
    record;
    var defaultErrMsg = 'Error while loading DAGs. Either Timeline Server is down, or CORS might not be enabled.';

    that.set('loading', true);
    store.unloadAll(childEntityType);
    store.unloadAll('dagProgress');

    if(this.id_filter) {
      finder = store.find(childEntityType, this.id_filter).then(function (entity) {
        return (
          (that.dagName_filter && entity.get('name') != that.dagName_filter) ||
          (that.appId_filter && entity.get('applicationId') != that.appId_filter) ||
          (that.user_filter && entity.get('user') != that.user_filter) ||
          (that.status_filter && entity.get('status') != that.status_filter) ||
          (that.callerId_filter && entity.get('callerId') != that.callerId_filter)
        ) ? [] : [entity];
      }).catch(function () {
        return [];
      });
    }
    else {
      finder = store.findQuery(childEntityType, this.getFilterProperties());
    }

    finder.then(function(entities){
      that.set('entities', entities);
      that.set('loading', false);

      entities.forEach(function (dag) {
        var appId = dag.get('applicationId');
        if(appId && dag.get('status') === 'RUNNING') {
          App.Helpers.misc.loadApp(store, appId).then(function (app) {
            dag.set('appDetail', app);
            dag.set('status', App.Helpers.misc.getRealStatus(
              dag.get('status'),
              app.get('status'),
              app.get('finalStatus')
            ));
          }).catch(function(error) {})
          .finally(function () {
            if(dag.get('status') === 'RUNNING') {
              App.Helpers.misc.removeRecord(store, 'dagProgress', dag.get('id'));
              store.find('dagProgress', dag.get('id'), {
                appId: dag.get('applicationId'),
                dagIdx: dag.get('idx')
              })
              .then(function(dagProgressInfo) {
                dag.set('progress', dagProgressInfo.get('progress'));
              })
              .catch(function(error) {
                error.message = "Failed to fetch dagProgress. Application Master (AM) is out of reach. Either it's down, or CORS is not enabled for YARN ResourceManager.";
                Em.Logger.error(error);
                var err = App.Helpers.misc.formatError(error);
                var msg = 'Error code: %@, message: %@'.fmt(err.errCode, err.msg);
                App.Helpers.ErrorBar.getInstance().show(msg, err.details);
              });
            }
          });
        }
      });
    }).catch(function(error){
      Em.Logger.error(error);
      var err = App.Helpers.misc.formatError(error, defaultErrMsg);
      var msg = 'error code: %@, message: %@'.fmt(err.errCode, err.msg);
      App.Helpers.ErrorBar.getInstance().show(msg, err.details);
    });
  }.observes('fields'),

  actions : {
    filterUpdated: function() {
      Em.run.later();
      var filterValues = this.get('boundFilterValues');
      this.setProperties({
        status_filter: filterValues.get('status') || null,
        user_filter: filterValues.get('user') || null,
        appId_filter: filterValues.get('appId') || null,
        id_filter: filterValues.get('id') || null,
        dagName_filter: filterValues.get('dagName') || null,
        callerId_filter: filterValues.get('callerId') || null
      });
      this.loadData();
    }
  },

  /*
   * Columns that would be displayed by default
   * @return Array of column configs
   */
  defaultColumnConfigs: function () {
    var store = this.get('store');

    function onProgressChange() {
      var progress = this.get('dag.progress'),
          pct;
      if (Ember.typeOf(progress) === 'number') {
        pct = App.Helpers.number.fractionToPercentage(progress);
        this.set('progress', pct);
      }
    }

    function onStatusChange() {
      var status = this.get('dag.status');
      this.setProperties({
        status: status,
        statusIcon: App.Helpers.misc.getStatusClassForEntity(status,
          this.get('dag.hasFailedTaskAttempts'))
      });
    }

    return [
      {
        id: 'dagName',
        headerCellName: 'Dag Name',
        templateName: 'components/basic-table/linked-cell',
        enableFilter: true,
        getCellContent: function(row) {
          return {
            linkTo: 'dag.index',
            entityId: row.get('id'),
            displayText: row.get('name')
          };
        }
      },
      {
        id: 'id',
        headerCellName: 'Id',
        enableFilter: true,
        contentPath: 'id'
      },
      {
        id: 'user',
        headerCellName: 'Submitter',
        contentPath: 'user',
        enableFilter: true
      },
      {
        id: 'status',
        headerCellName: 'Status',
        templateName: 'components/basic-table/status-cell',
        enableFilter: true,
        getCellContent: function(row) {
          var status = row.get('status'),
              content = Ember.Object.create({
                dag: row,
                status: status,
                statusIcon: App.Helpers.misc.getStatusClassForEntity(status,
                  row.get('hasFailedTaskAttempts'))
              });

          if(status == 'RUNNING') {
            row.addObserver('progress', content, onProgressChange);
            row.addObserver('status', content, onStatusChange);
          }

          return content;
        }
      },
      {
        id: 'startTime',
        headerCellName: 'Start Time',
        contentPath: 'startTime',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('startTime'));
        }
      },
      {
        id: 'endTime',
        headerCellName: 'End Time',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('endTime'));
        }
      },
      {
        id: 'duration',
        headerCellName: 'Duration',
        getCellContent: function(row) {
          return App.Helpers.date.timingFormat(row.get('duration'), 1);
        }
      },
      {
        id: 'appId',
        headerCellName: 'Application ID',
        templateName: 'components/basic-table/linked-cell',
        enableFilter: true,
        getCellContent: function(row) {
          return {
            linkTo: 'tez-app',
            entityId: row.get('applicationId'),
            displayText: row.get('applicationId')
          };
        }
      },
      {
        id: 'queue',
        headerCellName: 'Queue',
        templateName: 'components/basic-table/bounded-basic-cell',
        getCellContent: function(row) {
          var appId = row.get('applicationId');
          if(appId) {
            return App.Helpers.misc.loadApp(store, appId, true).then(function (app) {
              return app.get('queue');
            }).catch(function(error) {});
          }
        }
      },
      {
        id: 'callerId',
        headerCellName: 'Context ID',
        enableFilter: true,
        contentPath: 'callerId'
      }
    ];
  }.property(),

  columnConfigs: function() {
    return this.get('defaultColumnConfigs').concat(
      App.Helpers.misc.normalizeCounterConfigs(
        App.get('Configs.defaultCounters').concat(
          App.get('Configs.tables.entity.dag') || [],
          App.get('Configs.tables.sharedColumns') || []
        )
      )
    );
  }.property('defaultColumnConfigs'),

});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.TaskCountersController = App.PollingController.extend(App.ModelRefreshMixin, {
  controllerName: 'TaskCountersController',

  pollingType: 'taskInfo',

  pollsterControl: function () {
    if(this.get('vertex.dag.status') == 'RUNNING' &&
        this.get('vertex.dag.amWebServiceVersion') != '1' &&
        this.get('pollingEnabled') &&
        this.get('isActive')) {
      this.get('pollster').start();
    }
    else {
      this.get('pollster').stop();
    }
  }.observes('vertex.dag.status', 'vertex.dag.amWebServiceVersion', 'isActive', 'pollingEnabled'),

  pollsterOptionsObserver: function () {
    var model = this.get('model');

    this.get('pollster').setProperties( (model && model.get('status') != 'SUCCEEDED') ? {
      targetRecords: [model],
      options: {
        appID: this.get('vertex.dag.applicationId'),
        dagID: App.Helpers.misc.getIndexFromId(this.get('dagID')),
        taskID: '%@_%@'.fmt(
          App.Helpers.misc.getIndexFromId(this.get('vertexID')),
          App.Helpers.misc.getIndexFromId(this.get('id'))
        ),
        counters: '*'
      }
    } : {
      targetRecords: [],
      options: null
    });
  }.observes('vertex.dag.applicationId', 'status', 'dagID', 'vertexID', 'id'),

  message: function () {
    var status = this.get('content.status');
    if(!this.get('content.counterGroups.length')) {
      if(status == 'KILLED' || status == 'FAILED') {
        return 'Task %@, please check the counters of individual task attempts.'.fmt(status);
      }
    }
  }.property('content.status', 'content.counterGroups.length'),

  applicationComplete: function () {
    this.get('pollster').stop();
    this.set('pollster.polledRecords', null);
  }
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.TaskAttemptController = App.BaseController.extend(App.Helpers.DisplayHelper, {
  controllerName: 'TaskAttemptController',

  pageTitle: 'TaskAttempt',
  persistConfigs: false,

  loading: true,

  pollster: App.Helpers.EntityArrayPollster.create(),

  init: function () {
    this._super();
    this.get('pollster').setProperties({
      entityType: 'attemptInfo',
      mergeProperties: ['status', 'progress'],
      store: this.get('store')
    });
  },

  pollsterControl: function () {
    if(this.get('task.vertex.dag.status') == 'RUNNING' &&
        this.get('task.vertex.dag.amWebServiceVersion') != '1' &&
        this.get('pollingEnabled') &&
        this.get('isActive')) {
      this.get('pollster').start();
    }
    else {
      this.get('pollster').stop();
    }
  }.observes('task.vertex.dag.status', 'task.vertex.dag.amWebServiceVersion', 'isActive', 'pollingEnabled'),

  pollsterOptionsObserver: function () {
    var model = this.get('model');

    this.get('pollster').setProperties( (model && model.get('status') != 'SUCCEEDED') ? {
      targetRecords: [model],
      options: {
        appID: this.get('task.vertex.dag.applicationId'),
        dagID: App.Helpers.misc.getIndexFromId(this.get('dagID')),
        attemptID: '%@_%@_%@'.fmt(
          App.Helpers.misc.getIndexFromId(this.get('vertexID')),
          App.Helpers.misc.getIndexFromId(this.get('taskID')),
          App.Helpers.misc.getIndexFromId(this.get('id'))
        )
      }
    } : {
      targetRecords: [],
      options: null
    });
  }.observes('task.vertex.dag.applicationId', 'status', 'dagID', 'vertexID', 'id'),

  loadAdditional: function(attempt) {
    var that = this;

    var dagLoader = this.store.find('dag', attempt.get('dagID'));
    var vertexLoader = this.store.find('vertex', attempt.get('vertexID'));
    var taskLoader = this.store.find('task', attempt.get('taskID'));

    var allLoaders = Em.RSVP.hash({
      dag: dagLoader,
      vertex: vertexLoader,
      task: taskLoader
    });
    allLoaders.then(function(results) {
      attempt.set('task', results.task);
      attempt.set('task.vertex', results.vertex);
      attempt.set('task.vertex.dag', results.dag);
    }).finally(function() {
      that.set('loading', false);
    });

    return allLoaders;
  },

  taskIndex: function() {
    return App.Helpers.misc.getTaskIndex(this.get('dagID'), this.get('taskID'));
  }.property('taskID', 'dagID'),

  vertexName: function() {
    return this.get('task.vertex.name') || this.get('vertexID');
  }.property('task.vertex.name', 'vertexID'),

  dagName: function() {
    return this.get('task.vertex.dag.name') || this.get('dagID');
  }.property('task.vertex.dag.name', 'dagID'),

  childDisplayViews: [
    Ember.Object.create({title: 'TaskAttempt Details', linkTo: 'taskAttempt.index'}),
    Ember.Object.create({title: 'TaskAttempt Counters', linkTo: 'taskAttempt.counters'}),
  ],

});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.TaskAttemptCountersController = App.PollingController.extend(App.Helpers.DisplayHelper, App.ModelRefreshMixin, {
  controllerName: 'TaskAttemptCountersController',

  pollingType: 'attemptInfo',

  pollsterControl: function () {
    if(this.get('task.vertex.dag.status') == 'RUNNING' &&
        this.get('task.vertex.dag.amWebServiceVersion') != '1' &&
        this.get('pollingEnabled') &&
        this.get('isActive')) {
      this.get('pollster').start();
    }
    else {
      this.get('pollster').stop();
    }
  }.observes('task.vertex.dag.status', 'task.vertex.dag.amWebServiceVersion', 'isActive', 'pollingEnabled'),

  pollsterOptionsObserver: function () {
    var model = this.get('model');

    this.get('pollster').setProperties( (model && model.get('status') != 'SUCCEEDED') ? {
      targetRecords: [model],
      options: {
        appID: this.get('task.vertex.dag.applicationId'),
        dagID: App.Helpers.misc.getIndexFromId(this.get('dagID')),
        //ID: App.Helpers.misc.getIndexFromId(this.get('id')),
        attemptID: '%@_%@_%@'.fmt(
          App.Helpers.misc.getIndexFromId(this.get('vertexID')),
          App.Helpers.misc.getIndexFromId(this.get('taskID')),
          App.Helpers.misc.getIndexFromId(this.get('id'))
        ),
        counters: '*'
      }
    } : {
      targetRecords: [],
      options: null
    });
  }.observes('task.vertex.dag.applicationId', 'status', 'dagID', 'vertexID', 'id'),

  applicationComplete: function () {
    this.get('pollster').stop();
    this.set('pollster.polledRecords', null);
  }
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.TaskController = App.PollingController.extend(App.Helpers.DisplayHelper, App.ModelRefreshMixin, {
  controllerName: 'TaskController',

  pageTitle: 'Task',

  loading: true,
  persistConfigs: false,

  pollingType: 'taskInfo',

  pollsterControl: function () {
    if(this.get('vertex.dag.status') == 'RUNNING' &&
        this.get('vertex.dag.amWebServiceVersion') != '1' &&
        this.get('pollingEnabled') &&
        this.get('isActive')) {
      this.get('pollster').start();
    }
    else {
      this.get('pollster').stop();
    }
  }.observes('vertex.dag.status', 'vertex.dag.amWebServiceVersion', 'isActive', 'pollingEnabled'),

  pollsterOptionsObserver: function () {
    var model = this.get('model');

    this.get('pollster').setProperties( (model && model.get('status') != 'SUCCEEDED') ? {
      targetRecords: [model],
      options: {
        appID: this.get('vertex.dag.applicationId'),
        dagID: App.Helpers.misc.getIndexFromId(this.get('dagID')),
        taskID: '%@_%@'.fmt(
          App.Helpers.misc.getIndexFromId(this.get('vertexID')),
          App.Helpers.misc.getIndexFromId(this.get('id'))
        )
      }
    } : {
      targetRecords: [],
      options: null
    });
  }.observes('vertex.dag.applicationId', 'status', 'dagID', 'vertexID', 'id'),

  loadAdditional: function(task) {
    var that = this;
    var applicationId = App.Helpers.misc.getAppIdFromVertexId(task.get('vertexID'));

    var dagLoader = this.store.find('dag', task.get('dagID'));
    var vertexLoader = this.store.find('vertex', task.get('vertexID'));
    var tezAppLoader = this.store.find('tezApp', 'tez_' + applicationId);

    task.set('progress', undefined);
    var allLoaders = Em.RSVP.hash({
      dag: dagLoader,
      vertex: vertexLoader,
      tezApp: tezAppLoader
    });

    allLoaders.then(function(results) {
      task.set('vertex', results.vertex);
      task.set('vertex.dag', results.dag);
      task.set('tezApp', results.tezApp);
    }).finally(function() {
      that.set('loading', false);
    });

    return allLoaders;
  },

  vertexName: function() {
    return this.get('vertex.name') || this.get('vertexID');
  }.property('vertex.name', 'vertexID'),

  dagName: function() {
    return this.get('vertex.dag.name') || this.get('dagID');
  }.property('vertex.dag.name', 'dagID'),

  childDisplayViews: [
    Ember.Object.create({title: 'Task Details', linkTo: 'task.index'}),
    Ember.Object.create({title: 'Task Counters', linkTo: 'task.counters'}),
    Ember.Object.create({title: 'Task Attempts', linkTo: 'task.attempts'}),
  ],

});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 //TODO: watch individual counters.
App.TaskIndexController = App.PollingController.extend(App.ModelRefreshMixin, {
  controllerName: 'TaskIndexController',

  taskStatus: function() {
    return App.Helpers.misc.getFixedupDisplayStatus(this.get('model.status'));
  }.property('id', 'model.status'),

  taskIconStatus: function() {
    return App.Helpers.misc.getStatusClassForEntity(this.get('taskStatus'),
      this.get('hasFailedTaskAttempts'));
  }.property('id', 'taskStatus', 'hasFailedTaskAttempts'),

  load: function () {
    var model = this.get('content');
    if(model && $.isFunction(model.reload)) {
      model.reload().then(function(record) {
        if(record.get('isDirty')) {
          record.rollback();
        }
      });
    }
  },

});

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.TaskAttemptsController = App.TablePageController.extend(App.AutoCounterColumnMixin, {

  controllerName: 'TaskAttemptsController',
  needs: "task",

  entityType: 'taskTaskAttempt',
  baseEntityType: 'taskAttempt',
  filterEntityType: 'task',
  filterEntityId: Ember.computed.alias('controllers.task.id'),

  cacheDomain: Ember.computed.alias('controllers.task.dagID'),

  pollingType: 'attemptInfo',

  pollsterControl: function () {
    if(this.get('vertex.dag.status') == 'RUNNING' &&
        this.get('vertex.dag.amWebServiceVersion') != '1' &&
        !this.get('loading') &&
        this.get('isActive') &&
        this.get('pollingEnabled') &&
        this. get('rowsDisplayed.length') > 0) {
      this.get('pollster').start();
    }
    else {
      this.get('pollster').stop();
    }
  }.observes('vertex.dag.status',
    'vertex.dag.amWebServiceVersion', 'rowsDisplayed', 'loading', 'isActive', 'pollingEnabled'),

  pollsterOptionsObserver: function () {
    this.set('pollster.options', {
      appID: this.get('vertex.dag.applicationId'),
      dagID: this.get('vertex.dag.idx'),
      counters: this.get('countersDisplayed'),
      attemptID: this.get('rowsDisplayed').map(function (row) {
          var attemptIndex = App.Helpers.misc.getIndexFromId(row.get('id')),
              taskIndex = App.Helpers.misc.getIndexFromId(row.get('taskID')),
              vertexIndex = App.Helpers.misc.getIndexFromId(row.get('vertexID'));
          return '%@_%@_%@'.fmt(vertexIndex, taskIndex, attemptIndex);
        }).join(',')
    });
  }.observes('vertex.dag.applicationId', 'vertex.dag.idx', 'rowsDisplayed'),

  countersDisplayed: function () {
    return App.Helpers.misc.getCounterQueryParam(this.get('columns'));
  }.property('columns'),

  beforeLoad: function () {
    var taskController = this.get('controllers.task'),
        model = taskController.get('model');
    return model.reload().then(function () {
      return taskController.loadAdditional(model);
    });
  },

  afterLoad: function () {
    var loaders = [],
        that = this;

    App.Helpers.misc.removeRecord(that.store, 'dag', that.get('controllers.task.dagID'));

    var appDetailFetcher = that.store.find('dag', that.get('controllers.task.dagID')).
      then(function (dag) {
        return App.Helpers.misc.loadApp(that.store, dag.get('applicationId'));
      }).
      then(function(appDetail) {
        var status = appDetail.get('status');
        if (status) {
          that.set('yarnAppState', status);
        }
      });
    loaders.push(appDetailFetcher);

    return Em.RSVP.allSettled(loaders);
  },

  defaultColumnConfigs: function() {
    var that = this;
    return [
      {
        id: 'attemptNo',
        headerCellName: 'Attempt No',
        templateName: 'components/basic-table/linked-cell',
        contentPath: 'id',
        getCellContent: function(row) {
          var attemptID = row.get('id') || '';
          return {
            linkTo: 'taskAttempt',
            displayText: attemptID.split(/[_]+/).pop(),
            entityId: attemptID
          };
        },
        getSearchValue: function (row) {
          var attemptID = row.get('id') || '';
          return attemptID.split(/[_]+/).pop();
        },
        getSortValue: function (row) {
          var attemptID = row.get('id') || '';
          return attemptID.split(/[_]+/).pop();
        }
      },
      {
        id: 'status',
        headerCellName: 'Status',
        templateName: 'components/basic-table/status-cell',
        contentPath: 'status',
        observePath: true,
        onSort: this.onInProgressColumnSort.bind(this),
        getCellContent: function(row) {
          var status = App.Helpers.misc.getFixedupDisplayStatus(row.get('status'));
          return {
            status: status,
            statusIcon: App.Helpers.misc.getStatusClassForEntity(status)
          };
        }
      },
      {
        id: 'progress',
        headerCellName: 'Progress',
        contentPath: 'progress',
        observePath: true,
        onSort: this.onInProgressColumnSort.bind(this),
        templateName: 'components/basic-table/progress-cell'
      },
      {
        id: 'startTime',
        headerCellName: 'Start Time',
        contentPath: 'startTime',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('startTime'));
        },
        getSearchValue: function(row) {
          return App.Helpers.date.dateFormat(row.get('startTime'));
        }
      },
      {
        id: 'endTime',
        headerCellName: 'End Time',
        contentPath: 'endTime',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('endTime'));
        },
        getSearchValue: function(row) {
          return App.Helpers.date.dateFormat(row.get('endTime'));
        },
      },
      {
        id: 'duration',
        headerCellName: 'Duration',
        contentPath: 'duration',
        getCellContent: function(row) {
          return App.Helpers.date.timingFormat(row.get('duration'), 1);
        },
        getSearchValue: function(row) {
          return App.Helpers.date.timingFormat(row.get('duration'), 1);
        },
      },
      {
        id: 'containerId',
        headerCellName: 'Container',
        contentPath: 'containerId'
      },
      {
        id: 'nodeId',
        headerCellName: 'Node',
        contentPath: 'nodeId'
      },
      {
        id: 'actions',
        headerCellName: 'Actions',
        templateName: 'components/basic-table/linked-cell',
        searchAndSortable: false,
        contentPath: 'id',
        getCellContent: function(row) {
          var attemptID = row.get('id') || '';
          return {
            linkTo: 'taskAttempt.counters',
            displayText: 'counters',
            entityId: attemptID
          };
        }
      },
      {
        id: 'logs',
        headerCellName: 'Logs',
        templateName: 'components/basic-table/logs-cell',
        searchAndSortable: false,
        getCellContent: function(row) {
          var cellContent = App.Helpers.misc.constructLogLinks(
                row,
                that.get('yarnAppState'),
                that.get('controllers.task.tezApp.user')
              );

          cellContent.notAvailable = cellContent.viewUrl || cellContent.downloadUrl;
          return cellContent;
        }
      }
    ];
  }.property('yarnAppState', 'controllers.task.tezApp.user'),

});


App.TaskAttemptIndexController = Em.ObjectController.extend(App.ModelRefreshMixin, {
  controllerName: 'TaskAttemptIndexController',

  taskAttemptStatus: function() {
    return App.Helpers.misc.getFixedupDisplayStatus(this.get('status'));
  }.property('id', 'status'),

  taskAttemptIconStatus: function() {
    return App.Helpers.misc.getStatusClassForEntity(this.get('taskAttemptStatus'));
  }.property('id', 'status', 'counterGroups'),

  load: function () {
    var model = this.get('content');
    if(model && $.isFunction(model.reload)) {
      model.reload().then(function(record) {
        if(record.get('isDirty')) {
          record.rollback();
        }
      });
    }
  },

});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.TasksController = Em.ObjectController.extend(App.PaginatedContentMixin, App.ColumnSelectorMixin, {
  // Required by the PaginatedContentMixin
  childEntityType: 'task',

  controllerName: 'TasksController',

  pageTitle: 'Tasks',

  pageSubTitle: 'All Tasks',

  queryParams: {
    parentType: true,
    parentID: true,
    status_filter: 'status'
  },

  parentName: 'Loading...', // So that a proper message is displayed
  vertexIdToNameMap: {},
  parentType: null,
  parentID: null,
  status_filter: null,

  loadData: function() {
    var filters = {
      primary: {},
      secondary: {
        status: this.status_filter
      }
    }
    filters.primary[this.parentType] = this.parentID;
    this.setFiltersAndLoadEntities(filters);
  },

  loadAdditional: function (loader) {
    var that = this;
    return this.store.find('dag', this.get('parentID')).
      then(function (parent) {
        that.set('parentName', parent.get('name'));
        that.set('vertexIdToNameMap', parent.get('vertexIdToNameMap') || {});
      });
  },

  defaultColumnConfigs: function() {
    var vertexIdToNameMap = this.get('vertexIdToNameMap');
    return [
      {
        id: 'taskId',
        headerCellName: 'Task Id',
        contentPath: 'id',
        tableCellViewClass: Em.Table.TableCell.extend({
          template: Em.Handlebars.compile(
            "{{#link-to 'task' view.cellContent class='ember-table-content'}}{{view.cellContent}}{{/link-to}}")
        })
      },
      {
        id: 'vertexName',
        headerCellName: 'Vertex Name',
        getCellContent: function(row) {
          var vertexId = row.get('vertexID');
          return vertexIdToNameMap[vertexId] || vertexId;
        }
      },
      {
        id: 'submissionTime',
        headerCellName: 'Submission Time',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('startTime'));
        }
      },
      {
        id: 'endTime',
        headerCellName: 'End Time',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('endTime'));
        }
      },
      {
        id: 'status',
        headerCellName: 'Status',
        tableCellViewClass: Em.Table.TableCell.extend({
          template: Em.Handlebars.compile(
            '<span class="ember-table-content">&nbsp;\
            <i {{bind-attr class=":task-status view.cellContent.statusIcon"}}></i>\
            &nbsp;&nbsp;{{view.cellContent.status}}</span>')
        }),
        getCellContent: function(row) {
          var taskStatus = row.get('status');
          return {
            status: taskStatus,
            statusIcon: App.Helpers.misc.getStatusClassForEntity(taskStatus,
              row.get('hasFailedTaskAttempts'))
          };
        }
      }
    ];
  }.property('vertexIdToNameMap'),

  columnConfigs: function() {
    return this.get('defaultColumnConfigs').concat(
      App.Helpers.misc.normalizeCounterConfigs(
        App.get('Configs.defaultCounters').concat(
          App.get('Configs.tables.entity.task') || [],
          App.get('Configs.tables.sharedColumns') || []
        )
      )
    );
  }.property('defaultColumnConfigs'),

});

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.TezAppController = App.BaseController.extend(App.Helpers.DisplayHelper, App.ModelRefreshMixin, {
  controllerName: 'AppController',

  pageTitle: 'App',
  persistConfigs: false,
  pollingEnabled: true,

  loading: true,

  updateLoading: function() {
    this.set('loading', false);
  }.observes('content'),

  pollster: App.Helpers.Pollster.create(),

  init: function () {
    this._super();
    this.get('pollster').setProperties({
      onPoll: this.load.bind(this)
    });
  },

  pollsterControl: function () {
    if(this.get('appDetail.finalStatus') == 'UNDEFINED' &&
        this.get('pollingEnabled') &&
        this.get('isActive')) {
      this.get('pollster').start();
    }
    else {
      this.get('pollster').stop();
    }
  }.observes('appDetail.finalStatus', 'isActive', 'pollingEnabled'),

  load: function () {
    var tezApp = this.get('content'),
        store  = this.get('store');

      tezApp.reload().then(function (tezApp) {
        var appId = tezApp.get('appId');
        if(!appId) return tezApp;
        return App.Helpers.misc.loadApp(store, appId).then(function (appDetails){
          tezApp.set('appDetail', appDetails);
          return tezApp;
        });
      }).catch(function (error) {
        Em.Logger.error(error);
        var err = App.Helpers.misc.formatError(error);
        var msg = 'error code: %@, message: %@'.fmt(err.errCode, err.msg);
        App.Helpers.ErrorBar.getInstance().show(msg, err.details);
      });
  },

  childDisplayViews: [
    Ember.Object.create({title: 'App Details', linkTo: 'tez-app.index'}),
    Ember.Object.create({title: 'DAGs', linkTo: 'tez-app.dags'}),
    Ember.Object.create({title: 'App Configuration', linkTo: 'tez-app.configs'}),
  ],
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.TezAppDagsController = App.TablePageController.extend({

  controllerName: 'TezAppDagsController',
  needs: "tezApp",

  entityType: 'dag',
  filterEntityType: 'tezApp',
  filterEntityId: Ember.computed.alias('appId'),

  showAutoUpdate: false,

  afterLoad: function () {
    var data = this.get('data'),
        loaders = [],
        store = this.get('store'),
        record,
        fetcher;

    data.forEach(function (dag) {

      var appId = dag.get('applicationId');
      if(appId) {
        //Load tezApp details
        if (dag.get('status') === 'RUNNING') {
          App.Helpers.misc.removeRecord(store, 'dagProgress', dag.get('id'));
          fetcher = store.find('dagProgress', dag.get('id'), {
            appId: dag.get('applicationId'),
            dagIdx: dag.get('idx')
          })
          .then(function(dagProgressInfo) {
            dag.set('progress', dagProgressInfo.get('progress'));
          })
          .catch(function(error) {
            error.message = "Failed to fetch dagProgress. Application Master (AM) is out of reach. Either it's down, or CORS is not enabled for YARN ResourceManager.";
            Em.Logger.error(error);
            var err = App.Helpers.misc.formatError(error);
            var msg = 'Error code: %@, message: %@'.fmt(err.errCode, err.msg);
            App.Helpers.ErrorBar.getInstance().show(msg, err.details);
          });
          loaders.push(fetcher);
        }
      }

    });

    return Em.RSVP.allSettled(loaders);
  },

  defaultColumnConfigs: function() {
    var store = this.get('store');
    return [
      {
        id: 'dagName',
        headerCellName: 'Dag Name',
        filterID: 'dagName_filter',
        templateName: 'components/basic-table/linked-cell',
        contentPath: 'name',
        getCellContent: function(row) {
          return {
            linkTo: 'dag',
            entityId: row.get('id'),
            displayText: row.get('name')
          };
        }
      },
      {
        id: 'id',
        headerCellName: 'Id',
        contentPath: 'id'
      },
      {
        id: 'user',
        headerCellName: 'Submitter',
        contentPath: 'user'
      },
      {
        id: 'status',
        headerCellName: 'Status',
        templateName: 'components/basic-table/status-cell',
        contentPath: 'status',
        getCellContent: function(row) {
          var status = row.get('status'),
              content = Ember.Object.create({
                status: status,
                statusIcon: App.Helpers.misc.getStatusClassForEntity(status,
                  row.get('hasFailedTaskAttempts'))
              });

          if(status == 'RUNNING') {
            App.Helpers.misc.removeRecord(store, 'dagProgress', row.get('id'));

            store.find('dagProgress', row.get('id'), {
              appId: row.get('applicationId'),
              dagIdx: row.get('idx')
            })
            .then(function(dagProgressInfo) {
              content.set('progress', dagProgressInfo.get('progress'));
            })
            .catch(function(error) {
              error.message = "Failed to fetch dagProgress. Application Master (AM) is out of reach. Either it's down, or CORS is not enabled for YARN ResourceManager.";
              Em.Logger.error(error);
              var err = App.Helpers.misc.formatError(error);
              var msg = 'Error code: %@, message: %@'.fmt(err.errCode, err.msg);
              App.Helpers.ErrorBar.getInstance().show(msg, err.details);
            });
          }

          return content;
        }
      },
      {
        id: 'startTime',
        headerCellName: 'Start Time',
        contentPath: 'startTime',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('startTime'));
        },
        getSearchValue: function(row) {
          return App.Helpers.date.dateFormat(row.get('startTime'));
        }
      },
      {
        id: 'endTime',
        headerCellName: 'End Time',
        contentPath: 'endTime',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('endTime'));
        },
        getSearchValue: function(row) {
          return App.Helpers.date.dateFormat(row.get('endTime'));
        }
      },
      {
        id: 'duration',
        headerCellName: 'Duration',
        contentPath: 'duration',
        getCellContent: function(row) {
          return App.Helpers.date.timingFormat(row.get('duration'), 1);
        },
        getSearchValue: function(row) {
          return App.Helpers.date.timingFormat(row.get('duration'), 1);
        },
      },
      {
        id: 'callerId',
        headerCellName: 'Context ID',
        filterID: 'callerId_filter',
        contentPath: 'callerId'
      }
    ];
  }.property(),

  columnConfigs: function() {
    return this.get('defaultColumnConfigs').concat(
      App.Helpers.misc.normalizeCounterConfigs(
        App.get('Configs.defaultCounters').concat(
          App.get('Configs.tables.entity.dag') || [],
          App.get('Configs.tables.sharedColumns') || []
        )
      )
    );
  }.property('defaultColumnConfigs'),

});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.TezAppIndexController = App.PollingController.extend(App.ModelRefreshMixin, {

  needs: "tezApp",
  controllerName: 'TezAppIndexController',

  rmTrackingURL: function() {
    return "%@/%@/app/%@".fmt(App.env.RMWebUrl, App.Configs.otherNamespace.cluster, this.get('appId'));
  }.property('appId'),

  load: function () {
    var tezApp = this.get('model'),
      store  = this.get('store');

      tezApp.reload().then(function (tezApp) {
        var appId = tezApp.get('appId');
        if(!appId) return tezApp;
        return App.Helpers.misc.loadApp(store, appId).then(function (appDetails){
          tezApp.set('appDetail', appDetails);
          return tezApp;
        });
      }).catch(function (error) {
        Em.Logger.error(error);
        var err = App.Helpers.misc.formatError(error);
        var msg = 'error code: %@, message: %@'.fmt(err.errCode, err.msg);
        App.Helpers.ErrorBar.getInstance().show(msg, err.details);
      });
  },

  appUser: function() {
    return this.get('appDetail.user') || this.get('user');
  }.property('appDetail.user', 'user'),

  iconStatus: function() {
    return App.Helpers.misc.getStatusClassForEntity(this.get('model.appDetail.finalStatus'));
  }.property('id', 'appDetail.finalStatus'),
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.VertexAdditionalsController = Em.ObjectController.extend({
  needs: 'vertex',

  controllerName: 'VertexAdditionalsController',

  loadEntities: function() {
    var inputs = this.get('inputs.content'),
        outputs = this.get('outputs.content');

    this.set('inputContent', inputs);
    this.set('inputsAvailable', inputs.length > 0);

    this.set('outputContent', outputs);
    this.set('outputsAvailable', outputs.length > 0);

    this.set('loading', false);
  },

  inputColumns: function() {
    return App.Helpers.misc.createColumnDescription([
      {
        id: 'inputId',
        headerCellName: 'Name',
        contentPath: 'inputName',
        searchAndSortable: false,
      },
      {
        id: 'inputClass',
        headerCellName: 'Class',
        contentPath: 'inputClass',
        searchAndSortable: false,
      },
      {
        id: 'inputInitializer',
        headerCellName: 'Initializer',
        contentPath: 'inputInitializer',
        searchAndSortable: false,
      },
      {
        id: 'configurations',
        headerCellName: 'Configurations',
        searchAndSortable: false,
        templateName: 'components/basic-table/linked-cell',
        getCellContent: function(row) {
          if(row.get('configs.content.length')) {
            return {
              linkTo: 'input.configs',
              displayText: 'View Configurations',
              entityId: row.get('id')
            };
          }
        }
      }
    ]);
  }.property(),

  outputColumns: function() {
    return App.Helpers.misc.createColumnDescription([
      {
        id: 'outputId',
        headerCellName: 'Name',
        contentPath: 'outputName',
        searchAndSortable: false,
      },
      {
        id: 'outputClass',
        headerCellName: 'Class',
        contentPath: 'outputClass',
        searchAndSortable: false,
      },
      {
        id: 'configurations',
        headerCellName: 'Configurations',
        searchAndSortable: false,
        templateName: 'components/basic-table/linked-cell',
        getCellContent: function(row) {
          if(row.get('configs.content.length')) {
            return {
              linkTo: 'output.configs',
              displayText: 'View Configurations',
              entityId: row.get('id')
            };
          }
        }
      }
    ]);
  }.property(),

});

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.VertexInputsController = Em.ObjectController.extend(App.PaginatedContentMixin, App.ColumnSelectorMixin, {
  needs: 'vertex',

  controllerName: 'VertexInputsController',

  loadEntities: function() {
    var content = this.get('inputs').content;
    this.set('entities', content);
    this.set('inputsAvailable', content.length > 0);
    this.set('loading', false);
  },

  actions : {
    filterUpdated: function(filterID, value) {
      // any validations required goes here.
      if (!!value) {
        this.set(filterID, value);
      } else {
        this.set(filterID, null);
      }
      this.loadData();
    }
  },

  defaultColumnConfigs: function() {
    return [
      {
        id: 'inputId',
        headerCellName: 'Name',
        contentPath: 'inputName',
      },
      {
        id: 'inputClass',
        headerCellName: 'Class',
        contentPath: 'inputClass',
      },
      {
        id: 'inputInitializer',
        headerCellName: 'Initializer',
        contentPath: 'inputInitializer',
      },
      {
        id: 'configurations',
        headerCellName: 'Configurations',
        tableCellViewClass: Em.Table.TableCell.extend({
          template: Em.Handlebars.compile(
            "{{#if view.cellContent.count}}\
              {{#link-to 'vertexInput.configs' view.cellContent.id class='ember-table-content'}}View Configurations{{/link-to}}\
            {{else}}\
              <span class='ember-table-content'>Not Available</span>\
            {{/if}}")
        }),
        getCellContent: function(row) {
          return {
            count: row.get('configs.content.length'),
            id: row.get('id')
          };
        }
      }
    ];

    return [nameCol, classCol, initializerCol, configCol];
  }.property(),

  columnConfigs: function() {
    return this.get('defaultColumnConfigs').concat(
      App.Helpers.misc.normalizeCounterConfigs(
        App.get('Configs.defaultCounters').concat(
          App.get('Configs.tables.entity.vertexInput') || [],
          App.get('Configs.tables.sharedColumns') || []
        )
      )
    );
  }.property('defaultColumnConfigs'),

});

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.VertexController = App.PollingController.extend(App.Helpers.DisplayHelper, App.ModelRefreshMixin, {
  controllerName: 'VertexController',

  pageTitle: 'Vertex',
  persistConfigs: false,

  loading: true,

  pollingType: 'vertexInfo',

  pollsterControl: function () {
    if(this.get('dag.status') == 'RUNNING' &&
        this.get('dag.amWebServiceVersion') != '1' &&
        this.get('pollingEnabled') &&
        this.get('isActive')) {
      this.get('pollster').start();
    }
    else {
      this.get('pollster').stop();
    }
  }.observes('dag.status', 'dag.amWebServiceVersion', 'isActive', 'pollingEnabled'),

  pollsterOptionsObserver: function () {
    var model = this.get('model');

    this.get('pollster').setProperties( (model && model.get('status') != 'SUCCEEDED') ? {
      targetRecords: [model],
      options: {
        appID: this.get('applicationId'),
        dagID: App.Helpers.misc.getIndexFromId(this.get('dagID')),
        vertexID: App.Helpers.misc.getIndexFromId(this.get('id'))
      }
    } : {
      targetRecords: [],
      options: null
    });
  }.observes('applicationId', 'status', 'dagID', 'id'),

  loadAdditional: function(vertex) {
    var loaders = [],
      that = this,
      applicationId = vertex.get('applicationId');

    vertex.set('progress', undefined);

    // Irrespective of am version this will get the progress first.
    if (vertex.get('status') == 'RUNNING') {
      var vertexIdx = vertex.get('id').split('_').splice(-1).pop();
      App.Helpers.misc.removeRecord(this.store, 'vertexProgress', vertexIdx);
      var progressLoader = this.store.find('vertexProgress', vertexIdx, {
        appId: applicationId,
        dagIdx: vertex.get('dagIdx')
      }).then(function(vertexProgressInfo) {
        if (vertexProgressInfo) {
          vertex.set('progress', vertexProgressInfo.get('progress'));
        }
      }).catch(function(error) {
        error.message = "Failed to fetch vertexProgress. Application Master (AM) is out of reach. Either it's down, or CORS is not enabled for YARN ResourceManager.";
        Em.Logger.error(error);
        var err = App.Helpers.misc.formatError(error);
        var msg = 'Error code: %@, message: %@'.fmt(err.errCode, err.msg);
        App.Helpers.ErrorBar.getInstance().show(msg, err.details);
      });
      loaders.push(progressLoader);
    }

    var appDetailFetcher = App.Helpers.misc.loadApp(that.store, applicationId).then(function(appDetail) {
      var status = appDetail.get('status');
      if (status) {
        vertex.set('yarnAppState', status);
      }
      vertex.set('status', App.Helpers.misc.getRealStatus(vertex.get('status'), appDetail.get('status'),
        appDetail.get('finalStatus')));
    }).catch(function(){});
    loaders.push(appDetailFetcher);

    var tezAppLoader = this.store.find('tezApp', 'tez_' + applicationId)
      .then(function(app){
        vertex.set('tezApp', app);
      }).catch(function(){});
    loaders.push(tezAppLoader);

    var dagFetcher = that.store.find('dag', vertex.get('dagID')).then(function (dag) {
      vertex.set('dag', dag);
    });
    loaders.push(dagFetcher);

    Em.RSVP.allSettled(loaders).then(function(){
      that.set('loading', false);
    });

    return Em.RSVP.all(loaders);
  },

  childDisplayViews: [
    Ember.Object.create({title: 'Vertex Details', linkTo: 'vertex.index'}),
    Ember.Object.create({title: 'Vertex Counters', linkTo: 'vertex.counters'}),
    Ember.Object.create({title: 'Tasks', linkTo: 'vertex.tasks'}),
    Ember.Object.create({title: 'Task Attempts', linkTo: 'vertex.taskAttempts'}),
    //See BUG-36811 Ember.Object.create({title: 'Swimlane', linkTo: 'vertex.swimlane'}),
    Ember.Object.create({title: 'Sources & Sinks', linkTo: 'vertex.additionals'}),
  ],
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.VertexCountersController = App.PollingController.extend(App.Helpers.DisplayHelper, App.ModelRefreshMixin, {
  controllerName: 'VertexCountersController',

  pollingType: 'vertexInfo',

  pollsterControl: function () {
    if(this.get('dag.status') == 'RUNNING' &&
        this.get('dag.amWebServiceVersion') != '1' &&
        this.get('pollingEnabled') &&
        this.get('isActive')) {
      this.get('pollster').start();
    }
    else {
      this.get('pollster').stop();
    }
  }.observes('dag.status', 'dag.amWebServiceVersion', 'isActive', 'pollingEnabled'),

  pollsterOptionsObserver: function () {
    var model = this.get('model');

    this.get('pollster').setProperties( (model && model.get('status') != 'SUCCEEDED') ? {
      targetRecords: [model],
      options: {
        appID: this.get('applicationId'),
        dagID: App.Helpers.misc.getIndexFromId(this.get('dagID')),
        vertexID: App.Helpers.misc.getIndexFromId(this.get('id')),
        counters: '*'
      }
    } : {
      targetRecords: [],
      options: null
    });
  }.observes('applicationId', 'status', 'dagID', 'id'),

  applicationComplete: function () {
    this.get('pollster').stop();
    this.set('pollster.polledRecords', null);
  }
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.VertexIndexController = App.PollingController.extend(App.ModelRefreshMixin, {
  controllerName: 'VertexIndexController',

  needs: 'vertex',

  load: function () {
    var vertex = this.get('controllers.vertex.model'),
        controller = this.get('controllers.vertex'),
        t = this;
    vertex.reload().then(function () {
      return controller.loadAdditional(vertex);
    }).catch(function(error){
      Em.Logger.error(error);
      var err = App.Helpers.misc.formatError(error);
      var msg = 'error code: %@, message: %@'.fmt(err.errCode, err.msg);
      App.Helpers.ErrorBar.getInstance().show(msg, err.details);
    });
  },

  //TODO: TEZ-1705 : Create a parent class and move this function there to avoid duplication.
  iconStatus: function() {
    return App.Helpers.misc.getStatusClassForEntity(this.get('model.status'),
      this.get('model.hasFailedTaskAttempts'));
  }.property('id', 'model.status', 'model.hasFailedTaskAttempts'),

  progressStr: function() {
    var pct;
    if (Ember.typeOf(this.get('progress')) === 'number') {
      pct = App.Helpers.number.fractionToPercentage(this.get('progress'));
    }
    return pct;
  }.property('id', 'status', 'progress', 'model.status'),

  hasFailedTasks: function() {
    return this.get('failedTasks') > 0;
  }.property('failedTasks'),

  failedTasksLink: function() {
    return '#/vertex/%@/tasks?searchText=Status%3AFAILED'.fmt(this.get('id'));
  }.property('id'),

  failedTaskAttemptsLink: function() {
    return '#/vertex/%@/taskAttempts?searchText=Status%3AFAILED'.fmt(this.get('id'));
  }.property('id'),

  hasFirstTaskStarted: function() {
    return !!this.get('firstTaskStartTime') && !!this.get('firstTasksToStart');
  }.property('firstTaskStartTime', 'firstTasksToStart'),

  hasLastTaskFinished: function() {
    return !!this.get('lastTaskFinishTime') && !!this.get('lastTasksToFinish');
  }.property('lastTaskFinishTime', 'lastTasksToFinish'),

  hasStats: function() {
    return (this.get('numTasks') || 0) > 0 ||
           (this.get('sucessfulTasks') || 0) > 0 ||
           (this.get('failedTasks') || 0 ) > 0 ||
           (this.get('killedTasks') || 0) > 0 ||
           this.get('showAvgTaskDuration') ||
           this.get('showMinTaskDuration') ||
           this.get('showMaxTaskDuration');
  }.property('numTasks', 'sucessfulTasks', 'failedTasks', 'killedTasks', 'showAvgTaskDuration',
    'showMinTaskDuration', 'showMaxTaskDuration'),

  showAvgTaskDuration: function() {
    return (this.get('avgTaskDuration') || 0) > 0;
  }.property('avgTaskDuration'),

  showMinTaskDuration: function() {
    return (this.get('minTaskDuration') || 0) > 0;
  }.property('minTaskDuration'),

  showMaxTaskDuration: function() {
    return (this.get('maxTaskDuration') || 0) > 0;
  }.property('maxTaskDuration'),
});

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.VertexTaskAttemptsController = App.TablePageController.extend(App.AutoCounterColumnMixin, {

  controllerName: 'VertexTaskAttemptsController',
  needs: "vertex",

  entityType: 'vertexTaskAttempt',
  baseEntityType: 'taskAttempt',
  filterEntityType: 'vertex',
  filterEntityId: Ember.computed.alias('controllers.vertex.id'),

  cacheDomain: Ember.computed.alias('controllers.vertex.dagID'),

  pollingType: 'attemptInfo',

  pollsterControl: function () {
    if(this.get('dag.status') == 'RUNNING' &&
        this.get('dag.amWebServiceVersion') != '1' &&
        !this.get('loading') &&
        this.get('isActive') &&
        this.get('pollingEnabled') &&
        this.get('rowsDisplayed.length') > 0) {
      this.get('pollster').start();
    }
    else {
      this.get('pollster').stop();
    }
  }.observes('dag.status', 'dag.amWebServiceVersion', 'rowsDisplayed', 'loading', 'isActive', 'pollingEnabled'),

  pollsterOptionsObserver: function () {
    this.set('pollster.options', {
      appID: this.get('dag.applicationId'),
      dagID: this.get('dag.idx'),
      counters: this.get('countersDisplayed'),
      attemptID: this.get('rowsDisplayed').map(function (row) {
          var attemptIndex = App.Helpers.misc.getIndexFromId(row.get('id')),
              taskIndex = App.Helpers.misc.getIndexFromId(row.get('taskID')),
              vertexIndex = App.Helpers.misc.getIndexFromId(row.get('vertexID'));
          return '%@_%@_%@'.fmt(vertexIndex, taskIndex, attemptIndex);
        }).join(',')
    });
  }.observes('dag.applicationId', 'dag.idx', 'rowsDisplayed'),

  countersDisplayed: function () {
    return App.Helpers.misc.getCounterQueryParam(this.get('columns'));
  }.property('columns'),

  beforeLoad: function () {
    var controller = this.get('controllers.vertex'),
        model = controller.get('model');
    return model.reload().then(function () {
      return controller.loadAdditional(model);
    });
  },

  afterLoading: function () {
    var data = this.get('data'),
        isUnsuccessfulVertex = App.Helpers.misc.isStatusInUnsuccessful(
          that.get('controllers.vertex.status')
        );

    data.forEach(function (attempt) {
      var attemptStatus = App.Helpers.misc
        .getFixedupDisplayStatus(attempt.get('status'));
      if (attemptStatus == 'RUNNING' && isUnsuccessfulVertex) {
        attemptStatus = 'KILLED'
      }
      if (attemptStatus != attempt.get('status')) {
        attempt.set('status', attemptStatus);
      }
    });

    return this._super();
  },

  defaultColumnConfigs: function() {
    var that = this;
    return [
      {
        id: 'taskId',
        headerCellName: 'Task Index',
        templateName: 'components/basic-table/linked-cell',
        contentPath: 'taskID',
        getCellContent: function (row) {
          var taskId = row.get('taskID'),
              idPrefix = 'task_%@_'.fmt(row.get('dagID').substr(4));
          return {
            linkTo: 'task',
            entityId: taskId,
            displayText: taskId.indexOf(idPrefix) == 0 ? taskId.substr(idPrefix.length) : taskId
          };
        },
        getSearchValue: function (row) {
          var id = row.get('taskID'),
              idPrefix = 'task_%@_'.fmt(row.get('dagID').substr(4));
          return id.indexOf(idPrefix) == 0 ? id.substr(idPrefix.length) : id;
        }
      },
      {
        id: 'attemptNo',
        headerCellName: 'Attempt No',
        templateName: 'components/basic-table/linked-cell',
        contentPath: 'id',
        getCellContent: function(row) {
          var attemptID = row.get('id') || '';
          return {
            linkTo: 'taskAttempt',
            displayText: attemptID.split(/[_]+/).pop(),
            entityId: attemptID
          };
        },
        getSearchValue: function (row) {
          var attemptID = row.get('id') || '';
          return attemptID.split(/[_]+/).pop();
        },
        getSortValue: function (row) {
          var attemptID = row.get('id') || '';
          return attemptID.split(/[_]+/).pop();
        }
      },
      {
        id: 'status',
        headerCellName: 'Status',
        templateName: 'components/basic-table/status-cell',
        contentPath: 'status',
        observePath: true,
        onSort: this.onInProgressColumnSort.bind(this),
        getCellContent: function(row) {
          var status = App.Helpers.misc.getFixedupDisplayStatus(row.get('status'));
          return {
            status: status,
            statusIcon: App.Helpers.misc.getStatusClassForEntity(status)
          };
        }
      },
      {
        id: 'progress',
        headerCellName: 'Progress',
        contentPath: 'progress',
        observePath: true,
        onSort: this.onInProgressColumnSort.bind(this),
        templateName: 'components/basic-table/progress-cell'
      },
      {
        id: 'startTime',
        headerCellName: 'Start Time',
        contentPath: 'startTime',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('startTime'));
        },
        getSearchValue: function(row) {
          return App.Helpers.date.dateFormat(row.get('startTime'));
        }
      },
      {
        id: 'endTime',
        headerCellName: 'End Time',
        contentPath: 'endTime',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('endTime'));
        },
        getSearchValue: function(row) {
          return App.Helpers.date.dateFormat(row.get('endTime'));
        },
      },
      {
        id: 'duration',
        headerCellName: 'Duration',
        contentPath: 'duration',
        getCellContent: function(row) {
          return App.Helpers.date.timingFormat(row.get('duration'), 1);
        },
        getSearchValue: function(row) {
          return App.Helpers.date.timingFormat(row.get('duration'), 1);
        },
      },
      {
        id: 'containerId',
        headerCellName: 'Container',
        contentPath: 'containerId'
      },
      {
        id: 'nodeId',
        headerCellName: 'Node',
        contentPath: 'nodeId'
      },
      {
        id: 'actions',
        headerCellName: 'Actions',
        templateName: 'components/basic-table/linked-cell',
        searchAndSortable: false,
        contentPath: 'id',
        getCellContent: function(row) {
          var attemptID = row.get('id') || '';
          return {
            linkTo: 'taskAttempt.counters',
            displayText: 'counters',
            entityId: attemptID
          };
        }
      },
      {
        id: 'logs',
        headerCellName: 'Logs',
        templateName: 'components/basic-table/logs-cell',
        searchAndSortable: false,
        getCellContent: function(row) {
          var cellContent = App.Helpers.misc.constructLogLinks(
                row,
                that.get('controllers.vertex.yarnAppState'),
                that.get('controllers.vertex.tezApp.user')
              );

          cellContent.notAvailable = cellContent.viewUrl || cellContent.downloadUrl;
          return cellContent;
        }
      }
    ];
  }.property('controllers.vertex.yarnAppState', 'controllers.vertex.tezApp.user'),

});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.VertexTasksController = App.TablePageController.extend(App.AutoCounterColumnMixin, {

  controllerName: 'VertexTasksController',
  needs: "vertex",

  entityType: 'vertexTask',
  baseEntityType: 'task',
  filterEntityType: 'vertex',
  filterEntityId: Ember.computed.alias('controllers.vertex.id'),

  cacheDomain: Ember.computed.alias('controllers.vertex.dagID'),

  pollingType: 'taskInfo',

  pollsterControl: function () {
    if(this.get('dag.status') == 'RUNNING' &&
        this.get('dag.amWebServiceVersion') != '1' &&
        !this.get('loading') && this.get('isActive') &&
        this.get('pollingEnabled') &&
        this.get('rowsDisplayed.length') > 0) {
      this.get('pollster').start();
    }
    else {
      this.get('pollster').stop();
    }
  }.observes('dag.status', 'dag.amWebServiceVersion', 'rowsDisplayed', 'loading', 'isActive', 'pollingEnabled'),

  pollsterOptionsObserver: function () {
    this.set('pollster.options', {
      appID: this.get('dag.applicationId'),
      dagID: this.get('dag.idx'),
      counters: this.get('countersDisplayed'),
      taskID: this.get('rowsDisplayed').map(function (row) {
          var taskIndex = App.Helpers.misc.getIndexFromId(row.get('id')),
          vertexIndex = App.Helpers.misc.getIndexFromId(row.get('vertexID'));
          return '%@_%@'.fmt(vertexIndex, taskIndex);
        }).join(',')
    });
  }.observes('dag.applicationId', 'dag.idx', 'rowsDisplayed'),

  countersDisplayed: function () {
    return App.Helpers.misc.getCounterQueryParam(this.get('columns'));
  }.property('columns'),

  beforeLoad: function () {
    var controller = this.get('controllers.vertex'),
        model = controller.get('model');
    return model.reload().then(function () {
      return controller.loadAdditional(model);
    });
  },

  afterLoad: function () {
    var data = this.get('data'),
        isUnsuccessfulVertex = App.Helpers.misc.isStatusInUnsuccessful(
          this.get('controllers.vertex.status')
        );

    data.forEach(function (task) {
      var taskStatus = App.Helpers.misc.getFixedupDisplayStatus(task.get('status'));

      if (taskStatus == 'RUNNING' && isUnsuccessfulVertex) {
        taskStatus = 'KILLED'
      }
      if (taskStatus != task.get('status')) {
        task.set('status', taskStatus);
      }
    });

    return this._super();
  },

  defaultColumnConfigs: function() {
    var that = this;

    function getLogContent(attempt) {
      var cellContent = App.Helpers.misc.constructLogLinks(
            attempt,
            that.get('controllers.vertex.yarnAppState'),
            that.get('controllers.vertex.tezApp.user')
          );

      cellContent.notAvailable = cellContent.viewUrl || cellContent.downloadUrl;
      return cellContent;
    }

    return [
      {
        id: 'id',
        headerCellName: 'Task Index',
        templateName: 'components/basic-table/linked-cell',
        contentPath: 'id',
        getCellContent: function (row) {
          var id = row.get('id'),
              idPrefix = 'task_%@_'.fmt(row.get('dagID').substr(4));
          return {
            linkTo: 'task',
            entityId: id,
            displayText: id.indexOf(idPrefix) == 0 ? id.substr(idPrefix.length) : id
          };
        },
        getSearchValue: function (row) {
          var id = row.get('id'),
              idPrefix = 'task_%@_'.fmt(row.get('dagID').substr(4));
          return id.indexOf(idPrefix) == 0 ? id.substr(idPrefix.length) : id;
        }
      },
      {
        id: 'status',
        headerCellName: 'Status',
        templateName: 'components/basic-table/status-cell',
        contentPath: 'status',
        observePath: true,
        onSort: this.onInProgressColumnSort.bind(this),
        getCellContent: function(row) {
          var status = row.get('status');
          return {
            status: status,
            statusIcon: App.Helpers.misc.getStatusClassForEntity(status,
              row.get('hasFailedTaskAttempts'))
          };
        }
      },
      {
        id: 'progress',
        headerCellName: 'Progress',
        contentPath: 'progress',
        observePath: true,
        onSort: this.onInProgressColumnSort.bind(this),
        templateName: 'components/basic-table/progress-cell'
      },
      {
        id: 'startTime',
        headerCellName: 'Start Time',
        contentPath: 'startTime',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('startTime'));
        },
        getSearchValue: function(row) {
          return App.Helpers.date.dateFormat(row.get('startTime'));
        }
      },
      {
        id: 'endTime',
        headerCellName: 'End Time',
        contentPath: 'endTime',
        getCellContent: function(row) {
          return App.Helpers.date.dateFormat(row.get('endTime'));
        },
        getSearchValue: function(row) {
          return App.Helpers.date.dateFormat(row.get('endTime'));
        },
      },
      {
        id: 'duration',
        headerCellName: 'Duration',
        contentPath: 'duration',
        getCellContent: function(row) {
          return App.Helpers.date.timingFormat(row.get('duration'), 1);
        },
        getSearchValue: function(row) {
          return App.Helpers.date.timingFormat(row.get('duration'), 1);
        },
      },
      {
        id: 'actions',
        headerCellName: 'Actions',
        templateName: 'components/basic-table/task-actions-cell',
        contentPath: 'id',
        searchAndSortable: false
      },
      {
        id: 'logs',
        headerCellName: 'Logs',
        templateName: 'components/basic-table/logs-cell',
        searchAndSortable: false,
        getCellContent: function(row) {
          var taskAttemptId = row.get('successfulAttemptId') || row.get('attempts.lastObject'),
              store = that.get('store');

          if (taskAttemptId) {
            return store.find('taskAttempt', taskAttemptId).then(getLogContent);
          }
        }
      }
    ];
  }.property('controllers.vertex.yarnAppState', 'controllers.vertex.tezApp.user')

});

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.BasicTableComponent = Em.Component.extend({
  layoutName: 'components/basic-table',

  sortColumnId: '',
  sortOrder: '',

  searchText: '',
  searchRegEx: null,
  searchColumnNames: null,

  statusMessage: null,

  isSorting: false,
  isSearching: false,

  pageNum: 1,
  rowCount: 10,
  rowCountOptions: [5, 10, 25, 50, 100],
  pageNavOnFooterAt: 25,

  _sortedRows: null,

  init: function () {
    this._super();
    if(this.get('searchText')) {
      this._searchObserver();
    }
    this._sortObserver();
  },

  totalPages: function () {
    return Math.ceil(this.get('_searchedRows.length') / this.get('rowCount'));
  }.property('_searchedRows.length', 'rowCount'),

  hasPageNavOnFooter: function () {
    return this.get('enablePagination') && this.get('_rows.length') >= this.get('pageNavOnFooterAt');
  }.property('enablePagination', '_rows.length', 'pageNavOnFooterAt'),

  _showHeader: function () {
    return this.get('enableSearch') ||
        this.get('enablePagination') ||
        this.get('extraHeaderItem') ||
        this.get('_statusMessage');
  }.property('enableSearch', 'enablePagination', 'extraHeaderItem', '_statusMessage'),

  _statusMessage: function() {
    if(this.get('enableStatus') == false) {
      return null;
    }
    if(this.get('isSorting')) {
      return "Sorting...";
    }
    else if(this.get('isSearching')) {
      return "Searching...";
    }
    return this.get('statusMessage');
  }.property('isSearching', 'isSorting', 'statusMessage', 'enableStatus'),

  _pageNumResetObserver: function () {
    this.set('pageNum', 1);
  }.observes('searchRegEx', 'rowCount'),

  _searchedRows: function () {
    var regex = this.get('searchRegEx'),
        rows = this.get('_sortedRows') || [],
        searchColumnNames,
        columns;

    function checkRow(column) {
      var value;
      if(!column.get('searchAndSortable')) {
        return false;
      }
      value = column.getSearchValue(this);
      return (typeof value == 'string') ? value.match(regex) : false;
    }

    this.set('isSearching', false);

    if(!regex) {
      return rows;
    }
    else {
      searchColumnNames = this.get('searchColumnNames'),
      columns = searchColumnNames ? this.get('columns').filter(function (column) {
        return searchColumnNames.indexOf(column.get('headerCellName')) != -1;
      }) : this.get('columns');

      return rows.filter(function (row) {
        return columns.some(checkRow, row);
      });
    }
  }.property('columns.@each', '_sortedRows.@each', 'searchRegEx'),

  _columns: function () {
    var columns = this.get('columns'),
        widthPercentageToFit = 100 / columns.length;

      columns.map(function (column) {
        var templateName = column.get('templateName'),
            cellOptions = {
              column: column
            };

        if(templateName) {
          cellOptions.templateName = templateName;
        }

        column.setProperties({
          width: widthPercentageToFit + "%",
          cellView: App.BasicTableComponent.CellView.extend(cellOptions),
          headerCellView: App.BasicTableComponent.HeaderCellView.extend({
            column: column,
            table: this
          })
        });
      });

    return columns;
  }.property('columns'),

  _rows: function () {
    var startIndex = (this.get('pageNum') - 1) * this.get('rowCount'),
        rows = this.get('_searchedRows').slice(startIndex, startIndex + this.get('rowCount'));
    this.sendAction('rowsChanged', rows);
    return rows;
  }.property('_searchedRows.@each', 'rowCount', 'pageNum'),

  _searchObserver: function () {
    var searchText = this.get('searchText'),
        columnNames = [],
        delimIndex,
        rowsCount,
        that = this;

    if(searchText) {
      delimIndex = searchText.indexOf(':');
      if(delimIndex != -1) {
        columnNames = searchText.substr(0, delimIndex).
          split(",").
          reduce(function (arr, columnName) {
            columnName = columnName.trim();
            if(columnName) {
              arr.push(columnName);
            }
            return arr;
          }, []);
        searchText = searchText.substr(delimIndex + 1);
      }
      searchText = searchText.trim();
    }

    rowsCount = this.get('rows.length');

    if(rowsCount) {
      this.set('isSearching', true);

      Ember.run.later(function () {
        that.setProperties({
          searchRegEx: searchText ? new RegExp(searchText, 'im') : null,
          searchColumnNames: columnNames.length ? columnNames : null
        });
      }, 400);
    }
  }.observes('searchText'),

  _sortObserver: function () {
    var rows = this.get('rows'),
        column = this.get('columns').findBy('id', this.get('sortColumnId')),
        ascending = this.get('sortOrder') == 'asc',
        that = this;

    if(rows && rows.get('length') > 0 && column) {
      this.set('isSorting', true);

      Ember.run.later(function () {
        /*
         * Creating sortArray as calling getSortValue form inside the
         * sort function would be more costly.
         */
        var sortArray = rows.map(function (row) {
          return {
            value: column.getSortValue(row),
            row: row
          };
        });

        sortArray.sort(function (a, b){
          if(ascending ^ (a.value > b.value)) {
            return -1;
          }
          else if(ascending ^ (a.value < b.value)) {
            return 1;
          }
          return 0;
        });

        that.setProperties({
          _sortedRows: sortArray.map(function (record) {
            return record.row;
          }),
          isSorting: false
        });

      }, 400);
    }
    else {
      this.set('_sortedRows', rows);
    }
  }.observes('sortColumnId', 'sortOrder', 'rows.@each'),

  actions: {
    search: function (searchText) {
      this.set('searchText', searchText);
    },
    sort: function (columnId) {
      if(this.get('sortColumnId') != columnId) {
        this.setProperties({
          sortColumnId: columnId,
          sortOrder: 'asc'
        });
      }
      else {
        this.set('sortOrder', this.get('sortOrder') == 'asc' ? 'desc' : 'asc');
      }
    },

    changePage: function (pageNum) {
      this.set('pageNum', pageNum);
    }
  }
});

Em.Handlebars.helper('basic-table-component', App.BasicTableComponent);


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var ObjectPromiseController = Ember.ObjectController.extend(Ember.PromiseProxyMixin);

function stringifyNumbers(content) {
  var displayText = content.displayText;
  if(typeof displayText == 'number') {
    content.displayText = displayText.toString();
  }
  return content;
}

App.BasicTableComponent.CellView = Ember.View.extend({
  templateName: function () {
    var template = this.get('column.observePath') ? 'bounded-basic-cell' : 'basic-cell';
    return 'components/basic-table/' + template;
  }.property('column.observePath'),

  classNames: ['cell-content'],

  value: null,
  observedPath: null,

  _addObserver: function (path) {
    this._removeObserver();
    this.get('row').addObserver(path, this, this._onValueChange);
    this.set('observedPath', path);
  },

  _removeObserver: function (path) {
    var path = this.get('observedPath');
    if(path) {
      this.get('row').removeObserver(path, this, this._onValueChange);
      this.set('observedPath', null);
    }
  },

  _normalizeContent: function (content) {
    return stringifyNumbers(content && typeof content == 'object' ? content : {
      displayText: content
    });
  },

  _pathObserver: function () {
    var path = this.get('column.contentPath');
    if(path && this.get('column.observePath')) {
      this._addObserver(path);
    }
  }.observes('row', 'column.contentPath', 'column.observePath').on('init'),

  _onValueChange: function (row, path) {
    this.set('value', row.get(path));
  },

  cellContent: function () {
    var cellContent = this.get('column').getCellContent(this.get('row'));

    if(cellContent && $.isFunction(cellContent.then)) {
      return ObjectPromiseController.create({
        promise: cellContent.then(this._normalizeContent)
      });
    }

    return this._normalizeContent(cellContent);
  }.property('row', 'column', 'value'),

  willDestroy: function () {
    this._removeObserver();
  }
});

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.BasicTableComponent.ColumnDefinition = (function () {
  function getContentAtPath(row) {
    var contentPath = this.get('contentPath');

    if(contentPath) {
      return row.get(contentPath);
    }
    else {
      throw new Error("contentPath not set!");
    }
  }

  return Em.Object.extend({
    contentPath: null,
    headerCellName: "Not Available!",
    searchAndSortable: true,

    onSort: null,

    width: "",

    customStyle: function () {
      return 'width:%@'.fmt(this.get('width'));
    }.property('width'),

    getSearchValue: getContentAtPath,
    getSortValue: getContentAtPath,
    getCellContent: getContentAtPath
  });
})();



})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.BasicTableComponent.HeaderCellView = Ember.View.extend({
  templateName: 'components/basic-table/header-cell',

  sortIconCSS: function () {
    var css = 'sort-icon ';
    if(this.get('column.searchAndSortable') == false) {
      css = 'no-display';
    }
    else if(this.get('parentView.sortColumnId') == this.get('column.id')) {
      css += this.get('parentView.sortOrder');
    }

    return css;
  }.property('parentView.sortOrder', 'parentView.sortColumnId', 'column.searchAndSortable'),

  _onColResize: function (event) {
    var data = event.data;

    if(!data.startEvent) {
      data.startEvent = event;
    }

    data.thisHeader.set(
      'column.width',
      (data.startWidth + event.clientX - data.startEvent.clientX) + 'px'
    );
  },

  _endColResize: function (event) {
    var thisHeader = event.data.thisHeader;
    $(document).off('mousemove', thisHeader._onColResize);
    $(document).off('mouseup', thisHeader._endColResize);
  },

  actions: {
    sort: function () {
      var column = this.get('column'),
          onSort = column.get('onSort');

      if(!onSort || onSort.call(column, column)) {
        this.get('parentView').send('sort', this.get('column.id'));
      }
    },
    startColResize: function () {
      var mouseTracker = {
        thisHeader: this,
        startWidth: $(this.get('element')).width(),
        startEvent: null
      };
      $(document).on('mousemove', mouseTracker, this._onColResize);
      $(document).on('mouseup', mouseTracker, this._endColResize);
    }
  }
});

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.BasicTableComponent.PaginationView = Ember.View.extend({
  templateName: 'components/basic-table/pagination-view',

  classNames: ['pagination-view'],

  atFirst: function () {
    return this.get('pageNum') == 1;
  }.property('pageNum'),

  atLast: function () {
    return this.get('pageNum') == this.get('totalPages');
  }.property('pageNum', 'totalPages'),

  _possiblePages: function () {
    var pageNum = this.get('pageNum'),
        totalPages = this.get('totalPages'),
        possiblePages = [],
        startPage = 1,
        endPage = totalPages,
        delta = 0;

    if(totalPages > 5) {
      startPage = pageNum - 2, endPage = pageNum + 2;

      if(startPage < 1) {
        delta = 1 - startPage;
      }
      else if(endPage > totalPages) {
        delta = totalPages - endPage;
      }

      startPage += delta, endPage += delta;
    }

    while(startPage <= endPage) {
      possiblePages.push({
        isCurrent: startPage == pageNum,
        pageNum: startPage++
      });
    }

    return possiblePages;
  }.property('pageNum', 'totalPages'),
});

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.BasicTableComponent.SearchView = Ember.View.extend({
  templateName: 'components/basic-table/search-view',

  classNames: ['search-view'],

  text: '',
  _boundText: function () {
    return this.get('text') || '';
  }.property(),

  _validRegEx: function () {
    var regExText = this.get('_boundText');
    regExText = regExText.substr(regExText.indexOf(':') + 1);
    try {
      new RegExp(regExText, 'im');
    }
    catch(e) {
      return false;
    }
    return true;
  }.property('_boundText'),

  actions: {
    search: function () {
      if(this.get('_validRegEx')) {
        this.get('parentView').send('search', this.get('_boundText'));
      }
    }
  }
});

})();

(function() {

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

Bootstrap.BsProgressAnimatedComponent = Bootstrap.BsProgressComponent.extend({
 progressDecimal: null,

 init: function () {
   this._super.call(this, arguments);
   this.progressDecimalObserver();
   this.progressObserver();
 },

 progressDecimalObserver: function () {
   var progress = parseFloat(this.get('progressDecimal'));
   progress = (typeof progress == 'number' && !isNaN(progress)) ? progress : 0;
   this.set('progress', parseInt(progress * 100).toString());
 }.observes('progressDecimal'),

 progressObserver: function () {
   var progressing = this.get('progress') < 100;
   this.setProperties({
     stripped: progressing,
     animated: progressing
   });
 }.observes('progress')
});

Ember["TEMPLATES"]["components/bs-progressbar"] = Ember.Handlebars.
    template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  var buffer = '', escapeExpression=this.escapeExpression;

  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember.Handlebars.helpers);
  data = data || {};

  data.buffer.push("<span class=\"sr-only\">");
  data.buffer.push(escapeExpression(helpers._triageMustache.call(
    depth0,
    "progress",
    {hash:{},contexts:[depth0],types:["ID"],hashContexts:{},hashTypes:{},data:data}
  )));
  data.buffer.push("%</span>");
  return buffer;
});

Ember.Handlebars.helper('bs-progress-animated', Bootstrap.BsProgressAnimatedComponent);


})();

(function() {

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

App.CodeMirrorComponent = Em.Component.extend({
  tagName: 'textarea',

  value: null,

  mode: 'text/x-hive',
  theme: 'default',
  indentUnit: 2,
  smartIndent: true,
  tabSize: 4,
  electricChars: true,
  lineWrapping: true,
  lineNumbers: true,
  readOnly: true,
  autofocus: false,
  dragDrop: false,

  _init:  Em.on('didInsertElement', function() {
    var codeMirror = CodeMirror.fromTextArea(this.get('element'));

    this.set('codeMirror', codeMirror);

    // Set up bindings for CodeMirror options.
    this._bindCodeMirrorOption('mode');
    this._bindCodeMirrorOption('theme');
    this._bindCodeMirrorOption('indentUnit');
    this._bindCodeMirrorOption('smartIndent');
    this._bindCodeMirrorOption('tabSize');
    this._bindCodeMirrorOption('electricChars');
    this._bindCodeMirrorOption('lineWrapping');
    this._bindCodeMirrorOption('lineNumbers');
    this._bindCodeMirrorOption('readOnly');
    this._bindCodeMirrorOption('autofocus');
    this._bindCodeMirrorOption('dragDrop');

    this._bindProperty('value', this, '_valueDidChange');
    this._valueDidChange();

    this.on('becameVisible', codeMirror, 'refresh');
  }),

  _bindCodeMirrorOption: function(key) {
    this._bindProperty(key, this, '_optionDidChange');

    // Set the initial option synchronously.
    this._optionDidChange(this, key);
  },

  _bindProperty: function(key, target, method) {
    this.addObserver(key, target, method);

    this.on('willDestroyElement', function() {
      this.removeObserver(key, target, method);
    })
  },

  _optionDidChange: function(sender, key) {
    this.get('codeMirror').setOption(key, this.get(key));
  },

  _valueDidChange: function() {
    var codeMirror = this.get('codeMirror'),
        value = this.get('value') || '';

    if (this.get('codeMirror').getValue() != value) {
      codeMirror.setValue(value);
    }
  }
});


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.CounterTableComponent = Em.Component.extend({
  layoutName: 'components/counter-table',
  nameFilter: null,

  validFilter: function () {
    try {
      new RegExp(this.get('nameFilter'), 'i');
      return true;
    }
    catch(e){}
    return false;
  }.property('nameFilter'),

  filteredData: function() {
    var rawData = this.get('data') || [];
    if (Em.isEmpty(this.nameFilter) || !this.get('validFilter')) {
      return rawData;
    }

    var filtered = [],
        filterStringRegex = new RegExp(this.nameFilter, 'i');

    rawData.forEach(function(cg) {
      var tmpcg = {
        counterGroupName: cg['counterGroupName'],
        counterGroupDisplayName: cg['counterGroupDisplayName'] || cg['counterGroupName'],
        counters: []
      };

      var counters = cg['counters'] || [];
      counters.forEach(function(counter) {
        if (filterStringRegex.test(counter['counterDisplayName'] || counter['counterName'])) {
          tmpcg.counters.push(counter);
        }
      });

      // show counter groups only if filter match is not empty.
      if (tmpcg.counters.length > 0) {
        filtered.push(tmpcg);
      }
    })

    return filtered;
  }.property('data', 'nameFilter', 'timeStamp')
});

Em.Handlebars.helper('counter-table-component', App.CounterTableComponent);


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * 'License'); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.DagViewComponent = Em.Component.extend({
  layoutName: 'components/dag-view',

  classNames: ['dag-view-container'],

  errMessage: null,

  isHorizontal: false,
  hideAdditionals: false,
  isFullscreen: false,

  _onOrientationChange: function () {
  }.observes('isHorizontal'),

  _onTglAdditionals: function () {
    App.DagViewComponent.graphView.additionalDisplay(this.get('hideAdditionals'));
  }.observes('hideAdditionals'),

  _onTglFullScreen: function () {
    App.Helpers.fullscreen.toggle(this.get('element'));
  }.observes('isFullscreen'),

  actions: {
    tglOrientation: function() {
      var isTopBottom = App.DagViewComponent.graphView.toggleLayouts();
      this.set('isHorizontal', !isTopBottom);
    },
    tglAdditionals: function() {
      this.set('hideAdditionals', !this.get('hideAdditionals'));
    },
    fullscreen: function () {
      this.set('isFullscreen', !this.get('isFullscreen'));
    },
    fitGraph: function () {
      App.DagViewComponent.graphView.fitGraph();
    },
    configure: function () {
      this.sendAction('configure');
    }
  },

  didInsertElement: function () {
    var result = App.DagViewComponent.dataProcessor.graphifyData(this.get('data')),
        maxBreadth = 0;

    if(typeof result === "string") {
      this.set('errMessage', result);
    }
    else {
      App.DagViewComponent.graphView.create(
        this,
        this.get('element'),
        result
      );
    }
  }

});

Em.Handlebars.helper('dag-view-component', App.DagViewComponent);

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * 'License'); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The data processing part of Dag View.
 *
 * Converts raw DAG-plan into an internal data representation as shown below.
 * Data processor exposes just a functions and an enum to the outside world, everything else
 * happens inside the main closure:
 *   - types (Enum of node types)
 *   - graphifyData
 *
 * Links, Edges:
 * --------------
 * d3 layout & graph-view uses the term links, and dag-plan uses edges. Hence you would
 * see both getting used in this file.
 *
 * Graphify Data
 * -------------
 *  graphifyData function is a translator that translates the dagPlan object send by timeline server
 * into another object that graph-view and in turn d3.layout.tree can digest.
 *
 * Input object(dag-plan as it is from the timeline server):
 *  {
 *    dagName, version,
 *    vertices: [ // Array of vertex objects with following properties
 *      {
 *        vertexName, processorClass, outEdgeIds {Array}, additionalInputs {Array}
 *      }
 *    ],
 *    edges: [ // Array of edge objects with following properties
 *      {
 *        edgeId, inputVertexName, outputVertexName, dataMovementType, dataSourceType
 *        schedulingType, edgeSourceClass, edgeDestinationClass
 *      }
 *    ],
 *    vertexGroups: [ // Array of vectorGroups objects with following properties
 *      {
 *        groupName, groupMembers {Array}, edgeMergedInputs {Array}
 *      }
 *    ]
 *  }
 *
 * Output object:
 *  We are having a graph that must be displayed like a tree. Hence data processor was created
 *  to make a tree structure out of the available data. The tree structure is made by creating
 *  DataNodes instances and populating their children array with respective child DataNodes
 *   - tree: Represents the tree structure with each node being a DataNodes instance
 *   - links: Represents the connections between the nodes to create the graph
 *    {
 *      tree: { // This object points to the RootDataNode instance
 *        children {Array} // Array of DataNodes under the node, as expected by d3.layout.tree
 *        + Other custom properties including data that needs to be displayed
 *      }
 *      links: [ // An array of all links in the tree
 *        {
 *          sourceId // Source vertex name
 *          targetId // Target vertex name
 *          + Other custom properties including data to be displayed
 *        }
 *      ]
 *      maxDepth, leafCount
 *    }
 *
 * Data Nodes:
 * -----------
 *  To make the implementation simpler each node in the graph will be represented as an
 *  instance of any of the 4 inherited classes of Data Node abstract class.
 *  DataNode
 *    |-- RootDataNode
 *    |-- VertexDataNode
 *    |-- InputDataNode
 *    +-- OutputDataNode
 *
 * Extra Nodes:
 * ------------
 * Root Node (Invisible):
 *  Dag view support very complex DAGs, even those without interconnections and backward links.
 *  Hence to fit it into a tree layout I have inserted an invisible root node.
 *
 * Dummy Node (Invisible):
 *  Sinks of a vertex are added at the same level of its parent node, Hence to ensure that all 
 *  nodes come under the root, a dummy node was added as the child of the root. The visible tree
 *  would be added as child of dummy node.
 *  Dummy also ensures the view symmetry when multiple outputs are present at the dummy level.
 *
 * Sample Structure, inverted tree representation:
 *
 *            As in the view
 *
 *               Source_m1
 *                  |
 *   Source_m2      M1----------+
 *      |           |           |
 *      +-----------M2      Sink_M1
 *                  |
 *      +-----------R1----------+
 *      |                       |
 *   Sink1_R1               Sink2_R1
 *
 *
 *        Internal representation
 *
 *               Source_m1
 *                  |
 *   Source_m2      M1
 *      |           |
 *      +-----------M2      Sink_M1
 *                  |           |
 *                  R1----------+
 *                  |
 *   Sink1_R1     Dummy     Sink2_R1
 *      |           |           |
 *      +-----------+-----------+
 *                  |
 *                 Root
 *
 *     Internal data representation
 *
 *     Root
 *      |
 *      +-- children[Sink1_R1, Dummy, Sink2_R1]
 *                              |
 *                              +-- children[R1]
 *                                            |
 *                                            +-- children[M2, Sink_M1]
 *                                                          |
 *                                                          +-- children[Source_m2, M1]
 *                                                                                   |
 *                                                                                   +-- children[Source_m1]
 *
 * Steps:
 * ------
 * The job is done in 4 steps, and is modularized using 4 separate recursive functions.
 * 1. _treefyData      : Get the tree structure in place with vertices and inputs/sources
 * 2. _addOutputs      : Add outputs/sinks. A separate step had to be created as outputs
 *                       are represented in the opposite direction of inputs.
 * 3. _cacheChildren   : Make a cache of children in allChildren property for later use
 * 4. _getGraphDetails : Get a graph object with all the required details
 *
 */
App.DagViewComponent.dataProcessor = (function (){
  /**
   * Enum of various node types
   */
  var types = {
    ROOT: 'root',
    DUMMY: 'dummy',
    VERTEX: 'vertex',
    INPUT: 'input',
    OUTPUT: 'output'
  };

  /**
   * Iterates the array in a symmetric order, from middle to outwards
   * @param array {Array} Array to be iterated
   * @param callback {Function} Function to be called for each item
   * @return A new array created with value returned by callback
   */
  function centericMap(array, callback) {
    var retArray = [],
        length,
        left, right;

    if(array) {
      length = array.length - 1,
      left = length >> 1;

      while(left >= 0) {
        retArray[left] = callback(array[left]);
        right = length - left;
        if(right != left) {
          retArray[right] = callback(array[right]);
        }
        left--;
      }
    }
    return retArray;
  }

  /**
   * Abstract class for all types of data nodes
   */
  var DataNode = Em.Object.extend({
        init: function (data) {
          this._super(data);
          this._init(data);
        },
        _init: function () {
          // Initialize data members
          this.setProperties({
            /**
             * Children that would be displayed in the view, to hide a child it would be removed from this array.
             * Not making this a computed property because - No d3 support, low performance.
             */
            children: null,
            allChildren: null, // All children under this node
            treeParent: null,  // Direct parent DataNode in our tree structure
          });
        },

        /**
         * Private function.
         * Set the child array as it is. Created because of performance reasons.
         * @param children {Array} Array to be set
         */
        _setChildren: function (children) {
          this.set('children', children && children.length > 0 ? children : null);
        },
        /**
         * Public function.
         * Set the child array after filtering
         * @param children {Array} Array of DataNodes to be set
         */
        setChildren: function (children) {
          var allChildren = this.get('allChildren');
          if(allChildren) {
            this._setChildren(allChildren.filter(function (child) {
              return children.indexOf(child) != -1; // true if child is in children
            }));
          }
        },
        /**
         * Filter out the given children from the children array.
         * @param childrenToRemove {Array} Array of DataNodes to be removed
         */
        removeChildren: function (childrenToRemove) {
          var children = this.get('children');
          if(children) {
            children = children.filter(function (child) {
              return childrenToRemove.indexOf(child) == -1; // false if child is in children
            });
            this._setChildren(children);
          }
        },

        /**
         * Return true if this DataNode is same as or the ancestor of vertex
         * @param vertex {DataNode}
         */
        isSelfOrAncestor: function (vertex) {
          while(vertex) {
            if(vertex === this) return true;
            vertex = vertex.treeParent;
          }
          return false;
        },

        /**
         * If the property is available, expects it to be an array and iterate over
         * its elements using the callback.
         * @param vertex {DataNode}
         * @param callback {Function}
         * @param thisArg {} Will be value of this inside the callback
         */
        ifForEach: function (property, callback, thisArg) {
          if(this.get(property)) {
            this.get(property).forEach(callback, thisArg);
          }
        },
        /**
         * Recursively call the function specified in all children
         * its elements using the callback.
         * @param functionName {String} Name of the function to be called
         */
        recursivelyCall: function (functionName) {
          if(this[functionName]) {
            this[functionName]();
          }
          this.ifForEach('children', function (child) {
            child.recursivelyCall(functionName);
          });
        }
      }),
      RootDataNode = DataNode.extend({
        type: types.ROOT,
        vertexName: 'root',
        dummy: null, // Dummy node used in the tree, check top comments for explanation
        depth: 0,    // Depth of the node in the tree structure

        _init: function () {
          this._setChildren([this.get('dummy')]);
        }
      }),
      VertexDataNode = DataNode.extend({
        type: types.VERTEX,

        _additionalsIncluded: true,

        _init: function () {
          this._super();

          // Initialize data members
          this.setProperties({
            id: this.get('vertexName'),
            inputs: [], // Array of sources
            outputs: [] // Array of sinks
          });

          this.ifForEach('additionalInputs', function (input) {
            this.inputs.push(InputDataNode.instantiate(this, input));
          }, this);

          this.ifForEach('additionalOutputs', function (output) {
            this.outputs.push(OutputDataNode.instantiate(this, output));
          }, this);
        },

        /**
         * Sets depth of the vertex and all its input children
         * @param depth {Number}
         */
        setDepth: function (depth) {
          this.set('depth', depth);

          depth++;
          this.get('inputs').forEach(function (input) {
            input.set('depth', depth);
          });
        },

        /**
         * Sets vertex tree parents
         * @param parent {DataNode}
         */
        setParent: function (parent) {
          this.set('treeParent', parent);
        },

        /**
         * Include sources and sinks in the children list, so that they are displayed
         */
        includeAdditionals: function() {
          this.setChildren(this.get('inputs').concat(this.get('children') || []));

          var ancestor = this.get('parent.parent');
          if(ancestor) {
            ancestor.setChildren(this.get('outputs').concat(ancestor.get('children') || []));
          }
          this.set('_additionalsIncluded', true);
        },
        /**
         * Exclude sources and sinks in the children list, so that they are hidden
         */
        excludeAdditionals: function() {
          this.removeChildren(this.get('inputs'));

          var ancestor = this.get('parent.parent');
          if(ancestor) {
            ancestor.removeChildren(this.get('outputs'));
          }
          this.set('_additionalsIncluded', false);
        },
        /**
         * Toggle inclusion/display of sources and sinks.
         */
        toggleAdditionalInclusion: function () {
          var include = !this.get('_additionalsIncluded');
          this.set('_additionalsIncluded', include);

          if(include) {
            this.includeAdditionals();
          }
          else {
            this.excludeAdditionals();
          }
        }
      }),
      InputDataNode = $.extend(DataNode.extend({
        type: types.INPUT,
        vertex: null, // The vertex DataNode to which this node is linked

        _init: function () {
          var vertex = this.get('vertex');
          this._super();

          // Initialize data members
          this.setProperties({
            id: vertex.get('vertexName') + this.get('name'),
            depth: vertex.get('depth') + 1
          });
        }
      }), {
        /**
         * Initiate an InputDataNode
         * @param vertex {DataNode}
         * @param data {Object}
         */
        instantiate: function (vertex, data) {
          return InputDataNode.create($.extend(data, {
            treeParent: vertex,
            vertex: vertex
          }));
        }
      }),
      OutputDataNode = $.extend(DataNode.extend({
        type: types.OUTPUT,
        vertex: null, // The vertex DataNode to which this node is linked

        _init: function (data) {
          this._super();

          // Initialize data members
          this.setProperties({
            id: this.get('vertex.vertexName') + this.get('name')
          });
        }
      }), {
        /**
         * Initiate an OutputDataNode
         * @param vertex {DataNode}
         * @param data {Object}
         */
        instantiate: function (vertex, data) {
          /**
           * We will have an idea about the treeParent & depth only after creating the
           * tree structure.
           */
          return OutputDataNode.create($.extend(data, {
            vertex: vertex
          }));
        }
      });

  var _data = null; // Raw dag plan data

  /**
   * Step 1: Recursive
   * Creates primary skeletal structure with vertices and inputs as nodes,
   * All child vertices & inputs will be added to an array property named children
   * As we are trying to treefy graph data, nodes might reoccur. Reject if its in
   * the ancestral chain, and if the new depth is lower (Higher value) than the old
   * reposition the node.
   *
   * @param vertex {VertexDataNode} Root vertex of current sub tree
   * @param depth {Number} Depth of the passed vertex
   * @param vertex {VertexDataNode}
   */
  function _treefyData(vertex, depth) {
    var children,
        parentChildren;

    depth++;

    children = centericMap(vertex.get('inEdgeIds'), function (edgeId) {
      var child = _data.vertices.get(_data.edges.get(edgeId).get('inputVertexName'));
      if(!child.isSelfOrAncestor(vertex)) {
        if(child.depth) {
          if(child.depth < depth) {
            parentChildren = child.get('treeParent.children');
            if(parentChildren) {
              parentChildren.removeObject(child);
            }
          }
          else {
            return;
          }
        }
        child.setParent(vertex);
        return _treefyData(child, depth);
      }
    });

    // Remove undefined entries
    children = children.filter(function (child) {
      return child;
    });

    vertex.setDepth(depth);

    // Adds a dummy child to intermediate inputs so that they
    // gets equal relevance as adjacent nodes on plotting the tree!
    if(children.length) {
      vertex.ifForEach('inputs', function (input) {
        input._setChildren([DataNode.create()]);
      });
    }

    children.push.apply(children, vertex.get('inputs'));

    vertex._setChildren(children);
    return vertex;
  }

  /**
   * Part of step 1
   * To remove recurring vertices in the tree
   * @param vertex {Object} root vertex
   */
  function _normalizeVertexTree(vertex) {
    var children = vertex.get('children');

    if(children) {
      children = children.filter(function (child) {
        _normalizeVertexTree(child);
        return child.get('type') != 'vertex' || child.get('treeParent') == vertex;
      });

      vertex._setChildren(children);
    }

    return vertex;
  }

  /**
   * Step 2: Recursive awesomeness
   * Attaches outputs into the primary structure created in step 1. As outputs must be represented
   * in the same level of the vertex's parent. They are added as children of its parent's parent.
   *
   * The algorithm is designed to get a symmetric display of output nodes.
   * A call to the function will iterate through all its children, and inserts output nodes at the
   * position that best fits the expected symmetry.
   *
   * @param vertex {VertexDataNode}
   * @return {Object} Nodes that would come to the left and right of the vertex.
   */
  function _addOutputs(vertex) {
    var childVertices = vertex.get('children'),
        childrenWithOutputs = [],

        midIndex,
        tree,

        left = [],
        right = [];

    // For a symmetric display of output nodes
    if(childVertices && childVertices.length) {
      midIndex = Math.floor(childVertices.length / 2);
      if(childVertices.length % 2 == 0) {
        midIndex--;
      }

      childVertices.forEach(function (child, index) {
        var additionals = _addOutputs(child),
            outputs,
            mid;

        childrenWithOutputs.push.apply(childrenWithOutputs, additionals.left);
        childrenWithOutputs.push(child);
        childrenWithOutputs.push.apply(childrenWithOutputs, additionals.right);

        outputs = child.get('outputs');
        if(outputs && outputs.length) {
          mid = outputs.length / 2;

          outputs.forEach(function (output) {
            output.depth = vertex.depth;
          });

          if(index < midIndex) {
            left.push.apply(left, outputs);
          }
          else if(index > midIndex) {
            right.push.apply(right, outputs);
          }
          else {
            left.push.apply(left, outputs.slice(mid));
            right.push.apply(right, outputs.slice(0, mid));
          }
        }
      });

      vertex._setChildren(childrenWithOutputs);
    }

    return {
      left: left,
      right: right
    };
  }

  /**
   * Step 3: Recursive
   * Create a copy of all possible children in allChildren for later use
   * @param node {DataNode}
   */
  function _cacheChildren(node) {
    var children = node.get('children');
    if(children) {
      node.set('allChildren', children);
      children.forEach(_cacheChildren);
    }
  }

  /**
   * Return an array of the incoming edges/links and input-output source-sink edges of the node.
   * @param node {DataNode}
   * @return links {Array} Array of all incoming and input-output edges of the node
   */
  function _getLinks(node) {
    var links = [];

    node.ifForEach('inEdgeIds', function (inEdge) {
      var edge = _data.edges.get(inEdge);
      edge.setProperties({
        sourceId: edge.get('inputVertexName'),
        targetId: edge.get('outputVertexName')
      });
      links.push(edge);
    });

    if(node.type == types.INPUT) {
      links.push(Em.Object.create({
        sourceId: node.get('id'),
        targetId: node.get('vertex.id')
      }));
    }
    else if(node.type == types.OUTPUT) {
      links.push(Em.Object.create({
        sourceId: node.get('vertex.id'),
        targetId: node.get('id')
      }));
    }

    return links;
  }

  /**
   * Step 4: Recursive
   * Create a graph based on the given tree structure and edges in _data object.
   * @param tree {DataNode}
   * @param details {Object} Object with values tree, links, maxDepth & maxHeight
   */
  function _getGraphDetails(tree) {
    var maxDepth = 0,
        leafCount = 0,

        links = _getLinks(tree);

    tree.ifForEach('children', function (child) {
      var details = _getGraphDetails(child);
      maxDepth = Math.max(maxDepth, details.maxDepth);
      leafCount += details.leafCount;

      links.push.apply(links, details.links);
    });

    if(!tree.get('children')) {
      leafCount++;
    }

    return {
      tree: tree,
      links: links,
      maxDepth: maxDepth + 1,
      leafCount: leafCount
    };
  }

  /**
   * Converts vertices & edges into hashes for easy access.
   * Makes vertexGroup a property of the respective vertices.
   * @param data {Object}
   * @return {Object} An object with vertices hash, edges hash and array of root vertices.
   */
  function _normalizeRawData(data) {
    var EmObj = Em.Object,
        vertices,          // Hash of vertices
        edges,             // Hash of edges
        rootVertices = []; // Vertices without out-edges are considered root vertices

    vertices = data.vertices.reduce(function (obj, vertex) {
      vertex = VertexDataNode.create(vertex);
      if(!vertex.outEdgeIds) {
        rootVertices.push(vertex);
      }
      obj[vertex.vertexName] = vertex;
      return obj;
    }, {});

    edges = !data.edges ? [] : data.edges.reduce(function (obj, edge) {
      obj[edge.edgeId] = EmObj.create(edge);
      return obj;
    }, {});

    if(data.vertexGroups) {
      data.vertexGroups.forEach(function (group) {
        group.groupMembers.forEach(function (vertex) {
          vertices[vertex].vertexGroup = EmObj.create(group);
        });
      });
    }

    return {
      vertices: EmObj.create(vertices),
      edges: EmObj.create(edges),
      rootVertices: rootVertices
    };
  }

  return {
    // Types enum
    types: types,

    /**
     * Converts raw DAG-plan into an internal data representation that graph-view,
     * and in turn d3.layout.tree can digest.
     * @param data {Object} Dag-plan data
     * @return {Object/String}
     *    - Object with values tree, links, maxDepth & maxHeight
     *    - Error message if the data was not as expected.
     */
    graphifyData: function (data) {
      var dummy = DataNode.create({
            type: types.DUMMY,
            vertexName: 'dummy',
            depth: 1
          }),
          root = RootDataNode.create({
            dummy: dummy
          });

      if(!data.vertices) {
        return "Vertices not found!";
      }

      _data = _normalizeRawData(data);

      if(!_data.rootVertices.length) {
        return "Sink vertex not found!";
      }

      dummy._setChildren(centericMap(_data.rootVertices, function (vertex) {
        return _normalizeVertexTree(_treefyData(vertex, 2));
      }));

      _addOutputs(root);

      _cacheChildren(root);

      return _getGraphDetails(root);
    }
  };

})();


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * 'License'); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The view part of Dag View.
 *
 * Displays TEZ DAG graph in a tree layout. (Uses d3.layout.tree)
 * Graph view exposes just 4 functions to the outside world, everything else
 * happens inside the main closure:
 *   1. create
 *   2. fitGraph
 *   3. additionalDisplay
 *   4. toggleLayouts
 *
 * Links, Paths:
 * --------------
 * d3 layout uses the term links, and SVG uses path. Hence you would see both getting used
 * in this file. You can consider link to be a JavaScript data object, and path to be a visible
 * SVG DOM element on the screen.
 *
 * Extra Nodes:
 * ------------
 * Root Node (Invisible):
 *  Dag view support very complex DAGs, even DAGs without interconnections and backward links.
 *  Hence to fit it into a tree layout I have inserted an invisible root node.
 *
 * Dummy Node (Invisible):
 *  Sinks of a vertex are added at the same level of its parent node, Hence to ensure that all
 *  nodes come under the root, a dummy node was added as the child of the root. The visible tree
 *  would be added as child of dummy node.
 *  Dummy also ensures the view symmetry when multiple outputs are present at the dummy level.
 *
 * Sample Structure, inverted tree representation:
 *
 *            As in the view
 *
 *               Source_m1
 *                  |
 *   Source_m2      M1----------+
 *      |           |           |
 *      +-----------M2      Sink_M1
 *                  |
 *      +-----------R1----------+
 *      |                       |
 *   Sink1_R1               Sink2_R1
 *
 *
 *        Internal representation
 *
 *               Source_m1
 *                  |
 *   Source_m2      M1
 *      |           |
 *      +-----------M2      Sink_M1
 *                  |           |
 *                  R1----------+
 *                  |
 *   Sink1_R1     Dummy     Sink2_R1
 *      |           |           |
 *      +-----------+-----------+
 *                  |
 *                 Root
 *
 */
App.DagViewComponent.graphView = (function (){

  var PADDING = 30, // Adding to be applied on the svg view

      LAYOUTS = { // The view supports two layouts - left to right and top to bottom.
        leftToRight: {
          hSpacing: 180,     // Horizontal spacing between nodes
          vSpacing: 70,      // Vertical spacing between nodes
          depthSpacing: 180, // In leftToRight depthSpacing = hSpacing
          linkDelta: 30,     // Used for links starting and ending at the same point
          projector: function (x, y) { // Converts coordinate based on current orientation
            return {x: y, y: x};
          },
          // Defines how path between nodes are drawn
          pathDataFormat: "M %@ %@ Q %@ %@ %@ %@ Q %@ %@ %@ %@"
        },
        topToBottom: {
          hSpacing: 120,
          vSpacing: 100,
          depthSpacing: 100, // In topToBottom depthSpacing = vSpacing
          linkDelta: 15,
          projector: function (x, y) {
            return {x: x, y: y};
          },
          pathDataFormat: "M %@2 %@1 Q %@4 %@3 %@6 %@5 Q %@8 %@7 %@10 %@9"
        }
      },

      DURATION = 750, // Animation duration

      HREF_TYPE_HASH = { // Used to assess the entity type from an event target
        "#task-bubble": "task",
        "#vertex-bg": "vertex",
        "#input-bg": "input",
        "#output-bg": "output",
        "#io-bubble": "io",
        "#group-bubble": "group"
      };

  var _width = 0,
      _height = 0,

      _component = null,  // The parent ember component
      _data = null,       // Data object created by data processor
      _treeData = null,   // Points to root data node of the tree structure
      _treeLayout = null, // Instance of d3 tree layout helper
      _layout = null,     // Current layout, one of the values defined in LAYOUTS object

      _svg = null, // jQuery instance of svg DOM element
      _g = null,   // For pan and zoom: Svg DOM group element that encloses all the displayed items

      _idCounter = 0,        // To create a fresh id for all displayed nodes
      _scheduledClickId = 0, // Id of scheduled click, used for double click.

      _tip,     // Instance of tip.js

      _panZoomValues, // Temporary storage of pan zoom values for fit toggle
      _panZoom; // A closure returned by _attachPanZoom to reset/modify pan and zoom values

  function _getName(d) {
    switch(d.get('type')) {
      case 'vertex':
        return d.get('vertexName');
      break;
      default:
        return d.get('name');
    }
  }
  function _getSub(d) {
    switch(d.get('type')) {
      case 'vertex':
        return d.get('data.status');
      break;
      default:
        return d.get('class');
    }
  }
  /**
   * Texts grater than maxLength will be trimmed.
   * @param text {String} Text to trim
   * @param maxLength {Number}
   * @return Trimmed text
   */
  function _trimText(text, maxLength) {
    if(text) {
      text = text.toString();
      if(text.length > maxLength) {
        text = text.substr(0, maxLength - 1) + '..';
      }
    }
    return text;
  }

  /**
   * IE 11 does not support css transforms on svg elements. So manually set the same.
   * please keep the transform parameters in sync with the ones in dag-view.less
   * See https://connect.microsoft.com/IE/feedbackdetail/view/920928
   *
   * This can be removed once the bug is fixed in all supported IE versions
   * @param value
   */
  function translateIfIE(element, x, y) {
    if(App.env.isIE) {
      element.attr('transform', 'translate(%@, %@)'.fmt(x, y));
    }
  }

  /**
   * Add task bubble to a vertex node
   * @param node {SVG DOM element} Vertex node
   * @param d {VertexDataNode}
   */
  function _addTaskBubble(node, d) {
    var group = node.append('g');
    group.attr('class', 'task-bubble');
    group.append('use').attr('xlink:href', '#task-bubble');
    translateIfIE(group.append('text')
        .text(_trimText(d.get('data.numTasks'), 3)), 0, 4);

    translateIfIE(group, 38, -15);
  }
  /**
   * Add IO(source/sink) bubble to a vertex node
   * @param node {SVG DOM element} Vertex node
   * @param d {VertexDataNode}
   */
  function _addIOBubble(node, d) {
    var group,
        inputs = d.get('inputs.length'),
        outputs = d.get('outputs.length');

    if(inputs || outputs) {
      group = node.append('g');
      group.attr('class', 'io-bubble');
      group.append('use').attr('xlink:href', '#io-bubble');
      translateIfIE(group.append('text')
          .text(_trimText('%@/%@'.fmt(inputs, outputs), 3)), 0, 4);

      translateIfIE(group, -38, -15);
    }
  }
  /**
   * Add vertex group bubble to a vertex node
   * @param node {SVG DOM element} Vertex node
   * @param d {VertexDataNode}
   */
  function _addVertexGroupBubble(node, d) {
    var group;

    if(d.vertexGroup) {
      group = node.append('g');
      group.attr('class', 'group-bubble');
      group.append('use').attr('xlink:href', '#group-bubble');
      translateIfIE(group.append('text')
          .text(_trimText(d.get('vertexGroup.groupMembers.length'), 2)), 0, 4);

      translateIfIE(group, 38, 15);
    }
  }
  /**
   * Add status bar to a vertex node
   * @param node {SVG DOM element} Vertex node
   * @param d {VertexDataNode}
   */
  function _addStatusBar(node, d) {
    var group = node.append('g'),
        statusIcon = App.Helpers.misc.getStatusClassForEntity(d.get('data.status'),
          d.get('data.hasFailedTaskAttempts'));
    group.attr('class', 'status-bar');

    group.append('foreignObject')
        .attr("class", "status")
        .attr("width", 70)
        .attr("height", 15)
        .html('<span class="msg-container"><i class="task-status ' +
            statusIcon +
            '"></i> ' +
            d.get('data.status') +
            '</span>'
        );
  }
  /**
   * Creates a base SVG DOM node, with bg and title based on the type of DataNode
   * @param node {SVG DOM element} Vertex node
   * @param d {DataNode}
   * @param titleProperty {String} d's property who's value is the title to be displayed.
   *    By default 'name'.
   * @param maxTitleLength {Number} Title would be trimmed beyond maxTitleLength. By default 3 chars
   */
  function _addBasicContents(node, d, titleProperty, maxTitleLength) {
    var className = d.type;

    node.attr('class', 'node %@'.fmt(className));
    node.append('use').attr('xlink:href', '#%@-bg'.fmt(className));
    translateIfIE(node.append('text')
        .attr('class', 'title')
        .text(_trimText(d.get(titleProperty || 'name'), maxTitleLength || 12)), 0, 4);
  }
  /**
   * Populates the calling node with the required content.
   * @param s {DataNode}
   */
  function _addContent(d) {
    var node = d3.select(this);

    switch(d.type) {
      case 'vertex':
        _addBasicContents(node, d, 'vertexName');
        _addStatusBar(node, d);
        _addTaskBubble(node, d);
        _addIOBubble(node, d);
        _addVertexGroupBubble(node, d);
      break;
      case 'input':
      case 'output':
        _addBasicContents(node, d);
      break;
    }
  }

  /**
   * Create a list of all links connecting nodes in the given array.
   * @param nodes {Array} A list of d3 nodes created by tree layout
   * @return links {Array} All links between nodes in the current DAG
   */
  function _getLinks(nodes) {
    var links = [],
        nodeHash;

    nodeHash = nodes.reduce(function (obj, node) {
      obj[node.id] = node;
      return obj;
    }, {});

    _data.links.forEach(function (link) {
      var source = nodeHash[link.sourceId],
          target = nodeHash[link.targetId];
      if(source && target) {
        link.setProperties({
          source: source,
          target: target,
          isBackwardLink: source.isSelfOrAncestor(target)
        });
        links.push(link);
      }
    });

    return links;
  }

  /**
   * Apply proper depth spacing and remove the space occupied by dummy node
   * if the number of other nodes are odd.
   * @param nodes {Array} A list of d3 nodes created by tree layout
   */
  function _normalize(nodes) {
    // Set layout
    var farthestY = 0;
    nodes.forEach(function (d) {
      d.y = d.depth * -_layout.depthSpacing;
      if(d.y < farthestY) farthestY = d.y;
    });
    farthestY -= PADDING;
    nodes.forEach(function (d) {
      d.y -= farthestY;
    });

    //Remove space occupied by dummy
    var rootChildren = _treeData.get('children'),
        rootChildCount = rootChildren.length,
        dummyIndex;

    if(rootChildCount % 2 == 0) {
      dummyIndex = rootChildren.indexOf(_treeData.get('dummy'));
      if(dummyIndex >= rootChildCount / 2) {
        for(var i = 0; i < dummyIndex; i++) {
          rootChildren[i].x = rootChildren[i + 1].x,
          rootChildren[i].y = rootChildren[i + 1].y;
        }
      }
      else {
        for(var i = rootChildCount - 1; i > dummyIndex; i--) {
          rootChildren[i].x = rootChildren[i - 1].x,
          rootChildren[i].y = rootChildren[i - 1].y;
        }
      }
    }

    // Put all single vertex outputs in-line with the vertex node
    // So that they are directly below the respective vertex in vertical layout
    nodes.forEach(function (node) {
      if(node.type == App.DagViewComponent.dataProcessor.types.OUTPUT &&
          node.get('vertex.outputs.length') == 1 &&
          node.get('treeParent.x') != node.get('x')
      ) {
        node.x = node.get('vertex.x');
      }
    });
  }

  function _getType(node) {
    if(node.tagName == 'path') {
      return 'path';
    }
    return HREF_TYPE_HASH[$(node).attr('href')];
  }

  /**
   * Mouse over handler for all displayed SVG DOM elements.
   * Later the implementation will be refactored and moved into the respective DataNode.
   * d {DataNode} Contains data to be displayed
   */
  function _onMouseOver(d) {
    var event = d3.event,
        node = event.target,
        tooltipData = {}; // Will be populated with {title/text/kvList}.

    node = node.correspondingUseElement || node;

    switch(_getType(node)) {
      case "vertex":
        var list  = {};

        _component.get('vertexProperties').forEach(function (property) {
          var value = {};

          if(property.getCellContent && !property.tableCellViewClass) {
            value = property.getCellContent(d.get('data'));
            if(value && value.displayText != undefined) {
              value = value.displayText;
            }
          }
          else if(property.contentPath) {
            value = d.get('data.' + property.contentPath);
          }

          value = App.Helpers.number.formatNumThousands(value);

          if(typeof value != 'object') {
            list[property.get('headerCellName')] = value;
          }
        });

        tooltipData = {
          title: d.get("vertexName"),
          kvList: list
        };
      break;
      case "input":
        var list = {
          "Class": App.Helpers.misc.getClassName(d.get("class")),
          "Initializer": App.Helpers.misc.getClassName(d.get("initializer")),
          "Configurations": App.Helpers.number.formatNumThousands(d.get("configs.length"))
        };
        tooltipData = {
          title: d.get("name"),
          kvList: list
        };
      break;
      case "output":
        var list = {
          "Class": App.Helpers.misc.getClassName(d.get("class")),
          "Configurations": App.Helpers.number.formatNumThousands(d.get("configs.length"))
        };
        tooltipData = {
          title: d.get("name"),
          kvList: list
        };
      break;
      case "task":
        var numTasks = d.get('data.numTasks');
        tooltipData.title = (numTasks > 1 ? '%@ Tasks' : '%@ Task').fmt(numTasks);

        if(!App.env.isIE) {
          node = d3.event.target;
        }
      break;
      case "io":
        var inputs = d.get('inputs.length'),
            outputs = d.get('outputs.length'),
            title = "";
        title += (inputs > 1 ? '%@ Sources' : '%@ Source').fmt(inputs);
        title += " & ";
        title += (outputs > 1 ? '%@ Sinks' : '%@ Sink').fmt(outputs);
        tooltipData.title = title;

        if(!App.env.isIE) {
          node = d3.event.target;
        }
      break;
      case "group":
        tooltipData = {
          title: d.get("vertexGroup.groupName"),
          text: d.get("vertexGroup.groupMembers").join(", ")
        };
      break;
      case "path":
        tooltipData = {
          position: {
            x: event.clientX,
            y: event.clientY
          },
          title: '%@ - %@'.fmt(
            d.get('source.name') || d.get('source.vertexName'),
            d.get('target.name') || d.get('target.vertexName')
          )
        };
        if(d.get("edgeId")) {
          tooltipData.kvList = {
            "Edge Id": d.get("edgeId"),
            "Data Movement Type": d.get("dataMovementType"),
            "Data Source Type": d.get("dataSourceType"),
            "Scheduling Type": d.get("schedulingType"),
            "Edge Source Class": App.Helpers.misc.getClassName(d.get("edgeSourceClass")),
            "Edge Destination Class": App.Helpers.misc.getClassName(d.get("edgeDestinationClass"))
          };
        }
        else {
          tooltipData.text = d.get('source.type') == "input" ? "Source link" : "Sink link";
        }
      break;
    }

    _tip.show(node, tooltipData, event);
  }

  /**
   * onclick handler scheduled using setTimeout
   * @params d {DataNode} data of the clicked element
   * @param node {D3 element} Element that was clicked
   */
  function _scheduledClick(d, node) {
    node = node.correspondingUseElement || node;

    _component.sendAction('entityClicked', {
      type: _getType(node),
      d: d
    });

    _tip.hide();
    _scheduledClickId = 0;
  }

  /**
   * Schedules an onclick handler. If double click event is not triggered the handler
   * will be called in 200ms.
   * @param d {DataNode} Data of the clicked element
   */
  function _onClick(d) {
    if(!_scheduledClickId) {
      _scheduledClickId = setTimeout(_scheduledClick.bind(this, d, d3.event.target), 200);
    }
  }

  /**
   * Callback for mousedown & mousemove interactions. To disable click on drag
   * @param d {DataNode} Data of the clicked element
   */
  function _onMouse(d) {
    d3.select(this).on('click', d3.event.type == 'mousedown' ? _onClick : null);
  }

  /**
   * Double click event handler.
   * @param d {DataNode} Data of the clicked element
   */
  function _onDblclick(d) {
    var event = d3.event,
        node = event.target,
        dataProcessor = App.DagViewComponent.dataProcessor;

    node = node.correspondingUseElement || node;

    if(_scheduledClickId) {
      clearTimeout(_scheduledClickId);
      _scheduledClickId = 0;
    }

    switch(_getType(node)) {
      case "io":
        d.toggleAdditionalInclusion();
        _update();
      break;
    }
  }

  /**
   * Creates a path data string for the given link. Google SVG path data to learn what it is.
   * @param d {Object} Must contain source and target properties with the start and end positions.
   * @return pathData {String} Path data string based on the current layout
   */
  function _createPathData(d) {
    var sX = d.source.y,
        sY = d.source.x,
        tX = d.target.y,
        tY = d.target.x,
        mX = (sX + tX)/2,
        mY = (sY + tY)/2,

        sH = Math.abs(sX - tX) * 0.35,
        sV = 0; // strength

    if(d.isBackwardLink) {
      if(sY == tY) {
        sV = 45,
        mY -= 50;
        if(sX == tX) {
          sX += _layout.linkDelta,
          tX -= _layout.linkDelta;
        }
      }
      sH = Math.abs(sX - tX) * 1.1;
    }

    return "".fmt.apply(_layout.pathDataFormat, [
      sX, sY,

      sX + sH, sY - sV,
      mX, mY,

      tX - sH, tY - sV,
      tX, tY
    ]);
  }

  /**
   * Get the node from/to which the node must transition on enter/exit
   * @param d {DataNode}
   * @param property {String} Property to be checked for
   * @return vertex node
   */
  function _getVertexNode(d, property) {
    if(d.get('vertex.' + property)) {
      return d.get('vertex');
    }
  }
  /**
   * Update position of all nodes in the list and preform required transitions.
   * @param nodes {Array} Nodes to be updated
   * @param source {d3 element} Node that trigged the update, in first update source will be root.
   */
  function _updateNodes(nodes, source) {
    // Enter any new nodes at the parent's previous position.
    nodes.enter().append('g')
      .attr('transform', function(d) {
        var node = _getVertexNode(d, "x0") || source;
        node = _layout.projector(node.x0, node.y0);
        return 'translate(' + node.x + ',' + node.y + ')';
      })
      .on({
        mouseover: _onMouseOver,
        mouseout: _tip.hide,
        mousedown: _onMouse,
        mousemove: _onMouse,
        dblclick: _onDblclick
      })
      .style('opacity', 1e-6)
      .each(_addContent);

    // Transition nodes to their new position.
    nodes.transition()
      .duration(DURATION)
      .attr('transform', function(d) {
        d = _layout.projector(d.x, d.y);
        return 'translate(' + d.x + ',' + d.y + ')';
      })
      .style('opacity', 1);

    // Transition exiting nodes to the parent's new position.
    nodes.exit().transition()
      .duration(DURATION)
      .attr('transform', function(d) {
        var node = _getVertexNode(d, "x") || source;
        node = _layout.projector(node.x, node.y);
        return 'translate(' + node.x + ',' + node.y + ')';
      })
      .style('opacity', 1e-6)
      .remove();
  }

  /**
   * Get the node from/to which the link must transition on enter/exit
   * @param d {DataNode}
   * @param property {String} Property to be checked for
   * @return node
   */
  function _getTargetNode(d, property) {
    if(d.get('target.type') == App.DagViewComponent.dataProcessor.types.OUTPUT
        && d.get('source.' + property)) {
      return d.source;
    }
    if(d.get('target.' + property)) {
      return d.target;
    }
  }
  /**
   * Update position of all links in the list and preform required transitions.
   * @param links {Array} Links to be updated
   * @param source {d3 element} Node that trigged the update, in first update source will be root.
   */
  function _updateLinks(links, source) {
    // Enter any new links at the parent's previous position.
    links.enter().insert('path', 'g')
      .attr('class', function (d) {
        var type = d.get('dataMovementType') || "";
        return 'link ' + type.toLowerCase();
      })
      /**
       * IE11 rendering does not work for svg path element with marker set.
       * See https://connect.microsoft.com/IE/feedback/details/801938
       * This can be removed once the bug is fixed in all supported IE versions
       */
      .attr("style", App.env.isIE ? "" : "marker-mid: url(#arrow-marker);")
      .attr('d', function(d) {
        var node = _getTargetNode(d, "x0") || source;
        var o = {x: node.x0, y: node.y0};
        return _createPathData({source: o, target: o});
      })
      .on({
        mouseover: _onMouseOver,
        mouseout: _tip.hide
      });

    // Transition links to their new position.
    links.transition()
      .duration(DURATION)
      .attr('d', _createPathData);

    // Transition exiting nodes to the parent's new position.
    links.exit().transition()
      .duration(DURATION)
      .attr('d', function(d) {
        var node = _getTargetNode(d, "x") || source;
        var o = {x: node.x, y: node.y};
        return _createPathData({source: o, target: o});
      })
      .remove();
  }

  function _getNodeId(d) {
    return d.id || (d.id = ++_idCounter);
  }
  function _getLinkId(d) {
    return d.source.id.toString() + d.target.id;
  }
  function _stashOldPositions(d) {
    d.x0 = d.x,
    d.y0 = d.y;
  }

  /**
   * Updates position of nodes and links based on changes in _treeData.
   */
  function _update() {
    var nodesData = _treeLayout.nodes(_treeData),
        linksData = _getLinks(nodesData);

    _normalize(nodesData);

    var nodes = _g.selectAll('g.node')
      .data(nodesData, _getNodeId);
    _updateNodes(nodes, _treeData);

    var links = _g.selectAll('path.link')
        .data(linksData, _getLinkId);
    _updateLinks(links, _treeData);

    nodesData.forEach(_stashOldPositions);
  }

  /**
   * Attach pan and zoom events on to the container.
   * @param container {DOM element} Element onto which events are attached.
   * @param g {d3 DOM element} SVG(d3) element that will be moved or scaled
   */
  function _attachPanZoom(container, g) {
    var SCALE_TUNER = 1 / 700,
        MIN_SCALE = .5,
        MAX_SCALE = 2;

    var prevX = 0,
        prevY = 0,

        panX = PADDING,
        panY = PADDING,
        scale = 1,

        scheduleId = 0;

    /**
     * Transform g to current panX, panY and scale.
     * @param animate {Boolean} Animate the transformation in DURATION time.
     */
    function transform(animate) {
      var base = animate ? g.transition().duration(DURATION) : g;
      base.attr('transform', 'translate(%@, %@) scale(%@)'.fmt(panX, panY, scale));
    }

    /**
     * Check if the item have moved out of the visible area, and reset if required
     */
    function visibilityCheck() {
      var graphBound = g.node().getBoundingClientRect(),
          containerBound = container[0].getBoundingClientRect();

      if(graphBound.right < containerBound.left ||
        graphBound.bottom < containerBound.top ||
        graphBound.left > containerBound.right ||
        graphBound.top > containerBound.bottom) {
          panX = PADDING, panY = PADDING, scale = 1;
          transform(true);
      }
    }

    /**
     * Schedule a visibility check and reset if required
     */
    function scheduleVisibilityCheck() {
      if(scheduleId) {
        clearTimeout(scheduleId);
        scheduleId = 0;
      }
      scheduleId = setTimeout(visibilityCheck, 100);
    }

    /**
     * Set pan values
     */
    function onMouseMove(event) {
      panX += event.pageX - prevX,
      panY += event.pageY - prevY;

      transform();

      prevX = event.pageX,
      prevY = event.pageY;
    }
    /**
     * Set zoom values, pan also would change as we are zooming with mouse position as pivote.
     */
    function onWheel(event) {
      var prevScale = scale,

          offset = container.offset(),
          mouseX = event.pageX - offset.left,
          mouseY = event.pageY - offset.top,
          factor = 0;

      scale += event.deltaY * SCALE_TUNER;
      if(scale < MIN_SCALE) {
        scale = MIN_SCALE;
      }
      else if(scale > MAX_SCALE) {
        scale = MAX_SCALE;
      }

      factor = 1 - scale / prevScale,
      panX += (mouseX - panX) * factor,
      panY += (mouseY - panY) * factor;

      transform();
      scheduleVisibilityCheck();

      _tip.reposition();
      event.preventDefault();
    }

    container
    .on('mousewheel', onWheel)
    .mousedown(function (event){
      prevX = event.pageX,
      prevY = event.pageY;

      container.on('mousemove', onMouseMove);
      container.parent().addClass('panning');
    })
    .mouseup(function (event){
      container.off('mousemove', onMouseMove);
      container.parent().removeClass('panning');

      scheduleVisibilityCheck();
    })

    /**
     * A closure to reset/modify panZoom based on an external event
     * @param newPanX {Number}
     * @param newPanY {Number}
     * @param newScale {Number}
     */
    return function(newPanX, newPanY, newScale) {
      var values = {
        panX: panX,
        panY: panY,
        scale: scale
      };

      panX = newPanX == undefined ? panX : newPanX,
      panY = newPanY == undefined ? panY : newPanY,
      scale = newScale == undefined ? scale : newScale;

      transform(true);

      return values;
    }
  }

  /**
   * Sets the layout and update the display.
   * @param layout {Object} One of the values defined in LAYOUTS object
   */
  function _setLayout(layout) {
    var leafCount = _data.leafCount,
        dimention;

    // If count is even dummy will be replaced by output, so output would no more be leaf
    if(_data.tree.get('children.length') % 2 == 0) {
      leafCount--;
    }
    dimention = layout.projector(leafCount, _data.maxDepth - 1);

    _layout = layout;

    _width = dimention.x *= _layout.hSpacing,
    _height = dimention.y *= _layout.vSpacing;

    dimention = _layout.projector(dimention.x, dimention.y), // Because tree is always top to bottom
    _treeLayout = d3.layout.tree().size([dimention.x, dimention.y]);

    _update();
  }

  return {
    /**
     * Creates a DAG view in the given element based on the data
     * @param component {DagViewComponent} Parent ember component, to sendAction
     * @param element {HTML DOM Element} HTML element in which the view will be created
     * @param data {Object} Created by data processor
     */
    create: function (component, element, data) {
      var svg = d3.select(element).select('svg');

      _component = component,
      _data = data,
      _g = svg.append('g').attr('transform', 'translate(%@,%@)'.fmt(PADDING, PADDING));
      _svg = $(svg.node());
      _tip = App.DagViewComponent.tip;

      _tip.init($(element).find('.tool-tip'), _svg);

      _treeData = data.tree,
      _treeData.x0 = 0,
      _treeData.y0 = 0;

      _panZoom = _attachPanZoom(_svg, _g);

      _setLayout(LAYOUTS.topToBottom);
    },

    /**
     * Calling this function would fit the graph to the available space.
     */
    fitGraph: function (){
      var scale = Math.min(
        (_svg.width() - PADDING * 2) / _width,
        (_svg.height() - PADDING * 2) / _height
      ),
      panZoomValues = _panZoom();

      if(
        panZoomValues.panX != PADDING ||
        panZoomValues.panY != PADDING ||
        panZoomValues.scale != scale
      ) {
        _panZoomValues = _panZoom(PADDING, PADDING, scale);
      }
      else {
        _panZoomValues = _panZoom(
          _panZoomValues.panX,
          _panZoomValues.panY,
          _panZoomValues.scale);
      }
    },

    /**
     * Control display of additionals or sources and sinks.
     * @param hide {Boolean} If true the additionals will be excluded, else included in the display
     */
    additionalDisplay: function (hide) {
      var dataProcessor = App.DagViewComponent.dataProcessor,
          filterTypes = null;

      if(hide) {
        _g.attr('class', 'hide-io');
        _treeData.recursivelyCall('excludeAdditionals');
      }
      else {
        _treeData.recursivelyCall('includeAdditionals');
        _g.attr('class', null);
      }
      _update();
    },

    /**
     * Toggle graph layouts between the available options
     */
    toggleLayouts: function () {
      _setLayout(_layout == LAYOUTS.topToBottom ?
          LAYOUTS.leftToRight :
          LAYOUTS.topToBottom);
      return _layout == LAYOUTS.topToBottom;
    }
  };

})();


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * 'License'); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Displays a tooltip over an svg element.
 */
App.DagViewComponent.tip = (function () {

  var _element = null,  // jQuery tooltip DOM element
      _bubble = null,   // Tooltip bubble in _element
      _svg = null,      // HTML svg tag that contains the element
      _svgPoint = null, // A SVGPoint object
      _window = $(window),

      _data = null, // Last displayed data, for re-render
      _node = null; // Last node over which tooltip was displayed

  /**
   * Converts the provided list object into a tabular form.
   * @param list {Object} : An object with properties to be displayed as key value pairs
   *   {
   *     propertyName1: "property value 1",
   *     ..
   *     propertyNameN: "property value N",
   *   }
   */
  function _createList(list) {
    var listContent = [],
        properties;

    if(list) {
      listContent.push("<table>");

      $.each(list, function (property, value) {
        listContent.push(
          "<tr><td>",
          property,
          "</td><td>",
          value,
          "</td></tr>"
        );
      });
      listContent.push("</table>");

      return listContent.join("");
    }
  }

  /**
   * Tip supports 3 visual entities in the tooltip. Title, description text and a list.
   * _setData sets all these based on the passed data object
   * @param data {Object} An object of the format
   * {
   *   title: "tip title",
   *   text: "tip description text",
   *   kvList: {
   *     propertyName1: "property value 1",
   *     ..
   *     propertyNameN: "property value N",
   *   }
   * }
   */
  function _setData(data) {
    _element.find('.tip-title').html(data.title || "");
    _element.find('.tip-text').html(data.text || "");
    _element.find('.tip-text')[data.text ? 'show' : 'hide']();
    _element.find('.tip-list').html(_createList(data.kvList) || "");
  }

  return {
    /**
     * Set the tip defaults
     * @param tipElement {$} jQuery reference to the tooltip DOM element.
     *    The element must contain 3 children with class tip-title, tip-text & tip-list.
     * @param svg {$} jQuery reference to svg html element
     */
    init: function (tipElement, svg) {
      _element = tipElement,
      _bubble = _element.find('.bubble'),
      _svg = svg,
      _svgPoint = svg[0].createSVGPoint();
    },
    /**
     * Display a tooltip over an svg element.
     * @param node {SVG Element} Svg element over which tooltip must be displayed.
     * @param data {Object} An object of the format
     * {
     *   title: "tip title",
     *   text: "tip description text",
     *   kvList: {
     *     propertyName1: "property value 1",
     *     ..
     *     propertyNameN: "property value N",
     *   }
     * }
     * @param event {MouseEvent} Event that triggered the tooltip.
     */
    show: function (node, data, event) {
      var point = data.position || (node.getScreenCTM ? _svgPoint.matrixTransform(
            node.getScreenCTM()
          ) : {
            x: event.x,
            y: event.y
          }),

          windMid = _window.height() >> 1,
          winWidth = _window.width(),

          showAbove = point.y < windMid,
          offsetX = 0,
          width = 0,

          svgLeft = _svg.offset().left;

      if(_data !== data) {
        _data = data,
        _node = node;

        _setData(data);
      }

      if(point.x > svgLeft && point.x < svgLeft + _svg.width()) {
        if(showAbove) {
          _element.removeClass('below');
          _element.addClass('above');
        }
        else {
          _element.removeClass('above');
          _element.addClass('below');

          point.y -= _element.height();
        }

        width = _element.width();
        offsetX = (width - 11) >> 1;

        if(point.x - offsetX < 0) {
          offsetX = point.x - 20;
        }
        else if(point.x + offsetX > winWidth) {
          offsetX = point.x - (winWidth - 10 - width);
        }

        _bubble.css({
          left: -offsetX
        });

        _element.addClass('show');

        _element.css({
          left: point.x,
          top: point.y
        });
      }
      else {
        _element.removeClass('show');
      }
    },
    /**
     * Reposition the tooltip based on last passed data & node.
     */
    reposition: function () {
      if(_data) {
        this.show(_node, _data);
      }
    },
    /**
     * Hide the tooltip.
     */
    hide: function () {
      _data = _node = null;
      _element.removeClass('show');
    }
  };

})();


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.ExTable = Ember.Namespace.create();

Ember.Table.BodyTableContainer.reopen({
  width: Ember.computed.alias('tableComponent._tableContainerWidth'),
  didInsertElement: function () {
    this._super();
    this.$().unbind();
  }
});

App.ExTable.FilterTextField = Em.TextField.extend({
	classNames: ['filter'],
  classNameBindings: ['isPopulated','isInputDirty:input-dirty'],
  type: 'search',
  results: 1,
  attributeBindings: ['autofocus', 'results'],
  valueBinding: Em.Binding.oneWay('filterValue'),
  isPopulated: function() {
  	return !Em.isEmpty(this.get('value'));
  }.property('value'),

  insertNewline: function(event) {
    if (this.get('isInputDirty')) {
      this.set('filterValue', this.get('value'));
      this.get('parentView.controller').send('filterUpdated', 
        this.get('parentView.content'), this.get('value'));
    }
  },
  cancel: function() {
    // cancel is ignored. user needs to press enter. This is done in order to avoid 
    // two requests when user wants to clear the current input and enter new value.
  },
  isInputDirty: function() {
  	return $.trim(this.get('value')) != $.trim(this.get('filterValue'));
  }.property('value', 'filterValue')
});

App.ExTable.FilterDropdownField = Em.Select.extend({
  valueBinding: Em.Binding.oneWay('filterValue'),
  change: function(key) {
    if (this.get('isInputDirty')) {
      this.set('filterValue', this.get('value'));
      this.get('parentView.controller')
        .send('filterUpdated', this.get('parentView.content'), this.get('value'));
    }
  },
  isInputDirty: function() {
    return $.trim(this.get('value')) != $.trim(this.get('filterValue'));
  }.property('value', 'filterValue')
});

App.ExTable.FilterRow = Ember.View.extend(Ember.AddeparMixins.StyleBindingsMixin, {
  templateName: 'components/extended-table/filter-row',
  classNames: ['ember-table-table-row', 'ember-table-header-row'],
  styleBindings: ['width'],
  columns: Ember.computed.alias('content'),
  width: Ember.computed.alias('controller._rowWidth'),
  scrollLeft: Ember.computed.alias('controller._tableScrollLeft'),
  onScrollLeftDidChange: function() {
    return this.$().scrollLeft(this.get('scrollLeft'));
  }.observes('scrollLeft'),
  onScroll: function(event) {
    this.set('scrollLeft', event.target.scrollLeft);
    return event.preventDefault();
  }
});

App.ExTable.FilterBlock = Ember.Table.TableBlock.extend({
  classNames: ['ember-table-header-block'],
  itemViewClass: 'App.ExTable.FilterRow',
  content: function() {
    return [this.get('columns')];
  }.property('columns')
});

App.ExTable.FilterTableContainer = Ember.Table.TableContainer.extend(
    Ember.Table.ShowHorizontalScrollMixin, {
  templateName: 'components/extended-table/filter-container',
  classNames: [
    'ember-table-table-container', 
    'ember-table-fixed-table-container', 
    'ember-table-header-container'
  ],
  height: Ember.computed.alias('controller._filterHeight'),
  width: Ember.computed.alias('controller._tableContainerWidth')
});

App.ExTable.FilterCell = Ember.View.extend(Ember.AddeparMixins.StyleBindingsMixin, {
  init: function() {
    var inputFieldView = null;
    if (this.get('content.isFilterable')) {
      var filterType = this.get('content.filterType');
      switch (filterType) {
        case 'dropdown':
          inputFieldView = App.ExTable.FilterDropdownField.create({
            content: this.get('content.dropdownValues'),
            optionValuePath: 'content.id',
            optionLabelPath: 'content.label',
            classNames: 'inline-display',
            filterValueBinding: '_parentView.content.columnFilterValue'
          });
        break;
        case 'textbox':
          inputFieldView = App.ExTable.FilterTextField.create({
            classNames: 'inline-display',
            filterValueBinding: '_parentView.content.columnFilterValue'
          });
        break;
        default:
          console.log('Unknown filter type ' + filterType + ' defined on column ' + 
            this.get('content.headerCellName') + '.Will be ignored');
        break;
      }
    }
    if (!inputFieldView) {
      // if no filter is specified or type is unknown, use empty view.
      inputFieldView = Em.View.create();
    }
    this.set('inputFieldView', inputFieldView);
    this._super();
  },
  templateName: 'components/extended-table/filter-cell',
  classNames: ['ember-table-cell', 'ember-table-header-cell'],
  classNameBindings: ['column.textAlign'],
  styleBindings: ['width', 'height'],
  column: Ember.computed.alias('content'),
  width: Ember.computed.alias('column.columnWidth'),
  height: function() {
    return this.get('controller._filterHeight');
  }.property('controller._filterHeight'),
  // Currently resizing is not handled automatically. if required will need to do here.
});

App.ExTable.ColumnDefinition = Ember.Table.ColumnDefinition.extend({
  init: function() {
    if (!!this.filterID) {
      var columnFilterValueBinding = Em.Binding
        .oneWay('controller._parentView.context.' + this.filterID)
        .to('columnFilterValue');
      columnFilterValueBinding.connect(this);
    }
    this._super();
  },
  filterType: 'textbox', // default is textbox
  textAlign: 'text-align-left',
  filterCellView: 'App.ExTable.FilterCell',
  filterCellViewClass: Ember.computed.alias('filterCellView'),
  filterID: null,
});

App.ExTable.TableComponent = Ember.Table.EmberTableComponent.extend({
	layoutName: 'components/extended-table/extable',
	filters: {},
	styleBindings: ['height', 'width'],
	hasFilter: true,
	minFilterHeight: 30, //TODO: less changes

  enableContentSelection: false,
  selectionMode: 'none',

  width: function () {
    return Math.max(this.get('_width'), this._getTotalWidth(this.get('tableColumns')));
  }.property('tableColumns', '_tableColumnsWidth', '_width'),

  _tableContainerWidth: Ember.computed.alias('width'),

  actions: {
    filterUpdated: function(columnDef, value) {
      var filterID = columnDef.get('filterID');
      filterID = filterID || columnDef.get('headerCellName').underscore();
      if (this.get('onFilterUpdated')) {
      	this.sendAction('onFilterUpdated', filterID, value);
      }
    },
  },

  updateLayout: function () {
    if ((this.get('_state') || this.get('state')) !== 'inDOM') {
      return;
    }
    return this.doForceFillColumns();
  },

  doForceFillColumns: function() {
    var additionWidthPerColumn, availableContentWidth, columnsToResize, contentWidth, fixedColumnsWidth, remainingWidth, tableColumns, totalWidth;
    totalWidth = this.get('_width');

    fixedColumnsWidth = this.get('_fixedColumnsWidth');
    tableColumns = this.get('tableColumns');
    contentWidth = this._getTotalWidth(tableColumns);

    availableContentWidth = totalWidth - fixedColumnsWidth;
    remainingWidth = availableContentWidth - contentWidth;
    columnsToResize = tableColumns.filterProperty('canAutoResize');

    if(totalWidth < contentWidth) {
      return [];
    }
    additionWidthPerColumn = Math.floor(remainingWidth / columnsToResize.length);
    if(availableContentWidth <= this._getTotalWidth(tableColumns, 'minWidth')) {
      return columnsToResize;
    }
    return columnsToResize.forEach(function(column) {
      var columnWidth = column.get('columnWidth') + additionWidthPerColumn;
      return column.set('columnWidth', columnWidth);
    });
  },

	// private variables
	// Dynamic filter height that adjusts according to the filter content height
	_contentFilterHeight: null,

  _onColumnsChange: Ember.observer(function() {
    return Ember.run.next(this, function() {
      return Ember.run.once(this, this.updateLayout);
    });
  }, 'columns.length', '_tableContentHeight'),

  _filterHeight: function() {
    var minHeight = this.get('minFilterHeight');
    var contentFilterHeight = this.get('_contentFilterHeight');
    if (contentFilterHeight < minHeight) {
      return minHeight;
    } else {
      return contentFilterHeight;
    }
  }.property('_contentFilterHeight', 'minFilterHeight'),

	// some of these below are private functions extend. however to add the filterrow we need them.
	// tables-container height adjusts to the content height
	_tablesContainerHeight: function() {
    var contentHeight, height;
    height = this.get('_height');
    contentHeight = this.get('_tableContentHeight') + this.get('_headerHeight') + this.get('_footerHeight') 
    	+ this.get('_filterHeight');
    return height && contentHeight;
  }.property('_height', '_tableContentHeight', '_headerHeight', '_footerHeight', '_filterHeight'),

  _bodyHeight: function() {
    var bodyHeight;
    bodyHeight = this.get('_tablesContainerHeight');
    if (this.get('hasHeader')) {
      bodyHeight -= this.get('_headerHeight');
    }
    if (this.get('hasFilter')) { 
      bodyHeight -= this.get('_filterHeight');
    }
    if (this.get('hasFooter')) {
      bodyHeight -= this.get('footerHeight');
    }
    return bodyHeight;
  }.property('_tablesContainerHeight', '_hasHorizontalScrollbar', '_headerHeight', 'footerHeight', '_filterHeight',
  	'hasHeader', 'hasFooter', 'hasFilter'), 

  _hasVerticalScrollbar: function() {
    var contentHeight, height;
    height = this.get('_height');
    contentHeight = this.get('_tableContentHeight') + this.get('_headerHeight') + this.get('_footerHeight') 
    	+ this.get('_filterHeight');
    if (height < contentHeight) {
      return true;
    } else {
      return false;
    }
  }.property('_height', '_tableContentHeight', '_headerHeight', '_footerHeight', '_filterHeight'),

  _tableContentHeight: function() {
    return this.get('rowHeight') * this.get('bodyContent.length');
  }.property('rowHeight', 'bodyContent.length')
});

App.ExTable.FilterColumnMixin = Ember.Mixin.create({
		isFilterable: true,
		filterPresent: function() {
			return !Em.isEmpty(this.get('columnFilterValue'));
		}.property('columnFilterValue'),
});

Ember.Handlebars.helper('extended-table-component', App.ExTable.TableComponent);


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.KvTableComponent = Em.Component.extend({
  layoutName: 'components/kv-table',
  filterExp: null,
  showAllButtonClass: '',
  errorMsgClass: '',

  actions: {
    showAllButtonClicked: function() {
      this.set('filterExp', null);
    }
  },

  showError: function(show) {
    this.set('errorMsgClass', show ? '' : 'no-display');
  },

  filteredKVs: function() {
    var filterExp = this.get('filterExp');
    var kvList = this.get('data') || [],
        filteredKvs = [],
        filterStringRegex;

    if (filterExp) {
      this.set('showAllButtonClass', '');
    } else {
      this.set('showAllButtonClass', 'hidden');
    }

    try {
      filterStringRegex = new RegExp(filterExp, 'i');
    } catch(e) {
      this.showError(true);
      Em.Logger.debug("Invalid regex " + e);
      return;
    }

    this.showError(false);
    if (Em.isEmpty(filterExp)) {
      return kvList;
    }

    kvList.forEach(function (kv) {
      if (filterStringRegex.test(kv.get('key')) || filterStringRegex.test(kv.get('value'))) {
        filteredKvs.push(kv);
      }
    });

    return filteredKvs;
  }.property('data', 'filterExp')
});

Em.Handlebars.helper('kv-table-component', App.KvTableComponent);


})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.LoadTimeComponent = Em.Component.extend({
  layoutName: 'components/load-time',

  actions: {
    refresh: function() {
      this.sendAction('refresh');
    }
  },

  displayTime: function() {
    var time = this.get('time');
    return time ? App.Helpers.date.dateFormat(time.getTime(), true) : null;
  }.property('time')
});

Em.Handlebars.helper('load-time-component', App.LoadTimeComponent);

})();

(function() {

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

App.PageNavComponent = Em.Component.extend({
	layoutName: 'components/page-nav',
	
	classNames: ['inline-block', 'page-nav-link'],

	actions: {
		gotoNext: function() {
			this.sendAction('navNext');
		},
		gotoPrev: function() {
			this.sendAction('navPrev');
		},
		gotoFirst: function() {
			this.sendAction('navFirst');
		}
	}
});

Em.Handlebars.helper('page-nav-component', App.PageNavComponent);

})();