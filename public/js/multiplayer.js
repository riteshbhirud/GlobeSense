const socket = io("http://127.0.0.1:5550");
const startMultiplayerGame = document.getElementById("startMultiplayerGame")
const urlParams = new URL(window.location.href);
const submitBtn = document.getElementById("submit")
const gameDiv = document.getElementById("gameDiv")
const lobbyDiv = document.getElementById("lobbyDiv")
const endingDiv = document.getElementById("endingDiv")
let map;
let panorama;
let sec = 300;
let timeLimit = 300;
let maxDistance = 10200;
let GameOver = false;
let marker;
let ActualLocationMarker;

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
    console.log("Logged-in user front end", data.user);

    //socket.username = data.user.username; // Set the socket username
    //console.log("Setting socket username to:", socket.username);
    socket.emit("joinRoom", { inviteCode: inviteCode, username: data.user.username }); // Emit the joinRoom event
  } catch (error) {
    console.error("Error fetching user", error);
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
      clearInterval(timer);
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

alert(`${socket.username} has joined room ${inviteCode}`);

const playerListDiv = document.getElementById("playerList");
const disconnectForm = document.getElementById("disconnectForm")




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

  console.log( players)
  
  playerListDiv.innerHTML = Array.from(Object.keys(players)).map((player) => `<p>${player}</p>`).join("");
});

socket.on("gameStarted", ({latitude, longitude, musicUrl}) => {
  console.log(latitude)
  console.log(longitude)
  console.log(musicUrl)
  //alert(`lat: ${latitude}, long: ${longitude}, music: ${musicUrl}`)
  


  // set background music
  music.src = musicUrl;
  //music.type = "audio/mpeg";
  music.autoplay = true;
  music.loop = true;

  // set display of gameDiv to "block"
  lobbyDiv.style.display = "none";
  gameDiv.style.display = "block";
  endingDiv.style.display = "none";
  
  // Initialize the pano with given coordinates
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

  window.initialize = initialize
  initialize(parseFloat(latitude), parseFloat(longitude));
  //set the resetLocation Btn
  document.getElementById('resetLocationButton').style.display = "block";
  document.getElementById("resetLocationButton").addEventListener("click", ()=>{
    initialize(latitude,longitude);
  })
  // Start timer
  timer1();

  // Initialize leaflet map



  map = L.map('map').setView([20, 0], 2); // World view with center at [20, 0] and zoom level 2
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
  

  document.getElementById('parentMap').addEventListener('mouseenter', function () {
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


  });

    document.getElementById('parentMap').addEventListener('mouseleave', function () {
      // Hide the button and revert properties
      if (!GameOver) {
        submitBtn.style.width = '280px';
        document.getElementById('map').style.width = '300px';
        document.getElementById('map').style.height = '200px';
        //submitBtn.style.display = 'block';
      }




      /*submitBtn.style.bottom = '6220px'; //Random out of screen coordinates
      submitBtn.style.left = '1100px';*/

    })



    map.on('click', function (e) {
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


    submitBtn.addEventListener("click", () => {
      clearInterval(timer);
      endGame();
    })

    //SpacebarAnswer

    document.addEventListener("keydown", (event) => {
      if (event.key === " ") {
        //add later
      }
    })
  


  // Set display of lobbyDiv to none
 
  

});

submitBtn.addEventListener("click",(e)=>{
  // Calculate number of points
  // Pause the player's timer
  // Get elapsed time
  // Emit a message to server with guessed coordinates + points

})


socket.on("roundStatsCollected", (/* stats of all players (distance from target, points of each player) */ ) => {
  // round end logic
  // set display of gameDiv to none
  // set display of endingDiv to block
  
})

socket.on("errorMessage", (message) => {
  alert(message);
});

if (startMultiplayerGame) {
  startMultiplayerGame.addEventListener("click", (e) => {
    console.log("INSIDE EVENTLISTENER")
    socket.emit("startGame", inviteCode)
  })
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
})