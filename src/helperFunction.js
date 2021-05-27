export const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

export const generateRandomNumber = (maxNumber) => {
    return Math.floor(Math.random() * maxNumber) + 1  
}



export const sortAlphaNum = (a, b) => {
    var reA = /[^a-zA-Z]/g;
    var reN = /[^0-9]/g;
  var aA = a.topic.replace(reA, "");
  var bA = b.topic.replace(reA, "");
  if (aA === bA) {
    var aN = parseInt(a.topic.replace(reN, ""), 10);
    var bN = parseInt(a.topic.replace(reN, ""), 10);
    return aN === bN ? 0 : aN > bN ? 1 : -1;
  } else {
    return aA > bA ? 1 : -1;
  }
}