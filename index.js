let { readdirSync } = require('fs');
let { token } = require('./config.json');
let { Collection, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
let { client } = require('./instances');

client.commands = new Collection();
const commandFiles = readdirSync('./commands')
	.filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log(`${client.user.username} is ready!`);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	let command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);

		let guild = await client.guilds.fetch(interaction.guildId);
		let channel = await guild.channels.fetch(interaction.channelId);
		let message = await interaction.fetchReply();

		let log = new MessageEmbed()
			.setColor('#254654')
			.setDescription(`${channel.name}`)
			.setTitle(`${interaction.user.username}#${interaction.user.discriminator} used /${interaction.commandName}`)
			.setTimestamp();

		let row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setURL(`https://discord.com/channels/${channel.guildId}/${message.channelId}/${message.id}`)
					.setLabel('Go to')
					.setStyle('LINK'),
			);

		client.channels.cache.get('970436808611610624').send({ embeds: [log], components: [row] });


		
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'There was an error while executing this command!',
			ephemeral: true });
	}
});


client.login(token);