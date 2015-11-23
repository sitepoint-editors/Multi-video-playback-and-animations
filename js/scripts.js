(function(){
  'use strict';

  var mobile = navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|IEMobile/i);
  if(!mobile){
    startVideoBanner();
  } else {
    showFallback();
  }

  function showFallback(){
    var fallback = $('.video-wrapper .fallback-container'),
        fallbackElements = fallback.find('[data-animation-percent]'),
        currentTime = 0,
        animationDuration = 5000,
        timeInterval = 50;

    fallback.addClass('active');

    var fallbackInterval = setInterval(function(){
      currentTime = (parseInt(currentTime) + timeInterval);
      fallbackElements.each(function(){
        var animationPercent = parseInt($(this).attr('data-animation-percent'));
        if((currentTime / animationDuration * 100) >= animationPercent){
          $(this).addClass('active');
        } else {
          $(this).removeClass('active');
        }
      });

      if(fallbackElements.filter('.active').length !== 0){
        fallbackElements.parents('.caption').addClass('active');
      }

      if(currentTime >= animationDuration){
        clearInterval(fallbackInterval);
      }

    }, timeInterval);
  }

  function startVideoBanner(){
    var videos = $('.video-container');

    videos.each(function(index){
      var video = $(this).find('video'),
          nextVideo;

      if(index !== (videos.length - 1)){
        nextVideo = $(this).next('.video-container').find('video');
      } else {
        nextVideo = videos.first().find('video');
      }

      if(index === 0){
        video.parents('.video-container').addClass('active');
        video[0].preload = 'auto';
        video[0].play();
      }

      var caption = video.siblings('.caption'),
          captionItems = caption.find('[data-animation-percent]'),
          videoBar = video.siblings('.progress-bar'),
          dragging = false,
          nextLoaded = false;

      $(video).on('timeupdate', function(){
        var videoTime = ((this.currentTime /  this.duration) * 100);

        if(captionItems.length > 0){
          captionItems.each(function(){
            var item = $(this);
            var animTime = parseInt(item.attr('data-animation-percent'));

            if(videoTime >= animTime){
              item.addClass('active');
            } else {
              item.removeClass('active');
            }
          });

          if(captionItems.filter('.active').length !== 0){
            caption.addClass('active');
          } else {
            caption.removeClass('active');
          }

          if(videoTime >= 90){
            caption.removeClass('active');

            captionItems.each(function(){
              $(this).removeClass('active');
            });
          }
        }

        if(videoTime >= 70 && nextLoaded === false){
          nextVideo.preload = 'auto';
          nextVideo.load();
          nextLoaded = true;
        }
      });

      function updateProgressAuto(video){
        var videoBar = $(video).siblings('.progress-bar');
        var videoPercent = ((video[0].currentTime / video[0].duration ) * 100);

        videoBar.find('.progress').css('width', videoPercent + '%');
        videoBar.find('.progress-value').html(parseFloat(video[0].currentTime).toFixed(2) + ' : ' + parseFloat(video[0].duration).toFixed(2));
        videoBar.find('.progress-time').html(parseInt(videoPercent) + '%');
      }

      setInterval(function(){
        updateProgressAuto(video);
      }, 100);

      video[0].onended = function() {
        nextVideo.parents('.video-container').addClass('active');
        video.parents('.video-container').removeClass('active');
        nextVideo[0].play();
      };

      function updateProgressManual(progressBarPosition, video){
        var videoBar = $(video).siblings('.progress-bar');
        var videoPercentage = ((progressBarPosition / videoBar.outerWidth()) * 100);

        videoBar.find('.progress').css('width', videoPercentage + '%');
        videoBar.find('.progress-value').html(parseFloat(video[0].currentTime).toFixed(2) + ' : ' + parseFloat(video[0].duration).toFixed(2));
        videoBar.find('.progress-time').html(parseInt(videoPercentage) + '%');
        video[0].currentTime = ((video[0].duration * videoPercentage) / 100);
      }

      videoBar.on('click', function(e){
        updateProgressManual((e.pageX - $(this).offset().left) , video);
      });

      videoBar.on('mousedown',function(e) {
        dragging = true;
        updateProgressManual(e.pageX - $(this).offset().left, video);
      });

      videoBar.on('mouseup',function(e) {
        dragging = false;
        updateProgressManual(e.pageX - $(this).offset().left, video);
      });

      videoBar.on('mousemove',function(e) {
        if(dragging === true){
          updateProgressManual(e.pageX - $(this).offset().left, video);
        }
      });

      videoBar.on('mouseover', function(){
        $(this).siblings('.progress-overlay').addClass('active');
        $(this).addClass('expanded');
        video[0].pause();
      });

      videoBar.on('mouseout', function(){
        $(this).siblings('.progress-overlay').removeClass('active');
        $(this).removeClass('expanded');
        video[0].play();
      });

      if(captionItems.length !==0){
        video.parents('.video-container').on('mouseover','.caption.active', function(){
          video[0].playbackRate = 0.5;
        });
        video.parents('.video-container').on('mouseout','.caption.active', function(){
          video[0].playbackRate = 1;
        });
      }
    });
  }

  $(".video-container").on("click", function(){
    var video = $(this).find("video")[0];
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });

})();
