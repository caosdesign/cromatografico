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
      
      /* TODO: avoid grayish colors - tentativa de reduzir 'efeito massinha' */
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
      $('#hex-container').text(rgb2hex(rbg_str));
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
      $('#hex-container').text('');
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

            //draw on canvas for facebook share
            var c_w = 1200;
            var c_h = 630;
            var c=document.getElementById("share-canvas");
            var ctx=c.getContext("2d");
            ctx.fillStyle=hex_str;
            ctx.fillRect((quant_colors*(c_w/10)),0,(c_w/10),c_h);
            //hex_list for  facebook share
            hex_list+=hex_str.substr(1)+' ';

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
          $('#share-palette-container').css('display', 'inline-block');
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


    // SHARE PALLETE

    window.fbAsyncInit = function() {
      FB.init({
        appId      : '1613857125531579',//'1613875592196399',//
        xfbml      : true,
        version    : 'v2.4'
      });
    };

    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "//connect.facebook.net/en_US/sdk.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));

    
    var hex_list = '';
    $('#share-button').click(function(event){
      // Converts canvas to an image
      function convertCanvasToImage(canvas) {
        var image = new Image();
        image.src = canvas.toDataURL('image/png');
        return image;
      }




      /*
      Copyright (c) 2011, Daniel Guerrero
      All rights reserved.
      Redistribution and use in source and binary forms, with or without
      modification, are permitted provided that the following conditions are met:
          * Redistributions of source code must retain the above copyright
            notice, this list of conditions and the following disclaimer.
          * Redistributions in binary form must reproduce the above copyright
            notice, this list of conditions and the following disclaimer in the
            documentation and/or other materials provided with the distribution.
      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
      ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
      WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
      DISCLAIMED. IN NO EVENT SHALL DANIEL GUERRERO BE LIABLE FOR ANY
      DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
      (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
      LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
      ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
      (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
      SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
       */

      /**
       * Uses the new array typed in javascript to binary base64 encode/decode
       * at the moment just decodes a binary base64 encoded
       * into either an ArrayBuffer (decodeArrayBuffer)
       * or into an Uint8Array (decode)
       * 
       * References:
       * https://developer.mozilla.org/en/JavaScript_typed_arrays/ArrayBuffer
       * https://developer.mozilla.org/en/JavaScript_typed_arrays/Uint8Array
       */

      var Base64Binary = {
        _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        
        /* will return a  Uint8Array type */
        decodeArrayBuffer: function(input) {
          var bytes = (input.length/4) * 3;
          var ab = new ArrayBuffer(bytes);
          this.decode(input, ab);
          
          return ab;
        },

        removePaddingChars: function(input){
          var lkey = this._keyStr.indexOf(input.charAt(input.length - 1));
          if(lkey == 64){
            return input.substring(0,input.length - 1);
          }
          return input;
        },

        decode: function (input, arrayBuffer) {
          //get last chars to see if are valid
          input = this.removePaddingChars(input);
          input = this.removePaddingChars(input);

          var bytes = parseInt((input.length / 4) * 3, 10);
          
          var uarray;
          var chr1, chr2, chr3;
          var enc1, enc2, enc3, enc4;
          var i = 0;
          var j = 0;
          
          if (arrayBuffer)
            uarray = new Uint8Array(arrayBuffer);
          else
            uarray = new Uint8Array(bytes);
          
          input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
          
          for (i=0; i<bytes; i+=3) {  
            //get the 3 octects in 4 ascii chars
            enc1 = this._keyStr.indexOf(input.charAt(j++));
            enc2 = this._keyStr.indexOf(input.charAt(j++));
            enc3 = this._keyStr.indexOf(input.charAt(j++));
            enc4 = this._keyStr.indexOf(input.charAt(j++));
        
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
        
            uarray[i] = chr1;     
            if (enc3 != 64) uarray[i+1] = chr2;
            if (enc4 != 64) uarray[i+2] = chr3;
          }
        
          return uarray;  
        }
      }

      // This bit is important.  It detects/adds XMLHttpRequest.sendAsBinary.  Without this
      // you cannot send image data as part of a multipart/form-data encoded request from
      // Javascript.  This implementation depends on Uint8Array, so if the browser doesn't
      // support either XMLHttpRequest.sendAsBinary or Uint8Array, then you will need to
      // find yet another way to implement this. (This is left as an exercise for the reader,
      // but if you do it, please let me know and I'll integrate it.)

      // from: http://stackoverflow.com/a/5303242/945521

      if ( XMLHttpRequest.prototype.sendAsBinary === undefined ) {
          XMLHttpRequest.prototype.sendAsBinary = function(string) {
              var bytes = Array.prototype.map.call(string, function(c) {
                  return c.charCodeAt(0) & 0xff;
              });
              this.send(new Uint8Array(bytes).buffer);
          };
      }

      // This function takes an array of bytes that are the actual contents of the image file.
      // In other words, if you were to look at the contents of imageData as characters, they'd
      // look like the contents of a PNG or GIF or what have you.  For instance, you might use
      // pnglib.js to generate a PNG and then upload it to Facebook, all from the client.
      //
      // Arguments:
      //   authToken - the user's auth token, usually from something like authResponse.accessToken
      //   filename - the filename you'd like the uploaded file to have
      //   mimeType - the mime type of the file, eg: image/png
      //   imageData - an array of bytes containing the image file contents
      //   message - an optional message you'd like associated with the image

      function PostImageToFacebook( authToken, filename, mimeType, imageData, message ){
          // this is the multipart/form-data boundary we'll use
          var boundary = '----ThisIsTheBoundary1234567890';
          
          // let's encode our image file, which is contained in the var
          var formData = '--' + boundary + '\r\n'
          formData += 'Content-Disposition: form-data; name="source"; filename="' + filename + '"\r\n';
          formData += 'Content-Type: ' + mimeType + '\r\n\r\n';
          for ( var i = 0; i < imageData.length; ++i )
          {
              formData += String.fromCharCode( imageData[ i ] & 0xff );
          }
          formData += '\r\n';
          formData += '--' + boundary + '\r\n';
          formData += 'Content-Disposition: form-data; name="message"\r\n\r\n';
          formData += message + '\r\n'
          formData += '--' + boundary + '--\r\n';
          
          var xhr = new XMLHttpRequest();
          xhr.open( 'POST', 'https://graph.facebook.com/me/photos?access_token=' + authToken, true );
          xhr.onload = xhr.onerror = function() {
              console.log( xhr.responseText );
          };
          xhr.setRequestHeader( "Content-Type", "multipart/form-data; boundary=" + boundary );
          xhr.sendAsBinary( formData );
      }



      FB.login(function(response) {
        if(typeof response.authResponse.accessToken != 'undefined'){
          var c=document.getElementById("share-canvas");
          var ctx=c.getContext("2d");
          var x = c.width / 2;
          var y = c.height / 2;
          ctx.font = '80px Open Sans';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#333333';
          ctx.fillText('| '+palavra+' |', x, y);

          ctx.font = '20px Open Sans';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#333333';
          ctx.fillText('cromatográfico | caos!design', x, 600);

          var ci = c.toDataURL('image/png');
          var encodedPng = ci.substring(ci.indexOf(',')+1,ci.length);
          var decodedPng = Base64Binary.decode(encodedPng);

          var retVal = confirm("Publish on your timeline?");
          if( retVal == true ){
            PostImageToFacebook(response.authResponse.accessToken, 'shareImage.png', 'image/png', decodedPng, 'color palette generated by cromatografico from the word '+palavra.toUpperCase()+' | average color '+$('#hex-container').text().substr(1).toUpperCase()+' | color palette '+hex_list.toUpperCase()+' | http://engenhoca.caosdesign.com.br/cromatografico/');
          }
        }
      }, {scope: 'publish_actions'});

      //https://developers.facebook.com/docs/opengraph/getting-started
      //FUNCIONA sem imagem
      /*FB.ui({
        method: 'share_open_graph',
        action_type: 'cromatografico-test:generate',
        action_properties: JSON.stringify({
            color_palette: {
              'og:url': 'http://localhost/engenhoca/cromatografico/site/',//?q='+palavra,
              'og:title': palavra,
              'og:type': 'cromatografico-test:color_palette',//'cromatografico:color_palette',
              //'og:image': imgURL,//'http://engenhoca.caosdesign.com.br/cromatografico/share_cromatografico.jpg',
              'og:description': '| WORD '+palavra+' | AVERAGE COLOR '+$('#hex-container').text()+' | COLOR PALETTE '+hex_list+' |',
              'fb:app_id': '1613875592196399'//'1613857125531579',
            }
        })
      }, function(response){
        console.log(response);
      });*/

    });



    // CLEAR BUTTON AND BEHAVIORS
    
    $('#complemento-input').click(function(event){
      if($(this).text() == my_text_trans[1]){//'limpar'){
        resetTool('');
        $('#share-palette-container').css('display', 'none');
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
        $( this ).find( '#complemento-input-container' ).fadeIn(400);
      }, function() {
        $( this ).find( '#complemento-input-container' ).fadeOut(400);
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
