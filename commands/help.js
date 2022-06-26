let { SlashCommandBuilder } = require('@discordjs/builders');

let config = require("../config/help.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription("Lists all commands. Use a command as an argument to get more information on its usage.")
        .addStringOption(
            option => option.setName('command')
            .setRequired(false)
            .setDescription('Command to get details on.')),
	async execute(interaction) {
        let command = interaction.options.getString('command');
        
        interaction.reply({ content: `${commandToDesc(command)}`, ephemeral: true});
	},
};

function commandToDesc(command) {
    switch(command) {
        case "help":
            return config.help;
        case "hug":
            return config.hug;
        case "poll":
            return config.poll;
        case null:
            return config.list;
        default:
            return config.unknown;
    }
}