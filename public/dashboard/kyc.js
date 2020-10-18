var currentProcess = {};
$(document).ready(function(){
	$('body').on('click', '.form-option', function(e){
		e.preventDefault();
		$('.form-option').removeClass('highlight');
		$(this).addClass('highlight');
		var id = $(this).data('id');

		var url = "/api/contracargos/form/" + id;

		$('.getPDF').attr('id',id);
		$('.downloadIMG').attr('id',id);
		$('#_currentForm').attr('data-fid',id).val(id);
		var selectedUser = null;

		$('.empty-form').html('<i class="loader-icon fas fa-sync fa-spin"></i>');

		$('body').on('click', '.edit-btn', function(e){
			e.preventDefault();
			$("#loadedForm :input").attr("disabled", false);
			
			$(this).hide();
		});
		
	
		

		var jqxhr = $.get( url )
		  .done(function(data) {
		    // console.log( data );
		    $('.empty-form').hide();
		    $('#loadedForm').show();
		    $('#loadedOptions').show();
		    $('.reclaim-container').empty();
				$("#loadedForm :input").attr("disabled", true);
				$("#loadedForm textarea").attr("disabled", true);
				$('.cancel-edit-btn').hide()
				
		    var html = '';
		    // $('#getPDF').attr('data-id','');

		    if(data && data.success){
		    	console.log('data',data);
					var formdata = data.result.form[0];
							currentProcess = formdata;
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
					$('#comments').val(formdata.notas)

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
					
					// $('.edit-btn').show()
					// 

					var status = '-';
					console.log(formdata.status)
		    	switch(formdata.status){
		    		case 'pending':
							status = 'Pendiente';
							$('#assignContracargo').show();
							$('#aprobarCC').show();
							$('#masInfo').show();
							$('#reject').show();
							$('.edit-btn').show()
							$('.edit-btn').attr('disabled',false)
							break;
						case 'waitingUser':
							status = 'Solicitud de modificación enviada';
							$('#assignContracargo').show();
							$('#aprobarCC').show();
							$('#masInfo').show();
							$('#reject').show();
							$('.edit-btn').show()
							$('.edit-btn').attr('disabled',false)
							break;
						case 'backFromCustomer':
							status = 'Esperando reinspección';
							$('#assignContracargo').show();
							$('#aprobarCC').show();
							$('#masInfo').show();
							$('#reject').show();
							$('.edit-btn').show()
							$('.edit-btn').attr('disabled',false)
							break;
						case 'aproved':
							status = 'Aprobado';
							$('#assignContracargo').show();
							$('#aprobarCC').hide();
							$('#masInfo').hide();
							$('#reject').hide();
							$('#reopen').show();
							$('#finish').show();
							$('#generatePDF').show();
							$('.edit-btn').hide()
							break;
						case 'rejected':
							status = 'Rechazado';
							$('#assignContracargo').hide();
							$('#aprobarCC').hide();
							$('#masInfo').hide();
							$('#reject').hide();
							$('.edit-btn').hide()
		    			break;		
						case 'Finished':
						console.log('here')
							status = 'Finalizado';
							$('#assignContracargo').hide();
							$('#aprobarCC').hide();
							$('#masInfo').hide();
							$('#reject').hide();
							$('#reopen').hide();
							$('#finish').hide();
							$('.getPDF').css({"display":"inline-block"});
							$('.edit-btn').hide()
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


							/*
							 <div class="sl-item">
                                        <div class="sl-left bg-success"> <i class="ti-user"></i></div>
                                        <div class="sl-right">
                                            <div class="font-medium">Meeting today <span class="sl-date"> 5pm</span></div>
                                            <div class="desc">you can write anything </div>
                                        </div>
																		</div>
							*/											
							content += '<div class="sl-item">';
								content += '<div class="sl-left bg-success"> <i class="ti-user"></i></div>';
								content += '<div class="sl-right">';
									content += '<div class="font-medium">'+revisions[i].reason+'<span class="sl-date"></span></div>';
									content += '<div class="desc">'+revisions[i].createdAt+'</div>';
								content += '</div>'
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
		 
	});
	$('body').on('click', '.getPDF', function(e){
		console.log('currentProcess',currentProcess)
		var name = currentProcess.name + ' ' + currentProcess.lastname + ' ' + currentProcess.secondlastname;
		var phone = currentProcess.phone;
		var card = currentProcess.cardnumber;
		// var url =  '/dashboard/promerica/contracargos/requestPDF/'+$(this).attr('id');
		var url = 'http://54.163.159.219:8080/rest/services/hubex/promerica/contracargos?inXML=<xml><NombreCliente>'+name+'</NombreCliente><Telefono1>'+phone+'</Telefono1><Telefono2>22447788</Telefono2><NumeroTarjeta>'+card+'</NumeroTarjeta><Comercio1>epa</Comercio1><Comercio2>epa</Comercio2><Comercio3>epa</Comercio3><Comercio4>epa</Comercio4><Comercio5>epa</Comercio5><Comercio6>epa</Comercio6><Comercio7>epa</Comercio7><Comercio8>epa</Comercio8><Monto1>100</Monto1><Monto2>100</Monto2><Monto3>100</Monto3><Monto4>100</Monto4><Monto5>100</Monto5><Monto6>100</Monto6><Monto7>100</Monto7><Monto8>100</Monto8><FechaTransaccion1>01/02/2019</FechaTransaccion1><FechaTransaccion2>01/02/2019</FechaTransaccion2><FechaTransaccion3>01/02/2019</FechaTransaccion3><FechaTransaccion4>01/02/2019</FechaTransaccion4><FechaTransaccion5>01/02/2019</FechaTransaccion5><FechaTransaccion6>01/02/2019</FechaTransaccion6><FechaTransaccion7>01/02/2019</FechaTransaccion7><FechaTransaccion8>01/02/2019</FechaTransaccion8><MontoOriginal>2000</MontoOriginal><MontoAlterado>1000</MontoAlterado><FechaMercancia>Mirum est</FechaMercancia><MedioPago>Cheque</MedioPago><Cajero>Proinde</Cajero><MontoParcial>100</MontoParcial><Observaciones>no se retiro el monto completo</Observaciones><Pregunta1>1</Pregunta1><Pregunta2>1</Pregunta2><Pregunta3>0</Pregunta3><Pregunta4>0</Pregunta4><Pregunta5>0</Pregunta5><Pregunta6>1</Pregunta6><Pregunta7>1</Pregunta7><Pregunta8>1</Pregunta8><Pregunta9>1</Pregunta9><Fecha>01/02/2019</Fecha><signature>public/signature/its/cic-1a42e220-dc4e-4ce1-bcd0-551d63bba700-signature.png</signature><picture>public/uploads/cic/cedBackFile-1561044591797.png</picture><guid>1a42e220-dc4e-4ce1-bcd0-551d63bba700</guid></xml>&type=C';
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
						icon: "warning",
						buttons: [
							'No',
							'Si, Estoy seguro'
						],
						// dangerMode: true,
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
            icon: "danger",
						buttons: [
							'No',
							'Si, Estoy seguro'
						],
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
	});

	$('body').on('click', '#reopen', function(e){
		e.preventDefault();
		swal({   
            title: "Desea re abrir este proceso?",   
            text: "Este proceso se re abrira y su estado cambiar a esperando por el operador!",   
            icon: "warning",
						buttons: [
							'No',
							'Si, Estoy seguro'
						],
       }).then(function(e){
       		if(e){
						$.post( "/api/contracargos/reopen",{"formId":$('#_currentForm').attr('data-fid')})
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
	});

	$('body').on('click', '#finish', function(e){
		e.preventDefault();
		swal({   
            title: "Desea finalizar con éxito este proceso?",   
            text: "Este proceso será concluido y no podrá ser utilizado mas!",   
            icon: "warning",
						buttons: [
							'No',
							'Si, Estoy seguro'
						],
       }).then(function(e){
       		if(e){
						$.post( "/api/contracargos/finish",{"formId":$('#_currentForm').attr('data-fid')})
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
	});
	


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

	$('body').on('click', '.edit-btn', function(e){
		e.preventDefault();
		$("#loadedForm :input").attr("disabled", false);
		$('.cancel-edit-btn').show()
		$('.save-edit-btn').show()
		$('.edit-btn').hide();
	});

	$('body').on('click', '.cancel-edit-btn', function(e){
		e.preventDefault();
		$("#loadedForm :input").attr("disabled", true);
		$('.edit-btn').show().attr("disabled", false)
		$('.cancel-edit-btn').hide();
		$('.save-edit-btn').hide()
	});




	$('input[type=radio][name=option]').change(function(e) {
		if($(this).val() != 'on'){
			var url = window.location.pathname+'?status='+$(this).val()
			location.href = url;
		}
		
	});

	console.log('status',status)
	$("#opt-"+status).prop("checked", true)

})