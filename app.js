
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
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
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

app.get('/', csrfProtection, (req, res) => {
    //res.clearCookie('_csrf', { path: '/' });
    csrfToken = req.csrfToken()
    console.log("CURRENT USER:", require('./routes/user').getUser());
    if (require('./routes/user').getUser()) {
      console.log("CSRF Token inserted into logout form:", csrfToken)
    }
    res.render("home", {
      user: require('./routes/user').getUser(),
      csrf_token: csrfToken
    })
    //res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/test', (req, res) => {
    res.send("Test message");
});

app.get('/game', authenticateToken, csrfProtection, (req, res) => {

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
  res.sendFile(path.join(__dirname, 'views', 'createRoom.html'));
})

app.get('/join', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'joinRoom.html'));

  
})


app.get('/join/:gameId', authenticateToken, async (req, res) => {
  gameId = req.params.gameId
  
  // check if game id exists in DB
  try {

    const gameSession = await Session.findOne({ inviteCode: gameId });
    // check if active
    if(gameSession){
      if(gameSession.active === false){
      
        //res.json({username: require('./routes/user').getUser().username, gameId: gameId})
        res.sendFile(path.join(__dirname, 'views', 'multiplayerGame.html'));
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




const activeSessions = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle joining a room
  socket.on("joinRoom", async ({ inviteCode }) => {
    try {
      const session = await Session.findOne({ inviteCode:inviteCode  });

      if (!session) {
        socket.emit("errorMessage", "Invalid invite code. Please check and try again.");
        return;
      }
      user = require('./routes/user').getUser()
      if (!user) {
        socket.emit("errorMessage", "Invalid User");
        return;
      }
      let username = user.username
      socket.username = username;


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
      }
      if (!activeSessions[inviteCode].has(username)) {
        activeSessions[inviteCode][username]= 5000;
      }

      socket.join(inviteCode);
      io.to(inviteCode).emit("updatePlayerList", activeSessions[inviteCode]);

      console.log(`User ${username} joined room ${inviteCode}`);

      socket.emit('get-username',socket.username)
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("errorMessage", "An error occurred while joining the room.");
    }
  });

  // Handle disconnection
  ["disconnecting", "manualDisconnect"].forEach((event) => {
    socket.on(event, async () => {
      console.log(event)
    
      const rooms = Array.from(socket.rooms).slice(1); // Get rooms the user is in
      //if activeSessions[inviteCode].has(username)
      rooms.forEach( async (inviteCode) => {
        if (activeSessions[inviteCode]) {
          if(activeSessions[inviteCode].has(socket.username)){
            activeSessions[inviteCode].delete(socket.username)
          }
          /*activeSessions[inviteCode] = activeSessions[inviteCode].filter(
            (user) => user !== socket.username
        
          );*/
          io.to(inviteCode).emit("updatePlayerList", activeSessions[inviteCode] );
          try {
            const session = await Session.findOne({ inviteCode });
            if(session && session.players.has(socket.username)){
                session.players.delete(socket.username)
               // session.players = session.players.filter((player)=> player!==socket.username);
                await session.save();
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
  })
  
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
  // First check if cookies even exist. Redrect to login page in this case (placeholder for now)
  if (!req.cookies || Object.keys(req.cookies).length === 0) {

    return res.redirect('/login')


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

    // If refresh token is missing, sign the user out (have placeholder for now)
    // Next time when they log in, both the refresh token and the access token will be renewed.
    if (!refreshToken) {
      // TODO: redirect to login page
      return res.redirect("/login")
      //res.sendStatus(401);
    }


    // At this point, there is a refresh token stored in cookie storage.
    // Implement logic to use the refresh token to generate a new access token.

    const refreshTokenResult = verifyRefreshToken(refreshToken) // First, verify the authenticity of the refresh token
    if (!refreshTokenResult.success) {
      console.log("THE REFRESH TOKEN IS INVALID")
      return res.redirect("/login")
      //return res.status(403).json({ error: refreshTokenResult.error });
    }
    
    // Get the decoded user data from the valid refresh token and use it to generate a new access token, storing it in cookie storage.
    const user = refreshTokenResult.data;
    token = generateAccessToken(user);
    console.log("NEW TOKEN:", token)
    res.cookie("jwt", token, {
      httpOnly: true, // Prevents JavaScript access to cookies
      secure: true,   // Use secure cookies (only HTTPS) in production
      sameSite: "strict", // Helps prevent CSRF attacks
      maxAge: 20000    // Cookie expiration set to 20 seconds
    });
  }

  // Proceed with verifying authenticity of access token
  const verifyTokenResult = verifyAccessToken(token);

  if (!verifyTokenResult.success) {
    return res.redirect("/login")
    //return res.status(403).json({ error: verifyTokenResult.error });
  }

  // Append decoded user data to response header (to use in the future for profile page for example)
  req.user = verifyTokenResult.data;
  // Proceed with route logic
  next();
  
}

run().catch(console.dir);

