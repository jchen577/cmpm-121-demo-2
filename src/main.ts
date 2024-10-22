import "./style.css";

interface displayable {
  display(context: CanvasRenderingContext2D): void;
}
let strokeWidth: number = 1;
class cursor implements displayable {
  x: number = 0;
  y: number = 0;
  display(context: CanvasRenderingContext2D) {
    context.fillStyle = "black";
    if (drawEmote) {
      context.globalAlpha = 0.7;
      context.fillText(currText, this.x, this.y);
    } else {
      context.fillText(currText, this.x - 10, this.y + 6);
    }
    context.fillStyle = "white";
  }
}
class stickers implements displayable {
  holder: string[] = [];
  holder2: number[][] = [];
  holder3: number[][] = [];
  holder4: string[] = [];
  drag(x: number, y: number): void {
    this.holder.push(currText);
    this.holder2.push([x, y]);
  }
  readd(pos: number[], str: string) {
    this.holder4.push(str);
    this.holder3.push(pos);
  }
  display(context: CanvasRenderingContext2D) {
    context.globalAlpha = 1;
    for (let i = 0; i < this.holder2.length; i++) {
      context.fillText(this.holder[i], this.holder2[i][0], this.holder2[i][1]);
    }
  }
}
class markerLines implements displayable {
  holder: number[][] = [];
  holder2: number[][][] = [];
  holder3: string[] = [];
  holder4: string = "";
  constructor() {}
  drag(x: number, y: number, x2: number, y2: number, lineWidth: number): void {
    this.holder.push([x, y, x2, y2, lineWidth]);
  }
  display(context: CanvasRenderingContext2D) {
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    if (!isDrawing) {
      for (let i = 0; i < this.holder2.length; i++) {
        for (let j = 0; j < this.holder2[i].length; j++) {
          drawLine(
            context,
            this.holder2[i][j][0],
            this.holder2[i][j][1],
            this.holder2[i][j][2],
            this.holder2[i][j][3],
            this.holder2[i][j][4],
            this.holder3[i]
          );
        }
      }
    } else {
      for (let k = 0; k < this.holder.length; k++) {
        drawLine(
          ctx,
          this.holder[k][0],
          this.holder[k][1],
          this.holder[k][2],
          this.holder[k][3],
          this.holder[k][4],
          this.holder4[0]
        );
      }
      for (let i = 0; i < this.holder2.length; i++) {
        for (let j = 0; j < this.holder2[i].length; j++) {
          drawLine(
            context,
            this.holder2[i][j][0],
            this.holder2[i][j][1],
            this.holder2[i][j][2],
            this.holder2[i][j][3],
            this.holder2[i][j][4],
            this.holder3[i]
          );
        }
      }
    }
  }
}

const app = document.querySelector<HTMLDivElement>("#app")!;

const appTitle = document.createElement("h1");
appTitle.innerHTML = "DRAW!";
app.append(appTitle);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.canvas.width = 256;
ctx.canvas.height = 256;

ctx.fillStyle = "white";
ctx.font = "32px monospace";
ctx.fillRect(10, 10, ctx.canvas.width, ctx.canvas.height);
let x = 0;
let y = 0;
let isDrawing: boolean = false;
let currText: string = "+";
let drawEmote = false;
const drawChangeEvent = new Event("drawChange");
const toolChangeEvent = new Event("toolMoved");
const displayCommand: markerLines = new markerLines();
const cursorCommand: cursor = new cursor();
const redoCommand: markerLines = new markerLines();
const stickersCommand: stickers = new stickers();
canvas?.addEventListener(
  "drawChange",
  () => {
    displayCommand.display(ctx);
    cursorCommand.display(ctx);
    stickersCommand.display(ctx);
  },
  false
);
canvas?.addEventListener(
  "toolMoved",
  () => {
    displayCommand.display(ctx);
    cursorCommand.display(ctx);
    stickersCommand.display(ctx);
  },
  false
);
canvas?.addEventListener("mousedown", (pos: MouseEvent) => {
  redoCommand.holder = [];
  x = pos.offsetX;
  y = pos.offsetY;
  isDrawing = true;
  if (drawEmote) {
    stickersCommand.drag(x, y);
  }
  cursorCommand.x = pos.offsetX;
  cursorCommand.y = pos.offsetY;
  canvas.dispatchEvent(toolChangeEvent);
});

canvas?.addEventListener("mousemove", (pos: MouseEvent) => {
  if (isDrawing) {
    //holder.push([x, y, pos.offsetX, pos.offsetY]);
    if (!drawEmote) {
      displayCommand.holder4 = ctx.strokeStyle;
      displayCommand.drag(x, y, pos.offsetX, pos.offsetY, strokeWidth);
    }
    x = pos.offsetX;
    y = pos.offsetY;
    canvas.dispatchEvent(drawChangeEvent);
  }
  cursorCommand.x = pos.offsetX;
  cursorCommand.y = pos.offsetY;
  canvas.dispatchEvent(toolChangeEvent);
});

