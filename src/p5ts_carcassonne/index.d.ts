interface Tile {
    edges: string;
    imageName: string;
    river: boolean;
    startTile: boolean;
    riverEnd: boolean;
    connections: Record<EdgeType, Side[][]>
}

type TileDescriptor = Tile & { count: number }

interface Position {
    x: number;
    y: number;
}

interface PosAndOri {
    position: Position;
    orientation: Orientation;
}

type TileState = {
    tile: Tile;
} & PosAndOri;

interface MinMax {
    min: number;
    max: number;
}

interface Math {
    seedrandom: (seed: string) => Math;
}
