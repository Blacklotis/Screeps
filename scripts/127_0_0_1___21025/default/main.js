var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleFighter = require('role.fighter');
var roleHealer = require('role.healer');
var roleTower = require('role.tower');
require('prototype.spawn');
require('prototype.room');
const { OVERLAY_ROAD_CONSTRUCTION, MIN_HARVESTERS, MIN_BUILDERS, MIN_FIGHTERS, MIN_HEALERS, HARVESTER_TIERS, BUILDER_TIERS } = require('constants');

module.exports.loop = function () {

    //removeAllRoads('W2N5');
    
    // Clear memory of dead creeps
    for (var spawnName in Game.spawns) {
        Game.spawns[spawnName].clearDeadCreepMemory();
    }

    // Initialize state for all creeps if not already set
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (!creep.memory.state) {
            creep.memory.state = '🌽';
        }
    }

    // Draw road construction sites for each room
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        room.drawRoadConstructionSites(OVERLAY_ROAD_CONSTRUCTION);
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

    // Build all roads in each room
    for (let roomName in Game.rooms) {
        let room = Game.rooms[roomName];
        room.buildAllCurrentRoads();
    }
};
