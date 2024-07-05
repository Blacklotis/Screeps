const { DEBUGGING } = require('constants');
require('prototype.harvester');

const roleHarvester = {
    run: function(creep) {
        //console.log('RESOURCE_ENERGY: ', creep.store[RESOURCE_ENERGY]);
        //console.log('getFreeCapacity: ', creep.store.getFreeCapacity());

        // Before we act we need to be full on energy
        if (this.refillEnergy(creep)) {
            this.chooseTask(creep);
        }

        this.takeAction(creep);
        creep.talk();
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
        // If we have empty extensions, lets fill them up
        var numberOfEmptyExtensions = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }}).length;

        if (numberOfEmptyExtensions > 0) {
            creep.memory.state = creep.states.FUEL_EXTENSIONS;
        } else {
            // If a spawn isnt full, lets fill them up
            var spawn = creep.room.find(FIND_MY_SPAWNS)[0];
            if (spawn && spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                creep.memory.state = creep.states.FUEL_SPAWN;
            } else {
                // Otherwise, let's continue working on the controller
                creep.memory.state = creep.states.FUEL_CONTROLLER;  
            }
        }
    },

    takeAction: function(creep) {
        switch (creep.memory.state) {
            case creep.states.HARVEST_ENERGY:
                if (creep.store.getFreeCapacity() > 0) {
                    creep.harvestEnergy();
                }
                break;
            case creep.states.FUEL_CONTROLLER:
                if (creep.store[RESOURCE_ENERGY] != 0) {
                    creep.fuelController();
                }
                break;
            case creep.states.FUEL_EXTENSIONS:
                if (creep.store[RESOURCE_ENERGY] != 0) {
                    creep.fuelExtensions();
                }
                break;
            case creep.states.FUEL_SPAWN:
                if (creep.store[RESOURCE_ENERGY] != 0) {
                    creep.fuelSpawn();
                }
                break;
        }
    }
};

module.exports = roleHarvester;
