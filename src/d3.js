import * as d3 from "d3";
import * as tf from '@tensorflow/tfjs'

const canvas = document.getElementById('input-image');
const context = canvas.getContext('2d');

let pixelValues = [];

for (let i = 0; i < canvas.height; i++) {
    pixelValues[i] = [];
}

function grayScaleImage() {
    var imgData = context.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imgData.data.length; i += 4) {
        let x = (i / 4) % canvas.width;
        let y = Math.floor((i / 4) / canvas.width);
        pixelValues[y][x] = imgData.data[i] / 256.0;
    }

    display();
}

const base_image = new Image();
base_image.onload = function(){
    context.drawImage(base_image, 0, 0);
    grayScaleImage();
}

base_image.crossOrigin = "Anonymous";
base_image.src = 'https://raw.githubusercontent.com/UW-CSE442-WI20/A3-convolutional-neural-networks/michan4-v1/Images/0.png';

/*
function rand_img(m, n) {
    return [...Array(m)].map(() => [...Array(n)].map(() => Math.random()))
}

function convolution(i, kernel, class_name, cell_transform) {
    d3.selectAll("line").remove()

    var rects = d3.selectAll("." + class_name).nodes()
    var x = i % img_data[0].length
    var y = Math.floor(i / img_data[0].length)

    var kernel_h = kernel.length
    var kernel_w = kernel[0].length

    var conv = 0
    for (var hk = 0; hk < kernel_h; ++hk) {
        var yk = y - (kernel_h - 1) / 2 + hk
        if(yk < 0) {
            continue;
        }
        else if (yk >= img_data.length) {
            break;
        }

        for (var wk = 0; wk < kernel_w; ++wk) {
            var xk = x - (kernel_w - 1) / 2 + wk

            if (xk < 0) {
                continue;
            }
            else if (xk >= img_data[0].length) {
                break;
            }

            var idx = yk * img_data[0].length + xk
            var cell = d3.select(rects[idx])
            conv += cell.data()[0] * kernel[hk][wk]
            cell_transform(cell)
        }
    }

    var kernel_rects = d3.selectAll(".kernel").nodes()
    var kernel_center = d3.select(kernel_rects[(kernel.length + 1) * (kernel.length - 1) / 2])

    var other_rects = d3.selectAll(class_name === "input" ? ".output" : ".input").nodes()
    var other_cur_rect = d3.select(other_rects[i])

    var cur_rect = d3.select(rects[i])
    d3.select("svg")
        .append("line")
        .attr("stroke", "green")
        .attr("stroke-width", 4)
        .attr("x1", parseFloat(cur_rect.attr("x")) + parseFloat(cur_rect.attr("width")) / 2)
        .attr("y1", parseFloat(cur_rect.attr("y")) + parseFloat(cur_rect.attr("height")) / 2)
        .attr("x2", parseFloat(kernel_center.attr("x")) + parseFloat(kernel_center.attr("width")) / 2)
        .attr("y2", parseFloat(kernel_center.attr("y")) + parseFloat(kernel_center.attr("height")) / 2)

    d3.select("svg")
        .append("line")
        .attr("stroke", "green")
        .attr("stroke-width", 4)
        .attr("x1", parseFloat(kernel_center.attr("x")) + parseFloat(kernel_center.attr("width")) / 2)
        .attr("y1", parseFloat(kernel_center.attr("y")) + parseFloat(kernel_center.attr("height")) / 2)
        .attr("x2", parseFloat(other_cur_rect.attr("x")) + parseFloat(other_cur_rect.attr("width")) / 2)
        .attr("y2", parseFloat(other_cur_rect.attr("y")) + parseFloat(other_cur_rect.attr("height")) / 2)

    if(class_name === "input") {
        var output_rects = d3.selectAll(".output").nodes()
        d3.select(output_rects[i]).data([conv]).attr("fill", gray(color_scale(conv)))
    }
}

var img_data = rand_img(8, 8)

var w = 640;
var h = 640;
var cell_padding = 4;

var cellWidth = w / img_data[0].length // - cell_padding * (img_data[0].length + 1) / img_data[0].length
var cellHeight = h / img_data.length // - cell_padding * (img_data.length + 1) / img_data.length

var x_scale = d3.scaleLinear()
            .domain([0, img_data[0].length - 1])
            .range([cell_padding / 2, w - cellWidth - cell_padding / 2 ])

var y_scale = d3.scaleLinear()
            .domain([0, img_data.length - 1])
            .range([cell_padding / 2, h - cellHeight - cell_padding / 2])

var svg = d3.select("body")
            .append("svg")
            .attr("width", w * 5 / 2)
            .attr("height", h)

svg.selectAll("rect")

    // Input
    .data(img_data.flat())
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
        return x_scale(i % img_data[0].length)
    })
    .attr("y", function(d, i) {
        return y_scale(Math.floor(i / img_data[0].length))
    })
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", d => gray(color_scale(d)))
    .attr("stroke", "gray")
    .attr("stroke-width", cell_padding)
    .classed("input", true)
    .on("mouseover", (d, i) => convolution(i, kernel, "input", c => c.attr("fill", "red")))
    .on("mouseout", (d, i) => convolution(i, kernel, "input", c => c.attr("fill", d => d3.rgb(d * 255, d * 255, d * 255))))
    .exit()

    // Output
    .data(Array(img_data.length * img_data[0].length))
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
        return 3/2 * w + x_scale(i % img_data[0].length)
    })
    .attr("y", function(d, i) {
        return y_scale(Math.floor(i / img_data[0].length))
    })
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", "white")
    .attr("stroke", "gray")
    .attr("stroke-width", cell_padding)
    .classed("output", true)
    .on("mouseover", (d, i) => convolution(i, kernel, "output", c => c.attr("fill", "red")))
    .on("mouseout", (d, i) => convolution(i, kernel, "output", c => c.attr("fill", d => gray(color_scale(d)))))
    .exit()

    // Kernel
    .data(kernel.flat())
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
        return 5/4*w - cellWidth * (kernel[0].length) / 2 - cell_padding / 2 + x_scale(i % kernel[0].length)
    })
    .attr("y", function(d, i) {
        return y_scale(img_data.length - kernel.length + Math.floor(i / kernel[0].length))
    })
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", d => gray(color_scale(d)))
    .attr("stroke", "gray")
    .attr("stroke-width", cell_padding)
    .classed("kernel", true)
*/

