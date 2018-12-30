'use strict';

const fetch = require('node-fetch');
const fs = require('fs');

const Region = require('../models/esi/Region.js');

const basePath = 'https://esi.evetech.net/latest/';

async function fetchRegionIds() {
    const response = await fetch(basePath + 'universe/regions');
    return await response.json();
}

async function fetchRegion(regionId) {
    const response = await fetch(basePath + 'universe/regions/' + regionId);
    return await response.json();
}

const regions = [];

async function fetchData() {
    const regionIds = await fetchRegionIds();

    for (let regionId of regionIds) {
        const region = await fetchRegion(regionId);
        regions.push(new Region(
            region.region_id,
            region.name,
            region.constellations
        ));
        console.log('Region ' + region.name);

        //break;
    } // /for regionIds
}

fetchData().then(function() {
    fs.writeFile("data/esi/regions.json", JSON.stringify(regions), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Wrote data/esi/regions.json");
        }
    });
});
