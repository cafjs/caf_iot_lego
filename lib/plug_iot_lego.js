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
 *  Provides access to BLE LEGO services.
 *
 *  * Properties:
 *
 *
 * @module caf_iot_lego/plug_iot_lego
 * @augments external:caf_iot/gen_plug_iot
 *
 */
const assert = require('assert');
const caf_iot = require('caf_iot');
const caf_comp = caf_iot.caf_components;
const myUtils = caf_comp.myUtils;
const genPlugIoT = caf_iot.gen_plug_iot;
const PoweredUP = require('node-poweredup');


/**
 * Factory method for a plug to  BLE LEGO services.
 *
 */
exports.newInstance = async function($, spec) {
    try {
        const poweredUP = new PoweredUP.PoweredUP();

        const that = genPlugIoT.create($, spec);

        $._.$.log && $._.$.log.debug('New BLE LEGO plug');


        return [null, that];
    } catch (err) {
        return [err];
    }
};
