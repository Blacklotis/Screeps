const { MIN_HARVESTERS, MIN_BUILDERS, MIN_FIGHTERS, MIN_HEALERS, HARVESTER_TIERS, BUILDER_TIERS } = require('constants');

StructureSpawn.prototype.manageSpawning = function() {
    if (this.spawning) {
        var spawningCreep = Game.creeps[this.spawning.name];
        this.room.visual.text(
            '🛠️ ' + spawningCreep.memory.role,
            this.pos.x + 1,
            this.pos.y,
            { align: 'bottom', opacity: 0.8 }
        );
    } else {
        this.clearDeadCreepMemory();
        if (this.spawning == null) {
            var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
            var healers = _.filter(Game.creeps, (creep) => creep.memory.role == 'healer');
            var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
            var fighters = _.filter(Game.creeps, (creep) => creep.memory.role == 'fighter');

            if (harvesters.length < MIN_HARVESTERS) {
                this.spawnCustomCreep([WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 'Harvester', 'harvester');
            } else if (builders.length <= MIN_BUILDERS) {
                this.spawnCustomCreep([WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 'Builder', 'builder');
            } else if (fighters.length < MIN_FIGHTERS) {
                this.spawnCustomCreep([ATTACK, MOVE], 'Fighter', { role: 'fighter', waitTicks: 0, lastSourceId: null });
            } else if (healers.length < MIN_HEALERS) {
                this.spawnCustomCreep([WORK, HEAL, MOVE], 'Healer', 'harvester');
            } 
        }
    }
};

StructureSpawn.prototype.clearDeadCreepMemory = function() {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing dead creep memory:', name);
        }
    }
};

StructureSpawn.prototype.getExtensions = function() {
    return this.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    });
};


StructureSpawn.prototype.getLargestTier = function(tiers, energyAvailable) {
    if (!Array.isArray(tiers)) {
        throw new Error('tiers must be an array');
    }

    for (let i = tiers.length - 1; i >= 0; i--) {
        if (!Array.isArray(tiers[i])) {
            throw new Error('Each tier must be an array');
        }
        const tierCost = tiers[i].reduce((sum, part) => sum + BODYPART_COST[part], 0);
        if (energyAvailable >= tierCost) {
            return tiers[i];
        }
    }
    return null;  // No tier can be afforded, though this should not happen
};

StructureSpawn.prototype.spawnCustomCreep = function(bodyParts, baseName, role) {
    var newCreepName = this.generateUniqueName(baseName);
    var result = this.spawnCreep(bodyParts, newCreepName, {memory: {role: role, waitTicks: 0, lastSourceId: null}});

    switch(result) {
        case OK:
            console.log(`Spawning new ${role}: ${newCreepName}`);
            break;
        case ERR_NOT_OWNER:
            console.log('You are not the owner of this spawn.');
            break;
        case ERR_NO_PATH:
            console.log('No path to the spawn.');
            break;
        case ERR_NAME_EXISTS:
            console.log('A creep with the name ' + newCreepName + ' already exists.');
            break;
        case ERR_BUSY:
            console.log('The spawn is already spawning another creep.');
            break;
        case ERR_NOT_ENOUGH_ENERGY:
            console.log('The spawn does not have enough energy.');
            console.log(`${this.room.energyAvailable}/${this.room.energyCapacityAvailable} : ${bodyParts.reduce((total, part) => total + BODYPART_COST[part], 0)}`);
            break;
        case ERR_INVALID_ARGS:
            console.log('Invalid arguments passed to spawnCreep.');
            console.log(`bodyParts: ${JSON.stringify(bodyParts)}`);
            console.log(`baseName: ${baseName}`);
            console.log(`role: ${role}`);
            break;
        case ERR_RCL_NOT_ENOUGH:
            console.log('The Room Controller level is not high enough to spawn this creep.');
            break;
        default:
            console.log('An unknown error occurred while trying to spawn a creep.');
            break;
    }

    return result;
};



StructureSpawn.prototype.generateUniqueName = function(baseName) {
    return baseName + '_' + Game.time.toString();
};

