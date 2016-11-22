importScripts('/assets/js/turfjs/turf.min.js');

function isOdd(num) {
    return num % 2;
}

function generateFinal3DGeoms(constraintedModelDesigns) {

    var finalGJFeats = [];
    var plFeats = [];
    var centerPt = turf.center(constraintedModelDesigns);
    var lat = centerPt.geometry.coordinates[1];
    var lng = centerPt.geometry.coordinates[0];
    var curFeats = constraintedModelDesigns.features;
    var featLen = curFeats.length;

    for (var k = 0; k < featLen; k++) {
        var curFeat = curFeats[k];
        if (curFeat.properties.areatype === 'policy') {
            // create a grid    
            var props = curFeat.properties;
            props.color = (props.color === undefined || props.color === null) ? '#808080' : props.color;

            var extent = turf.bbox(curFeat);
            var cellWidth = 0.1;
            var units = 'kilometers';
            var squareGrid = turf.squareGrid(extent, cellWidth, units);
            // process policy polygons
            var sqGridFeats = squareGrid.features;
            var sqGridFlen = sqGridFeats.length;
            var finalFeats = [];
            var featcounter = 0;
            for (var k1 = 0; k1 < sqGridFlen; k1++) {
                var cursqFeat = sqGridFeats[k1];
                var ifeat;
                if (isOdd(featcounter)) {
                    try {
                        ifeat = turf.intersect(curFeat, cursqFeat);

                    } catch (err) { //throw JSON.stringify(err)
                        console.log(err);
                    }
                    if (ifeat) {
                        ifeat.properties = props;
                        finalGJFeats.push(ifeat);
                        finalFeats.push(ifeat);
                    }
                }
                featcounter += 1;
            }
        } else {
            curFeat.properties.color = (curFeat.properties.color === undefined || curFeat.properties.color === null) ? '#808080' : curFeat.properties.color;
            finalGJFeats.push(curFeat);
        }

    }

    var f = {
        "type": "FeatureCollection",
        "features": finalFeats
    };
    // console.log(JSON.stringify(f));
    var fpolygons = {
        "type": "FeatureCollection",
        "features": finalGJFeats
    };

    self.postMessage({
        'polygons': JSON.stringify(fpolygons),
        'center': JSON.stringify([lat, lng])
    });
}

function generate3DGeoms(allFeaturesList) {;
    var allFeaturesList = JSON.parse(allFeaturesList);
    var threeDOutput = generateFinal3DGeoms(allFeaturesList);

}

self.onmessage = function(e) {
    generate3DGeoms(e.data.allFeaturesList);

}