mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', 
    style: "mapbox://styles/mapbox/streets-v12",        
    center: listing.geometry.coordinates, 
    zoom: 9 
});
console.log(listing.geometry);
const marker = new mapboxgl.Marker({ color: 'red'})
    .setLngLat(listing.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({offset: 25})
    .setHTML(`<h3>${listing.title}</h3><p>Excat loaction provided after booking </p>`))
    .addTo(map);