function DomainCreate(data) {
    'use strict';
    var domain = data[0]['value'];
    var hash = data[1]['value'];
    var url = '/domains/' + hash;
    PostSender(url, {'domains': [domain]}, DomainCreateSuccess);
}

function DomainCreateSuccess(result) {
    console.log(result);
};