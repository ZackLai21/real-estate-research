var zipCodeForm = document.querySelector("#zipcodeForm");
var formButton = document.querySelector("#formButton");
var searchHistoryContainer = $("#search-history");
var aqiCard = document.querySelector('#aqi-result-color');
var commuteCard = document.querySelector('#commute-result-color');
var cleanHistory = document.querySelector("#cleanHistory");
var countyHeader = document.querySelector("#county-header");
var county = "Multnomah County";
var state = "Oregon";
var searchHistory = [];

var states = [
  ["Alabama", "01", "AL"],
  ["Alaska", "02", "AK"],
  ["Arizona", "04", "AZ"],
  ["Arkansas", "05", "AR"],
  ["California", "06", "CA"],
  ["Colorado", "08", "CO"],
  ["Connecticut", "09", "CT"],
  ["Delaware", "10", "DE"],
  ["District of Columbia", "11", "DC"],
  ["Florida", "12", "FL"],
  ["Georgia", "13", "GA"],
  ["Hawaii", "15", "HI"],
  ["Idaho", "16", "ID"],
  ["Illinois", "17", "IL"],
  ["Indiana", "18", "IN"],
  ["Iowa", "19", "IA"],
  ["Kansas", "20", "KS"],
  ["Kentucky", "21", "KY"],
  ["Louisiana", "22", "LA"],
  ["Maine", "23", "ME"],
  ["Maryland", "24", "MD"],
  ["Massachusetts", "25", "MA"],
  ["Michigan", "26", "MI"],
  ["Mississippi", "28", "MS"],
  ["Missouri", "29", "MO"],
  ["Montana", "30", "MT"],
  ["Nebraska", "31", "NE"],
  ["Nevada", "32", "NV"],
  ["New Hampshire", "33", "NH"],
  ["New Jersey", "34", "NJ"],
  ["New Mexico", "35", "NM"],
  ["New York", "36", "NY"],
  ["North Carolina", "37", "NC"],
  ["North Dakota", "38", "ND"],
  ["Ohio", "39", "OH"],
  ["Oklahoma", "40", "OK"],
  ["Oregon", "41", "OR"],
  ["Pennsylvania", "42", "PA"],
  ["Rhode Island", "44", "RI"],
  ["South Carolina", "45", "SC"],
  ["South Dakota", "46", "SD"],
  ["Tennessee", "47", "TN"],
  ["Texas", "48", "TX"],
  ["Utah", "49", "UT"],
  ["Vermont", "50", "VT"],
  ["Virginia", "51", "VA"],
  ["Washington", "53", "WA"],
  ["West Virginia", "54", "WV"],
  ["Wisconsin", "55", "WI"],
  ["Wyoming", "56", "WY"],
];


searchHistory = localStorage.getItem("search-history");
  if (searchHistory) {
    searchHistory = JSON.parse(searchHistory);      
  } else {
    searchHistory = [];
};
  
displayButtons();

function getStateCode(state) {
  for (i = 0; i < states.length; i++) {
    if (states[i][2] === state) {
      var stateCode = states[i][1];
      state = states[i][0];
      searchCounties(state, stateCode);
    }
  }
}

function searchCounties(state, stateCode) {
  var apiUrlCounties =
    "https://api.census.gov/data/2019/acs/acs1/profile?get=NAME&for=county:*&in=state:" +
    stateCode;
  fetch(apiUrlCounties)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          for (i = 0; i < data.length; i++) {
            if (data[i][0] === county + ", " + state) {
              var countyCode = data[i][2];
              searchCensus(countyCode, stateCode);
            }
          }
        });
      } else {
        alert("Error: " + response.statusText);
      }
    })
    .catch(function (error) {
      alert("Unable to connect to Census API");
    });
}

function searchCensus(countyCode, stateCode) {
  var apiUrl =
    "https://api.census.gov/data/2019/acs/acs1/profile?get=NAME,DP03_0025E&for=county:" +
    countyCode +
    "&in=state:" +
    stateCode;
  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        return response.json().then(function (data) {
          displayCommuteResults(data[1][0], data[1][1]);
        });
      } else {
        alert("Error: " + response.statusText);
      }
    })
    .catch(function (error) {
      alert("Unable to connect to Census API");
    });
}

function displayCommuteResults(countyAndState, commute) {
  var commuteResultEl = document.querySelector("#commute-results");
  var resultCounty = document.createElement("h1");
  var resultAverageCommute = document.createElement("h3");
  resultCounty.textContent = countyAndState;
  resultAverageCommute.textContent = commute + " Minutes";
  commuteResultEl.innerHTML = "";
  commuteCard.classList.remove("short-commute");
  commuteCard.classList.remove("medium-commute");
  commuteCard.classList.remove("long-commute");
  commuteCard.classList.remove("extreme-commute");
  if (commute < 20) {
    commuteCard.classList.add("short-commute");
  } else if (commute >= 20 && commute < 25) {
    commuteCard.classList.add("medium-commute");
  } else if (commute >= 25 && commute < 30) {
    commuteCard.classList.add("long-commute");
  } else {
    commuteCard.classList.add("extreme-commute");
  };
  countyHeader.innerHTML = "";
  countyHeader.appendChild(resultCounty);
  commuteResultEl.appendChild(resultAverageCommute);
}

