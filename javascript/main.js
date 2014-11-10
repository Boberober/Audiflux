(function($){
  var isRecording = false;
  var recordingslist = document.getElementById('recordinglist');

  var audio_context;

  var input;

  var $fileInput = $('input[name="audioflux_file"]');

  $('#audioflux-recorder').on('click', function(e) {

    e.preventDefault();
    $("button").toggleClass("recording");
    if(!isRecording) {
      isRecording = true;
      startRecording(this);
    } else {
      isRecording = false;
      stopRecording(this);
    }
    

  });
  function __log(e, data) {
    // log.innerHTML += "\n" + e + " " + (data || '');
  }
  var audio_context;
  var recorder;

  function startUserMedia(stream) {
    input = audio_context.createMediaStreamSource(stream);
    console.log(audio_context);
    
    input.connect(audio_context.destination);
    
    recorder = new Recorder(input);
  }

  function startRecording(button) {
    recorder && recorder.record();
    // button.disabled = true;
    button.nextElementSibling.disabled = false;
  }

  function stopRecording(button) {
    recorder && recorder.stop();
    // button.disabled = true;
    button.previousElementSibling.disabled = false;
    
    // create WAV download link using audio data blob
    createDownloadLink();

    
    recorder.clear();
  }

  function createDownloadLink() {
    recorder && recorder.exportWAV(function(blob) {
      var url = URL.createObjectURL(blob);
      var li = document.createElement('li');
      var au = document.createElement('audio');
      var hf = document.createElement('a');
      
      var shortcode = document.createElement('a');

      au.controls = true;
      au.src = url;
      hf.download = new Date().toISOString() + '.wav';

      var reader = new FileReader();

      reader.onload = function(event) {

        var fd = new FormData();

        fd.append('data', event.target.result);
        fd.append('action', 'upload_audio');
        fd.append('filename', new Date().toISOString() + '.wav');

        console.log(fd);
        console.log(event.target.result);
        $.ajax({
            type: 'POST',
            url: ajaxurl,
            data: fd,
            processData: false,
            contentType: false
        }).done(function(data) {
          console.log(data);

          var data = JSON.parse(data);

          hf.innerHTML = hf.download;
          li.appendChild(au);
          shortcode.innerHTML = 'Insert shortcode';
          shortcode.className = 'block shortcode';
          shortcode.href = data.name;
          li.appendChild(shortcode);
          recordingslist.innerHTML = '';

          recordingslist.appendChild(li);

          $fileInput.val(data.name);
        });

      }
      console.log(blob);
      reader.readAsDataURL(blob);





    });
  }

  window.onload = function init() {
    var $content = $('#content');
    $('#audioflux_recorder').on('click', '.shortcode', function(e) {
      e.preventDefault();
      prompt('Copy the shortcode', '[audioflux_player file="' +$(this).attr('href') + '"]');
    });
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.webkitURL;
      
      audio_context = new AudioContext;
    } catch (e) {
      alert('No web audio support in this browser!');
    }
    window.audio_context = audio_context;
    navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
    });
  };

})(jQuery);

