const Datastore = require('nedb'),
	mkdirp = require('mkdirp');

let _stores = {};

class Database{
	static init () {
		return new Promise( (resolve, reject) => {
			recursiveMkDir(appData()+'/time-logger').then(() => {
				//load default datastores
				_stores['records'] = new Datastore({ filename: appData()+'/time-logger/records', autoload: true });
				_stores['snippets'] = new Datastore({ filename: appData()+'/time-logger/snippets', autoload: true });
				_stores['settings'] = new Datastore({ filename: appData()+'/time-logger/settings', autoload: true });
				resolve();
			}).catch(reject);
		});
	}

	static store (storeName){
		return _stores[storeName];
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