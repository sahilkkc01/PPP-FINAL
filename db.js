const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("ppc", "sahil", "Mj8RZjvP2S8K9vQjUHKf", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
});

const con = async () => {
  try {
    await sequelize.authenticate();

    console.log("Db Connected");
  } catch (error) {
    console.log("Unable to connect to db", error);
  }
};

module.exports = { con, sequelize };
