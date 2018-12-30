'use strict';

const fetch = require('node-fetch');
const fs = require('fs');

const Region = require('../models/esi/Region.js');
const Constellation = require('../models/esi/Constellation.js');
const System = require('../models/esi/System.js');
const Stargate = require('../models/esi/Stargate.js');
const Destination = require('../models/esi/Destination.js');
const Position = require('../models/esi/Position.js');

const basePath = 'https://esi.evetech.net/latest/';

async function fetchConstellation(constellationId) {
    const response = await fetch(basePath + 'universe/constellations/' + constellationId);
    return await response.json();
}

async function fetchSystem(systemId) {
    const response = await fetch(basePath + 'universe/systems/' + systemId);
    return await response.json();
}

async function fetchStargate(stargateId) {
    const response = await fetch(basePath + 'universe/stargates/' + stargateId);
    return await response.json();
}

/**
 * @param {Region} region
 * @returns {Promise}
 */
async function fetchData(region) {
    const constellations = [];
    const systems = [];
    const stargates = [];

    for (let constellationId of region.constellations) {
        const constellation = await fetchConstellation(constellationId);
        constellations.push(new Constellation(
            constellation.constellation_id,
            constellation.name,
            constellation.systems,
            new Position(constellation.position.x, constellation.position.y, constellation.position.z)
        ));
        console.log('  Constellation ' + constellation.name);

        for (let systemId of constellation.systems) {
            const system = await fetchSystem(systemId);
            systems.push(new System(
                system.system_id,
                system.name,
                system.security_status,
                system.stargates,
                new Position(system.position.x, system.position.y, system.position.z)
            ));
            console.log('    System ' + system.name);

            if (! Array.isArray(system.stargates)) {
                continue;
            }
            for (let stargateId of system.stargates) {
                const stargate = await fetchStargate(stargateId);
                stargates.push(new Stargate(
                    stargate.stargate_id,
                    stargate.name,
                    new Destination(stargate.destination.stargate_id, stargate.destination.system_id),
                    new Position(stargate.position.x, stargate.position.y, stargate.position.z)
                ));
                console.log('      ' + stargate.name);

                //break;
            } // /for stargates

            //break;
        } // /for systems

        //break;
    } // /for constellations

    return {
        constellations: constellations,
        systems: systems,
        stargates: stargates
    };
}

/**
 * @param {Region} region
 * @param {object} data
 */
function writeFiles(region, data) {
    const constFile = "data/esi/" + region.name + "-constellations.json";
    fs.writeFileSync(constFile, JSON.stringify(data.constellations));
    console.log("Wrote " + constFile);

    const systemFile = "data/esi/" + region.name + "-systems.json";
    fs.writeFileSync(systemFile, JSON.stringify(data.systems));
    console.log("Wrote " + systemFile);

    const gatesFile = "data/esi/" + region.name + "-stargates.json";
    fs.writeFileSync(gatesFile, JSON.stringify(data.stargates));
    console.log("Wrote " + gatesFile);
}

async function run(regionData) {
    const regions = JSON.parse(regionData);

    for (let regionData of regions) {
        let region = new Region(
            regionData.id,
            regionData.name,
            regionData.constellations
        );

        if (fs.existsSync("data/esi/" + region.name + "-systems.json")) {
            continue;
        }

        console.log('Region ' + region.name);
        const data = await fetchData(region);
        writeFiles(region, data);

        //break;
    }
}

fs.readFile("data/esi/regions.json", "utf8", function read(err, data) {
    if (err) {
        return console.log(err);
    }
    run(data).then(() => { console.log('All done.'); });
});
