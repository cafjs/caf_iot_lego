const hello = require('./hello/main.js');
const helloIoT = require('./hello/iot/main.js');
const caf_iot = require('caf_iot');
const caf_components = caf_iot.caf_components;
const cli = caf_iot.caf_cli;
const myUtils = caf_components.myUtils;
const async = caf_components.async;
const app = hello;
const appIoT = helloIoT;
const crypto = require('crypto');
const setTimeoutPromise = require('util').promisify(setTimeout);

/*
                            WARNING!!!

    This is not a proper test unit but just a helper program
    to manually test Lego BLE functionality.

    It requires a Spike essential lego hub with a 3x3 LED color matrix attached.

    Most of the checks are based on looking at console logs or LEDs...
*/


process.on('uncaughtException', function (err) {
    console.log("Uncaught Exception: " + err);
    console.log(myUtils.errToPrettyStr(err));
    process.exit(1);
});

var CA_NAME = 'antonio-' + crypto.randomBytes(16).toString('hex');
process.env['MY_ID'] = CA_NAME;



module.exports = {
    setUp: function (cb) {
        var self = this;
        app.load(null, {name: 'top'}, 'framework.json', null,
                 function(err, $) {
                     if (err) {
                         console.log('setUP Error' + err);
                         console.log('setUP Error $' + $);
                         // ignore errors here, check in method
                         cb(null);
                     } else {
                         self.$ = $;
                         cb(err, $);
                     }
                 });
    },
    tearDown: function (cb) {
        var self = this;
        if (!this.$) {
            cb(null);
        } else {
            this.$.top.__ca_graceful_shutdown__(null, cb);
        }
    },

    async hello(test) {
        test.expect(1);
        try {
            let s = new cli.Session('http://root-hellolego.localtest.me:3000',
                                    CA_NAME, {from: CA_NAME,
                                              log: function(x) {
                                                  console.log(x);
                                              }});
            let p = await new Promise((resolve, reject) => {
                s.onopen = async function() {
                    try {
                        resolve(await s.getState().getPromise());
                     } catch (err) {
                        test.ok(false, 'Got exception ' + err);
                        reject(err);
                    }
                };
                s.onerror = function(err) {
                    test.ifError(err);

                    console.log(err);
                    reject(err);
                };
            });

            var self = this;
            p = await new Promise((resolve, reject) => {
                appIoT.load(null, {name: 'topIoT'}, null, null,
                            function(err, $) {
                                if (err) {
                                    console.log('setUP Error' + err);
                                    console.log('setUP Error $' + $);
                                    // ignore errors here, check in method
                                    reject(err);
                                } else {
                                    self.$IoT = $;
                                    resolve($);
                                }
                            });
            });

            await this.$IoT.topIoT.$.iot.$.handler.connect(
                'TECHNIC_3X3_COLOR_LIGHT_MATRIX'
            );

            console.log('GOT connected');
            await setTimeoutPromise(2000);

            await this.$IoT.topIoT.$.iot.$.handler.setMatrix(5);

            console.log('after setMatrix');
            await setTimeoutPromise(2000);

            await this.$IoT.topIoT.$.iot.$.handler.setMatrix(3);
            await setTimeoutPromise(2000);

            await this.$IoT.topIoT.$.iot.$.handler.setTilt();
            await setTimeoutPromise(10000);

            console.log('removing tilt');
            await this.$IoT.topIoT.$.iot.$.handler.removeTilt();
            await setTimeoutPromise(5000);

            await this.$IoT.topIoT.$.iot.$.handler.disconnect();

            var all = await this.$IoT.topIoT.$.iot.$.handler.debugGetAll();
            console.log(JSON.stringify(all));

            p = await new Promise((resolve, reject) => {
                this.$IoT.topIoT.__ca_graceful_shutdown__(
                    null, function(err, data) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    }
                );
            });

            p = await new Promise((resolve, reject) => {
                s.onclose = function(err) {
                    test.ifError(err);
                    resolve(null);
                };
                s.close();
            });

            test.done();
        } catch (err) {
            test.ifError(err);
            test.done();
        }
    }
};
