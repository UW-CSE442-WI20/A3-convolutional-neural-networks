export const svgWidth = window.innerWidth * 0.95;

// Width and height of the input and output images, in pixels. The cell
// width and height are automatically calculated to fit this size.
export const img_width = svgWidth * 2 / 5;
export const img_height = img_width;

// Should the input matrix be padded
export const PADDED = true;

// Cell border
export const borderWidth = 2;
export const borderColor = "gray";
export const highlightOutlineWidth = borderWidth * 1;
export const highlightOutlineColor = "red";

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

// Width/Height of an individual cell
export const cellWidth = img_width / (inputWidth + 2);
export const cellHeight = img_height / (inputHeight + 2);

export const fontSize = Math.min(cellHeight, cellWidth) * 0.9;

// Padding between images
export const spaceBetween = img_width / 2;

export const timePerLine = 500;
