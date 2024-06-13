const sequelize = require('./models').sequelize;

sequelize.sync({ force: true }).then(() => { 
    console.log('Database & tables created!');
});