'use strict';

exports.isStar = false;

// Чем больше число тем ниже приоритет функции
var priority = {
    filterIn: 1,
    sortBy: 2,
    select: 3,
    limit: 4,
    format: 5
};

exports.query = function (collection) {
    var newCollection = copyCollection(collection);
    var functions = Array.prototype.slice.call(arguments).slice(1);
    function compare(one, another) {
        var x = priority[one.name];
        var y = priority[another.name];

        return x - y;
    }
    functions.sort(compare);
    functions.forEach(function (func) {
        newCollection = func(newCollection);
    });

    return newCollection;
};

function copyCollection(collection) {

    return (collection.map(function (friend) {

        return Object.assign({}, friend);
    }));
}

exports.select = function () {
    var fields = Array.prototype.slice.call(arguments);

    return function select(collection) {

        return collection.map(function (friend) {
            var newFriend = {};
            for (var field in friend) {
                if (fields.indexOf(field) !== -1) {
                    newFriend[field] = friend[field];
                }
            }

            return newFriend;
        });
    };
};

exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        function compare(one, another) {
            return (one[property] > another[property]) ? 1 : -1;
        }

        if (order === 'asc') {
            collection.sort(compare);
        } else {
            collection.sort(compare).reverse();
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
        return collection.map(function (friend) {
            friend[property] = formatter(friend[property]);

            return friend;
        });
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
