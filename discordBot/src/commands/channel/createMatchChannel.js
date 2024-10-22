const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const {getTeamByName} = require("../../utils/apiRequest");
const {getUsersFromTeam} = require("../../utils/utils");
const {checkIfChannelExists, createChannel, addUserToChannel} = require("../../utils/discordUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-match-channels')
        .setDescription('Create match channels')
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('The category to create the channels')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('hour')
                .setDescription('The hour of the match (HH:MM)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('team1')
                .setDescription('The name of the first team')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('team2')
                .setDescription('The name of the second team')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {

        const category = interaction.options.getChannel('category');
        const matchHour = interaction.options.getString('hour');
        const guild = interaction.guild;
        const teamNames = ['team1', 'team2']
            .map(option => interaction.options.getString(option))
            .filter(teamName => teamName !== null);

        let replyMessage = '';

        try {
            for (const teamName of teamNames) {
                const team = await getTeamByName(teamName);
                const teamData = team[0];
                const users = getUsersFromTeam(teamData);
                const channelName = teamName + ' - ' + matchHour;

                if (!checkIfChannelExists(guild, channelName, category.id)) {
                    const channel = await createChannel(teamName, category, guild, channelName);
                    replyMessage += `Channel **${channelName}** created with **${users.length}** users.\n`;

                    for (const user of users) {
                        const discordUser = await guild.client.users.fetch(user);
                        await addUserToChannel(channel, discordUser);
                        replyMessage += `User **${discordUser.username}** added to channel **${channelName}**.\n`;
                    }

                } else {
                    replyMessage += `Channel **${channelName}** already exists.\n`;
                }
            }
            await interaction.reply({content: replyMessage, ephemeral: true});
        } catch (error) {
            console.error('Error creating channels:', error);
            await interaction.reply({content: 'There was an error while creating the channels.', ephemeral: true});
        }

    }

}