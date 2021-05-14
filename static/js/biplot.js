

function get_biplot(stateName)
{
    console.log("Biplot");
    d3.json("/getbiplotforstate?state="+stateName, function(data) {
        console.log(data);
        showBiPlot(data.PCA1,data.PCA2,data.columns,data.datapoints)
      
    });
}

function biplot(){
  d3.json("/biplotdata", function(data) {
    console.log(data);
    showBiPlot(data.PCA1,data.PCA2,data.columns,data.datapoints)
  
  });
}


d3.json("/biplotdata", function(data) {
    console.log(data);
    showBiPlot(data.PCA1,data.PCA2,data.columns,data.datapoints)
  
  });
  
  PCA1=[-1,-2,3,4,5];
  
  PCA2 = [-6, -7, 8, 9, 10];
  
  columns = ["first", "second", "third", "fourth", "fifth"];
  
  data_points = [[1, 2], [2, 4], [-1, 0]];
  
  //showBiPlot(PCA1, PCA2,columns,data_points);
  
  function showBiPlot(PCA1,PCA2,columns,data_points) {
    d3.select("#biplot_div").selectAll("g").remove();
  
  
  
    var margin = { left: 50, top: 50, bottom: 50, right: 50 };
  
    var svgWidth = 550;
  
    var padding = 10;
  
    var svgHeight = 340;
  
    var biplot_height = 254;
  
    var biplot_width = 400;
  
  
  
    var barGraph = d3
      .select("#biplot_div")
      .append("svg")
      .attr("class", "bi-plot")
      .attr("height", svgHeight)
      .attr("width", svgWidth)
      .attr("transform", "translate(200,0)")
      .style("background-color","black");

  
    var x_axis_domain=[0,0];
    
    var y_axis_domain=[0,0];
    
    x_axis_domain[0] = d3.min(PCA1,d=>{return parseFloat(d)});
  
    x_axis_domain[1] = d3.max(PCA1,d=>{
    return parseFloat(d)});
  
    y_axis_domain[0] = d3.min(PCA2,d=>{
    return parseFloat(d)});
  
    y_axis_domain[1] = d3.max(PCA2,d=>{
        return parseFloat(d)
    }) ;
      
      console.log("x_axis_domain", x_axis_domain);
      console.log("y_axis_domain", y_axis_domain);
  
  
      var x_scale = d3.scaleLinear().domain(x_axis_domain).range([0, biplot_width]);
  
      var datamax = d3.sum(PCA1);
  
           y_length = datamax * 110 / 100;
  
    var y_scale = d3
      .scaleLinear()
      .domain(y_axis_domain)
      .range([biplot_height, 0]);
  
    var x_axis_bottom = d3.axisBottom().ticks(PCA1.length).scale(x_scale);
  
    var x_axis_top = d3.axisTop().ticks(PCA1.length).scale(x_scale);
  
    var y_axis_left = d3.axisLeft().ticks(PCA2.length).scale(y_scale);
  
    var y_axis_right = d3.axisLeft().ticks(PCA2.length).scale(y_scale);
  
  
    var data = [];
  
    var color = d3.scaleOrdinal(d3.schemeCategory10);
  
    for (i = 0; i < PCA1.length; i++)
    {
        data.push({"x":PCA1[i],"y":PCA2[i],"label":columns[i]})
    }
  
      var lines = barGraph
      .append("g")
      .selectAll("line")
      .data(data)
      .enter()
      .append("line");
    
  
      var labels = barGraph
      .append("g")
      .selectAll(".biplot-labels")
      .data(data)
      .enter()
      .append("text")
      .transition()
    .duration(1000);
    
 /*
      var points = barGraph
      .append("g")
      .selectAll("circle")
      .data(data_points)
      .enter()
      .append("circle");
    
    points.attr("cx", function (d) { return x_scale(d[0])+100; })
      .attr("cy", function (d) { return y_scale(d[1]); })
      .attr("r", 1.5)
      .style("fill", "darkblue");

      */

      //x-grid lines
      // barGraph.append("g")
      //   .attr("class", "grid")
      //   .attr("transform","translate(100,"+ height +")")
      //   .call(d3.axisBottom(x_scale)
      //       .tickSize(-height)
      //       .tickFormat("")
      //   )
    //y-gridlines
    // barGraph.append("g")			
    //     .attr("class", "grid")
    //     .attr("transform","translate(100,0)")
    //     .call(d3.axisLeft(y_scale).ticks(5)
    //         .tickSize(-width)
    //         .tickFormat("")
    //     )

      var xAxis = barGraph
      .append("g")
      .attr("transform", "translate(80,"+285+")")
      .attr("class","b-tick")
      // .style("fill","white")
      .call(x_axis_bottom)
      .selectAll("text")
      .style("fill","white")
      .append("text")
      
      // .attr("y", biplot_height )
      //   .attr("x", biplot_width - 50)
      .attr("text-anchor", "end")
      .attr("stroke", "black");
      

  
      var xAxis = barGraph
      .append("g")
      .attr("transform", "translate(80,30)")
      .attr("class","b-tick")
      .call(x_axis_bottom)
      .selectAll("text")
      .style("fill","white")
      .append("text")
      .attr("y", biplot_height - 30)
        .attr("x", biplot_width - 50)
      .attr("text-anchor", "end")
      .attr("stroke", "black")
      ;
  
    
     /* 
    
    barGraph.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(50," + height + ")")
      .call(x_axis_bottom
        .tickSize(-height)
        .tickFormat(""));
    
        
        barGraph.append("g")			
          .attr("class", "grid")
          .attr("transform", "translate(50," + width + ")")
        .call(y_axis_left
            .tickSize(-width)
            .tickFormat("")
        )
    */
    
    var rotate_names = barGraph
      .selectAll("text")
      .attr("transform", "rotate(-15)")
      ;
  
    var yAxis = barGraph
      .append("g")
      .attr("transform", "translate(80,30)")
      .attr("class","b-tick")
      .call(y_axis_left)
      .selectAll("text")
      .style("fill","white");
    
      var yAxis = barGraph
      .append("g")
      .attr("transform", "translate("+(biplot_width+80)+",30)")
      .attr("class","b-tick")
      .call(y_axis_left)
      .selectAll("text")
      .style("fill","white");

      labels
      .style("stroke", function (d, i) { return color(i); })
        .attr("x", function (d) { return x_scale(d.x)+10 ; })
          .attr('text-anchor', 'middle')
          .style("fill","white")
          .attr("class","biplot-labels")
        .attr("y", function (d) { return y_scale(d.y)+100; })
        .text(function (d) { return d.label;});


    lines
      .style("stroke", function (d, i) { return color(i); })
      .style("stroke-width", 2)
      .attr("x1", x_scale(0)+80)
      .attr("y1", y_scale(0)+30)
      .attr("x2", function (d) { return x_scale(d.x) + 80; })
      .attr("y2", function (d) { return y_scale(d.y)+30;});

      barGraph.append("text").attr("transform", "rotate(-90)")
      .attr("y", 20)
      .attr("x",-svgHeight/2)
      .attr("dy", "1em")
      .attr("font-weight","bold")
        .style("text-anchor", "end")
      .text("PCA2")
      .style("fill","white");
  
      barGraph.append("text")
      .attr("y", 285+20)
      .attr("x",70+biplot_width/2)
        .attr("dy", "1em")
        .attr("font-weight","bold")
        .style("text-anchor", "end")
      .text("PCA1")
      .style("fill","white");
  
          function onMouseOver(d,i)
          {
              var x = barWidth * i + margin.left;
              var y = (biplot_height - (biplot_height / y_length) * d) ;
              barGraph.append("text").text(d).
                  attr("x", x)
                  .attr("y", y).
                  attr('class','barvalue');
  
          }
  
          function onMouseOut(d,i)
          {
              barGraph.selectAll('.barvalue').remove();
          };
  
  
  }
  
  