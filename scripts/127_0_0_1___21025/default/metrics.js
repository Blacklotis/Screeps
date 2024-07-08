// metrics.js

Room.prototype.calculateCreepNeeds = function() {
    const metrics = this.collectMetrics();
    const needs = {
        builders: 0,
        harvesters: 0
    };

    if (metrics.constructionSites) {
        needs.builders = Math.ceil(Object.values(metrics.constructionSites).reduce((a, b) => a + b, 0) / 5); // 1 builder per 5 construction sites
    }

    if (metrics.structures['container']) {
        needs.harvesters = metrics.structures['container'] * 2;
    } else {
        needs.harvesters = 2;
    }

    return needs;
};

Room.prototype.collectMetrics = function() {
    const metrics = {};

    // Collect energy metrics
    metrics.energyAvailable = this.energyAvailable;
    metrics.energyCapacityAvailable = this.energyCapacityAvailable;

    // Collect controller metrics
    if (this.controller) {
        metrics.controllerLevel = this.controller.level;
        metrics.controllerProgress = this.controller.progress;
        metrics.controllerProgressTotal = this.controller.progressTotal;
    } else {
        metrics.controllerLevel = null;
        metrics.controllerProgress = null;
        metrics.controllerProgressTotal = null;
    }

    // Collect creep metrics
    metrics.creepCounts = _.countBy(Game.creeps, (creep) => creep.memory.role && creep.room.name === this.name);

    // Collect structure metrics
    const structures = this.find(FIND_STRUCTURES);
    metrics.structures = _.countBy(structures, 'structureType');

    // Collect construction site metrics
    const constructionSites = this.find(FIND_CONSTRUCTION_SITES);
    metrics.constructionSites = _.countBy(constructionSites, 'structureType');

    // Collect resource metrics
    const resources = this.find(FIND_DROPPED_RESOURCES);
    metrics.resources = resources.length;

    return metrics;
};

Room.prototype.logMetrics = function() {
    const roomMetrics = this.collectMetrics();
    console.log(`Metrics for room ${this.name}:`, JSON.stringify(roomMetrics, null, 2));
};

Room.collectAllRoomMetrics = function() {
    const allMetrics = {};
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        allMetrics[roomName] = room.collectMetrics();
    }
    return allMetrics;
};

Room.logAllRoomMetrics = function() {
    const allRoomMetrics = Room.collectAllRoomMetrics();
    console.log('Metrics for all rooms:', JSON.stringify(allRoomMetrics, null, 2));
};

Room.prototype.calculateEnergyGeneration = function() {
    const sources = this.find(FIND_SOURCES);
    let totalEnergy = 0;

    sources.forEach(source => {
        totalEnergy += source.energyCapacity;
    });

    return totalEnergy;
};

Room.prototype.calculateEnergyGenerationPercentage = function(totalEnergyGeneration) {
    const roomEnergyGeneration = this.calculateEnergyGeneration();
    return roomEnergyGeneration / totalEnergyGeneration;
};