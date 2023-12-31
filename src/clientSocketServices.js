import io from "socket.io-client";
import { CHOSEN_PROXY_URL } from "./helpers/ServerRoutes.js";

export const socket = io(CHOSEN_PROXY_URL);

export const emitAddMemberToRoom = ({ playerName, chosenRoom }) => {
  socket.emit('CREATE_ROOM_AND_ADD_PLAYER', { playerName, chosenRoom });
};

export const emitRemoveMemberFromRoom = ({ playerName, chosenRoom }) => {
  socket.emit('REMOVE_PLAYER_FROM_ROOM', { playerName, chosenRoom });
};

export const emitRemoveRoomFromActiveRooms = (roomId) => {
  socket.emit('REMOVE_ROOM_FROM_ACTIVE_ROOMS', roomId);
};

export const emitCurentRoomChanged = (curentRoom) => {
  socket.emit("CURENT_ROOM_CHANGED", curentRoom);
};

export const emitCurentMatchedCards = (cr, matchedCards) => {
  socket.emit("MATCHED_CARDS_CHANGED", cr, matchedCards);
};

export const emitCurentIsMatched = (isMatched, last3FlippedCards, have_has_word_idx) => {
  console.log("IN emitCurentIsMatched -- have_has_word_idx: ", have_has_word_idx)
  socket.emit("IS_MATCHED_CHANGED", isMatched, last3FlippedCards, have_has_word_idx );
};

export const emitCurentCardSize = (cr, cardSize) => {
  socket.emit("CARD_SIZE_CHANGED", cr, cardSize );
};

export const updateCr = (setCr) => {
  socket.on("UPDATED_CURRENT_ROOM", (serverUpdatedCurentRoom) => {
    console.log("clientSocketServices -- updateCr -- serverUpdatedCurentRoom: ",
                  serverUpdatedCurentRoom)
    setCr(serverUpdatedCurentRoom);
  });
};

export const updatePlayerLeft = (setPlayerLeft) => {
  socket.on("PLAYER_LEFT_ROOM", (playerName) => {
    console.log("clientSocketServices -- updatePlayerLeft -- ON-PLAYER_LEFT_ROOM -- playerName: ", playerName)
    setPlayerLeft(playerName);
  });
};

export const updateMatchedCards = (setMatchedCards) => {
  socket.on("UPDATED_MATCHED_CARDS", (matchedCards) => {
    setMatchedCards(matchedCards);
  });
};

export const updateIsMatched = (setIsMatched, setLast3FlippedCards, setHave_has_word_idx) => {
  socket.on("UPDATED_IS_MATCHED", (isMatched, last3FlippedCards, have_has_word_idx) => {
    console.log("IN updateIsMatched -- ON-UPDATED_IS_MATCHED -- last3FlippedCards: ", last3FlippedCards)
    console.log("IN updateIsMatched -- ON-UPDATED_IS_MATCHED -- have_has_word_idx: ", have_has_word_idx)
    setIsMatched(isMatched);
    setLast3FlippedCards(last3FlippedCards);
    setHave_has_word_idx(have_has_word_idx);
  });
};

export const updateCardSize = (setCardSize) => {
  socket.on("UPDATED_CARD_SIZE", (cardSize) => {
    console.log("IN updateCardSize -- ON-UPDATED_CARD_SIZE -- cardSize: ", cardSize)
    setCardSize(cardSize);
  });
};

export const removeUpdatedRoomDataListener = () => {
  console.log("removeUpdatedRoomDataListener -- REMOVING SOCKER from UPDATED_CURRENT_ROOM")
  socket.off("UPDATED_CURRENT_ROOM");
};

export const removeUpdatedMatchedCards = () => {
  socket.off("UPDATED_MATCHED_CARDS");
};


export const removeUpdatedIsMatched = () => {
  socket.off("UPDATED_IS_MATCHED");
};