var mysql_pool = require('../db/mysql_con');
var dac = require('../db/dac');
var messages = require('../config/resMsg');
var helpersFn = require('../config/helpersFn');
var _ = require('lodash');

var exam = {
  summaryResultsForProfile: function(req, res, next) {
    var values = {
      student_guid: req.body.student_guid
    }

    dac.query(`SELECT q.name, q.category_majoring, 
                    SUM(COALESCE((SELECT COALESCE(questions.pts, 0) AS pts
                      FROM examresults 
                          INNER JOIN answers ON answers.id = examresults.answer_id 
                          INNER JOIN questions ON questions.id = examresults.question_id
                          WHERE examresults.question_id = q.id
                          AND examresults.my_answer = 1 AND answers.iscorrect = 1
                          AND examresults.guid = ?
                          ),0)) AS total, 
                      (
                      SELECT createddate FROM examresults WHERE guid = ? LIMIT 1
                      ) AS createddate
                      FROM questions AS q
                          WHERE q.id IN(
                          SELECT question_id 
                          FROM examresults 
                      WHERE examresults.guid = ?
                      )
                GROUP BY category_majoring`, [values.exam_guid, values.exam_guid, values.exam_guid], function(err, data) {
      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      res.status(200);
      res.json(messages.SuccessReponse('results', data));
      return;
    });

  },
  getSummaryResults: function(req, res, next) {
    var payload = {
      student_guid: req.body.student_guid
    }

    dac.query(`SELECT category, guid, questionname, (pts) AS pts, iscorrect, my_answer, examdate, total, remark FROM 
                  (SELECT questions.category_majoring AS category, questions.name AS questionname, questions.pts,
                  answers.iscorrect, examresults.my_answer, DATE_FORMAT(examresults.createddate, '%c/%e/%Y %T') AS examdate, examresults.guid AS guid,
                     IF(my_answer = 1 AND iscorrect = 1, (pts), 0) as total,
                     IF(my_answer = 1 AND iscorrect = 1, 'Check', 'Wrong') as remark 
                  FROM questions
                  INNER JOIN examresults ON examresults.question_id = questions.id
                  INNER JOIN answers ON answers.id = examresults.answer_id
                  WHERE examresults.student_guid = ?
                     AND iscorrect = 1
                  ) AS t
                  GROUP BY guid, questionname
                  ORDER BY examdate DESC`, [payload.student_guid], function(err, data) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }
      res.status(200);
      res.json(messages.SuccessReponse('results', data));
      return;
    });


  },
  earnedPoints: function(req, res, next) {
    var payload = {
      categoryNames: req.body.category_names || [],
      examGuid: req.body.exam_guid || ''
    }

    dac.query(`SELECT SUM(questions.pts) AS total FROM questions 
                WHERE questions.id 
                  IN (SELECT examresults.question_id
                      FROM examresults 
                        INNER JOIN answers ON answers.id = examresults.answer_id
                      WHERE examresults.guid = ?
                      AND my_answer = 1
                        AND iscorrect = 1
                      GROUP BY examresults.question_id
                    )
                AND category_majoring IN (?)`, [payload.examGuid, payload.categoryNames], function(err, result) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }
      res.status(200);
      res.json(messages.SuccessReponse('earned_score', result));
      return;
    });
  },
  sumTotalPoints: function(req, res, next) {
    var payload = {
      categoryNames: req.body.category_names || [],
      examGuid: req.body.exam_guid
    }

    dac.query(`SELECT SUM(questions.pts) AS total FROM questions 
               WHERE questions.id 
                    IN(
                      SELECT examresults.question_id
                      FROM examresults 
                      WHERE examresults.guid = ?
                      GROUP BY examresults.question_id)
                AND category_majoring IN (?)`, [payload.examGuid, payload.categoryNames], function(err, results) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }
      res.status(200);
      res.json(messages.SuccessReponse('total_score', results));
      return;
    });

  },
  totalForCategory: function(req, res, next) {
    var payload = {
      examGuid: req.body.exam_guid || ''
    }

    dac.query(`SELECT q.name, q.category_majoring, 
                  SUM(COALESCE((SELECT COALESCE(questions.pts, 0) AS pts
                  FROM examresults 
                  INNER JOIN answers ON answers.id = examresults.answer_id 
                  INNER JOIN questions ON questions.id = examresults.question_id
                  WHERE examresults.question_id = q.id
                  AND examresults.my_answer = 1 AND answers.iscorrect = 1
                  AND examresults.guid = ?
              ),0)) AS total
              FROM questions AS q
              WHERE q.id IN(
                  SELECT question_id 
                  FROM examresults 
                  WHERE examresults.guid = ?
              )
              GROUP BY category_majoring`, [payload.examGuid, payload.examGuid], function(err, results) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }
      res.status(200);
      res.json(messages.SuccessReponse('category_score', results));
      return;
    });

  },
  checkAnswers: function(req, res, next) {
    var payload = {
      answers: req.body.answers || [],
    }

    for (i in payload.answers) {
      payload.answers[i].guid = helpersFn.createGuid('RS');
      delete payload.answers[i].name;
      delete payload.answers[i].my_answer;
    }

    var myAnswers = (_.mapValues(payload, function(currentArray) {
      return _.map(currentArray, _.values)
    }));

    dac.query(`INSERT INTO examresults (answer_id, guid, my_answer, question_id, student_guid, my_answer_txt) VALUES ? `, [values.answers], function(err, data) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }
      res.status(200);
      res.json(messages.SuccessReponse('guid', guid));
      return;
    });

  },
  examAnswersByQuestion: function(req, res, next) {
    var payload = {
      question_ids: req.body.question_ids || []
    }

    dac.query(`SELECT id, guid, name, iscorrect, question_id FROM answers 
                WHERE question_id IN (?) 
                ORDER BY RAND()`, [payload.question_ids], function(err, results) {

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
  getExamQuestionsByCategory: function(req, res) {
    var payload = {
      categoryMajoring: req.body.category_majoring || []
    }

    dac.query(`SELECT questions.id, questions.guid, questions.name, questions.pts, questions.description, questions.category_majoring
                  FROM questions
                  WHERE questions.category_majoring IN (?) `, [payload.categoryMajoring], function(err, data) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      //group by majorings
      const rows = _.groupBy(data, 'category_majoring')

      res.status(200);
      res.json(messages.SuccessReponse('questions', data));
      return;
    });

  },
  tabCategories: function(req, res, next) {
    var values = {
      majoringId: req.body.majoring_id || '',
      selection: req.body.selection || ''
    }

    var majoringSql = '';
    if (values.selection === 'elementary') {
      majoringSql = ` UNION SELECT majorings.id, majorings.guid, majorings.name, '1' AS ismajoring, majorings.description, '' AS time_limit
                         FROM majorings 
                         WHERE majorings.id = ? `;
    }
    var sql = `SELECT id, guid, name, ismajoring, description, time_limit FROM
                   (SELECT categories.id, categories.guid, categories.name, categories.ismajoring, categories.description, time_limit
                   FROM categories
                   LEFT JOIN majorings ON majorings.category_id = categories.id
                   WHERE categories.ismajoring = 0
                ${majoringSql} ) AS tabs
                ORDER BY tabs.ismajoring DESC`

    dac.query(sql, [values.majoringId], function(err, results) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      res.status(200);
      res.json(messages.SuccessReponse('categories', results));
      return;
    });

  },
  getExamByCategories: function(req, res, next) {

    dac.query(`SELECT categories.id, categories.guid, categories.name, categories.description, categories.ismajoring, 
                  majorings.category_id, majorings.name AS majoring_name, majorings.description AS majoring_description,
                  majorings.guid AS majoring_guid, majorings.id AS majoring_id, students.majoring_id AS student_majoring_id
              FROM categories
              LEFT JOIN majorings ON majorings.category_id = categories.id
              LEFT JOIN students ON students.majoring_id = majorings.id`, [], function(err, rows) {

      if (err) {
        res.status(401);
        res.json(messages.ErrorResponse);
        return;
      }

      var fmtdArrItem = [];
      var grpArrItem = helpersFn.groupArrayByProperty(rows, 'name'); //group by name
      for (i in grpArrItem) {
        var itemObj = {};
        var itemArr = [];

        itemObj['name'] = grpArrItem[i].name;
        itemObj['category_id'] = grpArrItem[i].category_id;
        itemObj['guid'] = grpArrItem[i].guid;
        itemObj['description'] = grpArrItem[i].description;

        itemObj['rows'] = [];

        for (i in rows) {
          if (rows[i].id === itemObj['category_id']) {

            delete rows[i].guid;
            delete rows[i].name;
            delete rows[i].description

            itemArr.push(rows[i]);
          }
          itemObj['rows'] = itemArr;
        }
        fmtdArrItem.push(itemObj);
      }

      res.status(200);
      res.json(messages.SuccessReponse('categories', fmtdArrItem));
      return;
    });

  }
}

module.exports = exam;