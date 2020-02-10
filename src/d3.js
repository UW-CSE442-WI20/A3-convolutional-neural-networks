import * as d3 from "d3";
import * as tf from '@tensorflow/tfjs'

// Width and height of the input and output images, in pixels. The cell
// width and height are automatically calculated to fit this size.
const w = 640;
const h = 640;

// Should the input matrix be padded
var PADDED = true;

// Cell border
const borderWidth = 1;

// Padding between images
const spaceBetween = 40;

// Input image size
const inputWidth = 28;
const inputHeight = 28;

// Width/Height of an individual cell
const cellWidth = w / inputWidth;
const cellHeight = h / inputHeight;

// Kernel size
const kernelWidth = 3;
const kernelHeight = 3;

// The loss in size from padding
const inputWidthLoss = PADDED ?
    0 :
    Math.floor((kernelWidth - 1) / 2);
const inputHeightLoss = PADDED ?
    0 :
    Math.floor((kernelHeight - 1) / 2);

// Output image size
const outputWidth = PADDED ?
    inputWidth :
    inputWidth - 2 * inputWidthLoss;
const outputHeight = PADDED ?
    inputHeight :
    inputHeight - 2 * inputHeightLoss;

// Currently highlighted selection
let selectionX = null;
let selectionY = null;

let image = tf.zeros([1, inputWidth, inputHeight, 1]);
let filteredImg = tf.zeros([outputWidth, outputHeight]);
let kernel = tf.zeros([kernelWidth, kernelHeight, 1, 1]);

const x_scale = d3.scaleLinear()
            .domain([0, inputWidth - 1])
            .range([0, cellWidth * (inputWidth - 1)])
const y_scale = d3.scaleLinear()
            .domain([0, inputHeight - 1])
            .range([0, cellHeight * (inputHeight - 1)])
const color_scale =
            d3.scaleLinear()
                .domain([0, 1])
                .range([1, 0])

function loadImage(url) {
    const canvas = document.getElementById('input-image');
    const context = canvas.getContext('2d');

    const pixelValues = [];

    for (let i = 0; i < canvas.height; i++) {
        pixelValues[i] = [];
    }

    function grayScaleImage() {
        const imgData = context.getImageData(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < imgData.data.length; i += 4) {
            let x = (i / 4) % canvas.width;
            let y = Math.floor((i / 4) / canvas.width);
            pixelValues[y][x] = grayToFloat(d3.rgb(imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]));
        }

        image = tf.reshape(tf.tensor(pixelValues), [1, 28, 28, 1]);
        refreshData();
    }

    const base_image = new Image();
    base_image.onload = function(){
        context.drawImage(base_image, 0, 0);
        grayScaleImage();
    }

    base_image.crossOrigin = "Anonymous";
    base_image.src = url;
}

/************** TODO ******************
function clear_output(img_size) {
    // Set all values to 0 and colors to white
    d3.selectAll("#output").data([...Array(img_size)].map(() => 0))
      .attr("fill", "white")
}

function auto_conv(img_size, kernel) {
    clear_output(img_size)

    var i = 0
    d3.interval
    var interval = d3.interval(t => {
        // Special case for start, where we can't do conv out
        if(i > 0)
            conv_out(i - 1, kernel)

        conv_in(i, kernel)

        i += 1
        // Finished convolution, so stop
        if (i == img_size) {
            conv_out(i - 1, kernel)
            interval.stop()
        }
    }, 100)
}
*/

/**
 * Returns an RGB color of gray accosiated with the floated gray value.
 * 
 * @param {number} f A value [0, 1] representing a shade of gray
 */
function floatToGray(f) {
    return d3.rgb(f * 255, f * 255, f * 255);
}
/**
 * Returns a float [0, 1] representing the shade of gray passed in.
 * 
 * @param {RGBColor} rgb A d3 rgb representing a shade of gray
 */
function grayToFloat(rgb) {
    return ((rgb.r + rgb.g + rgb.b) / 3.0) / 255.0;
}

/**
 * Return a tensor of random floats. Output shape is [1, w, h, c].
 * 
 * @param {number} w width
 * @param {number} h height
 * @param {number} c channels
 */
