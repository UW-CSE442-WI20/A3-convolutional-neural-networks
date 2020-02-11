import * as d3 from "d3";
import * as tf from "@tensorflow/tfjs";

import * as config from "./config";
import {initSVG, initInputImg, initKernelImg, initOutputImg, initEffects} from "./initSVG";
import {drawInputData, drawKernelData, drawOutputData, drawEffects, removeEffects, updateSelection, grayToFloat} from "./updateSVG";
import {tensorToFlat, createConv} from "./tensor";

// Image data
let image;
let resultImg;
let visibleImg;
let kernel;

/**
 * Given a url to an image, displays the image as a matrix of pixels.
 * 
 * @param {String} url 
 */
function loadImage(url) {
    const canvas = document.getElementById('input-image');
    const context = canvas.getContext('2d');

    const pixelValues = [];

    for (let i = 0; i < canvas.height; i++) {
        pixelValues[i] = [];
    }

    const base_image = new Image();
    base_image.onload = function(){
        context.drawImage(base_image, 0, 0);

        const imgData = context.getImageData(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < imgData.data.length; i += 4) {
            let x = (i / 4) % canvas.width;
            let y = Math.floor((i / 4) / canvas.width);
            pixelValues[y][x] = grayToFloat(d3.rgb(imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]));
        }

        image = pixelValues;

        refreshData();
    }

    base_image.crossOrigin = "Anonymous";
    base_image.src = url;
}

/**
 * Begin iterating through the result image, displaying the traversed pixels.
 */
function animateConv() {
    visibleImg = [...Array(config.outputWidth)].map(() => [...Array(config.outputHeight)].map(() => 0));

    drawInputData(image, true);
    let i = 0

    function incrementPixel() {
        const row = i % config.outputWidth;
        const col = Math.floor(i / config.outputWidth);
        visibleImg[col][row] = resultImg[col][row];
        drawOutputData(visibleImg, true);
        updateSelection(row, col);
        ++i;
        if (i < config.outputHeight * config.outputWidth) {
            setTimeout(incrementPixel, 10);
        } else {
            drawInputData(image, false);
            drawOutputData(visibleImg, false);
        }
    }

    setTimeout(incrementPixel, 10);
}


/**
 * Updates display and data with new filter and image choice.
 */
function updateData() {
    switch (d3.select("#filter-selection").node().value) {
        case "identity":
            kernel = [[0, 0, 0],
                      [0, 1, 0],
                      [0, 0, 0]];
            break;
        case "x_sobel":
            kernel = [[-1, 0, 1],
                      [-2, 0, 2],
                      [-1, 0, 1]];
            break;
        case "y_sobel":
            kernel = [[ 1,  2,  1],
                      [ 0,  0,  0], 
                      [-1, -2, -1]];
            break;
    }

    const image = d3.select("#image-selection");
    // This is where we get the url for the Image Bois
    loadImage(image.node().value);
}

/**
 * Refreshes the data display.
 */
function refreshData() {
    const convLayer = createConv([config.inputWidth, config.inputHeight, 1], tf.reshape(tf.tensor(kernel), [config.kernelWidth, config.kernelHeight, 1, 1]), 1, 1, config.PADDED);
    resultImg = tf.reshape(convLayer.apply(tf.reshape(tf.tensor(image), [1, config.inputWidth, config.inputHeight, 1])), [config.outputWidth, config.outputHeight]).arraySync();

    visibleImg = [...Array(config.outputWidth)].map(() => [...Array(config.outputHeight)].map(() => 0));

    drawInputData(image, false);
    drawOutputData(resultImg, false);
    drawKernelData(kernel);
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

d3.select("#filter-selection").on("change", updateData);
d3.select("#image-selection").on("change", updateData);

d3.select("#auto-conv").on("click", animateConv);

window.onload = main;
