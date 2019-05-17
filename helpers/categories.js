"use strict";

const _ = require("lodash");

const categories = {
  actions: {
    ADD: "Add Meal",
    MEALS: "Today's Meals",
    YESTERDAY: "Totals from yesterday",
    TODAY: "Today Entries",
    WEEK: "7 Days Entries",
    RETRIEVE: "Retrieve Record",
    FIND: "Retrieve Record",
    DELETE: "Remove",
    DEL: "Remove",
    REMOVE: "Remove",
    REM: "Remove",
    HELP:
      'Valid commands: `add`, `meals`, `today`, `yesterday`, `retrieve`, `remove`, `week`, and `help`.\n• To *add* a new entry: `/psas add "meal name", category amount[, category amount[, category amount] ]`\n• List *Today\'s totals*: `/psas today`\n• List * Today\'s meals*: `/psas meals`\n• To display an entry: `/psas retrieve "4-digit-code"`\n• To remove  an entry: `/psas remove "4-digit-code"`'
  },

  totals: {
    Vegetables: 0.0,
    Fruits: 0.0,
    Milk: 0.0,
    Flour: 0.0,
    Meat: 0.0,
    Beans: 0.0,
    Oil: 0.0,
    Sugar: 0.0,
    Alcohol: 0,
    Exercise: 0,
    Water: 0,
    Coffee: 0
  },
  keys: () => {
    return _.keys(categories.totals);
  }
};

module.exports = categories;
