
const express = require('express');
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Server } = require("socket.io");
const sessionRoutes = require("./routes/sessions");
const Session = require("./models/Session");
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const mongoose = require("mongoose");
const {generateAccessToken, verifyAccessToken, verifyRefreshToken} = require('./authentication.js')
const cookieParser = require('cookie-parser');
const csurf = require("csurf");
const session = require('express-session');
const flash = require('express-flash');
const user = require('./models/user');




const csrfProtection = csurf({
  cookie: {
    httpOnly: true,  // Ensures the cookie is inaccessible via JavaScript
    sameSite: 'Strict',  // Or 'Lax' depending on your requirements
    secure: process.env.NODE_ENV === 'production',  // Ensure the cookie is only sent over HTTPS in production
  }
});
//const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
//require("dotenv").config();



const app = express();
app.use(flash());

app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie:{
    secure: false,
    maxAge: 60000
  }
}));
// Middleware
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(bodyParser.json());


const userRoutes = require('./routes/user').router; 
app.use('/api/users', csrfProtection, userRoutes);


const server = http.createServer(app);
//const io = new Server(server);
const io = new Server(server, {
  cors: {
      origin: "http://localhost:5550", // Allow your frontend's origin
      methods: ["GET", "POST"],       // Allowed HTTP methods
  }
});





//Cookie setup

/*const cors = require('cors');
app.use(cors({
    origin: "http://localhost:5550", // Update with your client’s URL
    credentials: true // Allows cookies to be included
}));

app.use(express.urlencoded({ extended: true }));*/
const port = process.env.PORT || 5550;
const uri = process.env.MONGODB_URI;


/*app.use((req, res, next) => {
  console.log("Global Middleware - Headers:", req.headers.cookie); // Logs raw cookie header
  console.log("Global Middleware - Cookies:", req.cookies);       // Logs parsed cookies
  next();
});*/

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use("/api/sessions", sessionRoutes);


app.get('/api/get-csrf-token', csrfProtection, (req, res) => {

  res.json({ csrfToken: req.csrfToken() });
});

app.get("/api/user", authenticateToken,(req,res)=>{
  console.log()
  console.log("USER:", req.session.user);
  if(req.session.user){
    res.json({user: req.session.user})
  }else{
    console.log("Unable to send userdata from app.js")
  }
})

app.get('/config', (req, res) =>{
  res.json({
    OPENCAGE_API_KEY: process.env.OPENCAGE_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    JAMENDO_CLIENT_ID: process.env.JAMENDO_CLIENT_ID,
    MONGODB_URI: process.env.MONGODB_URI

  });

});

app.use((req,res,next)=>{
  if(!req.session.gameData){
    req.session.gameData = {
      rounds: [],
      totalScore: 0,
      currentRound: 0,
      maxRoundsBeforeSave: 5
    }
  }
  next();
});

app.get('/', authenticateToken, csrfProtection, (req, res) => {
    //res.clearCookie('_csrf', { path: '/' });
    csrfToken = req.csrfToken()
    console.log("CURRENT USER:", req.user);
    if (req.user) {
      console.log("CSRF Token inserted into logout form:", csrfToken)
    }
    console.log("USERNAME:", req.user?.username)
    let user = req.user
    res.render("home",{ 
      user: user,
      csrf_token: csrfToken
    })
    console.log(req.session)
    //res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/test', (req, res) => {
    res.send("Test message");
});

app.get('/game', authenticateToken, csrfProtection, (req, res) => {
  if (!req.user) {
    return res.redirect('/login')
  }

  //res.sendFile(path.join(__dirname, 'views', 'index.html'));
  res.render("index", {
    csrf_token: req.csrfToken()
  });
  
});

app.get('/airport', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'airportMode.html'));
});

app.get('/mall', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'malls.html'));
});

app.get('/register', csrfProtection, (req, res) => {
  registerCsrfToken = req.csrfToken();
  console.log("CSRF Token injected into register form:",registerCsrfToken);
  res.render("signUp", {csrf_token: registerCsrfToken});
});

