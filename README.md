# AngularJS Date & Time Picker

AngularJS datetime picker directive forked from [dalelotts](https://github.com/dalelotts/angular-bootstrap-datetimepicker)' repository with updated dependencies.

## Dependencies

* [AngularJS](https://angularjs.org/) v1.2.26+
* [Font Awesome](http://fortawesome.github.io/Font-Awesome/) v4.2.0 for calendar and arrow icons
* [Sugar](http://sugarjs.com/) v1.4.1 for date parsing and formatting
* [UI Bootstrap](http://angular-ui.github.io/bootstrap/) v0.12.0 for dropdowns
 
## Usage

1.  Include CSS

    ```html
    <link rel="stylesheet" href="bootstrap/dist/css/bootstrap.css">
    <link rel="stylesheet" href="components-font-awesome/css/font-awesome.css">
    <link rel="stylesheet" href="angular-bootstrap-datetimepicker/src/css/datetimepicker.css">
    ```

2.  Include JavaScript

    ```html
    <script type="text/javascript" src="angular/angular.js"></script>
    <script type="text/javascript" src="angular-bootstrap/ui-bootstrap-tpls.js"></script>
    <script type="text/javascript" src="sugar/release/sugar-full.development.js"></script>
    ```

3.  Add AngularJS module dependencies

    ```javascript
    angular.module('myApp', [
      'ui.bootstrap',
      'ui.bootstrap.datetimepicker'
    ]);
    ```

4.  Expose state object and `closeDropdown` method

    Given that we are no longer using Bootstrap.js, we must manually close the dropdown when the time is set.

    ```javascript
    angular.module('myApp').controller('myController', function($scope) {

        $scope.data = {};
        $scope.dropdownStates = {};

        $scope.closeDropdown = function(key) {
            $scope.dropdownStates[key] = false;
        };
    });
    ```

5.  Include markup

    ```html
    <div class="dropdown" data-dropdown data-is-open="dropdownStates.myState">
        <a data-dropdown-toggle role="button">
            <div class="input-group">
                <input type="text" class="form-control" data-ng-model="data.myModel">
                <span class="input-group-addon">
                    <i class="fa fa-calendar"></i>
                </span>
            </div>
        </a>
        <ul class="dropdown-menu" role="menu">
            <datetimepicker
                data-ng-model="data.myModel"
                data-on-set-time="closeDropdown('myState')">
            </datetimepicker>
        </ul>
    </div>
    ```

## Documentation

Visit [dalelotts/angular-bootstrap-datetimepicker](https://github.com/dalelotts/angular-bootstrap-datetimepicker) for complete documentation.

## License

angular-bootstrap-datetimepicker is freely distributable under the terms of the [MIT license](LICENSE).

## Donating

Support this project and other work by Dale Lotts via [gittip][gittip-dalelotts].

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
