import {Color, Figure, FigureBody, KeyCode, Point2D, Set, Transformation} from './types';
import {FIGURE_BODIES} from './figure_bodies';
import {
    PLAYING_FILED_ROWS,
    PLAYING_FILED_COLUMNS,
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
        let newFigure = transformation.apply(processedFigure, currentSet);

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
    return generateTwoDimensionArray(PLAYING_FILED_COLUMNS);
}

export function isSetOverflow(set: Set): boolean {
    for (let columnNumber = 0; columnNumber < set.length; columnNumber++) {
        if (set[columnNumber].length >= PLAYING_FILED_ROWS) {
            return true;
        }
    }

    return false;
}

export function figureBodyIterator(
    figure: Figure,
    filledCellCallBack?: (cellNumber: number, lineNumber: number, color: Color) => void,
    emptyCellCallBack?:  (cellNumber: number, lineNumber: number) => void
) {
    figure.body.forEach((line, lineNumber) => {
        line.forEach((isCellFill, cellNumber) => {
            if (isCellFill && filledCellCallBack) {
                filledCellCallBack(cellNumber, lineNumber, figure.color);
            } else if (!isCellFill && emptyCellCallBack) {
                emptyCellCallBack(cellNumber, lineNumber);
            }
        });
    });
}

export function copyPoint2D(position: Point2D): Point2D {
    return {
        x: position.x,
        y: position.y,
    };
}

export function generateTwoDimensionArray(height: number, width?: number): Array<Array<any>> {
    if (width === undefined ) {
        width = height;
    }

    let array = new Array(height);
    for (let i = 0; i < height; i++) {
        array[i] = new Array();
    }

    return array;
}

export function getFigureHeight(figure: Figure): number {
    return figure.body.length;
}

export function getFigureWidth(figure: Figure): number {
    return figure.body[0].length;
}

export function calculatePlayingFieldRowNumber (setRowNumber: number): number {
    return Math.abs(PLAYING_FILED_ROWS - setRowNumber - 1);
}

function checkPlayingFieldCollision(figure: Figure): boolean {
    if (
        figure.position.x < 0
        || figure.position.x + getFigureWidth(figure) - 1 >= PLAYING_FILED_COLUMNS
        || figure.position.y < 0
        || figure.position.y + getFigureHeight(figure) - 1 >= PLAYING_FILED_ROWS
    ) {
        return true;
    }

    return false;
}

function correctPlayingFieldCollision(figure: Figure): Figure {
    let figureWidth = getFigureWidth(figure);
    let figureHeight = getFigureHeight(figure);
    let position = {
        x: figure.position.x < 0 ?
            0 : (figure.position.x + figureWidth - 1) >= PLAYING_FILED_COLUMNS ?
                (PLAYING_FILED_COLUMNS - figureWidth) : figure.position.x,
        y: figure.position.y < 0 ?
            0 : (figure.position.y + figureHeight - 1) >= PLAYING_FILED_ROWS ?
                (PLAYING_FILED_ROWS - figureHeight) : figure.position.y,
    };

    return new Figure(position, figure.body, figure.color);
}

function checkSetCollision(set: Set, figure: Figure): boolean {
    let initX = figure.position.x;
    let initY = figure.position.y;
    let collision = false;

    figureBodyIterator(figure, (cellNumber, lineNumber, color) => {
        let setRowNumber = calculateSetRowNumber(initY + lineNumber);
        let setColumnNumber = initX + cellNumber;
        if (set[setColumnNumber][setRowNumber]) {
            collision = true;

            return;
        }
    });

    return collision;
}

function replenishSet(set: Set, figure: Figure): Set {
    let initX = figure.position.x;
    let initY = figure.position.y;

    figureBodyIterator(figure, (cellNumber, lineNumber, color) => {
        let setRowNumber = calculateSetRowNumber(initY + lineNumber);
        let setColumnNumber = initX + cellNumber;
        set[setColumnNumber][setRowNumber] = color;
    });

    return set;
}

function calculateSetRowNumber (playingFieldRowNumber: number): number {
    return Math.abs(PLAYING_FILED_ROWS - playingFieldRowNumber - 1);
}

function generateFigureStartPosition(figureBody: FigureBody): Point2D {
    let figureWidth = figureBody[0].length;
    let startX = Math.ceil(PLAYING_FILED_COLUMNS / 2 - figureWidth / 2);

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