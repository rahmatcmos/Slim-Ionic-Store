angular.module('starter.controllers', ['LocalStorageModule'])

.controller('AppCtrl', function($rootScope, $scope, $interval, $ionicModal, $ionicPopup, $location, $timeout, $http, Authorization, localStorageService, ApiEndpoint) {

  $scope.Timer = null;
  $scope.loginData = {};
  $scope.regData = {};
  $scope.regError = {};
  $rootScope.loading = false;
  $scope.user = localStorageService.get('user') || {};
  $scope.status = localStorageService.get('status') || false;
  $scope.id_token = localStorageService.get('id_token') || null;

  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.loginModal = modal;
  });

  $scope.closeLogin = function() {
    $rootScope.loading = false;
    $scope.loginModal.hide();
  };

  $scope.login = function() {
    $scope.loginModal.show();
  };

  $scope.doLogin = function() {
    $rootScope.loading = true;
    $http({
      url: ApiEndpoint.url+'/v1/jwt/signin',
      method: 'POST',
      skipAuthorization: true,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: {'email':$scope.loginData.username, 'password':$scope.loginData.password}
    }).then(function successCallback(response) {
        var valid = Authorization.login(response.data.id_token);
        if(valid) {
          localStorageService.bind($scope, 'user');
          localStorageService.bind($scope, 'status');
          localStorageService.bind($scope, 'id_token');
          $scope.closeLogin();
        }
        $rootScope.loading = false;
    }, function errorCallback(response) {
        $rootScope.loading = false;
    });
  };

  $ionicModal.fromTemplateUrl('templates/signup.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.signupModal = modal;
  });

  $scope.closeSignup = function() {
    $rootScope.loading = false;
    $scope.signupModal.hide();
    $scope.regData = {};
    $scope.regError = {};
  };

  $scope.signup = function() {
    $scope.signupModal.show();
  };

  $scope.doSignUp = function() {
    $rootScope.loading = true;
    $scope.regError = {};
    $http({
      url: ApiEndpoint.url+'/v1/jwt/signup',
      method: 'POST',
      skipAuthorization: true,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: {'name':$scope.regData.name, 'email':$scope.regData.email, 'password':$scope.regData.password}
    }).then(function successCallback(response) {
        $rootScope.loading = false;
        $scope.closeSignup();
    }, function errorCallback(response) {
        $scope.regError = response.data;
        $rootScope.loading = false;
    });
  };

  $scope.logout = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Logout',
      template: 'Are you sure you want to logout?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        $http({
          url: ApiEndpoint.url+'/v1/jwt/signout',
          method: 'GET',
          skipAuthorization: false,
          headers: {'Content-Type': 'text/plain'}
        }).then(function successCallback(response) {
            $interval.cancel($scope.Timer);
            Authorization.logout();
            $scope.user = {};
            $scope.status = false;
            $scope.id_token = null;
            $location.path('/home');
        }, function errorCallback(response) {
            console.log(response);
        });
      }
    });
  };

  $scope.autoLogout = function() {
    $http({
      url: ApiEndpoint.url+'/v1/jwt/signout',
      method: 'GET',
      skipAuthorization: false,
      headers: {'Content-Type': 'text/plain'}
    }).then(function successCallback(response) {
        $interval.cancel($scope.Timer);
        Authorization.logout();
        $scope.user = {};
        $scope.status = false;
        $scope.id_token = null;
        $location.path('/home');
    }, function errorCallback(response) {
        console.log(response);
    });
  };

  $scope.$watch('user', function() {
    if(Object.keys($scope.user).length !== 0) {
      var temp = localStorageService.get('user');
      $scope.clock = temp.exp - parseInt(Date.now().toString().substring(0,10));
      var tick = function() {
        $scope.clock = $scope.clock - 1;
        if($scope.clock <= 0) {
          $scope.clock = null;
          $scope.autoLogout();
        }
      }
      $scope.Timer = $interval(tick, 1000);
    }
  });
})

.controller('HomeCtrl', function($http,$rootScope,$scope,$ionicPopup,ApiEndpoint) {
  $rootScope.apiInfo = {};

  $scope.getApiInfo = function() {
    $rootScope.loading = true;
    $http({
      url: ApiEndpoint.url+'/v1/information',
      method: 'GET',
      skipAuthorization: false,
      headers: {'Content-Type': 'text/plain'}
    }).then(function successCallback(response) {
        $rootScope.apiInfo = response.data;
        $rootScope.loading = false;
    }, function errorCallback(response) {
        var alertPopup = $ionicPopup.alert({
          title: 'Connection Problem',
          template: '<div class="text-center">Please check your internet connection</div>'
        });
        $rootScope.loading = false;
    });
  };
})

