if(document.readyState === 'ready' || document.readyState === 'complete') {
   setTimeout(function(){
    $('#loading').fadeOut();
    $('#kyc-cs-1').show();
    
   },500)
   
  } else {
    document.onreadystatechange = function () {
      if (document.readyState == "complete") {
        setTimeout(function(){
            $('#loading').fadeOut();
            $('#kyc-cs-1').show();
            $('[name="leform-8"]').val(userinfo.idNumber)
            $('[name="leform-13"]').val(userinfo.lastname)
            $('[name="leform-14"]').val(userinfo.secondLastname)
            $('[name="leform-15"]').val(userinfo.name)
           },500)
      }
    }
  }

$(document).ready(function(){


    $('#submit-form').on('click',function(e){
        e.preventDefault();        
        var btn = $(this);
        btn.attr('disabled',true)
        $('#continue-label').html('<i class="fas fa-spinner fa-spin"></i> Espere por favor');
        var lastname = $('.lastname').val();
        var idNumber = $('.idNumber').val();
        var _csrf = $('#_csrf').val();
        
        $.post( "/forms/kyc/auth", { lastname: lastname, idNumber: idNumber, _csrf: _csrf })
        .done(function(data) {
            console.log('data', data)
            if(data.success){
                $('#login-screen').hide()
                $('#add-token').show()
                $('#email').html(data.email)
            }else{
                $('#error-label').show()
            }
            $('#continue-label').html('<i class="fas fa-plus"></i> Continuar');
            btn.attr('disabled',false)
        })
        .fail(function(e) {
            console.log( "error", e );
        })
        
    });

    $('#submit-token').on('click',function(e){
        e.preventDefault();        
        var btn = $(this);
        
        $('#continue-label').html('<i class="fas fa-spinner fa-spin"></i> Espere por favor');
        btn.attr('disabled',true)
        var otp = $('.otp-code').val();
        var _csrf = $('#_csrf').val();
        var lastname = $('.lastname').val();
        var idNumber = $('.idNumber').val();
        
        $.post( "/forms/kyc/token", { otp: otp, lastname: lastname, idNumber: idNumber, _csrf: _csrf })
        .done(function(data) {
            console.log('data')
            if(data.success){
                window.location = '/forms/kyc/cs/kyc/poc/1?token='+data.token;
            }
        })
        .fail(function(e) {
            console.log( "error", e );
        })
        
    })

    

    $('#kyc-step2').on('click',function(e){
        e.preventDefault();
        var formdata = $('#kyc-cs-1').serialize();
        // console.log('formdata',formdata);
        window.location = '/forms/kyc/'+tempOrg+'/kyc/demo/2?jwt=abcd12345';
    })

    $('#submit-kyc').on('click',function(e){
        e.preventDefault();
        var formdata = $('#kyc-cs-1').serialize();
        // console.log('formdata',formdata);
        window.location = '/thankyou';
    })

    

    var isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;

    if (!isMobile) {
        $("#stepper").sticky({
            topSpacing:0,
            widthFromWrapper: false
        });
        $('#stepper').on('sticky-start', function() { 
            $('#save-step').fadeIn();
        });
        $('#stepper').on('sticky-end', function() { 
            $('#save-step').hide();
        })
    }else{
        // $("header").sticky({
        //     topSpacing:0,
        //     widthFromWrapper: false
        // });
    }

    
  });