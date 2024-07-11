const { DEBUGGING } = require('constants');

Creep.prototype.states = {
    ATTACK: '⚔️',
    BUILD_EXTENSIONS: '🚧🔋',
    BUILD_ROADS: '🚧🛣️',
    BUILD_SPAWN: '🚧🏠',
    BUILD_STORAGE: '🚧📦',
    BUILD_LINK: '🚧↔️',
    BUILD_TRANSFER: '🚧🛜',
    CHARGE_STORAGE: '📦',
    CHARGE_LINK: '↔️',
    CHARGE_TRANSFER: '🛜',
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
        this.moveTo(exit, { visualizePathStyle: { stroke: '#ffffff' } });
        return true;
    }
    return false;
};

Creep.prototype.moveToFlag = function(flagName) {
    const flag = Game.flags[flagName];
    
    if (!flag) {
        console.log(`${this.name} could not find flag: ${flagName}`);
        return ERR_INVALID_TARGET;
    }
    
    const moveResult = this.moveTo(flag, { visualizePathStyle: { stroke: '#ffffff' } });
    
    switch (moveResult) {
        case OK:
            console.log(`${this.name} is moving to flag: ${flagName}`);
            break;
        case ERR_TIRED:
            console.log(`${this.name} is tired.`);
            break;
        case ERR_NO_PATH:
            console.log(`${this.name} could not find a path to flag: ${flagName}`);
            break;
        case ERR_INVALID_TARGET:
            console.log(`${this.name} received an invalid target while trying to move to flag: ${flagName}`);
            break;
        case ERR_NO_BODYPART:
            console.log(`${this.name} does not have a MOVE body part.`);
            break;
        default:
            console.log(`${this.name} encountered an unknown error (${moveResult}) while moving to flag: ${flagName}`);
            break;
    }

    return moveResult;
};
