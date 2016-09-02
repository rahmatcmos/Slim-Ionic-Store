// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.filters', 'angular-jwt', 'LocalStorageModule'])

.constant('ApiEndpoint', {
  url: 'http://localhost:8100/api',
  resourcesURL: 'http://localhost:2000'
})

.run(function($ionicPlatform, $rootScope, $state, localStorageService) {
  $rootScope.loading = false;
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    if(toState.data.authorization) {
      if(!localStorageService.get('status')) {
        $state.go(toState.data.redirectTo);
      }
    }
  });
})

.config(function($httpProvider, $stateProvider, $urlRouterProvider, localStorageServiceProvider, jwtInterceptorProvider) {

  localStorageServiceProvider.setNotify(true, true);

  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

  jwtInterceptorProvider.tokenGetter = ['localStorageService', function(localStorageService) {
    return localStorageService.get('id_token');
  }];
  $httpProvider.interceptors.push('jwtInterceptor');

  $stateProvider
  .state('app', {
  url: '/app',
  abstract: true,
  templateUrl: 'templates/menu.html',
  controller: 'AppCtrl'
  })
  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    },
    data: {
      authorization: false,
      redirectTo: 'app.home' // affected if authorization: true
    }
  })
  .state('app.product', {
    url: '/product',
    views: {
      'menuContent': {
        templateUrl: 'templates/product.html',
        controller: 'ProductCtrl'
      }
    },
    data: {
      authorization: false,
      redirectTo: 'app.home' // affected if authorization: true
    }
  })
  .state('app.view', {
    url: '/product/view/:productId',
    views: {
      'menuContent': {
        templateUrl: 'templates/productInfo.html',
        controller: 'ProductCtrl'
      }
    },
    data: {
      authorization: false,
      redirectTo: 'app.home' // affected if authorization: true
    }
  })
  .state('app.wishlist', {
    url: '/wishlist',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/wishlist.html',
        controller: 'WishlistCtrl'
      }
    },
    data: {
      authorization: true,
      redirectTo: 'app.home'
    }
  })
  .state('app.checkout', {
    url: '/checkout',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/checkout.html',
        controller: 'CheckoutCtrl'
      }
    },
    data: {
      authorization: true,
      redirectTo: 'app.home'
    }
  })
  .state('app.invoice', {
    url: '/invoice',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/invoice.html',
        controller: 'InvoiceCtrl'
      }
    },
    data: {
      authorization: true,
      redirectTo: 'app.home'
    }
  })
  .state('app.credential', {
    url: '/credential',
    views: {
      'menuContent': {
        templateUrl: 'templates/credential.html',
        controller: 'CredentialCtrl'
      }
    },
    data: {
      authorization: true,
      redirectTo: 'app.home'
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
