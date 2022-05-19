
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
/* eslint-disable no-alert, no-unused-vars */
'use strict';
/**
 *  Dummy BLE GATT services plug to enable `mkStatic()` in hosts with no
 * bluetooth hardware.
 *
 *
 */
const assert = require('assert');
const caf_iot = require('caf_iot');
const genPlugIoT = caf_iot.gen_plug_iot;

/**
 * Factory method for a plug to  BLE GATT services.
 *
 */
exports.newInstance = async function($, spec) {
    try {
        const that = genPlugIoT.create($, spec);

        $._.$.log && $._.$.log.debug('Dummy New BLE Lego plug');

        that.connect = (deviceTypes) => 'lego';
        that.isConnected = () => false;
        that.disconnect = () => true;
        that.callMethod = (deviceType, methodName, args) => true;
        that.registerHandler = (deviceType, topic, handlerMethodName) => {};

        return [null, that];
    } catch (err) {
        return [err];
    }
};
