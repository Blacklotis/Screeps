var harvester = require('prototype.harvester');

const harvesterPrototype = {
    run: function(creep) {
        if (creep.store.getFreeCapacity() > 0) {
            creep.harvestEnergy(creep);
        } else {
            harvester.performHarvesterTasks(creep);
        }
    }
}

module.exports = harvesterPrototype;
