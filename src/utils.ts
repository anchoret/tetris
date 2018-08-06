import {Color, Figure, FigureBody, KeyCode, Point2D, Set, Transformation} from './types';
import {FIGURE_BODIES} from './figure_bodies';
import {
    PLAYING_FILED_ROWS,
    PLAYING_FILED_COLUMNS,
    POINTS_TO_INCREASE_LEVEL,
    SPEED_INCREASE_COEFFICIENT,
    START_LEVEL,
    START_SPEED,
    POINTS_FILLED_ROW,
} from './constants';
import {TRANSFORMATIONS} from './transformations';


export function generateFigure(): Figure {
    let figureBody: FigureBody = generateFigureBody();
    let startPosition = generateFigureStartPosition(figureBody);

    return applyRandomRotates(new Figure(startPosition, figureBody, generateColor()));
}

export function createGravityTransformation(): Transformation {
    let transformation = Object.assign({}, TRANSFORMATIONS[KeyCode.DOWN]);
    transformation.bonusPoints = 0;
    return transformation;
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
    {processedFigure, initialFigure, isFinale = false, bonusPoints = 0}:
        {processedFigure: Figure, initialFigure: Figure, isFinale: boolean, bonusPoints: number},
    {figure, transformations, currentSet}):
        {processedFigure: Figure, initialFigure: Figure, isFinale: boolean, bonusPoints: number} {

    isFinale = false;
    bonusPoints = 0;

    if (initialFigure === undefined || figure !== initialFigure) {
        processedFigure = figure;
        initialFigure = figure;
    }

    for (let transformation of transformations) {
        let newFigure = transformation.apply(processedFigure, currentSet);

        if (transformation.corrigible) {
            if (checkPlayingFieldCollision(newFigure)) {
                newFigure = correctPlayingFieldCollision(newFigure);
            }

            if (checkSetCollision(currentSet, newFigure)) {
                continue;
            }
        } else if (checkSetCollision(currentSet, newFigure)) {
            isFinale = true;
            break;
        }

        processedFigure = newFigure;
        bonusPoints += transformation.bonusPoints;
    }

    return {
        processedFigure,
        initialFigure,
        isFinale,
        bonusPoints,
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

export function rotateFigureClockwise(figure: Figure, count: number = 1): Figure {
    let position = copyPoint2D(figure.position);
    let newBodyWidth = getFigureHeight(figure);
    let newBodyHeight = getFigureWidth(figure);
    let resultBody = generateTwoDimensionArray(newBodyHeight, newBodyWidth);
    for (let i = 0; i <= count; i++) {
        figureBodyIterator(
            figure,
            (cellNumber, lineNumber) => {
                resultBody[cellNumber][lineNumber] = true;
            },
            (cellNumber, lineNumber) => {
                resultBody[cellNumber][lineNumber] = false;
            },
        );
        for (let i = 0; i < newBodyHeight; i++) {
            resultBody[i] = resultBody[i].reverse();
        }
    }

    return new Figure(position, resultBody, figure.color);
}

export function calculateFigureSetDistance(figure: Figure, set: Set): number {
    let initX = figure.position.x;
    let initY = figure.position.y;
    let figureHeight = getFigureHeight(figure);
    let figureWidth = getFigureWidth(figure);
    let minimalDistance = PLAYING_FILED_ROWS;

    for (let i = 0; i < figureWidth; i++) {
        let figureBottomCellY = initY + figureHeight - 1;
        for (let j = figureHeight - 1; j >= 0; j--) {
            if (figure.body[j][i]) {
                figureBottomCellY = initY + j;
                break;
            }
        }
        let setTopCellY = set[initX + i].length;
        let distance = calculatePlayingFieldRowNumber(setTopCellY) - figureBottomCellY;
        if (distance < minimalDistance) {
            minimalDistance = distance;
        }
    }

    return minimalDistance;
}

export function getFilledRowIndexes(set: Set): Array<number> {
    let filledRowNumbers = new Array();
    let setWidth = set.length;
    let maxSetHeight = getMaxSetColumnHeight(set);
    for (let i = 0; i < maxSetHeight; i++) {
        for (let j = 0; j < setWidth; j++) {
            if (!set[j][i]) {
                break;
            } else if (j === setWidth - 1) {
                filledRowNumbers.push(i);
            }
        }
    }

    return filledRowNumbers;
}

export function calculateFilledRowPoints(filledRowIndexes: Array<number>): number {
    return filledRowIndexes.length * POINTS_FILLED_ROW * filledRowIndexes.length;
}

export function removeSetRows(set: Set, rowIndexes: Array<number>): Set {
    let needleDeleteRows = optimizeNeedleDeleteRows(rowIndexes);
    let updatedSet = copySet(set);

    needleDeleteRows.forEach((deleteCount, rowIndex) => {
        updatedSet.forEach((column, columnIndex, set) => {
            set[columnIndex].splice(rowIndex, deleteCount);
        });
    });

    return updatedSet;
}

export function replenishSet(set: Set, figure: Figure): Set {
    let initX = figure.position.x;
    let initY = figure.position.y;
    let updatedSet = copySet(set);

    figureBodyIterator(figure, (cellNumber, lineNumber, color) => {
        let setRowNumber = calculateSetRowNumber(initY + lineNumber);
        let setColumnNumber = initX + cellNumber;
        updatedSet[setColumnNumber][setRowNumber] = color;
    });

    return updatedSet;
}

function copySet(set: Set): Set {
    let updatedSet = generateEmptySet();
    set.forEach((column, columnIndex) => {
        updatedSet[columnIndex] = column.slice(0);
    });

    return updatedSet;
}

function applyRandomRotates(figure: Figure): Figure {
    let rotateCount = getRandomInt(0, 3);
    let resultFigure = figure;
    if (rotateCount > 0) {
        resultFigure = rotateFigureClockwise(figure, rotateCount);
        resultFigure = new Figure(
            generateFigureStartPosition(resultFigure.body),
            resultFigure.body,
            resultFigure.color
        );
    }

    return resultFigure;
}

function optimizeNeedleDeleteRows(rowIndexes: Array<number>): Array<number> {
    return rowIndexes.reduce(
        (previousState: Array<number>, currentRowIndex: number): Array<number> => {
            let previousRowIndex = previousState.length > 0 ? previousState.length - 1 : undefined;
            let resultArray = previousState;
            if (previousRowIndex !== undefined && previousRowIndex + previousState[previousRowIndex] === currentRowIndex) {
                resultArray[previousRowIndex]++;
            } else {
                let previousDeleteRowCount = resultArray.reduce((previous, current) => previous + current, 0);
                resultArray[currentRowIndex - previousDeleteRowCount] = 1;
            }
            return resultArray;
        }, []);
}

function getMaxSetColumnHeight(set: Set): number {
    let setColumnHeights = set.map(column => column.length);

    return Math.max.apply(null, setColumnHeights);
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
        if (setRowNumber < 0 || set[setColumnNumber][setRowNumber]) {
            collision = true;

            return;
        }
    });

    return collision;
}

function calculateSetRowNumber (playingFieldRowNumber: number): number {
    return PLAYING_FILED_ROWS - 1 - playingFieldRowNumber;
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