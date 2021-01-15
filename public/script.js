class Model {
  #settings;
  #quote;
  #weather;
  #backgroundImage;
  #onChange;

  constructor() {
    // { displayName, timeFormat, temperatureUnits, searchEngine }
    this.#settings = localStorage.getItem(LOCAL_STORAGE_KEY)
      ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))
      : DEFAULT_SETTINGS;
    this.#quote = null;
    this.#weather = null;
    this.#backgroundImage = null;
    this.#onChange = () => {};
  }

  updateSettings(settings) {
    this.#settings = settings;
    this.#onChange('settings', this.#settings);
  }

  updateQuote(quote) {
    this.#quote = quote;
    this.#onChange('quote', this.#quote);
  }

  updateWeather(weather) {
    this.#weather = weather;
    this.#onChange('weather', this.#weather);
  }

  updateBackgroundImage(backgroundImage) {
    this.#backgroundImage = backgroundImage;
    this.#onChange('backgroundImage', this.#backgroundImage);
  }

  save() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.#settings));
  }

  bindOnChange(handler) {
    this.#onChange = handler;
  }

  async requestQuote() {
    const data = await apiCall('/quote');
    this.updateQuote(data);
  }

  async requestWeather() {
    const data = await apiCall('/weather');
    this.updateWeather(data);
  }

  async requestBackgroundImage() {
    const data = await apiCall('/background-image');
    this.updateBackgroundImage(data);
  }

  get settings() {
    return this.#settings;
  }

  get weather() {
    return this.#weather;
  }

  async initialize() {
    await Promise.all([
      this.requestQuote(),
      this.requestWeather(),
      this.requestBackgroundImage(),
    ]);
    this.#onChange('settings', this.#settings);
  }
}

class View {
  // dashboard
  #search;
  #weatherType;
  #weatherTemp;
  #location;
  #time;
  #greeting;
  #attribution;
  #quote;
  #body;

  // modal
  #settingsDisplayName;
  #settingsTimeFormat;
  #settingsTemperatureUnits;
  #settingsSearchEngine;
  #settingsSaveButton;
  #settingsButton;

  #timeInterval;

  constructor() {
    this.#search = View.getElement('#search');
    this.#weatherType = View.getElement('#weather-type');
    this.#weatherTemp = View.getElement('#weather-temp');
    this.#location = View.getElement('#location');
    this.#time = View.getElement('#time');
    this.#greeting = View.getElement('#greeting');
    this.#attribution = View.getElement('#attribution');
    this.#quote = View.getElement('#quote');

    this.#body = View.getElement('body');

    this.#settingsDisplayName = View.getElement('#settings-display-name');
    this.#settingsTimeFormat = View.getElement('#settings-time-format');
    this.#settingsTemperatureUnits = View.getElement('#settings-temperature-units');
    this.#settingsSearchEngine = View.getElement('#settings-search-engine');
    this.#settingsSaveButton = View.getElement('#settings-save-btn');
    this.#settingsButton = View.getElement('#settings-btn');

    this.#timeInterval = null;
  }

  static getElement(selector) {
    const elem = document.querySelector(selector);
    return elem;
  }

  bindSearch(handler) {
    this.#search.addEventListener('keyup', event => {
      if (!event.target.value) {
        return;
      }

      if (event.code === 'Enter' || event.key === 'Enter' || event.keyCode === 13) {
        handler(event.target.value);
      }
    });
  }

  updateTime(timeFormat) {
    if (this.#timeInterval) {
      clearInterval(this.#timeInterval);
    }

    this.#time.textContent = getFormattedTime(new Date(), timeFormat);

    this.#timeInterval = setInterval(() => {
      this.#time.textContent = getFormattedTime(new Date(), timeFormat);
    }, 1000);
  }

  updateGreeting(displayName) {
    this.#greeting.textContent = `Good ${getPartOfDay(new Date())}, ${displayName}.`;
  }

  updateQuote({ text, author }) {
    this.#quote.textContent = `"${text}" - ${author}`;
  }

  updateBackgroundImage({ imageUrl, creatorName, creatorUrl }) {
    this.#body.style.backgroundImage = `url(${imageUrl})`;
    this.#attribution.innerHTML = `Photo by <a href="${creatorUrl}">${creatorName}</a> on <a href="https://unsplash.com">Unsplash</a>`
  }

  updateWeather({ location, weather: { temp, type } }, temperatureUnits) {
    this.#location.textContent = location;
    this.#weatherTemp.textContent = getFormattedTemperature(temp, temperatureUnits);
    this.#weatherType.innerHTML = getWeatherIcon(type);
  }

  bindSettingsSaveButtonClick(handler) {
    this.#settingsSaveButton.addEventListener('click', event => {
      if (!this.#settingsDisplayName) {
        return;
      }

      handler({
        displayName: this.#settingsDisplayName.value.trim(),
        timeFormat: this.#settingsTimeFormat.value,
        temperatureUnits: this.#settingsTemperatureUnits.value,
        searchEngine: this.#settingsSearchEngine.value,
      });

      UIkit.modal('#settings-modal').hide();
    });
  }

  updateSettings({ displayName, timeFormat, temperatureUnits, searchEngine }) {
    this.#settingsDisplayName.value = displayName;
    this.#settingsTimeFormat.value = timeFormat;
    this.#settingsTemperatureUnits.value = temperatureUnits;
    this.#settingsSearchEngine.value = searchEngine;
  }

  bindSettingsButtonClick(handler) {
    this.#settingsButton.addEventListener('click', () => handler());
  }
}

