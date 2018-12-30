'use strict';

const fs = require('fs');
const Route = require("../Route.js");

// input

const from = process.argv[2];
const to = process.argv[3];
const maxRange = Number(process.argv[4]);

// run

Route.graph = JSON.parse(fs.readFileSync("dist/data/graph.json", "utf8"));

const systemFrom = Route.findSystem(from);
const systemTo = Route.findSystem(to);

const route = Route.calculateRoute(systemFrom, systemTo, maxRange);
if (route.length === 0) {
    console.log('No route found.');
}
for (let step of route) {
    console.log(
        step.from.name + ' (' + step.from.security + ') -> ' +
        step.to.name + ' (' + step.to.security + ') ' + step.distance + ' ly'
    );
}
