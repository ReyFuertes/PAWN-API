var mysql_pool = require('../db/mysql_con');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var config = require('../config/config');
const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: config.email,
      pass: config.email_pass
   }
});

var users = {
   updatePassword: function (req, res, next) {
      var values = {
         password: req.body.password || '',
         update_token: req.body.update_token || ''
      };

      updatePassword(values).then(function (result) {
         if (result === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         res.status(200);
         res.json({ 'success': true, 'message': 'Password successfully updated!' });
      })
      return;
   },
   resetPassword: function (req, res, next) {
      var token = crypto.randomBytes(64).toString('hex');

      var values = {
         email: req.body.email || '',
         updateToken: token
      };

      getGuidFromEmail(values).then(function (result) {
         values['guid'] = result;

         const mailOptions = {
            from: config.email, // sender address
            to: values.email, // list of receivers
            subject: config.reset_password_subjet, // Subject line
            html: `<p>Good Day!, <br/>
                  <h4>We received a request to reset your password. </h4>
                  <p>Simple follow the link below:</p>
                  <p><a href="${config.server_address}/update-password/${values.updateToken}">${config.server_address}/update-password/${values.updateToken}</a>
                  </p> `
         };

         //send email
         transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
               console.log(err);

               res.status(200);
               res.json({ 'success': false, 'message': 'Failed sending password reset.' });
            }
            else {
               //console.log(info);
            }

            updateUserPasswordToken(values).then(function (result) {
               res.status(200);
               res.json({ 'success': true, 'message': 'Successfully sent password reset!' });
            })

         });
      })

      return;
   },
   isRegistered: function (req, res, next) {
      var values = {
         guid: req.body.guid || ''
      };

      isRegistered(values).then(function (result) {
         if (result === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         res.status(200);
         res.json({ 'success': true, 'isreg': result });
      })
      return;
   },
   confirmRegistration: function (req, res, next) {
      var values = {
         guid: req.body.guid || ''
      };

      confirmRegistration(values).then(function (result) {
         if (result === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         res.status(200);
         res.json({ 'success': true, 'message': 'Successfully registration has been activated!' });
      })
      return;
   },
   register: function (req, res, next) {
      var values = {
         guid: createGuid('ST'),
         username: req.body.username || '',
         password: req.body.password || '',
         email: req.body.email || '',
         status: 0,
         fullname: req.body.fullname || '',
         school: req.body.school || '',
         contact: req.body.contact || '',
         address: req.body.address || '',
         user_id: '',
         majoring_id: req.body.majoring || ''
      };

      registerUser(values).then(function (result) {
         if (result === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing reg request.' });
            return;
         }

         if (result == 'Email Already Exist') {
            res.status(200);
            res.json({ 'success': false, 'status': 401, 'message': 'Email Already Exist' });
            return;
         }

         res.status(200);
         res.json({ 'success': true, 'message': 'Successfully Inserted', 'guid': result });
         return;
      })
   },
   list: function (req, res, next) {

      getUsers('order by id DESC').then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }
         res.status(200);
         res.json({ 'success': true, 'users': rows });
      })
   },
   create: function (req, res, next) {
      var values = {
         guid: createGuid('ST'),
         username: req.body.username || '',
         password: req.body.password || '',
         email: req.body.email || '',
         status: 0
      };

      createUser(values).then(function (results) {
         if (results === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         res.status(200);
         res.json({ 'success': true, 'message': 'Successfully Inserted' });
         return;
      })
   },
   update: function (req, res, next) {
      var values = {
         guid: req.body.guid,
         username: req.body.username || '',
         email: req.body.email || '',
         password: req.body.password || '',
         status: req.body.status || ''
      };

      updateUser(values).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         getUsers('order by id DESC').then(function (rows) {
            if (rows === -1) {
               res.status(401);
               res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
               return;
            }
            res.status(200);
            res.json({ 'success': true, 'users': rows });
         })
      })
      return;

   },
   delete: function (req, res, next) {
      var guid = req.params.guid;

      deleteUser(guid).then(function (rows) {
         if (rows === -1) {
            res.status(401);
            res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
            return;
         }

         getUsers('order by id DESC').then(function (rows) {
            if (rows === -1) {
               res.status(401);
               res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
               return;
            }
            res.status(200);
            res.json({ 'success': true, 'users': rows });
         })

      })
      return;
   }
}

function getGuidFromEmail(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('SELECT guid FROM users WHERE email = ?', [values.email], function (err, result) {
            if (err) {
               return reject(err);
            }

            resolve(result[0].guid);
         })
         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

function updateUserPasswordToken(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('UPDATE users SET update_token = ? WHERE guid = ?',
            [values.updateToken, values.guid],
            function (err, result) {

               if (err) {
                  return reject(err);
               }

               resolve(result);
            })
         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

function updatePassword(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         bcrypt.hash(values.password, 10, function (err, hash) {
            connection.query('UPDATE users SET password = ? WHERE update_token = ?',
               [hash, values.update_token],
               function (err, result) {

                  if (err) {
                     return reject(err);
                  }

                  resolve(result);
               })
            connection.release();
         })
      })
   }).catch(function () {
      return -1;
   })
}

