const Database = require('../../shared-resources/database/database.js');

let datepicker;

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

function loadRecordList(mDate){
	Database.store('records').find({
		date: mDate.format('YYYYMMDD')
	}).sort({time: 1}).exec( (err, docs) => {
		//empty the table body
		let recordTable = document.querySelector('.record-list');
		recordTable.innerHTML = recordTable.querySelector('.header').outerHTML;
		//add all the records
		for( let i=0; i<docs.length; i++ ){
			recordTable.appendChild(createRawRowHtmlString(docs[i], docs[i-1]));
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
		htmlString +='<div class="diffCol">'+diffedTime[0]+'h '+diffedTime[1]+'m '+diffedTime[2]+'s'+'</div>';
		//hours diff
		htmlString += '<div class="hoursDiffCol">'+parseInt(diffedTime[0])+'.'+(parseInt(diffedTime[1])/60).toFixed(2).split(/\./)[1]+'h</div>';
	}
	else{
		htmlString +='<div class="diffCol"></div>';
		htmlString +='<div class="hoursDiffCol"></div>';
	}
	rawRow.innerHTML = htmlString; 
	return rawRow;
}

function createRoundedRowElement(doc1, doc2){
	let roundedRow = document.createElement('div');
	roundedRow.classList.add('row');
	roundedRow.classList.add('rounded');
	htmlString = '<div class="taskCol">'+doc1.text+'</div>';
	let roundedTime = roundTime(doc1.time),
		roundedTimeSplit = roundedTime.split(/:/g);
	let ampm = parseInt(roundedTime.split(/:/g)[0]) < 12 ? 'AM' : 'PM';
	htmlString += '<div class="timeCol">'+parseInt(roundedTimeSplit[0])+':'+roundedTimeSplit[1]+' '+ampm+'</div>';
	if( doc2 ){
		//raw diff
		let diffedTime = diffTime(roundTime(doc1.time),roundTime(doc2.time)).split(/:/g);
		htmlString +='<div class="diffCol">'+diffedTime[0]+'h '+diffedTime[1]+'m '+'</div>';
		//hours diff
		htmlString += '<div class="hoursDiffCol">'+parseInt(diffedTime[0])+'.'+(parseInt(diffedTime[1])/60).toFixed(2).split(/\./)[1]+'h</div>';
	}
	else{
		htmlString +='<div class="diffCol"></div>';
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
		updateDateSelection(moment());
	});
};