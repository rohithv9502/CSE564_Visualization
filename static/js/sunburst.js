function sunBurst(stateSymbol)
{
      d3.queue().defer(d3.json, "/getDataSun?stateSymbol="+stateSymbol)
.await(drawsunburst);
}



function drawsunburst(error,db1){
console.log("data",db1);
  var margin = {top: 115, right: 45, bottom: 30, left: 40};
  if (error) throw error;
  // root=db;

  var root = db1;
  console.log("root",root);

  d3.select("#sunburst svg").remove();
  d3.select("#legend div").remove();
   var width = 300,
       height =  300,
       radius = (Math.min(width, height) / 2) ;
       radius = radius - 30;
   var color = d3.scaleOrdinal(d3.schemeBlues[3]);

   var legendRectSize = 15;
   var legendSpacing = 6;

   var formatNumber = d3.format(",d");
   var x = d3.scaleLinear()
       .range([0, 2 * Math.PI]);
   var y = d3.scaleSqrt()
       .range([0, radius]);

   var partition = d3.partition();


   var arc = d3.arc()
       .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
       .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
       .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
       .outerRadius(function(d) { return Math.max(0, y(d.y1)); });


   var tooltip = d3.select('body')
     .append('div').classed('sunburst-tooltip', true);
   tooltip.append('div')
     .attr('class', 'label')
     .style('color','black')
     .style('font-size','12px');
   tooltip.append('div')
     .attr('class', 'count');
   tooltip.append('div')
     .attr('class', 'percent');


   var root = d3.hierarchy(root);

   var total = 0


   root.sum(function(d) {
     if (d.size) {
       total += d.size
     }
     return d.size;
   });


   root.data.children.forEach(function(d){
     d.enabled = true;
   })


   var svvvg = d3.select("#sunburst").append("svg")
   .attr("width", width)
   .attr("height", height)
   .attr("align","center")
   .style("background-color","beige");

   var svg = svvvg
     .append("g")
       .attr("transform", "translate(" + width/2 + "," + (height+10)/2 + ")");

       svvvg.append("text")
       .attr("x", (width/2 ))
       .attr("y", 15)
       .attr("text-anchor", "middle")
       .style("font-size", "16px")
       .style("fill","rgb(0,0,0)")
       //.style("text-decoration", "underline")
       .text("Total accidents");

    console.log("root",root);

   var path = svg.selectAll("path")
         .data(partition(root).descendants())
       .enter().append("path")
         .attr("d", arc)
         .attr("class", "path")
         .style("fill", function (d) { return color((d.children ? d : d.parent).data.name); })
       .on("click", click)
       .on('mouseover', function(d) {
         var total = d.parent.value;
         var percent = Math.round(1000 * d.value / total) / 10;
         console.log("label",d.data.name);
         console.log("value",d.value);
         console.log("percent",d.percent);
         tooltip.select('.label').html(d.data.name);
         tooltip.select('.count').html(d.value);
         tooltip.select('.percent').html(percent + '%');
         tooltip.style('display', 'block');
       })
       .on('mouseout', function() {
         tooltip.style('display', 'none');
       })
       .on('mousemove', function(d) {
         tooltip.style('position', 'absolute');
         tooltip.style('top', (d3.event.layerY+600 + 10)+ 'px');
         tooltip.style('left', (d3.event.layerX +1500+ 10)+ 'px');
     })
     .transition()
      .duration(function(d, i) {
      return i * 800;
    })
    .attrTween('d', function(d) {
      var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
      return function(t) {
          d.endAngle = i(t);
        return arc(d);
      }
   });

   d3.select(self.frameElement).style("height", height + "px");


   var legendContainer = d3.select("#legend").append("div").classed("legends clearfix", true);

   var legendsun = legendContainer.selectAll(".legend")
     .data(root.children)
     .enter()
     .append('div')
     .attr('class', 'legend');

   rect = legendsun.append('div').classed('rect', true)
     .style('background-color', function(d) { return color(d.data.name); })
     .style('border', function (d) { return '1px solid'; })
     .on('click', function (d) {
       var rect = d3.select(this);

       var totalEnabled = d3.sum(root.children.map(function(d) {
         return (d.data.enabled ) ? 1 : 0;
        }))

       if (rect.classed('clicked')) {
         rect.classed('clicked', false)
           .style('background-color', function(d) { return color(d.data.name); });
           d.data.enabled = true;

       } else {
         rect.classed('clicked', true)
           .style('background-color', 'transparent');
           d.data.enabled = false;
       }

       var enabledCategory = Object.assign({}, d)
       enabledCategory = d3.hierarchy(enabledCategory.parent.data)


       enabledCategory.children = []

       d.parent.children.forEach(function(child){
         if (child.data.enabled === true) {
           enabledCategory.children.push(child);
         }
       })

       enabledCategory.sum(function(d) {
         if (d.size) {
           total += d.size
         }
         return d.size;
       });

       redraw(enabledCategory)


       })


   legendsun.append('span')
     .text(function(d) { return d.data.name; })

   svg.append("text")
      .attr("class", "total")
      .attr("text-anchor", "middle")
        .attr('font-size', '2em')
        .attr('y', 20)
        .style("fill","rgba(7, 122, 237,1)")
      .text(total);



   var drawArc = d3.arc()
         .innerRadius(function(d, i) {
           return  arcMin + i*(arcWidth) + arcPad;
         })
         .outerRadius(function(d, i) {
           return arcMin + (i+1)*(arcWidth);
         })
         .startAngle(0 * (Math.PI/180))
         .endAngle(function(d, i) {
           return Math.floor((d*6 * (PI/180))*1000)/1000;
         });


   function redraw(d) {
     console.log("function redraw");

     svg.transition()
         .duration(750)
         .tween("scale", function() {
           var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
               yd = d3.interpolate(y.domain(), [d.y0, 1]),
               yr = d3.interpolate(y.range(), [d.y0 ? (radius/2) : 0, radius]);
           return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
         })
       .selectAll("path")
         .attrTween("d", function(d) { return function() { return arc(d); }; });

     d3.select(".total").text(d.value);
   }


   function click(d) {
     console.log("function click");
     console.log("d.y0 = " + d.y0);

     svg.transition()
         .duration(750)
         .tween("scale", function() {
           var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
               yd = d3.interpolate(y.domain(), [d.y0, 1]),
               yr = d3.interpolate(y.range(), [d.y0 ? (80) : 0, radius]);
           return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
         })
       .selectAll("path")
         .attrTween("d", function(d) { return function() { return arc(d); }; });
     d3.select(".total").text(d.value);
   }


   function getRootmostAncestorByWhileLoop(node) {
       while (node.depth > 1) node = node.parent;
       return node;
   }

  }

function displayCountrySunBurst()
{
 d3.queue().defer(d3.json, "/getDataSun?stateSymbol=All")
.await(drawsunburst);
}

displayCountrySunBurst();