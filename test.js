// const nem = require('nem-sdk').default;
// nem.model.objects.create('endpoint')('localhost', 7890);

const nemapi = require('nem-api');
const san = new nemapi('http://localhost:7890');
// const unirest = require('unirest');

// var signature = san.sign('','');
// console.log(signature);

// san.get('/account/get', {address:'TBJIC6LRNUVXQSVPO3VZSH3MUYNP3IO4OQTI5IFD'}, resp => {
//     console.log(resp.body);
// });
// san.get('/account/get', {address:'TB3FQ3SBZVXGI7FELNXTI3CBUVC37CCENFBFJGAM'}, resp => {
//     console.log(resp.body);
// });

// let txObj = {
//     'isMultisig': false,
//     'recipient': 'TB3FQ3SBZVXGI7FELNXTI3CBUVC37CCENFBFJGAM',
//     'amount': 1,
//     'message': 'Hello reciever!',
//     'due': 60
// };

// san.doTX(txObj, '00f661825535f409bfb616711b886b89ab6203a50e6c0245bf94b746fa0464d577', resp => {
//     console.log(resp.body);
// });

san.get('/namespace', {namespace:'chronobank'}, resp => {
    console.log(resp.body);
});
