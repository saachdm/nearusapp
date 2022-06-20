try {
  var platform = new H.service.Platform({
    apikey: NEARUS_HERE_API_KEY
  });
  var service = platform.getSearchService();
  var defaultLayers = platform.createDefaultLayers();
}
catch (err) {
  alert("Error initializing API. Nearus might be unusable now. Contact developer")
}

var total_lat = 0;
var total_long = 0;
var n_items = 0;
var submit = document.getElementById("submitButton");
var mapInitiated = 0;

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
  console.log("Initializing map");
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
}


function execute(result, latArray, longArray) {

  console.log({ latArray });
  console.log({ longArray });
  var latAt = result[0].toString();
  var longAt = result[1].toString();
  let input = document.getElementById("addressInput").value;
  let searchRadius = document.getElementById("searchRadiusInput").value;
  let limit = 'circle:' + latAt.toString() + ',' + longAt.toString() + ';r=' + searchRadius;

  if (mapInitiated == 0) {
    createMap();
    mapInitiated += 1;
  } else {
    mapInitiated += 1;
    console.log("Reset map")
    group.removeAll();
  }
  for (let n = 0; n < latArray.length; n++) {
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
    let n_items = 0;
    let temp_lat = 0;
    let temp_long = 0;

    result.items.forEach((item) => {

      var placesIcon = new H.map.Icon("https://img.icons8.com/external-xnimrodx-blue-xnimrodx/64/undefined/external-pin-event-and-party-xnimrodx-blue-xnimrodx.png", { size: { w: 25, h: 25 } });
      placesResult.push(item);
      group.addObject(new H.map.Marker(item.position, { icon: placesIcon }));
      map.addObject(group);
      temp_lat += item.position.lat;
      temp_long += item.position.lng;
      n_items += 1;
    });
    total_lat = temp_lat / n_items;
    total_long = temp_long / n_items;
    map.setCenter({ lat: latAt, lng: longAt });
    createGMapsLink([latAt, longAt]);
    new_bound = setBoundDiff(group)
    map.getViewModel().setLookAtData({
      bounds: new_bound
    }, opt_animate = true);

  }, alert);
  window.addEventListener('resize', () => map.getViewPort().resize());
}

function setBoundDiff(g) {
  diff = 0.03;
  to = g.getBoundingBox().getTop() + diff;
  bot = g.getBoundingBox().getBottom() - diff;
  rig = g.getBoundingBox().getRight() + diff;
  lef = g.getBoundingBox().getLeft() - diff;
  new_bound = new H.geo.Rect(top = to, left = lef, bottom = bot, right = rig);
  return new_bound

}



var i = 0;
var inputContainer = document.getElementById("inputContainer");

if (i == 0) {
  addInputForm();
  addInputForm();
}
function addInputForm() {
  var input = document.createElement("input");
  input.type = "text";
  input.className = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  input.id = "input" + i;
  i += 1;
  inputContainer.appendChild(input);
}


function removeInputForm() {
  if (i == 2) {
    alert("Minimum address=2")
  } else {
    let temp = i - 1;
    temp = temp.toString();
    var elTemp = document.getElementById("input" + temp);
    elTemp.remove();
    i = i - 1;
  }
}

function createGMapsLink(cent_coord) {
  if (mapInitiated == 1) {
    var linkElement = document.createElement("a");
    var pingElement = document.createElement("span");
    pingElement.className = "animate-ping absolute inline-flex h-2 w-2 rounded-full bg-sky-400 opacity-80"
    latAt = cent_coord[0];
    longAt = cent_coord[1];
    var linkStr = "https://www.google.com/maps/search/" + document.getElementById("addressInput").value + "/@" + latAt.toString() + ',' + longAt.toString() + ",14.35z";
    linkElement.href = linkStr;
    linkElement.id = "gmapsButton";
    linkElement.className = "bg-yellow-400 hover:bg-yellow-500 text-slate-50 font-semibold hover:text-white rounded py-2 px-5 text-sm inline-flex";
    linkElement.target = "_blank";
    linkElement.innerHTML = "Search in Google Maps"
    gmapsContainer.appendChild(pingElement);
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
