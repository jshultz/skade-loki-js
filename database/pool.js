let { createPool } = require("mysql2");
let Config = require("./config");

module.exports = {
    dbPool: createPool(Config),
};