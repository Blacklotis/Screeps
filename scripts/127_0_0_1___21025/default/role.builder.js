var builder = require('prototype.builder');

var roleBuilder = {
    run: function(creep) {
        if (creep.moveToRoom()) {
            if (this.refillEnergy(creep)) {
                this.chooseTask(creep);
            }
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
        if (creep.room.getBuilderWorkExtensions()) {
            creep.memory.state = creep.states.BUILD_EXTENSIONS;
        } else if (creep.room.getBuilderWorkLinks()) {
            creep.memory.state = creep.states.BUILD_LINKS;
        } else if (creep.room.getBuilderWorkStorage()) {
            creep.memory.state = creep.states.BUILD_STORAGE;
        } else if (creep.room.getBuilderWorkTransfers()) {
            creep.memory.state = creep.states.BUILD_TRANSFERS;
        } else if (creep.room.getBuilderWorkRoads() > 0) {
            creep.memory.state = creep.states.BUILD_ROADS
        } else if (creep.room.getBuilderWorkRepair()) {
            creep.memory.state = creep.states.REPAIRING;
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
            case creep.states.BUILD_ROADS:
                if(!creep.buildRoads()) {
                    this.chooseTask(creep);
                }
                break;
            case creep.states.BUILD_EXTENSIONS:
                if(!creep.buildExtensions()) {
                    this.chooseTask(creep);
                }
                break;
            case creep.states.BUILD_LINKS:
                if(!creep.buildLinks()) {
                    this.chooseTask(creep);
                }
                break;
            case creep.states.BUILD_STORAGE:
                if(!creep.buildStorage()) {
                    this.chooseTask(creep);
                }
                break;
            case creep.states.BUILD_TRANSFERS:
                if(!creep.buildTransfers()) {
                    this.chooseTask(creep);
                }
                break;
            case creep.states.BUILD_SPAWN:
                if(!creep.buildSpawn()) {
                    this.chooseTask(creep);
                }
                break;
            case creep.states.REPAIRING:
                if(!creep.repairStructures()) {
                    this.chooseTask(creep);
                }
                break;
        }
    }
    
    
};

module.exports = roleBuilder;
