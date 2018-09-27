// Get HTML File Name
var url = window.location.pathname
var filename = url.substring(url.lastIndexOf('/') + 1)

// Get Foutain Name
filename = filename.replace('html', 'fountain')

var timemout_run = false

var page = function (html, className, id) {
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
  if (id) {
    $output.attr('id', id)
  }
  return $output
}

$('#fountain-js').prepend(`<section id="workspace">
      <header class="toolbar">
      </header>
      <div id="script"></div>
    </section>`)

var counter = 0
var prev_text = ''

// workspace
var $body       = $(document.getElementById('fountain-js'))
  , $dock       = $(document.getElementById('dock'))
  , $workspace  = $(document.getElementById('workspace'))
  , $title      = $(document.getElementById('script-title'))
  , $navigation = $(document.getElementById('navigation'))
  , $script     = $(document.getElementById('script')).addClass('us-letter').addClass('dpi' + '100')

var cookie = {}

cookie.script_visible = getCookie("script_visible");

var characters = {}

var refresh
$(document).ready(function(){
  AddToolbarButtons()
  if (filename.substr(filename.length - 8) === "fountain") { // If has be init form /app/ url
    ParseCharacters()
  } else {
    RenderDragAndDrop()
  }
})

function ParseCharacters() {
  fetch('json/characters.json')
    .then(response => response.text())
    .then(function(text) {
     if( text ) {
        characters = JSON.parse(text)
      }
  }).then(function(){
      ParserAndPrint()
      refresh = setInterval(ParserAndPrint, 1000)
    }).catch(function(error){
    // console.log("No characters.json detected", error)
  })
}

function AddToolbarButtons() {
  let toolbar_header = $('header.toolbar')
  let content = `
  <div class="container">
    <ul id="inspector">
    <li></li>
    </ul>

    <p id="script-title">Responsive Fountain Screenplay with Dialog Analyses</p>



  <ul id="toolbar">
    <li id="button-resize">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M500 384c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H12c-6.6 0-12-5.4-12-12V76c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v308h436zm-308-44v-72c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v72c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm192 0V204c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v136c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm-96 0V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v200c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm192 0V108c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v232c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12z"/>
      </svg>
      <span>Resize Script</span>
    </li>
    <li id="button-theme">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M274.835 12.646l25.516 62.393c4.213 10.301 16.671 14.349 26.134 8.492l57.316-35.479c15.49-9.588 34.808 4.447 30.475 22.142l-16.03 65.475c-2.647 10.81 5.053 21.408 16.152 22.231l67.224 4.987c18.167 1.348 25.546 24.057 11.641 35.826L441.81 242.26c-8.495 7.19-8.495 20.289 0 27.479l51.454 43.548c13.906 11.769 6.527 34.478-11.641 35.826l-67.224 4.987c-11.099.823-18.799 11.421-16.152 22.231l16.03 65.475c4.332 17.695-14.986 31.73-30.475 22.142l-57.316-35.479c-9.463-5.858-21.922-1.81-26.134 8.492l-25.516 62.393c-6.896 16.862-30.774 16.862-37.67 0l-25.516-62.393c-4.213-10.301-16.671-14.349-26.134-8.492l-57.317 35.479c-15.49 9.588-34.808-4.447-30.475-22.142l16.03-65.475c2.647-10.81-5.053-21.408-16.152-22.231l-67.224-4.987c-18.167-1.348-25.546-24.057-11.641-35.826L70.19 269.74c8.495-7.19 8.495-20.289 0-27.479l-51.454-43.548c-13.906-11.769-6.527-34.478 11.641-35.826l67.224-4.987c11.099-.823 18.799-11.421 16.152-22.231l-16.03-65.475c-4.332-17.695 14.986-31.73 30.475-22.142l57.317 35.479c9.463 5.858 21.921 1.81 26.134-8.492l25.516-62.393c6.896-16.861 30.774-16.861 37.67 0zM392 256c0-74.991-61.01-136-136-136-74.991 0-136 61.009-136 136s61.009 136 136 136c74.99 0 136-61.009 136-136zm-32 0c0 57.346-46.654 104-104 104s-104-46.654-104-104 46.654-104 104-104 104 46.654 104 104z"/>
      </svg>
      <span>Toggle Theme</span>
    </li>
    <li id="button-fullwidth">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M377.941 169.941V216H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.568 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296h243.882v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.568 0-33.941l-86.059-86.059c-15.119-15.12-40.971-4.412-40.971 16.97z"/>
      </svg>
      <span>Full Width</span>
    </li>
  </ul>
  </div>
  `
  toolbar_header.html(content)
  let $toolbar    = $(document.getElementById('toolbar'))
  //$('#script-title').html( document.title )
  $title      = $(document.getElementById('script-title'))

  $toolbar.find('#button-resize').on('click', function () {
    $('.title-page, .toc-page, .script-page').fadeToggle(400, function(){
      let val = cookie.script_visible === 'false'? 'true' : 'false';
       setCookie("script_visible", val );
    })
  });

  cookie.dark_theme = getCookie("dark_theme");
  if( cookie.dark_theme === 'true') $body.addClass('dark-theme')
  $toolbar.find('#button-theme').on('click', function () {
    $body.toggleClass('dark-theme')
    setCookie("dark_theme", $body.hasClass('dark-theme') );
  });

  cookie.full_width = getCookie("full_width");
  if( cookie.full_width === 'true') $script.addClass('full_width')
  $toolbar.find('#button-fullwidth').on('click', function () {
    $script.toggleClass('full_width')
    window.dispatchEvent(new Event('resize'))
    setCookie("full_width", $script.hasClass('full_width') )
  });
}

