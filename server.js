import express from 'express';
import index from './routes/index';

const PORT = process.env.PORT || 5000;
// Create an Express server.
const app = express();

app.use('' ,index);

app.listen(PORT, () => {
  console.log(`Server is running on localhost ${PORT}`);
});
