var harvester = require('prototype.harvester');

var roleHarvester = {
    run: function(creep) {
        if (creep.store.getFreeCapacity() > 0) {
            creep.harvestEnergy(creep);
        } else {
            harvester.performHarvesterTasks(creep);
        }
    }
};

module.exports = roleHarvester;
