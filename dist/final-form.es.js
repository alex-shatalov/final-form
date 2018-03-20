//      
var toPath = function toPath(key) {
  if (key === null || key === undefined) {
    return [];
  }
  if (typeof key !== 'string') {
    throw new Error('toPath() expects a string');
  }
  return key.length ? key.split(/[.[\]]+/).filter(Boolean) : [];
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};



















var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



































var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

//      
var getIn = function getIn(state, complexKey) {
  // Intentionally using iteration rather than recursion
  var path = toPath(complexKey);
  var current = state;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = path[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      if (current === undefined || current === null || (typeof current === 'undefined' ? 'undefined' : _typeof(current)) !== 'object' || Array.isArray(current) && isNaN(key)) {
        return undefined;
      }
      current = current[key];
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return current;
};

//      
var setInRecursor = function setInRecursor(current, index, path, value) {
  if (index >= path.length) {
    // end of recursion
    return value;
  }
  var key = path[index];

  // determine type of key
  if (isNaN(key)) {
    // object set
    if (current === undefined || current === null) {
      // recurse
      var _result2 = setInRecursor(undefined, index + 1, path, value);

      // delete or create an object
      return _result2 === undefined ? undefined : defineProperty({}, key, _result2);
    }
    if (Array.isArray(current)) {
      throw new Error('Cannot set a non-numeric property on an array');
    }
    // current exists, so make a copy of all its values, and add/update the new one
    var _result = setInRecursor(current[key], index + 1, path, value);
    var numKeys = Object.keys(current).length;
    if (_result === undefined) {
      if (current[key] === undefined && numKeys === 0) {
        // object was already empty
        return undefined;
      }
      if (current[key] !== undefined && numKeys <= 1) {
        // only key we had was the one we are deleting
        if (!isNaN(path[index - 1])) {
          // we are in an array, so return an empty object
          return {};
        } else {
          return undefined;
        }
      }
    }
    // set result in key
    return _extends({}, current, defineProperty({}, key, _result));
  }
  // array set
  var numericKey = Number(key);
  if (current === undefined || current === null) {
    // recurse
    var _result3 = setInRecursor(undefined, index + 1, path, value);

    // if nothing returned, delete it
    if (_result3 === undefined) {
      return undefined;
    }

    // create an array
    var _array = [];
    _array[numericKey] = _result3;
    return _array;
  }
  if (!Array.isArray(current)) {
    throw new Error('Cannot set a numeric property on an object');
  }
  // recurse
  var existingValue = current[numericKey];
  var result = setInRecursor(existingValue, index + 1, path, value);

  // current exists, so make a copy of all its values, and add/update the new one
  var array = [].concat(toConsumableArray(current));
  array[numericKey] = result;
  return array;
};

var setIn = function setIn(state, key, value) {
  if (state === undefined || state === null) {
    throw new Error('Cannot call setIn() with ' + String(state) + ' state');
  }
  if (key === undefined || key === null) {
    throw new Error('Cannot call setIn() with ' + String(key) + ' key');
  }
  // Recursive function needs to accept and return State, but public API should
  // only deal with Objects
  return setInRecursor(state, 0, toPath(key), value);
};

//      


/**
 * Converts internal field state to published field state
 */
var publishFieldState = function publishFieldState(formState, field) {
  var errors = formState.errors,
      initialValues = formState.initialValues,
      lastSubmittedValues = formState.lastSubmittedValues,
      submitErrors = formState.submitErrors,
      submitFailed = formState.submitFailed,
      submitSucceeded = formState.submitSucceeded,
      values = formState.values;
  var active = field.active,
      blur = field.blur,
      change = field.change,
      data = field.data,
      focus = field.focus,
      name = field.name,
      touched = field.touched,
      visited = field.visited;

  var value = getIn(values, name);
  var error = getIn(errors, name);
  var submitError = submitErrors && getIn(submitErrors, name);
  var initial = initialValues && getIn(initialValues, name);
  var pristine = field.isEqual(initial, value);
  var dirtySinceLastSubmit = !!(lastSubmittedValues && !field.isEqual(getIn(lastSubmittedValues, name), value));
  var valid = !error && !submitError;
  return {
    active: active,
    blur: blur,
    change: change,
    data: data,
    dirty: !pristine,
    dirtySinceLastSubmit: dirtySinceLastSubmit,
    error: error,
    focus: focus,
    initial: initial,
    invalid: !valid,
    length: Array.isArray(value) ? value.length : undefined,
    name: name,
    pristine: pristine,
    submitError: submitError,
    submitFailed: submitFailed,
    submitSucceeded: submitSucceeded,
    touched: touched,
    valid: valid,
    value: value,
    visited: visited
  };
};

//      
var fieldSubscriptionItems = ['active', 'data', 'dirty', 'dirtySinceLastSubmit', 'error', 'initial', 'invalid', 'length', 'pristine', 'submitError', 'submitFailed', 'submitSucceeded', 'touched', 'valid', 'value', 'visited'];

//      


var shallowEqual = function shallowEqual(a, b) {
  if (a === b) {
    return true;
  }
  if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) !== 'object' || !a || (typeof b === 'undefined' ? 'undefined' : _typeof(b)) !== 'object' || !b) {
    return false;
  }
  var keysA = Object.keys(a);
  var keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(b);
  for (var idx = 0; idx < keysA.length; idx++) {
    var key = keysA[idx];
    if (!bHasOwnProperty(key) || a[key] !== b[key]) {
      return false;
    }
  }
  return true;
};

