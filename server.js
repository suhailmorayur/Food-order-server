const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectedDb = require('./config/db')
const apiRoutes = require ('./routes/index') 
const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });

// app.use(limiter);

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.use("/api" , apiRoutes)

connectedDb();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
