/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 3,
  default_borough = "Select Borough";

/** these variables allow us to access anything we manipulate in
 * init() but need access to in draw().
 * All these variables are empty before we assign something to them.*/
let svg;
let xScale;
let yScale;
let xAxis;
let xAxis2;
let yAxis;
let lineFunc;

/* 
this extrapolated function allows us to replace the "G" with "B" min the case of billions.
we cannot do this in the .tickFormat() because we need to pass a function as an argument, 
and replace needs to act on the text (result of the function). 
*/


/**
 * APPLICATION STATE
 * */
let state = {
  data: [],
  agg_data:[],
  selectedBorough: null,
};

let color = d3.scaleOrdinal(d3.schemeCategory10);
/**
 * LOAD DATA
 * */
d3.csv("../data/MedianAskingRent.csv", d3.autoType,
/* d => ({
  Rent:+d.Median_Rent,
}) */
)
.then(raw_data => {
 // d3.timeFormat("%Y-%m")(raw_data.Month);
  console.log("raw_data", raw_data);
  state.data = raw_data;
  console.log(state.data)
  init();
});


/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  // SCALES

  let s = new Date("2018-12-01T19:37:55Z");
  
  xScale = d3
    .scaleTime()
    .domain([s,d3.max(state.data, d => d.Month)])
    .range([margin.left, width - margin.right])


  yScale = d3
    .scaleLinear()
    .domain([0, d3.max(state.data, d => d.Median_Rent)*1.5])
    .range([height - margin.bottom, margin.top]);

  color=d3.scaleOrdinal()
      .domain(d3.extent(state.data, d => d.Borough))
      .range(["#fafbfc","#fa7fac","#48a6e0","#D68C71","#80F4CF","#c9e048"]);
  
  console.log(color("All Boroughs"))
  console.log(color("Bronx"))
  console.log(color("Brooklyn"))
  console.log(color("Manhattan"))
  console.log(color("Queens"))
  console.log(color("Staten Island"))


  // AXES
  xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")).ticks(13)
  xAxis2 = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")).ticks(2)
  yAxis = d3.axisLeft(yScale).tickFormat(d => "$" +d);
  
  // UI ELEMENT SETUP


  const selectBorough = d3.select("#dropdown1").on("change", function() {
    console.log("new selected entity is", this.value);
    // `this` === the selectElement
    // this.value holds the dropdown value a user just selected
    state.selectedBorough = this.value;
    
 
    draw(); // re-draw the graph based on this new selection
  });


  // add in dropdown options from the unique values in the data
  selectBorough
    .selectAll("option")
    .data(["Select Borough","Bronx","Brooklyn","Manhattan","Queens","Staten Island"])
    .join("option")
    .attr("value", d => d)
    .text(d => d);



  // create an svg element in our main `d3-container` element
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // add the xAxis
  svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .selectAll(".tick text")
    .attr("class", "months")
    .style("font", "8px")
  
  
  svg
    .append("g")
    .attr("class", "axis x-axis2")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis2)
    .selectAll(".tick text")
    .attr("class", "years")
    .attr("dy", "2em")
    .attr("dx", "0.5em")
    


  // add the yAxis
  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "-40%")
    .attr("fill","#eeeeee")
    .attr("dx", "4em")
    .attr("transform", "rotate(-180)")
    .attr("writing-mode", "vertical-rl")
    .text("Median Rent");

  draw(); // calls the draw function
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
  // filter the data for the selectedParty
  let filteredData = state.data;

  if (state.selectedBorough !== "All Boroughs" ) {
    filteredData= state.data.filter(d => d.Borough === state.selectedBorough);
  } 
  
/*   let byBorough=d3.nest()
  .key(d=>d.Borough)
  .entries(filteredData)

  console.log(byBorough) */

  let highlight = function(d) {
    if (d !== "All Boroughs"){return 1} else {return 2}
  }
  console.log(highlight("All Boroughs"))

  console.log(filteredData)
  
  // update the scale domain (now that our data has changed)
  yScale.domain([0, d3.max(filteredData, d => d.Median_Rent)]);

  // re-draw our yAxix since our yScale is updated with the new data
  d3.select("g.y-axis")
    .transition()
    .duration(1000)
    .call(yAxis.scale(yScale)); // this updates the yAxis' scale to be our newly updated one

  // we define our line function generator telling it how to access the x,y values for each point
  lineFunc = d3
    .line()
    .x(d => xScale(d.Month))
    .y(d => yScale(d.Median_Rent));

   const dot = svg
    .selectAll(".dot")
    .data(filteredData, d => "${d.Borough}_${d.Month}") // use `d.year` as the `key` to match between HTML and data elements
    .join(
      enter =>
        // enter selections -- all data elements that don't have a `.dot` element attached to them yet
        enter
          .append("circle")
          .attr("class", "dot") // Note: this is important so we can identify it in future updates
          .attr("r", d=>radius)
          .attr("cy", d => yScale(d.Median_Rent)) // initial value - to be transitioned
          .attr("fill", d => color(d.Borough))
          .attr("fill-opacity", 0.8)
          .attr("stroke", d => color(d.Borough))
          .attr("opacity", 0)
          .attr("cx", d => xScale(d.Month),
      update => update,
      exit =>
        exit.call(exit =>
          // exit selections -- all the `.dot` element that no longer match to HTML elements
          exit
            .transition()
            .duration(500)
            .remove()
        )
    )
    // the '.join()' function leaves us with the 'Enter' + 'Update' selections together.
    // Now we just need move them to the right place
    .call(
      selection =>
        selection
          .transition() // initialize transition
          .duration(1000) // duration 1000ms / 1s
          .attr("cy", d => yScale(d.Median_Rent))) // started from the bottom, now we're here
          .attr("opacity", 1) 
    );
 
  const line = svg
    .selectAll("path.trend")
   // .data([filteredData])
    .data([filteredData])
    .join(
      enter =>
        enter
          .append("path")
          .attr("class", "trend")
          .attr("fill", "none")
          .attr("stroke", "White")
          .attr("stroke-width", 2)
          .style("stroke-dasharray", ("1, 1")) 
          .attr("opacity", 0), // start them off as opacity 0 and fade them in
      update => update, // pass through the update selection
      exit => exit.remove()
    )
    .call(selection =>
      selection
        .transition() // sets the transition on the 'Enter' + 'Update' selections together.
        .duration(1000)
        //.ease("linear")
        .attr("opacity", 1)
        .attr("d", d => lineFunc(d))
    );
}