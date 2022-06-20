
/**
 * Moves the map to display over Berlin
 *
 */
var platform = new H.service.Platform({
  apikey: apiKey
});


var total_lat = 0;
var total_long = 0;
var n_items = 0;
var submit = document.getElementById("submitButton");
var mapInitiated = 0;
var service = platform.getSearchService();
var defaultLayers = platform.createDefaultLayers();
var map;
var ui;
var group;
var placesResult = [];
const cont = document.createElement("span");
cont.setAttribute("id", "actualMap");



class InputAddress {
  constructor() {
    this.latArray = [];
    this.longArray = [];
  }
  add(lat, long) {
    this.lat = lat;
    this.long = long;
    this.latArray.push(this.lat);
    this.longArray.push(this.long);
  }
  calculateCentroid(n) {
    var latSum = this.latArray.reduce((previousValue, currentValue) => previousValue + currentValue);
    var longSum = this.longArray.reduce((previousValue, currentValue) => previousValue + currentValue);
    var centroid = [latSum / n, longSum / n];
    return centroid;
  }
}

function createMap() {
  console.log("Masuk create map");
  // var map = new H.Map(document.getElementById('mapContainer'),
  map = new H.Map(document.getElementById('mapContainer').appendChild(cont),
    defaultLayers.raster.normal.map, {
    pixelRatio: window.devicePixelRatio || 1
  });
  ui = H.ui.UI.createDefault(map, defaultLayers);
  behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map))
  group = new H.map.Group();
}

function calculateHaversineDistance(coords1, coords2) {
  function toRad(x) {
    return x * Math.PI / 180;
  }
  var lat1 = coords1[0];
  var lon1 = coords1[1];

  var lat2 = coords2[0];
  var lon2 = coords2[1];

  var R = 6371000; // km

  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2)
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}



function getInputCentroid() {
  var temp_lat;
  var temp_long;
  var tempInputArray = [];
  placesResult = [];
  const temp_inputAddress = new InputAddress()
  for (let n = 0; n < i; n++) {
    tempInputArray.push(document.getElementById("input" + n).value)
  }
  for (let n = 0; n < i; n++) {
    service.geocode({
      q: tempInputArray[n],
      in: 'countryCode:IDN'
    }, (result) => {
      // map.addObject(group);
      // marker = new H.map.Marker(result.items[0].position);
      // group.addObject(marker);
      console.log(result.items);
      temp_lat = result.items[0].position.lat;
      temp_long = result.items[0].position.lng;
      temp_inputAddress.add(temp_lat, temp_long);

      if (n == i - 1) {
        const result = temp_inputAddress.calculateCentroid(n + 1);
        console.log({ "result": result, "temp_inputAddress": temp_inputAddress });
        execute(result, temp_inputAddress.latArray, temp_inputAddress.longArray);
      }
    }
      , alert);
  }
  // console.log(temp_lat);
  // temp_lat = temp_lat / tempInputArray.length;
  // temp_long = temp_long / tempInputArray.length;
  // console.log([temp_lat, temp_long]);
  // return [temp_lat, temp_long];
  // return temp_inputAddress.calculateCentroid();
}


