import {PLAYING_FILED_ROWS, PLAYING_FILED_COLUMNS} from './constants';
import {Color, Figure, PlayingField, Point2D, Set} from './types';
import {figureBodyIterator, getFigureHeight, getFigureWidth} from './utils';

const GAP_SIZE = 2;
const CELL_SIZE = 20;
const ADDITIONAL_COLUMN_WIDTH = 200;
const ADDITIONAL_COLUMN_PADDING = 20;
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
    renderNextFigure(renderingContext, playingField.nextFigure);
    renderSet(renderingContext, playingField.set);
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
    let startPosition = calculateNextFigureStartPosition(figure);

    figureBodyIterator(figure, (cellNumber, lineNumber, color) => {
        let point = {
            x: cellNumber,
            y: lineNumber,
        };
        paintCell(renderingContext, point, color, startPosition.x, startPosition.y);
    });
}

function paintCell(renderingContext: CanvasRenderingContext2D, point: Point2D, color: string, startX: number = 0, startY: number = 0) {
    const x = startX + point.x * CELL_SIZE + (point.x * GAP_SIZE);
    const y = startY + point.y * CELL_SIZE + (point.y * GAP_SIZE);

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
    let position = getNextFigureAreaPosition();
    let size = getNextFigureAreaSize();
    renderingContext.fillRect(
        position.x,
        position.y,
        size.width,
        size.height,
    );
}

function getNextFigureAreaPosition(): Point2D {
    return {
        x: PLAYING_FILED_WIDTH + ADDITIONAL_COLUMN_PADDING,
        y: PLAYING_FILED_HEIGHT / 2 + ADDITIONAL_COLUMN_PADDING,
    };
}

function getNextFigureAreaSize() {
    return {
        height: PLAYING_FILED_HEIGHT / 2 - 2 * ADDITIONAL_COLUMN_PADDING,
        width: ADDITIONAL_COLUMN_WIDTH - 2 * ADDITIONAL_COLUMN_PADDING,
    };
}

function calculateNextFigureStartPosition(figure: Figure): {x: number, y: number} {
    let parentAreaStartPosition = getNextFigureAreaPosition();
    let parentAreaSize = getNextFigureAreaSize();
    let figureWidthPx = getFigureWidth(figure) * (CELL_SIZE + GAP_SIZE);
    let figureHeightPx = getFigureHeight(figure) * (CELL_SIZE + GAP_SIZE);
    return {
        x: parentAreaStartPosition.x + parentAreaSize.width / 2 - figureWidthPx / 2,
        y: parentAreaStartPosition.y + parentAreaSize.height / 2 - figureHeightPx / 2,
    };
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