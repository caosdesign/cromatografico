/*!
 * cromatografico v1.0.0 (http://www.engenhoca.caosdesign.com.br/cromatografico/)
 * Author: Caos Video e Design
 * 2015
 */


(function () {
  'use strict';

  var average_color_r = 0,
  average_color_g = 0,
  average_color_b = 0,
  total_color_r = 0,
  total_color_g = 0,
  total_color_b = 0,
  quant = 10,
  totalR = 0,
  totalG = 0,
  totalB = 0;



  //TRANSLATE

  var text_translate = {
    text_pt: ["processando", "limpar", "tente outra palavra", "qual a palavra?"],
    text_en: ["loading", "clear", "try another word", "what's the word?"]
  };



  // GET AVERAGE COLOR FROM IMAGE

  /* function to get average rgb color from an image is based on jquery.average-color by @LeeMallabone */
  var rgb2hex = function (rgb){
   rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
   return '#' +
    ('0' + parseInt(rgb[1],10).toString(16)).slice(-2) +
    ('0' + parseInt(rgb[2],10).toString(16)).slice(-2) +
    ('0' + parseInt(rgb[3],10).toString(16)).slice(-2);
  };

  var averageColor = function (imagem) {
    var blockSize = 100, // only sample every 100 pixels
      defaultRGB = {r: 0, g: 0, b: 0}, // for non-supporting environments
      canvas = document.createElement('canvas'),
      context = canvas.getContext && canvas.getContext('2d'),
      data, width, height,
      i = -4,
      length,
      rgb = {r: 0, g: 0, b: 0},
      count = 0;

    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = imagem.naturalHeight || imagem.offsetHeight || imagem.height;
    width = canvas.width = imagem.naturalWidth || imagem.offsetWidth || imagem.width;

    context.drawImage(imagem, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch (e) {
        return defaultRGB;
    }

    length = data.data.length;

    while ((i += blockSize * 4) < length) {
      var maior = Math.max(data.data[i], data.data[i+1], data.data[i+2]);
      var menor = Math.min(data.data[i], data.data[i+1], data.data[i+2]);
      
      /* TO DO: avoid grayish colors - tentativa de reduzir 'efeito massinha' */
      if ((maior - menor) > 50){ 
        count += 1;
        rgb.r += data.data[i];
        rgb.g += data.data[i + 1];
        rgb.b += data.data[i + 2];
      }
    }
    
    // used to floor values
    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);

    return rgb;
  };

  var averageColorAsString = function (imagem) {
      var rgb = imagem.averageColor();
      return 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
  };


  /* TO DO: avoid using same function only because of using different variables */
  var calculateAverageR = function (_value) {
    total_color_r += _value;
    totalR += 1;
    calculateAllAverage();
  };
  var calculateAverageG = function (_value) {
    total_color_g += _value;
    totalG += 1;
    calculateAllAverage();
  };
  var calculateAverageB = function (_value) {
    total_color_b += _value;
    totalB += 1;
    calculateAllAverage();
  };

  var calculateAllAverage = function(){
    average_color_r = Math.round(total_color_r / totalR);
    average_color_g = Math.round(total_color_g / totalG);
    average_color_b = Math.round(total_color_b / totalB);
    var rbg_str = 'rgb('+average_color_r+','+average_color_g+','+average_color_b+')';
    $('body').css('background',rbg_str);
    if(average_color_r >0 && average_color_g >0 && average_color_b >0){
      $('#footer-container p.texto').text(rgb2hex(rbg_str));
    }
    return rbg_str;
  }



  // GET IMAGES FROM GOOGLE SEARCH AND APPEND RESULTING TREATED CONTENTS (COLOR PALLET)
  $(document).ready(function () {
    var quant_colors = 0;
    var per_page = 8; // api max
    var googleString = 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0&as_filetype=jpg&restrict=cc_attribute&as_rights=cc_publicdomain|cc_noncommercial|cc_sharealike&imgc=color&imgtype=photo&imgsz=medium|large&rsz='+per_page;//&start=0&q=';
    
    var searchcall = function (argument) {
      resetTool(my_text_trans[0]);
      $('#complemento-input').css('cursor','default');

      /* TODO: when images has problems with crossOrigin, it fails to complete the color pallete. we are temporarily getting more image results. */
      startSearch(argument,(0)+1);
      startSearch(argument,((per_page*1)+1));
      startSearch(argument,((per_page*2)+1));
      startSearch(argument,((per_page*3)+1));

    };

    var startSearch = function (argument, offset) {
      $.ajax({
        url: googleString+'&start='+offset+'&q='+argument,
        type: 'GET',
        crossDomain: true,
        dataType: 'jsonp',
        success: function(result) { 

          var result_var = result.responseData.results;

          if(result_var.length == 0){
            $('#complemento-input').text(my_text_trans[2]);//('tente outra palavra');
          } else {
            for (var i = 0; i < result_var.length; i++) {
              if(quant_colors < quant){resultSearchLoop(result_var,i)};
            }
          }
        },
        error: function(err) { 
          console.log('Failed!', err); 
          $('#complemento-input').text(my_text_trans[2]);//('tente outra palavra');
        }
      });
    };

    var resetTool = function (complemento) {
      quant_colors = average_color_r = average_color_g = average_color_b = total_color_r = total_color_g = total_color_b = totalR = totalG = totalB = 0;
      $('#cores-container').empty();
      $('#complemento-input').text(complemento);
      $('#footer-container p.texto').text('');
      $('body').css('background','#ffffff');
    }

    var resultSearchLoop = function (result_var, i) {
      var img_src = result_var[i].unescapedUrl;
            
      var $img_element = $( '<img crossOrigin="anonymous" class="target-image" src="'+img_src+'" title-ref="'+result_var[i].titleNoFormatting+'">' );
      $('#results').append( $img_element );
      $img_element.crossOrigin = 'anonymous';

      $img_element.on('load', function() {
        if(quant_colors < quant){
          var _r = averageColor($(this)[0]).r,
          _g = averageColor($(this)[0]).g,
          _b = averageColor($(this)[0]).b;
          calculateAverageR(_r);
          calculateAverageG(_g);
          calculateAverageB(_b);

          var rbg_str = 'rgb('+_r+','+_g+','+_b+')',
          hex_str = rgb2hex(rbg_str),
          _img_src = this.src,
          src_ok = true;

          $( '#cores-container .cor-filho' ).each(function( index ) {
            if($( this ).attr('img-ref') == _img_src){
              src_ok = false;
            }
          });

          if(hex_str != '#000000' && hex_str != '#ffffff' && src_ok){
            console.log(_img_src);
          
            $('#cores-container').append( '<div class="cor-filho col-sm-1 col-xs-1" style="background: '+rbg_str+'" img-ref="'+this.src+'"><p class="texto text-uppercase">'+hex_str+'</p></div>' );

            quant_colors = $('#cores-container .cor-filho').length;

            $('#cores-container .cor-filho').hover(
              function() {
                $( this ).find( 'p' ).fadeIn(400);
              }, function() {
                $( this ).find( 'p' ).fadeOut(400);
              }
            );
          }
        } else {
          $('#complemento-input').text(my_text_trans[1]);//('limpar');
          $('#complemento-input').css('cursor','pointer');
          $('#results').empty();
        }
      });
    };


    // START QUERY
    $('#search-form').submit(function(event) {
      event.preventDefault();
      $('#results').empty();
      $('#cores-container').empty();
      var input_palavra = $( 'input:first' ).val().toLowerCase();
      document.location.search = '?q=' + input_palavra;
    });

    function getParameterByName(name) {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
          results = regex.exec(location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    var palavra = getParameterByName('q');
    var my_text_trans = (window.location.pathname.indexOf('/en/') > 0) ? text_translate.text_en : text_translate.text_pt;
    if(palavra != null && palavra.length > 0){
      console.log(palavra);
      $('#results').empty();
      $('#cores-container').empty();
      $( 'input:first' ).val(palavra);
      $('#lang-selector').addClass('hide');
      searchcall(palavra);
    }



    // CLEAR BUTTON AND BEHAVIORS
    
    $('#complemento-input').click(function(event){
      if($(this).text() == my_text_trans[1]){//'limpar'){
        resetTool('');
        $('#search-form input').val('');
        $('#search-form input').attr('placeholder', my_text_trans[3]);//'qual a palavra?');
        document.location.search = '';
        $('#lang-selector').removeClass('hide');
      }
    });


    $('#search-form input').focusin(function () {
        $(this).attr('placeholder', '');
    });
    $('#search-form input').focusout(function () {
      if($(this).val() == ''){
        $(this).attr('placeholder', my_text_trans[3]);//'qual a palavra?');
      }
    });


    $('header').hover(
      function() {
        $( this ).find( '.share-buttons' ).fadeIn(400);
      }, function() {
        $( this ).find( '.share-buttons' ).fadeOut(400);
      }
    );
    $('#search-form.toogle').hover(
      function() {
        $( this ).find( '#complemento-input' ).fadeIn(400);
      }, function() {
        $( this ).find( '#complemento-input' ).fadeOut(400);
      }
    );


    var positionAbout = function () {
      var calc = Math.ceil($('#main-content').height() / 2);
      $('#about-page').css('min-height',Math.ceil($('#main-content').height()+160));
      $('#about-page #main-content').css('margin-top',-calc+10);
      $('#about-page #main-content').css('opacity',1);
    };
    positionAbout();

    window.onresize = function(event) {
      positionAbout();
    };

  });
  
}());
