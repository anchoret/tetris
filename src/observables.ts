import {BehaviorSubject, Observable} from 'rxjs';
import {filter, map, pairwise, scan, startWith} from 'rxjs/operators';
import {
    calculateLevel as calculateLevelDefault,
    calculateSpeed as calculateSpeedDefault
} from './utils';
import {MAX_SPEED} from './constants';


export function createReceivedPointsSubject(initialPoints = 0): BehaviorSubject<number> {
    return new BehaviorSubject<number>(initialPoints < 0 ? 0 : initialPoints);
}

export function createNonNegativeReceivedPoints(receivedPointsSubject: BehaviorSubject<number>): Observable<number> {
    return receivedPointsSubject.pipe(
        filter(value => value >= 0),
    );
}

export function createScore(receivedPoints$: Observable<number>): Observable<number> {
    return receivedPoints$.pipe(
        scan((acc: number, points: number): number => acc + points, 0),
    );
}

export function createLevel(score$: Observable<number>, calculateLevelCallback?: (point: number) => number): Observable<number> {
    return score$.pipe(
        map(calculateLevelCallback ? calculateLevelCallback : calculateLevelDefault),
        startWith(0),
        pairwise(),
        filter(pair => pair[1] > pair[0]),
        map(pair => pair[1]),
    );
}

export function createGameSpeed(
    level$: Observable<number>,
    calculateSpeedCallback?: (level: number) => number): Observable<number> {

    if (!calculateSpeedCallback) {
        calculateSpeedCallback = calculateSpeedDefault;
    }

    return level$.pipe(
        map(level => calculateSpeedCallback.call(null, level)),
        filter(level => level <= MAX_SPEED),
    );
}