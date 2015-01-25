/*globals define, jQuery */
/*jslint vars:true */

/**
 * @license angular-bootstrap-datetimepicker  version: 0.3.7
 * (c) 2013-2014 Knight Rider Consulting, Inc. http://www.knightrider.com
 * License: MIT
 */

/**
 *
 *    @author        Dale "Ducky" Lotts
 *    @since        2013-Jul-8
 */

(function (factory) {
  'use strict';
  /* istanbul ignore if */
  if (typeof define === 'function'  && /* istanbul ignore next */ define.amd) {
    define(['angular'], factory); // AMD
  } else {
    factory(window.angular); // Browser global
  }
}(function (angular) {
  'use strict';
  angular.module('ui.bootstrap.datetimepicker', [])
    .constant('dateTimePickerConfig', {
      dropdownSelector: null,
      minuteStep: 5,
      minView: 'minute',
      startView: 'day'
    })
    .directive('datetimepicker', ['$log', 'dateTimePickerConfig', function datetimepickerDirective($log, defaultConfig) {

      function DateObject() {

        this.dateValue = new Date().getTime();
        this.selectable = true;

        var validProperties = ['dateValue', 'display', 'active', 'selectable', 'past', 'future'];

        for (var prop in arguments[0]) {
          /* istanbul ignore else */
          //noinspection JSUnfilteredForInLoop
          if (validProperties.indexOf(prop) >= 0) {
            //noinspection JSUnfilteredForInLoop
            this[prop] = arguments[0][prop];
          }
        }
      }

      var validateConfiguration = function validateConfiguration(configuration) {
        var validOptions = ['startView', 'minView', 'minuteStep', 'dropdownSelector'];

        for (var prop in configuration) {
          //noinspection JSUnfilteredForInLoop
          if (validOptions.indexOf(prop) < 0) {
            throw ('invalid option: ' + prop);
          }
        }

        // Order of the elements in the validViews array is significant.
        var validViews = ['minute', 'hour', 'day', 'month', 'year'];

        if (validViews.indexOf(configuration.startView) < 0) {
          throw ('invalid startView value: ' + configuration.startView);
        }

        if (validViews.indexOf(configuration.minView) < 0) {
          throw ('invalid minView value: ' + configuration.minView);
        }

        if (validViews.indexOf(configuration.minView) > validViews.indexOf(configuration.startView)) {
          throw ('startView must be greater than minView');
        }

        if (!angular.isNumber(configuration.minuteStep)) {
          throw ('minuteStep must be numeric');
        }
        if (configuration.minuteStep <= 0 || configuration.minuteStep >= 60) {
          throw ('minuteStep must be greater than zero and less than 60');
        }
        if (configuration.dropdownSelector !== null && !angular.isString(configuration.dropdownSelector)) {
          throw ('dropdownSelector must be a string');
        }

        /* istanbul ignore next */
        if (configuration.dropdownSelector !== null && ((typeof jQuery === 'undefined') || (typeof jQuery().dropdown !== 'function'))) {
          $log.error('Please DO NOT specify the dropdownSelector option unless you are using jQuery AND Bootstrap.js. ' +
          'Please include jQuery AND Bootstrap.js, or write code to close the dropdown in the on-set-time callback. \n\n' +
          'The dropdownSelector configuration option is being removed because it will not function properly.');
          delete configuration.dropdownSelector;
        }
      };

      return {
        restrict: 'E',
        require: 'ngModel',
        template: '<div class="datetimepicker table-responsive">' +
        '<table class="table table-striped">' +
        '   <thead>' +
        '       <tr>' +
        '           <th class="left" data-ng-click="changeView(data.currentView, data.leftDate, $event)" data-ng-show="data.leftDate.selectable"><i class="fa fa-arrow-left"/></th>' +
        '           <th class="switch" colspan="5" data-ng-show="data.previousViewDate.selectable" data-ng-click="changeView(data.previousView, data.previousViewDate, $event)">{{ data.previousViewDate.display }}</th>' +
        '           <th class="right" data-ng-click="changeView(data.currentView, data.rightDate, $event)" data-ng-show="data.rightDate.selectable"><i class="fa fa-arrow-right"/></th>' +
        '       </tr>' +
        '       <tr>' +
        '           <th class="dow" data-ng-repeat="day in data.dayNames" >{{ day }}</th>' +
        '       </tr>' +
        '   </thead>' +
        '   <tbody>' +
        '       <tr data-ng-if="data.currentView !== \'day\'" >' +
        '           <td colspan="7" >' +
        '              <span    class="{{ data.currentView }}" ' +
        '                       data-ng-repeat="dateObject in data.dates"  ' +
        '                       data-ng-class="{active: dateObject.active, past: dateObject.past, future: dateObject.future, disabled: !dateObject.selectable}" ' +
        '                       data-ng-click="changeView(data.nextView, dateObject, $event)">{{ dateObject.display }}</span> ' +
        '           </td>' +
        '       </tr>' +
        '       <tr data-ng-if="data.currentView === \'day\'" data-ng-repeat="week in data.weeks">' +
        '           <td data-ng-repeat="dateObject in week.dates" ' +
        '               data-ng-click="changeView(data.nextView, dateObject, $event)"' +
        '               class="day" ' +
        '               data-ng-class="{active: dateObject.active, past: dateObject.past, future: dateObject.future, disabled: !dateObject.selectable}" >{{ dateObject.display }}</td>' +
        '       </tr>' +
        '   </tbody>' +
        '</table></div>',
        scope: {
          onSetTime: '&',
          beforeRender: '&'
        },
        replace: true,
        link: function link(scope, element, attrs, ngModelController) {

          var directiveConfig = {};

          if (attrs.datetimepickerConfig) {
            directiveConfig = scope.$parent.$eval(attrs.datetimepickerConfig);
          }

          var configuration = {};

          angular.extend(configuration, defaultConfig, directiveConfig);

          validateConfiguration(configuration);

          var startOfDecade = function startOfDecade(unixDate) {
            var startYear = (parseInt(Date.utc.create(unixDate).getFullYear() / 10, 10) * 10);
            return Date.utc.create(unixDate).beginningOfYear();
          };

          var dataFactory = {
            year: function year(unixDate) {
              var selectedDate = Date.utc.create(unixDate).beginningOfYear();
              // View starts one year before the decade starts and ends one year after the decade ends
              // i.e. passing in a date of 1/1/2013 will give a range of 2009 to 2020
              // Truncate the last digit from the current year and subtract 1 to get the start of the decade
              var startDecade = (parseInt(selectedDate.getFullYear() / 10, 10) * 10);
              var startDate = Date.utc.create(startOfDecade(unixDate)).addYears(-1).beginningOfYear();

              var activeYear = ngModelController.$modelValue ? Date.create(ngModelController.$modelValue).getFullYear() : 0;

              var result = {
                'currentView': 'year',
                'nextView': configuration.minView === 'year' ? 'setTime' : 'month',
                'previousViewDate': new DateObject({dateValue: null, display: startDecade + '-' + (startDecade + 9)}),
                'leftDate': new DateObject({dateValue: Date.utc.create(startDate).addYears(-9).valueOf()}),
                'rightDate': new DateObject({dateValue: Date.utc.create(startDate).addYears(11).valueOf()}),
                'dates': []
              };

              for (var i = 0; i < 12; i += 1) {
                var yearMoment = Date.utc.create(startDate).addYears(i);
                var dateValue = {
                  'dateValue': yearMoment.valueOf(),
                  'display': yearMoment.format('{year}'),
                  'past': yearMoment.getFullYear() < startDecade,
                  'future': yearMoment.getFullYear() > startDecade + 9,
                  'active': yearMoment.getFullYear() === activeYear
                };

                result.dates.push(new DateObject(dateValue));
              }

              return result;
            },

            month: function month(unixDate) {

              var startDate = Date.utc.create(unixDate).beginningOfYear();
              var previousViewDate = startOfDecade(unixDate);
              var activeDate = ngModelController.$modelValue ? Date.create(ngModelController.$modelValue).format('{year}-{Mon}') : 0;

              var result = {
                'previousView': 'year',
                'currentView': 'month',
                'nextView': configuration.minView === 'month' ? 'setTime' : 'day',
                'previousViewDate': new DateObject({
                  dateValue: previousViewDate.valueOf(),
                  display: startDate.format('{year}')
                }),
                'leftDate': new DateObject({dateValue: Date.utc.create(startDate).addYears(-1).valueOf()}),
                'rightDate': new DateObject({dateValue: Date.utc.create(startDate).addYears(1).valueOf()}),
                'dates': []
              };

              for (var i = 0; i < 12; i += 1) {
                var monthMoment = Date.utc.create(startDate).addMonths(i);
                var dateValue = {
                  'dateValue': monthMoment.valueOf(),
                  'display': monthMoment.format('{Mon}'),
                  'active': monthMoment.format('{year}-{Mon}') === activeDate
                };

                result.dates.push(new DateObject(dateValue));
              }

              return result;
            },

            day: function day(unixDate) {

              var selectedDate = Date.utc.create(unixDate);
              var startOfMonth = Date.utc.create(selectedDate).beginningOfMonth();
              var previousViewDate = Date.utc.create(selectedDate).beginningOfYear();
              var endOfMonth = Date.utc.create(selectedDate).endOfMonth();

              var startDate = Date.utc.create(startOfMonth).addDays(-1 * Math.abs(startOfMonth.getWeekday() + 1));

              var activeDate = ngModelController.$modelValue ? Date.create(ngModelController.$modelValue).format('{year}-{Mon}-{dd}') : '';

              var result = {
                'previousView': 'month',
                'currentView': 'day',
                'nextView': configuration.minView === 'day' ? 'setTime' : 'hour',
                'previousViewDate': new DateObject({
                  dateValue: previousViewDate.valueOf(),
                  display: startOfMonth.format('{year}-{Mon}')
                }),
                'leftDate': new DateObject({dateValue: Date.utc.create(startOfMonth).addMonths(-1).valueOf()}),
                'rightDate': new DateObject({dateValue: Date.utc.create(startOfMonth).addMonths(1).valueOf()}),
                'dayNames': [],
                'weeks': []
              };


              for (var dayNumber = 0; dayNumber < 7; dayNumber += 1) {
                result.dayNames.push(Date.utc.create(Date.utc.create().setWeekday(dayNumber)).format('{Dow}').substring(0, 2));
              }

              for (var i = 0; i < 6; i += 1) {
                var week = {dates: []};
                for (var j = 0; j < 7; j += 1) {
                  var monthMoment = Date.utc.create(startDate).addDays((i * 7) + j);
                  var dateValue = {
                    'dateValue': monthMoment.valueOf(),
                    'display': monthMoment.format('{d}'),
                    'active': monthMoment.format('{year}-{Mon}-{dd}') === activeDate,
                    'past': monthMoment.isBefore(startOfMonth),
                    'future': monthMoment.isAfter(endOfMonth)
                  };
                  week.dates.push(new DateObject(dateValue));
                }
                result.weeks.push(week);
              }

              return result;
            },

            hour: function hour(unixDate) {
              var selectedDate = Date.utc.create(unixDate).beginningOfDay();
              var previousViewDate = Date.utc.create(selectedDate).beginningOfMonth();

              var activeFormat = ngModelController.$modelValue ? Date.create(ngModelController.$modelValue).format('{year}-{MM}-{dd} {H}') : '';

              var result = {
                'previousView': 'day',
                'currentView': 'hour',
                'nextView': configuration.minView === 'hour' ? 'setTime' : 'minute',
                'previousViewDate': new DateObject({
                  dateValue: previousViewDate.valueOf(),
                  display: selectedDate.format('{Mon} {d}, {year}')
                }),
                'leftDate': new DateObject({dateValue: Date.utc.create(selectedDate).addDays(-1).valueOf()}),
                'rightDate': new DateObject({dateValue: Date.utc.create(selectedDate).addDays(1).valueOf()}),
                'dates': []
              };

              for (var i = 0; i < 24; i += 1) {
                var hourMoment = Date.utc.create(selectedDate).addHours(i);
                var dateValue = {
                  'dateValue': hourMoment.valueOf(),
                  'display': hourMoment.format('{h}:{mm} {TT}'),
                  'active': hourMoment.format('{year}-{MM}-{dd} {H}') === activeFormat
                };

                result.dates.push(new DateObject(dateValue));
              }

              return result;
            },

            minute: function minute(unixDate) {
              var selectedDate = Date.utc.create(unixDate).set({minutes: 0, seconds: 0, milliseconds: 0});
              var previousViewDate = Date.utc.create(selectedDate).beginningOfDay();
              var activeFormat = ngModelController.$modelValue ? Date.create(ngModelController.$modelValue).format('{year}-{MM}-{dd} {H}:{mm}') : '';

              var result = {
                'previousView': 'hour',
                'currentView': 'minute',
                'nextView': 'setTime',
                'previousViewDate': new DateObject({
                  dateValue: previousViewDate.valueOf(),
                  display: selectedDate.format('{Mon} {d}, {year} {h}:{mm} {TT}')
                }),
                'leftDate': new DateObject({dateValue: Date.utc.create(selectedDate).addHours(-1).valueOf()}),
                'rightDate': new DateObject({dateValue: Date.utc.create(selectedDate).addHours(1).valueOf()}),
                'dates': []
              };

              var limit = 60 / configuration.minuteStep;

              for (var i = 0; i < limit; i += 1) {
                var hourMoment = Date.utc.create(selectedDate).addMinutes(i * configuration.minuteStep);
                var dateValue = {
                  'dateValue': hourMoment.valueOf(),
                  'display': hourMoment.format('{h}:{mm} {TT}'),
                  'active': hourMoment.format('{year}-{MM}-{dd} {H}:{mm}') === activeFormat
                };

                result.dates.push(new DateObject(dateValue));
              }

              return result;
            },

            setTime: function setTime(unixDate) {
              var tempDate = new Date(unixDate);
              var newDate = new Date(tempDate.getTime() + (tempDate.getTimezoneOffset() * 60000));

              var oldDate = ngModelController.$modelValue;
              ngModelController.$setViewValue(newDate);

              if (configuration.dropdownSelector) {
                jQuery(configuration.dropdownSelector).dropdown('toggle');
              }

              scope.onSetTime({newDate: newDate, oldDate: oldDate});

              return dataFactory[configuration.startView](unixDate);
            }
          };

          var getUTCTime = function getUTCTime(modelValue) {
            var tempDate = (modelValue ? Date.create(modelValue) : new Date());
            return tempDate.getTime() - (tempDate.getTimezoneOffset() * 60000);
          };

          scope.changeView = function changeView(viewName, dateObject, event) {
            if (event) {
              event.stopPropagation();
              event.preventDefault();
            }

            if (viewName && (dateObject.dateValue > -Infinity) && dateObject.selectable && dataFactory[viewName]) {
              var result = dataFactory[viewName](dateObject.dateValue);

              var weekDates = [];
              if (result.weeks) {
                for (var i = 0; i < result.weeks.length; i += 1) {
                  var week = result.weeks[i];
                  for (var j = 0; j < week.dates.length; j += 1) {
                    var weekDate = week.dates[j];
                    weekDates.push(weekDate);
                  }
                }
              }

              scope.beforeRender({
                $view: result.currentView,
                $dates: result.dates || weekDates,
                $leftDate: result.leftDate,
                $upDate: result.previousViewDate,
                $rightDate: result.rightDate
              });

              scope.data = result;
            }
          };

          ngModelController.$render = function $render() {
            scope.changeView(configuration.startView, new DateObject({dateValue: getUTCTime(ngModelController.$viewValue)}));
          };
        }
      };
    }]);
}));
