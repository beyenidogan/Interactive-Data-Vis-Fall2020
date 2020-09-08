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
            td => td > 8  ? "wow" : null;
        });

// Attempts to update rows       
/* thead
        .append('tr')
        .selectAll('td')
        .attr("class",td => td > 8  ? "wow" : null); */

/* .attr("class",data.forEach(function(d){
    if (d.Books>8) {return "wow"};
    })) */
 

});