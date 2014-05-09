var util = require('util');
var mysql = require('mysql');
var q = require('q');
var _ = require('lodash');

var CONNECTION_INFO = {
	host     : process.env.MYSQL_MYRULES_HOST ||'localhost',
	user     : process.env.MYSQL_MYRULES_USER || 'root',
	password : process.env.MYSQL_MYRULES_PASS || '',
	port : process.env.MYSQL_MYRULES_PORT || 3306
};

function MySqlMyRules(connectionInfo){
	connectionInfo = _.extend({}, CONNECTION_INFO, connectionInfo) ;

	this.call = function(procName, paramsArray){
		paramsArray = paramsArray || [];
		var d = q.defer();
		var dbConnection = mysql.createConnection(connectionInfo);

		var strParams = Array(paramsArray.length + 1).join(" ?,");
		strParams = strParams.substr(1, strParams.length-2);

		var commandStr = util.format('call banana.%s(%s);', procName, strParams);

		dbConnection.connect();
		dbConnection.query(commandStr, paramsArray, function(err, rows, fields){
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
