$('document').ready(function(){
    $('#init').on('click', function(e){
        e.preventDefault();
        $('.checkId').fadeIn(200);
        
    })

    $('#close-login-modal').on('click', function(e){
        e.preventDefault();
        $('.checkId').fadeOut(200);
        $('.pin-wrapper').hide();
        $('#idNumber').val('');
    })

    $('#continue').on('click', function(e){
        e.preventDefault();
        $('.pin-wrapper').show();
        $('.checkId').fadeIn(200);        
    })

    $('#submit-login-modal').on('click', function(e){
        e.preventDefault();
        var that =  $(this);
        that.attr('disabled',true)
        that.html('<i class="fas fa-spinner fa-spin"></i>');
        
        if($('#idNumber').val() == '1'){
            $( ".add-checkId" ).effect( 'drop', {}, 300, mfaVerification );
            
        }else{
            shakeElement('#access-body')
            that.html('Ingresar');
            that.attr('disabled',false)
            //handle error
        }

    })

    $('#submit-mfa').on('click', function(e){
        e.preventDefault();
        var that =  $(this);
        that.attr('disabled',true)
        that.html('<i class="fas fa-spinner fa-spin"></i>');
        
        $( ".add-mfa" ).effect( 'drop', {}, 300, codeVerification );
        
    });

    $('#submit-code').on('click', function(e){
        e.preventDefault();
        var that =  $(this);
        that.attr('disabled',true)
        that.html('<i class="fas fa-spinner fa-spin"></i>');
        
        if($('#mfa-code').val() == '1988'){
            window.location.href = '/forms/'+org+'/kyc/123456/1';
            
        }else{
            shakeElement('#code-body')
            that.html('Acceder');
            that.attr('disabled',false)
            //handle error
        }

    })

    
    
    
    
});

function mfaVerification(){
    $('.add-mfa').show();
}

function codeVerification(){
    $('.add-code').show();
}


function shakeElement(element){
    $(element).addClass('shake');
    setTimeout(function(){
        $(element).removeClass('shake');
    },500);
};