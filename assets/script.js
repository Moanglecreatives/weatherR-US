document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const logoutBtn = document.getElementById("logoutBtn");
    const resultsDiv = document.getElementById("results");

    // Ensure resultsDiv exists before trying to modify its style
    if (resultsDiv) {
        resultsDiv.style.display = "none"; // Hide results on page load
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            if (username === "admin" && password === "password") {
                localStorage.setItem("isLoggedIn", "true");
                window.location.href = "dashboard.html";
            } else {
                document.getElementById("error-message").textContent = "Invalid username or password!";
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("isLoggedIn");
            window.location.href = "index.html";
        });
    }
});


//========================= Get Weather ==============================//
function getWeather() {

    const resultsDiv = document.getElementById("results"); 
    resultsDiv.style.display = "flex";

    const apiKey = '5a876642351109dd856659747d6bd117';
    const city = document.getElementById('city').value;

    if (!city) {
        alert('Please enter a city');
        return;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
            checkForAnomalies(data);
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
            alert('Error fetching current weather data. Please try again.');
        });

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayHourlyForecast(data.list);
        })
        .catch(error => {
            console.error('Error fetching hourly forecast data:', error);
            alert('Error fetching hourly forecast data. Please try again.');
        });
}

function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');
    const hourlyForecastDiv = document.getElementById('hourly-forecast');

    // Clear previous content
    weatherInfoDiv.innerHTML = '';
    hourlyForecastDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const cityName = data.name;
        const temperature = Math.round(data.main.temp); // Already in Celsius
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        tempDivInfo.innerHTML = `<h2>${temperature}°C</h2>`;
        weatherInfoDiv.innerHTML = `
            <h3>${cityName}</h3>
            <p>${description.charAt(0).toUpperCase() + description.slice(1)}</p>
        `;
        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;
        showImage();
    }
}

function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    hourlyForecastDiv.innerHTML = ''; // Clear previous content

    // Create and append the title separately
    const title = document.createElement('h3');
    title.textContent = 'Hourly Forecast';
    title.classList.add('hourly-title'); // Add a class for styling
    hourlyForecastDiv.appendChild(title);

    // Create the main container for the hourly forecast items
    const hourlyContainer = document.createElement('div');
    hourlyContainer.classList.add('hourly-container');

    const next24Hours = hourlyData.slice(0, 8); // Display next 24 hours (3-hour intervals)

    next24Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000); // Convert timestamp to milliseconds
        const hour = dateTime.getHours();
        const temperature = Math.round(item.main.temp);
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItemHtml = `
            <div class="hourly-item fancy-box">
                <span>${hour}:00</span>
                <img src="${iconUrl}" alt="Hourly Weather Icon">
                <span>${temperature}°C</span>
            </div>
        `;

        hourlyContainer.innerHTML += hourlyItemHtml; // Append each item inside the container
    });

    hourlyForecastDiv.appendChild(hourlyContainer); // Append the container after the title
}


function checkForAnomalies(data) {
    let anomalies = [];

    if (data.main.temp > 40) anomalies.push("🔥 Extreme Heat Alert!");
    if (data.main.temp < -5) anomalies.push("❄️ Extreme Cold Alert!");
    if (data.wind.speed > 20) anomalies.push("💨 Strong Wind Warning!");
    if (data.weather[0].main === "Thunderstorm") anomalies.push("⛈️ Thunderstorm Alert!");
    if (data.weather[0].main === "Tornado") anomalies.push("🌪️ Tornado Warning!");
    if (data.rain && data.rain["1h"] > 10) anomalies.push("☔ Heavy Rain Warning!");

    const anomalyDiv = document.getElementById("weather-anomalies");
    anomalyDiv.innerHTML = "<h3>Weather Anomalies</h3>";

    if (anomalies.length > 0) {
        anomalyDiv.innerHTML += `<div class='myList'><ul class='anomaly-list'>` + anomalies.map(a => `<li>${a}</li>`).join("") + "</ul></div>";
        anomalyDiv.style.color = "red";
    } else {
        anomalyDiv.innerHTML += "<p>No weather anomalies detected.</p>";
    }
}


function showImage() {
    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.style.display = 'block'; // Make the image visible once it's loaded
}
