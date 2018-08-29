var mysql_pool = require('../db/mysql_con');
var dac = require('../db/dac');
var messages = require('../config/resMsg');
var helpersFn = require('../config/helpersFn');
var _ = require('lodash');

var questions = {
  getQuestions: function(req, res, next) {
    dac.query(`SELECT id, guid, name, pts, description, illustration, category_majoring, category_majoring_id
               FROM questions ORDER BY questions.id DESC`, [], function(err, results) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      res.status(200);
      res.json(messages.SuccessReponse('questions', results));
      return;

    });
  },
  questionByResults: function(req, res, next) {
    var payload = {
      question_ids: req.body.question_ids,
      category_names: req.body.category_names,
      exam_guid: req.body.exam_guid
    }

    dac.query(`SELECT questions.id, questions.guid, name, pts, category_majoring_id, category_majoring, 
                examres.my_answer, examres.iscorrect, examres.answer_name, examres.my_answer_txt
                FROM questions 
                INNER JOIN ( 
                  SELECT examresults.guid, examresults.answer_id, examresults.question_id, examresults.my_answer, 
                          answers.iscorrect, 
                          answers.name AS answer_name, my_answer_txt
                  FROM examresults 
                  INNER JOIN answers ON answers.id = examresults.answer_id 
                  AND answers.iscorrect = 1 
                ) AS examres ON examres.question_id = questions.id 
                WHERE questions.category_majoring IN (?) AND examres.guid = ?`, [values.category_names, values.exam_guid], function(err, results) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      res.status(200);
      res.json(messages.SuccessReponse('questions', results));
      return;

    });
  },
  questionIdsFromResults: function(req, res, next) {
    var payload = {
      guid: req.body.guid,
      studentGuid: req.body.student_guid
    }

    dac.query(`SELECT question_id FROM examresults WHERE guid = ? AND student_guid = ? GROUP BY question_id`, [payload.guid, payload.studentGuid], function(err, results) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      var arrQuestionIds = [];
      for (i in results) {
        arrQuestionIds.push(results[i].question_id);
      }

      res.status(200);
      res.json(messages.SuccessReponse('questionids', arrQuestionIds));
      return;
    });

  },
  answerByQuestion: function(req, res, next) {
    var payload = {
      questionId: req.body.question_id
    }

    dac.query(`SELECT id, guid, name, iscorrect, question_id FROM answers WHERE question_id = ?`, [values.questionId], function(err, results) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      res.status(200);
      res.json(messages.SuccessReponse('answers', results));
      return;

    });

  },
  getQuestionById: function(req, res, next) {
    var payload = {
      questionGuid: req.body.question_guid
    };

    dac.query(`SELECT id FROM questions WHERE guid = ? `, [payload.questionGuid], function(err, results) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      res.status(200);
      res.json(messages.SuccessReponse('question', results));
      return;

    });

  },
  deleteAnswers: function(req, res, next) {
    var payload = {
      questionId: req.params.id
    };

    dac.query(`DELETE FROM answers WHERE question_id = ? `, [payload.questionId], function(err, data) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }
      res.status(200);
      res.json(messages.SuccessReponse('message', 'Successfully deleted answers'));
      return;
    });

  },
  updateAnswers: function(req, res, next) {
    var payload = {
      guid: helpersFn.createGuid('CT'),
      name: req.body.name,
      iscorrect: req.body.iscorrect,
      questionId: req.body.question_id
    };

    dac.query(`INSERT INTO answers (guid, name, iscorrect, question_id) VALUES (?, ?, ?, ?) `, [payload.guid, payload.name, payload.iscorrect, payload.questionId], function(err, data) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }
      res.status(200);
      res.json(messages.SuccessReponse('message', 'Successfully updated answers'));
      return;

    });
  },
  getAnswers: function(req, res, next) {
    var payload = {
      questionGuid: req.body.question_guid
    };

    dac.query(`SELECT answers.id, answers.guid, answers.name, answers.iscorrect, answers.question_id 
                FROM answers
                INNER JOIN questions on questions.id = answers.question_id
                WHERE questions.guid = ? ORDER BY answers.id ASC`, [payload.questionGuid], function(err, results) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      res.status(200);
      res.json(messages.SuccessReponse('answers', results));
      return;

    });

  },
  insertAnswers: function(req, res, next) {
    var payload = {
      guid: helpersFn.createGuid('AW'),
      name: req.body.name,
      iscorrect: req.body.iscorrect,
      questionId: req.body.question_id
    };

    dac.query(`INSERT INTO answers (guid, name, iscorrect, question_id) VALUES (?, ?, ?, ?) `, [payload.guid, payload.name, payload.iscorrect, payload.questionId], function(err, data) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      res.status(200);
      res.json(messages.SuccessReponse('message', 'Successfully inserted answers'));
      return;

    });

  },
  createQuestion: function(req, res, next) {
    var payload = {
      guid: helpersFn.createGuid('QS'),
      name: req.body.name || '',
      pts: req.body.pts || '',
      description: req.body.description || '',
      categoryMajoring: req.body.category_majoring || ''
    };

    dac.query(`INSERT INTO questions (guid, name, pts, description, category_majoring) VALUES (?, ?, ?, ?, ?)`, [payload.guid, payload.name, payload.pts, payload.description, payload.categoryMajoring], function(err, result) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      var insertedId = result.insertId;

      dac.query(`SELECT id, guid, name, pts, description, illustration, category_majoring, category_majoring_id
                 FROM questions ORDER BY questions.id DESC`, [], function(err, results) {

        if (err) {
          res.status(401);
          res.json(messages.ErrorResponse);
          return;
        }

        res.status(200);
        res.json({ 'success': true, 'questions': rows, 'guid': values.guid, 'insertedId': insertedId });
        return;

      });

    });
  },
  update: function(req, res, next) {
    var payload = {
      guid: req.body.guid,
      name: req.body.name || '',
      pts: req.body.pts || '',
      description: req.body.description || '',
      categoryMajoring: req.body.category_majoring || '',
      userGuid: req.body.user_guid || ''
    };

    dac.query(`UPDATE questions SET guid = ?, name = ?, pts = ?, description = ?, category_majoring = ? WHERE guid = ?`, [payload.guid, payload.name, payload.pts, payload.description, payload.categoryMajoring, payload.userGuid], function(err, data) {


      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      //get updated categories
      questions.getQuestions(req, res);

    });
  },
  delete: function(req, res, next) {
    var payload = {
      guid: req.params.guid
    }

    dac.query(`DELETE questions, answers FROM questions INNER JOIN answers ON answers.question_id = questions.id WHERE questions.guid = ?`, [guid], function(err, data) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      //get updated categories
      questions.getQuestions(req, res);

    });
  }
}

module.exports = questions;