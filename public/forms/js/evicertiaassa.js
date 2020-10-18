function inputBehaviour(){
    if($('input[type="text"]').val() != '' ){
        $('input[type="text"]').parent().find('label:not(.error)').addClass('highlight-lbl')
    }


    $('input[type="text"]').on('click', function(e){
        $(this).parent().find('label:not(.error)').addClass('highlight-lbl')
    })

    $('input[type="text"]').on('focus', function(e){
        $(this).parent().find('label:not(.error)').addClass('highlight-lbl')
    })

    $('input[type="text"]').focusout(function() {
        if($(this).parent().find('label').hasClass('highlight-lbl') && $(this).val() == '' ){
            $(this).parent().find('label').removeClass('highlight-lbl')
        }
      })
}

function validatePorcentaje(){
    $( ".porcentaje" ).blur(function() {
        var ref = $(this);
        var porcentaje = $(this).val();
        // const regex = /[a-zA-Z]{2}\d{20}/gm;
        if(porcentaje > 100){
            ref.val('')
            swal("Error!", "El monto máximo es 100%", "error");            
        }
    });
}

function maskId(){

    $('.idnumber').mask('0-0000-0000');

    // $('.idnumber').mask('0-0000-0000');

    // $("#tipo_id").change(function(){
    //    var tipo = $(this).val();
    //    $('.idnumber').val('');
    //    switch(tipo){
    //         case 'fisico':
    //             $('.idnumber').mask('0-0000-0000');
    //             break;
    //         case 'juridico':
    //             $('.idnumber').mask('0-000-0000000');
    //             break;
    //         case 'didi':
    //         case 'dimex':
    //             $('.idnumber').mask('000000000000');
    //             break;
    //         case 'Pasaporte':
    //         case 'Residencia No.':            
    //             $('.idnumber').unmask();
    //             break;                
    //    }

    // });

}

