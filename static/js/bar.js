var bar_div=d3.select("body")
.append("div")
.attr("id","barchart")
.attr("class","barchart")

var bar_svg=bar_div.append("svg")
.attr("id","barsvg")
.attr("width",900)
.attr("height",500)
.style("background-color","beige")

var bar_margin=100;
    bar_width=bar_svg.attr("width")-bar_margin,
    bar_height=bar_svg.attr("height")-bar_margin;
    console.log(bar_width,bar_height);

var data=""
var g=bar_svg.append("g").attr("transform","translate(0,0)");
bar_chart(true,"");
function bar_chart(is_full_data,state){
    console.log("bar chart",is_full_data)
    if(is_full_data){
        data=statewise_accidents
        bar_chart_data()
    }
    else{
        console.log("state in bar",state)
        d3.json('/countybar?'+"state_sym="+state, function(err,countywise_map){
            data=countywise_map
            bar_chart_data()
        });
    }
}
function bar_chart_data(){
    g.remove();
  g=bar_svg.append("g").attr("transform","translate(0,0)");
 var xCatScale= d3.scaleBand().range([0,bar_width-50]);
 var yLinearScale=d3.scaleLinear().range([bar_height-100,50])
 
 
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
    .attr("height",d => bar_height -100- yLinearScale(d[1]));

 
function constructXY(){
    console.log(data)
    x_keys=d3.map(data).keys();
    console.log("x,y,",x_keys.length);
    xy=[]
    console.log(data)
    for(var i=0;i<x_keys.length;i++){
        xy[i]=[x_keys[i],data[x_keys[i]]];
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
    .attr("transform","translate(100,"+ (bar_height-100) +")");
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
    .attr("x", 100+bar_width/2)
    .attr("y", bar_height+50)
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
    .attr("y",bar_height/4)
   
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

}