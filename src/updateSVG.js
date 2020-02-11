import * as d3 from "d3";
import * as tf from "@tensorflow/tfjs";

import * as config from "./config";

/**
 * Return the given tensor as a one-dimensional array.
 * 
 * @param {tf.Tensor} t
 */
function tensorToFlat(t) {
    return tf.reshape(t, [-1]).arraySync();
}

/**
 * Updates display with new selection.
 */
function updateSelection(selectionX, selectionY) {
    d3.select("#inputHighlight")
        .attr("x", x_scale(selectionX - 1))
        .attr("y", y_scale(selectionY - 1));
    if (config.PADDED) {
        d3.select("#outputHighlight")
            .attr("x", x_scale(selectionX))
            .attr("y", y_scale(selectionY));
    } else {
        d3.select("#outputHighlight")
            .attr("x", x_scale(selectionX - 1))
            .attr("y", y_scale(selectionY - 1));
    }

    for (let i = 0; i < 4; ++i) {
        // Trick to do all of this in one loop. Generates -1 -1; -1, 1; 1, -1; 1, 1.
        // These are used to calculate the offsets to the corners from the center of the cell
        let sign_x = 2 * (i & 1) - 1
        let sign_y = 2 * ((i >> 1) & 1) - 1

        let x_offset = (1 + sign_x) * config.cellWidth / 2 + sign_x * (config.kernelWidth - 1) / 2 * config.cellWidth
        let y_offset = (1 + sign_y) * config.cellHeight / 2 + sign_y * (config.kernelWidth - 1) / 2 * config.cellWidth

        // Connect input with kernel
        d3.select("#connectingLine-" + i)
            .attr("x1", x_scale(selectionX) + x_offset)
            .attr("y1", y_scale(selectionY) + y_offset)
            .attr("x2", config.img_width + config.spaceBetween / 2 - config.cellWidth / 2 + x_offset)
            .attr("y2", config.img_height - config.cellHeight * (config.kernelHeight - 1) + y_offset);

        // Connect kernel with output
        d3.select("#connectingLine-" + (i + 4))
            .attr("x1", config.img_width + config.spaceBetween / 2 - config.cellWidth / 2 + x_offset)
            .attr("y1", config.img_height - config.cellHeight * (config.kernelHeight - 1) + y_offset)
            .attr("x2", config.img_width + config.spaceBetween + x_scale(selectionX) + (sign_x + 1) / 2 * config.cellWidth)
            .attr("y2", y_scale(selectionY) + + (sign_y + 1) / 2 * config.cellHeight);
    }

    drawEffects();
}

/*
const x_scale = (i) => i * config.cellWidth;
const y_scale = (i) => i * config.cellHeight;
*/
const x_scale = d3.scaleLinear()
            .domain([0, config.inputWidth - 1])
            .range([0, config.cellWidth * (config.inputWidth - 1)])
const y_scale = d3.scaleLinear()
            .domain([0, config.inputHeight - 1])
            .range([0, config.cellHeight * (config.inputHeight - 1)])

const color_scale = d3.scaleLinear()
            .domain([0, 1])
            .range([1, 0])

/**
 * Returns an RGB color of gray accosiated with the floated gray value.
 * 
 * @param {number} f A value [0, 1] representing a shade of gray
 */
export function floatToGray(f) {
    return d3.rgb(f * 255, f * 255, f * 255);
}
/**
 * Returns a float [0, 1] representing the shade of gray passed in.
 * 
 * @param {RGBColor} rgb A d3 rgb representing a shade of gray
 */
export function grayToFloat(rgb) {
    return ((rgb.r + rgb.g + rgb.b) / 3.0) / 255.0;
}

/**
 * Draw the input data onto the image of the input.
 */
