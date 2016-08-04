const Database = require('../../shared-resources/database/database.js');

let datepicker, roundingMode;

function setupDatePicker(){
	let datepickerButton = document.querySelector('.date-selector');

	datepicker = new Pikaday({
		onSelect: function (){
			updateDateSelection(this.getMoment())
		},
		format: 'MM / DD / YYYY',
		defaultDate: moment().toDate(),
		field: datepickerButton
	});
}

function updateDateSelection(mDate){
	document.querySelector('.date-selector').value = mDate.format('MM / DD / YYYY');
	loadRecordList(mDate);
}

function setupBindings(){
	document.querySelector('.toggle-rounding-button').addEventListener('click', function (e){
		this.setAttribute('disabled','disabled');
		swapRoundingMode().then(()=>{
			this.removeAttribute('disabled');
		}).catch((err)=>{
			alert(err);
			this.removeAttribute('disabled');
		})
	});
}

function loadRoundingMode(){
	return new Promise( (resolve, reject) => {
		Database.store('settings').find({key: 'rounding-mode'}, (err, docs) => {
			if( err ){
				reject(err); return;
			}
			if( docs[0] ){
				//'raw' or 'rounded'
				roundingMode = docs[0].value;
				document.querySelector('.record-list').classList.add('-show-'+docs[0].value);
				resolve();
			}
			else{
				//option not yet saved, default to rounded and store
				roundingMode = 'rounded';
				document.querySelector('.record-list').classList.add('-show-rounded');
				saveRoundingModeToDatabase('rounded').then(resolve).catch(reject);
			}
		});
	});
}

function saveRoundingModeToDatabase(newMode){
	return new Promise((resolve, reject) => {
		Database.store('settings').update({key: 'rounding-mode'}, {
			key: 'rounding-mode',
			value: newMode
		}, {
			upsert: true
		}, (err) => {
			if( err ){
				reject(err); return;
			}
			resolve();
		});
	});
}

function swapRoundingMode(){
	return new Promise((resolve, reject)=>{
		if( roundingMode == 'raw' ){
			//swap to rounded
			roundingMode = 'rounded';
			document.querySelector('.toggle-rounding-button').value = 'Rounded';
			let recordsList = document.querySelector('.record-list');
			recordsList.classList.remove('-show-raw');
			recordsList.classList.add('-show-rounded');
			saveRoundingModeToDatabase('rounded').then(resolve).catch(reject);
		}
		else{
			//swap to raw
			roundingMode = 'raw';
			document.querySelector('.toggle-rounding-button').value = 'Raw';
			let recordsList = document.querySelector('.record-list');
			recordsList.classList.remove('-show-rounded');
			recordsList.classList.add('-show-raw');
			saveRoundingModeToDatabase('raw').then(resolve).catch(reject);
		}
	});
}

function loadRecordList(mDate){
	Database.store('records').find({
		date: mDate.format('YYYYMMDD')
	}).sort({time: 1}).exec( (err, docs) => {
		//empty the table body
		let recordTable = document.querySelector('.record-list');
		recordTable.innerHTML = recordTable.querySelector('.header').outerHTML;
		//add all the raw records
		for( let i=0; i<docs.length; i++ ){
			recordTable.appendChild(createRawRowHtmlString(docs[i], docs[i-1]));
		}
		//the following is necessary to get css-only row striping right. Gross.
		//add a fake row if the # of rows is odd
		if( docs.length%2 == 1 ){
			let fakeRow = document.createElement('div');
			fakeRow.classList.add('row');
			fakeRow.style = 'display: none';
			recordTable.appendChild(fakeRow);
		} 
		//add all the rounded records
		for( let i=0; i<docs.length; i++ ){
			recordTable.appendChild(createRoundedRowElement(docs[i], docs[i-1]));
		}
	});
}

