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



function maskId(){

    $('.idnumber').mask('0-0000-0000');


}

$(document).ready(function(){

    inputBehaviour()

    $('.idnumber').mask('0-0000-0000');
      

    toggleOptionsClass('#autorizacion', '#hide-moreinfo');

    jQuery.validator.addMethod(
        "date",
        function(value, element) {
            return value.match(/^\d\d?\/\d\d?\/\d\d\d\d$/);
        },
        "Formato de fecha inválida (dd/mm/yyyy.)"
    );


    

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

    
    
    maskId();

    


    $('body').on('click','.remove-detail',function(e){
        e.preventDefault();
        $(this).closest('.sub-container').remove();
    }) 

    // var indem = toggleOptionsClass('#autorizacion', '#hide-dignostico');

    var deleteImgBtn = '<button class="remove mdc-button mdc-button mdc-layout-grid__cell--span-12" id="delete-row" style="display: inline-block;">';
        deleteImgBtn += '<span class="mdc-button__label">Eliminar Detalle</span>';
        deleteImgBtn += '</button>';
		
    if (window.File && window.FileList && window.FileReader) {
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
                "</span>").insertAfter("#cedFrontFile-files");

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

      if (window.File && window.FileList && window.FileReader) {
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
      } else {
        alert("Your browser doesn't support to File API")
      }

    // $('#signature-placeholder').html('Fecha ' + moment(new Date()).format("DD/MM/YYYY"));

    
    $( ".date" ).datepicker();

    
      function hasImages(){
          return true;
      }

      var global_canvas = $('#signature-canvas')[0].toDataURL();

      function isCanvasBlank() {
        var canvas = $('#signature-canvas')[0].toDataURL()
        
        var isEq = canvas == global_canvas;

        return isEq;
    }

    $('#submit-form').on('click', function(e){
        e.preventDefault();
        
        $(this).html('<i class="fas fa-spinner fa-spin"></i> Procesando...').attr('disabled',true)


        var validCanvas = isCanvasBlank($('#signature-canvas'));

        
        if( $('#itsCICForm').valid()){
           if(validCanvas){
            swal("Error!", "La firma de este documento es requerida", "error");
            $(this).html('<span class="mdc-button__label"><i class="far fa-check-circle"></i> Enviar</span>').attr('disabled',false)
           }
           else if(!hasImages()){
                swal("Error!", "Las imagenes de la cédula son requeridas", "error");
                $(this).html('<span class="mdc-button__label"><i class="far fa-check-circle"></i> Enviar</span>').attr('disabled',false)
                return false;
            }else{ 
                $('#signature_img').val($('#signature-canvas')[0].toDataURL());               
                $('form').submit();    
            }
            
        }else{
            
             $(this).html('<span class="mdc-button__label"><i class="far fa-check-circle"></i> Enviar</span>').attr('disabled',false)
             var validator = $('#itsCICForm').validate();
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