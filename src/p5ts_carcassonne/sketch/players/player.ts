abstract class Player {
    play(gameState: GameState) {
        const tile = this.drawTile(gameState);
        if (!tile) {
            gameState.done = true;
            return gameState;
        }

        const possiblePostitions = this.getAllFittingTilePositions(tile, gameState);
        if (possiblePostitions.length == 0)
            throw Error("No possible positions found");
        const chosen = this.pick(tile, possiblePostitions, gameState);
        gameState.insertAt(chosen.position.x, chosen.position.y, tile, chosen.orientation);

        return gameState;
    }

    protected drawTile(gameState: GameState): Tile | undefined {
        if (gameState.riverStack.length > 0)
            return gameState.riverStack.pop();
        const nonEmptyStacks = gameState.stacks.filter(s => s.length > 0);
        if (nonEmptyStacks.length == 0)
            return undefined;
        const stack = nonEmptyStacks[Math.floor(Math.random() * nonEmptyStacks.length)];
        return stack.pop();
    }

    protected getAllFittingTilePositions(tile: Tile, gameState: GameState): PosAndOri[] {
        return this.getAllPossiblePositions(gameState).map(p => [
            { position: p, orientation: Orientation.Deg0 },
            { position: p, orientation: Orientation.Deg90 },
            { position: p, orientation: Orientation.Deg180 },
            { position: p, orientation: Orientation.Deg270 },
        ] as PosAndOri[])
            .flat()
            .filter((pos, index, array) => array.findIndex(p => posAndOriComparer(pos, p)) == index)
            .filter(pao => this.fitsAt(tile, pao.position.x, pao.position.y, pao.orientation, gameState));
    }

    private getAllPossiblePositions(gameState: GameState): Position[] {
        return gameState.allTiles().map(t => [
            { x: t.position.x, y: t.position.y - 1 },
            { x: t.position.x + 1, y: t.position.y },
            { x: t.position.x, y: t.position.y + 1 },
            { x: t.position.x - 1, y: t.position.y },
        ]).flat();
    }

    protected fitsAt(tile: Tile, x: number, y: number, orientation: Orientation, gameState: GameState): boolean {
        const riverAllowed = !tile.river
            || this.riverTileAllowedAt(tile, x, y, orientation, gameState);
        return !gameState.tileAt(x, y)
            && riverAllowed
            && this.tileMatchesLookingAt(tile, x, y, orientation, Side.Up, gameState)
            && this.tileMatchesLookingAt(tile, x, y, orientation, Side.Right, gameState)
            && this.tileMatchesLookingAt(tile, x, y, orientation, Side.Down, gameState)
            && this.tileMatchesLookingAt(tile, x, y, orientation, Side.Left, gameState);
    }

    private riverTileAllowedAt(tile: Tile, x: number, y: number, orientation: Orientation, gameState: GameState): boolean {
        const nextToRiver = indicesOf("S", tile.edges)
            .some(i => this.tileMatchesLookingAt(tile, x, y, orientation, (i + 4 - orientation) % 4, gameState, false));

        const curve = isCurve(tile);
        const previousCurve = isCurve(gameState.previouslyPlacedTile!.tile);

        const curveAllowed = !curve.isCurve || !previousCurve.isCurve
            || intersect(curve.edgeIndices.map(i => (i + 4 - orientation) % 4),
                previousCurve.edgeIndices.map(i => (i + 4 - gameState.previouslyPlacedTile!.orientation) % 4))
                .length == 0;

        return nextToRiver && curveAllowed;
    }

    private tileMatchesLookingAt(tile: Tile, x: number, y: number, orientation: Orientation, lookingAt: Side, gameState: GameState, allowIfEmpty: boolean = true): boolean {
        const checkingX = lookingAt == Side.Left ? x - 1 : (lookingAt == Side.Right ? x + 1 : x);
        const checkingY = lookingAt == Side.Up ? y - 1 : (lookingAt == Side.Down ? y + 1 : y);
        const checkingTile = gameState.tileAt(checkingX, checkingY);
        if (!checkingTile)
            return allowIfEmpty;
        const oppositeSide: Side = (lookingAt + 2) % 4;
        const checkingEdge = checkingTile.tile.edges[(checkingTile.orientation + oppositeSide) % 4];
        return tile.edges[(orientation + lookingAt) % 4] == checkingEdge;
    }

    protected abstract pick(tile: Tile, positions: PosAndOri[], gameState: GameState): PosAndOri;
}
