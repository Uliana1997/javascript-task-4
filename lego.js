'use strict';

exports.isStar = false;

var priority = {
    'filterIn': 1,
    'and': 2,
    'or': 3,
    'sortBy': 4,
    'select': 5,
    'limit': 6,
    'format': 7
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
                if (fields.indexOf(field) >= 0) {
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
        if (order === 'asc') {
            collection.sort(compare);
        } else {
            collection.sort(!compare);
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
                values.indexOf(friend[field]) >= 0 &&
                !containsObject(friend, newSorted)) {
                    newSorted.push(Object.assign({}, friend));
                }
            }
        });

        return newSorted;
    };
};

function containsObject(obj, collection) {
    var x;
    for (x in collection) {
        if (collection.hasOwnProperty(x) && collection[x] === obj) {
            return true;
        }
    }

    return false;
}

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
