let { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hug')
		.setDescription('Sends a hug to recipient.')
        .addStringOption(
            option => option.setName('recipient')
            .setRequired(true)
            .setDescription('Target of the hug.')),
	async execute(interaction) {
        let sender = interaction.member;
        let recipient = interaction.options.getString('recipient');

        interaction.reply(`${sender} hugged ${recipient}.`);
	},
};