/* global process */

"use strict";

const aws = require("aws-sdk"),
  lambda = new aws.Lambda(),
  botBuilder = require("claudia-bot-builder"),
  //promiseDelay = require("promise-delay"),
  slackDelayedReply = botBuilder.slackDelayedReply,
  Utils = require("./helpers/utils"),
  Meals = require("./controllers/meals");

const api = botBuilder((message, apiRequest) => {
  // Parse the text
  let { action, isValidAction, pronto, meal, categories } = Utils.parse(
    message.text
  );

  if (isValidAction) {
    if (action === "HELP") {
      return pronto;
    } else {
      return new Promise((resolve, reject) => {
        lambda.invoke(
          {
            FunctionName: apiRequest.lambdaContext.functionName,
            Qualifier: apiRequest.lambdaContext.functionVersion,
            InvocationType: "Event",
            Payload: JSON.stringify({
              slackEvent: {
                // this will enable us to detect the event later and filter it
                message: message,
                action: action,
                meal: meal,
                categories: categories
              }
            })
          },
          (err, done) => {
            if (err) return reject(err);
            resolve(done);
          }
        );
      })
        .then(() => {
          return {
            // the initial response
            text: `*${pronto}*`,
            response_type: "in_channel"
          };
        })
        .catch(err => {
          return `${err.message}\nCould not setup the timer`;
        });
    }
  } else {
    return "Wow. I missed that. Valid commands are: `add`, `meals`, `today`, `yesterday`, and `help`";
  }
});

api.intercept(event => {
  if (!event.slackEvent) {
    // if this is a normal web request, let it run
    return event;
  }
  let { message, action, meal, categories } = event.slackEvent;
  let respText;
  let values;
  let handler;
  let filterByFormula;
  return new Promise((resolve, reject) => {
    // TODO: move all values creation to "helpers.js" or another script
    switch (action) {
      case "ADD":
        // values = setValuesObj(event.slackEvent);
        if (categories.isValidCategory) {
          values = {
            table: "Meals",
            fields: categories.totals
          };
          values.fields.Meal = meal;
          values.fields.Date = Utils.date();
          values.fields.User = [process.env.AIRTABLE_PSAS_USERID];

          Meals.create(values).then(
            result => resolve(result),
            err => resolve(err)
          );
        } else {
          respText = `*${
            categories.wrongCategory
          }* is not a valid category nothing was posted`;
          resolve(respText);
        }
        break;

      case "MEALS":
        values = {
          table: "Meals",
          action: action,
          fields: {
            view: "Today",
            User: [process.env.AIRTABLE_PSAS_USERID]
          }
        };
        Meals.select(values).then(
          result => resolve(result),
          err => resolve(err)
        );
        break;

      case "TODAY":
        values = {
          table: "Meals",
          action: action,
          fields: {
            view: "Today",
            User: [process.env.AIRTABLE_PSAS_USERID]
          }
        };
        Meals.select(values).then(
          result => resolve(result),
          err => resolve(err)
        );
        break;

      case "YESTERDAY":
        values = {
          table: "Meals",
          action: action,
          fields: {
            view: "Yesterday",
            User: [process.env.AIRTABLE_PSAS_USERID]
          }
        };
        Meals.select(values).then(
          result => resolve(result),
          err => resolve(err)
        );
        break;

      case "WEEK":
        values = {
	  table: "Meals",
	  action: action,
	  fields: {
	    view: "Week",
	    User: [process.env.AIRTABLE_PSAS_USERID]
	  }
	};
	Meals.week(values).then(
	  result => resolve(result),
	  err => resolve(err)
	);
	break;

      case "REMOVE":
      case "DELETE":
      case "REM":
      case "DEL":
        // In this case "meal" holds the "handler" for the record to delete.
        handler = meal.toUpperCase();
        // This is the formula to search for the record to delete.
        filterByFormula = `SEARCH("${handler}", {Handler})`;
        values = {
          table: "Meals",
          action: action,
          handler: handler,
          fields: {
            filterByFormula: filterByFormula
          }
        };
        Meals.destroy(values).then(
          result => resolve(result),
          err => resolve(err)
        );
        break;

      case "RETRIEVE":
      case "FIND":
        // get the handler
        handler = meal.toUpperCase();
        // prepare the "filterByFormula"
        filterByFormula = `SEARCH("${handler}", {Handler})`;
        values = {
          table: "Meals",
          action: action,
          handler: handler,
          fields: {
            filterByFormula: filterByFormula
          }
        };
        Meals.retrieve(values).then(
          result => resolve(result),
          err => resolve(err)
        );
        break;

      default:
        respText = "Something went really wrong. Try again !!!";
        reject(respText);
        break;
    } //=> end of "switch"
  })
    .then(respText => {
      // TODO: try to make a method of this.
      return slackDelayedReply(message, {
        text: respText,
        response_type: "in_channel"
      });
    })
    .then(() => false) //=> end of new Promise
    .catch(respText => {
      // TODO: try to make a method of this.
      return slackDelayedReply(message, {
        text: respText,
        response_type: "in_channel"
      });
    });
}); //=> end of api.intercept

module.exports = api;
