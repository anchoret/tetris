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
    skip,
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
    removeSetRows,
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
    let gravityTransformations$ = ticks$.pipe(
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
    set$.subscribe(_ => nextFigure$.next(generateFigure()));
    set$.pipe(
        skip(1),
        map(set => {
            let points = POINTS_ADD_FIGURE;
            let filledRowIndexes = getFilledRowIndexes(set);
            if (filledRowIndexes.length > 0) {
                points += calculateFilledRowPoints(filledRowIndexes);
                removeSetRows(set, filledRowIndexes);
            }
            return points;
        }),
        filter(points => points > 0),
    ).subscribe((receivedPoints: number) => {
        receivedPointsSubject$.next(receivedPoints);
    });

    let currentFigure$ = nextFigure$.pipe(
        startWith(generateFigure()),
        pairwise(),
        map(pair => pair[0] ),
        switchMap(
            () => allTransformations$,
            (figure, transformations) => { return {figure, transformations}; }
        ),

        scan(
            applyTransformations,
            {
                processedFigure: undefined,
                initialFigure: undefined,
                set: set$,
                points: receivedPointsSubject$,
            }),
        map(data => data.processedFigure),
        share(),
    );

    return currentFigure$.pipe(
        distinctUntilChanged(),
        withLatestFrom(
            nextFigure$,
            currentFigure$,
            set$,
            score$,
            level$,
            (_, nextFigure, currentFigure, set, score, level) => {
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