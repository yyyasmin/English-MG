// HELPERS
let activeRooms = [];  // KEEP TRACK OF PLAYERS
// const isEmpty = obj => !Object.keys(obj).length;

console.log("Init Active room:activeRooms --  ", activeRooms)

const updateActiveRoomsWithUpdatedRoom = (updatedRoom) =>  {
  const existingRoomIndex = activeRooms.findIndex((room) => room.id === updatedRoom.id);
  if (existingRoomIndex !== -1) {
    activeRooms[existingRoomIndex] = updatedRoom;
  }
  else  {
    activeRooms.push(updatedRoom)
  }
}

createNewRoom = (chosenRoom, roomId) => { 
  let newRoom = {
    ...chosenRoom,
    currentPlayers: [],
    id: roomId,
  }
  return newRoom
}

const getRoomFromActiveRooms = (room) => {
  console.log("IN getRoomFromActiveRooms -- input room: ", room.id);

  let newRoomId = room.id;
  while (activeRooms.some((r) => r.id === newRoomId && r.currentPlayers.length >= r.maxMembers)) {
    newRoomId += "0";
  }

  const existingRoomIndex = activeRooms.findIndex((r) => r.id === newRoomId);

  if (existingRoomIndex !== -1) {
    console.log("IN getRoomFromActiveRooms -- returning activeRooms[existingRoomIndex] : ", activeRooms[existingRoomIndex].id);
    return activeRooms[existingRoomIndex];
  } else {
    let newRoom = createNewRoom(room, newRoomId);
    activeRooms.push(newRoom);
    console.log("IN getRoomFromActiveRooms -- returning newRoom : ", newRoom.id);
    return newRoom;
  }
};


setRoomToAddPlayer = (chosenRoom) => {
  let updatedRoom; 
  updatedRoom = getRoomFromActiveRooms(chosenRoom)
  //console.log("0000 -- updatedRoom.currentPlayers: ", updatedRoom.id, updatedRoom.currentPlayers)
  updatedRoom.cardsData.map( (card, index) =>  {
    // Reset all game cards to be on thier back side - when a new players joins - to start the game from start
    card.isFlipped = true
  } )
  console.log("IN setRoomToAddPlayer -- updatedRoom.id: ", updatedRoom.id)
  console.log("IN setRoomToAddPlayer -- updatedRoom.currentPlayers: ", updatedRoom.currentPlayers)

  return updatedRoom
}


function movePlayerToEnd(currentPlayers, playerName) {   // FOR A RECONECTED USER
  // Find the index of the player to move
  const playerIndex = currentPlayers.findIndex((player) => player.name === playerName);
  // If the player is found in the array
  if (playerIndex !== -1) {
    // Remove the player from the array
    const playerToMove = currentPlayers.splice(playerIndex, 1)[0];
    // Push the player back to the end of the array
    currentPlayers.push(playerToMove);
    currentPlayers.forEach((player) => {
      player.isActive = false
    });
    currentPlayers[0].isActive = true  // FIRST TO JOIN GOES FIRST - ITS HIS TURN
  }
  return currentPlayers;
}


addPlayerToRoom = (room, playerName, socketId) => {
  // PREPARE THE ROOM TO ADD PLAYER TOO
  let updatedRoom
  let startGame = room.startGame
  let updatedPlayers
  const existingPlayer = room.currentPlayers && room.currentPlayers.find((player) => player.name === playerName);
  if (existingPlayer) {
    updatedPlayers = movePlayerToEnd(room.currentPlayers, playerName)  // MOVE EXISTING PLAYER TO END OF currentPlayers ARR
    updatedRoom = { ...room, currentPlayers: updatedPlayers  }
    return updatedRoom
  } else {
    newPlayer = {
      socketId: socketId,
      name: playerName,
      email: "",
      isWinner: false,
      isActive: false,
      flippCount: 0
    };
    room.currentPlayers.push(newPlayer);
    if ( room.currentPlayers.length === room.maxMembers )  {  // ALL PLAYERS HERE - START GAME
      startGame = true
    }
    room.currentPlayers.forEach((player) => {  // FIRST JOINED GO FIRST
      player.isActive = false 
    });
    room.currentPlayers[0].isActive = true
    updatedRoom = {
      ...room,
      startGame: startGame,
    }
    return updatedRoom
  }
}  // END addPlayerToRoom



// Function to remove a room from activeRooms when the last player leaves
const removeRoomFromActiveRooms = (roomId) => {
  const roomIndex = activeRooms.findIndex((r) => r.id === roomId);

  if (roomIndex !== -1) {
    activeRooms.splice(roomIndex, 1);
    //console.log("Room removed from activeRooms. Updated activeRooms:", activeRooms);
  }
};


