/*globals angular, $, console*/

angular.module('demo.demoController', [])
  .controller('demoController', [
    '$scope',
    function ($scope) {
      'use strict';
      $scope.controllerName = 'demoController';

      $scope.data = {
        guardians: [
          {
            name: 'Peter Quill',
            dob: null
          },
          {
            name: 'Groot',
            dob: null
          }
        ]
      };

      $scope.checkboxOnTimeSet = function () {
        $scope.data.checked = false;
      };

      $scope.inputOnTimeSet = function (newDate) {
        // If you are not using jQuery or bootstrap.js,
        // this will throw an error.
        // However, can write this function to take any
        // action necessary once the user has selected a
        // date/time using the picker
        console.log(newDate);
        $('#dropdown3').dropdown('toggle');
      };

      $scope.getLocale = function () {
        return Date.getLocale().code;
      };

      $scope.setLocale = function (newLocale) {
        Date.setLocale(newLocale);
      };


      $scope.guardianOnSetTime = function ($index, guardian, newDate, oldDate) {
        console.log($index);
        console.log(guardian.name);
        console.log(newDate);
        console.log(oldDate);
        angular.element('#guardian' + $index).dropdown('toggle');
      };

      $scope.beforeRender = function ($dates) {
        var index = Math.floor(Math.random() * $dates.length);
        console.log(index);
        $dates[index].selectable = false;
      };

      $scope.config = {
        datetimePicker: {
          startView: 'year'
        }
      };

      $scope.configFunction = function configFunction() {
        return {startView: 'month'};
      };
    }
  ]);
