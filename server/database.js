const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("blog_db", "root", "Orgio1295", {
    host: "localhost",
    dialect: "mysql",
});

module.exports = sequelize;
