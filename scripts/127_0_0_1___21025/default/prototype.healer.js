const healerPrototype = {
    performHealerTasks: function(creep) {
        var controller = creep.room.controller;

        // Task 1: Heal damaged creeps
        var damagedCreep = this.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: (creep) => creep.hits < creep.hitsMax
        });
        if (damagedCreep) {
            if (this.heal(damagedCreep) == ERR_NOT_IN_RANGE) {
                this.moveTo(damagedCreep);
                this.say('❤️‍🩹');
            }
            return;
        }

        // Task 2: Fix GCL if it is blinking red
        if (controller && !controller.isActive()) { 
            if (this.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                this.moveTo(controller);
                this.say('⚡');
            }
            return;
        }

        // If no tasks, move to a designated idle position
        var idlePosition = new RoomPosition(25, 25, this.room.name); // Example idle position
        this.moveTo(idlePosition);
    }
}

module.exports = healerPrototype;
