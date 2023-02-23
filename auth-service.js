// var mongoose = require("mongoose");
// const bcrypt = require('bcryptjs');
// require('dotenv').config();

// var Schema = mongoose.Schema;

// var userSchema = new Schema({
//     "userName": String,
//     "password": String,
//     "email": String,
//     "loginHistory": [{
//         "dateTime": Date,
//         "userAgent": String
//     }]
// });


// let User; // to be defined on new connection (see initialize)

// module.exports.initialize = function () {
//     return new Promise(function (resolve, reject) {
//         let db = mongoose.createConnection(process.env.MONGODB_CONN_STRING);
//         db.on('error', (err) => {
//             reject(err); // reject the promise with the provided error
//             console.log(err);
//         });
//         db.once('open', () => {
//             User = db.model("users", userSchema);
//             resolve();
//         });
//     });
// };


// // module.exports.registerUser = (userData) => {
// //     // properties: .userName, .userAgent, .email,
// //     // .password, .password2
// //     return new Promise(function (resolve, reject) {
// //         if (userData.password !== userData.password2) {
// //             reject("Passwords do not match");
// //         }
// //         bcrypt.hash(userData.password, 10)
// //             .then((hash) => {
// //                 userData.password = hash;
// //                 let newUser = new User(userData);
// //                 newUser.save().then(() => {
// //                     resolve();
// //                 }).catch((error) => {
// //                     if (error.code == 11000) {
// //                         reject(`User Name already taken`);
// //                     } else {
// //                         reject(`There was an error creating the user: ${error}`)
// //                     }
// //                 });
// //             })
// //             .catch((err) => {
// //                 reject(`There was an error encrypting the password: ${err}`);
// //             });
// //     });
// // };

// module.exports.checkUser = (userData) => {
//     // properties: .userName, .userAgent, .email,
//     // .password, .password2
//     return new Promise((resolve, reject) => {
//         User.find({ userName: userData.userName })
//         .then((users) => {
//             if (!users.length) {
//                 reject(`Unable to find user: ${userData.userName}`);
//             } else {
//                 bcrypt.compare(userData.password, users[0].password)
//                 .then((result) => {
//                     if (!result) {
//                         reject(`Incorrect Password for user: ${userData.userName}`);
//                     } else {
//                         const updatedUser = users[0];
//                         updatedUser.loginHistory.push({
//                             dateTime: new Date().toString(),
//                             userAgent: userData.userAgent
//                         });
//                         User.updateOne({ userName: updatedUser.userName }, { $set: { loginHistory: updatedUser.loginHistory } })
//                             .then(() => {
//                                 resolve(updatedUser);
//                             })
//                             .catch((err) => {
//                                 reject(`There was an error verifying the user: ${err}`);
//                             });
//                     }
//                 });
//             }
//         })
//             .catch((err) => {
//                 reject(`Unable to find user: ${userData.userName}`);
//             });
//     }).catch((err) => {
//         console.log(`This is the custom log error: ${err}`);
//     })
// }