function createRawRowHtmlString(doc1, doc2){
	let rawRow = document.createElement('div');
	rawRow.classList.add('row');
	rawRow.classList.add('raw');
	let htmlString = '<div class="taskCol">'+doc1.text+'</div>'
		+'<div class="timeCol">'+doc1.time+'</div>';
	if( doc2 ){
		let diffedTime = diffTime(doc1.time,doc2.time).split(/:/g);
		//hours diff
		htmlString += '<div class="hoursDiffCol">'+parseInt(diffedTime[0])+'.'+(parseInt(diffedTime[1])/60).toFixed(2).split(/\./)[1]+'<span class="time-label">h</span></div>';
		//raw diff
		htmlString +='<div class="rawDiffCol">'+diffedTime[0]+'<span class="time-label">h</span> '+diffedTime[1]+'<span class="time-label">m</span> '+diffedTime[2]+'<span class="time-label">s</span>'+'</div>';
	}
	else{
		htmlString +='<div class="rawDiffCol"></div>';
		htmlString +='<div class="hoursDiffCol"></div>';
	}
	rawRow.innerHTML = htmlString; 
	return rawRow;
}

function createRoundedRowElement(doc1, doc2){
	let roundedRow = document.createElement('div');
	roundedRow.classList.add('row');
	roundedRow.classList.add('rounded');

	//add the actual task text
	htmlString = '<div class="taskCol">'+doc1.text+'</div>';

	//round the time and split it for use later
	let roundedTime = roundTime(doc1.time),
		roundedTimeSplit = roundedTime.split(/:/g);

	//calculate AMPM
	let ampm = parseInt(roundedTimeSplit[0]) < 12 ? 'AM' : 'PM';
	//calculate AMPM hours
	let ampmHours = parseInt(roundedTimeSplit[0])%12;

	//add the entry time to the row
	htmlString += '<div class="timeCol">'+ampmHours+':'+roundedTimeSplit[1]+' '+ampm+'</div>';

	//time diffs
	if( doc2 ){
		let diffedTime = diffTime(roundTime(doc1.time),roundTime(doc2.time)).split(/:/g);
		//hours diff
		htmlString += '<div class="hoursDiffCol">'+parseInt(diffedTime[0])+'.'+(parseInt(diffedTime[1])/60).toFixed(2).split(/\./)[1]+'<span class="time-label">h</span></div>';
		//raw diff
		htmlString +='<div class="rawDiffCol">'+diffedTime[0]+'<span class="time-label">h</span> '+diffedTime[1]+'<span class="time-label">m</span> '+'</div>';
	}
	else{
		htmlString +='<div class="rawDiffCol"></div>';
		htmlString +='<div class="hoursDiffCol"></div>';
	}
	roundedRow.innerHTML = htmlString;
	return roundedRow; 
}

//time format should me hh:mm:ss
function diffTime(time1, time2){
	let secondsDiff;
	if( parseInt(time1.replace(/:/g,'')) > parseInt(time2.replace(/:/g,'')) ){
		secondsDiff = convertTimeToSeconds(time1) - convertTimeToSeconds(time2);
	}
	else{
		secondsDiff = convertTimeToSeconds(time2) - convertTimeToSeconds(time1);
	}
	//convert the seconds to hh:mm:ss
	return convertSecondsToTime(secondsDiff);
}

function convertTimeToSeconds(timeString){
	return timeString.split(/:/g).reduce((total, cur, index) => {
		switch (index){
			case 0: total += parseInt(cur)*60*60; break;
			case 1: total += parseInt(cur)*60; break;
			case 2: total += parseInt(cur);
		}
		return total;
	},0);
}

function convertSecondsToTime(seconds){
	let hours = parseInt(seconds/60/60);
	seconds = seconds - hours*60*60;
	let mins = parseInt(seconds/60);
	seconds = seconds - mins*60;
	return leftPadZero(hours,2)+':'+leftPadZero(mins,2)+':'+leftPadZero(seconds,2);
}

function roundTime(time){
	let seconds = convertTimeToSeconds(time);
	let remainder = seconds%(15*60); //get time past 15 minutes
	if( remainder >= 15*30 ){
		//round up
		return convertSecondsToTime(seconds+(15*60-remainder) );
	}
	else{
		//round down
		return convertSecondsToTime(seconds-remainder);
	}
}

function leftPadZero(val, length){
	let valLength = (val+'').length; 
	if( valLength < length ){
		let paddedString = '';
		for( let i=valLength; i<length; i++ ){
			paddedString += '0';
		}
		return paddedString + val+'';
	}
	return val+'';
}
window.onload = function (){
	Database.init().then( () => {
		setupDatePicker();
		setupBindings();
		loadRoundingMode().then(()=>{
			updateDateSelection(moment());
		}).catch(alert);
	});
};