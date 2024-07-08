//#region const
const { DEBUGGING } = require('constants');
const EXTENSIONS_PER_RCL = {
    0: 0,
    1: 0,
    2: 5,
    3: 10,
    4: 20,
    5: 30,
    6: 40,
    7: 50,
    8: 60
}; 
//#endregion

//#region Architecting
Room.prototype.clearRoadConstruction = function() {
    const roadConstructionSites = this.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_ROAD
    });
    for (const site of roadConstructionSites) {
        site.remove();
    }
    console.log(`Removed ${roadConstructionSites.length} road construction sites.`);
    return;
};

Room.prototype.planRoads = function(isPlanning) {
    const sources = this.find(FIND_SOURCES);
    const spawn = this.find(FIND_MY_SPAWNS)[0];
    const controller = this.controller;
    
        if (!spawn) {
            console.log('No spawn found in room:', this.name);
            return;
        }
        if (!controller) {
            console.log('No controller found in room:', this.name);
            return;
        }
        if (!sources) {
            console.log('No sources found in room:', this.name);
            return;
        }
    
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
                    if (isPlanning) {
                        pos.createConstructionSite(STRUCTURE_ROAD);
                    } else {
                        const result = pos.createConstructionSite(STRUCTURE_ROAD);
                        if (result === OK) {
                            console.log(`Road construction site created at ${pos}`);
                        }
                    }
                }
            }
        };
    
        for (const source of sources) {
            createRoadConstructionSites(controller.pos, source.pos);
            createRoadConstructionSites(spawn.pos, controller.pos);
            createRoadConstructionSites(spawn.pos, source.pos);
        }
};

Room.prototype.clearPlannedExtensions = function() {
    const plannedExpanders = this.find(FIND_CONSTRUCTION_SITES, {
        filter: site => site.structureType === STRUCTURE_EXTENSION
    });
    for (const site of plannedExpanders) {
        site.remove();
    }
};

Room.prototype.planExtensions = function(radius) {
    const spawns = this.find(FIND_MY_SPAWNS);
    const controllerLevel = this.controller ? this.controller.level : 0;
    const maxExtensions = EXTENSIONS_PER_RCL[controllerLevel] || 0;

    if (spawns.length === 0) {
        console.log('No spawns found in room:', this.name);
        return;
    }

    if (!controllerLevel) {
        console.log('No controller found in room:', this.name);
        return;
    }

    let extensionsPlaced = 0;

    const calculatePositions = (spawn, radius) => {
        const positions = [];
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                if (Math.sqrt(dx*dx + dy*dy) >= radius) {
                    const x = spawn.pos.x + dx;
                    const y = spawn.pos.y + dy;
                    if (x >= 0 && x < 50 && y >= 0 && y < 50) {
                        positions.push(new RoomPosition(x, y, this.name));
                    }
                }
            }
        }
        return positions;
    };

    for (const spawn of spawns) {
        let currentRadius = radius;
        while (extensionsPlaced < maxExtensions) {
            const positions = calculatePositions(spawn, currentRadius);
            for (const pos of positions) {
                if (extensionsPlaced >= maxExtensions) break;
                if (this.isValidBuildPosition(pos)) {
                    this.createConstructionSite(pos, STRUCTURE_EXTENSION);                    
                } else {
                    this.createConstructionSite(pos, STRUCTURE_ROAD);
                }
                extensionsPlaced++;
            }
            currentRadius++;
        }
    }
};

Room.prototype.createPathToExit = function(roomEdge) {

    if (roomEdge !== FIND_EXIT_TOP 
        && roomEdge!== FIND_EXIT_RIGHT
        && roomEdge!== FIND_EXIT_BOTTOM
        && roomEdge!== FIND_EXIT_LEFT ) {
            return false;
        }

    const spawns = this.find(FIND_MY_SPAWNS);
    const controller = this.controller;

    if (spawns.length === 0) {
        console.log('No spawns found in room:', this.name);
        return null;
    }

    if (!controller) {
        console.log('No controller found in room:', this.name);
        return null;
    }
    
    //console.log(`Midpoint: (${midX}, ${midY})`);
    // Get midpoint of spawn and room controller
    const ourRoadMidpoint = this.midpoint(spawns[0].pos, controller.pos);
    const ourExit = ourRoadMidpoint.findClosestByPath(this.find(roomEdge));
 
     if (!ourExit) {
         console.log('No exit found in room:', this.name);
         return false;
     }

    // Use PathFinder to find the path from the midpoint to the closest exit
    const path = PathFinder.search(ourRoadMidpoint, { pos: ourExit, range: 1 }, {
        swampCost: 1,
        plainCost: 2,
        roomCallback: function(roomName) {
            const room = Game.rooms[roomName];
            if (!room) return;
            let costs = new PathFinder.CostMatrix;
            room.find(FIND_STRUCTURES).forEach(function(struct) {
                if (struct.structureType === STRUCTURE_ROAD) {
                    // Favor roads over plain tiles
                    costs.set(struct.pos.x, struct.pos.y, 1);
                } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                           (struct.structureType !== STRUCTURE_RAMPART ||
                            !struct.my)) {
                    // Can't walk through non-walkable buildings
                    costs.set(struct.pos.x, struct.pos.y, 0xff);
                }
            });
            return costs;
        }
    }).path;

    // Visualize the path
    for (const pos of path) {
        this.visual.circle(pos.x, pos.y, {
            fill: 'transparent',
            radius: 0.5,
            stroke: '#00ff00'
        });
        this.visual.line(pos.x, pos.y, pos.x + 0.5, pos.y + 0.5, {
            color: '#00ff00',
            lineStyle: 'dashed'
        });
    }
}
//#endregion

