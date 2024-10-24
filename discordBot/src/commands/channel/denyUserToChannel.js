const {SlashCommandBuilder, PermissionFlagsBits, ChannelType} = require("discord.js");
const {removeUserFromChannel} = require("../../utils/discordUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-user-from-channel')
        .setDescription('Remove user from a channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to remove the users from')
                .addChannelTypes(ChannelType.GuildVoice)
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
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const users = ['user1', 'user2', 'user3']
            .map(option => interaction.options.getUser(option))
            .filter(user => user !== null);

        try {
            for (const user of users) {
                await removeUserFromChannel(channel, user);
            }
            await interaction.reply({ content: `Users have been removed from the channel ${channel.name}.`, ephemeral: true });
        } catch (error) {
            console.error('Error removing users from channel:', error);
            await interaction.reply({ content: 'There was an error while removing the users from the channel.', ephemeral: true });
        }
    }
}