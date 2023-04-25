let { readdirSync } = require('fs');
let { token } = require('./config_dev_test.json');
let { Collection, MessageEmbed, MessageActionRow, MessageButton, TextChannel } = require('discord.js');
let client = require('./instances');

let CommandEntry = require('./database/models/command_entry');
let { dbPool } = require('./database/pool');

const LOG_CHANNEL_ID = '970436808611610624';

/* Maximum length of time a command will be stored in dbConnection - 1 hour.
   Any records from before this time will be deleted automatically
   on next button interaction
*/

const CMD_DIR_ROOT = './commands';
// const MAX_INTERACTION_TIME = 3600000;
client.commands = new Collection();
const commandFiles = readdirSync(CMD_DIR_ROOT)
	.filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`${CMD_DIR_ROOT}/${file}`);

	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log(`${client.user.username} is ready!`);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	let command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		let replyMessage = await command.execute(interaction);
		let guild = await client.guilds.fetch(interaction.guildId);
		let channel = await guild.channels.fetch(interaction.channelId);

		if (replyMessage) {
			// Insert a recqord in the interactions table to track what command was
			// used.
			// This ensures that when a user interacts with a message, it will be
			// handled by the appropriate command.
			// let timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
			// commandEntry.add(replyMessage.id, command.name, timestamp);

			let log = new MessageEmbed()
				.setColor('#254654')
				.setDescription(`${channel.name}`)
				.setTitle(`${interaction.user.username}#${interaction.user.discriminator} used /${interaction.commandName}`)
				.setTimestamp();

			let row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setURL(`https://discord.com/channels/${channel.guildId}/${replyMessage.channelId}/${replyMessage.id}`)
						.setLabel('Go to')
						.setStyle('LINK'));
			// let logChannel = client.channels.cache.get(logChannelId);
			// await logChannel.send({ embed: log, rows: [row] });
		}

	}
	catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'There was an error while executing this command!',
			ephemeral: true });
	}
});

client.login(token);