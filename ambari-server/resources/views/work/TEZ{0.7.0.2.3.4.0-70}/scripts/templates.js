Ember.TEMPLATES["application"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n              <img src=\"img/apache-tez-logo-transparent.png\" width=\"70px\"/>\n              <span>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "App.env.version", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n            ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n        <span>Timezone: ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "App.env.timezone", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n      ");
  return buffer;
  }

  data.buffer.push("\n\n<div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("App.env.isStandalone:standalone:wrapped App.env.isIE:ie")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n  <div class=\"top-wrapper\">\n    <div id=\"top-nav\">\n      <div class=\"navbar navbar-static-top\">\n        <div class=\"navbar-inner\">\n          <div class=\"main-container\">\n            ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("logo")
  },inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "application", options) : helperMissing.call(depth0, "link-to", "application", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"main-container\">\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    </div>\n    <div class=\"footer-frame\"> </div>\n  </div>\n\n  <div class=\"footer\">\n    <div class=\"main-container\">\n      <a href=\"http://www.apache.org/licenses/LICENSE-2.0\" target=\"_blank\">Licensed under the Apache License, Version 2.0</a>.\n      ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "App.env.timezone", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    </div>\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["common/configs"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "partials/configs", options) : helperMissing.call(depth0, "partial", "partials/configs", options))));
  return buffer;
  
});

