const { DEBUGGING } = require('constants');

Creep.prototype.convertRoom = function(conversionCallback) {
    if (typeof conversionCallback !== 'function') {
        console.log('Invalid conversion callback provided');
        return false;
    }

    const structures = this.room.find(FIND_STRUCTURES);
    structures.forEach(structure => {
        conversionCallback(structure);
    });

    const constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
    constructionSites.forEach(site => {
        conversionCallback(site);
    });

    const creeps = this.room.find(FIND_CREEPS);
    creeps.forEach(creep => {
        conversionCallback(creep);
    });

    const resources = this.room.find(FIND_DROPPED_RESOURCES);
    resources.forEach(resource => {
        conversionCallback(resource);
    });

    const tombstones = this.room.find(FIND_TOMBSTONES);
    tombstones.forEach(tombstone => {
        conversionCallback(tombstone);
    });

    const ruins = this.room.find(FIND_RUINS);
    ruins.forEach(ruin => {
        conversionCallback(ruin);
    });

    console.log(`Conversion completed for room: ${this.room.name}`);
    return true;
};

Creep.prototype.claimRoom = function() {
    if (!this.room.controller) {
        console.log(`${this.name}: No controller found in room ${this.room.name}`);
        return;
    }

    const result = this.claimController(this.room.controller);
    if (result == ERR_NOT_IN_RANGE) {
        console.log(`${this.name}: Moving to controller in room ${this.room.name}`);
        const moveResult = this.moveTo(this.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
        if (moveResult != OK) {
            console.log(`${this.name}: Error moving to controller. Move result: ${moveResult}`);
        }
    } else if (result == OK) {
        console.log(`${this.name}: Successfully claimed controller in room ${this.room.name}`);
    } else {
        console.log(`${this.name}: Error claiming controller. Claim result: ${result}`);
    }
};

Creep.prototype.buildSpawn = function() {
    const spawnConstructionSite = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_SPAWN
    });

    if (!spawnConstructionSite) {
        console.log(`${this.name} could not find a spawn construction site.`);
        return ERR_INVALID_TARGET;
    }

    // Move to the construction site and build the spawn
    if (this.pos.inRangeTo(spawnConstructionSite, 3)) {
        const buildResult = this.build(spawnConstructionSite);
        if (buildResult === OK) {
            console.log(`${this.name} is building the spawn.`);
        } else {
            console.log(`${this.name} failed to build the spawn: ${buildResult}`);
        }
        return buildResult;
    } else {
        const moveResult = this.moveTo(spawnConstructionSite, { visualizePathStyle: { stroke: '#ffffff' } });
        if (moveResult === ERR_NO_PATH) {
            console.log(`${this.name} could not find a path to the spawn construction site.`);
        }
        return moveResult;
    }
};