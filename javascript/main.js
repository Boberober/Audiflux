(function($){
  var isRecording = false;
  var recordingslist = document.getElementById('recordinglist');

  var audio_context;

  var input;

  var $fileInput = $('input[name="audioflux_file"]');

  $('#audioflux-recorder').on('click', function(e) {

    e.preventDefault();
    $("button").toggleClass("recording");
    console.log(audio_context);
    // if( audio_context === undefined ) {
    //   navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
    //     __log('No live audio input: ' + e);
    //   });
    // }

    console.log(audio_context);

      console.log(isRecording);
      if(!isRecording) {
        isRecording = true;
        startRecording(this);
        console.log(this);
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
    __log('Media stream created.');
    
    input.connect(audio_context.destination);
    __log('Input connected to audio context destination.');
    
    recorder = new Recorder(input);
    __log('Recorder initialised.');
  }

  function startRecording(button) {
    recorder && recorder.record();
    // button.disabled = true;
    button.nextElementSibling.disabled = false;
    __log('Recording...');
  }

  function stopRecording(button) {
    recorder && recorder.stop();
    // button.disabled = true;
    button.previousElementSibling.disabled = false;
    __log('Stopped recording.');
    
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
      // hf.href = url;
      hf.download = new Date().toISOString() + '.wav';

      // $.post(ajaxurl, { action: 'upload_audio', url : url }, function(response) {
      //   alert('Got this from the server: ' + response);
      // });

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
          // print the output from the upload.php script
          console.log(data);

          var data = JSON.parse(data);

          hf.innerHTML = hf.download;
          li.appendChild(au);
          // li.appendChild(hf);
          shortcode.innerHTML = 'Insert shortcode';

          // shortcode.addEventListener('click', function(e) {
          //   e.preventDefault();
          //   console.log('clicking');
          //   alert('[audioflux_player file="'+ data.name +'"]');
          //   $('textarea.wp-editor-area').html($('textarea.wp-editor-area').html() + '[audioflux_player file="'+ data.name +'"]');
          //   $('textarea.wp-editor-area').focus();

          //   au.src = data.name;
            
          // });

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
      // $content.html($content.html() + '[audioflux_player file="'+ $(this).attr('href') +'"]');
    });
    try {
      // webkit shim
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.webkitURL;
      
      audio_context = new AudioContext;
      __log('Audio context set up.');
      __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
      alert('No web audio support in this browser!');
    }
    window.audio_context = audio_context;
    navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
      __log('No live audio input: ' + e);
    });
  };

})(jQuery);

