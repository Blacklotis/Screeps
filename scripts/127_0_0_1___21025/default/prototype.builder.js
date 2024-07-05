const { MAX_WAIT_TICKS } = require('constants');

Creep.prototype.buildAllPlannedRoads = function(shouldBuildTunnels) {
    const terrain = this.room.getTerrain();

    const roadConstructionSites = this.room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_ROAD
    });

    if (roadConstructionSites.length > 0) {
        var target;

        if (shouldBuildTunnels) {
            target = this.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => site.structureType === STRUCTURE_ROAD
            });
        } else {
            const terrainType = terrain.get(site.pos.x, site.pos.y);
            target = this.pos.findClosestByPath(roadConstructionSites, {
                filter: (site) => terrainType !== TERRAIN_MASK_WALL
                && terrainType !== TERRAIN_MASK_SWAMP
            });
        } 

        if (target && this.build(target) === ERR_NOT_IN_RANGE) {
            this.moveTo(target);
        }
        return true;
    }

    return false;
};

Creep.prototype.repairStructuresTask = function() {
    var target = this.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax
    });
    if (target && this.repair(target) == ERR_NOT_IN_RANGE) {
        this.moveTo(target);
        return true;
    }
    return false;
};

const builderPrototype = {
    serviceController: function(creep) {
        var controller = creep.room.controller;

        if (controller) {
            if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller);
                creep.say('⚡');
            }
            return true;
        }
        return false;
    },

    buildRoadsTask: function(creep) {
        if (this.buildAllPlannedRoads(creep)) {
            creep.say('🚧🛣️');
            return true;
        }
        return false;
    },

    buildExtensionsTask: function(creep) {
        var spawn = creep.room.find(FIND_MY_SPAWNS)[0];
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
                    creep.say('🚧x');
                }
                return true;
            } else {
                creep.createExtensionNearLocation(spawn.pos, 1);
                creep.say('🚧x');
                return true;
            }
        }
        return false;
    },

    buildOtherConstructionSitesTask: function(creep) {
        var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if (constructionSite) {
            if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                creep.moveTo(constructionSite);
                creep.say('🚧');
            }
            return true;
        }
        return false;
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
