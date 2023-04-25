let { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

let config = require('../config/help.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Lists all commands. Use a command as an argument to get more information on its usage.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Command to get details on.')
                .setRequired(false)
                .addChoices(
                    { name: 'help', value: 'help' },
                    { name: 'hug', value: 'hug' },
                    { name: 'poll', value: 'poll' },
                    { name: 'skin', value: 'skin' },
                )),

	async execute(interaction) {
        let command = interaction.options.getString('command');
        
        let result = new MessageEmbed()
        .setColor('#254654')
        .setAuthor({ name: 'Loki Bot Command Help', iconURL: 'https://cdn.discordapp.com/avatars/838516335297822771/7840af8d5a596ab612b3c552b90c2bd4.webp?size=100'})
        .addFields(
            { name: '\u200B', value: `${commandToDesc(command)}` },
        )
        .setFooter({ text: '\nCommands Created By The Skade Gaming Bot Team.' });
    interaction.reply({ embeds: [result], ephemeral: true });
	},
};

function commandToDesc(command) {
    switch(command) {
        case 'help':
            return config.help;
        case 'hug':
            return config.hug;
        case 'poll':
            return config.poll;
        case 'skin': 
            return config.skin;
        case null: //if args Empty - Returns all commands
            return config.commandlist;
        default: // unkown command
            return config.unknown;
    }
}
