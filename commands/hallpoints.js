let { SlashCommandBuilder } = require('@discordjs/builders');
let { MessageEmbed, PermissionFlagBits } = require('discord.js');
let { client } = require('../instances');

let mysql = require('mysql2');

let conn = mysql.createConnection({
    host     : 'na03-sql.pebblehost.com',
    user     : 'customer_259240_loki',
    password : 'U@W6KmZlUJi5DarBJDP2',
    database : 'customer_259240_loki'
});

conn.connect()

function create_interface(interaction, points) {
    let freyja = new MessageEmbed()
        .setColor('#169c9c')
        .setImage('https://cdn.discordapp.com/attachments/970683379450273844/1068019232232706109/braids_freyja.png')
        .setTitle('Freyja')
        .setDescription(`**${points['freyja']}**`);

    let loki = new MessageEmbed()
        .setColor('#5e7c16')
        .setImage('https://cdn.discordapp.com/attachments/970683379450273844/1068019231691636806/braids_loki.png')
        .setTitle('Loki')
        .setDescription(`**${points['loki']}**`);

    let odin = new MessageEmbed()
        .setColor('#b02e26')
        .setImage('https://cdn.discordapp.com/attachments/970683379450273844/1068019231377072178/braids_odin.png')
        .setTitle('Odin')
        .setDescription(`**${points['odin']}**`);

    let thor = new MessageEmbed()
        .setColor('#9d9d97')
        .setImage('https://cdn.discordapp.com/attachments/970683379450273844/1068019231066705991/braids_thor.png')
        .setTitle('Thor')
        .setDescription(`**${points['thor']}**`);

    let embeds = [freyja,loki,odin,thor];

    embeds.sort(function(first, second) {
        return second.description.slice(2,-2) - first.description.slice(2,-2);
    });

    return embeds;
}



module.exports = {
    data: new SlashCommandBuilder()
        .setName('hallpoints')

        .setDescription('AAA')

        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('AAA')
            .addStringOption(option => option.setName('hall')
                .addChoices(
                    { name: 'Freyja', value: 'freyja' },
                    { name: 'Loki', value: 'loki' },
                    { name: 'Odin', value: 'odin' },
                    { name: 'Thor', value: 'thor' }
                )
                .setRequired(true)
                .setDescription('AAA'))
            .addIntegerOption(option => option.setName('points')
                .setRequired(true)
                .setDescription('AAA')))

        .addSubcommand(subcommand =>
            subcommand
                .setName('subtract')
                .setDescription('AAA')
            .addStringOption(option => option.setName('hall')
                .addChoices(
                    { name: 'Freyja', value: 'freyja' },
                    { name: 'Loki', value: 'loki' },
                    { name: 'Odin', value: 'odin' },
                    { name: 'Thor', value: 'thor' }
                )
                .setRequired(true)
                .setDescription('AAA'))
            .addIntegerOption(option => option.setName('points')
                .setRequired(true)
                .setDescription('AAA')))

        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('AAA')
            .addStringOption(option => option.setName('hall')
                .addChoices(
                    { name: 'Freyja', value: 'freyja' },
                    { name: 'Loki', value: 'loki' },
                    { name: 'Odin', value: 'odin' },
                    { name: 'Thor', value: 'thor' }
                )
                .setRequired(true)
                .setDescription('AAA'))
            .addIntegerOption(option => option.setName('points')
                .setRequired(true)
                .setDescription('AAA')))

        .addSubcommand(subcommand =>
            subcommand
                .setName('create_interface')
                .setDescription('AAA'))

        .setDefaultMemberPermissions(0x0000000000020000),

	async execute(interaction) {
        let sender = interaction.member;
        let recipient = interaction.options.getString('recipient');
        let subcommand = interaction.options['_subcommand'];
        let hall = interaction.options.getString('hall');
        let points = interaction.options.getInteger('points');

        let current_points = JSON.parse((await conn.promise().query(`SELECT * FROM hall_points`))[0][0]['points']);   
        
        
        // let current_points = {
        //     'freyja': 0,
        //     'loki': 0,
        //     'odin': 0,
        //     'thor': 0
        // }

        if (subcommand == 'set') {
            current_points[hall] = points;
        } else if (subcommand == 'add') {
            current_points[hall] += points;
        } else if (subcommand == 'subtract') {
            current_points[hall] -= points;
        }


        let new_interface = create_interface(interaction, current_points);

        // conn.query('DROP TABLE hall_points');
        // conn.query('CREATE TABLE hall_points (points json, interface json);');
        // conn.query(`INSERT INTO hall_points VALUES (\'${JSON.stringify(current_points)}\', \'${JSON.stringify({ 'channel': 22, 'message': 33 })}\');`);

        conn.query(`UPDATE hall_points SET points = \'${JSON.stringify(current_points)}\'`);

        if (subcommand == 'create_interface') {
            await interaction.reply({ embeds: new_interface });

            let msg = await interaction.fetchReply();

            let interface = {
                'channel': '1068377251994939452',
                'message': '1068393767012409395',
            };

            interface.channel = msg.channelId;
            interface.message = msg.id;

            console.log(interface, current_points);

            conn.query(`UPDATE hall_points SET interface = \'${JSON.stringify(interface)}\'`);
        } else { 
            interaction.reply({ content: `${hall} now has ${current_points[hall]} points.`, ephemeral: true });

            let interface = JSON.parse((await conn.promise().query(`SELECT * FROM hall_points`))[0][0]['interface']);  

            console.log(interface);

            client.channels.cache.get(interface['channel']).messages.fetch(interface['message']).then((msg) => {
                msg.edit({ embeds: new_interface });
            });
        }

        

        
	},
};