function isRegistered(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('SELECT id FROM users WHERE guid = ? AND status = 1', [values.guid],
            function (err, result) {
               var ret = false; // if account already registered and activated
               if (err) {
                  return reject(err);
               }

               if (Object.keys(result).length === 0) {
                  ret = false;
               } else {
                  ret = true;
               }

               resolve(ret);
            })
         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

function confirmRegistration(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('UPDATE users SET status = 1 WHERE guid = ?', [values.guid],
            function (err, result) {

               if (err) {
                  return reject(err);
               }

               console.log('Successfull!', values.guid);

               resolve(result);
            })
         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

function sendRegistration(values) {
   const mailOptions = {
      from: config.email, // sender address
      to: values.email, // list of receivers
      subject: config.email_subject, // Subject line
      html: `<p>Hello ${values.fullname}, </p>
      <h3>Thank you for registering at LET Reviewer System, Your account is created and must be activated
      before you can use it. </h3>
      To activate the account click the following link or copy -paste it in your browser:<br/>
      <a href="${config.server_address}/confirmation/${values.guid}">${config.server_address}/confirmation/${values.guid}</a>
      </p>
      <p>After activation you may login to ${config.server_address}/login</p>
      <p>Username: ${values.username}<br/>
      Password: ${values.password}
      </p>
      `
   };

   //send email
   transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
         console.log(err);
      } else {
         //console.log(info);
      }
   });
}

function registerStudent(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         if (!values.user_id) {
            return reject('User Id is not defined.');
         }

         connection.query('INSERT INTO students (guid, fullname, email, school, address, contact, user_id, majoring_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [values.guid, values.fullname, values.email, values.school, values.address, values.contact, values.user_id, values.majoring_id], function (err, results) {
               if (err) {
                  return reject(err);
               }

               sendRegistration(values);

               resolve(results);

            })

         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

function registerUser(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('SELECT COUNT(id) AS count FROM users WHERE email = ?', [values.email],
            function (err, results) {

               if (err) {
                  return reject(err);
               }

               if (results[0].count > 0) {
                  return resolve('Email Already Exist');
               } else {
                  bcrypt.hash(values.password, 10, function (err, hash) {
                     connection.query('INSERT INTO users (guid, username, password, email, status) VALUES (?, ?, ?, ?, ?)',
                        [values.guid, values.username, hash, values.email, values.status], function (err, result) {
                           if (err) {
                              return reject(err);
                           }

                           values.user_id = result.insertId;

                           var ret = registerStudent(values);

                           if (ret !== -1) {
                              resolve(values.guid);
                           }

                        })
                  });
               }
            })


         connection.release();
      })
   }).catch(function (e) {
      if (e === null) {
         return -1;
      }
      return e;
   })
}

function deleteUser(guid) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;
         
         connection.query(`DELETE users, students FROM users 
                              INNER JOIN students ON users.id = students.user_id 
                           WHERE users.guid = ?`, [guid],
            function (err, results) {

               if (err) {
                  return reject(err);
               }

               resolve(results);
            })
         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

/**
 * update category
 * @param {*} values 
 */
function updateUser(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('UPDATE users SET guid = ?, name = ?, email = ?, university = ?, address = ?, contact = ? WHERE guid = ?',
            [values.guid, values.name, values.address, values.contact, values.email, values.guid],
            function (err, results) {

               if (err) {
                  return reject(err);
               }

               resolve(results);
            })
         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

/**
 * 
 * @param {*} prefix 
 */
function createGuid(prefix) {
   var maximum = 10000;
   var minimum = 1000;
   var num = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

   return prefix + '-' + num;
}

/**
 * create new category 
 */
function createUser(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         bcrypt.hash(values.password, 10, function (err, hash) {
            connection.query('INSERT INTO users (guid, username, password, email, status) VALUES (?, ?, ?, ?)',
               [values.guid, values.username, hash, values.password, values.status], function (err, results) {
                  if (err) {
                     return reject(err);
                  }

                  resolve(results);
               })
         });
         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

/**
 * get list of thumbnails
 */
function getUsers(orderBy) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query('SELECT guid, username, email, status, is_admin FROM users ' + orderBy, function (err, rows) {
            if (err) {
               return reject(err);
            } else {
               if (rows == null || Object.keys(rows).length === 0) {
                  return reject('Problem when fetching records..');
               }
               resolve(rows);
            }
         })
         connection.release();
      })
   }).catch(function () {
      return -1;
   })
}

module.exports = users;