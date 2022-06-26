// Tools to help calculations and organization
let management = require("./management.js");
let Point = require("./maths.js");

// Calculates whether a point is in a "donut" or not
function donutChart(point, region, appearance) {
    return point.inCircle(1, appearance.outer_squareness) && !point.inCircle(1 - appearance.thickness, appearance.inner_squareness);
}

// Map the angle of a point to a color in the chart
function angleToColor(ctx, point, arcs, region, colors) {
    let angle = point.angle();

    for (arc of arcs) {
        if (angle > arc[0]) {
            ctx.fillStyle = colors[arc[1]];
            break;
        }
    }
}

// Localizes a region into 8 subregions. If a point is in the corner of any of these subregions, and it's in a circle, return true
function legendIcons(point, region, appearance) {
    let pixel = point.unwrap();
    let mapped_point = new Point(
        pixel[0] % ((region.width / 2)), 
        pixel[1] % (region.height / 4), 
        appearance.icon_size, 
        appearance.icon_size
    );

    return mapped_point.inCircle(1, appearance.icon_squareness);
}

// Colors the icons of the legend according to position
function legendColor(ctx, point, items, region, colors) {
    let pixel = point.unwrap();
    let rows = Math.floor(pixel[1] / (region.height / 4));
    let column = Math.floor(pixel[0] / (region.width / 2));

    if ((column) + (rows * 2) < items.length) {
        ctx.fillStyle = colors[(column) + (rows * 2)];
    } else {
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
    }
}


// Iterate through points in a defined region, if it fits a condition, color it accordingly and draw the pixel
function drawCondition(ctx, condition, color_condition, color_regions, region, appearance, colors) {
    for (let i = 0; i < region.width*region.height; i++) {
        let [x, y] = management.indexToGrid(i, region.width);
        let point = new Point(x, y, region.width, region.height);
        
        if (!condition(point, region, appearance)) continue;

        color_condition(ctx, point, color_regions, region, colors)

        ctx.fillRect(x + region.x, y + region.y, 1, 1);
    }   
}

// Draws the background
function drawBackground(ctx, config) {
    ctx.fillStyle = config.color;
    ctx.fillRect(0, 0, config.width, config.height);
}

// Draw the graph using the given config
function drawGraph(ctx, items, config, colors) {
    drawCondition(
        ctx, 
        donutChart, 
        angleToColor, 
        management.itemsToArcs(items), 
        config.region,
        config.appearance,
        colors
    );
}

// Draw the legend using the given config
function drawLegend(ctx, items, config, icon_colors) {
    drawCondition(
        ctx, 
        legendIcons, 
        legendColor, 
        items, 
        config.region, 
        config.appearance,
        icon_colors
    );
    
    drawLabels(
        ctx, 
        items, 
        config.region,
        config.appearance
    );
}

// Draws the title. If the length of the title exceeds a set maximum, start scaling it down by some factor
function drawTitle(ctx, title, config) {
    let region = config.region;
    let appearance = config.appearance;
    let font_size = appearance.base_font_size;

    if (title.length >= appearance.scale_start) {
        font_size = region.width / title.length * appearance.scale_strength
    }

    setFont(ctx, font_size, appearance.text_color, appearance.font);
    ctx.fillText(title, region.x, region.y);
}

// Draw the amount of votes. If there's only one vote, then use the singular label instead of plural
function drawVotes(ctx, votes, config) {
    let region = config.region;
    let appearance = config.appearance;
    let label = appearance.label_plural;

    if (votes == 1) {
        label = appearance.label_singular;
    }

    setFont(ctx, appearance.base_font_size, appearance.text_color, appearance.font);
    ctx.textAlign = "center";
    ctx.fillText(votes, region.x, region.y);
    ctx.fillText(label, region.x, region.y + appearance.base_font_size);
    ctx.textAlign = "left";
}

// Draw the labels of the legend
function drawLabels(ctx, items, region, appearance) {
    let a = items.sort(management.sortByColor);
    let base_font_size = appearance.base_font_size;

    for (i in a) {
        font_size = base_font_size;

        let [x, y] = management.indexToGrid(i, 2);

        let text_width = region.width / 2;
        let text_x = region.x + appearance.icon_size + 5;

        let text_height = region.height / 4;
        let text_y = region.y + appearance.icon_size;


        if (a[i][2].length >= 10) {
            let new_font_size = (text_x - text_width) / a[i][2].length * 2
            text_y -= appearance.icon_size * (1 - (new_font_size / font_size)) / 2;
            font_size = new_font_size;
            
        }
    
        setFont(ctx, font_size, appearance.text_color, appearance.font);
        ctx.fillText(a[i][2], x * text_width + text_x, y * text_height + text_y);
    }
}

// Set the font and color
function setFont(ctx, font_size, color, style) {
    ctx.fillStyle = color;
    ctx.font = `bold ${font_size}px ${style}`;
}

// Export entry functions
module.exports = {
    drawBackground,
    drawTitle,
    drawLegend,
    drawGraph,
    drawVotes
}