import * as d3 from "d3";

import * as config from "./config";

/**
 * Initialize the root SVG.
 */
export function initSVG() {
    d3.select("body")
        .append("svg")
        .attr("id", "rootDisplay")
        .attr("width", 2 * config.img_width + config.spaceBetween + config.borderWidth)
        .attr("height", config.img_height + config.borderWidth);
}

/**
 * Initialize the container for the image of the input.
 */
export function initInputImg() {
    // g element containing all of the image contents
    const inputImg = d3.select("#rootDisplay")
        .append("g")
        .attr("id", "inputImg")
        .attr("transform", `translate(${config.cellWidth + config.borderWidth / 2},
                                      ${config.cellHeight + config.borderWidth / 2})`);
}

/**
 * Initialize the container for the image of the output.
 */
export function initOutputImg() {
    // g element containing all of the image contents
    const outputImg = d3.select("#rootDisplay")
        .append("g")
        .attr("id", "outputImg")
        .attr("transform", `translate(${config.img_width + config.spaceBetween + config.cellWidth + config.borderWidth / 2},
                                      ${config.inputHeightLoss * config.cellHeight + config.cellHeight + config.borderWidth / 2})`);
}

/**
 * Initialize the container for the image of the kernel.
 */
export function initKernelImg() {
    // g element containing all of the image contents
    const kernelImg = d3.select("#rootDisplay")
        .append("g")
        .attr("id", "kernelImg")
        .attr("transform", `translate(${config.img_width + config.spaceBetween / 4 + config.borderWidth},
                                      ${config.img_height - config.kernelCellHeight * config.kernelHeight - config.cellHeight + config.borderWidth / 2})`);
}

/**
 * Initialize the effects(lines, highlighting).
 */
export function initEffects() {
    const effects = d3.select("#rootDisplay")
        .append("g")
        .attr("visibility", "hidden");
    
    const inputHighlight = effects.append("g")
        .attr("id", "inputHighlight")
        .attr("pointer-events", "none");
    inputHighlight.selectAll(".highlightCell")
        .data([...Array(config.kernelHeight * config.kernelWidth)])
        .enter()
        .append("rect")
        .attr("x", function(_, i) {
            return (i % config.kernelWidth) * config.cellWidth;
        })
        .attr("y", function(_, i) {
            return (Math.floor(i / config.kernelWidth) * config.cellHeight);
        })
        .attr("width", config.cellWidth)
        .attr("height", config.cellHeight)
        .attr("fill-opacity", 0)
        .attr("stroke", config.borderColor)
        .attr("stroke-width", config.borderWidth)
        .classed("highlightCell, true");
    inputHighlight.append("rect")
        .attr("width", config.cellWidth * config.kernelWidth)
        .attr("height", config.cellHeight * config.kernelHeight)
        .attr("fill-opacity", 0)
        .attr("stroke", config.highlightColorIn)
        .attr("stroke-width", config.highlightOutlineWidth);
    
    const outputHighlight = effects.append("g")
        .attr("id", "outputHighlight")
        .attr("pointer-events", "none");
    outputHighlight.append("rect")
        .attr("width", config.cellWidth)
        .attr("height", config.cellHeight)
        .attr("fill-opacity", 0)
        .attr("stroke", config.highlightColorOut)
        .attr("stroke-width", config.highlightOutlineWidth);

    // Need a total of 8 connecting lines, 4 for each corner of the input to kernel lines
    // and 4 for the kernel to output lines
    const lines = d3.select("#rootDisplay")
        .append("g")
        .attr("id", "lineWrapper");
    for (let i = 0; i < 8; ++i) {
        const connectingLine = effects.append("line")
            .attr("id", `connectingLine-${i}`)
            .attr("pointer-events", "none")
            .attr("stroke-opacity", 0.8)
            .attr("stroke-dasharray", 4)
            .attr("stroke", i < 4 ? config.highlightColorIn : config.highlightColorOut)
            .attr("stroke-width", config.borderWidth);
    }
}
