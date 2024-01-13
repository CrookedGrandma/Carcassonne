class RandomPlayer extends Player {
    protected pick(tile: Tile, positions: PosAndOri[], gameState: GameState): PosAndOri {
        return randomFromArray(positions);
    }
}
