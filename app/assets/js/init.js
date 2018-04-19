// Get HTML File Name
let url = window.location.pathname
let filename = url.substring(url.lastIndexOf('/') + 1)
// Get Foutain Name
filename = filename.replace('html', 'fountain')

var page = function (html, className) {
  var $output = $(document.createElement('div')).addClass('page').html(html)
  if (className) {
    $output.addClass(className)
  } else {
    $output.children('div.dialogue.dual').each(function () {
      dual = $(this).prev('div.dialogue')
      $(this).wrap($(document.createElement('div')).addClass('dual-dialogue'))
      dual.prependTo($(this).parent())
    })
  }
  return $output
}

var counter = 0
var prev_text = ''

var char_per_minutes = 1300

// workspace
var $body       = $(document.getElementById('fountain-js'))
  , $dock       = $(document.getElementById('dock'))
  , $workspace  = $(document.getElementById('workspace'))
  , $title      = $(document.getElementById('script-title'))
  , $navigation = $(document.getElementById('navigation'))
  , $toolbar    = $(document.getElementById('toolbar'))
  , $script     = $(document.getElementById('script')).addClass('us-letter').addClass('dpi' + '100')
  , $backdrop   = $(document.createElement('div')).addClass('backdrop')

$(document).ready(function(){
  ParserAndPrint()
  setInterval(ParserAndPrint, 1000)
})

var cookie = {}

cookie.script_visible = getCookie("script_visible");

$toolbar.find('.resize').on('click', function () {
  $('.title-page, .toc-page, .script-page').fadeToggle(400, function(){
    let val = cookie.script_visible === 'false'? 'true' : 'false';
     setCookie("script_visible", val );
  })
});

cookie.dark_theme = getCookie("dark_theme");
if( cookie.dark_theme === 'true') $body.addClass('dark-theme')
$toolbar.find('.dim').on('click', function () {
  $body.toggleClass('dark-theme')
  setCookie("dark_theme", $body.hasClass('dark-theme') );
});

var ParserAndPrint = function () {
  counter++
  fetch(filename)
  .then(response => response.text())
  .then(text =>
      fountain.parse(text, true, function (result) {
      if (result && text !== prev_text) {
        prev_text = text
        if (result.title && result.html.title_page) {
          if ( ! $('.title-page').length )
          	$script.append(page(result.html.title_page, 'title-page'))
          $title.html(result.title || 'Untitled')
        }

        document.title = result.title

        // toc
        if ( ! $('.toc-page').length )
          $script.append(page('<h2>Table des Matières</h2><h3>Sequences</h3><ol id="toc"></ol><h3>Stats</h3><ol id="toc-stats"><li><a href="#stats">Characters</a><li><a href="#stats-sequences">X-Range</a></li></ol>', 'toc-page'))

        // script
        if ( ! $('.script-page').length ) {
          $script.append(page(result.html.script, 'script-page'))
        } else {
          $('.script-page').html(result.html.script)
        }

        // Table of Content
        let sequencesTitles = $('.script-page h3')
        let tocHTML = ''
        sequencesTitles.each(function (i) {
          this.id = 'sequence-' + ( i + 1 )
          this.dataset.index = i + 1
          tocHTML = tocHTML + '<li><a href="#sequence-' + ( i + 1 ) + '">' + this.innerText + '</a></li>'
        })
        $('#toc').html( tocHTML )
        $('html').smoothScroll() // Activate smooth scrool on all internal links

        if ( ! $('.stats-page').length )
          $script.append(page(`
            <h2>Statistiques</h2>
            <div id="stats-filter">
              <div class="filter-field filter-sequences">
               <label for="filter">Sequence: </label>
               <select id="filter">
                  <option value="0" selected>All</option>
               </select>
              </div>
              <div class="filter-field filter-unit">
               <label for="unit">Unit: </label>
               <select id="unit">
                  <option value="lines">Lines</option>
                  <option value="words">Words</option>
                  <option value="time" selected>Time</option>
               </select>
               </div>
            </div>
            <div id="stats-characters" class="charts"></div>
            <div id="stats-sequences" class="charts"></div>
            <div id="stats-categories" class="charts"></div>`, 'stats-page')
          )

        var filterElm = $('#filter')
        let sequence_init_val = filterElm.val()
        filterElm.html('<option value="0" selected>All</option>')
        $('.script-page h3').each(function(){
          filterElm.append('<option value=' + $(this).data('index') +'>' + $(this).data('index') + '. ' + $(this).text() + '</option>')
        })
        filterElm.val(sequence_init_val)
        if ( filterElm.val() === null ) filterElm.val( 0 )

        $('.dialogue').each(function(){
          let character = $(this).children('h4').text().replace(' (SUITE)', '' )
          $(this).addClass(character.toLowerCase()) // Add character name as class of character dialog titles
          $(this).html(($(this).html()).replace(/(\w)( )([!\?:;%»]|&raquo;)/, '$1&nbsp;$3')) // Add non-breaking space for French
        })

        $('.dialogue').each(function(){
          var h3 = $(this).prevAll( 'h3:first' )
          this.dataset.seqindex = h3.data('index')
        })

        var dialogs = AnalyseDialogs()

        var chart = DrawChart(SumDialogs(FilterDialogs(dialogs)))
        var chartSeq = DrawChartSequence(FilterDialogs(dialogs))

        DrawCategoriesChart(dialogs)

        $('#filter, #unit').change(function(){
          chart = DrawChart(SumDialogs(FilterDialogs(dialogs)))
          chartSeq = DrawChartSequence(FilterDialogs(dialogs))
          DrawCategoriesChart(dialogs)
        })

        if ( counter === 1 )
          $workspace.fadeIn()

          if( cookie.script_visible === 'false'){
            $('.title-page, .toc-page, .script-page').hide()
          };
      }
    })
  )
}

