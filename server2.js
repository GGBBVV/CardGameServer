import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import cors from "cors";

import {
  GameCreate,
  GetPlayerList,
  PlayerJoin,
  UpdateCards,
} from "./database.js";
import { normalDeck } from "./cards.js";
import { CheckCard } from "./card-middleware.js";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.68.67:3000"],
  },
});

let app = express();

app.use(cors());
app.use(express.json());

const gameIDs = ["936030"];
let games = [];
let decks = [];
//Opens the sockets for the clients to connect

io.on("connection", async (socket) => {
  socket.on("join-game", (gameID, username, cb) => {
    socket.join(gameID);
    socket.to(gameID).emit("player-join", username);
  });

  // When the user changes the game
  socket.on("game-change-client", (game, gameID) => {
    socket.to(gameID).emit("game-change-server", game);
  });

  // When the start button on the client is pressed
  socket.on("start-game", (gameID, numberOfPlayers, cb) => {
    let game = {
      gameID: gameID,
      numberOfPlayers: numberOfPlayers,
      joined: 0,
      gottenCards: 0,
      tableCard: { suit: "diamonds", value: 5 },
      gameType: "Last Card",
    };
    games.push(game);
    socket.to(gameID).emit("client-start");
    cb();
  });

  //When the user is connected to the game
  socket.on("game-client-joined", (gameID) => {
    socket.join(gameID);
    games.forEach((game) => {
      if (game.gameID === gameID) {
        game.joined++;
        if (game.joined == game.numberOfPlayers) {
          io.to(gameID).emit("full-lobby");
          let _deck = normalDeck;
          _deck.push(normalDeck);
          let deck = { gameID: gameID, deck: _deck };
          console.log("This is the deck being created");
          console.log(deck.deck);

          decks.push(deck);
        }
      }
    });
  });

  socket.on("get-cards", (number, index, gameID, username, cb) => {
    decks.forEach((deck) => {
      if (deck.gameID === gameID) {
        if (deck.deck.length === 0) {
          console.log("the deck is empty ");
          return;
        }
        let returnObj = [];
        for (let i = 0; i < number; i++) {
          let random = Math.floor(Math.random() * deck.deck.length);
          returnObj.push(deck.deck[random]);
          deck.deck.splice(random, 1);
        }
        cb(returnObj);
        socket.to(gameID).emit("change-cards", username, number);
        UpdateCards(index, returnObj, gameID);
      }
    });
  });

  //When the new table card is set
  socket.on("table-card", (gameID, card, username, cb) => {
    let index = games.findIndex((x) => x.gameID === gameID);
    if (index === undefined) return;
    let game = games[index];
    const validCard = CheckCard(game.gameType, card, game.tableCard);
    if (validCard) {
      games[index].tableCard = card;
      socket.to(gameID).emit("card-played", card);
      socket.to(gameID).emit("change-cards", username, -1);

      let deckIndex = decks.findIndex((deck) => deck.gameID === gameID);
      decks[deckIndex].deck.push(card);

      cb(200);
    } else {
      cb(404);
    }
  });
  socket.on("winner", (gameID, userIndex, username) => {
    console.log("The winner has been received on the server");
    io.to(gameID).emit("game-over", username);
  });

  socket.on("finish-turn", async (gameID, index, length, currentTurn, cb) => {
    let pickup = 0;
    currentTurn.forEach((card) => {
      if (card.value == 2) pickup += 2;
      if (card.value == 5) pickup += 5;
    });
    let nextIndex;
    if (index === length - 1) {
      nextIndex = 0;
    } else {
      nextIndex = index + 1;
    }
    io.to(gameID).emit("next-player", nextIndex, pickup);
  });
});

//Code for creating a new game pin
app.post("/create-game", (req, res) => {
  // Generate random 6 digit number
  let gameID = Math.floor(100000 + Math.random() * 900000).toString();
  let username = req.body.username;
  let currentPlayer = true;
  gameIDs.push(gameID);
  GameCreate(gameID).then(() => {
    PlayerJoin(username, true, gameID);
    res.json({
      gameID: gameID,
    });
  });

  // Send the game ID back to the client
});
// Code for verifying a join game request

app.post("/join-game", async (req, res) => {
  let id = req.body.id;
  if (gameIDs.includes(id)) {
    res.status(200);
    let something = await PlayerJoin(req.body.username, false, id);
    let users = await GetPlayerList(id);
    let index = users.length - 1;
    console.log(users);
    res.json({
      gameID: id,
      users: users,
      index: index,
    });
  } else {
    res.status(404);
    res.json({
      error: "Game ID does not exist",
    });
  }
  res.status(200);
});

httpServer.listen(4000);
app.listen(5000, () => {
  console.log(`App listening on port 5000`);
});
