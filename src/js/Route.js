/**
 * https://github.com/tkhamez/eve-map
 */

var Route = (function() {
    'use strict';

    /**
     * @param {SolarSystem} systemA
     * @param {SolarSystem} systemB
     * @returns {number|null}
     */
    function calculateDistance(systemA, systemB) {
        var ccpLightYear = 9460000000000000; // metres

        var distance = Math.sqrt(
            Math.pow(systemB.x - systemA.x, 2) +
            Math.pow(systemB.y - systemA.y, 2) +
            Math.pow(systemB.z - systemA.z, 2)
        );
        return Math.round((distance / ccpLightYear) * 1000) / 1000;
    }

    /**
     * @param {SolarSystem} withinRangeOf
     * @param {SolarSystem} closerTo
     * @param {number} maxRange
     * @return {SolarSystem|null}
     */
    function findCloserSystem(withinRangeOf, closerTo, maxRange) {
        var currentDistance = calculateDistance(withinRangeOf, closerTo);

        var bestSystem = null;

        var lastDistance1 = 0;
        var lastDistance2 = Number.MAX_SAFE_INTEGER;

        for (var i = 0; i < Route.graph.length; i++) {
            if (Route.graph[i].security >= 0.5) {
                continue;
            }

            var distance1 = calculateDistance(withinRangeOf, Route.graph[i]);
            var distance2 = calculateDistance(closerTo, Route.graph[i]);

            if (distance1 <= maxRange && distance2 < currentDistance &&
                distance1 > lastDistance1 && distance2 < lastDistance2
            ) {
                bestSystem = Route.graph[i];
                lastDistance1 = distance1;
                lastDistance2 = distance2;
            }
        }

        return bestSystem;
    }

    return {

        /**
         * Array of SolarSystem objects (data from graph.json)
         */
        graph: null,

        /**
         * @param {string} name
         * @returns {SolarSystem|null}
         */
        findSystem: function(name) {
            for (var i = 0; i < this.graph.length; i++) {
                if (this.graph[i].name.toLowerCase() === name.toLowerCase()) {
                    return this.graph[i];
                }
            }
            console.log('System "' + name + '" not found');
        },

        /**
         * @param {SolarSystem} start
         * @param {SolarSystem} destination
         * @param {number} maxRange light years
         * @returns {Array}
         */
        calculateRoute: function(start, destination, maxRange) {
            if (! start || ! destination || destination.security >= 0.5) {
                return [];
            }

            var route = [];
            var sysA = start;
            var sysB = destination;
            var distance = Number.MAX_SAFE_INTEGER;

            while (distance > maxRange) {
                distance = calculateDistance(sysA, sysB);

                if (distance <= maxRange) {
                    route.push({
                        from: { name: sysA.name, security: sysA.security },
                        to: { name: sysB.name, security: sysB.security },
                        distance: distance
                    });
                    sysA = sysB;
                    if (sysB !== destination) {
                        sysB = destination;
                        distance = Number.MAX_SAFE_INTEGER;
                    }
                } else {
                    sysB = findCloserSystem(sysA, sysB, maxRange);
                    if (sysB === null) {
                        return [];
                    }
                }
            }

            return route;
        },
    }
})();

if (typeof module !== 'undefined') {
    module.exports = Route;
}
