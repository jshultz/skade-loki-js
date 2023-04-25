let { EmbedBuilder } = require('discord.js');
let { dbPool } = require('../../database/pool');
let Task = require('../../database/models/task');
let client = require('../../instances');
let guildId = require('../../config_dev_test.json').guildId;

const rolesId = '885649447206395984';

function buildEmbeddedPrompt(title, description) {
	return new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(title)
		.setDescription(description);
}

function buildEmbeddedError(description) {
	return new EmbedBuilder()
		.setColor(0xFF9900)
		.setTitle('Error')
		.setDescription(description);
}

module.exports = { buildEmbeddedPrompt, buildEmbeddedError };