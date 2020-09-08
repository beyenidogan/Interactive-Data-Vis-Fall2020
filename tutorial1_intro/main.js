d3.csv("../data/BooksRead.csv").then(data=> {
    
    console.log("data",data)
    
    const table= d3.select("#d3-table");
    const columns = ["Year", "Month", "Number of Pages", "Read Count"]
    
    const column_headers=table
        .selectAll("th")
        .data(data.columns)
        .join("th")
        .text(function (d) { return d })
    
    const body = table.append('tbody')

    const rows = body.selectAll(".row")
        .data(data)
        .join('tr')
        .attr('class', 'row')
 
    const cells = rows.selectAll('td')
        .data(function(row) {
            return columns.map(function (column) {
                return { column: column, value: row[column] }
                })
            })
        .join('td')
        .text(function (d) { return d.value })
        .style("color", data.map(function (d) { 
            if(parseInt(d[3])>5)
                {return "red"}
            else {}
            }))
}); 


/* .style("color", data.map(function (d) { 
    if(parseInt(d[3])>5)
        {return "red"}
    else {}
    })) */