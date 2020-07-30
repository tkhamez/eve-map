'use strict';

const fs = require('fs');

const Region = require('./models/esi/Region.js');
const Constellation = require('./models/esi/Constellation.js');
const System = require('./models/esi/System.js');
const Stargate = require('./models/esi/Stargate.js');
const Destination = require('./models/esi/Destination.js');
const Position = require('./models/esi/Position.js');

const EsiData = {

    regionBlackList: ['ADR01', 'ADR02', 'ADR03', 'ADR04', 'ADR05', 'PR-01'],

    regionBlackListSubString: '-R00',

    /**
     * @type Region[]
     */
    regions: [],

    /**
     * @type Constellation[]
     */
    constellations: [],

    /**
     * @type System[]
     */
    systems: [],

    /**
     * @type Stargate[]
     */
    stargates: [],

    /**
     * @param {string} [regionName] limit to one region
     * @param {string} [constellationName] additionally limit to one constellation
     */
    readData: function(regionName, constellationName) {
        const regionsData = JSON.parse(fs.readFileSync("esi-data/json/universe/regions/regions.json", "utf8"));
        for (let regionData of regionsData) {
            if (this.regionBlackList.indexOf(regionData.name) !== -1) {
                continue;
            }
            if (regionData.name.indexOf(this.regionBlackListSubString) !== -1) {
                continue;
            }
            if (regionName && regionName !== regionData.name) {
                continue;
            }

            this.regions.push(new Region(
                regionData.id,
                regionData.name,
                regionData.constellations,
            ));

            const constellationsData = fs.readFileSync(
                "esi-data/json/universe/constellations/" + regionData.name + "-constellations.json",
                "utf8"
            );
            for (let constellationData of JSON.parse(constellationsData)) {
                if (constellationName && constellationName !== constellationData.name) {
                    continue;
                }
                this.constellations.push(new Constellation(
                    constellationData.id,
                    constellationData.name,
                    constellationData.systems,
                    new Position(
                        constellationData.position.x,
                        constellationData.position.y,
                        constellationData.position.z
                    )
                ));
            }

            const systemsData = fs.readFileSync(
                "esi-data/json/universe/systems/" + regionData.name + "-systems.json",
                "utf8"
            );
            for (let systemData of JSON.parse(systemsData)) {
                if (constellationName && this.constellations[0].systems.indexOf(systemData.id) === -1) {
                    continue;
                }
                this.systems.push(new System(
                    systemData.id,
                    systemData.name,
                    systemData.securityStatus,
                    systemData.stargates,
                    new Position(
                        systemData.position.x,
                        systemData.position.y,
                        systemData.position.z
                    )
                ));
            }

            const stargatesData = fs.readFileSync(
                "esi-data/json/universe/stargates/" + regionData.name + "-stargates.json",
                "utf8"
            );
            for (let stargateData of JSON.parse(stargatesData)) {
                if (constellationName) {
                    let skip = true;
                    for (let system of this.systems) {
                        if (system.stargates.indexOf(stargateData.id) !== -1) {
                            skip = false;
                            break;
                        }
                    }
                    if (skip) {
                        continue;
                    }
                }
                this.stargates.push(new Stargate(
                    stargateData.id,
                    stargateData.name,
                    new Destination(
                        stargateData.destination.stargateId,
                        stargateData.destination.systemId
                     ),
                    new Position(
                        stargateData.position.x,
                        stargateData.position.y,
                        stargateData.position.z
                    )
                ));
            }
        }
    },

};

module.exports = EsiData;
