let { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('randomize')
		.setDescription("randomises the selected options")

		.addStringOption(
			option => option.setName('min')
				.setRequired(true)
				.setDescription('The minimum number possible'))
                
		.addStringOption(
			option => option.setName('max')
				.setRequired(true)
				.setDescription('The maximum number possible'))  ,


        	async execute(interaction) {

		let max = interaction.options.getString('max');
		let min = interaction.options.getString('min');

		try {
			if (isNaN(max) || isNaN(min)) {
                console.log(typeof(min));
				throw new Error("Invalid input. Please enter valid numbers for min and max.");
			}

			max = parseInt(max);
			min = parseInt(min);

			console.log(max, min)

			function getRandomNumber(min, max) {
				return Math.floor(Math.random() * (max - min + 1)) + min;
			}

			let randomnumber = getRandomNumber(min, max)

			// Embed

			const rne = new MessageEmbed()
				.setColor(0x254654)
				.setTitle(`Random Number: ${randomnumber}`)
				.setFooter({text:`Minimum: ${min} • Maximum: ${max}`})

			// interaction.reply(`Random Number: ${randomnumber}`);
			interaction.reply({ embeds: [rne], ephemeral: true });

		} catch (err) {
			interaction.reply({content: "Invalid input. Please enter valid numbers for min and max.", ephemeral: true});
			console.log(`${interaction.user.username}#${interaction.user.discriminator} ran /${interaction.commandName} and had an issue,\nArguments: `,interaction.options.getString('min'), "| ",interaction.options.getString('max'))
			// interaction.reply("err.message"); -- Use this if debugging code, it tells you the error. - J
		}

	}
}