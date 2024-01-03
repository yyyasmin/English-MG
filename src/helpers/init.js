
import { Fith_grade_has_have_1 } from "./GameCards/Fith_grade_has_have_1.js";


import { shuffle } from "./shuffle"; // Import all exports for images loading
import { CHOSEN_PROXY_URL } from "./ServerRoutes.js";

const TITLE_SIZE = "2.5rem";

// This function fetches data from a JSON file
const fetchDataFromJSON = async (filePath) => {
  try {
    const response = await fetch(filePath);
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
};

const getInitialGallerySize = () => {
	let initialGallerySize = { 
    width: window.innerWidth,
    height: window.innerHeight - parseFloat(TITLE_SIZE)
  }
	return initialGallerySize			
}

export const calculateCardSize = (cardsNum) => {
  const initialSize = getInitialGallerySize();
  const containerWidth = initialSize.width;
  const containerHeight = initialSize.height;
  let cols, rows

  switch(cardsNum)  {
    case 8:
      cols = 4
      rows = 2
      break;

    case 10:
      cols = 5
      rows = 2
      break;

    case 12:
      cols = 4
      rows = 3
      break;

    case 14:
      cols = 7
      rows = 2
      break;

    case 16:
      cols = 4
      rows = 4
      break;

    case 18:
      cols = 6
      rows = 3
      break;

    case 20:
      cols = 5
      rows = 4
      break;

    case 22:
      cols = 5
      rows = 5
      break;

    case 24:
      cols = 6
      rows = 4
      break;

    case 26:
      cols = 5
      rows = 5
      break;

    case 28:
      cols = 7
      rows = 4
      break;

    case 30:
      cols = 6
      rows = 5
      break;

    default:
      cols = 4
      rows = 4
  }   // END switch

  //if its a vertical screen swap cols and rows
  if ( containerHeight > containerWidth)  {
    let tmpCols = cols
    cols = rows
    rows = tmpCols
  }

  let totalGapWidth = containerWidth * 2 / 100  //2%
  let totalGapHeight = containerHeight * 2 / 100  //2%

  let gapWidth = totalGapWidth / (cols+1)
  let gapHeight = totalGapHeight / (rows+1)

  let cardWidth = ( containerWidth - (totalGapWidth) ) / cols
  let cardHeight = ( containerHeight - (totalGapHeight) ) / rows
    
  const cardSize = {
    card: {
      width: cardWidth,
      height: cardHeight*0.8,
    },
    gap: {
      width: gapWidth,
      height: gapHeight,
    },
  };

  return cardSize;
};


export const checkFor3CardsMatch = async (card1, card2, card3) => {
    console.log("IN checkForMatch -- card1, card2, card3: ", card1, card2, card3);
    let hCardIdx = 0;
    if (card1.type == 'e_h') {
        if (card2.name_1 === card3.name_1 && card1.correctChoice == card2.correctChoice) {
            hCardIdx = 0;
			console.log("IN checkFor3CardsMatch -- RETURNING:", true, 1);
			return { isMatched: true, hCardIdx: hCardIdx };
        }
    }
    if (card2.type == 'e_h') {
        if (card1.name_1 === card3.name_1 && card1.correctChoice == card2.correctChoice) {
            hCardIdx = 1;
            console.log("IN checkFor3CardsMatch -- RETURNING:", true, 1);
			return { isMatched: true, hCardIdx: hCardIdx };
        }
    }
    if (card3.type == 'e_h') {
        if (card1.name_1 === card2.name_1 && card3.correctChoice == card1.correctChoice) {
            hCardIdx = 2;
            console.log("IN checkFor3CardsMatch -- RETURNING", true, 2);
			return { isMatched: true, hCardIdx: hCardIdx };
        }
    }
    console.log("IN checkFor3CardsMatch -- RETURNING FALSE");
	return { isMatched: false, hCardIdx: hCardIdx };
};


// Initialize cards in rooms from a JSON file based on gameName
const initCardsInRoomsFromJson = async (rooms) =>  {

  for (const room of rooms)  {

    const jsonURL = `${CHOSEN_PROXY_URL}/database/GameCards/${room.gameName}.json`;

    const cardsData = await fetchDataFromJSON(jsonURL);
    
    if (cardsData) {
      let gameCards = cardsData.gameCards || [];
      const importArr = {
        Fith_grade_has_have_1: Fith_grade_has_have_1,
      };

      if (importArr[room.gameName]) {
        const gameCards1 = gameCards.map((card, index) => ({
          ...card,
		  type: "pic",
          background: "red",
          imageImportName: importArr[room.gameName][index][0],
        }));

        const gameCards2 = gameCards.map((card, index) => ({
          ...card,
		  type: "e_h",
          background: "blue",
          imageImportName: importArr[room.gameName][index][1],
        }));

        const gameCards3 = gameCards.map((card, index) => ({
          ...card,
		  type: "e_text",
          background: "yellow",
          imageImportName: importArr[room.gameName][index][2],
        }));
		
        gameCards = shuffle(gameCards1.concat(gameCards2).concat(gameCards3));
		room.cardsData = gameCards;
        room.cardSize = calculateCardSize(gameCards.length)
      }
    }
  }
  return rooms;
};

// Initialize rooms with data from rooms.json
const initRoomsFromJson = async () => {
  const jsonURL = `${CHOSEN_PROXY_URL}/database/rooms.json`;
  const roomsData = await fetchDataFromJSON(jsonURL);

  if (roomsData) {
    return roomsData.map((room) => ({
      ...room,
      cardsData: [], // Initialize cardsData for each room (to be filled later)
    }));
  }
  return [];
};

// ... Rest of your code ...

// Export a function that initializes rooms with cardsData
export const initRoomsFunc = async () => {
  let rooms = await initRoomsFromJson();
  rooms = await initCardsInRoomsFromJson(rooms); // Make sure to await this function
  return rooms;
};
