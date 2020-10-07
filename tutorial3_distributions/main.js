/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.5,
  margin = { top: 30, bottom: 40, left:60, right: 40 },
  radius = 5;
  defaultCountry = "Select Country";
  defaultMetric="GDP per capita";

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
let sortedCountries;
let xAxis;

/* APPLICATION STATE */
let state = {
  data: [],
  selectedCountry: defaultCountry, // + YOUR FILTER SELECTION
  selectedMetric: defaultMetric
};

/* LOAD DATA */
d3.csv("../data/Happiness2019.csv", d3.autoType).then(raw_data => {
  // + SET YOUR DATA PATH
  console.log("raw_data", raw_data);
  
  state.data = raw_data; 
  console.log(state.data.columns)
  init();
});
 console.log("margin left", margin.left)
 console.log("margin right",width-margin.right)
/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in 
function init() {
  // + SCALES
  xScale=d3.scaleLinear()
    .domain(d3.extent(state.data, d => d[state.selectedMetric]))
    .range([margin.left, width-margin.right])

  yScale=d3.scaleLinear()
    .domain(d3.extent(state.data, d => d.Score))
    .range([height-margin.bottom,margin.top])

    
  color=d3.scaleLinear()
        .domain(d3.extent(state.data, d => d.Score))
        .range(["#F8766D","#80F4CF"])

  rScale=d3.scaleLinear()
        .domain(d3.extent(state.data, d => d[state.selectedMetric]))
        .range([4,15]); 
  // + AXES



const yAxis=d3.axisLeft(yScale)
//.ticks(5);

  
xAxis=d3.axisBottom(xScale)
.ticks(10)

  // + CREATE SVG ELEMENT

  svg=d3.select("#d3-container")
  .append("svg")
  .attr("width",width)
  .attr("height",height);

 

// + UI ELEMENT SETUP

  const selectCountry = d3.select("#dropdown1").on("change", function() {
    // `this` === the selectCountry
    // 'this.value' holds the dropdown value a user just selected

    state.selectedCountry = this.value;
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });


  // add in dropdown options from the unique values in the data

  //sortedCountries=state.data.slice().sort((a,b) => d3.descending(a["Country or region"], b["Country or region"]) )     

  selectCountry
    .selectAll("option")
    .data([defaultCountry,
      ...Array.from(new Set(state.data.map(d => d["Country or region"]))), 
    ])
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  const selectMetric = d3.select("#dropdown2").on("change", function() {
      // `this` === the selectCountry
      // 'this.value' holds the dropdown value a user just selected
  
      state.selectedMetric = this.value;
      console.log("new metric is", this.value);

      xScale.domain([0, d3.max(state.data, d => d[state.selectedMetric])]);
      d3.select("g.x-axis")
        .transition()
        .duration(2000)
        .call(xAxis.scale(xScale))
        .select("text.axis-label")
        .text(state.selectedMetric); // this updates the yAxis' scale to be our newly updated one

      rScale.domain([0, d3.max(state.data, d => d[state.selectedMetric])]);
      draw(); // re-draw the graph based on this new selection
    });
  
  selectMetric
    .selectAll("option")
    .data([defaultMetric,
      ...Array.from(new Set(state.data.columns.slice(4,9))), 
    ])
    .join("option")
    .attr("value", d => d)
    .text(d => d);

 // + CALL AXES
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "60%")
    .attr("dy", "2.7em")
    //.attr("x", width-margin.right)
    //.attr("y", -6)
    .attr("fill","white")
    .text(state.selectedMetric); 
  
  
  svg
    .append("g")
    .attr("class", "y-axis")
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
  if (state.selectedCountry !== defaultCountry) {
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
          .attr("r", d =>rScale(d[state.selectedMetric]))
          .attr("cy", d => yScale(d.Score))
          .attr("cx", d => xScale(d[state.selectedMetric])) // initial value - to be transitioned
          .call(enter =>
            enter
              .transition() // initialize transition
              .delay(d => 500 * d[state.selectedMetric])
              .duration(500) // duration 500ms
          )
/*               .on("mouseover", function(d,i) {
            
                  d3.select("dot")
                  //.attr("transform", "scale(1.1,1.1)")
                  .transition()
                  .duration(250)
                  .attr("r", d =>((d["Country or region"] === state.selectedCountry)? 2.5 : 1)*rScale(d[state.selectedMetric]))
                  .transition()
                  .duration(250)
                  .attr("r", d =>rScale(d[state.selectedMetric]))
                }) */
          .on("mouseover", function(d) {                                                              //Tooltip Option 3 (div in html, along with css tooltip)
          
            //Get this bar's x/y values, then augment for the tooltip
            //xPosition = xScale(d["GDP per capita"]) ;
            //yPosition = yScale(d.Score);  
            xPosition = d3.event.pageX -100;
            yPosition = d3.event.pageY - 20;
            console.log(d3.event.pageX, d3.event.pageY)
      
            
            //Update the tooltip position and value
            d3.select("#tooltip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px")						
                    .select("#value")
                    .text(d.Score)
                    .style("fill", color(d.Score))

            d3.select("#tooltip")       
                    .select("#tooltipheader")
                    .text(d["Country or region"])
                    .style("fill", color(d.Score))
            
            //Show the tooltip
            d3.select("#tooltip").classed("hidden", false);
            })  
           .on("mouseleave", function(d) {
              d3.select("#tooltip").classed("hidden", true);
            })  
           /* .on("mouseleave", function(d) {
              d3.select("#tooltip")
              .remove() ;
               })*/
  
          ,
      update =>
        update.call(update =>
          // update selections -- all data elements that match with a `.dot` element
          update
            .transition()
            .delay(d => 500 * d[state.selectedMetric])
            .duration(250)
            //.attr("r", d =>2*rScale(d[defaultMetric]))
            .attr("cx", d => xScale(d[state.selectedMetric]))
            .attr("fill-opacity", (d=>(d["Country or region"] === state.selectedCountry)? 0.9 : ((state.selectedCountry === defaultCountry)? 0.5: 0.1)))
            .attr("stroke-opacity", (d=>(d["Country or region"] === state.selectedCountry)? 1 : 0.7))
            .attr("r", d =>((d["Country or region"] === state.selectedCountry)? 2.5 : 1)*rScale(d[state.selectedMetric]))
            .transition()
            .duration(250)
            .attr("r", d =>rScale(d[state.selectedMetric]))
        ),
      exit =>
        exit.call(exit =>
          // exit selections -- all the `.dot` element that no longer match to HTML elements
          exit
            .transition()
    //        .delay(d => 500 * d[state.selectedMetric])
            .duration(50)
            .attr("cx", d => xScale(d[state.selectedMetric]))
            .attr("r", d =>((d["Country or region"] === state.selectedCountry)? 2.5 : 1)*rScale(d[state.selectedMetric]))
            //.attr("cx", width)
        //    .attr("r", d =>rScale(d[selectedMetric]))
            .attr("fill-opacity", (d=>(d["Country or region"] === state.selectedCountry)? 0.9 : ((state.selectedCountry === defaultCountry)? 0.5: 0.1)))
            .attr("stroke-opacity", (d=>(d["Country or region"] === state.selectedCountry)? 1 : 0.7))
        )
   )
//TRYING TO UPDATE SCALE 

 /*  
svg
  .selectAll(".x-axis")
  .join(
    enter =>
      // enter selections -- all data elements that don't have a `.dot` element attached to them yet
      enter
        .call(xAxis)
        .append("text")
        .text(state.selectedMetric)
        .call(enter =>
          enter
            .transition() // initialize transition
            .delay(d => 100 * d.Score) // delay on each element
            .duration(500) // duration 500ms
        )
      ,
      update =>
        update.call(update =>
          // update selections -- all data elements that match with a `.dot` element
          update
            .transition()
            .duration(250)
            .transition()
            .duration(250)
            //.attr("r", d =>2*rScale(d[defaultMetric]))
            .call(xAxis)
            .text(state.selectedMetric)
        ),
      exit =>
        exit.call(exit =>
          exit
            .transition()
            .duration(50)
        ) 
      ) */
  
}


