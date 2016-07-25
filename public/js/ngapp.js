  'use strict';
  /* global angular */
      var ngapp = angular.module('ngapp', ['ngCookies']);
      ngapp.controller('main',['$scope','$http', '$cookies', function($scope, $http, $cookies){
          
            var city = $cookies.get('city');
            if(city){
                $http.get('/api/results/' + city).success(function(data){
                    $scope.businesses=data;
                    $scope.rescity = city;
                    $scope.city = city;
                }); 
            }
            else{
                $scope.businesses={};
                $scope.rescity = "";
                $scope.city="";
            }
            $scope.userid=0;
            
        
        $scope.togglego = function(item, userid){
            if(item.isgoing){
                item.going--;
                item.isgoing=false;
                $http.delete('/api/booking/' + item.rest_id + '/' + userid, null);
            }
            else{
                item.isgoing=true;
                item.going++;
                $http.post('/api/booking/' + item.rest_id + '/' + userid, null);
            }
        }
        
        $scope.getList = function(city){
            $cookies.put('city', city);
            $http.get('/api/results/' + city).success(function(data){
                $scope.businesses=data;
                $scope.rescity = city;
            });    
        };
        
      }]);