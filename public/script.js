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
}

class Controller {
  #model;
  #view;

  constructor(model, view) {
    this.#model = model;
    this.#view = view;
  }
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

const app = new Controller(new Model(), new View());
