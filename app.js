var budgetController = (function(){

    var Income = function(id, description, value) {
        this.description = description;
        this.value = value;
        this.id = id;
    };

    var Expense = function(id, description, value){
        this.description = description;
        this.value = value;
        this.id = id;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum = sum + curr.value;
        })
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1,
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'inc') {
                newItem = new Income(ID, des, val)
            } else if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(id, type) {
            var ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            })

            console.log(ids.indexOf(id));
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){
            // calculate total incomes and expenses
            calculateTotal('exp');
            calculateTotal('inc');            

            // calculate the budget (incomes - expenses)
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
                console.log('nie ma procentu');
            }
        },

        calculatePercentage: function() {
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            })
        },

        getPercentage: function() {
            var allPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
            })
            return allPerc;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalIncomes: data.totals.inc,
                totalExpense: data.totals.exp,
                percentage: data.percentage,
            };
        },

        testing: function() {
            console.log(data);
        }
    }

})();


var UIController = (function() {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addButton: '.add__btn',
        incomeList: '.income__list',
        expenseList: '.expenses__list',
        budgetTotal: '.budget__value',
        budgetIncome: '.budget__income--value',
        budgetExpense: '.budget__expenses--value',
        percentageExpense: '.budget__expenses--percentage',
        container: '.container',
        percentageItem: '.item__percentage',
        dateField: '.budget__title--month',
    };

    var formatNumber = function(num, type) {
        var dec, int, numSplit, type;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        dec = numSplit[1];
        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        return (type === 'exp' ? type = '-' : type = '+') + ' ' + int + '.' + dec;
            
    };

    var nodeListForEach = function(list, callback){
        for (var i = 0 ; i < list.length ; i++) {
            callback(list[i], i);
        }   
    };

    return {

        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
            }

        },

        getDOMStrings: function() {
            return DOMStrings;
        },

        addListItem: function(item, type) {
            var html, newHTML, element;

            // create html string with placeholder 
            if (type === 'inc') {
                element = DOMStrings.incomeList;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMStrings.expenseList;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // replace placeholder with the actual data
            newHTML = html.replace('%id%', item.id);
            newHTML = newHTML.replace('%description%', item.description);
            newHTML = newHTML.replace('%value%', formatNumber(item.value, type));

            // insert html to the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function(itemId){
            var el = document.getElementById(itemId);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(curr) {
                curr.value = '';
                curr.description = '';
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetTotal).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.budgetIncome).textContent = formatNumber(obj.totalIncomes, 'inc');
            document.querySelector(DOMStrings.budgetExpense).textContent = formatNumber(obj.totalExpense, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageExpense).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageExpense).textContent = '--';
            }
        },

        displayPercentage: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.percentageItem);

            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }
            });
        },

        displayMonth: function() {
            var now, year, month, months;

            now = new Date;
            year = now.getFullYear();
            month = now.getMonth();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

            console.log(months[month] + ', ' + year);
            document.querySelector(DOMStrings.dateField).textContent = months[month] + ', ' + year;
        },

        changedType: function() {
            var fields;

            fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.addButton).classList.toggle('red');

        }
    }

})();


var controller = (function(budgetController, UIController){

    var setupEvenetListeners = function() {

        var DOM = UIController.getDOMStrings();

        document.querySelector(DOM.addButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 && event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UIController.changedType);
    }

    var updateBudget = function() {

        // calculate budget
        budgetController.calculateBudget();

        // return budget
        var budget = budgetController.getBudget();

        // display budget on the ui
        UIController.displayBudget(budget);

    };

    var updatePercentage = function() {
        // calculate precentage
        budgetController.calculatePercentage();

        // return percentage
        var perc = budgetController.getPercentage();

        // display it
        UIController.displayPercentage(perc);
    }

    var ctrlAddItem = function() {
        var input, newItem;
        
        // get the filed input data
        input = UIController.getInput();

        if (input.value > 0 && !isNaN(input.value) && input.description !== '') {
            // add the item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);

            // add the item to the ui
            UIController.addListItem(newItem, input.type);
            UIController.clearFields();
            updateBudget();
            updatePercentage();
            
        } else {
            console.log('wrong data');
        }
    };

    var ctrlDeleteItem = function(event){
        // find id of the clicked el
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // delete it from budgetController
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetController.deleteItem(ID, type);
        }

        UIController.deleteListItem(itemID);

        updateBudget();
        updatePercentage();
    }

    return {
        init: function() {
            console.log('app started');
            UIController.displayMonth();
            UIController.displayBudget({
                budget: 0,
                totalIncomes: 0,
                totalExpense: 0,
                percentage: -1,
            })
            setupEvenetListeners();
        }
    }

})(budgetController, UIController);

controller.init();