import {Observable, BehaviorSubject, Subject} from 'rxjs';
import {map, first, takeWhile, switchMap, share, takeUntil, scan, filter} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';
import {interval} from 'rxjs/observable/interval';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {animationFrame} from 'rxjs/scheduler/animationFrame';
import {Figure} from './types';
import {MAX_FPS, START_SPEED} from './constants';
import {generateFigure, calculateFigure} from './utils';

let gameOver$ = new Subject();
let click$ = fromEvent(document, 'click');


function createGame(fps$: Observable<number>): Observable<number> {
    console.log('START CREATE GAME');
    let gameSpeed$ = new BehaviorSubject<number>(START_SPEED);
    let ticks$ = gameSpeed$.pipe(
        switchMap(speed => interval(Math.floor(1000 / speed))),
        takeUntil(gameOver$),
    );
    ticks$.subscribe(x => console.log('tick #' + x));

    let nextFigure$ = new BehaviorSubject<Figure>(generateFigure());
    nextFigure$.subscribe(fig => { console.log('Next>'); console.dir(fig); });

    let currentFigure$ = nextFigure$.pipe(
        scan(calculateFigure, []),
        filter(acc => acc.length > 1),
        map(acc => acc[0]),
    );
    currentFigure$.subscribe(fig => { console.log('Current>'); console.dir(fig); });

    return fps$.pipe(
        map(counter => counter * 2)
    );
}

let game$ = of('Start Game').pipe(
    map(() => interval(1000 / MAX_FPS, animationFrame)),
    switchMap(createGame),
    takeWhile(count => count < 10),
    share(),
);

const startGame = () => {
    game$.subscribe({
        next: () => console.log('StartGame -> next'),
        complete: () => {
            console.log('StartGame -> complete');
            gameOver$.next(true);
            click$.pipe(first()).subscribe(startGame);
        }
    });
    game$.subscribe(x => console.log('Получили: ' + x));
};



startGame();