$(document).ready(function(){

    inputBehaviour()

    $('.idnumber').mask('0-0000-0000');
      

    $('#estado_civil').on('change', function() {
        var value = $(this).val();

        if(value == 'Unión Libre'){
            $('#unionlibre_time_container').removeClass('hide-field');
        }else{
            $('#unionlibre_time_container').addClass('hide-field');
        }

    });

    jQuery.validator.addMethod(
        "date",
        function(value, element) {
            return value.match(/^\d\d?\/\d\d?\/\d\d\d\d$/);
        },
        "Formato de fecha inválida (dd/mm/yyyy.)"
    );


    var provincia = '';


    $('#provincia').on('change', function(e){
        var optionsText = this.options[this.selectedIndex].text;
        $('#provincia_h').val(optionsText);
        $('#canton_h').val('Central');
        $('#distrito_h').val('Carmen');

        var id = $(this).val();
        provincia = id;
        var url = 'https://ubicaciones.paginasweb.cr/provincia/'+id+'/cantones.json';        
        $.get(url)
            .done(function( data ) {
                
                if(data){
                    var options = '';
                    $.each(data, function(key, value) {
                        options += '<option value="'+key+'">'+value+'</option>'                          
                    });
                    
                    $('#canton').html(options)


                    var url = 'https://ubicaciones.paginasweb.cr/provincia/'+id+'/canton/1/distritos.json';        
                        $.get(url)
                            .done(function( data ) {
                                
                                if(data){
                                    var options = '';
                                    $.each(data, function(key, value) {
                                        options += '<option value="'+key+'">'+value+'</option>'                          
                                    });
                                    
                                    $('#distrito').html(options)
                                    // $('#distrito_h').val($(this).text());
                                }

                              });


                }

              });
    });


    $('#canton').on('change', function(e){
        var id = $(this).val();

        var optionsText = this.options[this.selectedIndex].text;

        $('#canton_h').val(optionsText);

        var url = 'https://ubicaciones.paginasweb.cr/provincia/'+provincia+'/canton/'+id+'/distritos.json';        
        $.get(url)
            .done(function( data ) {
                
                if(data){
                    var options = '';
                    console.log('data',data['1'])
                    $.each(data, function(key, value) {
                        options += '<option value="'+key+'">'+value+'</option>'                          
                    });

                    $('#distrito_h').val(data['1']);
                    
                    $('#distrito').html(options)
                }

              });
    });

    $('#distrito').on('change', function(e){
        var optionsText = this.options[this.selectedIndex].text;

        $('#distrito_h').val(optionsText);
    })


    function onlyAlpha(el){
        $(el).keypress(function (e) {
            var regex = new RegExp(/^[a-zA-Z\.áéíóúÁÉÍÓÚ ]+$/); 
            var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
            if(e.keyCode === 8){
                return true;
              }else if (regex.test(str)) {
                return true;
            }
            else {
                e.preventDefault();
                return false;
            }
        });
    }

    function onlyAlphaNumeric(el){
        $(el).keypress(function (e) {
            var regex = new RegExp(/^[a-zA-Z0-9\.áéíóúÁÉÍÓÚ ]+$/);
            var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
            
            if(e.keyCode === 8){
                return true;
              }else if (regex.test(str)) {
                return true;
            }
            else {
                e.preventDefault();
                return false;
            }
        });
    }

    onlyAlpha('.only-alpha');
    onlyAlphaNumeric('.only-alphanumeric');

    // var global_canvas = $('#signature-canvas')[0].toDataURL();
    
    // function isCanvasBlank() {
    //     var canvas = $('#signature-canvas')[0].toDataURL()
        
    //     var isEq = canvas == global_canvas;

    //     return isEq;
    // }
    // $('.only-alpha').keypress(function (e) {
    //     var regex = new RegExp(/^[a-zA-Z\s]+$/);
    //     var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    //     if (regex.test(str)) {
    //         return true;
    //     }
    //     else {
    //         e.preventDefault();
    //         return false;
    //     }
    // });
    
    maskId();

    $('.new_date').mask('00/00/0000');   
    $('.unionlibre_time').mask('00');    

    // $('#idnumber').mask('000000000000');
    // $('.idnumber').mask('000000000000');

    $('#telefono_residencia').mask('0000-0000');
    $('#telefono_celular').mask('0000-0000');
    $('#telefono_oficina').mask('0000-0000');
    $('.phone').mask('0000-0000');
    $('.estatura_familiar').mask('000');
    $('.peso_familiar').mask('000');
    $('.porcentaje').mask('000');
    var iban_validation = false;
    $( "#iban_reclamos" ).blur(function() {
        var iban = $(this).val();
        const regex = /[a-zA-Z]{2}\d{20}/gm;
        if(regex.exec(iban)){
            iban_validation = true;
        }else{
            swal("Error!", "Formato de IBAN incorrecto", "error");
        }
    });

    validatePorcentaje()

    /*


        CR23015108410026012345
        https://es.iban.com/estructura

    */

    $("#card").mask('0000000000000000').keyup(function(e) {
        var val = $.trim($(this).val());

        if(val.length == 16){
            var str = val.replace(/\d(?=\d{4})/g, "*");    
            $(this).val(str);
        }
        

        
    });

     $('body').on('click','#agregar-detalle-medico', function(e){
        var count_medico = $("#container-medico").children().length;

        if(count_medico >= 2){
            return false;
        }

        e.preventDefault();     
        // clone('','');
        var id = "reclaim-detail-medico-" +  cloneIndex;
        $('#reclaim-detail-medico-0').clone()
        .appendTo('#container-medico')
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

        $('.phone').unmask();
        $('.phone').mask('0000-0000');
        onlyAlpha('.only-alpha');
        inputBehaviour();
    });

    $('body').on('click','#agregar-detalle-vigor', function(e){
        e.preventDefault();     

        var count_vigor = $("#container-vigor").children().length;

        if(count_vigor >= 2){
            return false;
        }
        // clone('','');
        var id = "reclaim-detail-vigor-" +  cloneIndex;
        $('#reclaim-detail-vigor-0').clone()
        .appendTo('#container-vigor')
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

        inputBehaviour();

    });


    $('body').on('click','#agregar-detalle-dependiente', function(e){
        e.preventDefault(); 

        var count_dependiente = $("#container-dependiente").children().length;

        if(count_dependiente >= 4){
            return false;
        }    
        // clone('','');
        var id = "reclaim-detail-dependiente-" +  cloneIndex;
        $('#reclaim-detail-dependiente-0').clone()
        .appendTo('#container-dependiente')
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

        inputBehaviour();

        // $('.phone').unmask();
        // $('.phone').mask('0000-0000');
        onlyAlpha('.only-alpha');
        $('.new_date').unmask();
        $('.new_date').mask('00/00/0000');  
        $('.estatura_familiar').unmask();
        $('.peso_familiar').unmask();
        $('.estatura_familiar').mask('000');
        $('.peso_familiar').mask('000');
        $('.idnumber').unmask();
        maskId();

    });

    $('body').on('click','#agregar-detalle-fam', function(e){
        e.preventDefault();  
         var count_fam = $("#container-fam").children().length;
        if(count_fam >= 4){
            return false;
        }    
        // clone('','');
        var id = "reclaim-detail-fam-" +  cloneIndex;
        $('#reclaim-detail-fam-0').clone()
        .appendTo('#container-fam')
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

    });

    $('body').on('click','#agregar-detalle-beneficiario', function(e){
        // console.log('beneficiario')
        e.preventDefault();  
        e.preventDefault();  
         var count_beneficiario = $("#container-beneficiario").children().length;
        if(count_beneficiario >= 4){
            return false;
        }       
        // clone('','');
        var id = "reclaim-detail-beneficiaro-" +  cloneIndex;
        $('#reclaim-detail-beneficiaro-0').clone()
        .appendTo('#container-beneficiario')
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
        inputBehaviour();
        $('.idnumber').unmask();
        maskId();
        $('.porcentaje').unmask();
        $('.porcentaje').mask('000');
        validatePorcentaje();
        // $('.phone').unmask();
        // $('.phone').mask('0000-0000');
        onlyAlpha('.only-alpha');
    });


    $('body').on('click','.remove-detail',function(e){
        e.preventDefault();
        $(this).closest('.sub-container').remove();
    }) 

    var indem = toggleOptionsClass('#autorizacion', '#hide-dignostico');

    
		
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

    // $('#signature-placeholder').html('Fecha ' + moment(new Date()).format("DD/MM/YYYY"));

    
    $( ".date" ).datepicker();

    


    $('#submit-form').on('click', function(e){
        e.preventDefault();
        
        $(this).html('<i class="fas fa-spinner fa-spin"></i> Procesando...').attr('disabled',true)

        $( "#evicertiaAssaForm" ).validate({
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

        // var validCanvas = isCanvasBlank($('#signature-canvas'));

        
        if( $('#evicertiaAssaForm').valid()){
           if(!iban_validation){
                swal("Error!", "Formato de IBAN incorrecto", "error");
                // $(this).html('Enviar Formulario').attr('disabled',false)
                return false;
            }else{
                //Show pre visualizer
                var data = $('#evicertiaAssaForm').serialize();
                $.post('/forms/evicertia/assa/previewPdf', data)
                .done(function(res) {

                    $('.content-wrapper').hide();
                    $('.pdf-wrapper').show();
                    // $('#pdf-object').attr('data', 'https://apps.hubex.tech/pdf/evicertia/preview/' + res.url);
                    $('#pdf-preview-object').empty();
                    $('#pdf-preview-object').html('<iframe id="pdf-object" src="https://docs.google.com/gview?embedded=true&url=https://apps.hubex.tech/pdf/evicertia/preview/'+res.url+'&amp;embedded=true" frameborder="0" width="100%" height="1000px"></iframe>');
                    
                    // $('#pdf-object').attr('src', 'http://docs.google.com/gview?embedded=true&url=https://apps.hubex.tech/pdf/evicertia/preview/' + res.url+'&amp;embedded=true');
                    

                    $('#corregir-datos').on('click', function(e){
                        e.preventDefault();
                        $('.pdf-wrapper').hide();
                        $('.content-wrapper').show();  
                        $('#submit-form').html('Continuar').attr('disabled',false) 
                        $('#process-form').html('<span class="mdc-button__label"><i class="fas fa-check"></i> Enviar contrato</span>').attr('disabled',false)     
                        
                    })

                    $('#process-form').on('click', function(e){
                        $(this).html('<span class="mdc-button__label"><i class="fas fa-spinner fa-spin"></i> Enviando...</span>').attr('disabled',true);
                        e.preventDefault();
                        $('form').submit();            
                    })
                    
                  })
                  .fail(function(e) {
                    console.log( "error", e );
                  })

                //$('form').submit();    
            }
            
        }else{
            
            $(this).html('Enviar Formulario').attr('disabled',false)

            console.log('FORM INVALID');

            var validator = $('#evicertiaAssaForm').validate();
            //  window.scrollTo({ top: $(validator.errorMap[0].element).offset().top, behavior: 'smooth' });

            $('html, body').animate({
                scrollTop: ($('.error').offset().top - 300)
           }, 2000);

            // $.each(validator.errorMap, function (index, value) {
            //     console.log('Id: ' + index + ' Message: ' + value);
            // });
        }

    });

    // $()
    
});