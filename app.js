const express = require("express")
const { open } = require("sqlite")
const sqlite3 = require("sqlite3")
const path = require("path")
const databasePath = path.join(__dirname, "cricketMatchDetails.db")
const app = express()
app.use(express.json())

let database = null

const initializeDbAndServer = async() => {
    try{
        database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });


    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertplayerDetailsDbobjecttoResponseobject = (dbObject) => {
    return{
        playerId: dbObject.player_id,
        playerName: dbObject.player_name
         
    }
}

const convertmatchDetailsDbobjectToResponseObject = (dbObject) => {
    return{
        matchId: dbObject.match_id,
        match: dbObject.match,
        year: dbObject.year
        
    }
}

const convertPlayerMatchScoreDbobjectToResponseObject = (dbObject) => {
    return{
        playerMatchId: dbObject.player_match_id,
        playerId: dbObject.player_id,  
        matchId: dbObject.match_id,
        score: dbObject.score
        four: dbObject.four
        sixes: dbObject.sixes
        
        
    }
}



app.get("/players/", async(request, response) => {
    const getPlayers = `
    SELECT
    *
    FROM
    player_details`
    const PlayersArray = await database.all(getPlayers);
    respond.send(playersArray.map((eachPlayer) =>
      convertplayerDetailsDbobjecttoResponseobject(eachPlayer)
    ))
})





// GET API 2


app.get("/players/:playerId/", async(request, response) => {
    const { playerId } = request.params
    const getPlayers = `
    SELECT
    *
    FROM
    player_details 
    WHERE
    player_id = ${playerId}`
    const PlayersArray = await database.get(getPlayers);
    respond.send(convertplayerDetailsDbobjecttoResponseobject(PlayersArray))
})





// PUT API 3

app.put("/players/:playerId/", async(request, response) => {
    const {playerId} = request.params
    const {playerName} = request.body
    const updatePayer = `
    UPDATE
    player_details
    SET
    player_name = ${playerName}
    WHERE
    player_id = ${playerId};`;
    await database.run(updatePayer);
    response.send("Player Details Updated");
});
})


//  GET API 4


app.get("/matches/:matchId/", async(request, response) => {
    const { matchId } = request.params
    const getMatchDetails = `
    SELECT
    *
    FROM
    match 
    WHERE
    match_id = ${matchId}`
    const matchArray = await database.get(getMatchDetails);
    respond.send(convertmatchDetailsDbobjectToResponseObject(matchArray))
})



// GET API 5


app.get("/players/:playerId/matches", async(request, response) => {
    const { playerId } = request.params
    const getPlayerMatchDetails = `
    SELECT
    *
    FROM
    player_match_score
    NATURAL JOIN
    match_details 
    WHERE
    player_id = ${playerId}`
    const playerMatchArray = await database.get(getPlayerMatchDetails);
    respond.send(
        playerMatchArray.map((each) => 
        convertPlayerMatchScoreDbobjectToResponseObject(each))
    )
})





// GET API 6


app.get("/matches/:matchId/players", async(request, response) => {
    const { matchId } = request.params
    const getMatchPlayersQuery = `
	    SELECT
	      player_details.player_id AS playerId,
	      player_details.player_name AS playerName
	    FROM player_match_score NATURAL JOIN player_details
        WHERE match_id=${matchId};`;
    const playerMatchArray = await database.get(getPlayerMatchDetails);
    respond.send(
        playerMatchArray.map((each) => 
        convertPlayerMatchScoreDbobjectToResponseObject(each))
    )
})


//GET API 7

app.get("/matches/:matchId/players", async(request, response) => {
    const { matchId } = request.params
    const getPlayerScored = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
    const playerMatchArray = await database.get(getPlayerScored);
    respond.send(
        playerMatchArray.map((each) => 
        convertPlayerMatchScoreDbobjectToResponseObject(each))
    )
})


module.exports = app;
