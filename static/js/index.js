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

// var pcp_div=d3.select("body")
//     .append("div")
//     .attr("id","pcp")
//     .attr("class","pcp")
    
// var pcp_svg=pcp_div.append("svg")
//     .attr("id","pcpsvg")
//     .attr("width",1500)
//     .attr("height",450)

// var pcp_margin=100;
//     pcp_width=pcp_svg.attr("width")-pcp_margin,
//     pcp_height=pcp_svg.attr("height")-pcp_margin;
//     console.log(pcp_width,pcp_height);

 var g=svg.append("g").attr("transform","translate(0,0)");
 //var pcp_g=pcp_svg.append("g").attr("transform","translate(0,0)");

 var xCatScale= d3.scaleBand().range([0,width-50]);
 var yLinearScale=d3.scaleLinear().range([height-100,50])
 barchart()
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
    .attr("y", -5)
    .attr("x", 58)
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
    .attr("x",x-5)
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

