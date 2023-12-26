'use strict';

const fs = require('fs');
const SolarSystem = require('../models/SolarSystem.js');

const EsiData = require("../EsiData.js");

// Exclude Jove and Pochven systems
EsiData.regionBlackList.push('A821-A', 'J7HZ-F', 'UUA-F4', 'Pochven');

EsiData.readData();
//EsiData.readData('Catch');
//EsiData.readData('Catch', '9HXQ-G');

const nodes = buildGraph();
//console.log(nodes);
//console.log(nodes.length);

writeFile(nodes);

function buildGraph() {
    const nodes = [];

    for (let system of EsiData.systems) {
        let security;
        if (system.securityStatus > 0 && system.securityStatus < 0.05) {
            security = 0.1;
        } else if (system.securityStatus <= 0.0) {
            security = Math.round(system.securityStatus * 100) / 100;
        } else {
            security = Math.round(system.securityStatus * 10) / 10;
        }
        nodes.push(new SolarSystem(
            system.name,
            security,
            system.position.x,
            system.position.y,
            system.position.z,
            //findDestinations(system),
        ));
    }

    return nodes;
}

function findDestinations(system) {
    const destinations = [];
    if (! system.stargates) {
        return destinations;
    }

    for (let stargate of EsiData.stargates) {
        if (system.stargates.indexOf(stargate.id) === -1) {
            continue;
        }
        for (let esiSystem of EsiData.systems) {
            if (esiSystem.id === stargate.destination.systemId) {
                destinations.push(esiSystem.name);
                break;
            }
        }
    }

    return destinations;
}

function writeFile(nodes) {
    try {
        fs.mkdirSync('dist');
    } catch(e) {}
    fs.mkdir('dist/data', () => {
        const file = "dist/data/graph.json";
        fs.writeFile(file, JSON.stringify(nodes), () => {
            console.log("Wrote " + file);
        });
    });
}
