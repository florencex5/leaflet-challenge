// Set up the base url
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


// Add new layer group for earthquake data
let earthquake = L.layerGroup();

// Create different tile layer that will be the backgrounds of the map
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let graymap = L.tileLayer('https://cartodb-basemaps-b.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png');

let satellitemap = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}');


// Create the baseMaps object to hold different types of maps
let baseMaps = {
    Outdoors: basemap,
    Grayscale: graymap,
    Satellite: satellitemap,
  };


// Create the overlayMaps object that can be toggled on or off for earthquake data
let overlayMaps = {
    Earthquakes: earthquake
  };


// Create the myMap object and set the default layers
let myMap = L.map("map", {
    center: [34.0522, -118.243683], //set up LA as map's center
    zoom: 5,
    layers: [basemap,earthquake]
  });


// Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map. 
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);


// Create new function for displaying different color based on the depth
function chooseColor(depth) {
    if (depth >= 90) return "#E74C3C";
    else if (depth >=70) return "#F39C12";
    else if (depth >= 50) return "#F4D03F";
    else if (depth >= 30) return "#F5F767";
    else if (depth >= 10) return "#A3FD73";
    else return "#58D68D";
}


// Getting our GeoJSON data
d3.json(url).then(function(data) {

    //Creating a GeoJSON layer with the retrieved data and add it to earthquake layer group
    L.geoJson(data, {
      
      pointToLayer: function (feature, latlng) {
      let mag = feature.properties.mag;
      let depth = feature.geometry.coordinates[2];
      return L.circle(latlng, {
        fillOpacity: 1,
        color: chooseColor(depth),
        fillColor: chooseColor(depth),
        radius: mag * 10000
        }).bindPopup(`Place: ${feature.properties.place} <br> Magnitude: ${feature.properties.mag} <br> Time: ${Date(feature.properties.time)}`);
      
       }

    }).addTo(earthquake);

});


// Create Legend
let legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let limits = [-10,10,30,50,70,90]
   
// Iterates over each element of the limits array and check if the current 'i' is not the last index in the limits array
// if yes, then display the range. Otherwise, set the last data range as '${limits[i]}+'
// Use ternary operator to write the if-else statement
for (let i = 0; i < limits.length; i++) {
    const range = i != limits.length - 1 ? `${limits[i]}-${limits[i + 1]}` : `${limits[i]}+`;
    div.innerHTML += `<div><div class="square" style="background:${chooseColor(limits[i])}"></div> &nbsp ${range}</div>`;
  }

  //display the legend in the bottom-right corner of the map
  return div;
};


// Adding the legend to the map
legend.addTo(myMap);