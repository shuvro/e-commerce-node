$(document).ready(function(){
	$('body').on('click', '.form-option', function(e){
		e.preventDefault();
		$('.form-option').removeClass('highlight');
		$(this).addClass('highlight');
		var id = $(this).data('id');

		var url = "/api/cic/form/" + id;

		$('.getPDF').attr('id',id);
		$('#_currentForm').attr('data-fid',id);

		$('.empty-form').html('<i class="loader-icon fas fa-sync fa-spin"></i>');


		var jqxhr = $.get( url )
		  .done(function(data) {
		    console.log( data );
		    $('.empty-form').hide();
		    $('#loadedForm').show();
		    $('#loadedOptions').show();		    
		    $("#loadedForm :input").attr("disabled", true);
		    var html = '';
		    // $('#getPDF').attr('data-id','');

		    if(data && data.success){
		    	console.log('data',data);
		    	var formdata = data.result.form[0];		    	
		    	var ownerdata = data.result.owner;
		    	var filedata = data.result.attachedFiles;
		    	var detailsdata = data.result.details;
		    	$('#name').val(formdata.name)
		    	$('#flastname').val(formdata.lastname)
		    	$('#slastname').val(formdata.secondlastname)
				$('#idNumber').val(formdata.idnumber)
				
				$('#formDate').html(formdata.createdAt)
                
                $('#name_1').val(formdata.otherIds.name_1)
                $('#id_number_1').val(formdata.otherIds.id_number_1)
                $('#tipo_doc_1').val(formdata.otherIds.tipo_doc_1)

                $('#name_2').val(formdata.otherIds.name_2)
                $('#id_number_2').val(formdata.otherIds.id_number_2)
                $('#tipo_doc_2').val(formdata.otherIds.tipo_doc_1)

                $('#name_3').val(formdata.otherIds.name_3)
                $('#id_number_3').val(formdata.otherIds.id_number_2)
                $('#tipo_doc_3').val(formdata.otherIds.tipo_doc_1)
		    	

		    	var _details = ' Nada que mostrar';

		    	// if(detailsdata.length > 0){
		    	// 	$('#historialContainer').empty()
		    	// 	for(var i = 0; i < detailsdata.length; i++ ){
		    			
		    	// 		$('<div/>', {class: 'hc historyContainer-'+i}).appendTo('#historialContainer')
		    	// 		$('<div/>', {
				// 		    html: detailsdata[i].timestamp,
				// 		    class: 'historyDate',
				// 		}).appendTo('.historyContainer-'+i);
				// 		$('<div/>', {
				// 		    html: detailsdata[i].reason,
				// 		    class: 'historyTxt',
				// 		}).appendTo('.historyContainer-'+i);
				// 		$('<div/>', {
				// 		    html: detailsdata[i].user,
				// 		    class: 'historyCreated',
				// 		}).appendTo('.historyContainer-'+i);
		    	// 	}

		    		
		    	// }


		    	
		    	$('.reclaim-container').html(html)
		    	$('#signature-pic').empty();
		    	$('#firma-attch').empty();
		    	var img = $('<img id="dynamic-signature">');
					img.attr('src', formdata.firma);
					img.appendTo('#signature-pic');
					img.appendTo('#firma-attch');

				$('#signatur-date').html(moment(formdata.timestamp).format('d/mm/YYYY, h:mm:ss a'))	
                console.log('filedata.length',filedata.length)
                console.log('filedata',filedata)
				var card = '';
				for(var i = 0; i < filedata.length; i++){
                    console.log(i);
					var href = '#';
					var src = '/uploads/cic/' + filedata[i].filename;
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
                    console.log(card)   
                }
                // console.log(card)
				$('#other-attacheds').html(card);	

				
		    }
		    
		  })
		  .fail(function(e) {
		    alert( "error", e );
		  })
		 
	});
	$('body').on('click', '.getPDF', function(e){
		var url =  '/forms/its/cic/pdf/'+$(this).attr('id');
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


	

})