
/**
 * AutoCompleter constructor
 * @param  {DOM Object} handle  parentent element contains filter and results.
 * @param  {Object} options  configurations {
 *		resultsSelector: string		class or id selector for result container,
 *      inputSelector:   string		class or id selector for filter element,
 *		minimal: Number,
 *		typingPause: Number
 *		hideAndShow: Boolean  configure if render should be called
 *									while looping
 * }
 * @return {void}
 */
var AutoCompleter = function (handle, options) {
		var defaults = {
			resultsSelector: '.result',
			inputSelector: '.filter',
			minimal: 1,
			typingPause: 300,
			hideAndShow: false
		};

		this.options = this._extend(defaults, options);
		this.handle = handle;
		this._results = this.handle.querySelector(this.options.resultsSelector);
		var input = this.handle.querySelector(this.options.inputSelector);
		this._input = (input)? input: null;
		this._autoCompleteData = [];// this array should be structured as
									//following
									//[{value: "some value to be filtered" },
									// {value: "some value to be filtered" }];
		this._timer = null; // measure the typing pause
		this._regex = null;
		this._value = null; // filter value
		this._matches = []; // array with matched value from this._autoCompleteData
		this._keyCode = {
			UPARROW: 38,
			DOWNARROW: 40,
			ESC:27
		};
		this._items = null;

};


/**
 * Render the results after or while filterinf
 * @param  {string}  value   the value is currently filtering with
 * @param  {string || Array}  results
 * @param  {Boolean} isMatch  it's available when hideAndShow is configured
 *                            to true
 * @param  {Number}  index    it's available when hideAndShow is configured
 *                            to true
 * @return {[type]}          [description]
 */
AutoCompleter.prototype.render = function (matchValue, results, container) {
	//return;
	throw new Error ('Please define your render method with your AutoCompleter');
};


/**
 * update cached data and validate if passed data is array
 * @param  {array} data
 * @return {void}
 */
AutoCompleter.prototype.setData = function (data, items) {
	if ( data instanceof Array) {
		if(this.options.hideAndShow) {
			this._items = items;
		}
		this._autoCompleteData = data;
		if(data.length < 1) {
			//throw new Error('Please set data, data is currently empty');
			this.render(this._value, data, this._results);
		}
	} else {
		throw new Error('setData with non array object');
	}
};

/**
 * Perform filtering
 * @param  {string} value          Input field value
 * @return {Void}
 */
AutoCompleter.prototype.filterValue = function (value) {

	if(this._value === value) {
		// check current filter value matches previous value
		// to avoid special keys trigger filter
		return;
	}
	//console.log(this._value, value);

	this._value = value;
	this._createRegex(value);
	this._matchInput();
};

/**
 * filter the data against provided value
 * @return {Void} [description]
 */
AutoCompleter.prototype._matchInput = function () {

	var self = this;
	var matchedItem = 0;
	//create matched array
	this._matches = this._filter(this._autoCompleteData, function (i, item) {
		// not using Array.prototype.filter is because the rendering function
		// was called each time duing the loop

		var isMatch = self._regex.test(item.value);

		if(self.options.hideAndShow) {
			// Run hide and show eachtime through out the loop
			self._hideAndShow(isMatch, i);
		}

		if(isMatch) {
			matchedItem++;
			return true;
		}
		return false;
	});
	//When there is no results dislaying
	if(matchedItem === 0) {
		this.noResults = true;
	} else {
		this.noResults = false;
	}
	// Run render after filter
	if(!self.options.hideAndShow) {
		this.render(this._value, this._matches, this._results);
	}
	this._createNavigateResults();
};

/**
 * loop array
 * @param  {[type]}   data [description]
 * @param  {Function} cb   [description]
 * @return {[type]}        [description]
 */
AutoCompleter.prototype._filter = function (data, cb) {
	var i = 0;
	var filterArray =[];
	for (i; i < data.length; i++) {
		if(cb(i, data[i])) {
			filterArray.push(data[i]);
		}
	}
	return filterArray;
};

AutoCompleter.prototype._hideAndShow = function (isMatch, i) {
	if(isMatch) {
		this._items[i].classList.remove('hide');
	} else {
		this._items[i].classList.add('hide');
	}
};

/**
 * Make regex
 * @param  {String or Array} value
 * @return {Void}
 */
AutoCompleter.prototype._createRegex = function (value) {
	this._regex = new RegExp(this._sanitizeStr(value), "i");
	//console.log(this._value);
};

/**
 * check input field value against configuration
 * @param  {String}   value    input field value
 * @param  {Function} callback when meet requirements fire callback
 * @return {Void}
 */
AutoCompleter.prototype.checkTyping = function (value, callback) {

	// didn't pause long enough, cancel out the timer
	// immediately to prevent callback firing
	clearTimeout(this._timer);
	// check current filter value matches previous value to
	// avoid special keys trigger filter
	if(value.length < this.options.minimal || this._value === value ) {
		// doesn't match criteria return without callback
		return;
	} else {
		this._timer = window.setTimeout(
				callback.bind(this, value),
				this.options.typingPause
			);
	}
};

