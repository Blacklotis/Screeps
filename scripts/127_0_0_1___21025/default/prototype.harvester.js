Creep.prototype.harvestEnergy = function() {
    var source = this.pos.findClosestByPath(FIND_SOURCES);
    if (source) {
        if (this.harvest(source) == ERR_NOT_IN_RANGE) {
            this.moveTo(source);
            this.say('🔄');
        }
    }
};

Creep.prototype.performHarvesterTasks = function() {
    var spawn = this.room.find(FIND_MY_SPAWNS)[0];
    var controller = this.room.controller;

    // Task 1: Prioritize upgrading controller at level 1 or below
    if (controller && controller.level <= 1) {
        if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller);
            creep.say('⚡');
        }
        return;
    }

    // Task 2: Ensure spawn has full energy
    if (this.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.moveTo(spawn);
        this.say('🚚');
        return;
    } 
    
    // Task 3: Continue to work on controller
    if (controller) {
        if (this.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            this.moveTo(controller);
            this.say('⚡');
        }
        return;
    } 
};