app.get('/login', csrfProtection, (req, res) => {
  csrfToken = req.csrfToken()
  console.log('CSRF token inserted into form:', csrfToken)
  res.render("signIn", {
    csrf_token: csrfToken,
    message: req.flash('error')
  });
});

app.get('/profile', (req, res) => {
  res.render("profile", {});
});


app.get('/multiplayer', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'multiplayer.html'));
})

app.get('/createGame', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.redirect('/login')
  }
  res.sendFile(path.join(__dirname, 'views', 'createRoom.html'));
})

app.get('/join', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.redirect('/login')
  }
  res.sendFile(path.join(__dirname, 'views', 'joinRoom.html'));

  
})


app.get('/join/:gameId', authenticateToken, async (req, res) => {
  if (!req.user) {
    return res.redirect('/login')
  }
  gameId = req.params.gameId
  
  // check if game id exists in DB
  try {

    const gameSession = await Session.findOne({ inviteCode: gameId });
    // check if active
    if(gameSession){
      if(gameSession.active === false){
        let isHost = req.user.username === gameSession.host
        //res.json({username: require('./routes/user').getUser().username, gameId: gameId})
        res.render("multiplayerGame", {
          isHost: isHost
        })
        //res.sendFile(path.join(__dirname, 'views', 'multiplayerGame.html'));
      }else{
        res.status(403).send("youre not invited lil bro")
      }
    } else {
      res.status(404).send("Invalid Game ID")
    }
    
  }
  catch (error) {
    console.error("Trouble fetching DB by gameID", error)
  }

})

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRF') {
    // Respond with a 403 Forbidden if the CSRF token is invalid
    return res.status(403).send('Form tampered with or CSRF token invalid');
  }
  next(err); // Pass error to the next handler
});

/*io.use((socket, next) => {
  console.log(socket.request.headers)
  console.log("HANDSHAKE:", socket.handshake.headers)
  // Extract token from cookies (since cookies are automatically sent by the browser)
  const token = socket.request.headers.cookie && socket.request.headers.cookie.jwt;
  console.log("TOKEN RECEIVED IN SOCKET CONNECTION:", token)
  if (!token) {
    return next(new Error('Authentication error'));
  }

  // Verify the token and get the decoded user information
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }

    // Attach user information (like username) to the socket object
    socket.username = decoded.username; // Assume 'decoded' contains user info (e.g., { username: 'user123' })
    next();
  });
});*/


