import {Observable, BehaviorSubject, Subject} from 'rxjs';
import {
    map,
    first,
    takeWhile,
    switchMap,
    share,
    takeUntil,
    pairwise,
    filter,
    bufferWhen,
    withLatestFrom,
    scan,
    startWith,
    distinctUntilChanged,
} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';
import {interval} from 'rxjs/observable/interval';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {merge} from 'rxjs/observable/merge';
import {animationFrame} from 'rxjs/scheduler/animationFrame';
import {Figure, PlayingField, Set, Transformation} from './types';
import {POINTS_ADD_FIGURE, MAX_FPS} from './constants';
import {
    applyTransformations,
    createGravityTransformation,
    generateFigure,
    generateEmptySet,
    getManualTransformation,
    isSetOverflow,
    getFilledRowIndexes,
    calculateFilledRowPoints,
    removeSetRows, replenishSet,
} from './utils';
import {
    createGameSpeed,
    createLevel,
    createNonNegativeReceivedPoints,
    createReceivedPointsSubject,
    createScore
} from './observables';
import {createCanvasElement, renderGameOver, renderPlayingField} from './graphics';

let renderingContext = createCanvasElement();
let gameOver$ = new Subject();
let click$ = fromEvent(document, 'click');
let keydown$ = fromEvent(document, 'keydown');


function createGame(fps$: Observable<number>): Observable<PlayingField> {
    let receivedPointsSubject$ = createReceivedPointsSubject(0);
    let nonNegativeReceivedPoints$ = createNonNegativeReceivedPoints(receivedPointsSubject$);
    let score$ = createScore(nonNegativeReceivedPoints$);
    let level$ = createLevel(score$);
    let gameSpeed$ = createGameSpeed(level$);

    let ticks$ = gameSpeed$.pipe(
        switchMap(speed => interval(Math.floor(1000 / speed))),
        takeUntil(gameOver$),
        share(),
    );
    ticks$.subscribe();

    let nextFigure$ = new BehaviorSubject<Figure>(generateFigure());
    let gravityTransformations$ = merge(ticks$, nextFigure$).pipe(
        map((): Transformation => createGravityTransformation()),
    );

    let manualTransformations$ = keydown$.pipe(
        map((event: KeyboardEvent) => getManualTransformation(event.code)),
        filter(transformation => !!transformation),
        takeUntil(gameOver$),
    );

    let allTransformations$ = merge(gravityTransformations$, manualTransformations$)
        .pipe(
            bufferWhen(() => fps$),
            filter((buffer: Array<Transformation>) => buffer.length > 0),
            share(),
        );

    let set$ = new BehaviorSubject<Set>(generateEmptySet());

    let processedFigure$ = nextFigure$.pipe(
        startWith(generateFigure()),
        pairwise(),
        map(pair => pair[0] ),
        switchMap(
            () => allTransformations$,
            (figure: Figure, transformations: Array<Transformation>) => { return {figure, transformations}; }
        ),
        withLatestFrom(
            set$,
            (
                {figure, transformations}: {figure: Figure, transformations: Array<Transformation>},
                currentSet: Set
            ): {figure: Figure, transformations: Array<Transformation>, currentSet: Set} => {
                return {figure, transformations, currentSet};
            }
        ),
        scan(
            applyTransformations,
            {
                processedFigure: undefined,
                initialFigure: undefined,
                isFinale: false,
                bonusPoints: 0,
            }),
        share(),
    );

    processedFigure$.subscribe(
        data => {
            let points = data.bonusPoints;
            if (data.isFinale) {
                let replenishedSet = replenishSet(set$.getValue(), data.processedFigure);
                points += POINTS_ADD_FIGURE;
                let filledRowIndexes = getFilledRowIndexes(replenishedSet);
                if (filledRowIndexes.length > 0) {
                    points += calculateFilledRowPoints(filledRowIndexes);
                    set$.next(removeSetRows(replenishedSet, filledRowIndexes));
                } else {
                    set$.next(replenishedSet);
                }
                nextFigure$.next(generateFigure());
            }
            receivedPointsSubject$.next(points);
        }
    );

    let currentFigure$ = processedFigure$.pipe(
        map(data => data.processedFigure),
        distinctUntilChanged(),
    );

    return currentFigure$.pipe(
        withLatestFrom(
            nextFigure$,
            set$,
            score$,
            level$,
            (currentFigure, nextFigure, set, score, level) => {
                return new PlayingField(nextFigure, currentFigure, set, score, level);
            }
        )
    );
}

let game$ = of('Start Game').pipe(
    map(() => interval(1000 / MAX_FPS, animationFrame)),
    switchMap(createGame),
    takeWhile(playingField => !isSetOverflow(playingField.set)),
);

const startGame = () => {
    game$.subscribe({
        next: (playingField) => { renderPlayingField(renderingContext, playingField); },
        complete: () => {
            renderGameOver(renderingContext);
            gameOver$.next(true);
            click$.pipe(first()).subscribe(startGame);
        }
    });
};

startGame();