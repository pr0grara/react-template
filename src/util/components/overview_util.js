export const quicksortSurveys = (arr, param = "Overall", left = [], right = []) => {
    if (arr.length <= 1) return arr;
    let pivot = arr.shift();
    arr.forEach(sur => {
        try {
            if (!sur.score) throw "no score err";
            let score = Array.isArray(sur.score) ? sur.score[0][param] : sur.score[param]; //to handle wether sur.score is a single object or an array of multiple objects
            score = !!score ? score : 0; //if score was not found make it 0
            let pivotScore = Array.isArray(pivot.score) ? pivot.score[0][param] : pivot.score[param]; //to handle wether pivot.score is {} or [{}, {}]
            if (score > pivotScore) {
                right.push(sur);
            } else {
                left.push(sur)
            }
        } catch (e) {
            console.log(e)
        }
    })
    return quicksortSurveys(left, param).concat(pivot).concat(quicksortSurveys(right, param));
}