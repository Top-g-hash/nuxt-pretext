export function drawToCanvas(canvas: HTMLCanvasElement, layoutResult) {
  const ctx = canvas.getContext("2d");

  ctx.font = layoutResult.font;

  layoutResult.lines.forEach((line) => {
    ctx.fillText(line.text, line.x, line.y);
  });
}