/**
 * Returns an RGB color of gray accosiated with the floated gray value.
 * 
 * @param {number} d A value [0, 1] representing a shade of gray
 */
function gray(d) {
    return d === undefined ? "white" : d3.rgb(d * 255, d * 255, d * 255)
}

/**
 * Return a tensor of random floats. Output shape is [1, w, h, c].
 * 
 * @param {number} w width
 * @param {number} h height
 * @param {number} c channels
 */
function rand_img_tensor(w, h, c) {
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
        filters: 1,
        strides: stride,
        dilationRate: dialation,
        trainable: false,
        useBias: false,
        padding: paddingMode,
        weights: [kernel]
    });
}

function display() {
/**
 * Updates display with new filter data.
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
    const convLayer = createConv([inputWidth, inputHeight, 1], kernel, 1, 1, PADDED);
    filteredImg = convLayer.apply(image);

    d3.select("#outputImg")
        .selectAll(".cellColor")
        .data(tensorToFlat(filteredImg))
        .attr("fill", d => gray(color_scale(d)));
    d3.select("#kernelImg")
        .selectAll(".cellText")
        .data(tensorToFlat(kernel))
        .text(d => d);
}

/**
 * Updates display with new highlight data.
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
    }
}

// Should the input matrix be padded
const PADDED = true;

// Currently highlighted selection
let selectionX = null;
let selectionY = null;

// Input image size
const inputWidth = 28;
const inputHeight = 28;

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

let image = rand_img_tensor(inputWidth, inputHeight, 1);
image = tf.reshape(tf.tensor(pixelValues), [1, 28, 28, 1]);
let filteredImg = tf.zeros([outputWidth, outputHeight]);
let kernel = tf.zeros([kernelWidth, kernelHeight, 1, 1]);

// Cell border
const borderWidth = 1;

// Padding between images
const spaceBetween = 40;

// Width and height of each "pixel"
const cellWidth = 25;
const cellHeight = 25;

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

d3.select(":root").style("--borderWidth", `${borderWidth}px`);
d3.select(":root").style("--borderOffset", `${-borderWidth}px`);

d3.select(":root").style("--fontSize", `${Math.min(cellHeight, cellWidth) / 2}px`);

initSVG();
initKernelImg();
initInputImg();
initOutputImg();
initEffects();

function initSVG() {
    d3.select("body")
        .append("svg")
        .attr("id", "rootDisplay")
        .attr("width", (inputWidth + kernelWidth + outputWidth) * cellWidth + spaceBetween * 2 + borderWidth * 6)
        .attr("height", inputHeight * cellHeight + borderWidth * 2);
}

//// Images
// Input
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
    // Cell contents
    const inputCells = inputImg.selectAll(".input")
        .data(tensorToFlat(image))
        .enter()
        .append("rect")
        .attr("x", function(_, i) {
            return x_scale(i % inputHeight)
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / inputHeight))
        })
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("fill", d => gray(color_scale(d)))
        .classed("outlined", true)
        .classed("cellColor", true)
        .on("mouseover", (_, i) => {
            selectionX = i % inputHeight;
            selectionY = Math.floor(i / inputHeight);
            updateSelection();
        });
}

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
    // Cell contents
    const outputCells = outputImg.selectAll(".output")
        .data(tensorToFlat(filteredImg))
        .enter()
        .append("rect")
        .attr("x", function(_, i) {
            return x_scale(i % outputHeight)
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / outputHeight))
        })
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .classed("outlined", true)
        .classed("cellColor", true)
        .on("mouseover", (_, i) => {
            selectionX = i % outputHeight + inputWidthLoss;
            selectionY = Math.floor(i / outputHeight) + inputHeightLoss;
            updateSelection();
        });
}

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
    // Cell contents
    const kernelCells = kernelImg.selectAll(".kernel")
        .data(tensorToFlat(kernel))
        .enter()
        .append("g");
    // Cell color
    const kernelColor = kernelCells.append("rect")
        .attr("x", function(_, i) {
            return x_scale(i % kernelHeight)
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / kernelHeight))
        })
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("fill", "white")
        .classed("outlined", true)
        .classed("cellColor", true);
    // Cell text
    const kernelText = kernelCells.append("text")
        .attr("x", function(_, i) {
            return x_scale(i % kernelHeight) + Math.floor(cellWidth / 2)
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / kernelHeight)) + Math.floor(cellHeight / 2)
        })
        .classed("cellText", true);
}

function initEffects() {
    const inputHighlight = d3.select("#inputImg")
        .append("rect")
        .attr("id", "inputHighlight")
        .attr("pointer-events", "none")
        .attr("x", -1000)
        .attr("y", -1000)
        .attr("width", cellWidth * kernelWidth + borderWidth * 2)
        .attr("height", cellHeight * kernelHeight + borderWidth * 2)
        .attr("fill", "yellow")
        .attr("fill-opacity", 0.2);
    const outputHighlight = d3.select("#outputImg")
        .append("rect")
        .attr("id", "outputHighlight")
        .attr("pointer-events", "none")
        .attr("x", -1000)
        .attr("y", -1000)
        .attr("width", cellWidth + borderWidth * 2)
        .attr("height", cellHeight + borderWidth * 2)
        .attr("fill", "yellow")
        .attr("fill-opacity", 0.2);
}

updateData();

d3.select("#filter-selection").on("change", updateData);

}