const activeSessions = {};
// { inviteCode: { numGuesses: 0, users: {u1: {points: 5000, rawPoints: _, guess: _, distance: _, time: _}, ...}, eliminatedUsers: [] } }

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle joining a room
  socket.on("joinRoom", async ({ inviteCode, username }) => {
    try {
      const session = await Session.findOne({ inviteCode:inviteCode  });

      if (!session) {
        socket.emit("errorMessage", "Invalid invite code. Please check and try again.");
        return;
      }
      /*user = require('./routes/user').getUser()
      if (!user) {
        socket.emit("errorMessage", "Invalid User");
        return;
      }
      let username = user.username
      socket.username = username;*/
      //let username = socket.username;
      //console.log("socket.username =", username);
      

      // Add user to the session
      if (!session.players.has(username)) {
        console.log(session.players)
        
        session.players.set(username, 5000);
        await session.save();
        console.log(session.players)
      }

      // Store in activeSessions for real-time updates
      if (!activeSessions[inviteCode]){
        activeSessions[inviteCode] = new Map();
        activeSessions[inviteCode].set("numGuesses", 0)
        activeSessions[inviteCode].set("users", new Map());
        console.log("MAP OF USERS AFTER INITIALIZTION:", activeSessions[inviteCode].get("users"))
        activeSessions[inviteCode].set("eliminatedUsers", new Set());
        
      }
      console.log("MAP OF USERS:", activeSessions[inviteCode].get("users"))
      if (!activeSessions[inviteCode].get("users").has(username)) {
        activeSessions[inviteCode].get("users").set(username, new Map());
        activeSessions[inviteCode].get("users").get(username).set("points", 5000);
      }

      socket.join(inviteCode);
      console.log("LINE 328:", socket.rooms)
      io.to(inviteCode).emit("updatePlayerList", Array.from(activeSessions[inviteCode].get("users").keys()));

      console.log(`User ${username} joined room ${inviteCode}`);

      //socket.emit('get-username',socket.username)
      socket.username = username 
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("errorMessage", "An error occurred while joining the room.");
    }
  });

  socket.on("startGame", async (inviteCode) => {
    // reset data from previous round, if applicable
    activeSessions[inviteCode].set("numGuesses", 0)
    activeSessions[inviteCode].get("eliminatedUsers").clear();
    console.log(`Data for room ${inviteCode} after startGame called: ${activeSessions[inviteCode]}`)

    //Global vars from script.js
    let latitude;
    let longitude;
    let retryCount = 0;
    const maxRetries = 20;
    let encodedCountry;
    let url;
    let streetViewStatus= false;
    let googleAPIKey = process.env.GOOGLE_API_KEY
    let jamendoClientID = process.env.JAMENDO_CLIENT_ID
    let openCageAPIKey = process.env.OPENCAGE_API_KEY
    let cities = ["New%20York", "New%20Delhi", "Los%20Angeles", "Chicago", "Toronto", "Mexico%20City", "Houston", "Vancouver",
      "San%20Francisco", "Montreal", "Miami", "São%20Paulo", "Buenos%20Aires", "Rio%20de%20Janeiro",
      "Santiago", "Bogotá", "Lima", "Caracas", "Medellín", "Montevideo", "Quito", "London",
      "Paris", "Berlin", "Madrid", "Rome", "Amsterdam", "Vienna", "Zurich", "Warsaw",
      "Oslo", "Tokyo", "Shanghai", "Beijing", "Seoul", "Dharavi", "Bangkok", "Jakarta",
      "Manila", "Singapore", "Kuala%20Lumpur", "Cairo", "Nairobi", "Johannesburg",
      "Accra", "Algiers", "Addis%20Ababa", "Casablanca", "Kinshasa", "Dakar", "Sydney",
      "Melbourne", "Brisbane", "Perth", "Auckland", "Wellington", "Canberra", "Adelaide",
      "Hobart", "Suva", "Istanbul", "Moscow", "Kiev", "St.%20Petersburg", "Dubai", "Abu%20Dhabi",
      "Tehran", "Riyadh", "Tel%20Aviv", "Jerusalem", "Doha", "Kuwait%20City", "Baku", "Ankara",
      "Baghdad", "Damascus", "Amman", "Muscat", "Beirut", "Manama", "Dhaka", "Karachi",
      "Islamabad", "Colombo", "Kathmandu", "Thimphu", "Male", "Hanoi", "Ho%20Chi%20Minh%20City",
      "Phnom%20Penh", "Vientiane", "Yangon", "Naypyidaw", "Busan", "Taipei", "Tokyo", "Osaka",
      "Nagoya", "Sapporo", "Kyoto", "Shenzhen", "Guangzhou", "Chengdu", "Wuhan",
      "Atlanta", "Boston", "Dallas", "Phoenix", "Philadelphia", "San%20Diego", "San%20Jose",
      "Austin", "Denver", "Orlando", "Las%20Vegas", "Tampa", "Charlotte", "Detroit",
      "Seattle", "Washington%20D.C.", "Baltimore", "Minneapolis", "Cleveland", "Pittsburgh",
      "Cincinnati", "Indianapolis", "Kansas%20City", "Milwaukee", "St.%20Louis", "Buffalo",
      "Salt%20Lake%20City", "Columbus", "Richmond", "Birmingham", "Tucson", "Portland",
      "Sacramento", "Reno", "Anchorage", "Honolulu", "Memphis", "Louisville", "New%20Orleans",
      "Oklahoma%20City", "Albuquerque", "El%20Paso", "Raleigh", "Nashville", "Tallahassee",
      "Montpellier", "Strasbourg", "Marseille", "Lyon", "Nice", "Bordeaux", "Toulouse",
      "Munich", "Frankfurt", "Hamburg", "Cologne", "Düsseldorf", "Stuttgart", "Leipzig",
      "Dresden", "Hannover", "Rotterdam", "The%20Hague", "Utrecht", "Brussels", "Antwerp",
      "Ghent", "Bruges", "Copenhagen", "Stockholm", "Gothenburg", "Malmö", "Helsinki",
      "Tallinn", "Riga", "Vilnius", "Prague", "Bratislava", "Budapest", "Ljubljana",
      "Zagreb", "Belgrade", "Sofia", "Bucharest", "Skopje", "Tirana", "DAV Aundh Pune Maharashtra", "Podgorica",
      "Sarajevo", "Luxembourg", "Reykjavik", "Dublin", "Edinburgh", "Glasgow", "Cardiff",
      "Belfast", "Lisbon", "Porto", "Valencia", "Seville", "Malaga", "Bilbao",
      "Granada", "Palermo", "Naples", "Florence", "Venice", "Milan", "Turin",
      "Genoa", "Bologna", "Verona", "Zurich", "Geneva", "Bern", "Basel", "Lausanne",
      "Lugano", "Lucerne", "Hambantota", "Jaffna", "Trincomalee", "Batticaloa",
      "Galle", "Kurunegala", "Kandy", "Polonnaruwa", "Sigiriya", "Anuradhapura",
      "Matara", "Badulla", "Embilipitiya", "Ratnapura", "Habarana", "Negombo",
      "Chilaw", "Vavuniya", "Matale", "Avissawella", "Tangalle", "Moratuwa",
      "Brasilia", "Recife", "Curitiba", "Salvador", "Porto%20Alegre", "Fortaleza",
      "Brasov", "Cluj-Napoca", "Constanta", "Timișoara", "Sibiu", "Debrecen", "Szeged", "Statue of Unity",
      "Miskolc", "Zaragoza", "Cordoba", "Toledo", "Alicante", "Malaga", "Granada",
      "Valencia", "Bremen", "Nuremberg", "Dortmund", "Essen", "Bochum", "Leverkusen",
      "Duisburg", "Wuppertal", "Bielefeld", "Münster", "Krakow", "Wroclaw", "Lodz",
      "Katowice", "Gdansk", "Szczecin", "Poznan", "Vilnius", "Kaunas", "Klaipeda",
      "Riga", "Tallinn", "Tartu", "Pärnu", "Antwerp", "Ghent", "Niagara Falls", "Bruges", "Namur",
      "Liège", "Arlon", "Charleroi", "Mons", "Leuven", "Mechelen", "Namur", "Brest",
      "Nantes", "Rennes", "Biarritz", "Toulon", "Dijon", "Grenoble", "Bastia", "SNBP International School Rahatani Pune Maharashtra", "Rose Icon Pune Maharashtra India", "Boston", "Amherst", "Lowell", "1400 Gorham St", "1400 Gorham St Lowell MA", "Elm Hall Amherst MA"]
    
    
    function wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function getRandomCoordinates() {
      let geometry = null;
      let city = cities[Math.floor(Math.random() * cities.length)]
      console.log("city:", city)

      const boundingBoxApiUrl = `https://nominatim.openstreetmap.org/search?q=${city}&format=json&polygon_threshold=10&polygon_geojson=1&addressdetails=1`
    
      try {
        const coordinatesResponse = await fetch(boundingBoxApiUrl)
        if (!coordinatesResponse.ok) {
          throw new Error('Network response was not ok');
    
        }
        const coordinatesData = await coordinatesResponse.json()
    
        coordinates = coordinatesData[0].geojson.coordinates[0]
        console.log("OSM COUNTRY:", coordinatesData[0].address.country);
        encodedCountry = encodeURIComponent(coordinatesData[0].address.country);
        console.log("OSM ENCODED COUNTRY:", encodedCountry);
        if (coordinates.length == 1) {
          coordinates = coordinates[0]
        }
        //OSaka 00 0/1 !=1
        //NY 000 0/1 ==1
        latitude = coordinates[0][1]
        longitude = coordinates[0][0]
    
      } catch (error) {
        console.error('Fetch error:', error);
      }
    
      console.log("ORIGINAL COORDINATES", latitude, longitude);
    
      const roadApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${openCageAPIKey}&language=en&roadinfo=1&pretty=1`;
      
    
      try {
        const response = await fetch(roadApiUrl);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data)
    
        if (data.results.length > 0) {
          geometry = data.results[0].geometry;
          console.log("CHANGED COORDINATE", geometry);
          console.log(geometry.lat);
          console.log(geometry.lng);
          return {
            latitude: geometry.lat,
            longitude: geometry.lng
          };
        } else {
          // Wait for 2 seconds before retrying with another random coordinate
          await wait(2000);
          return await getRandomCoordinates();
        }
      } catch (error) {
        console.error('Fetch error:', error);
        // Wait for 2 seconds before retrying on error
        await wait(2000);
        return await getRandomCoordinates(); // Retry on error
      }
    }
    


    
    async function setCoordinates() {
      console.log("CALLING FETCH COUNTRY FUNCTION")
      if (retryCount >= maxRetries) {
        console.error('Max retry limit reached. Stopping further attempts.');
        return null;
      }

      retryCount++;
      const coordinates = await getRandomCoordinates();
      console.log("setCoordinates coordinates", coordinates);
      latitude = coordinates.latitude;
      longitude = coordinates.longitude;
      

      try {
        const streetViewApiUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${latitude},${longitude}&key=${googleAPIKey}&radius=100`;
        const streetViewResponse = await fetch(streetViewApiUrl);

        if (!streetViewResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const streetViewData = await streetViewResponse.json();
        if (streetViewData.status === "OK") {
          streetViewStatus = true;
          console.log("GOOGLE STREET VIEW SUCCESSFUL:", latitude, longitude, "are able to be displayed by google street view.")
          /*document.getElementById("timer").style.display = "block";
          initialize(parseFloat(latitude), parseFloat(longitude));
          timer1();*/
          return encodedCountry;
        } else if (streetViewData.status === "ZERO_RESULTS") {
          console.warn('No Street View coverage at this location. Fetching new location...');
          return setCoordinates();
        }
      } catch (error) {
        console.error('Fetch error:', error);
        await wait(2000); // Retry after 2 seconds
        return setCoordinates();
      }

      return null; // Fallback  in case of an unexpected failure
    }

    const country = await setCoordinates();
    if (country) {
      //encodedCountry = encodeURIComponent(country);
      console.log("Country:", country);
  
      //const musicApiUrl = `https://de1.api.radio-browser.info/json/stations/search?country=${encodedCountry}&tag=jazz&limit=1`;
      const artistApiUrl = `https://api.jamendo.com/v3.0/artists/locations/?client_id=${jamendoClientID}&format=jsonpretty&limit=5&haslocation=true&location_coords=${latitude}_${longitude}&location_radius=200`; // takes in coordinates to get artist
  
      try {
        //const response = await fetch(musicApiUrl);
        const response = await fetch(artistApiUrl);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
  
        if (data.results.length === 0) {
          startProcessRadio()
        }
        else {
          console.log("JAMENDO BEING USED")
          randArtist = Math.floor(Math.random() * data.results.length)
          let artistId = data.results[randArtist].id;
          const trackApiUrl = `https://api.jamendo.com/v3.0/artists/tracks/?client_id=${jamendoClientID}&format=jsonpretty&order=track_name_desc&id=${artistId}&audioformat=mp31`; // takes in artist id to get stream url
          const trackResponse = await fetch(trackApiUrl);
          if (!trackResponse.ok) {
            throw new Error('Network response was not ok');
          }
          const trackData = await trackResponse.json();
          randSong = Math.floor(Math.random() * trackData.results[0].tracks.length)
          songName = trackData.results[0].tracks[randSong].name
          artistName = data.results[randArtist].name
          console.log("track data:", trackData);
          console.log("Artist name:", artistName)
          console.log(`Song name: ${songName}`)
          url = trackData.results[0].tracks[randSong].audio;
          console.log("url:", url);
          //music.src = url;
        }
      } catch (error) {
        console.error('Music Fetch error:', error);
      }
    }
    

    
    console.log(inviteCode)
    console.log("INSIDE STARTGAME SOCKET HANDLER")
    const isEliminated = activeSessions[inviteCode].get("users").get(socket.username).get("points") <= 0
    io.to(inviteCode).emit("gameStarted", {latitude: latitude, longitude: longitude, musicUrl: url, isEliminated: isEliminated});



  });

  socket.on("iAmDone", async ({inviteCode, userGuess, userPoints, userdistance, elapsedTime}) => {
    console.log(`${socket.username} is done.`)
    // increment count 
    activeSessions[inviteCode].set("numGuesses", activeSessions[inviteCode].get("numGuesses")+1)
    console.log("Number of players who have guessed so far:", activeSessions[inviteCode].get("numGuesses"))
    

    // store all guess data in activeSessions for the user
    // rawPoints: _, guess: _, distance: _, time: _
    activeSessions[inviteCode].get("users").get(socket.username).set("rawPoints" , userPoints);
    activeSessions[inviteCode].get("users").get(socket.username).set("guess", userGuess);
    activeSessions[inviteCode].get("users").get(socket.username).set("distance", userdistance);
    activeSessions[inviteCode].get("users").get(socket.username).set("elapsedTime", elapsedTime);
    
    // check if round is over (all players have guessed)
    mapOfUsers = activeSessions[inviteCode].get("users")
    activeUsers = 0;
    for (const [username, userData] of mapOfUsers) {
      if (userData.get("points") > 0) {
        activeUsers++;
      }
    }
    console.log("Number of active users in the game:", activeUsers)

    if (activeSessions[inviteCode].get("numGuesses") === activeUsers) {
      console.log("The number of guesses = active users")

      // calculate the updated score of each user
      winner = null
      bestScore = 0
      for (const [username, userData] of mapOfUsers) {
        if (userData.get("points") <= 0) {
          continue  // user is eliminated
        }
        
        if (userData.get("rawPoints") > bestScore) {
          winner = username
          bestScore = userData.get("rawPoints")
        }
      } 

      for (const [username, userData] of mapOfUsers) {
        if (userData.get("points") <= 0) {
          continue  // user is eliminated
        }

        userData.set("points", userData.get("points") - Math.round(((bestScore - userData.get("rawPoints"))*0.3)))
        if (userData.get("points") < 0) {
          userData.set("points", 0);
          activeSessions[inviteCode].get("eliminatedUsers").add(username)
          
        }
      }
      function mapToObject(map) {
        const obj = {};
        for (const [key, value] of map.entries()) {
            obj[key] = value instanceof Map ? mapToObject(value) : value;
        }
        return obj;
      }
      // send activeSessions[inviteCode]["users"]
      console.log("USERS FROM APP.JS:", activeSessions[inviteCode].get("users"))
      console.log("ELIM USERS",activeSessions[inviteCode].get("eliminatedUsers"))

      roundData = mapToObject(activeSessions[inviteCode].get("users"))

      

      io.to(inviteCode).emit("roundStatsCollected", {eliminatedUsers: Array.from(activeSessions[inviteCode].get("eliminatedUsers")), roundData: roundData})
      



    }





  })

  // Handle disconnection
  
  //["disconnecting"/*, "manualDisconnect"*/].forEach((event) => {
  socket.on("disconnecting", async () => {
    console.log("disconnecting")
  
    const rooms = Array.from(socket.rooms).slice(1); // Get rooms the user is in
    console.log("AFTER LINE 345")
    console.log(socket.rooms)
    //if activeSessions[inviteCode].has(username)
    rooms.forEach( async (inviteCode) => {
      console.log("reached foreach on 349")
      if (activeSessions[inviteCode]) {
        if(activeSessions[inviteCode].get("users").get(socket.username) !== undefined){
          delete activeSessions[inviteCode].get("users").get(socket.username)
        }
        /*activeSessions[inviteCode] = activeSessions[inviteCode].filter(
          (user) => user !== socket.username
      
        );*/
        console.log("reached updatePlayerList on 358")
        io.to(inviteCode).emit("updatePlayerList", Array.from(activeSessions[inviteCode].get("users").keys()) );
        try {
          const session = await Session.findOne({ inviteCode });
          if(session && session.players.has(socket.username)){
              console.log("session.players type:", typeof session.players)
              session.players.delete(socket.username)
              
              await session.save();
              if (session.players.size === 0) {
                console.log("about to delete session from DB")
                await Session.findOneAndDelete({ inviteCode: inviteCode });
              }
              // session.players = session.players.filter((player)=> player!==socket.username);
          
          }
    
          console.log("A user disconnected");
        }
        catch (error) {
          console.error("Error disconnecting from room:", error);
          socket.emit("errorMessage", "An error occurred while disconnecting from the room.");
        }
      }

    });
    
    
  });
  //})
  
});





