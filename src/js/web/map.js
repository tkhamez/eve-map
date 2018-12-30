import '@babel/polyfill';
import { fetch } from 'whatwg-fetch';
const Route = require("../Route.js");
const Map = require("../Map.js");

Map.container = document.getElementById('map');
const showGates = document.getElementById('showGates');
const showSystems = document.getElementById('showSystems');

Map.loadFonts().then(() => {
    console.log('fonts loaded');
    run();
});

function run() {

    // check browser support
    if (! isWebGLAvailable()) {
        Map.container.innerHTML = 'Your browser does not seem to support WebGL';
        return;
    }

    // listener
    window.addEventListener('resize', Map.onResize, false);
    Map.container.addEventListener('mousemove', Map.onMouseMove, false);
    Map.container.addEventListener('mousedown', Map.onMouseDown);
    showGates.addEventListener('change', onOptionChange);
    showSystems.addEventListener('change', onOptionChange);

    Map.init();
}

function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !! (
            window.WebGLRenderingContext &&
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
    } catch(e) {
        return false;
    }
}

function onOptionChange(event) {
    if (event.target.id === 'showGates') {
        Map.toggleEdges(showGates.checked);
    }
    if (event.target.id === 'showSystems') {
        Map.toggleNodes(showSystems.checked);
    }
}

/**
 * @param {string} [name]
 * @param {Event} [evt]
 */
window.focusSystem = function(name, evt) {
    if (! name) {
        const system = document.getElementsByName('focus')[0];
        name = system.value;
    }
    if (evt) {
        evt.preventDefault();
    }
    Map.focusSystem(name);
};

window.calculateRoute = async function() {
    if (Route.graph === null) {
        const response = await fetch("data/graph.json");
        Route.graph = await response.json();
    }

    const from = document.getElementsByName('route-from')[0];
    const to = document.getElementsByName('route-to')[0];
    const range = document.getElementsByName('route-range')[0];
    const route = Route.calculateRoute(
        Route.findSystem(from.value),
        Route.findSystem(to.value),
        range.value
    );

    const routeContainer = document.getElementById('route');
    routeContainer.innerHTML = '';

    if (route.length === 0) {
        routeContainer.innerHTML = 'No route found.';
        return;
    }

    routeContainer.innerHTML +=
        '<a href="#" onclick="focusSystem(\'' + route[0].from.name + '\', event)">' + route[0].from.name + '</a>' +
        ' (' + route[0].from.security + ') <br>';
    for (let step of route) {
        routeContainer.innerHTML +=
            '<a href="#" onclick="focusSystem(\'' + step.to.name + '\', event)">' + step.to.name + '</a>' +
            ' (' + step.to.security + ') ' +
            step.distance + ' ly<br>';
    }

    Map.showRoute(route);
};
