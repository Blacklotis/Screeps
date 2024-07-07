var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleFighter = require('role.fighter');
var roleHealer = require('role.healer');
var roleTower = require('role.tower');
var rolePriest = require('role.priest');
require('prototype.spawn');
require('prototype.room');
require('prototype.roomPosition');
const { DEBUGGING, OVERLAY_ROAD_CONSTRUCTION, MIN_HARVESTERS, MIN_BUILDERS, MIN_FIGHTERS, MIN_HEALERS } = require('constants');

Creep.prototype.moveToRoomAndAttack = function(targetRoom) {
    if (this.room.name !== targetRoom) {
        // Move to the target room if not already there
        const exitDir = this.room.findExitTo(targetRoom);
        const exit = this.pos.findClosestByRange(exitDir);
        this.moveTo(exit, { visualizePathStyle: { stroke: '#ff0000' } });
    } else {
        // Attack hostiles in the target room
        const target = this.pos.findClosestByPath(FIND_HOSTILE_CREEPS) || this.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
        if (target) {
            if (this.attack(target) === ERR_NOT_IN_RANGE) {
                this.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
            }
        }
    }
};


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
        room.createPathToExit(FIND_EXIT_LEFT);
        //room.overlayBuildableCheckerboardPositions();
        //room.clearPlannedExtensions();
        //room.planExtensions(3);
        //room.clearRoadConstruction();
        //room.planRoads();
        //room.createConstructionSite(12, 45, STRUCTURE_ROAD);
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
        }else if (creep.memory.role == 'priest') {
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
