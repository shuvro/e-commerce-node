

$(document).ready(function(){
	console.log('init')
	
	var urlstep2 = '/forms/kyc/caris/c8f56ea2-24f8-413e-b326-944ee794a1bd/2';
	$('#submit-form-kyc-1').on('click',function(e){
		window.location.href = urlstep2;
	})
	var urlstep3 = '/forms/kyc/caris/c8f56ea2-24f8-413e-b326-944ee794a1bd/3';
	$('#submit-form-kyc-2').on('click',function(e){
		window.location.href = urlstep3;
	})
	var urlstep4 = '/forms/kyc/caris/c8f56ea2-24f8-413e-b326-944ee794a1bd/4';
	$('#submit-form-kyc-3').on('click',function(e){
		window.location.href = urlstep4;
	})
	var urlstep5 = '/forms/kyc/caris/c8f56ea2-24f8-413e-b326-944ee794a1bd/5';
	$('#submit-form-kyc-4').on('click',function(e){
		window.location.href = urlstep5;
	})

	$('#funciones-extranjeras').change(function(){
        if(this.checked)
            $('.cumplidofuncpublicas').fadeIn('slow');
        else
            $('.cumplidofuncpublicas').fadeOut('slow');

    });

    $('#contribuyente-usa').change(function(){
        if(this.checked)
            $('.tieneciudadania').fadeIn('slow');
        else
            $('.tieneciudadania').fadeOut('slow');

    });

    $('#signature-placeholder').html('Fecha ' + moment(new Date()).format("DD/MM/YYYY"));

    

});