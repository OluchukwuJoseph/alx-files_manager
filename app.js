const express = require('express');

const app = express();

app.use(express.json())

app.post('/users', (req, res) => {
  res.json(req.body);
});

app.listen(5500, () => {
  console.log(`Server is running on localhost 5500`);
});