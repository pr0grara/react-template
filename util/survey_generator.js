// const { update } = require('./models/mongo/Survey');
const { idGenerator } = require('./util');
const { newSurveyCSVARRAY, frozenCSVARRAY, newFrozen } = require('../survey_base_versions/survey_generator_csv>>json_base');
const fs = require('fs');
const path = require('path');


console.log(idGenerator());

const generateQuestionsObj = (arr) => {
    let newQuestionsObj = {};
    arr.forEach(question => newQuestionsObj[question.id] = question)
    // console.log(newQuestionsObj);
    return newQuestionsObj;
}

const surveyFromJSON = jsObj => {
    let t0 = Date.now();
    let newJSON = Object.assign(jsObj);

    const questions = Object.assign({}, jsObj.questions);
    let surveyKeys = Object.keys(questions);
    // console.log(surveyKeys)
    let newQuestionsArr = [];

    surveyKeys.forEach((key, idx) => {
        // console.log(idx)
        let newId = idGenerator();
        let oldQuestion = jsObj.questions[key];
        
        let questionKeys = Object.keys(oldQuestion);
        let questionValues = Object.values(oldQuestion);

        let text = oldQuestion.question;
        let id = oldQuestion.id;
        let answers = oldQuestion.answers;
        let type = oldQuestion.type;
        let skipQuestion = oldQuestion.skipQuestion;
        let rows = oldQuestion.rows;
        let skipSection = oldQuestion.skipSection;
        let alternateLogic = oldQuestion.alternateLogic;
        let goesTo = oldQuestion.goesTo;

        let updatedQuestion = Object.assign({}, oldQuestion);
        //First lets change the ID of the question
        // updatedQuestion["id"] = newId;

        //Next lets update the number
        // updatedQuestion["number"] = idx + 1; //setting it to the idx + 1
        updatedQuestion["number"] = idx + 1; //setting it to the idx + 1

        //Next the goesTo value
        if (goesTo) {
            if (typeof goesTo === "number") {
                // updatedQuestion["goesTo"] = idx + 2; //you already know
                updatedQuestion["goesTo"] = questions[idx + 2].id
            } else {
                // console.log(typeof updatedQuestion["goesTo"])
            }
        }

        //Now for something a little more challenging, the skipQuestion key
        if (skipQuestion) {
            let updatedSkipQuestion = updatedQuestion.skipQuestion.map(skipQues => {
                let prevNum = skipQues.questionNum;
                let newNum = newLogicNumber(prevNum);
                skipQues['questionNum'] = newNum;
                return skipQues;
            })
            updatedQuestion["skipQuestion"] = updatedSkipQuestion;
        }

        //Same pattern for alternateLogic, this code should get consolidated eventually
        if (alternateLogic) {
            let updatedAlternateLogic = updatedQuestion.alternateLogic.map(alterLogic => {
                let prevNum = alterLogic.questionNum;
                let newNum = newLogicNumber(prevNum);
                alterLogic['questionNum'] = newNum;
                return alterLogic;
            })
            updatedQuestion["alternateLogic"] = updatedAlternateLogic;
        }

        //To modify the skipRow object we must first scope into the rows array found inside "table" questions
        if (rows) {
            let updatedRows = rows.map((row, idx) => {
                if (row.skipRow) { //we only need to make changes if this condition is true
                    let updatedSkipRow = row.skipRow.map(skipLogic => {
                        let prevNum = skipLogic.questionNum;
                        let newNum = newLogicNumber(prevNum);
                        // console.log(idx, parseInt(newNum));
                        // console.log(oldQuestion);
                        skipLogic['questionNum'] = newNum;
                        skipLogic['answerId'] = rows[idx]
                        return skipLogic;
                    })
                    row.skipRow = updatedSkipRow
                }
                return row;
            })
            updatedQuestion["rows"] = updatedRows;

        }

        //Lastly lets update each answer in our answers array with new Ids
        // let updatedAnswers = updatedQuestion.answers.map(answer => {
        //     answer["answerId"] = idGenerator();
        //     return answer;
        // })
        // updatedQuestion["answers"] = updatedAnswers

        // newJSON.questions[idx + 1] = updatedQuestion;
        newQuestionsArr.push(updatedQuestion);

        if (idx + 1 === surveyKeys.length) {
            let updatedQuestions =  generateQuestionsObj(newQuestionsArr);
            newJSON["questions"] = updatedQuestions;
        }
    });

    let t1 = Date.now();
    let delta = t1 - t0;
    console.log(`Survey generated from Survey JSON V${jsObj.version} with ${Object.keys(newJSON.questions).length} questions in ${delta}ms`);
    return newJSON;
};

