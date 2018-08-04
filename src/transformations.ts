import {Transformations, KeyCode, Figure, Set} from './types';
import {
    copyPoint2D,
    figureBodyIterator,
    generateTwoDimensionArray,
    getFigureWidth,
    getFigureHeight,
    calculatePlayingFieldRowNumber
} from './utils';
import {PLAYING_FILED_ROWS, POINTS_TRANSFORMATION_DROP, POINTS_TRANSFORMATION_MANUAL_DOWN} from './constants';

export const TRANSFORMATIONS: Transformations = {};

TRANSFORMATIONS[KeyCode.LEFT] = {
    name: 'Left',
    apply: (figure: Figure, set: Set) => {
        let position = copyPoint2D(figure.position);
        position.x--;

        return new Figure(position, figure.body, figure.color);
    },
    corrigible: true,
    bonusPoints: 0,
};
TRANSFORMATIONS[KeyCode.RIGHT] = {
    name: 'Right',
    apply: (figure: Figure, set: Set) => {
        let position = copyPoint2D(figure.position);
        position.x++;

        return new Figure(position, figure.body, figure.color);
    },
    corrigible: true,
    bonusPoints: 0,
};
TRANSFORMATIONS[KeyCode.UP] = {
    name: 'Up',
    apply: (figure: Figure, set: Set) => {
        let position = copyPoint2D(figure.position);
        let newBodyWidth = getFigureHeight(figure);
        let newBodyHeight = getFigureWidth(figure);
        let resultBody = generateTwoDimensionArray(newBodyHeight, newBodyWidth);

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

        return new Figure(position, resultBody, figure.color);
    },
    corrigible: true,
    bonusPoints: 0,
};
TRANSFORMATIONS[KeyCode.DOWN] = {
    name: 'Down',
    apply: (figure: Figure, set: Set) => {
        let position = copyPoint2D(figure.position);
        position.y++;

        return new Figure(position, figure.body, figure.color);
    },
    corrigible: false,
    bonusPoints: POINTS_TRANSFORMATION_MANUAL_DOWN,
};
TRANSFORMATIONS[KeyCode.SPACE] = {
    name: 'Drop',
    apply: (figure: Figure, set: Set) => {
        let position = copyPoint2D(figure.position);
        let initX = position.x;
        let initY = position.y;
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
        position.y += minimalDistance;

        return new Figure(position, figure.body, figure.color);
    },
    corrigible: false,
    bonusPoints: POINTS_TRANSFORMATION_DROP,
};