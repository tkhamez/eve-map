'use strict';

module.exports = class SolarSystem {

    /**
     * @param {int} x
     * @param {int} y
     * @param {int} z
     * @param {string} name
     * @param {float} securityStatus
     * @param {string[]} [destinations] SolarSystem names
     */
    constructor(name, securityStatus, x, y, z, destinations) {
        this.name = name;
        this.security = securityStatus;
        this.x = x;
        this.y = y;
        this.z = z;
        //this.destinations = destinations;
    }
};