var SumDialogs = function( dialogs ) {
  var charactersStats = []
  var charactersColor = []

  var unit = $('#unit').val()

  dialogs.forEach(function(line) {
    if( unit === "lines" ) {
      charactersStats[line.character] = charactersStats[line.character] === undefined ? 1 : charactersStats[line.character] + 1
    } else if( unit === "time" ) {
      charactersStats[line.character] = charactersStats[line.character] === undefined ? line.time : charactersStats[line.character] + line.time
    } else {
      charactersStats[line.character] = charactersStats[line.character] === undefined ? line.wordCount : charactersStats[line.character] + line.wordCount
    }
    if( unit === "time" ) {
      for (var key in charactersStats) {
        charactersStats[key] = Math.round(charactersStats[key])
      }
    }
    if ( charactersColor[line.character] === undefined ) { charactersColor[line.character] = line.color }
  })

  stats = {'stats': charactersStats, 'colors': charactersColor}
  return stats
}

var FilterDialogs = function(dialogs) {
  var filtered = []
  var idx = parseInt( $('#filter').val() )

  var filtered = []
  dialogs.forEach(function(line) {
    if ( idx === 0 || idx === line.sequence) {
      filtered.push(line)
    }
  })
  return filtered
}

var AnalyseDialogs = function() {
  var dialogs = []

  $('.dialogue').each(function(){
    let character = $(this).children('h4').text().replace(/ *\([^)]*\) */g, "")
    let raw_text = $(this).children('p').text().trim().replace('/\s+/gi', ' ')
    let wordCount = raw_text.split(' ').length;
    dialogs.push( {'character': character, 'wordCount': wordCount, 'sequence': $(this).data('seqindex'), 'color': $(this).children('h4').css("color"), 'text':  raw_text, 'time':  raw_text.length * 60 * 1000 / char_per_minutes /* needs milliseconds */} )
  })

  return dialogs
}

function DrawCategoriesChart(dialogs) {
  fetch('assets/json/characters.json')
    .then(response => response.text())
    .then(function(text) {
      var characters = JSON.parse(text)
      // For each categories
      for( let cat in characters.categories) {
        var dialog_categories = SumDialogStatsCategories(SumDialogs(FilterDialogs(dialogs)), characters, cat)
        var id = 'stats-categories_' + cat
        if($("#" + id).length == 0) {
          $('#stats-categories').append( '<div id="' + id +'" class="charts"></div>' )
        }
        var chart_catergories = DrawChart(dialog_categories, id, cat)
      }
    })
}

function SumDialogStatsCategories( stats_in, characters, cat ) {
  let stats_out = {stats: [], colors:[]}
  stats_out.stats["undefined"] = 0
  stats_out.colors["undefined"] = "black"
  stats_in.group = []
  Object.keys(characters.categories[cat]).forEach(function(val){
    stats_out.stats[val] = 0
    stats_out.colors[val] = characters.categories[cat][val].color
    characters.categories[cat][val].series.forEach(function(val2){
        stats_in.group[val2.toUpperCase()] = val
    })
  })
  for (let k_character in stats_in.stats) {
    if (stats_out.stats[stats_in.group[k_character]] !== undefined) {
      stats_out.stats[stats_in.group[k_character]] = stats_out.stats[stats_in.group[k_character]] + stats_in.stats[k_character]
    } else {
      stats_out.stats[stats_in.group["undefined"]] = stats_out.stats[stats_in.group["undefined"]] + stats_in.stats[k_character]
    }
  }
  if ( stats_out.stats["undefined"] === 0 ) {
    delete stats_out.stats["undefined"]
    delete stats_out.colors["undefined"]
  }
  return stats_out
}

