const Database = require('../../shared-resources/database/database.js');

let datepicker;

function setupDatePicker(){
	var datepickerButton = document.querySelector('.date-selector');

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
		//grab and empty the table body
		var recordTable = document.querySelector('.record-list tbody');
		recordTable.innerHTML = '';
		//add all the records
		for( var i=0; i<docs.length; i++ ){
			var newRow = document.createElement('tr');
			let htmlString = '<td>'+docs[i].text+'</td>'
				+'<td>'+docs[i].time+'</td>';
			if( i > 0 ){
				htmlString +='<td>'+diffTime(docs[i].time,docs[i-1].time)+'</td>'; 
			}
			else{
				htmlString +='<td></td>';
			}
			newRow.innerHTML = htmlString; 
			recordTable.appendChild(newRow);
		}
	});
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
	//convert the times to seconds
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
	return leftPadZero(hours)+':'+leftPadZero(mins)+':'+leftPadZero(seconds);
}

function leftPadZero(val, length){
	let valLength = (val+'').length; 
	if( valLength < length ){
		let paddedString = '';
		for( let i=valLength; i<valLength;i++ ){
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