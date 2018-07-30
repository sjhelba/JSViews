/**
 * A module defining `CxNumericJSView`.
 *
 * @module nmodule/myFirstModule/rc/CxNumericJSView
 */
define(['bajaux/mixin/subscriberMixIn',
        'bajaux/Widget'], function (
        subscriberMixIn,
        Widget) {

  'use strict';

  /**
   * An editor for working with `kitControl:NumericWritable` instances. 
   *
   * @class
   * @extends module:bajaux/Widget
   * @alias module:nmodule/myFirstModule/rc/CxNumericJSView
   */
  var CxNumericJSView = function () {
    Widget.apply(this, arguments);
    subscriberMixIn(this);
  };

  // Extend and set up prototype chain
  CxNumericJSView.prototype = Object.create(Widget.prototype);
  CxNumericJSView.prototype.constructor = CxNumericJSView;

  /**
   * Describe how your `Widget` does its initial setup of the DOM.
   * 
   * @param {jQuery} dom - The DOM element into which to load this `Widget`
   */
  CxNumericJSView.prototype.doInitialize = function (dom) {
    dom.html('<input type="text" value="value goes here" />');
  };

  /**
   * Describe how your `Widget` loads in a value.
   * 
   * Thanks to `subscriberMixIn`, we can subscribe to changes to the NumericWritable
   * component to ensure that the DOM is always kept up to date.
   *
   * @param {baja.Component} numeric - an instance of `kitControl:NumericWritable`.
   */
  CxNumericJSView.prototype.doLoad = function (numeric) {
    var input = this.jq().find('input');

    function update() {
      input.val(numeric.getOut().getValueDisplay());
    }

    // Call update whenever a Property changes
    this.getSubscriber().attach('changed', update);

    // Call update for the first time.
    update();
  };

  return CxNumericJSView;
});