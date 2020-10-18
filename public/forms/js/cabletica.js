$(document).ready(function(){

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
    $('.money').mask('000.000.000.000.000,00', {reverse: true});
    $('.month').mask('00');
    $('.tax').mask('00%', {reverse: true});
    $('.descuento').mask('00%', {reverse: true});
    $('#idnumber').mask('000000000000');
    $('#telefonoCelular').mask('0000-0000');
    $('#telefonoFijo').mask('0000-0000');
    $('#telefonoTrabajo').mask('0000-0000');
    $('#ccDate').mask('00/00');
    $('#idContrato').mask('000000000000');
    $('#telefonoVendedor').mask('0000-0000');
    $('#ccCCV').mask('0000');
    // .mask('000.000.000.000.000,00', {reverse: true});   

    $('#metodo_pago').on('change', function() {
        var currentValue = $(this).val();
        
        if(currentValue == 'pago_linea'){
            $('#cc-info').show();
        }else{
            $('#cc-info').hide();
        }
    })

    $('body').on('click','.remove-detail',function(e){
        e.preventDefault();
        $(this).closest('.sub-container').remove();
    })

    $("#ccNumber").mask('0000000000000000').keyup(function() {
      $('#ccNumber').validateCreditCard(function(result){
           var that = $(this);
           var src = '';
           
           if(result && result.card_type){
                // console.log('CC type: ' + result.card_type.name
                //     + '\nLength validation: ' + result.length_valid
                //     + '\nLuhn validation: ' + result.luhn_valid);

               switch(result.card_type.name){
                    case 'visa':
                        src = '/img/visa-logo.png';
                    break;
                     case 'mastercard':
                        src = '/img/mc-logo.png';
                    break;
                     case 'amex':
                        src = '/img/amex-logo.png';
                    break


               }
               $('#ccIcon').empty()

               if(src != ''){                    
                    $('<img />',{ 
                        id: 'ccIconImg',
                        src: src, 
                        width: 56
                     }).appendTo($('#ccIcon'));
               }
               // console.log('that.length',that.val().length)
               // if(that.length == 1){
               //  $('#ccIcon').empty()
               // }
                
           }
        });
    });

    var deleteImgBtn = '<button class="remove mdc-button mdc-button mdc-layout-grid__cell--span-12" id="delete-row" style="display: inline-block;">';
        deleteImgBtn += '<span class="mdc-button__label">Eliminar Detalle</span>';
        deleteImgBtn += '</button>';
		
    if (window.File && window.FileList && window.FileReader) {

        /*----------- Cedula front -----------*/
        $("#cedFrontFile").on("change", function(e) {
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
                "</span>").appendTo("#cedFrontFile-files");
              $(".remove").click(function(){
                $(this).parent(".pip").remove();
              });
              
            });
            fileReader.readAsDataURL(f);
          }
        });

        /*----------- Cedula back -----------*/
        $("#cedBackFile").on("change", function(e) {
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
                "</span>").insertAfter("#cedBackFile-files");
              $(".remove").click(function(){
                $(this).parent(".pip").remove();
              });
              
            });
            fileReader.readAsDataURL(f);
          }
        });

        /*----------- cc front -----------*/
        $("#ccFile").on("change", function(e) {
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
                "</span>").insertAfter("#ccFile-files");
              $(".remove").click(function(){
                $(this).parent(".pip").remove();
              });
              
            });
            fileReader.readAsDataURL(f);
          }
        });

        /*----------- recibos -----------*/
        $("#reciboFile").on("change", function(e) {
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
                "</span>").insertAfter("#reciboFile-files");
              $(".remove").click(function(){
                $(this).parent(".pip").remove();
              });
              
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
    	// clone('','');
        var id = "reclaim-detail-" +  cloneIndex;
    	$('#reclaim-detail-0').clone()
        .appendTo('.reclaim-container')
        .attr("id", id)
        .find("*")
        .each(function() {
            if($(this).hasClass('hasDatepicker')){
                $(this).removeAttr('id').removeClass('hasDatepicker')
                $(this).datepicker();    
            }
        
        });


        $('#'+id).find('input:text').val('');  

        cloneIndex++;

        $('.month').unmask();
        $('.tax').unmask();
        $('.descuento').unmask();
        $('.money').unmask();

        $('.month').mask('00');
        $('.tax').mask('00%');
        $('.descuento').mask('00%');
        $('.money').mask('000.000.000.000.000,00', {reverse: true});
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
/*
    $('input.onoffswitch-checkbox').on('change', function() {
        $('.hide-field').fadeOut('slow');
        $('input.onoffswitch-checkbox').not(this).prop('checked', false);  
    });
*/
    var cobroAlterado = toggleOptions('#cobro-alterado', '.monto-alterado');
    var ajustePrecio = toggleOptions('#ajuste-precio', '.nota-credito-upload');
    var autCompra = toggleOptions('#autorizacion-compra', '.pedido-upload');
    var autCompra = toggleOptions('#otros-medios', '.cheque-efectivo');
    var autCompra = toggleOptions('#partial-founds', '.monto-parcial');
    var reclamo = toggleOptions('#solicitud-reclamo', '.reclamo-options');
    var indem = toggleOptions('#indemnizacion_onoff', '.reclamo-options');
    
    /* Nuevos */
    var ligado = toggleOptions('#contrato_ligado', '.idcontrato');

    // Mock data for populate id
    $('#idnumber').on('change', function() {
        if($(this).val() == '205790889') {
           $('#name').val('Richard Mesen Mesen');
           
           $('#telefonoCelular').unmask()
           $('#telefonoCelular').val('71765002')
           $('#telefonoCelular').mask('0000-0000')
           

           $('#telefonoFijo').unmask()
           $('#telefonoFijo').val('22229090')
           $('#telefonoFijo').mask('0000-0000')
           
          
           $('#telefonoTrabajo').unmask()
           $('#telefonoTrabajo').val('22229091')
           $('#telefonoTrabajo').mask('0000-0000')


           $('#provincia').val('sanjose')
           $('#canton').val('central')
           $('#distrito').val('pavas')
           $('#direccion').val('Rohrmoser, 100 metros sur y 50 oeste de la casa de la bomba')
        }
    });
    
    $("#use_dir_data").on( 'change', function() {
        if( $(this).is(':checked') ) {
           // $('#tipo_persona').val('Richard Mesen Mesen');
            $('#provinciaInstall').val('sanjose')
           $('#cantonInstall').val('central')
           $('#distritoInstall').val('pavas')
           $('#direccionInstall').val('Rohrmoser, 100 metros sur y 50 oeste de la casa de la bomba')
        } else {
            // Hacer algo si el checkbox ha sido deseleccionado
            // $('#tipo_persona').val('');
            $('#provinciaInstall').val('')
           $('#cantonInstall').val('')
           $('#distritoInstall').val('')
           $('#direccionInstall').val('')
        }
    });


    $('#submit-form').on('click', function(e){
        e.preventDefault();
        
        $(this).html('<i class="fas fa-spinner fa-spin"></i> Procesando...').attr('disabled',true)

        $( "#cableticaForm" ).validate({
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
        if( $('#cableticaForm').valid()){
            $('#signature_img').val($('#signature-canvas')[0].toDataURL());
            $('form').submit();
        }else{
            window.scrollTo({ top: 0, behavior: 'smooth' });
            $(this).html('Enviar Formulario').attr('disabled',false)

            console.log('FORM INVALID');

            var validator = $('#cableticaForm').validate();

            $.each(validator.errorMap, function (index, value) {

                console.log('Id: ' + index + ' Message: ' + value);

            });
        }

    });

    // $()
    
});