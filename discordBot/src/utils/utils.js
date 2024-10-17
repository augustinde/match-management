const getTeamNamesFromMatch = (match) => {
    const team1Name = match.team1.name;
    const team2Name = match.team2.name;

    return [team1Name, team2Name];
}

const getUsersFromTeam = (team) => {
    return team.members.map(member => member.user.thirdparties.discord.discordID);
}

const getMatchDivision = (match) => {
    return match.segment.name;
}

const isInNextHour = (timestamp) => {
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    const givenDate = new Date(timestamp * 1000);
    return givenDate > now && givenDate < nextHour;
}

const matchAlreadyPlayed = (match) => {
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const givenDate = new Date(match.matchDate * 1000);
    return givenDate < fourHoursAgo;
}

const getHoursMinutesOfMatch = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.getHours() + 'h' + date.getMinutes();
}

module.exports = { getTeamNamesFromMatch, getUsersFromTeam, getMatchDivision, isInNextHour, matchAlreadyPlayed, getHoursMinutesOfMatch };