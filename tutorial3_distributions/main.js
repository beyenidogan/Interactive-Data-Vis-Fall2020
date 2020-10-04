/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.58,
  margin = { top: 30, bottom: 40, left:60, right: 40 },
  radius = 5;
  default_selection = "All";

  console.log('width',width)
// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let rScale;
let color;
let xPosition;
let yPosition;


/* APPLICATION STATE */
let state = {
  data: [],
  selectedCountry: default_selection // + YOUR FILTER SELECTION
};

/* LOAD DATA */
d3.csv("../data/Happiness2019.csv", d3.autoType).then(raw_data => {
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
    .domain(d3.extent(state.data, d => d["GDP per capita"]))
    .range([margin.left, width-margin.right])

  yScale=d3.scaleLinear()
    .domain(d3.extent(state.data, d => d.Score))
    .range([height-margin.bottom,margin.top])

    
  color=d3.scaleLinear()
        .domain(d3.extent(state.data, d => d.Score))
        .range(["#F8766D","#80F4CF"])

  rScale=d3.scaleLinear()
        .domain(d3.extent(state.data, d => d["GDP per capita"]))
        .range([4,15]); 
  // + AXES

const xAxis=d3.axisBottom(xScale)
//.ticks(5)

const yAxis=d3.axisLeft(yScale)
//.ticks(5);


  // + UI ELEMENT SETUP

  const selectElement = d3.select("#dropdown").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected

    state.selectedCountry = this.value;
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });

  // add in dropdown options from the unique values in the data


    selectElement
    .selectAll("option")
    .data([default_selection,
      ...Array.from(new Set(state.data.map(d => d["Country or region"]))),
      
    ])
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

  .call(xAxis);   

  svg.append("g")
  .attr("class","y-axis")
  .attr("transform","translate("+(height)+",0)")
  .call(yAxis); */
  svg
  .append("g")
  .attr("class", "axis")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(xAxis)
  .append("text")
  .attr("class", "axis-label")
  .attr("x", "57%")
  .attr("dy", "3em")
  //.attr("x", width-margin.right)
  //.attr("y", -6)
  .attr("fill","white")
  .text("GDP per Capita");


  svg
  .append("g")
  .attr("class", "axis")
  .attr("transform", `translate(${margin.left},0)`)
  .call(yAxis)
  .append("text")
  .attr("class", "axis-label")
  //.attr("x","-25%")
  .attr("y", "-3em")
  .attr("dx", "-12em")
  //.attr("writing-mode", "vertical-lr")
  .attr("transform", "rotate(-90)")
  .attr("fill","white")
  .text("Happiness Score");

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
 // we call this everytime there is an update to the data/state

function draw() {
  
  // + FILTER DATA BASED ON STATE
  let filteredData = state.data;
  // if there is a selectedParty, filter the data before mapping it to our elements
  if (state.selectedCountry !== default_selection) {
    filteredData = state.data.filter(d => d["Country or region"] === state.selectedCountry);
  }


const dot = svg
   .selectAll("circle")
   .data(filteredData, d => d["Country or region"])
    .join(
      enter =>
        // enter selections -- all data elements that don't have a `.dot` element attached to them yet
        enter
          .append("circle")
          .attr("class", "dot") // Note: this is important so we can identify it in future updates
          .attr("stroke", "lightgrey")
          .attr("fill-opacity", 0.7)
          .attr("fill", d => color(d.Score))
          .attr("stroke", d => color(d.Score))
          .attr("r", d =>rScale(d["GDP per capita"]))
          .attr("cy", d => yScale(d.Score))
          .attr("cx", d => xScale(d["GDP per capita"])) // initial value - to be transitioned
          .call(enter =>
            enter
              .transition() // initialize transition
              .delay(d => 100 * d.Score) // delay on each element
              .duration(500) // duration 500ms
          )
          .on("mouseover", function(d) {                                                              //Tooltip Option 3 (div in html, along with css tooltip)
          
            //Get this bar's x/y values, then augment for the tooltip
            //xPosition = xScale(d["GDP per capita"]) ;
            //yPosition = yScale(d.Score);  
            xPosition = d3.event.pageX -80;
            yPosition = d3.event.pageY - 10;
            console.log(d3.event.pageX, d3.event.pageY)
      
            
            //Update the tooltip position and value
            d3.select("#tooltip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px")						
                    .select("#value")
                    .text(d.Score);
            
            //Show the tooltip
            d3.select("#tooltip").classed("hidden", false);
            })  
   /*          .on("mouseout", function(d) {
              d3.select("#tooltip").classed("hidden", true);
            })  */
            /*.on("mouseout", function(d) {
              d3.select("#tooltip")
              .remove() ;
  })*/
  
          ,
      update =>
        update.call(update =>
          // update selections -- all data elements that match with a `.dot` element
          update
            .transition()
            .duration(250)
            .transition()
            .duration(250)
            .attr("r", d =>2*rScale(d["GDP per capita"]))
        ),
      exit =>
        exit.call(exit =>
          // exit selections -- all the `.dot` element that no longer match to HTML elements
          exit
            .transition()
        //    .delay(d => 50 * d.Score)
            .duration(50)
            //.attr("cx", width)
            .attr("r", d =>rScale(d["GDP per capita"]))
            .remove()
        )
   )
   
}