.controller('ProductCtrl', function($rootScope, $scope, $ionicModal, $ionicPopup, $http, $stateParams, ApiEndpoint) {
  $scope.products = {};
  $scope.navigation = {};
  $scope.categories = {};
  $scope.brands = {};
  $scope.searchData = {};
  $scope.productData = {};
  $scope.checkout = {};

  $ionicModal.fromTemplateUrl('templates/search.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.searchModal = modal;
  });

  $scope.closeSearch = function() {
    $scope.searchModal.hide();
  };

  $scope.search = function() {
    $scope.searchModal.show();
  };

  $scope.doSearch = function() {
    $rootScope.loading = true;
    $http({
      url: ApiEndpoint.url+'/v1/product/search',
      method: 'GET',
      skipAuthorization: true,
      headers: {'Content-Type': 'text/plain'},
      params: {'keyword':$scope.searchData.keyword, 'brand':$scope.searchData.brand, 'category':$scope.searchData.category, 'order_by':$scope.searchData.order_by, 'ordering':$scope.searchData.ordering}
    }).then(function successCallback(response) {
        $scope.products = response.data.products.data;
        $scope.navigation = response.data.products;
        $scope.categories = response.data.categories;
        $scope.brands = response.data.brands;
        $rootScope.loading = false;
        $scope.closeSearch();
    }, function errorCallback(response) {
        $rootScope.loading = false;
    });
  };

  $scope.getProduct = function() {
    $rootScope.loading = true;
    $http({
      url: ApiEndpoint.url+'/v1/product',
      method: 'GET',
      skipAuthorization: true,
      headers: {'Content-Type': 'text/plain'}
    }).then(function successCallback(response) {
        $scope.products = response.data.products.data;
        $scope.navigation = response.data.products;
        $scope.categories = response.data.categories;
        $scope.brands = response.data.brands;
        $rootScope.loading = false;
        $scope.$broadcast('scroll.refreshComplete');
    }, function errorCallback(response) {
        var alertPopup = $ionicPopup.alert({
          title: 'Operation Fail',
          template: '<div class="text-center">Fail retrieving product</div>'
        });
        $scope.$broadcast('scroll.refreshComplete');
        $rootScope.loading = false;
    });
  };

  $scope.nextProduct = function() {
    if($scope.navigation.next_page_url !== null) {
      $rootScope.loading = true;
      $http({
        url: ApiEndpoint.url+$scope.navigation.next_page_url,
        method: 'GET',
        skipAuthorization: true,
        headers: {'Content-Type': 'text/plain'}
      }).then(function successCallback(response) {
          angular.forEach(response.data.products.data, function(data, key) {
            $scope.products.push(data);
          });
          $scope.navigation = response.data.products;
          $scope.categories = response.data.categories;
          $scope.brands = response.data.brands;
          $rootScope.loading = false;
      }, function errorCallback(response) {
        var alertPopup = $ionicPopup.alert({
          title: 'Operation Fail',
          template: '<div class="text-center">Fail retrieving product</div>'
        });
        $rootScope.loading = false;
      });
    }
  };

  $scope.calcDiscount = function(price, discount, index) {
    var afterDisc = ((100 - discount) / 100) * price;
    angular.forEach($scope.products, function(data, key) {
      if(index == key) {
        $scope.products[key].afterDisc = afterDisc;
      }
    });
  }

  $ionicModal.fromTemplateUrl('templates/viewProduct.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.viewModal = modal;
  });

  $scope.closeView = function() {
    $scope.productData = {};
    $scope.viewModal.hide();
  };

  $scope.viewProduct = function(id) {
    var show = true;
    if(id == undefined) {
      id = $stateParams.productId;
      show = false;
    }
    $rootScope.loading = true;
    $http({
      url: ApiEndpoint.url+'/v1/product/view',
      method: 'GET',
      skipAuthorization: true,
      headers: {'Content-Type': 'text/plain'},
      params: {'id':id}
    }).then(function successCallback(response) {
        $scope.productData = response.data.product;
        if(show) {
          $scope.viewModal.show();
        }
        $rootScope.loading = false;
    }, function errorCallback(response) {
        var alertPopup = $ionicPopup.alert({
          title: '404 Not Found',
          template: '<div class="text-center">'+response.data.message+'</div>'
        });
        $rootScope.loading = false;
    });
  }

  $scope.addToWishlist = function(id) {
    $rootScope.loading = true;
    $http({
      url: ApiEndpoint.url+'/v1/wishlist/add',
      method: 'POST',
      skipAuthorization: false,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: {'id':id}
    }).then(function successCallback(response) {
        var alertPopup = $ionicPopup.alert({
          title: 'Wishlist',
          template: '<div class="text-center">'+response.data.message+'</div>'
        });
        $rootScope.loading = false;
    }, function errorCallback(response) {
        var alertPopup = $ionicPopup.alert({
          title: 'Operation Fail',
          template: '<div class="text-center">'+response.data.message+'</div>'
        });
        $rootScope.loading = false;
    });
  }

  $scope.addToCheckout = function(id, key) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Checkout',
      subTitle: 'Please enter amount',
      template: '<input type="number" ng-model="checkout.amount" required>',
      scope: $scope,
      buttons: [
              { text: 'Cancel' },
              {
                text: 'Submit',
                type: 'button-positive',
                onTap: function(e) {
                  if (!$scope.checkout.amount) {
                    //don't allow the user to close unless he enters wifi password
                    e.preventDefault();
                  } else {
                    return $scope.checkout.amount;
                  }
                }
              }
            ]
    });
    confirmPopup.then(function(res) {
      if(res) {
        $http({
          url: ApiEndpoint.url+'/v1/checkout/add',
          method: 'POST',
          skipAuthorization: false,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          data: {'id':id, 'amount':$scope.checkout.amount}
        }).then(function successCallback(response) {
            var alertPopup = $ionicPopup.alert({
              title: 'Checkout',
              template: '<div class="text-center">'+response.data.message+'</div>'
            });
            $scope.products[key].stock = $scope.products[key].stock - $scope.checkout.amount;
            $rootScope.loading = false;
            $scope.checkout = {};
        }, function errorCallback(response) {
            $scope.checkout = {};
            var alertPopup = $ionicPopup.alert({
              title: 'Operation Fail',
              template: '<div class="text-center">'+response.data.message+'</div>'
            });
            $rootScope.loading = false;
        });
      }
    });
  }
})