server.listen(port, () => {
  console.log(`Server is running on port ${port}`);


});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function authenticateToken(req, res, next) {
  console.log("cookies received in authentication:", req.cookies);
  // First check if cookies even exist. Redrect to login page in this case (placeholder for now)
  if (!req.cookies || Object.keys(req.cookies).length === 0) {
    req.user = null;
    next()
    return
    //return res.redirect('/login')


    //return res.sendStatus(401);
  }

  
  // Get the access token stored in cookie storage
  let token = req.cookies.hasOwnProperty("jwt") ? req.cookies.jwt : null;
  console.log("OLD TOKEN:", token)

  if (!token || token === "") {
    // LOGIC FOR MISSING ACCESS TOKEN
    console.log("reached")

    // Get the refresh token stored in cookie storage
    refreshToken = req.cookies.hasOwnProperty("refreshToken") ? req.cookies.refreshToken : null;
    console.log("REFRESH TOKEN:", refreshToken)

    // If refresh token is missing, sign the user out (have placeholder for now)
    // Next time when they log in, both the refresh token and the access token will be renewed.
    if (!refreshToken) {
      // TODO: redirect to login page
      console.log("no refresh token")
      req.user = null;
      next();
      return
      //return res.redirect("/login")
      //res.sendStatus(401);
    }


    // At this point, there is a refresh token stored in cookie storage.
    // Implement logic to use the refresh token to generate a new access token.

    const refreshTokenResult = verifyRefreshToken(refreshToken) // First, verify the authenticity of the refresh token
    if (!refreshTokenResult.success) {
      console.log("THE REFRESH TOKEN IS INVALID")
      req.user = null;
      next();
      return
      //return res.redirect("/login")
      //return res.status(403).json({ error: refreshTokenResult.error });
    }
    
    // Get the decoded user data from the valid refresh token and use it to generate a new access token, storing it in cookie storage.
    const user = refreshTokenResult.data;
    token = generateAccessToken(user);
    res.cookie("jwt", token, {
      httpOnly: true, // Prevents JavaScript access to cookies
      secure: true,   // Use secure cookies (only HTTPS) in production
      sameSite: "strict", // Helps prevent CSRF attacks
      maxAge: 20000    // Cookie expiration set to 20 seconds
    });
    console.log("NEW TOKEN:", token)
    
  }

  // Proceed with verifying authenticity of access token
  const verifyTokenResult = verifyAccessToken(token);

  if (!verifyTokenResult.success) {
    req.user = null;
    next();
    return
    //return res.redirect("/login")
    //return res.status(403).json({ error: verifyTokenResult.error });
  }

  

  // Append decoded user data to response header (to use in the future for profile page for example)
  req.user = verifyTokenResult.data;
  // Proceed with route logic
  next();
  
}

run().catch(console.dir);

