import * as d3 from "d3";
import { color } from "d3";

function rand_img(m, n) {
    return [...Array(m)].map(() => [...Array(n)].map(() => Math.random()))
}

function gray(d) {
    return d === undefined ? "white" : d3.rgb(d * 255, d * 255, d * 255)
}

// Want 1 == black and 0 == white
var color_scale =
            d3.scaleLinear()
                .domain([0, 1])
                .range([1, 0])

function convolution(i, kernel, class_name, cell_transform) {
    d3.selectAll("line").remove()

    var rects = d3.selectAll("." + class_name).nodes()
    var x = i % img_data[0].length
    var y = Math.floor(i / img_data[0].length)

    var kernel_h = kernel.length
    var kernel_w = kernel[0].length

    var conv = 0
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

            var idx = yk * img_data[0].length + xk
            var cell = d3.select(rects[idx])
            conv += cell.data()[0] * kernel[hk][wk]
            cell_transform(cell)
        }
    }

    var kernel_rects = d3.selectAll(".kernel").nodes()
    var kernel_center = d3.select(kernel_rects[(kernel.length + 1) * (kernel.length - 1) / 2])

    var other_rects = d3.selectAll(class_name === "input" ? ".output" : ".input").nodes()
    var other_cur_rect = d3.select(other_rects[i])

    var cur_rect = d3.select(rects[i])
    d3.select("svg")
        .append("line")
        .attr("stroke", "green")
        .attr("stroke-width", 4)
        .attr("x1", parseFloat(cur_rect.attr("x")) + parseFloat(cur_rect.attr("width")) / 2)
        .attr("y1", parseFloat(cur_rect.attr("y")) + parseFloat(cur_rect.attr("height")) / 2)
        .attr("x2", parseFloat(kernel_center.attr("x")) + parseFloat(kernel_center.attr("width")) / 2)
        .attr("y2", parseFloat(kernel_center.attr("y")) + parseFloat(kernel_center.attr("height")) / 2)

    d3.select("svg")
        .append("line")
        .attr("stroke", "green")
        .attr("stroke-width", 4)
        .attr("x1", parseFloat(kernel_center.attr("x")) + parseFloat(kernel_center.attr("width")) / 2)
        .attr("y1", parseFloat(kernel_center.attr("y")) + parseFloat(kernel_center.attr("height")) / 2)
        .attr("x2", parseFloat(other_cur_rect.attr("x")) + parseFloat(other_cur_rect.attr("width")) / 2)
        .attr("y2", parseFloat(other_cur_rect.attr("y")) + parseFloat(other_cur_rect.attr("height")) / 2)

    if(class_name === "input") {
        var output_rects = d3.selectAll(".output").nodes()
        d3.select(output_rects[i]).data([conv]).attr("fill", gray(color_scale(conv)))
    }
}

// Image loads HERE!!!
var img_data = rand_img(28, 28)

var kernel = [[ 0, 0, 0],
              [ 1/3, 1/3, 1/3],
              [ 0, 0, 0]]

var w = 640;
var h = 640;
var cell_padding = 4;

var cell_w = w / img_data[0].length // - cell_padding * (img_data[0].length + 1) / img_data[0].length
var cell_h = h / img_data.length // - cell_padding * (img_data.length + 1) / img_data.length

var x_scale = d3.scaleLinear()
            .domain([0, img_data[0].length - 1])
            .range([cell_padding / 2, w - cell_w - cell_padding / 2 ])

var y_scale = d3.scaleLinear()
            .domain([0, img_data.length - 1])
            .range([cell_padding / 2, h - cell_h - cell_padding / 2])

var svg = d3.select("body")
            .append("svg")
            .attr("width", w * 5 / 2)
            .attr("height", h)

svg.selectAll("rect")

    // Input
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
    .attr("fill", d => gray(color_scale(d)))
    .attr("stroke", "gray")
    .attr("stroke-width", cell_padding)
    .classed("input", true)
    .on("mouseover", (d, i) => convolution(i, kernel, "input", c => c.attr("fill", "red")))
    .on("mouseout", (d, i) => convolution(i, kernel, "input", c => c.attr("fill", d => d3.rgb(d * 255, d * 255, d * 255))))
    .exit()

    // Output
    .data(Array(img_data.length * img_data[0].length))
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
        return 3/2 * w + x_scale(i % img_data[0].length)
    })
    .attr("y", function(d, i) {
        return y_scale(Math.floor(i / img_data[0].length))
    })
    .attr("width", cell_w)
    .attr("height", cell_h)
    .attr("fill", "white")
    .attr("stroke", "gray")
    .attr("stroke-width", cell_padding)
    .classed("output", true)
    .on("mouseover", (d, i) => convolution(i, kernel, "output", c => c.attr("fill", "red")))
    .on("mouseout", (d, i) => convolution(i, kernel, "output", c => c.attr("fill", d => gray(color_scale(d)))))
    .exit()

    // Kernel
    .data(kernel.flat())
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
        return 5/4*w - cell_w * (kernel[0].length) / 2 - cell_padding / 2 + x_scale(i % kernel[0].length)
    })
    .attr("y", function(d, i) {
        return y_scale(img_data.length - kernel.length + Math.floor(i / kernel[0].length))
    })
    .attr("width", cell_w)
    .attr("height", cell_h)
    .attr("fill", d => gray(color_scale(d)))
    .attr("stroke", "gray")
    .attr("stroke-width", cell_padding)
    .classed("kernel", true)

const filter = d3.select("#filter-selection");
// const filterDisplay = d3.select("body")
//             .append("svg")
//             .attr("width", 240)
//             .attr("height", 240)
//             .style("background-color", "white");

//filterDisplay.selectAll()

function update() {
    console.log(filter.node().value);
}

filter.on("change", update);
