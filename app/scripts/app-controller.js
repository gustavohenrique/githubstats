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

    var getNextPageUrlFromHeader = function (headers) {
        try {
            var links = headers('link').split(',');

            for (var i = 0; i < links.length; i++) {
                var link = links[i];
                if (link && link.search('next') > 0) {
                    return link.match(/http.*[0-9]/)[0];
                }
            }
        }
        catch (e) {}
        return '';
    };

    var groupByLanguages = function (items) {
        var groups = {};
        for (var i = 0; i < items.length; i++) {
            var item = items[i],
                language = item.language || 'Other';

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
        function compare (a,b) {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        };

        var languages = [];
        for (var language in groups) {
            languages.push({
                name: language,
                total: groups[language].length
            });
        }
        languages.sort(compare);
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

    app.controller('AuthCtrl', ['$scope', 'Global', 'mainService',

        function ($scope, Global, mainService) {
            $scope.Global = Global;
            $scope.user = {
                username: ''
            };

            $scope.enter = function () {
                if ($scope.user.username.length === 0) {
                    $scope.isError = true;
                }
                else {
                    mainService.verifyUsername($scope, function () {
                        Global.user = $scope.user;
                        Global.activatedBox = '';
                        $scope.isError = false;
                    },
                    function (res) {
                        $scope.isError = true;
                    });
                }
            };
        }
    ]);

    app.controller('ReposCtrl', ['$scope', 'Global', 'mainService',

        function ($scope, Global, mainService) {
            $scope.Global = Global;
            $scope.currentPage = 1;
            $scope.rows = 10;
            $scope.total = 1;
            $scope.totalPages = 0;
            $scope.isLoading = false;

            var paginate = function (pageNumber) {
                $scope.currentPage = pageNumber;
                $scope.isLoading = true;
                mainService.findAllRepos($scope, function (res, status, headers) {
                    $scope.items = res;
                    $scope.totalPages = getLastPageNumberFromHeader(headers, $scope.totalPages);
                    $scope.total = res.length;
                    $scope.isLoading = false;
                },
                function (res) {
                    $scope.items = [];
                    $scope.isLoading = false;
                });
            };

            $scope.paginate = paginate;

            $scope.$on(Global.events.repos, function (event, args) {
                paginate($scope.currentPage);
            });
        }
    ]);

    app.controller('StarsCtrl', ['$scope', 'Global', 'mainService',

        function ($scope, Global, mainService) {
            $scope.Global = Global;
            $scope.isLoading = false;
            $scope.items = [];

            var findAll = function (scope, callback) {
                if (! Global.cache.get('items')) {
                    mainService.findAllStars(scope, function (res, status, headers) {
                        scope.nextPageUrl = getNextPageUrlFromHeader(headers) || '';
                        if (scope.nextPageUrl.length > 0) {
                            scope.items = scope.items.concat(res);
                            findAll(scope, callback);
                        }
                        else {
                            callback(res, status, headers);
                        }
                    },
                    function (res) {
                        $scope.items = [];
                        $scope.isLoading = false;
                    });
                }
                else {
                    $scope.items = Global.cache.get('items');
                    $scope.isLoading = false;
                }
            }

            var load = function () {
                $scope.isLoading = true;

                findAll($scope, function (res, status, headers) {
                    if ($scope.items.length > 0) { 
                        $scope.groups = groupByLanguages($scope.items);
                        $scope.languages = getLanguagesFrom($scope.groups);
                        $scope.selectedLanguage = '';
                        Global.cache.put('items', $scope.items);
                        $scope.isLoading = false;
                    }
                    else {
                        $scope.isLoading = false;
                    }
                });
            };

            $scope.load = load;

            $scope.filterByLanguage = function () {
                if ($scope.selectedLanguage.length > 0) {
                    $scope.items = $scope.groups[$scope.selectedLanguage];
                }
                else {
                    load();
                }
            };

            $scope.$on(Global.events.stars, function (event, args) {
                load();
            });
        }
    ]);


})(angular);