/**
 * Check special characters
 * @param  {String} s
 * @return {String}
sanitize
 */
AutoCompleter.prototype._sanitizeStr = function (s) {
	if(typeof s !== "string") {
		throw new Error('_sanitizeStr is not recieving a string');
	}
	return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/*function createMatcher(query) {
	return RegExp('(' +// using a REGULAR EXPRESSION to capture...
				query// all matches in the QUERY.
				.replace(/[^a-z0-9 ]/gi, '')// Ignore "non-word" characters
				.trim()// Trim whitespace to PREVENT "EMPTY" WORDS when the query is...
				.split(/\s+/)// split into DISCREET SEARCHABLE "WORDS" (non-whitespace terms),...
				.sort(function(a,b) {// SORTED by...
					return b.length - a.length;// descending length to PREVENT LOSS OF MATCHES previously replaced by shorter matches.
				}).map(function(word) {// To capture non-word characters like PERIODS, HYPHENS, and APOSTROPHES,
					return word.split('')// BETWEEN EACH CHARACTER of the word
					.join('[^a-z0-9]*');// insert the regular expression for optional non-word characters.
				}).join('|')+// Capture matches of ANY
			')','gi');
}*/

/**
 * extend ojects
 * @param  {Object} obj
 * @return {Object}
 */
AutoCompleter.prototype._extend = function(obj) {
	var args = Array.prototype.slice.call(arguments, 1);
	for(var i = 0; i < args.length; i ++) {
		var source = args[i];
		for(var prop in source) {
			if( typeof obj[prop] === "object" && !obj[prop] instanceof HTMLElement) {
				for (var p in source[prop]) {
					obj[prop][p] = source[prop][p];
				}
			} else {
				obj[prop] = source[prop];
			}
		}
	}
	return obj;
};

/*
	UI functions
 */

/**
 * helper function to empty markup
 * @param  {DOM element} element
 * @return {Void}
 */
AutoCompleter.prototype._removeChild = function (element) {
	while(element.firstChild) {
		element.removeChild(element.firstChild);
	}
};

/**
 * reset input field
 * @return {Void}
 */
AutoCompleter.prototype.reset = function () {
	//remove results
	this._value = '';
	this._matches = null;
	this._input.value = '';
	this._removeChild(this._results);
	//clear input field
};

/**
 * create scope for navigate index
 * @return {Void} [description]
 */
AutoCompleter.prototype._createNavigateResults = function () {
	var numOfResults = this._matches.length,
		index = -1;

	if(numOfResults < 1) {
		// when no results find set _navigateResults to unfined so no thing excutes
		this._navigateResults = undefined;
		return;
	} else {

		var resultHeight = this._results.offsetHeight,
			itemHeight = (this._results.querySelector('li:not(.hide)'))? this._results.querySelector('li:not(.hide)').clientHeight : 0,
			active = this._results.querySelector('.active');

		if(active) {
			//remove active item
			active.classList.remove('active');
		}

	}
	/**
	 * Lets results container scroll as use navigate
	 * @param  {Number} index current active index
	 * @return {[type]}       [description]
	 */
	this._scrollResult = function (index) {
		if (this._results.scrollHeight > this._results.offsetHeight) {
			var top = - resultHeight + (index + 1)*itemHeight;
			if ( top >= 0) {
				this._results.scrollTop = top ;
			} else {
				this._results.scrollTop = 0 ;
			}
		}
	};

	this._navigateResults = function (keyCode) {

		if(keyCode !== this._keyCode.DOWNARROW && keyCode !== this._keyCode.UPARROW){
			return;
		}

		var direction = 0,
			previousItem = this._results.querySelector('.active');

		if(keyCode === this._keyCode.UPARROW) {
			//check if index is at starting position.
			index = (index < 0)? 0 : index;
			direction = -1;
		}
		if(keyCode === this._keyCode.DOWNARROW) {
			direction = 1;
		}

		index = ( direction + index) % numOfResults;
		//update index, if index is negtive, index should
		//count from back to begining
		index = (index < 0)? numOfResults + index : index;

		if(previousItem){
			previousItem.classList.remove('active');
		}
		this._results.querySelectorAll('li:not(.hide)')[index]
			.classList.add('active');
		this._value = this._matches[index].value;
		this._input.value = this._value;
		this._scrollResult(index);

	};

};

/**
 * Bind all UI actions
 * @param  {Init} keyCode
 * @param  {Function} bindEvent
 * @return {Void}
 */
AutoCompleter.prototype.bindUI = function (keyCode, bindEvent) {
	if( typeof bindEvent === "function") {
		bindEvent(keyCode);
	}
	if(keyCode === this._keyCode.ESC) {
		this.reset();
		return;
	}
	if(this._navigateResults) {
		this._navigateResults(keyCode);
	}
};
