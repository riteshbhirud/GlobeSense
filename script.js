let latitude;
let longitude;
let retryCount = 0;
const maxRetries = 20;
const music = document.getElementById("background-audio");
let userLat = 0;
let userLong = 0;
const submitBtn = document.getElementById("submit");
const para = document.getElementById("paragraph");
para.innerHTML = "CHANGED";
let encodedCountry;

// Get a random set of coordinates using getRandomCoordinates.
// Pass those coordinates to the OpenCage Geocoding API to get coordinates of nearest road. Keep retrying until a result is found.
// get the country name from the coordinates found
// Pass the country name to the Google Street View API to get a panorama

// Utility function to wait for a specified amount of time
// Utility function to wait for a specified amount of time
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getRandomCoordinates() {
  let geometry = null;

  // Latitude ranges for major continents (excluding Antarctica)
  const latitudeRanges = [
    { min: 15, max: 70 },  // North America (USA, Canada, Mexico)
    { min: -55, max: 15 }, // South America (Argentina to Northern South America)
    { min: 40, max: 70 },  // Europe (Southern to Northern Europe)
    //{ min: -35, max: 35 }, // Africa (Southern Africa to Northern Africa)
    { min: 5, max: 80 },   // Asia (Southeast Asia to Northern Russia)
    { min: -40, max: -15 }, // Australia region
    { min: -34.833, max: -22.125 } //SA
  ];

  // Longitude ranges for major continents (excluding Antarctica)
  const longitudeRanges = [
    { min: -170, max: -50 }, // North America (Western Alaska to Eastern US)
    { min: -80, max: -35 },  // South America (Western South America to Brazil)
    { min: -25, max: 60 },   // Europe (Western Europe to Eastern Europe)
    //{ min: -20, max: 55 },   // Africa (West Africa to Eastern Africa)
    { min: 30, max: 180 },   // Asia (Middle East to Far East Asia)
    { min: 110, max: 150 },   // Australia to New Zealand
    { min: 16.449, max: 32.8917 }//SA
    
  ];


  // Randomly pick a range from the arrays
  const choice = Math.floor(Math.random() * latitudeRanges.length)
  console.log("ORIGINAL",choice);
  
  const latRange = latitudeRanges[choice];
  const lonRange = longitudeRanges[choice];

  // Generate random latitude and longitude within the selected ranges
  const latitude = Math.random() * (latRange.max - latRange.min) + latRange.min;
  const longitude = Math.random() * (lonRange.max - lonRange.min) + lonRange.min;

  console.log("ORIGINAL COORDINATES", latitude,longitude);

  const roadApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=69d59ee470f24adb97c187d0d006eeb1&language=en&roadinfo=1&pretty=1`;
  //console.log("CHANGEDCOORDINATES",roadApiUrl);

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

async function fetchCountry() {
  if (retryCount >= maxRetries) {
    console.error('Max retry limit reached. Stopping further attempts.');
    return null;
  }

  retryCount++;
  const coordinates = await getRandomCoordinates();
  console.log("fetchCountry coordinates", coordinates);
  latitude = coordinates.latitude;
  longitude = coordinates.longitude;
  console.log("fetchCountry latitude:", latitude);
  console.log("fetchCountry longitude:", longitude);
  const apiUrl = `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=66f86f9209ead753863632rmq2d6726`;

  try {
    const response = await fetch(apiUrl);
    if (response.status === 429) {
      console.warn('Too many requests. Retrying after 2 seconds...');
      await wait(2000); // Retry after 2 seconds
      return fetchCountry();
    }
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    if (data.hasOwnProperty('error')) {
      console.warn('Error in response, fetching a new location...');
      await wait(2000); // Wait 2 seconds before fetching a new location
      return fetchCountry();
    } else {
      const country = data.address.country || 'Country not found';
      const streetViewApiUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${latitude},${longitude}&key=AIzaSyAOB3wAcUOx_wjfd5KCApjhj-TYxJEd924&radius=100`;
      const streetViewResponse = await fetch(streetViewApiUrl);

      if (!streetViewResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const streetViewData = await streetViewResponse.json();
      if (streetViewData.status === "OK") {
        initialize(latitude, longitude);
        return country;
      } else if (streetViewData.status === "ZERO_RESULTS") {
        console.warn('No Street View coverage at this location. Fetching new location...');
        return fetchCountry();
      }
    }
  } catch (error) {
    console.error('Fetch error:', error);
    await wait(2000); // Retry after 2 seconds
    return fetchCountry();
  }
  return null; // Fallback in case of an unexpected failure
}

async function startProcess() {
  const country = await fetchCountry();
  if (country) {
    encodedCountry = encodeURIComponent(country);
    console.log("Country:", country);

    //const musicApiUrl = `https://de1.api.radio-browser.info/json/stations/search?country=${encodedCountry}&tag=jazz&limit=1`;
    const artistApiUrl = `https://api.jamendo.com/v3.0/artists/locations/?client_id=3d25d527&format=jsonpretty&limit=5&haslocation=true&location_coords=${latitude}_${longitude}&location_radius=200`; // takes in coordinates to get artist

    try {
      //const response = await fetch(musicApiUrl);
      const response = await fetch(artistApiUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log("artist data:", data);

      if (data.results.length === 0) {
        startProcessRadio()
      }
      else {
        let artistId = data.results[Math.floor(Math.random() * data.results.length)].id;
        const trackApiUrl = `https://api.jamendo.com/v3.0/artists/tracks/?client_id=3d25d527&format=jsonpretty&order=track_name_desc&id=${artistId}&audioformat=mp31`; // takes in artist id to get stream url
        const trackResponse = await fetch(trackApiUrl);
        if (!trackResponse.ok) {
          throw new Error('Network response was not ok');
        }
        const trackData = await trackResponse.json();
        console.log("track data:", trackData);
        let url = trackData.results[0].tracks[Math.floor(Math.random() * trackData.results[0].tracks.length)].audio;
        console.log("url:", url);
        music.src = url;
      }
      
      
      
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

  const panorama = new google.maps.StreetViewPanorama(
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
/*let chosenCountry = fetchCountry();
chosenCountry = encodeURIComponent(chosenCountry);
console.log("LASTcountry:", chosenCountry);*/

window.initialize = initialize;

async function startProcessRadio() {
  

    const musicApiUrl = `https://de1.api.radio-browser.info/json/stations/search?country=${encodedCountry}&limit=1`;

    try {
      const response = await fetch(musicApiUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.length > 0) {
        let url = data[0].url_resolved;
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


// Wait for the document to fully load before initializing the Leaflet map
document.addEventListener("DOMContentLoaded", function() {
  // Initialize Leaflet map 
  var map = L.map('map').setView([20, 0], 2); // World view with center at [20, 0] and zoom level 2

 
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Add a click event listener to the Leaflet map
  map.on('click', function(e) {
    var latlng = e.latlng; // Get the coordinates of the clicked point
    L.marker(latlng).addTo(map); // Place a marker at the clicked location
    userLat = latlng.lat;
    userLong = latlng.lng;
    //console.log("Coordinates: " + latlng.lat + ", " + latlng.lng); // Log coordinates to console
    //alert("Coordinates: " + latlng.lat + ", " + latlng.lng); // Show coordinates in an alert
  });


    submitBtn.addEventListener("click",()=>{
      alert(`You Picked Lat: ${userLat}, Long: ${userLong}`);
    })
});






