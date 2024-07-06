const { DEBUGGING } = require('constants');

Creep.prototype.buildRoads = function(shouldBuildTunnels) {
    const terrain = this.room.getTerrain();

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

Creep.prototype.repairStructures = function() {
    var target = this.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax
    });
    if (target && this.repair(target) == ERR_NOT_IN_RANGE) {
        this.moveTo(target);
        return true;
    }
    return false;
};

Creep.prototype.buildExtensions = function() {
    const expansionSites = this.room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_EXTENSION
    });

    if (expansionSites.length > 0) {
        const target = this.pos.findClosestByPath(expansionSites);

        if (target && this.build(target) === ERR_NOT_IN_RANGE) {
            this.moveTo(target);
        }
        return true;
    }

    return false;
};