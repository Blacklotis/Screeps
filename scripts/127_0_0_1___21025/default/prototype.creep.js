const { DEBUGGING } = require('constants');

Creep.prototype.bodypartCosts = {
    TOUGH: 10,
    MOVE: 50,
    CARRY: 50,
    HEAL: 50,
    ATTACK: 80,
    WORK: 100,
    RANGED_ATTACK: 150,
    CLAIM: 600,
};

Creep.prototype.states = {
    ATTACK: '⚔️',
    BUILD_EXTENSIONS: '🚧🔋',
    BUILD_ROADS: '🚧🛣️',
    BUILD_SPAWN: '🚧🏠',
    CHARGE_CONTROLLER: '⚡',
    CHARGE_EXTENSIONS: '🔋',
    CHARGE_SPAWN: '🏠',
    CONVERT: '✝️',
    HARVEST_ENERGY: '🌽',
    HEALING: '❤️‍🩹',
    IDLE: '❌',
    REPAIRING: '🔧',
    STAGING: '🏃',
    UPGRADING: '⚡',
};

Creep.prototype.calculateRequiredMoveParts = function(body) {
    let fatigue = 0;

    body.forEach(part => {
        if (part !== MOVE) {
            fatigue += FATIGUE_GENERATED_BY_PART[part];
        }
    });

    return Math.ceil(fatigue / -FATIGUE_GENERATED_BY_PART.MOVE);
};

Creep.prototype.idle = function() {
    const rallyPoint = this.room.findRallyPoint();
    if (rallyPoint) {
        this.moveTo(rallyPoint);
        return true;
    }

    return false;
}

Creep.prototype.talk = function() {
    if (this.memory.state && this.states[this.memory.state]) {
        this.say(this.states[this.memory.state]);
    } else {
        console.log(JSON.stringify(this.memory));
    }
};

Creep.prototype.harvestEnergy = function() {
    var source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (source) {
        if (this.harvest(source) == ERR_NOT_IN_RANGE) {
            this.moveTo(source);
        }
        return true;
    }
};

Creep.prototype.getCloserSource = function(source1, source2, ourPosition) {
    return ourPosition.getRangeTo(source1.pos) < ourPosition.getRangeTo(source2.pos) ? source1 : source2;
};

Creep.prototype.chargeController = function() {
    var controller = this.room.controller;

    if (controller) {
        if (this.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            this.moveTo(controller);
        }
        return true;
    }
    return false;
};

Creep.prototype.moveToRoom = function(targetRoom) {
    if (this.room.name !== targetRoom) {
        const exitDir = this.room.findExitTo(targetRoom);
        const exit = this.pos.findClosestByRange(exitDir);
        this.moveTo(exit, { visualizePathStyle: { stroke: '#ff0000' } });
    }
};