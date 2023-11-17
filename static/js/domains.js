function new_domain(form){
      $("#message").text('');
      var out = $(form).serializeArray()
      var domain = out[0]['value']
      console.log(out)
      console.log(domain)
      $.ajax({
        url: '/domains/' + domain + '/' + $(form).attr("action"),
        method: 'POST',
        dataType: 'json',
        data: out,
      })    
      .done(function(data) {
          $('#d_list').prepend(`<tr><td>-</td><td>${data}</td></tr>`)
      })
      .fail(function(data, s, e){
          if (data.responseText == 'exist') {
            $("#message").text("Домен уже существует");
          };
          //alert('Внутрення ошибка, перезагрузите страницу!');
      });
};

function mv_domain(what, action){
  console.log(what)
  $.ajax({
    url: '/domains/' + what + '/' + action,
    method: 'POST',
    dataType: 'json',
    data: [what],
  })    
  .done(function(data) {
    $(`#d-${data}`).parent().parent().remove()
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