//#region Overlay
Room.prototype.overlayRoadConstruction = function(onOff) {
    const constructionSites = this.find(FIND_CONSTRUCTION_SITES, {
        filter: { structureType: STRUCTURE_ROAD }
    });

    if (onOff) {
        for (const site of constructionSites) {
            this.visual.circle(site.pos, {
                fill: 'transparent',
                radius: 0.35,
                stroke: '#ffaa00'
            });
            this.visual.text('🚧', site.pos.x, site.pos.y + 0.25, {
                font: 0.5,
                stroke: '#000000',
                strokeWidth: 0.1,
                background: '#ffaa00'
            });
        }
    }
};

Room.prototype.overlayBuildableCheckerboardPositions = function() {
    const validPositions = [];

    for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
            const pos = new RoomPosition(x, y, this.name);
            if (this.isValidBuildPosition(pos)) {
                this.visual.circle(pos.x, pos.y, {
                    fill: 'transparent',
                    radius: 0.5,
                    stroke: '#00FF00'
                });
            }
        }
    }
};
//#endregion

//#region Utility
Room.prototype.removeAllRoads = function() {
    const roads = this.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_ROAD
    });
    for (const road of roads) {
        road.destroy();
    }
    console.log(`Removed ${roads.length} roads.`);
    return;
};

Room.prototype.isValidBuildPosition = function(pos) {
    const room = this;

    const isWithinBounds = (x, y) => x >= 0 && x < 50 && y >= 0 && y < 50;

    const isValidPos = (pos) => {
        const x = pos.x;
        const y = pos.y;

        if (!isWithinBounds(x, y)) return false;

        const isWall = room.getTerrain().get(x, y) === TERRAIN_MASK_WALL;
        const isOccupied = room.lookForAt(LOOK_STRUCTURES, pos).length > 0 ||
                           room.lookForAt(LOOK_CONSTRUCTION_SITES, pos).length > 0;
        return !isWall && !isOccupied && pos.isValid();
    };

    if (!isValidPos(pos)) return false;

    const isOnRoad = room.lookForAt(LOOK_STRUCTURES, pos).some(structure => structure.structureType === STRUCTURE_ROAD) ||
                     room.lookForAt(LOOK_CONSTRUCTION_SITES, pos).some(site => site.structureType === STRUCTURE_ROAD);

    return !isOnRoad;
};


Room.prototype.findRallyPoint = function() {
    const spawns = this.find(FIND_MY_SPAWNS);

    if (spawns.length === 0) {
        console.log('No spawns found in room:', this.name);
        return null;
    }

    const spawn = spawns[0];
    const spawnPos = spawn.pos;
    const possibleRallyPoints = [];

    // Generate positions 4-5 spaces away from the spawn
    for (let dx = -5; dx <= 5; dx++) {
        for (let dy = -5; dy <= 5; dy++) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance >= 4 && distance <= 5) {
                const x = spawnPos.x + dx;
                const y = spawnPos.y + dy;
                if (x >= 0 && x < 50 && y >= 0 && y < 50) {
                    possibleRallyPoints.push(new RoomPosition(x, y, this.name));
                }
            }
        }
    }

    for (const pos of possibleRallyPoints) {
        const terrain = this.getTerrain().get(pos.x, pos.y);
        const isClear = this.lookForAt(LOOK_STRUCTURES, pos).length === 0 &&
                        this.lookForAt(LOOK_CONSTRUCTION_SITES, pos).length === 0 &&
                        terrain !== TERRAIN_MASK_WALL;

        if (isClear) {
            return pos;
        }
    }

    console.log('No valid rally points found in room:', this.name);
    return null;
};

Room.prototype.midpoint = function(posOne, posTwo) {
    const midX = Math.floor((posOne.x + posTwo.x) / 2);
    const midY = Math.floor((posOne.y + posTwo.y) / 2);
    //console.log(`Midpoint: (${midX}, ${midY})`);
    return new RoomPosition(midX, midY, this.name);
}
//#endregion