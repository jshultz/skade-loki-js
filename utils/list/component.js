let { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function buildListButtons(id) {
	return [
		new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(`addTask#${id}`)
					.setLabel('Add Task')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId(`assignTask#${id}`)
					.setLabel('Assign Task')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId(`editList#${id}`)
					.setLabel('Edit List')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId(`editTask#${id}`)
					.setLabel('Edit Task')
					.setStyle(ButtonStyle.Secondary)),
		new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(`markAll#${id}`)
					.setLabel('Mark All')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId(`markTask#${id}`)
					.setLabel('Mark Task')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId(`removeTask#${id}`)
					.setLabel('Remove Task')
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId(`removeAll#${id}`)
					.setLabel('Remove All')
					.setStyle(ButtonStyle.Danger))];
}

module.exports = buildListButtons;