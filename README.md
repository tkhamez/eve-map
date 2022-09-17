
## A simple jump route calculator with a 3D map for EVE Online.

### Install

`npm i`

### Generate data files

```
node src/js/cli/build-map.js
node src/js/cli/build-graph.js
```

or just `npm run postinstall`

### Run dev server

`npm start`

### Build distribution

`npm run build`

### Console

Route calculation, example:

`node src/js/cli/route.js U-QVWD IRE-98 6`

### Browser

`Route.js` can also be used directly in a web browser, it only needs the
data from `graph.json` (see above).

Example:

```javascript
// init
fetch('/data/graph.json').then(function(response) {
    response.json().then(function(json) {
        Route.graph = json;
    });
});
```
```javascript
// later in the code
const route = Route.calculateRoute(
    Route.findSystem('Amarr'), 
    Route.findSystem('GE-8JV'), 
    10
);
console.log(route);
```
