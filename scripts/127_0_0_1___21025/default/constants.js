module.exports = {
    OVERLAY_ROAD_CONSTRUCTION: false,
    DEBUGGING: true,
    MAX_WAIT_TICKS: 10,
    MIN_HARVESTERS: 3,
    MIN_BUILDERS: 6,
    MIN_FIGHTERS: 0,
    MIN_HEALERS: 0,
    BUILDER_TIERS: [
        [WORK, CARRY, MOVE],             // Tier 1
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE], // Tier 2
        [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]  // Tier 3
    ],
    HARVESTER_TIERS: [
        [WORK, CARRY, MOVE],             // Tier 1
        [WORK, WORK, CARRY, MOVE, MOVE], // Tier 2
        [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE]  // Tier 3
    ]
};
