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
        .attr("clip-path", "url(#inputImgMask)")
        .attr("transform", `translate(${config.borderWidth / 2},
                                      ${config.borderWidth / 2})`);
    // Box around image(used for mask and outline)
    const inputOutline = inputImg.append("rect")
        .attr("id", "inputOutline")
        .attr("x", -config.borderWidth / 2)
        .attr("y", -config.borderWidth / 2)
        .attr("width", config.cellWidth * config.inputWidth + config.borderWidth)
        .attr("height", config.cellHeight * config.inputHeight + config.borderWidth)
        .attr("fill-opacity", 0);
    // Mask (uses outline of image)
    const inputMask = inputImg.append("defs")
        .append("clipPath").attr("id", "inputImgMask")
        .append("use").attr("xlink:href", "#inputOutline");
}

/**
 * Initialize the container for the image of the output.
 */
export function initOutputImg() {
    // g element containing all of the image contents
    const outputImg = d3.select("#rootDisplay")
        .append("g")
        .attr("id", "outputImg")
        .attr("clip-path", "url(#outputImgMask)")
        .attr("transform", `translate(${config.img_width + config.spaceBetween + config.borderWidth / 2},
                                      ${config.inputHeightLoss * config.cellHeight + config.borderWidth / 2})`);
    // Box around image(used for mask and outline)
    const outputOutline = outputImg.append("rect")
        .attr("id", "outputOutline")
        .attr("x", -config.borderWidth / 2)
        .attr("y", -config.borderWidth / 2)
        .attr("width", config.cellWidth * config.outputWidth + config.borderWidth)
        .attr("height", config.cellHeight * config.outputHeight + config.borderWidth)
        .attr("fill-opacity", 0);
    // Mask (uses outline of image)
    const outputMask = outputImg.append("defs")
        .append("clipPath").attr("id", "outputImgMask")
        .append("use").attr("xlink:href", "#outputOutline");
}

/**
 * Initialize the container for the image of the kernel.
 */
export function initKernelImg() {
    // g element containing all of the image contents
    const kernelImg = d3.select("#rootDisplay")
        .append("g")
        .attr("id", "kernelImg")
        .attr("clip-path", "url(#kernelImgMask)")
        .attr("transform", `translate(${config.img_width + config.spaceBetween / 2 - config.cellWidth * (config.kernelWidth) / 2 +  config.borderWidth / 2},
                                      ${config.img_height - config.cellHeight * config.kernelHeight + config.borderWidth / 2})`);
    // Box around image(used for mask and outline)
    const kernelOutline = kernelImg.append("rect")
        .attr("id", "kernelOutline")
        .attr("x", -config.borderWidth / 2)
        .attr("y", -config.borderWidth / 2)
        .attr("width", config.cellWidth * config.kernelWidth + config.borderWidth)
        .attr("height", config.cellHeight * config.kernelHeight + config.borderWidth)
        .attr("fill-opacity", 0);
    // Mask (uses outline of image)
    const kernelMask = kernelImg.append("defs")
        .append("clipPath").attr("id", "kernelImgMask")
        .append("use").attr("xlink:href", "#kernelOutline");
}

/**
 * Initialize the effects(lines, highlighting).
 */
export function initEffects() {
    const effects = d3.select("#rootDisplay")
        .append("g")
        .attr("visibility", "hidden");
    const inputHighlight = effects.append("rect")
        .attr("id", "inputHighlight")
        .attr("pointer-events", "none")
        .attr("width", config.cellWidth * config.kernelWidth)
        .attr("height", config.cellHeight * config.kernelHeight)
        .attr("fill-opacity", 0)
        .attr("stroke", config.highlightOutlineColor)
        .attr("stroke-width", config.highlightOutlineWidth);
    const outputHighlight = effects.append("rect")
        .attr("id", "outputHighlight")
        .attr("pointer-events", "none")
        .attr("width", config.cellWidth)
        .attr("height", config.cellHeight)
        .attr("fill-opacity", 0)
        .attr("stroke", config.highlightOutlineColor)
        .attr("stroke-width", config.highlightOutlineWidth);

    // Need a total of 8 connecting lines, 4 for each corner of the input to kernel lines
    // and 4 for the kernel to output lines
    for (let i = 0; i < 8; ++i) {
        const connectingLine = effects.append("line")
            .attr("id", "connectingLine" + "-" + i)
            .attr("pointer-events", "none")
            .attr("stroke-opacity", 0.8)
            .attr("stroke-dasharray", 4)
            .attr("stroke", "red")
            .attr("stroke-width", config.borderWidth);
    }
}
