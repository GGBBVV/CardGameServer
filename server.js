const io = require("socket.io")(4000, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

const express = require("express");
const cors = require("cors")
const app = express();
const firebase = require("./database");

app.use(cors());
app.use(express.json());

const gameIDs = [];
//Opens the sockets for the clients to connect

io.on("connection", (socket) => {

    socket.on("join-game", (gameID,username, cb) => {
        socket.join(gameID);
        socket.to(gameID).emit("player-join", username);
        cb(username)
    })
})

//Code for creating a new game pin
app.get("/create-game", (req,res) => {
    // Generate random 6 digit number
    let gameID = Math.floor(100000 + Math.random() * 900000).toString();
    gameIDs.push(gameID);
    
    // Send the game ID back to the client
    res.json({
        gameID : gameID
    })
});
// Code for verifying a join game request

app.post("/join-game", (req,res) => {
    let id = req.body.id
    if(gameIDs.includes(id)) {
        res.status(200)
        res.json({
            gameID: id
        })
    }
    else {
        res.status(404);
        res.json({
            error: "Game ID does not exist"
        })
    }
    res.status(200);
})
app.listen(5000, () => {
    console.log(`App listening on port 5000`);
})