// SOCKET SERVICES

console.log("IN serverSocketServices.js");

const serverSocketServices = (io) => {

  io.on("connection", (socket) => {

    socket.on("CREATE_ROOM_AND_ADD_PLAYER", ({ playerName, chosenRoom }) => {
      let updatedRoom = {...chosenRoom};
      console.log("ON-CCCCCCCCCCCCCCCCCC -- CREATE_ROOM_AND_ADD_PLAYER -- playerName: ", playerName)
      console.log("ON-CCCCCCCCCCCCCCCCCC -- CREATE_ROOM_AND_ADD_PLAYER -- init active roon for this player: ", activeRooms)

      if (playerName != undefined)  {
        updatedRoom = setRoomToAddPlayer(chosenRoom, playerName)
        updatedRoom = addPlayerToRoom(updatedRoom, playerName, socket.id)
        updateActiveRoomsWithUpdatedRoom(updatedRoom)
      }
      io.emit("UPDATED_CURRENT_ROOM", updatedRoom);
    });  // END ON-CREATE_ROOM_AND_ADD_PLAYER

    
	socket.on("REMOVE_PLAYER_FROM_ROOM", ({ playerName, chosenRoom }) => {
    let existingRoom, updatedRoom;
    let existingPlayer = {}
    existingRoom = getRoomFromActiveRooms(chosenRoom) 
    if (!existingRoom) {
      return { playerName, chosenRoom }
    }  else {
      updatedRoom = existingRoom;
    }
    existingPlayer = updatedRoom.currentPlayers && updatedRoom.currentPlayers.find((player) => player.name === playerName);  
    if (existingPlayer) {
      // let updatedPlayers = [...updatedRoom.currentPlayers];
      let updatedPlayers = [...updatedRoom.currentPlayers.filter((player) => player.name !== playerName)]
      if ( updatedPlayers.length === 1 )  {
        updatedPlayers[0].isActive = true
      } 
      updatedRoom = {
        ... updatedRoom,
        currentPlayers: updatedPlayers,
      }
      if ( updatedPlayers.length == 0 )  {  // NO PLAYERS IN THE ROOM
        console.log("ALL PLAYERS LEFT THE ROOM")
        updatedRoom = {
          ... updatedRoom,
          currentPlayers: updatedPlayers,
          startGame: false,
          endGame: false,
        }
      }
    }
    updateActiveRoomsWithUpdatedRoom(updatedRoom)

    // Emit "PLAYER_LEFT_ROOM" to all players in the room except the current user
    const currentSocketID = socket.id;
    updatedRoom.currentPlayers.forEach(player => {
      const playerSocketID = player.socketId;
      if (playerSocketID !== currentSocketID) {
        io.to(playerSocketID).emit("PLAYER_LEFT_ROOM", playerName);
        io.to(playerSocketID).emit("UPDATED_CURRENT_ROOM", updatedRoom);

      }
    });
  });  // END ON-REMOVE_PLAYER_FROM_ROOM
    

    socket.on("REMOVE_ROOM_FROM_ACTIVE_ROOMS", roomId => {
	  //console.log("ON-REMOVE_ROOM_FROM_ACTIVE_ROOMS") 
      removeRoomFromActiveRooms(roomId) 
    });

    socket.on("CURENT_ROOM_CHANGED", (updatedRoom) => {
      updateActiveRoomsWithUpdatedRoom(updatedRoom) 
      io.emit("UPDATED_CURRENT_ROOM", updatedRoom);   
    });


    socket.on("MATCHED_CARDS_CHANGED", (updatedRoom, matchedCards) => {
      io.emit("UPDATED_MATCHED_CARDS", matchedCards);
    });


    socket.on("IS_MATCHED_CHANGED", (isMatched, last3FlippedCards, have_has_word_idx) => {
		//console.log("0N - IS_MATCHED_CHANGED -- isMatched: ", isMatched)
		//console.log("0N - IS_MATCHED_CHANGED -- last3FlippedCards: ", last3FlippedCards)
		//console.log("0N - IS_MATCHED_CHANGED -- have_has_word_idx: ", have_has_word_idx)
      io.emit("UPDATED_IS_MATCHED", isMatched, last3FlippedCards, have_has_word_idx);
    });
    

    socket.on("CARD_SIZE_CHANGED", (updatedRoom, cardSize) => {
      io.emit("UPDATED_CARD_SIZE", cardSize);
    });

    
    socket.on("START_GAME", () => {
      io.emit("UPDATED_START_GAME");
    });
    
    socket.on("END_GAME", () => {
      io.emit("UPDATED_END_GAME");
    });

  });

};

module.exports = serverSocketServices;
