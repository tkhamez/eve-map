'use strict';

module.exports = class Region {

    /**
     * @param {int} id
     * @param {string} name
     * @param {int[]} constellations
     */
    constructor(id, name, constellations) {
        this.id = id;
        this.name = name;
        this.constellations = constellations;
    }
};
