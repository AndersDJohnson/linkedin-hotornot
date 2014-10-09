
var app = angular.module('LinkedInHotOrNot', []);

var onLinkedInLoad;

app.controller('voteController', function ($scope, $timeout) {

  $scope.loggedIn = false;
  $scope.voting = false;

  $scope.defaultPictureUrl = 'http://placehold.it/200&text=no photo';

  $scope.login = function (event) {
    console.log('login');
    IN.User.authorize();
    return false;
  };

  $scope.people = [];

  var selectPerson = function (index) {
    $scope.personIndex = index;
    $scope.person = $scope.people[index];
    var before = $scope.people.slice(0, index);
    var after = $scope.people.slice(index + 1);
    $scope.peopleQueue = []
      .concat(after)
      // .concat(before);
  };

  var prevIndex = function () {
    var index = $scope.personIndex - 1;
    index = index < 0 ? $scope.people.length - 1 : index;
    return index;
  };

  var nextIndex = function () {
    var index = $scope.personIndex + 1;
    index = index >= $scope.people.length ? 0 : index;
    return index;
  };

  $scope.prev = function () {
    var index = prevIndex();
    selectPerson(index);
  };

  $scope.next = function () {
    var index = nextIndex();
    selectPerson(index);
  };

  $scope.vote = function (vote) {
    $scope.person.votes = $scope.person.votes || {};
    if (vote === 'up') {
      $scope.person.votes.up += 1;
    }
    else {
      $scope.person.votes.down += 1;
    }
    var index = nextIndex();
    $scope.voting = true;
    $timeout(function () {
      selectPerson(index);
      $scope.voting = false;
    }, 500);
  };

  $scope.selectPerson = function (event, person, index) {
    selectPerson(person.index);
  }

  function displayConnections(data) {
    console.log('success', arguments);
    var people = data.values;
    $scope.people = data.values;
    $scope.peopleQueue = $scope.people;
    _.each($scope.people, function (person, index) {
      person.index = index;
      person.votes = {
        up: 0,
        down: 0
      };
    });
    selectPerson(0);
    $scope.$apply();
  }
  function displayConnectionsErrors() {
    console.log('error', arguments);
  }
  function getPeople() {
    IN.API.Connections("me")
      .fields(
        "first-name",
        "last-name",
        "picture-url",
        "picture-urls::(original)",
        "public-profile-url"
      )
      .params({
        // "company-name": "LinkedIn",
        // "current-company": true,
        "start": 0,
        "count": 20,
        // "sort": "distance"
      })
      .result(displayConnections)
      .error(displayConnectionsErrors);
  }
  function onLinkedInAuth() {
    console.log(arguments);
    $scope.loggedIn = true;
    getPeople();
  }
  onLinkedInLoad = function () {
    IN.Event.on(IN, "auth", onLinkedInAuth);
  }

  IN.init({
    api_key: '7598sbo3moh7t9',
    onLoad: 'onLinkedInLoad',
    authorize: true
  });

});
