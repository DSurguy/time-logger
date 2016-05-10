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
			newRow.innerHTML = '<td>'+docs[i].text+'</td>'
				+'<td>'+docs[i].time+'</td>';
			recordTable.appendChild(newRow);
		}
	});
}

window.onload = function (){
	Database.init().then( () => {
		setupDatePicker();
		updateDateSelection(moment());
	});
};