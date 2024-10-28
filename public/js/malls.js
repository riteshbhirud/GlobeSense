//const { get } = require("mongoose");

let latitude;
let longitude;
let retryCount = 0;
const maxRetries = 20;

let userPoints = 0;
let music;
let score;
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
let streetViewStatus = false;
let songName;
let artistName;

var timer;
const parentMap = document.getElementById("parentMap");
const navElement = document.getElementById('nav')
const body = document.getElementsByTagName('body')[0]
//const map = document.getElementById("map");
let map;
let panorama;
let sec = 300;
let timeLimit = 300;
let maxDistance = 10200;


function timer1() {
  console.log("TIMER FUNCTION BEING CALLED")
  sec = timeLimit;
  document.getElementById('nav').style.setProperty("--navAnimationTime", `${15 * sec / 300}s`);
  navElement.style.animation = "gradientAnimation var(--navAnimationTime) ease infinite";
  timer = setInterval(function () {

    let navAnimationTime = 15 * sec / 300;

    if (navAnimationTime < 2) {
      navAnimationTime = 2;
    }

    document.getElementById('nav').style.setProperty("--navAnimationTime", `${navAnimationTime}s`);
    if (sec <= 10) {
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

let encodedCountry;
let url;
cities = [
  {
    "latitude": 25.1985,
    "longitude": 55.2795 // The Dubai Mall, UAE
  },
  {
    "latitude": 1.3004,
    "longitude": 103.8454 // VivoCity, Singapore
  },
  {
    "latitude": 35.6946,
    "longitude": 139.7026 // Shibuya PARCO, Tokyo, Japan
  },
  {
    "latitude": 13.7466,
    "longitude": 100.5346 // Siam Paragon, Bangkok, Thailand
  },
  {
    "latitude": 33.5020,
    "longitude": -111.9261 // Scottsdale Fashion Square, Scottsdale, USA
  },
  {
    "latitude": 40.7580,
    "longitude": -73.9855 // Westfield World Trade Center, New York City, USA
  },
  {
    "latitude": 22.3053,
    "longitude": 114.1725 // Harbour City, Hong Kong
  },
  {
    "latitude": -33.8668,
    "longitude": 151.2093 // Westfield Sydney, Australia
  },
  {
    "latitude": 19.4337,
    "longitude": -99.1386 // Centro Santa Fe, Mexico City, Mexico
  },
  {
    "latitude": 37.7846,
    "longitude": -122.4069 // Westfield San Francisco Centre, San Francisco, USA
  },
  {
    "latitude": 41.0435,
    "longitude": 28.9896 // Istanbul Cevahir Mall, Istanbul, Turkey
  },
  {
    "latitude": 51.5145,
    "longitude": -0.1170 // Westfield London, London, UK
  },
  {
    "latitude": -23.5666,
    "longitude": -46.6485 // Shopping Cidade São Paulo, São Paulo, Brazil
  },
  {
    "latitude": 3.1579,
    "longitude": 101.7123 // Suria KLCC, Kuala Lumpur, Malaysia
  },
  {
    "latitude": -26.1341,
    "longitude": 28.0535 // Sandton City, Johannesburg, South Africa
  },
  {
    "latitude": 45.4642,
    "longitude": 9.1900 // Galleria Vittorio Emanuele II, Milan, Italy
  },
  {
    "latitude": 35.6586,
    "longitude": 139.7433 // Roppongi Hills, Tokyo, Japan
  },
  {
    "latitude": 21.0285,
    "longitude": 105.8542 // Vincom Mega Mall Royal City, Hanoi, Vietnam
  },
  {
    "latitude": -6.2245,
    "longitude": 106.8451 // Grand Indonesia, Jakarta, Indonesia
  },
  {
    "latitude": 25.0401,
    "longitude": 121.5645 // Taipei 101 Mall, Taipei, Taiwan
  },
  {
    "latitude": -8.6965,
    "longitude": 115.1675 // Discovery Shopping Mall, Bali, Indonesia
  },
  {
    "latitude": 39.9123,
    "longitude": 116.4108 // China World Mall, Beijing, China
  },
  {
    "latitude": 43.6677,
    "longitude": -79.3948 // Toronto Eaton Centre, Toronto, Canada
  },
  {
    "latitude": 34.0522,
    "longitude": -118.2437 // The Grove, Los Angeles, USA
  },
  {
    "latitude": 48.8566,
    "longitude": 2.3522 // Galeries Lafayette, Paris, France
  },
  {
    "latitude": 32.7157,
    "longitude": -117.1611 // Fashion Valley, San Diego, USA
  },
  {
    "latitude": 38.7072,
    "longitude": -9.1355 // Centro Colombo, Lisbon, Portugal
  }
]


//const boundingBoxApiUrl = `https://nominatim.openstreetmap.org/search?q=${city}&format=json&polygon_threshold=10&polygon_geojson=1&addressdetails=1`
//https://nominatim.openstreetmap.org/reverse?lat=40.730610&lon=-73.935242&format=json&zoom=10&addressdetails=1

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
  
  let place = cities[Math.floor(Math.random() * cities.length)]
  let country = await getCountry(place.latitude,place.longitude)
  console.log("CALLING FETCH COUNTRY FUNCTION")
  if (retryCount >= maxRetries) {
    console.error('Max retry limit reached. Stopping further attempts.');
    return null;
  }
  retryCount++;
  const coordinates = place;
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

    streetViewStatus = true;
      
    document.getElementById("timer").style.display = "block";
    initialize(parseFloat(latitude), parseFloat(longitude));
    timer1();
    return encodeURIComponent(country);
   
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

      console.log("reached");
      music = document.createElement("audio");
      music.id = "background-audio"
      music.src = url;
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
  }
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

function getLoading() {
  console.log("GETLOADING CALLED!")
  const checkStreetViewStatus = setInterval(() => {
    if (streetViewStatus) {
      document.getElementById("loop").style.display = 'none';
      document.getElementById("bike-wrapper").style.display = 'none';
      document.getElementById("map").style.display = 'block';
      setTimeout(function () {
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



async function endGame() {

  //alert(`You Picked Lat: ${userLat}, Long: ${userLong}`);
  GameOver = true;
  document.getElementById('timer').style.display = "none";
  let userdistance = Math.round(haversineDistance(latitude, longitude, userLat, userLong)) 
  /*Total pts = points * time

points = Max Points *( 1 - Distance/Max Distance)

FINAL SCORE = Max Points *( 1 - Distance/Max Distance) * (1+ (Time Limit - Time Taken)/Time Limit)*/


  //userPoints = Math.floor(5000 * (.7* -Math.exp(.2*(userdistance/maxDistance))+ .3*-Math.exp(.07*(sec)/timeLimit)))


  let timeBonus;
  if ((timeLimit - sec) <= 20) {
    timeBonus = 5000 * 0.02
  }

  else if ((timeLimit - sec) <= 60) {
    timeBonus = 5000 * 0.02 * 0.7
  }

  else if ((timeLimit - sec) <= 120) {
    timeBonus = 5000 * 0.02 * 0.35
  }

  else {
    timeBonus = 0
  }

  console.log(`TOTAL SCORE: ${userPoints = Math.floor(5000* (-1.1/(1+ Math.exp(-10.8 * (userdistance/maxDistance -.2)))+1.11)*0.98 + timeBonus)}`)
  console.log(timeBonus)

  if (userdistance >= 7500) {
    userPoints = timeBonus
  } else {
    userPoints = Math.floor(5000* (-1.1/(1+ Math.exp(-10.8 * (userdistance/maxDistance -.2)))+1.11)*0.98 + timeBonus)
  }


  //userPoints = Math.floor(5000 * (1.1 + ( -.1 * Math.exp( 2.39 * ( userdistance/maxDistance)  ) ) ) * 0.98 + timeBonus)
  // Distance component: y= ( -1 / ( 1 + Math.exp( -10.3 * (x-0.5) ) ) ) + 1


  if (userPoints >= 4980) {
    userPoints = 5000;
  }

  //alert(userPoints);


  /*proportionRed = userdistance/12451
  proportionGreen = 1 - proportionRed
  red = 255*proportionRed
  green = 255*proportionGreen
  blue = 0
  document.getElementById('nav').style.animation = "none";
  document.getElementById('nav').style.background = "none";
  document.getElementById('nav').style.setProperty("background", `rgb(${red}, ${green}, ${blue})`, "important");
  console.log("COLOR: ", document.getElementById('nav').style.background)*/

  let userGeocodingData = await getGeocodingData(userLat, userLong);
  let actualGeocodingData = await getGeocodingData(latitude, longitude);


  let isNull = false;
  let countryMatch = false;
  //Obtain the country of the user choice & actual
  //Actual country is encodedCountry
  let userCountry = userGeocodingData.hasOwnProperty("country") ? userGeocodingData.country : null;
  if (userCountry && encodedCountry) {
    countryMatch = userCountry === decodeURIComponent(encodedCountry);
  } else {
    isNull = true;
  }

  //Obtain the state of user choice & actual
  let statesMatch = false;
  let userState;
  let actualState;
  if (!isNull) {
    userState = userGeocodingData.hasOwnProperty("state") ? userGeocodingData.state : null;
    actualState = actualGeocodingData.hasOwnProperty("state") ? actualGeocodingData.state : null;
    if (userState && actualState) {
      statesMatch = userState === actualState;
    } else {
      isNull = true;
    }
  }



  // Obtain the county of the user coordinates & actual coordinates
  let countiesMatch = false;
  let userCounty;
  let actualCounty
  if (!isNull) {
    userCounty = userGeocodingData.hasOwnProperty("county") ? userGeocodingData.county : null;
    actualCounty = actualGeocodingData.hasOwnProperty("county") ? actualGeocodingData.county : null;
    if (userCounty && actualCounty) {
      countiesMatch = userCounty === actualCounty;
    }
    else {
      isNull = true;
    }
  }





  // logic
  if (!isNull && countryMatch) {
    let navLinks = ["nav-brand", "nav-link"]


    if (countiesMatch && statesMatch) {
      // set bg color of navbar and page to green
      document.getElementById('nav').style.animation = "none";
      document.getElementById('nav').style.background = "none";
      document.getElementById('nav').style.setProperty("background", "green", "important");
      body.style.setProperty("background-image", "linear-gradient(135deg, #a8e063, #56ab2f, #4caf50, #388e3c, #2e7d32)", "important")
      document.getElementById('nav').style.setProperty("color", "white", "important");
      document.querySelectorAll(".navbar .nav-link, .navbar .navbar-brand").forEach(link => {
        link.style.color = "white";
      })
      gameOverScreen.style.color = "white";
      body.style.animation = `gradientAnimation ${5}s ease infinite`;
      body.style.backgroundSize = "400% 400%";


    } else if (statesMatch) {
      // set bg color of navbar and page to yellow
      document.getElementById('nav').style.animation = "none";
      document.getElementById('nav').style.background = "none";
      document.getElementById('nav').style.setProperty("background", "yellow", "important");
      //body.style.setProperty("background-color", "yellow", "important");
      body.style.setProperty("background-image", "linear-gradient(135deg, #fff9c4, #ffe082, #ffca28, #ffb300, #ff8f00)", "important")
      document.querySelectorAll(".navbar .nav-link, .navbar .navbar-brand").forEach(link => {
        link.style.setProperty("color", "black", "important");
      })
      gameOverScreen.style.color = "black";
      body.style.animation = `gradientAnimation ${5}s ease infinite`;
      body.style.backgroundSize = "400% 400%";
    }
    else {
      console.log("REACHED SAME COUNTRY CASE")
      // set bg color of navbar and page to orange
      document.getElementById('nav').style.animation = "none";
      document.getElementById('nav').style.background = "none";
      document.getElementById('nav').style.setProperty("background", "orange", "important");
      //body.style.setProperty("background-color", "orange", "important");
      body.style.setProperty("background-image", "linear-gradient(135deg, #ffecd2, #ffb27a, #ff8c00, #ff6f00, #e65100)", "important")
      document.querySelectorAll(".navbar .nav-link, .navbar .navbar-brand").forEach(link => {
        link.style.setProperty("color", "black", "important");
      })
      gameOverScreen.style.color = "black";
      body.style.animation = `gradientAnimation ${5}s ease infinite`;
      body.style.backgroundSize = "400% 400%";
    }

  } else {
    if (userdistance <= 50) {
      // If difference is 50 miles, set bg color of navbar and page to green
      document.getElementById('nav').style.animation = "none";
      document.getElementById('nav').style.background = "none";
      document.getElementById('nav').style.setProperty("background", "green", "important");
      //body.style.setProperty("background-color", "green", "important");
      body.style.setProperty("background-image", "linear-gradient(135deg, #a8e063, #56ab2f, #4caf50, #388e3c, #2e7d32)", "important")
      body.style.animation = `gradientAnimation ${5}s ease infinite`;
      document.querySelectorAll(".navbar .nav-link, .navbar .navbar-brand").forEach(link => {
        link.style.color = "white";
      })
      gameOverScreen.style.color = "white";
      body.style.backgroundSize = "400% 400%";
    } else if (userdistance <= 600) {
      // set bg color of navbar and page to orange
      document.getElementById('nav').style.animation = "none";
      document.getElementById('nav').style.background = "none";
      document.getElementById('nav').style.setProperty("background", "orange", "important");
      //body.style.setProperty("background-color", "orange", "important");
      body.style.setProperty("background-image", "linear-gradient(135deg, #ffecd2, #ffb27a, #ff8c00, #ff6f00, #e65100)", "important")
      document.querySelectorAll(".navbar .nav-link, .navbar .navbar-brand").forEach(link => {
        link.style.color = "black";
      })
      gameOverScreen.style.color = "black"
      body.style.animation = `gradientAnimation ${5}s ease infinite`;
      body.style.backgroundSize = "400% 400%";
    } else {
      //nepal: 237, 152, 107
      const lowerColor = { r: 237, g: 152, b: 107 };
      //mongolia: 211, 89, 65
      const upperColor = { r: 136, g: 27, b: 17 };
      // range: 600 - 12451
      let distanceProportion = (userdistance - 600) / (maxDistance - 600)
      let red = Math.round(lowerColor.r + (upperColor.r - lowerColor.r) * distanceProportion)
      let green = Math.round(lowerColor.g + (upperColor.g - lowerColor.g) * (distanceProportion))
      let blue = Math.round(lowerColor.b + (upperColor.b - lowerColor.b) * (distanceProportion))

      let baseColor = `rgb(${red}, ${green}, ${blue})`;

      // Lighten and darken adjustments for gradient effect
      let lightenFactor = 20;
      let darkenFactor = 20;

      let lightRed = Math.min(255, red + lightenFactor);
      let lightGreen = Math.min(255, green + lightenFactor);
      let lightBlue = Math.min(255, blue + lightenFactor);

      let darkRed = Math.max(0, red - darkenFactor);
      let darkGreen = Math.max(0, green - darkenFactor);
      let darkBlue = Math.max(0, blue - darkenFactor);

      let gradientColor1 = `rgb(${lightRed}, ${lightGreen}, ${lightBlue})`;
      let gradientColor2 = `rgb(${darkRed}, ${darkGreen}, ${darkBlue})`;

      // Apply the gradient as background
      document.body.style.background = `linear-gradient(135deg, ${gradientColor1}, ${baseColor}, ${gradientColor2})`;
      body.style.animation = `gradientAnimation ${2}s ease infinite`;
      body.style.backgroundSize = "400% 400%";

      document.getElementById('nav').style.animation = "none";
      document.getElementById('nav').style.background = "none";
      document.getElementById('nav').style.setProperty("background", `rgb(${red}, ${green}, ${blue})`, "important");
      document.querySelectorAll(".navbar .nav-link, .navbar .navbar-brand").forEach(link => {
        link.style.color = "white";
      })
      gameOverScreen.style.color = "white";
      //body.style.setProperty("background-color", `rgb(${red}, ${green}, ${blue})`, "important");
    }

  }

  if (marker) {
    document.getElementById('Distance').innerHTML = `You were ${userdistance} miles off!`;
  } else {
    document.getElementById('Distance').innerHTML = `No pin placed!`;
    userPoints = 0;
    document.body.style.background = "rgb(211,89,65)";

  }
  document.getElementById('Points').innerHTML = `You scored ${userPoints} points`;
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
  body.style.background = "white";
  map = map.setView([20, 0], 2);
  music.src = null;
  streetViewStatus = false;
  navElement.style.background = "linear-gradient(135deg, #9d50bb, #6e48aa, #8e2de2, #4a00e0, #ff0080)";
  navElement.style.backgroundSize = "400% 400%";


  document.getElementById('bike-wrapper').style.display = "block";
  document.getElementById('loop').style.display = "block";

  getLoading();

  // Clear map

  map.removeLayer(ActualLocationMarker);
  ActualLocationMarker = null;
  if (marker) {
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
  // Reapply the animation
})
async function getGeocodingData(lat, long) {
  getCountyURL = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=geocodejson&zoom=10&addressdetails=1`
  try {
    const response = await fetch(getCountyURL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    geocodingData = data.features[0].properties.geocoding;
    return geocodingData
  }
  catch (error) {
    console.error('Fetch error:', error);
  }

}

async function getCounty(lat, long) {
  let geocodingData = await getGeocodingData(lat, long);
  if (!geocodingData.hasOwnProperty('county')) {
    return null;
  }
  return geocodingData.county;

}

async function getCountry(lat, long) {
  let geocodingData = await getGeocodingData(lat, long);
  if (!geocodingData.hasOwnProperty('country')) {
    return null;
  }
  return geocodingData.country;
}

async function getState(lat, long) {
  let geocodingData = await getGeocodingData(lat, long);
  if (!geocodingData.hasOwnProperty('state')) {
    return null;
  }
  return geocodingData.state;



}

document.getElementById("resetLocationButton").addEventListener("click", () => {
  initialize(latitude, longitude);
})