class Controller {
  #model;
  #view;

  constructor(model, view) {
    this.#model = model;
    this.#view = view;

    this.#view.bindSearch(this.onSearch);
    this.#view.bindSettingsButtonClick(this.onSettingsButtonClick);
    this.#view.bindSettingsSaveButtonClick(this.onSettingsSaveButtonClick);

    this.#model.bindOnChange(this.onDataChange);

    // Initialize
    this.#model.initialize();
    // this.#view.updateTime(this.#model.settings.timeFormat);
    // this.#view.updateGreeting(this.#model.settings.displayName);
  }

  onSearch = query => {
    let searchUrl;
    switch (this.#model.settings.searchEngine) {
      case 'google':
        searchUrl = `https://www.google.com/search?q=${query}`;
        break;
      case 'bing':
        searchUrl = `https://www.bing.com/search?q=${query}`;
        break;
      case 'yahoo':
        searchUrl = `https://search.yahoo.com/search?p=${query}`;
        break;
      case 'duck-duck-go':
        searchUrl = `https://duckduckgo.com/?q=${query}`;
        break;
      default:
        return;
    }
    window.open(encodeURI(searchUrl));
  };

  onSettingsButtonClick = () => this.#view.updateSettings(this.#model.settings);

  onSettingsSaveButtonClick = settings => {
    this.#model.updateSettings(settings);
    this.#model.save();
  };

  onDataChange = (key, data) => {
    switch (key) {
      case 'settings':
        this.#view.updateTime(data.timeFormat);
        this.#view.updateGreeting(data.displayName);
        this.#view.updateWeather(this.#model.weather, data.temperatureUnits);
        break;
      case 'quote':
        this.#view.updateQuote(data);
        break;
      case 'weather':
        this.#view.updateWeather(data, this.#model.settings.temperatureUnits);
        break;
      case 'backgroundImage':
        this.#view.updateBackgroundImage(data);
        break;
      default:
        break;
    }
  };
}

const LOCAL_STORAGE_KEY = 'DashboardProject';

const DEFAULT_SETTINGS = {
  displayName: 'John Smith',
  timeFormat: '12-hr',
  temperatureUnits: 'celsius',
  searchEngine: 'google',
};

async function apiCall(endpoint) {
  const response = await fetch(endpoint);
  const data = await response.json();
  return data;
}

function getFormattedTime(date, timeFormat) {
  const hours = date.getHours();
  const minutes = ('0' + date.getMinutes()).slice(-2);
  switch (timeFormat) {
    case '12-hr':
      return `${hours === 0 ? '12' : hours % 12}:${minutes}`;
    case '12-hr-am-pm':
      return `${hours === 0 ? '12' : hours % 12}:${minutes} ${hours < 12 ? 'am' : 'pm'}`;
    case '24-hr':
      return `${hours}:${minutes}`;
  }
}

function getPartOfDay(date) {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return 'morning';
  } else if (hours >= 12 && hours < 17) {
    return 'afternoon';
  } else {
    return 'evening';
  }
}

function getFormattedTemperature(temperature, temperatureUnits) {
  switch (temperatureUnits) {
    case 'celsius':
      return `${Math.floor(temperature - 273.15)}°C`;
    case 'fahrenheit':
      return `${Math.floor(temperature * (9/5) - 459.67)}°F`;
    case 'kelvin':
      return `${Math.floor(temperature)}K`;
  }
}

function getWeatherIcon(type) {
  switch (type) {
    case 'Thunderstorm':
      return '<i class="fas fa-bolt"></i>';
    case 'Drizzle':
      return '<i class="fas fa-cloud-rain"></i>';
    case 'Rain':
      return '<i class="fas fa-cloud-showers-heavy"></i>';
    case 'Snow':
      return '<i class="fas fa-snowflake"></i>';
    case 'Clear':
      return '<i class="fas fa-sun"></i>';
    case 'Clouds':
      return '<i class="fas fa-cloud-sun"></i>';
    default:
      return '<i class="fas fa-smog"></i>';
  }
}

const app = new Controller(new Model(), new View());
