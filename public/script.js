class Model {
  constructor() {}
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

const app = new Controller(new Model(), new View());
