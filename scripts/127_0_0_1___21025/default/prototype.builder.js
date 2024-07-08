const { DEBUGGING } = require('constants');

Creep.prototype.buildRoads = function() {
    const roadSites = this.room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_ROAD
    });

    if (roadSites.length > 0) {
        const target = this.pos.findClosestByPath(roadSites);

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

Room.prototype.getBuilderWorkExtensions = function()
{
    return this.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_EXTENSION
    }).length > 0;
}

Room.prototype.getBuilderWorkRepair = function() {
    return this.find(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax
    }).length > 0;
};

Room.prototype.getBuilderWorkRoads = function() {
    return this.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_ROAD
    }).length > 0;
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