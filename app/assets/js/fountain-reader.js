// Fountain-parser.js 0.2.0
// http://www.opensource.org/licenses/mit-license.php
// Copyright (c) 2012 Matt Daly

;(function ($, window, document, undefined) {
  // element removal callback
  var removeThis = function () { $(this).remove(); };

  $.fn.fountain = function (args) {
    if (typeof args === 'object' || !args) {
      return this.each(function () {
        var $app       = $(this)
          , $dock      = $(document.getElementById('dock'))
          , $workspace = $(document.getElementById('workspace'));

        var dragOver = function (e) {
            $(this).addClass('over');
            e.stopPropagation();
            e.preventDefault();
        };

        var dragLeave = function (e) {
            $(this).removeClass('over');
            e.stopPropagation();
            e.preventDefault();
        };

        var loadScript = function (e) {
          e.preventDefault();
          e.stopPropagation();
          e = e.originalEvent;

          $(this).removeClass('over');

          var file   = e.dataTransfer.files[0]
            , reader = new FileReader();

          if (file) {
            reader.onload = function(evt) {
              $app.trigger('fountain-js:loaded', [evt.target.result]);
            }

            reader.readAsText(file);
          }
        };

        if (!$app || !$dock || !$workspace ) { console.log('Fountain.js - Environment not set up correctly.'); return; }

        // dock
        $(document.getElementById('file-api')).fadeIn().on('dragleave', dragLeave).on('dragover', dragOver).on('drop', loadScript);

        // workspace
        var settings    = $.extend({}, $.fn.fountain.defaults, args)
          , $header     = $workspace.find('header')
          , $container  = $header.find('.container')
          , $title      = $(document.getElementById('script-title'))
          , $navigation = $(document.getElementById('navigation'))
          , $toolbar    = $(document.getElementById('toolbar'))
          , $toolbar    = $(document.getElementById('toolbar'))
          , $script     = $(document.getElementById('script')).addClass(settings.paper).addClass('dpi' + settings.dpi)
          , $backdrop   = $(document.createElement('div')).addClass('backdrop');

        var page = function (html, isTitlePage) {
          var $output = $(document.createElement('div')).addClass('page').html(html);

          if (isTitlePage) {
            $output.addClass('title-page');
          } else {
            $output.children('div.dialogue.dual').each(function() {
              dual = $(this).prev('div.dialogue');
              $(this).wrap($(document.createElement('div')).addClass('dual-dialogue'));
              dual.prependTo($(this).parent());
            });
          }

          return $output;
        };

        // notifications
        var notify = function (text) {
          $workspace.find('.notification').remove();
          $(document.createElement('p')).addClass('notification').attr('contenteditable', 'false').text(text).appendTo($workspace).fadeIn(200).delay(2000).fadeOut(1000, function() {
            removeThis();
          });
        };

        // toolbar
        $toolbar.find('.dock').on('click', function () {
          $app.trigger('fountain-js:dock');
        }).on('dragleave', dragLeave).on('dragover', dragOver).on('drop', loadScript);

        $toolbar.find('.dim').on('click', function () {
          $header.toggleClass('dimmed');
          settings.dimmed = !settings.dimmed;

          $(this).toggleClass('increase');

          notify('Header ' + (settings.dimmed ? 'dimmed' : 'restored'));
        });

        $toolbar.find('.resize').on('click', function () {
          $script.removeClass('dpi' + settings.dpi);
          settings.dpi = settings.dpi === 72 ? 100 : 72;
          $script.addClass('dpi' + settings.dpi);
          $container.width($script.width());

          $(this).toggleClass('large');

          notify('Script resized to ' + settings.dpi + ' dpi');
        });

        $app.on('fountain-js:dock', function () {
          $workspace.hide();
          $script.empty();
          $dock.show();
        });

        $app.on('fountain-js:loaded', function (e, file) {
          $dock.hide();
          $script.empty();
          fountain.parse(file, true, function (result) {
            if (result) {
              if (result.title && result.html.title_page) {
                $script.append(page(result.html.title_page, true));
                $title.html(result.title || 'Untitled');
              }
              $script.append(page(result.html.script));
              $workspace.fadeIn();
              notify($title.text() + ' loaded!');
            }

            /*Begin statistics section */

            var output          = result,
                scene_headings  = new Array,
                text,
                unused          = true;

            //Determine locations
            $(output.tokens).each(function(){
              //Determine if we are looking at a scene heading
              if($(this)[0].type === 'scene_heading') {

                var text = $(this)[0].text;

                //Determine night or day
                if( text.indexOf(' - DAY') > 0 ) {
                  var location = text.substring(0, text.indexOf(' - DAY'));
                  var time = 'day';
                } else if( text.indexOf(' - NIGHT') > 0 ) {
                  var location = text.substring(0, text.indexOf(' - NIGHT'));
                  var time = 'night';
                }else {
                  var location = text;
                  var time = 'unknown';
                }

                $(scene_headings).each(function(){

                  if( $(this)[0].text === location ) {

                    if(time === 'day') {
                      if( $(this)[0].day_count === undefined ) {
                        $(this)[0].day_count = 1;
                      } else {
                        $(this)[0].day_count++;
                      }
                    } else if(time === 'night') {
                      if( $(this)[0].night_count === undefined ) {
                        $(this)[0].night_count = 1;
                      } else {
                        $(this)[0].night_count++;
                      }
                    } else {
                      if ( $(this)[0].unknown_count === undefined ) {
                        $(this)[0].unknown_count = 1;
                      } else {
                        $(this)[0].unknown_count++;
                      }
                    }
                    unused = false;
                    return false;
                  } else {
                    unused = true;
                  }
                });

                if( unused === true ) {

                  if( time === 'day' ) {
                    scene_headings.push({
                      text: location,
                      day_count: 1
                    });
                  } else if( time === 'night' ) {
                    scene_headings.push({
                      text: location,
                      night_count: 1
                    });
                  } else {
                    scene_headings.push({
                      text: location,
                      unknown_count: 1
                    });
                  }

                }
              }
            });

            //Determining total number of scenes
            $(scene_headings).each(function(){

              //Set undefined and NaN to 0
              if( $(this)[0].day_count === undefined ) $(this)[0].day_count = 0;
              if( $(this)[0].night_count === undefined ) $(this)[0].night_count = 0;
              if( $(this)[0].unknown_count === undefined ) $(this)[0].unknown_count = 0;

              var total_count = $(this)[0].day_count + $(this)[0].night_count + $(this)[0].unknown_count;

              $(this)[0].total_count = total_count;

              //Set undefined and NaN to 0
              if( $(this)[0].total_count === undefined ) $(this)[0].total_count = 0;
            });

            function sort_by_count(a,b) {
              if (a.total_count > b.total_count)
                return -1;
              if (a.total_count < b.total_count)
                return 1;
              return 0;
            }

            scene_headings.sort(sort_by_count);

            $i=1;

            //Output exteriors
            $(scene_headings).each(function(){
              if($(this)[0].text.indexOf('EXT.') > -1) {
                $('#locations table').append('<tr class="exterior"><td>' + $i + '</td><td>' + $(this)[0].text + '</td><td>' + $(this)[0].day_count + '</td><td>' + $(this)[0].night_count + '</td><td>' + $(this)[0].unknown_count + '</td><td>' + $(this)[0].total_count + '</td></tr>');
                $i++;
              }
            });

            //Output interiors
            $(scene_headings).each(function(){
              if($(this)[0].text.indexOf('INT.') > -1) {
                $('#locations table').append('<tr class="interior"><td>' + $i + '</td><td>' + $(this)[0].text + '</td><td>' + $(this)[0].day_count + '</td><td>' + $(this)[0].night_count + '</td><td>' + $(this)[0].unknown_count + '</td><td>' + $(this)[0].total_count + '</td></tr>');
                $i++;
              }
            });

            //Output exteriors
            $(scene_headings).each(function(){
              if($(this)[0].text.indexOf('EXT.') < 0 && $(this)[0].text.indexOf('INT.') < 0) {
                $('#locations table').append('<tr class="unknown"><td>' + $i + '</td><td>' + $(this)[0].text + '</td><td>' + $(this)[0].day_count + '</td><td>' + $(this)[0].night_count + '</td><td>' + $(this)[0].unknown_count + '</td><td>' + $(this)[0].total_count + '</td></tr>');
                $i++;
              }
            });

            /*End statistics section */
          });
        });
      });
    }   
  };

  $.fn.fountain.defaults = {
    dimmed: false,
    dpi: 100,
    paper: 'us-letter'
  };
})(jQuery, window, document);

$(function() {
  var $error = $(document.createElement('p')).addClass('error');
  if (!window.File || !window.FileReader) {
    $('#file-api').remove();
    $error.html('Oops, your browser doesn\'t support the HTML 5 File API. Work is underway to improve compatibilty, hang tight!').appendTo($('#dock > .container'));
  } else if (typeof fountain === 'undefined') {
    $('#file-api').remove();
    $error.html('Oops, the necessary files don\'t seem to have been included. You need fountain.js/fountain.min.js!').appendTo($('#dock > .container'));
  } else {
    $('#fountain-js').fountain();
  }
});
