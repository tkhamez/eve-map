'use strict';

module.exports = class System {

    /**
     * @param {int} id
     * @param {string} name
     * @param {float} securityStatus
     * @param {int[]} stargates
     * @param {Position} position
     */
    constructor(id, name, securityStatus, stargates, position) {
        this.id = id;
        this.name = name;
        this.securityStatus = securityStatus;
        this.stargates = stargates;
        this.position = position;
    }
};
