class GameState {
    grid: Record<number, Record<number, TileState>>;
    stacks: Tile[][];
    riverStack: Tile[];
    previouslyPlacedTile: TileState;
    done: boolean;

    constructor(stacks: Tile[][], riverStack: Tile[]) {
        this.grid = {};
        this.stacks = stacks;
        this.riverStack = riverStack;
        this.done = false;
    }

    tileAt(x: number, y: number): TileState | undefined {
        if (!this.grid[y])
            return undefined;
        return this.grid[y][x];
    }

    allTiles(): TileState[] {
        return Object.values(this.grid).map(y => Object.values(y)).flat();
    }

    insertAt(x: number, y: number, tile: Tile, orientation: Orientation, skipCheck: boolean = false): this {
        if (!this.grid.hasOwnProperty(y))
            this.grid[y] = {};
        if (skipCheck || !this.grid[y][x]) {
            const tileState = {
                tile,
                orientation,
                position: {
                    x,
                    y,
                },
            };
            this.grid[y][x] = tileState;
            this.previouslyPlacedTile = tileState;
        }
        else {
            throw Error(`Trying to place tile at (${x}, ${y}), where another tile is already present.`);
        }
        return this;
    }

    tilesLeft(): number {
        return sum(this.stacks.map(s => s.length));
    }
}