//      
function subscriptionFilter (dest, src, previous, subscription, keys, shallowEqualKeys) {
  var different = false;
  keys.forEach(function (key) {
    if (subscription[key]) {
      dest[key] = src[key];
      if (!previous || (~shallowEqualKeys.indexOf(key) ? !shallowEqual(src[key], previous[key]) : src[key] !== previous[key])) {
        different = true;
      }
    }
  });
  return different;
}

//      
var shallowEqualKeys = ['data'];

/**
 * Filters items in a FieldState based on a FieldSubscription
 */
var filterFieldState = function filterFieldState(state, previousState, subscription, force) {
  var result = {
    blur: state.blur,
    change: state.change,
    focus: state.focus,
    name: state.name
  };
  var different = subscriptionFilter(result, state, previousState, subscription, fieldSubscriptionItems, shallowEqualKeys) || !previousState;
  return different || force ? result : undefined;
};

//      
var formSubscriptionItems = ['active', 'dirty', 'dirtySinceLastSubmit', 'error', 'errors', 'initialValues', 'invalid', 'pristine', 'submitting', 'submitError', 'submitErrors', 'submitFailed', 'submitSucceeded', 'touched', 'valid', 'validating', 'values', 'visited'];

//      
var shallowEqualKeys$1 = ['touched', 'visited'];

/**
 * Filters items in a FormState based on a FormSubscription
 */
var filterFormState = function filterFormState(state, previousState, subscription, force) {
  var result = {};
  var different = subscriptionFilter(result, state, previousState, subscription, formSubscriptionItems, shallowEqualKeys$1) || !previousState;
  return different || force ? result : undefined;
};

//      
var memoize = function memoize(fn) {
  var lastArgs = void 0;
  var lastResult = void 0;
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (!lastArgs || args.length !== lastArgs.length || args.some(function (arg, index) {
      return !shallowEqual(lastArgs[index], arg);
    })) {
      lastArgs = args;
      lastResult = fn.apply(undefined, args);
    }
    return lastResult;
  };
};

var isPromise = (function (obj) {
  return !!obj && ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
});

//      
var FORM_ERROR = Symbol('form-error');
var version = '4.2.0';

var tripleEquals = function tripleEquals(a, b) {
  return a === b;
};

var convertToExternalFormState = function convertToExternalFormState(_ref) {
  var active = _ref.active,
      dirtySinceLastSubmit = _ref.dirtySinceLastSubmit,
      error = _ref.error,
      errors = _ref.errors,
      initialValues = _ref.initialValues,
      pristine = _ref.pristine,
      submitting = _ref.submitting,
      submitFailed = _ref.submitFailed,
      submitSucceeded = _ref.submitSucceeded,
      submitError = _ref.submitError,
      submitErrors = _ref.submitErrors,
      valid = _ref.valid,
      validating = _ref.validating,
      values = _ref.values;
  return {
    active: active,
    dirty: !pristine,
    dirtySinceLastSubmit: dirtySinceLastSubmit,
    error: error,
    errors: errors,
    invalid: !valid,
    initialValues: initialValues,
    pristine: pristine,
    submitting: submitting,
    submitFailed: submitFailed,
    submitSucceeded: submitSucceeded,
    submitError: submitError,
    submitErrors: submitErrors,
    valid: valid,
    validating: validating > 0,
    values: values
  };
};

