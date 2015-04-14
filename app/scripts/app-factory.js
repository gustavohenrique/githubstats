(function (angular) {
    'use strict';

    var app = angular.module('AppFactory', []);

    app.factory('Global', [

        function () {
            return {
                activatedBox: 'login',
                user: {
                    username: ''
                },
                constants: {
                    LOGIN_BOX: 'login',
                    REPOS_BOX: 'repos',
                    PAGINATION_EDIT_ITEM_BOX: 'pagination_edit_item',
                    STARRED_BOX: 'starred'
                },
                events: {
                    repos: 'get-repositories',
                    authenticate: 'authenticate',
                    stars: 'stars'
                }
            };
        }

    ]);


})(angular);
