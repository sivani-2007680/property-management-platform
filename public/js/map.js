
mapboxgl.accessToken = mapToken;


console.log("Map Token Loaded:", mapToken ? "YES" : "NO");
console.log("Coordinates Loaded:", listing.geometry ? listing.geometry.coordinates : "NO");


const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12', 
    center: listing.geometry.coordinates, 
    zoom: 9 
});


const marker = new mapboxgl.Marker({ color: 'red' })
    .setLngLat(listing.geometry.coordinates) 
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`)
    )
    .addTo(map);