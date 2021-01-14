class Model {
  #settings;
  #quote;
  #weather;
  #backgroundImage;
  #onChange;

  constructor() {
    // { displayName, defaultTimeFormat, defaultTemperatureUnits, defaultSearchEngine }
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
  constructor() {}

  static getElement(selector) {
    const elem = document.querySelector(selector);
    return elem;
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
  defaultTimeFormat: '12-hr',
  defaultTemperatureUnits: 'celsius',
  defaultSearchEngine: 'google',
};

async function apiCall(endpoint) {
  const response = await fetch(endpoint);
  const data = await response.json();
  return data;
}

const app = new Controller(new Model(), new View());
