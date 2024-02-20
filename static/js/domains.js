function GetAll(){
    'use strict';
    var url = '/domains';
    new PostSender(url, '', DomainPostWork);
}

function DomainCreate(data) {
    'use strict';
    var domain = data[0]['value'];
    var hash = data[1]['value'];
    var url = '/domains/' + hash;
    new PostSender(url, {'domains': [domain]}, DomainPostWork);
}

function DomainPostWork(result) {
    'use strict';
    result.forEach(data => {
        switch (data[0]){
            case 'exist':
                new Messager($('#domainMessage'), 'Домен существует')
                break
            default:
                new CreateDomainRow(data[0], data[1], data[2]);
                break
        };
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
    var row = $(`<tr id="row-${id}" class="domainrow"></tr>`)
    var number = $(`<td>${pos}</td>`)
    var active = $(`<td><input class="domainSwitch" type="checkbox" ${checked} onchange="SwitchDomain('${domain}', this.checked)"/></td>`)
    var name = $(`<td><input id="d-${id}" class="domainName" value="${domain}" disabled></td>`)
    var edit = $(`<td class="editcell"><button id="de-${id}" onclick="EditDomain('${id}')">Ручка</button></td>`)
    var trash = $(`<td><button onclick="RemoveDomain('${id}')">Корзина</button></td>`)
    var select = $(`<td><input id="ds-${id}" class="select" type="checkbox" onchange="SelectRow(this)"></td>`)

    row.append(number)
    row.append(active)
    row.append(name)
    row.append(edit)
    row.append(trash)
    row.append(select)
    table.append(row)
  }

function SwitchDomain(domain, state){
    var hash = document.getElementById('switchHash').value
    var url = '/domains/' + hash
    new PostSender(url, {'domains': [domain], 'states': [state]}, nothing);
    var allcheck = document.getElementById('switchall');
    var checkers = $('.domainSwitch').map(function(){
        return this.checked
    }).get()

    if (checkers.includes(false)) {
        allcheck.checked = false
    } else {
        allcheck.checked = true
    }
}

function SwitchAllDomains(state) {
    var hash = document.getElementById('switchHash').value
    var url = '/domains/' + hash
    domains = $('.domainName').map(function(){
        return this.value
    }).get()
    var states = []
    domains.forEach(function(){
        states.push(state)
    })
    new PostSender(url, {'domains': domains, 'states': states}, nothing);
    $('.domainSwitch').map(function(){
        this.checked = state
    });
}

function EditDomain(id) {
    var hash = document.getElementById('editHash').value
    var url = '/domains/' + hash
    var reg = new RegExp("/" + id + "/")
    var row = $('.domainrow').filter(function(){
        if (this.id.match(id)) {
            return this
        }
    })
    var cell = row.children('.editcell')
    var save = $(`<button>Дискета</button>`)
    var cancel = $(`<button>Крестик</button>`)
    cell.html('')
    cell.append(save)
    cell.append(cancel)
    false;
}

function SelectRow(){
    var allselect = document.getElementById('selectall');
    var selectes = $('.select').map(function(){
        return this.checked
    }).get()

    if (selectes.includes(true)) {
        allselect.checked = true
    } else {
        allselect.checked = false
    }
}

function AllSelectRows(state) {
    $('.domainrow').map(function(){
        if ($(this).css("display") != 'none'){
            var select = this.querySelector('.select');
            select.checked = state;
        };
    })
    //console.log(state)
}

function RemoveDomain(id){
    var hash = document.getElementById('removeHash').value
    var url = '/domains/' + hash
    new PostSender(url, {'id': [id]}, RemoveDomainPostWork);
}

function RemoveManyDomains(){
    var hash = document.getElementById('removeHash').value
    var url = '/domains/' + hash
    var reg = /\d+/
    var indexes = $('.select').map(function(){
        if (this.checked == true){
            return this.id.match(reg)
        };
    }).get()
    new PostSender(url, {'id': indexes}, RemoveDomainPostWork);
    var allselect = document.getElementById('selectall');
    allselect.checked = false;
}

function RemoveDomainPostWork(data){
    data.forEach(id => {
        $('#row-'+id).remove()
    })
}

function SearchDomain(field) {
    var origin = $(field).val().toLowerCase()
    var pattern = new RegExp(origin, 'g')
    $('.domainName').each(function (i, obj) {
      var row = $(this).closest('tr')
      if (!obj.value.match(pattern)) {
        $(row).css("display", "none");
      } else {
        $(row).css("display", "");
      }
    });
  }