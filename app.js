const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 5500;

app.set('view engine', 'ejs');

// Define a basic route
app.get('/', (req, res) => {
  res.send('Hello, this is your home route!');
});

// Example route for another page
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
  });
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);

});