var healer = require('prototype.healer');

const roleHealer = {
    run: function(creep) {
        if (creep.store.getFreeCapacity() > 0) {
            creep.harvestEnergy(creep);
        } else {
            healer.performHealerTasks(creep);
        }
    }
};

module.exports = roleHealer;
