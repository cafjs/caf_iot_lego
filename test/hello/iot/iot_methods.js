
"use strict";

exports.methods = {
    __iot_setup__ : function(cb) {
        this.state.values = {};
        this.state.notif = {};
        cb(null);
    },

    __iot_loop__ : function(cb) {
        var now = (new Date()).getTime();
        this.$.log && this.$.log.debug(now + ' loop:');
        this.toCloud.set('in', {});
        var id = (this.scratch.lastDevice && this.scratch.lastDevice.id) || null;
        this.toCloud.set('lastDeviceId', {id: id});
        cb(null);
    },


    findServices: function(serviceId, cb) {
        this.state.lastServiceId = serviceId;
        this.$.lego.findServices(serviceId, '__iot_foundService__', null);
        cb(null);
    },

    findCharacteristics: function(chId, cb) {
        this.state.lastChId = chId;
        var self = this;
        this.$.lego.findCharacteristics(this.state.lastServiceId,
                                        this.scratch.lastDevice,
                                        function(err, result) {
                                            if (err) {
                                                cb(err);
                                            } else {
                                                self.__iot_foundCharac__(result,
                                                                         cb);
                                            }
                                        });
    },

    read: function(cb) {
        if (this.scratch.lastCh) {
            console.log('Reading 1');
            this.$.lego.read(this.scratch.lastCh, '__iot_read__');
        }
        cb(null);
    },
    write: function(value, cb) {
        var buf = new Buffer(value);
        if (this.scratch.lastCh) {
            console.log('Writing 1');
            this.$.lego.write(this.scratch.lastCh, buf);
        }
        cb(null);
    },

    subscribe: function(cb) {
        if (this.scratch.lastCh) {
            this.$.lego.subscribe(this.scratch.lastCh, '__iot_sub__');
        }
        cb(null);
    },

    unsubscribe: function(cb) {
        if (this.scratch.lastCh) {
            this.$.lego.unsubscribe(this.scratch.lastCh);
        }
        cb(null);
    },



    disconnect: function(cb) {
        if (this.scratch.lastDevice) {
            this.$.lego.disconnect(this.scratch.lastDevice);
        }
        cb(null);
    },

    __iot_read__: function(charact, value, cb) {
        console.log('READ Value for ' + charact.uuid + ' is ' + value);
        this.state.values[charact.uuid] = value;
        cb(null);
    },
    __iot_foundCharac__: function(result, cb) {
        var self = this;
        var chArray = result.characteristics;
        chArray = chArray || [];
        console.log('*** FOUND CHARACTERISTIC ' + chArray);
        chArray.some(function(x) {
            if (x.uuid === self.state.lastChId) {
                self.scratch.lastCh = x;
                return true;
            } else {
                console.log(x.uuid);
                return false;
            }
        });

        cb(null);
    },
    __iot_foundService__: function(serviceId, device, cb) {
        console.log('service:' + serviceId + ' device:' + device);
        this.scratch.lastDevice = device;
        cb(null);
    },

    __iot_sub__: function(charact, value, cb) {
        value = parseInt(value.toString('hex'), 16);
        console.log('Notify: got ' + value);
        this.state.notif[charact.uuid] = value;
        cb(null);

    },

    //backdoor for testing
    debugGetAll : function() {
        return { state: this.state, toCloud: this.toCloud.dump(),
                 fromCloud: this.fromCloud.dump() };
    }
};
