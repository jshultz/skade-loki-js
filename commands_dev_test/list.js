let { SlashCommandBuilder, Events, ModalBuilder, TextInputBuilder } = require('discord.js');

let buildListButtons = require('../utils/list/component');
let { buildEmbeddedPrompt, buildEmbeddedError } = require('../utils/list/embed');

// let CommandEntry = require('../database/models/command_entry');
let Task = require('../database/models/task');
let List = require('../database/models/list');
let { dbPool } = require('../database/pool');

let listConfig = require('../config/list.json');

let client = require('../instances');
let guildId = require('../config.json').guildId;

let isMessageInteractionFromCommand = require('../utils/command');

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isCommand()) return;

	if (!isMessageInteractionFromCommand(interaction.customId, 'list')) return;

	if (interaction.isButton()) {
		dispatchButtonInteraction(interaction);
	}
	else if (interaction.isModalSubmit()) {
		dispatchModalSubmission(interaction);
	}
	else {
		return;
	}
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('Manages a list of projects')
		.addStringOption(option => option.setName('list_name')
			.setDescription('Name of the project')
			.setRequired(true))
		.addBooleanOption(option => option.setName('new_list_flag')
			.setDescription('Create a new project or search for existing project')
			.setRequired(true)),
	async execute(interaction) {
		let listName = interaction.options.getString('list_name').trim();
		let isNewList = interaction.options.getBoolean('new_list_flag');

		if (isNewList) {
			addNewList(listName, interaction);
		}
		else {
			editExistingList(listName, interaction);
		}
	},
};

async function addNewList(listName, interaction) {
	let list = new List(dbPool);
	let memberId = interaction.member.id;
	if (listName.search(/^[a-z]\w{1,}$/i) == -1) {
		let errorEmbedMessage = buildEmbeddedError(
			'Invalid list name.\nMust start with a letter and at least one character (a-z, A-Z, 0-9, or _).'
		);
		interaction.reply({
			embeds: [errorEmbedMessage],
			ephemeral: true });
		return;
	}
	let listRows = await list.search(listName);
	if (listRows.length != 0) {
		let errorEmbedMessage = buildEmbeddedError(
			'This name already exists'
		);
		interaction.reply({
			embeds: [errorEmbedMessage],
			ephemeral: true });
		return;
	}

	await list.add(listName, memberId);
	listRows = await list.search(listName);
	let listRow = listRows[0];
	promptPresetTasks();
}

async function editExistingList(listName, interaction) {
	let memberId = interaction.member.id;
	let list = new List(dbPool);
	let listRows = await list.search(listName, memberId);
	if (listRows.length < 1) {
		await interaction.reply({
			content: 'No results found',
			ephemeral: true,
		});
	}
	await list.add(listName, interaction.user.id);
	listRows = await list.search(listName);
	let listRow = listRows[0];
	// let taskRows = await task.fetchByListId(listRow["list_id"]);
	let listMessage = buildListMessage(listRow);
	await interaction.reply(listMessage);
}

function promptPresetTasks(messageInteraction) {
	const promptMessage =
				`<@${messageInteraction.member.id}> invoked this command and will only
				accept interactions from them.
				\nAdd tasks that are common to this channel group? (y/n)`;
	let presetTaskPrompt = buildEmbeddedPrompt('Add Preset Tasks', promptMessage);
	messageInteraction.reply({ embeds: [presetTaskPrompt] })
		.then(() => {
			const memberFilter = m => messageInteraction.user.id === m.author.id;
			messageInteraction.channel.awaitMessages({ filter: memberFilter, time: 60000, max: 1, error: ['time'] })
				.then(async messages => {
					let response = messages.first().content;
					// if (response.search(/^y.*$/)) {

					// }
				})
				.catch(err => {
					let embedError = buildEmbeddedError(err);
					messageInteraction.followUp({ embeds: [embedError], ephemeral: true });
				});
		});
}

function buildListMessage(list) {
	let creator = client.users.cache.get(list['creator_id']);

	return {
		embeds: [{
			color: 0x32a2a8,
			title: list['list_name'],
			description: `Created by ${creator}\nDue date: ${list['due_date'] || 'Not set'}`
		}],
		components: buildListButtons(list['id'])
	};
}

async function dispatchButtonInteraction(interaction) {
	let buttonId = interaction.customId.split('~')[0];
	switch (buttonId) {
	case 'addTask': {
		let addTaskModal = addTaskDialog(interaction);
		await interaction.showModal(addTaskModal);
		break;
	}
	default:
		break;
	}
}

async function dispatchModalSubmission(interaction) {
	let [modalId, listId] = interaction.customId.split('~');
	switch (modalId) {
	case 'add': {
		let taskIcon = interaction.fields.getTextInputValue('taskIcon');
		let taskName = interaction.fields.getTextInputValue('taskName');
		let task = new Task(dbPool);
		task.add(listId, taskName, taskIcon);
		break;
	}
	default:
		break;
	}
}

async function dispatchListPreset(categoryId, listId) {
	let task = new Task(dbPool);
	listConfig.channel_category.forEach(category => {
		if (category.id === categoryId) {
			const go = async () => {
				await category.tasks.asyncForEach(async (taskName) => {
					await task.add(listId, taskName, 'someone');
				});
			};
			go();
		}
	});
}

async function addTaskDialog(messageInteraction) {
	let [_unused, listId] = messageInteraction.customId.split('#');
	const modal = new ModalBuilder()
		.setCustomId(listId)
		.setTitle('Add Task');
	const taskIconInput = new TextInputBuilder()
		.setCustomId('taskIcon')
		.setLabel('Task Icon - use a discord emoji [optional]')
		.setPlaceholder('Task icon, leave black if does not apply.')
		.setMaxLength(10)
		.setMinLength(2);
	const taskTextInput = new TextInputBuilder()
		.setCustomId('taskName')
		.setLabel('Task Name')
		.setMaxLength(100)
		.setMinLength(2)
		.setPlaceholder('Please enter a task name')
		.setRequired(true);
	modal.addComponents(taskIconInput, taskTextInput);
	return modal;
}

function buildTaskFields(taskRows) {
	let tasksField = [];
	let taskFields = taskRows.forEach((val) => {
		let assignee = val['assignee'].search(/^\d+$/) != -1 ? `<@${val['assignee']}>` : val['assignee'];
		tasksField.push({ name: val['task_name'], value: assignee });
	});
	return taskFields;
}

Array.prototype.asyncForEach = async function(callback) {
	for (let i = 0; i < this.length; i++) {
		await callback(this[i]);
	}
};