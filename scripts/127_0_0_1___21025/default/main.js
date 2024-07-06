var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleFighter = require('role.fighter');
var roleHealer = require('role.healer');
var roleTower = require('role.tower');
require('prototype.spawn');
require('prototype.room');
const { DEBUGGING, OVERLAY_ROAD_CONSTRUCTION, MIN_HARVESTERS, MIN_BUILDERS, MIN_FIGHTERS, MIN_HEALERS } = require('constants');

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
        room.planExpanders();
        //room.clearPlannedExpanders();
        //room.planRoadConstruction();
        //room.clearRoadConstruction();
    }
    
    // Creep logic
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        } else if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        } else if (creep.memory.role == 'fighter') {
            roleFighter.run(creep);
        } else if (creep.memory.role == 'healer') {
            roleHealer.run(creep);
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