function execute(result, latArray, longArray) {

  // var latlong = getInputCentroid();
  // console.log(latlong);

  console.log({ latArray });
  var latAt = result[0].toString();
  var longAt = result[1].toString();
  let input = document.getElementById("addressInput").value;
  let limit = 'circle:' + latAt.toString() + ',' + longAt.toString() + ';r=' + 10000;

  if (mapInitiated == 0) {
    createMap();
    mapInitiated += 1;
  } else {
    mapInitiated += 1;
    console.log("masuk map initiated 1")
    group.removeAll();
    // document.getElementById('mapContainer').removeChild(document.getElementById('actualMap'));
    // createMap();
  }
  for (let n = 0; n < latArray.length; n++) {
    // console.log(latArray[n]);
    console.log(n);
    // var svgMarker = '<svg xmlns=https://www.svgrepo.com/show/138889/pin.svg </svg>';
    var addressIcon = new H.map.Icon("https://img.icons8.com/external-kmg-design-outline-color-kmg-design/32/undefined/external-pin-maps-navigation-kmg-design-outline-color-kmg-design-1.png", { size: { w: 45, h: 45 } });
    var centroidIcon = new H.map.Icon("https://img.icons8.com/external-soft-fill-juicy-fish/60/undefined/external-pin-maps-and-navigation-soft-fill-soft-fill-juicy-fish.png", { size: { w: 45, h: 45 } });
    var marker_cent = new H.map.Marker({ lat: latAt, lng: longAt }, { icon: centroidIcon });
    var marker_loc = new H.map.Marker({ lat: latArray[n], lng: longArray[n] }, { icon: addressIcon });
    group.addObject(marker_loc);
    group.addObject(marker_cent);
  }
  service.discover({
    q: input,
    in: limit
  }, (result) => {
    // Add a marker for each location found
    let n_items = 0;
    let temp_lat = 0;
    let temp_long = 0;

    result.items.forEach((item) => {

      var placesIcon = new H.map.Icon("https://img.icons8.com/external-xnimrodx-blue-xnimrodx/64/undefined/external-pin-event-and-party-xnimrodx-blue-xnimrodx.png", { size: { w: 25, h: 25 } });
      if (calculateHaversineDistance([latAt, longAt], [item.position.lat, item.position.lng]) < 5000) {
        console.log("Masuk");
        placesResult.push(item);
        group.addObject(new H.map.Marker(item.position, { icon: placesIcon }));
        map.addObject(group);
        temp_lat += item.position.lat;
        temp_long += item.position.lng;
        n_items += 1;
      }

      // map.addObject(new H.map.Marker(item.position));
      // map.addObject(new H.map.Marker(item.position));
      // marker = new H.map.Marker(item.position);
      // group.addObject(marker);

    });
    total_lat = temp_lat / n_items;
    total_long = temp_long / n_items;
    map.setCenter({ lat: latAt, lng: longAt });
    createGMapsLink([latAt, longAt]);
    map.getViewModel().setLookAtData({
      bounds: group.getBoundingBox()
    }, opt_animate = true);
  }, alert);
  window.addEventListener('resize', () => map.getViewPort().resize());
}


var i = 0;
var inputContainer = document.getElementById("inputContainer");

if (i == 0) {
  addInputForm();
}
function addInputForm() {
  var input = document.createElement("input");
  input.type = "text";
  input.className = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  input.id = "input" + i;
  i += 1;
  inputContainer.appendChild(input);
  // inputContainer.appendChild(document.createElement("br"));
}


function removeInputForm() {
  let temp = i - 1;
  temp = temp.toString();
  var elTemp = document.getElementById("input" + temp);
  elTemp.remove();
  i = i - 1;
}

function createGMapsLink(cent_coord) {
  console.log({ mapInitiated });
  if (mapInitiated == 1) {
    var linkElement = document.createElement("a");
    // var linkElement = document.getElementById("linkContainer")
    latAt = cent_coord[0];
    longAt = cent_coord[1];
    var linkStr = "https://www.google.com/maps/search/" + document.getElementById("addressInput").value + "/@" + latAt.toString() + ',' + longAt.toString() + ",14.35z";
    linkElement.href = linkStr;
    linkElement.id = "gmapsButton";
    linkElement.className = "bg-yellow-400 hover:bg-yellow-500 text-slate-50 font-semibold hover:text-white rounded py-2 px-5 text-sm";
    linkElement.target = "_blank";
    linkElement.innerHTML = "Search in Google Maps"
    gmapsContainer.appendChild(linkElement);
  } else {
    linkElement = document.getElementById('gmapsButton');
    latAt = cent_coord[0];
    longAt = cent_coord[1];
    var linkStr = "https://www.google.com/maps/search/" + document.getElementById("addressInput").value + "/@" + latAt.toString() + ',' + longAt.toString() + ",14.35z";
    linkElement.href = linkStr;
  }
}

addInput.addEventListener("click", addInputForm)
removeInput.addEventListener("click", removeInputForm)
submitButton.addEventListener("click", getInputCentroid);
