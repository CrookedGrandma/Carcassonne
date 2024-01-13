class Game {
    private readonly TILE_SIZE = 105;

    private readonly NO_STACKS: number;
    private readonly PLAY_DELAY: number;

    readonly usingRiver: boolean;

    private readonly tileDescriptors: TileDescriptor[];
    private readonly tileImages: Record<string, p5.Image>;
    private readonly allTiles: Tile[];
    private readonly basicTiles: Tile[];
    private readonly gameTiles: Tile[];
    private readonly riverTiles: Tile[];
    private readonly startTile: Tile;

    private gameState: GameState;

    private player?: Player;

    constructor(csvLines: string[], playsPerSecond = 5, numberOfStacks: number = 5, useRiver: boolean = false, stackMultiplier: number = 1) {
        this.NO_STACKS = numberOfStacks;
        this.PLAY_DELAY = 1000 / playsPerSecond;
        this.usingRiver = useRiver;
        this.tileDescriptors = csvLinesToDescriptorArray(csvLines).slice(1);
        this.tileImages = Object.fromEntries(this.tileDescriptors.map(d => [d.imageName, loadImage(imageFolder + d.imageName)]));
        this.allTiles = descriptorArrayToTileArray(this.tileDescriptors);
        this.basicTiles = this.allTiles.filter(t => !t.startTile && !t.river);

        this.riverTiles = this.usingRiver
            ? [this.allTiles.find(t => t.riverEnd), ...shuffle(this.allTiles.filter(t => t.river && !t.startTile && !t.riverEnd))]
            : [];

        this.gameTiles = shuffle(Array(stackMultiplier).fill(this.basicTiles).flat());
        const startTile = this.allTiles.find(t => t.startTile && t.river == this.usingRiver);
        if (!startTile)
            throw Error("no suitable start tile found");
        this.startTile = startTile;

        this.gameState = new GameState(chunkIntoN(this.gameTiles, this.NO_STACKS), this.riverTiles);

        // Place start tile
        this.gameState.insertAt(0, 0, this.startTile, Orientation.Deg0, true);
    }

    useRandomPlayer() {
        this.player = new RandomPlayer();
        return this;
    }

    useSatisfactionPlayer() {
        this.player = new SatisfactionPlayer();
        return this;
    }

    start() {
        const game = this;
        setTimeout(() => game.playRound(), this.PLAY_DELAY);
        return game;
    }

    playRound() {
        const game = this;
        if (!game.player)
            throw Error("no player");
        game.gameState = game.player.play(game.gameState);
        if (!game.gameState.done)
            setTimeout(() => game.playRound(), game.PLAY_DELAY);
    }

    drawUi() {
        this.drawStacks();
    }

    draw() {
        this.drawGrid();
    }

    private drawStacks() {
        for (const [i, stack] of this.gameState.stacks.entries()) {
            const x = 5 * (i + 1) + 30 * i;
            stroke(255); fill(0);
            rect(x, 5, 30, 30);

            fill(255);
            text(stack.length, x, 30);
        }
    }

    private tileImage(tile: Tile | TileDescriptor): p5.Image;
    private tileImage(x: number, y: number): p5.Image;
    private tileImage(xOrTile: Tile | TileDescriptor | number, y?: number) {
        if (Number.isFinite(xOrTile) && Number.isFinite(y)) {
            return this.tileImage(this.gameState.grid[y!][xOrTile as number].tile);
        }
        else {
            return this.tileImages[(xOrTile as Tile | TileDescriptor).imageName];
        }
    }

    private drawGrid() {
        for (const tile of this.gameState.allTiles()) {
            push();
            translate(width / 2 + this.TILE_SIZE * tile.position.x, height / 2 + this.TILE_SIZE * tile.position.y);
            rotate(((4 - tile.orientation) % 4) * 90);
            image(this.tileImage(tile.tile), 0, 0, this.TILE_SIZE, this.TILE_SIZE);
            pop();
        }
    }
}
