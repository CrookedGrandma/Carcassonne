interface Tile {
    edges: string;
    imageName: string;
    river: boolean;
    startTile: boolean;
}

// @ts-ignore
type TileDescriptor = Tile & { count: number }

// @ts-ignore
type TileDescriptorRemote = Omit<TileDescriptor, "imageName"> & { imageUrl: string };
