let { ModalBuilder, TextInputBuilder } = require('discord.js');

function buildAddTaskDialog(listId) {
	let modal = new ModalBuilder()
		.setCustomId(`addTask#${listId}`)
		.setTitle('Add Task');
	let taskInput = new TextInputBuilder()
		.setCustomId('taskName')
		.setLabel('Name of task')
		.setMinLength(2)
		.setMaxLength(50);
	let memberInput = new TextInputBuilder()
		.setCustomId('memberName')
		.setLabel('Name of Skader')
		.setMinLength(2)
		.setMaxLength(50);
	modal.addComponents(taskInput, memberInput);
	return modal;
}

module.exports = { buildAddTaskDialog };