function randImgTensor(w, h, c) {
    return tf.tensor([[...Array(w)].map(() => [...Array(h)].map(() => [...Array(c)].map(() => Math.random())))]);
}

/**
 * Return the given tensor as a one-dimensional array.
 * 
 * @param {tf.Tensor} t
 */
function tensorToFlat(t) {
    return tf.reshape(t, [-1]).arraySync();
}

/**
 * Returns a convolution layer. To apply the convolution, call .apply(<image>).
 * 
 * @param {number[]} inShape [width, height, channels]
 * @param {number[][]} kernel 
 * @param {number} stride 
 * @param {number} dialation
 * @param {boolean} padded When true, will be zero-padded.
 * 
 * @throws If stride != 1 and dialation != 1
 */
function createConv(inShape, kernel, stride, dialation, padded) {
    let paddingMode = padded ? "same" : "valid";
    return tf.layers.conv2d({
        inputShape: inShape,
        kernelSize: kernel.shape.slice(0, 2),
        activation: "relu",
        filters: 1,
        strides: stride,
        dilationRate: dialation,
        trainable: false,
        useBias: false,
        padding: paddingMode,
        weights: [kernel]
    });
}

/**
 * Updates display and data with new filter choice.
 */
function updateData() {
    const filter = d3.select("#filter-selection");
    switch (filter.node().value) {
        case "identity":
            kernel = tf.tensor([[0, 0, 0],
                                [0, 1, 0],
                                [0, 0, 0]]);
            break;
        case "x_sobel":
            kernel = tf.tensor([[-1, 0, 1],
                                [-2, 0, 2],
                                [-1, 0, 1]]);
            break;
        case "y_sobel":
            kernel = tf.tensor([[ 1,  2,  1],
                                [ 0,  0,  0],
                                [-1, -2, -1]]);
            break;
    }

    kernel = tf.reshape(kernel, [kernelWidth, kernelHeight, 1, 1]);

    const image = d3.select("#image-selection");
    // This is where we get the url for the Image Bois
    loadImage(image.node().value);
}

function refreshData() {
    const convLayer = createConv([inputWidth, inputHeight, 1], kernel, 1, 1, PADDED);
    filteredImg = convLayer.apply(image);

    drawInputData();
    drawOutputData();
    drawKernelData();
    drawEffects();
}

/**
 * Updates display with new selection.
 */
function updateSelection() {
    if (selectionX !== null && selectionY !== null) {
        d3.select("#inputHighlight")
            .attr("x", (selectionX - 1) * cellWidth - borderWidth)
            .attr("y", (selectionY - 1) * cellHeight - borderWidth);
        if (PADDED) {
            d3.select("#outputHighlight")
                .attr("x", (selectionX) * cellWidth - borderWidth)
                .attr("y", (selectionY) * cellHeight - borderWidth);
        } else {
            d3.select("#outputHighlight")
                .attr("x", (selectionX - 1) * cellWidth - borderWidth)
                .attr("y", (selectionY - 1) * cellHeight - borderWidth);
        }
        d3.select("#connectingLine")
            .attr("x1", (kernelWidth + selectionX) * cellWidth + spaceBetween + 3 * borderWidth + cellWidth / 2)
            .attr("y1", (selectionY) * cellHeight + borderWidth + cellHeight / 2)
            .attr("x2", (kernelWidth + inputWidth + selectionX) * cellWidth + spaceBetween * 2 + 5 * borderWidth + cellWidth / 2)
            .attr("y2", (selectionY) * cellHeight + borderWidth + cellHeight / 2);
    }
}

/**
 * Initialize the root SVG.
 */
function initSVG() {
    d3.select("body")
        .append("svg")
        .attr("id", "rootDisplay")
        .attr("width", (inputWidth + kernelWidth + outputWidth) * cellWidth + spaceBetween * 2 + borderWidth * 6)
        .attr("height", inputHeight * cellHeight + borderWidth * 2);
}

/**
 * Initialize the container for the image of the input.
 */
