function get_all(what, remove, edit, sw){
  $.ajax({
    url: what,
    method: 'POST',
    dataType: 'json'
  })    
  .done(function(data) {
    if (data){
      for (row of data){
        create_row(row[0], row[1], row[2], remove, edit, sw)
      }
  }
  })
  .fail(function(data, s, e){

  });  
}


function create_row(object, id, state, remove, edit, sw){
  if (state == true || state == "True") {
    var checked = 'checked'
  } else {
    var checked = ''
    var check = document.getElementById('o-sw-all');
    check.checked = false;
  }

  var table = $('#o_list')
  var row = $(`<tr id="row_${object}" class="row-o"></tr>`)
  var pos = $('.row-o').length + 1
  var number = $(`<td>${pos}</td>`)
  var active = $(`<td><input class="o-sw" type="checkbox" ${checked} onchange="switch_object('${object}', '${sw}', this.checked)"/></td>`)
  var name = $(`<td><input id="o_${pos}" value="${object}" disabled></td>`)
  var edit = $(`<td><button id="o-ch_${pos}" onclick="edit_object('o_${pos}', this, '${edit}')">Ручка</button></td>`)
  var trash = $(`<td><button onclick="mv_object('${id}', '${remove}')">Корзина</button></td>`)
  var select = $(`<td><input id="sel-o_${id}" class="sel-o-all" type="checkbox"></td>`)

  row.append(number)
  row.append(active)
  row.append(name)
  row.append(edit)
  row.append(trash)
  row.append(select)

  table.append(row)
}


function new_object(what, data, action, isimport){
      $("#message").text('');
      var object = data[0]['value']
      var request = new Promise(function(resolve, reject) {$.ajax({
        url: what + '/' + object + '/' + action,
        method: 'POST',
        dataType: 'json',
        data: data,
      })    
      .done(function(data) {
        if (!isimport){
          //location.reload();
        }
        create_row(data['object'], data['id'], true, data['remove'], data['edit'], data['switch'])
        resolve(data)
          //$('#d_list').prepend(`<tr><td>-</td><td>${data}</td></tr>`)
      })
      .fail(function(data, s, e){
        var message = $("#message")
        switch (data.responseText) {
          case 'exist': message.append(`${object} уже существует\n`); break;
          case 'badname': message.append(`${object} - неккоректное DNS имя\n`); break;
          default: break;}
      })}
      )
    return request
};

async function mv_domain(what, action){
  $.ajax({
    url: '/domains/' + what + '/' + action,
    method: 'POST',
    dataType: 'json',
    data: [what],
  })    
  .done(function(data) {
    domain = data[0]
    row = document.getElementById(`row_${domain}`)
    row.remove()
  })
  .fail(function(data, s, e){

  });
};

function switch_object(what, action, state){
  
  $.ajax({
    url: '/domains/' + what + '/' + action,
    method: 'POST',
    dataType: 'json',
    data: {"state": state},
  })    
  .done(function(data) {
    if (what == '*') {
      $('.o-sw').each(function(i, obj){
        obj.checked = state;
      })
    } else {
      var check = true
      $('.o-sw').each(function(i, obj){
        if (obj.checked == false){
          console.log(obj.checked)
          check = false}
      })
      document.getElementById('o-sw-all').checked = check;     
    }
  })
  .fail(function(data, s, e){

  });
};

function edit_domain(field_id, button, action){
  console.log(field_id)
  field = $(`#${field_id}`)
  var what =  field.attr("value")
  if (field.attr('disabled')) {
    field.prop('disabled', false);
    $(button).text('Дискета')
  } else {
    var newval = field.val()
    if (newval != field.attr("value")){
      $.ajax({
        url: '/domains/' + what + '/' + action,
        method: 'POST',
        dataType: 'json',
        data: {"new": newval},
        success: function(data) {
          field.attr("value", data[0])
          field.prop('disabled', true);
          $(button).text('Ручка')
        },
        error: function(data, s, e) {
          if (data.responseText == 'badname') {
            alert('Bad Name')
          };
        }
      })
    } else {
      field.prop('disabled', true);
      $(button).text('Ручка')
    };
  };
}

function search_domain(field) {
  var origin = $(field).val().toLowerCase()
  var pattern = new RegExp(origin, 'g')
  $('.row-o').each(function () {
    var id = this.id.replace("row_",'')
    if (!id.match(pattern)) {
      $(this).css("display", "none");
    } else {
      $(this).css("display", "");
    }
  });
}

function import_domain(input, action){
  let file = input.files[0];
  input.value = '';
  let reader = new FileReader();

  reader.onload = function(e) {
    var result = JSON.parse(e.target.result);
    if (Object.keys(result).length > 0){
      localStorage.setItem('d_import_fails', '')
      $("#hmsg").text('')
      for (domain of result){
        var promises = []
        var data = [{'name': 'domain', 'value': domain}]
        promises.push(new_domain(data, action, true));
        }
      Promise.all(promises)
        .then(result => {})
        .catch(error => {})
      }
    }

  reader.readAsText(file)
}

function remove_selected_domains(action){
  var array = $('.sel-o-all').map(function(){
    if (this.checked){
    return this};
  }).get()
  array.forEach(async (item) => {
    var id = item.id.replace("sel-o_",'')
    await mv_domain(id, action)
  });
  document.getElementById('check_d_all').checked = false;
}

function select_domains(state){
  $('.sel-o-all').each(function(i, obj){
    obj.checked = state
  })
}