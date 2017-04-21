var _ = require('lodash');

var module = require('ui/modules').get('vectormap');
var map_grouping = require('./map_grouping');

module.controller('VectormapController', function ($scope) {
  $scope.$watch('esResponse', function (resp) {
    if (!resp || !resp.aggregations) {
      $scope.data = null;
      return;
    }

    var geoCodeAggId = _.first(_.pluck($scope.vis.aggs.bySchemaName['segment'], 'id'));
    var geoCodAgg = _.first($scope.vis.aggs.bySchemaName['segment']);
    var metricsAgg = _.first($scope.vis.aggs.bySchemaName['metric']);
    var buckets = resp.aggregations[geoCodeAggId] && resp.aggregations[geoCodeAggId].buckets;

    $scope.filterField = geoCodAgg._opts.params.field;
    $scope.data = {};

    var grouping = map_grouping.get_grouping($scope.vis.params.mapType);

    if (grouping) {
      buckets.forEach(function (bucket) {
        if (bucket.key in grouping) {
          $(grouping[bucket.key]).each(function(index, group_member) {
            $scope.data[group_member] = metricsAgg.getValue(bucket)
            }
          );
        }
      });
    }
    else {
      buckets.forEach(function (bucket) {
        var prefix = $scope.vis.params.mapType === 'us_aea' ? 'US-' : '';
        $scope.data[prefix + bucket.key.toUpperCase()] = metricsAgg.getValue(bucket);
      });
    }
  });
});