function initInputImg() {
    // g element containing all of the image contents
    const inputImg = d3.select("#rootDisplay")
        .append("g")
        .attr("id", "inputImg")
        .attr("clip-path", "url(#inputImgMask)")
        .attr("transform", `translate(${kernelWidth * cellWidth + spaceBetween + 3 * borderWidth}, 
                                      ${borderWidth})`);
    // Box around image(used for mask and outline)
    const inputOutline = inputImg.append("rect")
        .attr("id", "inputOutline")
        .attr("x", -borderWidth)
        .attr("y", -borderWidth)
        .attr("width", cellWidth * inputWidth + 2 * borderWidth)
        .attr("height", cellHeight * inputHeight + 2 * borderWidth)
        .attr("fill-opacity", 0)
        .classed("outlined", true);
    // Mask (uses outline of image)
    const inputMask = inputImg.append("defs")
        .append("clipPath").attr("id", "inputImgMask")
        .append("use").attr("xlink:href", "#inputOutline");
}

/**
 * Initialize the container for the image of the output.
 */
function initOutputImg() {
    // g element containing all of the image contents
    const outputImg = d3.select("#rootDisplay")
        .append("g")
        .attr("id", "outputImg")
        .attr("clip-path", "url(#outputImgMask)")
        .attr("transform", `translate(${(inputWidth + kernelWidth) * cellWidth + spaceBetween * 2 + borderWidth * 5}, 
                                      ${inputHeightLoss * cellHeight + borderWidth})`);
    // Box around image(used for mask and outline)
    const outputOutline = outputImg.append("rect")
        .attr("id", "outputOutline")
        .attr("x", -borderWidth)
        .attr("y", -borderWidth)
        .attr("width", cellWidth * outputWidth + 2 * borderWidth)
        .attr("height", cellHeight * outputHeight + 2 * borderWidth)
        .attr("fill-opacity", 0)
        .classed("outlined", true);
    // Mask (uses outline of image)
    const outputMask = outputImg.append("defs")
        .append("clipPath").attr("id", "outputImgMask")
        .append("use").attr("xlink:href", "#outputOutline");
}

/**
 * Initialize the container for the image of the kernel.
 */
function initKernelImg() {
    // g element containing all of the image contents
    const kernelImg = d3.select("#rootDisplay")
        .append("g")
        .attr("id", "kernelImg")
        .attr("clip-path", "url(#kernelImgMask)")
        .attr("transform", `translate(${borderWidth}, 
                                      ${borderWidth/* **Kernel at bottom** (inputHeight - kernelHeight) * cellHeight + borderWidth*/})`);
    // Box around image(used for mask and outline)
    const kernelOutline = kernelImg.append("rect")
        .attr("id", "kernelOutline")
        .attr("x", -borderWidth)
        .attr("y", -borderWidth)
        .attr("width", cellWidth * kernelWidth + 2 * borderWidth)
        .attr("height", cellHeight * kernelHeight + 2 * borderWidth)
        .attr("fill-opacity", 0)
        .classed("outlined", true);
    // Mask (uses outline of image)
    const kernelMask = kernelImg.append("defs")
        .append("clipPath").attr("id", "kernelImgMask")
        .append("use").attr("xlink:href", "#kernelOutline");
}

/**
 * Initialize the effects(lines, highlighting).
 */
function initEffects() {
    const effects = d3.select("#rootDisplay")
        .append("g")
        .attr("visibility", "hidden")
    const inputHighlight = effects.append("rect")
        .attr("id", "inputHighlight")
        .attr("pointer-events", "none")
        .attr("x", -1000)
        .attr("y", -1000)
        .attr("width", cellWidth * kernelWidth + borderWidth * 2)
        .attr("height", cellHeight * kernelHeight + borderWidth * 2)
        .attr("fill", "yellow")
        .attr("fill-opacity", 0.2);
    const outputHighlight = effects.append("rect")
        .attr("id", "outputHighlight")
        .attr("pointer-events", "none")
        .attr("x", -1000)
        .attr("y", -1000)
        .attr("width", cellWidth + borderWidth * 2)
        .attr("height", cellHeight + borderWidth * 2)
        .attr("fill", "yellow")
        .attr("fill-opacity", 0.2);

    const connectingLine = effects.append("line")
        .attr("id", "connectingLine")
        .attr("x1", -1000)
        .attr("x2", -1000)
        .attr("y1", -1000)
        .attr("y2", -1000)
        .attr("stroke", "red")
        .attr("stroke-width", 2);
}

