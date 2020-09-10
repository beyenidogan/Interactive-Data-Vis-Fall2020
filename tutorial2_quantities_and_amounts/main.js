d3.csv("../data/BooksRead.csv",d3.autoType).then(data=> {
    
    console.log(data);  

    // add the number of books & pages
    var totalBooks = data.reduce(function(prev, cur){     
        return (prev + cur.Books);
        }, 0); 
    console.log(totalBooks) 

    var totalPages = data.reduce(function(prev, cur){     
        return (prev + cur.Pages);
        }, 0); 
    var avgBooks=Math.round(totalBooks/data.length)
    var avgPages=Math.round(totalPages/data.length)
    
    console.log(avgBooks) 
    console.log(avgPages) 

    //insert total to array
    data.push(["Total","",totalPages,totalBooks],["Average","",avgPages,avgBooks] ); 

    console.log("data",data)

    //append table
    const table= d3.select('.booksTable');
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
        
    //format rows
    rows
        .attr("class", function(d,i) {        
            if (d.Books >= avgBooks || d.Pages >= avgPages) {return "high"} 
            else {return "low"} 
        });  

    let w=100;
    let h=100;
    let barPadding=2;
    let Padding=5;      

const svg=d3.select(".dbooksBar")


    const xScale=d3.scaleLinear()                                                   //Scale functions
        .domain([0,d3.max(data.map(d=>d.Books))])
        .range([0,w]);
    console.log(xScale(12))

    
    const yScale=d3.scaleBand()
        .domain([0,d3.max(data.map(d=>d.Month))])
        .range([0,h]);                                                  //reversing the axis, because svg is generated from top

const bars=svg.selectAll('rect.bar')
    .data(data)
    .join('rect')
    .attr('class','bar')
    .attr('height',d=>yScale.bandwith())
    .attr('width',d=>xScale(d.Books))
    .attr("y",d=>yScale(d.Month))
    .attr("x",0)
    .style("fill","pink")

    
/*     svg.selectAll("text")
    .data(dataset3)
    .join("text")
    .text(function(d) {
    return d[0] + "," + d[1];
    })
    .attr("x",function(d){return xScale(d[0]);})                        //first element of array but scaled with scale functions
    .attr("y",function(d){return yScale(d[1]);})                     //second element of array but scaled with scale functions                     
    .attr("font-family","sans-serif")
    .attr("font-size","11px")
    .attr("fill","red");
  */
});