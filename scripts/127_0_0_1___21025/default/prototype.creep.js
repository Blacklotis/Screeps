const { MAX_WAIT_TICKS, DEBUGGING } = require('constants');

const states = {
    ATTACKING: '⚔️',
    BUILDING: '🚧',
    FUEL_CONTROLLER: '⚡',
    FUEL_EXTENSIONS: '🔋',
    FUEL_SPAWN: '🏠',
    HARVEST_ENERGY: '🌽',
    HEALING: '❤️‍🩹',
    IDLE: '❌',
    REPAIRING: '🔧',
    UPGRADING: '⚡',
};

Creep.prototype.states = states;

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
    var source = this.pos.findClosestByPath(FIND_SOURCES);
    if (this.harvest(source) == ERR_NOT_IN_RANGE) {
        this.moveTo(source);
    }
    //this.memory.lastSourceId = source.id;
    //this.memory.waitTicks = 0;
    return true;
};

Creep.prototype.getCloserSource = function(source1, source2, ourPosition) {
    return ourPosition.getRangeTo(source1.pos) < ourPosition.getRangeTo(source2.pos) ? source1 : source2;
};

Creep.prototype.clearUnusedRoadConstructionSites = function() {
    const constructionSites = this.room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_ROAD && site.progress === 0
    });

    for (const site of constructionSites) {
        site.remove();
    }
};
