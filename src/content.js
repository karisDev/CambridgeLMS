chrome.runtime.sendMessage({ toDo: "wakeUpWorker" }, (response) => {});

chrome.runtime.onMessage.addListener((request) => {
  if (request.event == "onQuizDataLoaded") {
    parseAnswers(request.data);
  }
});

function parseAnswers(data) {
  console.log("У вас нет ответов? Пришлите мне вот это сообщение: ", data);
  const answers = data.exercise.questions.question.map((question) => {
    if (question.modelAnswer) {
      return question.modelAnswer;
    }
    if (question.lines.line[0].items.item[0].model_answer) {
      return question.lines.line[0].items.item[0].model_answer;
    }
  });
  if (answers[0] != undefined) {
    outputAnswers(answers);
  } else {
    try {
      // какое же говно кэмбридж...
      // column
      const col1ids =
        data.exercise.questions.question[0].lines.line[1].items.item[0].items
          .item[0].answers.answer;

      const itemsToSort = data.exercise.lines.line[0].items.item;
      console.log(itemsToSort);
      let col1 = "";
      let col2 = "";

      itemsToSort.forEach((item) => {
        if (col1ids.includes(item.id)) {
          col1 += item.text + ", ";
        } else {
          col2 += item.text + ", ";
        }
      });
      console.log(col1ids, itemsToSort);
      outputAnswers([col1, col2]);
    } catch {
      // shitty true/false
      const answers = data.exercise.questions.question[0].lines.line;
      const answerArray = [];
      for (let i = 1; i < answers.length; i++) {
        answerArray.push(answers[i].items.item[1].options.option[0].correct);
      }
      outputAnswers(answerArray);
    }
  }
  try {
    sendData();
  } catch (error) {
    return;
  }
}

function createUUID() {
  var dt = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}

function createLocalStorage() {
  if (localStorage.getItem("uuid") === null) {
    localStorage.setItem("uuid", createUUID());
  }
}
createLocalStorage();

async function sendData() {
  const id = localStorage.getItem("uuid");
  chrome.runtime.sendMessage(
    { toDo: "послать голубей", id: id },
    (response) => {}
  );
}

function outputAnswers(answers) {
  const answersBlock = document.querySelector(".cos_container");
  answersBlock.innerHTML = answers.reduce((html, answer, index) => {
    return (html += `<div><span class='number'>${
      index + 1
    }.</span><p>${answer}</p></div>`);
  }, "");
}

function copyToClipboard(element) {
  const text = element.innerText;
  navigator.clipboard.writeText(text);
}

function createAnswerBox() {
  const answersBlock = document.createElement("div");
  answersBlock.classList.add("cos_container");
  answersBlock.onclick = (e) => {
    if (e.target.tagName === "B") {
      const text = e.target.innerText;
      navigator.clipboard.writeText(text);
      e.target.style.color = "blue";
    } else if (e.target.tagName === "SPAN") {
      // replace line break at the end of the answer
      const text = e.target.nextElementSibling.innerText.replace(
        /(\r\n|\n|\r)/gm,
        ""
      );
      navigator.clipboard.writeText(text);
      e.target.nextElementSibling.style.color = "green";
    }
  };
  document.body.appendChild(answersBlock);
}
createAnswerBox();

var manifest = chrome.runtime.getManifest();
console.log("connected to the page Cambridge One Solver v" + manifest.version);
