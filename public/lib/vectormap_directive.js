var _ = require('lodash');
var $ = require('jquery');
var numeral = require('numeral');

// jvectormap - version 2.0.3
require('plugins/vectormap/lib/jvectormap/jquery-jvectormap.min');
require('plugins/vectormap/lib/jvectormap/jquery-jvectormap.css');

var module = require('ui/modules').get('vectormap');
var map_grouping = require('./map_grouping');

module.directive('vectormap', function (Private, getAppState, courier) {
  function link (scope, element) {
    const pushFilter = Private(require('ui/filter_bar/push_filter'))(getAppState());

    function onSizeChange() {
      return {
        width: element.parent().width(),
        height: element.parent().height()
      };
    }

    function displayFormat(val) {
      var formats = {
        number: '0[.]0a',
        bytes: '0[.]0b',
        currency: '$0[.]00a',
        percentage: '0%'
      }

      return formats[val] || formats.number;
    }

    scope.$watch('data',function(){
      render();
    });

    scope.$watch('options',function(){
      render();
    });

    scope.$watch(onSizeChange, _.debounce(function () {
      render();
    }, 250), true);

    // Re-render if the window is resized
    angular.element(window).bind('resize', function(){
      render();
    });

    function build_map_options() {
      var map_options = {
        map: scope.options.mapType,
        regionStyle: { initial: { fill: '#8c8c8c' }},
        zoomOnScroll: scope.options.zoomOnScroll,
        backgroundColor: null,
        series: {
          regions: [{
            values: scope.data,
            scale: [scope.options.minColor, scope.options.maxColor],
            normalizeFunction: scope.options.normalizeFunction,
          }]
        }
      }

      if (scope.options.legendStyle != 'none') {
        map_options['series']['regions'][0]['legend'] =
          { vertical: (scope.options.legendStyle == 'vertical') };
      }

      return map_options;
    }

    function render() {
      element.css({
        height: element.parent().height(),
        width: '100%'
      });

      element.text('');

      // Remove previously drawn vector map
      $('.jvectormap-zoomin, .jvectormap-zoomout, .jvectormap-label').remove();

      require(['plugins/vectormap/lib/jvectormap/maps/map.' + scope.options.mapType], function () {
        var map_options = build_map_options();
          map_options.onRegionTipShow = function(event, el, code) {
            if (!scope.data) { return; }

            var count = _.isUndefined(scope.data[code]) ? 0 : scope.data[code];
            el.html(el.html() + ": " + numeral(count).format(displayFormat(scope.options.tipNumberFormat)));
          },
          map_options.onRegionClick = function(event, code) {
            if (!scope.$parent.filterField) {
              return;
            }
            courier.indexPatterns.getIds().then(function (indices) {
              const field = scope.$parent.filterField;
              const filter = {"match" : {}};

              var grouping = map_grouping.get_grouping(scope.options.mapType);

              if (grouping) {
                var group_name = map_grouping.get_group_by_region(grouping, code);
                filter.match[field] = group_name;
              }
              else if (scope.options.mapType === 'us_aea') {
                filter.match[field] = code.replace('US-', '');
              }
              else if (scope.options.mapType.match(/^us-/)) { // state map with counties
                var map = element.vectorMap('get', 'mapObject');
                filter.match[field] = map.getRegionName(code);
              }
              else {
                filter.match[field] = code;
              }

              for(var i = 0; i < indices.length; i++) {
                pushFilter(filter, false, indices[i]);
              }
            });
          }
        element.vectorMap(
          map_options
        );
      });
    }
  }

  return {
    restrict: 'E',
    scope: {
      data: '=',
      options: '='
    },
    link: link
  };
});