canvas?.addEventListener("mouseup", (pos: MouseEvent) => {
  if (isDrawing) {
    if (!drawEmote) {
      displayCommand.drag(x, y, pos.offsetX, pos.offsetY, strokeWidth);
      displayCommand.holder2.push(displayCommand.holder);
      displayCommand.holder3.push(displayCommand.holder4);
    }
    isDrawing = false;
    x = 0;
    y = 0;
    displayCommand.holder = [];
    canvas.dispatchEvent(drawChangeEvent);
  }
  cursorCommand.x = pos.offsetX;
  cursorCommand.y = pos.offsetY;
  canvas.dispatchEvent(toolChangeEvent);
});
canvas?.addEventListener("mouseenter", (pos: MouseEvent) => {
  canvas.style.cursor = "none";
  cursorCommand.x = pos.offsetX;
  cursorCommand.y = pos.offsetY;
  canvas.dispatchEvent(toolChangeEvent);
});
canvas?.addEventListener("mouseout", (pos: MouseEvent) => {
  //canvas.style.cursor = "default";
  cursorCommand.x = pos.offsetX;
  cursorCommand.y = pos.offsetY;
  canvas.dispatchEvent(toolChangeEvent);
});

const clear = createNewButton("clear");
const undoer = createNewButton("undo");
const redoer = createNewButton("redo");
const thin = createNewButton("thin");
const thick = createNewButton("thick");
const changeColor = createNewButton("change color");
createNewSticker("🧠");
createNewSticker("👊");
createNewSticker("💀");
const custom = createNewButton("custom sticker");
const exportor = createNewButton("export");
exportor.onclick = () => {
  const anchor = document.createElement("a");
  let newCanv = document.getElementById("canvas");
  let ctx2 = newCanv.getContext("2d");
  ctx2.canvas.width = 1024;
  ctx2.canvas.height = 1024;
  ctx2.scale(4, 4);
  ctx2.fillStyle = "white";
  displayCommand.display(ctx2);
  stickersCommand.display(ctx2);
  anchor.href = newCanv.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
  newCanv = null;
  ctx2.canvas.width = 256;
  ctx2.canvas.height = 256;
  ctx2 = null;
  newCanv = null;
};
changeColor.onclick = () => {
  const color: string = prompt("What color would you like?: ", "");
  const before = ctx.strokeStyle;
  ctx.strokeStyle = color;
  if (ctx.strokeStyle == before) {
    console.log("Invalid Color");
  }
};
clear.onclick = () => {
  clearCanvas(ctx);
};
undoer.onclick = () => {
  undo();
};
redoer.onclick = () => {
  redo();
};
thin.onclick = () => {
  drawEmote = false;
  strokeWidth = 1;
  currText = "+";
};
thin.addEventListener("mouseenter", () => {});
thick.onclick = () => {
  drawEmote = false;
  strokeWidth = 5;
  currText = "+";
};
custom.onclick = () => {
  let stick: string = prompt("Please Input A Sticker: ", "");
  if (stick) {
    createNewSticker(stick);
  }
};
function drawLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  lineWidth: number,
  color: string
) {
  context.lineWidth = lineWidth;
  const prevColor = context.strokeStyle;
  context.strokeStyle = color;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
  context.strokeStyle = prevColor;
}
function clearCanvas(context: CanvasRenderingContext2D) {
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  for (let i = 0; i < displayCommand.holder2.length; i++) {
    redoCommand.holder2.push(displayCommand.holder2[i]);
  }
  displayCommand.holder3 = [];
  displayCommand.holder2 = [];
  stickersCommand.holder = [];
  stickersCommand.holder2 = [];
}
function undo() {
  if (drawEmote) {
    if (stickersCommand.holder.length > 0) {
      stickersCommand.holder3.push(stickersCommand.holder2.pop());
      stickersCommand.holder4.push(stickersCommand.holder.pop());
      canvas?.dispatchEvent(toolChangeEvent);
    }
  } else {
    if (displayCommand.holder2.length > 0) {
      redoCommand.holder2.push(displayCommand.holder2.pop());
      redoCommand.holder3.push(displayCommand.holder3.pop());
      canvas?.dispatchEvent(drawChangeEvent);
    }
  }
}

function createNewSticker(stick: string) {
  const newStick = document.createElement("button");
  newStick.innerHTML = stick;
  app.append(newStick);
  newStick.onclick = () => {
    drawEmote = true;
    currText = stick;
  };
}
function createNewButton(name: string) {
  const newButt = document.createElement("button");
  newButt.innerHTML = name;
  app.append(newButt);
  return newButt;
}

function redo() {
  if (drawEmote) {
    if (stickersCommand.holder3.length > 0) {
      stickersCommand.holder2.push(stickersCommand.holder3.pop());
      stickersCommand.holder.push(stickersCommand.holder4.pop());
      canvas?.dispatchEvent(toolChangeEvent);
    }
  } else {
    if (redoCommand.holder2.length > 0) {
      displayCommand.holder2.push(redoCommand.holder2.pop());
      displayCommand.holder3.push(redoCommand.holder3.pop());
      canvas?.dispatchEvent(drawChangeEvent);
    }
  }
}
