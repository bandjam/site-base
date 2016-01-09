angular.module('vr.StripeJS.directive', [
	'vr.StripeJS.filter'
])

.directive('stripeClass', ['$filter', function($filter) {
	return {
		restrict: 'A',
		link: function(scope, elem, attr) {
			var prevClass = '';
			
			function getClass(number) {
				var type = $filter('cardType')(number).toLowerCase();
				switch(type) {
					case 'american express': type = 'amex'; break;
					case 'mastercard': type = 'mc'; break;
					case 'diners club': type = 'diners'; break;
				}
				return type;
			}
			
			function setClass(number) {
				if(prevClass != '') {
					elem.removeClass(prevClass);
				}
				prevClass = "stripe-"+getClass(number);
				elem.addClass(prevClass);
			}
			
			function getCardNumber() {
				if(angular.isDefined(attr.ngModel)) {
					return scope.$eval(attr.ngModel);
				} else {
					return attr.stripeClass;
				}
			}
			
			scope.$watch(getCardNumber, function(number) {
				setClass(number);
			});
		}
	}
}])

.directive('validateCardNumber', ['$filter', function($filter) {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, elem, attr, ctrl) {
			ctrl.$parsers.unshift(function(value) {
				var valid = $filter('validCardNumber')(value);
				ctrl.$setValidity('cardNumber',valid);
				return valid ? value : undefined;
			});
			ctrl.$formatters.unshift(function(value) {
				ctrl.$setValidity('cardNumber',$filter('validCardNumber')(value));
				return value;
			})
		}
	}
}])

.directive('validateCvc', ['$filter', function($filter) {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, elem, attr, ctrl) {
			ctrl.$parsers.unshift(function(value) {
				var valid = $filter('validCVC')(value);
				ctrl.$setValidity('cardCVC',valid);
				return valid ? value : undefined;
			});
			ctrl.$formatters.unshift(function(value) {
				ctrl.$setValidity('cardCVC',$filter('validCVC')(value));
				return value;
			});
		}
	}
}])


.factory('stripeExpiration', function() {
	return {
		month: 0,
		year: 0
	}
})

.directive('validateExpMonth', ['$filter', 'stripeExpiration', function($filter, $exp) {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, elem, attr, ctrl) {
			function valid(value) {
				$exp.month = value;
				var valid = $filter('validExpiry')({ month: value, year: $exp.year });
				ctrl.$setValidity('cardExpirationMonth',valid);
				return valid;
			}
			
			ctrl.$parsers.unshift(function(value) {
				return (valid(value) || elem.prop('tagName') == 'SELECT') ? value : undefined;
			});
			ctrl.$formatters.unshift(function(value) {
				valid(value);
				return value;
			});
			
			scope.$watch(function() { return $exp.year }, function() {
				ctrl.$setViewValue($exp.month);
			});
		}
	}
}])

.directive('validateExpYear', ['$filter', 'stripeExpiration', function($filter, $exp) {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, elem, attr, ctrl) {
			function valid(value) {
				$exp.year = value;
				var valid = $filter('validExpiry')({ month: $exp.month, year: value });
				ctrl.$setValidity('cardExpirationYear',valid);
				return valid;
			}
			
			ctrl.$parsers.unshift(function(value) {
				return (valid(value) || elem.prop('tagName') == 'SELECT') ? value : undefined;
			});
			ctrl.$formatters.unshift(function(value) {
				valid(value);
				return value;
			});
			
			scope.$watch(function() { return $exp.month }, function() {
				ctrl.$setViewValue($exp.year);
			});
		}
	}
}]);