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
    $(`#${data}`).parent().remove()
  })
  .fail(function(data, s, e){
      if (data.responseText == 'exist') {
        $("#message").text("Домен уже существует");
      };
  });
};