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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.742, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.905, 500, 1500, "GraphQL HTTP Request-ME"], "isController": false}, {"data": [0.5, 500, 1500, "GraphQL HTTP Request-LOGIN"], "isController": false}, {"data": [0.895, 500, 1500, "GraphQL HTTP Request-getuser"], "isController": false}, {"data": [0.495, 500, 1500, "GraphQL HTTP Request-REGISTER"], "isController": false}, {"data": [0.705, 500, 1500, "GraphQL HTTP Request-listTournaments exclude CANCELLED"], "isController": false}, {"data": [0.67, 500, 1500, "GraphQL HTTP Request-listtournament"], "isController": false}, {"data": [0.83, 500, 1500, "GraphQL HTTP Request-updateMyFavoriteGames"], "isController": false}, {"data": [0.905, 500, 1500, "GraphQL HTTP Request-getmatch"], "isController": false}, {"data": [0.88, 500, 1500, "GraphQL HTTP Request-deleteAccount"], "isController": false}, {"data": [0.635, 500, 1500, "GraphQL HTTP Request-gettournament"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1000, 0, 0.0, 527.0060000000002, 363, 2652, 505.5, 681.9, 791.5999999999995, 1082.7900000000002, 3.3116091771313516, 5.13894800628709, 4.775314561476712], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GraphQL HTTP Request-ME", 100, 0, 0.0, 425.12999999999994, 363, 676, 399.5, 523.9, 554.95, 675.5299999999997, 0.33736142879312325, 0.1943781669804128, 0.2655403433664622], "isController": false}, {"data": ["GraphQL HTTP Request-LOGIN", 100, 0, 0.0, 678.0299999999999, 621, 1396, 641.0, 743.8, 881.8999999999993, 1392.8699999999985, 0.337056686193484, 0.38431703678299617, 0.27089614525120836], "isController": false}, {"data": ["GraphQL HTTP Request-getuser", 100, 0, 0.0, 466.72, 418, 905, 446.5, 520.9, 541.8, 903.1999999999991, 0.3372305949084925, 0.1989133587155561, 0.41067046079188485], "isController": false}, {"data": ["GraphQL HTTP Request-REGISTER", 100, 0, 0.0, 781.6399999999996, 588, 1698, 738.0, 999.5000000000002, 1157.4999999999995, 1695.7299999999989, 0.33590637617483254, 0.19485194086704155, 0.2962143141463611], "isController": false}, {"data": ["GraphQL HTTP Request-listTournaments exclude CANCELLED", 100, 0, 0.0, 539.9700000000001, 440, 2652, 516.0, 620.3000000000001, 710.6999999999999, 2632.8099999999904, 0.3373307021538565, 1.455404090556427, 0.6796027720150449], "isController": false}, {"data": ["GraphQL HTTP Request-listtournament", 100, 0, 0.0, 528.71, 444, 1032, 521.0, 619.4000000000001, 686.2999999999996, 1029.0199999999986, 0.3372999811112011, 1.4450899610671497, 0.6752587512480099], "isController": false}, {"data": ["GraphQL HTTP Request-updateMyFavoriteGames", 100, 0, 0.0, 437.38000000000005, 363, 581, 408.5, 523.0, 524.95, 580.5199999999998, 0.33746844670023357, 0.1835643796992481, 0.36778787745845765], "isController": false}, {"data": ["GraphQL HTTP Request-getmatch", 100, 0, 0.0, 438.4099999999999, 370, 740, 428.0, 519.9, 522.95, 739.4099999999997, 0.3373785015671231, 0.24380868277311632, 0.2550107033329622], "isController": false}, {"data": ["GraphQL HTTP Request-deleteAccount", 100, 0, 0.0, 433.50000000000006, 366, 712, 407.0, 519.9, 522.95, 710.3499999999992, 0.33739671443079483, 0.21581528120329163, 0.8135082889937818], "isController": false}, {"data": ["GraphQL HTTP Request-gettournament", 100, 0, 0.0, 540.57, 468, 1573, 521.0, 615.9, 663.6999999999997, 1564.2599999999957, 0.33720216618671556, 0.717114411430479, 0.8281869608980368], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1000, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
