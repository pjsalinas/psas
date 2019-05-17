"use strict";

const _ = require("lodash"),
  db = require("../models/store.js"),
  categories = require("../helpers/categories");

// Select Records from the tables accordingly to what the values are.
exports.select = values => {
  return new Promise((resolve, reject) => {
    let respText = "";
    db.select(values).then(
      // Evaluate the answer.
      records => {
        if (records.length > 0) {
          // Records were found, evaluate where are they coming from.
          if (values.action === "TODAY" || values.action === "YESTERDAY") {
            respText += `Meals: ${records.length}\n`;
            let keys = categories.keys();
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
              Water: 0,
              Coffee: 0
            };
            // Go over each of the records found
            _.each(records, record => {
              // Go over each category
              _.each(keys, key => {
                totals[key] += record.get(key) * 1;
              });
            });
            // Prepare the response
            _.each(keys, key => {
              respText += `> ${key}: *${totals[key]}*\n`;
            });
          } else if (
            values.action === "REMOVE" ||
            values.action === "REM" ||
            values.action === "DELETE" ||
            values.action === "DEL"
          ) {
            // It was a "remove/delete" request.
            // Find the record and return it.
            respText = {
              id: records[0].id,
              meal: records[0].get("Meal"),
              record: records[0]
            };
          } else if (values.action === "RETRIEVE" || values.action === "FIND") {
            respText = {
              id: records[0].id,
              meal: records[0].get("Meal"),
              record: records[0]
            };
          } else if (values.action === "MEALS") {
            _.each(records, record => {
              respText += `\`${record.get("Handler")}\` ${record.get(
                "Meal"
              )}\n`;
            });
          }
        } else {
          if (values.action === "DELETE" || values.action === "DEL") {
            respText = `Record w/handler \`${values.handler}\` was not found`;
          } else {
            respText = `There are not entries yet. Eat healthy my friend!`;
          }
        }
        resolve(respText);
      },
      err => reject(err.message)
    ); //=> .then ends
  }); //=> return Promise
}; //=> exports.select ends


function totalize(records) {
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
    Water: 0,
    Coffee: 0
  };
  let keys = _.keys(totals);
  // Go over each of the records found
  _.each(records, record => {
    // Go over each category
    _.each(keys, key => {
      totals[key] += record.get(key) * 1;
    });
  });
  
  let respText = `Num. Records ${records.length}\n`;
  // Prepare the response
  _.each(keys, key => {
    respText += `> ${key}: *${totals[key]}*\n`;
  });

  
  //respText = `${keys}\n${JSON.stringify(totals)}`;
  //respText = `${JSON.stringify(records)}`;
  return respText;
};

exports.week = values => {
  return new Promise((resolve, reject) => {
    db.select(values).then(
      records => {
	let respText;
	if(records.length > 0) {
          respText = `Num. Entries ${records.length}\n`; 				
	  respText += totalize(records);
	} else {
	  respText = `There are not entries in the last 7 days :thinker: Eat healthy my friend`;
	}
        resolve(respText);
      }, err => reject(err.message)
    );
  });
};

exports.today = values => {
  return new Promise((resolve, reject) => {
    let respText;
    db.select(values).then(
      records => {
	if(records.length > 0) {
	  respText = totalize(records);
	} else {
	  respText = `There are not entries yet. Eat healthy my friend!`;
	}
        resolve(respText);
      }, err => reject(err.message)
    );
  }); 
};


exports.create = values => {
  return new Promise((resolve, reject) => {
    db.create(values).then(
      record => resolve(`> Added *"${record.get("Meal")}"* to PSAS.`),
      err => reject(err.message)
    );
  });
};

exports.destroy = values => {
  return new Promise((resolve, reject) => {
    let respText;
    exports.select(values).then(
      record => {
        if (_.isString(record)) {
          return record;
        } else {
          // call the destroy method
          db.destroy({ table: values.table, id: record.id }).then(
            rec => {
              if (rec) {
                //respText = `Record *${record.meal}* was remove.`;
                //resolve(respText);
		resolve(`Record *${record.meal}* was remove.`);
              } else {
                respText = `WoW. We could not find any record to 'destroy'`;
                resolve(respText);
              }
            },
            err => reject(err)
          );
        }
      },
      err => reject(err)
    );
  });
}; //=> end of "destroy"

exports.retrieve = values => {
  return new Promise((resolve, reject) => {
    let respText;
    exports.select(values).then(
      result => {
        if (_.isString(result)) {
          resolve(result);
        } else {
          db.retrieve({
            table: values.table,
            id: result.id
          }).then(
            record => {
              respText = `Record *"${record.get("Meal")}"*\n`;
              let keys = categories.keys();
              _.each(keys, key => {
                let amount = record.get(key);
                respText += `> ${key}: *${amount}*\n`;
              });
              //respText = `Record *${result.meal}* was found.`;
              resolve(respText);
            },
            err => reject(err)
          );
        }
      },
      err => reject(err)
    );
  });
};