function notifySubscriber(subscriber, subscription, state, lastState, filter) {
  var force = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

  var notification = filter(state, lastState, subscription, force);
  if (notification) {
    subscriber(notification);
  }
}

function notify(_ref2, state, lastState, filter) {
  var entries = _ref2.entries;

  Object.keys(entries).forEach(function (key) {
    var _entries$Number = entries[Number(key)],
        subscription = _entries$Number.subscription,
        subscriber = _entries$Number.subscriber;

    notifySubscriber(subscriber, subscription, state, lastState, filter);
  });
}

var createForm = function createForm(config) {
  if (!config) {
    throw new Error('No config specified');
  }
  var debug = config.debug,
      initialValues = config.initialValues,
      mutators = config.mutators,
      onSubmit = config.onSubmit,
      validate = config.validate,
      validateOnBlur = config.validateOnBlur,
      persistentSubmitErrors = config.persistentSubmitErrors;

  if (!onSubmit) {
    throw new Error('No onSubmit function specified');
  }

  var state = {
    subscribers: { index: 0, entries: {} },
    fieldSubscribers: {},
    fields: {},
    formState: {
      dirtySinceLastSubmit: false,
      errors: {},
      initialValues: initialValues && _extends({}, initialValues),
      invalid: false,
      pristine: true,
      submitting: false,
      submitFailed: false,
      submitSucceeded: false,
      valid: true,
      validating: 0,
      values: initialValues ? _extends({}, initialValues) : {}
    },
    lastFormState: undefined
  };
  var inBatch = false;
  var validationPaused = false;
  var validationBlocked = false;
  var changeValue = function changeValue(state, name, mutate) {
    if (state.fields[name]) {
      var before = getIn(state.formState.values, name);
      var after = mutate(before);
      state.formState.values = setIn(state.formState.values, name, after) || {};
    }
  };

  // bind state to mutators
  var mutatorsApi = mutators && Object.keys(mutators).reduce(function (result, key) {
    result[key] = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var mutatableState = {
        formState: state.formState,
        fields: state.fields
      };
      var returnValue = mutators[key](args, mutatableState, {
        changeValue: changeValue,
        getIn: getIn,
        setIn: setIn,
        shallowEqual: shallowEqual
      });
      state.formState = mutatableState.formState;
      state.fields = mutatableState.fields;
      runValidation(undefined, function () {
        notifyFieldListeners();
        notifyFormListeners();
      });
      return returnValue;
    };
    return result;
  }, {}) || {};

  var runRecordLevelValidation = function runRecordLevelValidation(setErrors) {
    var promises = [];
    if (validate) {
      var errorsOrPromise = validate(_extends({}, state.formState.values)); // clone to avoid writing
      if (isPromise(errorsOrPromise)) {
        promises.push(errorsOrPromise.then(setErrors));
      } else {
        setErrors(errorsOrPromise);
      }
    }
    return promises;
  };

  var getValidators = function getValidators(field) {
    return Object.keys(field.validators).reduce(function (result, index) {
      var validator = field.validators[Number(index)]();
      if (validator) {
        result.push(validator);
      }
      return result;
    }, []);
  };

  var runFieldLevelValidation = function runFieldLevelValidation(field, setError) {
    var promises = [];
    var validators = getValidators(field);
    if (validators.length) {
      var error = void 0;
      validators.forEach(function (validator) {
        var errorOrPromise = validator(getIn(state.formState.values, field.name), state.formState.values);
        if (errorOrPromise && isPromise(errorOrPromise)) {
          promises.push(errorOrPromise.then(setError));
        } else if (!error) {
          // first registered validator wins
          error = errorOrPromise;
        }
      });
      setError(error);
    }
    return promises;
  };

  var runValidation = function runValidation(fieldChanged, callback) {
    if (validationPaused) {
      validationBlocked = true;
      /* istanbul ignore next */
      if (callback) {
        callback();
      }
      return;
    }

    var fields = state.fields,
        formState = state.formState;

    var fieldKeys = Object.keys(fields);
    if (!validate && !fieldKeys.some(function (key) {
      return getValidators(fields[key]).length;
    })) {
      if (callback) {
        callback();
      }
      return; // no validation rules
    }

    // pare down field keys to actually validate
    if (fieldChanged) {
      var validateFields = fields[fieldChanged].validateFields;

      if (validateFields) {
        fieldKeys = validateFields.length ? validateFields.concat(fieldChanged) : [fieldChanged];
      }
    }

    var recordLevelErrors = {};
    var fieldLevelErrors = {};
    var promises = [].concat(toConsumableArray(runRecordLevelValidation(function (errors) {
      recordLevelErrors = errors || {};
    })), toConsumableArray(fieldKeys.reduce(function (result, name) {
      return result.concat(runFieldLevelValidation(fields[name], function (error) {
        fieldLevelErrors[name] = error;
      }));
    }, [])));

    var processErrors = function processErrors() {
      var merged = _extends({}, recordLevelErrors);
      fieldKeys.forEach(function (name) {
        if (fields[name]) {
          // make sure field is still registered
          // field-level errors take precedent over record-level errors
          var error = fieldLevelErrors[name] || getIn(recordLevelErrors, name);
          if (error) {
            merged = setIn(merged, name, error);
          }
        }
      });
      if (!shallowEqual(formState.errors, merged)) {
        formState.errors = merged;
      }
      formState.error = recordLevelErrors[FORM_ERROR];
    };

    // process sync errors
    processErrors();

    if (promises.length) {
      // sync errors have been set. notify listeners while we wait for others
      state.formState.validating++;
      if (callback) {
        callback();
      }

      Promise.all(promises).then(function () {
        state.formState.validating--;
        processErrors();
        if (callback) {
          callback();
        }
      });
    } else if (callback) {
      callback();
    }
  };

  var notifyFieldListeners = function notifyFieldListeners(force) {
    if (inBatch) {
      return;
    }
    var fields = state.fields,
        fieldSubscribers = state.fieldSubscribers,
        formState = state.formState;

    Object.keys(fields).forEach(function (name) {
      var field = fields[name];
      var fieldState = publishFieldState(formState, field);
      var lastFieldState = field.lastFieldState;

      if (!shallowEqual(fieldState, lastFieldState)) {
        field.lastFieldState = fieldState;
        notify(fieldSubscribers[name], fieldState, lastFieldState, filterFieldState);
      }
    });
  };

  var hasSyncErrors = function hasSyncErrors() {
    return !!(state.formState.error || Object.keys(state.formState.errors).length);
  };

  var calculateNextFormState = function calculateNextFormState() {
    var fields = state.fields,
        formState = state.formState,
        lastFormState = state.lastFormState;

    var fieldKeys = Object.keys(fields);

    // calculate dirty/pristine
    formState.pristine = fieldKeys.every(function (key) {
      return fields[key].isEqual(getIn(formState.values, key), getIn(formState.initialValues || {}, key));
    });
    formState.dirtySinceLastSubmit = !!(formState.lastSubmittedValues && !fieldKeys.every(function (key) {
      return fields[key].isEqual(getIn(formState.values, key), getIn(formState.lastSubmittedValues || {}, key) // || {} is for flow, but causes branch coverage complaint
      );
    }));

    formState.valid = !formState.error && !formState.submitError && !Object.keys(formState.errors).length && !(formState.submitErrors && Object.keys(formState.submitErrors).length);
    var nextFormState = convertToExternalFormState(formState);

    var _fieldKeys$reduce = fieldKeys.reduce(function (result, key) {
      result.touched[key] = fields[key].touched;
      result.visited[key] = fields[key].visited;
      return result;
    }, { touched: {}, visited: {} }),
        touched = _fieldKeys$reduce.touched,
        visited = _fieldKeys$reduce.visited;

    nextFormState.touched = lastFormState && shallowEqual(lastFormState.touched, touched) ? lastFormState.touched : touched;
    nextFormState.visited = lastFormState && shallowEqual(lastFormState.visited, visited) ? lastFormState.visited : visited;
    return lastFormState && shallowEqual(lastFormState, nextFormState) ? lastFormState : nextFormState;
  };

  var callDebug = function callDebug() {
    return debug && process.env.NODE_ENV !== 'production' && debug(convertToExternalFormState(state.formState), Object.keys(state.fields).reduce(function (result, key) {
      result[key] = state.fields[key];
      return result;
    }, {}));
  };

  var notifyFormListeners = function notifyFormListeners() {
    callDebug();
    if (inBatch) {
      return;
    }
    var lastFormState = state.lastFormState;

    var nextFormState = calculateNextFormState();
    if (nextFormState !== lastFormState) {
      state.lastFormState = nextFormState;
      notify(state.subscribers, nextFormState, lastFormState, filterFormState);
    }
  };

  // generate initial errors
  runValidation();

  var api = {
    batch: function batch(fn) {
      inBatch = true;
      fn();
      inBatch = false;
      notifyFieldListeners();
      notifyFormListeners();
    },

    blur: function blur(name) {
      var fields = state.fields,
          formState = state.formState;

      var previous = fields[name];
      if (previous) {
        // can only blur registered fields
        delete formState.active;
        fields[name] = _extends({}, previous, {
          active: false,
          touched: true
        });
        if (validateOnBlur) {
          runValidation(name, function () {
            notifyFieldListeners();
            notifyFormListeners();
          });
        } else {
          notifyFieldListeners();
          notifyFormListeners();
        }
      }
    },

    change: function change(name, value) {
      var fields = state.fields,
          formState = state.formState;

      if (fields[name] && getIn(formState.values, name) !== value) {
        changeValue(state, name, function () {
          return value;
        });
        if (validateOnBlur) {
          notifyFieldListeners();
          notifyFormListeners();
        } else {
          runValidation(name, function () {
            notifyFieldListeners();
            notifyFormListeners();
          });
        }
      }
    },

    focus: function focus(name) {
      var field = state.fields[name];
      if (field && !field.active) {
        state.formState.active = name;
        field.active = true;
        field.visited = true;
        notifyFieldListeners();
        notifyFormListeners();
      }
    },

    mutators: mutatorsApi,

    getRegisteredFields: function getRegisteredFields() {
      return Object.keys(state.fields);
    },

    getState: function getState() {
      return convertToExternalFormState(state.formState);
    },

    initialize: function initialize(values) {
      var fields = state.fields,
          formState = state.formState;

      formState.initialValues = values;
      formState.values = values;
      Object.keys(fields).forEach(function (key) {
        var field = fields[key];
        field.touched = false;
        field.visited = false;
      });
      runValidation(undefined, function () {
        notifyFieldListeners();
        notifyFormListeners();
      });
    },

    pauseValidation: function pauseValidation() {
      validationPaused = true;
    },

    registerField: function registerField(name, subscriber) {
      var subscription = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var fieldConfig = arguments[3];

      if (!state.fieldSubscribers[name]) {
        state.fieldSubscribers[name] = { index: 0, entries: {} };
      }
      var index = state.fieldSubscribers[name].index++;

      // save field subscriber callback
      state.fieldSubscribers[name].entries[index] = {
        subscriber: memoize(subscriber),
        subscription: subscription
      };

      if (!state.fields[name]) {
        // create initial field state
        var initial = state.formState.initialValues ? getIn(state.formState.initialValues, name) : undefined;
        state.fields[name] = {
          active: false,
          blur: function blur() {
            return api.blur(name);
          },
          change: function change(value) {
            return api.change(name, value);
          },
          data: {},
          focus: function focus() {
            return api.focus(name);
          },
          initial: initial,
          isEqual: fieldConfig && fieldConfig.isEqual || tripleEquals,
          lastFieldState: undefined,
          name: name,
          touched: false,
          valid: true,
          validateFields: fieldConfig && fieldConfig.validateFields,
          validators: {},
          visited: false
        };
      }
      if (fieldConfig && fieldConfig.getValidator) {
        state.fields[name].validators[index] = fieldConfig.getValidator;
      }

      var sentFirstNotification = false;
      var firstNotification = function firstNotification() {
        var fieldState = publishFieldState(state.formState, state.fields[name]);
        notifySubscriber(subscriber, subscription, fieldState, undefined, filterFieldState, true);
        state.fields[name].lastFieldState = fieldState;
        sentFirstNotification = true;
      };

      runValidation(undefined, function () {
        notifyFormListeners();
        if (!sentFirstNotification) {
          firstNotification();
        }
        notifyFieldListeners();
      });

      return function () {
        delete state.fields[name].validators[index];
        delete state.fieldSubscribers[name].entries[index];
        if (!Object.keys(state.fieldSubscribers[name].entries).length) {
          delete state.fieldSubscribers[name];
          delete state.fields[name];
        }
        runValidation(undefined, function () {
          notifyFieldListeners();
          notifyFormListeners();
        });
      };
    },

    reset: function reset() {
      api.initialize(state.formState.initialValues || {});
    },

    resumeValidation: function resumeValidation() {
      validationPaused = false;
      if (validationBlocked) {
        // validation was attempted while it was paused, so run it now
        runValidation(undefined, function () {
          notifyFieldListeners();
          notifyFormListeners();
        });
      }
      validationBlocked = false;
    },

    submit: function submit() {
      var formState = state.formState,
          fields = state.fields;

      if (hasSyncErrors() && !persistentSubmitErrors) {
        // mark all fields as touched
        Object.keys(fields).forEach(function (key) {
          fields[key].touched = true;
        });
        state.formState.submitFailed = true;
        notifyFormListeners();
        notifyFieldListeners();
        return; // no submit for you!!
      }
      var resolvePromise = void 0;
      var completeCalled = false;
      var complete = function complete(errors) {
        formState.submitting = false;
        if (errors && (Object.keys(errors).length || Object.getOwnPropertySymbols(errors).length)) {
          formState.submitFailed = true;
          formState.submitSucceeded = false;
          formState.submitErrors = errors;
          formState.submitError = errors[FORM_ERROR];
        } else {
          delete formState.submitErrors;
          delete formState.submitError;
          formState.submitFailed = false;
          formState.submitSucceeded = true;
        }
        notifyFormListeners();
        notifyFieldListeners();
        completeCalled = true;
        if (resolvePromise) {
          resolvePromise();
        }
      };
      formState.submitting = true;
      formState.submitFailed = false;
      formState.submitSucceeded = false;
      formState.lastSubmittedValues = _extends({}, formState.values);
      if (onSubmit.length === 3) {
        // onSubmit is expecting a callback, first try synchronously
        onSubmit(formState.values, api, complete);
        if (!completeCalled) {
          // must be async, so we should return a Promise
          notifyFormListeners(); // let everyone know we are submitting
          return new Promise(function (resolve) {
            resolvePromise = resolve;
          });
        }
      } else {
        // onSubmit is either sync or async with a Promise
        var result = onSubmit(formState.values, api);
        if (result && isPromise(result)) {
          // onSubmit is async with a Promise
          notifyFormListeners(); // let everyone know we are submitting
          return result.then(complete);
        } else {
          // onSubmit is sync
          complete(result);
        }
      }
    },

    subscribe: function subscribe(subscriber, subscription) {
      if (!subscriber) {
        throw new Error('No callback given.');
      }
      if (!subscription) {
        throw new Error('No subscription provided. What values do you want to listen to?');
      }
      var memoized = memoize(subscriber);
      var subscribers = state.subscribers,
          lastFormState = state.lastFormState;

      var index = subscribers.index++;
      subscribers.entries[index] = {
        subscriber: memoized,
        subscription: subscription
      };
      var nextFormState = calculateNextFormState();
      if (nextFormState !== lastFormState) {
        state.lastFormState = nextFormState;
      }
      notifySubscriber(memoized, subscription, nextFormState, nextFormState, filterFormState, true);
      return function () {
        delete subscribers.entries[index];
      };
    }
  };
  return api;
};

//

export { createForm, FORM_ERROR, version, formSubscriptionItems, fieldSubscriptionItems, getIn, setIn };