import {PLAYING_FILED_ROWS, PLAYING_FILED_COLUMNS} from './constants';
import {Color, Figure, PlayingField, Point2D, Set} from './types';
import {figureBodyIterator} from './utils';

const GAP_SIZE = 2;
const CELL_SIZE = 20;
const ADDITIONAL_COLUMN_WIDTH = 200;
const PLAYING_FILED_WIDTH = PLAYING_FILED_COLUMNS * (CELL_SIZE + GAP_SIZE) - GAP_SIZE;
const PLAYING_FILED_HEIGHT = PLAYING_FILED_ROWS * (CELL_SIZE + GAP_SIZE) - GAP_SIZE;
const CANVAS_WIDTH = PLAYING_FILED_WIDTH + ADDITIONAL_COLUMN_WIDTH;
const CANVAS_HEIGHT = PLAYING_FILED_HEIGHT;

export function createCanvasElement(): CanvasRenderingContext2D {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    document.body.appendChild(canvas);

    return canvas.getContext('2d');
}

export function renderPlayingField(renderingContext: CanvasRenderingContext2D, playingField: PlayingField) {
    renderBackground(renderingContext);
    renderScore(renderingContext, playingField.score);
    renderCurrentFigure(renderingContext, playingField.currentFigure);
    renderSet(renderingContext, playingField.set);
    // renderApples(renderingContext, scene.apples);
    // renderSnake(renderingContext, scene.snake);
}

export function renderGameOver(renderingContext: CanvasRenderingContext2D) {
    renderingContext.fillStyle = 'rgba(255, 255, 255, 0.7)';
    renderingContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    let textX = CANVAS_WIDTH / 2;
    let textY = CANVAS_HEIGHT / 2;

    drawText(renderingContext, 'GAME OVER!', textX, textY, 'black', 25);
}

function renderScore(renderingContext: CanvasRenderingContext2D, score: number) {
    let textX = CANVAS_WIDTH / 2;
    let textY = CANVAS_HEIGHT / 2;

    drawText(renderingContext, score.toString(), textX, textY, 'rgba(0, 0, 0, 0.1)', 150);
}

/*function renderApples(renderingContext: CanvasRenderingContext2D, apples: any[]) {
    apples.forEach(apple => paintCell(renderingContext, apple, 'red'));
}*/

function renderCurrentFigure(renderingContext: CanvasRenderingContext2D, figure: Figure) {
    let initX = figure.position.x;
    let initY = figure.position.y;

    figureBodyIterator(figure, (cellNumber, lineNumber, color) => {
        let point = {
            x: initX + cellNumber,
            y: initY + lineNumber,
        };
        paintCell(renderingContext, point, color);
    });
}

function renderSet(renderingContext: CanvasRenderingContext2D, set: Set) {
    set.forEach((column, setColumnNumber) => {
        column.forEach((color: Color, setRowNumber) => {
            let point = {
                x: setColumnNumber,
                y: PLAYING_FILED_ROWS - setRowNumber - 1,
            };
            paintCell(renderingContext, point, color);
        });
    });
}

function renderNextFigure(renderingContext: CanvasRenderingContext2D, figure: Figure) {

}

function paintCell(renderingContext: CanvasRenderingContext2D, point: Point2D, color: string) {
    const x = point.x * CELL_SIZE + (point.x * GAP_SIZE);
    const y = point.y * CELL_SIZE + (point.y * GAP_SIZE);

    renderingContext.fillStyle = color;
    renderingContext.fillRect(x, y, CELL_SIZE, CELL_SIZE);
}

function renderBackground(renderingContext: CanvasRenderingContext2D) {
    renderingContext.fillStyle = '#eee2e1';
    renderingContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    renderMainArea(renderingContext);
    renderNextFigureArea(renderingContext);
}

function renderMainArea(renderingContext: CanvasRenderingContext2D) {
    renderingContext.fillStyle = '#b6aeee';
    renderingContext.fillRect(0, 0, PLAYING_FILED_WIDTH, PLAYING_FILED_HEIGHT);
}

function renderNextFigureArea(renderingContext: CanvasRenderingContext2D) {
    renderingContext.fillStyle = '#b6aeee';
    renderingContext.fillRect(PLAYING_FILED_WIDTH + 20, 0 + 20, ADDITIONAL_COLUMN_WIDTH - 40, PLAYING_FILED_HEIGHT / 2 - 40);
}

function drawText(
    renderingContext: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fillStyle: string,
    fontSize: number,
    horizontalAlign: string = 'center',
    verticalAlign: string = 'middle'
) {
    renderingContext.fillStyle = fillStyle;
    renderingContext.font = `bold ${fontSize}px sans-serif`;
    renderingContext.textAlign = horizontalAlign;
    renderingContext.textBaseline = verticalAlign;

    renderingContext.fillText(text, x, y);
}