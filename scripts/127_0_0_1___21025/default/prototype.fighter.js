const { DEBUGGING } = require('constants');

Creep.prototype.attackSpawn = function() {
    if (target) {
        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
            return true;
        }
    }
    return false;
}

Creep.prototype.clearRoom = function() {
    const target = this.pos.findClosestByPath(FIND_HOSTILE_CREEPS) || this.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
    if (target) {
        if (this.attack(target) === ERR_NOT_IN_RANGE) {
            this.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
        }
    }
};

Room.prototype.getFighterWorkSpawn = function() {
    return this.find(FIND_HOSTILE_SPAWNS).length > 0;
};