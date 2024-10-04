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
let url;
cities = ["New%20York", "Los%20Angeles", "Chicago", "Toronto", "Mexico%20City", "Houston", "Vancouver",
  "San%20Francisco", "Montreal", "Miami", "São%20Paulo", "Buenos%20Aires", "Rio%20de%20Janeiro",
  "Santiago", "Bogotá", "Lima", "Caracas", "Medellín", "Montevideo", "Quito", "London",
  "Paris", "Berlin", "Madrid", "Rome", "Amsterdam", "Vienna", "Zurich", "Warsaw",
  "Oslo", "Tokyo", "Shanghai", "Beijing", "Seoul", "Mumbai", "Bangkok", "Jakarta",
  "Manila", "Singapore", "Kuala%20Lumpur", "Cairo", "Nairobi", "Johannesburg",
  "Accra", "Algiers", "Addis%20Ababa", "Casablanca", "Kinshasa", "Dakar", "Sydney",
  "Melbourne", "Brisbane", "Perth", "Auckland", "Wellington", "Canberra", "Adelaide",
  "Hobart", "Suva", "Istanbul", "Moscow", "Kiev", "St.%20Petersburg", "Dubai", "Abu%20Dhabi",
  "Tehran", "Riyadh", "Tel%20Aviv", "Jerusalem", "Doha", "Kuwait%20City", "Baku", "Ankara",
  "Baghdad", "Damascus", "Amman", "Muscat", "Beirut", "Manama", "Dhaka", "Karachi",
  "Islamabad", "Colombo", "Kathmandu", "Thimphu", "Male", "Hanoi", "Ho%20Chi%20Minh%20City",
  "Phnom%20Penh", "Vientiane", "Yangon", "Naypyidaw", "Busan", "Taipei", "Tokyo", "Osaka",
  "Nagoya", "Sapporo", "Kyoto", "Shenzhen", "Guangzhou", "Chengdu", "Wuhan"]


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

