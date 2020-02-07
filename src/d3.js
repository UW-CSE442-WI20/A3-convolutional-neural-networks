import * as d3 from "d3";
//import * as tf from '@tensorflow/tfjs-node'
import * as tf from '@tensorflow/tfjs'

function rand_img(m, n) {
    return [...Array(m)].map(() => [...Array(n)].map(() => (Math.random() < 0.5) | 0))
}

function visualize_current_convolution(i, kernel_w, kernel_h, cell_transform) {
    var rects = d3.selectAll("rect").nodes()

    var x = i % img_data[0].length
    var y = Math.floor(i / img_data[0].length)

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

            cell_transform(d3.select(rects[yk * img_data[0].length + xk]))
        }
    }
}

var img_data = rand_img(8, 8)

var kernel_w = 3
var kernel_h = 3

var w = 640;
var h = 640;
var cell_padding = 1;

var cell_w = w / img_data[0].length - cell_padding * (img_data[0].length + 1) / img_data[0].length
var cell_h = h / img_data.length - cell_padding * (img_data.length + 1) / img_data.length

console.log(cell_w)
console.log(cell_h)

var x_scale = d3.scaleLinear()
            .domain([0, img_data[0].length - 1])
            .range([cell_padding, w - cell_w - cell_padding ]);

var y_scale = d3.scaleLinear()
            .domain([0, img_data.length - 1])
            .range([cell_padding, h - cell_h - cell_padding]);

var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .style("background-color", "gray");

svg.selectAll("rect")
    .data(img_data.flat())
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
        return x_scale(i % img_data[0].length)
    })
    .attr("y", function(d, i) {
        return y_scale(Math.floor(i / img_data[0].length))
    })
    .attr("width", cell_w)
    .attr("height", cell_h)
    .attr("fill", function(d) {
        return d == 0 ? "black" : "white";
    })
    .on("mouseover", (d, i) => visualize_current_convolution(i, kernel_w, kernel_h, c => c.attr("fill", "red")))
    .on("mouseout", (d, i) => visualize_current_convolution(i, kernel_w, kernel_h, c => c.attr("fill", d => d == 0 ? "black" : "white")));



const filter = d3.select("#filter-selection");

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
        kernelSize: [kernel.length, kernel[0].length],
        filters: 1,
        strides: stride,
        dilationRate: dialation,
        trainable: false,
        useBias: false,
        weights: [tf.tensor(kernel.map((row) => row.map((v) => [[v]])))]
    });
}

const x_sobel = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
];
const y_sobel = [
    [-1, -2, -1],
    [ 0,  0,  0],
    [ 1,  2,  1]
];

const convLayer = createConv([28, 28, 1], x_sobel, 1, 1);

const img = tf.ones([1, 28, 28, 1]);
console.log(convLayer.apply(img).shape);

function update() {
    console.log(filter.node().value);
}

filter.on("change", update);
