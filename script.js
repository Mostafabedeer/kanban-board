//Fetch Dom elements ..
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const todoLane = document.getElementById("not-started");
const todoLane2 = document.getElementById("in-progress");
const todoLane3 = document.getElementById("completed");
const droppables = document.querySelectorAll(".task-box");

/////////////////////////////////////////////////////////////////
let notStartedArr = [];
let inProgressArr = [];
let completedArr = [];

/////////////////////////////////////////////////////////////////

//--- Handle the drop zone with events !!

droppables.forEach((zone) => {
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("over");
    const bottomTask = insertAboveTask(zone, e.clientY);
    const curTask = document.querySelector(".is_dragging");

    if (!bottomTask) {
      zone.appendChild(curTask);
    } else {
      zone.insertBefore(curTask, bottomTask);
    }

    //////////////////////
  });

  zone.addEventListener("drop", () => {
    zone.classList.remove("over");
  });
  zone.addEventListener("dragleave", () => {
    zone.classList.remove("over");
  });
});

//Handle the position of the task
const insertAboveTask = (zone, mouseY) => {
  const els = zone.querySelectorAll(".task:not(.is_dragging)");

  let closestTask = null;
  let closestOffset = Number.NEGATIVE_INFINITY;

  els.forEach((task) => {
    const { top } = task.getBoundingClientRect();

    const offset = mouseY - top;

    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closestTask = task;
    }
  });

  return closestTask;
};

//////////////////////////////////////////////////////////

updateUI();
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = input.value;
  if (!value) return;
  createElement(value);
});

//////////////////////////////
//---Create element
//////////////////////////////

function createElement(value, id = "not-started") {
  const newTask = document.createElement("p");
  newTask.classList.add("task");
  newTask.setAttribute("draggable", "true");
  newTask.innerHTML = `
  ${value}
  <ion-icon
  name="create-outline"
  class="task-icon edit-icon"
  id="edit"
></ion-icon>
<ion-icon
  name="trash-outline"
  class="task-icon trash-icon"
  id="trash"
></ion-icon>
  `;

  const el = {
    id,
    value,
  };

  newTask.addEventListener("dragstart", () => {
    newTask.classList.add("is_dragging");
  });
  newTask.addEventListener("dragend", (e) => {
    newTask.classList.remove("is_dragging");
    if (el.id !== e.target.parentElement.id) {
      if (e.target.parentElement.id === "not-started") {
        // console.log("task moved to in not started");
        removeFromArr(el);
        el.id = e.target.parentElement.id;
        notStartedArr.push(el);
        setToLocal(notStartedArr, el.id);
      } else if (e.target.parentElement.id === "in-progress") {
        // console.log("task moved to in progress");
        removeFromArr(el);

        el.id = e.target.parentElement.id;
        inProgressArr.push(el);
        setToLocal(inProgressArr, el.id);
      } else {
        // console.log("task moved to completed");
        removeFromArr(el);

        el.id = e.target.parentElement.id;
        completedArr.push(el);
        setToLocal(completedArr, el.id);
      }
    }
  });

  ////////////////////
  //Handle the value after changed
  ////////////////////

  newTask.addEventListener("focusout", (e) => {
    el.value = newTask.innerText.trim();

    removeFromArr(el);
    if (el.id === "not-started") {
      notStartedArr.push(el);
      setToLocal(notStartedArr, el.id);
    } else if (el.id === "in-progress") {
      inProgressArr.push(el);
      setToLocal(inProgressArr, el.id);
    } else {
      completedArr.push(el);
      setToLocal(completedArr, el.id);
    }
  });

  if (id == "not-started") {
    todoLane.appendChild(newTask);
    notStartedArr.push(el);
    setToLocal(notStartedArr, el.id);
  } else if (id == "in-progress") {
    todoLane2.appendChild(newTask);
    inProgressArr.push(el);
    setToLocal(inProgressArr, el.id);
  } else {
    todoLane3.appendChild(newTask);
    completedArr.push(el);
    setToLocal(completedArr, el.id);
  }

  const edit = newTask.children[0];
  const trash = newTask.children[1];

  //edit the task
  edit.addEventListener("click", () => {
    edit.parentElement.setAttribute("contenteditable", "");
    edit.parentElement.focus();
  });

  //remove the task
  trash.addEventListener("click", () => {
    removeFromArr(el);
    trash.parentElement.remove();
  });

  input.value = "";
}

//////////////////////////////
//---Handle tasks between arrays
//////////////////////////////

function removeFromArr(el) {
  if (el.id === "not-started") {
    // console.log("element removed from not started arr", el);
    const indx = notStartedArr.indexOf(el);
    notStartedArr.splice(indx, 1);
    setToLocal(notStartedArr, "not-started");
  } else if (el.id === "in-progress") {
    // console.log("element removed from in progress arr", el);
    const indx = inProgressArr.indexOf(el);
    inProgressArr.splice(indx, 1);
    setToLocal(inProgressArr, "in-progress");
  } else {
    // console.log("element removed from completed arr", el);
    const indx = completedArr.indexOf(el);
    completedArr.splice(indx, 1);
    setToLocal(completedArr, "completed");
  }
}

//////////////////////////////
//---Handle local storage
//////////////////////////////

function updateUI() {
  const data = localStorage.getItem("notStartedArr");
  if (data) {
    const arr = JSON.parse(data);
    arr.forEach((task) => {
      createElement(task.value, task.id);
    });
  }
  const data2 = localStorage.getItem("inProgressArr");
  if (data2) {
    const arr = JSON.parse(data2);

    arr.forEach((task) => {
      createElement(task.value, task.id);
    });
  }
  const data3 = localStorage.getItem("completedArr");
  if (data3) {
    const arr = JSON.parse(data3);
    arr.forEach((task) => {
      createElement(task.value, task.id);
    });
  }
}

function setToLocal(tasks, zoneId) {
  if (zoneId == "not-started") {
    window.localStorage.setItem("notStartedArr", JSON.stringify(tasks));
  } else if (zoneId == "in-progress") {
    window.localStorage.setItem("inProgressArr", JSON.stringify(tasks));
  } else {
    window.localStorage.setItem("completedArr", JSON.stringify(tasks));
  }
}
