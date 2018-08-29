var mysql_pool = require('../db/mysql_con');
var express = require('express');
var router = express.Router();
var cors = require('cors');

var categories = require('./category.js');
var questions = require('./question.js');
var teachers = require('./teacher.js');
var students = require('./student.js');
var majoring = require('./majoring.js');
var users = require('./users.js');
var auth = require('./auth.js');
var profile = require('./profile.js');
var exam = require('./exam.js');
var timer = require('./timer.js');
var multer = require('multer');

/**************** profile image *****************/
var storage = multer.diskStorage({
   destination: function (req, file, next) {
      next(null, 'uploads/profile');
   },
   filename: function (req, file, next) {
      const ext = file.mimetype.split('/')[1];
      next(null, 'profile-' + Date.now() + '.' + ext)
   }
})
var uploadProfileImage = multer({ storage: storage }).any();

/**************** illustration *****************/
var storageIllustration = multer.diskStorage({
   destination: function (req, file, next) {
      next(null, 'uploads/illustration');
   },
   filename: function (req, file, next) {
      const ext = file.mimetype.split('/')[1];
      next(null, 'illustration-' + Date.now() + '.' + ext)
   }
})

var uploadIllustration = multer({ storage: storageIllustration }).any();

//upload illustration image
router.post('/uploadIllustration', function (req, res, next) {
   uploadIllustration(req, res, function (err) {
      if (err) {
         res.status(401);
         res.json({ 'success': false, 'message': 'Image upload failed!' });
         return
      }

      //save to database
      if (req.files !== null) {
         var values = {
            illustration: req.files[0].filename,
            guid: req.body.guid
         };

         updateIllustration(values).then(function (row) {
            if (row === -1) {
               res.status(401);
               res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
               return;
            }

            res.status(200);
            res.json({ 'success': true, 'message': 'Image illustration uploaded successfully', 'illustration': req.files[0].filename });
         })
      }
      return;
   })
})

//upload profile image
router.post('/uploadImage', function (req, res, next) {
   uploadProfileImage(req, res, function (err) {
      if (err) {
         res.status(401);
         res.json({ 'success': false, 'message': 'Image upload failed!' });
         return
      }

      //save to database
      if (req.files !== null) {
         var values = {
            imageName: req.files[0].filename,
            guid: req.body.guid
         };

         updateProfileImage(values).then(function (row) {
            if (row === -1) {
               res.status(401);
               res.json({ 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' });
               return;
            }

            res.status(200);
            res.json({ 'success': true, 'message': 'Image uploaded successfully' });
         })
      }
      return;
   })
})

function updateIllustration(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;

         connection.query(`UPDATE questions SET illustration = ? WHERE guid = ?`, 
                           [values.illustration, values.guid], function (err, result) {
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

function updateProfileImage(values) {
   return new Promise(function (resolve, reject) {
      mysql_pool.getConnection(function (err, connection) {
         if (err) throw err;
    
         connection.query(`UPDATE students JOIN users ON students.user_id = users.id
                           SET image = ? WHERE users.guid = ?`, [values.imageName, values.guid], function (err, result) {
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

//timer
router.post('/setTimer', timer.set);
router.get('/getTimer', timer.get);

//answers
router.post('/insertAnswers', questions.insertAnswers);
router.post('/getAnswers', questions.getAnswers);
router.post('/updateAnswers', questions.updateAnswers);
router.delete('/deleteAnswers/:id', questions.deleteAnswers);
router.post('/getQuestionById', questions.getQuestionById);

//majorings
router.get('/getMajorings', majoring.getMajoring);
router.post('/createMajoring', majoring.createMajoring);
router.put('/updateMajoring', majoring.updateMajoring);
router.delete('/deleteMajoring/:guid', majoring.deleteMajoring);

//authentication
router.post('/login', auth.login);
router.post('/isAuthenticated', auth.isAuthenticated)

//questions
router.get('/getQuestions', questions.list);
router.post('/createQuestion', questions.createQuestion);
router.put('/updateQuestion', questions.update);
router.delete('/deleteQuestion/:guid', questions.delete);
router.post('/getQuestionIdsFromResults', questions.questionIdsFromResults);
router.post('/getQuestionByResults', questions.questionByResults);

//teachers
router.get('/getTeachers', teachers.getTeachers);
router.post('/createTeacher', teachers.createTeacher);
router.put('/updateTeacher', teachers.updateTeacher);
router.delete('/deleteTeacher/:guid', teachers.deleteTeacher);

//students
router.get('/getStudents', students.getStudents);
router.post('/createStudent', students.createStudent);
router.put('/updateStudent', students.updateStudent);
router.delete('/deleteStudent/:guid', students.deleteStudent);

//users
router.get('/getUsers', users.list);
router.post('/createUser', users.create);
router.put('/updateUser', users.update);
router.delete('/deleteUser/:guid', users.delete);
router.post('/register', users.register);
router.post('/confirmRegistration', users.confirmRegistration);
router.post('/isRegistered', users.isRegistered);
router.post('/resetPassword', users.resetPassword);
router.post('/updatePassword', users.updatePassword);

//profile
router.post('/getProfileDetail', profile.detail);
router.post('/updateProfile', profile.update);

//exam
router.post('/getSummaryResults', exam.getSummaryResults);
router.get('/getExamByCategories', exam.getExamByCategories);
router.post('/getExamQuestionsByCategory', exam.getExamQuestionsByCategory);
router.post('/getTabCategories', exam.tabCategories);
router.post('/getAnswersByQuestion', exam.examAnswersByQuestion);
router.post('/checkAnswers', exam.checkAnswers);
router.post('/getTotalForCategory', exam.totalForCategory);
router.post('/getSumTotalPoints', exam.sumTotalPoints);
router.post('/getEarnedPoints', exam.earnedPoints);
router.post('/getSummaryResultsForProfile', exam.summaryResultsForProfile);

//categories
router.get('/getCategories', categories.getCategories);
router.post('/createCategory', categories.createCategory);
router.put('/updateCategory', categories.updateCategory);
router.delete('/deleteCategory/:guid', categories.deleteCategory);
router.get('/getCategoryMajoring', categories.getCategoryByMajoring);
router.get('/getCategoriesOnly', categories.getCategoryWOMajoring);

router.get('/', function (req, res, next) {
   res.send('<div><h1>Welcome to LET API.</h1><p>Author: You!</p></div>');
});


module.exports = router;
