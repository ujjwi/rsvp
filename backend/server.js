import express from 'express';
import cors from 'cors';
import connectToMongo from './config/db.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/event.js';

connectToMongo();

const app = express()
const port = 5000

// Use the cors middleware
app.use(cors());

app.use(express.json()) // to access req.body

// to make the uploads folder publicly accessible, do the following or implement a get request in routes
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//Available routes
app.use('/api/auth', authRoutes);
app.use('/api/event', eventRoutes);

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
