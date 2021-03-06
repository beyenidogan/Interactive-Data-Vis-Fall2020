/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.9,
  margin = { top: 20, bottom: 50, left: 200, right: 40 },
  radius = 5;

  console.log('width',width)
// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let colors;

/* APPLICATION STATE */
let state = {
  data: [],
  selectedQuestion: "Show All" ,// + YOUR FILTER SELECTION
};
console.log(state)

/* LOAD DATA */
d3.csv("../data/WEF_COVID_19_Risks_Outlook.csv", d3.autoType).then(raw_data => {
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
    .domain(d3.extent(state.data, d => d.Risk_Rating))
    .range([margin.left, width-margin.right])

  console.log("xScale - 20",d3.extent(xScale(20)))

  yScale=d3.scaleBand()
//    .domain([0,100])
    .domain(state.data.map(d => d.Risk_Summary))
    .range([height-margin.bottom,margin.top])


colors = d3.scaleOrdinal()
    .domain(state.data.map(d => d.Risk_Level))
    .range(["#3288BD", "#66C2A5", "#ABDDA4"]);

    console.log("scaleOrdinal",colors("High"),colors("Medium"),colors("Low"))
// + AXES

const xAxis=d3.axisBottom(xScale)
.ticks(10)

const yAxis=d3.axisLeft(yScale)

  // + UI ELEMENT SETUP

  const selectCategory = d3.select("#dropdown1").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected

    state.selectedCategory = this.value;
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });

  const selectQuestion = d3.select("#dropdown2").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected

    state.selectedQuestion = this.value;
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });

const selectRatingLevel = d3.select("#dropdown3").on("change", function() {
  // `this` === the selectElement
  // 'this.value' holds the dropdown value a user just selected

  state.selectedRatingLevel = this.value;
  console.log("new value is", this.value);
  draw(); // re-draw the graph based on this new selection
});

  // add in dropdown options from the unique values in the data

  selectQuestion
    .selectAll("option")
    .data(["Show All","Greatest concern for the world","Most likely fallout for the world","Most worrisome for your company"]) // + ADD UNIQUE VALUES
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // + CREATE SVG ELEMENT

  svg=d3.select("#d3-container")
  .append("svg")
  .attr("width",width)
  .attr("height",height);

  // + CALL AXES

  svg
  .append("g")
  .attr("class", "axis x-axis")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(xAxis)
  .append("text")
  .attr("class", "axis-label")
  .attr("x", "50%")
  .attr("dy", "3em")
  .text("Risk Rating");

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
  .text("Risk Name");


  draw(); // calls the draw function
}

/* DRAW FUNCTION */
 // we call this everytime there is an update to the data/state

function draw() {
  
  // + FILTER DATA BASED ON CATEGORY, QUESTION, RATING LEVEL

  let filteredData = state.data;
  // if there is a selectedParty, filter the data before mapping it to our elements

    filteredData = state.data.filter(d => d.Question === state.selectedQuestion);

 
  console.log(filteredData)
const dot = svg
   .selectAll("circle")
   .data(filteredData, d => d.Risk_Summary)
    .join(
      enter =>
        // enter selections -- all data elements that don't have a `.dot` element attached to them yet
        enter
          .append("circle")
          .attr("class", "dot") // Note: this is important so we can identify it in future updates
          .attr("stroke", "lightgrey")
          .attr("opacity", 0.5)
 //         .attr("fill", d=>colors(d.Risk_Level))
/*           .attr("fill", d => {
            if (d.Risk_Level === "High") return "blue";
            else if (d.party === "R") return "red";

            else return "purple";
          }) */
          .attr("r", radius)
          .attr("cy", d => yScale(d.Risk_Summary))
          .attr("cx", d => xScale(d.Risk_Rating)) // initial value - to be transitioned
          .attr("cx", d => margin.left) // initial value - to be transitioned
          .call(enter =>
            enter
              .transition() // initialize transition
              .delay(d => 500 * d.Risk_Rating) // delay on each element
              .duration(500) // duration 500ms
              .attr("cx", d => xScale(d.Risk_Rating))
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
            .delay(d => 50 * d.Risk_Rating)
            .duration(500)
            .attr("cx", width)
            .remove()
        )
   );
}
