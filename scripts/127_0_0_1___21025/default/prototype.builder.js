const { MAX_WAIT_TICKS } = require('constants');

const builderPrototype = {
    performConstructionTasks: function(creep) {
        var spawn = creep.room.find(FIND_MY_SPAWNS)[0];
        var controller = creep.room.controller;

        // Task 1: Prioritize upgrading controller at level 1 or below
        if (controller && controller.level <= 1) {
            if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller);
                creep.say('⚡');
            }
            return;
        }

        // Task 2: Build roads between the current source and spawn
        var source = Game.getObjectById(creep.memory.lastSourceId);
        if (source && this.buildRoad(creep, source.pos, spawn.pos)) {
            creep.say('🚧🛣️');
            return;
        }

        // Task 4: Prioritize building extensions only if there are no roads to be built
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
                    creep.say('🚧ex');
                }
                return;
            } else {
                creep.createExtensionNearLocation(spawn.pos, 1);
                creep.say('🚧ex');
                return;
            }
        }

        // Task 5: If no extensions, try to build other construction sites
        var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if (constructionSite) {
            if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                creep.moveTo(constructionSite);
                creep.say('🚧');
            }
            return;
        }

        // Task 6: If no construction sites, try to repair structures
        var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (target && creep.repair(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
            creep.say('🔧');
            return;
        }

        // If no tasks are found, say an error message
        creep.say('❌');
        var closestSource = creep.pos.findClosestByPath(FIND_SOURCES);
        if (closestSource) {
            var positions = [
                new RoomPosition(creep.pos.x + 2, creep.pos.y, creep.room.name),
                new RoomPosition(creep.pos.x - 2, creep.pos.y, creep.room.name),
                new RoomPosition(creep.pos.x, creep.pos.y + 2, creep.room.name),
                new RoomPosition(creep.pos.x, creep.pos.y - 2, creep.room.name)
            ];
            for (var pos of positions) {
                if (pos.getRangeTo(closestSource) > 3) {
                    creep.moveTo(pos);
                    break;
                }
            }
        }
    },

    buildRoad: function(creep, fromPos, toPos) {
        var path = creep.room.findPath(fromPos, toPos, {
            ignoreCreeps: true,
            ignoreRoads: true
        });
        for (var j in path) {
            var pos = new RoomPosition(path[j].x, path[j].y, creep.room.name);
            var structures = pos.lookFor(LOOK_STRUCTURES);
            var constructionSites = pos.lookFor(LOOK_CONSTRUCTION_SITES);
            if (structures.length == 0 && constructionSites.length == 0) {
                pos.createConstructionSite(STRUCTURE_ROAD);
                return true; // Road construction site created
            }
        }
        return false; // No new road construction site created
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
