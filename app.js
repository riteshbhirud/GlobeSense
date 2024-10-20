const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 5550;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/test', (req, res) => {
    res.send("Test message");
});

// Example route for another page
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  });


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);

});