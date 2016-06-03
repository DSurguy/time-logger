const Database = require('../../shared-resources/database/database.js');
let saveActions = [];

function setupBindings(){
    var optInputs = document.querySelectorAll('.option input');
    
    for( var i=0; i<optInputs.length; i++ ){
        optInputs[i].addEventListener('change', function (e) {
            updateOption(this.parentElement.getAttribute('data-option-key'), this.value);
        });
    }
};

function updateOption(key, value){
    startSaveDisplay();
    storeOptionInDatabase(key, value).then( ()=>{
        endSaveDisplay();
    }).catch( (err) =>{
        alert(err.message);
    });
};

function storeOptionInDatabase(key, value){
    return new Promise( (resolve, reject) => {
        Database.store('settings').update({key: key}, {
            key: key,
            value: value
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

function startSaveDisplay(){
    saveActions.push(1);
    document.querySelector('.header .saveIcon').classList.remove('d-hidden');
};

function endSaveDisplay(){
    saveActions.pop();
    if( !saveActions.length ){
        document.querySelector('.header .saveIcon').classList.add('d-hidden');
    }
};

function showOptions(){
    document.querySelector('.options').classList.remove('d-hidden');
};

function loadSettingsIntoPage(){
    return new Promise( (resolve, reject) => {
        Database.store('settings').find({}, (err, docs) => {
            if( err ){
                reject(err); return;
            }
            for( let i=0; i<docs.length; i++ ){
                document.querySelector('[data-option-key='+docs[i].key+'] input').value = docs[i].value;
            }
            resolve();
        });
    });
}

window.onload = function (){
	Database.init().then(()=>{
        loadSettingsIntoPage().then(() => {
            setupBindings();
            showOptions();
        });
    });
};