.controller('WishlistCtrl', function($rootScope, $scope, $ionicModal, $ionicPopup, $http, ApiEndpoint) {
  $scope.wishlists = {};
  $scope.checkout = {};

  $scope.getWishlist = function() {
    $rootScope.loading = true;
    $http({
      url: ApiEndpoint.url+'/v1/wishlist',
      method: 'GET',
      skipAuthorization: false,
      headers: {'Content-Type': 'text/plain'}
    }).then(function successCallback(response) {
        $scope.wishlists = response.data.wishlists;
        $rootScope.loading = false;
        $scope.$broadcast('scroll.refreshComplete');
    }, function errorCallback(response) {
        var alertPopup = $ionicPopup.alert({
          title: 'Operation Fail',
          template: '<div class="text-center">Fail retrieving wishlist</div>'
        });
        $scope.$broadcast('scroll.refreshComplete');
        $rootScope.loading = false;
    });
  }

  $scope.deleteWishlist = function(id, index) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Remove Wishlist',
      template: 'Are you sure to remove this product from wishlist ?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        $rootScope.loading = true;
        $http({
          url: ApiEndpoint.url+'/v1/wishlist/delete',
          method: 'DELETE',
          skipAuthorization: false,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          data: {'id':id}
        }).then(function successCallback(response) {
            $scope.wishlists.splice(index, 1);
            $rootScope.loading = false;
            var alertPopup = $ionicPopup.alert({
              title: 'Wishlist',
              template: '<div class="text-center">'+response.data.message+'</div>'
            });
        }, function errorCallback(response) {
            var alertPopup = $ionicPopup.alert({
              title: 'Operation Fail',
              template: '<div class="text-center">'+response.data.message+'</div>'
            });
            $rootScope.loading = false;
        });
      }
    });
  }

  $scope.addToCheckout = function(id, key) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Checkout',
      subTitle: 'Please enter amount',
      template: '<input type="number" ng-model="checkout.amount" required>',
      scope: $scope,
      buttons: [
              { text: 'Cancel' },
              {
                text: 'Submit',
                type: 'button-positive',
                onTap: function(e) {
                  if (!$scope.checkout.amount) {
                    //don't allow the user to close unless he enters wifi password
                    e.preventDefault();
                  } else {
                    return $scope.checkout.amount;
                  }
                }
              }
            ]
    });
    confirmPopup.then(function(res) {
      if(res) {
        $http({
          url: ApiEndpoint.url+'/v1/checkout/add',
          method: 'POST',
          skipAuthorization: false,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          data: {'id':id, 'amount':$scope.checkout.amount}
        }).then(function successCallback(response) {
            var alertPopup = $ionicPopup.alert({
              title: 'Checkout',
              template: '<div class="text-center">Added into checkout</div>'
            });
            $scope.wishlists[key].stock = $scope.wishlists[key].stock - $scope.checkout.amount;
            $rootScope.loading = false;
            $scope.checkout = {};
        }, function errorCallback(response) {
            $scope.checkout = {};
            var alertPopup = $ionicPopup.alert({
              title: 'Operation Fail',
              template: '<div class="text-center">'+response.data.message+'</div>'
            });
            $rootScope.loading = false;
        });
      }
    });
  }
})

