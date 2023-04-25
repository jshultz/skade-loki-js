let SlashCommandBuilder = require('@discordjs/builders').SlashCommandBuilder;
let MessageAttachment = require('discord.js').MessageAttachment;
let MessageEmbed = require('discord.js').MessageEmbed;
let { MessageActionRow, MessageButton, AttachmentBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Collection } = require('discord.js');
let Canvas = require('@napi-rs/canvas');

let client = require('../instances');

let pi = 3.14;
let max = Math.max;
let min = Math.min;
let floor = Math.floor;
let ceil = Math.ceil;
let sin = Math.sin;
let cos = Math.cos;
let atan = Math.atan2;

let mysql = require('mysql2');
const { ActionRowBuilder, ButtonBuilder, SelectMenuBuilder } = require('@discordjs/builders');

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

let conn = mysql.createConnection({
	host     : 'na03-sql.pebblehost.com',
	user     : 'customer_259240_loki',
	password : 'U@W6KmZlUJi5DarBJDP2',
	database : 'customer_259240_loki'
});

conn.connect();

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

function generate_buttons(options) {
	let pollButtonRow = [];

	for (let i = 0; i < options.length; i++) {
		if (i % 4 == 0) {
			pollButtonRow.push(new ActionRowBuilder());
		}

		pollButtonRow[i].addComponents(new ButtonBuilder()
			.setCustomId(`Poll-${options[i]}`)
			.setLabel(options[i])
			.setStyle(ButtonStyle.Secondary));
	}

	pollButtonRow.push(new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('poll~reset')
				.setLabel('⭯ Reset Votes')
				.setStyle(ButtonStyle.Danger)));

	return pollButtonRow;
}

function remove_broken_characters(s) {
	return s.replace(/'|"/g, '');
}

class Poll {
	constructor(title, results, votes_given) {
		this.title = title;
		this.results = results;
		this.votes_given = votes_given;
		this.total_votes = 0;
		this.participants = {};
	}

	generate_image(ctx) {
		let poll_region = new Region({ 'top': 50, 'bottom': 550, 'left': 0, 'right': 500 }, {});
		this.draw_poll(ctx, poll_region, 0.6);

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

	draw_poll(ctx, region, gap) {
		let [large_angle, small_angle] = [0, 0];
		let total_votes = this.total_votes;

		this.results.forEach(function(i) {
			large_angle = small_angle + 2 * pi * i[1] / total_votes;

			let bb = new Region(
				arc_bounding_box(small_angle,
					large_angle,
					gap,
					region.width),
				region
			);

			ctx.fillStyle = i[2];

			bb.apply_function(
				function(x, y) {
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

client.on('interactionCreate', async interaction => {
	try {
		if (!interaction.isButton()) return;

		let json = (await conn.promise().query(`SELECT * FROM polls WHERE messageId = ${interaction.message.interaction.id}`))[0][0].data;
		let poll = new Poll(json.title, json.results, json.votes_given);

		poll.total_votes = json.total_votes;
		poll.participants = json.participants;

		let user_id = interaction.member.id;
		let button = interaction.customId;

		if (!poll.participants[user_id]) {
			poll.participants[user_id] = [];
		}

		if (button == 'reset') {
			for (let i of poll.participants[user_id]) {
				poll.results.find(element => element[0] == i)[1] -= 1;
				poll.total_votes -= 1;
			}

			delete poll.participants[user_id];
		}
		else if (poll.participants[user_id].length < poll.votes_given) {
			poll.participants[user_id].push(button);
			poll.results.find(element => element[0] == button)[1] += 1;
			poll.total_votes += 1;
		}

		conn.query(`UPDATE polls SET data = '${JSON.stringify(poll)}' WHERE messageId = ${interaction.message.interaction.id}`);

		poll.results.sort(function(first, second) {
			return second[1] - first[1];
		});

		let canvas = Canvas.createCanvas(1200, 600);
		let ctx = canvas.getContext('2d');

		poll.generate_image(ctx);

		let attachment = new MessageAttachment(canvas.toBuffer(), `${poll.title}.png`);

		await interaction.update({ files: [attachment] });
	}
	catch (error) {
		console.error(error);
	}
});
module.exports = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('Creates a poll')
		.addStringOption(option => option.setName('title')
			.setRequired(true)
			.setDescription('Question to ask.'))
		.addStringOption(option => option.setName('options')
			.setRequired(true)
			.setDescription('Possible responses to the poll. Use commas to separate them.'))
		.addIntegerOption(option => option.setName('votes_given')
			.setDescription('The amount of votes each person can cast. If left blank, it will default to a single vote')),
	async execute(interaction) {
		try {
			let title = remove_broken_characters(interaction.options.getString('title'));
			let answers = remove_broken_characters(interaction.options.getString('options')).split(',').map(s => s.trim());
			let votes_given = interaction.options.getInteger('votes_given');

			if (!votes_given) {
				votes_given = 1;
			}

			if (votes_given < 1) {
				await interaction.reply({ content: 'Please choose a positive number.', ephemeral: true });
				return;
			}

			if (votes_given > 10) {
				await interaction.reply({ content: 'Please give 10 or less votes.', ephemeral: true });
				return;
			}

			let r = format_results(answers, colors);

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

			let poll = new Poll(title, r, votes_given);

			poll.generate_image(ctx);

			conn.query(`INSERT INTO polls VALUES ('${JSON.stringify(poll)}', '${interaction.id}')`);

			let attachment = new AttachmentBuilder(await canvas.encode('png'), { name: `${title}.png` });


			await interaction.reply({ content: `**${title}**\n*${votes_given} vote${votes_given == 1 ? '' : 's'} per person allowed*`, files: [attachment], components: generate_buttons(answers) });
		}
		catch (error) {
			console.error(error);
			await interaction.reply({ content: 'An error occurred while executing the command.', ephemeral: true });
		}
	}
};