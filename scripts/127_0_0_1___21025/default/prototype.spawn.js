const { MIN_HARVESTERS, MIN_BUILDERS, MIN_FIGHTERS, MIN_HEALERS, HARVESTER_TIERS, BUILDER_TIERS } = require('constants');

StructureSpawn.prototype.manageSpawning = function() {
    if (this.spawning) {
        var spawningCreep = Game.creeps[this.spawning.name];
        this.room.visual.text(
            '🛠️ ' + spawningCreep.memory.role,
            this.pos.x + 1,
            this.pos.y,
            { align: 'left', opacity: 0.8 }
        );
    } else {
        if (this.spawning == null) {
            var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
            var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
            var fighters = _.filter(Game.creeps, (creep) => creep.memory.role == 'fighter');
            var healers = _.filter(Game.creeps, (creep) => creep.memory.role == 'healer');

            if (harvesters.length < MIN_HARVESTERS) {
                this.spawnCustomCreep(HARVESTER_TIERS, 'Harvester', 'harvester');
            } else if (builders.length <= MIN_BUILDERS) {
                this.spawnCustomCreep(BUILDER_TIERS, 'Builder', 'builder');
            } else if (fighters.length < MIN_FIGHTERS) {
                this.spawnCustomCreep([ATTACK, MOVE], 'Fighter', { role: 'fighter', waitTicks: 0, lastSourceId: null });
            } else if (healers.length < MIN_HEALERS) {
                this.spawnCustomCreep([HEAL, MOVE], 'Healer', { role: 'healer', waitTicks: 0, lastSourceId: null });
            }
        }
    }
};

StructureSpawn.prototype.getLargestTier = function(tiers, energyAvailable) {
    if (!Array.isArray(tiers)) {
        console.error('tiers is not an array:', tiers);
        throw new Error('tiers must be an array');
    }

    for (let i = tiers.length - 1; i >= 0; i--) {
        if (!Array.isArray(tiers[i])) {
            console.error('tiers[i] is not an array:', tiers[i]);
            throw new Error('Each tier must be an array');
        }
        const tierCost = tiers[i].reduce((sum, part) => sum + BODYPART_COST[part], 0);
        if (energyAvailable >= tierCost) {
            return tiers[i];
        }
    }
    return null;  // In case no tier can be afforded, though this should not happen
};

StructureSpawn.prototype.spawnCustomCreep = function(tiers, baseName, role) {
    const largestTier = this.getLargestTier(tiers, this.room.energyAvailable);
    if (largestTier) {
        const newName = this.generateUniqueName(baseName);

        return this.spawnCreep(largestTier, newName, {memory: {role: role, waitTicks: 0, lastSourceId: null}});
    }
    return ERR_NOT_ENOUGH_ENERGY;
};


StructureSpawn.prototype.generateUniqueName = function(baseName) {
    return baseName + '_' + Game.time.toString().slice(0, 3);
};
