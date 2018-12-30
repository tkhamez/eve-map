'use strict';

module.exports = class Stargate {

    /**
     * @param {int} id
     * @param {string} name
     * @param {Destination} destination
     * @param {Position} position
     */
    constructor(id, name, destination, position) {
        this.id = id;
        this.name = name;
        this.destination = destination;
        this.position = position;
    }
};
