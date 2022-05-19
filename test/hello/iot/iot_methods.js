
"use strict";

exports.methods = {
    async __iot_setup__() {
        this.state.values = {};
        return [];
    },

    async __iot_loop__() {
        var now = (new Date()).getTime();
        this.$.log && this.$.log.debug(now + ' loop:');
        return [];
    },


    async __iot_tilt__(deviceType, topic, argsObj) {
        this.$.log && this.$.log.debug(`tilt: ${deviceType} ${topic}` +
                                       ` ${JSON.stringify(argsObj)}`);
        return [];
    },

    async connect(deviceTypes) {
        await this.$.lego.connect(deviceTypes);
        return [];
    },

    async disconnect() {
        await this.$.lego.disconnect();
        return [];
    },

    async setMatrix(color) {
        await this.$.lego.callMethod(
            'TECHNIC_3X3_COLOR_LIGHT_MATRIX', 'setMatrix', [color]
        );
        return [];
    },

    async setTilt() {
        await this.$.lego.registerHandler(null, 'tilt', '__iot_tilt__');
        return [];
    },

    async removeTilt() {
        await this.$.lego.registerHandler(null, 'tilt', null);
        return [];
    },

    //backdoor for testing
    async debugGetAll() {
        return { state: this.state, toCloud: this.toCloud.dump(),
                 fromCloud: this.fromCloud.dump() };
    }
};
