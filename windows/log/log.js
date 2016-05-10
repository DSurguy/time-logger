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
	document.querySelector('.date-selector').value = mDate.format('MM / DD / YYYY')
	loadRecordList(mDate);
}

function loadRecordList(mDate){

}

window.onload = function (){
	Database.init().then( () => {
		setupDatePicker();
		updateDateSelection(moment());
	});
};