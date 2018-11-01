var helpers = {
   createGuid: function (prefix) {
      var maximum = 100000;
      var minimum = 10000;
      var num = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

      return prefix + '-' + num;
   },
   groupArrayByProperty: function(a, prop) {
    return a.filter(function(item, index, array) {
      return array.map(function(mapItem) {
        return mapItem[prop];
      }).indexOf(item[prop]) === index;
    })
  },
  getParams(req) {
    var params = req.query.params || [];
    var param = [];
    var querystringArr;
  
    if (params && params.length > 0) {
      querystringArr = params.split("&");
  
      querystringArr.forEach(item => {
        var obj = { key: item.split("=")[0], value: item.split("=")[1] };
        param.push(obj);
      });
    }
    return param;
  }
}

module.exports = helpers;