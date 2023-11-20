function create_domain_row(domain, remove, edit, sw, state){
  if (!state || state == true) {
    var checked = 'checked'
  } else {
    var checked = ''
  }

  var table = $('#d_list')
  var row = $('<tr id="row_{{domain}}" class="row_d"></tr>')
  var id = $('.row_d').length + 1
  var number = $(`<td>${id}</td>`)
  var active = $(`<td><input type="checkbox" ${checked} onchange="switch_domain('${domain}', '${sw}', this.checked)"/></td>`)
  var name = $(`<td><input id="d-${id}" value="${domain}" disabled></td>`)
  var edit = $(`<td><button id="d-ch-${id}" onclick="edit_domain('d-${id}', this, '${edit}')">Ручка</button></td>`)
  var trash = $(`<td><button onclick="mv_domain('${id}', '${remove}')">Корзина</button></td>`)
  var select = $(`<td><input id="check_d-${id}" type="checkbox"></td>`)

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
        create_domain_row(data['domain'], data['remove'], data['edit'], data['switch'])
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

function mv_domain(id, action){
  what = $(`#d-${id}`).val()
  $.ajax({
    url: '/domains/' + what + '/' + action,
    method: 'POST',
    dataType: 'json',
    data: [what],
  })    
  .done(function(data) {
    $(`#d-${id}`).parent().parent().remove()
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

  })
  .fail(function(data, s, e){

  });
};

function edit_domain(field_id, button, action){
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
  $('.row_d').each(function () {
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
        .then(result => {location.reload()})
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