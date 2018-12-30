'use strict';

const fs = require('fs');
const EsiData = require("../EsiData.js");

let nodes, edges;

EsiData.readData();
//EsiData.readData('Catch');
//EsiData.readData('Catch', '9HXQ-G');

buildNodes();
buildEdges();
writeFiles();

function buildNodes() {
    nodes = [];
    for (let system of EsiData.systems) {
        nodes.push([
            system.name,
            system.securityStatus,
            system.position.x,
            system.position.y,
            system.position.z,
        ]);
    }
}

function buildEdges() {
    edges = [];
    let uniqueEdges = [];
    for (let stargate of EsiData.stargates) {
        let origin = null;
        let destination = null;
        for (let system of EsiData.systems) {
            if (! system.stargates) {
                continue;
            }
            if (system.stargates.indexOf(stargate.id) !== -1) {
                origin = {
                    id: system.id,
                    name: system.name,
                    position: {
                        x: system.position.x,
                        y: system.position.y,
                        z: system.position.z,
                    }
                };
            }
            if (system.id === stargate.destination.systemId) {
                destination = {
                    id: system.id,
                    name: system.name,
                    position: {
                        x: system.position.x,
                        y: system.position.y,
                        z: system.position.z,
                    }
                };
            }
        }
        if (! origin || ! destination) {
            continue;
        }

        let uniqueEdge;
        if (origin.id < destination.id) {
            uniqueEdge = origin.id + '-' + destination.id;
        } else {
            uniqueEdge = destination.id + '-' + origin.id;
        }
        if (uniqueEdges.indexOf(uniqueEdge) !== -1) {
            continue;
        }

        uniqueEdges.push(uniqueEdge);
        edges.push([
            origin.position.x,
            origin.position.y,
            origin.position.z,
            destination.position.x,
            destination.position.y,
            destination.position.z,
        ]);
    }
}

function writeFiles() {
    try {
        fs.mkdirSync('dist');
    } catch(e) {}
    fs.mkdir('dist/data', () => {
        const constFileNodes = "dist/data/nodes.json";
        fs.writeFile(constFileNodes, JSON.stringify(nodes), () => {
            console.log("Wrote " + constFileNodes);
        });
        const constFileEdges = "dist/data/edges.json";
        fs.writeFile(constFileEdges, JSON.stringify(edges), () => {
            console.log("Wrote " + constFileEdges);
        });
    });
}
