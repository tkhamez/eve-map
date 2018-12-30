
Demo https://eve-map-3d.herokuapp.com/

### Install

`npm i`

This also generates data files and builds the app (postinstall).

### Generate data files

```
node src/js/cli/build-map.js
node src/js/cli/build-graph.js
```

### Run dev server

`npm start`

### Build distribution

`npm run build`

### Regenerate ESI data

Delete existing files from `data/esi`.

Fetch regions:

`node src/js/cli/fetch-regions.js`

Fetch constellations, systems and stargates (it processes one region after the other, 
repeat it until it ends without an error):

`node src/js/cli/fetch-systems.js`

### Console

Route calculation, example:

`node src/js/cli/route.js U-QVWD IRE-98 6`
