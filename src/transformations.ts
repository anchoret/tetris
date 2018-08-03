import {Transformations, KeyCode, Figure, Set} from './types';

export const TRANSFORMATIONS: Transformations = {};

TRANSFORMATIONS[KeyCode.LEFT] = {
    name: 'Left',
    apply: (figure: Figure, set: Set) => {
        let position = figure.position;
        position.x--;

        return new Figure(position, figure.body, figure.color);
    },
    corrigible: true,
};
TRANSFORMATIONS[KeyCode.RIGHT] = {
    name: 'Right',
    apply: (figure: Figure, set: Set) => {
        let position = figure.position;
        position.x++;

        return new Figure(position, figure.body, figure.color);
    },
    corrigible: true,
};
TRANSFORMATIONS[KeyCode.UP] = {
    name: 'Up',
    apply: (figure: Figure, set: Set) => {
        let position = figure.position;
        position.y--;

        return new Figure(position, figure.body, figure.color);
    },
    corrigible: true,
};
TRANSFORMATIONS[KeyCode.DOWN] = {
    name: 'Down',
    apply: (figure: Figure, set: Set) => {
        let position = figure.position;
        position.y++;

        return new Figure(position, figure.body, figure.color);
    },
    corrigible: false,
};
TRANSFORMATIONS[KeyCode.SPACE] = {
    name: 'Drop',
    apply: (figure: Figure, set: Set) => {
        return figure;
    },
    corrigible: false,
};