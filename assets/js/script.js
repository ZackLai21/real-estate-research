var searchHistoryContainer = $("#search-history");
var searchHistory = [];

var county = "Multnomah County";
var state = "Oregon";

var zipCodeForm = document.querySelector("#zipcodeForm");
var zipCodeForm1 = document.querySelector("#zipcodeForm1");
var formButton = document.querySelector("#formButton");

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
        response.json().then(function (data) {
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

function displayCommuteResults(commute, countyAndState) {
  var commuteResultEl = document.querySelector("#commute-results");
  var resultCounty = document.createElement("h2");
  var resultAverageCommute = document.createElement("h2");
  resultCounty.textContent = countyAndState;
  resultAverageCommute.textContent = commute;
  commuteResultEl.innerHTML = "";
  commuteResultEl.appendChild(resultCounty);
  commuteResultEl.appendChild(resultAverageCommute);
}

function convertZipcode(zipcode) {
  url =
    "https://api.zip-codes.com/ZipCodesAPI.svc/1.0/QuickGetZipCodeDetails/" + zipcode + "?key=AWDFK5LAOYYN6V8BAL5L";
  fetch(url).then(function (response) {
    response.json().then(function (data) {
      state = data.State;
      var lowerCaseCounty = data.County.toLowerCase();
      county = lowerCaseCounty.split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ') + " County";
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
            console.log("no data from AQI");
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
  var AQIEl = document.createElement("h2");
  var AQICategoryNameEl = document.createElement("h2");
  var AQICategoryNumberEl = document.createElement("h2");
  var AQI = aqi.AQI;
  var AQICategoryName = aqi.Category.Name;
  var AQICategoryNumber = aqi.Category.Number;

  AQIEl.textContent = AQI;
  AQICategoryNameEl.textContent = AQICategoryName;
  AQICategoryNumberEl.textContent = AQICategoryNumber;
  AQIResultEl.innerHTML = "";
  AQIResultEl.appendChild(AQIEl);
  AQIResultEl.appendChild(AQICategoryNameEl);
  AQIResultEl.appendChild(AQICategoryNumberEl);
}

function initSeachHistory() {
  searchHistory = localStorage.getItem("search-history");
    if (searchHistory) {
      searchHistory = JSON.parse(searchHistory);
      displayButtons();
    } else {
      searchHistory = [];
  }
}

function displayButtons() {
  searchHistoryContainer.innerHTML = "";
  for (var i = searchHistory.length - 1; i >= 0; i--) {
      var button = $("<button>")
      .attr({
        type: "button",
        class: "btn-search",
      })
      .text(searchHistory[i]);
    
    searchHistoryContainer.append(button);
  }
}



function addSearchToHistory(query) {
  searchHistory.push(query);
  localStorage.setItem("search-history", JSON.stringify(searchHistory));
  searchHistoryContainer.innerHTML = "";
  displayButtons();
}

function captureZip(e) {
  e.preventDefault();
  var zipCodeEntry = $("#zip").val().trim();
  searchAQI(zipCodeEntry);
  convertZipcode(zipCodeEntry);
  addSearchToHistory(zipCodeEntry);
}

zipCodeForm.addEventListener("submit", captureZip);

searchHistoryContainer.innerHTML = "";
initSeachHistory();
