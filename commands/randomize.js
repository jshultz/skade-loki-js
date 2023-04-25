let { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { MessageEmbed} = require('discord.js')

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
                .setDescription('The maximum number possible'))

            .addStringOption(
                option => option.setName('post_privately')
                .setDescription('Set to true to post the result privately to you')
                .setRequired(true)
                .addChoices(
                    { name: 'True', value: 'true' },
                    { name: 'False', value: 'false' },
                )
            ),

        	async execute(interaction) {
                let max = interaction.options.getString('max');
                let min = interaction.options.getString('min');
                let postPrivately = interaction.options.getString('post_privately');

                try {
                    if (isNaN(max) || isNaN(min)) {
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

                    // Send the response message
                    interaction.reply({
                        embeds: [rne],
                        ephemeral: postPrivately === "true"
                    });
                } catch (err) {
                    interaction.reply({
                        content: "Invalid input. Please enter valid numbers for min and max.",
                        ephemeral: true
                    });
                    console.log(`${interaction.user.username}#${interaction.user.discriminator} ran /${interaction.commandName} and had an issue,\nArguments: `,interaction.options.getString('min'), "| ",interaction.options.getString('max'))
                    //interaction.reply("err.message"); -- Use this if debugging code, it tells you the error. - J
                }
            }
}
