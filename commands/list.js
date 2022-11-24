let { SlashCommandBuilder } = require("@discordjs/builders");
let { EmbedBuilder, Events } = require("discord.js");

let { upperButtonRow, lowerButtonRow, buildListMessage } = require("../utils/list/message");
let listModals = require("../utils/list/modals");

let CommandEntry = require("../database/models/command_entry");
let Task = require("../database/models/task");
let List = require("../database/models/list");
let { dbPool } = require("../database/pool");

let client = require("../client");

client.on(Events.InteractionCreate, async interaction => {
    let list = new List(dbPool);
    if (interaction.isButton()) {
        let commandEntry = new CommandEntry(dbPool);
        let rows = await commandEntry.fetchCommandMessages(interaction.message.id, "list");
        if (rows > 0) return;

        dispatchButtonInteraction(interaction);
    }
    else if (interaction.isModalSubmit()) {
        let listRows = await list.fetchById(interaction.message.id);
        let listId = listRows[0]["list_id"];

        dispatchModalSubmission(interaction, listId);

        let task = new Task(dbPool);
        let taskRows = task.fetchById(listId);
        let listEmbed = new buildListMessage(listRows, taskRows);
        await interaction.editReply({ embeds: [listEmbed] });
    }
});

async function dispatchButtonInteraction(interaction) {
    switch (interaction.customId) {
        case "addTask": {
            let addTaskModal = listModals.createAddTaskModal();
            await interaction.showModal(addTaskModal);
            break;
        }

        default:
            break;
    }
}

async function dispatchModalSubmission(interaction, listId) {
    switch (interaction.customId) {
        case "addTaskDialog": {
            let task = new Task(dbPool);
            let taskName = interaction.fields.getTextInputValue("taskName");
            let taskAssignee = interaction.fields.getTextInputValue("taskAssignee");
            task.add(listId, taskName, taskAssignee);
            break;
        }

        default:
            break;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("list")
        .setDescription("Manages a list of projects")
        .addStringOption(option => option.setName("list_name")
            .setDescription("Name of the project")
            .setRequired(true))
        .addBooleanOption(option => option.setName("new_list_flag")
            .setDescription("Should create a new project or search for existing project")
            .setRequired(true)),
    async execute(interaction) {
        let member = interaction.member;
        let memberRoles = interaction.member.roles;
        let isNewList = interaction.options.getBoolean("new_list_flag");
        let listName = interaction.options.getString("list_name").trim();

        let list = new List(dbPool);

        if (isNewList) {
            if (listName.search(/^[a-z]\w{2,}$/i) == -1) {
                interaction.reply({
                    content: "Invalid list name.\nMust start with a letter and at least 3 characters (a-z, A-Z, 0-9, or _).",
                    ephemeral: true });
                return;
            }
            let existingLists = await list.search(listName, member.id);
            if (existingLists.length > 0) {
                interaction.reply({
                    content: "List of this name already exists",
                    ephemeral: true });
                return;
            }

            let listEmbed = new EmbedBuilder()
                .setTitle(`${listName}`)
                .setDescription(`Created by ${member}.\nDue date not set, click **Edit Task Info** button to set.\nNo tasks are added.`)
                .setTimestamp();

            let replyMessage = await interaction.reply({ embeds: [listEmbed], components: [upperButtonRow, lowerButtonRow] });
            list.add(replyMessage.id, member.id, listName);
        }
        else {
            let listRows = await list.search(listName, member.id);
            if (listRows.length < 1) {
                await interaction.reply({
                    content: "No results found",
                    ephemeral: true,
                });
            }
            let replyMessage = await interaction.reply("Preparing list...");
            let list_id = listRows[0]["list_id"];
            list.updateMessageId(list_id, replyMessage.id);

            let task = new Task(dbPool);
            let taskRows = await task.fetchById(list_id);

            let listEmbed = new buildListMessage(listRows[0], taskRows);

            await interaction.editReply({ embeds: [listEmbed], components: [upperButtonRow, lowerButtonRow] });
        }
    },
};