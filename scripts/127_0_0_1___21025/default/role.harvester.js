const { DEBUGGING } = require('constants');
require('prototype.harvester');

const roleHarvester = {
    run: function(creep) {
        if (this.refillEnergy(creep)) {
            this.chooseTask(creep);
        }

        this.takeAction(creep);
        //creep.talk();
    },

    refillEnergy: function(creep) {
        // if we have zero energy, go refil our energy
        if (creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.state = creep.states.HARVEST_ENERGY;
        }

        // Now that we are full on energy, lets decide what to spend it on.
        if (creep.store.getFreeCapacity() === 0) {
            return true;
        }  

        return false;
    },

    chooseTask: function(creep) {
        if (creep.room.getHarvesterWorkExtensions() > 0) {
            creep.memory.state = creep.states.CHARGE_EXTENSIONS;
        } else if (creep.room.getHarvesterWorkSpawn() > 0) {
            creep.memory.state = creep.states.CHARGE_SPAWN;
        } else {
            creep.memory.state = creep.states.CHARGE_CONTROLLER;  
        }
    },

    takeAction: function(creep) {
        switch (creep.memory.state) {
            case creep.states.HARVEST_ENERGY:
                if (creep.store.getFreeCapacity() > 0) {
                    creep.harvestEnergy();
                }
                break;
            case creep.states.CHARGE_CONTROLLER:
                if (creep.store[RESOURCE_ENERGY] != 0) {
                    creep.chargeController();
                }
                break;
            case creep.states.CHARGE_EXTENSIONS:
                if (!creep.chargeExtensions()) {
                    this.chooseTask(creep);
                }
                break;
            case creep.states.CHARGE_SPAWN:
                if (!creep.chargeSpawn()) {
                    this.chooseTask(creep);
                }
                break;
        }
    }
};

module.exports = roleHarvester;
