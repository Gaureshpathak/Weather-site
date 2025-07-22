// ========== ENHANCED WEATHER APP CLASS ==========
class EnhancedWeatherApp {
  constructor() {
    // API Configuration
    this.apiKey = "b1fd6e14799699504191b6bdbcadfc35";
    this.baseUrl = "https://api.openweathermap.org/data/2.5";
    
    // App State
    this.isCelsius = true;
    this.currentWeatherData = null;
    this.forecastData = null;
    this.currentTheme = 'default';
    this.favoriteCities = [];
    
    // Initialize app
    this.initializeElements();
    this.setupEventListeners();
    this.loadUserPreferences();
    this.initializeApp();
  }

  // ========== INITIALIZATION ==========
  initializeElements() {
    // Desktop elements
    this.elements = {
      // Search elements
      citySearch: document.getElementById('citySearch'),
      mobileSearch: document.getElementById('mobileSearch'),
      searchSuggestions: document.getElementById('searchSuggestions'),
      
      // Control buttons
      locationBtn: document.getElementById('locationBtn'),
      mobileLocationBtn: document.getElementById('mobileLocationBtn'),
      unitToggle: document.getElementById('unitToggle'),
      mobileUnitToggle: document.getElementById('mobileUnitToggle'),
      refreshBtn: document.getElementById('refreshBtn'),
      mobileRefreshBtn: document.getElementById('mobileRefreshBtn'),
      themeToggle: document.getElementById('themeToggle'),
      mobileThemeToggle: document.getElementById('mobileThemeToggle'),
      
      // Display containers
      messageContainer: document.getElementById('messageContainer'),
      welcomeScreen: document.getElementById('welcomeScreen'),
      currentWeatherCard: document.getElementById('currentWeatherCard'),
      forecastSection: document.getElementById('forecastSection'),
      hourlySection: document.getElementById('hourlySection'),
      additionalInfo: document.getElementById('additionalInfo'),
      
      // Weather display elements
      locationName: document.getElementById('locationName'),
      cityName: document.getElementById('cityName'),
      countryName: document.getElementById('countryName'),
      currentTime: document.getElementById('currentTime'),
      coordinates: document.getElementById('coordinates'),
      currentWeatherIcon: document.getElementById('currentWeatherIcon'),
      weatherCondition: document.getElementById('weatherCondition'),
      mainTemperature: document.getElementById('mainTemperature'),
      highTemp: document.getElementById('highTemp'),
      lowTemp: document.getElementById('lowTemp'),
      
      // Weather details
      feelsLike: document.getElementById('feelsLike'),
      humidity: document.getElementById('humidity'),
      windSpeed: document.getElementById('windSpeed'),
      windDirection: document.getElementById('windDirection'),
      visibility: document.getElementById('visibility'),
      pressure: document.getElementById('pressure'),
      sunrise: document.getElementById('sunrise'),
      sunset: document.getElementById('sunset'),
      
      // Forecast containers
      forecastContainer: document.getElementById('forecastContainer'),
      hourlyContainer: document.getElementById('hourlyContainer'),
      
      // Additional info
      airQuality: document.getElementById('airQuality'),
      airQualityDesc: document.getElementById('airQualityDesc'),
      uvIndex: document.getElementById('uvIndex'),
      uvDesc: document.getElementById('uvDesc'),
      
      // Background
      backgroundOverlay: document.getElementById('backgroundOverlay'),
      
      // FAB elements
      fabMain: document.getElementById('fabMain'),
      fabOptions: document.getElementById('fabOptions'),
      fabFavorite: document.getElementById('fabFavorite'),
      fabShare: document.getElementById('fabShare'),
      fabSettings: document.getElementById('fabSettings')
    };
  }

