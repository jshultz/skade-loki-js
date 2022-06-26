// Regular Discord imports
let SlashCommandBuilder = require('@discordjs/builders').SlashCommandBuilder;
let MessageAttachment = require('discord.js').MessageAttachment;

// Importing graphics
let Canvas = require('canvas');
let client = require('../instances').client;
let graphics = require("../utils/poll/graphics.js");

// Setting up MySql 
let mysql      = require('mysql2');
let { host, user, password, database } = require('../db-config.json');
let connection = mysql.createConnection({
  host: host,
  user: user,
  password: password,
  database: database
});

connection.connect();

// Tools and config
let management = require("../utils/poll/management.js");
let config = require("../config/poll.json");

// Listen for button interactions
client.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return;

    // Search for a poll with the same messageId as the interaction
    let poll = (await connection.promise().query(`SELECT * FROM polls WHERE messageId = ${interaction.message.interaction.id}`))[0][0].data;

    // Information about the button press
    let user_id = interaction.user.id;
    let button = interaction.customId;

    // Get the last button pressed on the poll by the same user
    // If that is undefined (meaning that this is their first vote), then increase the total amount of votes by 1. If they have voted before, remove that vote
    let last_vote_by_user = poll.voters[user_id];

    if (last_vote_by_user) {
        poll.votes[poll.options.indexOf(last_vote_by_user)] -= 1;
    } else {
        poll.sum += 1;
    }

    // Regardless if they already voted or not, increase their current vote by 1, and also set their previous vote to their current vote. 
    poll.voters[user_id] = button;
    poll.votes[poll.options.indexOf(button)] += 1;

    // Update the entry in the database to reflect these changes
    connection.query(`UPDATE polls SET data = \'${JSON.stringify(poll)}\' WHERE messageId = ${interaction.message.interaction.id}`);
    
    // Create an image to draw on matching the width and height given in the config
    let canvas = Canvas.createCanvas(config.general.width, config.general.height);
    let ctx = canvas.getContext('2d');

    // Format the votes so they're easier to work with
    let items = management.constructItems(poll.options, poll.votes, poll.sum);;

    // Draw all the elements using the values assigned in the config
    graphics.drawBackground(
        ctx, 
        config.general
    );
    
    graphics.drawGraph(
        ctx, 
        items, 
        config.graph,
        config.general.item_colors
    );

    graphics.drawLegend(
        ctx, 
        items, 
        config.legend,
        config.general.item_colors
    );
    
    graphics.drawTitle(
        ctx, 
        poll.title, 
        config.title
    );

    graphics.drawVotes(
        ctx,
        poll.sum,
        config.votes
    )

    // Save what was drawn as an image, and edit the original message to show this
    let attachment = new MessageAttachment(canvas.toBuffer(), `${poll.title}.png`);
    
    await interaction.update({ files: [attachment] });
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Creates a poll')
        .addStringOption(option => option.setName('title')
            .setRequired(true)
            .setDescription('Question to ask Skaders.'))
        .addStringOption(option => option.setName('options')
            .setRequired(true)
            .setDescription('Possible responses to the poll. Use commas to separate them.')),
	async execute(interaction) {
        // Options from the slash command
        let title = interaction.options.getString('title');
        let options = interaction.options.getString('options').split(',').map(management.tidyOptions);

        // If there are too many options then alert the user and exit
        if (options.length > config.general.max_options) {
            await interaction.reply({ content: 'Too many options. Please use 8 or less.', ephemeral: true }); 
            return;
        }

        // Create an image to draw on matching the width and height given in the config
        let canvas = Canvas.createCanvas(config.general.width, config.general.height);
        let ctx = canvas.getContext('2d');

        // Format relevant values so they're easier to work with for the current purposes
        let poll = new management.Poll(title, options);
        let items = management.constructItems(poll.options, poll.votes, poll.sum);

        // Save all the poll options in the database
        connection.query(`INSERT INTO polls VALUES (\'${JSON.stringify(poll)}\', \'${interaction.id}\')`);

        // Draw all the elements based on the config
        graphics.drawBackground(
            ctx, 
            config.general
        );
        
        graphics.drawGraph(
            ctx, 
            items, 
            config.graph,
            // Replace all the regular colors with another one to denote that there haven't been any votes yet
            Array(config.general.item_colors.length).fill(config.graph.appearance.base_color)
        );
    
        graphics.drawLegend(
            ctx, 
            items, 
            config.legend,
            config.general.item_colors
        );
        
        graphics.drawTitle(
            ctx, 
            poll.title, 
            config.title
        );

        // Put what was drawn on an image and create buttons based on the options provided in the slash command. After that, send the poll.
        let attachment = new MessageAttachment(canvas.toBuffer(), `${poll.title}.png`);
        let buttons = management.createButtons(options);

        await interaction.reply({ files: [attachment], components: buttons });
	},
};

