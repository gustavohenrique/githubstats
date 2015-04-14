;(function (angular) {
    'use strict';

    var getLastPageNumberFromHeader = function (headers, totalPages) {
        var links = headers('link').split(',');

        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link && link.search('last') > 0 && totalPages === 0) {
                return link.match(/page=[0-9]{1,2}/)[0].split('=')[1];
            }
        }
        return totalPages;
    };

    var groupByLanguages = function (items) {
        var groups = {};
        for (var i = 0; i < items.length; i++) {
            var item = items[i],
                language = item.language;

            if (! groups.hasOwnProperty(language)) {
                groups[language] = [item];
            }
            else {
                groups[language].push(item);   
            }
        }
        return groups;
    };

    var getLanguagesFrom = function (groups) {
        var languages = [];
        for (var language in groups) {
            languages.push(language);
        }
        return languages;
    };

    var app = angular.module('AppController', []);

    app.controller('MenuCtrl', ['$scope', 'Global',

        function ($scope, Global) {
            $scope.Global = Global;

            $scope.showLogin = function () {
                Global.activatedBox = Global.constants.LOGIN_BOX;
            };

            $scope.showRepositories = function () {
                Global.activatedBox = Global.constants.REPOS_BOX;
                $scope.$parent.$broadcast(Global.events.repos);
            };

            $scope.showStars = function () {
                Global.activatedBox = Global.constants.STARRED_BOX;
                $scope.$parent.$broadcast(Global.events.stars);
            };

        }
    ]);

    app.controller('AuthCtrl', ['$scope', 'Global',

        function ($scope, Global) {
            $scope.Global = Global;
            $scope.user = {
                username: 'gustavohenrique'
            };

            $scope.enter = function () {
                if ($scope.user.username.length === 0) {
                    $scope.isError = true;
                }
                else {
                    Global.user = $scope.user;
                    Global.activatedBox = '';
                    //$scope.$parent.$broadcast(Global.events.authenticate);
                }
            };
        }
    ]);

    app.controller('ReposCtrl', ['$scope', 'Global', 'paginationService',

        function ($scope, Global, paginationService) {
            $scope.Global = Global;
            $scope.currentPage = 1;
            $scope.rows = 10;
            $scope.total = 1;
            $scope.totalPages = 0;
            $scope.isLoading = false;

            var paginate = function (pageNumber) {
                $scope.currentPage = pageNumber;
                $scope.isLoading = true;
                paginationService.findAllRepos($scope, function (res, status, headers) {
                    $scope.items = res;
                    $scope.totalPages = getLastPageNumberFromHeader(headers, $scope.totalPages);
                    $scope.total = res.length;
                    $scope.isLoading = false;
                },
                function (res) {
                    console.log('erro:', res);
                });
            };

            $scope.paginate = paginate;

            $scope.$on(Global.events.repos, function (event, args) {
                paginate($scope.currentPage);
            });
        }
    ]);

    app.controller('StarsCtrl', ['$scope', 'Global', 'paginationService',

        function ($scope, Global, paginationService) {
            $scope.Global = Global;
            $scope.currentPage = 1;
            $scope.rows = 10;
            $scope.total = 1;
            $scope.totalPages = 0;
            $scope.isLoading = false;

            var paginate = function (pageNumber) {
                $scope.currentPage = pageNumber;
                $scope.isLoading = true;
                paginationService.findAllStars($scope, function (res, status, headers) {
                    $scope.items = res;
                    $scope.groups = groupByLanguages(res);
                    $scope.languages = getLanguagesFrom($scope.groups);
                    $scope.selectedLanguage = '';
                    $scope.totalPages = getLastPageNumberFromHeader(headers, $scope.totalPages);
                    $scope.total = res.length;
                    $scope.isLoading = false;
                },
                function (res) {
                    console.log('erro:', res);
                });
            };

            $scope.paginate = paginate;

            $scope.filterByLanguage = function () {
                if ($scope.selectedLanguage.length > 0) {
                    $scope.items = $scope.groups[$scope.selectedLanguage];
                }
                else {
                    paginate($scope.currentPage);
                }
            };

            $scope.$on(Global.events.stars, function (event, args) {
                paginate($scope.currentPage);
            });
        }
    ]);


})(angular);