function convertZipcode(zipcode) {
  url =
    "https://api.zip-codes.com/ZipCodesAPI.svc/1.0/QuickGetZipCodeDetails/" + zipcode + "?key=AWDFK5LAOYYN6V8BAL5L";
  fetch(url).then(function (response) {
    response.json().then(function (data) {
      state = data.State;
      console.log(data);
      var lowerCaseCounty = data.County.toLowerCase();
      county = lowerCaseCounty.split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ') + " County";
      if(county.includes("And")){
        county=county.replace('And','and');
      }
      console.log(zipcode + " " + county)
      addSearchToHistory(zipcode,county);
      getStateCode(state);
    });
  });
}

function searchAQI(zipcode) {
  var apiUrl =
    "https://www.airnowapi.org/aq/observation/zipCode/current/?format=application/json&zipCode=" +
    zipcode +
    "&distance=50&API_KEY=2CB4B124-5DF8-4E33-8F3D-7ECDDC9AB3D5";
  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          if (data.length === 0) {
            var elems = document.getElementById('modal1');
            var instance = M.Modal.init(elems);
            instance.open();
            return;
          }
          localStorage.setItem("AQI", data[0].AQI);
          localStorage.setItem("AQICategoryName", data[0].Category.Name);
          localStorage.setItem("AQICategoryNumber", data[0].Category.Number);
          displayAQI(data[0]);
        });
      } else {
        alert("Error:" + response.statusText);
      }
    })
    .catch(function (error) {
      alert("Unable to connect to Air Now API");
    });
}

function displayAQI(aqi) {
  var AQIResultEl = document.querySelector("#AQI-results");
  var AQIEl = document.createElement("h3");
  var AQI = aqi.AQI;
  var AQICategoryName = aqi.Category.Name;
  var AQICategoryNumber = aqi.Category.Number;
  if (AQICategoryNumber === 1) {
    aqiCard.classList.add("low-risk");
  } else if (AQICategoryNumber === 2) {
    aqiCard.classList.add("medium-risk");
  } else if (AQICategoryNumber === 3) {
    aqiCard.classList.add("high-risk");
  } else {
    aqiCard.classList.add("extreme-risk");
  };
  AQIEl.textContent = AQI + " - " + AQICategoryName;
  AQIResultEl.innerHTML = "";
  AQIResultEl.appendChild(AQIEl);
}

function displayButtons() {
  searchHistoryContainer.empty();
  if (searchHistory.length > 10) {
    searchHistory.pop();
  }
  for (i = 0; i < searchHistory.length; i++) {
      var button = $("<button>")
      .attr({
        type: "button",
        class: "btn-search",
      })
      .text(searchHistory[i].countyHistory + "---" + searchHistory[i].zip);
    
    searchHistoryContainer.append(button);

  }
}

function addSearchToHistory(zipcode,county) {
  if (searchHistory.some(e => e.zip === zipcode)){
    return;
  } else {
    var searchHistoryItem = {
      countyHistory: county,
      zip: zipcode,
    };
      searchHistory.unshift(searchHistoryItem);
      console.log(searchHistory);
      localStorage.setItem("search-history", JSON.stringify(searchHistory));
      displayButtons();
}
}

function captureZip(e) {
  e.preventDefault();
  var zipCodeEntry = $("#zip").val().trim();
  searchAQI(zipCodeEntry);
  convertZipcode(zipCodeEntry);
}

zipCodeForm.addEventListener("submit", captureZip);

$(document).ready(function(){
  $('.tooltipped').tooltip({delay: 50, tooltip: 'some text', html: true});
});

function clean(e){
  e.preventDefault();
  localStorage.clear();
  searchHistory=[];
  historyCounty=[];
  displayButtons();
}

cleanHistory.addEventListener('click',clean)

// //Open  weather api returning historical daily info, goes back a full year
// function randomCall() {
//   var apiUrl =
//     "http://api.openweathermap.org/data/2.5/air_pollution/history?lat=50&lon=50&start=1606400802&end=1606482999&appid=7d95785c4f00ca95a4efd6fc636475f4";
//   fetch(apiUrl)
//     .then(function (response) {
//       if (response.ok) {
//         response.json().then(function (data) {
//           console.log(data);
//           if (data.length === 0) {
//             console.log("no data from AQI");
//             return;
//           }
//    console.log(data); 
//         });
//       } else {
//         alert("Error:" + response.statusText);
//       }
//     })
//     .catch(function (error) {
//       alert("Unable to connect to Air Now API");
//     });
//   }

//   randomCall();



function handleSearchClick() {
  var zipcode = this.textContent.split('---')[1];
  convertZipcode(zipcode);
  searchAQI(zipcode);
}

searchHistoryContainer.on("click", ".btn-search",handleSearchClick );