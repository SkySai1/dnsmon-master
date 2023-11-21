function get_all_domains(remove, edit, sw){
  $.ajax({
    url: '/domains',
    method: 'POST',
    dataType: 'json'
  })    
  .done(function(data) {
    if (data){
      for (row of data){
        create_domain_row(row[0], row[1], row[2], remove, edit, sw)
      }
  }
  })
  .fail(function(data, s, e){

  });  
}


function create_domain_row(domain, id, state, remove, edit, sw){
  if (state == true || state == "True") {
    var checked = 'checked'
  } else {
    var checked = ''
    var check = document.getElementById('d-sw-all');
    check.checked = false;
  }

  var table = $('#d_list')
  var row = $(`<tr id="row_${domain}" class="row-d"></tr>`)
  var pos = $('.row-d').length + 1
  var number = $(`<td>${pos}</td>`)
  var active = $(`<td><input class="d-sw" type="checkbox" ${checked} onchange="switch_domain('${domain}', '${sw}', this.checked)"/></td>`)
  var name = $(`<td><input id="d_${pos}" value="${domain}" disabled></td>`)
  var edit = $(`<td><button id="d-ch_${pos}" onclick="edit_domain('d_${pos}', this, '${edit}')">Ручка</button></td>`)
  var trash = $(`<td><button onclick="mv_domain('${id}', '${remove}')">Корзина</button></td>`)
  var select = $(`<td><input id="sel-d_${id}" class="sel-d-all" type="checkbox"></td>`)

  row.append(number)
  row.append(active)
  row.append(name)
  row.append(edit)
  row.append(trash)
  row.append(select)

  table.append(row)
}


function new_domain(data, action, isimport){
      $("#message").text('');
      var domain = data[0]['value']
      var request = new Promise(function(resolve, reject) {$.ajax({
        url: '/domains/' + domain + '/' + action,
        method: 'POST',
        dataType: 'json',
        data: data,
      })    
      .done(function(data) {
        if (!isimport){
          //location.reload();
        }
        create_domain_row(data['domain'], data['id'], true, data['remove'], data['edit'], data['switch'])
        resolve(data)
          //$('#d_list').prepend(`<tr><td>-</td><td>${data}</td></tr>`)
      })
      .fail(function(data, s, e){
        if (!isimport){
          if (data.responseText == 'exist') {
            $("#message").text("Домен уже существует");
          };
        } else {
          if (data.responseText == 'exist') {
            $("#hmsg").append(document.createTextNode(`${domain} уже существует\n`));
            
          };
          try {reject(data.responseText)}     
          catch {};
        }
        
      })}
      )
    return request
};

function mv_domain(what, action){
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

function switch_domain(what, action, state){
  
  $.ajax({
    url: '/domains/' + what + '/' + action,
    method: 'POST',
    dataType: 'json',
    data: {"state": state},
  })    
  .done(function(data) {
    if (what == '*') {
      $('.d-sw').each(function(i, obj){
        obj.checked = state;
      })
    } else {
      var check = true
      $('.d-sw').each(function(i, obj){
        if (obj.checked == false){
          console.log(obj.checked)
          check = false}
      })
      document.getElementById('d-sw-all').checked = check;     
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
  $('.row-d').each(function () {
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
        .catch(error => {
            if (error == 'exist')
            var text = $("#hmsg").text()
            if (text) {
              alert(text)
            }
          })
      }
    }

  reader.readAsText(file)
}

function remove_selected_domains(action){
  $('.sel-d-all').each(function(i, obj){
    if (obj.checked == true){
      var id = this.id.replace("sel-d_",'')
      mv_domain(id, action)
    }
  })  
}

function select_domains(state){
  $('.sel-d-all').each(function(i, obj){
    obj.checked = state
  })
}