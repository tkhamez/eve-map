require("whatwg-fetch");
const THREE = window.THREE = require('three');
require('three/examples/js/controls/OrbitControls');

let width, height;
const cursor = { x: 0, y: 0 };

let renderer, scene, camera, controls, raycaster, mouse;
let systemNameClicked;
let systemNameHover;
const fonts = {};
const nodeObjects = [];
const edgeObjects = [];
let routeObjects = [];
let HOVER = null;
let CLICKED = null;
const mod = 1000000000000000;

const Map = {

    container: null,

    init: function () {
        width = this.container.offsetWidth;
        height = this.container.offsetHeight;

        camera = new THREE.PerspectiveCamera(45, width / height, 0.05, 50000);
        camera.position.set(0, 1500, 0);

        controls = new THREE.OrbitControls(camera, this.container);
        controls.zoomSpeed = 5.0; // 1.0 is default
        controls.update();

        scene = new THREE.Scene();

        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        this.container.appendChild(renderer.domElement);

        render();

        // add stuff

        //scene.add(new THREE.AxesHelper(700));
        //scene.add(new THREE.GridHelper(1300, 9));

        addNodes().then(() => { console.log('nodes loaded') });
        addEdges().then(() => { console.log('edges loaded') });
    },

    loadFonts: async function() {
        const loader = new THREE.FontLoader();
        fonts.helvetiker_regular = await new Promise((resolve) => {
            loader.load('fonts/helvetiker_regular.typeface.json', function(font) {
                resolve(font);
            });
        });
        fonts.helvetiker_bold = await new Promise((resolve) => {
            loader.load('fonts/helvetiker_bold.typeface.json', function(font) {
                resolve(font);
            });
        });
    },

    onResize: function() {
        width = Map.container.offsetWidth;
        height = Map.container.offsetHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    },

    onMouseMove: function(event) {
        mouse.x = ((event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = - ((event.clientY - renderer.domElement.offsetTop) / renderer.domElement.clientHeight) * 2 + 1;
        cursor.x = event.clientX;
        cursor.y = event.clientY;
    },

    onMouseDown: function() {
        const intersects = raycaster.intersectObjects(nodeObjects);
        if (intersects.length > 0) {
            clicked(intersects[0].object);
        }
    },

    toggleEdges: function(show) {
        for (let edgeObject of edgeObjects) {
            edgeObject.material.transparent = ! show;
        }
    },

    toggleNodes: function(show) {
        for (let nodeObject of nodeObjects) {
            nodeObject.material.transparent = ! show;
        }
    },

    focusSystem: function(name) {
        for (let nodeObject of nodeObjects) {
            if (nodeObject.userData.name === name) {
                clicked(nodeObject);
                break;
            }
        }
    },

    showRoute: function(route) {
        for (let routeObject of routeObjects) {
            scene.remove(routeObject);
        }
        routeObjects = [];

        let fromSystems = {};
        let toSystems = {};

        // collect nodes
        for (let nodeObject of nodeObjects) {
            for (let idx1 of route.keys()) {
                if (nodeObject.userData.name === route[idx1].from.name) {
                    fromSystems[idx1] = nodeObject;
                }
                if (nodeObject.userData.name === route[idx1].to.name) {
                    toSystems[idx1] = nodeObject;
                }
            }
        }

        // create lines
        for (let idx2 of route.keys()) {
            let line = createLine(fromSystems[idx2].position.x,
                fromSystems[idx2].position.y,
                fromSystems[idx2].position.z,
                toSystems[idx2].position.x,
                toSystems[idx2].position.y,
                toSystems[idx2].position.z,
                0x8080FF,
                false
            );
            routeObjects.push(line);
            scene.add(line);
        }
    }
};

module.exports = Map;

function render() {
    // get hovered system
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodeObjects);
    if (intersects.length > 0) {
        hovered(intersects[0].object);
    } else {
        hovered();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function hovered(node) {
    if (node) {
        if (HOVER !== null && HOVER !== node) {
            HOVER.material.color.setHex(nodeColor(HOVER));
            scene.remove(systemNameHover);
        }
        if (HOVER !== node) {
            HOVER = node;
            if (HOVER !== CLICKED) {
                highlight(HOVER);
                systemNameHover = showName(HOVER);
            }
        }
    } else if (HOVER !== null) {
        if (HOVER !== CLICKED) {
            HOVER.material.color.setHex(nodeColor(HOVER));
        }
        scene.remove(systemNameHover);
        HOVER = null;
    }
}

function clicked(node) {
    if (CLICKED !== null) {
        CLICKED.material.color.setHex(nodeColor(CLICKED));
    }
    CLICKED = node;
    focus(CLICKED);
}

function highlight(node) {
    node.material.color.setHex(0xffffff);
}

function showName(node) {
    const geometry = new THREE.TextGeometry(node.userData.name, {
        font: fonts.helvetiker_regular,
        size: 1,
        height: 0.1
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const systemName = new THREE.Mesh(geometry, textMaterial);
    scene.add(systemName);

    const position = new THREE.Vector3();
    position.setFromMatrixPosition(node.matrixWorld);

    systemName.position.x = position.x;
    systemName.position.z = position.z;
    systemName.position.y = position.y + 1.5;

    return systemName;
}

function focus(node) {
    highlight(node);

    scene.remove(systemNameClicked);
    systemNameClicked = showName(node);

    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(node);
    boundingBox.getCenter(controls.target);
    controls.update();
}

async function addNodes() {
    const response = await fetch("data/nodes.json");
    let nodes = await response.json();
    //nodes.push(['center', 0, 0, 0]);
    for (let node of nodes) {
        let geometry = new THREE.SphereGeometry(0.5, 9, 9);
        let material = new THREE.MeshBasicMaterial({ opacity: 0 });
        let sphere = new THREE.Mesh(geometry, material);
        sphere.userData = {
            name: node[0],
            securityStatus: node[1],
        };
        sphere.material.color.setHex(nodeColor(sphere));
        sphere.position.set(
            node[2] / mod, // x
            node[3] / mod, // y
            node[4] / mod * -1 // z
        );
        scene.add(sphere);
        nodeObjects.push(sphere);
    }
}

async function addEdges() {
    const response = await fetch("data/edges.json");
    const edges = await response.json();
    for (let edge of edges) {
        const line = createLine(
            edge[0] / mod,
            edge[1] / mod,
            edge[2] / mod * -1,
            edge[3] / mod,
            edge[4] / mod,
            edge[5] / mod * -1,
            0x303030,
            true
        );
        scene.add(line);
        edgeObjects.push(line);
    }
}

function createLine(x1, y1, z1, x2, y2, z2, color, transparent) {
    let geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(x1, y1, z1));
    geometry.vertices.push(new THREE.Vector3(x2, y2, z2));

    let material = new THREE.LineBasicMaterial({ color: color, opacity: 0 });
    material.transparent = transparent;
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();

    return line;
}

function nodeColor(node) {
    if (node.userData.securityStatus < 0) {
        return 0xd10404;
    } else if (node.userData.securityStatus < 0.5) {
        return 0xefc804;
    } else {
        return 0x08e27f;
    }
}
