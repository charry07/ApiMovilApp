const mongoose = require('mongoose');

const dbConnection = async () => {
  try {
    mongoose.set('strictQuery', false);
    mongoose
      .connect(process.env.MONGODB_CNN, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log(' ------> DB Mongoose Online!'));
  } catch (error) {
    console.log('Error al conectar a la base de datos', error);
  }
};
module.exports = dbConnection;
