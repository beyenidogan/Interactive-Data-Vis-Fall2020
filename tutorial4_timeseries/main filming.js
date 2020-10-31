/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 3,
  default_borough = "All Boroughs";
  default_type = "Shooting Permit";
  default_agg = "Yearly"

/** these variables allow us to access anything we manipulate in
 * init() but need access to in draw().
 * All these variables are empty before we assign something to them.*/
let svg;
let xScale;
let yScale;
let xAxis;
let yAxis;
let formatYear = d3.timeFormat("%Y")
let formatYMonth = d3.timeFormat("%Y-%m")
let formatMonth = d3.timeFormat("%B")
let formatYWeek = d3.timeFormat("%Y-%U")
let formatWeek = d3.timeFormat("%U")

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
  selectedBorough: null,
  showby:"Yearly"
};


/**
 * LOAD DATA
 * */
d3.csv("../data/Film_Permits.csv", d => {
  const date = new Date(d.StartDateTime)
  const zipcodes = d.ZipCodes?.split(", ")
  return ({
    event:d.EventID,
    date,
    year: formatYear(date),
    ymonth: formatYMonth(date),
    month:formatMonth(date),
    yweek: formatYWeek(date),
    week: formatWeek(date),
    Borough: d.Borough,
    ZipCodes: d.ZipCodes,
    parsedZips: zipcodes,
    Category:d.Category,
    SubCategory: d.SubCategoryName,
    EventType:d.EventType,
  })
}).then(raw_data => {
  console.log("raw_data", raw_data);
  state.data = raw_data;
  console.log("state_data",state.data)

  init();
});

console.log(state.data,d=>d.year)
console.log("state_data",state.data)


/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {

  function aggregateby(data, showby) {
    switch (showby) {
      case "Yearly":
        return d3.nest()
        .key(d=>d.year).sortKeys(d3.ascending)
        .rollup(ids=>ids.length)
        .entries(data)
      case "Monthly":
        return d3.nest()
        .key(d=>d.ymonth).sortKeys(d3.ascending)
        .rollup(ids=>ids.length)
        .entries(data)
      case "Weekly":
      return  d3.nest()
      .key(d=>d.yweek).sortKeys(d3.ascending)
      .rollup(ids=>ids.length)
      .entries(data)
    }
  }
  function period(data, showby) {
    switch (showby) {
      case "Yearly":
        return data.year
      case "Monthly":
        return data.ymonth
      case "Weekly":
      return  data.yweek
    }
  }

/*   let year_agg= d3.nest()
    .key(d=>d.year).sortKeys(d3.ascending)
    .rollup(ids=>ids.length)
    .entries(state.data)

  console.log("year_agg",year_agg);
  
  let month_agg= d3.nest()
    .key(d=>d.ymonth).sortKeys(d3.ascending)
    .rollup(ids=>ids.length)
    .entries(state.data)

  console.log("month_agg",month_agg);

  let week_agg= d3.nest()
  .key(d=>d.yweek).sortKeys(d3.ascending)
  .rollup(ids=>ids.length)
  .entries(state.data) 

  console.log("week_agg",week_agg);
  */

console.log(state.data.ymonth)
  console.log(aggregateby(state.data, state.showby).key)
  console.log(Object.values(aggregateby(state.data, state.showby)))

 // SCALES
 xScale = d3
 .scaleLinear()
 .domain(d3.extent(state.data, d => period(d, state.showby)))
 .range([margin.left, width - margin.right]);

console.log(xScale(2014))

yScale = d3
 .scaleLinear()
 .domain([0, d3.max(state.data, d => aggregateby(d, state.showby))])
 .range([height - margin.bottom, margin.top]);
 
 console.log(yScale(5000))

  // AXES
  xAxis = d3.axisBottom(xScale).tickFormat((d)=>d.toString());
  yAxis = d3.axisLeft(yScale).tickFormat((d)=>d.toString());;

  // UI ELEMENT SETUP
  //Dropdown1
  const dropdown1 = d3.select("#dropdown1").on("change", function() {
    console.log("new selected entity is", this.value);
    // `this` === the selectElement
    // this.value holds the dropdown value a user just selected
    state.selectedBorough = this.value;
    draw(); // re-draw the graph based on this new selection
  }); 
 
  // add in dropdown options from the unique values in the data
  dropdown1
    .selectAll("option")
    .data([
      default_borough,
      ...Array.from(new Set(state.data.map(d => d.Borough))),
      
    ])
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // this ensures that the selected value is the same as what we have in state when we initialize the options
  dropdown1.property("value", default_borough);
  
  //Dropdown2
  const dropdown2 = d3.select("#dropdown2").on("change", function() {
    console.log("new selected entity is", this.value);
    // `this` === the selectElement
    // this.value holds the dropdown value a user just selected
    state.showby = this.value;
    console.log("also the selected period is", state.showby);
    xScale.domain(d3.extent(state.data, d => period(d, state.showby)))
    draw(); // re-draw the graph based on this new selection
  }); 
 
  console.log(period(state.data, state.showby))
  // add in dropdown options from the unique values in the data
  dropdown2
  .selectAll("option")
  .data(["Yearly","Monthly","Weekly"])
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
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dy", "3em")
    .text("Year");

  // add the yAxis
  svg
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", "-3em")
    .attr("writing-mode", "vertical-rl")
    .text("Population");

  draw(); // calls the draw function
}