const generateJSON = jsObj => {
    let newJSON = {};
    
    switch (settings.action) {
        case "FROM_EXISTING_BLANK":
            const SURVEY_STRING = JSON.stringify(jsObj);
            const SURVEY_OBJ = Object.assign({}, jsObj);
            const questions = Object.assign({}, jsObj.questions);
            let surveyKeys = Object.keys(questions);
            let surveyValues = Object.values(questions);
            
            if (settings.newIds) {
                surveyKeys.forEach(key => {
                    let oldQuestion = SURVEY_OBJ[key];
                    let questionKeys = Object.keys(oldQuestion);
                    let questionValues = Object.values(oldQuestion);
                    let text = oldQuestion.question;
                    let id = oldQuestion.id;
                    let answers = oldQuestion.answers;
                    let type = oldQuestion.type;
                    let skipQuestion = oldQuestion.skipQuestion;
                    let skipRow = oldQuestion.skipRow;
                    let skipSection = oldQuestion.skipSection;
                    delete(newJSON.questions[key]);

                    newJSON.questions;
                    // console.log(oldQuestion)
                })
            }
            // console.log(SURVEY_STRING);
            
            break;
        default:
            break;
    }
}

const generateManifest = (questions, sectionIds, sectionNames, finalID) => {
    // let sectionIds = ["oVpPHbQeVRJQ", "UGd54GqxBNZP", "hU9nyXVu9s70", "FW3DRJyykqTS", "1Gu90ttZdZAk", "wp2ao9Xc4II8", "kFnMiKNd7wy6"]
    let sectionsCount = sectionIds.length;
    let manifest = {};
    manifest['sections'] = {};
    manifest.sections['sectionIds'] = Object.assign([], sectionIds);
    manifest.sections['sectionNames'] = sectionNames;
    manifest.sections['length'] = sectionsCount;
    manifest.sections['questionCounts'] = [];

    let questionCount = 1;
    let currentSectionID = sectionIds.shift();
    let nextSectionID = sectionIds[0];

    while (questions.length > 0) {
        let question = questions.shift();
        if (question.id === nextSectionID) {
            manifest.sections[currentSectionID] = questionCount;
            manifest.sections.questionCounts.push(questionCount);
            currentSectionID = sectionIds.shift();
            nextSectionID = sectionIds[0];
            questionCount = 1;
        } else if (question.id === finalID) {//id of last question in survey
            manifest.sections[currentSectionID] = questionCount + 1;
            manifest.sections.questionCounts.push(questionCount + 1);
            return manifest;
        } else {
            questionCount = questionCount + 1;
        }
    }
    return manifest;
}

