'use strict';

module.exports = class Constellation {

    /**
     * @param {int} id
     * @param {string} name
     * @param {int[]} systems
     * @param {Position} position
     */
    constructor(id, name, systems, position) {
        this.id = id;
        this.name = name;
        this.systems = systems;
        this.position = position;
    }
};
