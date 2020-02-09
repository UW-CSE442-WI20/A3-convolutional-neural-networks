import * as d3 from "d3";

const highlight_color = d3.color("yellow")
const highlight_opacity = 0.2

/**
 * Returns an RGB color of gray accosiated with the floated gray value.
 * 
 * @param {number} d A value [0, 1] representing a shade of gray
 */
function gray(d) {
    return d === undefined ? "white" : d3.rgb(d * 255, d * 255, d * 255)
}

/**
 * Return a random image. Output shape is [h, w].
 * 
 * @param {number} w width
 * @param {number} h height
 */
function rand_img(w, h) {
    return [...Array(h)].map(() => [...Array(w)].map(() => Math.random()))
}

// Scales black to white and vice versa
var color_scale =
            d3.scaleLinear()
                .domain([0, 1])
                .range([1, 0])

/**
 * Returns currently selected kernel as k x k matrix.
 */
function get_current_kernel() {
    var filter = d3.select("#filter-selection")

    switch (filter.node().value) {
        case "identity":
            return [[0, 0, 0],
                    [0, 1, 0],
                    [0, 0, 0]];
        case "x_sobel":
            return [[-1, -2, -1],
                    [ 0,  0,  0],
                    [ 1,  2,  1]];
        case "y_sobel":
            return [[-1, 0, 1],
                    [-2, 0, 2],
                    [-1, 0, 1]];

    }

    return undefined
}

/**
 * Gives ReLU of x, i.e
 * ReLU(x) = [ 0 if x <  0]
 *           [ x if x >= 0]
 * @param {*} x 
 */
function ReLU(x) {
    return Math.max(0, x)
}

/**
 * Updates display with new filter data.
 */
function update_kernel() {
    var kernel = get_current_kernel()

    // Just need to update data and bind it
    d3.selectAll("#kernel-text")
        .data(kernel.flat())
        .text(d => d)

    return kernel
}

function convolution(img_w, img_h, kernel, idx, f) {
    var rects = d3.selectAll("#input").nodes()

    // Calculate x and y from flattened index
    var x = idx % img_data[0].length
    var y = Math.floor(idx / img_data[0].length)

    var kernel_h = kernel.length
    var kernel_w = kernel[0].length
    var conv = 0

    for (var hk = 0; hk < kernel_h; ++hk) {
        // y location in image. (kernel_h - 1) / 2 + hk is the y offset from the selected pixel
        var yk = y - (kernel_h - 1) / 2 + hk
        if(yk < 0) {
            // We hit the top of the image
            continue;
        }
        else if (yk >= img_h) {
            // We hit the bottom of the image and are done
            break;
        }

        for (var wk = 0; wk < kernel_w; ++wk) {
            // x location in image. (kernel_w - 1) / 2 + wk is the x offset from the selected pixel
            var xk = x - (kernel_w - 1) / 2 + wk

            if (xk < 0) {
                // We hit the left of the image
                continue;
            }
            else if (xk >= img_w) {
                // We hite the right of the image and are done with this row
                break;
            }

            // Transform back to flat index
            var idx = yk * img_w + xk
            var cell = d3.select(rects[idx])
            // Accumulate convolution in conv
            conv += cell.data()[0] * kernel[hk][wk]

            f(cell)
        }
    }

    return conv
}

/**
 * conv_in is invoked when a pixel is entered. It highlights the surrounding pixel patch
 * and performs the convolution with the patch around the current pixel and the given kernel.
 * The resulting value is used to color the pixel in the output image. A line is drawn from
 * the input pixel to the kernel and to the output pixel.
 * 
 * @param {number} i Index of current pixel in flattened image
 * @param {number[][]} kernel Kernel to convolve with
 */
function conv_in(i, kernel) {
    // Convolve and highlight pixels
    var conv = ReLU(convolution(img_data[0].length, img_data.length, kernel, i, c => {
        highlight_cell(c)
    }))

    // Drawing lines

    // Get center rectangle of kernel
    var kernel_rects = d3.selectAll("#kernel").nodes()
    var kernel_center = d3.select(kernel_rects[(kernel.length + 1) * (kernel.length - 1) / 2])

    // Get the output rect
    var output_rects = d3.selectAll("#output").nodes()
    var output_rect = d3.select(output_rects[i])

    // Update output pixel and data to reflect convolved value
    d3.select(output_rects[i]).data([conv]).attr("fill", gray(color_scale(conv)))

    var rects = d3.selectAll("#input").nodes()

    // Draw line from input rect to kernel
    var input_rect = d3.select(rects[i])
    d3.select("svg")
        .append("line")
        .attr("stroke", "red")
        .attr("stroke-width", 4)
        .attr("x1", parseFloat(input_rect.attr("x")) + parseFloat(input_rect.attr("width")) / 2)
        .attr("y1", parseFloat(input_rect.attr("y")) + parseFloat(input_rect.attr("height")) / 2)
        .attr("x2", parseFloat(kernel_center.attr("x")) + parseFloat(kernel_center.attr("width")) / 2)
        .attr("y2", parseFloat(kernel_center.attr("y")) + parseFloat(kernel_center.attr("height")) / 2)

    // Draw line from kernel to output rect
    d3.select("svg")
        .append("line")
        .attr("stroke", "red")
        .attr("stroke-width", 4)
        .attr("x1", parseFloat(kernel_center.attr("x")) + parseFloat(kernel_center.attr("width")) / 2)
        .attr("y1", parseFloat(kernel_center.attr("y")) + parseFloat(kernel_center.attr("height")) / 2)
        .attr("x2", parseFloat(output_rect.attr("x")) + parseFloat(output_rect.attr("width")) / 2)
        .attr("y2", parseFloat(output_rect.attr("y")) + parseFloat(output_rect.attr("height")) / 2)


    highlight_cell(output_rect)
}

