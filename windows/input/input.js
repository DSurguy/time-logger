const Database = require('../../shared-resources/database/database.js'),
	moment = require('moment'),
	remote = require('remote');

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
	validateInput(input).then( () => {
		return new Promise( (resolve, reject) => {
			Database.store('records').insert({
				text: input,
				date: moment().format('YYYYMMDD'),
				time: moment().format('HH:mm:ss')
			}, (err, docs) => {
				if( err ){
					reject(err); return;
				}
				resolve(docs);
			});
		});
	})
	.then((newRecord) => {
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
		
	let successSlider = document.createElement('div');
	
	successSlider.classList.add('toast');
	
	successSlider.innerHTML = '<div class="icon"><img src="../../shared-resources/images/checkmark.svg" /></div><div class="message">Done!</div><div class="log"></div>';
	let logElem = successSlider.querySelector('.log');
	
	logElem.innerHTML = '<span class="normal">Logged </span><span class="mono">'+newRecord.text+'</span><span class="normal"> at </span><span class="mono">'+newRecord.time+'</span>';
	
	document.body.appendChild(successSlider);
	//reflow
	let fake = successSlider.offsetHeight;
	
	//trigger CSS slide-right
	successSlider.classList.add('end-position');
	
	//close the window after two seconds
	setTimeout(() => {
		remote.getCurrentWindow().close();
	}, 2000);
};

window.onload = function (){
	Database.init().then( () => {
		setupInputBindings();
		document.querySelector('input').focus();
	});
};