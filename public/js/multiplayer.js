//const socket = io("http://127.0.0.1:5550");
const socket = io("https://www.globesense.tech");
const startMultiplayerGame = document.getElementById("startMultiplayerGame")
const urlParams = new URL(window.location.href);
const submitBtn = document.getElementById("submit")
const gameDiv = document.getElementById("gameDiv")
const lobbyDiv = document.getElementById("lobbyDiv")
const endingDiv = document.getElementById("endingDiv")
const parentMap = document.getElementById("parentMap");
const eliminationRoom = document.getElementById("eliminationRoom")
const leaderboardDiv = document.getElementById("leaderboard")
const lobbyHeading = document.getElementById("page-title")
let map;
let panorama;
let sec = 300;
let timeLimit = 300;
let maxDistance = 10200;
let GameOver = false;
let marker;
let ActualLocationMarker;
let userLat;
let userLong;
let userPoints;
let actualLatitude;
let actualLongitude;
var timer;
let userId;
let inviteCode = urlParams.pathname.split('/').pop()
console.log("Invite Code", inviteCode)

document.addEventListener("DOMContentLoaded", ()=>{
  console.log("dom content loaded")

async function fetchUserAndJoinRoom(inviteCode) {
  try {
    const response = await fetch("/api/user", {
      method: "GET",
      credentials: "include", // Ensures cookies are sent with the request
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    const data = await response.json(); // Parse the JSON response
    userId = data.user.username
    console.log("Logged-in user front end", data.user);
    console.log("Logged-in user front end", data.user.username);
    lobbyHeading.style.display = "block"
    lobbyHeading.textContent = `${userId}'s Room`
    //socket.username = data.user.username; // Set the socket username
    //console.log("Setting socket username to:", socket.username);
    socket.emit("joinRoom", { inviteCode: inviteCode, username: data.user.username }); // Emit the joinRoom event
  } catch (error) {
    console.error("Error fetching user", error);
  }
}

async function fetchUser(){
  try {
    console.log("about to fetch user")
    const response = await fetch("/api/user", {
      method: "GET",
      credentials: "include", // Ensures cookies are sent with the request
    });
    console.log("finished fetching user")
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    data = await response.json()
    return data ? data.user.username: null;

  } catch (error) {
    return null;
  }
}

function timer1() {
  console.log("TIMER FUNCTION BEING CALLED")
  sec = timeLimit;
  /*document.getElementById('nav').style.setProperty("--navAnimationTime", `${15 * sec/300}s`);
  navElement.style.animation = "gradientAnimation var(--navAnimationTime) ease infinite";*/
  timer = setInterval(function () {

    /*let navAnimationTime = 15 * sec/300;

    if(navAnimationTime<2){
      navAnimationTime=2;
    }
    
    //document.getElementById('nav').style.setProperty("--navAnimationTime", `${navAnimationTime}s`);
    if(sec<=10){
      //document.getElementById('nav').style.backgroundImage = "linear-gradient(135deg, #9d50bb, #ff0080)"
      document.getElementById('nav').style.setProperty("--navAnimationTime", `1s`);
      nav.style.background = "linear-gradient(135deg, #9d50bb, #ff0080)";
      nav.style.backgroundSize = "400% 400%"; 
      
    }/*else{
      document.getElementById('nav').style.setProperty("--navAnimationTime", `${navAnimationTime}s`);
      
    }*/
   
    
    let minutes = Math.floor(sec / 60)
    let seconds = sec - minutes * 60
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    document.getElementById('timer').innerHTML = `${minutes}:${seconds}`;
    sec--;
    if (sec < 0) {
      //clearInterval(timer);
      console.log("end game called from timer")
      endGame();

    }
  }, 1000);
}

/*async function getUsername() {
  return new Promise((resolve) => {
    socket.on("get-username", (username) => {
      socket.username = username;
      console.log("USERNAME FROM ON", username);
      console.log("USERNAME FROM ON", socket.username);
      resolve(username); // Resolve the promise with the username
    });
  });
}

(async () => {
  const username = await getUsername(); // Wait for the username to be resolved
  console.log("OUTSIDE", username);*/
  // Ensure the alert is executed after username is fetched

fetchUserAndJoinRoom(inviteCode);

const playerListDiv = document.getElementById("playerList");
const disconnectForm = document.getElementById("disconnectForm")



console.log("beginning")
endingDiv.style.display = "none";

music = document.getElementById("background-audio");
music.muted = true;
music.play()
  .then(() => {
    music.muted = false; // Unmute the audio once it's playing
  })
  .catch(error => {
    console.error("Autoplay failed:", error);
  });

socket.on("updatePlayerList", (players) => {

  console.log("PLAYERS:", players)
  output = ""
  players.forEach((player) => output += `<p>${player}</p>`)
  playerListDiv.innerHTML = output

});

socket.on("gameStarted", async ({latitude, longitude, musicUrl, playerData}) => {
  console.log("IN GAMESTARTED SOCKET LISTENER")

  if(map){
    clearAllMarkers();
  }
  


  GameOver = false;
  submitBtn.style.width = "280px"
  actualLatitude = latitude
  actualLongitude = longitude
  console.log(latitude)
  console.log(longitude)
  console.log(musicUrl)
  
  console.log("PlayerData",playerData)
  let username = await fetchUser();
  if(!playerData[username]){
    alert("Error fetching user! ")
  }
  console.log("username in gamestarted:", username)
  console.log("points:", playerData[username].points)
  console.log("type of points:", typeof playerData[username].points)
   
  isEliminated = playerData[username].points <= 0
  console.log(`user: ${username}, ${isEliminated}`)
  if (isEliminated) {
    alert("GOING TO ELIMINATION ROOM!")
    parentMap.style.display = "none";
    gameDiv.style.display = "none";
    eliminationRoom.style.display = "block";
  } else {
    sec = 300
    document.getElementById('timer').style.display = "block"
    // set background music
    music.src = musicUrl;
    //music.type = "audio/mpeg";
    music.autoplay = true;
    music.loop = true;
    
    // set display of gameDiv to "block"
    lobbyHeading.style.display = "none"
    lobbyDiv.style.display = "none";
    gameDiv.style.display = "block";    
    endingDiv.style.display = "none";
    parentMap.style.display = "block";

    // move the minimap back into the correct position
    submitBtn.style.display = "block";
    document.getElementById('map').style.bottom = "50px";
    document.getElementById('map').style.right = "20px";
    document.getElementById('map').style.top = null;
    document.getElementById('map').style.width = "300px";
    document.getElementById('map').style.height = "200px";

    
    // Initialize the pano with given coordinates
    

    window.initialize = initialize

    initialize(parseFloat(latitude), parseFloat(longitude));
    //set the resetLocation Btn
    document.getElementById('resetLocationButton').style.display = "block";
    const boundInitialize = initialize.bind(null, latitude, longitude);
    document.getElementById("resetLocationButton").removeEventListener("click", boundInitialize)
    document.getElementById("resetLocationButton").addEventListener("click", boundInitialize);
    // Start timer
    timer1();

    // Initialize leaflet map
    

    if(!map){
      map = L.map('map').setView([20, 0], 2); // World view with center at [20, 0] and zoom level 2
    }else{
      map = map.setView([20, 0], 2);
    }
  
    /*L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmJoaXJ1ZCIsImEiOiJjbTF1NzZ3NDMwYTBtMmpxMzFsc25zcWI3In0.D0zCMdlhuyKVDAWG3zydKA', {
      attribution: '© Mapbox © OpenStreetMap',
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 18
    }).addTo(map);*/

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    document.getElementById('parentMap').removeEventListener('mouseenter', expandMinimap);
    document.getElementById('parentMap').removeEventListener('mouseleave', minimizeMinimap);
    

    document.getElementById('parentMap').addEventListener('mouseenter', expandMinimap);
    document.getElementById('parentMap').addEventListener('mouseleave', minimizeMinimap);

    map.off("click");

    map.on('click', function (e) {
      e.originalEvent.stopPropagation();
      if (!GameOver) {
        latlng = e.latlng;

        if (marker) {
          map.removeLayer(marker);
        }

        marker = L.marker(latlng).addTo(map);

        userLat = latlng.lat;
        userLong = latlng.lng;
        console.log(`Lat:${userLat}, Long:${userLong}`)
        //console.log("Coordinates: " + latlng.lat + ", " + latlng.lng); // Log coordinates to console
        //alert("Coordinates: " + latlng.lat + ", " + latlng.lng); // Show coordinates in an alert
      }
    });
      //ClickAnswer
      
    submitBtn.removeEventListener("click", endGame);
    submitBtn.addEventListener("click", endGame);

      //SpacebarAnswer

      /*document.addEventListener("keydown", (event) => {
        if (event.key === " ") {
          //add later
        }
      })*/
    


    // Set display of lobbyDiv to none
  
  } 

});

function endGame() {
  // Calculate number of points
  // Get elapsed time
   
  //alert(`You Picked Lat: ${userLat}, Long: ${userLong}`);
  GameOver = true;
  clearInterval(timer);
  document.getElementById('timer').style.display = "none";
  document.getElementById('resetLocationButton').style.display = "none";
  submitBtn.style.display = "none";

  let userdistance = Math.round(haversineDistance(actualLatitude, actualLongitude, userLat, userLong)) 



  /*Total pts = points * time

  points = Max Points *( 1 - Distance/Max Distance)

  FINAL SCORE = Max Points *( 1 - Distance/Max Distance) * (1+ (Time Limit - Time Taken)/Time Limit)*/ 


  //userPoints = Math.floor(5000 * (.7* -Math.exp(.2*(userdistance/maxDistance))+ .3*-Math.exp(.07*(sec)/timeLimit)))


  let timeBonus;
  let elapsedTime = timeLimit - sec;
  if( (timeLimit - sec) <= 20 ) {
    timeBonus = 5000 * 0.02
  }

  else if ( (timeLimit - sec) <= 60 ) {
    timeBonus = 5000 * 0.02 * 0.7
  }

  else if ( (timeLimit - sec) <= 120 ) {
    timeBonus = 5000 * 0.02 * 0.35
  }

  else {
    timeBonus = 0
  }

  console.log(`DISTANCE SCORE: ${(5000* (-1/(1+ Math.exp(-15 * (userdistance/maxDistance -.5)))+1)*0.98 + timeBonus)}`)
  console.log(timeBonus)
  
  if(userdistance>=7500){
    userPoints = timeBonus
  }else{
    userPoints = Math.floor(5000* (-1.1/(1+ Math.exp(-10.8 * (userdistance/maxDistance -.2)))+1.11)*0.98 + timeBonus) 
  }


  //userPoints = Math.floor(5000 * (1.1 + ( -.1 * Math.exp( 2.39 * ( userdistance/maxDistance)  ) ) ) * 0.98 + timeBonus)
  // Distance component: y= ( -1 / ( 1 + Math.exp( -10.3 * (x-0.5) ) ) ) + 1
  
  
  if(userPoints>=4980){
    userPoints= 5000;
  }

  // Emit a message to server with guessed coordinates + points + userdistance + timetaken
  socket.emit("iAmDone", {inviteCode: inviteCode, userGuess: [userLat, userLong], userPoints: userPoints, userdistance: userdistance, elapsedTime: elapsedTime})

  // Increase transparency of game page and overlay "waiting..." message on top
  
  

   

}

function haversineDistance(lat1, lon1, lat2, lon2) {

  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  const R = 3959;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in miles
  const distance = R * c;

  return distance;
}
const readyUpBtns = document.querySelectorAll(".readyUp")
readyUpBtns.forEach(button=>{
  button.removeEventListener("click", startGame)
  button.addEventListener("click", startGame)

})

socket.on("roundStatsCollected", async (data) => {
  
  readyUpBtns.forEach(button=>{

    button.disabled = false;
  
  })
  clearAllMarkers();

  // Initialize Leaflet Map
  document.getElementById('map').style.display = "block"
  parentMap.style.display = "block";
  // Move it to proper location in center of screen and resize
  document.getElementById('map').style.width = "60%";
  document.getElementById('map').style.height = "45%";
  document.getElementById('map').style.bottom = "50%";
  document.getElementById('map').style.top = "30%";
  document.getElementById('map').style.right = "20.5%";
  
  // Show actual location marker on map (red marker)
  ActualLatLong = {
    lat: actualLatitude,
    lng: actualLongitude
  }
  //Set up red point mark to mark the actual location
  var redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
    shadowSize: [41, 41]
  });
  ActualLocationMarker = L.marker(ActualLatLong, { icon: redIcon }).addTo(map);
  //marker = L.marker(latlng).addTo(map);


  //{eliminatedUsers, roundData}
  eliminatedUsers = data.eliminatedUsers
  roundData = data.roundData
  playingUsers = data.playingUsers;
  console.log("PlayingUsers", playingUsers)
  if (playingUsers.length === 1) {
    alert(`${playingUsers[0]} won the game!`)
    readyUpBtns.forEach(button=>{
      button.style.display = "none";
    })
    
    document.getElementById("showGameOver").style.display = "block"
    document.getElementById("showGameOver").addEventListener("click", () => {
      endingDiv.style.display = "none";
      document.getElementById("gameOverDiv").style.display = "block";
      parentMap.style.display = "none"
    })
    document.getElementById("gameOverDiv").innerHTML += `${playingUsers[0]} won the game with ${roundData[playingUsers[0]].points}.`


  }
  console.log("DATA:", data)
  console.log("elimusers:", eliminatedUsers)
  console.log("rounddata:", roundData)
  // round end logic
  // set display of gameDiv to none
  
  //parentMap.style.display = "none";
  gameDiv.style.display = "none"
  eliminationRoom.style.display = "none";
  
  music.src = ""
  //{u1:{}, ...}
  // set display of endingDiv to block
  endingDiv.style.display = "block"
  console.log("elimUsertype",typeof eliminatedUsers)
  console.log("ELIMUSERSET DATA", eliminatedUsers)
  console.log("ROUND DATA:", roundData)
  // sort users by points for leaderboard
  //roundData = [...roundData.entries()].sort(([, a], [, b]) => b.get("points") - a.get("points")));
  roundData = Object.fromEntries(
    Object.entries(roundData).sort(([, a], [, b]) => b.points - a.points)
  );
  leaderboardDiv.innerHTML = "";
  
  for (const [username, userData] of Object.entries(roundData)) {
    console.log("USERNAMAE:", username)
    console.log("USERDATA:", userData)
    if (userData.points <= 0) { 
      if (username === await fetchUser()) {
        readyUpBtns.forEach(button=>{
          button.style.display = "none";
        })
      }
      
      if (eliminatedUsers.includes(username)) {
        latlng = {lat: userData.guess[0], lng: userData.guess[1]}
        L.marker(latlng).addTo(map);
        leaderboardDiv.innerHTML += `<p class="eliminated">${username}, Points: ${userData.points}, Distance: ${userData.distance}}</p>`
      }
    } else {
      latlng = {lat: userData.guess[0], lng: userData.guess[1]}
      L.marker(latlng).addTo(map);
      leaderboardDiv.innerHTML += `<p>${username}, Points: ${userData.points}, Distance: ${userData.distance}</p>`
    }
    
  }
  
  //const readyUp = document.getElementsByClassName("readyUp")

  
  //console.log("NEXT ROUND:", readyUp)
  /*if (readyUp) {
    console.log("next round reached")
    document.addEventListener("keydown", (e) => {
      if(e.key === " "){

      console.log("INSIDE readyUp EVENTLISTENER, about to start game")
      socket.emit("startGame", inviteCode)

      }

      //socket.emit("startGame", inviteCode)
     // clearAllMarkers();
    })
  }*/

  

  /*if (readyUpRound[0]) {
    console.log("next round reached")
    readyUpRound[0].removeEventListener("click", startGame)
    readyUpRound[0].addEventListener("click", startGame)
  }*/

  
})



socket.on("errorMessage", (message) => {
  alert(message);
});


function startGame(event) {
  console.log("StartGame Called from button")
  //console.log("INSIDE readyUp EVENTLISTENER, about to start game")
  event.target.disabled = true;
  socket.emit("iAmReady", {inviteCode: inviteCode})
  console.log(`IamReady emitted with code ${inviteCode}`)
}

function expandMinimap() {
  if (!GameOver) {
    document.getElementById('map').style.width = '600px';
    document.getElementById('map').style.height = '400px';
    submitBtn.style.display = 'block';

    setTimeout(function () {
      map.invalidateSize();
    }, 100);
    console.log("AFTER SETTIMEOUT JUST ABOU TO CHNGE BTN SIZE")
    submitBtn.style.display = 'block';
    submitBtn.style.bottom = '5px';
    submitBtn.style.right = '30px';
    submitBtn.style.width = '580px';
  }
}

function initialize(lat, lng) {
  const fenway = { lat: lat, lng: lng };

  panorama = new google.maps.StreetViewPanorama(
    document.getElementById("pano"),
    {
      position: fenway,
      pov: {
        heading: 34,
        pitch: 10,
      },
      disableDefaultUI: true,  // Disable default UI controls
      linksControl: false,     // Disable navigation arrows
      panControl: false,       // Disable panning control
      addressControl: false,   // Disable street address display
      showRoadLabels: false,   // Hide street name indications
    }
  );

}

function minimizeMinimap() {
  // Hide the button and revert properties
  if (!GameOver) {
    submitBtn.style.width = '280px';
    document.getElementById('map').style.width = '300px';
    document.getElementById('map').style.height = '200px';
    //submitBtn.style.display = 'block';
  }

  /*submitBtn.style.bottom = '6220px'; //Random out of screen coordinates
  submitBtn.style.left = '1100px';*/
}




/*disconnectForm.addEventListener("submit", (e) => {
  e.preventDefault();
  socket.emit("manualDisconnect");

  socket.on("updatePlayerList", (players) => {
    playerListDiv.innerHTML = players.map((player) => `<p>${player}</p>`).join("");
  });
  
  socket.on("errorMessage", (message) => {
    alert(message);
  });
})*/

  // Remove all existing markers from map
  function clearAllMarkers() {
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
  }

})