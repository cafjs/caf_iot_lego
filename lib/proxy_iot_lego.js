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
         * @param {string|Array.<string>} devices A set of requirements for the
         * hub, i.e., the type of devices that should be connected to it. See
         *`./constants.js` for the device type names supported (similar to the
         *  `node-poweredup` package).
         * @param {string=} handlerMethodName An optional method called when a
         * hub is found. The method signature is `async function(hubName)`
         * where `hubName` is the name of the hub, i.e., a string.
         *
         * @memberof!  module:caf_iot_lego/proxy_iot_lego#
         * @alias connect
         */
        that.connect = function(devices, handlerMethodName) {
            assert((typeof devices === 'string') || Array.isArray(devices));
            handlerMethodName && assert(typeof handlerMethodName === 'string');
            devices = typeof devices === 'string' ? [devices] : devices;
            for (let deviceType of devices) {
                if (!DeviceTypes[deviceType]) {
                    throw new Error('Unsupported device type, see ' +
                                    '`caf_iot_lego/lib/constants.js`');
                }
            }
            $._.connect(devices, handlerMethodName);
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

        Object.freeze(that);
        return [null, that];
    } catch (err) {
        return [err];
    }
};
