$(document).ready(function(){
	$('body').on('click', '.form-option', function(e){
		e.preventDefault();
		$('.form-option').removeClass('highlight');
		$(this).addClass('highlight');
		var id = $(this).data('id');

		var url = "/api/cabletica/form/" + id;

		$('.getPDF').attr('id',id);
		$('#_currentForm').attr('data-fid',id);

		$('.empty-form').html('<i class="loader-icon fas fa-sync fa-spin"></i>');


		var jqxhr = $.get( url )
		  .done(function(data) {
		    console.log( data );
		    $('.empty-form').hide();
		    $('#loadedForm').show();
		    $('#loadedOptions').show();
		    // $('.reclaim-container').empty();
		    $("#loadedForm :input").attr("disabled", true);
		    var html = '';
		    // $('#getPDF').attr('data-id','');

		    if(data && data.success){

		    	// console.log('data',data);
		    	var formdata = data.result.form[0];		    	
		    	// var ownerdata = data.result.owner;
		    	var filedata = data.result.attachedFiles;
		    	// var detailsdata = data.result.details;
		    	$('.getPDF').attr('id',formdata.externalId);
		    	$('#name').val(formdata.name)
		    	// $('#flastname').val(formdata.lastname)
		    	//$('#slastname').val(formdata.secondlastname)
		    	$('#idnumber').val(formdata.idnumber)
		    	// $('#telefono').val(formdata.phone)
		    	$('#clientEmail').val(formdata.email)
		    	// $('#card').val(formdata.cardnumber)

		    	$('#tipo_id').val(formdata.tipo_id)
		    	$('#id_sucursal').val(formdata.id_sucursal)

		    	$('#telefonoCelular').val(formdata.telefonoCelular)
		    	$('#telefonoFijo').val(formdata.telefonoFijo)
		    	$('#telefonoTrabajo').val(formdata.telefonoTrabajo)

		    	$('#provincia').val(formdata.provincia)
		    	$('#direccion').val(formdata.direccion)
				$('#canton').val(formdata.canton)
				$('#distrito').val(formdata.distrito)	

				$('#provinciaInstall').val(formdata.provinciaInstall)
				$('#cantonInstall').val(formdata.cantonInstall)
				$('#distritoInstall').val(formdata.distritoInstall)
				$('#direccionInstall').val(formdata.direccionInstall)	

				$('#proxpago_date').val(formdata.proxpago_date)
				$('#metodo_pago').val(formdata.metodo_pago)
				$('#frecuencia_pago').val(formdata.frecuencia_pago)

				$('#ccName').val(formdata.ccName)
				$('#ccNumber').val(formdata.ccNumber)
				$('#ccDate').val(formdata.ccDate)
				$('#ccCCV').val('***')

				$('#factura_desglosada').val(formdata.factura_desglosada)
				$('#metodo_factura').val(formdata.metodo_factura)
				// $('#contrato_ligado').val(formdata.contrato_ligado)
				$('#idContrato').val(formdata.idContrato)

		    	$('#permanencia_minima').attr('checked', formdata.permanencia_minima);
		    	$('#vigencia_date').val(formdata.vigencia_date)

		    	$('#nombreVendedor').val(formdata.nombreVendedor)
		    	$('#emailVendedor').val(formdata.emailVendedor)
		    	$('#telefonoVendedor').val(formdata.telefonoVendedor)

		    	$('#tipo_servicio').val(formdata.tipo_servicio)
		    	$('#tipo_promo').val(formdata.tipo_promo)
		    	$('#plazo_promo').val(formdata.plazo_promo)
		    	$('#meses_financiamiento').val(formdata.meses_financiamiento)
		    	$('#impuesto').val(formdata.impuesto + '%')
		    	$('#descuento').val(formdata.descuento + '%')
		    	$('#couta_pagar').val('¢'+formdata.couta_pagar)
		    	$('#subtotal').val('¢'+formdata.subtotal)
		    	$('#total').val('¢'+formdata.total)


		    	$('#autorizacion_info').attr('checked', formdata.autorizacion_info);
		    	$('#autorizacion_cable').attr('checked', formdata.autorizacion_cable);
		    	$('#autorizacion_contrato').attr('checked', formdata.autorizacion_contrato);
		    	$('#contrato_ligado').attr('checked', formdata.contrato_ligado);


		    	$('#observaciones').val(formdata.observaciones)

		    	// $('#cobro-alterado').attr('checked', formdata.cobro_alterado);
		    	// $('#ajuste-precio').attr('checked', formdata.ajuste_precio);
		    	// $('#autorizacion-compra').attr('checked', formdata.autorizacion_compra);
		    	// $('#otros-medios').attr('checked', formdata.otros_medios);
		    	// $('#reservacion-cancelada').attr('checked', formdata.reservacion_cancelada);
		    	// $('#partial-founds').attr('checked', formdata.partial_founds);
		    	// $('#no-founds').attr('checked', formdata.no_founds);
		    	// $('#indemnizacion_onoff').attr('checked', formdata.indemnizacion);
		    	var status = '-';
		    	switch(formdata.status){
		    		case 'pending':
		    			status = 'Pendiente';
		    			break;
		    	}

		    	// var ownerName = ' - ';

		    	// var isEmptyOwner = $.isEmptyObject(ownerdata);

		    	// if(ownerdata && !isEmptyOwner){
		    	// 	ownerName = ownerdata.name + ' ' + ownerdata.lastname;
		    	// }

		    	// $('#formStatus').html(status);
		    	// $('#formOwner').html(ownerName);

		    // 	var _details = ' Nada que mostrar';

		    // 	if(detailsdata.length > 0){
		    // 		$('#historialContainer').empty()
		    // 		for(var i = 0; i < detailsdata.length; i++ ){
		    			
		    // 			$('<div/>', {class: 'hc historyContainer-'+i}).appendTo('#historialContainer')
		    // 			$('<div/>', {
						//     html: detailsdata[i].timestamp,
						//     class: 'historyDate',
						// }).appendTo('.historyContainer-'+i);
						// $('<div/>', {
						//     html: detailsdata[i].reason,
						//     class: 'historyTxt',
						// }).appendTo('.historyContainer-'+i);
						// $('<div/>', {
						//     html: detailsdata[i].user,
						//     class: 'historyCreated',
						// }).appendTo('.historyContainer-'+i);
		    // 		}

		    		
		    // 	}


		    	// var symbol = '';
		    	// for(var i = 0; i < formdata.reclamos.length; i++){

		    	// 	switch(formdata.reclamos[i].reclamo_moneda){
		    	// 		case 'dolares':
		    	// 			symbol = '$';
		    	// 			break;
		    	// 		case 'colones':
		    	// 			symbol = '¢';
		    	// 			break;	
		    	// 	}

		    	// 	html += '<div class="row reclamo-container">' +
		    	// 					'<div class="col-md-5"><strong>Comercio</strong> '+ formdata.reclamos[i].reclamo_comercio +'</div> ' +		    						
		    	// 					'<div class="col-md-2">'+ symbol + ' ' +formdata.reclamos[i].reclamo_amount + '</div> ' +
		    	// 					'<div class="col-md-5"><strong>Fecha transacción</strong> '+ formdata.reclamos[i].reclamo_date + '</div> ' +
		    	// 			'</div> ';
		    	// }

		    	// $('.reclaim-container').html(html)
		    	$('#signature-pic').empty();
		    	$('#firma-attch').empty();
		    	var img = $('<img id="dynamic-signature">');
					img.attr('src', formdata.firma);
					// img.attr('class', 'image-popup-vertical-fit');
					img.appendTo('#signature-pic');
					img.appendTo('#firma-attch');

				$('#signatur-date').html(moment(formdata.timestamp).format('d/mm/YYYY, h:mm:ss a'))	

				var card = '';
				for(var i = 0; i < filedata.length; i++){
					var href = '#';
					var src = '/uploads/cabletica/' + filedata[i].filename;
					card += '<div class="card">' +
                            '<div class="el-card-item">' +
                                '<div class="el-card-avatar el-overlay-1">' +
                                    '<img src="'+src+'" alt="user">' +
                                    '<div class="el-overlay">' +
                                        '<ul class="el-info">' +
                                            '<li>' +
                                                '<a class="btn default btn-outline image-popup-vertical-fit" data-src="'+  src +'" href="'+href+'">'+
                                                    '<i class="icon-magnifier"></i>'+
                                                '</a>'+
                                            '</li>'+
                                            // '<li>'+
                                            //     '<a class="btn default btn-outline" href="javascript:void(0);">'+
                                            //         '<i class="icon-link"></i>'+
                                            //     '</a>'+
                                            // '</li>'+
                                        '</ul>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="el-card-content"> </div>'+
                            '</div>'+
                        '</div>';
				}
				$('#other-attacheds').html(card);	

				
		    }
		    
		  })
		  .fail(function(e) {
		    alert( "error", e );
		  })
		 
	});
	$('body').on('click', '.getPDF', function(e){
		var url =  '/pdf/cabletica/'+$(this).attr('id')+'.pdf';
		// console.log('url', url);
		var win = window.open(url, '_blank');
  			win.focus();
	});

	$('body').on('click', '.image-popup-vertical-fit', function(e){
		e.preventDefault();
		$('#zoom-img').empty();
		var src = $(this).data('src');
		var zoomimg = $('<img id="open-img">');
					zoomimg.attr('src', src);
					zoomimg.appendTo('#zoom-img');
		$('#zoomImage').modal('show');
	});


	// $('body').on('click', '#assignContracargo', function(e){
	// 	e.preventDefault();
	// 	console.log('here')	
	// 	swal({   
 //            title: "Asignarme este contracargo?",   
 //            text: "Al confirmar pasará a ser el encargado de este proceso!",   
 //            type: "warning",   
 //            showCancelButton: true,   
 //            confirmButtonColor: "#03a9f3",   
 //            confirmButtonText: "Si!",   
 //            cancelButtonText: "No",   
 //            closeOnConfirm: false 
 //       }).then(function(e){
 //       		if(e){
	// 			$.post( "/api/contracargos/updateOwner",{"formId":$('#_currentForm').attr('data-fid')})
	// 			  .done(function(data) {
	// 			    toastr.success('Actualización Exitosa!', function(){
	// 			    	$('#formOwner').html(data.owner)
	// 			    })
	// 			  })
	// 			  .fail(function(e) {
	// 			    alert( "error", e );
	// 			  })
 //       		}
       		
 //       });
	// })
	$('body').on('click', '#reject', function(e){
		e.preventDefault();
		swal({   
            title: "Desea eliminar este contrato?",   
            text: "Al eliminarlo no podra revertir el proceso!",   
            type: "danger",   
            showCancelButton: true,   
            confirmButtonColor: "#03a9f3",   
            confirmButtonText: "Si!",   
            cancelButtonText: "No",   
            closeOnConfirm: false 
        }, function(){   
            // swal("Deleted!", "Your imaginary file has been deleted.", "success"); 
        });
	})

	// $('body').on('click', '#saveDetails', function(e){
	// 	e.preventDefault();
	// 	$(this).attr('disabled', true);
	// 	$.post( "/api/contracargos/saveRejectReason", {
	// 			"formId": $('#_currentForm').attr('data-fid'),
	// 			"reason": $('#message-text').val()
	// 	}).done(function(data) {
	// 		$('#exampleModal').modal('hide')
	// 	    toastr.success('Actualización Exitosa!', function(){
	// 	    	// location.reload();
	// 	    })
	// 	  })
	// 	  .fail(function(e) {
	// 	    alert( "error", e );
	// 	  })
	// })

})