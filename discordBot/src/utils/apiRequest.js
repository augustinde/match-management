const config = require("../../config.json");

const API_URL = config.apiUrl;

const getMatchs = async (scheduled) => {
    console.log('Getting matchs in ' + scheduled);
    //const responseFetchMatchs = await fetch(API_URL + '/matchs?scheduled=' + scheduled);
    const responseFetchMatchs = await fetch(API_URL + '/matchs'); //For development ONLY
    if (!responseFetchMatchs.ok) {
        throw new Error('Error getting matchs');
    }
   return await responseFetchMatchs.json();
}

const getTeamByName = async (teamName) => {
    //const responseFetchTeam = await fetch(API_URL + '/teams/' + teamName);
    const responseFetchTeam = await fetch(API_URL + '/teams?name=' + teamName); //For development ONLY
    if (!responseFetchTeam.ok) {
        throw new Error('Error getting team');
    }
    return await responseFetchTeam.json();
}

module.exports = { getMatchs, getTeamByName };