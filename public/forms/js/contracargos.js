


$(document).ready(function(){
  console.log('init disputes')
    jQuery.validator.addMethod(
        "date",
        function(value, element) {
            return value.match(/^\d\d?\/\d\d?\/\d\d\d\d$/);
        },
        "Formato de fecha inválida (dd/mm/yyyy.)"
    );


    var global_canvas = $('#signature-canvas')[0].toDataURL();
    
    function isCanvasBlank() {
        var canvas = $('#signature-canvas')[0].toDataURL()
        
        var isEq = canvas == global_canvas;

        return isEq;
    }
    $('.only-alpha').keypress(function (e) {
        var regex = new RegExp(/^[a-zA-Z\s]+$/);
        var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (regex.test(str)) {
            return true;
        }
        else {
            e.preventDefault();
            return false;
        }
    });

    // $('#idnumber').mask('0-0000-0000');

    $("#tipo_persona").change(function(){
       var tipo = $(this).val();
       $('#idnumber').val('');
       console.log('tipo',tipo)
       switch(tipo){
            case 'fisico':
                $('#idnumber').mask('0-0000-0000');
                break;
            case 'juridico':
                $('#idnumber').mask('0-000-0000000');
                break;
            case 'didi':
            case 'dimex':
                $('#idnumber').mask('000000000000');
                break;
            case 'pasaporte':
                $('#idnumber').unmask();
                break;                
       }

    });

    $('#telefono').mask('0000-0000');

    $("#card").mask('00000000').keyup(function(e) {
        var val = $.trim($(this).val());

        if(val.length == 8){
            var str = val.replace(/\d(?=\d{4})/g, "*");    
            $(this).val(str);
        }
        

        
    });

    var deleteImgBtn = '<button class="remove mdc-button mdc-button mdc-layout-grid__cell--span-12" id="delete-row" style="display: inline-block;">';
        deleteImgBtn += '<span class="mdc-button__label">Eliminar Detalle</span>';
        deleteImgBtn += '</button>';
		
    if (window.File && window.FileList && window.FileReader) {
        $("#indemFiles").on("change", function(e) {
            console.log('here')
          var files = e.target.files,
            filesLength = files.length;
          for (var i = 0; i < filesLength; i++) {
            var f = files[i]
            var fileReader = new FileReader();
            fileReader.onload = (function(e) {
              var file = e.target;
              $("<span class=\"pip\">" +
                "<img class=\"imageThumb\" src=\"" + e.target.result + "\" title=\"" + file.name + "\"/>" +
                "<br/>" + deleteImgBtn +
                "</span>").insertAfter("#indemFiles");
              $(".remove").click(function(){
                $(this).parent(".pip").remove();
              });
              
              // Old code here
              /*$("<img></img>", {
                class: "imageThumb",
                src: e.target.result,
                title: file.name + " | Click to remove"
              }).insertAfter("#files").click(function(){$(this).remove();});*/
              
            });
            fileReader.readAsDataURL(f);
          }
        });
      } else {
        alert("Your browser doesn't support to File API")
      }

    $('#signature-placeholder').html('Fecha ' + moment(new Date()).format("DD/MM/YYYY"));

    $('body').on('click','#agregar-detalle', function(e){
    	e.preventDefault();    	
    	clone('#reclaim-detail-0','.reclaim-container');
        
    	if($('.reclaim-container .sub-container').length > 0){
    		$('#delete-row').show();
    	}
    });

    $( ".date" ).datepicker();

    $('body').on('click','#delete-row', function(e){
    	e.preventDefault();    	
    	var elmList = $('.reclaim-container .sub-container').length ;
    	console.log('length', elmList)    	
    	
    	if(elmList == 2){
    		$('#delete-row').hide();
    	}
    	
    	if( elmList > 0){
    		remove('.reclaim-container .sub-container');
    	}

    });

    $('input.onoffswitch-checkbox').on('change', function() {
        $('.hide-field').fadeOut('slow');
        $('input.onoffswitch-checkbox').not(this).prop('checked', false);  
    });

    var cobroAlterado = toggleOptions('#cobro-alterado', '.monto-alterado');
    var ajustePrecio = toggleOptions('#ajuste-precio', '.nota-credito-upload');
    var autCompra = toggleOptions('#autorizacion-compra', '.pedido-upload');
    var autCompra = toggleOptions('#otros-medios', '.cheque-efectivo');
    var autCompra = toggleOptions('#partial-founds', '.monto-parcial');
    var reclamo = toggleOptions('#solicitud-reclamo', '.reclamo-options');
    var indem = toggleOptions('#indemnizacion_onoff', '.reclamo-options');

    

    $('#submit-form').on('click', function(e){
        e.preventDefault();
        
        $(this).html('<i class="fas fa-spinner fa-spin"></i> Procesando...').attr('disabled',true)

        $( "#contracargosForm" ).validate({
                                      rules: {
                                        email: {
                                          required: true,
                                          email: true
                                        },
                                        reclamodate: {
                                            customDate: true,
                                            required: true
                                        }
                                      }
                                    });

        var validCanvas = isCanvasBlank($('#signature-canvas'));

        if(validCanvas){
            swal("Error!", "Este documento debe ser firmado!", "error"); 
            $(this).html('Enviar Formulario').attr('disabled',false)
            return false;
        }
        if( $('#contracargosForm').valid()){
          console.log('is valid')
            $('#signature_img').val($('#signature-canvas')[0].toDataURL());
            var type = $('#contracargosForm').attr('method');
            var data = $('#contracargosForm').serialize();
            var url = $('#contracargosForm').attr('action');

            console.log("type",type)
            console.log("url",url)
            console.log("data",data)

            //fix for using it in an iframe
            data += "&domain="+document.referrer;

            // $('#contracargosForm').submit(function(ev){
                // ev.preventDefault();
                // console.log('test')
                $.ajax({
                  type: type,
                  url: url,
                  data: data,
                  success: function (data) {
                     console.log('test')
                  }
              });
      
              
              
            // });
            $('#submit-form').attr('disabled',false)
        }else{
            window.scrollTo({ top: 0, behavior: 'smooth' });
            $(this).html('Enviar Formulario').attr('disabled',false)
        }

    });

    // $()
    
});