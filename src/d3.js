import * as d3 from "d3";
import * as tf from "@tensorflow/tfjs";

import * as config from "./config";
import {initSVG, initInputImg, initKernelImg, initOutputImg, initEffects} from "./initSVG";
import {drawInputData, drawKernelData, drawOutputData, drawEffects, removeEffects, grayToFloat, drawOutputDataPoint} from "./updateSVG";
import {createConv} from "./tensor";

// Image data
export let image = [[]];
export let resultImg = [[]];
export let visibleImg = [[]];
export let kernel = [[]];

/**
 * Given a url to an image, displays the image as a matrix of pixels.
 * 
 * @param {String} url 
 */
function loadImage(url) {
    const canvas = document.getElementById('input-image');
    const context = canvas.getContext('2d');

    const pixelValues = [];

    const base_image = new Image();
    base_image.onload = () => {
        canvas.width = base_image.width;
        canvas.height = base_image.height;
        
        for (let i = 0; i < canvas.height; i++) {
            pixelValues[i] = [];
        }

        context.drawImage(base_image, 0, 0);

        const imgData = context.getImageData(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < imgData.data.length; i += 4) {
            let x = (i / 4) % canvas.width;
            let y = Math.floor((i / 4) / canvas.width);
            pixelValues[y][x] = [imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]];
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
    let stop_anim = false
    d3.select("#auto-conv").text("Stop").on("click", () => { stop_anim = true; });
    d3.select("#filter-selection").attr("disabled", "disabled")
    d3.select("#image-selection").attr("disabled", "disabled")
    visibleImg = [...Array(resultImg[0].length)].map(() => [...Array(resultImg.length)].map(() => 0));

    drawInputData(true);
    drawOutputData(true);

    let pixel = 0;
    const interval = d3.interval(() => {
        const row = pixel % resultImg[0].length;
        const col = Math.floor(pixel / resultImg[0].length);
 
        visibleImg[col][row] = resultImg[col][row];

        drawEffects(row, col);
        drawOutputDataPoint(pixel);
        
        if (stop_anim || pixel >= resultImg.length * resultImg[0].length - 1) {
            interval.stop();
            drawInputData(false);
            drawOutputData(false);
            removeEffects()
            d3.select("#auto-conv").text("Auto Conv").on("click", animateConv);
            d3.select("#filter-selection").attr("disabled", null)
            d3.select("#image-selection").attr("disabled", null)
        } else {
            ++pixel;
        }
    }, config.timePerLine / resultImg[0].length);
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
        case "edge_detection":
            kernel = [[0,  1, 0],
                      [1, -4, 1],
                      [0,  1, 0]];
            break;
        case "sharpen":
            kernel = [[ 0, -1,  0],
                      [-1,  5, -1],
                      [ 0, -1,  0]];
            break;
        case "gaussian_blur":
            kernel = [[1/16, 2/16, 1/16],
                      [2/16, 4/16, 2/16],
                      [1/16, 2/16, 1/16]];
            break;
    }

    const img = d3.select("#image-selection");
    // This is where we get the url for the Image
    loadImage(img.node().value);
}

/**
 * Refreshes the data display.
 */
function refreshData() {
    const convLayer = createConv([image[0].length, image.length, 1], kernel, 1, 1, config.PADDED);

    const r = image.map(row => row.map(v => v[0]));
    const g = image.map(row => row.map(v => v[1]));
    const b = image.map(row => row.map(v => v[2]));
    resultImg = tf.concat([
        convLayer.apply(tf.reshape(tf.tensor(r), [1, image[0].length, image.length, 1])),
        convLayer.apply(tf.reshape(tf.tensor(g), [1, image[0].length, image.length, 1])),
        convLayer.apply(tf.reshape(tf.tensor(b), [1, image[0].length, image.length, 1]))
        ], 3).arraySync()[0];

    visibleImg = [...Array(resultImg[0].length)].map(() => [...Array(resultImg.length)].map(() => 0));

    drawInputData(false);
    drawOutputData(false);
    drawKernelData();
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