export function drawInputData(image) {
    const updateSet = d3.select("#inputImg")
        .selectAll(".cellColor")
        .data(tensorToFlat(image));
    // ENTER
    const enterSet = updateSet.enter()
        .append("rect")
        .attr("width", config.cellWidth)
        .attr("height", config.cellHeight)
        .attr("stroke", config.borderColor)
        .attr("stroke-width", config.borderWidth)
        .classed("cellColor", true);
    // UPDATE
    updateSet.merge(enterSet)
        .attr("x", function(_, i) {
            return x_scale(i % config.inputHeight)
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / config.inputHeight))
        })
        .attr("fill", d => floatToGray(color_scale(d)))
        .on("mouseover", (_, i) => {
            updateSelection(i % config.inputHeight, Math.floor(i / config.inputHeight));
        })
        .on("mouseout", removeEffects);
}

/**
 * Draw the output data onto the image of the output.
 */
export function drawOutputData(resultImg) {
    const updateSet = d3.select("#outputImg")
        .selectAll(".cellColor")
        .data(tensorToFlat(resultImg));
    // ENTER
    const enterSet = updateSet.enter()
        .append("rect")
        .attr("width", config.cellWidth)
        .attr("height", config.cellHeight)
        .attr("stroke", config.borderColor)
        .attr("stroke-width", config.borderWidth)
        .classed("cellColor", true);
    // UPDATE
    updateSet.merge(enterSet)
        .attr("x", function(_, i) {
            return x_scale(i % config.outputHeight)
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / config.outputHeight))
        })
        .attr("fill", d => floatToGray(color_scale(d)))
        .on("mouseover", (_, i) => {
            updateSelection(i % config.outputHeight + config.inputWidthLoss, Math.floor(i / config.outputHeight) + config.inputHeightLoss);
        })
        .on("mouseout", removeEffects);
}

/**
 * Draw the kernel data onto the image of the kernel.
 */
export function drawKernelData(kernel) {
    const updateSet = d3.select("#kernelImg")
        .selectAll(".cellWrapper")
        .data(tensorToFlat(kernel));
    // ENTER
    const enterSet = updateSet.enter()
        .append("g")
        .classed("cellWrapper", true);
    enterSet.append("rect")
        .attr("width", config.cellWidth)
        .attr("height", config.cellHeight)
        .attr("fill", "white")
        .attr("stroke", config.borderColor)
        .attr("stroke-width", config.borderWidth)
        .classed("cellColor", true);
    enterSet.append("text")
        .classed("cellText", true);
    // UPDATE
    d3.select("#kernelImg")
        .selectAll(".cellColor")
        .data(tensorToFlat(kernel))
        .attr("x", function(_, i) {
            return x_scale(i % config.kernelWidth)
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / config.kernelWidth))
        });
    d3.select("#kernelImg")
        .selectAll(".cellText")
        .data(tensorToFlat(kernel))
        .attr("x", function(_, i) {
            return x_scale(i % config.kernelWidth) + Math.floor(config.cellWidth / 2)
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / config.kernelWidth)) + Math.floor(config.cellHeight / 2)
        })
        .text(d => d);
}

/**
 * Draw the effects(lines, highlights) onto the page. Because the effects need to be on top, a reference
 * to the real effect is deleted and then recreated every time in case new shapes have
 * been added to the SVG.
 */
export function drawEffects() {
    removeEffects();

    d3.select("#inputImg")
        .append("use")
        .attr("id", "inputHighlightDisplay")
        .attr("xlink:href", "#inputHighlight");

    d3.select("#outputImg")
        .append("use")
        .attr("id", "outputHighlightDisplay")
        .attr("xlink:href", "#outputHighlight");
    
    for (let i=0; i < 8; ++i) {
        d3.select("#rootDisplay")
            .append("use")
            .attr("class", "connectingLineDisplay")
            .attr("xlink:href", "#connectingLine-" + i);
    }

}

/**
 * Remove the effects(lines, highlights) from the SVG.
 */
export function removeEffects() {
    d3.select("#inputHighlightDisplay")
        .remove();
    d3.select("#outputHighlightDisplay")
        .remove();
    d3.selectAll(".connectingLineDisplay")
        .remove();
}
