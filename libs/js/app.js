// Preloader Script
$(window).on('load', function () {
    if ($('#preloader').length) {
    $('#preloader').delay(100).fadeOut('slow', function () {
        $(this).remove();
    });
    }
});
// Global Variables
let countryNames = [];
let countryISO = [];
let currentLat, currentLng, currentLon,currentCountry, userCountryName, userCountry;

//initialise the map and get user location
var map = L.map('map').setView([51.509, -0.11], 13);
map.locate({
    setView: true,
    maxZoom: 8,
    layers: [googleStreets]
}); 
//======================================================================================
//toner labels
var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{ maxZoom: 20,subdomains:['mt0','mt1','mt2','mt3']});
let sunny = L.tileLayer('https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}.png?access-token=JVg3LrVoy8EKxwL0gQrT16EFQLE87bgaOeatKm1iKyHZcUKuTevrzBQdBH1Fvdp2', {
    attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
var tonerMap = L.tileLayer.provider('Stamen.Toner', {id: 'map', maxZoom: 18, attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,subdomains:['mt0','mt1','mt2','mt3']
}).addTo(map);


//icon-singleMarker
var iconRed = L.icon({
    iconUrl: 'libs/icons/MapRed.png',
    iconSize: [40, 70],   
});
//Marker with label
var singleMarker =L.marker([51.509, -0.11], {icon: iconRed});
var popup = singleMarker.bindPopup('welcome'+singleMarker.getLatLng()).openPopup()
popup.addTo(map);

//layer controller and add the layer groups
var baseMaps = { 
    "Google Satellite": googleSat,
    "sunny": sunny,
    "tonerMap": tonerMap,  
    "Google Street": googleStreets,   
};

//add the layer groups
var overlayMaps = {
    "First Marker": singleMarker,
};
var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
// -------------------------------- Country Object Definition --------------------------------

function Country(name, iso_a2, iso_a3, iso_n3, geoType, coordinates){
    this.name = name;
    this.iso_a2 = iso_a2;
    this.iso_a3 = iso_a3;
    this.iso_n3 = iso_n3;
    this.coordinates = coordinates;
    this.geoType = geoType;
    this.lat;
    this.lng;
    this.lon;

    // Map Markers
    this.marker_capital = [];
    this.marker_cities = [];
    this.marker_museums = [];
    this.marker_universities = [];
}

//===================================================================================
//icon-MapYellow
var MapYellow = new L.Icon({
    iconUrl: 'libs/icons/MapYellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

//======================================================================================

// Main AJAX & jQuery Code
$(document).ready(() => {

    // Get the country information
    $.ajax({
        url: "libs/php/myphp/countryBorders.geo.json",
        type: 'GET',
        data: {},
        dataType: 'json',
        success: function(data) {

            // ---------------- Generate Country Objects ----------------
            const results = data["features"]      
            for(let i=0; i < results.length; i++){
                
                let name = results[i]['properties']['name'];
                let iso_a2 = results[i]['properties']['iso_a2'];
                let iso_a3 = results[i]['properties']['iso_a3'];
                let iso_n3 = results[i]['properties']['iso_n3'];
                let geoType = results[i]['geometry']['type'];
                let coordinates = results[i]['geometry']['coordinates'];;

                noSpaceName = name.replace(/\s+/g, '');
                window[noSpaceName] = new Country(name, iso_a2, iso_a3, iso_n3, geoType, coordinates)
            }
            
           
              //Fill countries-
              $.ajax({
                  url: "libs/php/myphp/countryNames.php",
                  type: 'GET',
                  dataType: 'json',

                  success: function(result) {
 
                    //console.log(result);

                     if (result.status.name == "ok") {
                       for (var i = 0; i < result.data.length; i++) {
                           $('#country').append("<option value=" + result['data'][i]['code'] + ">" + result['data'][i]['name'] + "</option>");
                        }
                   }
    
                   },
               });
           
          // ---------------- Find The Users Location And Set Map ----------------
          
            function geoSuccess(position) {
                currentLat = position.coords.latitude;
                currentLng = position.coords.longitude;
                currentLon = position.coords.longitude;
                getCurrentCountry(currentLat, currentLng);
                getCurrentCountryWeather(currentLat, currentLon);
                
            }
            function geoError(err) {
            }
              navigator.geolocation.getCurrentPosition(geoSuccess, geoError);              
        }
    });
});

//-------- Get User Current Country Info From GeoNames ------------------------
// Geonames API username
async function getCurrentCountry(lat,lng){

    // API Call to GeoNames to get users country info
    await $.ajax({
       url: "libs/php/myphp/getCountryCode.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: lat,
            lng: lng,
        },
        success: function(result) {
            //console.log(JSON.stringify(result));

            if (result.status.name == "ok") {
                userCountryName = result['data']['countryName'];
                var userCountrySpaces = userCountryName 
                var userCountryNoSpaces = userCountrySpaces.replace(/\s+/g, '');
                currentCountry = window[userCountryNoSpaces];   
            }
            $('#country').val(currentCountry.iso_a2).change();  
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(errorThrown));
        }
    });     
}
// ===================================================================
 //Select country
 $("#country").change(function(){
	//Apply border
	$.ajax({
		url: "libs/php/myphp/countryBorders.php",
		type: "POST",
		dataType: "json",
		data: {
			code: $("#country").val(),
		},

		success: function(result,status,data) {
			// alert("hi");
			// console.log(result); 
            	var bounds = result.data;
				var borderStyle =  {
					color: "blue",
					weight: 3,
                    opacity: 0.7,
                    fillOpacity: 0.0 
				};
				var border = L.geoJSON(bounds,borderStyle).addTo(map);
				
				map.fitBounds(border.getBounds(), {
					padding: [10, 10],
					animate: true,
					duration: 5,
				});
                getAllInfo(currentCountry)    
		},
		error: function(jqXHR, textStatus, errorThrown) {
		}
	}); 
//======================City Markers==================================================
 //Country City Markers-
 $.ajax({
    url: "libs/php/myphp/geoDBCities.php",
    type: 'POST',
    dataType: 'json',
    data: {
        country: $('#country').val(),
    },
    success: function(result) {

         //  console.log(result);
        if (result.status.name == "ok") {
            result['data']['data'].forEach(element => {
                L.marker([element.latitude, element.longitude],
                     {icon: MapYellow}).addTo(map).bindPopup("<h1>" + element.name + "</h1> </br>");
            });
        }
    },
    error: function(jqXHR, textStatus, errorThrown) {   
    }
});    
//=========================CountryInfo=========================================
//getCountryInfo-
$.ajax({
    url: "libs/php/myphp/getCountryInfo.php",
    type: 'POST',
    dataType: 'json',
    data: {
        country: $('#country').val(),
    },
    success: function(result) {
        // console.log(result);
    //	console.log(JSON.stringify(result));
        if (result.status.name == "ok") {
             $("#continent").html(result['data'][0]['continent']);
            $("#countryName").html(result['data'][0]['countryName']);
            $('#capital1').html(result['data'][0]['capital']);
            $('#area').html(result['data'][0]['areaInSqKm'] + " km<sup>2</sup>");
            $('#population').html(result['data'][0]['population']);
        }
    },
    error: function(jqXHR, textStatus, errorThrown) {
        // your error code
    }
}); 

	//wikiApi-
	$.ajax({
		url: "libs/php/myphp/getWikiApi.php",
		type: 'POST',
		dataType: 'json',
		data: {
			country: $('#country option:selected').text(),
		},
		success: function(result) {            
		// console.log(result);
			if (result.status.name == "ok") {
				$("#sumTitle").empty();
				$("#sumTitle").append(result['data']['0']['title']);
				$("#summary").html(result['data']['0']['summary']);
				$("#wikipediaUrl").attr('href', result['data']['0']['wikipediaUrl']);
				$("#wikipediaUrl").html(result['data']['0']['wikipediaUrl']);                
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// your error code
		}
	}); 
//============================Images===================================       
      //Location Images:
	  $.ajax({
		url: "libs/php/myphp/getLocationImages.php",
		type: 'POST',
		dataType: 'json',
		data: {
		query: $('#country option:selected').text(),
		},
		success: function(result) {

			// console.log(result);
			$("#countryImages").empty();
			if (result.status.name == "ok") {
				for(var i = 0; i<result['data']['results'].length; i++){
					$("#countryImages").append("<img src='' alt='' id='image" + i +"'class='countryImages'><br><br>");
					$("#image" + i).attr('src', result['data']['results'][i]['urls']['regular']);
					$("#image" + i).attr('alt', result['data']['results'][i]['alt_description']);
					$("#description" + i).append(result['data']['results'][i]['alt_description'] + " -");
				}
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {	
		}
	});    
//=======================covid=========================================
$.ajax({
    url: "libs/php/myphp/getCovid.php",
    type: 'POST',
    dataType: 'json',
    data: {
        country: $('#country option:selected').val(),
    },
    success: function(result) {

       //  console.log(result.Global);
    //   console.log(JSON.stringify(result));
        if (result.status.name == "ok") {
            $("#countryCovid").empty();
            $("#countryCovid").append($('#country option:selected').text());
            $("#countriesTotalConfirmed").html(result['data']['Countries']['0']['TotalConfirmed']);
            $("#countriesTotalDeaths").html(result['data']['Countries']['0']['TotalDeaths']);
            $("#countriesTotalRecovered").html(result['data']['Countries']['0']['TotalRecovered']);
            $("#countriesNewConfirmed").html(result['data']['Countries']['0']['NewConfirmed']);
            $("#countriesNewDeaths").html(result['data']['Countries']['0']['NewDeaths']);
            $("#countriesNewRecovered").html(result['data']['Countries']['0']['NewRecovered']);
    }
       
    },
    error: function(jqXHR, textStatus, errorThrown) {
       
    }
});
//=======================news=========================================
 //News:
 $.ajax({
    url: "libs/php/myphp/getNewsData.php",
    type: 'POST',
    dataType: 'json',
    data: {
        country: $('#country option:selected').val(),
    },
    success: function(result) {

        //  console.log(result);
     //   console.log(JSON.stringify(result));
        
        if (result.status.name == "ok" && result['data']['articles']['0'] !== undefined) {
            $("#newsCountry").empty();
            $("#newsCountry").append($('#country option:selected').text());
            $("#articleTitle").html(result['data']['articles']['0']['title']);
            $("#articleContent").html(result['data']['articles']['0']['content']);
            $("#articleAuthor").html(result['data']['articles']['0']['author']);
            var date = result['data']['articles']['0']['publishedAt'];
            $("#publishedAt").html(moment(date).format('DD-MM-YYYY'));
            $("#articleUrl").html('https://' + result['data']['articles']['0']['url']);
            $("#articleUrl").attr("href",'https://' +  result['data']['articles']['0']['url']);
        }
        var i = 0;
        $("#nextArticle").on('click', function() {
            if (result.status.name == "ok" && result['data']['articles'][i] !== undefined && i<(result['data']['articles'].length-1)) {
                i++
                // console.log(i)
                $("#articleTitle").html(result['data']['articles'][i]['title']);
                $("#articleContent").html(result['data']['articles'][i]['content']);
                $("#articleAuthor").html(result['data']['articles'][i]['author']);
                var date = result['data']['articles'][i]['publishedAt'];
                $("#publishedAt").html(moment(date).format('DD-MM-YYYY'));
                $("#articleUrl").html('https://' + result['data']['articles'][i]['url']);
                $("#articleUrl").attr("href",'https://' +  result['data']['articles'][i]['url']);
            }
        }); 
    },
    error: function(jqXHR, textStatus, errorThrown) {
    }
});       
});
//======================Weather========================================
// Geonames API Weather
async function getCurrentCountryWeather(lat,lon){
    //Weather:
    await $.ajax({
        url: "libs/php/myphp/getOpenWeather.php",
        type: 'POST',
        dataType: 'json',
        data: {
                lat: lat,
                lon:lon,
        },
        success: function(result) {
            //console.log(result);
            if (result.status.name == "ok" && result['data']['current'] != undefined) {
    
                //Onload:
                $('.weatherHide').show();
                $("#temp").empty();
                $("#currentWeather").empty();
                $("#wind").empty();
                $("#sunrise").empty();
                $("#sunset").empty();
                $("#humidity").empty();
                $('#temp').html(result['data']['current']['temp']+" ℃");
                var icon = result['data']['current']['weather']['0']['icon'];
                $('#currentWeather').append("<img id='weatherIcon' alt='weather icon' src=''></img>" + result['data']['current']['weather']['0']['description']);
                var weatherUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
                $('#weatherIcon').attr("src", weatherUrl);
                var calculated = Math.round(result['data']['current']['wind_speed'] * 3600 / 1610.3*1000)/1000;
                $('#wind').html(calculated + ' mph ' + direction(result['data']['current']['wind_deg']));                        var sunrise = moment(result['data']['current']['sunrise']*1000).format("HH:mm");
                $('#sunrise').html(sunrise);
                var sunset = moment(result['data']['current']['sunset']*1000).format("HH:mm");
                $('#sunset').html(sunset);
                $('#humidity').html(result['data']['current']['humidity'] + ' %');
           
                //First Day
                $("#day1").on('click', function(){
                    $('.weatherHide').hide();
                    $("#temp").empty();
                    $("#currentWeather").empty();
                    $("#wind").empty();
                    $("#sunrise").empty();
                    $("#sunset").empty();
                    $("#humidity").empty();
                    $('#temp').html(result['data']['current']['temp']+" ℃");
                    var icon = result['data']['current']['weather']['0']['icon'];
                    $('#currentWeather').append("<img id='weatherIcon' alt='weather icon' src=''></img>" + result['data']['current']['weather']['0']['description']);
                    var weatherUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
                    $('#weatherIcon').attr("src", weatherUrl);
                    var calculated = Math.round(result['data']['current']['wind_speed'] * 3600 / 1610.3*1000)/1000;
                    $('#wind').html(calculated + ' mph ' + direction(result['data']['current']['wind_deg']));                        var sunrise = moment(result['data']['current']['sunrise']*1000).format("HH:mm");
                    $('#sunrise').html(sunrise);
                    var sunset = moment(result['data']['current']['sunset']*1000).format("HH:mm");
                    $('#sunset').html(sunset);
                    $('#humidity').html(result['data']['current']['humidity'] + ' %');
      
                });
                //Second Day
                $("#day2").on('click', function(){
                    $("#currentWeather").empty();
                    $('.weatherHide').hide();
                    $('#temp').html("Max: " + result['data']['daily'][1]['temp']['max'] +" ℃ \n" + "Min: "  + result['data']['daily'][1]['temp']['min'] + " ℃");
                    var icon = result['data']['daily'][1]['weather']['0']['icon'];
                    $('#currentWeather').append("<img id='weatherIcon' alt='weather icon' src=''></img>" + result['data']['daily'][1]['weather']['0']['description']);
                    var weatherUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
                    $('#weatherIcon').attr("src", weatherUrl);
                    var calculated = Math.round(result['data']['daily'][1]['wind_speed'] * 3600 / 1610.3*1000)/1000;
                    $('#wind').html(calculated + ' mph ' + direction(result['data']['daily'][1]['wind_deg']));
                    $('#sunrise').html(sunrise);
                    var sunset = moment(result['data']['daily'][1]['sunset']*1000).format("HH:mm");
                    $('#sunset').html(sunset);
                    $('#humidity').html(result['data']['daily'][1]['humidity'] + ' %');
                });
                 //Third Day
                 $("#day3").on('click', function(){
                    $("#currentWeather").empty();
                    $('.weatherHide').hide();
                    $('#temp').html("Max: " + result['data']['daily'][2]['temp']['max'] +" ℃ \n" + "Min: "  + result['data']['daily'][2]['temp']['min'] + " ℃");
                    var icon = result['data']['daily'][2]['weather']['0']['icon'];
                    $('#currentWeather').append("<img id='weatherIcon' alt='weather icon' src=''></img>" + result['data']['daily'][2]['weather']['0']['description']);
                    var weatherUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
                    $('#weatherIcon').attr("src", weatherUrl);
                    var calculated = Math.round(result['data']['daily'][2]['wind_speed'] * 3600 / 1610.3*1000)/1000;
                    $('#wind').html(calculated + ' mph ' + direction(result['data']['daily'][2]['wind_deg']));
                    $('#sunrise').html(sunrise);
                    var sunset = moment(result['data']['daily'][2]['sunset']*1000).format("HH:mm");
                    $('#sunset').html(sunset);
                    $('#humidity').html(result['data']['daily'][2]['humidity'] + ' %');
                });
    
                //Fourth Day
                $("#day4").on('click', function(){
                    $("#currentWeather").empty();
                    $('.weatherHide').hide();
                    $('#temp').html("Max: " + result['data']['daily'][3]['temp']['max'] +" ℃ \n" + "Min: "  + result['data']['daily'][3]['temp']['min'] + " ℃");
                    var icon = result['data']['daily'][3]['weather']['0']['icon'];
                    $('#currentWeather').append("<img id='weatherIcon' alt='weather icon' src=''></img>" + result['data']['daily'][3]['weather']['0']['description']);
                    var weatherUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
                    $('#weatherIcon').attr("src", weatherUrl);
                    var calculated = Math.round(result['data']['daily'][3]['wind_speed'] * 3600 / 1610.3*1000)/1000;
                    $('#wind').html(calculated + ' mph ' + direction(result['data']['daily'][3]['wind_deg']));
                    $('#sunrise').html(sunrise);
                    var sunset = moment(result['data']['daily'][3]['sunset']*1000).format("HH:mm");
                    $('#sunset').html(sunset);
                    $('#humidity').html(result['data']['daily'][3]['humidity'] + ' %');
                });                  
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert(jqXHR + " There has been an error! " + errorThrown)
        }
    });     
}
//======================================================================================
//Days:
var thirdDay = moment().add(2, 'days').format('dddd');  
var fourthDay = moment().add(3, 'days').format('dddd');   ;
$("#day3").html(thirdDay);
$("#day4").html(fourthDay);

//Direction:
function direction(i) {
   if(i >= 349 && i <= 11){
           return +i + "°: N";
   } else if (i >= 12 && i <= 33) {
           return +i + "°: NNE";
   } else if (i >= 34 && i <= 56) {
           return +i + "°: NE";
   } else if (i >= 57 && i <= 78) {
           return +i + "°: ENE";
   } else if (i >= 79 && i <= 101) {
           return +i + "°: E";
   } else if (i >= 102 && i <= 123) {
           return +i + "°: ESE";
   } else if (i >= 124 && i <= 146) {
           return +i + "°: SE";
   } else if (i >= 147 && i <= 168) {
           return +i + "°: SSE";
   } else if (i >= 169 && i <= 191) {
           return +i + "°: S";
   } else if (i >= 192 && i <= 213) {
           return +i + "°: SSW";
   } else if (i >= 214 && i <= 236) {
           return +i + "°: SW";
   } else if (i >= 237 && i <= 258) {
           return +i + "°: WSW";
   } else if (i >= 259 && i <= 281) {
           return +i + "°: W";
   } else if (i >= 282 && i <= 303) {
           return +i + "°: WNW";
   } else if (i >= 304 && i <= 326) {
           return +i + "°: NW";
   } else if (i >= 327 && i <= 348) {
           return +i + "°: NNW";
   }
};

//================markerClusters============================================== 
var markerClusters = L.markerClusterGroup();
var MapIcon = L.Icon.extend({
    options: {
        iconSize:     [30, 30],
        popupAnchor:  [0, -20]
    }
});
// -------------- MapMarkers --------------------------------
function getAllInfo(country){
    // Map Markers
    getMapMarkers(country);  
}
// -------------- Get Map Markers from GeoNames --------------------------------  
function getMapMarkers(country){

    // --------------------- Capital City--------------------------------
    $.ajax({
        url: "libs/php/mapMarkers/getMapCapital.php",
        type: 'GET',
        dataType: 'json',
        data: {
            country: country.iso_a2,
        },
        success: function(result) {
          
            if (result.status.name == "ok") {                
                country.marker_capital = [result['data']['geonames']['0']['name'],result['data']['geonames']['0']['population'],result['data']['geonames']['0']['lat'],result['data']['geonames']['0']['lng']];
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(errorThrown));
        }
    }); 

    // -------------------------------- place --------------------------------
    $.ajax({
        url: "libs/php/mapMarkers/getMapCities.php",
        type: 'GET',
        dataType: 'json',
        data: {
            country: country.iso_a2,
        },
        success: function(result) {
          
            if (result.status.name == "ok") {                
                for(let i=0; i < result['data']['geonames'].length; i++){
                    country.marker_cities.push([result['data']['geonames'][i]['name'],result['data']['geonames'][i]['population'],result['data']['geonames'][i]['lat'],result['data']['geonames'][i]['lng']]);
                }
            }
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(errorThrown));
        }
    }); 
    // -------------------------------- Museums --------------------------------
    $.ajax({
        url: "libs/php/mapMarkers/getMapMuseums.php",
        type: 'GET',
        dataType: 'json',
        data: {
            country: country.iso_a2,
        },
        success: function(result) {
        
            if (result.status.name == "ok") {                
                
                for(let i=0; i < result['data']['geonames'].length; i++){
                    country.marker_museums.push([result['data']['geonames'][i]['name'],result['data']['geonames'][i]['lat'],result['data']['geonames'][i]['lng']]);
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(errorThrown));
        }
    }); 
    // -------------------------------- Universities --------------------------------
    $.ajax({
        url: "libs/php/mapMarkers/getMapUniversities.php",
        type: 'GET',
        dataType: 'json',
        data: {
            country: country.iso_a2,
        },
        success: function(result) {
        
            if (result.status.name == "ok") {                
                for(let i=0; i < result['data']['geonames'].length; i++){
                    country.marker_universities.push([result['data']['geonames'][i]['name'],result['data']['geonames'][i]['lat'],result['data']['geonames'][i]['lng']]);
                }
            }
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(JSON.stringify(errorThrown));
        }
    }); 
};
//============================================Buttons================================
//Info-
infoButton = L.easyButton({
    id: 'countryInfo',
    states:[{
      onClick: function(button, map){
        var infoIcon = L.Icon.extend({
            options: {
                iconSize:     [45, 45],
                popupAnchor:  [0, -20]
            }
        });
        var infooIcon = new infoIcon({iconUrl: 'libs/icons/info.png'});
        $("#infoModalScrollable").modal();
      },
      title: 'show country information',
      icon: "infooIcon"
    }]
  })
map.addControl(infoButton);	


//Images-
imagesButton = L.easyButton({
    id: 'image',
    states:[{
      onClick: function(button, map){
        var imageIcon = L.Icon.extend({
            options: {
                iconSize:     [45, 45],
                popupAnchor:  [0, -20]
            }
        });
    
        var imageeIcon = new imageIcon({iconUrl: 'libs/icons/image.png'});
        $("#imagesModalScrollable").modal();
      },
      title: 'show country images',
      icon: "imageeIcon"
    }]
  });
 map.addControl(imagesButton);

// Weather-
weatherButton = L.easyButton({
    id: 'weather',
    states:[{
      stateName: 'show-weather',
      onClick: function(button, map){
        var weatherIcon = L.Icon.extend({
            options: {
                iconSize:     [45, 45],
                popupAnchor:  [0, -20]
            }
        });
    
        var weatherrIcon = new weatherIcon({iconUrl: 'libs/icons/weather.png'});
        $("#weatherModalScrollable1").modal();
      },
      title: 'show the weather',
      icon: "weatherrIcon "
    }]
  })
map.addControl(weatherButton);


 //covid-
 covidButton = L.easyButton({
    id: 'covid',
    states:[{
      stateName: 'show-info',
      onClick: function(button, map){
        var covidIcon = L.Icon.extend({
            options: {
                iconSize:     [45, 45],
                popupAnchor:  [0, -20]
            }
        });
    
        var coviddIcon = new covidIcon({iconUrl: 'libs/icons/covid.png'});

        $("#covidModalScrollable").modal();
      },
      title: 'show covid information',
      icon: "coviddIcon"
    }]
  })
map.addControl(covidButton);	
//News-
	newsButton = L.easyButton({
        id: 'news',
        states:[{
          onClick: function(button, map){
            var newsIcon = L.Icon.extend({
                options: {
                    iconSize:     [45, 45],
                    popupAnchor:  [0, -20]
                }
            });
        
            var newssIcon = new newsIcon({iconUrl: 'libs/icons/news.png'});
            $("#newsModalScrollable").modal();
          },
          title: 'country news',
          icon: "newssIcon"
        }]
      });
     map.addControl(newsButton);
// ---------------------- Capital City --------------------------------
var capitalBtn = L.easyButton({
    position: 'topright',
    id: 'capital',
    states: [{
        icon: "none",
        stateName: 'unchecked',
        title: 'Show Capital City',
        onClick: function(btn,map) {            

            var countryCapitalIcon = L.Icon.extend({
                options: {
                    iconSize:     [45, 45],
                    popupAnchor:  [0, -20]
                }
            });
        
            var capitalIcon = new countryCapitalIcon({iconUrl: 'libs/icons/capitol.png'});
            var m = L.marker(new L.LatLng(currentCountry.marker_capital[2], currentCountry.marker_capital[3]), {icon: capitalIcon}).bindPopup(`
            <b>Capital City: </b> ${currentCountry.marker_capital[0]} <br>
            <b>Population: </b> ${(currentCountry.marker_capital[1] / 1000000).toFixed(1)} M
            `);
            markerClusters.addLayer( m );
            map.addLayer(markerClusters);
        }
    }, {
        icon: "none",
        stateName: 'checked',
        onClick: function(btn,map) {
            btn.state('unchecked');
        }
    }]
}).addTo(map);
// -----------------------------Show place cities--------------------------------
var cityBtn = L.easyButton({
    position: 'topright',
    id: 'cities',
    states: [{
        icon: "none",
        stateName: 'unchecked',
        title: 'Show place cities',
        onClick: function(btn,map) {

            var cityIcon = new MapIcon({iconUrl: 'libs/icons/place.png'});
                for(i=0;i<currentCountry.marker_cities.length;i++){
                    var m = L.marker(new L.LatLng(currentCountry.marker_cities[i][2], currentCountry.marker_cities[i][3]), {icon: cityIcon}).bindPopup(`
                        <b>City:</b> ${currentCountry.marker_cities[i][0]} <br> 
                        <b>Population: </b> ${currentCountry.marker_cities[i][1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} 
                    `);
                    markerClusters.addLayer( m );  
                }

            map.addLayer(markerClusters);
        }
    }, {
        icon: "none",
        stateName: 'checked',
        onClick: function(btn,map) {
            btn.state('unchecked');
        }
    }]
}).addTo(map);
// ------------------------- Museums --------------------------------
var museumsBtn = L.easyButton({
    position: 'topright',
    id: 'museums',
    states: [{
        icon: "none",
        stateName: 'unchecked',
        title: 'Show Museums',
        onClick: function(btn,map) {
        
            var museumIcon = new MapIcon({iconUrl: 'libs/icons/museum.png'});
            for(i=0;i<currentCountry.marker_museums.length;i++){
                var m = L.marker(new L.LatLng(currentCountry.marker_museums[i][1], currentCountry.marker_museums[i][2]), {icon: museumIcon}).bindPopup(`${currentCountry.marker_museums[i][0]}`);
                markerClusters.addLayer( m ); 
            }
            map.addLayer(markerClusters);
        }
    }, {
        icon: "none",
        stateName: 'checked',
        onClick: function(btn,map) {
            btn.state('unchecked');
        }
    }]
}).addTo(map);
// ----------------------------Universities --------------------------------
var universitiesBtn = L.easyButton({
    position: 'topright',
    id: 'universities',
    states: [{
        icon: "none",
        stateName: 'unchecked',
        title: 'Show Universities',
        onClick: function(btn,map) {
                   
            var uniIcon = new MapIcon({iconUrl: 'libs/icons/uni.png'});
            for(i=0;i<currentCountry.marker_universities.length;i++){
                var m = L.marker(new L.LatLng(currentCountry.marker_universities[i][1], currentCountry.marker_universities[i][2]), {icon: uniIcon}).bindPopup(`${currentCountry.marker_universities[i][0]}`);
                markerClusters.addLayer( m );
            }
            map.addLayer(markerClusters);
        }
    }, {
        icon: "none",
        stateName: 'checked',
        onClick: function(btn,map) {
            btn.state('unchecked');
        }
    }]
}).addTo(map);
