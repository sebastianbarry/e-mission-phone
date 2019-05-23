angular.module('emission.enketo-survey.services', ['ionic', 'emission.plugin.logger'])
.factory('EnketoSurvey', function($window, $http, Logger) {
  var __form = null;
  var __session = {};
  var __form_location = null;
  var __loaded_form = null;
  var __loaded_model = null;

  function init(formLocParam, optsParam) {
    __form = null;
    __session = {};
    __form_location = formLocParam;
    __loaded_form = null;
    __loaded_model = null;

    const opts = JSON.parse(optsParam);
    if (opts && opts.session) {
      __session = opts.session;
    }

    return $http.get(__form_location)
    .then(function(form_json) {
      __loaded_form = form_json.data.form;
      __loaded_model = form_json.data.model;
    });
  }

  function _loadForm(opts = {}) {
    var formSelector = 'form.or:eq(0)';
    var data = {
      // required string of the default instance defined in the XForm
      modelStr: __loaded_model,
      // optional string of an existing instance to be edited
      instanceStr: opts.instanceStr || null,
      submitted: opts.submitted || false,
      external: opts.external || [],
      session: opts.session || {}
    };
    __form = new $window.FormModule( formSelector, data, {});
    var loadErrors = __form.init();
    return loadErrors;
  }
  
  function _restoreAnswer(answers) {
    Logger.log("Answers stored locally" + JSON.stringify(answers));
    var tripAnswer = null;
    var found = false;
    answers.forEach(function(answer){
      Logger.log(__session.trip_properties);
      Logger.log(answer.trip_properties);
      if ((__session.trip_properties.start_ts === answer.trip_properties.start_ts) &&
        (__session.trip_properties.end_ts === answer.trip_properties.end_ts)) {
          Logger.log('found');
          Logger.log(found);
        if (!found) {
          tripAnswer = answer.data;
          Logger.log("trip" + JSON.stringify(trip) + "answer" + JSON.stringify(tripAnswer));
          found = true;
        }
      }
    });
    Logger.log('tripAnswer');
    Logger.log(tripAnswer);
    return tripAnswer;
  }

  function displayForm() {
    // Load survey with previous answer
    if (__session &&
        __session.data_key &&
        __session.data_key === 'manual/confirm_survey'
    ) {
      console.log('try to restore answer');
      return $window.cordova.plugins.BEMUserCache.getAllMessages(__session.data_key, false)
      .then(_restoreAnswer)
      .then(function(answerData) {
        console.log('answerData');
        console.log(answerData);
        return _loadForm({ instanceStr: answerData });
      });
    }
    return _loadForm();
  }
  
  function validateForm() {
    return __form.validate()
    .then(function (valid){
      if (valid) {
        const data = {
          data: __form.getDataStr(),
          trip_properties: __session.trip_properties,
        };
        return $window.cordova.plugins.BEMUserCache.putMessage(__session.data_key, data)
        .then(function(){
          return true;
        });
      }
      return valid;
    });
  }

  function getState() {
    return {
      form: __form,
      session: __session,
      loaded_form: __loaded_form,
      loaded_model: __loaded_model,
    };
  }

  return {
    init: init,
    displayForm: displayForm,
    validateForm: validateForm,
    getState: getState,
  };
});
