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
} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';
import {interval} from 'rxjs/observable/interval';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {merge} from 'rxjs/observable/merge';
import {animationFrame} from 'rxjs/scheduler/animationFrame';
import {Figure, PlayingField, Set, Transformation} from './types';
import {MAX_FPS} from './constants';
import {
    applyTransformations,
    createGravityTransformation,
    generateFigure,
    generateEmptySet,
    getManualTransformation,
    isSetOverflow,
} from './utils';
import {
    createGameSpeed,
    createLevel,
    createNonNegativeReceivedPoints,
    createReceivedPointsSubject,
    createScore
} from './observables';


let gameOver$ = new Subject();
let click$ = fromEvent(document, 'click');
let keydown$ = fromEvent(document, 'keydown');


function createGame(fps$: Observable<number>): Observable<PlayingField> {
    console.log('START CREATE GAME');
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
        map(set => {
            console.dir(set);
            return 5;
        }),
        filter(points => points > 0),
    ).subscribe((receivedPoints: number) => {
        console.log('points');
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
        scan(applyTransformations, {processedFigure: undefined, initialFigure: undefined, set: set$}),
        map(data => data.processedFigure),
        share(),
    );
    currentFigure$.subscribe(figure => { console.log('Figure>>'); console.dir(figure); });

    return allTransformations$.pipe(
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
        next: () => console.log('Render'),
        complete: () => {
            console.log('Render Game Over');
            gameOver$.next(true);
            click$.pipe(first()).subscribe(startGame);
        }
    });
};

startGame();