cookie.char_per_minutes = getCookie("characters_per_minutes") ? getCookie("characters_per_minutes") : 1300;

var ParserAndPrint = function () {
  counter++
  fetch(filename)
  .then(function(response){
    if (response.status !== 404) {
      // console.log('response', response)
      return response.text()
    }
  })
  .then(text =>
    PrintFountainText( text )
  ).catch(function(error) {
    RenderDragAndDrop()
  });
};

var RenderDragAndDrop = function() {
  clearTimeout(refresh)
    let html = `
      <section id="dock">
        <div class="container">
          <div id="file-api">
            <p>To parse a <a href="http://www.fountain.io">Fountain</a> screenplay document,<br/>simply drag the file into this box.</p>
          </div>
        </div>
      </section>`
    $(html).insertAfter($workspace)
    $workspace.fadeIn()

    $('#file-api').fadeIn()
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
          $('#file-api').hide()

            PrintFountainText(evt.target.result)

        }

        reader.readAsText(file);
      }
    };
    $(document.getElementById('file-api')).fadeIn().on('dragleave', dragLeave).on('dragover', dragOver).on('drop', loadScript);
}

function PrintFountainText( text ) {
	// Process text
  text = text.replace(/(\w)( )([!\?:;%»]|&raquo;)/gmi, '$1 $3') // Add French non breaking space

  fountain.parse(text, true, function (result) {
    if (result && text !== prev_text) {
      prev_text = text
      if (result.title && result.html.title_page) {
        if ( ! $('.title-page').length )
            $script.append(page(result.html.title_page, 'title-page'))
        $title.html(result.title || 'Untitled')
      }

      document.title = result.title

      $('#doc').hide()

      // toc
      if ( ! $('.toc-page').length )
        $script.append(page('<h2>Table des Matières</h2><h3>Sequences</h3><ol id="toc"></ol><h3>Stats</h3><ol><li><a href="#page-stats">Characters</a><li><a href="#stats-sequences">X-Range</a></li></ol>', 'toc-page'))

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
       <div class="filter-field filter-characters-er-minutes">
               <label for="unit">Characters per Minutes: </label>
               <input type="number" min="1" max="9999" id="characters_per_minutes" value="1300" maxlength="4" size="1">
             </div>
          </div>
          <div id="stats-characters" class="charts"></div>
          <div id="stats-sequences" class="charts"></div>
          <div id="stats-categories" class="charts"></div>`, 'stats-page', 'page-stats')
        )
    $('#characters_per_minutes').val(cookie.char_per_minutes)
    $('#characters_per_minutes').on('keyup click', function(){
      let val = $(this).val()
      if (val.length > 4) {
      val = val.slice(0,4)
      $(this).val( val );
      }
      cookie.char_per_minutes = val
      setCookie("characters_per_minutes", val )
      var dialogs = AnalyseDialogs()
      chart = DrawChart(SumDialogs(FilterDialogs(dialogs)))
      chartSeq = DrawChartSequence(FilterDialogs(dialogs))
      DrawCategoriesChart(dialogs)
    })
      var filterElm = $('#filter')
      let sequence_init_val = filterElm.val()
      filterElm.html('<option value="0" selected>All</option>')
      $('.script-page h3').each(function(){
        filterElm.append('<option value=' + $(this).data('index') +'>' + $(this).data('index') + '. ' + $(this).text() + '</option>')
      })
      filterElm.val(sequence_init_val)
      if ( filterElm.val() === null ) filterElm.val( 0 )

      $('.dialogue').each(function(){
        let character = $(this).children('h4').text().replace(' (SUITE)', '' ).toLowerCase()
        let color = characters.characters && characters.characters[character] !== undefined && characters.characters[character].color !== undefined ? characters.characters[character].color : "#7d7d7d"
        $(this).children('h4').css('color', color)
        $(this).addClass(character) // Add character name as class of character dialog titles
      })

      $('.dialogue').each(function(){
        var h3 = $(this).prevAll( 'h3:first' )
        this.dataset.seqindex = h3.data('index')
      })

      var dialogs = AnalyseDialogs()

      var chart = DrawChart(SumDialogs(FilterDialogs(dialogs)))
      var chartSeq = DrawChartSequence(FilterDialogs(dialogs))

      $('#stats-sequences').after('<button id="export-csv">REAPER CSV Export</button>')

      DrawCategoriesChart(dialogs)

      $('#filter, #unit').change(function(){
        chart = DrawChart(SumDialogs(FilterDialogs(dialogs)))
        chartSeq = DrawChartSequence(FilterDialogs(dialogs))
        $('#stats-sequences').after('<button id="export-csv">REAPER CSV Export</button>')
        DrawCategoriesChart(dialogs)
      })

      $button_export_csv = $(document.getElementById('export-csv'))
      $button_export_csv.on('click', function () {
        dialogs = AnalyseDialogs()
        let csv = DialogsToCSV(dialogs)
        downloadCSV( csv )
      })

      if ( counter === 1 ) {
        $workspace.fadeIn()
        if( cookie.script_visible === 'false'){
          $('.title-page, .toc-page, .script-page').hide()
        };
      }

      let anchor = '#' + document.URL.split('#')[1]
      scrollTo( $( anchor ) )

      $('.dialogue p').on('click', function () {
        $(this).toggleClass('clicked')
        copyToClipboard( $(this).text() )
      });


    }
  })
}

var SumDialogs = function( dialogs ) {
  var charactersStats = {}
  var charactersColor = {}

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
    dialogs.push( {'character': character, 'wordCount': wordCount, 'sequence': $(this).data('seqindex'), 'color': $(this).children('h4').css("color"), 'text':  raw_text, 'time':  raw_text.length * 60 * 1000 / cookie.char_per_minutes /* needs milliseconds */} )
  })

  return dialogs
}

function DrawCategoriesChart(dialogs) {
  // For each categories
  for( let cat in characters.categories) {
    var dialog_categories = SumDialogStatsCategories(SumDialogs(FilterDialogs(dialogs)), characters, cat)
    var id = 'stats-categories_' + cat
    if($("#" + id).length == 0) {
      $('#stats-categories').append( '<div id="' + id +'" class="charts"></div>' )
    }
    var chart_catergories = DrawChart(dialog_categories, id, cat, true)
  }
}

function SumDialogStatsCategories( stats_in, characters, cat ) {
  stats_in.stats = sortPropertiesByValue(stats_in.stats)
  let stats_out = {stats: {}, colors:{}}
  stats_out.stats["undefined"] = 0
  stats_out.colors["undefined"] = "#7d7d7d"
  // Old code which need to be cleaned
  stats_in.group = {}
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
  // End of old code
  stats_out.stats = []
  for (let k_character in stats_in.stats) {
    let array = {}
    array["name"] = k_character
    array["data"] = []
    let set = false
    Object.keys(characters.categories[cat]).forEach(function(val){
      value = 0
      if( characters.categories[cat][val].series.includes(k_character.toLowerCase()) ) {
        value = stats_in.stats[k_character]
        set = true
      }
      array["data"].push( value )
    })
    if ( set === false ) { array["data"].unshift( stats_in.stats[k_character] ) } else { array["data"].unshift( 0 ) }
    array["color"] = stats_in.colors[k_character]
    // If not set, then add value to the undefined cat name, else, add 0 to the undefined cat name
    stats_out.stats.push(array)
  }
  if ( stats_out.stats["undefined"] === 0 ) {
    delete stats_out.stats["undefined"]
    delete stats_out.colors["undefined"]
  }
  return stats_out
}

function sortPropertiesByValue(obj) {
  obj = sortProperties(obj)
  var arr = {}
  for( let key in obj ) {
    arr[key] = obj[key]
  }
  var arr2 = {}
  for( let key in arr ) {
    arr2[obj[key][0]] = obj[key][1]
  }
  return arr2
}

function sortProperties(obj) {
  // convert object into array
  var sortable=[]
  for(var key in obj)
    if(obj.hasOwnProperty(key))
      sortable.push([key, obj[key]]) // each item is an array in format [key, value]

  // sort items by value
  sortable.sort(function(a, b) {
    return a[1]-b[1] // compare numbers
  })
  return sortable // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

var DrawChart = function( series, id, title, is_category ) {
  let array, stacking, colorByPoint
  if ( is_category ) {
    array = series.stats
    stacking = 'normal'
  } else {
    array = [{data:Object.values(series.stats)}]
    stacking = null
    colorByPoint = true
  }
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
          },
          stackLabels: {
            enabled: is_category,
            formatter: function() {
              return unit === 'time' ? msToHMS(this.total)
                      :               this.total
            },
            y: 30,
            align: 'left'
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
              colorByPoint : colorByPoint,
              colors: Object.values(series.colors),
              borderWidth: 0
          },
          series: {
            dataLabels: {
              formatter: function() {
                name = this.y > 0 ? this.series.name : ''
                return is_category ? name
                        : unit === 'time' ? msToHMS(this.y)
                        :               this.y
              }
            },
            animation: {
              duration: false
            },
            stacking: 'normal'
          }
      },
      credits: {
          enabled: false
      },
      tooltip: {
        formatter: function () {
          let val = unit === 'time' ? msToHMS(this.y) : this.y
          let str = ''
          if ( is_category ) {
            str = '<strong>' + this.series.name + '</strong><br>' + val + '<br>' + Math.round(this.percentage) + '% of ' + this.key
          } else {
            let total = 0
            this.series.data.forEach(function(obj){
              total += obj.y
            })
            str = Math.round(this.y / total * 100 ) + '% of total'
          }
          return str
        }
      },
      series: array
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
    var seconds = ms / cookie.char_per_minutes; // 1000 for english
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

// https://wprock.fr/blog/smooth-scrolling-jquery/
function scrollTo( target ) {
  if( target.length ) {
    $("html, body").stop().animate( { scrollTop: target.offset().top - 80}, 400);
  }
}

function copyToClipboard( str ) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return str;
};

function DialogsToCSV( dialogs ) {
  let csv = []
  csv[0] = ['#,Name,Start,End,Length,Color'] // Header
  let start_time = 0
  dialogs.forEach(function(entry, i){
    line = []
    line[0] = 'R' + i
    line[1] = '"' + entry.text + '"'
    line[2] = start_time // start
    end_time = start_time + entry.time / 1000
    line[3] = end_time // end
    line[4] = entry.time / 1000 // length
    line[5] = rgb2hex(entry.color) // length
    csv.push(line.join())
    start_time = end_time
  })
  return csv.join('\n')
}

// https://stackoverflow.com/questions/1740700/how-to-get-hex-color-value-rather-than-rgb-value
function rgb2hex(rgb) {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
  function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2)
  }
  return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3])
}

// Download - https://stackoverflow.com/questions/17564103/using-javascript-to-download-file-as-a-csv-file
function downloadCSV( csv ) {
  var downloadLink = document.createElement("a")
  var blob = new Blob(["\ufeff", csv])
  var url = URL.createObjectURL(blob)
  downloadLink.href = url
  downloadLink.download = document.title + ".csv"

  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
}
