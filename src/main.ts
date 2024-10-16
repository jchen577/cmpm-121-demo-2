import "./style.css";

//const APP_NAME = "Hello";
const app = document.querySelector<HTMLDivElement>("#app")!;

//document.title = APP_NAME;
//app.innerHTML = APP_NAME;

const appTitle = document.createElement("h1");
appTitle.innerHTML = "DRAW!";
app.append(appTitle);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 256;
canvas.height = 256;

ctx.fillStyle = "white";
ctx.fillRect(10, 10, 256, 256);
let x = 0;
let y = 0;
let isDrawing: boolean = false;
let points: number[][][] = [];
let holder: number[][] = [];
let undoPoints: number[][][] = [];
const drawChangeEvent = new Event("drawChange");
canvas?.addEventListener(
  "drawChange",
  () => {
    if (!isDrawing) {
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points[i].length; j++) {
          drawLine(
            ctx,
            points[i][j][0],
            points[i][j][1],
            points[i][j][2],
            points[i][j][3]
          );
        }
      }
    } else {
      for (let i = 0; i < holder.length; i++) {
        drawLine(ctx, holder[i][0], holder[i][1], holder[i][2], holder[i][3]);
      }
    }
  },
  false
);
canvas?.addEventListener("mousedown", (pos: MouseEvent) => {
  x = pos.offsetX;
  y = pos.offsetY;
  isDrawing = true;
});

canvas?.addEventListener("mousemove", (pos: MouseEvent) => {
  if (isDrawing) {
    //drawLine(ctx, x, y, pos.offsetX, pos.offsetY);
    //points.push([x, y, pos.offsetX, pos.offsetY, 0]);
    holder.push([x, y, pos.offsetX, pos.offsetY]);
    canvas.dispatchEvent(drawChangeEvent);
    x = pos.offsetX;
    y = pos.offsetY;
  }
});

canvas?.addEventListener("mouseup", (pos: MouseEvent) => {
  if (isDrawing) {
    //drawLine(ctx, x, y, pos.offsetX, pos.offsetY);
    holder.push([x, y, pos.offsetX, pos.offsetY]);
    points.push(holder);
    //points.push([x, y, pos.offsetX, pos.offsetY, tracker]);
    isDrawing = false;
    canvas.dispatchEvent(drawChangeEvent);
    x = 0;
    y = 0;
    holder = [];
  }
});

const clear = document.createElement("button");
clear.innerHTML = "clear";
app.append(clear);
const undoer = document.createElement("button");
undoer.innerHTML = "undo";
app.append(undoer);
const redoer = document.createElement("button");
redoer.innerHTML = "redo";
app.append(redoer);

clear.onclick = () => {
  clearCanvas(ctx);
};
undoer.onclick = () => {
  undo();
};
redoer.onclick = () => {
  redo();
};

function drawLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}
function clearCanvas(context: CanvasRenderingContext2D) {
  context.fillRect(0, 0, 256, 256);
  points = [];
  undoPoints = [];
}
function undo() {
  if (points.length > 0) {
    undoPoints.push(points.pop());
    canvas?.dispatchEvent(drawChangeEvent);
  }
}

function redo() {
  if (undoPoints.length > 0) {
    points.push(undoPoints.pop());
    canvas?.dispatchEvent(drawChangeEvent);
  }
}
