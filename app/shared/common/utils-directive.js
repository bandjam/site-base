
angular.module('app.utils.directive', [
    'app.common.globals'
])

// On esc event
.directive('onEsc', function() {
  return function(scope, elm, attr) {
    elm.bind('keydown', function(e) {
      if (e.keyCode === 27) {
        scope.$apply(attr.onEsc);
      }
    });
  };
})

// On enter event
.directive('onEnter', function() {
  return function(scope, elm, attr) {
    elm.bind('keypress', function(e) {
      if (e.keyCode === 13) {
        scope.$apply(attr.onEnter);
      }
    });
  };
})

.directive('stopEvent', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            element.bind('click', function (e) {
                e.stopPropagation();
            });
        }
    };
 })

//========================================================================================
// This will set default image and substitutes original image if it is loaded successfully
// Usage: <img actual-src="{{url}}" ng-src="default.jpg"/>
// =======================================================================================
.directive('actualSrc', [ 'API', function (API) {
    return{
        link: function postLink(scope, element, attrs) {
            attrs.$observe('actualSrc', function(newVal, oldVal){
                 if(newVal != undefined){
                    if (attrs.actualSrc != "") {
                      var src = attrs.actualSrc;
                      var ext = src.split('.').pop();
                      var file = src.slice(0, src.length - (ext.length + 1));
                      var actualSrc = API + file + '_small.' + ext;
                      var img = new Image();
                      img.src = actualSrc;
                      angular.element(img).bind('load', function () {
                        element.attr("src", actualSrc);
                      });
                    }
                 }
            });
 
        }
    }
}])

.directive('inlineEdit', [ '$timeout', 'directory', function($timeout, directory) {
  return {
    scope: {
      model: '=inlineEdit',
      handleSave: '&onSave',
      handleCancel: '&onCancel'
    },
    link: function(scope, elm, attr) {
      var previousValue;
      
      scope.edit = function() {
        scope.editMode = true;
        previousValue = scope.model;
        
        $timeout(function() {
          elm.find('input')[0].focus();
        }, 0, false);
      };
      scope.save = function() {
        scope.editMode = false;
        scope.handleSave({value: scope.model});
      };
      scope.cancel = function() {
        scope.editMode = false;
        scope.model = previousValue;
        scope.handleCancel({value: scope.model});
      };
    },
    templateUrl: directory.common + 'inline-edit.html'
  };
}]);
