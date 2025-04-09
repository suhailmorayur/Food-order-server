const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectedDb = require('./config/db')
const apiRoutes = require ('./routes/index') 

app.use(cors())
app.use(express.json())
app.use(cookieParser());



app.use("/api" , apiRoutes)

connectedDb();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
