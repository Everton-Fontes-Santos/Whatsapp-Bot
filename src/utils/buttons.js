const createButtonType1 = ({id, displayText})=>{
    return {buttonId: id, buttonText: {displayText:displayText}, type: 1}
}


const buttonMessageType1 = (text, footer, buttons)=> {
    return {
        text,
        footer,
        buttons: buttons.map((btn,idx)=>createButtonType1({
            id:idx,
            displayText:btn
        })),
        headerType: 1
    }
}

module.exports = {
    createButtonType1,
    buttonMessageType1
}