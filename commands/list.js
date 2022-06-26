let { SlashCommandBuilder } = require('@discordjs/builders');
let { MessageEmbed } = require('discord.js');
let { MessageActionRow, MessageButton, Modal } = require('discord.js');
let { host, user, password, database } = require('../db-config.json');

let client = require('../instances').client;

let mysql = require('mysql2');
let connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database
});

connection.connect();

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton())
        return;
    else
        dispatchInteraction(interaction);
});

function dispatchInteraction(interaction) {
    console.log(`Interaction ${interaction.id}`);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Manages a list of projects')
        .addStringOption(option => option.setName('title')
            .setDescription('Title to name the project')
            .setRequired(true)),
    async execute(interaction) {
        let channelId = interaction.channelId;
        let user = interaction.member;
        let userRoles = interaction.member.roles;

        let title = interaction.options.getString('title');

        let taskEmbed = new MessageEmbed()
            .setTitle(`${title}`)
            .setDescription(`Created by ${user}.\nDue date not set, **Edit Task Info** button to set.\nNo tasks are added.`)
            .setTimestamp();

        let row1 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('add_task')
                    .setLabel('Add Task')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('edit_task_info')
                    .setLabel('Edit Task Info')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setCustomId('edit_tasks')
                    .setLabel('Edit Task')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setCustomId('remove_task')
                    .setLabel('Remove Task')
                    .setStyle('DANGER'),
                new MessageButton()
                    .setCustomId('mark_task')
                    .setLabel('Mark Task')
                    .setStyle('SUCCESS'));
            let row2 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('mark_project')
                    .setLabel('Mark Project')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('remove_project')
                    .setLabel('Remove Project')
                    .setStyle('DANGER'));

        await interaction.reply({ embeds: [taskEmbed], components: [row1, row2] });
    }
};