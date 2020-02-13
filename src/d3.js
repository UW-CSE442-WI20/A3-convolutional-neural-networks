import * as d3 from "d3";
import * as tf from "@tensorflow/tfjs";

import * as config from "./config";

import {initSVG, initInputImg, initKernelImg, initOutputImg, initEffects, initAnnotations, updateAnnotation} from "./initSVG";
import {drawInputData, drawKernelData, drawOutputData, drawEffects, removeEffects, grayToFloat, drawOutputDataPoint} from "./updateSVG";
import {createConv} from "./tensor";
import {Slide} from "./slide"

// Image data
export let image = [[]];
export let resultImg = [[]];
export let visibleImg = [[]];
export let kernel = [[]];

export let slide_idx = 0
let slides = [
    new Slide("Bird", "demo", "Convolution simply takes two matrics of the same size, multiplies corresponding entries and sums them up. \n \n " +
                              "Mouse over the left input matrix to convolve small patches with the kernel below! (Or use 'Auto Conv' to do it automatically) \n \n Click 'Next' once " + 
                              "understand how the math works.", 0, 0),
    new Slide("Bird", "edge_detection", "Usually convolution is applied to images, where the numbers represent colors. \n \n " +
        "The kernel is applied to each color channel (r, g, b). \n \n " + 
        "The kernel below is an edge detection filter. Use it to highlight the edges of the bird. ", 0, 0),       
    

    new Slide(null, null, "Now try convolving images on your own! Choose an image and filter from above.", 0, 0)]

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

            let color = [imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]];

            if (slide_idx == 0) { // Just do 0's and 1's for this one
                let gray = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3 / 255
                color[0] = (gray <= 0.7) | 0
            }
            pixelValues[y][x] = color;
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
    d3.select("#next").attr("disabled", "disabled")
    d3.select("#prev").attr("disabled", "disabled")

    let default_val = slide_idx == 0 ? 0 : 255;
    visibleImg = [...Array(config.outputWidth)].map(() => [...Array(config.outputHeight)].map(() => [default_val, default_val, default_val]));

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
            d3.select("#next").attr("disabled", null)
            d3.select("#prev").attr("disabled", null)
        } else {
            ++pixel;
        }
    }, config.timePerLine / resultImg[0].length);
}

/**
 * Updates display and data with new filter and image choice.
 */
function updateData() {
    let kernel_name = null;
    let img_url = null;

    if (slide_idx == slides.length - 1) {
        img_url = d3.select("#image-selection").node().value;
        kernel_name = d3.select("#filter-selection").node().value;
    }
    else {
        let options = Array.apply(null, d3.select("#image-selection").node().options)
        let opt_idx = options.findIndex((v, i, arr) => v.text == slides[slide_idx].img)
        img_url = options[opt_idx].value

        kernel_name = slides[slide_idx].kernel
    }

    switch (kernel_name) {
        case "demo":
            kernel = [[0, 2, 0],
                      [2, 1, 2],
                      [0, 2, 0]];
            break
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
            kernel = [[-1,  -1, -1],
                      [-1, 8, -1],
                      [-1,  -1, -1]];
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

    loadImage(img_url);
}

/**
 * Refreshes the data display.
 */
function refreshData() {
    const convLayer = createConv([image[0].length, image.length, 1], kernel, 1, 1, config.PADDED);

    const r = image.map(row => row.map(v => v[0]));
    const g = image.map(row => row.map(v => v[1]));
    const b = image.map(row => row.map(v => v[2]));
    console.log(r)
    resultImg = tf.concat([
        convLayer.apply(tf.reshape(tf.tensor(r), [1, image[0].length, image.length, 1])),
        convLayer.apply(tf.reshape(tf.tensor(g), [1, image[0].length, image.length, 1])),
        convLayer.apply(tf.reshape(tf.tensor(b), [1, image[0].length, image.length, 1]))
        ], 3).arraySync()[0];

    let default_val = slide_idx == 0 ? 0 : 255;
    visibleImg = [...Array(resultImg[0].length)].map(() => [...Array(resultImg.length)].map(() => [default_val, default_val, default_val]));

    drawInputData(false);
    drawOutputData(false);
    drawKernelData();
}

function update_slide() {
    d3.select("#annotation")
        .style("visibility", "visible");
    updateAnnotation(slides[slide_idx].annotation)

    let vis = (slide_idx == slides.length - 1) ? "visible" : "hidden";
    d3.select("#filter-selection").style("visibility", vis)
    d3.select("#image-selection").style("visibility", vis)
}

function prev_slide() {
    if (slide_idx == 0)
        return

    --slide_idx;

    if (slide_idx == 0)
        d3.select("#prev").style("visibility", "hidden");
    else
        d3.select("#prev").style("visibility", "visible");
    
    d3.select("#next").style("visibility", "visible");

    update_slide()
    updateData();
}

function next_slide() {
    if (slide_idx == slides.length - 1)
        return

    ++slide_idx;

    if (slide_idx == slides.length - 1)
        d3.select("#next").style("visibility", "hidden");
    else
        d3.select("#next").style("visibility", "visible");
    
    d3.select("#prev").style("visibility", "visible");

    update_slide()
    updateData();
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
    initAnnotations();
    update_slide();
    updateData();    
}

d3.select("#filter-selection").style("visibility", "hidden")
d3.select("#image-selection").style("visibility", "hidden")
d3.select("#filter-selection").on("change", updateData);
d3.select("#image-selection").on("change", updateData);

d3.select("#auto-conv").on("click", animateConv);

d3.select("#prev").style("visibility", "hidden");
d3.select("#prev").on("click", prev_slide)
d3.select("#next").on("click", next_slide)

window.onload = main;
