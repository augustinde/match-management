const API_URL = process.env.API_URL;

//TODO: Get matchs in GET_MATCHS_IN_HOURS hours
const getMatchs = async (scheduled) => {
    console.log('Getting matchs in ' + scheduled);
    //const responseFetchMatchs = await fetch(API_URL + '/matchs?scheduled=' + scheduled);
    const responseFetchMatchs = await fetch(API_URL + '/matchs');
    if (!responseFetchMatchs.ok) {
        throw new Error('Error getting matchs');
    }
   return await responseFetchMatchs.json();
}

const getTeamByName = async (teamName) => {
    const responseFetchTeam = await fetch(API_URL + '/teams?name=' + teamName);
    if (!responseFetchTeam.ok) {
        throw new Error('Error getting team');
    }
    return await responseFetchTeam.json();
}

module.exports = { getMatchs, getTeamByName };