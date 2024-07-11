var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleFighter = require('role.fighter');
var roleHealer = require('role.healer');
var roleTower = require('role.tower');
var rolePriest = require('role.priest');
require('prototype.spawn');
require('prototype.room');
require('prototype.roomPosition');
const metrics = require('metrics');
const { 
    DEBUGGING, 
    HARVESTER,
    PRIEST,
    BUILDER,
    FIGHTER,
    HEALER
} = require('constants');

module.exports.loop = function () {

    // Initialize state for all creeps if not already set
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (!creep.memory.state) {
            creep.memory.state = '🌽';
        }
    }

    for (const name in Game.rooms) {
        const room = Game.rooms[name];
        //room.logMetrics();
        //room.createPathToExit(FIND_EXIT_LEFT);
        //room.overlayBuildableCheckerboardPositions();
        //room.clearPlannedPower();
        //room.planPower(2);
        //room.clearRoadConstruction();
        //room.planRoads();
        //room.createConstructionSite(12, 45, STRUCTURE_ROAD)
        //room.planSpawnConstruction();
    }
    
    // Creep logic
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == HARVESTER) {
            roleHarvester.run(creep);
        } else if (creep.memory.role == BUILDER) {
            roleBuilder.run(creep);
        } else if (creep.memory.role == FIGHTER) {
            roleFighter.run(creep);
        } else if (creep.memory.role == HEALER) {
            roleHealer.run(creep);
        }else if (creep.memory.role == PRIEST) {
            rolePriest.run(creep);
        }
    }

    // Spawn logic
    var spawns = _.filter(Game.spawns, (spawn) => true);
    for (var i in spawns) {
        spawns[i].manageSpawning();
    }

    // Tower logic
    var towers = _.filter(Game.structures, (s) => s.structureType == STRUCTURE_TOWER);
    for (var tower of towers) {
        roleTower.run(tower);
    }
};
