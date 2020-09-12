d3.csv("../data/BooksRead.csv",d3.autoType).then(data=> {
    
    console.log(data);  
    const data3=data
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
    const data2= data
    data2.push(["Total","",totalPages,totalBooks],["Average","",avgPages,avgBooks] ); 

    console.log("data3",data3);

    console.log(data2.columns)

    console.log("data2",data2);

    //append table
    const table= d3.select('.booksTable');
    const thead = table.append('thead');

    thead
        .append('tr')
        .selectAll('th')
        .data(data2.columns)
        .join('th')
        .text(d => d)

    const rows = table
        .append('tbody')
        .selectAll('tr')
        .data(data2)
        .join('tr');

    rows
        .selectAll('td')
        .data(d => Object.values(d))
        .join('td')
        .text(d => d)
    rows
        .attr("class", function(d,i) {        
            if (d.Books >= avgBooks || d.Pages >= avgPages) {return "high"} 
            else {return "low"} 
            //else { return null }             
        ;}) 

    let w=100;
    let h=553;
    let barPadding=1;
    let Padding=3;      

const svg=d3.select(".booksBar")  
    .attr("width",w)
    .attr("height",h);

    const xScale=d3.scaleLinear()                                                   
        .domain([0,d3.max(data.map(d=>d.Books))])
        .range([0,(w*0.85)]);

/*     const yScale=d3.scaleBand()
        .domain(data.map(d=>d.Month))
        .range([25,h+28]) */

//To fix the problem related to repeating month values       
    const yScale=d3.scaleBand()                                                   
        .domain(d3.range(data.length))
        .rangeRound([0,h+28])                    //enables rounding to make the pixel values whole, thus crisper look (same as .range([0,w]).round(true))
        .paddingInner(0.05)

    const xColor = d3.scaleLinear()
        .domain([0,d3.max(data.map(d=>d.Books))])
        .range(["rgb(256,256,256)", "rgb(126, 211, 237)"])

    console.log(xColor(11))
 
    const bars=svg.selectAll('rect.bar')
        .data(data)
        .join('rect')
        .attr('class','bar')
        .attr('height',20)
        .attr('width',d=>xScale(d.Books))
        .attr("y",(d,i)=>yScale(i))
        .attr("x",0)
        .attr("fill",d=>xColor(d.Books))


});