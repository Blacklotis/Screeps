const { MAX_WAIT_TICKS, DEBUGGING } = require('constants');

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
    HARVEST_ENERGY: '🌽',
    HEALING: '❤️‍🩹',
    IDLE: '❌',
    REPAIRING: '🔧',
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

Creep.prototype.checkWaitTicks = function(sourceId) {
    if (!this.memory.waitTicks) {
        this.memory.waitTicks = 0;
    }
    if (!this.memory.lastPos) {
        this.memory.lastPos = this.pos;
    }
    if (!this.memory.lastSourceId || this.memory.lastSourceId !== sourceId) {
        this.memory.lastSourceId = sourceId;
        this.memory.waitTicks = 0;
    }

    let lastPos;
    if (this.memory.lastPos.x !== undefined && this.memory.lastPos.y !== undefined) {
        lastPos = new RoomPosition(this.memory.lastPos.x, this.memory.lastPos.y, this.memory.lastPos.roomName);
    } else {
        lastPos = this.pos;
    }

    if (this.pos.inRangeTo(Game.getObjectById(sourceId), 3)) {
        if (lastPos.isEqualTo(this.pos)) {
            this.memory.waitTicks++;
        } else {
            this.memory.waitTicks = 0;
        }
    } else {
        this.memory.waitTicks = 0;
    }

    this.memory.lastPos = this.pos;

    return this.memory.waitTicks;
};

Creep.prototype.idle = function() {
    this.memory.state = this.states.IDLE;
    this.say(this.states.IDLE);
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
        this.memory.lastSourceId = source.id;
        this.memory.waitTicks = 0;
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