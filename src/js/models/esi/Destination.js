'use strict';

module.exports = class Destination {

    /**
     * @param {int} stargateId
     * @param {int} systemId
     */
    constructor(stargateId, systemId) {
        this.stargateId = stargateId;
        this.systemId = systemId;
    }
};
