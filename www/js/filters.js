angular.module('starter.filters', [])

.filter('xxxxx', function() {
    return function(stringDate) {
      var len, i, zeroFill = '', concatened = '';
      if(stringDate !== undefined) {
        len = 13 - stringDate.toString().length;
        for (i = 0; i < len; i++) {
          zeroFill += '0';
        }
        concatened = stringDate + zeroFill;
        return new Date(parseInt(concatened)).toTimeString();
      }
    };
});
