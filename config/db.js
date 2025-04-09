require('dotenv').config()
const mongoose = require('mongoose');

const connectedDb = async ()=>{

try{
    await mongoose.connect(process.env.DB_URL);
    console.log("cennected DB");
}

catch (error){
    console.log(error);

}}

module.exports = connectedDb