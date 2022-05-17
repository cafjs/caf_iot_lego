"use strict";
var caf = require('caf_core');
var caf_comp = caf.caf_components;
var myUtils = caf_comp.myUtils;

exports.methods = {
    '__ca_init__' : function(cb) {
        this.state.out  = {};
        this.state.meta = {};
        this.state.in = {};
        this.state.trace__iot_sync__ = 'traceSync';
        cb(null);
    },
    'getState' : function(cb) {
        cb(null, this.state);
    },
    'traceSync' : function(cb) {
        var $$ = this.$.sharing.$;
        this.state.in = $$.toCloud.get('in');
        cb(null);
    }
};
