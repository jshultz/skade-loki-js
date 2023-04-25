let SlashCommandBuilder = require('@discordjs/builders').SlashCommandBuilder;
// let { MessageAttachment } = require('discord.js').MessageAttachment;
// let { MessageEmbed } = require('discord.js').MessageEmbed;
let { MessageActionRow, MessageButton } = require('discord.js');

let { dbPool } = require('../database/pool');
let Poll = require('../database/models/poll');

let client = require('../instances');

let pi = 3.14;
let max = Math.max;
let min = Math.min;
let sqrt = Math.sqrt;
let floor = Math.floor;
let ceil = Math.ceil;
let sin = Math.sin;
let cos = Math.cos;
let atan = Math.atan2;

let Canvas = require('@napi-rs/canvas');
let mysql = require('mysql2');

let colors = [
	'rgba(94,  129, 172, 1)',
	'rgba(191, 97,  106,  1)',
	'rgba(208, 135, 112,  1)',
	'rgba(235, 203, 139,  1)',
	'rgba(163, 190, 140, 1)',
	'rgba(180, 142, 173,  1)',
	'rgba(143, 188, 187, 1)',
	'rgba(216,  222,  233,  1)'
];

// let colors = ["rgba(85,  172, 238, 1)",
//     "rgba(221, 46,  68,  1)",
//     "rgba(119, 178, 86,  1)",
//     "rgba(253, 203, 88,  1)",
//     "rgba(170, 141, 215, 1)",
//     "rgba(244, 144, 12,  1)",
//     "rgba(227, 229, 231, 1)",
//     "rgba(49,  55,  61,  1)"
// ]

function arc_bounding_box(a, b, s, size) {
	return {
		'top':size * (2 - (top(a, b, s) + 1)) / 2,
		'bottom':size * (2 - (bottom(a, b, s) + 1)) / 2,
		'left':size * (left(a, b, s) + 1) / 2,
		'right':size * (right(a, b, s) + 1) / 2,
	};
}

function top(a, b, s) {
	return (
		a > pi / 2 ? max(s * sin(a) * 0.9, s * sin(b) * 0.9, sin(a)) :
			b < pi / 2 ? sin(b) :
				1
	);
}

function bottom(a, b, s) {
	return (
		a > 3 * pi / 2 ? sin(a) :
			b < 3 * pi / 2 ? min(s * sin(a) * 0.9, s * sin(b) * 0.9, sin(b)) :
				-1
	);
}

function right(a, b, s) {
	return max(
		s * cos(a) * 0.9,
		cos(a),
		s * cos(b) * 0.9,
		cos(b)
	);
}

function left(a, b, s) {
	return (
		a > pi ? min(s * cos(a) * 0.9, cos(a)) :
			b < pi ? min(s * cos(b) * 0.9, cos(b)) :
				-1
	);
}

function in_circle(x, y, radius) {
	return x ** 2 + y ** 2 < radius ** 2;
}

function in_edge(x, y, radii) {
	return in_circle(x, y, radii[0]) && !in_circle(x, y, radii[1]);
}

function in_arc(x, y, min_angle, max_angle) {
	let angle = atan(y, x) + pi;

	return angle >= min_angle && angle <= max_angle;
}

function split_text(ctx, text, max_width) {
	if (ctx.measureText(text).width <= max_width) {
		return text;
	}

	let new_text = '';

	for (let i of text) {
		if (ctx.measureText(new_text + i).width > max_width) {
			new_text += '\n';
		}

		new_text += i;
	}

	return new_text;
}

function format_results(answers) {
	let formatted = [];

	for (let i in answers) {
		formatted.push([answers[i].trim(), 0, colors[i]]);
	}

	return formatted;
}

function generate_buttons(answers) {
	let components = [];

	for (let i in answers) {
		if (i % 4 == 0) {
			components.push(new MessageActionRow());
		}

		components[components.length - 1].addComponents(
			new MessageButton()
				.setCustomId(answers[i])
				.setLabel(answers[i])
				.setStyle('SECONDARY'),
		);
	}

	components.push(
		new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('reset')
					.setLabel('⭯ Reset Votes')
					.setStyle('DANGER')
			)
	);

	return components;
}

