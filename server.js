require('dotenv').config({ path: './.env' });

// xử lý error của sync, vd: console.log(x) x chưa được khai báo
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const mongoose = require('mongoose');

const app = require('./app');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/natours';

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log('connect database');
  })
  .catch((err) => {
    console.log(err);
  });

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}!`);
});

// xử lý error của async, vd: kết nối với db, đọc ghi file
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
