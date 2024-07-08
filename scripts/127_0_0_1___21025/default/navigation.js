Room.prototype.getLeftRoomName = function() {
    const [x, y] = this.name.match(/([WE]\d+)([NS]\d+)/).slice(1);
    const xNum = parseInt(x.slice(1));
    const newX = x[0] === 'W' ? xNum + 1 : xNum - 1;
    const newXStr = x[0] === 'W' ? `W${newX}` : `E${newX}`;
    return `${newXStr}${y}`;
};

Room.prototype.calculateCreepNeeds = function() {
    const metrics = this.collectMetrics();
    const needs = {
        builders: 0,
        harvesters: 0
    };

    // Example logic to calculate needs based on metrics
    if (metrics.constructionSites) {
        needs.builders = Math.ceil(Object.values(metrics.constructionSites).reduce((a, b) => a + b, 0) / 5); // 1 builder per 5 construction sites
    }

    if (metrics.structures['container']) {
        needs.harvesters = metrics.structures['container'] * 2; // 2 harvesters per container
    } else {
        needs.harvesters = 2; // Default to 2 harvesters if no containers
    }

    return needs;
};

function distributeCreepsBasedOnEnergy() {
    const totalBuilders = calculateTotalCreeps('builder');
    const totalHarvesters = calculateTotalCreeps('harvester');

    // Calculate total energy generation across all rooms
    let totalEnergyGeneration = 0;
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        totalEnergyGeneration += room.calculateEnergyGeneration();
    }

    // Calculate and assign builders and harvesters proportionally
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        const energyPercentage = room.calculateEnergyGenerationPercentage(totalEnergyGeneration);

        const requiredBuilders = Math.round(totalBuilders * energyPercentage);
        const requiredHarvesters = Math.round(totalHarvesters * energyPercentage);

        // Assign the calculated number of builders and harvesters to the room
        room.memory.requiredBuilders = requiredBuilders;
        room.memory.requiredHarvesters = requiredHarvesters;
    }
}
