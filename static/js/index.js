var bar_div=d3.select("body")
.append("div")
.attr("id","barchart")
.attr("class","barchart")

var svg=bar_div.append("svg")
.attr("id","barsvg")
.attr("width",900)
.attr("height",500)

var margin=100;
    width=svg.attr("width")-margin,
    height=svg.attr("height")-margin;
    console.log(width,height);

var pcp_div=d3.select("body")
    .append("div")
    .attr("id","pcp")
    .attr("class","pcp")
    
var pcp_svg=pcp_div.append("svg")
    .attr("id","pcpsvg")
    .attr("width",1500)
    .attr("height",500)

var pcp_margin=100;
    pcp_width=pcp_svg.attr("width")-pcp_margin,
    pcp_height=pcp_svg.attr("height")-pcp_margin;
    console.log(pcp_width,pcp_height);

 var g=svg.append("g").attr("transform","translate(0,0)");
 var pcp_g=pcp_svg.append("g").attr("transform","translate(0,0)");

 var xCatScale= d3.scaleBand().range([0,width-50]);
 var yLinearScale=d3.scaleLinear().range([height-100,50])
 barchart()
 pcpPlot()
 function barchart(){
    constructXY()
    plotCatXScale();
    plotLinearYScale()
    var rects=g.selectAll("rect");
    // bars
    rects
    .data(xy)
    .enter()
    .append("rect")
    .attr("class","bar")
     .on("mouseover",barMouseOver)
     .on("mouseout",barMouseOut)
    .transition()
    .duration(1000)
    .attr("x",xy => xCatScale(xy[0])+100+xCatScale.bandwidth()/8)
    .attr("y",xy => yLinearScale(xy[1]))
    .attr("width",3*xCatScale.bandwidth()/4)
    .attr("height",d => height -100- yLinearScale(d[1]));
 }

 
function constructXY(){
    console.log(statewise_accidents)
    x_keys=d3.map(statewise_accidents).keys();
    console.log("x,y,",x_keys.length);
    xy=[]
    console.log(statewise_accidents)
    for(var i=0;i<x_keys.length;i++){
        xy[i]=[x_keys[i],statewise_accidents[x_keys[i]]];
    }
    console.log(xy)
    
}

function plotCatXScale(){
    // x-axis
    console.log(xy.length);
    var xDomain=xy.map(d=> d[0]);
    console.log("values",xDomain.length);
    xCatScale.domain(xDomain);
    var xg=g.append("g")
    .attr("class","xtick")
    .attr("transform","translate(100,"+ (height-100) +")");
    xg.call(d3.axisBottom(xCatScale))
    .selectAll("text")
    .attr("y", 0)
    .attr("x", 55)
    .attr("transform","rotate(90)")
    .transition()
    .duration(1000);

    setXAxisLabel();
}

function setXAxisLabel(){
    g.append("text")
    .attr("x", 100+width/2)
    .attr("y", height+50)
    .attr("text-anchor", "start")
    .text("States")
    .attr("class","xlabel");

}

function plotLinearYScale(){
 
    var maxY=d3.max(xy, d=> Number(d[1])), 
    minY=d3.min(xy, d=> Number(d[1]));
   yLinearScale.domain([minY,11*maxY/10]); // To make sure max ytick is above the bar length

   var yg=g.append("g")
   .attr("class","ytick")
   .attr("transform","translate(100,0)")
   .transition()
   .duration(1000);
   yg.call(d3.axisLeft(yLinearScale).ticks(10));
   setYAxisLabel("Accidents");
}


function setYAxisLabel(text){

    g.append("text")
    .attr("transform","rotate(-90)")
    .attr("x","-200")
    .attr("y",height/4)
   
    .attr("dy", "-5.1em")     
         .attr("text-anchor", "end")
         .text(text)
         .attr("class","ylabel");
}

function barMouseOver(d,i) {
    d3.select(this).attr("class","redbar");
    var x=getXOfBar(d);
    var y=getYOfbar(d);
    mouseover(x,y,d[1]);
}

function barMouseOut(d,i){
    d3.select(this).attr("class","bar");
    var x=getXOfBar(d);
    var y=getYOfbar(d);
    mouseout(x,y);
}

function mouseover(x,y,t){
    
    g.append("text").text(t)
    .attr("id","t"+Math.ceil(x)+"-"+Math.ceil(y))
    .attr("x",x)
    .attr("y",y);
}

