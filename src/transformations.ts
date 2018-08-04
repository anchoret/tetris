import {Transformations, KeyCode, Figure, Set} from './types';
import {
    copyPoint2D,
    calculateFigureSetDistance,
    rotateFigureClockwise,
} from './utils';
import {POINTS_TRANSFORMATION_DROP, POINTS_TRANSFORMATION_MANUAL_DOWN} from './constants';

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
        return rotateFigureClockwise(figure);
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
        position.y += calculateFigureSetDistance(figure, set);

        return new Figure(position, figure.body, figure.color);
    },
    corrigible: false,
    bonusPoints: POINTS_TRANSFORMATION_DROP,
};