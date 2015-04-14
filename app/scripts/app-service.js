;(function (angular) {
    'use strict';

    var app = angular.module('AppService', []);

    app.service('paginationService', ['$http',

        function ($http) {
            
            this.findAllRepos = function (scope, success, error) {
                var username = scope.Global.user.username,
                    url ='https://api.github.com/users/' + username + '/repos?sort=updated&direction=desc';
                url += '&page=' + scope.currentPage + '&per_page=' + scope.rows;
                
                $http.get(url).success(success).error(error);
            };

            this.findAllStars = function (scope, success, error) {
                var username = scope.Global.user.username,
                    url = 'https://api.github.com/users/' + username + '/starred?sort=updated&direction=desc';
                url += '&page=' + scope.currentPage + '&per_page=' + scope.rows;

                $http.get(url).success(success).error(error);
            };            
        }
    ]);


})(angular);
