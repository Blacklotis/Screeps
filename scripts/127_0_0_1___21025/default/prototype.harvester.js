const harvesterPrototype = {
    performHarvesterTasks: function(creep) {
        var spawn = creep.room.find(FIND_MY_SPAWNS)[0];
        var controller = creep.room.controller;
        var extensions = [];
        for (var spawnName in Game.spawns) {
            extensions = extensions.concat(Game.spawns[spawnName].getExtensions());
        }

        // Task 2: Ensure extensions are filled
        for (var i in extensions) {
            if (extensions[i].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                if (creep.transfer(extensions[i], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(extensions[i]);
                    creep.say('🔋');
                }
                return;
            }
        }

        // Task 1: Ensure spawn has full energy
        if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn);
            creep.say('🚚');
            return;
        } 

        if (controller) {
            if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller);
                creep.say('⚡');
            }
            return;
        }

        // Default action if no other tasks are found
        creep.say('🛑 no task');
    } 
}

module.exports = harvesterPrototype;
