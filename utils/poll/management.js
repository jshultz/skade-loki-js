// Regular Discord imports
let {MessageActionRow, MessageButton} = require('discord.js');

// The purpose of Poll is to be an easy way to construct an object with all necessary values to save on the database
class Poll {
    constructor(title, options) {
        this.title = title;
        this.options = options;
        this.votes = Array(options.length).fill(0);
        this.sum = 0;
        this.voters = {};
    }
}

// Discord has a maximum amount of buttons allowed on each action row. This function takes the options, and creates buttons with the constraint
function createButtons(options) {
    let buttons = [new MessageActionRow()];

    if (options.length > 4) {
        buttons.push(new MessageActionRow());
    }

    for (i in options) {
        buttons[Math.floor(i / 4)].addComponents(
            new MessageButton()
                .setCustomId(options[i])
                .setLabel(options[i])
                .setStyle('SECONDARY'),
        );
    }

    return buttons;
}

// Neaten the options by trimming excess space and removing ' and "
function tidyOptions(option) {
    return option.trim().replace(/(['"])/g, '');
}

// Converts 3 values which determine how a vote is counted into 1. This makes future calculations easier.
function constructItems(options, votes, sum) {
    let items = [];

    if (sum == 0) sum = 1;

    for (i in options) {
        items.push([votes[i] / sum, i, options[i]]);
    }

    return items.sort();
}

// Sort items by their color
function sortByColor(a, b) {
    if (a[1] < b[1]) {
        return -1
    }

    if (b[1] > a[1]) {
        return 1
    }

    return 0
}

// Convert the items to arcs
function itemsToArcs(items) {
    let angles = Array(items.length).fill([]);
    let sum = 0;

    for (let [index, item] of items.entries()) {
        angles[items.length - 1 - index] = ([sum, item[1]]);
        sum += item[0];
    }

    return angles;
}

// Convert an index of a point to a point on a grid
// https://www.desmos.com/calculator/nncyplwdjs
function indexToGrid(index, grid_size) {
    return [index % grid_size, Math.floor(index / grid_size)];
}

module.exports = {
    createButtons, 
    constructItems, 
    itemsToArcs, 
    indexToGrid,
    sortByColor,
    tidyOptions,
    Poll
}