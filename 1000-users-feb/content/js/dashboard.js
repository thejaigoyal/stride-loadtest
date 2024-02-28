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

    var data = {"OkPercent": 99.99, "KoPercent": 0.01};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.74555, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9865, 500, 1500, "GraphQL HTTP Request-ME"], "isController": false}, {"data": [0.5, 500, 1500, "GraphQL HTTP Request-LOGIN"], "isController": false}, {"data": [0.6985, 500, 1500, "GraphQL HTTP Request-getuser"], "isController": false}, {"data": [0.489, 500, 1500, "GraphQL HTTP Request-REGISTER"], "isController": false}, {"data": [0.6665, 500, 1500, "GraphQL HTTP Request-listTournaments exclude CANCELLED"], "isController": false}, {"data": [0.6495, 500, 1500, "GraphQL HTTP Request-listtournament"], "isController": false}, {"data": [0.9865, 500, 1500, "GraphQL HTTP Request-updateMyFavoriteGames"], "isController": false}, {"data": [0.9735, 500, 1500, "GraphQL HTTP Request-getmatch"], "isController": false}, {"data": [0.984, 500, 1500, "GraphQL HTTP Request-deleteAccount"], "isController": false}, {"data": [0.5215, 500, 1500, "GraphQL HTTP Request-gettournament"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10000, 1, 0.01, 548.3821000000006, 354, 5352, 503.0, 802.0, 921.9499999999989, 1208.9899999999998, 32.798606715186736, 50.86120621283508, 47.295334644184315], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GraphQL HTTP Request-ME", 1000, 0, 0.0, 381.78099999999984, 354, 652, 371.0, 417.0, 453.89999999999986, 556.9200000000001, 3.3456453080670197, 1.9276667302339274, 2.6333887874043143], "isController": false}, {"data": ["GraphQL HTTP Request-LOGIN", 1000, 0, 0.0, 773.2079999999999, 625, 1369, 753.0, 931.6999999999999, 988.0, 1117.89, 3.3387086542667026, 3.809932819965144, 2.683356662560055], "isController": false}, {"data": ["GraphQL HTTP Request-getuser", 1000, 0, 0.0, 527.1069999999992, 422, 974, 513.0, 605.9, 649.8999999999999, 738.99, 3.340805601862833, 1.9705533042237804, 4.068344321799759], "isController": false}, {"data": ["GraphQL HTTP Request-REGISTER", 1000, 0, 0.0, 909.4670000000001, 597, 1917, 861.0, 1199.8, 1349.7999999999997, 1636.91, 3.3289502155495265, 1.9310511992543153, 2.935587934219944], "isController": false}, {"data": ["GraphQL HTTP Request-listTournaments exclude CANCELLED", 1000, 1, 0.1, 554.935, 441, 5352, 526.0, 663.9, 702.0, 797.99, 3.3400133600534403, 14.374311774590849, 6.728952697060789], "isController": false}, {"data": ["GraphQL HTTP Request-listtournament", 1000, 0, 0.0, 553.1330000000004, 444, 1038, 531.5, 670.0, 708.8999999999999, 799.0, 3.3397791070098624, 14.38517875958934, 6.686081220088104], "isController": false}, {"data": ["GraphQL HTTP Request-updateMyFavoriteGames", 1000, 0, 0.0, 380.8150000000005, 354, 669, 371.0, 404.0, 449.0, 557.98, 3.3410399989308672, 1.8173430462934503, 3.6412115613348126], "isController": false}, {"data": ["GraphQL HTTP Request-getmatch", 1000, 0, 0.0, 398.5790000000003, 361, 697, 383.5, 438.69999999999993, 505.8499999999998, 620.7900000000002, 3.34184389578794, 2.4150043778155035, 2.5259640384178375], "isController": false}, {"data": ["GraphQL HTTP Request-deleteAccount", 1000, 0, 0.0, 391.0819999999999, 359, 719, 380.0, 421.0, 467.8499999999998, 596.97, 3.340649355421707, 2.1368411404308767, 8.054749275914252], "isController": false}, {"data": ["GraphQL HTTP Request-gettournament", 1000, 0, 0.0, 613.7139999999994, 477, 1152, 589.0, 752.8, 812.5999999999995, 931.9100000000001, 3.340493123594905, 7.024212129038238, 8.204433794766782], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 1, 100.0, 0.01], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10000, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GraphQL HTTP Request-listTournaments exclude CANCELLED", 1000, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
