

function get_biplot(stateName)
{
    console.log("Biplot");
    d3.json("/getbiplotforstate?state="+stateName, function(data) {
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
    d3.select("body").select(".bi-plot").remove("g");
  
  
  
    var margin = { left: 50, top: 100, bottom: 50, right: 50 };
  
    var svgWidth = 550;
  
    var padding = 10;
  
    var svgHeight = 340;
  
    var height = 254;
  
    var width = 400;
  
  
  
    var barGraph = d3
      .select("body")
      .append("svg")
      .attr("class", "bi-plot")
      .attr("height", svgHeight)
      .attr("width", svgWidth)
      .attr("transform", "translate(150,50)");

  
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
      
      console.log("x_axis_domain", x_axis_bottom);
      console.log("y_axis_domain", y_axis_domain);
  
  
      var x_scale = d3.scaleLinear().domain(x_axis_domain).range([0, width]);
  
      var datamax = d3.sum(PCA1);
  
           y_length = datamax * 110 / 100;
  
    var y_scale = d3
      .scaleLinear()
      .domain(y_axis_domain)
      .range([height, 0]);
  
    var x_axis_bottom = d3.axisBottom().ticks(PCA1.length).scale(x_scale);
  
    var x_axis_top = d3.axisTop().ticks(PCA1.length).scale(x_scale);
  
    var y_axis_left = d3.axisLeft().ticks(PCA2.length).scale(y_scale);
  
    var y_axis_right = d3.axisLeft().ticks(PCA2.length).scale(y_scale);
  
  
    var data = [];
  
    var color = d3.scaleOrdinal(d3.schemeCategory20);
  
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
      .append("text");
    
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
    
      labels
      .style("stroke", function (d, i) { return color(i); })
        .attr("x", function (d) { return x_scale(d.x)+10 ; })
          .attr('text-anchor', 'middle')
          .attr("class","biplot-labels")
        .attr("y", function (d) { return y_scale(d.y)+90; }).
        text(function (d) { return d.label;});
    
    
    lines
      .style("stroke", function (d, i) { return color(i); })
      .style("stroke-width", 2)
      .attr("x1", x_scale(0)+50)
      .attr("y1", y_scale(0))
      .attr("x2", function (d) { return x_scale(d.x) + 50; })
      .attr("y2", function (d) { return y_scale(d.y);});
  
  
  
      var xAxis = barGraph
      .append("g")
      .attr("transform", "translate(50,"+height+")")
      .call(x_axis_bottom)
      .append("text")
      .attr("y", height - 50)
        .attr("x", width - 50)
      .attr("text-anchor", "end")
      .attr("stroke", "black");
  
      var xAxis = barGraph
      .append("g")
      .attr("transform", "translate(50,0)")
      .call(x_axis_bottom)
      .append("text")
      .attr("y", height - 50)
        .attr("x", width - 50)
      .attr("text-anchor", "end")
      .attr("stroke", "black");
  
    
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
      .attr("transform", "rotate(-15)");
  
    var yAxis = barGraph
      .append("g")
      .attr("transform", "translate(50,0)")
      .call(y_axis_left);
    
      var yAxis = barGraph
      .append("g")
      .attr("transform", "translate("+(width+50)+",0)")
      .call(y_axis_left);
  
      barGraph.append("text").attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x",0)
      .attr("dy", "1em")
      .attr("font-weight","bold")
        .style("text-anchor", "end")
      .text("PCA2");
  
      barGraph.append("text")
      .attr("y", height*105/100)
      .attr("x",width)
        .attr("dy", "1em")
        .attr("font-weight","bold")
        .style("text-anchor", "end")
      .text("PCA1");
  
          function onMouseOver(d,i)
          {
              var x = barWidth * i + margin.left;
              var y = (height - (height / y_length) * d) ;
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
  
  