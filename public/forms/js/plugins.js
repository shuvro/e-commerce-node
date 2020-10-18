jQuery.extend(jQuery.validator.messages, {
    required: "Este campo es requerido",
    remote: "Please fix this field.",
    email: "Ingrese un email valido.",
    url: "Please enter a valid URL.",
    date: "La Fecha es inválida.",
    dateISO: "Please enter a valid date (ISO).",
    number: "Ingrese un numero valido.",
    digits: "Please enter only digits.",
    creditcard: "Please enter a valid credit card number.",
    equalTo: "Please enter the same value again.",
    accept: "Please enter a value with a valid extension.",
    maxlength: jQuery.validator.format("Please enter no more than {0} characters."),
    minlength: jQuery.validator.format("El mínimo son {0} dígitos."),
    rangelength: jQuery.validator.format("Please enter a value between {0} and {1} characters long."),
    range: jQuery.validator.format("Please enter a value between {0} and {1}."),
    max: jQuery.validator.format("Please enter a value less than or equal to {0}."),
    min: jQuery.validator.format("Please enter a value greater than or equal to {0}.")
});




function toggleOptions(toggler, toggled){
	$(toggler).change(function(){
        if(this.checked)            
            $(toggled).fadeIn('slow');
            // $(toggled).find(':input').not(':button, :submit, :reset, :hidden, :checkbox, :radio').val('');
        else
            $(toggled).fadeOut('slow');
    });
}

function toggleOptionsClass(toggler, toggled){
    console.log('togler',toggler )
    console.log('toggled',toggled )
    $(toggler).change(function(){
        if(this.checked)            
            $(toggled).removeClass('hide-field');
            // $(toggled).find(':input').not(':button, :submit, :reset, :hidden, :checkbox, :radio').val('');
        else
            $(toggled).addClass('hide-field');
    });
}

var regex = /^(.+?)(\d+)$/i;
var cloneIndex = 1;

function clone(cloneId, appendTo){
    $(cloneId).clone()
        .appendTo(appendTo)
        .attr("id", "reclaim-detail-" +  cloneIndex)
        .find("*")
        .each(function() {
            if($(this).hasClass('hasDatepicker')){
                $(this).removeAttr('id').removeClass('hasDatepicker')
                $(this).datepicker();    
            }
            
        // 	// console.log('this', this.name)
            // var id = this.id || "";
            // var match = id.match(regex) || [];
            // if (match.length == 3) {
            //     this.id = match[1] + (cloneIndex);
            // }
        //     var name = this.name || "";
        //     var name_match = name.match(regex) || [];
        //     if (name_match.length == 3) {
        //         this.name = name_match[1] + (cloneIndex);
        //     }
        });

        // .on('click', 'button.clone', clone)
        // .on('click', 'button.remove', remove);
    cloneIndex++;
}
function remove(container){
    $(container).last().remove();
}
$("button.clone").on("click", clone);

$("button.remove").on("click", remove);

$.datepicker.regional['es'] = {
 closeText: 'Cerrar',
 // prevText: '< Ant',
 // nextText: 'Sig >',
 currentText: 'Hoy',
 monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
 monthNamesShort: ['Ene','Feb','Mar','Abr', 'May','Jun','Jul','Ago','Sep', 'Oct','Nov','Dic'],
 dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
 dayNamesShort: ['Dom','Lun','Mar','Mié','Juv','Vie','Sáb'],
 dayNamesMin: ['Do','Lu','Ma','Mi','Ju','Vi','Sá'],
 weekHeader: 'Sm',
 dateFormat: 'dd/mm/yy',
 firstDay: 1,
 isRTL: false,
 showMonthAfterYear: false,
 yearSuffix: ''
 };
 $.datepicker.setDefaults($.datepicker.regional['es']);