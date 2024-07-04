const { MAX_WAIT_TICKS } = require('constants');

const builderPrototype = {
    performConstructionTasks: function(creep) {
        var spawn = creep.room.find(FIND_MY_SPAWNS)[0];
        var controller = creep.room.controller;

        // Priority: Upgrade controller if it is close to downgrading
        if (controller && controller.ticksToDowngrade < 10000) {
            if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller);
                creep.say('⚡');
            }
            return;
        }

        // Task 1: Highest priority - Get energy if needed
        if (creep.store.getFreeCapacity() > 0) {
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (source) {
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                    creep.say('🔄');
                }
            }
            return;
        }

        // Task 2: Build all planned roads in the room
        if (this.buildAllPlannedRoads(creep)) {
            creep.say('🚧🛣️');
            return;
        }

        // Task 3: Prioritize building extensions only if there are no roads to be built
        var maxExtensions = this.getMaxExtensions(creep.room.controller.level);
        var existingExtensions = creep.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        }).length;
        var extensionConstructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        }).length;

        if (existingExtensions + extensionConstructionSites < maxExtensions) {
            var extensionConstructionSite = spawn.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
                filter: (site) => site.structureType == STRUCTURE_EXTENSION
            });
            if (extensionConstructionSite) {
                if (creep.build(extensionConstructionSite) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(extensionConstructionSite);
                    creep.say('🔋');
                }
                return;
            } else {
                creep.createExtensionNearLocation(spawn.pos, 1);
                creep.say('🚧🔋');
                return;
            }
        }

        // Task 4: If no extensions, try to build other construction sites
        var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if (constructionSite) {
            if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                creep.moveTo(constructionSite);
                creep.say('🚧');
            }
            return;
        }

        // Task 5: If no construction sites, try to repair structures
        var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (target && creep.repair(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
            creep.say('🔧');
            return;
        }

        // Default action if no other tasks are found
        creep.say('🛑');
    },

    buildAllPlannedRoads: function(creep) {
        const terrain = creep.room.getTerrain();

        // Find all road construction sites in the room
        const roadConstructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, {
            filter: (site) => site.structureType === STRUCTURE_ROAD
        });

        if (roadConstructionSites.length > 0) {
            const target = creep.pos.findClosestByPath(roadConstructionSites, {
                filter: (site) => terrain.get(site.pos.x, site.pos.y) !== TERRAIN_MASK_WALL // Avoid wall terrain
            });

            if (target && creep.build(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
            return true; // Builder is working on roads
        }

        return false; // No road construction sites to build
    },

    buildRoad: function(creep, fromPos, toPos) {
        const terrain = creep.room.getTerrain();
        const path = creep.room.findPath(fromPos, toPos, {
            ignoreCreeps: true,
            ignoreRoads: true
        });

        for (const step of path) {
            const pos = new RoomPosition(step.x, step.y, creep.room.name);
            const cost = terrain.get(step.x, step.y) === TERRAIN_MASK_SWAMP ? 5 : 1;

            if (terrain.get(step.x, step.y) !== TERRAIN_MASK_WALL && cost < 50) { // Avoid wall terrain and high-cost tiles
                const structures = pos.lookFor(LOOK_STRUCTURES);
                const constructionSites = pos.lookFor(LOOK_CONSTRUCTION_SITES);

                if (structures.length === 0 && constructionSites.length === 0) {
                    pos.createConstructionSite(STRUCTURE_ROAD);
                    return true; // Road construction site created
                }
            }
        }
        return false; // No road construction site created
    },

    getMaxExtensions: function(controllerLevel) {
        const extensionLimits = {
            1: 0,
            2: 5,
            3: 10,
            4: 20,
            5: 30,
            6: 40,
            7: 50,
            8: 60
        };
        return extensionLimits[controllerLevel] || 0;
    }
};

module.exports = builderPrototype;
