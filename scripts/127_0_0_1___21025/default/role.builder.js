var builder = require('prototype.builder');

var roleBuilder = {
    run: function(creep) {
        // Before we act we need to be full on energy
        if (this.refillEnergy(creep)) {

            // Lets check for what needs to bhe built
            // Find all road construction sites in the room
            var roadJobs = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => site.structureType === STRUCTURE_ROAD
            });
            
            console.log(JSON.stringify(roadJobs));

            if(roadJobs.length > 0){
                creep.memory.state = creep.states.BUILDING;
            } else {
                creep.memory.state = creep.states.FUEL_CONTROLLER; 
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
            case creep.states.BUILDING:
                if (creep.store[RESOURCE_ENERGY] != 0) {
                    creep.buildAllPlannedRoads();
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

module.exports = roleBuilder;
