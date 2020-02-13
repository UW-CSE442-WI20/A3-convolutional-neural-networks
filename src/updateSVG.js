import * as d3 from "d3";

import * as config from "./config";
import {flattenImg} from "./tensor";
import {image, resultImg, visibleImg, kernel} from "./d3"

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
    return ((rgb.r * 0.3) + (rgb.g * 0.59) + (rgb.b * 0.11)) / 255.0;
}

/**
 * Draw the input data onto the image of the input.
 */
export function drawInputData(disableMouseover) {
    const updateSet = d3.select("#inputImg")
        .selectAll(".cellWrapper")
        .data(flattenImg(image));
    // ENTER
    const enterSet = updateSet.enter()
        .append("g")
        .classed("cellWrapper", true);
    enterSet.append("rect")
        .attr("width", config.cellWidth)
        .attr("height", config.cellHeight)
        .attr("stroke", config.borderColor)
        .attr("stroke-width", config.borderWidth)
        .classed("cellColor", true);
    enterSet.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-family", "sans-serif")
        .attr("font-size", config.fontSize)
        .attr("pointer-events", "none")
        .classed("cellText", true);
    // UPDATE
    d3.select("#inputImg")
        .selectAll(".cellColor")
        .data(flattenImg(image))
        .attr("x", function(_, i) {
            return x_scale(i % config.inputHeight)
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / config.inputHeight))
        })
        .attr("fill", d => floatToGray(color_scale(d)))
        .on("mouseover", (_, i) => {
            if (!disableMouseover) {
                const x = i % config.outputHeight + config.inputWidthLoss;
                const y = Math.floor(i / config.outputHeight) + config.inputHeightLoss;
                visibleImg[y][x] = resultImg[y][x]
                drawOutputDataPoint(i)
                drawEffects(x, y);
            }
        })
        .on("mouseout", () => {
            if (!disableMouseover) {
                removeEffects();
            }
        });
    d3.select("#inputImg")
        .selectAll(".cellText")
        .data(flattenImg(image))
        .attr("x", function(_, i) {
            return x_scale(i % config.inputWidth) + config.cellWidth / 2;
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / config.inputWidth)) + config.cellHeight / 2;
        })
        .text(d => "");
}

/**
 * Draw the output data onto the image of the output.
 */
export function drawOutputData(disableMouseover) {
    const updateSet = d3.select("#outputImg")
        .selectAll(".cellWrapper")
        .data(flattenImg(visibleImg));
    // ENTER
    const enterSet = updateSet.enter()
        .append("g")
        .classed("cellWrapper", true);
    enterSet.append("rect")
        .attr("width", config.cellWidth)
        .attr("height", config.cellHeight)
        .attr("stroke", config.borderColor)
        .attr("stroke-width", config.borderWidth)
        .classed("cellColor", true);
    enterSet.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-family", "sans-serif")
        .attr("font-size", config.fontSize)
        .attr("pointer-events", "none")
        .classed("cellText", true);
    // UPDATE
    d3.select("#outputImg")
        .selectAll(".cellColor")
        .data(flattenImg(visibleImg))
        .attr("x", function(_, i) {
            return x_scale(i % config.outputHeight)
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / config.outputHeight))
        })
        .attr("fill", d => floatToGray(color_scale(d)))
        .on("mouseover", (_, i) => {
            if (!disableMouseover) {
                const x = i % config.outputHeight + config.inputWidthLoss;
                const y = Math.floor(i / config.outputHeight) + config.inputHeightLoss;
                visibleImg[y][x] = resultImg[y][x];
                drawOutputDataPoint(i)
                drawEffects(x, y);
            }
        })
        .on("mouseout", () => {
            if (!disableMouseover) {
                removeEffects();
            }
        });
    d3.select("#outputImg")
        .selectAll(".cellText")
        .data(flattenImg(visibleImg))
        .attr("x", function(_, i) {
            return x_scale(i % config.outputWidth) + config.cellWidth / 2;
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / config.outputWidth)) + config.cellHeight / 2;
        })
        .text(d => "");
}

/**
 * Draw the output data onto the image of the output.
 */
