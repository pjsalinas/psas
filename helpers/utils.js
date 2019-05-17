"use strict";

const _ = require("lodash"),
  moment = require("moment"),
  categories = require("./categories");

exports.parse = text => {
  let action,
    pronto,
    meal,
    kategories,
    isValidAction = true;

  //=> add the-meal-name, vegetables 1, fruits 2, milk 3
  //=> ["add the-meal-name", " vegetables 1", " fruits 2", " milk 3"]
  let splitted = _.split(text, ",");

  // Get the first term and split it
  //=> ["add", "the-meal-name"]
  let first = _.split(_.first(splitted), " ");

  // Get the first term, the "action" we want to perform
  action = _.trim(_.toUpper(_.first(first)));

  // Get all the the possible actions (keys)
  let keys = _.keys(categories.actions);

  // Check that the "action" is a valid action
  if (!_.includes(keys, action)) {
    isValidAction = false;
  }

  // "pronto" answer, this is the first response to avoid Slack Time limit
  pronto = categories.actions[action];

  // Get the meal "name"
  meal = _.trim(_.join(_.drop(first), " "));

  // Get the rest of the string
  //=> [" vegetables 1", " fruits 2", " milk 3"]
  kategories = _.drop(splitted);
  // If "kategories" have at least one elem. process them.
  if (kategories.length > 0) {
    kategories = exports.categories(kategories);
  }

  return {
    action: action,
    isValidAction: isValidAction,
    pronto: pronto,
    meal: meal,
    categories: kategories
  };
};

exports.categories = cats => {
  // Prepare the flags
  let isValidCategory = true;
  let wrongCategory = "";
  // Get the objs to compare and update
  let totals = {
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
    Coffee: 0,
    Water: 0
  };
  let keys = categories.keys();

  _.map(cats, cat => {
    let c = _.capitalize(_.first(_.split(_.trim(cat), " ")));
    // Check if category in "c" is a valid category
    if (!_.includes(keys, c)) {
      isValidCategory = false;
      wrongCategory = c;
    }
    let amount = _.trim(_.last(_.split(cat, " "))) * 1;
    totals[c] += amount;
  });

  return {
    totals: totals,
    isValidCategory: isValidCategory,
    wrongCategory: wrongCategory
  };
};

// Return 'date' as 'YYYY-MM-DD' format
// There is a glitch on my system. So, I have to compensate for:
// hours between 7pm - 12pm.
exports.date = () => {
  let now = moment();
  let date = moment();
  let am5 = moment()
    .hours(5)
    .minutes(0)
    .seconds(0)
    .milliseconds(0);
  let am12 = moment(moment().startOf("day"));
  if (now >= am12 && now <= am5) {
    date = now.subtract(1, "day");
  }
  return date.format("YYYY-MM-DD");
};

// Return "today's date" as YYYY-MM-DD format
exports.today = (format = false) => {
  let dt = new Date();
  let yyyy = dt.getFullYear();
  let mm = dt.getMonth() + 1;
  let dd = dt.getDate();

  if (format) {
    mm = mm < 10 ? "0" + mm : mm;
    dd = dd < 10 ? "0" + dd : dd;
  }
  return yyyy + "-" + mm + "-" + dd;
};

// Return "yesterday's date" as YYYY-MM-DD format
exports.yesterday = date => {
  let dt = date ? new Date(date) : new Date(exports.today());
  return exports.dateToYYYYMMDD(
    new Date(dt.setDate(dt.getDate() - 1)).toString()
  );
};

// Transforms date to YYYY-MM-DD
exports.dateToYYYYMMDD = date => {
  let dt = !date ? new Date() : new Date(date);
  let yyyy = dt.getFullYear();
  let mm = dt.getMonth() + 1;
  let dd = dt.getDate();
  return yyyy + "-" + mm + "-" + dd;
};
