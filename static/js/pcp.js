var pcp_full_data=0;

var pcp_margin = {top: 66, right: 110, bottom: 20, left: 70},
    pcp_width = 900 - pcp_margin.left - pcp_margin.right,
    pcp_height = 340 - pcp_margin.top - pcp_margin.bottom,
    innerHeight = pcp_height - 2;
var container = d3.select("#pcp_div")
    .attr("class", "parcoords")
    .style("width", pcp_width + pcp_margin.left + pcp_margin.right + "px")
    .style("height", pcp_height + pcp_margin.top + pcp_margin.bottom + "px");


var pcp_div=d3.select("#pcp_div");
var pcp_svg = container.append("svg")
    .attr("width", pcp_width + pcp_margin.left + pcp_margin.right)
    .attr("height", pcp_height + pcp_margin.top + pcp_margin.bottom)
    // .style("background-color","white");

    var pcp_g = pcp_svg
  .append("g")
    .attr("transform", "translate(" + pcp_margin.left + "," + pcp_margin.top + ")");
pcpplot(true,"")

function pcpplot(is_full_data,state){
    pcp_g.remove();

var devicePixelRatio = window.devicePixelRatio || 1;

var pcp_color = d3.scaleOrdinal(d3.schemeCategory20)
  .domain(["1", "2", "3", "4"])
  //.range(["rgba(7, 122, 237,0.4)","rgba(7, 122, 237,0.60)","rgba(7, 122, 237,0.80)","rgba(7, 122, 237,1)"])
  // .range(["#DB7F85", "#50AB84", "#4C6C86", "#C47DCB", "#B59248", "#DD6CA7", "#E15E5A", "#5DA5B3", "#725D82", "#54AF52", "#954D56", "#8C92E8", "#D8597D", "#AB9C27", "#D67D4B", "#D58323", "#BA89AD", "#357468", "#8F86C2", "#7D9E33", "#517C3F", "#9D5130", "#5E9ACF", "#776327", "#944F7E"]);

var types = {
  "Number": {
    key: "Number",
    coerce: function(d) { return +d; },
    extent: d3.extent,
    within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
    defaultScale: d3.scaleLinear().range([innerHeight, 0])
  },
  "String": {
    key: "String",
    coerce: String,
    extent: function (data) { return data.sort(); },
    within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
    defaultScale: d3.scalePoint().range([0, innerHeight])
  },
  "Date": {
    key: "Date",
    coerce: function(d) { return new Date(d); },
    extent: d3.extent,
    within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
    defaultScale: d3.scaleTime().range([innerHeight, 0])
  }
};


var dimensions = [
  {
    key: "Severity",
    description: "Severity",
    type: types["String"],
    axis: d3.axisLeft()
      .tickFormat(function(d,i) {
        return d;
      })
  },
  {
    key: "Precipitation(in)",
    description: "Precipitation(in)",
    type: types["Number"]
  },
  {
    key: "Temperature(F)",
    type: types["Number"],
    description: "Temperature(F)",
    type: types["Number"]
  },
  {
    key: "Wind_Speed(mph)",
    description: "Wind_Speed(mph)",
    type: types["Number"]
  },
  {
    key: "Visibility(mi)",
    type: types["Number"],
    description: "Visibility(mi)",
    type: types["Number"]
  },

  {
    key: "Humidity(%)",
    description: "Humidity(%)",
    type: types["Number"]
  },
  {
    key: "Pressure(in)",
    description: "Pressure(in)",
    type: types["Number"]
  },
  {
    key: "Wind_Chill(F)",
    description: "Wind_Chill(F)",
    type: types["Number"]
  }
];


var xscale = d3.scalePoint()
    .domain(d3.range(dimensions.length))
    .range([0, pcp_width]);

var yAxis = d3.axisLeft();

console.log("inside",pcp_div)
// container = pcp_div
//     .attr("class", "parcoords")
//     .style("width", pcp_width + pcp_margin.left + pcp_margin.right + "px")
//     .style("height", pcp_height + pcp_margin.top + pcp_margin.bottom + "px");

pcp_g = pcp_svg
  .append("g")
    .attr("transform", "translate(" + pcp_margin.left + "," + pcp_margin.top + ")");

var canvas = container.append("canvas")
    .attr("width", pcp_width * devicePixelRatio)
    .attr("height", pcp_height * devicePixelRatio)
    .style("width", pcp_width + "px")
    .style("height", pcp_height + "px")
    .style("margin-top", pcp_margin.top + "px")
    .style("margin-left", pcp_margin.left + "px");

var ctx = canvas.node().getContext("2d");
ctx.globalCompositeOperation = 'darken';
ctx.globalAlpha = 0.15;
ctx.lineWidth = 1.5;
ctx.scale(devicePixelRatio, devicePixelRatio);

//var output = d3.select("body").append("pre");

var axes = pcp_g.selectAll(".axis")
    .data(dimensions)
  .enter().append("g")
    .attr("class", function(d) { return "axis " + d.key.replace(/ /g, "_"); })
    .attr("transform", function(d,i) { return "translate(" + xscale(i) + ")"; });



d3.json("/get-full-data", function(error, data) {
    if(is_full_data){
        pcp_full_data=data
    }
    else{
        console.log(data[0].State,data[0].State=='ND',state)
        data = data.filter( function(d) {
            return d.State==state;
          } );
    }
  if (error) throw error;

  data.forEach(function(d) {
    dimensions.forEach(function(p) {
      d[p.key] = !d[p.key] ? null : p.type.coerce(d[p.key]);
    });

    // truncate long text strings to fit in data table
    for (var key in d) {
      if (d[key] && d[key].length > 35) d[key] = d[key].slice(0,36);
    }
  });
  
  

  //type/dimension default setting happens here
  dimensions.forEach(function(dim) {
    if (!("domain" in dim)) {
      // detect domain using dimension type's extent function
      dim.domain = d3_functor(dim.type.extent)(data.map(function(d) { return d[dim.key]; }));
    }
    if (!("scale" in dim)) {
      // use type's default scale for dimension
      dim.scale = dim.type.defaultScale.copy();
    }
    dim.scale.domain(dim.domain);
  });

  var render = renderQueue(draw).rate(30);

  ctx.clearRect(0,0,pcp_width,pcp_height);
  ctx.globalAlpha = d3.min([1.15/Math.pow(data.length,0.3),1]);
  render(data);

  axes.append("g")
      .each(function(d) {
        var renderAxis = "axis" in d
          ? d.axis.scale(d.scale)  // custom axis
          : yAxis.scale(d.scale);  // default axis
        d3.select(this).call(renderAxis);
      })
    .append("text")
      .attr("class", "title")
      .attr("text-anchor", "start")
      .text(function(d) { return "description" in d ? d.description : d.key; });

  // Add and store a brush for each axis.
  axes.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(d.brush = d3.brushY()
          .extent([[-10,0], [10,pcp_height]])
          .on("start", brushstart)
          .on("brush", brush)
          .on("end", brush)
        )
      })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);

  d3.selectAll(".axis.Severity .tick text")
    .style("fill", pcp_color);
    
  //output.text(d3.tsvFormat(data.slice(0,24)));

  function project(d) {
    return dimensions.map(function(p,i) {
      // check if data element has property and contains a value
      if (
        !(p.key in d) ||
        d[p.key] === null
      ) return null;

      return [xscale(i),p.scale(d[p.key])];
    });
  };

  function draw(d) {
    ctx.strokeStyle = pcp_color(d.Severity);
    ctx.beginPath();
    var coords = project(d);
    coords.forEach(function(p,i) {
      // this tricky bit avoids rendering null values as 0
      if (p === null) {
        // this bit renders horizontal lines on the previous/next
        // dimensions, so that sandwiched null values are visible
        if (i > 0) {
          var prev = coords[i-1];
          if (prev !== null) {
            ctx.moveTo(prev[0],prev[1]);
            ctx.lineTo(prev[0]+6,prev[1]);
          }
        }
        if (i < coords.length-1) {
          var next = coords[i+1];
          if (next !== null) {
            ctx.moveTo(next[0]-6,next[1]);
          }
        }
        return;
      }
      
      if (i == 0) {
        ctx.moveTo(p[0],p[1]);
        return;
      }

      ctx.lineTo(p[0],p[1]);
    });
    ctx.stroke();
  }

  function brushstart() {
    d3.event.sourceEvent.stopPropagation();
  }

  // Handles a brush event, toggling the display of foreground lines.
  function brush() {
    render.invalidate();

    var actives = [];
    pcp_g.selectAll(".axis .brush")
      .filter(function(d) {
        return d3.brushSelection(this);
      })
      .each(function(d) {
        actives.push({
          dimension: d,
          extent: d3.brushSelection(this)
        });
      });

    var selected = data.filter(function(d) {
      if (actives.every(function(active) {
          var dim = active.dimension;
          // test if point is within extents for each active brush
          return dim.type.within(d[dim.key], active.extent, dim);
        })) {
        return true;
      }
    });

    // show ticks for active brush dimensions
    // and filter ticks to only those within brush extents
    /*
    pcp_svg.selectAll(".axis")
        .filter(function(d) {
          return actives.indexOf(d) > -1 ? true : false;
        })
        .classed("active", true)
        .each(function(dimension, i) {
          var extent = extents[i];
          d3.select(this)
            .selectAll(".tick text")
            .style("display", function(d) {
              var value = dimension.type.coerce(d);
              return dimension.type.within(value, extent, dimension) ? null : "none";
            });
        });

    // reset dimensions without active brushes
    pcp_svg.selectAll(".axis")
        .filter(function(d) {
          return actives.indexOf(d) > -1 ? false : true;
        })
        .classed("active", false)
        .selectAll(".tick text")
          .style("display", null);
    */

    ctx.clearRect(0,0,pcp_width,pcp_height);
    ctx.globalAlpha = d3.min([0.85/Math.pow(selected.length,0.3),1]);
    render(selected);

    //output.text(d3.tsvFormat(selected.slice(0,24)));
  }
});
}
function d3_functor(v) {
  return typeof v === "function" ? v : function() { return v; };
};