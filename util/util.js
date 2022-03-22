// const Answers = require('../models/postgres/Answer');

// const generateJSONFromPSQL = surveyID => {
//     Answers.findAll({where: {"taken_survey_id": surveyID}})
//         .then(res => {
//             let generatedJSON = {};
//             res.forEach(ans => {
//                 let questionId = ans.dataValues.question_id;
//                 let answerId = ans.dataValues.answer_id;
//                 generatedJSON[questionId] = generatedJSON[questionId] || [];
//                 generatedJSON[questionId].push({ answerId, questionId })
//             })
//             console.log(JSON.stringify(generatedJSON));
//         })
//         .catch(err => console.log(err))
// }

// generateJSONFromPSQL("HGvgtePqaePF");

const numPicker = (boolean) => {
    var num;
    if (boolean) {
        num = Math.floor(Math.random() * 9);
    } else {
        num = Math.floor(Math.random() * 74) + 48;
    }
    return num;
}

// const idGenerator = (size) => {
//     var id = ""
//     size = size || 12;
//     while (id.length < size) {
//         var num = numPicker();
//         while (num > 57 && num < 65 || num > 90 && num < 97) num = numPicker();
//         id = id + String.fromCharCode(num);
//     }
//     return id;
// }

const idGenerator = (length, onlyNumBoolean) => {
    length = length || 12;
    var id = ""
    while (id.length < length) {
        var num = numPicker(onlyNumBoolean);
        while ((num > 57 && num < 65) || (num > 90 && num < 97)) num = numPicker();
        if (onlyNumBoolean) {
            id = id + num.toString();
        } else {
            id = id + String.fromCharCode(num);
        }
    }
    return id;
}

const randomClassGenerator = (length) => {
    length = length || 6;
    var className = "";
    while (className.length < length) {
        var num = numPicker();
        while ((num < 65) || (num > 90 && num < 97) || (num > 122)) num = numPicker();
        className = className + String.fromCharCode(num);
    }
    return className;
}

const questionCounter = (survey, currentIdx, answeredQuestions) => {
    let count = 0;
    let remainingQuestions = Object.keys(survey.survey.questions).length - currentIdx - 1;
    let totalQuestions = Object.keys(survey.survey.questions).length - currentIdx;
    let questions = survey.survey.questions;

    let goesTos = [];
    if (!questions instanceof Array && questions instanceof Object) questions = Object.values(questions);

    questions.forEach(question => {
        let arr = [];
        if (typeof question.goesTo === "object") {
            arr.push(question.number, question.goesTo[0]);
            goesTos.push(arr);
        } else if (typeof question.goesTo === "number") {
            arr.push(question.number, question.goesTo);
            goesTos.push(arr);
        } else {
            console.log("yo")
        }
    })
    goesTos.forEach(goto => {
        if (currentIdx <= goto[0]) {
            remainingQuestions = remainingQuestions - (goto[1] - (goto[0] + 1));
        }
    })
    return remainingQuestions + answeredQuestions;
}

const alternateLogic = (answerId, boolean, answerIds) => {
    if (boolean) { 
        if (answerIds.includes(answerId)) return false
        return true
    } else {
        return true
    }
}

let arr = [1, 2, 3, 4, 5]

module.exports = { idGenerator };