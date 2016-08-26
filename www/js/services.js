angular.module('starter.services', ['LocalStorageModule','angular-jwt'])

.factory('Authorization', function(localStorageService, jwtHelper) { 
  return {
    login: function(token) {
      if(token === undefined)
        return false;
      var tokenPayload = jwtHelper.decodeToken(token);
      localStorageService.set('user', tokenPayload);
      localStorageService.set('id_token', token);
      localStorageService.set('status', true);
      return true;
    },
    logout: function() {
      localStorageService.remove('user');
      localStorageService.remove('id_token');
      localStorageService.remove('status');
    },
    isSupported:localStorageService.isSupported
  };
});
