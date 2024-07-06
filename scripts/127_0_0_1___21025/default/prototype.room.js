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

Room.prototype.planRoadConstruction = function(isPlanning) {
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

Room.prototype.clearPlannedExpanders = function() {
    const plannedExpanders = this.find(FIND_CONSTRUCTION_SITES, {
        filter: site => site.structureType === STRUCTURE_EXTENSION
    });
    for (const site of plannedExpanders) {
        site.remove();
    }
};

Room.prototype.planExpanders = function() {
    const sources = this.find(FIND_SOURCES);
    const controllerLevel = this.controller ? this.controller.level : 0;
    const maxExpanders = EXTENSIONS_PER_RCL[controllerLevel] || 0;

    let expandersPlaced = 0;
    for (const source of sources) {
        const distances = [3, 4];
        let positions = [];

        for (const distance of distances) {
            const directions = [
                [-distance, -distance], [-distance, distance], 
                [distance, -distance], [distance, distance]
            ];

            for (const dir of directions) {
                const x = source.pos.x + dir[0];
                const y = source.pos.y + dir[1];
                const center = new RoomPosition(x, y, this.name);
                
                if (this.isValidPosition(center)) {
                    positions = this.getExpanderPositionsFromPoint(center, maxExpanders - expandersPlaced);
                    if (positions.length >= 3) break;
                }
            }
            if (positions.length >= 3) break;
        }

        for (const pos of positions) {
            if (expandersPlaced < maxExpanders && this.createConstructionSite(pos, STRUCTURE_EXTENSION) === OK) {
                expandersPlaced++;
            }
        }
    }
};
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
//#endregion

//#region Builder Tasks
Room.prototype.getBuilderWorkExtensions = function()
{
    const extensionConstructionSites = this.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_EXTENSION
    });

    if (extensionConstructionSites.length > 0) {
        return true;
    }

    return false;
}

Room.prototype.getBuilderWorkRepair = function() {
    return this.find(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax
    });
};

Room.prototype.getBuilderWorkRoads = function() {
    this.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_ROAD
    }).length;
} 

Room.prototype.getBuilderWorkSpawn = function() {
    const spawnConstructionSites = this.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_SPAWN
    });

    if (spawnConstructionSites.length > 0) {
        return true;
    }

    return false;
};
//#endregion

//#region Worker Tasks
Room.prototype.getHarvesterWorkExtensions = function() {
    const extensions = this.find(FIND_MY_STRUCTURES, {
        filter: (structure) => 
            structure.structureType === STRUCTURE_EXTENSION 
            && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });

    if (extensions.length > 0) {
        return true;
    }

    return false;
};

Room.prototype.getHarvesterWorkSpawn = function() {
    const spawnConstructionSites = this.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_SPAWN
    });

    const spawns = this.find(FIND_MY_SPAWNS);
    for (const spawn of spawns) {
        if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            return true;
        }
    }

    return false;
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

Room.prototype.isValidPosition = function(pos) {
    const room = this;
    const spawn = room.find(FIND_MY_SPAWNS)[0];

    if (!spawn) {
        return true; // No spawn, no need to validate
    }

    const surroundingPositions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    const invalidPositions = surroundingPositions.reduce((count, offset) => {
        const x = spawn.pos.x + offset[0];
        const y = spawn.pos.y + offset[1];
        const isWall = room.getTerrain().get(x, y) === TERRAIN_MASK_WALL;
        const isOccupied = room.lookForAt(LOOK_STRUCTURES, x, y).length > 0 || 
                           room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y).length > 0 ||
                           room.lookForAt(LOOK_STRUCTURES, x, y, { filter: { structureType: STRUCTURE_ROAD }}).length > 0;
        return count + (isWall || isOccupied ? 1 : 0);
    }, 0);

    const isOnRoad = room.lookForAt(LOOK_STRUCTURES, pos).some(structure => structure.structureType === STRUCTURE_ROAD) ||
                     room.lookForAt(LOOK_CONSTRUCTION_SITES, pos).some(site => site.structureType === STRUCTURE_ROAD);

    return invalidPositions < 8 && !isOnRoad; // Return true if not fully surrounded and not on a road
};

Room.prototype.getExpanderPositionsFromPoint = function(center, maxExpanders) {
    const positions = [];
    const terrain = this.getTerrain();
    const directions = [
        [-1, -1], [-1, 1], 
        [1, -1], [1, 1],
        [0, 0]
    ];
    
    for (const dir of directions) {
        const x = center.x + dir[0];
        const y = center.y + dir[1];
        if (terrain.get(x, y) !== TERRAIN_MASK_WALL && this.isValidPosition(new RoomPosition(x, y, this.name))) {
            positions.push(new RoomPosition(x, y, this.name));
        }
    }
    return positions.slice(0, maxExpanders); // Limit to maxExpanders
};
//#endregion
