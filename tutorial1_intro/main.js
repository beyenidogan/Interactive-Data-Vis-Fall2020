d3.csv("../data/BooksRead.csv").then(data=> {
    
    //Normally in an object, all fields are loaded as string, change to numbers by using forEach

    data.forEach(function(d){
        d.Books= +d.Books;
        d.Pages= +d.Pages;
          });
    
    console.log(data[0]);   //check if is number

    // add the number of books
    var totalBooks = data.reduce(function(prev, cur){     
        return (prev + cur.Books);
        }, 0); 
    console.log(totalBooks) 

    var totalPages = data.reduce(function(prev, cur){     
        return (prev + cur.Pages);
        }, 0); 

    //insert total to array
    data.push(["TOTAL","",totalPages,totalBooks]); 

    console.log("data",data)

    
    //append table
    const table= d3.select("#d3-table");
    
    const thead = table.append('thead');

    thead
        .append('tr')
        .selectAll('th')
        .data(data.columns)
        .join('th')
        .text(d => d)

    const rows = table
        .append('tbody')
        .selectAll('tr')
        .data(data)
        .join('tr');

    rows
        .selectAll('td')
        .data(d => Object.values(d))
        .join('td')
        .text(d => d)
        .attr("color",function(d){
            return "rgb(0,0,"+ Math.round(d.Books*10)+")";
        });
});
// Attempts to update rows       
/* thead
        .append('tr')
        .selectAll('td')
        .attr("class",td => td > 8  ? "wow" : null); */

/* .attr("class",data.forEach(function(d){
    if (d.Books>8) {return "wow"};
    })) */

 /*  var w=500;
    var h=500;
    var barPadding=2;
    var Padding=20;

    const svg=d3.select("body").append("svg")        //Bar chart
        .attr("width",w)
        .attr("height",h);

    svg.selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x",200)
        .attr("y",function(d){
        return h/d;
        })
        .attr("width",w/data.length-barPadding)
        .attr("height",function(d){
        return d*4;
        })
        .attr("fill",function(d){
        return "rgb(0,0,"+ Math.round(d*10)+")";
        });   */