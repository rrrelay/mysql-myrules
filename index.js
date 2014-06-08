var util = require('util');
var pg = require('pg');
var q = require('q');
var _ = require('lodash');

var CONNECTION_INFO = {
	host     : process.env.MYSQL_MYRULES_HOST ||'localhost',
	user     : process.env.MYSQL_MYRULES_USER || 'root',
	database : process.env.MYSQL_MYRULES_DATABASE || 'relay',
	password : process.env.MYSQL_MYRULES_PASS || ''
};


function _buildConnectionString(connectionInfo){
	connectionInfo = _.extend({}, CONNECTION_INFO, connectionInfo) ;

	return util.format('postgres://%s:%s@%s/%s', 
		connectionInfo.user,
		connectionInfo.password,
		connectionInfo.host,
		connectionInfo.database
	);
}

function MySqlMyRules(connectionInfo){

	var connectionString = _buildConnectionString(connectionInfo);
	
	this.transaction = function(procName, paramsArray){
		return this.call(procName, paramsArray, true);
	};

	this.call = function(procName, paramsArray, useTransaction){
		paramsArray = paramsArray || [];
		var d = q.defer();

		var strParams = paramsArray.map(function(p, i){ return '$' + (i+1); });
		pg.connect(connectionString, function(err, client, done){
			if (err){
				// from the pg readme, it appears i don't call done for errors?
				return d.reject(err);
			}

			var strQuery = util.format('select * from %s(%s);', procName, strParams);
			if (useTransaction){
				strQuery = 
					'BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE\n' + 
					strQuery + 
					'\nCOMMIT;' + 
					'\nEND;';
			}

			client.query(strQuery, paramsArray, function(err, result){
				done();

				if (err) {
					console.dir(err);
					return d.reject(err);
				}

				d.resolve(result);
			});
		});

		return d.promise;
	};
}

module.exports = MySqlMyRules;
