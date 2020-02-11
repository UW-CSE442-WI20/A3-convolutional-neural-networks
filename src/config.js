// Width and height of the input and output images, in pixels. The cell
// width and height are automatically calculated to fit this size.
export const img_width = 640
export const img_height = 640

// Should the input matrix be padded
export const PADDED = true;

// Cell border
export const borderWidth = 2;
export const borderColor = "gray";
export const highlightOutlineWidth = borderWidth * 1;
export const highlightOutlineColor = "red";

// Padding between images
export const spaceBetween = img_width / 2;

export const fontSize = Math.min(cellHeight, cellWidth) * 0.5;

// Input image size
export const inputWidth = 28;
export const inputHeight = 28;

// Width/Height of an individual cell
export const cellWidth = img_width / inputWidth;
export const cellHeight = img_height / inputHeight;

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
