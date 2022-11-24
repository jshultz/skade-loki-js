let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

let upperButtonRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("addTask")
                        .setLabel("Add Task")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId("editListInfo")
                        .setLabel("Edit List Info")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("editTask")
                        .setLabel("Edit Task")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("removeTask")
                        .setLabel("Remove Task")
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId("markTask")
                        .setLabel("Mark Task")
                        .setStyle(ButtonStyle.Success));
                let lowerButtonRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("markAll")
                        .setLabel("Mark All")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId("removeAll")
                        .setLabel("Remove All")
                        .setStyle(ButtonStyle.Danger));

function buildListMessage(listInfo, tasks) {
    let tasksField = [];
    tasks.forEach((val, _idx, _arr) => {
        tasksField.push({ name: val["task_name"], value: `<@${val["assignee"]}>` });
    });
    return new EmbedBuilder()
        .setColor(0x32a2a8)
        .setTitle(listInfo["list_name"])
        .setDescription(`Created by <@${listInfo.member_id}>.\nDue date: ${listInfo.due_date || "not set"}`)
        .addFields(tasksField)
        .setTimestamp();
}

module.exports = { upperButtonRow, lowerButtonRow, buildListMessage };