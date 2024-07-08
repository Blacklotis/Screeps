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
const { BODY_CONFIGURATION, DEBUGGING, OVERLAY_ROAD_CONSTRUCTION, MIN_HARVESTERS, MIN_BUILDERS, MIN_FIGHTERS, MIN_HEALERS } = require('constants');

function assignCreepsToRooms() {
    const allRoomsNeeds = {};

    // Collect needs for all rooms
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        allRoomsNeeds[roomName] = room.calculateCreepNeeds();
    }

    const creeps = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder' || creep.memory.role === 'harvester');

    for (const creep of creeps) {
        let highestNeedRoom = null;
        let highestNeed = 0;

        for (const roomName in allRoomsNeeds) {
            const roomNeeds = allRoomsNeeds[roomName];

            if (creep.memory.role === 'builder' && roomNeeds.builders > highestNeed) {
                highestNeed = roomNeeds.builders;
                highestNeedRoom = roomName;
            } else if (creep.memory.role === 'harvester' && roomNeeds.harvesters > highestNeed) {
                highestNeed = roomNeeds.harvesters;
                highestNeedRoom = roomName;
            }
        }

        if (highestNeedRoom) {
            creep.memory.targetRoom = highestNeedRoom;

            // Decrement the need in the assigned room
            if (creep.memory.role === 'builder') {
                allRoomsNeeds[highestNeedRoom].builders--;
            } else if (creep.memory.role === 'harvester') {
                allRoomsNeeds[highestNeedRoom].harvesters--;
            }
        }
    }
}


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
        //room.clearPlannedExtensions();
        //room.planExtensions(5);
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
