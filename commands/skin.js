let { SlashCommandBuilder } = require('@discordjs/builders');
let { MessageEmbed } = require('discord.js');
let https = require('https');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skin')
		.setDescription('Finds the skin currently in use by a specified player')
        .addStringOption(
            option => option.setName('username')
            .setRequired(true)
            .setDescription('The Minecraft username of the person whose skin is to be searched for')),
	async execute(interaction) {
        let username = interaction.options.getString('username');

        https.get(`https://playerdb.co/api/player/minecraft/${username}`, (resp) => {
            let data = '';
          
            resp.on('data', (chunk) => {
              data += chunk;
            });
          
            resp.on('end', () => {
                let uuid = JSON.parse(data).data.player.raw_id;
                let result = new MessageEmbed()
                    .setColor('#254654')
                    .setTitle(username)
                    .setThumbnail(`https://crafatar.com/skins/${uuid}`)
                    .setImage(`https://crafatar.com/renders/body/${uuid}?overlay`);
    
                interaction.reply({ embeds: [result], ephemeral: true });
            });
          });

	},
};
