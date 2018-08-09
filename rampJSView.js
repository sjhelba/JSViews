'use strict';
define(['bajaux/mixin/subscriberMixIn', 'bajaux/Widget'], function(subscriberMixIn, Widget) {
  let CxRampJSViewCounter = 0;
  
  var CxRampJSView = function () {
    Widget.apply(this, arguments);
    subscriberMixIn(this);
  };

  // Extend and set up prototype chain
  CxRampJSView.prototype = Object.create(Widget.prototype);
  CxRampJSView.prototype.constructor = CxRampJSView;


	////////////////////////////////////////////////////////////////
	// Initialize And Load Widget View
	////////////////////////////////////////////////////////////////
  CxRampJSView.prototype.doInitialize = function (domElement) {
		const that = this;
		domElement.addClass("CxRampJSViewOuter");
		const outerEl = d3.select(domElement[0])
			.style('overflow', 'hidden')
		that.svg = outerEl.append('svg')
			.attr('class', 'CxRampJSView')
			.style('overflow', 'hidden')
		that.uniqueId = 'CxRampJSView_' + CxRampJSViewCounter;
    CxRampJSViewCounter++;
    
    const data = setupDefinitions(that);
    setupD3(that, data);
  };

  CxRampJSView.prototype.doLoad = function (ramp) {
    const that = this;
    const updatedPointData = {
      value: that.valToStartArcTransitionUponUpdate,
      units: '',
      precision: 2,
    };
    const input = that.jq().find('input');


    input.val(ramp.getOut().getValueDisplay());




    // Call update whenever a Property changes
    that.getSubscriber().attach('changed', () => updateView(that, updatedPointData));

    // Call update for the first time.
    updateView(that, updatedPointData);
  };
















































////////////////////////////////////////////////////////////////
	// /* SETUP DEFINITIONS */
	////////////////////////////////////////////////////////////////
  const properties = [
    {
      name: 'gaugeTitle1',
      value: 'Gauge Title1'
    },
    {
      name: 'gaugeTitle2',
      value: 'Gauge Title2'
    },
    {
      name: 'efficiencyGauge',
      value: false
    },
    {
      name: 'baselineEfficiencyThreshold',
      value: 1.20
    },
    {
      name: 'targetEfficiencyThreshold',
      value: 0.80
    },
    {
      name: 'title1SpacingFromMiddle',
      value: 30
    },
    {
      name: 'title2SpacingFromMiddle',
      value: 10
    },
    {
      name: 'valueSpacingFromMiddle',
      value: 15
    },
    {
      name: 'minVal',
      value: 0
    },
    {
      name: 'maxVal',
      value: 200
    },
    {
      name: 'gaugeArcThickness',
      value: 18
    },
    {
      name: 'titleFont',
      value: '12.0pt Nirmala UI',
      typeSpec: 'gx:Font'
    },
    {
      name: 'unitsFont',
      value: '11.0pt Nirmala UI',
      typeSpec: 'gx:Font'
    },
    {
      name: 'valueFont',
      value: 'bold 22.0pt Nirmala UI',
      typeSpec: 'gx:Font'
    },
    {
      name: 'backgroundColor',
      value: 'rgb(245,245,245)',
      typeSpec: 'gx:Color'
    },
    // if efficiencyGauge is true, will utilize efficiencyColorScale for arc fill (all 3 gaugeArcColors), else only nominalGaugeArcColor
    {
      name: 'nominalGaugeArcColor',
      value: 'rgb(34,181,115)',
      typeSpec: 'gx:Color'
    },
    {
      name: 'subTargetGaugeArcColor',
      value: 'rgb(250,215,50)',
      typeSpec: 'gx:Color'
    },
    {
      name: 'subBaselineGaugeArcColor',
      value: 'rgb(213,61,59)',
      typeSpec: 'gx:Color'
    },
    {
      name: 'titleColor',
      value: 'rgb(64,64,64)',
      typeSpec: 'gx:Color'
    },
    {
      name: 'unitsColor',
      value: 'rgb(64,64,64)',
      typeSpec: 'gx:Color'
    },
    {
      name: 'valueColor',
      value: 'rgb(64,64,64)',
      typeSpec: 'gx:Color'
    },
    {
      name: 'backgroundArcColor',
      value: 'rgb(212,212,212)',
      typeSpec: 'gx:Color'
    }
  ];


	const setupDefinitions = widget => {
		let cx, cy, width, height, startAngle, endAngle, gaugeArcOuterRadius,
			gaugeArcInnerRadius, minValForArc, maxValForArc, minVal, maxVal,
			efficiencyColorScale, angleScale, gaugeArcGenerator, backgroundArcGenerator,
			unitsArcGenerator, arcTween;

		const data = {};

		// FROM USER // 
		properties.forEach(prop => data[prop.name] = prop.value );

		const jq = widget.jq();
		const jqWidth = jq.width() || 200;
		const jqHeight = jq.height() || 200;
		data.svgWidth = jqWidth - 2
		data.svgHeight = jqHeight - 2
		width = data.svgWidth;
		height = data.svgHeight;

		// CALCULATED OR HARD-CODED DEFINITIONS //
		cx = width / 2;
		cy = height / 2;
		// angles are measured in radians (pi * 2 radians === full circle, so in radians, 0 === 2 * pi)
		startAngle = - Math.PI;
		endAngle = Math.PI;
		gaugeArcOuterRadius = height < width ? (height / 2) - 5 : (width / 2) - 5;
		gaugeArcInnerRadius = gaugeArcOuterRadius - data.gaugeArcThickness;

		// sets value data
		data.units = '';      //TODO THESE THREE SHOULD BE UPDATED IN UPDATE
		data.precision = 2;


		// if efficiencyGauge marked true, inverts min and max vals
		[minVal, maxVal] = data.efficiencyGauge ? [data.maxVal, data.minVal] : [data.minVal, data.maxVal];

		// func returns which color arc fill should be based on curr val, efficiency thresholds, and selected arc colors for up to baseline, up to target, & nominal vals
		efficiencyColorScale = currentValue => {
			if (currentValue >= data.baselineEfficiencyThreshold) return data.subBaselineGaugeArcColor;
			if (currentValue >= data.targetEfficiencyThreshold) return data.subTargetGaugeArcColor;
			return data.nominalGaugeArcColor;
		};
		// returns scaling func that returns angle in radians for a value
		angleScale = d3.scaleLinear()
			.domain([minVal, maxVal])
			.range([startAngle, endAngle]);

		// Arc Generators return d values for paths
		gaugeArcGenerator = d3.arc()
			.startAngle(startAngle)
			.innerRadius(gaugeArcInnerRadius)
			.outerRadius(gaugeArcOuterRadius)
			.cornerRadius('10'); // round edges of path

		backgroundArcGenerator = d3.arc()
			.startAngle(startAngle)
			.endAngle(endAngle)
			.innerRadius(gaugeArcInnerRadius)
			.outerRadius(gaugeArcOuterRadius);

		unitsArcGenerator = d3.arc()
			.startAngle(endAngle)
			.endAngle(startAngle)
			.innerRadius(gaugeArcInnerRadius - (gaugeArcInnerRadius * 0.05))
			.outerRadius(gaugeArcInnerRadius - (gaugeArcInnerRadius * 0.05));

		/* func that returns func that returns return val of gaugeArcGenerator invoked on data with
				'end angle' property of interpolated start & end end angles for drawing arc transition */
		arcTween = newAngle => datum => t => {
			datum.endAngle = d3.interpolate(datum.endAngle, newAngle)(t);
			return gaugeArcGenerator(datum);
		};
		const tempObj = {
			cx, cy, width, height, startAngle, endAngle, gaugeArcOuterRadius,
			gaugeArcInnerRadius, minValForArc, maxValForArc, valForGaugeArc, minVal, maxVal,
			efficiencyColorScale, angleScale, gaugeArcGenerator, backgroundArcGenerator,
			unitsArcGenerator, arcTween
		}
		Object.keys(tempObj).forEach(prop => { data[prop] = tempObj[prop] });
		return data;
  };
  
  




    
	////////////////////////////////////////////////////////////////
	// SETUP D3
	////////////////////////////////////////////////////////////////

		function setupD3(widget, data) {
			let {
				cx, cy, gaugeTitle1, gaugeTitle2, efficiencyGauge,
				minValForArc, 
				efficiencyColorScale, angleScale, gaugeArcGenerator, backgroundArcGenerator,
				unitsArcGenerator, valueSpacingFromMiddle, title1SpacingFromMiddle, title2SpacingFromMiddle,
				titleFont, unitsFont, valueFont, backgroundColor, nominalGaugeArcColor,
				titleColor, unitsColor, valueColor
			} = data;

      // to provide start point for next transition to use
      widget.valToStartArcTransitionUponUpdate = minValForArc;

			const svg = widget.svg
				.attr('width', data.svgWidth)
				.attr('height', data.svgHeight);

			d3.select(svg.node().parentNode).style('background-color', backgroundColor)


			// delete leftover elements from versions previously rendered
			if (!svg.empty()) svg.selectAll("*").remove();

      //value output
			svg.append('text')
				.attr('class', 'valueOutput')
				.attr('x', cx)
				.attr('y', cy + valueSpacingFromMiddle)
				.attr('text-anchor', 'middle')
				.attr('dominant-baseline', 'middle')
				.attr('fill', valueColor)
				.style('font', valueFont)
				// formats output num using precision from value facets
				.text(d3.format(`,.${data.precision}f`)(data.value));

			const chartGroup = svg.append('g')
				.attr('class', 'chartGroup')
				.attr('transform', `translate(${cx}, ${cy})`);

			const backgroundPath = chartGroup.append('path')
				.attr('id', widget.uniqueId + '_backgroundPath')
				.attr('d', backgroundArcGenerator())
				.attr('fill', data.backgroundArcColor);


			const gaugeArc = chartGroup.append('path')
				.attr('id', 'gaugeArc')
				.datum({ endAngle: angleScale(minValForArc) })
				// fill nominal color for non-efficiency gauge or 3 color scale for efficiency gauge. Starts with min val color prior to transition
				.attr('fill', efficiencyGauge ? efficiencyColorScale(minValForArc) : nominalGaugeArcColor)
				.attr('d', gaugeArcGenerator(angleScale(minValForArc)))


			const unitsPath = chartGroup.append('path')
				.attr('id', widget.uniqueId + '_unitsPath')
				.attr('d', unitsArcGenerator())
				.attr('fill', 'none');

			const title1Output = chartGroup.append("text")
				.attr('dominant-baseline', 'text-after-edge')
				.style("text-anchor", "middle")
				.attr('y', -(title1SpacingFromMiddle))
				.style('font', titleFont)
				.attr('fill', titleColor)
				.text(gaugeTitle1);

			const title2Output = chartGroup.append("text")
				.attr('dominant-baseline', 'text-after-edge')
				.style("text-anchor", "middle")
				.attr('y', -(title2SpacingFromMiddle))
				.style('font', titleFont)
				.attr('fill', titleColor)
				.text(gaugeTitle2);

			const unitsOutput = chartGroup.append("text").append("textPath")
				.attr("xlink:href", '#' + widget.uniqueId + '_unitsPath') // ID of path text follows
				.style("text-anchor", "end")
				.attr("startOffset", "50%")
				.style('font', unitsFont)
				.attr('fill', unitsColor)
        .text(data.units);

		}



    
	////////////////////////////////////////////////////////////////
	// Update Widget
  ////////////////////////////////////////////////////////////////
  
    function updateView(widget, updatedPointData) {
      updatedPointData.value;
      updatedPointData.units;
      updatedPointData.precision;

      valForGaugeArc = data.value;
      minValForArc = data.minVal + ((data.maxVal - data.minVal) * 0.05);
      maxValForArc = data.maxVal - ((data.maxVal - data.minVal) * 0.03);
  
      if (data.value < minValForArc) {
        valForGaugeArc = minValForArc;
      }
      if (data.value > maxValForArc) {
        valForGaugeArc = maxValForArc;
      }

      widget.valToStartArcTransitionUponUpdate = updatedPointData.value;
    }



    
/*
FOR UPDATE:::

			// Handle any Component that has an 'out' Property.
			if (widgetValue.has('out')) data.value = widgetValue.get('out').get('value'); //TODO: this goes in update and change where we're getting data

			// Parse out the necessary facets.
			if (widgetValue.has('facets')) {
				const facets = widgetValue.get('facets');
				data.units = facets.get('units', data.units);
				data.precision = facets.get('precision', data.precision);
			}





      		// sets value data
		data.units = '';      //TODO THESE THREE SHOULD BE UPDATED IN UPDATE
		data.precision = 2;
		data.value = data.minVal;


		// implements value limit for gauge arc display so that never completely empty
		valForGaugeArc = data.value;
		minValForArc = data.minVal + ((data.maxVal - data.minVal) * 0.05);
		maxValForArc = data.maxVal - ((data.maxVal - data.minVal) * 0.03);

    if (data.value < minValForArc) {
      valForGaugeArc = minValForArc;
    }
    if (data.value > maxValForArc) {
      valForGaugeArc = maxValForArc;
    }







    			const gaugeArc = chartGroup.append('path')
				.attr('id', 'gaugeArc')
				.datum({ endAngle: angleScale(minValForArc) })
				// fill nominal color for non-efficiency gauge or 3 color scale for efficiency gauge. Starts with min val color prior to transition
				.attr('fill', efficiencyGauge ? efficiencyColorScale(minValForArc) : nominalGaugeArcColor)
				.attr('d', gaugeArcGenerator(angleScale(minValForArc)))
				.transition()         //TODO: HERE IS THE TRANSITION
          .duration(1000)
          // if efficiency graph, transition from min val scale color to actual val's scale color
          .attr('fill', efficiencyGauge ? efficiencyColorScale(data.value) : nominalGaugeArcColor)
          // gradually transition end angle from minValForArc to true val angle
          .attrTween('d', arcTween(angleScale(valForGaugeArc)));

*/



/* REreview:
		// to provide start point for next transition to use
		widget.valToStartArcTransitionUponUpdate = valForGaugeArc;
*/


  return CxRampJSView;
});
