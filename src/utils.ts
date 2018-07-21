import {Color, Figure, FigureBody, KeyCode, Point2D, Transformation} from './types';
import {FIGURE_BODIES} from './figure_bodies';
import {
    PLAYING_FILED_WIDTH,
    POINTS_TO_INCREASE_LEVEL,
    SPEED_INCREASE_COEFFICIENT,
    START_LEVEL,
    START_SPEED
} from './constants';
import {TRANSFORMATIONS} from './transformations';

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

function generateFigureStartPosition(figureBody: FigureBody): Point2D {
    let figureWidth = figureBody[0].length;
    let startX = Math.ceil(PLAYING_FILED_WIDTH / 2 - figureWidth / 2);

    return {x: startX, y: 0};
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