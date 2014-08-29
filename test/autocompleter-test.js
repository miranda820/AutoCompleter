describe('AutoCompleter', function () {
	var markupFilter,
		ajaxFilter,
		customFiler,
		customFunction;

	function keyup () {
		var evt = document.createEvent('KeyboardEvent');
			evt.initKeyboardEvent(
				"keyup", // event type : keydown, keyup, keypress
				true, // bubbles
				true, // cancelable
				window, // viewArg: should be window
				false, // ctrlKeyArg
				false, // altKeyArg
				false, // shiftKeyArg
				false, // metaKeyArg
				40, // keyCodeArg : unsigned long the virtual key code, else 0
				0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
			);
		return evt;
	}
	function fakeTyping (value, target) {
		target.options.filter.value += value;
		var evt = keyup();
		target.options.filter.dispatchEvent(evt);
	}

	function clean (target) {
		target.options.filter.value = '';
		var items = target.options.filterTarget.querySelectorAll('li');
		for(var i = 0; i < items; i++) {
			items[i].classList.remove('hide');
		}
	}

	beforeEach(function (done){
		spyOn(AutoCompleter.prototype, '_init').and.callThrough();
		spyOn(AutoCompleter.prototype, 'filterMarkup').and.callThrough();
		spyOn(AutoCompleter.prototype, '_filterData').and.callThrough();
		spyOn(AutoCompleter.prototype, '_hideAndShowMarkup').and.callThrough();
		spyOn(AutoCompleter.prototype, '_checkTyping').and.callThrough();
		spyOn(AutoCompleter.prototype, '_ajax').and.callThrough();
		spyOn(AutoCompleter.prototype, '_callAjax').and.callThrough();

		customFunction = jasmine.createSpy('customFunction');

		var htmlFixture = document.createElement('div');
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (){
			if(this.readyState === 4) {
				htmlFixture.innerHTML = this.responseText;
				markup = htmlFixture.cloneNode(true);
				document.body.appendChild(markup);
				markupFilter = new AutoCompleter(document.querySelector('#auto-complete'));
				ajaxFilter = new AutoCompleter(document.querySelector('#ajax-auto-complete'), {
					ajax: {
						url: 'base/test/fixture/devices.json',
						action: 'POST',
						renderJSON: function (response, result) {

							var items = [];
							var frag = document.createDocumentFragment();
							for(var i = 0; i < response.length; i++) {
								var li = document.createElement("li");
								li.innerHTML = response[i]['Device Name'];
								frag.appendChild(li);
								items.push(response[i]['Device Name']);
							}
							result.innerHTML = '';
							result.appendChild(frag);
							return items;

						},
						error: function (error) {

						}
					},
					typingConfig : {
						minimal: 3,
						typePause: 500
					}
				});
				customFiler = new AutoCompleter(document.querySelector('#custom-auto-complete'), {
					customFilter: customFunction
				});
				done();
			}
		};
		xhr.open('GET','base/test/fixture/index.html');
		xhr.send();

	});

	describe('has a constructor', function () {
		it('requires an existing DOM Element as first argument', function () {
			expect(function (){new AutoCompleter(document.querySelector('#not-there'));}).toThrow();
			expect(function (){new AutoCompleter(document.querySelector('#auto-complete'));}).not.toThrow();
		});
		it('gets input field', function () {
			expect(markupFilter.options.filter).not.toEqual(null);
			expect(ajaxFilter.options.filter).not.toEqual(null);
		});
		it('gets results markup', function () {
			expect(markupFilter.options.filterTarget).not.toEqual(null);
			expect(ajaxFilter.options.filter).not.toEqual(null);
		});
		it('overrides default options', function () {
			expect(ajaxFilter.options.ajax).not.toEqual(null);

		});
		it('knows to use markup filter ', function (){
			var evt = keyup();
			markupFilter.options.filter.dispatchEvent(evt);
			expect(markupFilter.filterMarkup).toHaveBeenCalled();

		});
		it('knows to use Ajax filter', function (){
			var evt = keyup();
			ajaxFilter.options.filter.dispatchEvent(evt);
			expect(ajaxFilter._filterData).toHaveBeenCalled();
		});
		it('knows to use custom filter', function (){
			var evt = keyup();
			customFiler.options.filter.dispatchEvent(evt);
			expect(customFunction).toHaveBeenCalled();
		});
	});

	describe('listens to "keyup" event', function () {
		it('does not filter when typed value is smaller than minal amount of letters', function(done) {
			fakeTyping('12', markupFilter);
			window.setTimeout(function() {
				expect(markupFilter.options.filterTarget.querySelectorAll('.hide').length).toEqual(0);
				done();
			}, markupFilter.options.typingConfig.typePause);
		});
		it('does not filter when type does not pause for requred amout of time', function() {

			clean(markupFilter);
			fakeTyping('1234', markupFilter);
			expect(markupFilter.options.filterTarget.querySelectorAll('.hide').length).toEqual(0);
		});
		it('filters when type more than minimal amount of letters', function (done) {
			clean(markupFilter);
			fakeTyping('1234', markupFilter);
			window.setTimeout(function() {
				expect(markupFilter.options.filterTarget.querySelectorAll('.hide').length).not.toEqual(0);
				done();
			}, markupFilter.options.typingConfig.typePause);
		});
		describe('calls correct filter method', function () {
			it('filters markup', function (done) {
				clean(markupFilter);
				fakeTyping('purus', markupFilter);
				window.setTimeout(function() {
					expect(markupFilter.options.filterTarget.querySelectorAll('.show').length).toEqual(2);
					done();
				}, markupFilter.options.typingConfig.typePause);
			});
			it('makes Ajax call', function (done) {
				clean(ajaxFilter);
				fakeTyping('ipad', ajaxFilter);
				window.setTimeout(function() {
					expect(ajaxFilter._callAjax).toHaveBeenCalled();
					expect(ajaxFilter.options.filterTarget.querySelectorAll('.show').length).not.toEqual(0);
					done();
				}, ajaxFilter.options.typingConfig.typePause + 500); // ajax delay

			});
		});
	});
	/*describe('uses Ajax', function () {
		it('uses defaul markup rendering', function () {});
		it('overrides default markup rendering', function () {});
		it('filters rendered markup when ajax success', function () {});
		it('calls timeout', function () {});
		it('calls error', function () {});
	});*/

});