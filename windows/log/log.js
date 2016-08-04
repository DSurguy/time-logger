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
		//grab and empty the table body
		let recordTable = document.querySelector('.record-list tbody');
		recordTable.innerHTML = '';
		//add all the records
		for( let i=0; i<docs.length; i++ ){
			let rawRow = document.createElement('tr');
			rawRow.classList.add('raw');
			let htmlString = '<td>'+docs[i].text+'</td>'
				+'<td>'+docs[i].time+'</td>';
			if( i > 0 ){
				let diffedTime = diffTime(docs[i].time,docs[i-1].time).split(/:/g);
				htmlString +='<td>'+diffedTime[0]+'h '+diffedTime[1]+'m '+diffedTime[2]+'s'+'</td>'; 
			}
			else{
				htmlString +='<td></td>';
			}
			rawRow.innerHTML = htmlString; 
			recordTable.appendChild(rawRow);

			let roundedRow = document.createElement('tr');
			roundedRow.classList.add('rounded');
			htmlString = '<td>'+docs[i].text+'</td>'
				+'<td>'+roundTime(docs[i].time)+'</td>';
			if( i > 0 ){
				let diffedTime = diffTime(roundTime(docs[i].time),roundTime(docs[i-1].time)).split(/:/g);
				htmlString +='<td>'+diffedTime[0]+'h '+diffedTime[1]+'m '+diffedTime[2]+'s'+'</td>'; 
			}
			else{
				htmlString +='<td></td>';
			}
			roundedRow.innerHTML = htmlString; 
			recordTable.appendChild(roundedRow);
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