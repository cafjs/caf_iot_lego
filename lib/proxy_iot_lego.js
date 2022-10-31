/*!
 Copyright  2022 Caf.js Labs and contributors

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
 * A proxy to access LEGO devices.
 *
 *
 * @module caf_iot_lego/proxy_iot_lego
 * @augments external:caf_components/gen_proxy
 *
 */
const assert = require('assert');
const caf_iot = require('caf_iot');
const caf_comp = caf_iot.caf_components;
const genProxy = caf_comp.gen_proxy;
const {DeviceTypes} = require('./constants');


/**
 * Factory method to access GATT services.
 *
 */
exports.newInstance = async function($, spec) {
    try {
        const that = genProxy.create($, spec);

        /**
         * Finds a LEGO hub with the requested devices and connects to it.
         *
         * If there are several devices of the same type attached to the hub,
         * it just selects one of them.
         *
         * There is no timeout, and the returned promise may never resolve or
         * reject.
         *
         * @param {string|Array.<string>} deviceTypes A set of requirements for
         * the hub, i.e., the type of devices that should be connected to it.
         * See ./constants.js` for the device type names supported (similar to
         * the `node-poweredup` package).
         *
         * @return {Promise<string>} A promise to wait for the connection. It
         * resolves to the name of the hub. It rejects if the discovered hub
         * does not have the required devices attached. If there is a timeout
         * configured with property `connectTimeoutMsec > 0`, the promise will
         * reject with an error marked with `isTimeout` set to `true`
         * when exceeded. Otherwise, this promise may never resolve or reject.
         *
         * @memberof!  module:caf_iot_lego/proxy_iot_lego#
         * @alias connect
         */
        that.connect = function(deviceTypes) {
            assert((typeof deviceTypes === 'string') ||
                   Array.isArray(deviceTypes));
            deviceTypes = typeof deviceTypes === 'string' ?
                [deviceTypes] :
                deviceTypes;

            for (let deviceType of deviceTypes) {
                if (typeof DeviceTypes[deviceType] !== 'number') {
                    throw new Error('Unsupported device type, see ' +
                                    '`caf_iot_lego/lib/constants.js`');
                }
            }
            return $._.connect(deviceTypes);
        };

        /**
         * Checks that is connected to a Lego hub
         *
         * @return {boolean} True if connected, false otherwise
         *
         * @memberof!  module:caf_iot_lego/proxy_iot_lego#
         * @alias isConnected
         */
        that.isConnected = function() {
            return $._.isConnected();
        };

        /**
         * Disconnects from a Lego hub.
         *
         * @return {Promise<Object>} A promise to wait for disconnection.
         *
         * @memberof!  module:caf_iot_lego/proxy_iot_lego#
         * @alias disconnect
         */
        that.disconnect = function() {
            return $._.disconnect();
        };

        /**
         * Calls a method of a device connected to the hub.
         *
         * @param {string} deviceType A target device, identified by its
         * type. See `caf_iot_lego/lib/constants.js`.
         * @param {string} methodName A method name as defined by
         *`node-poweredup`
         * @param {Array<Object>} The arguments to the call.
         * @return {Promise<Object>} A promise to wait for method results.
         *
         * @throws Error if device does not exist.
         * @memberof!  module:caf_iot_lego/proxy_iot_lego#
         * @alias callMethod
         */
        that.callMethod = function(deviceType, methodName, args) {
            assert(DeviceTypes[deviceType], 'Invalid device type');
            assert(typeof methodName === 'string');
            assert(Array.isArray(args));

            return $._.callMethod(deviceType, methodName, args);
        };

        /**
         * Registers a handler to receive device notifications.
         *
         * The handler method signature is
         * `async function(deviceType, topic, argsObj)`
         * where `deviceType` and `topic` are strings, and `argsObj` contains
         * the notification object, similar to the `node-poweredup` package.
         *
         * @param {string|null} deviceType A target device, identified by its
         * type or `null` to target the hub itself.
         * See `caf_iot_lego/lib/constants.js`.
         * @param {string} topic An event topic to subscribe.
         * @param {string|null} handlerMethodName A handler method name to
         * receive notifications or `null` to unregister previous handlers.
         *
         * @memberof!  module:caf_iot_lego/proxy_iot_lego#
         * @alias registerHandler
         */
        that.registerHandler = function(deviceType, topic, handlerMethodName) {
            deviceType &&
                assert(DeviceTypes[deviceType], 'Invalid device type');
            assert(typeof topic === 'string');
            handlerMethodName && assert(typeof handlerMethodName === 'string');

            $._.registerHandler(deviceType, topic, handlerMethodName);
        };

        Object.freeze(that);
        return [null, that];
    } catch (err) {
        return [err];
    }
};