function mouseout(x,y){
    d3.select("#t"+Math.ceil(x)+"-"+Math.ceil(y)).remove();
}

function getXOfBar(d){
    return xCatScale(d[0])+100+3*xCatScale.bandwidth()/8;
}

function getYOfbar(d){
    return yLinearScale(d[1])-10;
}


function pcpPlot(){
    //clear()
    d3.json('/get-full-data',function(data){
        console.log(data)
        var dimensions=d3.keys(data[0])
        dimensions.pop()
        console.log(data,"dim",dimensions);
        var y={}, 
        dragging={},
        numeric={}

        for(i=0;i<dimensions.length;i++){
            col=dimensions[i]
           if(isNum(col)){
            //console.log(col,d3.min(data.data,d=>d[i]),d3.max(data.data,d=>d[i]))
            y[col]=d3.scaleLinear()
            .domain([d3.min(data,d=>d[col]),d3.max(data,d=>d[col])])
            .range([pcp_height,50])
            numeric[col]=true
           }
           else{
               y[col]=d3.scaleBand()
               .domain(data.map(d=>d[col]))
               .range([pcp_height,50])
               numeric[col]=false
           }

        }


        var xPointScale=d3.scalePoint()
        .range([50,pcp_width-50])
        .domain(dimensions);
        

        var color = ["slateblue", "green", "orange","yellow", "black", "grey", "darkgreen", "pink", "brown", "slateblue", "grey1","gold",]
        
// Add grey background lines for context.
// background = svg.append("g")
// .attr("class", "background")
// .selectAll("path")
// .data(data)
// .enter().append("path")
// .attr("d", path);
        
        var paths=pcp_g.selectAll("myPath")
        .data(data)
        .attr("class", "foreground")
        .enter()
        .append("path")
        .attr("d",path)
        .style("fill","none")
        .style("stroke", d=>color[d["label"]])
        .style("opacity",0.5)
        
        var grp=pcp_g.selectAll("myAxis")

    .data(dimensions).enter()
    .append("g")
    .attr("transform", function(d) { return "translate(" + xPointScale(d) + ")"; })
    .call(d3.drag()
    // .origin(function(d){
    //     return {x:xPointScale(d)};
    // })
    .on("start",function(d){
        dragging[d]=xPointScale(d)

      //  background.attr("visibility", "hidden");
    })
    .on("drag",function(d){
        dragging[d]=Math.min(pcp_width,Math.max(0,d3.event.x));
        paths.attr("d",path);
        dimensions.sort(function(a,b){ return position(a)-position(b);})
        xPointScale.domain(dimensions);
        grp.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
    })
    .on("end",function(d){
        delete dragging[d];
        transition(d3.select(this)).attr("transform","translate("+xPointScale(d)+")")

        // transition(paths).attr("d", path);
        //   background
        //       .attr("d", path)
        //     .transition()
        //       .delay(500)
        //       .duration(0)
        //       .attr("visibility", null);
    })
    );
    grp.append("g")
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })

    
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", 40)
      .text(function(d) { return d; })
      .style("fill", "black")

    //   g.append("g")
    //   .attr("class", "brush")
    //   .each(function(d) {
    //     d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
    //   })
    // .selectAll("rect")
    //   .attr("x", -8)
    //   .attr("width", 16);



      function isNum(col){
        threshold=10
        var keys=d3.map(data, d=>d[col]).keys();
        console.log(col,((keys.length>=threshold) && (isNaN(data[0][col]) == false)))
        return ((keys.length>=threshold) && (isNaN(data[0][col]) == false));
    }

    function position(d) {
        var v = dragging[d];
        // get scale and return x co-ord
        return v == null ? xPointScale(d) : v;
      }

    function path(d,i){

    return d3.line()(dimensions.map(function(p,i){ 
        if(numeric[p]==true)
        return [xPointScale(p),y[p](d[p])]
        else
        return [xPointScale(p),y[p](d[p])+y[p].bandwidth()/2]
    }))
        
    }
    
    function transition(g) {
        return g.transition().duration(500);
      }

    //   function brushstart() {
    //     d3.event.sourceEvent.stopPropagation();
    //   }

    //   function brush() {
    //     var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
    //         extents = actives.map(function(p) { return y[p].brush.extent(); });
    //         paths.style("display", function(d) {
    //       return actives.every(function(p, i) {
    //         return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    //       }) ? null : "none";
    //     });
    //   }
      

    }
    )    
}

