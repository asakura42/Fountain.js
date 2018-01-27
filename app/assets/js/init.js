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

// workspace
var $dock       = $(document.getElementById('dock'))
  , $workspace  = $(document.getElementById('workspace'))
  , $title      = $(document.getElementById('script-title'))
  , $navigation = $(document.getElementById('navigation'))
  , $toolbar    = $(document.getElementById('toolbar'))
  , $toolbar    = $(document.getElementById('toolbar'))
  , $script     = $(document.getElementById('script')).addClass('us-letter').addClass('dpi' + '100')
  , $backdrop   = $(document.createElement('div')).addClass('backdrop')

fetch(filename)
.then(response => response.text())
.then(text =>
    fountain.parse(text, true, function (result) {
    if (result) {
      if (result.title && result.html.title_page) {
        $script.append(page(result.html.title_page, 'title-page'))
        $title.html(result.title || 'Untitled')
      }
      // toc
      $script.append(page('<h2>Table des Matières</h2><h3>Sequences</h3><ol id="toc"></ol><h3>Stats</h3><ol id="toc-stats"><li><a href="#stats">Characters</a><li><a href="#stats-sequences">X-Range</a></li></ol>', 'toc-page'))

      // script
      $script.append(page(result.html.script, 'script-page'))

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
              <option value="words" selected>Words</option>
           </select>
           </div>
        </div>
        <div id="stats"></div>
        <div id="stats-sequences"></div>`)
      )

      var filterElm = $('#filter')
      $('.script-page h3').each(function(){
        filterElm.append('<option value=' + $(this).data('index') +'>' + $(this).data('index') + '. ' + $(this).text() + '</option>')
      })

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

      $('#filter, #unit').change(function(){
        chart = DrawChart(SumDialogs(FilterDialogs(dialogs)))
        chartSeq = DrawChartSequence(FilterDialogs(dialogs))
      })

      var chartSeq = DrawChartSequence(dialogs)

      $workspace.fadeIn()
      document.title = result.title
    }
  })
)

var SumDialogs = function( dialogs ) {
  var charactersStats = []
  var charactersColor = []

  var unit = $('#unit').val()
  //
  dialogs.forEach(function(line) {
    if( unit === "lines" ) {
      charactersStats[line.character] = charactersStats[line.character] === undefined ? 1 : charactersStats[line.character] + 1
    } else {
      charactersStats[line.character] = charactersStats[line.character] === undefined ? line.wordCount : charactersStats[line.character] + line.wordCount
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
    let character = $(this).children('h4').text().replace(' (SUITE)', '' )
    let wordCount = $(this).children('p').text().trim().replace('/\s+/gi', ' ').split(' ').length;
    dialogs.push( {'character': character, 'wordCount': wordCount, 'sequence': $(this).data('seqindex'), 'color': $(this).children('h4').css("color"), 'text':  $(this).children('p').text().trim() } )
  })

  return dialogs
}

var DrawChart = function( series ) {
  var chart = Highcharts.chart('stats', {
      chart: {
          type: 'bar'
      },
      title: {
          text: 'Dialog Stats per Character'
      },
      xAxis: {
          categories: Object.keys(series.colors),
          title: {
              text: false
          }
      },
      yAxis: {
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
          }
      },
      credits: {
          enabled: false
      },
      tooltip: {
        enabled: false
      },
      series: [{data:Object.values(series.stats)}]
  });
  return chart;
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
	  let x2 = unit === 'lines' ? x + 1 : x + line.wordCount
	  data.push({'x': x, 'x2': x2, 'y': characters[line.character].idx, 'text': line.text})
	  x = x2
  })
  var chart = Highcharts.chart('stats-sequences', {
    chart: {
        type: 'xrange',
        zoomType: 'xy'
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
      }
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
        return '<strong>' + this.yCategory + '</strong> - ' + this.point.index + '<br/>' + '<p>' + data[this.point.index].text + '</p>'
      }
    }
  })
}
