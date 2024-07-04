const { MAX_WAIT_TICKS } = require('constants');

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

Creep.prototype.createExtensionNearLocation = function(location, radius) {
    var positions = [];
    for (var dx = -radius; dx <= radius; dx++) {
        for (var dy = -radius; dy <= radius; dy++) {
            if (dx !== 0 || dy !== 0) {
                positions.push({x: location.x + dx, y: location.y + dy});
            }
        }
    }

    for (var pos of positions) {
        if (this.room.createConstructionSite(pos.x, pos.y, STRUCTURE_EXTENSION) == OK) {
            return true;
        }
    }
    return false;
};

Creep.prototype.idle = function(creep){
        // Stay near the spawn
        var waitArea = [
            {x: spawn.pos.x - 1, y: spawn.pos.y - 1},
            {x: spawn.pos.x, y: spawn.pos.y - 1},
            {x: spawn.pos.x + 1, y: spawn.pos.y - 1},
            {x: spawn.pos.x - 1, y: spawn.pos.y},
            {x: spawn.pos.x + 1, y: spawn.pos.y},
            {x: spawn.pos.x - 1, y: spawn.pos.y + 1},
            {x: spawn.pos.x, y: spawn.pos.y + 1},
            {x: spawn.pos.x + 1, y: spawn.pos.y + 1}
        ];
        var pos = waitArea[Math.floor(Math.random() * waitArea.length)];
        this.moveTo(pos.x, pos.y);
}

Creep.prototype.harvestEnergy = function(creep) {
    var source = creep.pos.findClosestByPath(FIND_SOURCES);

    if (source) {
        creep.checkWaitTicks(source.id);

        if (creep.memory.waitTicks > MAX_WAIT_TICKS) {
            // Find a new source if the builder has been waiting for more than MAX_WAIT_TICKS
            var sources = creep.room.find(FIND_SOURCES);
            for (var i in sources) {
                if (sources[i].id != creep.memory.lastSourceId) {
                    source = sources[i];
                    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source);
                        creep.say('🔄');
                    }
                    creep.memory.waitTicks = 0;
                    creep.memory.lastSourceId = source.id;
                    return;
                }
            }
        } else {
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
                creep.say('🔄');
            }
            creep.memory.lastSourceId = source.id;
            creep.memory.waitTicks = 0;
        }
    }
};

Creep.prototype.getClosestSource = function(source1, source2, targetPos) {
    const range1 = targetPos.getRangeTo(source1.pos);
    const range2 = targetPos.getRangeTo(source2.pos);
    return range1 < range2 ? source1 : source2;
};


Creep.prototype.clearUnusedRoadConstructionSites = function() {
    const constructionSites = this.room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_ROAD && site.progress === 0
    });

    for (const site of constructionSites) {
        site.remove();
    }
};
