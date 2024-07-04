var prototypeCreep = require('prototype.creep');

var roleHealer = {
    run: function(creep) {
        var target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
            filter: (creep) => creep.hits < creep.hitsMax
        });
        if (target) {
            if (creep.heal(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }
};

module.exports = Object.assign({}, prototypeCreep, roleHealer);
