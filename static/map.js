
/*  This visualization was made possible by modifying code provided by:

Scott Murray, Choropleth example from "Interactive Data Visualization for the Web" 
https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html   
		
Malcolm Maclean, tooltips example tutorial
http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

Mike Bostock, Pie Chart Legend
http://bl.ocks.org/mbostock/3888852  */

		
//Width and height of map
var width = 760;
var height = 500;




// D3 Projection
var projection = d3.geoAlbersUsa()
				   .translate([width/2, height/2])    // translate to center of screen
				   .scale([1000]);          // scale things down so see entire US
        
// Define path generator
var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
		  	 .projection(projection);  // tell path generator to use albersUsa projection

		
// Define linear scale for output
var color = d3.scaleLinear()
			  .range(["rgba(7, 122, 237,0.4)","rgba(7, 122, 237,0.60)","rgba(7, 122, 237,0.80)","rgba(7, 122, 237,1)"]);

var legendText = ["High", "Medium", "Low", "None"];

//legendText=legendText.reverse()

//Create SVG element and append map to the SVG
var mapSvg = d3.select("body")
	.append("div")
	.attr("class","map")
			.append("svg")
			.attr("width", width)
			.attr("height", height);
        
// Append Div for tooltip to SVG
var div = d3.select("body")
		    .append("div")   
    		.attr("class", "tooltip")               
    		.style("opacity", 0);

// Load in my states data!
d3.json("/states", function (statesData) {
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
				div.text(d.properties.name)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
		})
	.on("mouseover", function (d) {
		d3.select(".tooltip").transition()
		  .duration(200)
		  .style("opacity", .9);
		div.text(d.properties.name)
		  .style("left", (d3.event.pageX) + "px")
		  .style("top", (d3.event.pageY - 28) + "px");
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

	if (value>100) {
	//If value exists…
	return color(3);
	}
	if (value>10) {
		//If value exists…
		return color(2);
	}
	if (value>1) {
		//If value exists…
		return color(1);
	}
	if (value>100) {
		//If value exists…
		return color(1);
		}else {
	//If value is undefined…
	return "rgba(7, 122, 237,0.20)";
	}
});

		 
// Map the cities I have lived in!
d3.json("/stateAccidentData", function(data) {
console.log("accident data",data)
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
		return 1;
	})
		.style("fill", "rgb(255,0,0)")	
		.style("opacity", 0.85)	

	// Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks" 
	// http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
	.on("mouseover", function(d) {      
    	d3.select(".tooltip").transition()        
      	   .duration(200)      
           .style("opacity", .9);      
           div.text(d.City)
           .style("left", (d3.event.pageX) + "px")     
           .style("top", (d3.event.pageY - 28) + "px");    
	})   

    // fade out tooltip on mouse out               
    .on("mouseout", function(d) {       
        d3.select(".tooltip").transition()        
           .duration(500)      
           .style("opacity", 0);   
    });
});  
        
// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
var legend = d3.select("body").append("svg")
      			.attr("class", "legend")
     			.attr("width", 140)
    			.attr("height", 200)
   				.selectAll("g")
   				.data(color.domain().slice().reverse())
   				.enter()
   				.append("g")
     			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

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
	});

});