/*
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */

 
function draw() {
  // filter the data for the selectedParty
  let filteredData = [];
  if (state.selectedCountry !== null) {
    filteredData = state.data.filter(d => d.country === state.selectedCountry);
  }

  // update the scale domain (now that our data has changed)
  yScale.domain([0, d3.max(filteredData, d => d.population)]);
  xScale.domain(d3.extent(state.data, d => period(d, state.showby)))
  // re-draw our yAxix since our yScale is updated with the new data
  d3.select("g.x-axis")
    .transition()
    .duration(1000)
    .call(xAxis.scale(xScale)); // this updates the yAxis' scale to be our newly updated one

  // we define our line function generator telling it how to access the x,y values for each point
  const lineFunc = d3
    .line()
    .x(d => xScale(d => d.key))
    .y(d => yScale(d=>+d.values));



/*   var valueLine = d3.line()
    .x(function(d) { return x(d.key); })
    .y(function(d) { return y(+d.values); }) */

/* // Add the path element
  svg.selectAll(".line")
      .data(year_agg)
      .enter()
      .append("path")
        .attr("class", "line")
        .attr("d", valueLine )
  //     .attr("stroke", function(d){ return colors(d.key)})
*/
  
/*
  const dot = svg
    .selectAll(".dot")
    .data(filteredData, d => d.year) // use `d.year` as the `key` to match between HTML and data elements
    .join(
      enter =>
        // enter selections -- all data elements that don't have a `.dot` element attached to them yet
        enter
          .append("circle")
          .attr("class", "dot") // Note: this is important so we can identify it in future updates
          .attr("r", radius)
          .attr("cy", height - margin.bottom) // initial value - to be transitioned
          .attr("cx", d => xScale(d.year)),
      update => update,
      exit =>
        exit.call(exit =>
          // exit selections -- all the `.dot` element that no longer match to HTML elements
          exit
            .transition()
            .delay(d => d.year)
            .duration(500)
            .attr("cy", height - margin.bottom)
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
          .attr("cy", d => yScale(d.population)) // started from the bottom, now we're here
    );

  const line = svg
    .selectAll("path.trend")
    .data([filteredData])
    .join(
      enter =>
        enter
          .append("path")
          .attr("class", "trend")
          .attr("opacity", 0), // start them off as opacity 0 and fade them in
      update => update, // pass through the update selection
      exit => exit.remove()
    )
    .call(selection =>
      selection
        .transition() // sets the transition on the 'Enter' + 'Update' selections together.
        .duration(1000)
        .attr("opacity", 1)
        .attr("d", d => lineFunc(d))
    );*/
} 