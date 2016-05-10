const Sequelize = require('sequelize');

let _connection;

class Database {
	static connection(){
		if( _connection ){
			var storageLocation = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : '/var/local');
			storageLocation += "/time-logger";
			_connection = new Sequelize('time-logger', 'time-logger', null, {
				dialect: 'sqlite',
				pool: {
					max: 5,
					min: 0,
					idle: 10000
				},
				storage: storageLocation+'/time-logger.sqlite'
			});

			return _connection;
		}
		else{
			return _connection;
		}
	}
}

module.exports = Database;