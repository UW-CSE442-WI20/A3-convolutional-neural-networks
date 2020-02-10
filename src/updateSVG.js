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
    d3.select("#connectingLine")
        .attr("x1", x_scale(config.kernelWidth + selectionX) + config.spaceBetween + config.cellWidth / 2)
        .attr("y1", y_scale(selectionY) + config.cellHeight / 2)
        .attr("x2", x_scale(config.kernelWidth + config.inputWidth + selectionX) + config.spaceBetween * 2 + config.cellWidth / 2)
        .attr("y2", y_scale(selectionY) + config.cellHeight / 2);
    
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
    let updateColor = d3.select("#kernelImg")
        .selectAll(".cellColor")
        .data(tensorToFlat(kernel));
    let updateText = d3.select("#kernelImg")
        .selectAll(".cellText")
        .data(tensorToFlat(kernel));
    // ENTER
    const enterColor = updateColor.enter()
        .append("rect")
        .attr("width", config.cellWidth)
        .attr("height", config.cellHeight)
        .attr("fill", "white")
        .attr("stroke", config.borderColor)
        .attr("stroke-width", config.borderWidth)
        .classed("cellColor", true);
    const enterText = updateText.enter()
        .append("text")
        .classed("cellText", true);
    // UPDATE
    updateColor.merge(enterColor)
        .attr("x", function(_, i) {
            return x_scale(i % config.kernelWidth)
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / config.kernelWidth))
        });
    updateText.merge(enterText)
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
    
    d3.select("#rootDisplay")
        .append("use")
        .attr("id", "connectingLineDisplay")
        .attr("xlink:href", "#connectingLine");
}

/**
 * Remove the effects(lines, highlights) from the SVG.
 */
export function removeEffects() {
    d3.select("#inputHighlightDisplay")
        .remove();
    d3.select("#outputHighlightDisplay")
        .remove();
    d3.select("#connectingLineDisplay")
        .remove();
}
