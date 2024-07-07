const { MIN_HARVESTERS, MIN_BUILDERS, MIN_FIGHTERS, MIN_HEALERS, MIN_PRIEST,DEBUGGING} = require('constants');
const { initial } = require('lodash');
const HARVESTER = 'Harvester';
const BUILDER = 'Builder';
const FIGHTER = 'Fighter';
const PRIEST = 'Priest';

StructureSpawn.prototype.manageSpawning = function() {
    if (this.spawning) {

        // This is a good time to check for things that have died.
        this.clearDeadCreepMemory();
        var spawningCreep = Game.creeps[this.spawning.name];
        this.room.visual.text(
            '🛠️ ' + spawningCreep.memory.role,
            this.pos.x - 2,
            this.pos.y + 3,
            { align: 'bottom', opacity: 0.8 }
        );
    } else {

        if (this.spawning == null) {
            var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == HARVESTER.toLowerCase());
            var healers = _.filter(Game.creeps, (creep) => creep.memory.role == PRIEST.toLowerCase());
            var builders = _.filter(Game.creeps, (creep) => creep.memory.role == BUILDER.toLowerCase());
            var fighters = _.filter(Game.creeps, (creep) => creep.memory.role == FIGHTER.toLowerCase());
            var priests = _.filter(Game.creeps, (creep) => creep.memory.role == PRIEST.toLowerCase());
            
            if (harvesters.length < MIN_HARVESTERS) {
                var newCreepName = HARVESTER;
                var newCreepBody = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
            } else if (builders.length <= MIN_BUILDERS) {
                var newCreepName = BUILDER;
                var newCreepBody = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
            } else if (fighters.length < MIN_FIGHTERS) {
                var newCreepName = FIGHTER;
                var newCreepBody = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, 
                    ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, 
                    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
            } else if (priests.length < MIN_PRIEST) {
                var newCreepName = PRIEST;
                var newCreepBody = [CLAIM, CLAIM, MOVE, MOVE];
            }
            
            if (newCreepName && newCreepBody) {
                console.log(`Spawning new ${newCreepName}: ${JSON.stringify(newCreepBody)}`);
                this.spawnCustomCreep(newCreepBody, newCreepName, newCreepName.toLowerCase(), true);
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

StructureSpawn.prototype.spawnCustomCreep = function(bodyParts, baseName, role, shouldRally) {
    var newCreepName = this.generateUniqueName(baseName);

    if (shouldRally) {
        const rallyPoint = this.room.findRallyPoint();
        var result = this.spawnCreep(bodyParts, newCreepName, {memory: {role: role, initial: rallyPoint}});
    } else {
        var result = this.spawnCreep(bodyParts, newCreepName, {memory: {role: role}});
    }

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
            console.log(`Next Creep: ${bodyParts.reduce((total, part) => total + BODYPART_COST[part], 0)}`);
            console.log(`Spawn Charging: ${this.room.energyAvailable}/${this.room.energyCapacityAvailable}`);
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

StructureSpawn.prototype.makeHarvester = function() {
    let availableEnergy = this.room.energyAvailable;
    let remainingEnergy = availableEnergy;
    let body = [];
    let workCount = 0;
    let carryCount = 0;
    let moveCount = 0;

    // Sort the body parts: WORK -> CARRY -> MOVE
    body.sort((a, b) => {
        if (a === WORK && b !== WORK) return -1;
        if (a === CARRY && b === MOVE) return -1;
        if (a === MOVE && b !== MOVE) return 1;
        if (a === b) return 0;
        return 0;
    });

    return body;
};

StructureSpawn.prototype.makeBuilder = function() {
    let availableEnergy = this.room.energyAvailable;
    let remainingEnergy = availableEnergy;
    let body = [];
    let workCount = 0;
    let carryCount = 0;

    body.sort((a, b) => {
        if (a === WORK && b !== WORK) return -1;
        if (a === CARRY && b === MOVE) return -1;
        if (a === MOVE && b !== MOVE) return 1;
        return 0;
    });

    return body;
};

function calculateRequiredMoveParts(body) {
    let nonMoveParts = body.length - body.filter(part => part === MOVE).length;
    return Math.ceil(nonMoveParts / 2);
}