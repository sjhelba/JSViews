/**
 * A module defining `CxRampJSView`.
 *
 * @module nmodule/myFirstModule/rc/CxRampJSView
 */
define(['bajaux/mixin/subscriberMixIn',
        'bajaux/Widget'], function (
        subscriberMixIn,
        Widget) {

  'use strict';

  /**
   * An editor for working with `kitControl:Ramp` instances. 
   *
   * @class
   * @extends module:bajaux/Widget
   * @alias module:nmodule/myFirstModule/rc/CxRampJSView
   */
  var CxRampJSView = function () {
    Widget.apply(this, arguments);
    subscriberMixIn(this);
  };

  // Extend and set up prototype chain
  CxRampJSView.prototype = Object.create(Widget.prototype);
  CxRampJSView.prototype.constructor = CxRampJSView;

  /**
   * Describe how your `Widget` does its initial setup of the DOM.
   * 
   * @param {jQuery} dom - The DOM element into which to load this `Widget`
   */
  CxRampJSView.prototype.doInitialize = function (dom) {
    dom.html('<input type="text" value="value goes here" />');
  };

  /**
   * Describe how your `Widget` loads in a value.
   * 
   * Thanks to `subscriberMixIn`, we can subscribe to changes to the Ramp
   * component to ensure that the DOM is always kept up to date.
   *
   * @param {baja.Component} ramp - an instance of `kitControl:Ramp`.
   */
  CxRampJSView.prototype.doLoad = function (ramp) {
    var input = this.jq().find('input');

    function update() {
      input.val(ramp.getOut().getValueDisplay());
    }

    // Call update whenever a Property changes
    this.getSubscriber().attach('changed', update);

    // Call update for the first time.
    update();
  };

  return CxRampJSView;
});