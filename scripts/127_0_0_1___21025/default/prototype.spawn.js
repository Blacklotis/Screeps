const { 
    BODY_CONFIGURATION, 
    DEBUGGING, 
    MIN_HARVESTERS, 
    MIN_BUILDERS, 
    MIN_FIGHTERS, 
    MIN_HEALERS,
    MIN_PRIEST,
    HARVESTER,
    PRIEST,
    BUILDER,
    FIGHTER,
    HEALER
} = require('constants');
const { initial } = require('lodash');
require('prototype.harvester');

StructureSpawn.prototype.getRoomLevel = function() {
    return this.room.controller.level;
};

StructureSpawn.prototype.manageSpawning = function() {
    if (this.spawning) {
        this.clearDeadCreepMemory();
        var spawningCreep = Game.creeps[this.spawning.name];
        this.room.visual.text(
            '🛠️ ' + spawningCreep.memory.role,
            this.pos.x - 2,
            this.pos.y + 3,
            { align: 'bottom', opacity: 0.8 }
        );
    } else {
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == HARVESTER.toLowerCase());
        var healers = _.filter(Game.creeps, (creep) => creep.memory.role == HEALER.toLowerCase());
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == BUILDER.toLowerCase());
        var fighters = _.filter(Game.creeps, (creep) => creep.memory.role == FIGHTER.toLowerCase());
        var priests = _.filter(Game.creeps, (creep) => creep.memory.role == PRIEST.toLowerCase());

        var roomLevel = this.getRoomLevel();
        
        if (harvesters.length < MIN_HARVESTERS) {
            var newCreepName = HARVESTER;
            var newCreepBody = BODY_CONFIGURATION.HARVESTER[roomLevel - 1];
        } else if (builders.length <= MIN_BUILDERS) {
            var newCreepName = BUILDER;
            var newCreepBody = BODY_CONFIGURATION.BUILDER[roomLevel - 1];
        } else if (fighters.length < MIN_FIGHTERS) {
            var newCreepName = FIGHTER;
            var newCreepBody = BODY_CONFIGURATION.FIGHTER[roomLevel - 1];
        } else if (priests.length < MIN_PRIEST) {
            var newCreepName = PRIEST;
            var newCreepBody = BODY_CONFIGURATION.PRIEST[roomLevel - 1];
        }

        if (newCreepName && newCreepBody) {
            console.log(`Spawning new${newCreepName}: level ${roomLevel}`);
            this.spawnCustomCreep(newCreepBody, newCreepName, newCreepName.toLowerCase(), true);
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

StructureSpawn.prototype.spawnCustomCreep = function(bodyParts, baseName, role, shouldRally, targetRoom) {
    var newCreepName = this.generateUniqueName(baseName);
    if (!targetRoom){
        targetRoom = this.room;
    }
    if (shouldRally) {
        var result = this.spawnCreep(bodyParts, newCreepName, {memory: {role: role, initial: this.room.findRallyPoint(), targetRoom: targetRoom}});
    } else {
        var result = this.spawnCreep(bodyParts, newCreepName, {memory: {role: role, targetRoom: targetRoom}});
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