.controller('CheckoutCtrl', function($rootScope, $scope, $ionicModal, $ionicPopup, $http, ApiEndpoint) {
  $scope.checkouts = {};
  $scope.invoiceData = {};
  $scope.invoiceError = {};

  $scope.getCheckout = function() {
    $rootScope.loading = true;
    $http({
      url: ApiEndpoint.url+'/v1/checkout',
      method: 'GET',
      skipAuthorization: false,
      headers: {'Content-Type': 'text/plain'}
    }).then(function successCallback(response) {
        $scope.checkouts = response.data.checkouts;
        $rootScope.loading = false;
        $scope.$broadcast('scroll.refreshComplete');
    }, function errorCallback(response) {
        var alertPopup = $ionicPopup.alert({
          title: 'Operation Fail',
          template: '<div class="text-center">Fail retrieving checkout</div>'
        });
        $scope.$broadcast('scroll.refreshComplete');
        $rootScope.loading = false;
    });
  }

  $scope.deleteCheckout = function(id, index) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Remove Checkout',
      template: 'Are you sure to remove this product from checkout ?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        $rootScope.loading = true;
        $http({
          url: ApiEndpoint.url+'/v1/checkout/delete',
          method: 'DELETE',
          skipAuthorization: false,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          data: {'id':id}
        }).then(function successCallback(response) {
            $scope.checkouts.splice(index, 1);
            $rootScope.loading = false;
            var alertPopup = $ionicPopup.alert({
              title: 'Checkout',
              template: '<div class="text-center">'+response.data.message+'</div>'
            });
        }, function errorCallback(response) {
            var alertPopup = $ionicPopup.alert({
              title: 'Operation Fail',
              template: '<div class="text-center">'+response.data.message+'</div>'
            });
            $rootScope.loading = false;
        });
      }
    });
  }

  $ionicModal.fromTemplateUrl('templates/generateInvoice.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.invoiceModal = modal;
  });

  $scope.closeInvoice = function() {
    $rootScope.loading = false;
    $scope.invoiceModal.hide();
    $scope.invoiceData = {};
    $scope.invoiceError = {};
  };

  $scope.makeInvoice = function() {
    $scope.invoiceModal.show();
  };

  $scope.generateInvoice = function() {
    $rootScope.loading = true;
    $http({
      url: ApiEndpoint.url+'/v1/invoice/generate',
      method: 'POST',
      skipAuthorization: false,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: {recipient : $scope.invoiceData.recipient ? $scope.invoiceData.recipient : '',
             first_address : $scope.invoiceData.first_address ? $scope.invoiceData.first_address : '',
             second_address : $scope.invoiceData.second_address ? $scope.invoiceData.second_address : '',
             poscode : $scope.invoiceData.poscode ? $scope.invoiceData.poscode : '',
             city : $scope.invoiceData.city ? $scope.invoiceData.city : '',
             state : $scope.invoiceData.state ? $scope.invoiceData.state : '',
             billing : $scope.invoiceData.billing ? $scope.invoiceData.billing : '',
             mobile : $scope.invoiceData.mobile ? $scope.invoiceData.mobile : '',
             selfpickup : $scope.invoiceData.selfpickup ? $scope.invoiceData.selfpickup : null
            }
    }).then(function successCallback(response) {
        $rootScope.loading = false;
         var alertPopup = $ionicPopup.alert({
          title: 'Invoice',
          template: '<div class="text-center">'+response.data.message+'</div>'
        });
        $scope.checkouts = null;
        $scope.closeInvoice();
    }, function errorCallback(response) {
        $scope.invoiceError = response.data;
        if(response.data.message) {
          var alertPopup = $ionicPopup.alert({
            title: 'Operation Fail',
            template: '<div class="text-center">'+response.data.message+'</div>'
          });
        }
        $rootScope.loading = false;
    });
  };
})

