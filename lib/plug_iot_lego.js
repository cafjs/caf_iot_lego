/*!
 Copyright 2022 Caf.js Labs and contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

'use strict';
/**
 *  Provides access to BLE LEGO services.
 *
 *  * Properties:
 *   {manuallyAttached: Array.<Array<string>>}
 *
 *   where `manuallyAttached` is a an array of tuples `[deviceType, portName]`
 *  describing devices plugged to the hub at known ports. The
 *  discovery of plugged devices sometimes require re-attaching them, and it
 *  can be unreliable. Setting this property disables discovery for them.
 *
 * @module caf_iot_lego/plug_iot_lego
 * @augments external:caf_iot/gen_plug_iot
 *
 */
const assert = require('assert');
const caf_iot = require('caf_iot');
const genPlugIoT = caf_iot.gen_plug_iot;
const PoweredUP = require('caf_node-poweredup');
const {DeviceTypes} = require('./constants');


/**
 * Factory method for a plug to  BLE LEGO services.
 *
 * Properties:
 *
 *  {manuallyAttached: Array<[string, string]>, connectTimeoutMsec: number}
 *
 * `manuallyAttached` list of tuples (device type, port name) that are not
 * discovered to avoid replugging them at boot time.
 * `connectTimeoutMsec` max time in milliseconds to establish a Bluetooth
 * connection with the hub. This property is optional.
 *
 */
exports.newInstance = async function($, spec) {
    try {
        const poweredUP = new PoweredUP.PoweredUP();

        let legoHub = null;
        let legoDevices = {};

        const that = genPlugIoT.create($, spec);

        $._.$.log && $._.$.log.debug('New BLE LEGO plug');

        assert(Array.isArray(spec.env.manuallyAttached),
               "'spec.env.manuallyAttached' is not an array of tuples");

        const connectTimeoutMsec =
            typeof spec.env.connectTimeoutMsec === 'number' ?
                spec.env.connectTimeoutMsec :
                0;

        that.connect = function(deviceTypes) {
            poweredUP.scan();
            const res = new Promise((resolve, reject) => {
                poweredUP.on('discover', async (hub) => {
                    try {
                        await hub.connect();

                        // disable device discovery to avoid reattaching...
                        spec.env.manuallyAttached.forEach(([type, port]) => {
                            const devNum = DeviceTypes[type];
                            // Internal, it may change...
                            const portNum = hub._portMap[port];
                            if ((typeof devNum === 'number') &&
                                (typeof portNum === 'number')) {
                                hub.manuallyAttachDevice(devNum, portNum);
                            } else {
                                $._.$.log && $._.$.log.warn(
                                    'Ignoring manually attached ' +
                                        `${type}, ${port}]`
                                );
                            }
                        });

                        for (let deviceType of deviceTypes) {
                            const deviceNum = DeviceTypes[deviceType];
                            const dev =
                                  await hub.waitForDeviceByType(deviceNum);
                            if (dev) {
                                legoDevices[deviceType] = dev;
                            } else {
                                reject(
                                    new Error(`Missing device ${deviceType}`)
                                );
                            }
                        }
                        legoHub = hub;
                        // web based poweredup does not have stop()...
                        poweredUP.stop && poweredUP.stop();
                        resolve(hub.name);
                    } catch (err) {
                        legoHub = null;
                        legoDevices = {};
                        poweredUP.stop && poweredUP.stop();
                        reject(err);
                    }
                });
            });

            if (connectTimeoutMsec > 0) {
                const timeoutPromise = new Promise((_resolve, reject) => {
                    setTimeout(() => {
                        const err = new Error(
                            'Connection time exceeded, RELOAD PAGE to retry'
                        );
                        err['isTimeout'] = true;
                        reject(err);
                    }, connectTimeoutMsec);
                });

                /* Web Bluetooth needs a full refresh to recover after timeout*/
                return Promise.race([res, timeoutPromise]);
            } else {
                return res;
            }
        };

        that.getHubProps = function() {
            if (!legoHub) {
                return null;
            } else {
                const props = {
                    firmwareVersion: legoHub.firmwareVersion,
                    hardwareVersion: legoHub.hardwareVersion,
                    uuid: legoHub.uuid,
                    name: legoHub.name,
                    type: legoHub.type,
                    batteryLevel: legoHub.batteryLevel
                };
                return props;
            }
        };

        that.isConnected = () => legoHub && legoHub.connected;

        that.disconnect = async () => {//use async to always return a promise
            if (legoHub) {
                const lastHub = legoHub;
                legoHub = null;
                legoDevices = {};
                return lastHub.disconnect();
            } else {
                return true;
            }
        };

        that.callMethod = function(deviceType, methodName, args) {
            const dev = legoDevices[deviceType];
            if (!dev) {
                throw new Error(`No device ${deviceType}`);
            }
            return dev[methodName](...args);
        };


        that.registerHandler = function(deviceType, topic, handlerMethodName) {
            let dev;
            if (deviceType === null) {
                if (!legoHub && (handlerMethodName !== null)) {
                    throw new Error('No hub');
                }
                dev = legoHub;
            } else {
                dev = legoDevices[deviceType];
                if (!dev) {
                    throw new Error(`No device ${deviceType}`);
                }
            }

            if (handlerMethodName === null) {
                //ignore if device missing to make disconnect() idempotent
                dev && dev.removeAllListeners(topic);
            } else {
                dev.on(topic, (device, obj) => {
                    const args = [device.typeName, topic, obj];
                    $._.$.queue.process(handlerMethodName, args,
                                        {noSync: true}); // no cloud roundtrip
                });
            }
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};
