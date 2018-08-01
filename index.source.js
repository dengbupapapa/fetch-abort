~(function(win) {

    let oldThen = Promise.prototype.then;
    let oldFetch = fetch;

    class ModificationFetch {

        constructor(...opt) {

            this.opt = opt;

            this.init()

        }

        init() {

            this.oldFetchPromise = oldFetch(...this.opt);

            this.oldFetchPromise.abort = this.abort.bind(this.oldFetchPromise);
            this.oldFetchPromise.then = this.then.bind(this.oldFetchPromise, this.oldFetchPromise, this.then, this.abort);

        }

        then(oldFetchPromise, then, abort, resFn = () => {}, rejFn = () => {}) {

            let afterPromise = oldThen.call(this, (...arg) => {
                oldFetchPromise.abort = abort.bind(afterPromise); //把第一个promise的abort上下文指向下一个promise
                if (this.__abort) afterPromise.__abort = this.__abort; // 传递 abort
                if (!this.__abort) return resFn(...arg); //没阻断
            }, (...arg) => {
                oldFetchPromise.abort = abort.bind(afterPromise); //把第一个promise的abort上下文指向下一个promise
                if (this.__abort) afterPromise.__abort = this.__abort; // 传递 abort
                if (!this.__abort) return rejFn(...arg);
            });

            afterPromise.abort = abort.bind(afterPromise);
            afterPromise.then = then.bind(afterPromise, oldFetchPromise, then, abort);

            return afterPromise

        }

        abort() {
            this.__abort = true;
        }

        getFetch() {
            return this.oldFetchPromise
        }

    }

    let cacheFetch = [];

    win.fetch = (...opt) => {

        let modificationFetch = new ModificationFetch(...opt);

        let curFetchPromise = modificationFetch.getFetch();

        cacheFetch.push(curFetchPromise);

        return curFetchPromise;

    };

    win.fetch.abort = (abortNum = 10) => {

        cacheFetch
            .splice(-abortNum)
            .forEach((item) => {
                item.abort();
            });

        cacheFetch = [];

    }

    for (let s in oldFetch) {
        fetch[s] = oldFetch[s];
    }

})(window);