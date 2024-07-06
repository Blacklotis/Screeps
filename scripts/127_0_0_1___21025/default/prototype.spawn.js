const { MIN_HARVESTERS, MIN_BUILDERS, MIN_FIGHTERS, MIN_HEALERS, HARVESTER_TIERS, BUILDER_TIERS } = require('constants');

const HARVESTER = 'Harvester';
const BUILDER = 'Builder';

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
            var healers = _.filter(Game.creeps, (creep) => creep.memory.role == 'healer');
            var builders = _.filter(Game.creeps, (creep) => creep.memory.role == BUILDER.toLowerCase());
            var fighters = _.filter(Game.creeps, (creep) => creep.memory.role == 'fighter');
            
            if (harvesters.length < MIN_HARVESTERS) {
                var newCreepName = HARVESTER;
                var newCreepBody = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
            } else if (builders.length <= MIN_BUILDERS) {
                var newCreepName = BUILDER;
                var newCreepBody = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
            }
            
            if (newCreepName && newCreepBody) {
                console.log(`Spawning new ${newCreepName}: ${JSON.stringify(newCreepBody)}`);
                this.spawnCustomCreep(newCreepBody, newCreepName, newCreepName.toLowerCase());
            }
            
            /* else if (fighters.length < MIN_FIGHTERS) {
                this.spawnCustomCreep(
                    [ATTACK, MOVE], 
                    'Fighter', 
                    { role: 'fighter', waitTicks: 0, lastSourceId: null });
            } else if (healers.length < MIN_HEALERS) {
                this.spawnCustomCreep(
                    [WORK, HEAL, MOVE], 
                    'Healer', 
                    'harvester');
            }  */
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

    // Ensure the base case of at least one WORK, one CARRY, and one MOVE part
    if (remainingEnergy >= BODYPART_COST[WORK] + BODYPART_COST[CARRY] + BODYPART_COST[MOVE]) {
        body.push(WORK);
        remainingEnergy -= BODYPART_COST[WORK];
        workCount++;

        body.push(CARRY);
        remainingEnergy -= BODYPART_COST[CARRY];
        carryCount++;

        body.push(MOVE);
        remainingEnergy -= BODYPART_COST[MOVE];
        moveCount++;
    }

    // Prioritize adding CARRY parts, with at least twice as many CARRY parts as WORK parts
    while (remainingEnergy >= BODYPART_COST[CARRY] + BODYPART_COST[WORK] + 2 * BODYPART_COST[MOVE] && body.length < 50) {
        if (carryCount < 2 * workCount) {
            body.push(CARRY);
            remainingEnergy -= BODYPART_COST[CARRY];
            carryCount++;
        } else {
            body.push(WORK);
            remainingEnergy -= BODYPART_COST[WORK];
            workCount++;
        }
        body.push(MOVE);
        remainingEnergy -= BODYPART_COST[MOVE];
        moveCount++;
    }

    // Ensure the harvester has enough MOVE parts to maintain a balanced ratio
    let movePartsNeeded = calculateRequiredMoveParts(body);
    while (remainingEnergy >= BODYPART_COST[MOVE] && moveCount < movePartsNeeded && body.length < 50) {
        body.push(MOVE);
        remainingEnergy -= BODYPART_COST[MOVE];
        moveCount++;
    }

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

    while (remainingEnergy >= BODYPART_COST[WORK] + BODYPART_COST[CARRY] + 2 * BODYPART_COST[MOVE] && body.length < 50) {
        if (workCount <= carryCount) {
            body.push(WORK);
            remainingEnergy -= BODYPART_COST[WORK];
            workCount++;
        } else {
            body.push(CARRY);
            remainingEnergy -= BODYPART_COST[CARRY];
            carryCount++;
        }
        body.push(MOVE);
        remainingEnergy -= BODYPART_COST[MOVE];
    }

    while (remainingEnergy >= BODYPART_COST[WORK] + BODYPART_COST[MOVE] && body.length < 50) {
        body.push(WORK);
        remainingEnergy -= BODYPART_COST[WORK];
        body.push(MOVE);
        remainingEnergy -= BODYPART_COST[MOVE];
    }

    let movePartsNeeded = calculateRequiredMoveParts(body);
    while (remainingEnergy >= BODYPART_COST[MOVE] && body.filter(part => part === MOVE).length < movePartsNeeded && body.length < 50) {
        body.push(MOVE);
        remainingEnergy -= BODYPART_COST[MOVE];
    }

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
    return Math.ceil(nonMoveParts / 2); // Each MOVE part offsets 2 fatigue
}



