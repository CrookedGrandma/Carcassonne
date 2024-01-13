const weightMap  = {
    numberOfSidesMatching: 1,
    manhattanDistanceFromCenter: 0.5,
    euclideanDistanceFromCenter: 0.5,
    isRightSideUp: 0.01,
};

interface ReferenceValues {
    manhattan?: MinMax;
    euclidean?: MinMax;
}

class SatisfactionPlayer extends Player {
    protected pick(tile: Tile, positions: PosAndOri[], gameState: GameState): PosAndOri {
        const reference = this.computeReferenceValues(positions, gameState);
        const scores = positions.map(pao => ({
            position: pao,
            satisfaction: this.satisfaction(tile, pao, gameState, reference)
        }));
        const bestScore = maxBy(scores.map(s => s.satisfaction), s => s);
        const bestPositions = scores.filter(s => s.satisfaction == bestScore);
        const selected = randomFromArray(bestPositions);
        console.log(`Satisfaction score for chosen position: ${selected.satisfaction}`);
        return selected.position;
    }

    private computeReferenceValues(positions: PosAndOri[], gameState: GameState): ReferenceValues {
        if (!weightMap.manhattanDistanceFromCenter && !weightMap.euclideanDistanceFromCenter)
            return {};

        const reference: ReferenceValues = {};
        if (weightMap.manhattanDistanceFromCenter) {
            reference.manhattan = {
                min: minBy(positions.map(pao => manhattanDistance(pao.position)), d => d),
                max: maxBy(gameState.allTiles().map(t => manhattanDistance(t.position)), d => d) + gameState.tilesLeft() + 1,
            };
        }
        if (weightMap.euclideanDistanceFromCenter) {
            reference.euclidean = {
                min: minBy(positions.map(pao => euclideanDistance(pao.position)), d => d),
                max: maxBy(gameState.allTiles().map(t => euclideanDistance(t.position)), d => d) + gameState.tilesLeft() + 1,
            };
        }
        return reference;
    }

    private satisfaction(tile: Tile, position: PosAndOri, gameState: GameState, reference: ReferenceValues): number {
        const score = this.rawSatisfaction(tile, position, gameState, reference);
        // Divide by sum of absolute weights to return a value between 0 and 100.
        return score / sum(Object.values(weightMap).map(v => Math.abs(v)));
    }

    private rawSatisfaction(tile: Tile, position: PosAndOri, gameState: GameState, reference: ReferenceValues) {
        let score = 0;
        // Every rule must return a number scaled such that it is between 0 and 100.
        if (weightMap.numberOfSidesMatching)
            score += weightMap.numberOfSidesMatching * this.numberOfSidesMatching(position, gameState);
        if (weightMap.manhattanDistanceFromCenter)
            score += weightMap.manhattanDistanceFromCenter * this.manhattanDistanceFromCenter(position, reference);
        if (weightMap.euclideanDistanceFromCenter)
            score += weightMap.euclideanDistanceFromCenter * this.euclideanDistanceFromCenter(position, reference);
        if (weightMap.isRightSideUp)
            score += weightMap.isRightSideUp * this.isRightSideUp(position);
        return score;
    }

    private numberOfSidesMatching(position: PosAndOri, gameState: GameState): number {
        const right = gameState.tileAt(position.position.x + 1, position.position.y) ? 1 : 0;
        const down = gameState.tileAt(position.position.x, position.position.y + 1) ? 1 : 0;
        const left = gameState.tileAt(position.position.x - 1, position.position.y) ? 1 : 0;
        const up = gameState.tileAt(position.position.x, position.position.y - 1) ? 1 : 0;
        const sides = right + down + left + up;
        return sides * 25; // sides is in [0, 4] so scaled by 25 to reach [0, 25]
    }

    private manhattanDistanceFromCenter(position: PosAndOri, reference: ReferenceValues) {
        return this._distanceFromCenter(position, reference.manhattan, manhattanDistance);
    }

    private euclideanDistanceFromCenter(position: PosAndOri, reference: ReferenceValues) {
        return this._distanceFromCenter(position, reference.euclidean, euclideanDistance);
    }

    private _distanceFromCenter(position: PosAndOri, reference: MinMax, distanceFn: (pos: Position) => number): number {
        const distance = distanceFn(position.position);
        // To scale to [0, 100], we need to know what the maximum reachable distance
        // at this moment is. This is equal to the outermost tile's distance + the
        // number of tiles left, +1 because current tile is not in any stack anymore.
        const maxDistance = reference.max;
        // We also need the minimum possible distance, in order to give a fair score.
        const minDistance = reference.min;
        // If maxDistance is equal to minDistance, the scaling will fail,
        // but we don't need it. Any distance is the best distance.
        if (maxDistance == minDistance)
            return 100;
        const scaledDistance = 100 - ((distance - minDistance) / (maxDistance - minDistance) * 100);
        if (scaledDistance < 0 || scaledDistance > 100)
            throw Error(`Scaled distance is not between 0 and 100: ${scaledDistance}`);
        return scaledDistance;
    }

    private isRightSideUp(position: PosAndOri) {
        return position.orientation == Orientation.Deg0 ? 100 : 0;
    }

    //TODO: add rule for not leaving impossible to fill gaps

    //TODO: add rule for completing projects
}
