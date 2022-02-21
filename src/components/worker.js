const uniqRndStr = (str, size = 4) => 
    str.split("")
        .map((a) => ({ sort: Math.random(), value: a }))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value)
        .join("")
        .slice(-size);

const createArrayWithRepeats = (max) => {
    const maxLength = String(max-1).length;
    return [...Array(max).keys()]
        .map(num => String(num))
        .map(str => '0'.repeat(maxLength - str.length) + str);  
}
const createArrayNoRepeats = (max) =>
    createArrayWithRepeats(max)
        .filter(str => str.split('')
            .filter((d,i) => 
                (str.slice(0,i) + str.slice(i+1)).includes(d)).length === 0
        )

const findArrOfLegalGuesses = (prevArr, guessLast, resLast) =>
    [...prevArr].filter(num => 
        calcDigitMatch(guessLast, num) === resLast);

function calcDigitMatch(str1, str2) {
    let res = [0, 0];
    for (let i = 0; i < str2.length; i++) {
      if (str1.indexOf(str2[i]) >= 0) res[0]++;
      if (str1[i] === str2[i]) res[1]++;
    }
    return res.join('');
  }

const PossibleRes = [
    '00', '10', '20', '30', '40',
    '11', '21', '31', '41',
    '22', '32', '42', 
    '33'
];

const minimax = (resArr) => {
    const arrAll = createArrayWithRepeats(10**4);
    const arrOfMax = arrAll.map(g => 
        Math.max(...PossibleRes.map(r => 
            findArrOfLegalGuesses(resArr, g, r).length))
    );
    const minOfArr = Math.min(...arrOfMax);
    const newGuessArray = arrAll
        .filter((str, i) => arrOfMax[i] === minOfArr )
        .filter(str => resArr.includes(str));
    return (newGuessArray.length) 
        ? newGuessArray[0] 
        : arrAll[arrOfMax.indexOf(minOfArr)];
}

function calcKnuthGuess(guess, res) {
    if (guess.length) {
        let resArr = createArrayNoRepeats(10**4);
        guess.forEach((g, i) => {
            resArr = findArrOfLegalGuesses(resArr, g, res[i])
            console.log(g, res[i]);
        })
        return minimax(resArr);
    } else {
        return uniqRndStr('0123456789', 2).repeat(2);
    }
}

export function hello(name) {
    // let i = 0;
    // while (i < 100000000) 
    //     i++;
 return `Hello, ${calcKnuthGuess(['0011', '2233'], ['00', '22'])}`;
}