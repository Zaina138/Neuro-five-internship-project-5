const cityInput = document.getElementById("cityInput");
const searchForm = document.getElementById("searchForm");
const locationBtn = document.getElementById("locationBtn");

const status = document.getElementById("status");
const statusText = document.getElementById("statusText");

const cityName = document.getElementById("cityName");
const forecastLocation = document.getElementById("forecastLocation");

const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const feelsLike = document.getElementById("feelsLike");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const rain = document.getElementById("rain");
const pressure = document.getElementById("pressure");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const weatherIcon = document.getElementById("weatherIcon");
const currentDate = document.getElementById("currentDate");

const forecastGrid = document.getElementById("forecastGrid");


/* Weather code mapping */

const weatherInfo = {

    0: {
        label: "Clear sky",
        icon: "☀️"
    },

    1: {
        label: "Mainly clear",
        icon: "🌤️"
    },

    2: {
        label: "Partly cloudy",
        icon: "⛅"
    },

    3: {
        label: "Overcast",
        icon: "☁️"
    },

    45: {
        label: "Foggy",
        icon: "🌫️"
    },

    48: {
        label: "Foggy",
        icon: "🌫️"
    },

    51: {
        label: "Light drizzle",
        icon: "🌦️"
    },

    53: {
        label: "Drizzle",
        icon: "🌦️"
    },

    55: {
        label: "Heavy drizzle",
        icon: "🌧️"
    },

    61: {
        label: "Light rain",
        icon: "🌦️"
    },

    63: {
        label: "Rain",
        icon: "🌧️"
    },

    65: {
        label: "Heavy rain",
        icon: "🌧️"
    },

    71: {
        label: "Light snow",
        icon: "🌨️"
    },

    73: {
        label: "Snow",
        icon: "❄️"
    },

    75: {
        label: "Heavy snow",
        icon: "❄️"
    },

    80: {
        label: "Rain showers",
        icon: "🌦️"
    },

    81: {
        label: "Rain showers",
        icon: "🌧️"
    },

    82: {
        label: "Heavy showers",
        icon: "⛈️"
    },

    95: {
        label: "Thunderstorm",
        icon: "⛈️"
    },

    96: {
        label: "Thunderstorm",
        icon: "⛈️"
    },

    99: {
        label: "Thunderstorm",
        icon: "⛈️"
    }

};


/* Get weather description */

function getWeatherInfo(code) {

    return weatherInfo[code] || {
        label: "Unknown",
        icon: "🌤️"
    };

}


/* Format time */

function formatTime(time) {

    const date = new Date(time);

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}


/* Format date */

function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });

}


/* Get day */

function getDay(dateString, index) {

    if (index === 0) {
        return "Today";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
        weekday: "short"
    });

}


/* Status */

function setStatus(message, type = "normal") {

    statusText.textContent = message;

    status.classList.remove("loading", "error-state");

    if (type === "loading") {
        status.classList.add("loading");
    }

    if (type === "error") {
        status.classList.add("error-state");
    }

}


/* Search city using Open-Meteo geocoding */

async function findCity(city) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Location search failed");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found");
    }

    return data.results[0];

}


/* Get weather */

async function getWeather(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,wind_speed_10m` +
        `&hourly=precipitation_probability` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset` +
        `&timezone=auto&forecast_days=7`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Weather data unavailable");
    }

    return await response.json();

}


/* Render current weather */

function renderCurrent(place, data) {

    const current = data.current;
    const info = getWeatherInfo(current.weather_code);

    cityName.textContent = `${place.name}`;

    forecastLocation.textContent =
        `${place.name}${place.country ? ", " + place.country : ""}`;

    temperature.textContent =
        `${Math.round(current.temperature_2m)}°`;

    condition.textContent = info.label;

    feelsLike.textContent =
        `Feels like ${Math.round(current.apparent_temperature)}°`;

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    wind.textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;

    pressure.textContent =
        `${Math.round(current.pressure_msl)} hPa`;

    weatherIcon.textContent = info.icon;

    sunrise.textContent =
        formatTime(data.daily.sunrise[0]);

    sunset.textContent =
        formatTime(data.daily.sunset[0]);

    currentDate.textContent =
        formatDate(data.daily.time[0]);

    /* Rain probability */

    if (
        data.hourly &&
        data.hourly.precipitation_probability
    ) {

        const rainValue =
            data.hourly.precipitation_probability[0] ?? 0;

        rain.textContent = `${rainValue}%`;

    } else {

        rain.textContent = "0%";

    }

}


/* Render forecast */

function renderForecast(data) {

    forecastGrid.innerHTML = "";

    for (let i = 0; i < data.daily.time.length; i++) {

        const info =
            getWeatherInfo(data.daily.weather_code[i]);

        const card = document.createElement("div");

        card.className =
            `forecast-card ${i === 0 ? "today" : ""}`;

        card.innerHTML = `

            <div class="day">
                ${getDay(data.daily.time[i], i)}
            </div>

            <div class="forecast-icon">
                ${info.icon}
            </div>

            <div>
                <span class="high">
                    ${Math.round(data.daily.temperature_2m_max[i])}°
                </span>

                <span class="low">
                    ${Math.round(data.daily.temperature_2m_min[i])}°
                </span>
            </div>

        `;

        forecastGrid.appendChild(card);

    }

}


/* Main search */

async function searchWeather(city) {

    if (!city.trim()) {

        setStatus("Type a city to begin", "error");

        cityInput.focus();

        return;

    }

    try {

        setStatus("Finding your forecast...", "loading");

        const place = await findCity(city);

        const data =
            await getWeather(place.latitude, place.longitude);

        renderCurrent(place, data);

        renderForecast(data);

        setStatus(
            `Weather updated · ${place.name}`,
            "normal"
        );

        cityInput.value = "";

    } catch (error) {

        console.error(error);

        setStatus(
            "Couldn't find that city. Try another name.",
            "error"
        );

    }

}


/* Search submit */

searchForm.addEventListener("submit", function(event) {

    event.preventDefault();

    searchWeather(cityInput.value);

});


/* Current location */

locationBtn.addEventListener("click", function() {

    if (!navigator.geolocation) {

        setStatus(
            "Location isn't supported by this browser.",
            "error"
        );

        return;

    }

    setStatus("Finding your location...", "loading");

    navigator.geolocation.getCurrentPosition(

        async function(position) {

            try {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                const data =
                    await getWeather(latitude, longitude);

                const place = {
                    name: "Your location",
                    country: ""
                };

                renderCurrent(place, data);

                renderForecast(data);

                setStatus(
                    "Weather updated for your location"
                );

            } catch (error) {

                setStatus(
                    "Couldn't load your weather.",
                    "error"
                );

            }

        },

        function() {

            setStatus(
                "Location permission was not available.",
                "error"
            );

        }

    );

});


/* Initial weather */

searchWeather("Islamabad");