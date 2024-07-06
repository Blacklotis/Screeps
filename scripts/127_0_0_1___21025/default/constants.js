module.exports = {
    OVERLAY_ROAD_CONSTRUCTION: false,
    DEBUGGING: true,
    MAX_WAIT_TICKS: 10,
    MIN_HARVESTERS: 5,
    MIN_BUILDERS: 5,
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
    ],
    FIGHTER_TIERS: [
        [TOUGH, TOUGH,ATTACK, MOVE],             // Tier 1
        [TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE], // Tier 2
        [TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE, HEAL]  // Tier 3
    ]
};
