import * as d3 from "d3";
import * as tf from '@tensorflow/tfjs'
import { color } from "d3";

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
 * 
 * @throws If stride != 1 and dialation != 1
 */
function createConv(inShape, kernel, stride, dialation) {
    return tf.layers.conv2d({
        inputShape: inShape,
        kernelSize: kernel.shape.slice(0, 2),
        filters: 1,
        strides: stride,
        dilationRate: dialation,
        trainable: false,
        useBias: false,
        weights: [kernel]
    });
}

/**
 * Updates display with new filter data.
 */
function updateFilter() {
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
            kernel = tf.tensor([[-1, -2, -1],
                                [ 0,  0,  0],
                                [ 1,  2,  1]]);
            break;
    }
    kernel = tf.reshape(kernel, [kernelWidth, kernelHeight, 1, 1]);
    const convLayer = createConv([inputWidth, inputHeight, 1], kernel, 1, 1);
    filteredImg = convLayer.apply(image);

    outputCells.data(tensorToFlat(filteredImg))
        .attr("fill", d => gray(color_scale(d)));
}

/**
 * Updates display with new highlight data.
 */
function updateHighlight() {
    if (selectionX !== null && selectionY !== null) {
        d3.select("#inputHighlight")
            .attr("x", (selectionX - 1) * cellWidth)
            .attr("y", (selectionY - 1) * cellHeight);
        d3.select("#outputHighlight")
            .attr("x", (inputWidth + kernelWidth) * cellWidth + spaceBetween * 2 + (selectionX - 1) * cellWidth)
            .attr("y", selectionY * cellHeight);
    }
}

// Currently highlighted selection
let selectionX = null;
let selectionY = null;

// Input image size
const inputWidth = 8;
const inputHeight = 8;

// Kernel size
const kernelWidth = 3;
const kernelHeight = 3;

// Output image size
const outputWidth = inputWidth - 2 * Math.floor((kernelWidth - 1) / 2);
const outputHeight = inputHeight - 2 * Math.floor((kernelHeight - 1) / 2);

let image = rand_img_tensor(inputWidth, inputHeight, 1);
let filteredImg = tf.zeros([outputWidth, outputHeight]);
let kernel = tf.zeros([kernelWidth, kernelHeight, 1, 1]);

// Padding between images
const spaceBetween = 40;

// Width and height of each "pixel"
const cellWidth = 50;
const cellHeight = 50;

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



const svg = d3.select("body")
            .append("svg")
            .attr("width", (inputWidth + kernelWidth + outputWidth) * cellWidth + spaceBetween * 2)
            .attr("height", inputHeight * cellHeight)

//// Masks
// Input
svg.append("defs")
    .append("clipPath").attr("id", "inputImgMask")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", cellWidth * inputWidth)
    .attr("height", cellHeight * inputHeight);
// Output
svg.append("defs")
    .append("clipPath").attr("id", "outputImgMask")
    .append("rect")
    .attr("x", (inputWidth + kernelWidth) * cellWidth + spaceBetween * 2)
    .attr("y", Math.floor((kernelHeight - 1) / 2) * cellHeight)
    .attr("width", cellWidth * outputWidth)
    .attr("height", cellHeight * outputHeight);
// Kernel
svg.append("defs")
    .append("clipPath").attr("id", "kernelImgMask")
    .append("rect")
    .attr("x", inputWidth * cellWidth + spaceBetween)
    .attr("y", (inputHeight - kernelHeight) * cellHeight)
    .attr("width", cellWidth * kernelWidth)
    .attr("height", cellHeight * kernelHeight);

//// Images
// Input
const inputImg = svg.append("g")
    .attr("clip-path", "url(#inputImgMask)");
const inputCells = inputImg.selectAll("rect")
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
    .classed("input", true)
    .on("mouseover", (_, i) => {
        selectionX = i % inputHeight;
        selectionY = Math.floor(i / inputHeight);
        updateHighlight();
    });
// Output
const outputImg = svg.append("g")
    .attr("clip-path", "url(#outputImgMask)");
const outputCells = outputImg.selectAll("rect")
    .data(tensorToFlat(filteredImg))
    .enter()
    .append("rect")
    .attr("x", function(_, i) {
        return (kernelWidth + inputWidth) * cellWidth + spaceBetween * 2 + x_scale(i % outputHeight)
    })
    .attr("y", function(_, i) {
        return Math.floor((kernelHeight - 1) / 2) * cellHeight + y_scale(Math.floor(i / outputHeight))
    })
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", d => gray(color_scale(d)))
    .classed("outlined", true)
    .classed("output", true)
    .on("mouseover", (_, i) => {
        selectionX = i % outputHeight + Math.floor((kernelWidth - 1) / 2);
        selectionY = Math.floor(i / outputHeight) + Math.floor((kernelHeight - 1) / 2);
        updateHighlight();
    })
// Kernel
const kernelImg = svg.append("g")
    .attr("clip-path", "url(#kernelImgMask)");
kernelImg.selectAll("rect")
    .data(tensorToFlat(kernel))
    .enter()
    .append("rect")
    .attr("x", function(_, i) {
        return inputWidth * cellWidth + spaceBetween + x_scale(i % kernelHeight)
    })
    .attr("y", function(_, i) {
        return y_scale(inputHeight - kernelHeight + Math.floor(i / kernelHeight))
    })
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", d => gray(color_scale(d)))
    .classed("outlined", true)
    .classed("kernel", true);

//// Highlights
// Input
inputImg.append("rect")
    .attr("id", "inputHighlight")
    .attr("pointer-events", "none")
    .attr("x", -1000)
    .attr("y", -1000)
    .attr("width", cellWidth * 3)
    .attr("height", cellHeight * 3)
    .attr("fill", "yellow")
    .attr("fill-opacity", 0.2);
// Output
outputImg.append("rect")
    .attr("id", "outputHighlight")
    .attr("pointer-events", "none")
    .attr("x", -1000)
    .attr("y", -1000)
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", "yellow")
    .attr("fill-opacity", 0.2);

updateFilter();

d3.select("#filter-selection").on("change", updateFilter);
