const express = require('express');
const loadBeachData =  require("./loadBeachData");

const app = express()

app.get('/', (req, res) => {

    const beaches = [
        "Half-Moon-Bay-California",
        "Huntington-Beach",
        "Providence-Rhode-Island",
        "Wrightsville-Beach-North-Carolina"
    ];

    loadBeachData(beaches).then((value) => {
        res.json(value);
    });

});

const port = process.env.PORT || 8080;

app.listen(port, () => console.log('TidalData.io listening on port 3000!'))

