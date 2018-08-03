export interface Point2D {
    x: number;
    y: number;
}

export interface Transformation {
    name: string;
    apply: (figure: Figure, set: Set) => Figure;
    corrigible: boolean;
}

export interface Transformations {
    [key: string]: Transformation;
}

export enum KeyCode {
    LEFT = 'ArrowLeft',
    RIGHT = 'ArrowRight',
    UP = 'ArrowUp',
    DOWN = 'ArrowDown',
    SPACE = 'Space',
}

export enum Color {
    RED = '#DC143C',
    BLUE = '#00BFFF',
    GREEN = '#00FF00',
    YELLOW = '#FFFF00',
    ORANGE = '#FF4500',
}

export type Matrix<T> = Array<Array<T>>;

export type FigureBody = Matrix<boolean>;

export type Set = Array<Array<SetCell>>;

export class Figure {
    readonly position: Point2D;
    readonly body: FigureBody;
    readonly color: Color;

    constructor(position: Point2D, body: FigureBody, color: Color) {
        this.position = position;
        this.body = body;
        this.color = color;
    }
}

export class PlayingField {
    readonly nextFigure: Figure;
    readonly currentFigure: Figure;
    readonly set: Set;
    readonly score: number;
    readonly level: number;


    constructor(
        nextFigure: Figure,
        currentFigure: Figure,
        set: Set,
        score: number,
        level: number
    ) {
        this.nextFigure = nextFigure;
        this.currentFigure = currentFigure;
        this.set = set;
        this.score = score;
        this.level = level;
    }
}

export interface SetCell {
    position: Point2D;
    color: Color;
}