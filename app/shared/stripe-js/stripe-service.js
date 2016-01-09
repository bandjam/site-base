
angular.module('vr.StripeJS.service', [
    'app.common.globals',
])

.value('publishableKey','')

.run(['publishableKey', 'STRIPE', function(key, STRIPE) {
	Stripe.setPublishableKey(STRIPE.testKey);
}])
.factory('StripeJS', function() {
	return {
		createToken: Stripe.card.createToken,
		validateCardNumber: Stripe.card.validateCardNumber,
		validateExpiry: Stripe.card.validateExpiry,
		validateCVC: Stripe.card.validateCVC,
		cardType: Stripe.card.cardType
	};
});
