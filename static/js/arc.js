
 var margin = { left: 50, top: 100, bottom: 50, right: 50 };

    var svgWidth = 550;

    var padding = 10;

    var svgHeight = 340;

    var height = 254;

    var width = 400;



    var arcCounter = d3
      .select("body")
      .append("svg")
      .attr("class", "arc-counter")
      .attr("height", svgHeight)
      .attr("width", svgWidth)
      .attr("transform", "translate(150,50)");




function showArc()
{
    d3.json("/stateAccidentsCount", function (data) {
	console.log("data",data)
	statesData=data;
}



var arc1 = d3.arc()
            .innerRadius(80)
            .outerRadius(100)
            .startAngle(0)
            .endAngle(Math.PI);

            var arc2 = d3.arc()
            .innerRadius(80)
            .outerRadius(100)
            .startAngle(Math.PI)
            .endAngle(Math.PI*2);

        arcCounter.append("path")
            .attr("class", "arc")
            .attr("d", arc1)
            .attr("transform", "translate(400,150)")
            .attr("fill","lightblue");

        arcCounter.append("path")
            .attr("class", "arc")
            .attr("d", arc2)
            .attr("transform", "translate(400,150)")
            .attr("fill","rgba(7, 122, 237,1)");