function conv_out(i, kernel) {
    // Remove the connecting lines
    d3.selectAll("line").remove()

    // Reset the color of all input pixels affected by the current convolution
    convolution(img_data[0].length, img_data.length, kernel, i, c => {
        c.attr("fill", gray(color_scale(c.data())))
    })

    // Reset color of output pixel
    var output_rects = d3.selectAll("#output").nodes()
    var output_rect = d3.select(output_rects[i])
    output_rect.attr("fill", gray(color_scale(output_rect.data())))
}


/**
 * Highlights given cell by blending it's current cell value with the highlight color and
 * alpha value
 * @param {Object} cell
 */
function highlight_cell(cell) {
    var cell_color = color_scale(cell.data()) * 255
    var blended_color = d3.rgb(cell_color + (highlight_color.r - cell_color) * highlight_opacity,
                           cell_color + (highlight_color.g - cell_color) * highlight_opacity,
                           cell_color + (highlight_color.b - cell_color) * highlight_opacity)

    cell.attr("fill", blended_color)
}

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

var img_data = rand_img(8, 8)

// Width and height of the input and output images, in pixels. The cell
// width and height are automatically calculated to fit this size.
const w = 640;
const h = 640;

// Padding, equivalent to borders between the cells
const cell_padding = 4;

// Width/Height of an individual cell
const cellWidth = w / img_data[0].length // - cell_padding * (img_data[0].length + 1) / img_data[0].length
const cellHeight = h / img_data.length // - cell_padding * (img_data.length + 1) / img_data.length

// d3 scale to convert between x cell index and x pixel
var x_scale = d3.scaleLinear()
            .domain([0, img_data[0].length - 1])
            .range([cell_padding / 2, w - cellWidth - cell_padding / 2 ])

// d3 scale to convert between y cell index and y pixel
var y_scale = d3.scaleLinear()
            .domain([0, img_data.length - 1])
            .range([cell_padding / 2, h - cellHeight - cell_padding / 2])

// Main svg where all graphics are placed. The width is 2w + 1/2 w = 5/2 w, since we want
// to place 2 images and have some space inbetween for options and the filter
var svg = d3.select("body")
            .append("svg")
            .attr("width", w * 5 / 2)
            .attr("height", h)

var kernel = get_current_kernel()

svg.selectAll("rect")

    // Input image
    .data(img_data.flat())
    .enter()
    .append("rect")
    // x and y are extracted from the flattened index
    .attr("x", (_, i) => x_scale(i % img_data[0].length))
    .attr("y", (_, i) => y_scale(Math.floor(i / img_data[0].length)))
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", d => gray(color_scale(d)))
    .attr("stroke", "gray")
    .attr("stroke-width", cell_padding)
    .attr("id", "input")
    // Events for when mouse enters/leaves a cell
    .on("mouseover", (_, i) => conv_in(i, kernel))
    .on("mouseout", (_, i) => conv_out(i, kernel))
    .exit()

    // Output
    .data(Array(img_data.length * img_data[0].length))
    .enter()
    .append("rect")
    // x is offested by w + w/2, which corresponds to input width + kernel area width
    .attr("x", (_, i) => 3/2 * w + x_scale(i % img_data[0].length))
    .attr("y", (_, i) => y_scale(Math.floor(i / img_data[0].length)))
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", "white")
    .attr("stroke", "gray")
    .attr("stroke-width", cell_padding)
    .attr("id", "output")
    // Events for when mouse enters/leaves a cell
    .on("mouseover", (_, i) => conv_in(i, kernel))
    .on("mouseout", (_, i) => conv_out(i, kernel))
    .exit()

    // Kernel
    .data(kernel.flat())
    .enter()
    .append("rect")
    // x is calculated through an offset from the center between input and output images:
    // w + w/4 = 5/4 w is the center of the kernel area.
    .attr("x", (_, i) => 5/4*w - cellWidth * (kernel[0].length) / 2 - cell_padding / 2 + x_scale(i % kernel[0].length))
    .attr("y", (_, i) => y_scale(img_data.length - kernel.length + Math.floor(i / kernel[0].length)))
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", "white")
    .attr("stroke", "gray")
    .attr("stroke-width", cell_padding)
    .attr("id", "kernel")
    .exit()

// Draw labels of values for kernel
svg.selectAll("text")
    .data(kernel.flat())
    .enter()
    .append("text")
    // x and y are calculated in the same way as the coordinates for the rects they are contained in, + cellWidth/cellHeight / 2 to center
    // them in the rect
    .attr("x", (_, i) => 5/4 * w - cellWidth * (kernel[0].length) / 2 - cell_padding / 2 + x_scale(i % kernel[0].length) + cellWidth / 2)
    .attr("y", (_, i) => y_scale(img_data.length - kernel.length + Math.floor(i / kernel[0].length)) + cellHeight / 2)
    .attr("font-family", "Arial")
    .attr("font-size", cellHeight / 4)
    .style("text-anchor", "middle")
    .text(d => d)
    .attr("id", "kernel-text")
    .exit()

d3.select("#filter-selection").on("change", () => {
    // Redraw kernel and update global kernel variable
    kernel = update_kernel()
    // Reset the output image
    clear_output(img_data.length * img_data[0].length)
});

d3.select("#auto-conv").on("click", () => auto_conv(img_data.length * img_data[0].length, kernel))