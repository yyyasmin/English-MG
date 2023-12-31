import React from "react";
import styled from "styled-components";
import ReactCardFlip from "react-card-flip";

// const catImage = require("../assets/textures/catImage.png");
const yasminLogo = require("../assets/textures/yasminLogo.PNG");


const computeCardSize = (cardSize) => {
  
  let cWidth = `${cardSize.card.width}px`;
  let cHeight = `${cardSize.card.height}px`;

  let gWidth = `${cardSize.gap.width}px`;
  gWidth = gWidth ? gWidth : "100px";

  let gHeight = `${cardSize.card.height}px`;
  gHeight = gHeight ? gHeight : "100px";

  //gWidth = "100px";  // SHOULD BE GAP_FIXED_SIZE
  //gHeight = "100px";


  //console.log("Card width: ", cWidth);
  //console.log("Card height: ", cHeight);
  //console.log("Gap width: ", gWidth);
  //console.log("Gap height: ", gHeight);

  let resCardSize = {
    width: cWidth,
    height: cHeight,
    gap: `${gHeight} ${gWidth}`, // Adjusted gap style attribute here
  };


  return resCardSize;
};



const CardContainer = styled.div`
  ${({ cardSize }) => computeCardSize(cardSize)}

  display: flex;
  flex-direction: column;
  cursor: grab;
  overflow: hidden;
  position: relative;
  /*** margin: 10px; ***/
  border-radius: 25px;
  border: 10px solid brown;
  box-sizing: border-box;
  max-width: 100%;
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 25px;
  object-fit: fill;
  resizeMode:'contain'
`;

const NikeCard =  ( props ) =>  {
  
  let { key, playerName, card, cardSize, isFlipped, toggleCardFlip } = props;
  
  let cardW = cardSize.width ? cardSize.width.toString()+"px" : null;
  let cardH = cardSize.height ? cardSize.height.toString()+"px" : null;

  const handleCardClick = () => {
    if ( toggleCardFlip != null )  {
      toggleCardFlip(card.id);
    }
  };

  return (
    <ReactCardFlip isFlipped={isFlipped}>

      <CardContainer cardSize={cardSize} onClick={handleCardClick}>
        <CardImage src={card.imageImportName} alt={card.name} />
      </CardContainer>

      <CardContainer cardSize={cardSize} onClick={handleCardClick}>
          <CardImage src={yasminLogo} alt={card.name} />
      </CardContainer>

    </ReactCardFlip>
  );
};

export default NikeCard;
