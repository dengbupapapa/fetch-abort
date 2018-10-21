"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (win) {

    var oldFetch = fetch;

    var ModificationFetch = function () {
        function ModificationFetch() {
            _classCallCheck(this, ModificationFetch);

            for (var _len = arguments.length, opt = Array(_len), _key = 0; _key < _len; _key++) {
                opt[_key] = arguments[_key];
            }

            this.opt = opt;

            this.init();
        }

        _createClass(ModificationFetch, [{
            key: "init",
            value: function init() {

                this.oldFetchPromise = oldFetch.apply(undefined, _toConsumableArray(this.opt));
                this.oldFetchPromise.abort = this.abort.bind(this.oldFetchPromise);
                this.oldThen = this.oldFetchPromise.then;
                this.oldFetchPromise.then = this.then.bind(this.oldFetchPromise, this.oldFetchPromise, this.oldFetchPromise, this.then, this.abort, this.oldThen);
            }
        }, {
            key: "then",
            value: function then(oldFetchPromise, curFetchPromise, _then, abort, oldThen) {
                var _this = this;

                var resFn = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : function () {};
                var rejFn = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : function () {};


                var afterPromise = oldThen.call(curFetchPromise, function () {
                    oldFetchPromise.abort = abort.bind(afterPromise); //把第一个promise的abort上下文指向下一个promise
                    if (_this.__abort) afterPromise.__abort = _this.__abort; // 传递 abort
                    if (!_this.__abort) return resFn.apply(undefined, arguments); //没阻断
                }, function () {
                    oldFetchPromise.abort = abort.bind(afterPromise); //把第一个promise的abort上下文指向下一个promise
                    if (_this.__abort) afterPromise.__abort = _this.__abort; // 传递 abort
                    if (!_this.__abort) return rejFn.apply(undefined, arguments);
                });

                afterPromise.abort = abort.bind(afterPromise);
                afterPromise.then = _then.bind(afterPromise, oldFetchPromise, afterPromise, _then, abort, oldThen);

                return afterPromise;
            }
        }, {
            key: "abort",
            value: function abort() {
                this.__abort = true;
            }
        }, {
            key: "getFetch",
            value: function getFetch() {
                return this.oldFetchPromise;
            }
        }]);

        return ModificationFetch;
    }();

    var cacheFetch = [];

    win.fetch = function () {
        for (var _len2 = arguments.length, opt = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            opt[_key2] = arguments[_key2];
        }

        var modificationFetch = new (Function.prototype.bind.apply(ModificationFetch, [null].concat(opt)))();

        var curFetchPromise = modificationFetch.getFetch();

        cacheFetch.push(curFetchPromise);

        return curFetchPromise;
    };

    win.fetch.abort = function () {
        var abortNum = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;


        cacheFetch.splice(-abortNum).forEach(function (item) {
            item.abort();
        });

        cacheFetch = [];
    };

    for (var s in oldFetch) {
        fetch[s] = oldFetch[s];
    }
})(window);
