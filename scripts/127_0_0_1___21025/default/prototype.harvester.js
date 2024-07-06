const { DEBUGGING } = require('constants');

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
