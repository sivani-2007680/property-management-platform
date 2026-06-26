// public/js/map.js

// 1. Set Mapbox access token globally
mapboxgl.accessToken = mapToken;

// Debugging check: Run this if your map goes blank again to verify your data is passing correctly
console.log("Map Token Loaded:", mapToken ? "YES" : "NO");
console.log("Coordinates Loaded:", listing.geometry ? listing.geometry.coordinates : "NO");

// 2. Initialize the Mapbox Map
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: listing.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});

// 3. Add the Marker and chain the Popup (Exactly as written in the video)
const marker = new mapboxgl.Marker({ color: 'red' })
    .setLngLat(listing.geometry.coordinates) 
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`)
    )
    .addTo(map);