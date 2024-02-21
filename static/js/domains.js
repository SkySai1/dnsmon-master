function GetAll(){
    'use strict';
    var url = '/domains';
    new PostSender(url, '', DomainPostWork);
}

function DomainCreate(data) {
    'use strict';
    //new NewMessageBlock();
    var hash = document.getElementById('newHash').value;
    var url = '/domains/' + hash;
    var formdata = {
        'fqdn': data[0].value,
        'notify': data[1].value,
        'note': data[2].value
    };
    new PostSender(url, JSON.stringify([formdata]), DomainPostWork, 'application/json');
}

function DomainPostWork(result) {
    'use strict';
    result.forEach(data => {
        switch (data[0]){
            case 'exist':
                new Messager(data[1] + ' - домен существует')
                break
            default:
                new CreateDomainRow(data[0], data[1], data[2], data[3], data[4]);
                break
        };
    });
};

function CreateDomainRow(id, domain, notify, note, state){
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

    var editbtn = $(`<button id="de-${id}" class="editbutton">Ручка</button>`)
    editbtn.click(function(){new EditDomain(id)})
    var removebtn = $(`<button>Корзина</button>`)
    removebtn.click(function(){new RemoveDomain(id)})

    var data = new Object
    data.number = $(`<td>${pos}</td>`)
    data.active = $(`<td><input class="domainSwitch" type="checkbox" ${checked} onchange="SwitchDomain('${domain}', this.checked)"/></td>`)
    data.name = $(`<td><input id="dname-${id}" class="domainName" value="${domain}" disabled></td>`)
    data.notify = $(`<td><input id="dnotify-${id}" class="domainNotify" value="${notify}" disabled></td>`)
    data.note = $(`<td><textarea id="dnote-${id}" class="domainNote"disabled>${note}</textarea></td>`)
    data.edit = $(`<td class="editcell"></td>`)
    data.edit.append(editbtn);
    data.trash = $(`<td></td>`)
    data.trash.append(removebtn);
    data.select = $(`<td><input id="ds-${id}" class="select" type="checkbox" onchange="SelectRow(this)"></td>`)

    for (let key in data){
        row.append(data[key])
    }

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
    var row = $('.domainrow').filter(function(){
        if (this.id.match(id)) {
            return this
        }
    })
    var cell = row.children('.editcell')
    var edit = cell.children('.editbutton')
    var input = row.children('td').children('.domainName')
    var notify = row.children('td').children('.domainNotify')
    var note = row.children('td').children('.domainNote')
    var origin = new Object
    origin.name = input.val()
    origin.notify = notify.val()
    origin.note = note.text()
    var save = $(`<button class="savebtn">Дискета</button>`)
    save.click(function(){EditDomainSave(id, input, notify, note)})
    var cancel = $(`<button class="cancelbtn" onclick="">Крестик</button>`)
    cancel.click(function(){EditDomainCancel(origin, edit, save, cancel, input, notify, note)})
    edit.css('display', 'none');
    cell.append(save)
    cell.append(cancel)
    input.prop('disabled', false);
    notify.prop('disabled', false);
    note.prop('disabled', false);
}

function EditDomainSave(id, input, notify, note){
    var data = new Object()
    data.index = id
    data.fqdn = input.val()
    data.notify = notify.val()
    data.note = note.val()

    var hash = document.getElementById('editHash').value
    var url = '/domains/' + hash
    new PostSender(url, JSON.stringify([data]), EditDomainSavePostWork, 'application/json');
}

function EditDomainSavePostWork(array){
    array.forEach(function(one){
        var id = one['id']
        var row = $('.domainrow').filter(function(){
            if (this.id.match(id)) {
                return this
            }
        })
        var cell = row.children('.editcell')
        var edit = cell.children('.editbutton')
        var save = cell.children('.savebtn')
        var cancel = cell.children('.cancelbtn')
        var input = row.children('td').children('.domainName')
        var notify = row.children('td').children('.domainNotify')
        var note = row.children('td').children('.domainNote')

        input.val(one['fqdn']);
        input.attr('value', one['fqdn']);
        input.prop('disabled', true);

        notify.val(one['notify'])
        notify.attr('value', one['notify'])
        notify.prop('disabled', true)

        note.text(one['note'])
        note.prop('disabled', true)

        edit.css('display', '');
        save.remove();
        cancel.remove();
    })
}

function EditDomainCancel(origin, edit, save, cancel, input, notify, note){
    input.val(origin.name);
    input.prop('disabled', true);

    notify.val(origin.notify)
    notify.prop('disabled', true)

    note.val(origin.note)
    note.prop('disabled', true)


    edit.css('display', '');
    save.remove();
    cancel.remove();
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

function DomainsImport(input) {
    var hash = document.getElementById('newHash').value;
    var url = '/domains/' + hash;
    let file = input.files[0];
    input.value = '';
    let reader = new FileReader();
    reader.onload = function(e) {
        //new NewMessageBlock();
        var formdata = []
        var result = JSON.parse(e.target.result);
        result.forEach(line => {
            formdata.push({
                'fqdn': line.split(' ')[0],
            });

        })
        new PostSender(url, JSON.stringify(formdata), DomainPostWork, 'application/json');
    }
    reader.readAsText(file)
}