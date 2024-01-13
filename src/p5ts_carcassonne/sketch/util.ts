enum Orientation {
    Deg0 = 0,
    Deg90 = 3,
    Deg180 = 2,
    Deg270 = 1,
}

enum Side {
    Up,
    Right,
    Down,
    Left,
}

enum EdgeType {
    Field = "F",
    Road = "R",
    City = "C",
    River = "S",
}

function csvLinesToDescriptorArray(csv: string[]): TileDescriptor[] {
    const records = csv.filter(l => !!l).map(l => l.split(';'));
    return records.map(r => ({
        edges: r[1],
        count: parseInt(r[2]),
        imageName: r[3],
        river: r[4] == 'true',
        startTile: r[5] == 'true',
        riverEnd: r[6] == 'true',
    }));
}

function descriptorArrayToTileArray(descriptors: TileDescriptor[]): Tile[] {
    return descriptors.reduce((arr, d) => {
        for (let i = 0; i < d.count; i++) {
            arr.push({
                edges: d.edges,
                imageName: d.imageName,
                river: d.river,
                startTile: d.startTile,
                riverEnd: d.riverEnd,
            });
        }
        return arr;
    }, [] as Tile[])
}

function chunkIntoN<T>(arr: T[], n: number): T[][] {
    const size = Math.ceil(arr.length / n);
    return Array.from({ length: n }, (_, i) => arr.slice(i * size, i * size + size));
}

function randomFromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function intersect<T>(a: T[], b: T[]): T[] {
    return a.filter(e => b.includes(e));
}

function maxBy<T>(arr: T[], fn: (el: T) => number) {
    return arr.reduce((prev, current) => (prev && fn(prev) > fn(current)) ? prev : current);
}

function minBy<T>(arr: T[], fn: (el: T) => number) {
    return arr.reduce((prev, current) => (prev && fn(prev) < fn(current)) ? prev : current);
}

function sum(arr: number[]) {
    return arr.reduce((total, next) => total + next, 0);
}

function indicesOf(needle: string, haystack: string) {
    const indices = [];
    for (let i = 0; i < haystack.length; i++)
        if (haystack[i] == needle)
            indices.push(i);
    return indices;
}

function isCurve(tile: Tile, edgeType: EdgeType = EdgeType.River): { isCurve: boolean, edgeIndices: number[] } {
    const edges = indicesOf(edgeType, tile.edges);
    const curve = edges.length == 2
        && [1, 3].includes(edges[1] - edges[0]);
    return {
        isCurve: curve,
        edgeIndices: edges,
    };
}

function posAndOriComparer(a: PosAndOri, b: PosAndOri) {
    return a.position.x == b.position.x && a.position.y == b.position.y && a.orientation == b.orientation;
}

function manhattanDistance(pos: Position) {
    return Math.abs(pos.x) + Math.abs(pos.y);
}

function euclideanDistance(pos: Position) {
    return Math.sqrt(pos.x * pos.x + pos.y * pos.y);
}