var DrawChart = function( series, id, title ) {
  if ( id === undefined ) id = 'stats-characters'
  if ( title === undefined ) title = 'characters'
  var unit = $('#unit').val()
  var type = unit === 'time' ? 'datetime' : 'linear'
  var chart = Highcharts.chart(id, {
      chart: {
          type: 'bar',
          height: 200 + Object.values(series.colors).length * 30
      },
      title: {
          text: 'Dialog Stats per ' + title
      },
      xAxis: {
          categories: Object.keys(series.colors),
          title: {
              text: false
          },
      },
      yAxis: {
          type: type,
          dateTimeLabelFormats: {
            millisecond: '%%M:%S',
            second: '%M:%S',
            minute: '%M:%S',
            hour: '%M:%S',
            day: '%M:%S',
            week: '%M:%S',
            month: '%M:%S',
            year: '%M:%S'
          },
          min: 0,
          title: {
              text: false,
              align: 'high'
          },
          labels: {
              overflow: 'justify'
          }
      },
      legend: {
        enabled: false
      },
      plotOptions: {
          bar: {
              dataLabels: {
                  enabled: true
              },
              colorByPoint : true,
              colors: Object.values(series.colors)
          },
          series: {
            dataLabels: {
              formatter: function() {
                let val = unit === 'time' ? msToHMS(this.y) : this.y
                return val
              }
            },
            animation: {
              duration: false
            }
          }
      },
      credits: {
          enabled: false
      },
      tooltip: {
        enabled: false
      },
      series: [{data:Object.values(series.stats)}]
  })
  return chart
}

var DrawChartSequence = function( dialogs ) {
  var data = []
  var characters = []
  var previous = 0
  var i = 0
  var x = 0
  var unit = $('#unit').val()
  dialogs.forEach(function(line) {
	  if ( characters[line.character] === undefined ) {
      characters[line.character] = { 'idx': i, 'color': line.color}
      i = i + 1
    }
	  let x2 = unit === 'lines' ? x + 1 : unit === 'time' ? x + line.time : x + line.wordCount
	  data.push({'x': x, 'x2': x2, 'y': characters[line.character].idx, 'text': line.text})
	  x = x2
  })
  var type = unit === 'time' ? 'datetime' : 'linear'
  var chart = Highcharts.chart('stats-sequences', {
    chart: {
        type: 'xrange',
        zoomType: 'xy',
        panning: true,
        panKey: 'shift',
        height: Object.keys(characters).length * 30
    },
    xAxis: {
      type: type,
      dateTimeLabelFormats: {
        millisecond: '%%M:%S',
        second: '%M:%S',
        minute: '%M:%S',
        hour: '%M:%S',
        day: '%M:%S',
        week: '%M:%S',
        month: '%M:%S',
        year: '%M:%S'
      }
    },
    title: {
        text: 'Dialogs X-Range'
    },
    colors: Object.values(characters).map( a => a.color),
    yAxis: {
        title: {
            text: ''
        },
        categories: Object.keys(characters),
        reversed: true,
    },
    plotOptions: {
      xrange: {
        pointPadding: 0,
        groupPadding: 0,
        borderRadius: 0,
        borderWidth: 0,
        cursor: 'pointer'
      },
      series: {
        animation: {
          duration: false
        }
      },
    },
    series: [{
        data: data,
    }],
    credits: {
        enabled: false
    },
    legend: {
      enabled: false
    },
    tooltip: {
      formatter: function() {
        let val = unit === 'time' ? msToHMS(this.x2 - this.x) : this.x2 - this.x
        return '<strong>' + this.yCategory + '</strong> - ' + this.point.index + '<br>' + val + '<br>' + '<p>' + data[this.point.index].text + '</p>'
      }
    }
  })
}

function msToHMS( ms ) {
    // 1- Convert to seconds:
    var seconds = ms / char_per_minutes; // 1000 for english
    // 2- Extract hours:
    //var hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    var minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = Math.round(seconds % 60)

    minutes = ("0" + minutes).slice(-2)
    seconds = ("0" + seconds).slice(-2);

    return minutes + ':' + seconds
}

/* Cookie */
function setCookie(cname, cvalue, exdays) {
	if (exdays == null){ exdays = 15;}
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}
