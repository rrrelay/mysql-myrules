var util = require('util');
var mysql = require('mysql');
var q = require('q');

var CONNECTION_INFO = {
	host     : 'localhost',
	user     : 'root',
	password : ''
};

module.exports = function(procName, paramsArray){
	paramsArray = paramsArray || [];
	var d = q.defer();
	var dbConnection = mysql.createConnection(CONNECTION_INFO);
	var paramsStr = paramsArray
		.map(function(v){ return "'" + v + "'";})
		.join(', ');
	var commandStr = util.format('call banana.%s(%s);', procName, paramsStr);

	dbConnection.connect();
	dbConnection.query(commandStr, function(err, rows, fields){
		if (err){
			global.logger.error('database error running ' + procName);
			d.reject();
			throw err;
		}

		d.resolve({
			rows: rows, 
			fields: fields
		});
	});
	dbConnection.end();

	return d.promise;
};
