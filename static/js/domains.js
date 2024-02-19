function GetAll(){
    'use strict';
    var url = '/domains';
    new PostSender(url, '', DomainCreateRow);
}

function DomainCreate(data) {
    'use strict';
    var domain = data[0]['value'];
    var hash = data[1]['value'];
    var url = '/domains/' + hash;
    new PostSender(url, {'domains': [domain]}, DomainCreateRow);
}

function DomainCreateRow(result) {
    'use strict';
    result.forEach(data => {
        new CreateDomainRow(data[0], data[1], true);
    });
};

function CreateDomainRow(id, domain, state){
    if (state == true || state == "True") {
      var checked = 'checked'
    } else {
      var checked = ''
      var check = document.getElementById('switchall');
      check.checked = false;
    }

    var table = $('#domains_list')
    var pos = $('.domainrow').length + 1
    var row = $(`<tr id="row_${pos}" class="domainrow"></tr>`)
    var number = $(`<td>${pos}</td>`)
    var active = $(`<td><input class="domainSwitch" type="checkbox" ${checked} onchange="SwitchDomain('${domain}', this.checked)"/></td>`)
    var name = $(`<td><input id="d-${id}" class="domainName" value="${domain}" disabled></td>`)
    var edit = $(`<td><button id="de-${id}" onclick="EditDomain('${domain}')">Ручка</button></td>`)
    var trash = $(`<td><button onclick="RemoveDomain('${domain}')">Корзина</button></td>`)
    var select = $(`<td><input id="ds-${id}" class="select" type="checkbox"></td>`)

    row.append(number)
    row.append(active)
    row.append(name)
    row.append(edit)
    row.append(trash)
    row.append(select)
    table.append(row)
  }

function SwitchDomain(domain, check){
    var hash = document.getElementById('switchHash').value
    false;
}

function EditDomain(domain, hash) {
    var hash = document.getElementById('editHash').value
    false;
}

function RemoveDomain(domain, hash){
    var hash = document.getElementById('removeHash').value
    false;
}