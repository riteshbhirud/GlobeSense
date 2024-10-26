
let latitude;
let longitude;
let retryCount = 0;
const maxRetries = 20;


let music;
let userLat = 0;
let userLong = 0;
const submitBtn = document.getElementById("submit");
const para = document.getElementById("paragraph");
const gameDisplay = document.getElementById("gameDisplay");
const gameOverScreen = document.getElementById("gameOverScreen")
let GameOver = false;
let marker;
let ActualLocationMarker;
var latlng;
let  streetViewStatus= false;
let songName;
let artistName;
var timer;
const parentMap = document.getElementById("parentMap");
//const map = document.getElementById("map");
let map;
let panorama;

function timer1() {
  console.log("TIMER FUNCTION BEING CALLED")
  var sec = 300;
  timer = setInterval(function () {
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

let encodedCountry;
let url;

cities = [
  // Existing Airports
  {
    "latitude": 51.503897,
    "longitude": 0.049631
  },
  {
    "latitude": 19.096821,
    "longitude": 72.875406
  },
  {
    "latitude": 33.9416,
    "longitude": -118.4085
  },
  {
    "latitude": 51.4700,
    "longitude": -0.4543
  },
  {
    "latitude": 35.5494,
    "longitude": 139.7798
  },
  {
    "latitude": 25.2532,
    "longitude": 55.3657
  },
  {
    "latitude": 50.0379,
    "longitude": 8.5622
  },
  {
    "latitude": 1.3644,
    "longitude": 103.9915
  },
  {
    "latitude": 40.6413,
    "longitude": -73.7781
  },
  {
    "latitude": 49.0097,
    "longitude": 2.5479
  },
  {
    "latitude": -33.9399,
    "longitude": 151.1753
  },
  {
    "latitude": 22.3080,
    "longitude": 113.9185
  },
  
  // Additional Major Airports
  {
    "latitude": 35.2140,
    "longitude": -80.9431 // Charlotte Douglas International Airport
  },
  {
    "latitude": -22.8090,
    "longitude": -43.2506 // Galeão International Airport, Rio de Janeiro
  },
  {
    "latitude": -34.8222,
    "longitude": -58.5358 // Ezeiza International Airport, Buenos Aires
  },
  {
    "latitude": 35.2140,
    "longitude": -80.9431 // Charlotte Douglas International Airport
  },
  {
    "latitude": -22.8100,
    "longitude": -43.2499 // São Paulo–Guarulhos International Airport
  },


  // Major Subway/Railway Stations
  {
    "latitude": 48.8763,
    "longitude": 2.3554 // Gare du Nord, Paris
  },
  {
    "latitude": 40.7506,
    "longitude": -73.9935 // Penn Station, New York
  },
  {
    "latitude": 35.6814,
    "longitude": 139.7670 // Tokyo Station, Japan
  },
  {
    "latitude": 31.2324,
    "longitude": 121.4692 // Shanghai Hongqiao Railway Station, China
  },
  {
    "latitude": 55.7766,
    "longitude": 37.6569 // Leningradsky Station, Moscow
  }]



//const boundingBoxApiUrl = `https://nominatim.openstreetmap.org/search?q=${city}&format=json&polygon_threshold=10&polygon_geojson=1&addressdetails=1`


//import {OPENCAGE_API_KEY, GEOCODE_API_KEY, GOOGLE_API_KEY, JAMENDO_CLIENT_ID} from "./config.js";

const OPENCAGE_API_KEY = "7a884e24cd134e77a00bf0317cef614e";
const GEOCODE_API_KEY = "66f86f9209ead753863632rmq2d6726";
const GOOGLE_API_KEY = "AIzaSyAOB3wAcUOx_wjfd5KCApjhj-TYxJEd924";
const JAMENDO_CLIENT_ID = "3d25d527";

const openCageAPIKey = OPENCAGE_API_KEY;
const geocodeAPIKey = GEOCODE_API_KEY;
const googleAPIKey = GOOGLE_API_KEY;
const jamendoClientID = JAMENDO_CLIENT_ID;


//const googleMapsAPIScriptObj = document.getElementById("google-maps-js-api");
//googleMapsAPIScriptObj.src = `https://maps.googleapis.com/maps/api/js?key=${googleAPIKey}&callback=initialize&loading=async&v=weekly`;


// Get a random set of coordinates using getRandomCoordinates.
// Pass those coordinates to the OpenCage Geocoding API to get coordinates of nearest road. Keep retrying until a result is found.
// get the country name from the coordinates found
// Pass the country name to the Google Street View API to get a panorama

// Utility function to wait for a specified amount of time
// Utility function to wait for a specified amount of time
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



async function setCoordinates() {
  console.log("CALLING FETCH COUNTRY FUNCTION")
  if (retryCount >= maxRetries) {
    console.error('Max retry limit reached. Stopping further attempts.');
    return null;
  }

  let city = cities[Math.floor(Math.random() * cities.length)]
  latitude = city.latitude;
  longitude = city.longitude;




  retryCount++;
  /*const coordinates = {
    latitude:city.latitude,
    longitude:72.875406
  }*/
  //const coordinates = await getRandomCoordinates();
  //console.log("setCoordinates coordinates", coordinates);
  //latitude = coordinates.latitude;
  //longitude = coordinates.longitude;

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
      document.getElementById("timer").style.display = "block";
      initialize(parseFloat(latitude), parseFloat(longitude));
      timer1();
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

  return null; // Fallback in case of an unexpected failure
}


async function startProcess() {
  console.log("CALLING START PROCESS FUNCTION")
  const country = await setCoordinates();
  console.log(country)
  //if (country) {
    encodedCountry = encodeURIComponent(country);
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
        console.log("JAMENDO NOT FOUND, BACKUP RADIO IN USE")
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

      console.log("reached");
      music = document.createElement("audio");
      music.id = "background-audio"
      music.src = url;
      music.currentTime = 50;//starts at 50 secs
      music.innerHTML = "Your browser does not support the audio element.";
      //music.type = "audio/mpeg";
      music.autoplay = true;
      music.loop = true;



      /*if (data.length > 0) {
        let url = data[0].url_resolved;
        console.log(url);
        music.src = url;
      } else {
        console.warn('No stations found for the selected country.');
      }*/
    } catch (error) {
      console.error('Music Fetch error:', error);
    }
  //}
}

// Start the process by fetching the country and then the music

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

  // If 'map' is defined elsewhere in your code
  // map.setStreetView(panorama);
}


// Start the process by fetching the country
/*let chosenCountry = setCoordinates();
chosenCountry = encodeURIComponent(chosenCountry);
console.log("LASTcountry:", chosenCountry);*/

window.initialize = initialize;

async function startProcessRadio() {
  console.log("BACKUP RADIO BEING USED")

  const musicApiUrl = `https://de1.api.radio-browser.info/json/stations/search?country=${encodedCountry}&limit=1`;

  try {
    const response = await fetch(musicApiUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    if (data.length > 0) {
      url = data[0].url_resolved;
      console.log(url);
      music.src = url;
    } else {
      console.warn('No stations found for the selected country.');
    }
  } catch (error) {
    console.error('Music Fetch error:', error);
  }
}

startProcess();
getLoading();


// Wait for the document to fully load before initializing the Leaflet map
document.addEventListener("DOMContentLoaded", function () {
  
  // Initialize Leaflet map 
  console.log("reachedreachedreached")
  map = L.map('map').setView([20, 0], 2); // World view with center at [20, 0] and zoom level 2
  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmJoaXJ1ZCIsImEiOiJjbTF1NzZ3NDMwYTBtMmpxMzFsc25zcWI3In0.D0zCMdlhuyKVDAWG3zydKA', {
    attribution: '© Mapbox © OpenStreetMap',
    tileSize: 512,
    zoomOffset: -1,
    maxZoom: 18
  }).addTo(map);

  /*L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
     attribution: '© OpenStreetMap contributors'
   }).addTo(map);*/
  document.getElementById('parentMap').addEventListener('mouseenter', function () {
    if (!GameOver) {
      document.getElementById('map').style.width = '600px';
      document.getElementById('map').style.height = '400px';
      submitBtn.style.display = 'block';





      setTimeout(function () {
        map.invalidateSize();
      }, 100);
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

  });



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
      clearInterval(timer);
      endGame();
    }
  })

  //loading screen


});

