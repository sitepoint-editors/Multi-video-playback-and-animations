/*
 * Video Scripts and functionality
 */


//detect if we are on mobile (lets hope)
var mobile = navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|IEMobile/i);

jQuery(document).ready(function($){
	
		if(!mobile){
			
			videos = $('.video-wrapper .video-container');
			
			//process each video & animated elements
			videos.each(function(index){
					
				var video = $(this).find('video');

				//get the next video element (either the next video or the first one if we are at the end)
				if(index != (videos.length - 1)){
					var nextVideo = $(this).next('.video-container').find('video');
				}else{
					var nextVideo = videos.first().find('video');
				}

				//on first video, preload 
				if(index === 0){
					video.parents('.video-container').addClass('active');
		
					video[0].preload = "auto";
					video[0].play();
					video[0].playbackRate = 1 ;
				}

				//find all of the caption elements to be animated in
				var caption = video.siblings('.caption');
				var captionItems = caption.find('[data-animation-percent]');
				
				//if we have caption elements, slow playback on hover
				if(captionItems.length !=0){		
					video.parents('.video-container').on('mouseover','.caption.active', function(event){
						video[0].playbackRate = 0.5;
					});
					video.parents('.video-container').on('mouseout','.caption.active', function(event){
						video[0].playbackRate = 1;
					});
				}
		
				//interval to update the progress bar
				videoInterval= setInterval(function(){
					updateProgressAuto(video);
				}, 100); 
					
				var videoBar = video.siblings('.progress-bar');
			
				//When hovering over progress bar, pause video and restyle
				videoBar.on('mouseover', function(){
					$(this).siblings('.progress-overlay').addClass('active');
					$(this).addClass('expanded');
					video[0].pause();
				}); 
				
				//When not hovering, unpause video and restyle back to normal
				videoBar.on('mouseout', function(){
					$(this).siblings('.progress-overlay').removeClass('active');
					$(this).removeClass('expanded');
					video[0].play();
				}); 

				//seeking with the video bar
				videoBar.on('click', function(e){
					clearInterval(videoInterval);
					updateProgressManual((e.pageX - $(this).offset().left) , video);
				});
					
				//mouse moving
				var dragging = false;
				videoBar.on('mousedown',function(e) {
					clearInterval(videoInterval);
					dragging = true;
					updateProgressManual(e.pageX - $(this).offset().left, video);
				});
				
				//mouse up (choose time to seek to)
				videoBar.on('mouseup',function(e) {
					clearInterval(videoInterval);	
					dragging = false;
					updateProgressManual(e.pageX - $(this).offset().left, video);
				});
				
				//mouse dragging (actively seeking)
				videoBar.on('mousemove',function(e) {
					if(dragging === true){
						clearInterval(videoInterval);
						updateProgressManual(e.pageX - $(this).offset().left, video);
					}
				});
				
			
				//when video is playing 
				$(video).on('timeupdate', function(){
					
					var videoTime = ((this.currentTime /  this.duration) * 100);

					//Fading in / out caption elements
					if(captionItems.length > 0){
							
						captionItems.each(function(){
							
							item = $(this);
							animTime = parseInt(item.attr('data-animation-percent'));
						
							if(videoTime >= animTime){
								item.addClass('active');
							}else{
								item.removeClass('active');
							}
						
						});
						
						//set the caption (contains the elements) to be active so long as we have active elements
						if(captionItems.filter('.active').length != 0){
							caption.addClass('active');
						}else{
							caption.removeClass('active');
						}
						
						//check to see if we are about to finish and to fade out caption elements
						if(videoTime >= 90){
							
							caption.removeClass('active');
							captionItems.each(function(){
								$(this).removeClass('active');
							});
						}	
					}
					
					//start loading the next video 
					if(videoTime >= 70){
						nextVideo.preload = "auto";
					}
		
				});
						
				//one end do cleanup
				video[0].onended = function() {		
				   //change this video to be inactive and make the next active (so our video change is smooth)
				   video.parents('.video-container').removeClass('active');
				   nextVideo.parents('.video-container').addClass('active');
				   nextVideo[0].play(); 
				};
			});
		}
		
		//ON mobile fallback to a single image and text
		//(Similar to the video functionality, but completed with an interval)
		else{
		
			var fallback = $('.video-wrapper .fallback-container');
			var fallbackElements = fallback.find('[data-animation-percent]');
		
			fallback.addClass('active');
		
			var currentTime = 0;
			var animationDuration = 5000; 
			var timeInterval = 50;
			
			//run our main interval timer (60 FPS hopefully)
			var fallbackInterval = setInterval(function(){
				
				currentTime = (parseInt(currentTime) + timeInterval);
				
				//fade in elements based on time
				fallbackElements.each(function(){
					
					var animationPercent = parseInt($(this).attr('data-animation-percent'));
					if((currentTime / animationDuration * 100) >= animationPercent){
						$(this).addClass('active');
					}else{
						$(this).removeClass('active');
					}
				});
				
				//if we have any caption elements faded in
				if(fallbackElements.filter('.active').length != 0){
					fallbackElements.parents('.caption').addClass('active');
				}
							
				//if we have ended, finish
				if(currentTime >= animationDuration){
					clearInterval(fallbackInterval);
				}
				
			}, timeInterval);
			
		}

	//Automatically updates the progress bar as we play
	function updateProgressAuto(video){
		
		//get current percent completion / time and update elements
		var videoBar = $(video).siblings('.progress-bar');
		videoPercent = ((video[0].currentTime / video[0].duration ) * 100);
		
		videoBar.find('.progress').css('width', videoPercent + '%');
		videoBar.find('.progress-value').html(parseFloat(video[0].currentTime).toFixed(2) + " : " + parseFloat(video[0].duration).toFixed(2)); 
		videoBar.find('.progress-time').html(parseInt(videoPercent) + '%');
		
	}
	
	//Manually updates the video when we seek using the progress bar
	function updateProgressManual(progressBarPosition, video){
		
		var videoBar = $(video).siblings('.progress-bar');
		var videoPercentage = ((progressBarPosition / videoBar.outerWidth()) * 100);
		
		videoBar.find('.progress').css('width', videoPercentage + '%');
		videoBar.find('.progress-value').html(parseFloat(video[0].currentTime).toFixed(2) + " : " + parseFloat(video[0].duration).toFixed(2)); 
		videoBar.find('.progress-time').html(parseInt(videoPercentage) + '%');
		video[0].currentTime = ((video[0].duration * videoPercentage) / 100);

	}
	
});
