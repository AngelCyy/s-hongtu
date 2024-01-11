$('div.section').first();

$('a.next').on('click', function(e) { 
	   var $next = $('.current').next('.section');
       
        $('.current').removeClass('current');
        $('body').animate({
        }, function () {
               $next.addClass('current');
        });
	
		
 
});
$(window).scroll(function(e){
	var $prev = $('.current').prev('.section');
    var $next = $('.current').next('.section');   
	var $preUrl = 'index.html#';
	var $nexUrl = 'index.html#';
	if (typeof $prev.attr('id') != 'undefined'){
		$preUrl = $preUrl + $prev.attr('id');
	}else{
		$preUrl = $preUrl + "wowslider-container1";
        $('.current').removeClass('current');
		$('#wowslider-container1').addClass('current');
	}
		$('a.prev').attr('href',$preUrl);
	if (typeof $next.attr('id') != 'undefined'){
		$nexUrl = $nexUrl + $next.attr('id');
	}else{
		$nexUrl = $nexUrl + "wowslider-container2";
        $('.current').removeClass('current');
		$('#wowslider-container2').addClass('current');
	}
		$('a.next').attr('href',$nexUrl);

});

$('a.prev').on('click', function(e) { 

   var $prev = $('.current').prev('.section');
        
        $('.current').removeClass('current');
		$('body').animate({
          //scrollTop: top     
        }, function () {
               $prev.addClass('current');
        });		

});
$('.mobile').on('click', function(e) {
	if($('.mobile-actions').hasClass('translate')){
		$('.mobile-actions').removeClass('translate');
	}else{
		$('.mobile-actions').addClass('translate');
	}
});
$(document).ready(function() {   
            var sideslider = $('[data-toggle=collapse-side]');
            var sel = sideslider.attr('data-target');
            var sel2 = sideslider.attr('data-target-2');
            sideslider.click(function(event){
                $(sel).toggleClass('in');
                $(sel2).toggleClass('out');
            });
        });
		
		
	 
 
 


 
 
 
  
 