  setupEventListeners() {
    // Search functionality
    this.elements.citySearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSearch(e.target.value);
    });
    
    this.elements.mobileSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSearch(e.target.value);
    });

    // Location buttons
    this.elements.locationBtn.addEventListener('click', () => this.getCurrentLocation());
    this.elements.mobileLocationBtn.addEventListener('click', () => this.getCurrentLocation());

    // Unit toggle buttons
    this.elements.unitToggle.addEventListener('click', () => this.toggleTemperatureUnit());
    this.elements.mobileUnitToggle.addEventListener('click', () => this.toggleTemperatureUnit());
    this.elements.mainTemperature.addEventListener('click', () => this.toggleTemperatureUnit());

    // Refresh buttons
    this.elements.refreshBtn.addEventListener('click', () => this.refreshWeatherData());
    this.elements.mobileRefreshBtn.addEventListener('click', () => this.refreshWeatherData());

    // Theme buttons
    this.elements.themeToggle.addEventListener('click', () => this.cycleTheme());
    this.elements.mobileThemeToggle.addEventListener('click', () => this.cycleTheme());

    // FAB functionality
    this.elements.fabMain.addEventListener('click', () => this.toggleFAB());
    this.elements.fabFavorite.addEventListener('click', () => this.toggleFavorite());
    this.elements.fabShare.addEventListener('click', () => this.shareWeather());
    this.elements.fabSettings.addEventListener('click', () => this.showSettings());

    // Auto-refresh every 10 minutes
    setInterval(() => {
      if (this.currentWeatherData) {
        this.refreshWeatherData();
      }
    }, 600000);

    // Update time every minute
    setInterval(() => this.updateCurrentTime(), 60000);
  }

  initializeApp() {
    this.showWelcomeScreen();
    this.updateCurrentTime();
  }

  // ========== SEARCH FUNCTIONALITY ==========
  async handleSearch(city) {
    if (!city || city.trim() === '') {
      this.showMessage('Please enter a city name', 'error');
      return;
    }

    const cityName = city.trim();
    this.showLoadingState('Searching for weather data...');

    try {
      // Fetch both current weather and forecast
      const [weatherData, forecastData] = await Promise.all([
        this.fetchCurrentWeather(cityName),
        this.fetchForecast(cityName)
      ]);

      this.currentWeatherData = weatherData;
      this.forecastData = forecastData;

      // Update displays
      this.hideWelcomeScreen();
      this.updateCurrentWeatherDisplay();
      this.updateForecastDisplay();
      this.updateHourlyDisplay();
      this.updateAdditionalInfo();
      this.updateBackgroundTheme(weatherData.weather[0].main);
      
      this.hideMessage();
      this.saveRecentSearch(cityName);

    } catch (error) {
      console.error('Search error:', error);
      this.showMessage('City not found. Please check the spelling and try again.', 'error');
    }
  }

  async fetchCurrentWeather(city) {
    const url = `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  async fetchForecast(city) {
    const url = `${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  // ========== GEOLOCATION ==========
  getCurrentLocation() {
    if (!navigator.geolocation) {
      this.showMessage('Geolocation is not supported by this browser', 'error');
      return;
    }

    this.showLoadingState('Getting your location...');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => this.handleLocationSuccess(position),
      (error) => this.handleLocationError(error),
      options
    );
  }

  async handleLocationSuccess(position) {
    try {
      const { latitude, longitude } = position.coords;
      
      const [weatherData, forecastData] = await Promise.all([
        this.fetchWeatherByCoords(latitude, longitude),
        this.fetchForecastByCoords(latitude, longitude)
      ]);

      this.currentWeatherData = weatherData;
      this.forecastData = forecastData;

      // Update search inputs with city name
      this.elements.citySearch.value = weatherData.name;
      this.elements.mobileSearch.value = weatherData.name;

      // Update displays
      this.hideWelcomeScreen();
      this.updateCurrentWeatherDisplay();
      this.updateForecastDisplay();
      this.updateHourlyDisplay();
      this.updateAdditionalInfo();
      this.updateBackgroundTheme(weatherData.weather[0].main);
      
      this.hideMessage();
      this.showMessage(`Weather updated for your current location: ${weatherData.name}`, 'success');

    } catch (error) {
      console.error('Location weather fetch error:', error);
      this.showMessage('Could not get weather data for your location', 'error');
    }
  }

  handleLocationError(error) {
    let message = 'Could not access your location. ';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message += 'Location access denied by user.';
        break;
      case error.POSITION_UNAVAILABLE:
        message += 'Location information unavailable.';
        break;
      case error.TIMEOUT:
        message += 'Location request timed out.';
        break;
      default:
        message += 'An unknown error occurred.';
        break;
    }
    
    this.showMessage(message, 'error');
  }

  async fetchWeatherByCoords(lat, lon) {
    const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
    const response = await fetch(url);
    return await response.json();
  }

  async fetchForecastByCoords(lat, lon) {
    const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
    const response = await fetch(url);
    return await response.json();
  }

  // ========== DISPLAY UPDATES ==========
  updateCurrentWeatherDisplay() {
    const data = this.currentWeatherData;
    
    // Location info
    this.elements.cityName.textContent = data.name;
    this.elements.countryName.textContent = data.sys.country;
    this.elements.coordinates.textContent = `${data.coord.lat.toFixed(2)}°, ${data.coord.lon.toFixed(2)}°`;
    
    // Weather condition
    this.elements.currentWeatherIcon.textContent = this.getWeatherEmoji(data.weather[0].main, data.weather[0].id);
    this.elements.weatherCondition.textContent = this.capitalizeWords(data.weather[0].description);
    
    // Temperature
    this.updateTemperatureDisplay();
    
    // Weather details
    this.elements.humidity.textContent = `${data.main.humidity}%`;
    this.elements.windSpeed.textContent = `${data.wind.speed} m/s`;
    this.elements.windDirection.textContent = this.getWindDirection(data.wind.deg);
    this.elements.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    this.elements.pressure.textContent = `${data.main.pressure} hPa`;
    this.elements.sunrise.textContent = this.formatTime(data.sys.sunrise);
    this.elements.sunset.textContent = this.formatTime(data.sys.sunset);
    
    // Show the weather card
    this.elements.currentWeatherCard.style.display = 'block';
  }

  updateForecastDisplay() {
    const dailyForecast = this.processDailyForecast(this.forecastData.list);
    
    this.elements.forecastContainer.innerHTML = '';
    
    dailyForecast.forEach((day, index) => {
      const forecastCard = this.createForecastCard(day, index === 0);
      this.elements.forecastContainer.appendChild(forecastCard);
    });
    
    this.elements.forecastSection.style.display = 'block';
  }

  updateHourlyDisplay() {
    const hourlyForecast = this.processHourlyForecast(this.forecastData.list);
    
    this.elements.hourlyContainer.innerHTML = '';
    
    hourlyForecast.forEach(hour => {
      const hourlyCard = this.createHourlyCard(hour);
      this.elements.hourlyContainer.appendChild(hourlyCard);
    });
    
    this.elements.hourlySection.style.display = 'block';
  }

  updateAdditionalInfo() {
    // Air quality (mock data - requires separate API)
    this.elements.airQuality.textContent = 'Good';
    this.elements.airQualityDesc.textContent = 'Air quality is satisfactory';
    
    // UV Index (mock data - requires separate API)
    this.elements.uvIndex.textContent = '5';
    this.elements.uvDesc.textContent = 'Moderate - Use sun protection';
    
    this.elements.additionalInfo.style.display = 'block';
  }

  updateTemperatureDisplay() {
    const data = this.currentWeatherData;
    const unit = this.isCelsius ? 'C' : 'F';
    
    this.elements.mainTemperature.textContent = `${this.convertTemperature(data.main.temp)}°${unit}`;
    this.elements.feelsLike.textContent = `${this.convertTemperature(data.main.feels_like)}°${unit}`;
    this.elements.highTemp.textContent = `${this.convertTemperature(data.main.temp_max)}°`;
    this.elements.lowTemp.textContent = `${this.convertTemperature(data.main.temp_min)}°`;
    
    // Update unit toggle buttons
    this.elements.unitToggle.querySelector('.btn-text').textContent = this.isCelsius ? '°C' : '°F';
    this.elements.mobileUnitToggle.textContent = this.isCelsius ? '°C' : '°F';
  }

  // ========== FORECAST PROCESSING ==========
  processDailyForecast(forecastList) {
    const dailyData = new Map();
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();
      
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, {
          date: date,
          temps: [item.main.temp],
          weather: item.weather[0],
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
          precipitation: item.rain ? item.rain['3h'] || 0 : 0
        });
      } else {
        dailyData.get(dateKey).temps.push(item.main.temp);
      }
    });
    
    return Array.from(dailyData.values()).slice(0, 5).map(day => ({
      ...day,
      maxTemp: Math.max(...day.temps),
      minTemp: Math.min(...day.temps)
    }));
  }

  processHourlyForecast(forecastList) {
    return forecastList.slice(0, 8).map(item => ({
      time: new Date(item.dt * 1000),
      temp: item.main.temp,
      weather: item.weather[0],
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
      precipitation: item.rain ? item.rain['3h'] || 0 : 0
    }));
  }

  createForecastCard(dayData, isToday = false) {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    
    const dayName = isToday ? 'Today' : dayData.date.toLocaleDateString('en-US', { weekday: 'short' });
    const date = dayData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    card.innerHTML = `
      <div class="forecast-day">${dayName}</div>
      <div class="forecast-date">${date}</div>
      <div class="forecast-icon">${this.getWeatherEmoji(dayData.weather.main, dayData.weather.id)}</div>
      <div class="forecast-condition">${this.capitalizeWords(dayData.weather.description)}</div>
      <div class="forecast-temps">
        <span class="forecast-high">${this.convertTemperature(dayData.maxTemp)}°</span>
        <span class="forecast-low">${this.convertTemperature(dayData.minTemp)}°</span>
      </div>
      <div class="forecast-details">
        <div class="detail-item">💧 ${dayData.humidity}%</div>
        <div class="detail-item">💨 ${dayData.windSpeed.toFixed(1)} m/s</div>
      </div>
    `;
    
    return card;
  }

  createHourlyCard(hourData) {
    const card = document.createElement('div');
    card.className = 'hourly-card';
    
    const time = hourData.time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      hour12: true 
    });
    
    card.innerHTML = `
      <div class="hourly-time">${time}</div>
      <div class="hourly-icon">${this.getWeatherEmoji(hourData.weather.main, hourData.weather.id)}</div>
      <div class="hourly-temp">${this.convertTemperature(hourData.temp)}°</div>
      <div class="hourly-details">
        <div class="hourly-humidity">💧 ${hourData.humidity}%</div>
        <div class="hourly-wind">💨 ${hourData.windSpeed.toFixed(1)}</div>
      </div>
    `;
    
    return card;
  }

  // ========== UTILITY FUNCTIONS ==========
  getWeatherEmoji(condition, weatherId) {
    const emojiMap = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '🌨️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️',
      'Dust': '🌪️',
      'Sand': '🌪️',
      'Ash': '🌋',
      'Squall': '💨',
      'Tornado': '🌪️'
    };
    
    return emojiMap[condition] || '🌤️';
  }

  getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  capitalizeWords(str) {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  convertTemperature(celsius) {
    if (this.isCelsius) {
      return Math.round(celsius);
    } else {
      return Math.round((celsius * 9/5) + 32);
    }
  }

  updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    const dateString = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (this.elements.currentTime) {
      this.elements.currentTime.textContent = `${timeString} • ${dateString}`;
    }
  }

  // ========== UI STATE MANAGEMENT ==========
  showWelcomeScreen() {
    this.elements.welcomeScreen.style.display = 'flex';
    this.elements.currentWeatherCard.style.display = 'none';
    this.elements.forecastSection.style.display = 'none';
    this.elements.hourlySection.style.display = 'none';
    this.elements.additionalInfo.style.display = 'none';
  }

  hideWelcomeScreen() {
    this.elements.welcomeScreen.style.display = 'none';
  }

  showLoadingState(message = 'Loading...') {
    this.showMessage(message, 'loading');
  }

  showMessage(text, type = 'info') {
    const messageContainer = this.elements.messageContainer;
    messageContainer.textContent = text;
    messageContainer.className = `message ${type}`;
    messageContainer.style.display = 'block';
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
      setTimeout(() => this.hideMessage(), 3000);
    }
  }

  hideMessage() {
    this.elements.messageContainer.style.display = 'none';
  }

  // ========== TEMPERATURE UNIT TOGGLE ==========
  toggleTemperatureUnit() {
    this.isCelsius = !this.isCelsius;
    
    if (this.currentWeatherData) {
      this.updateTemperatureDisplay();
      this.updateForecastDisplay();
      this.updateHourlyDisplay();
    }
    
    this.saveUserPreferences();
  }

  // ========== THEME MANAGEMENT ==========
  cycleTheme() {
    const themes = ['default', 'dark', 'blue', 'sunset'];
    const currentIndex = themes.indexOf(this.currentTheme);
    this.currentTheme = themes[(currentIndex + 1) % themes.length];
    
    document.body.className = `theme-${this.currentTheme}`;
    this.saveUserPreferences();
  }

  updateBackgroundTheme(weatherCondition) {
    const weatherThemes = {
      'Clear': 'sunny',
      'Clouds': 'cloudy',
      'Rain': 'rainy',
      'Drizzle': 'rainy',
      'Thunderstorm': 'stormy',
      'Snow': 'snowy',
      'Mist': 'misty',
      'Fog': 'misty',
      'Haze': 'misty'
    };
    
    const themeClass = weatherThemes[weatherCondition] || 'default';
    
    if (this.elements.backgroundOverlay) {
      this.elements.backgroundOverlay.className = `background-overlay ${themeClass}`;
    }
  }

  // ========== DATA REFRESH ==========
  async refreshWeatherData() {
    if (!this.currentWeatherData) {
      this.showMessage('No weather data to refresh', 'error');
      return;
    }
    
    const cityName = this.currentWeatherData.name;
    this.showLoadingState('Refreshing weather data...');
    
    try {
      const [weatherData, forecastData] = await Promise.all([
        this.fetchCurrentWeather(cityName),
        this.fetchForecast(cityName)
      ]);
      
      this.currentWeatherData = weatherData;
      this.forecastData = forecastData;
      
      this.updateCurrentWeatherDisplay();
      this.updateForecastDisplay();
      this.updateHourlyDisplay();
      this.updateAdditionalInfo();
      this.updateBackgroundTheme(weatherData.weather[0].main);
      
      this.hideMessage();
      this.showMessage('Weather data refreshed successfully', 'success');
      
    } catch (error) {
      console.error('Refresh error:', error);
      this.showMessage('Failed to refresh weather data', 'error');
    }
  }

  // ========== FAB (Floating Action Button) FUNCTIONALITY ==========
  toggleFAB() {
    const fabOptions = this.elements.fabOptions;
    const isActive = fabOptions.classList.contains('active');
    
    if (isActive) {
      fabOptions.classList.remove('active');
      this.elements.fabMain.classList.remove('active');
    } else {
      fabOptions.classList.add('active');
      this.elements.fabMain.classList.add('active');
    }
  }

  toggleFavorite() {
    if (!this.currentWeatherData) {
      this.showMessage('No weather data to add to favorites', 'error');
      return;
    }
    
    const cityName = this.currentWeatherData.name;
    const cityData = {
      name: cityName,
      country: this.currentWeatherData.sys.country,
      coords: {
        lat: this.currentWeatherData.coord.lat,
        lon: this.currentWeatherData.coord.lon
      }
    };
    
    const existingIndex = this.favoriteCities.findIndex(city => city.name === cityName);
    
    if (existingIndex > -1) {
      this.favoriteCities.splice(existingIndex, 1);
      this.showMessage(`${cityName} removed from favorites`, 'success');
    } else {
      this.favoriteCities.push(cityData);
      this.showMessage(`${cityName} added to favorites`, 'success');
    }
    
    this.saveUserPreferences();
    this.toggleFAB();
  }

  async shareWeather() {
    if (!this.currentWeatherData) {
      this.showMessage('No weather data to share', 'error');
      return;
    }
    
    const data = this.currentWeatherData;
    const temp = this.convertTemperature(data.main.temp);
    const unit = this.isCelsius ? '°C' : '°F';
    
    const shareText = `Current weather in ${data.name}, ${data.sys.country}:
${this.capitalizeWords(data.weather[0].description)} ${temp}${unit}
Feels like ${this.convertTemperature(data.main.feels_like)}${unit}
Humidity: ${data.main.humidity}%
Wind: ${data.wind.speed} m/s ${this.getWindDirection(data.wind.deg)}

Via Enhanced Weather App`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Weather Update',
          text: shareText
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        this.showMessage('Weather data copied to clipboard', 'success');
      }).catch(() => {
        this.showMessage('Failed to copy weather data', 'error');
      });
    }
    
    this.toggleFAB();
  }

  showSettings() {
    // Simple settings alert for now
    const currentUnit = this.isCelsius ? 'Celsius' : 'Fahrenheit';
    const settings = `Current Settings:
• Temperature Unit: ${currentUnit}
• Theme: ${this.currentTheme}
• Favorite Cities: ${this.favoriteCities.length}

Click the theme button to change themes
Click the temperature to toggle units`;
    
    alert(settings);
    this.toggleFAB();
  }

  // ========== STORAGE MANAGEMENT ==========
  saveUserPreferences() {
    const preferences = {
      isCelsius: this.isCelsius,
      currentTheme: this.currentTheme,
      favoriteCities: this.favoriteCities
    };
    
    try {
      localStorage.setItem('weatherAppPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save preferences:', error);
    }
  }

  loadUserPreferences() {
    try {
      const saved = localStorage.getItem('weatherAppPreferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        this.isCelsius = preferences.isCelsius !== undefined ? preferences.isCelsius : true;
        this.currentTheme = preferences.currentTheme || 'default';
        this.favoriteCities = preferences.favoriteCities || [];
        
        // Apply theme
        document.body.className = `theme-${this.currentTheme}`;
      }
    } catch (error) {
      console.warn('Failed to load preferences:', error);
    }
  }

  saveRecentSearch(cityName) {
    try {
      let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      
      // Remove if already exists
      recentSearches = recentSearches.filter(search => search !== cityName);
      
      // Add to beginning
      recentSearches.unshift(cityName);
      
      // Keep only last 5 searches
      recentSearches = recentSearches.slice(0, 5);
      
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    } catch (error) {
      console.warn('Failed to save recent search:', error);
    }
  }
}

// ========== APP INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  try {
    new EnhancedWeatherApp();
  } catch (error) {
    console.error('Failed to initialize weather app:', error);
  }
});