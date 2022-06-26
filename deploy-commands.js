let fs = require('fs');
let { REST } = require('@discordjs/rest');
let { Routes } = require('discord-api-types/v9');
let { clientId, guildId, token } = require('./config.json');

let commands = [];
let commandFiles = fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

let rest = new REST({ version: 9 }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);