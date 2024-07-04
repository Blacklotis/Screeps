var builder = require('prototype.builder');

var roleBuilder = {
    run: function(creep) {
        if (creep.store.getFreeCapacity() > 0) {
            creep.harvestEnergy(creep);
        } else {
            builder.performConstructionTasks(creep);
        }
    }
};

module.exports = roleBuilder;
