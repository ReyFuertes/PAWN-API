var messages = {
   'ErrorResponse': { 'success': false, 'status': 401, 'message': 'An error occurred while processing request.' },
   'SuccessReponse': function(key, val) {
      return { 'success': true, key: val };
   }
}


module.exports = messages;