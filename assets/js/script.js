// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = localStorage.getItem("nextId");

// Todo: create a function to generate a unique task id
function generateTaskId() {
  if (!nextId) {
    nextId = 1;
  } else {
    nextId++;
  }
  localStorage.setItem("nextId", nextId);
  return nextId;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  const card = $("<div>").addClass("card task-card").attr("data-id", task.id);
  const header = $("<div>").addClass("card-header").text(task.title);
  const body = $("<div>").addClass("card-body");
  const description = $("<p>").addClass("card-text").text(task.description);
  const dueDate = $("<p>").addClass("card-text").text(task.dueDate);
  const deleteBtn = $("<button>")
    .addClass("btn btn-danger delete")
    .text("delete")
    .attr("data-id", task.id);
  deleteBtn.on("click", handleDeleteTask);
  if (task.status !== "done") {
    const today = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");
    if (today.isSame(taskDueDate, "day")) {
      card.addClass("bg-warning text-white");
    } else if (today.isAfter(taskDueDate)) {
      card.addClass("bg-danger text-white");
    }
  }
  card.append(header, body);
  body.append(description, dueDate, deleteBtn);
  return card;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();
  for (let i = 0; i < taskList.length; i++) {
    if (taskList[i].status === "to-do") {
      $("#todo-cards").append(createTaskCard(taskList[i]));
    } else if (taskList[i].status === "in-progress") {
      $("#in-progress-cards").append(createTaskCard(taskList[i]));
    } else {
      $("#done-cards").append(createTaskCard(taskList[i]));
    }
  }
  $(".task-card").draggable({
    opacity: 0.7,
    zIndex: 100,
    // function to clone the card being dragged so that the original card remains in place
    helper: function (e) {
      // check of the target of the drag event is the card itself or a child element if it is the card itself, clone it, otherwise find the parent card and clone that
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");
      return original.clone().css({
        maxWidth: original.outerWidth(),
      });
    },
  });
}

// Todo: create a function to handle adding a new task
function handleAddTask() {
  const task = {
    id: generateTaskId(),
    title: $("#title").val(),
    description: $("#taskDescription").val(),
    dueDate: $("#taskDueDate").val(),
    status: "to-do",
  };
  taskList.push(task);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
  $("#title").val("");
  $("#taskDescription").val("");
  $("#taskDueDate").val("");
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
  const id = $(this).attr("data-id");
  taskList = taskList.filter((task) => task.id !== Number(id));
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  console.log(ui);
  const id = ui.draggable[0].dataset.id;
  const status = event.target.id;
  for (let i = 0; i < taskList.length; i++) {
    if (taskList[i].id === Number(id)) {
      taskList[i].status = status;
    }
  }
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();
  $("#add-btn").on("click", handleAddTask);
  $("#taskDueDate").datepicker({ changeMonth: true, changeYear: true });
  $(".lane").droppable({ accept: ".task-card", drop: handleDrop });
});
