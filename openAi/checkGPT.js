const axios = require('axios').default

const checkGPT = async () =>{
  const res = await axios.get("https://mygpt-3ira.onrender.com")
  if(res.status !== 200) return
  return res.data.message
}


module.exports = checkGPT