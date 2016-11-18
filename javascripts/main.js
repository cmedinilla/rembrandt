$(function(){
  var defaultSettings = {
    'threshold-type': 'percentage',
    'max-threshold': 0.01,
    'max-delta': 20,
    'max-offset': 0,
  }
  var rembrandt;

	function dropZone($target, onDrop){
		$target.
			bind('dragover', function(){
				$target.addClass( 'drag-over' );
				return false;
			}).
			bind("dragend", function () {
				$target.removeClass( 'drag-over' );
				return false;
			}).
			bind("dragleave", function () {
				$target.removeClass( 'drag-over' );
				return false;
			}).
			bind("drop", function(event) {
				var file = event.originalEvent.dataTransfer.files[0];

				event.stopPropagation();
				event.preventDefault();

				$target.removeClass( 'drag-over' );

				var droppedImage = new Image();
				var fileReader = new FileReader();
        var bufferReader = new FileReader();

				fileReader.onload = function (event) {
					droppedImage.src = event.target.result;
					$target.html(droppedImage);
          $target.addClass('drop-active');
          $target.css('height', droppedImage.height + 20); // thickness of border
          onDrop(event.target.result);
				};

				fileReader.readAsDataURL(file);

			});
	}
  var dropZoneOne = $('#dropzone1');
  var dropZoneTwo = $('#dropzone2');
  var file1;
  var file2;
  var totalPixels;

  dropZone(dropZoneOne, function(file){

    file1 = file
    if(file2) {
      rembrandt = new Rembrandt({
      // `imageA` and `imageB` can be either Strings (file path on node.js,
      // public url on Browsers) or Buffers
      imageA: file1,
      imageB: file2,

      // Needs to be one of Rembrandt.THRESHOLD_PERCENT or Rembrandt.THRESHOLD_PIXELS
      thresholdType: Rembrandt.THRESHOLD_PERCENT,

      // The maximum threshold (0...1 for THRESHOLD_PERCENT, pixel count for THRESHOLD_PIXELS
      maxThreshold: 0.01,

      // Maximum color delta (0...255):
      maxDelta: 20,

      // Maximum surrounding pixel offset
      maxOffset: 0,

      renderComposition: true, // Should Rembrandt render a composition image?
      compositionMaskColor: Rembrandt.Color.RED // Color of unmatched pixels
    })

    // Set total pixel count
    var width = Math.min(rembrandt._imageA.width, rembrandt._imageB.width);
    var height = Math.min(rembrandt._imageA.height, rembrandt._imageB.height);

    totalPixels = width * height;
    // Run the comparison
    rembrandt.compare()
      .then(function (result) {
        // Set total pixel count
        var width = Math.min(rembrandt._imageA.width, rembrandt._imageB.width);
        var height = Math.min(rembrandt._imageA.height, rembrandt._imageB.height);

        totalPixels = width * height;
        onComplete(result);

        // Note that `compositionImage` is an Image when Rembrandt.js is run in the browser environment
      })
      .catch((e) => {
        console.error(e)
      })
    }
  });

  dropZone(dropZoneTwo, function(file){
    file2 = file
    if(file1) {
      rembrandt = new Rembrandt({
      // `imageA` and `imageB` can be either Strings (file path on node.js,
      // public url on Browsers) or Buffers
      imageA: file1,
      imageB: file2,

      // Needs to be one of Rembrandt.THRESHOLD_PERCENT or Rembrandt.THRESHOLD_PIXELS
      thresholdType: Rembrandt.THRESHOLD_PERCENT,

      // The maximum threshold (0...1 for THRESHOLD_PERCENT, pixel count for THRESHOLD_PIXELS
      maxThreshold: 0.01,

      // Maximum color delta (0...255):
      maxDelta: 20,

      // Maximum surrounding pixel offset
      maxOffset: 0,

      renderComposition: true, // Should Rembrandt render a composition image?
      compositionMaskColor: Rembrandt.Color.RED // Color of unmatched pixels
    })

    window.rembrandt = rembrandt;

    // Run the comparison
    rembrandt.compare()
      .then(function (result) {
        // Set total pixel count
        var width = Math.min(rembrandt._imageA.width, rembrandt._imageB.width);
        var height = Math.min(rembrandt._imageA.height, rembrandt._imageB.height);

        totalPixels = width * height;
        onComplete(result);
        // Note that `compositionImage` is an Image when Rembrandt.js is run in the browser environment
      })
      .catch((e) => {
        console.error(e)
      })
    }
  });

  $('.change-params').on('click', function(ev){
    ev.preventDefault();
    onInputChange();
  });

  function onInputChange(){
    var options = {
      'threshold-type': $('[name="threshold-type"]').val(),
      'max-threshold': $('[name="max-threshold"]').val(),
      'max-delta': $('[name="max-delta"]').val(),
      'max-offset': $('[name="max-offset"]').val(),
    };
    updateRembrandt(options);
  }

  function updateRembrandt(options){

    var thresholdType = (options['threshold-type'] == 'percentage')? Rembrandt.THRESHOLD_PERCENT : Rembrandt.THRESHOLD_PIXELS;
    rembrandt._options['thresholdType'] =  thresholdType;
    rembrandt._options['maxThreshold'] = Number(options['max-threshold']);
    rembrandt._options['maxDelta'] =  Number(options['max-delta']);
    rembrandt._options['maxOffset'] = Number(options['max-offset']);

    window.rembrandt = rembrandt;
    rembrandt.compare()
      .then(function (result) {
        onComplete(result);
        // Note that `compositionImage` is an Image when Rembrandt.js is run in the browser environment
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function onComplete(result) {

    console.log("The result", result);
    $('.passed-result').text(result.passed);
    if(result.passed) {
      $('.passed-result').removeClass('wrong');
      $('.passed-result').addClass('right');
    } else {
      $('.passed-result').removeClass('right');
      $('.passed-result').addClass('wrong');
    }
    var percentage = (result.differences / totalPixels).toFixed(2) + '%'
    $('.percentage-result').text(percentage);
    $('.pixel-result').text(result.differences);

    setInputDefaults();

    $('.results').show();
    $('.comparison-image').html(result.compositionImage);
  }

  function setInputDefaults() {
    console.log("seeting inputs");
    for(var key in defaultSettings) {
      var $input = $('[name="' + key + '"]');
      if ($input.val() == ''){
        $input.val(defaultSettings[key]);
      }
    }
  }
});