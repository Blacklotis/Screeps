Room.prototype.findBuildableSquares = function(top, left, bottom, right) {
    const look = this.lookForAtArea(LOOK_STRUCTURES, top, left, bottom, right, true);
    const lookConstructionSites = this.lookForAtArea(LOOK_CONSTRUCTION_SITES, top, left, bottom, right, true);

    const blockedPositions = new Set();

    // Add positions with structures to the blocked set
    look.forEach(item => {
        blockedPositions.add(`${item.x},${item.y}`);
    });

    // Add positions with construction sites to the blocked set
    lookConstructionSites.forEach(item => {
        blockedPositions.add(`${item.x},${item.y}`);
    });

    const buildableSquares = [];

    // Check each position in the area and add to buildableSquares if not blocked
    for (let y = top; y <= bottom; y++) {
        for (let x = left; x <= right; x++) {
            if (!blockedPositions.has(`${x},${y}`)) {
                buildableSquares.push(new RoomPosition(x, y, this.name));
            }
        }
    }

    return buildableSquares;
};

Room.prototype.buildAllCurrentRoads = function() {
    const sources = this.find(FIND_SOURCES);
    const spawn = this.find(FIND_MY_SPAWNS)[0];
    const controller = this.controller;

    if (!spawn) {
        console.log('No spawn found in room:', this.name);
        return;
    }

    // Function to create construction sites for roads along a path
    const createRoadConstructionSites = (fromPos, toPos) => {
        const path = this.findPath(fromPos, toPos, {
            ignoreCreeps: true,
            ignoreRoads: true,
            swampCost: 1,
            plainCost: 1
        });
        for (const step of path) {
            const pos = new RoomPosition(step.x, step.y, this.name);
            const structures = pos.lookFor(LOOK_STRUCTURES);
            const constructionSites = pos.lookFor(LOOK_CONSTRUCTION_SITES);
            if (structures.length === 0 && constructionSites.length === 0) {
                pos.createConstructionSite(STRUCTURE_ROAD);
            }
        }
    };

    // Build roads from spawn to all sources
    for (const source of sources) {
        createRoadConstructionSites(spawn.pos, source.pos);
    }

    // Build roads from controller to all sources
    if (controller) {
        for (const source of sources) {
            createRoadConstructionSites(controller.pos, source.pos);
        }
    }

    // Build roads between the spawn and the controller
    if (controller) {
        createRoadConstructionSites(spawn.pos, controller.pos);
    }
};
