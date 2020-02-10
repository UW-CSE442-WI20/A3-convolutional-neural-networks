import * as d3 from "d3";
import * as tf from "@tensorflow/tfjs";

import * as config from "./config";
import {initSVG, initInputImg, initKernelImg, initOutputImg, initEffects} from "./initSVG";
import {drawInputData, drawKernelData, drawOutputData, drawEffects, removeEffects, grayToFloat} from "./updateSVG";

// Currently highlighted selection
let selectionX;
let selectionY;

// Image data
let image;
let resultImg;
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

    function grayScaleImage() {
        const imgData = context.getImageData(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < imgData.data.length; i += 4) {
            let x = (i / 4) % canvas.width;
            let y = Math.floor((i / 4) / canvas.width);
            pixelValues[y][x] = grayToFloat(d3.rgb(imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]));
        }

        image = tf.reshape(tf.tensor(pixelValues), [1, 28, 28, 1]);
        refreshData();
    }

    const base_image = new Image();
    base_image.onload = function(){
        context.drawImage(base_image, 0, 0);
        grayScaleImage();
    }

    base_image.crossOrigin = "Anonymous";
    base_image.src = url;
}

/************** TODO ******************
function clear_output(img_size) {
    // Set all values to 0 and colors to white
    d3.selectAll("#output").data([...Array(img_size)].map(() => 0))
      .attr("fill", "white")
}

function auto_conv(img_size, kernel) {
    clear_output(img_size)

    var i = 0
    d3.interval
    var interval = d3.interval(t => {
        // Special case for start, where we can't do conv out
        if(i > 0)
            conv_out(i - 1, kernel)

        conv_in(i, kernel)

        i += 1
        // Finished convolution, so stop
        if (i == img_size) {
            conv_out(i - 1, kernel)
            interval.stop()
        }
    }, 100)
}
*/

/**
 * Return a tensor of random floats. Output shape is [1, w, h, c].
 * 
 * @param {number} w width
 * @param {number} h height
 * @param {number} c channels
 */
function randImgTensor(w, h, c) {
    return tf.tensor([[...Array(w)].map(() => [...Array(h)].map(() => [...Array(c)].map(() => Math.random())))]);
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
        activation: "relu",
        filters: 1,
        strides: stride,
        dilationRate: dialation,
        trainable: false,
        useBias: false,
        padding: paddingMode,
        weights: [kernel]
    });
}

/**
 * Updates display and data with new filter and image choice.
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

    kernel = tf.reshape(kernel, [config.kernelWidth, config.kernelHeight, 1, 1]);

    const image = d3.select("#image-selection");
    // This is where we get the url for the Image Bois
    loadImage(image.node().value);
}

/**
 * Refreshes the data display.
 */
function refreshData() {
    const convLayer = createConv([config.inputWidth, config.inputHeight, 1], kernel, 1, 1, config.PADDED);
    resultImg = convLayer.apply(image);

    drawInputData(image);
    drawOutputData(resultImg);
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

d3.select(":root").style("--fontSize", `${config.fontSize}px`);

d3.select("#filter-selection").on("change", updateData);
d3.select("#image-selection").on("change", updateData);

d3.select("#auto-conv").on("click", () => auto_conv(img_data.length * img_data[0].length, kernel))

window.onload = main;
