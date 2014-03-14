var moment = require('moment');
var util = require('util');
var mysql = require('mysql');
var q = require('q');
var _ = require('lodash');

var CONNECTION_INFO = {
	host     : 'localhost',
	user     : 'root',
	password : ''
};

function log(){
	var args = Array.prototype.slice(arguments);
	if (global.logger && typeof global.logger.debug === 'function'){
		global.logger.debug(args);
	} else {
		console.dir(args);
	}
}

function MySqlMyRules(connectionInfo){
	connectionInfo = _.extend({}, CONNECTION_INFO, connectionInfo) ;

	this.call = function(procName, paramsArray){
		paramsArray = paramsArray || [];
		var d = q.defer();
		var dbConnection = mysql.createConnection(connectionInfo);
		var paramsStr = paramsArray
			.map(dbConnection.escape.bind(dbConnection))
			.join(', ');

		var commandStr = util.format('call banana.%s(%s);', procName, paramsStr);

		log(commandStr);
		dbConnection.connect();
		dbConnection.query(commandStr, function(err, rows, fields){
			if (err){
				global.logger.error('database error running ' + procName);
				global.logger.error(err);
				d.reject(err);
			}

			d.resolve({
				rows: rows, 
				fields: fields
			});
		});
		dbConnection.end();

		return d.promise;
	};
}

module.exports = MySqlMyRules;
