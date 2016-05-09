const Database = require('../../shared-resources/database/database.js');
let _connection;

function setupInputBindings(){
	var mainInput = document.querySelector('#mainInput');

	//bind keycodeHandler
	mainInput.addEventListener('keypress', (e)=>{routeMainInputKeypress(e.keyCode, e)});
};

function routeMainInputKeypress(keyCode, e){
	switch(keyCode){
		case 13: //ENTER
			commitInput(e.target.value);
		break;
		case 123: //F12
			require('remote').getCurrentWindow().toggleDevTools();
		break;
	}
};

function commitInput(input){
	validateInput(input)
	.then(()=>{
		//
	})
	.then((newRecord)=>{
		//report success
		reportSuccessAndClose(newRecord);
	})
	.catch( (err) => {
		//report error
		reportError(err);
	});
};

function validateInput(input){
	return new Promise( (resolve, reject) =>{
		if( input.trim() == "" ){
			reject(new Error('Input length is zero'));
			return;
		}
		resolve();
	});
};


function reportError(err){
	console.log(err);
};

function reportSuccessAndClose(newRecord){
	console.log(newRecord);
};

window.onload = function (){
	Database.connection().then((connection)=>{
		_connection = connection;
		setupInputBindings();
		document.querySelector('input').focus();
	});
};