function remove_broken_characters(s) {
	return s.replace(/'|"/g, '');
}

class Chart {
	constructor(results, votes_allowed) {
		this.results = results;
		this.votes_allowed = votes_allowed;
		this.total_votes = 0;
		this.participants = {};
	}

	generate_image(ctx) {
		let poll_region = new Region({ 'top': 50, 'bottom': 550, 'left': 0, 'right': 500 }, {});
		this.draw_chart(ctx, poll_region, 0.6);

		this.stitch(ctx, poll_region, 0.6);

		let options_region = new Region({ 'top': 0, 'bottom': 600, 'left': 525, 'right': 1200 }, {});
		this.draw_options(ctx, options_region, 75, 50, 100);
	}

	draw_options(ctx, region, number_size, text_size, gap) {
		ctx.textBaseline = 'middle';

		let y;

		this.results.forEach((i, a) => {
			if (a % 4 == 0) {
				y = region.top + region.height / 8;
			}
			else {
				y += region.height / 4;
			}

			let max_width = (4 + a < this.results.length || a >= 4) ? region.width / 2 : region.width;

			ctx.fillStyle = i[2];
			ctx.font = `${number_size}px Arial`;
			ctx.fillText(i[1], region.left + floor(a / 4) * region.width / 2, y);
			ctx.font = `bold ${text_size}px Arial`;
			ctx.fillText(
				split_text(ctx, i[0], max_width - gap),
				region.left + floor(a / 4) * region.width / 2 + gap,
				y - number_size + number_size / ceil(ctx.measureText(i[0]).width / (max_width - gap))
			);
		});
	}

	draw_chart(ctx, region, gap) {
		let [large_angle, small_angle] = [0, 0];
		let total_votes = this.total_votes;

		this.results.forEach(function (i) {
			large_angle = small_angle + 2 * pi * i[1] / total_votes;

			let bb = new Region(
				arc_bounding_box(small_angle, large_angle, gap, region.width),
				region
			);

			ctx.fillStyle = i[2];

			bb.apply_function(
				(x, y) => {
					let radius = region.super.width / 2;

					if (in_arc(radius - x, y - radius, small_angle, large_angle) && in_edge(radius - x, y - radius, [radius, gap * radius])) {
						ctx.fillRect(x + bb.super.left, y + bb.super.top, 1, 1);
					}
				}
			);

			small_angle = large_angle;
		});
	}

	stitch(ctx, region, gap) {
		ctx.fillStyle = this.results[0][2];
		ctx.fillRect(region.left + region.width / 2 * (gap + 1), region.top + region.height / 2, region.width / 2 * (1 - gap), 1);
	}
}

class Region {
	constructor(edges, super_) {
		this.top = edges.top;
		this.bottom = edges.bottom;
		this.left = edges.left;
		this.right = edges.right;
		this.super = super_;
		this.width = this.right - this.left;
		this.height = this.bottom - this.top;
	}

	apply_function(f) {
		for (let x = floor(this.left); x < ceil(this.right); x++) {
			for (let y = floor(this.top); y < ceil(this.bottom); y++) {
				f(this, x, y);
			}
		}
	}
}

function triangle(x) {
	return x * x + 1 / 2;
}

function triangle_inv(x) {
	return sqrt(2 * x + 0.25) - 0.5;
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return;

	// Include JSON.parse(...) when used in production.
	let poll = new Poll(dbPool);
	let poll_raw = poll.fetch(interaction.message.id)
	let chart = new Chart(poll_raw.results, poll_raw.votes_allowed);

	chart.total_votes = poll_raw.total_votes;
	chart.participants = poll_raw.participants;

	let user_id = interaction.user.id;
	let button = interaction.customId;
	let poll_type = interaction.message.interaction.commandName.slice(5);

	if (!chart.participants[user_id]) {
		chart.participants[user_id] = [];
	}

	let participation = chart.participants[user_id];
	let votes_allowed = poll_type == 'tiered' ? (chart.votes_allowed * (chart.votes_allowed + 1)) / 2 : chart.votes_allowed;
	let vote_quality = poll_type == 'tiered' ? triangle_inv(votes_allowed - participation.length) : 1;

	if (button == 'reset') {

		participation.forEach((value) => {
			chart.results.find(element => element[0] == value)[1] -= 1;
			chart.total_votes -= 1;
		});

		delete chart.participants[user_id];

	}
	else if (participation.length < votes_allowed && (poll_type = 'tiered' && !participation.includes(button))) {

		for (let i = 0; i < vote_quality; i++) {

			participation.push(button);
			chart.results.find(element => element[0] == button)[1] += 1;
			chart.total_votes += 1;

		}

	}

	conn.query(`UPDATE polls SET data = \'${JSON.stringify(chart)}\' WHERE messageId = ${interaction.message.interaction.id}`);

	chart.results.sort(function(first, second) {
		return second[1] - first[1];
	});

	let canvas = Canvas.createCanvas(1200, 600);
	let ctx = canvas.getContext('2d');

	chart.generate_image(ctx);

	let attachment = new MessageAttachment(canvas.toBuffer(), `${chart.title}.png`);

	await interaction.update({ files: [attachment] });
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('poll')

		.setDescription('Creates a poll')

		.addSubcommand(subcommand =>
			subcommand
				.setName('standard')
				.setDescription('One vote per person.')
				.addStringOption(option => option.setName('title')
					.setRequired(true)
					.setDescription('Question to ask.'))
				.addStringOption(option => option.setName('options')
					.setRequired(true)
					.setDescription('Possible responses to the poll. Use commas to separate them.')))

		.addSubcommand(subcommand =>
			subcommand
				.setName('multi')
				.setDescription('Multiple votes per person.')
				.addStringOption(option => option.setName('title')
					.setRequired(true)
					.setDescription('Question to ask.'))
				.addStringOption(option => option.setName('options')
					.setRequired(true)
					.setDescription('Possible responses to the poll. Use commas to separate them.'))
				.addIntegerOption(option => option.setName('votes_allowed')
					.setRequired(true)
					.setDescription('The amount of votes each person can cast.')))

		.addSubcommand(subcommand =>
			subcommand
				.setName('tiered')
				.setDescription('Multiple votes per person, but votes decline in power.')
				.addStringOption(option => option.setName('title')
					.setRequired(true)
					.setDescription('Question to ask.'))
				.addStringOption(option => option.setName('options')
					.setRequired(true)
					.setDescription('Possible responses to the poll. Use commas to separate them.'))
				.addIntegerOption(option => option.setName('votes_allowed')
					.setRequired(true)
					.setDescription('The amount of votes each person can cast.'))),

	async execute(interaction) {
		let title = remove_broken_characters(interaction.options.getString('title'));
		let answers = remove_broken_characters(interaction.options.getString('options')).split(',').map(s => s.trim());;
		let votes_allowed = interaction.options.getInteger('votes_allowed');

		if (!votes_allowed) {
			votes_allowed = 1;
		}

		if (votes_allowed < 1) {
			await interaction.reply({ content: 'Please choose a positive number.', ephemeral: true });
			return;
		}

		if (votes_allowed > 10) {
			await interaction.reply({ content: 'Please give 10 or less votes.', ephemeral: true });
			return;
		}

		r = format_results(answers, colors);

		if (r > 8) {
			await interaction.reply({ content: 'Too many options. Please use 8 or less.', ephemeral: true });
			return;
		}

		let canvas = Canvas.createCanvas(1200, 600);
		let ctx = canvas.getContext('2d');
		ctx.font = 'bold 50px Arial';

		let long_answer = r.find(element => ctx.measureText(element[0]).width > 15 * 42);

		if (long_answer) {
			await interaction.reply({ content: `Your option of \`${long_answer[0]}\` is too long.`, ephemeral: true });
			return;
		}

		let poll = new Chart(title, r, votes_allowed);

		poll.generate_image(ctx);

		conn.query(`INSERT INTO polls VALUES (\'${JSON.stringify(poll)}\', \'${interaction.id}\')`);

		let attachment = new MessageAttachment(canvas.toBuffer(), `${title}.png`);


		await interaction.reply({ content: `**${title}**\n*${votes_allowed} vote${votes_allowed == 1 ? '' : 's'} per person allowed*`, files: [attachment], components: generate_buttons(answers) });
	},
};