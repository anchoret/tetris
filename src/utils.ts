import {Color, Figure, FigureBody, KeyCode, Point2D, Set, Transformation} from './types';
import {FIGURE_BODIES} from './figure_bodies';
import {
    PLAYING_FILED_HEIGHT,
    PLAYING_FILED_WIDTH,
    POINTS_TO_INCREASE_LEVEL,
    SPEED_INCREASE_COEFFICIENT,
    START_LEVEL,
    START_SPEED
} from './constants';
import {TRANSFORMATIONS} from './transformations';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';


export function generateFigure(): Figure {
    let figureBody: FigureBody = generateFigureBody();
    let startPosition = generateFigureStartPosition(figureBody);

    return new Figure(startPosition, figureBody, generateColor());
}

export function createGravityTransformation(): Transformation {
    return TRANSFORMATIONS[KeyCode.DOWN];
}

export function getManualTransformation(keyCode: string): Transformation | undefined {
    return TRANSFORMATIONS[keyCode];
}

export function calculateLevel(points: number): number {
    let newLevel: number = Math.floor(points / POINTS_TO_INCREASE_LEVEL);
    return newLevel < START_LEVEL ? START_LEVEL : newLevel;
}

export function calculateSpeed(level: number): number {
    return START_SPEED + (level - 1) * SPEED_INCREASE_COEFFICIENT;
}

export function applyTransformations(
    {processedFigure, initialFigure, set}: {processedFigure: Figure, initialFigure: Figure, set: BehaviorSubject<Set>},
    {figure, transformations}): {processedFigure: Figure, initialFigure: Figure, set: BehaviorSubject<Set>} {

    if (initialFigure === undefined || figure !== initialFigure) {
        processedFigure = figure;
        initialFigure = figure;
    }

    let currentSet = set.getValue();

    for (let transformation of transformations) {
        let newFigure = transformation.apply(processedFigure, set);

        if (transformation.corrigible) {
            if (checkPlayingFieldCollision(newFigure)) {
                newFigure = correctPlayingFieldCollision(newFigure);
            }

            if (checkSetCollision(currentSet, newFigure)) {
                continue;
            }
        } else if (checkPlayingFieldCollision(newFigure) || checkSetCollision(currentSet, newFigure)) {
            set.next(replenishSet(currentSet, processedFigure));
            break;
        }

        processedFigure = newFigure;
    }

    return {
        processedFigure,
        initialFigure,
        set,
    };
}

export function generateEmptySet(): Set {
    let set = new Array(PLAYING_FILED_WIDTH);
    for (let i = 0; i < set.length; i++) {
        set[i] = new Array();
    }

    return set;
}

export function isSetOverflow(set: Set): boolean {
    for (let columnNumber = 0; columnNumber < set.length; columnNumber++) {
        if (set[columnNumber].length > 1 /*PLAYING_FILED_HEIGHT*/) {
            return true;
        }
    }

    return false;
}

function checkPlayingFieldCollision(figure: Figure): boolean {
    console.log('checkPlayingFieldCollision');
    if (
        figure.position.x < 0
        || figure.position.x + figure.body[0].length - 1 >= PLAYING_FILED_WIDTH
        || figure.position.y < 0
        || figure.position.y + figure.body.length - 1 >= PLAYING_FILED_HEIGHT
    ) {
        return true;
    }

    return false;
}

function correctPlayingFieldCollision(figure: Figure): Figure {
    console.log('correctPlayingFieldCollision');

    return figure;
}

function checkSetCollision(set: Set, figure: Figure): boolean {
    console.log('checkSetCollision');

    return false;
}

function replenishSet(set: Set, figure: Figure): Set {
    console.log('replenishSet');

    set[0].push({
        position: figure.position,
        color: figure.color,
    });

    return set;
}

function generateFigureStartPosition(figureBody: FigureBody): Point2D {
    let figureWidth = figureBody[0].length;
    let startX = Math.ceil(PLAYING_FILED_WIDTH / 2 - figureWidth / 2);

    return {x: startX, y: -1};
}

function generateColor(): Color {
    let colorNames = Object.getOwnPropertyNames(Color);
    let colorName: string = colorNames[getRandomInt(0, colorNames.length)];
    return Color[colorName];
}

function generateFigureBody(): FigureBody {
    return getRandomFigureBody();
}

function getRandomFigureBody(): FigureBody {
    return FIGURE_BODIES[getRandomInt(0, FIGURE_BODIES.length)];
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}