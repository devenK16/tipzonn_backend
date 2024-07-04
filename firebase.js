const admin = require('firebase-admin');
const serviceAccount = require('../Tipzonn/config/tipzonn-notifacation-firebase-adminsdk-por6l-64c5adc6e3.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
