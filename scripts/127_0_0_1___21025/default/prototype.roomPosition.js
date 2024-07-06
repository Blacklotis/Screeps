const CHECKERBOARD_GRID = Array.from({ length: 50 }, (_, x) =>
    Array.from({ length: 50 }, (_, y) => (x + y) % 2 === 0)
);

RoomPosition.prototype.isValid = function() {
    return CHECKERBOARD_GRID[this.x][this.y];
};
