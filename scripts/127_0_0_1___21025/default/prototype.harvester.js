const { DEBUGGING } = require('constants');

const bodyConfiguration = {
    1: [WORK, WORK, CARRY, MOVE],
    2: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
    3: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    4: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
};

Creep.prototype.chargeSpawn = function() {
    var spawn = this.room.find(FIND_MY_SPAWNS)[0];
    if (this.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.moveTo(spawn);
        return true;
    } 
    return false;
}

Creep.prototype.chargeExtensions = function() {
    var extensions = [];
    for (var spawnName in Game.spawns) {
        extensions = extensions.concat(Game.spawns[spawnName].getExtensions());
    }

    for (var i in extensions) {
        if (extensions[i].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            if (this.transfer(extensions[i], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(extensions[i]);
            }
            return true;
        }
    }
    return false;
}

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