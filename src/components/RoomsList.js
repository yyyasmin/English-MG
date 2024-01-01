import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import isEmpty from "../helpers/isEmpty";

import {
  updateCr,
  removeUpdatedRoomDataListener,
  emitAddMemberToRoom,
} from "../clientSocketServices";

const GameContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-top: 20px;
  background-color: snow;
`;

const RoomTable = styled.table`
  width: 80%;
  border-collapse: collapse;
  border-spacing: 0;
  border: 2px solid black; /* Added a 2px solid black border to the table */
  margin: 0 auto;

  th {
    background: #9b9b9b;
    color: #fff;
    font-weight: bold;
    text-transform: uppercase;
    border: 1px solid #9b9b9b;
    border-radius: 5px;
    padding: 10px;

  }

  th,
  td {
    padding: 10px;
    text-align: center;
    border: 5px solid brown; /* Added a 1px solid black border to table cells */

  }

  th:first-child,
  td:first-child {
    text-align: left;
  }

  
  button {
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
  }
`;

const GameHeading = styled.h1`
  margin: 3rem;
`;

const RoomsList = ({ userName, roomsInitialData }) => {
  const [currentRoom, setCr] = useState({});
  const navigate = useNavigate();

  const handleJoinRoom = async (chosenRoom) => {
    console.log("IN handleJoinRoom -- chosenRoom: ", chosenRoom)
    if ( !isEmpty(userName) )   {
      emitAddMemberToRoom({
        playerName: userName,
        chosenRoom: chosenRoom,
      });
    }
  };

  useEffect(() => {
    updateCr(setCr);
    return () => {
      removeUpdatedRoomDataListener();
    };
  }, []);

  useEffect(() => {
    if (currentRoom !== null && currentRoom !== undefined && currentRoom.id >= 0) {
      console.log("IN RoomList -- CALLING GAME WITH: currentRoom: ", currentRoom)
      navigate(`/game/${currentRoom.id}`, {
        state: { userName, currentRoom },
      });
    }
  }, [currentRoom]);

  const rowColors = [
    "#E3F9A6",
    "#8DB600",
    "#C7A317",
    "#E6BF83",
    "lightseagreen",
    "green",
    "lightseagreen",
    "#E6BF83",
    "#C7A317",
    "#8DB600",

  ];

  const textColors = [
    "black",
    "white",
    "white",
    "black",
    "white",
    "white",
  ];

  return (
    <GameContainer>
      <GameHeading>Available Rooms:</GameHeading>
      <RoomTable>
        <thead>
          <tr>
            <th>Room Name</th>
            <th>Max Members</th>
            <th>Info</th>
            <th>Join</th>
          </tr>
        </thead>
        <tbody>
          {roomsInitialData.map((room, index) => (
            <tr
              key={room.id}
              style={{
                backgroundColor: rowColors[index % rowColors.length],
                color: textColors[index % textColors.length],
              }}
            >
              <td>
                <a href={room.info} target="_blank" rel="noopener noreferrer">
                  {room.name}
                </a>
              </td>
              <td>{room.maxMembers}</td>
              <td>{room.name}</td>
              <td>
                <button onClick={() => handleJoinRoom(room)}>Join</button>
              </td>
            </tr>
          ))}
        </tbody>
      </RoomTable>
    </GameContainer>
  );
};

export default RoomsList;