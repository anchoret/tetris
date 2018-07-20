export interface Point2D {
    x: number;
    y: number;
}

export interface Transformation {

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

export interface FigureInterface {
    position: Point2D;
    body: FigureBody;
    color: Color;
}

export class Figure implements FigureInterface {
    private _position: Point2D;
    private _body: FigureBody;
    private _color: Color;

    constructor(position: Point2D, body: FigureBody, color: Color) {
        this.position = position;
        this.body = body;
        this.color = color;
    }

    get position(): Point2D {
        return this._position;
    }

    set position(value: Point2D) {
        this._position = value;
    }

    get body(): FigureBody {
        return this._body;
    }

    set body(value: FigureBody) {
        this._body = value;
    }

    get color(): Color {
        return this._color;
    }

    set color(value: Color) {
        this._color = value;
    }
}