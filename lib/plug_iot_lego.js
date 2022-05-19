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
 *
 *
 * @module caf_iot_lego/plug_iot_lego
 * @augments external:caf_iot/gen_plug_iot
 *
 */
const caf_iot = require('caf_iot');
const genPlugIoT = caf_iot.gen_plug_iot;
const PoweredUP = require('node-poweredup');
const {DeviceTypes} = require('./constants');


/**
 * Factory method for a plug to  BLE LEGO services.
 *
 */
exports.newInstance = async function($, spec) {
    try {
        const poweredUP = new PoweredUP.PoweredUP();

        let legoHub = null;
        let legoDevices = {};

        const that = genPlugIoT.create($, spec);

        $._.$.log && $._.$.log.debug('New BLE LEGO plug');

        that.connect = function(deviceTypes) {
            poweredUP.scan();
            return new Promise((resolve, reject) => {
                poweredUP.on('discover', async (hub) => {
                    try {
                        await hub.connect();
                        for (let deviceType of deviceTypes) {
                            const deviceNum = DeviceTypes[deviceType];
                            const devs = hub.getDevicesByType(deviceNum);
                            if (devs.length > 0) {
                                // TODO: support more than one device per type
                                legoDevices[deviceType] = devs[0];
                            } else {
                                reject(
                                    new Error(`Missing device ${deviceType}`)
                                );
                            }
                        }
                        legoHub = hub;
                        poweredUP.stop();
                        resolve(hub.name);
                    } catch (err) {
                        legoHub = null;
                        legoDevices = {};
                        poweredUP.stop();
                        reject(err);
                    }
                });
            });
        };

        that.isConnected = () => !!legoHub;

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
                if (!legoHub) {
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
                dev.removeAllListeners(topic);
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
