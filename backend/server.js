import express from 'express';
import connectToMongo from './config/db.js';

connectToMongo();

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//Available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/event', require('./routes/note'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
