# EVE Map

A simple jump route calculator with a 3D map for EVE Online.

![Screenshot](eve-map.png)

## Run

First start a Docker container:

```bash
docker run -it -v $PWD:/app -p 127.0.0.1:8080:8080 -w /app node:24-slim bash
```

### Install

```bash
npm ci
```

Generate data files (in dist/data):
```bash
node src/js/cli/build-map.js
node src/js/cli/build-graph.js
```

### Run dev server

```bash
npm start
```

### Build distribution

```bash
npm run build
```

### Console

Route calculation, example:

```bash
node src/js/cli/route.js U-QVWD IRE-98 6
```

## Browser

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
