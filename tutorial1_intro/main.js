d3.csv("../data/BooksRead.csv").then(data=> {
    
    //Normally in an object, all fields are loaded as string, change to numbers by using forEach

    data.forEach(function(d){
        d.Books= +d.Books;
          });
    
    console.log(data[0]);
    
    var totalBooks = data.reduce(function(prev, cur){
        return (prev + cur.Books);
        }, 0); 

    data.push(["TOTAL","","",totalBooks]); 

    console.log("data",data)
    
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
        .text(d => d) ;
        
//NOT WORKING....   
    rows
        .selectAll('tr')   
        .data(data)
        .attr("class",forEach(function(d){
            if (d[3]>4) {return "wow"};
              }))

    console.log(totalBooks) 

}); 