.controller('InvoiceCtrl', function($rootScope, $scope, $ionicModal, $ionicPopup, $http, ApiEndpoint) {
  $scope.invoices = {};
  $scope.navigation = {};
  $scope.invoicetData = {};

  $scope.getInvoice = function() {
    $rootScope.loading = true;
    $http({
      url: ApiEndpoint.url+'/v1/invoice',
      method: 'GET',
      skipAuthorization: false,
      headers: {'Content-Type': 'text/plain'}
    }).then(function successCallback(response) {
        $scope.invoices = response.data.invoices.data;
        $scope.navigation = response.data.invoices;
        $rootScope.loading = false;
        $scope.$broadcast('scroll.refreshComplete');
    }, function errorCallback(response) {
        var alertPopup = $ionicPopup.alert({
          title: 'Operation Fail',
          template: '<div class="text-center">Fail retrieving invoice</div>'
        });
        $scope.$broadcast('scroll.refreshComplete');
        $rootScope.loading = false;
    });
  }

  $scope.nextInvoice = function() {
    if($scope.navigation.next_page_url !== null) {
      $rootScope.loading = true;
      $http({
        url: ApiEndpoint.url+$scope.navigation.next_page_url,
        method: 'GET',
        skipAuthorization: false,
        headers: {'Content-Type': 'text/plain'}
      }).then(function successCallback(response) {
          angular.forEach(response.data.invoices.data, function(data, key) {
            $scope.invoices.push(data);
          });
          $scope.navigation = response.data.invoices;
          $rootScope.loading = false;
      }, function errorCallback(response) {
        var alertPopup = $ionicPopup.alert({
          title: 'Operation Fail',
          template: '<div class="text-center">Fail retrieving invoice</div>'
        });
        $rootScope.loading = false;
      });
    }
  };

  $scope.deleteInvoices = function(id, index) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Remove Invoice',
      template: 'Are you sure to remove this invoice receipt ?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        $rootScope.loading = true;
        $http({
          url: ApiEndpoint.url+'/v1/invoice/delete',
          method: 'DELETE',
          skipAuthorization: false,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          data: {'id':id}
        }).then(function successCallback(response) {
            $scope.invoices.splice(index, 1);
            var alertPopup = $ionicPopup.alert({
              title: 'Invoice',
              template: '<div class="text-center">'+response.data.message+'</div>'
            });
            $rootScope.loading = false;
        }, function errorCallback(response) {
            var alertPopup = $ionicPopup.alert({
              title: 'Operation Fail',
              template: '<div class="text-center">'+response.data.message+'</div>'
            });
            $rootScope.loading = false;
        });
      }
    });
  }

  $ionicModal.fromTemplateUrl('templates/viewInvoice.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.invoiceModal = modal;
  });

  $scope.closeView = function() {
    $scope.invoicetData = {};
    $scope.invoiceModal.hide();
  };

  $scope.viewInvoice = function(id) {
    $rootScope.loading = true;
    $http({
      url: ApiEndpoint.url+'/v1/invoice/view',
      method: 'GET',
      skipAuthorization: false,
      headers: {'Content-Type': 'text/plain'},
      params: {'id':id}
    }).then(function successCallback(response) {
        $scope.invoiceData = response.data.invoice;
        $scope.invoiceModal.show();
        $rootScope.loading = false;
    }, function errorCallback(response) {
        var alertPopup = $ionicPopup.alert({
          title: '404 Not Found',
          template: '<div class="text-center">'+response.data.message+'</div>'
        });
        $rootScope.loading = false;
    });
  }
})

.controller('CredentialCtrl', function($scope) {

});
