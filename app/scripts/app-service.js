;(function (angular) {
    'use strict';

    var app = angular.module('AppService', []);

    app.service('mainService', ['$http',

        function ($http) {
            
            this.verifyUsername = function (scope, success, error) {
                var username = scope.user.username,
                    url ='https://api.github.com/users/' + username;

                $http.get(url).success(success).error(error);
            };

            this.findAllRepos = function (scope, success, error) {
                var username = scope.Global.user.username,
                    url ='https://api.github.com/users/' + username + '/repos?sort=updated&direction=desc';
                url += '&page=' + scope.currentPage + '&per_page=' + scope.rows;
                
                $http.get(url).success(success).error(error);
            };

            this.findAllStars = function (scope, success, error) {
                var username = scope.Global.user.username,
                    url = scope.nextPageUrl || 'https://api.github.com/users/' + username + '/starred?sort=updated&direction=desc';

                $http.get(url).success(success).error(error);
            };            
        }
    ]);


})(angular);