const dataUseFunc = text => {
    let dataUse = text.match(/(###)\w+/g);
    if (dataUse && dataUse.length === 1) {
        // console.log(dataUse)
        // console.log(dataUse[0].split("###")[1])
        return dataUse[0].split("###")[1]
    }
    return null;
}

const generateSurveyFromCSVARRAY = (array, metaData, newIDbool) => {
    const generateAnswers = (textAnsArr, answerIds) => {
        let answers = [];
        if (!textAnsArr) {
            return [{
                "id": newIDbool ? idGenerator() : answerIds[0]
            }];
        } 
        textAnsArr.forEach((text, i) => {
            let answerObj = {};
            answerObj["number"] = i;
            answerObj["answer"] = text;
            answerObj["answerId"] = newIDbool ? idGenerator() : answerIds[i];
            if (text.toLowerCase().includes("other") && text.length < 8) {
                answerObj["other"] = { "msg": "please specify" }
            }
            if (text.toLowerCase().includes("none of the above")) {
                answerObj["noneOfTheAbove"] = true;
            }
            answers.push(answerObj);
        })
        return answers;
    }

    const convertStringToArray = (string, answerTextBool) => {
        if (!string) return [];
        let arr;
        if (answerTextBool) {
            arr = string.split("[")[1].split("]")[0].split(",")
            arr = arr.map(ans => ans[0] === " " ? ans.slice(1) : ans); //remove opening space
            arr = arr.map(ans => ans[0] === "'" ? ans.slice(1) : ans); //remove first single quotes
            arr = arr.map(ans => ans[ans.length - 1] === "'" ? ans.slice(0, ans.length - 1) : ans) //remove last single quote
            arr = arr.map(ans => ans[0] === " " ? ans.slice(1) : ans); //remove opening space once more
        } else {
            arr = string.split('"').filter(chars => chars.length > 11);
        }
        // let arr = string.match(/([0-Z])\w+/g)
        return arr;
    }

    let newSurvey = {};
    newSurvey["version"] = metaData.version;
    newSurvey["release"] = Date();
    newSurvey["name"] = metaData.name;
    let prompts = {
        "welcome": {
            "type": "staggered",
            "prompt": "Welcome to the Loxz Digital Survey!",
            "prompts": [
                {
                    "prompt": "This innovative machine learning diagnostic assessment is a premier application to prepare students at UC Irvine for a career in Machine Learning. The survey encapsulates six vital categories that are part of the machine learning lifecycle including ML Aptitude, Modeling, Data Prep and Career Trajectory.  Upon submission, you will receive in realtime, an overall MLR score and innovative sub-scores along with access to our dashboard.",
                    "delay": 100
                },
                {
                    "prompt": "Whether you are a seasoned leader showcasing your ML Data Preparation strengths, an innovator seeking a steep career trajectory or an ML enthusiast who wants to take their passion to the next level, this diagnostic assessment will help you focus. Thanks for being part of the UCI Data Science and ML Ecosystem! Let’s begin your journey.",
                    "delay": 3200
                }
            ],            
            "button": "I'm ready",
            "goesToPrompt": "moreInfo"
        },
        "moreInfo": {
            "type": "standard",
            "prompt": "To optimize your assessment, we need some information about you",
            "button": "Let's go",
            "goesTo": ""
        }, 
        "existingUser": {
            "type": "input",
            "prompt": "It looks like you have an account associated with: ###EMAIL/nPlease enter your password",
            "button": "login",
            "dataUse": "EMAIL",
            "goesTo": "LOGIN"
        },
        "newUser": {
            "type": "input",
            "prompt": "Lets take this opportunity to save your results!/nPlease enter a password to associate with ###EMAIL",
            "button": "create new user",
            "dataUse": "EMAIL",
            "goesTo": "SIGNUP"
        },
        "submit": {
            "type": "standard",
            "prompt": "Awesome, great job ###NAME! Let's get you your report!",
            "dataUse": "NAME",
            "button": "submit",
            "submit": true,
            "goesToPrompt": "existingUser###newUser"
        }
    };
    
    var ID = newIDbool ? idGenerator() : array[0].questionId
    var finalID = newIDbool ? idGenerator() : array[array.length-1].questionId //used later in manifest
    let questions = {};
    let sectionIds = [ID];
    let section = array[0].category;
    let sectionNames = [section];

    prompts.moreInfo.goesTo = ID;

    array.forEach((question, idx) => {
        let dataUse = dataUseFunc(question.questions)
        if (question.type === "prompt") {
            questions[array[idx-1].questionId].goesToPrompt = question.promptName; //add curent prompt's name as the "goesToPrompt" value of the previous question
            prompts[question.promptName] = {}; //add current prompt to prompts object
            prompts[question.promptName].type = "standard"; //define type
            prompts[question.promptName].prompt = question["questions"]; //define text to display
            prompts[question.promptName].dataUse = dataUse;
            prompts[question.promptName].button = question["buttonText"]; //define button text
            let nextId = array[idx+1].questionId;
            prompts[question.promptName].goesTo = nextId; //define goesTo value
            ID = nextId; //set next id
            return;
        }
        if (section !== question.category) {
            sectionIds.push(ID);
            section = question.category;
            sectionNames.push(section)
        }
        if (!question.questions) return;
        let answers = convertStringToArray(question.answers, true)
        let answerIds = convertStringToArray(question.answerId)
        questions[ID] = {};
        let questionText = question.questions.split("?") //split the question on a "?"
        if (questionText.length > 1 && questionText[1].length < 4) {
            questionText = questionText[0] + "?"//removes bad input, i.e. a couple spaces after the question mark
        } else {
            questionText = question.questions; //if the text after the question mark is longer than 3 chars it's likely intentional so we use original text
        }
        questions[ID].question = questionText; //see above ^
        questions[ID].id = ID;
        questions[ID].type = question.type;
        if (question.dataCapture) questions[ID].dataCapture = question.dataCapture;
        if (dataUse) questions[ID].dataUse = dataUse;
        if (question.type === "open") questions[ID].error = {"test": "string", "msg": "your input is not correct"}
        questions[ID].number = idx + 1;
        questions[ID].answers = generateAnswers(answers, answerIds);
        let nextId;
        if (newIDbool) {
            nextId = idGenerator();
        } else {
            if (idx < array.length -1) {
                try {
                    nextId = array[idx+1].questionId;
                    questions[ID].goesTo = nextId;
                } catch(e) {
                    console.log(array[idx])
                }
            } else {
                questions[ID].goesToPrompt = "submit"
            }
        }
        ID = nextId;
    });

    newSurvey["manifest"] = generateManifest(Object.values(questions), sectionIds, sectionNames, finalID);
    newSurvey["prompts"] = prompts;
    newSurvey["questions"] = questions;
    newSurvey["answers"] = {};
    return newSurvey;
}

const studentIds = [
    "sy9SkVGXW9f1",
    "ktGqfhk10tZQ",
    "3RkTh825aRsT",
    "U25qKAuGMkZm",
    "BNOQH2CfYkar",
    "Kb6TTYeDpTpH",
    "vQkpEkv9nvE1",
    "rduebL4mUuUL",
    "QrH3MPbcM4jJ",
    "39bwIB4SSouJ",
    "YVQI4xHytSjT",
    "vvL1R3G3rcP4",
    "sTfUTlgMxTUO",
    "vNylmAIrBZsX",
    "PdpM2Xe0JX6S",
    "KPs5Wh36sJtm",
    "WUbPK1cUV163",
    "BxOl8NHPgUiS",
    "YjHwt0UcsaLl",
    "GL9kmOkWeSlJ",
    "EYVV15tfxNyl",
    "U4dGGi0VypQ4",
    "oQfEQV1rp8ju",
    "UxgRaTwZxloO",
    "55DFJywhn65X",
    "lGP6FRea7AWZ",
    "uHGKjnUglGfO",
    "JD8S0C4FBbmx",
    "ZINnWmohLAWU",
    "PQ0KD0TObc6Q",
    "iofeAB4hyRhC",
    "XtEfERdmXBrA",
    "BxCnIp3SVvWq",
    "JFjYKyW80pal",
    "IIYw2nJ3HkXx",
    "mJ54c4BIljBI",
    "g0XPtsTXsGIC",
    "QE3vKB2absKV",
    "jfqxgwF2Figm",
    "6GxeMycoCHoG",
    "QxYMQmeNVCKh",
    "pZoxfwQcWFC9",
    "JaKyEiVBYNGF",
    "C7XucjtCtMEQ",
    "AnRWtI3LEqbF",
    "u5jviSDhQbBt"
]

// studentIds.forEach(id => console.log(id))

// console.log(JSON.stringify(Object.keys(studentSurvey.questions))) //print out all question ids

// Object.values(studentSurvey.questions).forEach(question => {
//     let idArr = [];
//     question.answers.forEach(answer => {
//         idArr.push(answer.answerId)
//     })
//     console.log(JSON.stringify(idArr))
// })

// newFrozen.forEach(question => {
//     question.answers
// })

// console.log(JSON.pruned(newSurvey, 100, 100))
// console.log(newSurvey["questions"][49])
// console.log(JSON.stringify(newSurvey))
// console.log(JSON.stringify(survey))
// console.log(generateManifest(Object.values(survey.questions)));
// console.log(survey);
// let survey = generateSurveyFromCSVARRAY(newSurveyCSVARRAY);
const surveyMeta = {
    name: "STUDENT_SURVEY",
    version: "1.0.5"
}
let survey = generateSurveyFromCSVARRAY(newFrozen, surveyMeta);
// fs.open(path.join(__dirname, '..'));
fs.writeFileSync("./survey_versions/" + surveyMeta.name + "_" + surveyMeta.version + ".json", JSON.stringify(survey))
// console.log(JSON.stringify(survey));

module.exports = { surveyFromJSON };