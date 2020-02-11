// Width and height of the input and output images, in pixels. The cell
// width and height are automatically calculated to fit this size.
export const svgWidth = 640 * 2;
export const svgHeight = 640 * 2;

// Should the input matrix be padded
export const PADDED = true;

// Cell border
export const borderWidth = 2;
export const borderColor = "gray";
export const highlightOutlineWidth = borderWidth * 2;
export const highlightOutlineColor = "red";

// Padding between images
export const spaceBetween = 40;

// Width/Height of an individual cell
export const cellWidth = 25;//w / inputWidth;
export const cellHeight = 25;//h / inputHeight;

export const fontSize = Math.min(cellHeight, cellWidth) * 0.9;

// Input image size
export const inputWidth = 28;
export const inputHeight = 28;

// Kernel size
export const kernelWidth = 3;
export const kernelHeight = 3;

// The loss in size from padding
export const inputWidthLoss = PADDED ?
    0 :
    Math.floor((kernelWidth - 1) / 2);
export const inputHeightLoss = PADDED ?
    0 :
    Math.floor((kernelHeight - 1) / 2);

// Output image size
export const outputWidth = PADDED ?
    inputWidth :
    inputWidth - 2 * inputWidthLoss;
export const outputHeight = PADDED ?
    inputHeight :
    inputHeight - 2 * inputHeightLoss;
