// Get HTML File Name
let url = window.location.pathname
let filename = url.substring(url.lastIndexOf('/') + 1)
// Get Foutain Name
filename = filename.replace('html', 'fountain')

var page = function (html, isTitlePage) {
  var $output = $(document.createElement('div')).addClass('page').html(html)
  if (isTitlePage) {
    $output.addClass('title-page')
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
        $script.append(page(result.html.title_page, true))
        $title.html(result.title || 'Untitled')
      }
      // toc
      $script.append(page('<h2>Table des Matières</h2><ol id="toc"></ol>'))

      // script
      $script.append(page(result.html.script))

      // Table of Content
      let sequencesTitles = $('.page h3')
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
        <div id="stats-filer">
           <label for="filter">Sequence: </label>
           <select id="filter">
              <option value="0" selected>All</option>
           </select>
           <label for="unit">Unit: </label>
           <select id="unit">
              <option value="lines" selected>Lines</option>
              <option value="words">Words</option>
           </select>
        </div>
        <div id="stats"></div>`)
      )

      var filterElm = $('#filter')
      $('h3').each(function(){
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

      var chart = DrawChart(AnalyseDialogs())

      $('#filter, #unit').change(function(){
        chart = DrawChart(AnalyseDialogs())
      })

      $workspace.fadeIn()
      document.title = result.title
    }
  })
)

var AnalyseDialogs = function() {
  var charactersStats = []
  var charactersColor = []

  var scriptDialogLines = [] // X-range

  var idx = $('#filter').val()
  var unit = $('#unit').val()
  if ( idx === '0' ) {
    $('.dialogue').each(function(){
      let character = $(this).children('h4').text().replace(' (SUITE)', '' )
      if( unit === "lines" ) {
        charactersStats[character] = charactersStats[character] === undefined ? 1 : charactersStats[character] + 1
      } else {
        let wordCount = $(this).children('p').text().trim().replace('/\s+/gi', ' ').split(' ').length;
        charactersStats[character] = charactersStats[character] === undefined ? wordCount : charactersStats[character] + wordCount
      }
      charactersColor[character] = $(this).children('h4').css("color")
      let wordCount = $(this).children('p').text().trim().replace('/\s+/gi', ' ').split(' ').length; // Redudant
      scriptDialogLines.push( {'character': character, 'wordCount': wordCount, 'sequence': this.dataset.seqindex} )
    })
  } else {
    $( '.dialogue[data-seqindex="' + idx + '"]').each(function(){
      let character = $(this).children('h4').text().replace(' (SUITE)', '' )
      if( unit === "lines" ) {
        charactersStats[character] = charactersStats[character] === undefined ? 1 : charactersStats[character] + 1
      } else {
        let wordCount = $(this).children('p').text().trim().replace('/\s+/gi', ' ').split(' ').length;
        charactersStats[character] = charactersStats[character] === undefined ? wordCount : charactersStats[character] + wordCount
      }
      charactersColor[character] = $(this).children('h4').css("color")
    })
  }
  stats = {'stats': charactersStats, 'colors': charactersColor}
  console.log(scriptDialogLines)
  return stats
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


/*
var DrawChartSequence = function( series ) {
  var chart = Highcharts.chart('stats-sequences', {
    chart: {
        type: 'xrange'
    },
    title: {
        text: 'Highcharts X-range'
    },
    yAxis: {
        title: {
            text: ''
        },
    },
    series: [{
        borderColor: 'gray',
        pointWidth: 80,
        data: [{
            x: 0,
            x2: 150,
            y: 0
        }, {
            x: 150,
            x2: 200,
            y: 1
        }],
        dataLabels: {
            enabled: true
        }
    }]
  });
}
*/
