import {Observable, BehaviorSubject} from 'rxjs';
import {interval} from 'rxjs/observable/interval';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {TRANSFORMATIONS} from './transformations';
import {map, filter, scan, first, takeWhile, switchMap, share, switchAll, takeUntil, mergeAll, mergeMap} from 'rxjs/operators';
import {generateFigure, nextTransformation} from './utils';
import {of} from 'rxjs/observable/of';
import {animationFrame} from 'rxjs/scheduler/animationFrame';
import {Figure} from './types';
import {MAX_FPS, START_SPEED} from './constants';

let gameSpeed$ = new BehaviorSubject<number>(START_SPEED).pipe(

);
let ticks$ = gameSpeed$.pipe(
    switchMap(speed => interval(Math.floor(1000 / speed)))
);

let click$ = fromEvent(document, 'click');


function createGame(fps$: Observable<number>): Observable<number> {
console.log('START CREATE GAME');
    let nextFigure = new BehaviorSubject<Figure>(generateFigure());
    nextFigure.subscribe(fig => console.dir(fig));

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

            click$.pipe(first()).subscribe(startGame);
        }
    });
    game$.subscribe(x => console.log('Получили: ' + x));
};

startGame();