'use strict';

exports.isStar = false;

var priority = {
    'filterIn': 1,
    'sortBy': 2,
    'select': 3,
    'limit': 4,
    'format': 5
};

exports.query = function (collection) {
    var newCollection = copyCollections(collection);
    var fields = Array.prototype.slice.call(arguments).slice(1);
    function compare(one, another) {

        return priority[one.name] - priority[another.name];
    }
    fields.sort(compare);
    fields.forEach(function (func) {
        newCollection = func(newCollection);
    });

    return newCollection;
};

function copyCollections(collection) {

    return (collection.map(function (friend) {

        return Object.assign({}, friend);
    }));
}

exports.select = function () {
    var fields = Array.prototype.slice.call(arguments);

    return function select(collection) {
        var result = [];
        collection.forEach(function (friend) {
            var newFriend = {};
            for (var field in friend) {
                if (fields.indexOf(field) !== -1) {
                    newFriend[field] = friend[field];
                }
            }
            result.push(newFriend);
        });

        return result;
    };
};

exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        function compare(one, another) {
            return one[property] - another[property];
        }
        function comparedesc(one, another) {
            return another[property] - one[property];
        }
        if (property === 'age') {
            if (order === 'asc') {
                collection.sort(compare);
            } else {
                collection.sort(comparedesc);
            }
        } else {
            collection.sort(function (one, another) {
                var x = one.name.toLowerCase();
                var y = another.name.toLowerCase();
                if (x < y) {
                    return -1;
                }
                if (x > y) {
                    return 1;
                }

                return 0;
            });
        }

        return collection;
    };
};

exports.limit = function (count) {
    return function limit(collection) {
        return collection.slice(0, count);
    };
};

exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        var newSorted = [];
        collection.forEach(function (friend) {
            for (var field in friend) {
                if (property === field.toString() &&
                values.indexOf(friend[field]) !== -1) {
                    newSorted.push(Object.assign({}, friend));
                }
            }
        });

        return newSorted;
    };
};

exports.format = function (property, formatter) {
    return function format(collection) {
        collection.forEach(function (friend, i) {
            var newFriendList = {};
            for (var field in friend) {
                if (field !== undefined) {
                    newFriendList[field] = field === property
                            ? formatter(friend[field]) : friend[field];
                }
            }
            collection[i] = newFriendList;
        });

        return collection;
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.or = function () {
        return;
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.and = function () {
        return;
    };
}
