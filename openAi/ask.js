const axios = require('axios').default

const askGPT = async (prompt) =>{
  try{
    const res = await axios.post("https://mygpt-3ira.onrender.com", {
      prompt
    })
    if(res.status !== 200) return "Desculpe... não entendi"
    return res.data.message
  }catch(err){
    return "Desculpe... não entendi"
  }
  
}

module.exports = askGPT