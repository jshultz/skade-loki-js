let { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

function createAddTaskModal() {
    let modal = new ModalBuilder()
        .setCustomId("addTaskModal")
        .setTitle("Add Task");
    let taskNameInput = new TextInputBuilder()
        .setCustomId("taskName")
        .setLabel("Task Name")
        .setStyle(TextInputStyle.Short)
        .setMinLength(3)
        .setMaxLength(20);
    let taskAssigneeInput = new TextInputBuilder()
        .setCustomId("taskAssignee")
        .setLabel("Assign Skader")
        .setStyle(TextInputStyle.Short)
        .setMinLength(3)
        .setMaxLength(20);
    let firstActionRow = new ActionRowBuilder().addComponents(taskNameInput);
    let secondActionRow = new ActionRowBuilder().addComponents(taskAssigneeInput);
    modal.addComponents(firstActionRow, secondActionRow);
    return modal;
}

module.exports = { createAddTaskModal };