function getLoading(){
  console.log("GETLOADING CALLED!")
  const checkStreetViewStatus = setInterval(() => {
    if (streetViewStatus) {
        document.getElementById("loop").style.display = 'none';
        document.getElementById("bike-wrapper").style.display = 'none';
        document.getElementById("map").style.display= 'block';
        setTimeout(function() {
          map.invalidateSize(); 
      }, 100); 

        document.getElementById("pano").style.display = 'block';

        clearInterval(checkStreetViewStatus);
    }
  }, 100); 
  
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



function endGame() {
  //alert(`You Picked Lat: ${userLat}, Long: ${userLong}`);
  GameOver = true;
  document.getElementById('timer').style.display = "none";
  let userdistance = haversineDistance(latitude, longitude, userLat, userLong);
  if(marker){
    document.getElementById('Distance').innerHTML = `You were ${userdistance} miles off!`;
  }else{
    document.getElementById('Distance').innerHTML = `No pin placed!`;
    
  }
  document.getElementById('songName').innerHTML = `Song: '${songName}' by '${artistName}'`;
  console.log(document.getElementById('songName').innerHTML);
  //alert(`You were ${userdistance} miles off`);

  document.getElementById("pano").style.display = 'None';
  submitBtn.style.display = "None";
  gameOverScreen.style.display = "block";
  document.getElementById('map').style.width = "60%";
  document.getElementById('map').style.height = "45%";
  document.getElementById('map').style.bottom = "50%";
  document.getElementById('map').style.top = "30%";
  document.getElementById('map').style.right = "20.5%";

  //document.getElementById('map').style.left = "50%";



  ActualLatLong = {
    lat: latitude,
    lng: longitude
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

  map.removeLayer(marker);
  console.log("SECOND LATLNG: ", latlng);
  marker = L.marker(latlng).addTo(map);
}

document.getElementById('playAgain').addEventListener('click', async () => {
  map = map.setView([20, 0], 2);
  music.src = null;
  streetViewStatus= false;
  document.getElementById('bike-wrapper').style.display = "block";
  document.getElementById('loop').style.display = "block";
  
  getLoading();

  // Clear map

  map.removeLayer(ActualLocationMarker);
  ActualLocationMarker = null;
  if(marker){
    map.removeLayer(marker);
  }

  marker = null;

  // Hide the ending screen (gameOverScreen)

  document.getElementById('gameOverScreen').style.display = "none"
  // show pano

  document.getElementById("pano").style.display = 'block';
  // set gameover to false

  GameOver = false;

  // move the minimap back into the correct position
  document.getElementById('map').style.bottom = "50px";
  document.getElementById('map').style.right = "20px";
  document.getElementById('map').style.top = null;
  document.getElementById('map').style.width = "300px";
  document.getElementById('map').style.height = "200px";
  document.getElementById('map').style.display = "none";

  // Hide the pano (one-second image of previous location)
  document.getElementById('pano').style.display = "none";
  // move minimap back to bottom left corner

  // document.getElementById("pano").innerHTML = "";
  panorama = null;
  //startProcess()
  startProcess();
})





