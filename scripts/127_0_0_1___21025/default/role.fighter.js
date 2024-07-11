var builder = require('prototype.fighter');
var prototypeCreep = require('prototype.creep');

var roleBuilder = {
    run: function(creep) {
        this.chooseTask(creep);
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
        if (true) {
            creep.memory.state = creep.states.ATTACK;
        } else{
            creep.memory.state = creep.states.IDLE;  
        }
    },
    
    takeAction: function(creep) {
        switch (creep.memory.state) {
            case creep.states.ATTACK:
                const roomName = 'W4N5';//creep.room.getLeftRoomName();
                //creep.moveToRoom(roomName);
                //creep.moveToFlag('attack');
                creep.clearRoom();
                this.chooseTask(creep);
                break;
            case creep.states.IDLE:
                creep.idle();
                break;
        }
    }
    
};

module.exports = roleBuilder;
