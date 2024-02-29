/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 49.24, "KoPercent": 50.76};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2747, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.81775, 500, 1500, "GraphQL HTTP Request-ME"], "isController": false}, {"data": [0.00775, 500, 1500, "GraphQL HTTP Request-LOGIN"], "isController": false}, {"data": [0.12475, 500, 1500, "GraphQL HTTP Request-getuser"], "isController": false}, {"data": [0.00425, 500, 1500, "GraphQL HTTP Request-REGISTER"], "isController": false}, {"data": [0.01125, 500, 1500, "GraphQL HTTP Request-listTournaments exclude CANCELLED"], "isController": false}, {"data": [0.00975, 500, 1500, "GraphQL HTTP Request-listtournament"], "isController": false}, {"data": [0.89025, 500, 1500, "GraphQL HTTP Request-updateMyFavoriteGames"], "isController": false}, {"data": [0.17575, 500, 1500, "GraphQL HTTP Request-getmatch"], "isController": false}, {"data": [0.70525, 500, 1500, "GraphQL HTTP Request-deleteAccount"], "isController": false}, {"data": [2.5E-4, 500, 1500, "GraphQL HTTP Request-gettournament"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20000, 10152, 50.76, 1853.855899999986, 355, 13415, 1301.0, 4011.9000000000015, 4807.800000000003, 7486.950000000008, 64.5738288728961, 38.329388402096384, 93.11495675167811], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GraphQL HTTP Request-ME", 2000, 0, 0.0, 557.6064999999988, 355, 3171, 432.0, 831.0, 1261.0499999999965, 2542.3400000000006, 6.644981875811934, 3.828651666727579, 5.230327531156659], "isController": false}, {"data": ["GraphQL HTTP Request-LOGIN", 2000, 1482, 74.1, 2709.575500000005, 519, 8341, 2364.5, 4723.200000000002, 5477.699999999995, 6601.72, 6.62618070257394, 4.163878364650319, 5.3255339045101096], "isController": false}, {"data": ["GraphQL HTTP Request-getuser", 2000, 1055, 52.75, 1549.4154999999994, 478, 5100, 1242.0, 2743.0, 3074.2999999999975, 4144.2300000000005, 6.627146781360487, 3.5641785579080087, 8.070363316754422], "isController": false}, {"data": ["GraphQL HTTP Request-REGISTER", 2000, 714, 35.7, 2558.2659999999996, 569, 6582, 2465.0, 4052.8, 4500.0, 5612.59, 6.615441101074017, 3.6275939247923583, 5.833733705341638], "isController": false}, {"data": ["GraphQL HTTP Request-listTournaments exclude CANCELLED", 2000, 1867, 93.35, 2540.852499999995, 473, 10228, 2001.0, 5401.300000000001, 7087.049999999989, 8649.93, 6.653714103212414, 4.639669282338714, 13.404894721608601], "isController": false}, {"data": ["GraphQL HTTP Request-listtournament", 2000, 1897, 94.85, 2830.2389999999964, 514, 12258, 2438.0, 5417.0, 6178.799999999999, 9036.99, 6.617476756112894, 4.389593991951494, 13.24787827151507], "isController": false}, {"data": ["GraphQL HTTP Request-updateMyFavoriteGames", 2000, 0, 0.0, 457.22400000000016, 355, 3259, 391.0, 583.9000000000001, 691.0, 1262.99, 6.656969680831589, 3.6210274533429634, 7.255056800593802], "isController": false}, {"data": ["GraphQL HTTP Request-getmatch", 2000, 1205, 60.25, 1661.3325, 369, 6491, 1198.0, 3498.8, 4176.95, 4915.99, 6.630090666489864, 3.8667381559645957, 5.011416187366363], "isController": false}, {"data": ["GraphQL HTTP Request-deleteAccount", 2000, 0, 0.0, 623.865499999999, 361, 3230, 517.0, 969.0, 1288.0, 2371.96, 6.657013996371927, 4.258148601194934, 16.05094487992411], "isController": false}, {"data": ["GraphQL HTTP Request-gettournament", 2000, 1932, 96.6, 3050.181999999998, 488, 13415, 2798.0, 5139.300000000001, 6307.799999999999, 9371.080000000002, 6.606176114049025, 3.4191348304029434, 16.22512981136064], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 10152, 100.0, 50.76], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20000, 10152, "500/Internal Server Error", 10152, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["GraphQL HTTP Request-LOGIN", 2000, 1482, "500/Internal Server Error", 1482, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GraphQL HTTP Request-getuser", 2000, 1055, "500/Internal Server Error", 1055, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GraphQL HTTP Request-REGISTER", 2000, 714, "500/Internal Server Error", 714, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GraphQL HTTP Request-listTournaments exclude CANCELLED", 2000, 1867, "500/Internal Server Error", 1867, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GraphQL HTTP Request-listtournament", 2000, 1897, "500/Internal Server Error", 1897, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GraphQL HTTP Request-getmatch", 2000, 1205, "500/Internal Server Error", 1205, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GraphQL HTTP Request-gettournament", 2000, 1932, "500/Internal Server Error", 1932, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
