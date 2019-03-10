const loadPositionData  =  require("./loadPositionData");

const positions = [
  "C",
  "1B",
  "2B",
  "3B",
  "SS",
  "RF",
  "LF",
  "CF",
  "DH",
  "PH",
  "SP",
  "RP",
];

const year = 2015;

loadPositionData(positions, year)
  .then(data => {
    console.log(JSON.stringify(data));
  });
