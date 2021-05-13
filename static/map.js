
/*  This visualization was made possible by modifying code provided by:

Scott Murray, Choropleth example from "Interactive Data Visualization for the Web" 
https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html   
		
Malcolm Maclean, tooltips example tutorial
http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

Mike Bostock, Pie Chart Legend
http://bl.ocks.org/mbostock/3888852  */

		
//Width and height of map
var map_width = 760;
var map_height = 500;

var reset_btn="";


// D3 Projection
var projection = d3.geoAlbersUsa()
				   .translate([map_width/2, map_height/2])    // translate to center of screen
				   .scale([1000]);          // scale things down so see entire US
        
// Define path generator
var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
		  	 .projection(projection);  // tell path generator to use albersUsa projection

		
// Define linear scale for output
var color = d3.scaleLinear()
			  .range(["rgba(7, 122, 237,0.4)","rgba(7, 122, 237,0.60)","rgba(7, 122, 237,0.80)","rgba(7, 122, 237,1)"]);

var legendText = [">100K", ">10K", ">1K", ">100"];

//legendText=legendText.reverse()

//Create SVG element and append map to the SVG
var mapSvg = d3.select("#map_div")
	.attr("class","map")
			.append("svg")
			.attr("width", map_width)
			.attr("height", map_height)
			.attr("margin-top",100)
			.style("background-color","white");
        
// Append Div for tooltip to SVG
var legend_div = d3.select("#map_legend")
    		.attr("class", "tooltip")
			.style("fill","white")
    		// .style("opacity", 0);

var statesSymbols;

// Load in my states data!
d3.json("/states", function (statesData) {
	console.log("st",statesData)
	statesSymbols=statesData;
	//console.log("stateAccidents",statesData.data)
color.domain([0,1,2,3]); // setting the range of the input data
	data = Object.keys(statesData);
// Load GeoJSON data and merge with states data
d3.json("stateGeoStat", function(json) {
	console.log("geo data", json);
// Loop through each state data value in the .csv file
for (var i = 0; i < data.length; i++) {

	// Grab data value 
	var dataState = data[i];
	
	// Find the corresponding state inside the GeoJSON
	for (var j = 0; j < json.features.length; j++)  {
		var jsonState = json.features[j].properties.name; 
		if (dataState == jsonState) {

		// Copy the data value into the JSON
		json.features[j].properties.accidents = statesData[dataState]; 
		json.features[j].properties.symbol = statesData[dataState+"_sym"];

		// Stop looking through the JSON
		break;
		}
	}
}

// Bind the data to the SVG and create one path per GeoJSON feature
	mapSvg.selectAll(".mapPath")
		.data(json.features)
		.enter()
		.append("path")
		.attr("class", "mapPath")
		.attr("d", path)
		.style("stroke", "#fff")
		.style("stroke-width", "1")
		.on('click', function (d) {
			console.log("data", d)
			d3.select(".tooltip").transition()
		  .duration(200)
				.style("opacity", .9);
				legend_div.text(d.properties.name)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
		})
		
	.on("mouseover", function (d) {
		d3.select(".tooltip").transition()
		  .duration(200)
		  .style("opacity", .9);
		  legend_div.text(d.properties.name+" "+d.properties.accidents)
		  .style("left", (d3.event.pageX+40) + "px")
		  .style("top", (d3.event.pageY - 18) + "px");
	  })
	  .on("click",function(d){
		  console.log(d.properties.name)
		  bar_chart(false,d.properties.symbol)
		  pcpplot(false,d.properties.name)
		  filter_data(d.properties.name)
		  get_biplot(d.properties.name)
		  sunBurst(d.properties.symbol)
	  })
	  // fade out tooltip on mouse out               
	  .on("mouseout", function (d) {
		d3.select(".tooltip").transition()
		  .duration(500)
		  .style("opacity", 0);
	  })
	.style("fill", function(d) {

	// Get data value
		var value = d.properties.accidents;

	if (value>100000) {
	//If value exists…
	return color(3);
	}
	if (value>10000) {
		//If value exists…
		return color(2);
	}
	if (value>1000) {
		//If value exists…
		return color(1);
	}
	if (value>100) {
		//If value exists…
		return color(0);
		}else {
	//If value is undefined…
	return "rgba(7, 122, 237,0.20)";
	}
});

var stateAccidentData;

function getStateAccidentData()
{
    d3.json("/stateAccidentData", function(data) {
    stateAccidentData=data;
    mapCities(stateAccidentData);
    })

}


function filter_data(stateName)
{
    console.log(stateAccidentData);
    stateData=stateAccidentData.filter(function(d){
    return d.State_Name==stateName;
    });
    console.log(stateData);
    mapCities(stateData);
}

function mapCities(data)
{

    mapSvg.selectAll("circle").remove();

    mapSvg.selectAll("circle")
	.data(data)
	.enter()
	.append("circle")
	.attr("cx", function(d) {
		return projection([d.Start_Lng, d.Start_Lat])[0];
	})
	.attr("cy", function(d) {
		return projection([d.Start_Lng, d.Start_Lat])[1];
	})
	.attr("r", function(d) {
		return d.count/10000;
	})
		.style("fill", "rgb(255,0,0)")
		.style("opacity", 0.85)

	// Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
	// http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
	.on("mouseover", function(d) {
    	d3.select(".tooltip").transition()
      	   .duration(200)
           .style("opacity", .9);
           legend_div.text(d.County+" "+d.count)
           .style("left", (d3.event.pageX) + "px")
           .style("top", (d3.event.pageY - 28) + "px");
	})

    // fade out tooltip on mouse out
    .on("mouseout", function(d) {
        d3.select(".tooltip").transition()
           .duration(500)
           .style("opacity", 0);
    });

}


getStateAccidentData();

        
// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
var legend = mapSvg.append("g")
      			.attr("class", "legend")
     			.attr("width", 140)
    			.attr("height", 200)
   				.selectAll("g")
   				.data(color.domain().slice().reverse())
   				.enter()
   				.append("g")
     			.attr("transform", function(d, i) { return "translate(680," + (350+i * 20) + ")"; });

  	legend.append("rect")
   		  .attr("width", 18)
   		  .attr("height", 18)
   		  .style("fill", color);

  	legend.append("text")
  		  .data(legendText)
      	  .attr("x", 24)
      	  .attr("y", 9)
      	  .attr("dy", ".35em")
      	  .text(function(d) { return d; });

			// <button class="button">Button</button>
			reset_btn=d3.select("body")
		    .append("div").append("input")
			.attr("type","button")
			.attr("class","reset_button")
			.attr("value","Reset to state view")
			.on('click',function(d){
				bar_chart(true,"")
		  		pcpplot(true,"")
		  		getStateAccidentData()
		  		biplot()
		  		displayCountrySunBurst()
			})
	});

});