/**
 * Draw the input data onto the image of the input.
 */
function drawInputData() {
    const updateSet = d3.select("#inputImg")
        .selectAll(".cellColor")
        .data(tensorToFlat(image));
    // ENTER
    const enterSet = updateSet.enter()
        .append("rect")
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .classed("outlined", true)
        .classed("cellColor", true);
    // UPDATE
    updateSet.merge(enterSet)
        .attr("x", function(_, i) {
            return x_scale(i % inputHeight)
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / inputHeight))
        })
        .attr("fill", d => floatToGray(color_scale(d)))
        .on("mouseover", (_, i) => {
            selectionX = i % inputHeight;
            selectionY = Math.floor(i / inputHeight);
            updateSelection();
        });
}

/**
 * Draw the output data onto the image of the output.
 */
function drawOutputData() {
    const updateSet = d3.select("#outputImg")
        .selectAll(".cellColor")
        .data(tensorToFlat(filteredImg));
    // ENTER
    const enterSet = updateSet.enter()
        .append("rect")
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .classed("outlined", true)
        .classed("cellColor", true);
    // UPDATE
    updateSet.merge(enterSet)
        .attr("x", function(_, i) {
            return x_scale(i % outputHeight)
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / outputHeight))
        })
        .attr("fill", d => floatToGray(color_scale(d)))
        .on("mouseover", (_, i) => {
            selectionX = i % outputHeight + inputWidthLoss;
            selectionY = Math.floor(i / outputHeight) + inputHeightLoss;
            updateSelection();
        });
}

/**
 * Draw the kernel data onto the image of the kernel.
 */
function drawKernelData() {
    let updateColor = d3.select("#kernelImg")
        .selectAll(".cellColor")
        .data(tensorToFlat(kernel));
    let updateText = d3.select("#kernelImg")
        .selectAll(".cellText")
        .data(tensorToFlat(kernel));
    // ENTER
    const enterColor = updateColor.enter()
        .append("rect")
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("fill", "white")
        .classed("outlined", true)
        .classed("cellColor", true);
    const enterText = updateText.enter()
        .append("text")
        .classed("cellText", true);
    // UPDATE
    updateColor.merge(enterColor)
        .attr("x", function(_, i) {
            return x_scale(i % kernelHeight)
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / kernelHeight))
        });
    updateText.merge(enterText)
        .attr("x", function(_, i) {
            return x_scale(i % kernelHeight) + Math.floor(cellWidth / 2)
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / kernelHeight)) + Math.floor(cellHeight / 2)
        })
        .text(d => d);
}

/**
 * Draw the effects(lines, highlights) onto the page. Because the effects need to be on top, a reference
 * to the real effect is deleted and then recreated every time in case new shapes have
 * been added to the SVG.
 */
function drawEffects() {
    removeEffects();

    d3.select("#inputImg")
        .append("use")
        .attr("id", "inputHighlightDisplay")
        .attr("xlink:href", "#inputHighlight");

    d3.select("#outputImg")
        .append("use")
        .attr("id", "outputHighlightDisplay")
        .attr("xlink:href", "#outputHighlight");
    
    d3.select("#rootDisplay")
        .append("use")
        .attr("id", "connectingLineDisplay")
        .attr("xlink:href", "#connectingLine");
}

/**
 * Remove the effects(lines, highlights) from the SVG.
 */
function removeEffects() {
    d3.select("#inputHighlightDisplay")
        .remove();
    d3.select("#outputHighlightDisplay")
        .remove();
    d3.select("#connectingLineDisplay")
        .remove();
}

/**
 * This function will run when the document has loaded.
 */
function main() {

    initSVG();
    initKernelImg();
    initInputImg();
    initOutputImg();
    initEffects();

    updateData();    
}

d3.select(":root").style("--borderWidth", `${borderWidth}px`);
d3.select(":root").style("--borderOffset", `${-borderWidth}px`);

d3.select(":root").style("--fontSize", `${Math.min(cellHeight, cellWidth) / 2}px`);

d3.select("#filter-selection").on("change", updateData);
d3.select("#image-selection").on("change", updateData);

d3.select("#auto-conv").on("click", () => auto_conv(img_data.length * img_data[0].length, kernel))

window.onload = main;
