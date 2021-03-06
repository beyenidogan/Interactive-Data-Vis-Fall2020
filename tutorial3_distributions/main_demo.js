/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.9,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 5;

  console.log('width',width)
// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;


/* APPLICATION STATE */
let state = {
  data: [],
  selectedParty: "All" // + YOUR FILTER SELECTION
};

/* LOAD DATA */
d3.json("../data/environmentRatings.json", d3.autoType).then(raw_data => {
  // + SET YOUR DATA PATH
  console.log("raw_data", raw_data);
  state.data = raw_data; 
  init();
});
 console.log("margin left", margin.left)
 console.log("margin right",width-margin.right)
/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in 
function init() {
  // + SCALES
  xScale=d3.scaleLinear()
    .domain(d3.extent(state.data, d => d.ideology_rating))
    .range([margin.left, width-margin.right])

  yScale=d3.scaleLinear()
//    .domain([0,100])
    .domain(d3.extent(state.data, d => d.environmental_rating))
    .range([height-margin.bottom,margin.top])

  // + AXES

const xAxis=d3.axisBottom(xScale)
.ticks(5)

const yAxis=d3.axisLeft(yScale)
.ticks(5);


  // + UI ELEMENT SETUP

  const selectElement = d3.select("#dropdown").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected

    state.selectedParty = this.value;
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data(["All", "D", "R", "I"]) // + ADD UNIQUE VALUES
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // + CREATE SVG ELEMENT

  svg=d3.select("#d3-container")
  .append("svg")
  .attr("width",width)
  .attr("height",height);

  // + CALL AXES

/*   svg.append("g")
  .attr("class","x-axis")
  .attr("transform","translate(0,"+(width)+")")
  .call(xAxis);   

  svg.append("g")
  .attr("class","y-axis")
  .attr("transform","translate("+(height)+",0)")
  .call(yAxis); */
  svg
  .append("g")
  .attr("class", "axis x-axis")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(xAxis)
  .append("text")
  .attr("class", "axis-label")
  .attr("x", "50%")
  .attr("dy", "3em")
  .text("Ideology Rating");

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
  .text("Environmental Rating");


  draw(); // calls the draw function
}

/* DRAW FUNCTION */
 // we call this everytime there is an update to the data/state

function draw() {
  
  // + FILTER DATA BASED ON STATE
  let filteredData = state.data;
  // if there is a selectedParty, filter the data before mapping it to our elements
  if (state.selectedParty !== "All") {
    filteredData = state.data.filter(d => d.party === state.selectedParty);
  }


const dot = svg
   .selectAll("circle")
   .data(filteredData, d => d.name)
    .join(
      enter =>
        // enter selections -- all data elements that don't have a `.dot` element attached to them yet
        enter
          .append("circle")
          .attr("class", "dot") // Note: this is important so we can identify it in future updates
          .attr("stroke", "lightgrey")
          .attr("opacity", 0.5)
          .attr("fill", d => {
            if (d.party === "D") return "blue";
            else if (d.party === "R") return "red";
            else return "purple";
          })
          .attr("r", radius)
          .attr("cy", d => yScale(d.environmental_rating))
          .attr("cx", d => margin.left) // initial value - to be transitioned
          .call(enter =>
            enter
              .transition() // initialize transition
              .delay(d => 500 * d.ideology_rating) // delay on each element
              .duration(500) // duration 500ms
              .attr("cx", d => xScale(d.ideology_rating))
          ),
      update =>
        update.call(update =>
          // update selections -- all data elements that match with a `.dot` element
          update
            .transition()
            .duration(250)
            .attr("stroke", "black")
            .transition()
            .duration(250)
            .attr("stroke", "lightgrey")
        ),
      exit =>
        exit.call(exit =>
          // exit selections -- all the `.dot` element that no longer match to HTML elements
          exit
            .transition()
            .delay(d => 50 * d.ideology_rating)
            .duration(500)
            .attr("cx", width)
            .remove()
        )
   );
}
