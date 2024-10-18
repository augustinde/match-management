const {SlashCommandBuilder, PermissionFlagsBits, ChannelType} = require("discord.js");
const {addUserToChannel: allowUserToChannel} = require("../../utils/discordIUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('allow-user-to-channel')
        .setDescription('Add a user to a channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to add the users to')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user1')
                .setDescription('The user to add')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user2')
                .setDescription('The user to add')
                .setRequired(false))
        .addUserOption(option =>
            option.setName('user3')
                .setDescription('The user to add')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.MANAGE_CHANNELS),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const users = ['user1', 'user2', 'user3']
            .map(option => interaction.options.getUser(option))
            .filter(user => user !== null);

        if(channel.type !== ChannelType.GuildVoice){
            return interaction.reply({ content: 'Please select a voice channel.', ephemeral: true });
        }

        try {
            for (const user of users) {
                await allowUserToChannel(channel, user);
            }
            await interaction.reply({ content: `Users have been added to the channel ${channel.name}.`, ephemeral: true });
        } catch (error) {
            console.error('Error adding users to channel:', error);
            await interaction.reply({ content: 'There was an error while adding the users to the channel.', ephemeral: true });
        }
    }
}