async function getRandomCoordinates() {
  let geometry = null;

  // Latitude ranges for major continents (excluding Antarctica)
  /*const latitudeRanges = [
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
    
  ];*/

  /*const latitudeRanges = [
    { min: 24.396308, max: 49.384358 }, // Continental USA
    /*{ min: 36.578581, max: 71.538800 }, // Canada
    { min: 14.53125, max: 32.715736 }, // Mexico
    { min: -55.0, max: 12.0 }, // South America (general coverage)
    { min: 35.0, max: 71.0 }, // Europe
    { min: -35.0, max: 37.0 }, // Africa (general coverage)
    { min: -11.0, max: 45.0 }, // Asia (general coverage)
    { min: -60.0, max: -10.0 }, // Australia and Oceania (general coverage)
    { min: 1.0, max: 10.0 }, // Southeast Asia
    { min: 50.0, max: 60.0 }, // Northern Europe
  ]
  
  const longitudeRanges = [
    { min: -123.0, max: -68.93457 }, // Continental USA
    /*{ min: -141.0, max: -52.0 }, // Canada
    { min: -118.4, max: -86.7 }, // Mexico
    { min: -81.0, max: -35.0 }, // South America
    { min: -25.0, max: 40.0 }, // Europe
    { min: -18.0, max: 51.0 }, // Africa
    { min: 60.0, max: 180.0 }, // Asia
    { min: 110.0, max: 180.0 }, // Australia and Oceania
    { min: 100.0, max: 180.0 }, // Southeast Asia
    { min: 0.0, max: 25.0 }, // Northern Europe
  ];*/



  // Randomly pick a range from the arrays
  /*const choice = Math.floor(Math.random() * latitudeRanges.length)
  console.log("ORIGINAL",choice);*/

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
    encodedCountry = encodeURIComponent(coordinatesData[0].address.country);
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

  //const latRange = latitudeRanges[choice];
  //const lonRange = longitudeRanges[choice];

  // Generate random latitude and longitude within the selected ranges
  /*const latitude = Math.random() * (latRange.max - latRange.min) + latRange.min;
  const longitude = Math.random() * (lonRange.max - lonRange.min) + lonRange.min;*/

  console.log("ORIGINAL COORDINATES", latitude, longitude);

  const roadApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${openCageAPIKey}&language=en&roadinfo=1&pretty=1`;
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
  //console.log("fetchCountry latitude:", latitude);
  //console.log("fetchCountry longitude:", longitude);
  //const apiUrl = `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=${geocodeAPIKey}`;

  /*try {
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
      const streetViewApiUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${latitude},${longitude}&key=${googleAPIKey}&radius=100`;
      const streetViewResponse = await fetch(streetViewApiUrl);

      if (!streetViewResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const streetViewData = await streetViewResponse.json();
      if (streetViewData.status === "OK") {
        console.log("GOOGLE STREET VIEW SUCCESSFUL:", latitude, longitude, "are able to be displayed by google street view.")
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
  }*/

  try {
    const streetViewApiUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${latitude},${longitude}&key=${googleAPIKey}&radius=100`;
    const streetViewResponse = await fetch(streetViewApiUrl);

    if (!streetViewResponse.ok) {
      throw new Error('Network response was not ok');
    }

    const streetViewData = await streetViewResponse.json();
    if (streetViewData.status === "OK") {
      console.log("GOOGLE STREET VIEW SUCCESSFUL:", latitude, longitude, "are able to be displayed by google street view.")
      initialize(parseFloat(latitude), parseFloat(longitude));
      return encodedCountry;
    } else if (streetViewData.status === "ZERO_RESULTS") {
      console.warn('No Street View coverage at this location. Fetching new location...');
      return fetchCountry();
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
          randArtist = Math.floor(Math.random() * data.results.length)
          let artistId = data.results[randArtist].id;
          const trackApiUrl = `https://api.jamendo.com/v3.0/artists/tracks/?client_id=${jamendoClientID}&format=jsonpretty&order=track_name_desc&id=${artistId}&audioformat=mp31`; // takes in artist id to get stream url
          const trackResponse = await fetch(trackApiUrl);
          if (!trackResponse.ok) {
            throw new Error('Network response was not ok');
          }
          const trackData = await trackResponse.json();
          randSong = Math.floor(Math.random() * trackData.results[0].tracks.length)

          console.log("track data:", trackData);
          console.log("Artist name:", data.results[randArtist].name)
          console.log(`Song name: ${trackData.results[0].tracks[randSong].name}`)
          url = trackData.results[0].tracks[randSong].audio;
          console.log("url:", url);
          //music.src = url;
        }

        console.log("reached");
        const music = document.createElement("audio");
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
        url = data[0].url_resolved;
        console.log(url);
        //music.src = url;
      } else {
        console.warn('No stations found for the selected country.');
      }
    } catch (error) {
      console.error('Music Fetch error:', error);
    }
  }

  startProcess();


  // Wait for the document to fully load before initializing the Leaflet map
  document.addEventListener("DOMContentLoaded", function () {
    // Initialize Leaflet map 
    console.log("reachedreachedreached")
    var map = L.map('map').setView([20, 0], 2); // World view with center at [20, 0] and zoom level 2


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add a click event listener to the Leaflet map
    map.on('click', function (e) {
      var latlng = e.latlng; // Get the coordinates of the clicked point
      L.marker(latlng).addTo(map); // Place a marker at the clicked location
      userLat = latlng.lat;
      userLong = latlng.lng;
      //console.log("Coordinates: " + latlng.lat + ", " + latlng.lng); // Log coordinates to console
      //alert("Coordinates: " + latlng.lat + ", " + latlng.lng); // Show coordinates in an alert

    });

    submitBtn.addEventListener("click", () => {
      alert(`You Picked Lat: ${userLat}, Long: ${userLong}`);
    })
  });






