const PouchDB = require('pouchdb'),
	mkdirp = require('mkdirp');

let _connection;
let idSize = {
	records: 5
};

class Database{
	static connection(){
		return new Promise( (resolve, reject) => {
			if( !_connection ){

				//setup the storage directory
				recursiveMkDir(appData()+'/time-logger/records').then(()=>{
					//create the user-scoped database
					_connection = new PouchDB(appData()+'/time-logger/records', {adapter: 'leveldb'});
					resolve(_connection);
				}).catch(reject);
			}
			else{
				resolve(_connection);
			}
		});
	}

	static getNextId (tableName, prefix){
		return new Promise( (resolve, reject) => {
			let zeroPad = (new Array(idSize[tableName]||5)).fill(0).join(''),
				ninePad = (new Array(idSize[tableName]||5)).fill(9).join('');

			let idStart = (prefix||'')+zeroPad,
				idEnd = (prefix||'')+ninePad;

			//query this table to get a max ID if that field exists
			this.connection().then((connection) => {
				let docs = connection.allDocs({
					startKey: idStart,
					endKey: idEnd,
					descending: true
				});

				if( !docs.total_rows ){
					resolve(zeroPad);
				}
				else if( docs.rows[0].id == ninePad ){
					reject(new Error('Maximum rows exceeded for table: '+tableName+', with prefix: '+prefix'. Please email d.surguy@austinlane.com for assistance.'));
				}
				else{
					resolve( (parseInt(docs.rows[0].id.replace(prefix,'')) + 1).toString() );
				}
			});
		});
	}
}

//promise wrapper around mkdirp
function recursiveMkDir(dir){
	return new Promise( (resolve, reject) => {
		mkdirp(dir, function (err){
			if( err ){
				reject(err);
				return;
			}
			resolve();
		});
	});
}

//helper for easily getting platform-agnostic user data folder
function appData(){
	return process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : '/var/local');
}

module.exports = Database;

/*const Sequelize = require('sequelize');

let _connection;

class Database {
	static connection(){
		return new Promise( (resolve, reject) => {
			if( !_connection ){
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

				defineStructure(_connection);

				_connection.sync().then(()=>{
					resolve(_connection);
				});
			}
			else{
				resolve(_connection);
			}
		});
	}
};

function defineStucture(conn){
	conn.define('record', {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true
		},
		text: {
			type: Sequelize.STRING
		},
		timestamp: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW
		}
	});
	conn.define('snippets', {
		activator: {
			type: Sequelize.STRING
		},
		value: {
			type: Sequelize.STRING
		}
	});
	conn.define('settings', {
		key: {
			type: Sequelize.STRING
		},
		value: {
			type: Sequelize.STRING
		}
	});
};

module.exports = Database;*/