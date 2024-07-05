const { DEBUGGING } = require('constants');
require('prototype.creep');

Creep.prototype.fuelController = function() {
    var controller = this.room.controller;

    if (controller) {
        if (this.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            this.moveTo(controller);
        }
        return true;
    }
    return false;
};

Creep.prototype.fuelSpawn = function() {
    var spawn = this.room.find(FIND_MY_SPAWNS)[0];
    if (this.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.moveTo(spawn);
        return true;
    } 
    return false;
}

Creep.prototype.fuelExtensions = function() {
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

Creep.prototype.extensionsNeedEnergy = function() {
    var extensions = this.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION) &&
                   structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });

    return extensions.length > 0;
};
