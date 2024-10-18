const config = require("../../config.json");

const MAXIMUM_MATCH_DURATION = config.maximumMatchDuration;
const MAXIMUM_NUMBER_OF_HOURS_TO_RETRIEVE_FUTURE_MATCHES = config.maximumNumberOfHoursToRetrieveFutureMatches;

const getTeamNamesFromMatch = (match) => {
    return [match.team1.name, match.team2.name];
}

const getUsersFromTeam = (team) => {
    return team.members
        .filter(member => member.user.thirdparties && member.user.thirdparties.discord)
        .map(member => member.user.thirdparties.discord.discordID);
}

const getMatchDivision = (match) => {
    return match.segment.name;
}

const isMatchStartedSoon = (timestamp) => {
    const now = new Date();
    const nextHours = new Date(now.getTime() + MAXIMUM_NUMBER_OF_HOURS_TO_RETRIEVE_FUTURE_MATCHES * 60 * 60 * 1000);
    const givenDate = new Date(timestamp * 1000);
    return givenDate > now && givenDate < nextHours;
}

const isMatchAlreadyPlayed = (timestamp) => {
    const now = new Date();
    const previousHours = new Date(now.getTime() - MAXIMUM_MATCH_DURATION * 60 * 60 * 1000);
    const givenDate = new Date(timestamp * 1000);
    return givenDate < previousHours;
}

const getHoursMinutesOfMatch = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.getHours() + 'h' + date.getMinutes();
}

module.exports = { getTeamNamesFromMatch, getUsersFromTeam, getMatchDivision, isMatchStartedSoon, isMatchAlreadyPlayed, getHoursMinutesOfMatch };