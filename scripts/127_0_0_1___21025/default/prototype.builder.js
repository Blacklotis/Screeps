const { DEBUGGING } = require('constants');

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

Creep.prototype.buildLinks = function() {
    const linkSites = this.room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_LINK
    });

    if (linkSites.length > 0) {
        const target = this.pos.findClosestByPath(linkSites);

        if (target && this.build(target) === ERR_NOT_IN_RANGE) {
            this.moveTo(target);
        }
        return true;
    }

    return false;
};

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

Creep.prototype.buildStorage = function() {
    const storageSites = this.room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_STORAGE
    });

    if (storageSites.length > 0) {
        const target = this.pos.findClosestByPath(storageSites);

        if (target && this.build(target) === ERR_NOT_IN_RANGE) {
            this.moveTo(target);
        }
        return true;
    }

    return false;
};

Creep.prototype.buildTransfers = function() {
    const transferSites = this.room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_CONTAINER
    });

    if (transferSites.length > 0) {
        const target = this.pos.findClosestByPath(transferSites);

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

Room.prototype.getBuilderWorkExtensions = function()
{
    return this.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_EXTENSION
    }).length > 0;
}

Room.prototype.getBuilderWorkLinks = function() {
    return this.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_LINK
    }).length > 0;
};

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

Room.prototype.getBuilderWorkStorage = function() {
    return this.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_STORAGE
    }).length > 0;
};

Room.prototype.getBuilderWorkTransfers = function() {
    return this.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_CONTAINER
    }).length > 0;
};
