$(document).ready(function(){
	// $('body').on('click', '.form-option', function(e){
		// e.preventDefault();
		$('.form-option').removeClass('highlight');
		$(this).addClass('highlight');
		// var id = $(this).data('id');

		var url = "/api/contracargos/form/" + id;

		$('.getPDF').attr('id',id);
		$('.downloadIMG').attr('id',id);
		$('#_currentForm').attr('data-fid',id).val(id);
		var selectedUser = null;

		$('.empty-form').html('<i class="loader-icon fas fa-sync fa-spin"></i>');


		var jqxhr = $.get( url )
		  .done(function(data) {
		    // console.log( data );
		    $('.empty-form').hide();
		    $('#loadedForm').show();
		    $('#loadedOptions').show();
		    $('.reclaim-container').empty();
		    $("#loadedForm :input").attr("disabled", true);
		    var html = '';
		    // $('#getPDF').attr('data-id','');

		    if(data && data.success){
		    	console.log('data',data);
					var formdata = data.result.form[0];	
					var revisions = formdata.revisionDetails;
					selectedUser	= formdata;   	
		    	var ownerdata = data.result.owner;
		    	var filedata = data.result.attachedFiles;
					var detailsdata = data.result.details;
					var isIdem = formdata.indemnizacion;

		    	$('#name').val(formdata.name)
		    	$('#flastname').val(formdata.lastname)
		    	$('#slastname').val(formdata.secondlastname)
		    	$('#idnumber').val(formdata.idnumber)
		    	$('#telefono').val(formdata.phone)
		    	$('#email').val(formdata.email)
		    	$('#card').val(formdata.cardnumber)

		    	$('#tipo_persona').val(formdata.tipoid)

		    	$('#transaction-personal').attr('checked', formdata.transaccion_personal);
		    	$('#cobro_duplicado').attr('checked', formdata.cobro_duplicado);
		    	$('#cobro-alterado').attr('checked', formdata.cobro_alterado);
		    	$('#ajuste-precio').attr('checked', formdata.ajuste_precio);
		    	$('#autorizacion-compra').attr('checked', formdata.autorizacion_compra);
		    	$('#otros-medios').attr('checked', formdata.otros_medios);
		    	$('#reservacion-cancelada').attr('checked', formdata.reservacion_cancelada);
		    	$('#partial-founds').attr('checked', formdata.partial_founds);
		    	$('#no-founds').attr('checked', formdata.no_founds);
					$('#indemnizacion_onoff').attr('checked', isIdem);
					
					

		    	var status = '-';
		    	switch(formdata.status){
		    		case 'pending':
							status = 'Pendiente';
							$('#assignContracargo').show();
							$('#aprobarCC').show();
							$('#masInfo').show();
							$('#reject').show();
							break;
						case 'waitingUser':
							status = 'Solicitud de modificación enviada';
							$('#assignContracargo').show();
							$('#aprobarCC').show();
							$('#masInfo').show();
							$('#reject').show();
							break;
						case 'backFromCustomer':
							status = 'Esperando reinspección';
							$('#assignContracargo').show();
							$('#aprobarCC').show();
							$('#masInfo').show();
							$('#reject').show();
							break;
						case 'aproved':
							status = 'Aprobado';
							$('#assignContracargo').hide();
							$('#aprobarCC').hide();
							$('#masInfo').hide();
							$('#reject').hide();
							break;
						case 'rejected':
							status = 'Rechazado';
							$('#assignContracargo').hide();
							$('#aprobarCC').hide();
							$('#masInfo').hide();
							$('#reject').hide();
		    			break;		
		    	}

		    	var ownerName = ' - ';

		    	var isEmptyOwner = $.isEmptyObject(ownerdata);

		    	if(ownerdata && !isEmptyOwner){
		    		ownerName = ownerdata.name + ' ' + ownerdata.lastname;
		    	}

		    	$('#formStatus').html(status);
		    	$('#formOwner').html(ownerName);

					var _details = ' Nada que mostrar';
					
					$('body').on('click','#masInfo', function(e){
						e.preventDefault();
						var message = '\n\n [Inserte su mensaje] \n\n ';
						$('#message-header').val('Estimado(a) '+ formdata.name);
						$('#message-text').val(message);
						var url = 'https://www.promerica.fi.cr/actualizacion-formulario-de-contracargo/?formid='+id;
						if(isIdem){
							url = 'https://www.promerica.fi.cr/actualizacion-formulario-contracargo-con-seguro/?formid='+id;
						}
						$('#msg-footer').html('Puede acceder a el formulario en el siguieten link: <a href="'+url+'">'+url+'</a>');
						$('#exampleModal').modal('show');
					})

		    	if(detailsdata.length > 0){
		    		$('#historialContainer').empty()
		    		for(var i = 0; i < detailsdata.length; i++ ){
		    			
		    			$('<div/>', {class: 'hc historyContainer-'+i}).appendTo('#historialContainer')
		    			$('<div/>', {
						    html: detailsdata[i].timestamp,
						    class: 'historyDate',
						}).appendTo('.historyContainer-'+i);
						$('<div/>', {
						    html: detailsdata[i].reason,
						    class: 'historyTxt',
						}).appendTo('.historyContainer-'+i);
						$('<div/>', {
						    html: detailsdata[i].user,
						    class: 'historyCreated',
						}).appendTo('.historyContainer-'+i);
		    		}

		    		
					}
					revisions =  revisions.reverse();
					if(revisions.length > 0){
						var content = '';
						for(var i = 0; i < revisions.length; i++){
							var type = revisions[i].type;
							typeTxt = '';
							if(!type){
								typeTxt = 'Solicitud de Información'
							}else{
								switch(formdata.status){
									case 'Approved':
										typeTxt = 'Proceso Aprobado';
										break;
									case 'Rejected':
										typeTxt = 'Proceso Rechazado';
										break;
											
								}
			
							}

							content += '<div class="revisions-container">';
							content += '<div><strong>'+typeTxt+'</strong></div>'
								content += '<div><strong>Fecha</strong><span class="label-sub">'+revisions[i].createdAt+'</span></div>'
								content += '<div><strong>Razon</strong><span class="label-sub">'+revisions[i].reason+'</span></div>'

								// content += '<div><strong></strong><span class="label-sub"></span></div>'
							content += '</div>'
						}
						$('#historialContainer').html(content)
					}else{
						
						$('#historialContainer').html('Nada que mostrar')	
					}


		    	var symbol = '';
		    	for(var i = 0; i < formdata.reclamos.length; i++){

		    		switch(formdata.reclamos[i].reclamo_moneda){
		    			case 'dolares':
		    				symbol = '$';
		    				break;
		    			case 'colones':
		    				symbol = '¢';
		    				break;	
		    		}

		    		html += '<div class="row reclamo-container">' +
		    						'<div class="col-md-5"><strong>Comercio</strong> '+ formdata.reclamos[i].reclamo_comercio +'</div> ' +		    						
		    						'<div class="col-md-2">'+ symbol + ' ' +formdata.reclamos[i].reclamo_amount + '</div> ' +
		    						'<div class="col-md-5"><strong>Fecha transacción</strong> '+ formdata.reclamos[i].reclamo_date + '</div> ' +
		    				'</div> ';
		    	}

		    	$('.reclaim-container').html(html)
		    	$('#signature-pic').empty();
		    	$('#firma-attch').empty();
		    	var img = $('<img id="dynamic-signature">');
					img.attr('src', formdata.firma);
					img.appendTo('#signature-pic');
					img.appendTo('#firma-attch');

				$('#signatur-date').html(moment(formdata.timestamp).format('d/mm/YYYY, h:mm:ss a'))	

				var card = '';
				for(var i = 0; i < filedata.length; i++){
					var href = '#';
					var src = '/uploads/contracargos/' + filedata[i].filename;
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
		 
	// });
	$('body').on('click', '.getPDF', function(e){
		var url =  '/forms/contracargos/pdf/'+$(this).attr('id');
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


	$('body').on('click', '#assignContracargo', function(e){
		e.preventDefault();
		swal({   
            title: "Asignarme este contracargo?",   
            text: "Al confirmar pasará a ser el encargado de este proceso!",   
            type: "warning",   
            showCancelButton: true,   
            confirmButtonColor: "#03a9f3",   
            confirmButtonText: "Si!",   
            cancelButtonText: "No",   
            closeOnConfirm: false 
       }).then(function(e){
       		if(e){
				$.post( "/api/contracargos/updateOwner",{"formId":$('#_currentForm').attr('data-fid')})
				  .done(function(data) {
				    toastr.success('Actualización Exitosa!', function(){
				    	$('#formOwner').html(data.owner)
				    })
				  })
				  .fail(function(e) {
				    alert( "error", e );
				  })
       		}
       		
       });
	})
	$('body').on('click', '#aprobarCC', function(e){
		e.preventDefault();
		swal({   
            title: "Desea aprobar este contracargo?",   
            text: "Al confirmar este proceso sera asignado a un supervisor!",   
            type: "success",   
            showCancelButton: true,   
            confirmButtonColor: "#03a9f3",   
            confirmButtonText: "Si!",   
            cancelButtonText: "No",   
            closeOnConfirm: false 
       }).then(function(e){
       		if(e){
						$.post( "/api/contracargos/aprove",{"formId":$('#_currentForm').attr('data-fid')})
						.done(function(data) {
							toastr.success('Actualización Exitosa!', function(){
								location.reload();
							})
						})
						.fail(function(e) {
							console.log( "error", e );
						})
       		}
       		
       });
	})

	$('body').on('click', '#reject', function(e){
		e.preventDefault();
		swal({   
            title: "Desea rechazar este contracargo?",   
            text: "Al rechazar este proceso no podrá abrirlo de nuevo!",   
            type: "success",   
            showCancelButton: true,   
            confirmButtonColor: "#b61616",   
            confirmButtonText: "Si!",   
            cancelButtonText: "No",   
            closeOnConfirm: false 
       }).then(function(e){
       		if(e){
						$.post( "/api/contracargos/reject",{"formId":$('#_currentForm').attr('data-fid')})
							.done(function(data) {
								toastr.success('Actualización Exitosa!', function(){
									location.reload();
								})
							})
							.fail(function(e) {
								console.log( "error", e );
							})
       		}
       		
       });
	})

	


	$('body').on('click', '#saveDetails', function(e){
		e.preventDefault();
		$(this).attr('disabled', true);
		$.post( "/api/contracargos/saveRejectReason", {
				"formId": $('#_currentForm').attr('data-fid'),
				"reason": $('#message-text').val()
		}).done(function(data) {
			$('#exampleModal').modal('hide')
		    toastr.success('Actualización Exitosa!', function(){
		    	location.reload();
		    })
		  })
		  .fail(function(e) {
		    alert( "error", e );
		  })
	});


	$('input[type=radio][name=option]').change(function(e) {
		if($(this).val() != 'on'){
			var url = window.location.pathname+'?status='+$(this).val()
			location.href = url;
		}
		
	});

	console.log('id',id)
    console.log('status',status)
    // $('.form-option').click();
	$("#opt-"+status).prop("checked", true)

})