Ember.TEMPLATES["common/counters"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n  <div class='table-container margin-small-vertical'>\n    ");
  hashContexts = {'data': depth0,'timeStamp': depth0};
  hashTypes = {'data': "ID",'timeStamp': "ID"};
  options = {hash:{
    'data': ("counterGroups"),
    'timeStamp': ("timeStamp")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['counter-table-component'] || depth0['counter-table-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "counter-table-component", options))));
  data.buffer.push("\n  </div>\n");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n  <h4>Counters not available!</h4>\n");
  }

  data.buffer.push("\n\n");
  hashContexts = {'isRefreshable': depth0,'time': depth0,'refresh': depth0};
  hashTypes = {'isRefreshable': "ID",'time': "ID",'refresh': "STRING"};
  options = {hash:{
    'isRefreshable': ("isRefreshable"),
    'time': ("timeStamp"),
    'refresh': ("refresh")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['load-time-component'] || depth0['load-time-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "load-time-component", options))));
  data.buffer.push("\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "counterGroups.length", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n<h6>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "message", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h6>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["common/swimlanes"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n  ");
  }

  data.buffer.push("\n\n");
  hashContexts = {'isRefreshable': depth0,'time': depth0,'refresh': depth0};
  hashTypes = {'isRefreshable': "ID",'time': "ID",'refresh': "STRING"};
  options = {hash:{
    'isRefreshable': ("isRefreshable"),
    'time': ("controller.model.content.0.timeStamp"),
    'refresh': ("refresh")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['load-time-component'] || depth0['load-time-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "load-time-component", options))));
  data.buffer.push("\n<div class=\"svg-container\">\n  ");
  hashContexts = {'contentBinding': depth0};
  hashTypes = {'contentBinding': "STRING"};
  stack2 = helpers.view.call(depth0, "App.SwimlanesView", {hash:{
    'contentBinding': ("controller.model.content")
  },inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n</div>\n<div class=\"tool-tip\">\n  <div class=\"bubble\">\n    <div class=\"tip-title\">Title</div>\n    <div class=\"tip-text\"></div>\n    <div class=\"tip-list\"></div>\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["common/table-with-spinner"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n  ");
  hashContexts = {'isRefreshable': depth0,'time': depth0,'refresh': depth0};
  hashTypes = {'isRefreshable': "ID",'time': "ID",'refresh': "STRING"};
  options = {hash:{
    'isRefreshable': ("isRefreshable"),
    'time': ("sortedContent.0.timeStamp"),
    'refresh': ("refresh")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['load-time-component'] || depth0['load-time-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "load-time-component", options))));
  data.buffer.push("\n  <div class='align-children-right'>\n    ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "partials/table-controls", options) : helperMissing.call(depth0, "partial", "partials/table-controls", options))));
  data.buffer.push("\n  </div>\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "partials/table", options) : helperMissing.call(depth0, "partial", "partials/table", options))));
  data.buffer.push("\n");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "partials/loading-spinner", options) : helperMissing.call(depth0, "partial", "partials/loading-spinner", options))));
  data.buffer.push("\n");
  return buffer;
  }

  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "loading", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["common/table"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n  ");
  hashContexts = {'isRefreshable': depth0,'time': depth0,'refresh': depth0};
  hashTypes = {'isRefreshable': "ID",'time': "ID",'refresh': "STRING"};
  options = {hash:{
    'isRefreshable': ("isRefreshable"),
    'time': ("data.content.0.timeStamp"),
    'refresh': ("refresh")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['load-time-component'] || depth0['load-time-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "load-time-component", options))));
  data.buffer.push("\n\n  ");
  hashContexts = {'columns': depth0,'rows': depth0,'extraHeaderItem': depth0,'statusMessage': depth0,'enableSearch': depth0,'enablePagination': depth0,'enableSort': depth0,'rowsChanged': depth0,'pageNumBinding': depth0,'rowCountBinding': depth0,'searchTextBinding': depth0,'sortColumnIdBinding': depth0,'sortOrderBinding': depth0};
  hashTypes = {'columns': "ID",'rows': "ID",'extraHeaderItem': "ID",'statusMessage': "ID",'enableSearch': "BOOLEAN",'enablePagination': "BOOLEAN",'enableSort': "BOOLEAN",'rowsChanged': "STRING",'pageNumBinding': "STRING",'rowCountBinding': "STRING",'searchTextBinding': "STRING",'sortColumnIdBinding': "STRING",'sortOrderBinding': "STRING"};
  options = {hash:{
    'columns': ("columns"),
    'rows': ("data.content"),
    'extraHeaderItem': ("App.ExtraTableButtonsView"),
    'statusMessage': ("statusMessage"),
    'enableSearch': (true),
    'enablePagination': (true),
    'enableSort': (true),
    'rowsChanged': ("tableRowsChanged"),
    'pageNumBinding': ("pageNum"),
    'rowCountBinding': ("rowCount"),
    'searchTextBinding': ("searchText"),
    'sortColumnIdBinding': ("sortColumnId"),
    'sortOrderBinding': ("sortOrder")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['basic-table-component'] || depth0['basic-table-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "basic-table-component", options))));
  data.buffer.push("\n");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "partials/loading-spinner", options) : helperMissing.call(depth0, "partial", "partials/loading-spinner", options))));
  data.buffer.push("\n  <div class=\"text-align-center\">\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "statusMessage", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </div>\n");
  return buffer;
  }

  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "loading", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["components/basic-table"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    <div class='table-header'>\n      <div class=\"horizontal-half align-top\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "enableSearch", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <div class=\"table-message\">\n          ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "_statusMessage", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n      </div><div class=\"horizontal-half align-top align-children-right\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "enablePagination", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "extraHeaderItem", {hash:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </div>\n    </div>\n  ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n          ");
  hashContexts = {'text': depth0,'placeholder': depth0};
  hashTypes = {'text': "ID",'placeholder': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.BasicTableComponent.SearchView", {hash:{
    'text': ("searchText"),
    'placeholder': ("Search...")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n            <i class=\"waiting\"></i>\n            ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "_statusMessage", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n          ");
  hashContexts = {'pageNum': depth0,'totalPages': depth0};
  hashTypes = {'pageNum': "ID",'totalPages': "ID"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.BasicTableComponent.PaginationView", {hash:{
    'pageNum': ("pageNum"),
    'totalPages': ("totalPages")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n          ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "extraHeaderItem", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        ");
  return buffer;
  }

function program10(depth0,data) {
  
  
  data.buffer.push("\n      <div class=\"data-availability-message\">No columns available!</div>\n    ");
  }

function program12(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "_rows.length", {hash:{},inverse:self.program(15, program15, data),fn:self.program(13, program13, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program13(depth0,data) {
  
  
  data.buffer.push("\n      <div class=\"data-availability-message\">No records available!</div>\n    ");
  }

function program15(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n      <div class='table-body'>\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "column", "in", "_columns", {hash:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </div>\n    ");
  return buffer;
  }
function program16(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n          <div ");
  hashContexts = {'style': depth0,'class': depth0};
  hashTypes = {'style': "ID",'class': "STRING"};
  options = {hash:{
    'style': ("column.customStyle"),
    'class': (":table-column _view.contentIndex::first-item")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n            ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "column.headerCellView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "row", "in", "_rows", {hash:{},inverse:self.noop,fn:self.program(17, program17, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n          </div>\n        ");
  return buffer;
  }
function program17(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n              <div class='table-cell ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "firstItemCSS", "_view", {hash:{},contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("'>\n                ");
  hashContexts = {'row': depth0};
  hashTypes = {'row': "ID"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "column.cellView", {hash:{
    'row': ("row")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n              </div>\n            ");
  return buffer;
  }

function program19(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n        ");
  hashContexts = {'pageNum': depth0,'totalPages': depth0};
  hashTypes = {'pageNum': "ID",'totalPages': "ID"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.BasicTableComponent.PaginationView", {hash:{
    'pageNum': ("pageNum"),
    'totalPages': ("totalPages")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      ");
  return buffer;
  }

  data.buffer.push("\n\n<div class='table-container'>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "_showHeader", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  <div class='table-body-container'>\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "_columns.length", {hash:{},inverse:self.program(12, program12, data),fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </div>\n  <div class='table-footer'>\n    <div class=\"horizontal-half align-top\">\n    </div><div class=\"horizontal-half align-top align-children-right\">\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "hasPageNavOnFooter", {hash:{},inverse:self.noop,fn:self.program(19, program19, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["components/basic-table/basic-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n  <span class=\"message\">Not Available!</span>\n");
  }

function program3(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.cellContent.displayText", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  return buffer;
  }

  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unbound.call(depth0, "unless", "view.cellContent.displayText", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  return buffer;
  
});

Ember.TEMPLATES["components/basic-table/bounded-basic-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n  <i class=\"waiting\"></i>&nbsp;\n");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.displayText", {hash:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.cellContent.displayText", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  ");
  return buffer;
  }

function program6(depth0,data) {
  
  
  data.buffer.push("\n    <span class=\"message\">Not Available!</span>\n  ");
  }

  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.isPending", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  return buffer;
  
});

Ember.TEMPLATES["components/basic-table/header-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n    <i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "ID"};
  options = {hash:{
    'class': ("view.sortIconCSS")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sort", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></i>\n  ");
  return buffer;
  }

  data.buffer.push("\n\n<div class='table-header-cell' title='");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "column.headerCellName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("'>\n  <div class='cell-content'>\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "column.headerCellName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </div>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "enableSort", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  <i class=\"resize-column\" ");
  hashContexts = {'on': depth0,'target': depth0};
  hashTypes = {'on': "ID",'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "startColResize", {hash:{
    'on': ("mouseDown"),
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ></i>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["components/basic-table/linked-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("\n  <i class=\"waiting\"></i>&nbsp;\n");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.linkTo", {hash:{},inverse:self.program(7, program7, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "view.cellContent.linkTo", "view.cellContent.entityId", options) : helperMissing.call(depth0, "link-to", "view.cellContent.linkTo", "view.cellContent.entityId", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program5(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.cellContent.displayText", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    ");
  return buffer;
  }

function program7(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.displayText", {hash:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program8(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.cellContent.displayText", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  ");
  return buffer;
  }

function program10(depth0,data) {
  
  
  data.buffer.push("\n    <span class=\"message\">Not Available!</span>\n  ");
  }

  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.isPending", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["components/basic-table/logs-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n  <i class=\"waiting\"></i>&nbsp;\n");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.viewUrl", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.downloadUrl", {hash:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    <a target=\"_blank\" href=\"//");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.cellContent.viewUrl", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\">View</a>\n    &nbsp;\n  ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    <a target=\"_blank\" href=\"");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.cellContent.downloadUrl", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\" download type=\"application/octet-stream\">Download</a>\n  ");
  return buffer;
  }

function program8(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "view.cellContent.viewUrl", {hash:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program9(depth0,data) {
  
  
  data.buffer.push("\n    <span class=\"message\">Not Available!</span>\n  ");
  }

  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.isPending", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  return buffer;
  
});

Ember.TEMPLATES["components/basic-table/pagination-view"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n    <li ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("page.isCurrent:is-current:clickable")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "changePage", "page.pageNum", {hash:{},contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "page.pageNum", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    </li>\n  ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n    <li ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("view.atLast::clickable")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "changePage", "view.totalPages", {hash:{},contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n      Last - ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.totalPages", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    </li>\n  ");
  return buffer;
  }

  data.buffer.push("\n\n<ul class=\"page-list\">\n  <li ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("view.atFirst::clickable")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "changePage", 1, {hash:{},contexts:[depth0,depth0],types:["STRING","INTEGER"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n    First\n  </li>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "page", "in", "view._possiblePages", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.unless.call(depth0, "view.hideLast", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n</ul>\n<div class='row-select'>\n  <div>Rows</div>\n  ");
  hashContexts = {'content': depth0,'value': depth0};
  hashTypes = {'content': "ID",'value': "ID"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'content': ("rowCountOptions"),
    'value': ("rowCount")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["components/basic-table/progress-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n  <i class=\"waiting\"></i>&nbsp;\n");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.displayText", {hash:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n    ");
  hashContexts = {'progressDecimal': depth0};
  hashTypes = {'progressDecimal': "ID"};
  options = {hash:{
    'progressDecimal': ("view.cellContent.displayText")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-progress-animated'] || depth0['bs-progress-animated']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-progress-animated", options))));
  data.buffer.push("\n  ");
  return buffer;
  }

function program6(depth0,data) {
  
  
  data.buffer.push("\n    <span class=\"message\">Not Available!</span>\n  ");
  }

  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.isPending", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["components/basic-table/search-view"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("\n\n<div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":input-group view._validRegEx::has-error")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n  ");
  hashContexts = {'class': depth0,'placeholder': depth0,'action': depth0,'value': depth0,'targetObject': depth0};
  hashTypes = {'class': "STRING",'placeholder': "ID",'action': "STRING",'value': "ID",'targetObject': "ID"};
  options = {hash:{
    'class': ("form-control"),
    'placeholder': ("view.placeholder"),
    'action': ("search"),
    'value': ("view._boundText"),
    'targetObject': ("view")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || depth0.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n  <span class=\"input-group-btn\">\n    <button class=\"btn btn-default\" type=\"button\" ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "STRING"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "search", {hash:{
    'target': ("view")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n      Search\n    </button>\n  </span>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["components/basic-table/status-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n  <i class=\"waiting\"></i>&nbsp;\n");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.status", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.progress", {hash:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n    <i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":task-status view.cellContent.statusIcon")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></i>\n    <span class=\"status-msg\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.cellContent.status", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n  ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n    ");
  hashContexts = {'content': depth0};
  hashTypes = {'content': "ID"};
  options = {hash:{
    'content': ("view.cellContent.progress")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-badge'] || depth0['bs-badge']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-badge", options))));
  data.buffer.push("\n  ");
  return buffer;
  }

function program8(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "view.cellContent.status", {hash:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program9(depth0,data) {
  
  
  data.buffer.push("\n    <span class=\"message\">Not Available!</span>\n  ");
  }

  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.isPending", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["components/basic-table/task-actions-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "task.counters", "view.cellContent.displayText", options) : helperMissing.call(depth0, "link-to", "task.counters", "view.cellContent.displayText", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "task.attempts", "view.cellContent.displayText", options) : helperMissing.call(depth0, "link-to", "task.attempts", "view.cellContent.displayText", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  }
function program2(depth0,data) {
  
  
  data.buffer.push("counters");
  }

function program4(depth0,data) {
  
  
  data.buffer.push("attempts");
  }

function program6(depth0,data) {
  
  
  data.buffer.push("\n  <span class=\"message\">Not Available!</span>\n");
  }

  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.displayText", {hash:{},inverse:self.program(6, program6, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["components/basic-table/vertex-configurations-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("\n  <i class=\"waiting\"></i>&nbsp;\n");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.linkToAdditionals", {hash:{},inverse:self.program(7, program7, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "vertex.additionals", "view.cellContent.vertexId", options) : helperMissing.call(depth0, "link-to", "vertex.additionals", "view.cellContent.vertexId", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program5(depth0,data) {
  
  
  data.buffer.push("View sources & sinks");
  }

function program7(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.inputId", {hash:{},inverse:self.program(11, program11, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program8(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0,depth0,depth0],types:["STRING","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "input.configs", "view.cellContent.vertexId", "view.cellContent.inputId", options) : helperMissing.call(depth0, "link-to", "input.configs", "view.cellContent.vertexId", "view.cellContent.inputId", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program9(depth0,data) {
  
  
  data.buffer.push("View source configs");
  }

function program11(depth0,data) {
  
  var stack1, hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.outputId", {hash:{},inverse:self.program(15, program15, data),fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program12(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0,depth0,depth0],types:["STRING","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "output.configs", "view.cellContent.vertexId", "view.cellContent.outputId", options) : helperMissing.call(depth0, "link-to", "output.configs", "view.cellContent.vertexId", "view.cellContent.outputId", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program13(depth0,data) {
  
  
  data.buffer.push("View sink configs");
  }

function program15(depth0,data) {
  
  
  data.buffer.push("\n    <span class=\"message\">Not Available!</span>\n  ");
  }

  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "view.cellContent.isPending", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["components/counter-table"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n        <tr class='group-header'>\n          <td colspan='2'>\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "counterGroup.counterGroupDisplayName", {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          </td>\n        </tr>\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "counter", "in", "counterGroup.counters", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n              ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "counterGroup.counterGroupDisplayName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n              ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "counterGroup.counterGroupName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n          <tr>\n            <td>");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "counter.counterDisplayName", {hash:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </td>\n            <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatNumThousands || depth0.formatNumThousands),stack1 ? stack1.call(depth0, "counter.counterValue", options) : helperMissing.call(depth0, "formatNumThousands", "counter.counterValue", options))));
  data.buffer.push("</td>\n          </tr>\n        ");
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n                  ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "counter.counterDisplayName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n                  ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "counter.counterName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                ");
  return buffer;
  }

  data.buffer.push("\n\n<table class='countertable'>\n  <thead>\n    <tr>\n      <th>Counter Name</th>\n      <th>Counter Value</th>\n    </tr>\n    <tr>\n      <td class='filter'>\n        <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":input-group validFilter::has-error")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n          ");
  hashContexts = {'size': depth0,'class': depth0,'type': depth0,'results': depth0,'placeholder': depth0,'valueBinding': depth0};
  hashTypes = {'size': "STRING",'class': "STRING",'type': "STRING",'results': "STRING",'placeholder': "STRING",'valueBinding': "STRING"};
  options = {hash:{
    'size': ("60"),
    'class': ("form-control"),
    'type': ("search"),
    'results': ("1"),
    'placeholder': ("Search..."),
    'valueBinding': ("nameFilter")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || depth0.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n        </div>\n      </td>\n      <td class='filter'></td>\n    </tr>\n    <tbody>\n      ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "counterGroup", "in", "filteredData", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    </tbody>\n  </thead>\n</table>\n");
  return buffer;
  
});

Ember.TEMPLATES["components/dag-view"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n  <div class=\"text-align-center\">\n    <h1>Rendering failed! </h1><h5>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "errMessage", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h5>\n  </div>\n");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n  <div class=\"svg-container\">\n    <svg>\n      <defs>\n        <rect id=\"vertex-bg\"\n            class=\"vertex-node-bg\"\n            style=\"fill: url(#vertex-grad); filter: url(#grey-glow)\"\n            rx=\"5\" ry=\"5\" width=\"80\" height=\"30\" x=\"-40\" y=\"-15\"/>\n        <rect id=\"input-bg\"\n            class=\"input-node-bg\"\n            style=\"fill: url(#input-grad); filter: url(#grey-glow)\"\n            rx=\"15\" ry=\"15\" width=\"80\" height=\"30\" x=\"-40\" y=\"-15\"/>\n        <rect id=\"output-bg\"\n            class=\"output-node-bg\"\n            style=\"fill: url(#output-grad); filter: url(#grey-glow)\"\n            rx=\"15\" ry=\"15\" width=\"80\" height=\"30\" x=\"-40\" y=\"-15\"/>\n        <circle id=\"task-bubble\" class=\"task-bubble-bg\"\n            style=\"fill: url(#task-grad); filter: url(#grey-glow)\"\n            r=\"10\"/>\n        <circle id=\"io-bubble\" class=\"input-node-bg\"\n            style=\"fill: url(#input-grad); filter: url(#grey-glow)\"\n            r=\"10\"/>\n        <circle id=\"group-bubble\" class=\"group-bubble-bg\"\n            style=\"fill: url(#group-grad); filter: url(#grey-glow)\"\n            r=\"8\"/>\n\n        <marker id=\"arrow-marker\" viewBox=\"0 -5 10 10\" markerWidth=\"2\" markerHeight=\"2\" orient=\"auto\">\n          <path style=\"fill: #AAA;\" d=\"M0,-5L10,0L0,5\"/>\n        </marker>\n\n        <radialGradient id=\"vertex-grad\" cx=\"50%\" cy=\"50%\" r=\"100%\" fx=\"50%\" fy=\"50%\">\n          <stop offset=\"0%\" style=\"stop-color:#b0c4de;\" />\n          <stop offset=\"100%\" style=\"stop-color:#769ccd;\" />\n        </radialGradient result=\"gradient\">\n\n        <radialGradient id=\"input-grad\" cx=\"50%\" cy=\"50%\" r=\"100%\" fx=\"50%\" fy=\"50%\">\n          <stop offset=\"0%\" style=\"stop-color:#adff2e;\" />\n          <stop offset=\"100%\" style=\"stop-color:#91d723;\" />\n        </radialGradient result=\"gradient\">\n\n        <radialGradient id=\"output-grad\" cx=\"50%\" cy=\"50%\" r=\"100%\" fx=\"50%\" fy=\"50%\">\n          <stop offset=\"0%\" style=\"stop-color:#fa8072;\" />\n          <stop offset=\"100%\" style=\"stop-color:#d26457;\" />\n        </radialGradient result=\"gradient\">\n\n        <radialGradient id=\"task-grad\" cx=\"50%\" cy=\"50%\" r=\"100%\" fx=\"50%\" fy=\"50%\">\n          <stop offset=\"0%\" style=\"stop-color:#D0BFD1;\" />\n          <stop offset=\"100%\" style=\"stop-color:#af8fb1;\" />\n        </radialGradient result=\"gradient\">\n\n        <radialGradient id=\"group-grad\" cx=\"50%\" cy=\"50%\" r=\"100%\" fx=\"50%\" fy=\"50%\">\n          <stop offset=\"0%\" style=\"stop-color:#BBBBBB;\" />\n          <stop offset=\"100%\" style=\"stop-color:#999999;\" />\n        </radialGradient result=\"gradient\">\n\n        <filter id=\"grey-glow\">\n          <feColorMatrix type=\"matrix\" values=\n              \"0 0 0 0   0\n               0 0 0 0   0\n               0 0 0 0   0\n               0 0 0 0.3 0\"/>\n          <feGaussianBlur stdDeviation=\"2.5\" result=\"coloredBlur\"/>\n          <feMerge>\n            <feMergeNode in=\"coloredBlur\"/>\n            <feMergeNode in=\"SourceGraphic\"/>\n          </feMerge>\n        </filter>\n      </defs>\n    </svg>\n  </div>\n  <div class=\"button-panel\">\n    <i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":tgl-additionals hideAdditionals")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "tglAdditionals", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" title=\"Toggle source/sink visibility\"></i>\n    <i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":config :jq-tooltip")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "configure", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" title=\"Customize vertex tooltip\"></i>\n    <i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":timeline :no-display")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "configure", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" title=\"Toggle Timeline\"></i>\n    <i class=\"seperator\"></i>\n    <i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":tgl-orientation isHorizontal:fa-rotate-270:fa-rotate-180")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "tglOrientation", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" title=\"Toggle orientation\"></i>\n    <i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":fit-graph")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "fitGraph", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" title=\"Fit DAG to viewport\"></i>\n    <i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":tgl-fullscreen")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "fullscreen", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" title=\"Toggle fullscreen\"></i>\n  </div>\n  <div class=\"tool-tip\">\n    <div class=\"bubble\">\n      <div class=\"tip-title\">Title</div>\n      <div class=\"tip-text\"></div>\n      <div class=\"tip-list\"></div>\n    </div>\n  </div>\n  <div id=\"dialog-container\"></div>\n");
  return buffer;
  }

  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "errMessage", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  return buffer;
  
});

Ember.TEMPLATES["components/extended-table/extable"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Table.HeaderTableContainer", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n	");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ExTable.FilterTableContainer", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Table.FooterTableContainer", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  return buffer;
  }

  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "controller.hasHeader", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "controller.hasFilter", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Table.BodyTableContainer", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "controller.hasFooter", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Table.ScrollContainer", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Table.ColumnSortableIndicator", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  return buffer;
  
});

Ember.TEMPLATES["components/extended-table/filter-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashTypes, hashContexts, escapeExpression=this.escapeExpression;


  data.buffer.push("\n\n<div class=\"ember-table-content-container\" style='cursor: auto;'>\n  <span class=\"ember-table-content\" style='white-space: nowrap; cursor: auto;'>\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.inputFieldView", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </span>\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["components/extended-table/filter-container"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n    ");
  hashContexts = {'classNames': depth0,'columnsBinding': depth0,'widthBinding': depth0,'heightBinding': depth0};
  hashTypes = {'classNames': "STRING",'columnsBinding': "STRING",'widthBinding': "STRING",'heightBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ExTable.FilterBlock", {hash:{
    'classNames': ("ember-table-left-table-block"),
    'columnsBinding': ("controller.fixedColumns"),
    'widthBinding': ("controller._fixedBlockWidth"),
    'heightBinding': ("controller.filterHeight")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  ");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"ember-table-table-fixed-wrapper\">\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "controller.numFixedColumns", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  hashContexts = {'classNames': depth0,'columnsBinding': depth0,'scrollLeftBinding': depth0,'widthBinding': depth0,'heightBinding': depth0};
  hashTypes = {'classNames': "STRING",'columnsBinding': "STRING",'scrollLeftBinding': "STRING",'widthBinding': "STRING",'heightBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ExTable.FilterBlock", {hash:{
    'classNames': ("ember-table-right-table-block"),
    'columnsBinding': ("controller.tableColumns"),
    'scrollLeftBinding': ("controller._tableScrollLeft"),
    'widthBinding': ("controller._tableBlockWidth"),
    'heightBinding': ("controller.filterHeight")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["components/extended-table/filter-row"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashContexts, hashTypes, escapeExpression=this.escapeExpression;


  data.buffer.push("\n\n");
  hashContexts = {'contentBinding': depth0,'itemViewClassField': depth0,'widthBinding': depth0};
  hashTypes = {'contentBinding': "STRING",'itemViewClassField': "STRING",'widthBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.MultiItemViewCollectionView", {hash:{
    'contentBinding': ("view.content"),
    'itemViewClassField': ("filterCellViewClass"),
    'widthBinding': ("controller._tableColumnsWidth")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  return buffer;
  
});

Ember.TEMPLATES["components/kv-table"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "kv.key", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "formatNumThousands", "kv.value", {hash:{},contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n        </tr>\n      ");
  return buffer;
  }

  data.buffer.push("\n\n<table class='kv-table'>\n  <thead>\n    <tr>\n      <th>Key</th>\n      <th>Value</th>\n    </tr>\n    <tr>\n      <td class='filter' colspan='2'>\n        <div>\n          ");
  hashContexts = {'title': depth0,'size': depth0,'class': depth0,'clicked': depth0,'classBinding': depth0};
  hashTypes = {'title': "STRING",'size': "STRING",'class': "STRING",'clicked': "STRING",'classBinding': "STRING"};
  options = {hash:{
    'title': ("showAll"),
    'size': ("small"),
    'class': ("align-right"),
    'clicked': ("showAllButtonClicked"),
    'classBinding': ("showAllButtonClass")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-button'] || depth0['bs-button']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-button", options))));
  data.buffer.push("\n          <span class=\"input-wrapper\">\n            ");
  hashContexts = {'size': depth0,'type': depth0,'results': depth0,'placeholder': depth0,'valueBinding': depth0};
  hashTypes = {'size': "STRING",'type': "STRING",'results': "STRING",'placeholder': "STRING",'valueBinding': "STRING"};
  options = {hash:{
    'size': ("60"),
    'type': ("search"),
    'results': ("1"),
    'placeholder': ("Search..."),
    'valueBinding': ("filterExp")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || depth0.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n          </span>\n        </div>\n        <div>\n          ");
  hashContexts = {'content': depth0,'type': depth0,'classBinding': depth0};
  hashTypes = {'content': "STRING",'type': "STRING",'classBinding': "STRING"};
  options = {hash:{
    'content': ("Invalid regex"),
    'type': ("warning"),
    'classBinding': ("errorMsgClass")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-label'] || depth0['bs-label']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-label", options))));
  data.buffer.push("\n        </div>\n      </td>\n    </tr>\n    <tbody>\n      ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "kv", "in", "filteredKVs", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    </tbody>\n  </thead>\n</table>\n");
  return buffer;
  
});

Ember.TEMPLATES["components/load-time"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n        <div class=\"auto-update\">\n          ");
  hashContexts = {'classNames': depth0,'checked': depth0};
  hashTypes = {'classNames': "STRING",'checked': "ID"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.Checkbox", {hash:{
    'classNames': ("inline-display checkbox"),
    'checked': ("targetObject.pollingEnabled")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          Auto Refresh\n        </div>\n      ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n          Last refreshed at <b>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "displayTime", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</b>\n        ");
  return buffer;
  }

function program5(depth0,data) {
  
  
  data.buffer.push("\n          Load time not available!\n        ");
  }

  data.buffer.push("\n\n<div class=\"panel panel-default load-component\">\n  <div class=\"panel-body\">\n    <div class=\"horizontal-half\">\n      <i class='fa fa-clock-o'></i>\n\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "targetObject.showAutoUpdate", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div><div class=\"horizontal-half align-children-right\">\n      <span class=\"margin-small-horizontal\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "displayTime", {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </span>\n      <button type=\"button\" ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":btn :btn-success :btn-sm isRefreshable::no-display")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "refresh", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n        <i class='fa fa-refresh'></i>\n        Refresh\n      </button>\n    </div>\n  </div>\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["components/page-nav"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("\n\n<div class=\"page-count\">\n  <div class=\"text\">Page</div><span class=\"counter\">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "page", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n</div>\n<i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":nav-first hasPrev:enabled:disabled")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "gotoFirst", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></i>\n<i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":nav-prev hasPrev:enabled:disabled")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "gotoPrev", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></i>\n<i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":nav-next hasNext:enabled:disabled")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "gotoNext", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></i>");
  return buffer;
  
});

Ember.TEMPLATES["dag"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<i class=\"fa fa-home\"> All DAGs</i>");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n  <div class='type-table fill-full margin-small'>\n    <div class='pill-container align-right'>\n      ");
  hashContexts = {'contentBinding': depth0,'selectedBinding': depth0,'size': depth0};
  hashTypes = {'contentBinding': "STRING",'selectedBinding': "STRING",'size': "STRING"};
  options = {hash:{
    'contentBinding': ("childDisplayViews"),
    'selectedBinding': ("childDisplayViewSelected"),
    'size': ("lg")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-pills'] || depth0['bs-pills']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-pills", options))));
  data.buffer.push("\n    </div>\n\n  </div>\n  <div class='margin-small-vertical'>\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </div>\n");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "partials/loading-spinner", options) : helperMissing.call(depth0, "partial", "partials/loading-spinner", options))));
  data.buffer.push("\n");
  return buffer;
  }

  data.buffer.push("\n\n<ul class=\"breadcrumb\">\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "application", options) : helperMissing.call(depth0, "link-to", "application", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" <span class=\"divider\"></span></li>\n  <li class=\"active\">DAG [ ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ]</li>\n</ul>\n\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.unless.call(depth0, "loading", {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["dag/index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n              ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("ember-table-content")
  },inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "tez-app", "applicationId", options) : helperMissing.call(depth0, "link-to", "tez-app", "applicationId", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program2(depth0,data) {
  
  var hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "applicationId", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

function program4(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n              <span class='ember-table-content'>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "applicationId", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n            ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push(" ");
  hashContexts = {'content': depth0};
  hashTypes = {'content': "ID"};
  options = {hash:{
    'content': ("progressStr")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-badge'] || depth0['bs-badge']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-badge", options))));
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n              [ <a href='");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "failedTasksLink", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("'>Failed Tasks</a> ]\n            ");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n              [ <a href='");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "failedTaskAttemptsLink", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("'>Failed TaskAttempts</a> ]\n            ");
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n  <br/>\n  <h4>DAG Progress\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "progressDetails", {hash:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </h4>\n  ");
  hashContexts = {'progressDecimal': depth0};
  hashTypes = {'progressDecimal': "ID"};
  options = {hash:{
    'progressDecimal': ("progress")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-progress-animated'] || depth0['bs-progress-animated']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-progress-animated", options))));
  data.buffer.push("\n\n  ");
  hashContexts = {'columns': depth0,'rows': depth0,'rowCount': depth0,'enableStatus': depth0,'enableSort': depth0};
  hashTypes = {'columns': "ID",'rows': "ID",'rowCount': "ID",'enableStatus': "BOOLEAN",'enableSort': "BOOLEAN"};
  options = {hash:{
    'columns': ("defaultColumnConfigs"),
    'rows': ("data.content"),
    'rowCount': ("data.content.length"),
    'enableStatus': (false),
    'enableSort': (true)
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['basic-table-component'] || depth0['basic-table-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "basic-table-component", options))));
  data.buffer.push("\n");
  return buffer;
  }
function program13(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n      ( Vertices ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "progressDetails.completedVertices", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("/");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "data.length", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" )\n      ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "progressDetails.totalTasks", {hash:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      :\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "progressStr", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    ");
  return buffer;
  }
function program14(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n        ( Tasks ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "progressDetails.succeededTasks", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("/");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "progressDetails.totalTasks", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" )\n      ");
  return buffer;
  }

function program16(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n  <div class=\"margin-small-vertical\">\n    ");
  hashContexts = {'heading': depth0,'collapsible': depth0,'dismiss': depth0,'type': depth0};
  hashTypes = {'heading': "STRING",'collapsible': "BOOLEAN",'dismiss': "BOOLEAN",'type': "STRING"};
  options = {hash:{
    'heading': ("Diagnostics"),
    'collapsible': (false),
    'dismiss': (false),
    'type': ("danger")
  },inverse:self.noop,fn:self.program(17, program17, data),contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['bs-panel'] || depth0['bs-panel']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-panel", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  </div>\n");
  return buffer;
  }
function program17(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatDiagnostics || depth0.formatDiagnostics),stack1 ? stack1.call(depth0, "diagnostics", options) : helperMissing.call(depth0, "formatDiagnostics", "diagnostics", options))));
  data.buffer.push("\n    ");
  return buffer;
  }

function program19(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n  <div class='margin-small-vertical code-mirror-container'>\n    ");
  hashContexts = {'heading': depth0,'collapsible': depth0,'dismiss': depth0,'type': depth0};
  hashTypes = {'heading': "ID",'collapsible': "BOOLEAN",'dismiss': "BOOLEAN",'type': "STRING"};
  options = {hash:{
    'heading': ("appContextHeading"),
    'collapsible': (false),
    'dismiss': (false),
    'type': ("info")
  },inverse:self.noop,fn:self.program(20, program20, data),contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['bs-panel'] || depth0['bs-panel']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-panel", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  </div>\n");
  return buffer;
  }
function program20(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n      ");
  hashContexts = {'value': depth0,'mode': depth0,'classNames': depth0};
  hashTypes = {'value': "ID",'mode': "ID",'classNames': "STRING"};
  options = {hash:{
    'value': ("appContext"),
    'mode': ("appInfoContextType"),
    'classNames': ("additional-dag-info")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['code-mirror'] || depth0['code-mirror']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "code-mirror", options))));
  data.buffer.push("\n    ");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"margin-small-vertical\">\n  ");
  hashContexts = {'isRefreshable': depth0,'time': depth0,'refresh': depth0};
  hashTypes = {'isRefreshable': "ID",'time': "ID",'refresh': "STRING"};
  options = {hash:{
    'isRefreshable': ("isRefreshable"),
    'time': ("timeStamp"),
    'refresh': ("refresh")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['load-time-component'] || depth0['load-time-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "load-time-component", options))));
  data.buffer.push("\n</div>\n<div class='type-table fill-full margin-small-horizontal'>\n  <div class='align-left'>\n    <table class='detail-list'>\n       <thead>\n         <tr>\n            <th colspan=2>DAG Details</th>\n         </tr>\n      </thead>\n      <tbody>\n        <tr>\n          <td colspan=\"2\">\n            ");
  hashContexts = {'icon': depth0,'title': depth0,'type': depth0,'clicked': depth0};
  hashTypes = {'icon': "STRING",'title': "STRING",'type': "STRING",'clicked': "STRING"};
  options = {hash:{
    'icon': ("fa fa-download"),
    'title': ("Download data"),
    'type': ("info"),
    'clicked': ("downloadDagJson")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-button'] || depth0['bs-button']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-button", options))));
  data.buffer.push("\n          </td>\n        </tr>\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.applicationId", options) : helperMissing.call(depth0, "t", "common.applicationId", options))));
  data.buffer.push("</td>\n          <td>\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "controllers.dag.enableAppIdLink", {hash:{},inverse:self.program(4, program4, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n          </td>\n        </tr>\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.id", options) : helperMissing.call(depth0, "t", "common.id", options))));
  data.buffer.push("</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n        </tr>\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.user", options) : helperMissing.call(depth0, "t", "common.user", options))));
  data.buffer.push("</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "user", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n        </tr>\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.status", options) : helperMissing.call(depth0, "t", "common.status", options))));
  data.buffer.push("</td>\n          <td>\n            <i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":task-status taskIconStatus")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></i> ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "status", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "progressStr", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "hasFailedTasks", {hash:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "hasFailedTaskAttempts", {hash:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n          </td>\n        </tr>\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.time.start", options) : helperMissing.call(depth0, "t", "common.time.start", options))));
  data.buffer.push("</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatUnixTimestamp || depth0.formatUnixTimestamp),stack1 ? stack1.call(depth0, "startTime", options) : helperMissing.call(depth0, "formatUnixTimestamp", "startTime", options))));
  data.buffer.push("</td>\n        </tr>\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.time.end", options) : helperMissing.call(depth0, "t", "common.time.end", options))));
  data.buffer.push("</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatUnixTimestamp || depth0.formatUnixTimestamp),stack1 ? stack1.call(depth0, "endTime", options) : helperMissing.call(depth0, "formatUnixTimestamp", "endTime", options))));
  data.buffer.push("</td>\n        </tr>\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.time.duration", options) : helperMissing.call(depth0, "t", "common.time.duration", options))));
  data.buffer.push("</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatDuration || depth0.formatDuration),stack1 ? stack1.call(depth0, "startTime", "endTime", options) : helperMissing.call(depth0, "formatDuration", "startTime", "endTime", options))));
  data.buffer.push("</td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n</div>\n\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "data.content", {hash:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "diagnostics", {hash:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "appContext", {hash:{},inverse:self.noop,fn:self.program(19, program19, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["dag/vertices"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n  <div class='margin-small'>\n    <span class=\"left-divider align-right\">\n      <i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":fa-action :fa-cog")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectColumns", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></i>\n    </span>\n    <span class='align-right'>\n      ");
  hashContexts = {'hasPrev': depth0,'hasNext': depth0,'navNext': depth0,'navPrev': depth0,'navFirst': depth0};
  hashTypes = {'hasPrev': "ID",'hasNext': "ID",'navNext': "STRING",'navPrev': "STRING",'navFirst': "STRING"};
  options = {hash:{
    'hasPrev': ("hasPrev"),
    'hasNext': ("hasNext"),
    'navNext': ("navigateNext"),
    'navPrev': ("navigatePrev"),
    'navFirst': ("navigateFirst")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['page-nav-component'] || depth0['page-nav-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "page-nav-component", options))));
  data.buffer.push("\n    </span>\n    <div class='align-clear'> </div>\n  </div>\n\n  <div class='table-container'>\n  ");
  hashContexts = {'hasFooter': depth0,'enableContentSelection': depth0,'columnsBinding': depth0,'contentBinding': depth0,'forceFillColumns': depth0,'hasFilter': depth0,'onFilterUpdated': depth0};
  hashTypes = {'hasFooter': "BOOLEAN",'enableContentSelection': "BOOLEAN",'columnsBinding': "STRING",'contentBinding': "STRING",'forceFillColumns': "BOOLEAN",'hasFilter': "BOOLEAN",'onFilterUpdated': "STRING"};
  options = {hash:{
    'hasFooter': (false),
    'enableContentSelection': (true),
    'columnsBinding': ("columns"),
    'contentBinding': ("sortedContent"),
    'forceFillColumns': (true),
    'hasFilter': (true),
    'onFilterUpdated': ("filterUpdated")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['extended-table-component'] || depth0['extended-table-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "extended-table-component", options))));
  data.buffer.push("\n  </div>\n");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "partials/loading-spinner", options) : helperMissing.call(depth0, "partial", "partials/loading-spinner", options))));
  data.buffer.push("\n");
  return buffer;
  }

  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.unless.call(depth0, "loading", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  return buffer;
  
});

Ember.TEMPLATES["dag/view"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n    ");
  hashContexts = {'data': depth0,'vertexProperties': depth0,'entityClicked': depth0,'configure': depth0};
  hashTypes = {'data': "ID",'vertexProperties': "ID",'entityClicked': "STRING",'configure': "STRING"};
  options = {hash:{
    'data': ("viewData"),
    'vertexProperties': ("columns"),
    'entityClicked': ("entityClicked"),
    'configure': ("selectColumns")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['dag-view-component'] || depth0['dag-view-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "dag-view-component", options))));
  data.buffer.push("\n    <div class=\"dag-view-legend\">When sources & sinks are hidden, double click green bubble to toggle visibility locally.</div>\n  ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "partials/loading-spinner", options) : helperMissing.call(depth0, "partial", "partials/loading-spinner", options))));
  data.buffer.push("\n  ");
  return buffer;
  }

  data.buffer.push("\n\n<div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":margin-small-vertical loading:no-visible")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n  ");
  hashContexts = {'isRefreshable': depth0,'time': depth0,'refresh': depth0};
  hashTypes = {'isRefreshable': "ID",'time': "ID",'refresh': "STRING"};
  options = {hash:{
    'isRefreshable': ("isRefreshable"),
    'time': ("data.content.0.timeStamp"),
    'refresh': ("refresh")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['load-time-component'] || depth0['load-time-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "load-time-component", options))));
  data.buffer.push("\n</div>\n<div class=\"dag-view-component-container\">\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.unless.call(depth0, "loading", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["dags"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<i class=\"fa fa-home\"> All DAGs</i>");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n    ");
  hashContexts = {'isRefreshable': depth0,'time': depth0,'refresh': depth0};
  hashTypes = {'isRefreshable': "ID",'time': "ID",'refresh': "STRING"};
  options = {hash:{
    'isRefreshable': ("isRefreshable"),
    'time': ("sortedContent.0.timeStamp"),
    'refresh': ("refresh")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['load-time-component'] || depth0['load-time-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "load-time-component", options))));
  data.buffer.push("\n    <div class='dag-header'>\n      <div class=\"align-children-left\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "visibleFilters.dagName", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "visibleFilters.id", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "visibleFilters.user", {hash:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "visibleFilters.status", {hash:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "visibleFilters.appId", {hash:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "visibleFilters.callerId", {hash:{},inverse:self.noop,fn:self.program(14, program14, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n      </div><div class=\"align-children-right\">\n        ");
  hashContexts = {'pageNum': depth0,'totalPages': depth0,'hideLast': depth0};
  hashTypes = {'pageNum': "ID",'totalPages': "ID",'hideLast': "BOOLEAN"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.BasicTableComponent.PaginationView", {hash:{
    'pageNum': ("page"),
    'totalPages': ("lastPage"),
    'hideLast': (true)
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        <i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":fa-action :fa-cog :left-divider")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectColumns", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></i>\n      </div>\n    </div>\n    ");
  hashContexts = {'columns': depth0,'rows': depth0,'rowCountBinding': depth0,'statusMessage': depth0};
  hashTypes = {'columns': "ID",'rows': "ID",'rowCountBinding': "STRING",'statusMessage': "ID"};
  options = {hash:{
    'columns': ("columns"),
    'rows': ("sortedContent"),
    'rowCountBinding': ("rowCount"),
    'statusMessage': ("statusMessage")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['basic-table-component'] || depth0['basic-table-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "basic-table-component", options))));
  data.buffer.push("\n  ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n          <div class='filter-elements'>\n            <div>Dag Name</div>\n            ");
  hashContexts = {'action': depth0,'value': depth0,'placeholder': depth0};
  hashTypes = {'action': "STRING",'value': "ID",'placeholder': "STRING"};
  options = {hash:{
    'action': ("filterUpdated"),
    'value': ("boundFilterValues.dagName"),
    'placeholder': ("Search...")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || depth0.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n          </div>\n        ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n          <div class='filter-elements'>\n            <div>Id</div>\n            ");
  hashContexts = {'action': depth0,'value': depth0,'placeholder': depth0};
  hashTypes = {'action': "STRING",'value': "ID",'placeholder': "STRING"};
  options = {hash:{
    'action': ("filterUpdated"),
    'value': ("boundFilterValues.id"),
    'placeholder': ("Search...")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || depth0.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n          </div>\n        ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n          <div class='filter-elements'>\n            <div>Submitter</div>\n            ");
  hashContexts = {'action': depth0,'value': depth0,'placeholder': depth0};
  hashTypes = {'action': "STRING",'value': "ID",'placeholder': "STRING"};
  options = {hash:{
    'action': ("filterUpdated"),
    'value': ("boundFilterValues.user"),
    'placeholder': ("Search...")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || depth0.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n          </div>\n        ");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n          <div class='filter-elements'>\n            <div>Status</div>\n            ");
  hashContexts = {'optionValuePath': depth0,'optionLabelPath': depth0,'classNames': depth0,'action': depth0,'content': depth0,'value': depth0};
  hashTypes = {'optionValuePath': "STRING",'optionLabelPath': "STRING",'classNames': "STRING",'action': "STRING",'content': "ID",'value': "ID"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.Dropdown", {hash:{
    'optionValuePath': ("content.id"),
    'optionLabelPath': ("content.label"),
    'classNames': ("inline-display"),
    'action': ("filterUpdated"),
    'content': ("App.Helpers.misc.dagStatusUIOptions"),
    'value': ("boundFilterValues.status")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </div>\n        ");
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n          <div class='filter-elements'>\n            <div>Application ID</div>\n            ");
  hashContexts = {'action': depth0,'value': depth0,'placeholder': depth0};
  hashTypes = {'action': "STRING",'value': "ID",'placeholder': "STRING"};
  options = {hash:{
    'action': ("filterUpdated"),
    'value': ("boundFilterValues.appId"),
    'placeholder': ("Search...")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || depth0.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n          </div>\n        ");
  return buffer;
  }

function program14(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n          <div class='filter-elements'>\n            <div>Context ID (Hive Query ID or Pig Script ID)</div>\n            ");
  hashContexts = {'action': depth0,'value': depth0,'placeholder': depth0};
  hashTypes = {'action': "STRING",'value': "ID",'placeholder': "STRING"};
  options = {hash:{
    'action': ("filterUpdated"),
    'value': ("boundFilterValues.callerId"),
    'placeholder': ("Search...")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || depth0.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n          </div>\n        ");
  return buffer;
  }

function program16(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "partials/loading-spinner", options) : helperMissing.call(depth0, "partial", "partials/loading-spinner", options))));
  data.buffer.push("\n    <div class=\"text-align-center\">\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "statusMessage", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    </div>\n  ");
  return buffer;
  }

  data.buffer.push("\n\n<ul class=\"breadcrumb\">\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "application", options) : helperMissing.call(depth0, "link-to", "application", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" <span class=\"divider\"></span></li>\n</ul>\n\n<div class='margin-small-vertical'>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.unless.call(depth0, "loading", {hash:{},inverse:self.program(16, program16, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["error"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("<i class=\"fa fa-home\"> All DAGs</i>");
  }

  data.buffer.push("\n\n<ul class=\"breadcrumb\">\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "application", options) : helperMissing.call(depth0, "link-to", "application", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" <span class=\"divider\"></span></li>\n  <li class=\"active\">Error</span></li>\n</ul>\n\n<h1>An Error Occurred</h1>\n");
  return buffer;
  
});

Ember.TEMPLATES["input/configs"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("\n\n<div class='margin-small-horizontal' style=\"margin-bottom:10px;\">\n  <table class='detail-list'>\n    <thead>\n      <tr>\n        <th>Source Details</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr>\n        <td>Name</td>\n        <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "inputName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n      </tr>\n      <tr>\n        <td>Class</td>\n        <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "inputClass", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n      </tr>\n      <tr>\n        <td>Initializer</td>\n        <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "inputInitializer", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n      </tr>\n    </tbody>\n  </table>\n</div>\n");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "partials/configs", options) : helperMissing.call(depth0, "partial", "partials/configs", options))));
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["output/configs"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("\n\n<div class='margin-small-horizontal' style=\"margin-bottom:10px;\">\n  <table class='detail-list'>\n    <thead>\n      <tr>\n        <th>Sink Details</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr>\n        <td>Name</td>\n        <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outputName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n      </tr>\n      <tr>\n        <td>Class</td>\n        <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outputClass", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n      </tr>\n    </tbody>\n  </table>\n</div>\n");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "partials/configs", options) : helperMissing.call(depth0, "partial", "partials/configs", options))));
  data.buffer.push("\n\n");
  return buffer;
  
});

Ember.TEMPLATES["partials/configs"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n  ");
  hashContexts = {'isRefreshable': depth0,'time': depth0,'refresh': depth0};
  hashTypes = {'isRefreshable': "ID",'time': "ID",'refresh': "STRING"};
  options = {hash:{
    'isRefreshable': ("isRefreshable"),
    'time': ("timeStamp"),
    'refresh': ("refresh")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['load-time-component'] || depth0['load-time-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "load-time-component", options))));
  data.buffer.push("\n  <div class='table-container margin-small-vertical'>\n    ");
  hashContexts = {'data': depth0,'filterExp': depth0};
  hashTypes = {'data': "ID",'filterExp': "STRING"};
  options = {hash:{
    'data': ("configs"),
    'filterExp': ("^tez.")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['kv-table-component'] || depth0['kv-table-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "kv-table-component", options))));
  data.buffer.push("\n  </div>\n");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n  <div class='margin-small-horizontal'>\n    <h4>No configurations available!</h4>\n  </div>\n");
  }

  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "configs", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  return buffer;
  
});

Ember.TEMPLATES["partials/loading-spinner"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '';


  data.buffer.push("\n\n<div class='align-children-center'>\n  <i class='fa fa-spinner fa-spin fa-5x fa-fw'></i>\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["partials/table-controls"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("\n\n<div class='margin-small-horizontal table-control'>\n  <div class=\"horizontal-half align-children-left\">\n    Number of rows\n    ");
  hashContexts = {'content': depth0,'value': depth0};
  hashTypes = {'content': "ID",'value': "ID"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'content': ("countOptions"),
    'value': ("count")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </div><div class=\"horizontal-half align-children-right\">\n    ");
  hashContexts = {'hasPrev': depth0,'hasNext': depth0,'page': depth0,'navNext': depth0,'navPrev': depth0,'navFirst': depth0};
  hashTypes = {'hasPrev': "ID",'hasNext': "ID",'page': "ID",'navNext': "STRING",'navPrev': "STRING",'navFirst': "STRING"};
  options = {hash:{
    'hasPrev': ("hasPrev"),
    'hasNext': ("hasNext"),
    'page': ("page"),
    'navNext': ("navigateNext"),
    'navPrev': ("navigatePrev"),
    'navFirst': ("navigateFirst")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['page-nav-component'] || depth0['page-nav-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "page-nav-component", options))));
  data.buffer.push("\n    <i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":fa-action :fa-cog :left-divider")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectColumns", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></i>\n  </div>\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["partials/table"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("\n\n<div class='ember-table-container'>\n  ");
  hashContexts = {'hasFooter': depth0,'enableContentSelection': depth0,'columnsBinding': depth0,'contentBinding': depth0,'forceFillColumns': depth0,'hasFilter': depth0,'onFilterUpdated': depth0};
  hashTypes = {'hasFooter': "BOOLEAN",'enableContentSelection': "BOOLEAN",'columnsBinding': "STRING",'contentBinding': "STRING",'forceFillColumns': "BOOLEAN",'hasFilter': "BOOLEAN",'onFilterUpdated': "STRING"};
  options = {hash:{
    'hasFooter': (false),
    'enableContentSelection': (true),
    'columnsBinding': ("columns"),
    'contentBinding': ("sortedContent"),
    'forceFillColumns': (true),
    'hasFilter': (true),
    'onFilterUpdated': ("filterUpdated")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['extended-table-component'] || depth0['extended-table-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "extended-table-component", options))));
  data.buffer.push("\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["task"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<i class=\"fa fa-home\"> All DAGs</i>");
  }

function program3(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("DAG [ ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "dagName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ]");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("Vertex [ ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "vertexName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ] ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n  <div class='type-table fill-full margin-small-horizontal'>\n    <div class='pill-container align-right'>\n      ");
  hashContexts = {'contentBinding': depth0,'selectedBinding': depth0,'size': depth0};
  hashTypes = {'contentBinding': "STRING",'selectedBinding': "STRING",'size': "STRING"};
  options = {hash:{
    'contentBinding': ("childDisplayViews"),
    'selectedBinding': ("childDisplayViewSelected"),
    'size': ("lg")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-pills'] || depth0['bs-pills']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-pills", options))));
  data.buffer.push("\n    </div>\n  </div>\n  <div class='margin-small-vertical'>\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </div>\n");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "partials/loading-spinner", options) : helperMissing.call(depth0, "partial", "partials/loading-spinner", options))));
  data.buffer.push("\n");
  return buffer;
  }

  data.buffer.push("\n\n<ul class=\"breadcrumb\">\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "application", options) : helperMissing.call(depth0, "link-to", "application", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" <span class=\"divider\"></span></li>\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "dag", "dagID", options) : helperMissing.call(depth0, "link-to", "dag", "dagID", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" <span class=\"divider\"></span></li>\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "vertex", "vertexID", options) : helperMissing.call(depth0, "link-to", "vertex", "vertexID", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" <span class=\"divider\"></span></li>\n  <li class=\"active\">Task [ ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "index", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ]</li>\n</ul>\n\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.unless.call(depth0, "loading", {hash:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["task/index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n        <tr>\n          <td>Progress</td>\n          <td>");
  hashContexts = {'progressDecimal': depth0};
  hashTypes = {'progressDecimal': "ID"};
  options = {hash:{
    'progressDecimal': ("progress")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-progress-animated'] || depth0['bs-progress-animated']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-progress-animated", options))));
  data.buffer.push("</td>\n        </tr>\n        ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n	<div class=\"margin-small-vertical\">\n		");
  hashContexts = {'heading': depth0,'collapsible': depth0,'dismiss': depth0,'type': depth0,'class': depth0};
  hashTypes = {'heading': "STRING",'collapsible': "BOOLEAN",'dismiss': "BOOLEAN",'type': "STRING",'class': "STRING"};
  options = {hash:{
    'heading': ("Diagnostics"),
    'collapsible': (false),
    'dismiss': (false),
    'type': ("danger"),
    'class': ("margin-medium-vertical")
  },inverse:self.noop,fn:self.program(4, program4, data),contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['bs-panel'] || depth0['bs-panel']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-panel", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n	</div>\n");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n			");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatDiagnostics || depth0.formatDiagnostics),stack1 ? stack1.call(depth0, "diagnostics", options) : helperMissing.call(depth0, "formatDiagnostics", "diagnostics", options))));
  data.buffer.push("\n		");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"margin-small-vertical\">\n  ");
  hashContexts = {'isRefreshable': depth0,'time': depth0,'refresh': depth0};
  hashTypes = {'isRefreshable': "ID",'time': "ID",'refresh': "STRING"};
  options = {hash:{
    'isRefreshable': ("isRefreshable"),
    'time': ("timeStamp"),
    'refresh': ("refresh")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['load-time-component'] || depth0['load-time-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "load-time-component", options))));
  data.buffer.push("\n</div>\n<div class='type-table fill-full margin-small-horizontal'>\n	<div class='align-left'>\n		<table class='detail-list'>\n 			<thead>\n 			        <tr>\n 			           <th colspan=2>Task Details</th>\n 			        </tr>\n 			</thead>\n			<tbody>\n				<tr>\n 					<td>Task ID</td>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n				</tr>\n				<tr>\n					<td>Vertex ID</td>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "vertexID", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n				</tr>\n				<tr>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.status", options) : helperMissing.call(depth0, "t", "common.status", options))));
  data.buffer.push("</td>\n					<td>\n						<i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":task-status taskIconStatus")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></i> ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "taskStatus", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n					</td>\n				</tr>\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "progress", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n				<tr>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.time.start", options) : helperMissing.call(depth0, "t", "common.time.start", options))));
  data.buffer.push("</td>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatUnixTimestamp || depth0.formatUnixTimestamp),stack1 ? stack1.call(depth0, "startTime", options) : helperMissing.call(depth0, "formatUnixTimestamp", "startTime", options))));
  data.buffer.push("</td>\n				</tr>\n				<tr>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.time.end", options) : helperMissing.call(depth0, "t", "common.time.end", options))));
  data.buffer.push("</td>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatUnixTimestamp || depth0.formatUnixTimestamp),stack1 ? stack1.call(depth0, "endTime", options) : helperMissing.call(depth0, "formatUnixTimestamp", "endTime", options))));
  data.buffer.push("</td>\n				</tr>\n				<tr>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.time.duration", options) : helperMissing.call(depth0, "t", "common.time.duration", options))));
  data.buffer.push("</td>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatDuration || depth0.formatDuration),stack1 ? stack1.call(depth0, "startTime", "endTime", options) : helperMissing.call(depth0, "formatDuration", "startTime", "endTime", options))));
  data.buffer.push("</td>\n				</tr>\n			</tbody>\n		</table>\n	</div>\n</div>\n\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "diagnostics", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["taskAttempt/index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n        <tr>\n          <td>Progress</td>\n          <td>");
  hashContexts = {'progressDecimal': depth0};
  hashTypes = {'progressDecimal': "ID"};
  options = {hash:{
    'progressDecimal': ("progress")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-progress-animated'] || depth0['bs-progress-animated']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-progress-animated", options))));
  data.buffer.push("</td>\n        </tr>\n        ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n	<div class=\"margin-small-vertical\">\n		");
  hashContexts = {'heading': depth0,'collapsible': depth0,'dismiss': depth0,'type': depth0,'class': depth0};
  hashTypes = {'heading': "STRING",'collapsible': "BOOLEAN",'dismiss': "BOOLEAN",'type': "STRING",'class': "STRING"};
  options = {hash:{
    'heading': ("Diagnostics"),
    'collapsible': (false),
    'dismiss': (false),
    'type': ("danger"),
    'class': ("margin-medium-vertical")
  },inverse:self.noop,fn:self.program(4, program4, data),contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['bs-panel'] || depth0['bs-panel']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-panel", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n	</div>\n");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n		");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatDiagnostics || depth0.formatDiagnostics),stack1 ? stack1.call(depth0, "diagnostics", options) : helperMissing.call(depth0, "formatDiagnostics", "diagnostics", options))));
  data.buffer.push("\n		");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"margin-small-vertical\">\n  ");
  hashContexts = {'isRefreshable': depth0,'time': depth0,'refresh': depth0};
  hashTypes = {'isRefreshable': "ID",'time': "ID",'refresh': "STRING"};
  options = {hash:{
    'isRefreshable': ("isRefreshable"),
    'time': ("timeStamp"),
    'refresh': ("refresh")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['load-time-component'] || depth0['load-time-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "load-time-component", options))));
  data.buffer.push("\n</div>\n<div class='type-table fill-full margin-small-horizontal'>\n	<div class='align-left'>\n		<table class='detail-list'>\n			<thead>\n				<tr>\n					<th colspan=2>TaskAttempt Details</th>\n				</tr>\n			</thead>\n			<tbody>\n				<tr>\n					<td>Task Attempt ID</td>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n				</tr>\n				<tr>\n					<td>Task ID</td>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "taskID", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n				</tr>\n				<tr>\n					<td>Container</td>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "containerId", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n				</tr>\n				<tr>\n					<td>Node</td>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "nodeId", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n				</tr>\n				<tr>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.status", options) : helperMissing.call(depth0, "t", "common.status", options))));
  data.buffer.push("</td>\n					<td>\n						<i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":task-status taskAttemptIconStatus")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></i> ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "taskAttemptStatus", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n					</td>\n				</tr>\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "progress", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n				<tr>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.time.start", options) : helperMissing.call(depth0, "t", "common.time.start", options))));
  data.buffer.push("</td>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatUnixTimestamp || depth0.formatUnixTimestamp),stack1 ? stack1.call(depth0, "startTime", options) : helperMissing.call(depth0, "formatUnixTimestamp", "startTime", options))));
  data.buffer.push("</td>\n				</tr>\n				<tr>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.time.end", options) : helperMissing.call(depth0, "t", "common.time.end", options))));
  data.buffer.push("</td>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatUnixTimestamp || depth0.formatUnixTimestamp),stack1 ? stack1.call(depth0, "endTime", options) : helperMissing.call(depth0, "formatUnixTimestamp", "endTime", options))));
  data.buffer.push("</td>\n				</tr>\n				<tr>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.time.duration", options) : helperMissing.call(depth0, "t", "common.time.duration", options))));
  data.buffer.push("</td>\n					<td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatDuration || depth0.formatDuration),stack1 ? stack1.call(depth0, "startTime", "endTime", options) : helperMissing.call(depth0, "formatDuration", "startTime", "endTime", options))));
  data.buffer.push("</td>\n				</tr>\n			</tbody>\n		</table>\n	</div>\n</div>\n\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "diagnostics", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["task_attempt"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<i class=\"fa fa-home\"> All DAGs</i>");
  }

function program3(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("DAG [ ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "dagName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ] ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("Vertex [ ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "vertexName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ] ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("Task [ ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "taskIndex", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ] ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n  <div class='type-table fill-full margin-small-horizontal'>\n    <div class='pill-container align-right'>\n      ");
  hashContexts = {'contentBinding': depth0,'selectedBinding': depth0,'size': depth0};
  hashTypes = {'contentBinding': "STRING",'selectedBinding': "STRING",'size': "STRING"};
  options = {hash:{
    'contentBinding': ("childDisplayViews"),
    'selectedBinding': ("childDisplayViewSelected"),
    'size': ("lg")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-pills'] || depth0['bs-pills']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-pills", options))));
  data.buffer.push("\n    </div>\n  </div>\n  <div class='margin-small-vertical'>\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </div>\n");
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "partials/loading-spinner", options) : helperMissing.call(depth0, "partial", "partials/loading-spinner", options))));
  data.buffer.push("\n");
  return buffer;
  }

  data.buffer.push("\n\n<ul class=\"breadcrumb\">\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "application", options) : helperMissing.call(depth0, "link-to", "application", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" <span class=\"divider\"></span></li>\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "dag", "dagID", options) : helperMissing.call(depth0, "link-to", "dag", "dagID", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" <span class=\"divider\"></span></li>\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "vertex", "vertexID", options) : helperMissing.call(depth0, "link-to", "vertex", "vertexID", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" <span class=\"divider\"></span></li>\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "task", "taskID", options) : helperMissing.call(depth0, "link-to", "task", "taskID", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" <span class=\"divider\"></span></li>\n  <li class=\"active\">Task Attempt [ ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "index", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ]</li>\n</ul>\n\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.unless.call(depth0, "loading", {hash:{},inverse:self.program(11, program11, data),fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["tasks"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("<i class=\"fa fa-home\"> All DAGs</i>");
  }

function program3(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("DAG [ ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "parentName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ]");
  return buffer;
  }

  data.buffer.push("\n\n<ul class=\"breadcrumb\">\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "application", options) : helperMissing.call(depth0, "link-to", "application", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" <span class=\"divider\"></span></li>\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "dag", "parentID", options) : helperMissing.call(depth0, "link-to", "dag", "parentID", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" <span class=\"divider\"></span></li>\n  <li class=\"active\">Tasks</li>\n</ul>\n\n");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "common/table-with-spinner", options) : helperMissing.call(depth0, "partial", "common/table-with-spinner", options))));
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["tez-app"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<i class=\"fa fa-home\"> All DAGs</i>");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n  <div class='type-table fill-full '>\n    <div class='pill-container align-right'>\n      ");
  hashContexts = {'contentBinding': depth0,'selectedBinding': depth0,'size': depth0};
  hashTypes = {'contentBinding': "STRING",'selectedBinding': "STRING",'size': "STRING"};
  options = {hash:{
    'contentBinding': ("childDisplayViews"),
    'selectedBinding': ("childDisplayViewSelected"),
    'size': ("lg")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-pills'] || depth0['bs-pills']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-pills", options))));
  data.buffer.push("\n    </div>\n  </div>\n  <div class='margin-small-vertical'>\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </div>\n");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "partials/loading-spinner", options) : helperMissing.call(depth0, "partial", "partials/loading-spinner", options))));
  data.buffer.push("\n");
  return buffer;
  }

  data.buffer.push("\n\n<ul class=\"breadcrumb\">\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "application", options) : helperMissing.call(depth0, "link-to", "application", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" <span class=\"divider\"></span></li>\n  <li class=\"active\">Tez App [ ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "appDetail.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ]</li>\n</ul>\n\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.unless.call(depth0, "loading", {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["tez-app/index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n        <tr>\n          <td>Application Name</td>\n          <td>\n            ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "appDetail.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </td>\n        </tr>\n        <tr>\n          <td>Queue</td>\n          <td>\n            ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "appDetail.queue", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </td>\n        </tr>\n        <tr>\n          <td>Application Type</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "appDetail.type", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n        </tr>\n        ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n    <div style=\"padding-top: 20px;\">\n      <table class='detail-list'>\n        <thead>\n           <tr>\n              <th colspan=2>Tez Application Details</th>\n           </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td>Application State</td>\n            <td>\n              ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "appDetail.status", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            </td>\n          </tr>\n          <tr>\n            <td>Final Application Status</td>\n            <td>\n              ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "appDetail.status", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </td>\n          </tr>\n          <tr>\n            <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.time.start", options) : helperMissing.call(depth0, "t", "common.time.start", options))));
  data.buffer.push("</td>\n            <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatUnixTimestamp || depth0.formatUnixTimestamp),stack1 ? stack1.call(depth0, "appDetail.startedTime", options) : helperMissing.call(depth0, "formatUnixTimestamp", "appDetail.startedTime", options))));
  data.buffer.push("</td>\n          </tr>\n          <tr>\n            <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.time.end", options) : helperMissing.call(depth0, "t", "common.time.end", options))));
  data.buffer.push("</td>\n            <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatUnixTimestamp || depth0.formatUnixTimestamp),stack1 ? stack1.call(depth0, "appDetail.finishedTime", options) : helperMissing.call(depth0, "formatUnixTimestamp", "appDetail.finishedTime", options))));
  data.buffer.push("</td>\n          </tr>\n          <tr>\n            <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.time.duration", options) : helperMissing.call(depth0, "t", "common.time.duration", options))));
  data.buffer.push("</td>\n            <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatDuration || depth0.formatDuration),stack1 ? stack1.call(depth0, "appDetail.startedTime", "appDetail.finishedTime", options) : helperMissing.call(depth0, "formatDuration", "appDetail.startedTime", "appDetail.finishedTime", options))));
  data.buffer.push("</td>\n          </tr>\n        </tbody>\n      </table>\n    </div>\n  ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n              <i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":task-status iconStatus")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></i> ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "appDetail.finalStatus", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n              ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    <div style=\"padding-top: 20px;\">\n      <table class='detail-list'>\n        <thead>\n           <tr>\n              <th colspan=2>Tez Version Details</th>\n           </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td>Tez Version</td>\n            <td>\n              ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "tezVersion", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            </td>\n          </tr>\n          <tr>\n            <td>Build Revision</td>\n            <td>\n              ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "tezRevision", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            </td>\n          </tr>\n          <tr>\n            <td>Build Time</td>\n            <td>\n              ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "tezBuildTime", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            </td>\n          </tr>\n        </tbody>\n      </table>\n    </div>\n  ");
  return buffer;
  }

function program8(depth0,data) {
  
  
  data.buffer.push("\n    <div class=\"alert alert-info margin-medium-vertical\">\n      <strong>Info!</strong> Could not fetch application info from RM (yarn system metrics publishing might be disabled), some details might be missing\n    </div>\n  ");
  }

function program10(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n  <div class=\"margin-small-vertical\">\n    ");
  hashContexts = {'heading': depth0,'collapsible': depth0,'dismiss': depth0,'type': depth0};
  hashTypes = {'heading': "STRING",'collapsible': "BOOLEAN",'dismiss': "BOOLEAN",'type': "STRING"};
  options = {hash:{
    'heading': ("Diagnostics"),
    'collapsible': (false),
    'dismiss': (false),
    'type': ("danger")
  },inverse:self.noop,fn:self.program(11, program11, data),contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['bs-panel'] || depth0['bs-panel']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-panel", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  </div>\n");
  return buffer;
  }
function program11(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatDiagnostics || depth0.formatDiagnostics),stack1 ? stack1.call(depth0, "diagnostics", options) : helperMissing.call(depth0, "formatDiagnostics", "diagnostics", options))));
  data.buffer.push("\n    ");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"margin-small-vertical\">\n  ");
  hashContexts = {'isRefreshable': depth0,'time': depth0,'refresh': depth0};
  hashTypes = {'isRefreshable': "ID",'time': "ID",'refresh': "STRING"};
  options = {hash:{
    'isRefreshable': ("isRefreshable"),
    'time': ("timeStamp"),
    'refresh': ("refresh")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['load-time-component'] || depth0['load-time-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "load-time-component", options))));
  data.buffer.push("\n</div>\n<div class='type-table fill-full margin-small-horizontal'>\n  <div style=\"padding-top: 20px;\">\n    <table class='detail-list'>\n       <thead>\n         <tr>\n            <th colspan=2>Tez Application Description</th>\n         </tr>\n      </thead>\n      <tbody>\n        <tr>\n          <td>Application Tracking URL</td>\n          <td><a target=\"_blank\" ");
  hashContexts = {'href': depth0};
  hashTypes = {'href': "ID"};
  options = {hash:{
    'href': ("rmTrackingURL")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "appId", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a></td>\n        </tr>\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "appDetail", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        <tr>\n          <td>User</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "appUser", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "appDetail", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "tezVersion", {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.unless.call(depth0, "appDetail", {hash:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n\n</div>\n\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "diagnostics", {hash:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["vertex"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<i class=\"fa fa-home\"> All DAGs</i>");
  }

function program3(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("DAG [ ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "dag.name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("  ] ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n  <div class='type-table margin-small-horizontal fill-full'>\n    <div class='pill-container align-right'>\n      ");
  hashContexts = {'contentBinding': depth0,'selectedBinding': depth0,'size': depth0};
  hashTypes = {'contentBinding': "STRING",'selectedBinding': "STRING",'size': "STRING"};
  options = {hash:{
    'contentBinding': ("childDisplayViews"),
    'selectedBinding': ("childDisplayViewSelected"),
    'size': ("lg")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-pills'] || depth0['bs-pills']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-pills", options))));
  data.buffer.push("\n    </div>\n  </div>\n  <div class='margin-small-vertical'>\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </div>\n");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "partials/loading-spinner", options) : helperMissing.call(depth0, "partial", "partials/loading-spinner", options))));
  data.buffer.push("\n");
  return buffer;
  }

  data.buffer.push("\n\n<ul class=\"breadcrumb\">\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "application", options) : helperMissing.call(depth0, "link-to", "application", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" <span class=\"divider\"></span></li>\n  <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "dag", "dagID", options) : helperMissing.call(depth0, "link-to", "dag", "dagID", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push(" <span class=\"divider\"></span></li>\n  <li class=\"active\">Vertex [ ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" ]</li>\n</ul>\n\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.unless.call(depth0, "loading", {hash:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["vertex/additionals"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n  <h3>Sources</h3>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "inputsAvailable", {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n  <h3>Sinks</h3>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "outputsAvailable", {hash:{},inverse:self.program(4, program4, data),fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n    ");
  hashContexts = {'columns': depth0,'rows': depth0,'enableSort': depth0};
  hashTypes = {'columns': "ID",'rows': "ID",'enableSort': "BOOLEAN"};
  options = {hash:{
    'columns': ("inputColumns"),
    'rows': ("inputContent"),
    'enableSort': (true)
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['basic-table-component'] || depth0['basic-table-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "basic-table-component", options))));
  data.buffer.push("\n  ");
  return buffer;
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n    <h4>Not available!</h4>\n  ");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n    ");
  hashContexts = {'columns': depth0,'rows': depth0,'enableSort': depth0};
  hashTypes = {'columns': "ID",'rows': "ID",'enableSort': "BOOLEAN"};
  options = {hash:{
    'columns': ("outputColumns"),
    'rows': ("outputContent"),
    'enableSort': (true)
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['basic-table-component'] || depth0['basic-table-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "basic-table-component", options))));
  data.buffer.push("\n  ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "partials/loading-spinner", options) : helperMissing.call(depth0, "partial", "partials/loading-spinner", options))));
  data.buffer.push("\n");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"margin-small-vertical\">\n  ");
  hashContexts = {'isRefreshable': depth0,'time': depth0,'refresh': depth0};
  hashTypes = {'isRefreshable': "ID",'time': "ID",'refresh': "STRING"};
  options = {hash:{
    'isRefreshable': ("isRefreshable"),
    'time': ("timeStamp"),
    'refresh': ("refresh")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['load-time-component'] || depth0['load-time-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "load-time-component", options))));
  data.buffer.push("\n</div>\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.unless.call(depth0, "loading", {hash:{},inverse:self.program(8, program8, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["vertex/index"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push(" ");
  hashContexts = {'content': depth0};
  hashTypes = {'content': "ID"};
  options = {hash:{
    'content': ("progressStr")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-badge'] || depth0['bs-badge']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-badge", options))));
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n              [ <a href='");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "failedTasksLink", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("'>Failed Tasks</a> ]\n            ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n              [ <a href='");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "failedTaskAttemptsLink", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("'>Failed TaskAttempts</a> ]\n            ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n        <tr>\n          <td>Progress</td>\n          <td>");
  hashContexts = {'progressDecimal': depth0};
  hashTypes = {'progressDecimal': "ID"};
  options = {hash:{
    'progressDecimal': ("progress")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bs-progress-animated'] || depth0['bs-progress-animated']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-progress-animated", options))));
  data.buffer.push("</td>\n        </tr>\n        ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n          <tr>\n            <td>First Task Start Time</td>\n            <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatUnixTimestamp || depth0.formatUnixTimestamp),stack1 ? stack1.call(depth0, "firstTaskStartTime", options) : helperMissing.call(depth0, "formatUnixTimestamp", "firstTaskStartTime", options))));
  data.buffer.push("\n              [\n              ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "taskid", "in", "firstTasksToStart", {hash:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n              ]\n            </td>\n          </tr>\n        ");
  return buffer;
  }
function program10(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n                ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "_view.contentIndex", {hash:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "task", "taskid", options) : helperMissing.call(depth0, "link-to", "task", "taskid", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n              ");
  return buffer;
  }
function program11(depth0,data) {
  
  
  data.buffer.push(" | ");
  }

function program13(depth0,data) {
  
  var hashTypes, hashContexts;
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "taskid", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  }

function program15(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n          <tr>\n            <td>Last Task Finish Time</td>\n            <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatUnixTimestamp || depth0.formatUnixTimestamp),stack1 ? stack1.call(depth0, "lastTaskFinishTime", options) : helperMissing.call(depth0, "formatUnixTimestamp", "lastTaskFinishTime", options))));
  data.buffer.push("\n              [\n              ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "taskid", "in", "lastTasksToFinish", {hash:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n              ]\n            </td>\n          </tr>\n        ");
  return buffer;
  }

function program17(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    <div style=\"padding-top: 20px;\">\n      <table class='detail-list'>\n        <thead>\n          <tr>\n            <th colspan=2>Tasks of this Vertex</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td>Total Tasks</td>\n            <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "numTasks", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n          </tr>\n          <tr>\n            <td>Successful Tasks</td>\n            <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "sucessfulTasks", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n          </tr>\n          <tr>\n            <td>Failed Tasks</td>\n            <td>\n              ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "failedTasks", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n              ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "hasFailedTasks", {hash:{},inverse:self.noop,fn:self.program(18, program18, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </td>\n          </tr>\n          <tr>\n            <td>Killed Tasks</td>\n            <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "killedTasks", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n          </tr>\n\n          ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "showAvgTaskDuration", {hash:{},inverse:self.noop,fn:self.program(20, program20, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "showMinTaskDuration", {hash:{},inverse:self.noop,fn:self.program(22, program22, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "showMaxTaskDuration", {hash:{},inverse:self.noop,fn:self.program(25, program25, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </tbody>\n      </table>\n    </div>\n  ");
  return buffer;
  }
function program18(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n                <a href='");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "failedTasksLink", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("'>FailedTasks</a>\n              ");
  return buffer;
  }

function program20(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n            <tr>\n              <td>Average Duration</td>\n              <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatTimeMillis || depth0.formatTimeMillis),stack1 ? stack1.call(depth0, "avgTaskDuration", options) : helperMissing.call(depth0, "formatTimeMillis", "avgTaskDuration", options))));
  data.buffer.push("</td>\n            </tr>\n          ");
  return buffer;
  }

function program22(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n            <tr>\n              <td>Minimum Duration</td>\n              <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatTimeMillis || depth0.formatTimeMillis),stack1 ? stack1.call(depth0, "minTaskDuration", options) : helperMissing.call(depth0, "formatTimeMillis", "minTaskDuration", options))));
  data.buffer.push("\n                [\n                ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "taskid", "in", "shortestDurationTasks", {hash:{},inverse:self.noop,fn:self.program(23, program23, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n                ]\n              </td>\n            </tr>\n          ");
  return buffer;
  }
function program23(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n                  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "_view.contentIndex", {hash:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                  ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "task", "taskid", options) : helperMissing.call(depth0, "link-to", "task", "taskid", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n                ");
  return buffer;
  }

function program25(depth0,data) {
  
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options;
  data.buffer.push("\n            <tr>\n              <td>Maximum Duration</td>\n              <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatTimeMillis || depth0.formatTimeMillis),stack1 ? stack1.call(depth0, "maxTaskDuration", options) : helperMissing.call(depth0, "formatTimeMillis", "maxTaskDuration", options))));
  data.buffer.push("\n                [\n                ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "taskid", "in", "longestDurationTasks", {hash:{},inverse:self.noop,fn:self.program(23, program23, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n                ]\n              </td>\n            </tr>\n          ");
  return buffer;
  }

function program27(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n  <div class=\"margin-small-vertical\">\n    ");
  hashContexts = {'heading': depth0,'collapsible': depth0,'dismiss': depth0,'type': depth0};
  hashTypes = {'heading': "STRING",'collapsible': "BOOLEAN",'dismiss': "BOOLEAN",'type': "STRING"};
  options = {hash:{
    'heading': ("Diagnostics"),
    'collapsible': (false),
    'dismiss': (false),
    'type': ("danger")
  },inverse:self.noop,fn:self.program(28, program28, data),contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['bs-panel'] || depth0['bs-panel']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bs-panel", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  </div>\n");
  return buffer;
  }
function program28(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n      ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatDiagnostics || depth0.formatDiagnostics),stack1 ? stack1.call(depth0, "diagnostics", options) : helperMissing.call(depth0, "formatDiagnostics", "diagnostics", options))));
  data.buffer.push("\n    ");
  return buffer;
  }

  data.buffer.push("\n\n<div class=\"margin-small-vertical\">\n  ");
  hashContexts = {'isRefreshable': depth0,'time': depth0,'refresh': depth0};
  hashTypes = {'isRefreshable': "ID",'time': "ID",'refresh': "STRING"};
  options = {hash:{
    'isRefreshable': ("isRefreshable"),
    'time': ("timeStamp"),
    'refresh': ("refresh")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['load-time-component'] || depth0['load-time-component']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "load-time-component", options))));
  data.buffer.push("\n</div>\n<div class='type-table margin-small-horizontal fill-full'>\n\n  <div class=\"horizontal-half align-children-left\">\n    <table class='detail-list'>\n       <thead>\n         <tr>\n           <th colspan=2>Vertex description</th>\n          </tr>\n      </thead>\n      <tbody>\n        <tr>\n          <td>Vertex ID</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n        </tr>\n        <tr>\n          <td>Vertex Name</td>\n          <td>\n            ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "name", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </td>\n        </tr>\n        <tr>\n          <td>Processor Class</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "processorClassName", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n\n  <div style=\"padding-top: 20px;\">\n    <table class='detail-list'>\n       <thead>\n         <tr>\n           <th colspan=2>Vertex details</th>\n          </tr>\n      </thead>\n      <tbody>\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.status", options) : helperMissing.call(depth0, "t", "common.status", options))));
  data.buffer.push("</td>\n          <td>\n            <i ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":task-status iconStatus")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></i>\n            ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "status", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "progressStr", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "hasFailedTasks", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n            ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "hasFailedTaskAttempts", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n          </td>\n        </tr>\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "progress", {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.time.start", options) : helperMissing.call(depth0, "t", "common.time.start", options))));
  data.buffer.push("</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatUnixTimestamp || depth0.formatUnixTimestamp),stack1 ? stack1.call(depth0, "startTime", options) : helperMissing.call(depth0, "formatUnixTimestamp", "startTime", options))));
  data.buffer.push("</td>\n        </tr>\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.time.end", options) : helperMissing.call(depth0, "t", "common.time.end", options))));
  data.buffer.push("</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatUnixTimestamp || depth0.formatUnixTimestamp),stack1 ? stack1.call(depth0, "endTime", options) : helperMissing.call(depth0, "formatUnixTimestamp", "endTime", options))));
  data.buffer.push("</td>\n        </tr>\n        <tr>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['t'] || depth0['t']),stack1 ? stack1.call(depth0, "common.time.duration", options) : helperMissing.call(depth0, "t", "common.time.duration", options))));
  data.buffer.push("</td>\n          <td>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0,depth0],types:["ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.formatDuration || depth0.formatDuration),stack1 ? stack1.call(depth0, "startTime", "endTime", options) : helperMissing.call(depth0, "formatDuration", "startTime", "endTime", options))));
  data.buffer.push("</td>\n        </tr>\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "hasFirstTaskStarted", {hash:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "hasLastTaskFinished", {hash:{},inverse:self.noop,fn:self.program(15, program15, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n      </tbody>\n    </table>\n  </div>\n\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "hasStats", {hash:{},inverse:self.noop,fn:self.program(17, program17, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n\n</div>\n\n");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "diagnostics", {hash:{},inverse:self.noop,fn:self.program(27, program27, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["views/extra-table-buttons"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashContexts, hashTypes, escapeExpression=this.escapeExpression;


  data.buffer.push("\n\n<i class='column-selector-button' ");
  hashContexts = {'target': depth0};
  hashTypes = {'target': "ID"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectColumns", {hash:{
    'target': ("targetObject")
  },contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("></i>\n");
  return buffer;
  
});

Ember.TEMPLATES["views/multi-select"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts;
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "option", "in", "view.visibleOptions", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1, hashTypes, hashContexts, options;
  data.buffer.push("\n      <div class=\"select-option ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "option.css", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\"}}>\n        ");
  hashContexts = {'type': depth0,'classNames': depth0,'checked': depth0};
  hashTypes = {'type': "STRING",'classNames': "STRING",'checked': "ID"};
  options = {hash:{
    'type': ("checkbox"),
    'classNames': ("inline-display checkbox"),
    'checked': ("option.selected")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || depth0.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "option.displayText", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </div>\n    ");
  return buffer;
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n    <h4>&nbsp;No options available...</h4>\n  ");
  }

  data.buffer.push("\n\n<div class=\"message\">\n  ");
  hashContexts = {'unescaped': depth0};
  hashTypes = {'unescaped': "STRING"};
  stack1 = helpers._triageMustache.call(depth0, "view.message", {hash:{
    'unescaped': ("true")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n<div class=\"selection-list\">\n  <div class=\"search-option highlight\">\n    <div ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': (":form-group view._validRegEx::has-error")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n      ");
  hashContexts = {'class': depth0,'placeholder': depth0,'value': depth0};
  hashTypes = {'class': "STRING",'placeholder': "STRING",'value': "ID"};
  options = {hash:{
    'class': ("form-control"),
    'placeholder': ("Filter options"),
    'value': ("view.searchRegex")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || depth0.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n    </div>\n    <div class=\"select-all\">\n      ");
  hashContexts = {'classNames': depth0,'checked': depth0,'action': depth0,'target': depth0};
  hashTypes = {'classNames': "STRING",'checked': "ID",'action': "STRING",'target': "ID"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.Checkbox", {hash:{
    'classNames': ("inline-display checkbox"),
    'checked': ("view.selectAll"),
    'action': ("selectAll"),
    'target': ("view")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      Select All\n    </div>\n  </div>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers['if'].call(depth0, "view.visibleOptions.length", {hash:{},inverse:self.program(4, program4, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n</div>");
  return buffer;
  
});