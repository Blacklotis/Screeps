var prototypeCreep = require('prototype.creep');

var roleFighter = {
    run: function(creep) {
        var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if (target) {
            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }
};

module.exports = Object.assign({}, prototypeCreep, roleFighter);