export function drawOutputDataPoint(i) {
    const cell = d3.select(
        d3.select("#outputImg")
            .selectAll(".cellWrapper")
            .nodes()[i]
        );
    // UPDATE

    cell.selectAll(".cellColor")
        .data([flattenImg(visibleImg)[i]])
        .attr("fill", d => floatToGray(color_scale(d)));
}

/**
 * Draw the kernel data onto the image of the kernel.
 */
export function drawKernelData() {
    const updateSet = d3.select("#kernelImg")
        .selectAll(".cellWrapper")
        .data(flattenImg(kernel));
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
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-family", "sans-serif")
        .attr("font-size", config.fontSize)
        .attr("pointer-events", "none")
        .classed("cellText", true);
    // UPDATE
    d3.select("#kernelImg")
        .selectAll(".cellColor")
        .data(flattenImg(kernel))
        .attr("x", function(_, i) {
            return x_scale(i % config.kernelWidth);
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / config.kernelWidth));
        });
    d3.select("#kernelImg")
        .selectAll(".cellText")
        .data(flattenImg(kernel))
        .attr("x", function(_, i) {
            return x_scale(i % config.kernelWidth) + config.cellWidth / 2;
        })
        .attr("y", function(_, i) {
            return y_scale(Math.floor(i / config.kernelWidth)) + config.cellHeight / 2;
        })
        .text(d => (Math.round(d * 10) / 10));
}

/**
 * Draw the effects(lines, highlights) onto the page. Because the effects need to be on top, a reference
 * to the real effect is deleted and then recreated every time in case new shapes have
 * been added to the SVG.
 */
export function drawEffects(selectionX, selectionY) {
    removeEffects();

    d3.select("#inputHighlight")
        .attr("transform", `translate(${x_scale(selectionX - 1)},
                                      ${y_scale(selectionY - 1)})`);
    d3.select("#outputHighlight")
        .attr("transform", `translate(${x_scale(selectionX)},
                                      ${y_scale(selectionY)})`);

    for (let i = 0; i < 4; ++i) {
        // Trick to do all of this in one loop. Generates -1 -1; -1, 1; 1, -1; 1, 1.
        // These are used to calculate the offsets to the corners from the center of the cell
        let sign_x = 2 * (i & 1) - 1
        let sign_y = 2 * ((i >> 1) & 1) - 1

        let x_offset = (1 + sign_x) * config.cellWidth / 2 + sign_x * (config.kernelWidth - 1) / 2 * config.cellWidth
        let y_offset = (1 + sign_y) * config.cellHeight / 2 + sign_y * (config.kernelWidth - 1) / 2 * config.cellWidth

        // Connect input with kernel
        d3.select(`#connectingLine-${i}`)
            .attr("x1", x_scale(selectionX + 1) + x_offset)
            .attr("y1", y_scale(selectionY + 1) + y_offset)
            .attr("x2", config.img_width + config.spaceBetween / 2 - config.cellWidth / 2 + x_offset)
            .attr("y2", config.img_height - config.cellHeight * (config.kernelHeight) + y_offset);

        // Connect kernel with output
        d3.select(`#connectingLine-${i + 4}`)
            .attr("x1", config.img_width + config.spaceBetween / 2 - config.cellWidth / 2 + x_offset)
            .attr("y1", config.img_height - config.cellHeight * (config.kernelHeight) + y_offset)
            .attr("x2", config.img_width + config.spaceBetween + x_scale(selectionX + 1) + (sign_x + 1) / 2 * config.cellWidth)
            .attr("y2", y_scale(selectionY + 1) + + (sign_y + 1) / 2 * config.cellHeight);
    }

    d3.select("#inputImg")
        .append("use")
        .classed("effectDisplay", true)
        .attr("xlink:href", "#inputHighlight");

    d3.select("#outputImg")
        .append("use")
        .classed("effectDisplay", true)
        .attr("xlink:href", "#outputHighlight");
    
    for (let i=0; i < 8; ++i) {
        d3.select("#lineWrapper")
            .append("use")
            .classed("effectDisplay", true)
            .attr("xlink:href", "#connectingLine-" + i);
    }
}

/**
 * Remove the effects(lines, highlights) from the SVG.
 */
export function removeEffects() {
    d3.selectAll(".effectDisplay")
        .remove();
}
